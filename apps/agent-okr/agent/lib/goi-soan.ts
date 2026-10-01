import { db } from "@crm/db";
import {
	type CuocSoan,
	docCuoc,
	daCat as ghiDaCat,
} from "@crm/db/okr-cuoc-soan";
import {
	type CapTrenVaNgangCap,
	type DongSoCrm,
	type DonViCuoc,
	docCapTrenVaNgangCap,
	docChamVaTran,
	docDonViCuoc,
	docKhoaDaBac,
	docKyTruoc,
	docSoCrmDonVi,
	docTenThanhVien,
	docTrangChienLuocDangDung,
} from "@crm/db/okr-goi-soan";
import { TRO_LY_OKR_TRAN } from "@crm/db/okr-tro-ly-danh-muc";
import { OKR_PROGRAM_MAC_DINH } from "@crm/validation/okr-chuong-trinh";
import type { BuocCat, DaCat } from "@crm/validation/okr-cuoc-soan";
import type { GoiKiemSoan } from "@crm/validation/okr-kiem-ban-nhap";
import { khoaDong, trichSo } from "@crm/validation/okr-kiem-de-xuat";
import { type MucTieuKy, tomGonKr } from "@crm/validation/okr-tom-gon-ky";
import { dongSoanTuHang } from "@crm/validation/okr-tro-ly";
import { TRO_LY_OKR_SOAN } from "./config";

export const LOP = ["0-5", "1", "2a", "3", "4", "cham"] as const;
export type Lop = (typeof LOP)[number];
export type VaiNguoiHoi = (typeof TRO_LY_OKR_SOAN.vaiDuocVao)[number];

export type TrangTrongGoi = {
	ten: string;
	xacMinhDen: string | null;
	noiDung: string;
};

export type GoiSoan = {
	cuocSoanId: string;
	cuoc: CuocSoan;
	lop05: TrangTrongGoi[];
	lop1: DonViCuoc;
	lop2a: CapTrenVaNgangCap;
	lop3: {
		chuKy: { ten: string } | null;
		mucTieu: MucTieuKy[];
		mangSang: string[];
		tomGon: boolean;
	};
	lop4: { chiSo: DongSoCrm[] };
	cham: {
		thangCham: string;
		objectiveCap: number;
		krCap: number;
		tuCam: readonly string[];
	};
	daCat: DaCat;
};

const GOI = TRO_LY_OKR_SOAN.goi;

export function uocToken(chuoi: string): number {
	return Math.ceil(chuoi.length / GOI.heSoKyTu);
}

type ChienLuocDaCat = { trang: TrangTrongGoi[]; catKyTu: number };

function catChienLuoc(trang: TrangTrongGoi[]): ChienLuocDaCat {
	let con = Math.floor(GOI.tranLop.chienLuoc * GOI.heSoKyTu);
	let catKyTu = 0;
	const ra: TrangTrongGoi[] = [];
	for (const t of trang) {
		if (con <= 0) {
			catKyTu += t.noiDung.length;
			continue;
		}
		const giu = t.noiDung.slice(0, con);
		catKyTu += t.noiDung.length - giu.length;
		con -= giu.length;
		ra.push({ ...t, noiDung: giu });
	}
	return { trang: ra, catKyTu };
}

const THE_TRONG_THAN = new RegExp(GOI.the.split("-").join("\\s*-\\s*"), "giu");

function voHieuThe(than: string): string {
	return than.replace(THE_TRONG_THAN, GOI.theVoHieu);
}

function the(lop: Lop, than: string): string {
	return [
		`<${GOI.the} lop="${lop}">`,
		GOI.cauDanDuLieu,
		voHieuThe(than),
		`</${GOI.the}>`,
	].join("\n");
}

function chuLop05(trang: TrangTrongGoi[]): string {
	if (trang.length === 0) return "Chưa có trang chiến lược nào đang dùng.";
	return trang
		.map(
			(t) =>
				`## ${t.ten}${t.xacMinhDen ? ` (xác minh đến ${t.xacMinhDen})` : ""}\n${t.noiDung}`,
		)
		.join("\n\n");
}

