import { TIN_HIEU } from "@crm/validation/tin-hieu";
import { createListSearchParams } from "@/components/data-table/list-search-params";

export const LOC_TAT_CA = ["phongBan", "trangThaiTinHieu", "nguoiGui"] as const;
export type LocTatCa = (typeof LOC_TAT_CA)[number];

export const tatCaListParams = createListSearchParams<never, LocTatCa>({
	defaultSort: "guiLuc",
	defaultDir: "desc",
	pageSize: TIN_HIEU.coTrangTatCa,
	facetIds: LOC_TAT_CA,
});
