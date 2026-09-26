import { z } from "zod";
import { ZALO } from "../../agent/lib/zalo-config";
import tinGoc from "../fixtures/zalo-tin-that.json";

const khuonGoc = z.object({
	ok: z.literal(true),
	result: z.object({
		message: z.looseObject({
			chat: z.looseObject({ id: z.string(), chat_type: z.string() }),
			text: z.string().optional(),
			message_id: z.string(),
			date: z.number(),
			from: z.looseObject({
				id: z.string(),
				is_bot: z.boolean(),
				display_name: z.string(),
			}),
		}),
		event_name: z.string(),
	}),
	error_code: z.number(),
});

const HEADER_ZALO = "X-Bot-Api-Secret-Token";

type KhuonGoc = z.infer<typeof khuonGoc>;
type TinZaloThat = KhuonGoc["result"]["message"];

export type ChonTin = {
	messageId: string;
	fromId: string;
	ten?: string;
	text?: string | null;
	chatType?: string;
	isBot?: boolean;
	photo?: string;
	eventName?: string;
	sticker?: string;
	photoUrl?: string;
	caption?: string;
};

function goc(): KhuonGoc {
	return khuonGoc.parse(structuredClone(tinGoc));
}

export function tinThat(chon: ChonTin): TinZaloThat {
	const message = goc().result.message;
	message.message_id = chon.messageId;
	message.from.id = chon.fromId;
	message.chat.id = chon.fromId;
	if (chon.ten !== undefined) message.from.display_name = chon.ten;
	if (chon.chatType !== undefined) message.chat.chat_type = chon.chatType;
	if (chon.isBot !== undefined) message.from.is_bot = chon.isBot;
	if (chon.text === null) delete message.text;
	else if (chon.text !== undefined) message.text = chon.text;
	const them: Record<string, string> = {};
	if (chon.photo !== undefined) them.photo = chon.photo;
	if (chon.sticker !== undefined) them.sticker = chon.sticker;
	if (chon.photoUrl !== undefined) them.photo_url = chon.photoUrl;
	if (chon.caption !== undefined) them.caption = chon.caption;
	return { ...message, ...them };
}

export function thanGetUpdates(chon: ChonTin): KhuonGoc {
	const than = goc();
	than.result.message = tinThat(chon);
	return than;
}

export type ThanWebhookCoVo = {
	ok: true;
	result: { event_name: string; message: TinZaloThat };
};

export type ThanWebhook = ThanWebhookCoVo["result"];

export function thanWebhookCoVo(chon: ChonTin): ThanWebhookCoVo {
	const than = thanGetUpdates(chon);
	return {
		ok: true,
		result: {
			event_name: chon.eventName ?? than.result.event_name,
			message: than.result.message,
		},
	};
}

export function thanWebhook(chon: ChonTin): ThanWebhook {
	return thanWebhookCoVo(chon).result;
}

export type YeuCauGia = { request: Request; soLanKeo: () => number };

export function yeuCauWebhook(than: string, header: string | null): YeuCauGia {
	let keo = 0;
	const headers = new Headers({ "content-type": "application/json" });
	if (header !== null) headers.set(HEADER_ZALO, header);
	const request = new Request(`http://tac-tu${ZALO.webhook.duong}`, {
		method: "POST",
		headers,
		body: new ReadableStream(
			{
				pull(dieuKhien) {
					keo += 1;
					dieuKhien.enqueue(new TextEncoder().encode(than));
					dieuKhien.close();
				},
			},
			{ highWaterMark: 0 },
		),
		duplex: "half",
	});
	return { request, soLanKeo: () => keo };
}
