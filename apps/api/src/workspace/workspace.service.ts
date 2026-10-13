import {
	ALLOWANCE_WITHOUT_EXPIRY,
	appUrl,
	canChangeRole,
	canIssuePasswordLink,
	canManageSettings,
	canRenameWorkspace,
	decideSignInFromDb,
	ducChia,
	ensureWorkspaceMembership,
	isWorkspaceAdmin,
	isWorkspaceRole,
	normalizeEmail,
	WORKSPACE_ID,
	type WorkspaceRole,
	workspaceRoleOf,
} from "@crm/auth";
import type { Db, Prisma } from "@crm/db";
import { isOnboarded, markOnboarded, workspaceSlug } from "@crm/db/workspace";
import {
	docTrangThai,
	TRANG_THAI_HUY,
} from "@crm/validation/invitation-status";
import { docDuocDoiTac } from "@crm/validation/vai-workspace";
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	Logger,
	NotFoundException,
	ServiceUnavailableException,
} from "@nestjs/common";
import { AgentTriggerService } from "../agent/agent-trigger.service";
import { normalizeDomain } from "../companies/domain";
import { InjectDatabase } from "../database/database.constants";
import { demViecDangGiu, xoaTheoDoiCua } from "../onboarding/onboarding-ghi";
import {
	countsByKey,
	type ListResult,
	type OrderByColumns,
	paginate,
	resolveOrderBy,
} from "../trpc/list-input";
import {
	cleanStaffDomains,
	staffEmailDomains,
	writeStaffDomains,
} from "./staff-domains";
import type {
	Allowance,
	AllowEmailInput,
	IssuePasswordLinkInput,
	MemberListInput,
	RemoveMemberInput,
	RevokeAllowanceInput,
	SetMemberRoleInput,
	SetStaffDomainsInput,
	StaffDomains,
	UpdateWorkspaceInput,
	Workspace,
	WorkspaceMember,
} from "./workspace.contracts";
import { WORKSPACE_CONFIG } from "./workspace-config";

const MEMBER_SELECT = {
	id: true,
	role: true,
	createdAt: true,
	userId: true,
	user: { select: { name: true, email: true, image: true } },
} as const;

export const ALREADY_A_MEMBER = WORKSPACE_CONFIG.messages.alreadyAMember;

type MemberRow = Prisma.MemberGetPayload<{ select: typeof MEMBER_SELECT }>;

const ALLOWANCE_SELECT = {
	id: true,
	email: true,
	role: true,
	status: true,
	createdAt: true,
	user: { select: { name: true } },
} as const;

type AllowanceRow = Prisma.InvitationGetPayload<{
	select: typeof ALLOWANCE_SELECT;
}>;

const SORTABLE: OrderByColumns<Prisma.MemberOrderByWithRelationInput> = {
	name: (dir) => ({ user: { name: dir } }),
	email: (dir) => ({ user: { email: dir } }),
	role: (dir) => ({ role: dir }),
	joinedAt: (dir) => ({ createdAt: dir }),
};

function toRole(value: string): WorkspaceRole {
	return isWorkspaceRole(value) ? value : "member";
}

@Injectable()
export class WorkspaceService {
	private readonly logger = new Logger(WorkspaceService.name);

	constructor(
		@InjectDatabase() private readonly db: Db,
		private readonly agent: AgentTriggerService,
	) {}

	async get(userId: string): Promise<Workspace> {
		let row = await this.readWorkspace();

		if (!row) {
			await ensureWorkspaceMembership(userId);
			row = await this.readWorkspace();
		}

		if (!row) {
			throw new ServiceUnavailableException(
				"The workspace could not be read. Sign in again in a moment.",
			);
		}

		const role = await workspaceRoleOf(userId);

		return {
			id: row.id,
			slug: row.slug,
			name: row.name,
			website: row.website,
			onboarded: isOnboarded(row.metadata),
			viewerRole: role,
			canRename: canRenameWorkspace(role),
			canChangeRoles: canChangeRole(role),
			canManageMembers: isWorkspaceAdmin(role),
			canIssuePasswordLink: canIssuePasswordLink(role),
			canManageSettings: canManageSettings(role),
		};
	}

