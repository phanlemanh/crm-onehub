import { z } from "zod";
import { CAC_KIEU_TEP } from "./kieu-tep";

const MB = 1024 * 1024;

export const TEP_TRUONG = {
	toiDaByte: 20 * MB,
	toiDaTepMoiO: 10,
	taiVeGiay: 300,
	tenToiDa: 255,
	thongDiep: {
		tat: "Kho tệp chưa bật trên máy chủ nên chưa tải tệp lên được.",
		saiKieu: "Tệp này không phải PDF, DOCX hay ảnh PNG, JPG.",
		macro: "Tệp Word này có macro. Lưu lại thành DOCX thường rồi tải lên.",
		quaCo: "Tệp quá 20 MB.",
		rong: "Tệp rỗng. Chọn lại tệp.",
		day: "Ô này đã đủ 10 tệp. Xoá bớt rồi tải tiếp.",
		trung: "Tệp này đã có trong ô.",
		phieuSai: "Lượt tải này đã hết hạn hoặc không thuộc ô này. Tải lại tệp.",
		chuaTai: "Chưa thấy tệp trên kho. Tải lại tệp.",
		luuTru: "Bản ghi đã lưu trữ. Khôi phục bản ghi rồi mới gắn hay xoá tệp.",
		khongNhanTep: "Trường này không nhận tệp.",
		khongCoBanGhi: "Không tìm thấy bản ghi.",
		khongCoTep: "Không tìm thấy tệp.",
		khongMo: "Chỉ quản trị mở được tệp.",
		khongXoa:
			"Chỉ quản trị hoặc người đã tải tệp lên mới xoá được tệp này.",
	},
} as const;

export const kieuTepSchema = z.enum(CAC_KIEU_TEP);

export const tepTrongO = z.object({
	id: z.string().min(1),
	tenTep: z.string().min(1).max(TEP_TRUONG.tenToiDa),
	kieu: kieuTepSchema,
	kichThuoc: z.number().int().nonnegative(),
	taiLuc: z.string().datetime(),
	taiBoi: z.object({ id: z.string(), ten: z.string().nullable() }).nullable(),
	coTheMo: z.boolean(),
	coTheXoa: z.boolean(),
});

export type TepTrongO = z.infer<typeof tepTrongO>;

export const tepTheoTruong = z.record(z.string(), z.array(tepTrongO));

export type TepTheoTruong = z.infer<typeof tepTheoTruong>;

export const soTepTheoTruong = z.record(z.string(), z.number().int());

export function parseTepTheoTruong(value: unknown): TepTheoTruong {
	return tepTheoTruong.parse(value);
}
