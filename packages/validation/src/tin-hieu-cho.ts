import { z } from "zod";
import {
	type DuongTinHieu,
	docNhomHang,
	type KetQuaDuong,
	parseDuongTinHieu,
} from "./tin-hieu";

export const KHOA_CHO_TIN_HIEU = [
	"cho-gom",
	"le",
	"da-phu",
	"nhom-chua-cat",
	"chan-troi",
	"chua-bat-dau",
	"dang-lam",
	"da-giao",
	"hang-khac",
] as const;
export type KhoaChoTinHieu = (typeof KHOA_CHO_TIN_HIEU)[number];

export type ChoNguoiGui = {
	khoa: KhoaChoTinHieu;
	hang: string | null;
	tenNhom: string | null;
	lyDo: string | null;
	tenViec: string | null;
	banGhi: DuongTinHieu;
};

export type KetQuaCho =
	| { kieu: "co"; theoMa: Map<string, ChoNguoiGui>; duong: KetQuaDuong }
	| { kieu: "khong-co" }
	| { kieu: "hong"; loi: string };

export type DoiCho = { ma: string; cho: ChoNguoiGui };

const tenViecKhoi = z.object({
	lo_trinh: z.array(
		z.object({
			hang: z.array(z.object({ ma: z.string(), cau_giao: z.string() })),
		}),
	),
});

function docTenViec(duLieu: unknown): Map<string, string> {
	const kq = tenViecKhoi.safeParse(duLieu);
	if (!kq.success) return new Map();
	return new Map(
		kq.data.lo_trinh.flatMap((lo) =>
			lo.hang
				.filter((h) => h.cau_giao.trim().length > 0)
				.map((h) => [h.ma, h.cau_giao] as const),
		),
	);
}

export function khoaTheoKit(
	b: DuongTinHieu,
	nhom: ReadonlyMap<string, string>,
): KhoaChoTinHieu {
	switch (b.cho) {
		case "chua-gom":
			return "cho-gom";
		case "le":
		case "da-phu":
		case "nhom-chua-cat":
		case "chan-troi":
			return b.cho;
		case "hang-chua-ho-so":
		case "hang-co-ho-so": {
			const n = b.hang ? nhom.get(b.hang) : undefined;
			if (n === "da-giao" || n === "dang-lam" || n === "chua-bat-dau") return n;
			return "hang-khac";
		}
	}
}

export function choTinHieu(duLieu: unknown): KetQuaCho {
	const tinHieu =
		duLieu !== null && typeof duLieu === "object" && "tin_hieu" in duLieu
			? duLieu.tin_hieu
			: undefined;
	const duong = parseDuongTinHieu(tinHieu);
	if (duong.kieu === "khong-co") return { kieu: "khong-co" };
	if (duong.kieu === "hong") return { kieu: "hong", loi: duong.loi };
	const nhom = docNhomHang(duLieu);
	const tenViec = docTenViec(duLieu);
	return {
		kieu: "co",
		duong,
		theoMa: new Map(
			duong.banGhi.map((b) => [
				b.id,
				{
					khoa: khoaTheoKit(b, nhom),
					hang: b.hang,
					tenNhom: b.ten_nhom,
					lyDo: b.ly_do,
					tenViec: b.hang ? (tenViec.get(b.hang) ?? null) : null,
					banGhi: b,
				},
			]),
		),
	};
}

const CHO_MAC_DINH = { khoa: "cho-gom", hang: null, tenNhom: null } as const;

export function dauCho(
	c: Pick<ChoNguoiGui, "khoa" | "hang" | "tenNhom">,
): string {
	return JSON.stringify([c.khoa, c.hang, c.tenNhom]);
}

export function doiCho(cu: KetQuaCho, moi: KetQuaCho): DoiCho[] {
	if (cu.kieu !== "co" || moi.kieu !== "co") return [];
	const ra: DoiCho[] = [];
	for (const [ma, cho] of moi.theoMa) {
		const truoc = cu.theoMa.get(ma) ?? CHO_MAC_DINH;
		if (dauCho(truoc) !== dauCho(cho)) ra.push({ ma, cho });
	}
	return ra;
}
