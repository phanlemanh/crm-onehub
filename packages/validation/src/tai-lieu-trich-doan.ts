import { z } from "zod";

export const TRICH_DOAN = {
	menhDe: { min: 1, max: 300 },
	trich: { min: 1, max: 600 },
	toiDa: 60,
} as const;

export const trichDoan = z.object({
	menhDe: z
		.string()
		.trim()
		.min(TRICH_DOAN.menhDe.min)
		.max(TRICH_DOAN.menhDe.max),
	trich: z.string().trim().min(TRICH_DOAN.trich.min).max(TRICH_DOAN.trich.max),
});
export type TrichDoan = z.infer<typeof trichDoan>;

export const danhSachTrichDoan = z.array(trichDoan).max(TRICH_DOAN.toiDa);

export function parseTrichDoan(value: unknown): TrichDoan[] {
	const r = danhSachTrichDoan.safeParse(value);
	if (!r.success)
		throw new Error(`trích đoạn không đọc được: ${r.error.message}`);
	return r.data;
}

function lopKyTu(...ma: number[]): string {
	return `[${String.fromCodePoint(...ma)}]`;
}

const DAU_THANH = lopKyTu(0x300, 0x301, 0x303, 0x309, 0x323);
const DAU_THANH_TRUOC = new RegExp(
	`([oO])(${DAU_THANH})([aAeE])|([uU])(${DAU_THANH})([yY])`,
	"g",
);
const KHOANG_TRANG_CUNG = new RegExp(lopKyTu(0xa0, 0x202f), "g");
const KY_TU_VO_HINH = new RegExp(lopKyTu(0x200b, 0x200c, 0x200d, 0xfeff), "g");
const NHAY_KEP = new RegExp(lopKyTu(0x201c, 0x201d), "g");
const NHAY_DON = new RegExp(lopKyTu(0x2018, 0x2019), "g");
const GACH = new RegExp(lopKyTu(0x2013, 0x2014), "g");

function dauThanhKieuMoi(s: string): string {
	return s
		.normalize("NFD")
		.replace(DAU_THANH_TRUOC, (_, o, dauO, a, u, dauU, y) =>
			o === undefined ? `${u}${y}${dauU}` : `${o}${a}${dauO}`,
		)
		.normalize("NFC");
}

export function quoteKey(s: string): string {
	return dauThanhKieuMoi(s.normalize("NFC"))
		.replace(KHOANG_TRANG_CUNG, " ")
		.replace(KY_TU_VO_HINH, "")
		.replace(/\s+/g, " ")
		.replace(NHAY_KEP, '"')
		.replace(NHAY_DON, "'")
		.replace(GACH, "-")
		.trim();
}
