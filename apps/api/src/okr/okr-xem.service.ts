import type { Db, Prisma } from "@crm/db";
import {
	CAP_MUC_TIEU,
	HANG_CAP,
	LOAI_MUC_TIEU,
	TRANG_THAI_MUC_TIEU,
} from "@crm/validation/okr-muc-tieu";
import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { z } from "zod";
import { InjectDatabase } from "../database/database.constants";
import { dungCayCanChinh } from "./can-chinh";
import { demMatLoc, type MucTieuGon } from "./danh-sach";
import type { DonViChon, NutCanChinh } from "./okr.contracts";
import { OkrService } from "./okr.service";
import {
	type DonViCuaMucTieu,
	OkrAccessService,
	type Quyen,
} from "./okr-access.service";
import { OKR } from "./okr-config";
import { OKR_XEM } from "./okr-xem.config";
import type {
	CayCanChinhOutput,
	NutCayDayDu,
	DanhSachInput,
	DanhSachOutput,
	LocDanhSach,
	SucKhoeOutput,
	ToanCanhOutput,
} from "./okr-xem.contracts";
import {
	type CayGon,
	gopSucKhoe,
	gopToanCanh,
	khoaCuaMucTieu,
	type SoRieng,
} from "./toan-canh";

const chonNguoiGon = { id: true, name: true } as const;
const loaiMucTieu = z.enum(LOAI_MUC_TIEU);
const trangThaiMucTieu = z.enum(TRANG_THAI_MUC_TIEU);
const capMucTieu = z.enum(CAP_MUC_TIEU);

function cayGon(q: Quyen): CayGon {
	const nguoi = (h: { id: string; name: string } | null) =>
		h ? { id: h.id, name: h.name } : null;
	const pb = (p: {
		id: string;
		name: string;
		head: { id: string; name: string } | null;
	}) => ({ id: p.id, name: p.name, head: nguoi(p.head) });
	return {
		divisions: q.cay.divisions.map((b) => ({
			...pb(b),
			departments: b.departments.map(pb),
		})),
		chuaXep: q.cay.chuaXep.map(pb),
	};
}

function donViCuaChon(unit: DonViChon): DonViCuaMucTieu {
	const rong = { divisionId: null, departmentId: null, personUserId: null };
	switch (unit.loai) {
		case "goc":
			return { ...rong, level: "onehub" };
		case "bp":
			return { ...rong, level: "bo-phan", divisionId: unit.id };
		case "pb":
			return { ...rong, level: "phong-ban", departmentId: unit.id };
		case "nguoi":
			return { ...rong, level: "ca-nhan", personUserId: unit.id };
	}
}

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
			canEdit: this.quyenOkr.suaDuocDonVi(q, userId, donViCuaChon(input.unit)),
		};
	}

	async toanCanh(userId: string, cycleId: string): Promise<ToanCanhOutput> {
		const q = await this.quyenOkr.quyen(userId);
		const congBo = await this.okr.docMucTieu(
			this.db,
			{ cycleId, status: "cong-bo" },
			userId,
			q,
		);
		return gopToanCanh(
			cayGon(q),
			congBo.map((m) => ({
				level: m.level,
				unitId: m.unitId,
				progress: m.progress,
				expected: m.expected,
				soKr: m.keyResults.length,
			})),
			OKR.tenGoc,
		);
	}

	async sucKhoe(userId: string, cycleId: string): Promise<SucKhoeOutput> {
		const q = await this.quyenOkr.quyen(userId);
		if (!q.quanTriChuongTrinh)
			throw new ForbiddenException(OKR_XEM.thongDiep.chiQuanTri);
		const nguoi = q.cay.people.map((p) => p.id);
		const [kr, zalo, slack] = await Promise.all([
			this.db.okrKeyResult.findMany({
				where: { objective: { cycleId, status: { in: ["cong-bo", "nhap"] } } },
				select: {
					objective: {
						select: {
							level: true,
							divisionId: true,
							departmentId: true,
							status: true,
						},
					},
				},
			}),
			this.db.zaloLink.findMany({
				where: { crmUserId: { in: nguoi } },
				select: { crmUserId: true },
			}),
			this.db.slackMemberMatch.findMany({
				where: { crmUserId: { in: nguoi }, slackUserId: { not: null } },
				select: { crmUserId: true },
			}),
		]);
		const rieng = new Map<string, SoRieng>();
		const them = (k: string, s: Partial<SoRieng>) => {
			const cu = rieng.get(k) ?? { tongKr: 0, chuaKhoiDiem: 0, chuaNoiKenh: 0 };
			rieng.set(k, {
				tongKr: cu.tongKr + (s.tongKr ?? 0),
				chuaKhoiDiem: cu.chuaKhoiDiem + (s.chuaKhoiDiem ?? 0),
				chuaNoiKenh: cu.chuaNoiKenh + (s.chuaNoiKenh ?? 0),
			});
		};
		for (const k of kr) {
			const o = k.objective;
			const khoa = khoaCuaMucTieu({
				level: capMucTieu.parse(o.level),
				unitId: o.divisionId ?? o.departmentId,
			});
			if (khoa === null) continue;
			them(khoa, o.status === "cong-bo" ? { tongKr: 1 } : { chuaKhoiDiem: 1 });
		}
		const daNoi = new Set([...zalo, ...slack].map((x) => x.crmUserId));
		for (const p of q.cay.people) {
			if (daNoi.has(p.id)) continue;
			them(
				p.primaryDepartmentId === null ? "goc" : `pb:${p.primaryDepartmentId}`,
				{ chuaNoiKenh: 1 },
			);
		}
		return gopSucKhoe(cayGon(q), rieng, OKR.tenGoc);
	}

	async cayCanChinh(
		userId: string,
		cycleId: string,
	): Promise<CayCanChinhOutput> {
		const mts = await this.okr.mucTieuCuaCay(userId, cycleId);
		const kyVong = new Map(mts.map((m) => [m.id, m.expected]));
		const laMoc = new Set(
			mts.flatMap((m) =>
				m.keyResults.filter((k) => k.kind === "moc").map((k) => k.id),
			),
		);
		const gan = (n: NutCanChinh): NutCayDayDu => ({
			...n,
			expected:
				n.loai === "kr" && laMoc.has(n.id)
					? null
					: (kyVong.get(n.objectiveId) ?? null),
			children: n.children.map(gan),
		});
		const cay = dungCayCanChinh(mts);
		return {
			roots: cay.roots.map(gan),
			chuaCanChinh: cay.chuaCanChinh.map(gan),
		};
	}
}
