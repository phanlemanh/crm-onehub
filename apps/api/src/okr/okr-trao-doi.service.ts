import { canManageOnboarding, workspaceRoleOf } from "@crm/auth";
import type { Db, Prisma } from "@crm/db";
import { laViecOkr, lienQuanOkr } from "@crm/db/okr-nhac";
import { viecCanNhac } from "@crm/db/onboarding-nhac";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { PHA_GHI_DUOC } from "@crm/validation/okr-chu-ky";
import type {
	AddCommentInput,
	FollowInput,
	TransferOkrInput,
	TransferOkrPreviewInput,
} from "@crm/validation/okr-trao-doi";
import {
	BadRequestException,
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import type {
	CommentsOutput,
	FollowOutput,
	ThanhVienOutput,
	TransferOkrOutput,
	ViecCuaToiOutput,
} from "./okr.contracts";
import { OkrService } from "./okr.service";
import { OKR } from "./okr-config";

const T = OKR.thongDiep;
type Tx = Prisma.TransactionClient;
const chonNguoi = { id: true, name: true, email: true } as const;

function dieuKienChuyen(fromUserId: string) {
	const conGhi = {
		status: { not: "da-bo" },
		cycle: { phase: { in: [...PHA_GHI_DUOC] } },
	} satisfies Prisma.OkrObjectiveWhereInput;
	return {
		kr: {
			ownerUserId: fromUserId,
			objective: {
				...conGhi,
				NOT: { level: "ca-nhan", personUserId: fromUserId },
			},
		},
		mucTieu: {
			ownerUserId: fromUserId,
			level: { not: "ca-nhan" },
			...conGhi,
		},
		thamGia: { userId: fromUserId, objective: conGhi },
	} satisfies {
		kr: Prisma.OkrKeyResultWhereInput;
		mucTieu: Prisma.OkrObjectiveWhereInput;
		thamGia: Prisma.OkrParticipantWhereInput;
	};
}

@Injectable()
export class OkrTraoDoiService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(OkrService) private readonly okr: OkrService,
	) {}

	private async mucTieuCo(tx: Tx | Db, objectiveId: string) {
		const mt = await tx.okrObjective.findUnique({
			where: { id: objectiveId },
			select: { id: true },
		});
		if (!mt) throw new NotFoundException(T.khongCoMucTieu(objectiveId));
		return mt;
	}

	async thanhVien(): Promise<ThanhVienOutput> {
		const rows = await this.db.member.findMany({
			where: { organizationId: WORKSPACE_ID },
			select: { user: { select: chonNguoi } },
		});
		return rows
			.map((r) => r.user)
			.sort(
				(a, b) =>
					a.name.localeCompare(b.name, "vi") ||
					a.email.localeCompare(b.email, "vi"),
			);
	}

	async comments(objectiveId: string): Promise<CommentsOutput> {
		await this.mucTieuCo(this.db, objectiveId);
		const rows = await this.db.okrComment.findMany({
			where: { objectiveId },
			orderBy: [{ createdAt: "asc" }, { id: "asc" }],
			include: {
				keyResult: { select: { title: true } },
				mentions: { select: { userId: true } },
			},
		});
		const ids = [
			...new Set(
				rows.flatMap((r) => [
					r.authorUserId,
					...r.mentions.map((m) => m.userId),
				]),
			),
		];
		const nguoi = await this.db.user.findMany({
			where: { id: { in: ids } },
			select: chonNguoi,
		});
		const ai = (id: string) =>
			nguoi.find((n) => n.id === id) ?? {
				id,
				name: T.traoDoi.nguoiKhongCon,
				email: "",
			};
		return {
			comments: rows.map((r) => ({
				id: r.id,
				author: ai(r.authorUserId),
				keyResultId: r.keyResultId,
				keyResultTitle: r.keyResult?.title ?? null,
				body: r.body,
				createdAt: r.createdAt.toISOString(),
				mentions: r.mentions
					.map((m) => ai(m.userId))
					.sort((a, b) => a.name.localeCompare(b.name, "vi")),
			})),
		};
	}

	async addComment(userId: string, input: AddCommentInput, now = new Date()) {
		const nhac = [...new Set(input.mentionUserIds)];
		return this.db.$transaction(async (tx) => {
			await this.mucTieuCo(tx, input.objectiveId);
			if (input.keyResultId !== undefined) {
				const kr = await tx.okrKeyResult.findUnique({
					where: { id: input.keyResultId },
					select: { objectiveId: true },
				});
				if (!kr) throw new NotFoundException(T.khongCoKr(input.keyResultId));
				if (kr.objectiveId !== input.objectiveId)
					throw new BadRequestException(T.traoDoi.krKhacMucTieu);
			}
			await this.okr.assertThanhVien(
				tx,
				nhac,
				() => T.traoDoi.nhacKhongConThanhVien,
			);
			const c = await tx.okrComment.create({
				data: {
					objectiveId: input.objectiveId,
					keyResultId: input.keyResultId ?? null,
					body: input.body,
					authorUserId: userId,
					createdAt: now,
					mentions: { create: nhac.map((id) => ({ userId: id })) },
				},
			});
			await this.okr.vet(
				tx,
				userId,
				"binh-luan",
				{
					objectiveId: input.objectiveId,
					keyResultId: input.keyResultId,
				},
				null,
				{
					commentId: c.id,
					keyResultId: input.keyResultId ?? null,
					mentions: nhac,
				},
			);
			return { id: c.id };
		});
	}

	async follow(userId: string, input: FollowInput): Promise<FollowOutput> {
		return this.db.$transaction(async (tx) => {
			await this.mucTieuCo(tx, input.objectiveId);
			const doi = input.on
				? (
						await tx.okrFollow.createMany({
							data: [{ objectiveId: input.objectiveId, userId }],
							skipDuplicates: true,
						})
					).count
				: (
						await tx.okrFollow.deleteMany({
							where: { objectiveId: input.objectiveId, userId },
						})
					).count;
			if (doi > 0)
				await this.okr.vet(
					tx,
					userId,
					input.on ? "theo-doi" : "bo-theo-doi",
					{ objectiveId: input.objectiveId },
					null,
					null,
				);
			const followerCount = await tx.okrFollow.count({
				where: { objectiveId: input.objectiveId },
			});
			return { following: input.on, followerCount };
		});
	}

	async viecCuaToi(
		userId: string,
		now = new Date(),
	): Promise<ViecCuaToiOutput> {
		const [viec, lien] = await Promise.all([
			viecCanNhac(this.db, { now, userId, cuaSo: "truc-tiep" }),
			lienQuanOkr(this.db, userId),
		]);
		return {
			viec: (viec.get(userId) ?? []).filter(laViecOkr),
			lienQuanOkr: lien,
		};
	}

	private async yeuCauQuanTri(userId: string) {
		if (!canManageOnboarding(await workspaceRoleOf(userId)))
			throw new ForbiddenException(T.chuyen.canQuanTri);
	}

	async transferPreview(
		userId: string,
		input: TransferOkrPreviewInput,
	): Promise<TransferOkrOutput> {
		await this.yeuCauQuanTri(userId);
		const dk = dieuKienChuyen(input.fromUserId);
		const [kr, mucTieu] = await Promise.all([
			this.db.okrKeyResult.count({ where: dk.kr }),
			this.db.okrObjective.count({ where: dk.mucTieu }),
		]);
		return { kr, mucTieu };
	}

	async transferWork(
		userId: string,
		input: TransferOkrInput,
	): Promise<TransferOkrOutput> {
		await this.yeuCauQuanTri(userId);
		if (input.fromUserId === input.toUserId)
			throw new BadRequestException(T.chuyen.choChinhMinh);
		return this.db.$transaction(async (tx) => {
			await this.okr.assertThanhVien(tx, [input.toUserId]);
			const dk = dieuKienChuyen(input.fromUserId);
			const [krs, mucTieu] = await Promise.all([
				tx.okrKeyResult.findMany({
					where: dk.kr,
					select: { id: true, objectiveId: true },
					orderBy: { id: "asc" },
				}),
				tx.okrObjective.findMany({
					where: dk.mucTieu,
					select: { id: true },
					orderBy: { id: "asc" },
				}),
			]);
			const truoc = { ownerUserId: input.fromUserId };
			const sau = { ownerUserId: input.toUserId };
			for (const k of krs) {
				await tx.okrKeyResult.update({
					where: { id: k.id },
					data: sau,
				});
				await this.okr.vet(
					tx,
					userId,
					"chuyen-viec",
					{ objectiveId: k.objectiveId, keyResultId: k.id },
					truoc,
					sau,
				);
			}
			for (const m of mucTieu) {
				await tx.okrObjective.update({ where: { id: m.id }, data: sau });
				await this.okr.vet(
					tx,
					userId,
					"chuyen-viec",
					{ objectiveId: m.id },
					truoc,
					sau,
				);
			}
			await tx.okrParticipant.deleteMany({ where: dk.thamGia });
			return { kr: krs.length, mucTieu: mucTieu.length };
		});
	}
}
