import type { LoaiTrang } from "@crm/validation/tai-lieu";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import type { NhomDeXuat, TabTaiLieu } from "@/lib/tai-lieu-man";

export type Loc = {
	tab: TabTaiLieu;
	loai: LoaiTrang | null;
	donVi: string | null;
	chu: string | null;
	nhom: NhomDeXuat;
	page: number;
	archived?: boolean;
};

export type ToiLoc = (sua: Partial<Loc>) => string;

export function thamSo(loc: Loc): string {
	const q = new URLSearchParams();
	if (loc.tab !== "trang") q.set(SEARCH_PARAM.taiLieu.tab, loc.tab);
	if (loc.loai) q.set(SEARCH_PARAM.taiLieu.loai, loc.loai);
	if (loc.donVi) q.set(SEARCH_PARAM.taiLieu.donVi, loc.donVi);
	if (loc.chu) q.set(SEARCH_PARAM.taiLieu.chu, loc.chu);
	if (loc.nhom !== "cho") q.set(SEARCH_PARAM.taiLieu.nhom, loc.nhom);
	if (loc.page > 1) q.set(SEARCH_PARAM.list.page, String(loc.page));
	if (loc.archived) q.set(SEARCH_PARAM.list.archived, "true");
	const s = q.toString();
	return s ? `?${s}` : "";
}

export function moTimNhanh(duong: string): string {
	const [goc, q = ""] = duong.split("?");
	const thamSoMoi = new URLSearchParams(q);
	thamSoMoi.set(SEARCH_PARAM.dialog.switcher, "true");
	return `${goc}?${thamSoMoi.toString()}`;
}

export const BO_LOC_TRONG = {
	loai: null,
	donVi: null,
	chu: null,
	page: 1,
	archived: false,
} as const satisfies Partial<Loc>;
