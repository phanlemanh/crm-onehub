import { afterAll, beforeEach, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { kenhSeDungCua } from "@crm/db/kenh-thong-bao";
import { SETTINGS_ID } from "@crm/db/settings";
import { vanTay, ZALO_GETME } from "@crm/db/zalo-getme";
import { suKienGetMe } from "@crm/validation/zalo-getme";
import { khungUngDungMessages } from "../../app/lib/messages/khung-ung-dung";
import { nhacQuaZaloMessages } from "../../app/lib/messages/nhac-qua-zalo";
import {
	capabilities,
	capabilitiesMarkdown,
	logCapabilities,
} from "../agent/lib/capabilities";
import { zaloGoiTho } from "../agent/lib/zalo-api";
import { kiemBot } from "../agent/lib/zalo-bot";
import { datBot } from "../agent/lib/zalo-bot-xuong";
import { ZALO } from "../agent/lib/zalo-config";
import { type PhanGetMe, phanLopGetMe } from "../agent/lib/zalo-getme";
import { nhanWebhook } from "../agent/lib/zalo-webhook";
import { donDep, gieoNguoi, moXuong, TIEN_TO } from "./support/nhac-gieo";
import { zaloGia } from "./support/zalo-gia";
import { thanWebhook, yeuCauWebhook } from "./support/zalo-tin";
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
	await db.zaloLink.deleteMany({
		where: { crmUserId: { startsWith: TIEN_TO } },
	});
	await donDep();
});

const GOC = new Date("2026-10-10T02:00:00Z");

async function nguoiDaNoi(): Promise<string> {
	await moXuong();
	const U = await gieoNguoi("Zalo Vá");
	await db.zaloLink.create({
		data: { crmUserId: U.id, zaloUserId: `Z-${U.id}`, zaloDisplayName: "Vá" },
	});
	return U.id;
}

async function kenhCua(userId: string) {
	return (await kenhSeDungCua(db, userId, { coToken: true })).kenh;
}

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

describe("kiem-tam", () => {
	test("kiem-tam: ma tran 11 dang", () => {
		expect(BANG_TAM.length).toBe(SO_TAM);
	});

	for (const d of BANG_TAM) {
		test(`kiem-tam: ${d.ten}`, async () => {
			await datCotCu();
			const U = await nguoiDaNoi();
			const z = zaloGia(d.chon);
			const tt = await kiemBot({ fetcher: z.fetcher, now: () => GOC });
			expect(tt).toBe("loi");
			const s = await docCot();
			expect(
				{ ten: s?.zaloBotName, url: s?.zaloWebhookUrl },
				`kiem-tam: ${d.ten} xoa ten bot`,
			).toEqual({ ten: COT_CU.zaloBotName, url: COT_CU.zaloWebhookUrl });
			expect(await kenhCua(U), `kiem-tam: ${d.ten} nhac roi khoi zalo`).toBe(
				"zalo",
			);
		});
	}
});

describe("kiem-tu-choi", () => {
	test("kiem-tu-choi: ma tran 8 dang", () => {
		expect(BANG_TU_CHOI.length).toBe(SO_TU_CHOI);
	});

	for (const d of BANG_TU_CHOI) {
		test(`kiem-tu-choi: ${d.ten}`, async () => {
			await datCotCu();
			const U = await nguoiDaNoi();
			const z = zaloGia(d.chon);
			expect(await kiemBot({ fetcher: z.fetcher, now: () => GOC })).toBe("loi");
			const s = await docCot();
			expect(
				{ ten: s?.zaloBotName ?? null, url: s?.zaloWebhookUrl ?? null },
				`kiem-tu-choi: ${d.ten} van giu ten bot`,
			).toEqual({ ten: null, url: null });
			expect(await kenhCua(U)).not.toBe("zalo");
		});
	}

	test("kiem-tu-choi: doi chung duong, getMe 200 giu bot va kenh zalo", async () => {
		await datCotCu();
		const U = await nguoiDaNoi();
		const z = zaloGia({
			tenBot: "Bot Mới",
			webhookInfo: { url: COT_CU.zaloWebhookUrl },
		});
		expect(await kiemBot({ fetcher: z.fetcher, now: () => GOC })).toBe("song");
		expect((await docCot())?.zaloBotName).toBe("Bot Mới");
		expect(await kenhCua(U)).toBe("zalo");
	});
});

