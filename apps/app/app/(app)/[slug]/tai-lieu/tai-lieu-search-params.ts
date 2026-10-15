import { LOAI_TRANG } from "@crm/validation/tai-lieu";
import {
	createLoader,
	parseAsBoolean,
	parseAsInteger,
	parseAsString,
	parseAsStringLiteral,
} from "nuqs/server";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { NHOM_DE_XUAT, TAB_TAI_LIEU } from "@/lib/tai-lieu-man";

const PUSH = { history: "push" } as const;

export const taiLieuParsers = {
	[SEARCH_PARAM.taiLieu.tab]:
		parseAsStringLiteral(TAB_TAI_LIEU).withDefault("trang"),
	[SEARCH_PARAM.taiLieu.loai]:
		parseAsStringLiteral(LOAI_TRANG).withOptions(PUSH),
	[SEARCH_PARAM.taiLieu.donVi]: parseAsString.withOptions(PUSH),
	[SEARCH_PARAM.taiLieu.chu]: parseAsString.withOptions(PUSH),
	[SEARCH_PARAM.taiLieu.nhom]: parseAsStringLiteral(NHOM_DE_XUAT)
		.withDefault("cho")
		.withOptions(PUSH),
	[SEARCH_PARAM.list.page]: parseAsInteger.withDefault(1).withOptions(PUSH),
	[SEARCH_PARAM.list.archived]: parseAsBoolean
		.withDefault(false)
		.withOptions(PUSH),
};

export const loadTaiLieuSearchParams = createLoader(taiLieuParsers);
