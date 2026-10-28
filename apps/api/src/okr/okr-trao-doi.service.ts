import { canManageOnboarding, workspaceRoleOf } from "@crm/auth";
import type { Db, Prisma } from "@crm/db";
import { KY_CON_HIEN } from "@crm/db/okr-chu-ky-hien";
import { dieuKienXemMucTieu } from "@crm/db/okr-hien-thi";
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
	DongTraoDoi,
	FollowOutput,
	ThanhVienOutput,
	TransferOkrOutput,
	ViecCuaToiOutput,
} from "./okr.contracts";
import { OkrService } from "./okr.service";
import { OkrAccessService } from "./okr-access.service";
import { OKR } from "./okr-config";

const T = OKR.thongDiep;
const chonNguoi = { id: true, name: true, email: true } as const;

function dieuKienChuyen(fromUserId: string) {
	const conGhi = {
		status: { not: "da-bo" },
		cycle: { phase: { in: [...PHA_GHI_DUOC] }, ...KY_CON_HIEN },
	} satisfies Prisma.OkrObjectiveWhereInput;
	const krConGhi = {
		objective: {
			...conGhi,
			NOT: { level: "ca-nhan", personUserId: fromUserId },
		},
	} satisfies Prisma.OkrKeyResultWhereInput;
	return {
		kr: { ownerUserId: fromUserId, ...krConGhi },
		mucTieu: {
			ownerUserId: fromUserId,
			level: { not: "ca-nhan" },
			...conGhi,
		},
		thamGia: { userId: fromUserId, objective: conGhi },
		viec: { nguoiLamUserId: fromUserId, xongLuc: null, keyResult: krConGhi },
	} satisfies {
		kr: Prisma.OkrKeyResultWhereInput;
		mucTieu: Prisma.OkrObjectiveWhereInput;
		thamGia: Prisma.OkrParticipantWhereInput;
		viec: Prisma.OkrViecKrWhereInput;
	};
}

