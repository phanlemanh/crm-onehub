import { z } from "zod";
import type { Db } from "./client";
import type { Prisma } from "./generated/prisma/client";
import { demChiSo, khoangKy } from "./okr-chi-so";
import {
	type BacGhiDanh,
	type DinhNghiaDem,
	MA_CHI_SO,
	type MaChiSo,
	type PhamViDem,
} from "./okr-chi-so-danh-muc";
import { KY_CON_HIEN } from "./okr-chu-ky-hien";
import { CAP_CUOC, type CuocSoan } from "./okr-cuoc-soan";
import { boGioiHan } from "./okr-hien-thi";
import { TRANG_THAI_DA_BAC, TRO_LY_OKR_TRAN } from "./okr-tro-ly-danh-muc";
import { ngayVN } from "./onboarding-nhac";
import { WORKSPACE_ID } from "./workspace";

export {
	docTrangChienLuocDangDung,
	type TrangChienLuoc,
} from "./tai-lieu-chien-luoc";

type DbHoacTx = Db | Prisma.TransactionClient;

export const DANH_SACH_DOC_GOI = [
	"division",
	"department",
	"organization",
	"orgPlacement",
	"member",
	"okrCycle",
	"okrObjective",
	"okrKeyResult",
	"okrDiemKr",
	"okrCheckIn",
	"okrNhinLai",
	"okrMangSang",
	"okrProgramConfig",
	"okrDeXuat",
	"taiLieuTrang",
	"user",
] as const;

const TIEN_DO_CHUA_CO = null;

const GOI = TRO_LY_OKR_TRAN.goiSoan;

const TU_TIN = z.enum(["cao", "vua", "thap"]);

type DonViSoan =
	| { cap: "onehub" }
	| { cap: "bo-phan"; divisionId: string }
	| { cap: "phong-ban"; departmentId: string };

function donViCua(cuoc: CuocSoan): DonViSoan {
	if (cuoc.level === "phong-ban") {
		if (!cuoc.departmentId)
			throw new Error("cuộc phòng ban thiếu departmentId");
		return { cap: "phong-ban", departmentId: cuoc.departmentId };
	}
	if (cuoc.level === "bo-phan") {
		if (!cuoc.divisionId) throw new Error("cuộc bộ phận thiếu divisionId");
		return { cap: "bo-phan", divisionId: cuoc.divisionId };
	}
	return { cap: "onehub" };
}

function locMucTieuCuaDonVi(don: DonViSoan): Prisma.OkrObjectiveWhereInput {
	switch (don.cap) {
		case "phong-ban":
			return { level: "phong-ban", departmentId: don.departmentId };
		case "bo-phan":
			return { level: "bo-phan", divisionId: don.divisionId };
		case "onehub":
			return { level: "onehub" };
	}
}

export function vaiDocDuocSoDoiTac(role: string): boolean {
	return role !== GOI.vaiKhongDocSoDoiTac;
}

export function capDichCua(level: CuocSoan["level"]): CuocSoan["level"][] {
	return CAP_CUOC.slice(0, CAP_CUOC.indexOf(level));
}

export function chuKyDichCua(
	cycleId: string,
	cycleParentId: string | null,
): string[] {
	return [cycleId, ...(cycleParentId ? [cycleParentId] : [])];
}

export type DonViCuoc = {
	donVi: { ten: string; cap: CuocSoan["level"]; moTa: string };
	cha: { ten: string; moTa: string } | null;
	truong: { chucDanh: string } | null;
	nguoiHoi: { vai: string; chucDanh: string };
};

export async function docDonViCuoc(
	db: DbHoacTx,
	cuoc: CuocSoan,
): Promise<DonViCuoc> {
	const don = donViCua(cuoc);
	const nguoiHoi = await db.member.findUnique({
		where: {
			organizationId_userId: {
				organizationId: WORKSPACE_ID,
				userId: cuoc.nguoiMoUserId,
			},
		},
		select: {
			role: true,
			user: { select: { orgPlacement: { select: { chucDanh: true } } } },
		},
	});
	const hoi = {
		vai: nguoiHoi?.role ?? "member",
		chucDanh: nguoiHoi?.user.orgPlacement?.chucDanh ?? "",
	};
	const chucDanhCua = async (userId: string | null) =>
		userId
			? {
					chucDanh:
						(
							await db.orgPlacement.findUnique({
								where: { userId },
								select: { chucDanh: true },
							})
						)?.chucDanh ?? "",
				}
			: null;
	if (don.cap === "phong-ban") {
		const pb = await db.department.findUniqueOrThrow({
			where: { id: don.departmentId },
			select: {
				name: true,
				moTa: true,
				headUserId: true,
				division: { select: { name: true, moTa: true } },
			},
		});
		return {
			donVi: { ten: pb.name, cap: "phong-ban", moTa: pb.moTa },
			cha: pb.division
				? { ten: pb.division.name, moTa: pb.division.moTa }
				: null,
			truong: await chucDanhCua(pb.headUserId),
			nguoiHoi: hoi,
		};
	}
	if (don.cap === "bo-phan") {
		const bp = await db.division.findUniqueOrThrow({
			where: { id: don.divisionId },
			select: { name: true, moTa: true, headUserId: true },
		});
		return {
			donVi: { ten: bp.name, cap: "bo-phan", moTa: bp.moTa },
			cha: null,
			truong: await chucDanhCua(bp.headUserId),
			nguoiHoi: hoi,
		};
	}
	const cty = await db.organization.findUniqueOrThrow({
		where: { id: WORKSPACE_ID },
		select: { name: true },
	});
	return {
		donVi: { ten: cty.name, cap: "onehub", moTa: "" },
		cha: null,
		truong: null,
		nguoiHoi: hoi,
	};
}

