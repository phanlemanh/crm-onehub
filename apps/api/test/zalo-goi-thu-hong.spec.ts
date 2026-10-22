import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { SETTINGS_ID } from "@crm/db/settings";
import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import kenhZalo from "../../agent/agent/channels/zalo";
import { kiemBot } from "../../agent/agent/lib/zalo-bot";
import type { ChonZaloGia } from "../../agent/test/support/zalo-gia";
import { zaloMayChu } from "../../agent/test/support/zalo-may-chu";
import { mintPhien } from "./phien-thu";
import { donDep, gieoThanhVien, moXuong } from "./support/ke-hoach-gieo";

const BI_MAT = "bi-mat-goi-thu-hong-api";
const DUONG_BOT = "/internal/zalo/bot";
const GOC_TAC_TU = "https://tac-tu.test";
const TOKEN_CU = "5151:bot-cu";
const TOKEN_MOI = "4242:bot-moi";
const TEN_CU = "Bot Cũ";
const TEN_MOI = "Bot Mới";
const URL_CU = "https://u-cu.test/zalo/webhook";
const URL_ZALO = "https://u-zalo.test/zalo/webhook";
const GOI_TOKEN_KY_TU = 4;

type Bien =
	| "AGENT_URL"
	| "AGENT_BRIDGE_SECRET"
	| "ZALO_API_URL"
	| "ZALO_BOT_TOKEN"
	| "ZALO_WEBHOOK_SECRET";
const TEN_BIEN: Bien[] = [
	"AGENT_URL",
	"AGENT_BRIDGE_SECRET",
	"ZALO_API_URL",
	"ZALO_BOT_TOKEN",
	"ZALO_WEBHOOK_SECRET",
];

let app: INestApplication;
const bienCu = new Map<Bien, string | undefined>(
	TEN_BIEN.map((k) => [k, process.env[k]]),
);
const dung: (() => void)[] = [];

function datBien(k: Bien, v: string | undefined): void {
	if (v === undefined) delete process.env[k];
	else process.env[k] = v;
}

function route() {
	const ds = kenhZalo.routes.filter(
		(r) => r.method === "POST" && r.path === DUONG_BOT,
	);
	expect(ds.length, "route dat bot mount dung mot").toBe(1);
	const r = ds[0];
	if (!r) throw new Error("thieu route dat bot");
	return r;
}

function dungMang(chon: ChonZaloGia) {
	const zalo = zaloMayChu({ tenBot: TEN_MOI, ...chon });
	const handler = route().handler;
	const tacTu = Bun.serve({
		port: 0,
		hostname: "127.0.0.1",
		fetch: async (req) => {
			const traLoi = await handler(
				new Request(`${GOC_TAC_TU}${new URL(req.url).pathname}`, req),
				{} as never,
			);
			if (!(traLoi instanceof Response)) {
				throw new Error("route dat bot khong tra Response");
			}
			return traLoi;
		},
	});
	datBien("AGENT_URL", `http://127.0.0.1:${tacTu.port}`);
	datBien("AGENT_BRIDGE_SECRET", BI_MAT);
	datBien("ZALO_API_URL", zalo.url);
	datBien("ZALO_BOT_TOKEN", "");
	datBien("ZALO_WEBHOOK_SECRET", "");
	dung.push(() => {
		tacTu.stop(true);
		zalo.dung();
	});
	return zalo;
}

async function gieoBotCu(): Promise<void> {
	const data = {
		zaloBotToken: TOKEN_CU,
		zaloWebhookSecret: "khoa-cu-du-dai-8",
		zaloBotName: TEN_CU,
		zaloWebhookUrl: URL_CU,
		zaloWebhookLyDo: null,
	};
	await db.appSetting.upsert({
		where: { id: SETTINGS_ID },
		create: { id: SETTINGS_ID, ...data },
		update: data,
	});
}

async function donCot(): Promise<void> {
	await db.appSetting.updateMany({
		where: { id: SETTINGS_ID },
		data: {
			zaloBotName: null,
			zaloPolledAt: null,
			zaloBotToken: null,
			zaloWebhookSecret: null,
			zaloWebhookUrl: null,
			zaloWebhookLyDo: null,
		},
	});
}

async function luuBot(cookie: string, token: string) {
	return request(app.getHttpServer())
		.post("/api/trpc/zalo.luuBot")
		.set("cookie", cookie)
		.set("content-type", "application/json")
		.send(JSON.stringify({ token }));
}

async function xuong(cookie: string) {
	return request(app.getHttpServer())
		.get("/api/trpc/zalo.xuong")
		.set("cookie", cookie);
}

beforeAll(async () => {
	await moXuong();
	const { AppModule } = await import("../src/app.module");
	const modul: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();
	app = modul.createNestApplication({ bodyParser: false });
	await app.listen(0, "127.0.0.1");
});

afterEach(async () => {
	for (const d of dung.splice(0)) d();
	for (const [k, v] of bienCu) datBien(k, v);
	await donCot();
});

afterAll(async () => {
	await app.close();
	await donDep();
});

describe("goi-thu-hong-api", () => {
	test("goi-thu-hong-api: luuBot token moi goi thu hong -> thanh cong, sau nhip xuong van canh bao", async () => {
		const Q = await gieoThanhVien("Quan Tri Goi Thu Hong", "admin");
		const { cookie } = await mintPhien(Q.id);
		await gieoBotCu();
		dungMang({
			setWebhook: { outcome: "webhook.failed" },
			webhookInfo: { url: URL_ZALO },
		});
		const luu = await luuBot(cookie, TOKEN_MOI);
		const trangThaiNhip = await kiemBot();
		const x = await xuong(cookie);
		const duLieu = x.body?.result?.data;
		expect(
			{
				luuStatus: luu.status,
				luu: luu.body?.result?.data ?? null,
				nhip: trangThaiNhip,
				xuongStatus: x.status,
				tenBot: duLieu?.tenBot ?? null,
				goiToken: duLieu?.goiToken ?? null,
				trangThai: duLieu?.webhook?.trangThai ?? null,
				coToken:
					JSON.stringify(luu.body).includes(TOKEN_MOI) ||
					JSON.stringify(x.body).includes(TOKEN_MOI),
			},
			"canh bao con sau nhip",
		).toEqual({
			luuStatus: 200,
			luu: { tenBot: TEN_MOI, webhook: "zalo-tu-choi" },
			nhip: "song",
			xuongStatus: 200,
			tenBot: TEN_MOI,
			goiToken: TOKEN_MOI.slice(-GOI_TOKEN_KY_TU),
			trangThai: "chua-dang-ky",
			coToken: false,
		});
	});

	test("goi-thu-hong-api: doi chung, setWebhook ok-false -> loi yeu cau, xuong van bot cu da-dang-ky", async () => {
		const Q = await gieoThanhVien("Quan Tri Tu Choi", "admin");
		const { cookie } = await mintPhien(Q.id);
		await gieoBotCu();
		dungMang({ setWebhook: "ok-false" });
		const luu = await luuBot(cookie, TOKEN_MOI);
		const x = await xuong(cookie);
		const duLieu = x.body?.result?.data;
		expect(
			{
				luuStatus: luu.status,
				tenBot: duLieu?.tenBot ?? null,
				trangThai: duLieu?.webhook?.trangThai ?? null,
			},
			"Zalo tu choi thi bot cu giu nguyen",
		).toEqual({ luuStatus: 400, tenBot: TEN_CU, trangThai: "da-dang-ky" });
	});
});
