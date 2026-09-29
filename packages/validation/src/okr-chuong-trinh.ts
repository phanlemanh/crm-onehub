import { AI_PHAM_VI, TRO_LY_OKR_TRAN } from "@crm/db/okr-tro-ly-danh-muc";
import { z } from "zod";

export {
	DON_VI_ONEHUB,
	type DonViMucTieu,
	donViDuocBat,
	phamViCuaViec,
} from "@crm/db/okr-tro-ly-danh-muc";

export const CHE_DO_TRAN = ["canh-bao", "chan"] as const;
export const THANG_CHAM = ["0-1", "0-100"] as const;

const tranThangUsd = z
	.number()
	.min(0)
	.max(TRO_LY_OKR_TRAN.tranThangToiDaUsd)
	.refine((n) => Number(n.toFixed(2)) === n);

export const okrProgram = z.object({
	objectiveCap: z.int().min(1).max(50),
	krCap: z.int().min(1).max(50),
	capMode: z.enum(CHE_DO_TRAN),
	scoreScale: z.enum(THANG_CHAM),
	weightsOn: z.boolean(),
	personalOn: z.boolean(),
	aiOn: z.boolean(),
	aiDeXuatPhamVi: z.enum(AI_PHAM_VI),
	aiDeXuatDonVi: z.array(z.string().min(1)).max(200),
	aiTomTatPhamVi: z.enum(AI_PHAM_VI),
	aiTomTatDonVi: z.array(z.string().min(1)).max(200),
	aiTranThangUsd: tranThangUsd,
	duyetCongBo: z.boolean(),
});

export type OkrProgram = z.infer<typeof okrProgram>;

export const okrProgramSua = okrProgram.partial();

export type OkrProgramSua = z.infer<typeof okrProgramSua>;

export const OKR_PROGRAM_MAC_DINH: OkrProgram = {
	objectiveCap: 5,
	krCap: 5,
	capMode: "canh-bao",
	scoreScale: "0-1",
	weightsOn: false,
	personalOn: false,
	aiOn: false,
	aiDeXuatPhamVi: "tat",
	aiDeXuatDonVi: [],
	aiTomTatPhamVi: "tat",
	aiTomTatDonVi: [],
	aiTranThangUsd: TRO_LY_OKR_TRAN.tranThangMacDinhUsd,
	duyetCongBo: false,
};

export function docTranUsd(chu: string): number | null {
	const gon = chu.trim().replace(",", ".");
	if (!/^\d+(\.\d{1,2})?$/.test(gon)) return null;
	const so = Number(gon);
	return tranThangUsd.safeParse(so).success ? so : null;
}
