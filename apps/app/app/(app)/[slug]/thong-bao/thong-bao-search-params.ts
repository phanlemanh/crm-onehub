import { parseAsStringLiteral } from "nuqs/server";
import { SEARCH_PARAM } from "@/lib/search-param-keys";

export const LOC_THONG_BAO = ["tat-ca", "chua-doc"] as const;

export const thongBaoParsers = {
	[SEARCH_PARAM.thongBao.loc]:
		parseAsStringLiteral(LOC_THONG_BAO).withDefault("tat-ca"),
};
