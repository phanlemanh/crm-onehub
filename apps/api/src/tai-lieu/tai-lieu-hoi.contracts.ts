import { chuanNfc } from "@crm/validation/tai-lieu";
import {
	ganNhat,
	LY_DO_LOI,
	TAI_LIEU_HOI,
	traLoiDaKiem,
} from "@crm/validation/tai-lieu-hoi";
import { z } from "zod";
import { TAI_LIEU_API } from "./tai-lieu-config";

const T = TAI_LIEU_API.thongDiep;
const C = TAI_LIEU_HOI.cauHoi;
const HE_SO_NFD = 3;

const ma = z.string().trim().min(1).max(TAI_LIEU_API.vao.ma);

export const cauHoiVao = z
	.string()
	.max(C.toiDa * HE_SO_NFD)
	.transform((s) => chuanNfc(s).trim())
	.pipe(
		z.string().min(C.toiThieu, T.cauHoiNgan).max(C.toiDa, T.cauHoiDai(C.toiDa)),
	);

export const taiLieuHoiInput = z.object({ cauHoi: cauHoiVao });
export const taiLieuHoiOutput = z.object({ hoiId: z.string() });

export const taiLieuHoiKetQuaInput = z.object({ hoiId: ma });
export const taiLieuHoiKetQuaOutput = z.discriminatedUnion("trangThai", [
	z.object({ trangThai: z.literal("DANG_HOI") }),
	z.object({ trangThai: z.literal("TRA_LOI"), traLoi: traLoiDaKiem }),
	z.object({ trangThai: z.literal("TU_CHOI"), ganNhat }),
	z.object({ trangThai: z.literal("LOI"), lyDo: z.enum(LY_DO_LOI) }),
]);

export type TaiLieuHoiInput = z.infer<typeof taiLieuHoiInput>;
export type TaiLieuHoiOutput = z.infer<typeof taiLieuHoiOutput>;
export type TaiLieuHoiKetQuaOutput = z.infer<typeof taiLieuHoiKetQuaOutput>;
