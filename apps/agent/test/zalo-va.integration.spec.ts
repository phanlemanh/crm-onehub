import { afterAll, beforeEach, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { SETTINGS_ID } from "@crm/db/settings";
import { vanTay, ZALO_GETME } from "@crm/db/zalo-getme";
import { suKienGetMe } from "@crm/validation/zalo-getme";
import { zaloGoiTho } from "../agent/lib/zalo-api";
import { datBot } from "../agent/lib/zalo-bot-xuong";
import { ZALO } from "../agent/lib/zalo-config";
import { type PhanGetMe, phanLopGetMe } from "../agent/lib/zalo-getme";
import { zaloGia } from "./support/zalo-gia";
import {
	BANG_TAM,
	BANG_TU_CHOI,
	type DangGetMe,
	SO_TAM,
	SO_TU_CHOI,
} from "./support/zalo-va-bang";

const TOK = "777:zalo-va";
const TOK_MOI = "888:moi";
const GOC_HTTPS = new URL("https://tac-tu.test");
const COT_CU = {
	zaloBotToken: "111:cu",
	zaloWebhookSecret: "khoa-cu-du-dai",
	zaloBotName: "Bot cũ",
	zaloWebhookUrl: "https://cu.test/zalo/webhook",
	zaloWebhookLyDo: null,
} as const;

async function donZaloVa(): Promise<void> {
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
			zaloPolledAt: null,
		},
	});
}

async function datCotCu(): Promise<void> {
	await db.appSetting.update({ where: { id: SETTINGS_ID }, data: COT_CU });
}

async function docCot() {
	const s = await db.appSetting.findUnique({
		where: { id: SETTINGS_ID },
		select: {
			zaloBotToken: true,
			zaloWebhookSecret: true,
			zaloBotName: true,
			zaloWebhookUrl: true,
			zaloWebhookLyDo: true,
		},
	});
	return s;
}

async function suKienMoi() {
	const hang = await db.agentEvent.findMany({
		where: { sessionId: ZALO_GETME.phien, type: ZALO_GETME.loai },
		orderBy: { emittedAt: "asc" },
		select: { data: true },
	});
	return hang.map((h) => suKienGetMe.parse(h.data));
}

beforeEach(async () => {
	await donZaloVa();
});

afterAll(async () => {
	await donZaloVa();
});

async function phanQuaGia(d: DangGetMe): Promise<PhanGetMe | null> {
	const z = zaloGia(d.chon);
	try {
		return await zaloGoiTho(z.fetcher, TOK, "getMe", {});
	} catch {
		return null;
	}
}

describe("phan-lop", () => {
	test("phan-lop: ma tran viet truoc du 11 dang tam va 8 dang tu choi", () => {
		expect(BANG_TAM.length).toBe(SO_TAM);
		expect(BANG_TU_CHOI.length).toBe(SO_TU_CHOI);
	});

	for (const d of BANG_TAM) {
		test(`phan-lop: ${d.ten} la tam-loi`, async () => {
			expect(phanLopGetMe(await phanQuaGia(d)), `phan-lop: ${d.ten}`).toEqual({
				loai: "loi",
				loi: { lop: d.lop, http: d.http, maThan: d.maThan, ketLuan: "tam-loi" },
			});
		});
	}

	for (const d of BANG_TU_CHOI) {
		test(`phan-lop: ${d.ten} la token-sai`, async () => {
			expect(phanLopGetMe(await phanQuaGia(d)), `phan-lop: ${d.ten}`).toEqual({
				loai: "loi",
				loi: {
					lop: d.lop,
					http: d.http,
					maThan: d.maThan,
					ketLuan: "token-sai",
				},
			});
		});
	}

	test("phan-lop: doi chung duong, getMe 200 dung khuon la duoc", async () => {
		const z = zaloGia({ tenBot: "Bot OneHub" });
		expect(phanLopGetMe(await zaloGoiTho(z.fetcher, TOK, "getMe", {}))).toEqual(
			{
				loai: "duoc",
				tenBot: "Bot OneHub",
			},
		);
	});
});

