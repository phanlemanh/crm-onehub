import { type TinhTrang, tinhTrang } from "@crm/validation/okr-muc-tieu";
import type { CayDuLieu, MucTieu } from "../kieu";
import type { DonChonOkr } from "../okr-search-params";
import { nhipCua } from "../tien-do-kr";

export const LOC_NHANH = ["can-ban", "chua-gop"] as const;
export type LocNhanh = (typeof LOC_NHANH)[number];

export function soKrCham(mt: MucTieu): number {
	return mt.keyResults.filter((kr) => {
		const nhip = nhipCua(kr.progress, mt.expected, mt.kind, kr.kind === "moc");
		return nhip === "cham-nhip" || nhip === "truot";
	}).length;
}

export function canBan(mt: MucTieu): boolean {
	return soKrCham(mt) > 0;
}

export function chuaGop(mt: MucTieu): boolean {
	return mt.level !== "onehub" && mt.alignments.length === 0;
}

const KHOP_LOC = {
	"can-ban": canBan,
	"chua-gop": chuaGop,
} satisfies Record<LocNhanh, (mt: MucTieu) => boolean>;

export function locNhanh(ds: MucTieu[], loc: LocNhanh | null): MucTieu[] {
	return loc === null ? ds : ds.filter(KHOP_LOC[loc]);
}

export function demLocNhanh(ds: MucTieu[]) {
	return {
		"can-ban": ds.filter(canBan).length,
		"chua-gop": ds.filter(chuaGop).length,
	} satisfies Record<LocNhanh, number>;
}

export const COT_SAP = ["tien-do", "tinh-trang", "detail"] as const;
export type CotSap = (typeof COT_SAP)[number];
export const CHIEU_SAP = ["asc", "desc"] as const;
export type ChieuSap = (typeof CHIEU_SAP)[number];

const BAC_TINH_TRANG = {
	truot: 0,
	"cham-nhip": 1,
	"dung-nhip": 2,
	"chua-co-ky-vong": 3,
} satisfies Record<TinhTrang, number>;

export function tinhTrangMucTieu(mt: MucTieu): TinhTrang {
	if (mt.keyResults.length === 0) return "chua-co-ky-vong";
	return tinhTrang(mt.progress, mt.expected, mt.kind);
}

const KHOA_SAP = {
	"tien-do": (mt: MucTieu) => mt.progress,
	"tinh-trang": (mt: MucTieu) => BAC_TINH_TRANG[tinhTrangMucTieu(mt)],
	detail: (mt: MucTieu) => (mt.keyResults.length > 0 ? 0 : 1),
} satisfies Record<CotSap, (mt: MucTieu) => number>;

export function sapXep(
	ds: MucTieu[],
	cot: CotSap | null,
	chieu: ChieuSap,
): MucTieu[] {
	if (cot === null) return ds;
	const khoa = KHOA_SAP[cot];
	const dau = chieu === "asc" ? 1 : -1;
	return ds
		.map((mt, i) => ({ mt, i, k: khoa(mt) }))
		.sort((a, b) => (a.k - b.k) * dau || a.i - b.i)
		.map((x) => x.mt);
}

const NOI_DUONG = " › ";

export function duongCha(
	cay: CayDuLieu,
	don: DonChonOkr,
	tenGoc: string,
): string | null {
	if (don.loai === "goc" || don.loai === "nguoi") return null;
	if (don.loai === "bp") return tenGoc;
	const bp = cay.divisions.find((x) =>
		x.departments.some((pb) => pb.id === don.id),
	);
	return bp ? [tenGoc, bp.name].join(NOI_DUONG) : tenGoc;
}
