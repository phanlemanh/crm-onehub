import type { NghiaTrangThai } from "@crm/ui/lib/status-tone";
import {
	coChoSauGom,
	type DuongTinHieu,
	docNhomHang,
	parseDuongTinHieu,
} from "@crm/validation/tin-hieu";
import { docDuLieu } from "@/lib/lo-trinh/doc-du-lieu";
import type { TinHieuMessages } from "@/lib/messages/tin-hieu";

export type BanVe = "co" | "khong-co-danh-sach" | "vang" | "hong";
export type TrangThaiTinHieu = {
	nhan: string;
	cau: string;
	nghia: NghiaTrangThai;
};
export type TrangThaiDu = TrangThaiTinHieu & { khoa: string };
export type CuaToiTom = { ma: string; daKeoVe: boolean };
export type KetQuaTrangThai = {
	banVe: BanVe;
	trangThai: Record<string, TrangThaiTinHieu>;
};

function theoKit(
	b: DuongTinHieu,
	nhom: Map<string, string>,
	m: TinHieuMessages,
): TrangThaiDu {
	const nhan = m.nhan;
	const cau = b.cau_nguoi_gui ?? b.cau;
	switch (b.cho) {
		case "chua-gom":
			return { khoa: "cho-gom", nhan: nhan.choGom, cau, nghia: "nhap" };
		case "le":
			return { khoa: "le", nhan: nhan.le, cau, nghia: "nhap" };
		case "da-phu":
			return { khoa: "da-phu", nhan: nhan.daCoViec, cau, nghia: "xong" };
		case "nhom-chua-cat":
			return {
				khoa: "nhom-chua-cat",
				nhan: nhan.daVaoNhom,
				cau,
				nghia: "nhap",
			};
		case "chan-troi":
			return { khoa: "chan-troi", nhan: nhan.deSau, cau, nghia: "nhap" };
		case "hang-chua-ho-so":
		case "hang-co-ho-so": {
			const n = b.hang ? nhom.get(b.hang) : undefined;
			if (n === "da-giao")
				return { khoa: "da-giao", nhan: nhan.daGiao, cau, nghia: "xong" };
			if (n === "dang-lam")
				return {
					khoa: "dang-lam",
					nhan: nhan.dangLam,
					cau,
					nghia: "dangChay",
				};
			if (n === "chua-bat-dau")
				return {
					khoa: "chua-bat-dau",
					nhan: nhan.chuaBatDau,
					cau,
					nghia: "nhap",
				};
			return { khoa: "hang-khac", nhan: nhan.khac, cau, nghia: "nhap" };
		}
	}
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

export function docTrangThaiDu(
	html: string | null,
	ds: CuaToiTom[],
	m: TinHieuMessages,
): KetQuaTrangThaiDu {
	const traCrm = (banVe: BanVe): KetQuaTrangThaiDu => ({
		banVe,
		trangThai: Object.fromEntries(ds.map((t) => [t.ma, theoCrm(t.daKeoVe, m)])),
		coCho: new Set(),
	});
	if (html === null) return traCrm("vang");
	const { duLieu, canhBao } = docDuLieu(html);
	if (!duLieu)
		return traCrm(
			canhBao.some((c: string) => c.includes("chưa mang dữ liệu"))
				? "khong-co-danh-sach"
				: "hong",
		);
	const kq = parseDuongTinHieu(duLieu.tin_hieu);
	if (kq.kieu === "khong-co") return traCrm("khong-co-danh-sach");
	if (kq.kieu === "hong") return traCrm("hong");
	const theoMa = new Map(kq.banGhi.map((b) => [b.id, b]));
	const nhom = docNhomHang(duLieu);
	return {
		banVe: "co",
		trangThai: Object.fromEntries(
			ds.map((t) => {
				const b = theoMa.get(t.ma);
				return [t.ma, b ? theoKit(b, nhom, m) : theoCrm(t.daKeoVe, m)];
			}),
		),
		coCho: coChoSauGom(kq),
	};
}

export function docTrangThaiTinHieu(
	html: string | null,
	cuaToi: CuaToiTom[],
	m: TinHieuMessages,
): KetQuaTrangThai {
	const du = docTrangThaiDu(html, cuaToi, m);
	return {
		banVe: du.banVe,
		trangThai: Object.fromEntries(
			Object.entries(du.trangThai).map(([ma, { khoa: _k, ...tt }]) => [ma, tt]),
		),
	};
}