describe("tam-loi", () => {
	test("tam-loi: ma tran 11 dang", () => {
		expect(BANG_TAM.length).toBe(SO_TAM);
	});

	for (const d of BANG_TAM) {
		test(`tam-loi: ${d.ten}`, async () => {
			await datCotCu();
			const z = zaloGia(d.chon);
			const ket = await datBot({ token: TOK_MOI }, GOC_HTTPS, {
				fetcher: z.fetcher,
			});
			expect(ket, `tam-loi: ${d.ten} bi bao token sai`).toEqual({
				outcome: "zalo-loi",
				reason: ZALO.loi.zaloKhongTraLoi,
			});
			expect(z.soGoi("setWebhook"), `tam-loi: ${d.ten} goi setWebhook`).toBe(0);
			expect(await docCot(), `tam-loi: ${d.ten} doi cot Zalo`).toEqual(COT_CU);
		});
	}
});

describe("token-sai", () => {
	test("token-sai: ma tran 8 dang", () => {
		expect(BANG_TU_CHOI.length).toBe(SO_TU_CHOI);
	});

	for (const d of BANG_TU_CHOI) {
		test(`token-sai: ${d.ten}`, async () => {
			await datCotCu();
			const z = zaloGia(d.chon);
			const ket = await datBot({ token: TOK_MOI }, GOC_HTTPS, {
				fetcher: z.fetcher,
			});
			expect(ket, `token-sai: ${d.ten} khong bi bao token sai`).toEqual({
				outcome: "invalid",
				reason: ZALO.loi.tokenSai,
			});
			expect(z.soGoi("setWebhook")).toBe(0);
			expect(await docCot()).toEqual(COT_CU);
		});
	}

	test("token-sai: doi chung duong, getMe 200 toi setWebhook", async () => {
		const z = zaloGia({ tenBot: "Bot Mới" });
		const ket = await datBot({ token: TOK_MOI }, GOC_HTTPS, {
			fetcher: z.fetcher,
		});
		expect(
			z.soGoi("setWebhook"),
			"token-sai: getMe 200 khong toi setWebhook",
		).toBe(1);
		expect(ket.outcome).toBe("valid");
	});
});

describe("su-kien", () => {
	const TAT_CA = [
		...BANG_TAM.map((d) => ({ d, ketLuan: "tam-loi" as const })),
		...BANG_TU_CHOI.map((d) => ({ d, ketLuan: "token-sai" as const })),
	];

	test("su-kien: ma tran 19 dang moi noi", () => {
		expect(TAT_CA.length).toBe(SO_TAM + SO_TU_CHOI);
	});

	for (const { d, ketLuan } of TAT_CA) {
		test(`su-kien: dat-bot ${d.ten}`, async () => {
			const z = zaloGia(d.chon);
			await datBot({ token: TOK_MOI }, GOC_HTTPS, { fetcher: z.fetcher });
			expect(await suKienMoi(), `su-kien: dat-bot ${d.ten}`).toEqual([
				{
					noi: "dat-bot",
					lop: d.lop,
					http: d.http,
					maThan: d.maThan,
					ketLuan,
					vanTay: vanTay(TOK_MOI),
				},
			]);
		});
	}

	test("su-kien: dat-bot getMe 200 khong ghi hang", async () => {
		const z = zaloGia({});
		await datBot({ token: TOK_MOI }, GOC_HTTPS, { fetcher: z.fetcher });
		expect(await suKienMoi()).toEqual([]);
	});

	test("su-kien: dat-bot ghi hong van tra dung ket qua", async () => {
		const z = zaloGia({ getMe: 401 });
		const ket = await datBot({ token: TOK_MOI }, GOC_HTTPS, {
			fetcher: z.fetcher,
			ghi: async () => {
				throw new Error("db hong");
			},
		});
		expect(ket).toEqual({ outcome: "invalid", reason: ZALO.loi.tokenSai });
	});
});
