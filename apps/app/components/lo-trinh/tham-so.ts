import { parseAsBoolean, parseAsString, parseAsStringLiteral } from "nuqs";
import { createListSearchParams } from "@/components/data-table/list-search-params";
import { LO_TRINH } from "@/lib/lo-trinh/cau-hinh";
import { SEARCH_PARAM } from "@/lib/search-param-keys";

export const VONG_DOI = ["chua-xong", "da-giao", "khac", "tat-ca"] as const;
export type VongDoi = (typeof VONG_DOI)[number];

export const CACH_XEM = ["bang", "bang-cot", "moc"] as const;
export type CachXem = (typeof CACH_XEM)[number];

export const CHIA_COT = ["trang-thai", "nhom", "lo-trinh"] as const;
export type ChiaCot = (typeof CHIA_COT)[number];

export const BO_LOC = ["loTrinh", "nhom", "moc"] as const;
export type BoLoc = (typeof BO_LOC)[number];

export const loTrinhListParams = createListSearchParams<never, BoLoc>({
	defaultSort: "moc",
	defaultDir: "asc",
	pageSize: LO_TRINH.coTrang,
	facetIds: BO_LOC,
});

const K = SEARCH_PARAM.loTrinh;

export const loTrinhParsers = {
	[K.vongDoi]: parseAsStringLiteral(VONG_DOI).withDefault("chua-xong"),
	[K.xem]: parseAsStringLiteral(CACH_XEM).withDefault("bang"),
	[K.chia]: parseAsStringLiteral(CHIA_COT).withDefault("trang-thai"),
	[K.daBac]: parseAsBoolean.withDefault(false),
	[K.viec]: parseAsString,
};
