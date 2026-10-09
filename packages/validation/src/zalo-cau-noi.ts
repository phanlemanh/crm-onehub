import { z } from "zod";

export const ZALO_CAU_NOI = {
	bot: "/internal/zalo/bot",
	guiThu: "/internal/zalo/gui-thu",
} as const;

export const datBotYeuCau = z.strictObject({
	token: z.string().trim().min(1).optional(),
	xacNhanDoiBot: z.literal(true).optional(),
});
export type DatBotYeuCau = z.infer<typeof datBotYeuCau>;

export const WEBHOOK_KET = ["da-dang-ky", "can-https", "zalo-tu-choi"] as const;
export type WebhookKet = (typeof WEBHOOK_KET)[number];

export const datBotPhanHoi = z.discriminatedUnion("outcome", [
	z.object({
		outcome: z.literal("valid"),
		tenBot: z.string().min(1),
		webhook: z.enum(WEBHOOK_KET),
	}),
	z.object({ outcome: z.literal("invalid"), reason: z.string().min(1) }),
	z.object({
		outcome: z.literal("khong-co-token"),
		reason: z.string().min(1),
	}),
	z.object({ outcome: z.literal("zalo-loi"), reason: z.string().min(1) }),
	z.object({
		outcome: z.literal("can-xac-nhan-doi-bot"),
		soLienKet: z.number().int().positive(),
		tenBotMoi: z.string().min(1),
	}),
]);
export type DatBotPhanHoi = z.infer<typeof datBotPhanHoi>;

export const guiThuYeuCau = z.strictObject({ userId: z.string().min(1) });
export type GuiThuYeuCau = z.infer<typeof guiThuYeuCau>;

export const guiThuPhanHoi = z.object({
	kenh: z.enum(["zalo", "slack"]).nullable(),
	lech: z.boolean(),
	guiDuoc: z.boolean().default(true),
});
export type GuiThuPhanHoi = z.infer<typeof guiThuPhanHoi>;
