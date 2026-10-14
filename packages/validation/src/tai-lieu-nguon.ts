import { z } from "zod";
import { LOAI_TRANG } from "./tai-lieu";

const MB = 1024 * 1024;
const PHUT_GIAY = 60;

export const KIEU_NGUON = ["docx", "pdf"] as const;
export type KieuNguonTep = (typeof KIEU_NGUON)[number];

const TOI_DA_MB = 20;

const TEN_KIEU = { docx: "Word (.docx)", pdf: "PDF" } satisfies Record<
	KieuNguonTep,
	string
>;

export function danhSachKieuNguon(noi: string): string {
	return KIEU_NGUON.map((k) => TEN_KIEU[k]).join(noi);
}

export const TRANG_THAI_NGUON = [
	"CHO_DOC",
	"CHO_SOAN",
	"DANG_SOAN",
	"DA_SOAN",
	"CAN_GO_TAY",
	"LOI",
] as const;
export type TrangThaiNguon = (typeof TRANG_THAI_NGUON)[number];

export const NGUON = {
	toiDaMb: TOI_DA_MB,
	toiDaByte: TOI_DA_MB * MB,
	giayTaiVe: 5 * PHUT_GIAY,
	tenTepToiDa: 255,
	duoi: { docx: ".docx", pdf: ".pdf" } satisfies Record<KieuNguonTep, string>,
	kieuNoiDung: {
		docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		pdf: "application/pdf",
	} satisfies Record<KieuNguonTep, string>,
	pathname: /^kho-tai-lieu\/nguon\/[0-9a-f-]{36}$/,
	thongDiep: {
		tat: "Chưa bật lưu tệp nguồn — nhờ quản trị cấu hình.",
		saiLoai: `Chỉ nhận ${danhSachKieuNguon(" hoặc ")}, tới ${TOI_DA_MB} MB.`,
		rong: "Tệp rỗng.",
		daCo: "Nguồn này đã có.",
		khongCo: "Không tìm thấy nguồn này.",
		chuaTai: "Chưa thấy tệp đã tải lên. Tải lại rồi thử lại.",
		dichChuaDung:
			"Chỉ cập nhật được trang đã có bản đang dùng. Chọn «Trang mới» cho trang chưa duyệt lần nào.",
		dangSoan: "Máy đang soạn nguồn này. Chờ xong rồi mới soạn lại được.",
		khongCanSoanLai: "Nguồn này không cần soạn lại.",
		phieuSai: "Không nhận được tệp này. Tải lên lại từ đầu.",
	},
	nhanTrangThai: {
		CHO_DOC: "Máy đang soạn",
		CHO_SOAN: "Máy đang soạn",
		DANG_SOAN: "Máy đang soạn",
		DA_SOAN: "Đã soạn",
		CAN_GO_TAY: "Cần gõ tay — tệp là bản quét, máy không đọc được chữ",
		LOI: "Chưa soạn được",
	} satisfies Record<TrangThaiNguon, string>,
} as const;

export const soanTuNguonPayload = z.object({ nguonId: z.string().min(1) });
export type SoanTuNguonPayload = z.infer<typeof soanTuNguonPayload>;

export function parseSoanTuNguonPayload(value: unknown): SoanTuNguonPayload {
	const r = soanTuNguonPayload.safeParse(value);
	if (!r.success) {
		throw new Error(`việc soạn từ nguồn không đọc được: ${r.error.message}`);
	}
	return r.data;
}

export function parseTrangThaiNguon(value: string): TrangThaiNguon {
	const r = z.enum(TRANG_THAI_NGUON).safeParse(value);
	if (!r.success) throw new Error(`trạng thái nguồn lạ: ${value}`);
	return r.data;
}

export function parseKieuNguon(value: string): KieuNguonTep {
	const r = z.enum(KIEU_NGUON).safeParse(value);
	if (!r.success) throw new Error(`kiểu nguồn lạ: ${value}`);
	return r.data;
}

export const dichNguon = z.discriminatedUnion("loai", [
	z.object({
		loai: z.literal("moi"),
		ten: z.string(),
		loaiTrang: z.enum(LOAI_TRANG),
		chuTrangId: z.string().min(1),
		departmentId: z.string().min(1).nullable().optional(),
	}),
	z.object({ loai: z.literal("cap-nhat"), slug: z.string().min(1) }),
]);
export type DichNguon = z.infer<typeof dichNguon>;
