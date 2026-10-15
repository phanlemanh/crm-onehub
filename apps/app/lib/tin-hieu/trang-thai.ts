import type { NghiaTrangThai } from "@crm/ui/lib/status-tone";
import {
	coChoSauGom,
	type DuongTinHieu,
	docNhomHang,
	parseDuongTinHieu,
} from "@crm/validation/tin-hieu";
import { z } from "zod";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { docDuLieu } from "@/lib/lo-trinh/doc-du-lieu";
import type { TinHieuMessages } from "@/lib/messages/tin-hieu";

const tenViecKhoi = z.object({
	lo_trinh: z.array(
		z.object({
			hang: z.array(z.object({ ma: z.string(), cau_giao: z.string() })),
		}),
	),
});

function docTenViec(
	kq: ReturnType<typeof tenViecKhoi.safeParse>,
): Map<string, string> {
	if (!kq.success) return new Map();
	return new Map(
		kq.data.lo_trinh.flatMap((lo) =>
			lo.hang
				.filter((h) => h.cau_giao.trim().length > 0)
				.map((h) => [h.ma, h.cau_giao] as const),
		),
	);
}

function cauSauGom(
	b: DuongTinHieu,
	nhanHang: string | null,
	tenViec: Map<string, string>,
	m: TinHieuMessages,
): string {
	const c = m.cauSauGom;
	const kit = b.cau_nguoi_gui ?? b.cau;
	switch (b.cho) {
		case "chua-gom":
			return c.chuaGom;
		case "le":
			return b.ly_do ? dien(c.le, { lyDo: b.ly_do }) : kit;
		case "da-phu":
			return c.daPhu;
		case "nhom-chua-cat":
			return b.ten_nhom ? dien(c.nhomChuaCat, { tenNhom: b.ten_nhom }) : kit;
		case "chan-troi":
			return b.ten_nhom && b.ly_do
				? dien(c.chanTroi, { tenNhom: b.ten_nhom, lyDo: b.ly_do })
				: kit;
		case "hang-chua-ho-so":
		case "hang-co-ho-so": {
			const ten = b.hang ? tenViec.get(b.hang) : undefined;
			return ten && nhanHang
				? dien(c.hang, { tenViec: ten, trangThai: nhanHang })
				: kit;
		}
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
export type CuaToiTom = { ma: string; daKeoVe: boolean };
export type KetQuaTrangThai = {
	banVe: BanVe;
	trangThai: Record<string, TrangThaiTinHieu>;
};

function nhanCuaHang(
	b: DuongTinHieu,
	nhom: Map<string, string>,
	m: TinHieuMessages,
): string | null {
	if (b.cho !== "hang-chua-ho-so" && b.cho !== "hang-co-ho-so") return null;
	const n = b.hang ? nhom.get(b.hang) : undefined;
	if (n === "da-giao") return m.nhan.daGiao;
	if (n === "dang-lam") return m.nhan.dangLam;
	if (n === "chua-bat-dau") return m.nhan.chuaBatDau;
	return m.nhan.khac;
}

function theoKit(
	b: DuongTinHieu,
	nhom: Map<string, string>,
	tenViec: Map<string, string>,
	m: TinHieuMessages,
): TrangThaiDu {
	const nhan = m.nhan;
	const cau = cauSauGom(b, nhanCuaHang(b, nhom, m), tenViec, m);
	const khongDich =
		b.cho !== "chua-gom" && b.cho !== "da-phu" ? true : undefined;
	switch (b.cho) {
		case "chua-gom":
			return {
				khoa: "cho-gom",
				nhan: nhan.choGom,
				cau,
				khongDich,
				nghia: "nhap",
			};
		case "le":
			return { khoa: "le", nhan: nhan.le, cau, khongDich, nghia: "nhap" };
		case "da-phu":
			return {
				khoa: "da-phu",
				nhan: nhan.daCoViec,
				cau,
				khongDich,
				nghia: "xong",
			};
		case "nhom-chua-cat":
			return {
				khoa: "nhom-chua-cat",
				nhan: nhan.daVaoNhom,
				cau,
				khongDich,
				nghia: "nhap",
			};
		case "chan-troi":
			return {
				khoa: "chan-troi",
				nhan: nhan.deSau,
				cau,
				khongDich,
				nghia: "nhap",
			};
		case "hang-chua-ho-so":
		case "hang-co-ho-so": {
			const n = b.hang ? nhom.get(b.hang) : undefined;
			if (n === "da-giao")
				return {
					khoa: "da-giao",
					nhan: nhan.daGiao,
					cau,
					khongDich,
					nghia: "xong",
				};
			if (n === "dang-lam")
				return {
					khoa: "dang-lam",
					nhan: nhan.dangLam,
					cau,
					khongDich,
					nghia: "dangChay",
				};
			if (n === "chua-bat-dau")
				return {
					khoa: "chua-bat-dau",
					nhan: nhan.chuaBatDau,
					cau,
					khongDich,
					nghia: "nhap",
				};
			return {
				khoa: "hang-khac",
				nhan: nhan.khac,
				cau,
				khongDich,
				nghia: "nhap",
			};
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
	const tenViec = docTenViec(tenViecKhoi.safeParse(duLieu));
	return {
		banVe: "co",
		trangThai: Object.fromEntries(
			ds.map((t) => {
				const b = theoMa.get(t.ma);
				return [t.ma, b ? theoKit(b, nhom, tenViec, m) : theoCrm(t.daKeoVe, m)];
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