describe("su-kien", () => {
	const TAT_CA = [
		...BANG_TAM.map((d) => ({ d, ketLuan: "tam-loi" as const })),
		...BANG_TU_CHOI.map((d) => ({ d, ketLuan: "token-sai" as const })),
	];

	test("su-kien: ma tran 2 noi x 19 dang", () => {
		expect(TAT_CA.length * 2).toBe(2 * (SO_TAM + SO_TU_CHOI));
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

	for (const { d, ketLuan } of TAT_CA) {
		test(`su-kien: kiem-bot ${d.ten}`, async () => {
			await datCotCu();
			const z = zaloGia(d.chon);
			await kiemBot({ fetcher: z.fetcher, now: () => GOC });
			expect(
				await suKienMoi(),
				`su-kien: kiem-bot ${d.ten} khong co hang`,
			).toEqual([
				{
					noi: "kiem-bot",
					lop: d.lop,
					http: d.http,
					maThan: d.maThan,
					ketLuan,
					vanTay: vanTay(COT_CU.zaloBotToken),
				},
			]);
		});
	}

	test("su-kien: kiem-bot getMe 200 khong ghi hang", async () => {
		await datCotCu();
		const z = zaloGia({ webhookInfo: { url: COT_CU.zaloWebhookUrl } });
		await kiemBot({ fetcher: z.fetcher, now: () => GOC });
		expect(await suKienMoi()).toEqual([]);
	});

	test("su-kien: kiem-bot ghi hong van tra loi va giu bot", async () => {
		await datCotCu();
		const z = zaloGia({ getMe: 500 });
		const tt = await kiemBot({
			fetcher: z.fetcher,
			now: () => GOC,
			ghi: async () => {
				throw new Error("db hong");
			},
		});
		expect(tt).toBe("loi");
		expect((await docCot())?.zaloBotName).toBe(COT_CU.zaloBotName);
	});

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

const KHOA_WEBHOOK = "khoa-webhook-du-dai";

function chuoiCuaLoi(): string[] {
	return Object.values(ZALO.loi).map((v) =>
		String(v instanceof Function ? v("Bot", "08:30") : v),
	);
}

function nhanDieuHuongKhac(): string[] {
	const k = khungUngDungMessages("vi");
	return [...Object.values(k.rail), k.header.homepage, k.header.accountMenu];
}

describe("cau-chao", () => {
	test("cau-chao: nguoi chua noi nhan bot thi nhan dung cau huong dan", async () => {
		const z = zaloGia();
		const than = JSON.stringify(
			thanWebhook({ messageId: "cc-1", fromId: "ZCC", text: "xin chào" }),
		);
		const res = await nhanWebhook(yeuCauWebhook(than, KHOA_WEBHOOK).request, {
			fetcher: z.fetcher,
			now: () => GOC,
			env: { token: TOK, khoa: KHOA_WEBHOOK },
		});
		expect(res.status).toBe(200);
		expect(z.guiToi("ZCC").map((g) => g.body.text)).toEqual([
			ZALO.loi.huongDan,
		]);
	});

	test("cau-chao: cau huong dan chi toi Nhắc buổi sáng va nut Nối Zalo", () => {
		const cau = ZALO.loi.huongDan;
		const nhan = khungUngDungMessages("vi").header.nhacBuoiSang;
		const nut = nhacQuaZaloMessages("vi").khoiZalo.noi;
		expect(cau.includes(nhan), "cau-chao: thieu nhan Nhắc buổi sáng").toBe(
			true,
		);
		expect(cau.includes(nut), "cau-chao: thieu nhan nut Nối Zalo").toBe(true);
		const viTri = cau.indexOf(nhan);
		for (const khac of nhanDieuHuongKhac()) {
			const o = cau.indexOf(khac);
			expect(
				o < 0 || o > viTri,
				`cau-chao: nhan ${khac} dung truoc Nhắc buổi sáng`,
			).toBe(true);
		}
	});

	test("cau-chao: doi chung, nhan Cài đặt chen truoc thi bi bat", () => {
		const nhan = khungUngDungMessages("vi").header.nhacBuoiSang;
		const sai = `mở Cài đặt › ${nhan}`;
		const viTri = sai.indexOf(nhan);
		const bat = nhanDieuHuongKhac().some((k) => {
			const o = sai.indexOf(k);
			return o >= 0 && o < viTri;
		});
		expect(bat).toBe(true);
	});

	test("cau-chao: khong cau nao cua bot con chu Thông báo của bạn", () => {
		for (const chu of chuoiCuaLoi()) {
			expect(
				chu.includes("Thông báo của bạn"),
				`cau-chao: con chu Thông báo của bạn: ${chu}`,
			).toBe(false);
		}
	});
});

type CauHinhToken = {
	ten: string;
	caiDat: string | null;
	bien: string | null;
	bat: boolean;
};

const CAU_HINH: readonly CauHinhToken[] = [
	{ ten: "chi-cai-dat", caiDat: "111:cai-dat", bien: null, bat: true },
	{ ten: "chi-bien", caiDat: null, bien: "222:bien", bat: true },
	{ ten: "ca-hai", caiDat: "111:cai-dat", bien: "222:bien", bat: true },
	{ ten: "khong", caiDat: null, bien: null, bat: false },
];

async function voiToken<T>(
	o: CauHinhToken,
	chay: () => Promise<T>,
): Promise<T> {
	const cu = process.env.ZALO_BOT_TOKEN;
	const cuKhac = process.env.PERPLEXITY_API_KEY;
	process.env.PERPLEXITY_API_KEY = "khoa-gia-de-co-muc-available";
	await db.appSetting.update({
		where: { id: SETTINGS_ID },
		data: { zaloBotToken: o.caiDat },
	});
	if (o.bien === null) delete process.env.ZALO_BOT_TOKEN;
	else process.env.ZALO_BOT_TOKEN = o.bien;
	try {
		return await chay();
	} finally {
		if (cu === undefined) delete process.env.ZALO_BOT_TOKEN;
		else process.env.ZALO_BOT_TOKEN = cu;
		if (cuKhac === undefined) delete process.env.PERPLEXITY_API_KEY;
		else process.env.PERPLEXITY_API_KEY = cuKhac;
	}
}

async function batLogRa(chay: () => Promise<unknown>): Promise<string[]> {
	const dong: string[] = [];
	const goc = console.log;
	console.log = (...m: unknown[]) => {
		dong.push(m.map(String).join(" "));
	};
	try {
		await chay();
	} finally {
		console.log = goc;
	}
	return dong;
}

describe("nang-luc", () => {
	test("nang-luc: ma tran 4 cau hinh token", () => {
		expect(CAU_HINH.length).toBe(4);
	});

	for (const o of CAU_HINH) {
		test(`nang-luc: ${o.ten}`, async () => {
			const { zalo, log, md } = await voiToken(o, async () => {
				const ds = await capabilities();
				const log = await batLogRa(() => logCapabilities());
				const md = await capabilitiesMarkdown();
				return { zalo: ds.find((c) => c.label === "Zalo reminders"), log, md };
			});
			expect(
				zalo?.enabled,
				o.ten === "chi-cai-dat"
					? "nang-luc: chi Cai dat van bao off"
					: `nang-luc: ${o.ten} sai trang thai`,
			).toBe(o.bat);
			expect(zalo?.from).toContain("ZALO_BOT_TOKEN");
			expect(zalo?.from).toContain("Settings");
			const dong = log.find((d) => d.includes("Zalo reminders")) ?? "";
			expect(
				dong.startsWith(o.bat ? "[agent] on " : "[agent] off"),
				`nang-luc: ${o.ten} log ${dong}`,
			).toBe(true);
			const viTriTat = md.indexOf("Not configured");
			const viTriBat = md.indexOf("- **Zalo reminders**");
			if (o.bat) {
				expect(
					viTriBat,
					`nang-luc: ${o.ten} khong o Available`,
				).toBeGreaterThanOrEqual(0);
				expect(viTriTat < 0 || viTriBat < viTriTat).toBe(true);
			} else {
				expect(viTriBat).toBe(-1);
				expect(md.indexOf("- Zalo reminders")).toBeGreaterThan(viTriTat);
			}
		});
	}
});
