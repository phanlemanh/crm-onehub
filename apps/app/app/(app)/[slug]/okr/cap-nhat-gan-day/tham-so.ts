import { createLoader, parseAsInteger } from "nuqs/server";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { parseAsPhamViBo } from "../okr-search-params";

export const capNhatGanDayParsers = {
	[SEARCH_PARAM.okr.phamViBo]: parseAsPhamViBo,
	[SEARCH_PARAM.okr.trangCapNhat]: parseAsInteger.withDefault(1),
};

export const loadCapNhatGanDaySearchParams = createLoader(capNhatGanDayParsers);

export function trangHopLe(trang: number): number {
	return Number.isInteger(trang) && trang >= 1 ? trang : 1;
}
