import { readFileSync } from "node:fs";
import { z } from "zod";

export const NGUOI_HOI = [
	"le-hai-dang",
	"nguyen-thi-lan",
	"ngo-van-toan",
	"thai-minh-chau",
	"tran-quoc-bao",
] as const;

export const Y_DINH = [
	"tra-mot",
	"liet-ke",
	"cua-toi",
	"dien-bien",
	"ngoai-okr",
	"xin-sua",
	"khong-tra-loi",
] as const;

const ma = z.string().regex(/^[a-z0-9-]+$/);

export const caHoi = z.object({
	ma,
	nguoiHoi: z.enum(NGUOI_HOI),
	yDinh: z.enum(Y_DINH),
	cauHoi: z.string().min(5).max(500),
	kyVong: z.object({
		loai: z.enum(["tra-loi", "khong-biet", "ngoai-pham-vi"]),
		trichBatBuoc: z.array(z.object({ loai: z.enum(["objective", "kr"]), ma })),
	}),
});

export const boCaHoi = z.array(caHoi).min(30);

export type CaHoi = z.infer<typeof caHoi>;

export function docBoCaHoi(tep: string): CaHoi[] {
	return boCaHoi.parse(JSON.parse(readFileSync(tep, "utf8")));
}

export function thieuPhu(bo: readonly CaHoi[]): string[] {
	return [
		...NGUOI_HOI.filter((n) => !bo.some((c) => c.nguoiHoi === n)),
		...Y_DINH.filter((y) => !bo.some((c) => c.yDinh === y)),
	];
}