	async update(
		userId: string,
		input: UpdateWorkspaceInput,
	): Promise<Workspace> {
		const role = await workspaceRoleOf(userId);

		if (!canRenameWorkspace(role)) {
			throw new ForbiddenException(
				"Only an owner or an admin can change the workspace.",
			);
		}

		const before = await this.db.organization.findUnique({
			where: { id: WORKSPACE_ID },
			select: { website: true, metadata: true },
		});

		const website = normalizeDomain(input.website);

		if (!website) {
			throw new BadRequestException(
				"That is not a website. Enter the domain, like acme.com.",
			);
		}

		await this.db.organization.update({
			where: { id: WORKSPACE_ID },
			data: {
				name: input.name,
				slug: workspaceSlug(input.slug ?? input.name),
				website,
				metadata: markOnboarded(before?.metadata ?? null, new Date()),
			},
		});

		this.logger.log({ message: "Workspace updated", userId });

		if (website !== before?.website) {
			await this.agent.workspaceChanged(
				website,
				before?.website
					? "The company using OneHub Center changed its website"
					: "The company using OneHub Center said what its website is",
			);
		}

		return this.get(userId);
	}

	async members(
		userId: string,
		input: MemberListInput,
	): Promise<ListResult<WorkspaceMember>> {
		const where = this.buildWhere(input);
		const { skip, take } = paginate(input);

		const [rows, total, roles] = await Promise.all([
			this.db.member.findMany({
				where,
				skip,
				take,
				select: MEMBER_SELECT,
				orderBy: resolveOrderBy(input, SORTABLE, { createdAt: "asc" }),
			}),
			this.db.member.count({ where }),
			this.db.member.groupBy({
				by: ["role"],
				where: this.searchWhere(input.q),
				_count: { _all: true },
			}),
		]);

		const xemDuocVet = isWorkspaceAdmin(await workspaceRoleOf(userId));
		const vet = xemDuocVet
			? await this.vetMoiNhat(rows.map((row) => row.user.email))
			: new Map<string, { issuedAt: Date; issuedByName: string }>();

		return {
			rows: rows.map((row) =>
				this.toMember(row, userId, vet.get(row.user.email)),
			),
			total,
			facetCounts: { role: countsByKey(roles, "role") },
		};
	}

	async setMemberRole(
		userId: string,
		input: SetMemberRoleInput,
	): Promise<WorkspaceMember> {
		const role = await workspaceRoleOf(userId);

		if (!canChangeRole(role)) {
			throw new ForbiddenException(
				"Only an owner or an admin can change a member's role.",
			);
		}

		const updated = await this.db.$transaction(async (tx) => {
			const target = await tx.member.findFirst({
				where: { id: input.memberId, organizationId: WORKSPACE_ID },
				select: { id: true, role: true, userId: true },
			});

			if (!target) {
				throw new NotFoundException("That person is not in this workspace.");
			}

			if (target.role === "owner" && input.role !== "owner") {
				const owners = await tx.$queryRaw<{ id: string }[]>`
					SELECT id FROM "member"
					WHERE "organizationId" = ${WORKSPACE_ID} AND role = 'owner'
					FOR UPDATE
				`;

				if (owners.length <= 1) {
					throw new ForbiddenException(
						"The workspace needs an owner. Make someone else an owner first.",
					);
				}
			}

			let theoDoiDaXoa = 0;
			if (!docDuocDoiTac(input.role)) {
				const viec = await demViecDangGiu(tx, target.userId);
				const conViec = new ConflictException(
					WORKSPACE_CONFIG.messages.conViec(viec.keHoach, viec.buoc, viec.viec),
				);
				if (viec.keHoach > 0 || viec.buoc > 0) {
					throw conViec;
				}
				if (viec.viec > 0) throw conViec;
				theoDoiDaXoa = await xoaTheoDoiCua(tx, target.userId);
			}

			const member = await tx.member.update({
				where: { id: target.id },
				data: { role: input.role },
				select: MEMBER_SELECT,
			});
			return { member, theoDoiDaXoa };
		});

		this.logger.log({
			message: "Workspace role changed",
			userId,
			memberId: updated.member.id,
			role: input.role,
			theoDoiDaXoa: updated.theoDoiDaXoa,
		});

		const vet = await this.vetMoiNhat([updated.member.user.email]);

		return this.toMember(
			updated.member,
			userId,
			vet.get(updated.member.user.email),
		);
	}

