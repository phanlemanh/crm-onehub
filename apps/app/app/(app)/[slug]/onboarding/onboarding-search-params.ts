import { createLoader, parseAsStringLiteral } from "nuqs/server";
import {
	createListSearchParams,
	type ListInput,
} from "@/components/data-table/list-search-params";
import { SEARCH_PARAM } from "@/lib/search-param-keys";

export const ONBOARDING_TRANG_THAI = ["dang-chay", "da-dong"] as const;

export type OnboardingTrangThai = (typeof ONBOARDING_TRANG_THAI)[number];

export const DANH_MUC_CACH_XEM = ["bang", "bang-cot"] as const;

export type DanhMucCachXem = (typeof DANH_MUC_CACH_XEM)[number];

export const DANH_MUC_CACH_CHIA = [
	"buoc",
	"bo-phan",
	"bac",
	"trang-thai",
	"nguoi-giao",
] as const;

export type DanhMucCachChia = (typeof DANH_MUC_CACH_CHIA)[number];

export const DANH_MUC_BO_LOC = ["boPhan", "nguoiCam"] as const;

export type DanhMucBoLoc = (typeof DANH_MUC_BO_LOC)[number];

export const danhMucSearchParams = createListSearchParams<never, DanhMucBoLoc>({
	facetIds: DANH_MUC_BO_LOC,
});

export const onboardingParsers = {
	[SEARCH_PARAM.onboarding.trangThai]: parseAsStringLiteral(
		ONBOARDING_TRANG_THAI,
	).withDefault("dang-chay"),
	[SEARCH_PARAM.onboarding.cachXem]:
		parseAsStringLiteral(DANH_MUC_CACH_XEM).withDefault("bang"),
	[SEARCH_PARAM.onboarding.cachChia]:
		parseAsStringLiteral(DANH_MUC_CACH_CHIA).withDefault("buoc"),
};

export const loadOnboardingSearchParams = createLoader(onboardingParsers);

export type OnboardingSearchValues = {
	trangThai: OnboardingTrangThai;
	cachXem: DanhMucCachXem;
	cachChia: DanhMucCachChia;
};

export type DanhMucInput = {
	q: string;
	sort: string;
	dir: "asc" | "desc";
	page: number;
	pageSize: number;
	status: OnboardingTrangThai | "tat-ca";
	boPhan: string[];
	nguoiCam: string[];
};

export function chiaTheoTrangThai(values: OnboardingSearchValues): boolean {
	return values.cachXem === "bang-cot" && values.cachChia === "trang-thai";
}

export function danhMucInput(
	list: ListInput<never, DanhMucBoLoc>,
	values: OnboardingSearchValues,
): DanhMucInput {
	return {
		q: list.q,
		sort: list.sort,
		dir: list.dir,
		page: list.page,
		pageSize: list.pageSize,
		status: chiaTheoTrangThai(values) ? "tat-ca" : values.trangThai,
		boPhan: list.boPhan,
		nguoiCam: list.nguoiCam,
	};
}
