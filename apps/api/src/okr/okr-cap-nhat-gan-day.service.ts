import type { Db, Prisma } from "@crm/db";
import { dieuKienXemMucTieu } from "@crm/db/okr-hien-thi";
import { readTenGoc, WORKSPACE_ID } from "@crm/db/workspace";
import { MUC_TU_TIN } from "@crm/validation/okr-cap-nhat";
import { kieuKr } from "@crm/validation/okr-kr";
import { PHAM_VI_BO } from "@crm/validation/okr-tham-so";
import { Inject, Injectable } from "@nestjs/common";
import { z } from "zod";
import { InjectDatabase } from "../database/database.constants";
import { dieuKienPhamVi, nguoiDuocNhac } from "./cap-nhat-gan-day";
import { khoaDonViDong, tenDonVi } from "./don-vi";
import { CAP_CONG_TY } from "./moi-kr";
import { OkrAccessService } from "./okr-access.service";
import { OkrCamXucService } from "./okr-cam-xuc.service";
import type {
	CapNhatGanDayInput,
	CapNhatGanDayOutput,
	DongCapNhat,
} from "./okr-cap-nhat-gan-day.contracts";
import { OKR_XEM } from "./okr-xem.config";

const mucTuTin = z.enum(MUC_TU_TIN);

const chonCapNhat = {
	id: true,
	keyResultId: true,
	value: true,
	confidence: true,
	note: true,
	authorUserId: true,
	ownerUserId: true,
	onBehalf: true,
	createdAt: true,
	session: { select: { submittedAt: true } },
	keyResult: {
		select: {
			id: true,
			title: true,
			kind: true,
			unit: true,
			targetValue: true,
			objective: {
				select: {
					id: true,
					title: true,
					level: true,
					divisionId: true,
					departmentId: true,
					personUserId: true,
					division: { select: { name: true } },
					department: { select: { name: true } },
					person: { select: { name: true } },
				},
			},
		},
	},
} as const satisfies Prisma.OkrCheckInSelect;

const XEP_MOI_TRUOC = [
	{ session: { submittedAt: "desc" } },
	{ createdAt: "desc" },
	{ id: "desc" },
] as const satisfies Prisma.OkrCheckInOrderByWithRelationInput[];

const lucCua = (c: {
	createdAt: Date;
	session: { submittedAt: Date | null };
}) => c.session.submittedAt ?? c.createdAt;

