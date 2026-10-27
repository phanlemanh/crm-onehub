import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { workspaceUrl } from "@/lib/workspace-url";
import { DUONG_SO_DO } from "../tab-okr";

type ThamSoTho = Record<string, string | string[] | undefined>;

const GIA_TRI_SO_DO_CU = "so-do";
const GIA_TRI_CAY_CU = "cay";
const DON_GOC = "goc";

function mot(thamSo: ThamSoTho, khoa: string): string | null {
	const v = thamSo[khoa];
	const dau = Array.isArray(v) ? v[0] : v;
	return dau === undefined || dau === "" ? null : dau;
}

function ghep(slug: string, cap: [string, string | null][]): string {
	const q = new URLSearchParams();
	for (const [k, v] of cap) if (v !== null) q.set(k, v);
	const s = q.toString();
	return `${workspaceUrl(slug, DUONG_SO_DO)}${s ? `?${s}` : ""}`;
}

export function duongSoDoTuSucKhoe(
	slug: string,
	thamSo: ThamSoTho,
): string | null {
	if (mot(thamSo, SEARCH_PARAM.okr.xemToanCanh) !== GIA_TRI_SO_DO_CU)
		return null;
	return ghep(slug, [
		[SEARCH_PARAM.okr.moDonVi, mot(thamSo, SEARCH_PARAM.okr.moDonVi)],
		[SEARCH_PARAM.okr.locSoDo, mot(thamSo, SEARCH_PARAM.okr.locSoDo)],
		[SEARCH_PARAM.okr.ky, mot(thamSo, SEARCH_PARAM.okr.ky)],
	]);
}

export function duongSoDoTuBoOkr(
	slug: string,
	thamSo: ThamSoTho,
): string | null {
	if (mot(thamSo, SEARCH_PARAM.okr.xem) !== GIA_TRI_CAY_CU) return null;
	const don = mot(thamSo, SEARCH_PARAM.okr.don);
	return ghep(slug, [
		[SEARCH_PARAM.okr.moDonVi, don === DON_GOC ? null : don],
		[SEARCH_PARAM.okr.ky, mot(thamSo, SEARCH_PARAM.okr.ky)],
	]);
}
