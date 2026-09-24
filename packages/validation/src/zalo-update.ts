import { z } from "zod";

const ZALO_HET_TIN = 408;

const loiZalo = z.object({
	ok: z.literal(false),
	error_code: z.number().optional(),
	description: z.string().optional(),
});

export const zaloMessage = z.object({
	from: z.object({
		id: z.string().min(1),
		display_name: z.string(),
		is_bot: z.boolean(),
	}),
	chat: z.object({ id: z.string().min(1), chat_type: z.string() }),
	text: z.string().optional(),
	message_id: z.string().min(1),
	date: z.number(),
});

export type ZaloMessage = z.infer<typeof zaloMessage>;

const coTin = z.object({
	ok: z.literal(true),
	result: z.object({ message: zaloMessage, event_name: z.string() }),
});

const khongTin = z.union([
	z.object({ ok: z.literal(true), result: z.undefined() }),
	loiZalo.extend({ error_code: z.literal(ZALO_HET_TIN) }),
]);

export type ZaloUpdate =
	| { loai: "tin"; message: ZaloMessage; eventName: string }
	| { loai: "het" };

export function parseZaloGetUpdates(value: unknown): ZaloUpdate {
	const tin = coTin.safeParse(value);
	if (tin.success) {
		return {
			loai: "tin",
			message: tin.data.result.message,
			eventName: tin.data.result.event_name,
		};
	}
	if (khongTin.safeParse(value).success) return { loai: "het" };
	throw new Error(`getUpdates tra hinh dang la: ${tin.error.message}`);
}

export function messageIdCua(value: unknown): string | null {
	const ket = z
		.object({
			result: z.object({ message: z.object({ message_id: z.string() }) }),
		})
		.safeParse(value);
	return ket.success ? ket.data.result.message.message_id : null;
}

const getMe = z.object({
	ok: z.literal(true),
	result: z.object({ id: z.string(), account_name: z.string().min(1) }),
});

export type ZaloBot = { id: string; tenBot: string };

export function parseZaloGetMe(value: unknown): ZaloBot {
	const ket = getMe.safeParse(value);
	if (!ket.success) {
		throw new Error(`getMe tra hinh dang la: ${ket.error.message}`);
	}
	return { id: ket.data.result.id, tenBot: ket.data.result.account_name };
}

const guiDuoc = z.object({
	ok: z.literal(true),
	result: z.object({ message_id: z.string() }),
});

export type ZaloDaGui = { messageId: string };

export function parseZaloSend(value: unknown): ZaloDaGui {
	const ket = guiDuoc.safeParse(value);
	if (ket.success) return { messageId: ket.data.result.message_id };
	const loi = loiZalo.safeParse(value);
	const lyDo = loi.success
		? (loi.data.description ?? String(loi.data.error_code ?? "rejected"))
		: "hinh dang la";
	throw new Error(`Zalo rejected the message (${lyDo}).`);
}

const thanBatKy = z.record(z.string(), z.unknown());

export function khoaCapDauCua(value: unknown): string {
	const ket = thanBatKy.safeParse(value);
	return ket.success ? Object.keys(ket.data).join(",") : "";
}

const datWebhook = z.object({
	ok: z.literal(true),
	result: z.object({
		url: z.string(),
		verification: z
			.object({ outcome: z.string(), hint: z.string().optional() })
			.optional(),
	}),
});

export type ZaloDatWebhook = {
	url: string;
	outcome: string | null;
	hint: string | null;
};

export function parseZaloSetWebhook(value: unknown): ZaloDatWebhook {
	const ket = datWebhook.safeParse(value);
	if (!ket.success) {
		throw new Error(`setWebhook tra hinh dang la: ${ket.error.message}`);
	}
	const xacMinh = ket.data.result.verification;
	return {
		url: ket.data.result.url,
		outcome: xacMinh?.outcome ?? null,
		hint: xacMinh?.hint ?? null,
	};
}

const xoaWebhook = z.object({
	ok: z.literal(true),
	result: z.object({ url: z.string() }),
});

export type ZaloDaXoaWebhook = { url: string };

export function parseZaloDeleteWebhook(value: unknown): ZaloDaXoaWebhook {
	const ket = xoaWebhook.safeParse(value);
	if (!ket.success) {
		throw new Error(`deleteWebhook tra hinh dang la: ${ket.error.message}`);
	}
	return { url: ket.data.result.url };
}
