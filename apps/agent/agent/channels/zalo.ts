import {
	datBotYeuCau,
	guiThuYeuCau,
	ZALO_CAU_NOI,
} from "@crm/validation/zalo-cau-noi";
import { defineChannel, POST } from "eve/channels";
import { authorised } from "../lib/cau-noi-auth";
import { datBot, guiThu } from "../lib/zalo-bot-xuong";
import { ZALO } from "../lib/zalo-config";
import { nhanWebhook } from "../lib/zalo-webhook";

function traVe(status: number): Response {
	return new Response(null, { status });
}

async function docThan(request: Request): Promise<unknown> {
	return request.json().catch(() => null);
}

export default defineChannel({
	routes: [
		POST(ZALO.webhook.duong, (request) => nhanWebhook(request)),
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
});
