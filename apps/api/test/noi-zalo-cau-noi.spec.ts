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
import type { ChonZaloGia } from "../../agent/test/support/zalo-gia";
import { zaloMayChu } from "../../agent/test/support/zalo-may-chu";
import { mintPhien } from "./phien-thu";
import { donDep, gieoThanhVien, moXuong } from "./support/ke-hoach-gieo";

const BI_MAT = "bi-mat-cau-noi-that";
const TOKEN_T = "4242:that-su";
const DUONG_BOT = "/internal/zalo/bot";
const GOC_TAC_TU = "https://tac-tu.test";

type Bien = "AGENT_URL" | "AGENT_BRIDGE_SECRET" | "ZALO_API_URL";

let app: INestApplication;
const bienCu = new Map<Bien, string | undefined>(
	(["AGENT_URL", "AGENT_BRIDGE_SECRET", "ZALO_API_URL"] as const).map((k) => [
		k,
		process.env[k],
	]),
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
	expect(ds.length, "route cau noi dat bot mount dung mot").toBe(1);
	const r = ds[0];
	if (!r) throw new Error("thieu route dat bot");
	return r;
}

function dungMang(chon: ChonZaloGia) {
	const zalo = zaloMayChu(chon);
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
				throw new Error("route cau noi khong tra Response");
			}
			return traLoi;
		},
	});
	datBien("AGENT_URL", `http://127.0.0.1:${tacTu.port}`);
	datBien("AGENT_BRIDGE_SECRET", BI_MAT);
	datBien("ZALO_API_URL", zalo.url);
	dung.push(() => {
		tacTu.stop(true);
		zalo.dung();
	});
	return zalo;
}

async function luuBot(userId: string, token: string) {
	const { cookie } = await mintPhien(userId);
	return request(app.getHttpServer())
		.post("/api/trpc/zalo.luuBot")
		.set("cookie", cookie)
		.set("content-type", "application/json")
		.send(JSON.stringify({ token }));
}

async function tokenDangLuu(): Promise<string | null> {
	const s = await db.appSetting.findUnique({ where: { id: SETTINGS_ID } });
	return s?.zaloBotToken ?? null;
}

async function donCot(): Promise<void> {
	await db.appSetting.updateMany({
		where: { id: SETTINGS_ID },
		data: {
			zaloBotName: null,
			zaloBotToken: null,
			zaloWebhookSecret: null,
			zaloWebhookUrl: null,
			zaloWebhookLyDo: null,
		},
	});
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

describe("cau-noi-that", () => {
	test("cau-noi-that: a luuBot qua API toi handler that cua tac tu -> getMe bang T, mot setWebhook, luu T", async () => {
		const Q = await gieoThanhVien("Quan Tri Cau That", "admin");
		const zalo = dungMang({});
		const res = await luuBot(Q.id, TOKEN_T);
		const getMe = zalo.goi.filter((g) => g.method === "getMe");
		expect(
			{
				status: res.status,
				getMeToken: getMe.map((g) => g.token),
				setWebhook: zalo.soGoi("setWebhook"),
				luu: await tokenDangLuu(),
			},
			"API gui dung token tac tu doc",
		).toEqual({
			status: 200,
			getMeToken: [TOKEN_T],
			setWebhook: 1,
			luu: TOKEN_T,
		});
	});

	test("cau-noi-that: b getMe 401 -> loi yeu cau mang cau cua tac tu, khong setWebhook, khong luu", async () => {
		const Q = await gieoThanhVien("Quan Tri Cau Sai", "admin");
		const zalo = dungMang({ getMe: 401 });
		const truoc = await tokenDangLuu();
		const res = await luuBot(Q.id, "12345:abc");
		expect({
			status: res.status,
			loi: String(res.body?.error?.message ?? ""),
			setWebhook: zalo.soGoi("setWebhook"),
			luu: await tokenDangLuu(),
		}).toEqual({
			status: 400,
			loi: "Zalo không nhận token này.",
			setWebhook: 0,
			luu: truoc,
		});
	});
});
