import { z } from "zod";

export const KIEU_KR = [
	"tang-toi",
	"giam-xuong",
	"giu-tren",
	"giu-duoi",
	"moc",
	"phan-tram",
] as const;

export type KieuKr = (typeof KIEU_KR)[number];

export const SO_KR_MOC = { startValue: 0, targetValue: 1 } as const;

export const NGUON_KR = ["tay", "crm", "api", "bang-tinh"] as const;

export type NguonKr = (typeof NGUON_KR)[number];

export const kieuKr = z.enum(KIEU_KR);

export const soKr = z.number().finite().min(-1e12).max(1e12);

const nhomNghin = /^-?\d{1,3}(\.\d{3})+$/;

export function docSoOkr(input: string): number | null {
	const s = input.replace(/\s/g, "");
	if (s === "") return null;
	const n =
		s.includes(",") || nhomNghin.test(s)
			? Number(s.replace(/\./g, "").replace(",", "."))
			: Number(s);
	return soKr.safeParse(n).success ? n : null;
}

export const krInput = z.object({
	title: z.string().trim().min(3).max(200),
	kind: kieuKr,
	ownerUserId: z.string().trim().min(1).max(120),
	startValue: soKr,
	targetValue: soKr,
	currentValue: soKr,
	unit: z.string().trim().max(24),
	dueOn: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/)
		.nullable(),
	weight: z.number().min(0).max(10),
});

export type KrInput = z.infer<typeof krInput>;

export const LOI_SO_THEO_KIEU = [
	"dich-phai-lon-hon-khoi-diem",
	"dich-phai-nho-hon-khoi-diem",
	"phan-tram-ngoai-0-100",
] as const;
export type LoiSoTheoKieu = (typeof LOI_SO_THEO_KIEU)[number];

export function kiemSoTheoKieu(
	kieu: KieuKr,
	khoi: number,
	dich: number,
): LoiSoTheoKieu | null {
	if (kieu === "tang-toi" && dich <= khoi) return "dich-phai-lon-hon-khoi-diem";
	if (kieu === "giam-xuong" && dich >= khoi)
		return "dich-phai-nho-hon-khoi-diem";
	if (kieu === "phan-tram" && (dich < 0 || dich > 100))
		return "phan-tram-ngoai-0-100";
	return null;
}

const kep = (p: number) => Math.max(0, Math.min(100, Math.round(p)));

export function tienDoKr(
	kieu: KieuKr,
	khoi: number,
	dich: number,
	hien: number,
): number {
	switch (kieu) {
		case "tang-toi":
			return dich === khoi ? 0 : kep(((hien - khoi) / (dich - khoi)) * 100);
		case "giam-xuong":
			return dich === khoi ? 0 : kep(((khoi - hien) / (khoi - dich)) * 100);
		case "giu-tren":
			return hien >= dich ? 100 : 0;
		case "giu-duoi":
			return hien <= dich ? 100 : 0;
		case "moc":
			return hien >= 1 ? 100 : 0;
		case "phan-tram":
			return kep(hien);
	}
}
