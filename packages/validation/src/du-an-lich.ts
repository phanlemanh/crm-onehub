import { z } from "zod";

export { DU_AN } from "@crm/db/du-an";

const ngay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const NGHIA_TRANG_THAI_VIEC = [
	"nhap",
	"dangChay",
	"cho",
	"xong",
	"ketThuc",
] as const;

export const duAnLich = z.object({
	duAn: z.object({
		id: z.string(),
		ten: z.string(),
		moTa: z.string().nullable(),
		dong: z.boolean(),
		taoBoiId: z.string(),
	}),
	viec: z.array(
		z.object({
			id: z.string(),
			tieuDe: z.string(),
			chaId: z.string().nullable(),
			batDau: ngay.nullable(),
			han: ngay.nullable(),
			nghia: z.enum(NGHIA_TRANG_THAI_VIEC),
			suaDuoc: z.boolean(),
			phaiCho: z.array(z.string()),
		}),
	),
	moc: z.array(
		z.object({
			id: z.string(),
			ten: z.string(),
			ngay,
			tre: z.boolean(),
			treBoi: z.array(z.string()),
			cho: z.array(z.string()),
		}),
	),
	lich: z.object({
		ngayNghiTuan: z.array(z.number().int().min(1).max(7)),
		ngayLe: z.array(ngay),
	}),
});

export type DuAnLich = z.infer<typeof duAnLich>;

export function parseDuAnLich(value: unknown): DuAnLich {
	return duAnLich.parse(value);
}
