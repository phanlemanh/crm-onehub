import { z } from "zod";

export const LOAI_CHU_KY = ["nam", "quy"] as const;
export const PHA_CHU_KY = [
	"lap-ke-hoach",
	"dang-chay",
	"cham-diem",
	"da-dong",
] as const;

export type LoaiChuKy = (typeof LOAI_CHU_KY)[number];
export type PhaChuKy = (typeof PHA_CHU_KY)[number];

export const PHA_GHI_DUOC: readonly PhaChuKy[] = ["lap-ke-hoach", "dang-chay"];

export const ngayLich = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const chuKyInput = z
	.object({
		kind: z.enum(LOAI_CHU_KY),
		name: z.string().trim().min(2).max(80),
		parentId: z.string().trim().min(1).max(120).nullable(),
		startsOn: ngayLich,
		endsOn: ngayLich,
		breakStartsOn: ngayLich.nullable(),
		breakEndsOn: ngayLich.nullable(),
		updateWeekday: z.int().min(1).max(7),
	})
	.refine((c) => c.startsOn < c.endsOn, { message: "startsOn < endsOn" })
	.refine(
		(c) =>
			(c.breakStartsOn === null) === (c.breakEndsOn === null) &&
			(c.breakStartsOn === null ||
				(c.breakStartsOn <= (c.breakEndsOn as string) &&
					c.breakStartsOn >= c.startsOn &&
					(c.breakEndsOn as string) <= c.endsOn)),
		{ message: "khoang nghi trong chu ky" },
	);

export type ChuKyInput = z.infer<typeof chuKyInput>;

export function phaSau(pha: PhaChuKy): PhaChuKy | null {
	const i = PHA_CHU_KY.indexOf(pha);
	return PHA_CHU_KY[i + 1] ?? null;
}

export function ghiDuocOPha(pha: PhaChuKy): boolean {
	return PHA_GHI_DUOC.includes(pha);
}