	async staffDomains(userId: string): Promise<StaffDomains> {
		const role = await workspaceRoleOf(userId);

		return {
			domains: [...(await staffEmailDomains(this.db))],
			canEdit: canManageSettings(role),
		};
	}

	async setStaffDomains(
		userId: string,
		input: SetStaffDomainsInput,
	): Promise<StaffDomains> {
		const role = await workspaceRoleOf(userId);

		if (!canManageSettings(role)) {
			throw new ForbiddenException(
				WORKSPACE_CONFIG.messages.staffDomainsForbidden,
			);
		}

		const cleaned = cleanStaffDomains(input.domains);

		if (!cleaned.ok) {
			throw new BadRequestException(cleaned.message);
		}

		const before = await staffEmailDomains(this.db);
		await writeStaffDomains(this.db, cleaned.domains);

		this.logger.log({
			message: "Staff domains changed",
			userId,
			from: before,
			to: cleaned.domains,
		});

		return { domains: cleaned.domains, canEdit: true };
	}

	async allowances(userId: string): Promise<{ rows: Allowance[] }> {
		const role = await workspaceRoleOf(userId);

		if (!isWorkspaceAdmin(role)) {
			throw new ForbiddenException(
				"Only an owner or an admin can see who is allowed in.",
			);
		}

		const rows = await this.db.invitation.findMany({
			where: { organizationId: WORKSPACE_ID },
			select: ALLOWANCE_SELECT,
			orderBy: [{ createdAt: "desc" }],
		});

		const [vet, daVao] = await Promise.all([
			this.vetMoiNhat(rows.map((row) => row.email)),
			this.diaChiThanhVien(),
		]);

		return {
			rows: rows.map((row) =>
				this.toAllowance(
					row,
					vet.get(row.email),
					daVao.has(normalizeEmail(row.email) ?? ""),
				),
			),
		};
	}

	async allowEmail(userId: string, input: AllowEmailInput): Promise<Allowance> {
		const role = await workspaceRoleOf(userId);

		if (!isWorkspaceAdmin(role)) {
			throw new ForbiddenException(
				"Only an owner or an admin can allow an address.",
			);
		}

		const email = normalizeEmail(input.email);

		if (!email) {
			throw new BadRequestException(
				"That is not an email address. Enter one like name@company.com.",
			);
		}

		const member = await this.db.$queryRaw<{ id: string }[]>`
			SELECT m.id FROM member m
			JOIN "user" u ON u.id = m."userId"
			WHERE m."organizationId" = ${WORKSPACE_ID} AND lower(u.email) = ${email}
			LIMIT 1`;

		if (member.length > 0) {
			throw new BadRequestException(ALREADY_A_MEMBER);
		}

		const live = await this.db.invitation.findFirst({
			where: {
				organizationId: WORKSPACE_ID,
				email,
				status: { in: ["pending", "accepted"] },
			},
			select: { id: true },
		});

		if (live) {
			throw new BadRequestException("That address is already on the list.");
		}

		const created = await this.db.invitation.create({
			data: {
				id: crypto.randomUUID(),
				organizationId: WORKSPACE_ID,
				email,
				role: input.role,
				status: "pending",
				expiresAt: ALLOWANCE_WITHOUT_EXPIRY,
				inviterId: userId,
			},
			select: ALLOWANCE_SELECT,
		});

		this.logger.log({ message: "Address allowed", userId, email });

		return this.toAllowance(created);
	}

