import type { NghiaTrangThai } from "@crm/ui/lib/status-tone";
import { coChoSauGom, type DuongTinHieu } from "@crm/validation/tin-hieu";
import {
	type ChoNguoiGui,
	choTinHieu,
	type KhoaChoTinHieu,
} from "@crm/validation/tin-hieu-cho";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { docDuLieu } from "@/lib/lo-trinh/doc-du-lieu";
import type { TinHieuMessages } from "@/lib/messages/tin-hieu";

const NGHIA_CHO: Record<KhoaChoTinHieu, NghiaTrangThai> = {
	"cho-gom": "nhap",
	le: "nhap",
	"da-phu": "xong",
	"nhom-chua-cat": "nhap",
	"chan-troi": "nhap",
	"chua-bat-dau": "nhap",
	"dang-lam": "dangChay",
	"da-giao": "xong",
	"hang-khac": "nhap",
};

export function nhanCuaCho(khoa: KhoaChoTinHieu, m: TinHieuMessages): string {
	const n = m.nhan;
	switch (khoa) {
		case "cho-gom":
			return n.choGom;
		case "le":
			return n.le;
		case "da-phu":
			return n.daCoViec;
		case "nhom-chua-cat":
			return n.daVaoNhom;
		case "chan-troi":
			return n.deSau;
		case "chua-bat-dau":
			return n.chuaBatDau;
		case "dang-lam":
			return n.dangLam;
		case "da-giao":
			return n.daGiao;
		case "hang-khac":
			return n.khac;
	}
}

function cauSauGom(
	b: DuongTinHieu,
	c: ChoNguoiGui,
	m: TinHieuMessages,
): string {
	const cau = m.cauSauGom;
	const kit = b.cau_nguoi_gui ?? b.cau;
	switch (b.cho) {
		case "chua-gom":
			return cau.chuaGom;
		case "le":
			return b.ly_do ? dien(cau.le, { lyDo: b.ly_do }) : kit;
		case "da-phu":
			return cau.daPhu;
		case "nhom-chua-cat":
			return b.ten_nhom ? dien(cau.nhomChuaCat, { tenNhom: b.ten_nhom }) : kit;
		case "chan-troi":
			return b.ten_nhom && b.ly_do
				? dien(cau.chanTroi, { tenNhom: b.ten_nhom, lyDo: b.ly_do })
				: kit;
		case "hang-chua-ho-so":
		case "hang-co-ho-so":
			return c.tenViec
				? dien(cau.hang, {
						tenViec: c.tenViec,
						trangThai: nhanCuaCho(c.khoa, m),
					})
				: kit;
	}
}

export type BanVe = "co" | "khong-co-danh-sach" | "vang" | "hong";
export type TrangThaiTinHieu = {
	nhan: string;
	cau: string;
	nghia: NghiaTrangThai;
	khongDich?: boolean;
};
export type TrangThaiDu = TrangThaiTinHieu & { khoa: string };
export type CuaToiTom = { ma: string; daKeoVe: boolean; daLuuTru?: boolean };
export type KetQuaTrangThai = {
	banVe: BanVe;
	trangThai: Record<string, TrangThaiTinHieu>;
};
export type NguonTrangThai = string | null | { duLieu: unknown };

function theoKit(c: ChoNguoiGui, m: TinHieuMessages): TrangThaiDu {
	const b = c.banGhi;
	return {
		khoa: c.khoa,
		nhan: nhanCuaCho(c.khoa, m),
		cau: cauSauGom(b, c, m),
		khongDich: b.cho !== "chua-gom" && b.cho !== "da-phu" ? true : undefined,
		nghia: NGHIA_CHO[c.khoa],
	};
}

function theoTom(t: CuaToiTom, m: TinHieuMessages): TrangThaiDu {
	return t.daLuuTru
		? {
				khoa: "da-luu-tru",
				nhan: m.nhan.daLuuTru,
				cau: m.trangThai.daLuuTru,
				nghia: "ketThuc",
			}
		: theoCrm(t.daKeoVe, m);
}

export function theoCrm(daKeoVe: boolean, m: TinHieuMessages): TrangThaiDu {
	return daKeoVe
		? {
				khoa: "cho-gom",
				nhan: m.nhan.choGom,
				cau: m.trangThai.choGom,
				nghia: "nhap",
			}
		: {
				khoa: "cho-lay-ve",
				nhan: m.nhan.choLayVe,
				cau: m.trangThai.choKeoVe,
				nghia: "nhap",
			};
}

export type KetQuaTrangThaiDu = {
	banVe: BanVe;
	trangThai: Record<string, TrangThaiDu>;
	coCho: Set<string>;
};

function duLieuTuNguon(
	nguon: NguonTrangThai,
): { duLieu: unknown } | { banVe: BanVe } {
	if (nguon === null) return { banVe: "vang" };
	if (typeof nguon !== "string") return { duLieu: nguon.duLieu };
	const { duLieu, canhBao } = docDuLieu(nguon);
	if (duLieu) return { duLieu };
	return {
		banVe: canhBao.some((c: string) => c.includes("chưa mang dữ liệu"))
			? "khong-co-danh-sach"
			: "hong",
	};
}

export function docTrangThaiDu(
	nguon: NguonTrangThai,
	ds: CuaToiTom[],
	m: TinHieuMessages,
): KetQuaTrangThaiDu {
	const traCrm = (banVe: BanVe): KetQuaTrangThaiDu => ({
		banVe,
		trangThai: Object.fromEntries(ds.map((t) => [t.ma, theoTom(t, m)])),
		coCho: new Set(),
	});
	const vao = duLieuTuNguon(nguon);
	if ("banVe" in vao) return traCrm(vao.banVe);
	const kq = choTinHieu(vao.duLieu);
	if (kq.kieu === "khong-co") return traCrm("khong-co-danh-sach");
	if (kq.kieu === "hong") return traCrm("hong");
	return {
		banVe: "co",
		trangThai: Object.fromEntries(
			ds.map((t) => {
				const c = kq.theoMa.get(t.ma);
				return [t.ma, c && !t.daLuuTru ? theoKit(c, m) : theoTom(t, m)];
			}),
		),
		coCho: coChoSauGom(kq.duong),
	};
}

export function docTrangThaiTinHieu(
	nguon: NguonTrangThai,
	cuaToi: CuaToiTom[],
	m: TinHieuMessages,
): KetQuaTrangThai {
	const du = docTrangThaiDu(nguon, cuaToi, m);
	return {
		banVe: du.banVe,
		trangThai: Object.fromEntries(
			Object.entries(du.trangThai).map(([ma, { khoa: _k, ...tt }]) => [ma, tt]),
		),
	};
}