@Injectable()
export class OkrTraoDoiService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(OkrService) private readonly okr: OkrService,
		@Inject(OkrAccessService) private readonly quyenOkr: OkrAccessService,
	) {}

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

	async comments(userId: string, objectiveId: string): Promise<CommentsOutput> {
		const { q, nc } = await this.quyenOkr.assertXemMucTieu(userId, objectiveId);
		const [rows, ghiNhan] = await Promise.all([
			this.db.okrComment.findMany({
				where: { objectiveId, objective: dieuKienXemMucTieu(nc) },
				orderBy: [{ createdAt: "asc" }, { id: "asc" }],
				include: {
					keyResult: { select: { title: true } },
					mentions: { select: { userId: true } },
				},
			}),
			this.db.okrGhiNhan.findMany({
				where: { objectiveId, objective: dieuKienXemMucTieu(nc) },
				orderBy: [{ createdAt: "asc" }, { id: "asc" }],
				select: {
					id: true,
					createdAt: true,
					keyResultId: true,
					loiNhan: true,
					tacGiaUserId: true,
					keyResult: { select: { title: true } },
					nhan: { select: { userId: true } },
				},
			}),
		]);
		const ids = [
			...new Set([
				...rows.flatMap((r) => [
					r.authorUserId,
					...r.mentions.map((m) => m.userId),
				]),
				...ghiNhan.flatMap((g) => [
					g.tacGiaUserId,
					...g.nhan.map((n) => n.userId),
				]),
			]),
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
		const theoTen = (a: { name: string }, b: { name: string }) =>
			a.name.localeCompare(b.name, "vi");
		const quanTri = q.quanTri;
		const dong: DongTraoDoi[] = [
			...rows.map(
				(r): DongTraoDoi => ({
					loai: "binh-luan",
					id: r.id,
					createdAt: r.createdAt.toISOString(),
				}),
			),
			...ghiNhan.map(
				(g): DongTraoDoi => ({
					loai: "ghi-nhan",
					id: g.id,
					createdAt: g.createdAt.toISOString(),
					nguoiGui: ai(g.tacGiaUserId),
					nguoiNhan: g.nhan.map((n) => ai(n.userId)).sort(theoTen),
					keyResultId: g.keyResultId,
					keyResultTitle: g.keyResult?.title ?? null,
					loiNhan: g.loiNhan,
					goDuoc: g.tacGiaUserId === userId || quanTri,
				}),
			),
		].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
		return {
			comments: rows.map((r) => ({
				id: r.id,
				author: ai(r.authorUserId),
				keyResultId: r.keyResultId,
				keyResultTitle: r.keyResult?.title ?? null,
				body: r.body,
				createdAt: r.createdAt.toISOString(),
				mentions: r.mentions.map((m) => ai(m.userId)).sort(theoTen),
			})),
			dong,
		};
	}

	async addComment(userId: string, input: AddCommentInput, now = new Date()) {
		const nhac = [...new Set(input.mentionUserIds)];
		const { q, nc, mt } = await this.quyenOkr.assertXemMucTieu(
			userId,
			input.objectiveId,
		);
		return this.db.$transaction(async (tx) => {
			await this.okr.assertKyChuaAn(tx, mt.cycleId);
			const lan =
				input.checkInId === undefined
					? null
					: await tx.okrCheckIn.findFirst({
							where: {
								id: input.checkInId,
								keyResult: {
									objectiveId: input.objectiveId,
									objective: dieuKienXemMucTieu(nc),
								},
							},
							select: { keyResultId: true },
						});
			if (input.checkInId !== undefined && !lan)
				throw new NotFoundException(T.khongThayMucTieu);
			if (
				lan &&
				input.keyResultId !== undefined &&
				input.keyResultId !== lan.keyResultId
			)
				throw new BadRequestException(T.traoDoi.capNhatKhacKr);
			const keyResultId = input.keyResultId ?? lan?.keyResultId;
			if (keyResultId !== undefined) {
				const kr = await tx.okrKeyResult.findFirst({
					where: {
						id: keyResultId,
						objective: dieuKienXemMucTieu(nc),
					},
					select: { objectiveId: true },
				});
				if (!kr) throw new NotFoundException(T.khongCoKr(keyResultId));
				if (kr.objectiveId !== input.objectiveId)
					throw new BadRequestException(T.traoDoi.krKhacMucTieu);
			}
			await this.okr.assertThanhVien(
				tx,
				nhac,
				() => T.traoDoi.nhacKhongConThanhVien,
			);
			await this.quyenOkr.assertXemDuocHet(
				q,
				input.objectiveId,
				nhac,
				T.traoDoi.nhacKhongXemDuoc,
			);
			const c = await tx.okrComment.create({
				data: {
					objectiveId: input.objectiveId,
					keyResultId: keyResultId ?? null,
					checkInId: input.checkInId ?? null,
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
					keyResultId,
				},
				null,
				{
					commentId: c.id,
					keyResultId: keyResultId ?? null,
					mentions: nhac,
				},
			);
			return { id: c.id };
		});
	}

	async follow(
		userId: string,
		input: FollowInput,
		now = new Date(),
	): Promise<FollowOutput> {
		const { nc, mt } = await this.quyenOkr.assertXemMucTieu(
			userId,
			input.objectiveId,
		);
		return this.db.$transaction(async (tx) => {
			await this.okr.assertKyChuaAn(tx, mt.cycleId);
			const doi = input.on
				? (
						await tx.okrFollow.createMany({
							data: [
								{ objectiveId: input.objectiveId, userId, createdAt: now },
							],
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
				where: {
					objectiveId: input.objectiveId,
					objective: dieuKienXemMucTieu(nc),
				},
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
		const [kr, mucTieu, viec] = await Promise.all([
			this.db.okrKeyResult.count({ where: dk.kr }),
			this.db.okrObjective.count({ where: dk.mucTieu }),
			this.db.okrViecKr.count({ where: dk.viec }),
		]);
		return { kr, mucTieu, viec };
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
			const [krs, mucTieu, viec] = await Promise.all([
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
				tx.okrViecKr.findMany({
					where: dk.viec,
					select: {
						id: true,
						keyResultId: true,
						keyResult: { select: { objectiveId: true } },
					},
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
			for (const v of viec) {
				await tx.okrViecKr.update({
					where: { id: v.id },
					data: { nguoiLamUserId: input.toUserId },
				});
				await this.okr.vet(
					tx,
					userId,
					"chuyen-viec",
					{ objectiveId: v.keyResult.objectiveId, keyResultId: v.keyResultId },
					{ viecId: v.id, nguoiLamUserId: input.fromUserId },
					{ viecId: v.id, nguoiLamUserId: input.toUserId },
				);
			}
			await tx.okrParticipant.deleteMany({ where: dk.thamGia });
			return { kr: krs.length, mucTieu: mucTieu.length, viec: viec.length };
		});
	}
}