	async issuePasswordLink(
		userId: string,
		input: IssuePasswordLinkInput,
		quyen: (role: WorkspaceRole | null) => boolean = canIssuePasswordLink,
	): Promise<{ url: string; expiresAt: string }> {
		const role = await workspaceRoleOf(userId);

		if (!quyen(role)) {
			throw new ForbiddenException(
				"Chỉ chủ và quản trị phát được liên kết đặt mật khẩu.",
			);
		}

		const email = normalizeEmail(input.email);

		if (!email) {
			throw new BadRequestException(
				"Đó không phải địa chỉ email. Nhập dạng ten@congty.com.",
			);
		}

		const nguoi = await this.db.user.findUnique({ where: { email } });

		const laThanhVien = nguoi
			? (await workspaceRoleOf(nguoi.id)) !== null
			: false;

		if (!laThanhVien) {
			const duocVao = await decideSignInFromDb(email);

			if (!duocVao.allowed) {
				throw new BadRequestException(
					"Địa chỉ này không nằm trong danh sách được vào.",
				);
			}
		}

		const nhan = nguoi ?? (await this.taoNguoiDaDuocVao(email));

		const nguoiPhat = await this.db.user.findUniqueOrThrow({
			where: { id: userId },
			select: { name: true },
		});

		const chia = await this.db.$transaction(async (tx) => {
			const duc = await ducChia({ userId: nhan.id, appUrl, kho: tx });

			await tx.passwordLinkIssue.create({
				data: {
					id: crypto.randomUUID(),
					email,
					issuedById: userId,
					issuedByName: nguoiPhat.name,
				},
			});

			return duc;
		});

		this.logger.log({ message: "Password link issued", userId, email });

		return { url: chia.url, expiresAt: chia.expiresAt.toISOString() };
	}

	private async taoNguoiDaDuocVao(email: string) {
		return this.db.user.create({
			data: {
				id: crypto.randomUUID(),
				email,
				name: email.split("@")[0] ?? email,
				emailVerified: true,
			},
		});
	}

	async revokeAllowance(
		userId: string,
		input: RevokeAllowanceInput,
	): Promise<Allowance> {
		const role = await workspaceRoleOf(userId);

		if (!isWorkspaceAdmin(role)) {
			throw new ForbiddenException(
				"Only an owner or an admin can withdraw an allowance.",
			);
		}

		const target = await this.db.invitation.findFirst({
			where: { id: input.allowanceId, organizationId: WORKSPACE_ID },
			select: { id: true },
		});

		if (!target) {
			throw new NotFoundException("That allowance is not on the list.");
		}

		const updated = await this.db.invitation.update({
			where: { id: target.id },
			data: { status: TRANG_THAI_HUY },
			select: ALLOWANCE_SELECT,
		});

		this.logger.log({
			message: "Allowance withdrawn",
			userId,
			allowanceId: target.id,
		});

		return this.toAllowance(updated);
	}

	async removeMember(
		userId: string,
		input: RemoveMemberInput,
	): Promise<{ memberId: string }> {
		const role = await workspaceRoleOf(userId);

		if (!isWorkspaceAdmin(role)) {
			throw new ForbiddenException(
				"Only an owner or an admin can remove a member.",
			);
		}

		const disabledKeys = await this.db.$transaction(async (tx) => {
			const target = await tx.member.findFirst({
				where: { id: input.memberId, organizationId: WORKSPACE_ID },
				select: {
					id: true,
					role: true,
					userId: true,
					user: { select: { email: true } },
				},
			});

			if (!target) {
				throw new NotFoundException("That person is not in this workspace.");
			}

			if (target.role === "owner") {
				const owners = await tx.$queryRaw<{ id: string }[]>`
					SELECT id FROM "member"
					WHERE "organizationId" = ${WORKSPACE_ID} AND role = 'owner'
					FOR UPDATE
				`;

				if (owners.length <= 1) {
					throw new ForbiddenException(
						"The workspace needs an owner. Make someone else an owner first.",
					);
				}
			}

			await tx.member.delete({ where: { id: target.id } });

			await tx.session.deleteMany({ where: { userId: target.userId } });

			await tx.zaloLink.deleteMany({ where: { crmUserId: target.userId } });

			await tx.zaloLinkCode.deleteMany({
				where: { crmUserId: target.userId },
			});

			await tx.notificationPreference.deleteMany({
				where: { userId: target.userId },
			});

			const keys = await tx.apikey.updateMany({
				where: { referenceId: target.userId },
				data: { enabled: false },
			});

			const email = normalizeEmail(target.user.email);

			if (email) {
				await tx.invitation.updateMany({
					where: {
						organizationId: WORKSPACE_ID,
						email,
						status: { in: ["pending", "accepted"] },
					},
					data: { status: TRANG_THAI_HUY },
				});
			}

			return keys.count;
		});

		this.logger.log({
			message: "Member removed",
			userId,
			memberId: input.memberId,
			disabledKeys,
		});

		return { memberId: input.memberId };
	}

