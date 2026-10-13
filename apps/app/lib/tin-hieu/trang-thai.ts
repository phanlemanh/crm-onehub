import type { NghiaTrangThai } from "@crm/ui/lib/status-tone";
import {
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
export type CuaToiTom = { ma: string; daKeoVe: boolean };
export type KetQuaTrangThai = {
	banVe: BanVe;
	trangThai: Record<string, TrangThaiTinHieu>;
};

function theoKit(
	b: DuongTinHieu,
	nhom: Map<string, string>,
	m: TinHieuMessages,
): TrangThaiTinHieu {
	const nhan = m.nhan;
	const cau = b.cau_nguoi_gui ?? b.cau;
	switch (b.cho) {
		case "chua-gom":
			return { nhan: nhan.choGom, cau, nghia: "nhap" };
		case "le":
			return { nhan: nhan.le, cau, nghia: "nhap" };
		case "da-phu":
			return { nhan: nhan.daCoViec, cau, nghia: "xong" };
		case "nhom-chua-cat":
			return { nhan: nhan.daVaoNhom, cau, nghia: "nhap" };
		case "chan-troi":
			return { nhan: nhan.deSau, cau, nghia: "nhap" };
		case "hang-chua-ho-so":
		case "hang-co-ho-so": {
			const n = b.hang ? nhom.get(b.hang) : undefined;
			if (n === "da-giao")
				return { nhan: nhan.daGiao, cau, nghia: "xong" };
			if (n === "dang-lam")
				return { nhan: nhan.dangLam, cau, nghia: "dangChay" };
			if (n === "chua-bat-dau")
				return { nhan: nhan.chuaBatDau, cau, nghia: "nhap" };
			return { nhan: nhan.khac, cau, nghia: "nhap" };
		}
	}
}

function theoCrm(daKeoVe: boolean, m: TinHieuMessages): TrangThaiTinHieu {
	return daKeoVe
		? { nhan: m.nhan.choGom, cau: m.trangThai.choGom, nghia: "nhap" }
		: { nhan: m.nhan.choLayVe, cau: m.trangThai.choKeoVe, nghia: "nhap" };
}

export function docTrangThaiTinHieu(
	html: string | null,
	cuaToi: CuaToiTom[],
	m: TinHieuMessages,
): KetQuaTrangThai {
	const traCrm = (banVe: BanVe): KetQuaTrangThai => ({
		banVe,
		trangThai: Object.fromEntries(
			cuaToi.map((t) => [t.ma, theoCrm(t.daKeoVe, m)]),
		),
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
	const ra: KetQuaTrangThai = {
		banVe: "co",
		trangThai: Object.fromEntries(
			cuaToi.map((t) => {
				const b = theoMa.get(t.ma);
				return [t.ma, b ? theoKit(b, nhom, m) : theoCrm(t.daKeoVe, m)];
			}),
		),
	};
	return ra;
}