export type KrTren = {
	id: string;
	ten: string;
	kieu: string;
	khoiDiem: number;
	dich: number;
	hienTai: number;
	donVi: string;
	tienDo: number | null;
};

export type MucTieuTren = {
	id: string;
	cap: string;
	ten: string;
	viSaoLucNay: string;
	kr: KrTren[];
};

export type UngVienCanChinh = {
	id: string;
	loai: "muc-tieu" | "kr";
	ten: string;
};

export type CapTrenVaNgangCap = {
	capTren: MucTieuTren[];
	ngangCap: string[];
	ungVienCanChinh: UngVienCanChinh[];
};

function tienDo(k: {
	startValue: Prisma.Decimal;
	targetValue: Prisma.Decimal;
	currentValue: Prisma.Decimal;
}): number | null {
	const [a, b, c] = [
		k.startValue.toNumber(),
		k.targetValue.toNumber(),
		k.currentValue.toNumber(),
	];
	return b === a
		? TIEN_DO_CHUA_CO
		: Math.round(((c - a) / (b - a)) * GOI.thangTienDo);
}

async function chuKyCuaCuoc(db: DbHoacTx, cuoc: CuocSoan) {
	return db.okrCycle.findUniqueOrThrow({
		where: { id: cuoc.cycleId },
		select: { parentId: true, kind: true, startsOn: true, endsOn: true },
	});
}

async function boPhanCuaPhong(
	db: DbHoacTx,
	cuoc: CuocSoan,
	don: DonViSoan,
): Promise<string | null> {
	if (don.cap !== "phong-ban") return cuoc.divisionId;
	if (cuoc.divisionId) return cuoc.divisionId;
	const pb = await db.department.findUnique({
		where: { id: don.departmentId },
		select: { divisionId: true },
	});
	return pb?.divisionId ?? null;
}

export async function docCapTrenVaNgangCap(
	db: DbHoacTx,
	cuoc: CuocSoan,
): Promise<CapTrenVaNgangCap> {
	const don = donViCua(cuoc);
	if (don.cap === "onehub")
		return { capTren: [], ngangCap: [], ungVienCanChinh: [] };
	const ky = await chuKyCuaCuoc(db, cuoc);
	const boPhanId = await boPhanCuaPhong(db, cuoc, don);
	const cungBoPhan: Prisma.OkrObjectiveWhereInput[] = [
		{ level: "onehub" },
		...(don.cap === "phong-ban" && boPhanId
			? [{ level: "bo-phan", divisionId: boPhanId }]
			: []),
	];
	const tren = await db.okrObjective.findMany({
		where: {
			AND: [
				{
					status: "cong-bo",
					level: { in: capDichCua(cuoc.level) },
					cycleId: { in: chuKyDichCua(cuoc.cycleId, ky.parentId) },
					OR: cungBoPhan,
				},
				boGioiHan,
			],
		},
		orderBy: [{ position: "asc" }, { createdAt: "asc" }, { id: "asc" }],
		select: {
			id: true,
			level: true,
			title: true,
			whyNow: true,
			keyResults: {
				orderBy: { position: "asc" },
				select: {
					id: true,
					title: true,
					kind: true,
					startValue: true,
					targetValue: true,
					currentValue: true,
					unit: true,
				},
			},
		},
	});
	const ngang = await db.okrObjective.findMany({
		where: {
			AND: [
				{
					status: "cong-bo",
					cycleId: cuoc.cycleId,
					level: cuoc.level,
					...(don.cap === "phong-ban"
						? { divisionId: boPhanId, departmentId: { not: don.departmentId } }
						: { divisionId: { not: don.divisionId } }),
				},
				boGioiHan,
			],
		},
		orderBy: [{ position: "asc" }, { createdAt: "asc" }, { id: "asc" }],
		select: { title: true },
	});
	const capTren: MucTieuTren[] = tren
		.map((m) => ({
			id: m.id,
			cap: m.level,
			ten: m.title,
			viSaoLucNay: m.whyNow,
			kr: m.keyResults.map((k) => ({
				id: k.id,
				ten: k.title,
				kieu: k.kind,
				khoiDiem: k.startValue.toNumber(),
				dich: k.targetValue.toNumber(),
				hienTai: k.currentValue.toNumber(),
				donVi: k.unit,
				tienDo: tienDo(k),
			})),
		}))
		.sort(
			(a, b) =>
				CAP_CUOC.indexOf(a.cap as CuocSoan["level"]) -
				CAP_CUOC.indexOf(b.cap as CuocSoan["level"]),
		);
	const ungVienCanChinh = capTren.flatMap((m) => [
		{ id: m.id, loai: "muc-tieu" as const, ten: m.ten },
		...m.kr.map((k) => ({ id: k.id, loai: "kr" as const, ten: k.ten })),
	]);
	return { capTren, ngangCap: ngang.map((n) => n.title), ungVienCanChinh };
}

