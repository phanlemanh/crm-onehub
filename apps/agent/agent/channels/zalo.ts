import {
	datBotYeuCau,
	guiThuYeuCau,
	ZALO_CAU_NOI,
} from "@crm/validation/zalo-cau-noi";
import { type ChannelEvents, defineChannel, POST } from "eve/channels";
import { z } from "zod";
import { authorised } from "../lib/cau-noi-auth";
import { attribute, type PurposeContext } from "../lib/session-purpose";
import { cauKhoChoZalo } from "../lib/tai-lieu-hoi-zalo";
import { datBot, guiThu } from "../lib/zalo-bot-xuong";
import { ZALO } from "../lib/zalo-config";
import { chatCuaToken } from "../lib/zalo-hoi";
import {
	canHoiLai,
	capNhatToken,
	loiVe,
	type SuKienZalo,
	traLoiVe,
} from "../lib/zalo-tra-loi";
import { nhanWebhook } from "../lib/zalo-webhook";

function traVe(status: number): Response {
	return new Response(null, { status });
}

async function docThan(request: Request): Promise<unknown> {
	return request.json().catch(() => null);
}

const loiNhan = z
	.object({
		message: z.string().nullable().catch(null),
		finishReason: z.string().nullable().catch(null),
	})
	.catch({ message: null, finishReason: null });

function suKien(
	channel: { continuationToken?: string },
	ctx?: PurposeContext & { session: { id: string } },
): SuKienZalo {
	return {
		continuationToken: channel.continuationToken,
		hoiId: ctx ? attribute(ctx, "hoiId") : null,
		sessionId: ctx?.session.id ?? null,
	};
}

export const zaloEvents: ChannelEvents = {
	async "message.completed"(data, channel, ctx) {
		const { message, finishReason } = loiNhan.parse(data);
		if (finishReason === ZALO.hoi.giuaLuot) return;
		const sk = suKien(channel, ctx);
		const cauKho = await cauKhoChoZalo(sk.hoiId);
		const text = cauKho ?? message;
		if (!text?.trim()) return;
		await traLoiVe(sk, text);
	},
	async "input.requested"(_data, channel, ctx) {
		await canHoiLai(suKien(channel, ctx), (token) =>
			channel.setContinuationToken(token),
		);
	},
	async "turn.completed"(_data, channel, ctx) {
		await capNhatToken(suKien(channel, ctx));
	},
	async "turn.failed"(_data, channel, ctx) {
		const sk = suKien(channel, ctx);
		const cauKho = await cauKhoChoZalo(sk.hoiId);
		if (cauKho) {
			await traLoiVe(sk, cauKho);
			return;
		}
		await loiVe(sk);
	},
	async "session.failed"(_data, channel) {
		console.error(
			`[zalo] session.failed zaloChatId=${chatCuaToken(channel.continuationToken) ?? "?"}; tick dong cau qua han`,
		);
	},
};

export default defineChannel({
	routes: [
		POST(ZALO.webhook.duong, (request, { send, reset, waitUntil }) =>
			nhanWebhook(request, {
				hoi: {
					hoi: (y) =>
						send(y.text, {
							auth: y.auth,
							continuationToken: y.continuationToken,
						}),
					datLai: (continuationToken) =>
						reset({ continuationToken, reason: "mới" }),
					waitUntil,
				},
			}),
		),
		POST(ZALO_CAU_NOI.bot, async (request) => {
			if (!authorised(request)) return traVe(ZALO.http.chuaQuyen);
			const than = datBotYeuCau.safeParse(await docThan(request));
			if (!than.success) return traVe(ZALO.http.saiThan);
			return Response.json(await datBot(than.data, new URL(request.url)));
		}),
		POST(ZALO_CAU_NOI.guiThu, async (request) => {
			if (!authorised(request)) return traVe(ZALO.http.chuaQuyen);
			const than = guiThuYeuCau.safeParse(await docThan(request));
			if (!than.success) return traVe(ZALO.http.saiThan);
			return Response.json(await guiThu(than.data.userId));
		}),
	],
	events: zaloEvents,
});
