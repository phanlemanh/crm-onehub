import { createLoader, parseAsString } from "nuqs/server";
import { SEARCH_PARAM } from "@/lib/search-param-keys";

export const loadLoTrinhSearchParams = createLoader({
	[SEARCH_PARAM.loTrinh.sanPham]: parseAsString,
});
