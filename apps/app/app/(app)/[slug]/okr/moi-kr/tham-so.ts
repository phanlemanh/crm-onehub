import { TINH_TRANG_KR } from "@crm/validation/okr-muc-tieu";
import {
	createLoader,
	parseAsArrayOf,
	parseAsString,
	parseAsStringLiteral,
} from "nuqs/server";
import { SEARCH_PARAM } from "@/lib/search-param-keys";

export const moiKrParsers = {
	[SEARCH_PARAM.okr.tinhTrangKr]: parseAsArrayOf(
		parseAsStringLiteral(TINH_TRANG_KR),
	).withDefault([]),
	[SEARCH_PARAM.okr.donViKr]: parseAsArrayOf(parseAsString).withDefault([]),
	[SEARCH_PARAM.okr.nguoiKr]: parseAsArrayOf(parseAsString).withDefault([]),
};

export const LOC_MOI_KR_RONG = { tinhTrang: [], donVi: [], nguoi: [] };

export const loadMoiKrSearchParams = createLoader(moiKrParsers);

export function duongMoiKr(
	goc: string,
	thamSo: { ky: string | null; tinhTrang: readonly string[] },
): string {
	const q = new URLSearchParams();
	if (thamSo.ky) q.set(SEARCH_PARAM.okr.ky, thamSo.ky);
	if (thamSo.tinhTrang.length > 0)
		q.set(SEARCH_PARAM.okr.tinhTrangKr, thamSo.tinhTrang.join(","));
	return q.size > 0 ? `${goc}?${q}` : goc;
}
