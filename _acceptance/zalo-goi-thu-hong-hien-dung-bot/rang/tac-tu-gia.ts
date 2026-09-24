import { db } from "../../../packages/db/src/index.ts";
import { SETTINGS_ID } from "../../../packages/db/src/settings.ts";
import kenhZalo from "../../../apps/agent/agent/channels/zalo";
import { kiemBot } from "../../../apps/agent/agent/lib/zalo-bot";
import { zaloGia } from "../../../apps/agent/test/support/zalo-gia";
import { zaloMayChu } from "../../../apps/agent/test/support/zalo-may-chu";

const GOC_TAC_TU = "https://tac-tu.test";
const DUONG_BOT = "/internal/zalo/bot";
const TEN_MOI = "Bot Mới";
const URL_ZALO_GIU = `${GOC_TAC_TU}/zalo/webhook`;

function routeBot() {
	const r = kenhZalo.routes.find(
		(x) => x.method === "POST" && x.path === DUONG_BOT,
	);
	if (!r) throw new Error("thieu route dat bot");
	return r;
}

function phucVu(): void {
	const zalo = zaloMayChu({
		tenBot: TEN_MOI,
		setWebhook: { outcome: "webhook.failed" },
		webhookInfo: { url: URL_ZALO_GIU },
	});
	process.env.ZALO_API_URL = zalo.url;
	const handler = routeBot().handler;
	const tacTu = Bun.serve({
		port: Number(process.env.CONG_TAC_TU_GIA ?? 0),
		fetch: async (req) => {
			const traLoi = await handler(
				new Request(`${GOC_TAC_TU}${new URL(req.url).pathname}`, req),
				{} as never,
			);
			if (!(traLoi instanceof Response)) {
				return new Response("route khong tra Response", { status: 500 });
			}
			return traLoi;
		},
	});
	console.log(`AGENT_URL=http://127.0.0.1:${tacTu.port}`);
	console.log(`ZALO_API_URL=${zalo.url}`);
	const tat = () => {
		tacTu.stop(true);
		zalo.dung();
		process.exit(0);
	};
	process.on("SIGINT", tat);
	process.on("SIGTERM", tat);
}

async function nhip(): Promise<void> {
	const z = zaloGia({ tenBot: TEN_MOI, webhookInfo: { url: URL_ZALO_GIU } });
	const trangThai = await kiemBot({ fetcher: z.fetcher });
	const s = await db.appSetting.findUnique({
		where: { id: SETTINGS_ID },
		select: { zaloWebhookUrl: true, zaloWebhookLyDo: true },
	});
	console.log(
		`getWebhookInfo=${z.soGoi("getWebhookInfo")} url=${s?.zaloWebhookUrl ?? "null"} lyDo=${s?.zaloWebhookLyDo ?? "null"} kiemBot=${trangThai}`,
	);
	await db.$disconnect();
}

const lenh = process.argv[2];
if (lenh === "phuc-vu") phucVu();
else if (lenh === "nhip") await nhip();
else {
	console.error("dung: bun tac-tu-gia.ts phuc-vu | nhip");
	process.exit(2);
}
