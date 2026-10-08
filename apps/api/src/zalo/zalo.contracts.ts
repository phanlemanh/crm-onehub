import { UU_TIEN } from "@crm/db/kenh-thong-bao";
import { WEBHOOK_KET } from "@crm/validation/zalo-cau-noi";
import { z } from "zod";

export const zaloTaoMaOutput = z.object({
	ma: z.string().regex(/^\d+$/),
	expiresAt: z.date(),
});
export const zaloGoOutput = z.object({ ok: z.literal(true) });
export const zaloLuuUuTienInput = z.object({ channel: z.enum(UU_TIEN) });
export const zaloLuuUuTienOutput = zaloLuuUuTienInput;
export const zaloLuuDongTroLyOkrInput = z.object({ bat: z.boolean() });
export const zaloLuuDongTroLyOkrOutput = zaloLuuDongTroLyOkrInput;

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
	dongTroLyOkr: z.boolean(),
	laTruongPhong: z.boolean(),
	canNoiLai: z.boolean(),
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
	canManage: z.boolean(),
	nguonToken: z.enum(["man-hinh", "env"]).nullable(),
	goiToken: z.string().nullable(),
	webhook: z.object({
		trangThai: z.enum(["da-dang-ky", "can-https", "chua-dang-ky", "khoa-lech"]),
		url: z.string().nullable(),
	}),
});
export type ZaloXuong = z.infer<typeof zaloXuongOutput>;

export const zaloLuuBotInput = z.object({
	token: z.string().trim().min(1).optional(),
	xacNhanDoiBot: z.literal(true).optional(),
});
export const zaloLuuBotOutput = z.discriminatedUnion("ketQua", [
	z.object({
		ketQua: z.literal("da-luu"),
		tenBot: z.string(),
		webhook: z.enum(WEBHOOK_KET),
	}),
	z.object({
		ketQua: z.literal("can-xac-nhan-doi-bot"),
		soLienKet: z.number().int().positive(),
		tenBotMoi: z.string(),
	}),
]);
export type ZaloLuuBot = z.infer<typeof zaloLuuBotOutput>;
export const zaloGuiThuOutput = z.object({ kenh: z.enum(["zalo", "slack"]) });
