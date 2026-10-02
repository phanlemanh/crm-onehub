import { parseAsBoolean, parseAsString } from "nuqs/server";
import { SEARCH_PARAM } from "@/lib/search-param-keys";

export const THAM_SO_MO_CHU_KY = SEARCH_PARAM.okr.moChuKy;

export const parseMoChuKy = parseAsBoolean.withDefault(false);

export const THAM_SO_MO_RA = SEARCH_PARAM.okr.moRa;

export const parseMoRa = parseAsString;

export const THAM_SO_SUA_CHU_KY = SEARCH_PARAM.okr.suaChuKy;

export const parseSuaChuKy = parseAsString;

export const THAM_SO_LUOT_GOP_Y = SEARCH_PARAM.okr.luotGopY;

export const parseLuotGopY = parseAsString;

export const THAM_SO_CUOC_SOAN = SEARCH_PARAM.okr.cuocSoanAn;

export const parseCuocSoan = parseAsString;

export const THAM_SO_MAU = SEARCH_PARAM.okr.mau;

export const MAU_MOI = "moi";

export const parseMau = parseAsString;
