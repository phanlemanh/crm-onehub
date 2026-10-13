import { createRequire } from "node:module";
import { join } from "node:path";
import { khuonCau } from "../../tro-ly-doc-kho/rang/quyet-do";
import { BO_MAU } from "./bo-mau-config";

const { z } = createRequire(
	join(BO_MAU.duong.goc, "apps", "agent", "package.json"),
)("zod") as typeof import("zod");

export const TANG = ["S1", "S2", "S3", "S6", "S7", "ngoai-kho"] as const;
export const KIEU_CHU = [
	"chuan",
	"khong-dau",
	"viet-tat",
	"sai-chinh-ta",
	"tron-anh",
	"tin-zalo",
] as const;

export type Tang = (typeof TANG)[number];
export type KieuChu = (typeof KIEU_CHU)[number];

export const khuonCauMau = khuonCau
	.extend({
		tang: z.enum(TANG),
		kieuChu: z.enum(KIEU_CHU),
		y: z.array(z.string().min(1)).optional(),
		ganTrang: z.string().min(1).optional(),
		mau: z.literal(true),
	})
	.strict();

export const khuonBoMau = z
	.object({
		nhan: z.string().min(1),
		nguon: z.string().min(1),
		cau: z.array(khuonCauMau).min(1),
	})
	.strict();

export type CauMau = z.infer<typeof khuonCauMau>;
export type BoMau = z.infer<typeof khuonBoMau>;
