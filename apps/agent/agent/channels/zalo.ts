import { defineChannel, POST } from "eve/channels";
import { ZALO } from "../lib/zalo-config";
import { nhanWebhook } from "../lib/zalo-webhook";

export default defineChannel({
	routes: [POST(ZALO.webhook.duong, (request) => nhanWebhook(request))],
});