@Injectable()
export class OkrCapNhatGanDayService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(OkrAccessService) private readonly quyenOkr: OkrAccessService,
		@Inject(OkrCamXucService) private readonly camXuc: OkrCamXucService,
	) {}

	async capNhatGanDay(
		userId: string,
		input: CapNhatGanDayInput,
	): Promise<CapNhatGanDayOutput> {
		const coTrang = OKR_XEM.capNhatGanDay.coTrang;
		const q = await this.quyenOkr.quyen(userId);
		const nc = this.quyenOkr.nguCanhXem(q, userId);
		const goc: Prisma.OkrObjectiveWhereInput = {
			cycleId: input.cycleId,
			status: "cong-bo",
			level: { in: [...CAP_CONG_TY] },
		};
		const theoDoi = await this.db.okrFollow.findMany({
			where: {
				userId,
				objective: { AND: [goc, dieuKienXemMucTieu(nc)] },
			},
			select: {
				objective: {
					select: {
						level: true,
						divisionId: true,
						departmentId: true,
						personUserId: true,
					},
				},
			},
		});
		const dan = { boPhan: q.truongBoPhan, phongBan: q.truongPhongBan };
		const boTheoDoi = new Set(theoDoi.map((f) => khoaDonViDong(f.objective)));
		const phamViCua = (
			phamVi: CapNhatGanDayInput["phamVi"],
		): Prisma.OkrObjectiveWhereInput => ({
			AND: [goc, dieuKienPhamVi(phamVi, dan, boTheoDoi)],
		});
		const [dem, trang, tenGoc] = await Promise.all([
			Promise.all(
				PHAM_VI_BO.map(async (value) => ({
					value,
					count: await this.db.okrCheckIn.count({
						where: {
							keyResult: {
								objective: {
									AND: [phamViCua(value), dieuKienXemMucTieu(nc)],
								},
							},
						},
					}),
				})),
			),
			this.db.okrCheckIn.findMany({
				where: {
					keyResult: {
						objective: {
							AND: [phamViCua(input.phamVi), dieuKienXemMucTieu(nc)],
						},
					},
				},
				orderBy: [...XEP_MOI_TRUOC],
				skip: (input.trang - 1) * coTrang,
				take: coTrang,
				select: chonCapNhat,
			}),
			readTenGoc(this.db),
		]);
		const krIds = [...new Set(trang.map((c) => c.keyResultId))];
		const moiNhat = await this.db.okrCheckIn.findMany({
			where: {
				keyResultId: { in: krIds },
				keyResult: { objective: dieuKienXemMucTieu(nc) },
			},
			distinct: ["keyResultId"],
			orderBy: [...XEP_MOI_TRUOC],
			select: {
				id: true,
				keyResultId: true,
				createdAt: true,
				session: { select: { submittedAt: true } },
			},
		});
		const lanMoiNhat = new Map(moiNhat.map((c) => [c.keyResultId, c]));
		const lanIds = trang.map((c) => c.id);
		const [binhLuan, camXuc] = await Promise.all([
			lanIds.length === 0
				? []
				: this.db.okrComment.findMany({
						where: {
							checkInId: { in: lanIds },
							objective: dieuKienXemMucTieu(nc),
						},
						orderBy: [{ createdAt: "asc" }, { id: "asc" }],
						select: {
							id: true,
							checkInId: true,
							authorUserId: true,
							body: true,
							createdAt: true,
						},
					}),
			this.camXuc.tomTat(this.db, lanIds, userId, nc),
		]);
		const nguoiIds = [
			...new Set([
				...trang.flatMap((c) => [c.authorUserId, c.ownerUserId]),
				...binhLuan.map((b) => b.authorUserId),
			]),
		];
		const [nguoi, thanhVien] = await Promise.all([
			this.db.user.findMany({
				where: { id: { in: nguoiIds } },
				select: { id: true, name: true },
			}),
			this.db.member.findMany({
				where: {
					organizationId: WORKSPACE_ID,
					userId: { in: trang.map((c) => c.authorUserId) },
				},
				select: { userId: true },
			}),
		]);
		const ten = new Map(nguoi.map((n) => [n.id, n.name]));
		const ai = (id: string) => ({ id, name: ten.get(id) ?? "" });
		const conLaThanhVien = new Set(thanhVien.map((m) => m.userId));
		const rows = trang.map((c): DongCapNhat => {
			const mt = c.keyResult.objective;
			const moi = lanMoiNhat.get(c.keyResultId);
			const laMoiNhat = moi?.id === c.id;
			return {
				checkInId: c.id,
				luc: lucCua(c).toISOString(),
				nguoi: ai(c.authorUserId),
				thayCho: c.onBehalf ? ai(c.ownerUserId) : null,
				kr: {
					id: c.keyResult.id,
					tieuDe: c.keyResult.title,
					kieu: kieuKr.parse(c.keyResult.kind),
					donVi: c.keyResult.unit,
					dich: Number(c.keyResult.targetValue),
				},
				mucTieu: { id: mt.id, tieuDe: mt.title },
				bo: { khoa: khoaDonViDong(mt), ten: tenDonVi(mt, tenGoc) },
				giaTri: Number(c.value),
				tuTin: mucTuTin.parse(c.confidence),
				ghiChu: c.note,
				moiNhat: laMoiNhat,
				traLoi: binhLuan
					.filter((b) => b.checkInId === c.id)
					.map((b) => ({
						id: b.id,
						nguoi: ai(b.authorUserId),
						noiDung: b.body,
						luc: b.createdAt.toISOString(),
					})),
				camXuc: camXuc.get(c.id) ?? [],
				mentionNguoiCapNhat: nguoiDuocNhac(
					c.authorUserId,
					userId,
					conLaThanhVien,
				),
			};
		});
		return {
			rows,
			total: dem.find((d) => d.value === input.phamVi)?.count ?? 0,
			trang: input.trang,
			coTrang,
			facetCounts: { phamVi: dem },
		};
	}
}
