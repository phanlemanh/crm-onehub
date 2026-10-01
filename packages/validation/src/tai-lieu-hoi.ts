import { z } from "zod";

export const KENH_HOI = ["CRM", "ZALO"] as const;
export type KenhHoi = (typeof KENH_HOI)[number];

export const TRANG_THAI_HOI = ["DANG_HOI", "TRA_LOI", "TU_CHOI", "LOI"] as const;
export type TrangThaiHoi = (typeof TRANG_THAI_HOI)[number];

export const LY_DO_TU_CHOI = ["khong-co-trang", "trich-truot"] as const;
export type LyDoTuChoi = (typeof LY_DO_TU_CHOI)[number];

export const LY_DO_LOI = ["het-tran", "loi-model", "qua-han"] as const;
export type LyDoLoi = (typeof LY_DO_LOI)[number];

export const TRANG_THAI_BAO_SAI = ["MO", "DA_XU_LY"] as const;
export type TrangThaiBaoSai = (typeof TRANG_THAI_BAO_SAI)[number];

export const KET_LUAN_BAO_SAI = ["SAI", "DUNG"] as const;
export type KetLuanBaoSai = (typeof KET_LUAN_BAO_SAI)[number];

export const TAI_LIEU_HOI = {
	cauHoi: { toiThieu: 2, toiDa: 500 },
	ghiChu: { toiDa: 500 },
	trich: { toiThieu: 12, cauToiDa: 8, trichMoiCau: 4, chuToiDa: 600 },
	ganNhatToiDa: 3,
	tran: { ngay: 20, thang: 600 },
	tuChoi: "Chưa có trang đã duyệt nào trả lời câu này. Mình không đoán.",
	ganNhat: "Trang gần nhất: {ten}",
	hetTran: "Trợ lý AI tạm dừng vì hết hạn mức tháng.",
	chuaTraLoi: "Chưa trả lời được lúc này.",
	quaHan:
		"Trang «{ten}» đã quá hạn xác minh từ {ngay}; hỏi chủ trang {chu} trước khi làm theo.",
	tranNgay: "Hôm nay bạn đã hỏi đủ {so} câu. Hỏi lại từ ngày mai.",
	tranThang: "Kho đã dùng hết {so} câu hỏi của tháng này.",
} as const;

export const trichDaKiem = z.object({
	slug: z.string().min(1),
	ten: z.string().min(1),
	phienBan: z.number().int().positive(),
	duyetLuc: z.string().min(1),
	doan: z.string().min(1),
});
export type TrichDaKiem = z.infer<typeof trichDaKiem>;

export const cauDaKiem = z.object({
	chu: z.string().min(1),
	trich: z.array(trichDaKiem).min(1),
});
export type CauDaKiem = z.infer<typeof cauDaKiem>;

export const trangQuaHan = z.object({
	slug: z.string().min(1),
	ten: z.string().min(1),
	xacMinhDen: z.string().min(1),
	chuTrang: z.string().min(1),
});
export type TrangQuaHan = z.infer<typeof trangQuaHan>;

export const traLoiDaKiem = z.object({
	cau: z.array(cauDaKiem).min(1),
	quaHan: z.array(trangQuaHan),
});
export type TraLoiDaKiem = z.infer<typeof traLoiDaKiem>;

export const trangGanNhat = z.object({
	slug: z.string().min(1),
	ten: z.string().min(1),
});
export const ganNhat = z.array(trangGanNhat).max(TAI_LIEU_HOI.ganNhatToiDa);
export type GanNhat = z.infer<typeof ganNhat>;

export function parseTraLoi(v: unknown): TraLoiDaKiem {
	const r = traLoiDaKiem.safeParse(v);
	if (!r.success)
		throw new Error(`câu trả lời kho không đọc được: ${r.error.message}`);
	return r.data;
}

export function parseGanNhat(v: unknown): GanNhat {
	const r = ganNhat.safeParse(v);
	if (!r.success)
		throw new Error(`trang gần nhất không đọc được: ${r.error.message}`);
	return r.data;
}
