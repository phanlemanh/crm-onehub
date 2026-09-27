import { z } from "zod";
import {
	AI_PHAM_VI,
	type AiPhamVi,
	TRO_LY_OKR_TRAN,
	type ViecTroLy,
} from "./okr-tro-ly";

export const CHE_DO_TRAN = ["canh-bao", "chan"] as const;
export const THANG_CHAM = ["0-1", "0-100"] as const;

export const DON_VI_ONEHUB = "onehub";

const tranThangUsd = z
	.number()
	.min(0)
	.max(TRO_LY_OKR_TRAN.tranThangToiDaUsd)
	.refine((n) => Math.round(n * 100) === n * 100);

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
};

export function docTranUsd(chu: string): number | null {
	const gon = chu.trim().replace(",", ".");
	if (!/^\d+(\.\d{1,2})?$/.test(gon)) return null;
	const so = Number(gon);
	return tranThangUsd.safeParse(so).success ? so : null;
}

export type DonViMucTieu = {
	onehub: boolean;
	boPhanId: string | null;
	phongBanId: string | null;
};

const PHAM_VI_CUA_VIEC = {
	"de-xuat": { phamVi: "aiDeXuatPhamVi", donVi: "aiDeXuatDonVi" },
	"tom-tat-tuan": { phamVi: "aiTomTatPhamVi", donVi: "aiTomTatDonVi" },
} as const satisfies Record<
	ViecTroLy,
	{ phamVi: keyof OkrProgram; donVi: keyof OkrProgram }
>;

export function phamViCuaViec(
	ct: OkrProgram,
	viec: ViecTroLy,
): { phamVi: AiPhamVi; donVi: readonly string[] } {
	const cot = PHAM_VI_CUA_VIEC[viec];
	return { phamVi: ct[cot.phamVi], donVi: ct[cot.donVi] };
}

export function donViDuocBat(
	ct: OkrProgram,
	viec: ViecTroLy,
	donVi: DonViMucTieu,
): "tat" | "viec-tat" | "don-vi-chua-bat" | "bat" {
	if (!ct.aiOn) return "tat";
	const { phamVi, donVi: danhSach } = phamViCuaViec(ct, viec);
	if (phamVi === "tat") return "viec-tat";
	if (phamVi === "toan-cong-ty") return "bat";
	const khop =
		(donVi.onehub && danhSach.includes(DON_VI_ONEHUB)) ||
		(donVi.boPhanId !== null && danhSach.includes(donVi.boPhanId)) ||
		(donVi.phongBanId !== null && danhSach.includes(donVi.phongBanId));
	return khop ? "bat" : "don-vi-chua-bat";
}
