import { createLoader, parseAsString } from "nuqs/server";
import { SEARCH_PARAM } from "@/lib/search-param-keys";

export const loadViecSearchParams = createLoader({
	[SEARCH_PARAM.viec.phamVi]: parseAsString,
});
