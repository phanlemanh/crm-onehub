import type { NghiaTrangThai } from "@crm/ui/lib/status-tone";
import { type DuongTinHieu, parseDuongTinHieu } from "@crm/validation/tin-hieu";
import { docDuLieu } from "@/lib/lo-trinh/doc-du-lieu";
import type { TinHieuMessages } from "@/lib/messages/tin-hieu";

export type BanVe = "co" | "khong-co-danh-sach" | "vang" | "hong";
export type TrangThaiTinHieu = {
	nhan: string;
	cau: string;
	nghia: NghiaTrangThai;
};
export type CuaToiTom = { ma: string; daKeoVe: boolean };

type HangThuong = { ma?: unknown; nhom_trang_thai?: unknown };

function nhomCuaHang(duLieu: Record<string, unknown>): Map<string, string> {
	const ra = new Map<string, string>();
	const ds = Array.isArray(duLieu.lo_trinh) ? duLieu.lo_trinh : [];
	for (const lo of ds as { hang?: HangThuong[] }[])
		for (const h of lo?.hang ?? [])
			if (typeof h.ma === "string" && typeof h.nhom_trang_thai === "string")
				ra.set(h.ma, h.nhom_trang_thai);
	return ra;
}

function theoKit(
	b: DuongTinHieu,
	nhom: Map<string, string>,
	m: TinHieuMessages,
): TrangThaiTinHieu {
	const nhan = m.nhan;
	switch (b.cho) {
		case "chua-gom":
			return { nhan: nhan.choGom, cau: b.cau, nghia: "nhap" };
		case "le":
			return { nhan: nhan.le, cau: b.cau, nghia: "nhap" };
		case "da-phu":
			return { nhan: nhan.daCoViec, cau: b.cau, nghia: "xong" };
		case "nhom-chua-cat":
			return { nhan: nhan.daVaoNhom, cau: b.cau, nghia: "nhap" };
		case "chan-troi":
			return { nhan: nhan.deSau, cau: b.cau, nghia: "nhap" };
		case "hang-chua-ho-so":
		case "hang-co-ho-so": {
			const n = b.hang ? nhom.get(b.hang) : undefined;
			if (n === "da-giao")
				return { nhan: nhan.daGiao, cau: b.cau, nghia: "xong" };
			if (n === "dang-lam")
				return { nhan: nhan.dangLam, cau: b.cau, nghia: "dangChay" };
			if (n === "chua-bat-dau")
				return { nhan: nhan.chuaBatDau, cau: b.cau, nghia: "nhap" };
			return { nhan: nhan.khac, cau: b.cau, nghia: "nhap" };
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
): { banVe: BanVe; trangThai: Record<string, TrangThaiTinHieu> } {
	const traCrm = (banVe: BanVe) => ({
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
	const nhom = nhomCuaHang(duLieu);
	return {
		banVe: "co",
		trangThai: Object.fromEntries(
			cuaToi.map((t) => {
				const b = theoMa.get(t.ma);
				return [t.ma, b ? theoKit(b, nhom, m) : theoCrm(t.daKeoVe, m)];
			}),
		),
	};
}
