import { createLoader, parseAsString } from "nuqs/server";
import { SEARCH_PARAM } from "@/lib/search-param-keys";

export const loadSuaSearchParams = createLoader({
	[SEARCH_PARAM.taiLieu.tuDeXuat]: parseAsString,
});
