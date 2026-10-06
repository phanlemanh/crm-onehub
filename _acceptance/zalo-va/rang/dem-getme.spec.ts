import { afterAll, beforeEach, describe, expect, test } from "bun:test";
import { join } from "node:path";
import { kiemBot } from "../../../apps/agent/agent/lib/zalo-bot.ts";
import { datBot } from "../../../apps/agent/agent/lib/zalo-bot-xuong.ts";
import {
	ghiGetMeLoi,
	type LoiGetMe,
} from "../../../apps/agent/agent/lib/zalo-getme.ts";
import { zaloGia } from "../../../apps/agent/test/support/zalo-gia.ts";
import { db } from "../../../packages/db/src/index.ts";
import { ngayVN } from "../../../packages/db/src/onboarding-nhac.ts";
import { SETTINGS_ID } from "../../../packages/db/src/settings.ts";
import { ZALO_GETME } from "../../../packages/db/src/zalo-getme.ts";

const SCRIPT = join(import.meta.dir, "dem-getme.ts");
const GOC = new URL("https://tac-tu.test");
const T1 = "101:mot";
const T2 = "202:hai";
const T3 = "303:ba";
const LUI_NGOAI_KY_MS = 10 * 24 * 60 * 60 * 1000;

async function don(): Promise<void> {
	await db.agentEvent.deleteMany({ where: { sessionId: ZALO_GETME.phien } });
	await db.appSetting.upsert({
		where: { id: SETTINGS_ID },
		create: { id: SETTINGS_ID },
		update: {
			zaloBotToken: null,
			zaloWebhookSecret: null,
			zaloBotName: null,
			zaloWebhookUrl: null,
			zaloWebhookLyDo: null,
		},
	});
}

async function datToken(token: string | null): Promise<void> {
	await db.appSetting.update({
		where: { id: SETTINGS_ID },
		data: { zaloBotToken: token },
	});
}

async function chay(): Promise<string[]> {
	const homNay = ngayVN(new Date());
	const p = Bun.spawn(["bun", SCRIPT, "--tu", homNay, "--den", homNay], {
		env: { ...process.env, ZALO_BOT_TOKEN: "" },
		stdout: "pipe",
		stderr: "pipe",
	});
	const [ra, ma] = await Promise.all([new Response(p.stdout).text(), p.exited]);
	expect(ma, `dem: thoat 0 ${await new Response(p.stderr).text()}`).toBe(0);
	return ra.trim().split("\n");
}

async function soHang(): Promise<number> {
	return db.agentEvent.count({ where: { sessionId: ZALO_GETME.phien } });
}

beforeEach(async () => {
	await don();
});

afterAll(async () => {
	await don();
});

describe("dem", () => {
	test("dem: dem theo ket luan va lop, bo hang ngoai ky, khong ghi", async () => {
		await datToken(T1);
		for (let i = 0; i < 3; i++) {
			await kiemBot({
				fetcher: zaloGia({ getMeTho: { http: 429, than: { ma: 429 } } })
					.fetcher,
			});
		}
		await datBot({ token: T1 }, GOC, {
			fetcher: zaloGia({ getMe: "mang" }).fetcher,
		});
		await datBot({ token: T1 }, GOC, {
			fetcher: zaloGia({ getMe: 401 }).fetcher,
		});
		await datBot({ token: T1 }, GOC, {
			fetcher: zaloGia({ getMe: 401 }).fetcher,
		});
		await datBot({ token: T1 }, GOC, {
			fetcher: zaloGia({ getMe: "mang" }).fetcher,
		});
		const cu = await db.agentEvent.findFirstOrThrow({
			where: {
				sessionId: ZALO_GETME.phien,
				data: { path: ["lop"], equals: "mang" },
			},
		});
		await db.agentEvent.update({
			where: { id: cu.id },
			data: { emittedAt: new Date(Date.now() - LUI_NGOAI_KY_MS) },
		});
		await datToken(T3);
		const truoc = await soHang();
		expect(await chay(), "dem: tam-loi 5").toEqual([
			"tam-loi: 4",
			"token-sai: 2",
			"lop tam-loi http-429: 3",
			"lop tam-loi mang: 1",
			"lop token-sai http-401: 2",
			"token-sai mang ma tam: 0",
			"token-sai tren token dang chay: 0",
		]);
		expect(await soHang(), "dem: bo dem ghi hang").toBe(truoc);
	});

	test("dem: token tung bi bao sai roi duoc Zalo nhan la nguong chet", async () => {
		await datBot({ token: T2 }, GOC, {
			fetcher: zaloGia({ getMe: 401 }).fetcher,
		});
		const ket = await datBot({ token: T2 }, GOC, {
			fetcher: zaloGia({}).fetcher,
		});
		expect(ket.outcome).toBe("valid");
		expect(
			(await chay()).at(-1),
			"dem: token-sai tren token dang chay khong duoc dem",
		).toBe("token-sai tren token dang chay: 1");
		await datToken(T3);
		expect((await chay()).at(-1)).toBe("token-sai tren token dang chay: 0");
	});

	const MA_TAM: readonly (Omit<LoiGetMe, "ketLuan"> & { ten: string })[] = [
		{ ten: "http-408", lop: "http-408", http: 408, maThan: null },
		{ ten: "http-429", lop: "http-429", http: 429, maThan: null },
		{ ten: "http-500", lop: "http-500", http: 500, maThan: null },
		{ ten: "http-502", lop: "http-502", http: 502, maThan: null },
		{ ten: "http-503", lop: "http-503", http: 503, maThan: null },
		{ ten: "http-599", lop: "http-599", http: 599, maThan: null },
		{ ten: "ok-false-408", lop: "ok-false-408", http: 200, maThan: 408 },
		{ ten: "ok-false-429", lop: "ok-false-429", http: 200, maThan: 429 },
		{ ten: "ok-false-500", lop: "ok-false-500", http: 200, maThan: 500 },
		{ ten: "http-400+429", lop: "http-400", http: 400, maThan: 429 },
	];

	test("dem: ma tran 10 ma tam viet truoc", () => {
		expect(MA_TAM.length).toBe(10);
	});

	for (const o of MA_TAM) {
		test(`dem: ma tam ${o.ten}`, async () => {
			await ghiGetMeLoi("dat-bot", T1, {
				lop: o.lop,
				http: o.http,
				maThan: o.maThan,
				ketLuan: "token-sai",
			});
			expect(
				(await chay()).find((d) => d.startsWith("token-sai mang ma tam")),
				`dem: ma tam ${o.ten} khong duoc dem`,
			).toBe("token-sai mang ma tam: 1");
		});
	}
});
