import { parseZaloSend } from "@crm/validation/zalo-update";
import { ZALO } from "./zalo-config";

export function zaloToken(): string | null {
	return process.env.ZALO_BOT_TOKEN?.trim() || null;
}

export function zaloKhoaWebhook(): string | null {
	return process.env.ZALO_WEBHOOK_SECRET?.trim() || null;
}

export async function zaloGoi(
	fetcher: typeof fetch,
	token: string,
	method: string,
	body: Record<string, string>,
): Promise<unknown> {
	const res = await fetcher(`${ZALO.api}/bot${token}/${method}`, {
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
