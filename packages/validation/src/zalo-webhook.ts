import { z } from "zod";
import { type ZaloMessage, zaloMessage } from "./zalo-update";

const tinWebhook = z.object({ event_name: z.string(), message: zaloMessage });

const coVo = z.object({ ok: z.literal(true), result: tinWebhook });

export type ZaloTinWebhook = { message: ZaloMessage; eventName: string };

const doiTuong = z.record(z.string(), z.unknown());

function khoaCua(value: unknown): string[] {
	const ket = doiTuong.safeParse(value);
	return ket.success ? Object.keys(ket.data) : [];
}

export function parseZaloWebhook(value: unknown): ZaloTinWebhook {
	const that = tinWebhook.safeParse(value);
	if (that.success) {
		return { message: that.data.message, eventName: that.data.event_name };
	}
	const vo = coVo.safeParse(value);
	if (vo.success) {
		return {
			message: vo.data.result.message,
			eventName: vo.data.result.event_name,
		};
	}
	const loi = khoaCua(value).includes("result") ? vo.error : that.error;
	throw new Error(`webhook tra hinh dang la: ${loi.message}`);
}

const trongVo = z.object({ result: z.object({ message: z.unknown() }) });

const trongThat = z.object({ message: z.unknown() });

function messageCua(value: unknown): unknown {
	const vo = trongVo.safeParse(value);
	if (vo.success) return vo.data.result.message;
	const that = trongThat.safeParse(value);
	return that.success ? that.data.message : undefined;
}

const maTin = z.object({ message_id: z.string().min(1) });

export type MoTaThanWebhook = {
	khoa: string[];
	khoaMessage: string[];
	messageId: string | null;
};

export function moTaThanWebhook(value: unknown): MoTaThanWebhook {
	const message = messageCua(value);
	const ma = maTin.safeParse(message);
	return {
		khoa: khoaCua(value),
		khoaMessage: khoaCua(message),
		messageId: ma.success ? ma.data.message_id : null,
	};
}