function chuLop3(l: GoiSoan["lop3"]): string {
	if (!l.chuKy) return "Đơn vị chưa có chu kỳ đã đóng.";
	const mucTieu = l.mucTieu.map((mt) =>
		[
			`Mục tiêu «${mt.ten}»: ${mt.diem === null ? "chưa chấm" : `điểm ${mt.diem}`}${mt.dieuHocDuoc.trim() ? `; học được: ${mt.dieuHocDuoc.trim()}` : ""}`,
			...mt.kr.map(
				(k) =>
					`  - ${l.tomGon ? tomGonKr(k) : `${k.ten} (${k.kieu}, ${k.donVi}): ${k.khoiDiem} → ${k.soChot}/${k.dich}`}`,
			),
		].join("\n"),
	);
	return [
		`Chu kỳ ${l.chuKy.ten}`,
		...mucTieu,
		...(l.mangSang.length
			? [`Mang sang chu kỳ đang soạn: ${l.mangSang.join("; ")}`]
			: []),
	].join("\n");
}

function chuLop4(chiSo: DongSoCrm[]): string {
	if (chiSo.length === 0) return "Không có số CRM cho phiên này.";
	return [
		"quyTruoc null: đơn vị chưa có chu kỳ đã đóng. quyNay null: chu kỳ đang soạn chưa bắt đầu.",
		JSON.stringify(chiSo, null, 1),
	].join("\n");
}

function chuCacLop(goi: GoiSoan) {
	return {
		"0-5": chuLop05(goi.lop05),
		"1": JSON.stringify(goi.lop1, null, 1),
		"2a": JSON.stringify(goi.lop2a, null, 1),
		"3": chuLop3(goi.lop3),
		"4": chuLop4(goi.lop4.chiSo),
		cham: JSON.stringify(goi.cham, null, 1),
	} satisfies Record<Lop, string>;
}

export function goiThanhChiDan(goi: GoiSoan): string {
	const chu = chuCacLop(goi);
	return LOP.map((lop) => the(lop, chu[lop])).join("\n\n");
}

const BUOC = {
	"3-tom-gon": (g) =>
		g.lop3.tomGon ? { ...g, lop3: { ...g.lop3, tomGon: false } } : null,
	"3-kr": (g) =>
		g.lop3.mucTieu.some((m) => m.kr.length)
			? {
					...g,
					lop3: {
						...g.lop3,
						mucTieu: g.lop3.mucTieu.map((m) => ({ ...m, kr: [] })),
					},
				}
			: null,
	"ngang-cap": (g) =>
		g.lop2a.ngangCap.length
			? { ...g, lop2a: { ...g.lop2a, ngangCap: [] } }
			: null,
	"2a-kr": (g) =>
		g.lop2a.capTren.some((m) => m.kr.length)
			? {
					...g,
					lop2a: {
						...g.lop2a,
						capTren: g.lop2a.capTren.map((m) => ({ ...m, kr: [] })),
					},
				}
			: null,
} satisfies Record<BuocCat, (g: GoiSoan) => GoiSoan | null>;

export type KetQuaCat = { goi: GoiSoan; daCat: DaCat };

export function catTheoThuTu(goi: GoiSoan): KetQuaCat {
	const truocToken = uocToken(goiThanhChiDan(goi));
	let hienTai = goi;
	let token = truocToken;
	const buoc: BuocCat[] = [];
	for (const b of GOI.thuTuCat) {
		if (token <= GOI.tranTong) break;
		const sau = BUOC[b](hienTai);
		if (!sau) continue;
		hienTai = sau;
		token = uocToken(goiThanhChiDan(hienTai));
		buoc.push(b);
	}
	const daCat: DaCat = {
		buoc,
		truocToken,
		sauToken: token,
		chienLuocCatKyTu: goi.daCat.chienLuocCatKyTu,
	};
	return { goi: { ...hienTai, daCat }, daCat };
}

const ngay = (d: Date) => d.toISOString().slice(0, 10);

