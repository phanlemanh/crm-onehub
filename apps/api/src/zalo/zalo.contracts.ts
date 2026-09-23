import { UU_TIEN } from "@crm/db/kenh-thong-bao";
import { z } from "zod";

export const zaloTaoMaOutput = z.object({
	ma: z.string().regex(/^\d+$/),
	expiresAt: z.date(),
});
export const zaloGoOutput = z.object({ ok: z.literal(true) });
export const zaloLuuUuTienInput = z.object({ channel: z.enum(UU_TIEN) });
export const zaloLuuUuTienOutput = zaloLuuUuTienInput;

export const zaloCuaToiOutput = z.object({
	zaloBat: z.boolean(),
	tenBot: z.string().nullable(),
	lienKet: z.discriminatedUnion("loai", [
		z.object({ loai: z.literal("chua-noi") }),
		z.object({ loai: z.literal("ma-cho"), expiresAt: z.date() }),
		z.object({ loai: z.literal("ma-het-han") }),
		z.object({ loai: z.literal("da-noi"), tenZalo: z.string() }),
	]),
	uuTien: z.enum(UU_TIEN),
	zaloDuoc: z.boolean(),
	slackDuoc: z.boolean(),
	kenhSeDung: z.enum(["zalo", "slack"]).nullable(),
	lech: z.boolean(),
});
export type ZaloCuaToi = z.infer<typeof zaloCuaToiOutput>;

export const zaloXuongOutput = z.object({
	bat: z.boolean(),
	tenBot: z.string().nullable(),
	pollCuoi: z.date().nullable(),
	im: z.boolean(),
	daNoi: z.number().int(),
	tong: z.number().int(),
	nguoi: z.array(
		z.object({
			id: z.string(),
			ten: z.string(),
			tenZalo: z.string().nullable(),
		}),
	),
});
export type ZaloXuong = z.infer<typeof zaloXuongOutput>;
