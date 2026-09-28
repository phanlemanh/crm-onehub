import { idInput } from "@crm/validation/okr-canh-kr";
import { KIEU_KR } from "@crm/validation/okr-kr";
import { z } from "zod";

const ma = z.string().trim().min(1).max(120);

export const LOAI_SANG_KIEN = ["chien-dich", "ke-hoach"] as const;
export const TRANG_THAI_LIEN_KET = [
	"chua-chay",
	"dang-chay",
	"da-dong",
	"da-luu-tru",
	"da-xoa",
] as const;

export const canhKrInput = z.object({ keyResultId: ma });

export const goViecInput = idInput;

export const goBangChungInput = idInput;

export const idOutput = z.object({ id: z.string() });

export const lienKet = z.discriminatedUnion("coQuyen", [
	z.object({ loai: z.enum(LOAI_SANG_KIEN), coQuyen: z.literal(false) }),
	z.object({
		loai: z.enum(LOAI_SANG_KIEN),
		coQuyen: z.literal(true),
		id: z.string().nullable(),
		ten: z.string().nullable(),
		trangThai: z.enum(TRANG_THAI_LIEN_KET),
	}),
]);
export type LienKet = z.infer<typeof lienKet>;

export const dongViec = z.object({
	id: z.string(),
	loai: z.literal("viec"),
	tieuDe: z.string(),
	nguoiLam: z
		.object({ id: z.string(), name: z.string(), daRoi: z.boolean() })
		.nullable(),
	hanNgay: z.string().nullable(),
	quaHan: z.boolean(),
	xong: z.boolean(),
	laNguoiLam: z.boolean(),
});
export type DongViec = z.infer<typeof dongViec>;

export const dongSangKien = z.object({
	id: z.string(),
	loai: z.enum(LOAI_SANG_KIEN),
	lienKet,
});
export type DongSangKien = z.infer<typeof dongSangKien>;

export const dongCanh = z.discriminatedUnion("loai", [dongViec, dongSangKien]);
export type DongCanh = z.infer<typeof dongCanh>;

export const bangChungDong = z.object({
	id: z.string(),
	url: z.string(),
	ghiChu: z.string(),
	nguoiDinh: z.object({ id: z.string(), name: z.string() }),
	dinhLuc: z.string(),
});
export type BangChungDong = z.infer<typeof bangChungDong>;

export const canhKrOutput = z.object({
	kr: z.object({
		id: z.string(),
		title: z.string(),
		kind: z.enum(KIEU_KR),
		objectiveId: z.string(),
		ownerName: z.string(),
	}),
	dong: z.array(dongCanh),
	bangChung: z.array(bangChungDong),
	quyen: z.object({ suaDuoc: z.boolean(), ganDuoc: z.boolean() }),
	khoa: z.boolean(),
});
export type CanhKrOutput = z.infer<typeof canhKrOutput>;