export type CapNhatTuanKy = {
	tuan: string;
	giaTri: number;
	tuTin: z.infer<typeof TU_TIN>;
	ghiChu: string;
};

export type KrKyDoc = {
	ten: string;
	kieu: string;
	donVi: string;
	khoiDiem: number;
	dich: number;
	soChot: number;
	diem: number | null;
	lyDo: string;
	capNhat: CapNhatTuanKy[];
};

export type MucTieuKyDoc = {
	ten: string;
	diem: number | null;
	dieuHocDuoc: string;
	kr: KrKyDoc[];
};

export type KyTruoc = {
	chuKy: { ten: string } | null;
	mucTieu: MucTieuKyDoc[];
	mangSang: string[];
};

const KHONG_CO_KY_TRUOC: KyTruoc = { chuKy: null, mucTieu: [], mangSang: [] };

async function kyDaDongGanNhat(db: DbHoacTx, cuoc: CuocSoan) {
	const ky = await chuKyCuaCuoc(db, cuoc);
	return db.okrCycle.findFirst({
		where: {
			phase: "da-dong",
			...KY_CON_HIEN,
			kind: ky.kind,
			id: { not: cuoc.cycleId },
			endsOn: { lte: ky.startsOn },
			objectives: {
				some: {
					status: { not: "nhap" },
					...locMucTieuCuaDonVi(donViCua(cuoc)),
				},
			},
		},
		orderBy: [{ endsOn: "desc" }, { id: "desc" }],
		select: { id: true, name: true, startsOn: true, endsOn: true },
	});
}

function diemGop(diem: (number | null)[]): number | null {
	const cham = diem.filter((d): d is number => d !== null);
	if (cham.length === 0) return null;
	const tb = cham.reduce((a, b) => a + b, 0) / cham.length;
	return Math.round(tb * GOI.lamTronDiem) / GOI.lamTronDiem;
}

export async function docKyTruoc(
	db: DbHoacTx,
	cuoc: CuocSoan,
): Promise<KyTruoc> {
	const ky = await kyDaDongGanNhat(db, cuoc);
	if (!ky) return KHONG_CO_KY_TRUOC;
	const loc = locMucTieuCuaDonVi(donViCua(cuoc));
	const muc = await db.okrObjective.findMany({
		where: {
			AND: [{ cycleId: ky.id, status: { not: "nhap" }, ...loc }, boGioiHan],
		},
		orderBy: [{ position: "asc" }, { createdAt: "asc" }, { id: "asc" }],
		select: {
			title: true,
			nhinLai: { select: { dieuHocDuoc: true } },
			keyResults: {
				orderBy: { position: "asc" },
				select: {
					title: true,
					kind: true,
					unit: true,
					startValue: true,
					targetValue: true,
					currentValue: true,
					diemKr: { select: { soChot: true, diem: true, lyDo: true } },
					checkIns: {
						orderBy: [{ weekStart: "asc" }, { createdAt: "asc" }],
						select: {
							weekStart: true,
							value: true,
							confidence: true,
							note: true,
						},
					},
				},
			},
		},
	});
	const sang = await db.okrMangSang.findMany({
		where: {
			sangCycleId: cuoc.cycleId,
			tuObjective: {
				AND: [{ cycleId: ky.id, ...loc }, boGioiHan],
			},
		},
		orderBy: [{ luc: "asc" }, { id: "asc" }],
		select: { tuObjective: { select: { title: true } } },
	});
	const mucTieu: MucTieuKyDoc[] = muc.map((m) => {
		const kr: KrKyDoc[] = m.keyResults.map((k) => ({
			ten: k.title,
			kieu: k.kind,
			donVi: k.unit,
			khoiDiem: k.startValue.toNumber(),
			dich: k.targetValue.toNumber(),
			soChot: (k.diemKr?.soChot ?? k.currentValue).toNumber(),
			diem: k.diemKr?.diem?.toNumber() ?? null,
			lyDo: k.diemKr?.lyDo ?? "",
			capNhat: k.checkIns.map((c) => ({
				tuan: c.weekStart.toISOString().slice(0, 10),
				giaTri: c.value.toNumber(),
				tuTin: TU_TIN.parse(c.confidence),
				ghiChu: c.note,
			})),
		}));
		return {
			ten: m.title,
			diem: diemGop(kr.map((k) => k.diem)),
			dieuHocDuoc: m.nhinLai?.dieuHocDuoc ?? "",
			kr,
		};
	});
	return {
		chuKy: { ten: ky.name },
		mucTieu,
		mangSang: sang.map((s) => s.tuObjective.title),
	};
}

