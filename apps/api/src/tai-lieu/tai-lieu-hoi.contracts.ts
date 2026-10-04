import { chuanNfc } from "@crm/validation/tai-lieu";
import {
	ganNhat,
	KET_LUAN_BAO_SAI,
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

const ghiChuVao = z
	.string()
	.max(TAI_LIEU_HOI.ghiChu.toiDa * HE_SO_NFD)
	.transform((s) => chuanNfc(s).trim())
	.pipe(
		z
			.string()
			.max(TAI_LIEU_HOI.ghiChu.toiDa, T.ghiChuDai(TAI_LIEU_HOI.ghiChu.toiDa)),
	);

export const taiLieuBaoSaiInput = z.object({
	hoiId: ma,
	cauHoi: cauHoiVao,
	ghiChu: ghiChuVao.optional(),
});
export const taiLieuBaoSaiOutput = z.object({ soViec: z.number().int() });

export const taiLieuXuLyChuaTraLoiInput = z.object({ hoiId: ma });
export const taiLieuXuLyBaoSaiInput = z.object({
	id: ma,
	ketLuan: z.enum(KET_LUAN_BAO_SAI),
});
export const taiLieuDatXacMinhInput = z.object({
	slug: ma,
	den: z.iso.date().nullable(),
});

const nguoi = z.object({ id: z.string(), name: z.string() });
export const dongChuaTraLoi = z.object({
	hoiId: z.string(),
	cauHoi: z.string(),
	ganNhat,
});
export const dongBaoSai = z.object({
	id: z.string(),
	slug: z.string(),
	ten: z.string(),
	phienBan: z.number().int(),
	cauHoi: z.string(),
	ghiChu: z.string().nullable(),
	chuTrang: nguoi,
});

export type TaiLieuBaoSaiInput = z.infer<typeof taiLieuBaoSaiInput>;
export type TaiLieuXuLyBaoSaiInput = z.infer<typeof taiLieuXuLyBaoSaiInput>;
export type TaiLieuDatXacMinhInput = z.infer<typeof taiLieuDatXacMinhInput>;
export type DongChuaTraLoi = z.infer<typeof dongChuaTraLoi>;
export type DongBaoSai = z.infer<typeof dongBaoSai>;