export async function goiSoan(
	cuocSoanId: string,
	v: { vai: VaiNguoiHoi; ghiDaCat?: boolean },
): Promise<GoiSoan | null> {
	const cuoc = await docCuoc(db, cuocSoanId);
	if (cuoc?.trangThai !== "dang") return null;
	const [donVi, trang, lop2a, kyTruoc, cham, chiSo] = await Promise.all([
		docDonViCuoc(db, cuoc),
		docTrangChienLuocDangDung(db),
		docCapTrenVaNgangCap(db, cuoc),
		docKyTruoc(db, cuoc),
		docChamVaTran(db),
		docSoCrmDonVi(db, cuoc, v.vai),
	]);
	const { trang: lop05, catKyTu } = catChienLuoc(
		trang.map((t) => ({
			ten: t.ten,
			xacMinhDen: t.xacMinhDen ? ngay(t.xacMinhDen) : null,
			noiDung: t.noiDung,
		})),
	);
	const tho: GoiSoan = {
		cuocSoanId,
		cuoc,
		lop05,
		lop1: { ...donVi, nguoiHoi: { ...donVi.nguoiHoi, vai: v.vai } },
		lop2a,
		lop3: { ...kyTruoc, tomGon: true },
		lop4: { chiSo },
		cham: {
			...(cham ?? {
				thangCham: OKR_PROGRAM_MAC_DINH.scoreScale,
				objectiveCap: OKR_PROGRAM_MAC_DINH.objectiveCap,
				krCap: OKR_PROGRAM_MAC_DINH.krCap,
			}),
			tuCam: TRO_LY_OKR_TRAN.tuCam,
		},
		daCat: { buoc: [], truocToken: 0, sauToken: 0, chienLuocCatKyTu: catKyTu },
	};
	const { goi, daCat } = catTheoThuTu(tho);
	if (v.ghiDaCat) await ghiDaCat(db, cuocSoanId, daCat);
	return goi;
}

type SoCuaGoi = {
	trongGoi: Set<string>;
	dich: Set<string>;
	khoiDiem: Set<string>;
};

const laSo = (n: number | null): n is number => n !== null;

const SO_IN_NGUYEN = /(?<![\d.])-?\d+(?:\.\d+)?/g;

function idCuaGoi(goi: GoiSoan): string[] {
	return [
		...goi.lop2a.capTren.flatMap((m) => [m.id, ...m.kr.map((k) => k.id)]),
		...goi.lop2a.ungVienCanChinh.map((u) => u.id),
	];
}

function chuCuaGoi(goi: GoiSoan): string[] {
	const id = idCuaGoi(goi);
	return Object.values(chuCacLop(goi)).map((chu) =>
		id.reduce((con, i) => con.replaceAll(i, ""), chu),
	);
}

function soCuaGoi(goi: GoiSoan): SoCuaGoi {
	const chu = chuCuaGoi(goi);
	const doc = chu.flatMap((c) => trichSo(c)).map(String);
	const nguyen = new Set(
		chu
			.flatMap((c) => c.match(SO_IN_NGUYEN) ?? [])
			.map((t) => String(Number(t))),
	);
	const daIn = new Set([...doc, ...nguyen]);
	const chiDaIn = (ds: (number | null)[]) =>
		ds
			.filter(laSo)
			.map(String)
			.filter((s) => daIn.has(s));
	const so: (number | null)[] = [goi.cham.objectiveCap, goi.cham.krCap];
	const dich: number[] = [];
	const khoiDiem: (number | null)[] = [];
	for (const m of goi.lop2a.capTren) {
		for (const k of m.kr) {
			so.push(k.khoiDiem, k.dich, k.hienTai, k.tienDo);
			dich.push(k.dich);
			khoiDiem.push(k.khoiDiem, k.hienTai);
		}
	}
	for (const m of goi.lop3.mucTieu) {
		so.push(m.diem);
		for (const k of m.kr) {
			so.push(k.khoiDiem, k.dich, k.soChot, k.diem);
			dich.push(k.dich);
			khoiDiem.push(k.khoiDiem, k.soChot);
		}
	}
	for (const c of goi.lop4.chiSo) {
		so.push(c.quyTruoc, c.quyNay);
		khoiDiem.push(c.quyTruoc, c.quyNay);
	}
	return {
		trongGoi: new Set([...doc, ...chiDaIn(so)]),
		dich: new Set(chiDaIn(dich)),
		khoiDiem: new Set(chiDaIn(khoiDiem)),
	};
}

export async function goiKiemTu(
	goi: GoiSoan,
	them: { soNguoiGo: Set<string> },
): Promise<GoiKiemSoan> {
	const so = soCuaGoi(goi);
	const [tenThanhVien, khoaDaBac] = await Promise.all([
		docTenThanhVien(db),
		docKhoaDaBac(db, goi.cuocSoanId, (hang) => khoaDong(dongSoanTuHang(hang))),
	]);
	return {
		soTrongGoi: so.trongGoi,
		soDich: so.dich,
		soKhoiDiem: so.khoiDiem,
		soNguoiGo: them.soNguoiGo,
		tenThanhVien,
		tuCam: goi.cham.tuCam,
		tenCapTren: goi.lop2a.capTren.flatMap((m) => [
			m.ten,
			...m.kr.map((k) => k.ten),
		]),
		idCanChinh: new Set(goi.lop2a.ungVienCanChinh.map((u) => u.id)),
		khoaDaBac,
	};
}