export type DongSoCrm = {
	ma: MaChiSo;
	bac: BacGhiDanh | null;
	quyTruoc: number | null;
	quyNay: number | null;
};

function phamViCua(don: DonViSoan): PhamViDem {
	switch (don.cap) {
		case "onehub":
			return { kieu: "toan-cong-ty" };
		case "bo-phan":
			return { kieu: "bo-phan", id: don.divisionId };
		case "phong-ban":
			return { kieu: "phong-ban", id: don.departmentId };
	}
}

const ngayCua = (d: Date) => d.toISOString().slice(0, 10);

export async function docSoCrmDonVi(
	db: DbHoacTx,
	cuoc: CuocSoan,
	role: string,
	hienTai: Date = new Date(),
): Promise<DongSoCrm[]> {
	if (!vaiDocDuocSoDoiTac(role)) return [];
	const phamVi = phamViCua(donViCua(cuoc));
	const [ky, truoc] = await Promise.all([
		chuKyCuaCuoc(db, cuoc),
		kyDaDongGanNhat(db, cuoc),
	]);
	const homNay = ngayVN(hienTai);
	const nayBatDau = homNay >= ngayCua(ky.startsOn);
	return Promise.all(
		MA_CHI_SO.map(async (ma) => {
			const bac = ma === "ghi-danh-dat-bac" ? GOI.bacGhiDanh : null;
			const dn: DinhNghiaDem = { chiSo: ma, phamVi, bac: bac ?? undefined };
			const quyTruoc = truoc
				? await demChiSo(
						db,
						dn,
						khoangKy(truoc.startsOn, truoc.endsOn, ngayCua(truoc.endsOn)),
					)
				: null;
			const quyNay = nayBatDau
				? await demChiSo(db, dn, khoangKy(ky.startsOn, ky.endsOn, homNay))
				: null;
			return { ma, bac, quyTruoc, quyNay };
		}),
	);
}

export async function docTenThanhVien(db: DbHoacTx): Promise<string[]> {
	const ds = await db.member.findMany({
		where: { organizationId: WORKSPACE_ID },
		select: { user: { select: { name: true } } },
	});
	return ds.map((d) => d.user.name).filter((ten) => ten.trim() !== "");
}

export type ChamVaTran = {
	thangCham: string;
	objectiveCap: number;
	krCap: number;
};

export async function docChamVaTran(db: DbHoacTx): Promise<ChamVaTran | null> {
	const row = await db.okrProgramConfig.findFirst({
		orderBy: { version: "desc" },
		select: { scoreScale: true, objectiveCap: true, krCap: true },
	});
	return row
		? {
				thangCham: row.scoreScale,
				objectiveCap: row.objectiveCap,
				krCap: row.krCap,
			}
		: null;
}

export type HangDaBac = {
	loai: string;
	cuocSoanId: string | null;
	sau: string | null;
	lyDo: string;
	noiDung: Prisma.JsonValue | null;
};

export async function docHangDaBac(
	db: DbHoacTx,
	cuocSoanId: string,
): Promise<HangDaBac[]> {
	return db.okrDeXuat.findMany({
		where: { cuocSoanId, trangThai: { in: [...TRANG_THAI_DA_BAC] } },
		orderBy: [{ createdAt: "asc" }, { id: "asc" }],
		select: {
			loai: true,
			cuocSoanId: true,
			sau: true,
			lyDo: true,
			noiDung: true,
		},
	});
}

export async function docKhoaDaBac(
	db: DbHoacTx,
	cuocSoanId: string,
	khoaCuaHang: (hang: HangDaBac) => string,
): Promise<Set<string>> {
	return new Set((await docHangDaBac(db, cuocSoanId)).map(khoaCuaHang));
}
