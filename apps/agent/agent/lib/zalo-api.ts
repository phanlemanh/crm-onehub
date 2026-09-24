import { db } from "@crm/db";
import { SETTINGS_ID } from "@crm/db/settings";
import { parseZaloSend } from "@crm/validation/zalo-update";
import { ZALO } from "./zalo-config";

async function docCaiDat() {
	return db.appSetting.findUnique({
		where: { id: SETTINGS_ID },
		select: { zaloBotToken: true, zaloWebhookSecret: true },
	});
}

export async function zaloToken(): Promise<string | null> {
	const caiDat = await docCaiDat();
	return (
		caiDat?.zaloBotToken?.trim() || process.env.ZALO_BOT_TOKEN?.trim() || null
	);
}

export async function zaloKhoaWebhook(): Promise<string | null> {
	const caiDat = await docCaiDat();
	return (
		caiDat?.zaloWebhookSecret?.trim() ||
		process.env.ZALO_WEBHOOK_SECRET?.trim() ||
		null
	);
}

export function zaloApiGoc(): string {
	return process.env.ZALO_API_URL?.trim().replace(/\/+$/, "") || ZALO.api;
}

export async function zaloGoi(
	fetcher: typeof fetch,
	token: string,
	method: string,
	body: Record<string, string>,
): Promise<unknown> {
	const res = await fetcher(`${zaloApiGoc()}/bot${token}/${method}`, {
		method: "POST",
		headers: { "Content-Type": "application/json; charset=utf-8" },
		body: JSON.stringify(body),
	});
	if (!res.ok && res.status !== ZALO.http.hetTin) {
		throw new Error(`Zalo ${method} tra HTTP ${res.status}.`);
	}
	return res.json();
}

export async function guiZalo(
	token: string,
	chatId: string,
	text: string,
	chon: { fetcher?: typeof fetch } = {},
): Promise<{ messageId: string }> {
	return parseZaloSend(
		await zaloGoi(chon.fetcher ?? fetch, token, "sendMessage", {
			chat_id: chatId,
			text,
		}),
	);
}

export async function zaloGoiTho(
	fetcher: typeof fetch,
	token: string,
	method: string,
	body: Record<string, string>,
): Promise<{ status: number; than: unknown }> {
	const res = await fetcher(`${zaloApiGoc()}/bot${token}/${method}`, {
		method: "POST",
		headers: { "Content-Type": "application/json; charset=utf-8" },
		body: JSON.stringify(body),
	});
	const than: unknown = await res.json().catch(() => null);
	return { status: res.status, than };
}