	private async diaChiThanhVien(): Promise<Set<string>> {
		const members = await this.db.member.findMany({
			where: { organizationId: WORKSPACE_ID },
			select: { user: { select: { email: true } } },
		});

		return new Set(
			members
				.map((member) => normalizeEmail(member.user.email))
				.filter((email): email is string => email !== null),
		);
	}

	private toAllowance(
		row: AllowanceRow,
		vet?: { issuedAt: Date; issuedByName: string },
		daVao = false,
	): Allowance {
		const doc = docTrangThai(row.status);

		if (doc.loi) {
			this.logger.warn({
				message: "Invitation status unreadable",
				allowanceId: row.id,
				status: row.status,
			});
		}

		return {
			id: row.id,
			email: row.email,
			role: toRole(row.role ?? "member"),
			status: daVao && doc.trangThai === "pending" ? "accepted" : doc.trangThai,
			invitedByName: row.user?.name ?? null,
			createdAt: row.createdAt.toISOString(),
			passwordLinkIssuedAt: vet?.issuedAt.toISOString() ?? null,
			passwordLinkIssuedByName: vet?.issuedByName ?? null,
		};
	}

	private toMember(
		row: MemberRow,
		userId: string,
		vet?: { issuedAt: Date; issuedByName: string },
	): WorkspaceMember {
		return {
			id: row.id,
			userId: row.userId,
			name: row.user.name,
			email: row.user.email,
			image: row.user.image,
			role: toRole(row.role),
			joinedAt: row.createdAt.toISOString(),
			isViewer: row.userId === userId,
			passwordLinkIssuedAt: vet?.issuedAt.toISOString() ?? null,
			passwordLinkIssuedByName: vet?.issuedByName ?? null,
		};
	}

	private async vetMoiNhat(
		emails: string[],
	): Promise<Map<string, { issuedAt: Date; issuedByName: string }>> {
		if (emails.length === 0) return new Map();

		const vet = await this.db.passwordLinkIssue.findMany({
			where: { email: { in: emails } },
			orderBy: { issuedAt: "desc" },
		});

		const moiNhat = new Map<string, (typeof vet)[number]>();
		for (const v of vet) if (!moiNhat.has(v.email)) moiNhat.set(v.email, v);
		return moiNhat;
	}

	private searchWhere(q: string): Prisma.MemberWhereInput {
		const term = q.trim();
		const where: Prisma.MemberWhereInput = { organizationId: WORKSPACE_ID };

		if (term) {
			where.user = {
				OR: [
					{ name: { contains: term, mode: "insensitive" } },
					{ email: { contains: term, mode: "insensitive" } },
				],
			};
		}

		return where;
	}

	private buildWhere(input: MemberListInput): Prisma.MemberWhereInput {
		const where = this.searchWhere(input.q);

		if (input.role.length > 0) {
			where.role = { in: input.role };
		}

		return where;
	}

	private async readWorkspace() {
		return this.db.organization.findUnique({
			where: { id: WORKSPACE_ID },
			select: {
				id: true,
				slug: true,
				name: true,
				website: true,
				metadata: true,
			},
		});
	}
}
