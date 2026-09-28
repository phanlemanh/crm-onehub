import { LOAI_TRANG } from "@crm/validation/tai-lieu";
import {
	createLoader,
	parseAsInteger,
	parseAsStringLiteral,
} from "nuqs/server";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { TAB_TAI_LIEU } from "@/lib/tai-lieu-man";

export const taiLieuParsers = {
	[SEARCH_PARAM.taiLieu.tab]:
		parseAsStringLiteral(TAB_TAI_LIEU).withDefault("trang"),
	[SEARCH_PARAM.taiLieu.loai]: parseAsStringLiteral(LOAI_TRANG),
	[SEARCH_PARAM.list.page]: parseAsInteger.withDefault(1),
};

export const loadTaiLieuSearchParams = createLoader(taiLieuParsers);
