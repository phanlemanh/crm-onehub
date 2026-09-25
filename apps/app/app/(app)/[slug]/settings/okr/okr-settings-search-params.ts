import { parseAsBoolean } from "nuqs/server";
import { SEARCH_PARAM } from "@/lib/search-param-keys";

export const THAM_SO_MO_CHU_KY = SEARCH_PARAM.okr.moChuKy;

export const parseMoChuKy = parseAsBoolean.withDefault(false);
