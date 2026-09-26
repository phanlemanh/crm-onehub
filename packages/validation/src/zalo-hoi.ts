import { z } from "zod";

export const ZALO_HOI_KET_QUA = [
	"dang-hoi",
	"da-tra-loi",
	"gui-hong",
	"tu-choi-vai",
	"tu-choi-tran-phut",
	"tu-choi-tran-ngay",
	"tu-choi-tran-thang",
	"dang-ban",
	"loi",
] as const;

export const zaloHoiKetQua = z.enum(ZALO_HOI_KET_QUA);

export type ZaloHoiKetQua = z.infer<typeof zaloHoiKetQua>;

export const KET_QUA_TINH_TRAN = [
	"dang-hoi",
	"da-tra-loi",
	"gui-hong",
] as const satisfies readonly ZaloHoiKetQua[];
