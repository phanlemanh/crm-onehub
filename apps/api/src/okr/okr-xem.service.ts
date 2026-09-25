import type { Db, Prisma } from "@crm/db";
import {
	HANG_CAP,
	LOAI_MUC_TIEU,
	TRANG_THAI_MUC_TIEU,
} from "@crm/validation/okr-muc-tieu";
import { Inject, Injectable } from "@nestjs/common";
import { z } from "zod";
import { InjectDatabase } from "../database/database.constants";
import { demMatLoc, type MucTieuGon } from "./danh-sach";
import type { DonViChon } from "./okr.contracts";
import { OkrService } from "./okr.service";
import { OkrAccessService, type Quyen } from "./okr-access.service";
import type {
	DanhSachInput,
	DanhSachOutput,
	LocDanhSach,
} from "./okr-xem.contracts";

const chonNguoiGon = { id: true, name: true } as const;
const loaiMucTieu = z.enum(LOAI_MUC_TIEU);
const trangThaiMucTieu = z.enum(TRANG_THAI_MUC_TIEU);

@Injectable()
export class OkrXemService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(OkrService) private readonly okr: OkrService,
		@Inject(OkrAccessService) private readonly quyenOkr: OkrAccessService,
	) {}

	dieuKienDonVi(unit: DonViChon, q: Quyen): Prisma.OkrObjectiveWhereInput {
		switch (unit.loai) {
			case "goc":
				return { level: "onehub" };
			case "bp": {
				const phongBan =
					q.cay.divisions
						.find((b) => b.id === unit.id)
						?.departments.map((p) => p.id) ?? [];
				return {
					OR: [
						{ level: "bo-phan", divisionId: unit.id },
						{ level: "phong-ban", departmentId: { in: phongBan } },
					],
				};
			}
			case "pb":
				return { level: "phong-ban", departmentId: unit.id };
			case "nguoi":
				return {
					OR: [
						{ ownerUserId: unit.id },
						{ personUserId: unit.id },
						{ participants: { some: { userId: unit.id } } },
						{ keyResults: { some: { ownerUserId: unit.id } } },
					],
				};
		}
	}

	private dieuKienLoc(loc: LocDanhSach): Prisma.OkrObjectiveWhereInput[] {
		const ra: Prisma.OkrObjectiveWhereInput[] = [];
		if (loc.phuTrach.length > 0)
			ra.push({
				OR: [
					{ ownerUserId: { in: loc.phuTrach } },
					{ keyResults: { some: { ownerUserId: { in: loc.phuTrach } } } },
				],
			});
		if (loc.loai.length > 0) ra.push({ kind: { in: loc.loai } });
		if (loc.trangThai.length > 0) ra.push({ status: { in: loc.trangThai } });
		return ra;
	}

	async danhSach(
		userId: string,
		input: DanhSachInput,
	): Promise<DanhSachOutput> {
		const q = await this.quyenOkr.quyen(userId);
		const donVi = this.dieuKienDonVi(input.unit, q);
		const goc = { AND: [{ cycleId: input.cycleId }, donVi] };
		const [mucTieu, gon] = await Promise.all([
			this.okr.docMucTieu(
				this.db,
				{ AND: [...goc.AND, ...this.dieuKienLoc(input.loc)] },
				userId,
				q,
			),
			this.db.okrObjective.findMany({
				where: goc,
				select: {
					id: true,
					kind: true,
					status: true,
					owner: { select: chonNguoiGon },
					keyResults: { select: { owner: { select: chonNguoiGon } } },
				},
			}),
		]);
		const ds: MucTieuGon[] = gon.map((m) => ({
			id: m.id,
			owner: m.owner,
			kind: loaiMucTieu.parse(m.kind),
			status: trangThaiMucTieu.parse(m.status),
			krOwners: m.keyResults.map((k) => k.owner),
		}));
		const rows = [...mucTieu]
			.sort((a, b) => HANG_CAP[a.level] - HANG_CAP[b.level])
			.map((m) => ({
				...m,
				krKhop:
					input.loc.phuTrach.length > 0
						? m.keyResults
								.filter((k) => input.loc.phuTrach.includes(k.owner.id))
								.map((k) => k.id)
						: [],
			}));
		return {
			rows,
			total: rows.length,
			facetCounts: demMatLoc(ds, input.loc),
		};
	}
}
