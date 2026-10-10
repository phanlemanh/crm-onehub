import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	spyOn,
	test,
} from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { SETTINGS_ID } from "@crm/db/settings";
import { ghiSai, taoMaLienKet, ZALO_LIEN_KET } from "@crm/db/zalo-lien-ket";
import { z } from "zod";
import kenhZalo from "../agent/channels/zalo";
import { ZALO } from "../agent/lib/zalo-config";
import { dangKyWebhook, docThamSo } from "../agent/lib/zalo-dang-ky";
import { pollZalo, vongTay } from "../agent/lib/zalo-poll";
import { nhanWebhook } from "../agent/lib/zalo-webhook";
import dispatch from "../agent/schedules/dispatch";
import { donDep, gieoNguoi, moXuong, TIEN_TO } from "./support/nhac-gieo";
import { zaloGia } from "./support/zalo-gia";
import {
	type ChonTin,
	thanGetUpdates,
	thanWebhook,
	yeuCauWebhook,
} from "./support/zalo-tin";

const GOC = new Date("2026-10-10T02:00:00Z");
const TOKEN = "1:abc";
const KHOA = "khoa-webhook-du-dai";
const GIAY_TIN_DEN = 30;
const NHIP_CU = [0, 60, 120];
const HET_DONG_HO = 180;
const DUONG_HUA = "/zalo/webhook";

async function donZalo(): Promise<void> {
	await db.zaloUpdateSeen.deleteMany({});
	await db.zaloLinkAttempt.deleteMany({});
	await db.zaloLink.deleteMany({
		where: { crmUserId: { startsWith: TIEN_TO } },
	});
	await db.zaloLinkCode.deleteMany({
		where: { crmUserId: { startsWith: TIEN_TO } },
	});
	await db.appSetting.updateMany({
		where: { id: SETTINGS_ID },
		data: { zaloBotName: null, zaloPolledAt: null },
	});
}

function voiBien<T>(
	bien: Record<"ZALO_BOT_TOKEN" | "ZALO_WEBHOOK_SECRET", string | undefined>,
	chay: () => Promise<T>,
): Promise<T> {
	const cu = {
		ZALO_BOT_TOKEN: process.env.ZALO_BOT_TOKEN,
		ZALO_WEBHOOK_SECRET: process.env.ZALO_WEBHOOK_SECRET,
	};
	const dat = (ten: keyof typeof cu, giaTri: string | undefined) => {
		if (giaTri === undefined) delete process.env[ten];
		else process.env[ten] = giaTri;
	};
	dat("ZALO_BOT_TOKEN", bien.ZALO_BOT_TOKEN);
	dat("ZALO_WEBHOOK_SECRET", bien.ZALO_WEBHOOK_SECRET);
	return chay().finally(() => {
		dat("ZALO_BOT_TOKEN", cu.ZALO_BOT_TOKEN);
		dat("ZALO_WEBHOOK_SECRET", cu.ZALO_WEBHOOK_SECRET);
	});
}

async function botDangGhi() {
	return db.appSetting.findUnique({ where: { id: SETTINGS_ID } });
}

type DuongMang = { zalo: typeof fetch; khac: string[] };

function thayFetch(duong: DuongMang): () => void {
	const cu = globalThis.fetch;
	globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
		const url = String(input);
		if (url.startsWith(ZALO.api)) return duong.zalo(input, init);
		duong.khac.push(url);
		return new Response("", { status: 503 });
	}) as typeof fetch;
	return () => {
		globalThis.fetch = cu;
	};
}

async function chayNhipDispatch(): Promise<PromiseSettledResult<unknown>[]> {
	const viec: Promise<unknown>[] = [];
	await dispatch.run({
		receive: async () => ({}),
		waitUntil: (p: Promise<unknown>) => {
			viec.push(p);
		},
		appAuth: null,
	} as unknown as Parameters<typeof dispatch.run>[0]);
	return Promise.allSettled(viec);
}

async function gieoMa(luc: Date = GOC) {
	const U = await gieoNguoi("Uyen Webhook");
	const { ma } = await taoMaLienKet(db, U.id, luc);
	return { U, ma };
}

beforeEach(async () => {
	await moXuong();
	await donZalo();
});

afterAll(async () => {
	await donZalo();
	await donDep();
});

describe("kiem-bot", () => {
	let traLai: (() => void) | null = null;
	afterEach(() => {
		traLai?.();
		traLai = null;
	});

	test("kiem-bot: token + getMe ok -> ghi ten bot va gio, khong getUpdates", async () => {
		const z = zaloGia();
		const duong: DuongMang = { zalo: z.fetcher, khac: [] };
		traLai = thayFetch(duong);
		const batDau = new Date();
		await voiBien({ ZALO_BOT_TOKEN: TOKEN, ZALO_WEBHOOK_SECRET: KHOA }, () =>
			chayNhipDispatch(),
		);
		const s = await botDangGhi();
		expect(z.soGoi("getUpdates"), "nhip khong goi getUpdates").toBe(0);
		expect(z.soGoi("getMe"), "nhip goi getMe dung mot lan").toBe(1);
		expect(s?.zaloBotName, "nhip ghi ten bot").toBe("Bot OneHub");
		expect(
			(s?.zaloPolledAt?.getTime() ?? 0) >= batDau.getTime(),
			"nhip ghi gio kiem bot",
		).toBe(true);
	});

	test("kiem-bot: token + getMe 401 -> khong nem, zaloBotName null", async () => {
		await db.appSetting.upsert({
			where: { id: SETTINGS_ID },
			create: { id: SETTINGS_ID, zaloBotName: "Bot OneHub" },
			update: { zaloBotName: "Bot OneHub" },
		});
		const z = zaloGia({ getMe: 401 });
		const duong: DuongMang = { zalo: z.fetcher, khac: [] };
		traLai = thayFetch(duong);
		const loiGoc = console.error;
		console.error = () => {};
		const ket = await voiBien(
			{ ZALO_BOT_TOKEN: "1:hong", ZALO_WEBHOOK_SECRET: KHOA },
			() => chayNhipDispatch(),
		).finally(() => {
			console.error = loiGoc;
		});
		expect(z.soGoi("getUpdates"), "nhip khong goi getUpdates").toBe(0);
		expect(
			ket.filter(
				(r) => r.status === "rejected" && String(r.reason).includes("Zalo"),
			),
			"kiem bot khong nem",
		).toEqual([]);
		expect(
			(await botDangGhi())?.zaloBotName ?? null,
			"token hong thi tat",
		).toBeNull();
	});

	test("kiem-bot: khong token -> khong goi Zalo, zaloBotName null", async () => {
		const z = zaloGia();
		const duong: DuongMang = { zalo: z.fetcher, khac: [] };
		traLai = thayFetch(duong);
		await voiBien(
			{ ZALO_BOT_TOKEN: undefined, ZALO_WEBHOOK_SECRET: undefined },
			() => chayNhipDispatch(),
		);
		expect(z.goi.length, "khong token thi khong goi Zalo").toBe(0);
		expect((await botDangGhi())?.zaloBotName ?? null).toBeNull();
	});
});

describe("giao-khi-mo", () => {
	async function nhipCu(z: ReturnType<typeof zaloGia>): Promise<void> {
		for (const giay of NHIP_CU) {
			z.datDongHo(giay);
			await pollZalo({
				fetcher: z.fetcher,
				now: () => GOC,
				timeoutGiay: ZALO.poll.timeoutGiay,
			});
		}
	}

	test("giao-khi-mo: nhip cu #94 mat tin den o giay 30", async () => {
		const { U, ma } = await gieoMa();
		const z = zaloGia({
			chiGiaoKhiMo: [
				{
					giay: GIAY_TIN_DEN,
					than: thanGetUpdates({ messageId: "gm-a", fromId: "Z1", text: ma }),
				},
			],
		});
		await voiBien({ ZALO_BOT_TOKEN: TOKEN, ZALO_WEBHOOK_SECRET: KHOA }, () =>
			nhipCu(z),
		);
		expect(
			await db.zaloLink.count({ where: { crmUserId: U.id } }),
			"nhip cu mat tin",
		).toBe(0);
		expect(z.soGoi("sendMessage"), "nhip cu khong tra loi").toBe(0);
	});

	test("giao-khi-mo: doi chung — tin den luc cua so dang mo thi nhip cu bat duoc", async () => {
		const { U, ma } = await gieoMa();
		const z = zaloGia({
			chiGiaoKhiMo: [
				{
					giay: 0.5,
					than: thanGetUpdates({ messageId: "gm-dc", fromId: "Z0", text: ma }),
				},
			],
		});
		await voiBien({ ZALO_BOT_TOKEN: TOKEN, ZALO_WEBHOOK_SECRET: KHOA }, () =>
			nhipCu(z),
		);
		expect(
			await db.zaloLink.count({ where: { crmUserId: U.id } }),
			"gia giao tin khi cua so dang mo",
		).toBe(1);
	});

	test("giao-khi-mo: vong tay bat duoc tin den o giay 30", async () => {
		const { U, ma } = await gieoMa();
		const z = zaloGia({
			chiGiaoKhiMo: [
				{
					giay: GIAY_TIN_DEN,
					than: thanGetUpdates({ messageId: "gm-b", fromId: "Z2", text: ma }),
				},
			],
		});
		await voiBien({ ZALO_BOT_TOKEN: TOKEN, ZALO_WEBHOOK_SECRET: KHOA }, () =>
			vongTay({
				fetcher: z.fetcher,
				now: () => GOC,
				conTiep: () => z.dongHo() < HET_DONG_HO,
			}),
		);
		expect(
			(await db.zaloLink.findMany({ where: { crmUserId: U.id } })).map(
				(l) => l.zaloUserId,
			),
			"vong tay bat duoc tin",
		).toEqual(["Z2"]);
	});

	test("giao-khi-mo: webhook nhan tin den o giay 30", async () => {
		const { U, ma } = await gieoMa();
		const z = zaloGia();
		const yc = yeuCauWebhook(
			JSON.stringify(
				thanWebhook({ messageId: "gm-c", fromId: "Z3", text: ma }),
			),
			KHOA,
		);
		const res = await nhanWebhook(yc.request, {
			fetcher: z.fetcher,
			now: () => GOC,
			env: { token: TOKEN, khoa: KHOA },
		});
		expect(res.status).toBe(200);
		expect(
			(await db.zaloLink.findMany({ where: { crmUserId: U.id } })).map(
				(l) => l.zaloUserId,
			),
			"webhook bat duoc tin",
		).toEqual(["Z3"]);
	});
});

const DU_BIEN = { token: TOKEN, khoa: KHOA };

async function demBang() {
	const [lienKet, daThay, lanSai] = await Promise.all([
		db.zaloLink.count(),
		db.zaloUpdateSeen.count(),
		db.zaloLinkAttempt.count(),
	]);
	return { lienKet, daThay, lanSai };
}

async function guiWebhook(
	than: string,
	z: ReturnType<typeof zaloGia>,
	header: string | null = KHOA,
) {
	const yc = yeuCauWebhook(than, header);
	const res = await nhanWebhook(yc.request, {
		fetcher: z.fetcher,
		now: () => GOC,
		env: DU_BIEN,
	});
	return { res, yc };
}

function tin(chon: ChonTin): string {
	return JSON.stringify(thanWebhook(chon));
}

async function maCua(userId: string) {
	return db.zaloLinkCode.findUnique({ where: { crmUserId: userId } });
}

describe("webhook-noi", () => {
	test("webhook-noi: khoa dung, ma song -> noi U voi Z, doc lai tu DB", async () => {
		const { U, ma } = await gieoMa();
		const z = zaloGia();
		const { res } = await guiWebhook(
			tin({ messageId: "wn-1", fromId: "Z", ten: "Zed", text: ma }),
			z,
		);
		expect(res.status, "webhook tra 200").toBe(200);
		const lk = await db.zaloLink.findMany({ where: { crmUserId: U.id } });
		expect(
			lk.map((l) => [l.zaloUserId, l.zaloDisplayName]),
			"webhook noi duoc U voi Z",
		).toEqual([["Z", "Zed"]]);
		expect((await maCua(U.id))?.usedAt, "ma da dung").not.toBeNull();
		expect(
			await db.zaloUpdateSeen.count({ where: { messageId: "wn-1" } }),
			"mot hang da thay",
		).toBe(1);
		expect(
			z.guiToi("Z").map((g) => g.body.text?.includes(U.name)),
			"bot xac nhan mang ten CRM",
		).toEqual([true]);

		await guiWebhook(
			tin({ messageId: "wn-2", fromId: "Z9", text: "999999" }),
			z,
		);
		expect(
			await db.zaloLink.count({ where: { zaloUserId: "Z9" } }),
			"ma khong ton tai thi khong noi",
		).toBe(0);
	});
});

describe("webhook-khoa", () => {
	const CA: [string, string | null][] = [
		["khong header", null],
		["header rong", ""],
		["sai cung do dai", "x".repeat(KHOA.length)],
		["sai dai 1", "k"],
		["sai dai 300", "k".repeat(300)],
	];

	test("webhook-khoa: ma tran nam ca viet truoc", () => {
		expect(CA.length, "ma tran nam ca khoa sai").toBe(5);
	});

	for (const [ten, header] of CA) {
		test(`webhook-khoa: ${ten} -> 403, khong doc than, khong ghi`, async () => {
			const { U, ma } = await gieoMa();
			const z = zaloGia();
			const truoc = await demBang();
			const yc = yeuCauWebhook(
				tin({ messageId: `wk-${ten}`, fromId: "Z", text: ma }),
				header,
			);
			const cho = nhanWebhook(yc.request, {
				fetcher: z.fetcher,
				now: () => GOC,
				env: DU_BIEN,
			});
			await expect(cho, "khoa khac do dai tra 403").resolves.toBeInstanceOf(
				Response,
			);
			const res = await cho;
			expect(res.status, "khoa sai tra 403").toBe(403);
			expect(
				{ bodyUsed: yc.request.bodyUsed, keo: yc.soLanKeo() },
				"than khong bi doc khi khoa sai",
			).toEqual({ bodyUsed: false, keo: 0 });
			expect(await demBang(), "khoa sai khong ghi hang nao").toEqual(truoc);
			expect(z.goi.length, "khoa sai khong goi Zalo").toBe(0);
			expect((await maCua(U.id))?.usedAt ?? null, "ma van song").toBeNull();
		});
	}

	test("webhook-khoa: doi chung — cung than, khoa dung -> 200 va noi", async () => {
		const { U, ma } = await gieoMa();
		const z = zaloGia();
		const { res } = await guiWebhook(
			tin({ messageId: "wk-dung", fromId: "Z", text: ma }),
			z,
		);
		expect(res.status).toBe(200);
		expect(await db.zaloLink.count({ where: { crmUserId: U.id } })).toBe(1);
	});
});

type KetQuaCon = {
	nap: string;
	status: number;
	bodyUsed: boolean;
	soGoiZalo: number;
};

const MA_CON = `
let so = 0;
globalThis.fetch = async () => { so += 1; return new Response("{}"); };
const kenh = (await import("./agent/channels/zalo.ts")).default;
const route = kenh.routes.find((r) => r.method === "POST" && r.path === "/zalo/webhook");
const req = new Request("http://t/zalo/webhook", {
	method: "POST",
	headers: { "x-bot-api-secret-token": "bat-ky" },
	body: JSON.stringify({ ok: true }),
});
const res = await route.handler(req, {});
console.log(JSON.stringify({ nap: "ok", status: res.status, bodyUsed: req.bodyUsed, soGoiZalo: so }));
process.exit(0);
`;

async function chayCon(bien: Record<string, string>) {
	const con = Bun.spawn(["bun", "-e", MA_CON], {
		cwd: join(import.meta.dir, ".."),
		env: { ...process.env, ...bien },
		stdout: "pipe",
		stderr: "pipe",
	});
	const [ra, loi, ma] = await Promise.all([
		new Response(con.stdout).text(),
		new Response(con.stderr).text(),
		con.exited,
	]);
	return { ra, loi, ma };
}

describe("webhook-tat", () => {
	const CA: [string, Record<string, string>][] = [
		[
			"thieu ZALO_WEBHOOK_SECRET",
			{ ZALO_BOT_TOKEN: TOKEN, ZALO_WEBHOOK_SECRET: "" },
		],
		["thieu ZALO_BOT_TOKEN", { ZALO_BOT_TOKEN: "", ZALO_WEBHOOK_SECRET: KHOA }],
	];
	for (const [ten, bien] of CA) {
		test(`webhook-tat: ${ten} -> nap khong nem, 404, khong goi, khong ghi`, async () => {
			const truoc = await demBang();
			const { ra, loi, ma } = await chayCon(bien);
			expect(ma, `nap kenh khong nem khi thieu bien: ${loi}`).toBe(0);
			const dong = ra.trim().split("\n").at(-1) ?? "{}";
			const ket: KetQuaCon = JSON.parse(dong);
			expect(ket, "thieu bien tra 404").toEqual({
				nap: "ok",
				status: 404,
				bodyUsed: false,
				soGoiZalo: 0,
			});
			expect(await demBang(), "thieu bien khong ghi hang nao").toEqual(truoc);
		});
	}
});

describe("webhook-trung", () => {
	test("webhook-trung: cung message_id qua webhook hai lan roi qua poll -> mot lan", async () => {
		const { U, ma } = await gieoMa();
		const chon: ChonTin = { messageId: "wt-1", fromId: "Z", text: ma };
		const z = zaloGia();
		const lan1 = await guiWebhook(tin(chon), z);
		const lan2 = await guiWebhook(tin(chon), z);
		expect([lan1.res.status, lan2.res.status], "hai lan deu 200").toEqual([
			200, 200,
		]);
		const zPoll = zaloGia({
			chiGiaoKhiMo: [{ giay: 0, than: thanGetUpdates(chon) }],
		});
		await voiBien({ ZALO_BOT_TOKEN: TOKEN, ZALO_WEBHOOK_SECRET: KHOA }, () =>
			pollZalo({ fetcher: zPoll.fetcher, now: () => GOC }),
		);
		expect(
			await db.zaloLink.count({ where: { crmUserId: U.id } }),
			"mot lien ket",
		).toBe(1);
		expect(
			await db.zaloUpdateSeen.count({ where: { messageId: "wt-1" } }),
			"mot hang da thay",
		).toBe(1);
		expect(
			z.guiToi("Z").length + zPoll.guiToi("Z").length,
			"moi tin tra loi mot lan",
		).toBe(1);
	});
});

describe("webhook-bo-qua", () => {
	test("webhook-bo-qua: than hong, tu bot, tu nhom -> 200, khong ghi, log khoa", async () => {
		const { U, ma } = await gieoMa();
		const CA: [string, string][] = [
			["a khong-json", "khong-json"],
			[
				"b sai khuon",
				JSON.stringify({
					ok: true,
					result: { message: { message_id: "m-hong" } },
				}),
			],
			[
				"d tu bot",
				tin({ messageId: "wb-d", fromId: "Z", text: ma, isBot: true }),
			],
			[
				"e tu nhom",
				tin({ messageId: "wb-e", fromId: "Z", text: ma, chatType: "GROUP" }),
			],
		];
		expect(CA.length, "ma tran bon ca bo qua").toBe(4);
		const log: string[] = [];
		const nghe = spyOn(console, "error").mockImplementation(
			(...a: unknown[]) => {
				log.push(a.map(String).join(" "));
			},
		);
		const z = zaloGia();
		try {
			for (const [ten, than] of CA) {
				const truoc = await demBang();
				const lenh = log.length;
				const { res } = await guiWebhook(than, z);
				expect(res.status, `${ten}: than hong tra 200`).toBe(200);
				expect(await demBang(), `${ten}: khong ghi`).toEqual(truoc);
				expect(z.soGoi("sendMessage"), `${ten}: khong tra loi`).toBe(0);
				const moi = log.slice(lenh).join("\n");
				if (ten.startsWith("b")) {
					expect(moi, "log in khoa cap dau").toContain("result");
					expect(moi, "log mang message_id").toContain("m-hong");
				}
			}
		} finally {
			nghe.mockRestore();
		}
		expect(
			(await maCua(U.id))?.usedAt ?? null,
			"tin tu nhom bi bo qua",
		).toBeNull();
		const { res } = await guiWebhook(
			tin({ messageId: "wb-e2", fromId: "Z", text: ma, chatType: "PRIVATE" }),
			z,
		);
		expect(res.status).toBe(200);
		expect(
			await db.zaloLink.count({ where: { crmUserId: U.id } }),
			"doi chung: PRIVATE thi noi",
		).toBe(1);
	});
});

describe("webhook-luat-ma", () => {
	async function soSai(zaloUserId: string): Promise<number> {
		return (
			(await db.zaloLinkAttempt.findUnique({ where: { zaloUserId } }))
				?.failures ?? 0
		);
	}

	test("webhook-luat-ma: sai, chu, anh, dang bi chan", async () => {
		const { U, ma } = await gieoMa();
		const z = zaloGia();
		const huongDan = () =>
			z.guiToi("Z").filter((g) => g.body.text === ZALO.loi.huongDan).length;

		const r1 = await guiWebhook(
			tin({
				messageId: "wl-1",
				fromId: "Z",
				text: ma === "000000" ? "111111" : "000000",
			}),
			z,
		);
		expect(await soSai("Z"), "ma sai tang dem").toBe(1);
		expect(huongDan(), "ma sai nhan huong dan").toBe(1);

		const r2 = await guiWebhook(
			tin({ messageId: "wl-2", fromId: "Z", text: "xin chao" }),
			z,
		);
		expect(await soSai("Z"), "chu khong tang dem").toBe(1);
		expect(huongDan(), "chu nhan huong dan").toBe(2);

		const r3 = await guiWebhook(
			tin({
				messageId: "wl-3",
				fromId: "Z",
				text: null,
				photo: "https://anh.test/a.jpg",
			}),
			z,
		);
		expect(await soSai("Z"), "anh khong tang dem").toBe(1);
		expect(huongDan(), "anh nhan huong dan").toBe(3);

		for (let i = await soSai("Z"); i < ZALO_LIEN_KET.doMa.toiDa; i++) {
			await ghiSai(db, "Z", GOC);
		}
		const truocGui = z.soGoi("sendMessage");
		const r4 = await guiWebhook(
			tin({ messageId: "wl-4", fromId: "Z", text: ma }),
			z,
		);
		expect(
			await db.zaloLink.count({ where: { crmUserId: U.id } }),
			"dang bi chan thi im",
		).toBe(0);
		expect(z.soGoi("sendMessage"), "dang bi chan thi khong tra loi").toBe(
			truocGui,
		);
		expect((await maCua(U.id))?.usedAt ?? null).toBeNull();
		expect(
			[r1, r2, r3, r4].map((r) => r.res.status),
			"moi lan 200",
		).toEqual([200, 200, 200, 200]);
	});
});

describe("kenh-route", () => {
	let traLai: (() => void) | null = null;
	afterEach(() => {
		traLai?.();
		traLai = null;
	});

	test("kenh-route: kenh mount dung mot route POST /zalo/webhook va route do chay", async () => {
		const route = kenhZalo.routes.filter(
			(r) => r.method === "POST" && r.path === DUONG_HUA,
		);
		expect(route.length, "route /zalo/webhook duoc mount").toBe(1);
		const { U, ma } = await gieoMa(new Date());
		const z = zaloGia();
		traLai = thayFetch({ zalo: z.fetcher, khac: [] });
		const goi = (header: string) =>
			voiBien({ ZALO_BOT_TOKEN: TOKEN, ZALO_WEBHOOK_SECRET: KHOA }, () =>
				Promise.resolve(
					route[0]?.handler(
						yeuCauWebhook(
							tin({ messageId: `kr-${header.length}`, fromId: "Z", text: ma }),
							header,
						).request,
						{} as never,
					),
				),
			);
		const dung = await goi(KHOA);
		expect(dung?.status).toBe(200);
		expect(await db.zaloLink.count({ where: { crmUserId: U.id } })).toBe(1);
		const sai = await goi("sai");
		expect(sai?.status, "khoa sai qua route tra 403").toBe(403);
	});
});

const URL_HTTPS = "https://tac-tu.test/zalo/webhook";

async function chayLenh(lenh: string[], bien: Record<string, string>) {
	const con = Bun.spawn(["bun", "run", ...lenh], {
		cwd: join(import.meta.dir, ".."),
		env: {
			...process.env,
			ZALO_BOT_TOKEN: "1:gia",
			ZALO_WEBHOOK_SECRET: "khoa-gia-du-dai",
			...bien,
		},
		stdout: "pipe",
		stderr: "pipe",
	});
	const [ra, loi, ma] = await Promise.all([
		new Response(con.stdout).text(),
		new Response(con.stderr).text(),
		con.exited,
	]);
	return { ra, loi, ma };
}

describe("lenh-webhook", () => {
	test("lenh-webhook: https + du bien -> dung mot setWebhook, in outcome", async () => {
		const z = zaloGia();
		const ket = await dangKyWebhook(
			{ url: URL_HTTPS, xoa: false },
			{ fetcher: z.fetcher, env: DU_BIEN },
		);
		const dat = z.goi.filter((g) => g.method === "setWebhook");
		expect(
			dat.map((g) => g.body),
			"dang ky dung url va khoa",
		).toEqual([{ url: URL_HTTPS, secret_token: KHOA }]);
		expect(ket, "in outcome Zalo tra ve").toContain("webhook.ok");
	});

	test("lenh-webhook: --xoa -> dung mot deleteWebhook, khong setWebhook", async () => {
		const z = zaloGia();
		await dangKyWebhook(
			{ url: null, xoa: true },
			{ fetcher: z.fetcher, env: DU_BIEN },
		);
		expect(
			{ xoa: z.soGoi("deleteWebhook"), dat: z.soGoi("setWebhook") },
			"go webhook",
		).toEqual({ xoa: 1, dat: 0 });
	});

	test("lenh-webhook: doc tham so", () => {
		expect(docThamSo(["--xoa"]), "--xoa khong phai url").toEqual({
			url: null,
			xoa: true,
		});
		expect(docThamSo([URL_HTTPS])).toEqual({ url: URL_HTTPS, xoa: false });
	});

	const CA_LENH: [string, string[], Record<string, string>, string][] = [
		[
			"c http",
			["zalo:webhook", "http://tac-tu.test/zalo/webhook"],
			{},
			"https",
		],
		[
			"d thieu khoa",
			["zalo:webhook", URL_HTTPS],
			{ ZALO_WEBHOOK_SECRET: "" },
			"ZALO_WEBHOOK_SECRET",
		],
		[
			"e thieu token",
			["zalo:webhook", URL_HTTPS],
			{ ZALO_BOT_TOKEN: "" },
			"ZALO_BOT_TOKEN",
		],
		[
			"f poll thieu token",
			["zalo:poll"],
			{ ZALO_BOT_TOKEN: "" },
			"ZALO_BOT_TOKEN",
		],
	];

	for (const [ten, lenh, bien, goiTen] of CA_LENH) {
		test(`lenh-webhook: ${ten} -> thoat khac 0, goi dich danh, khong goi mang`, async () => {
			const { loi, ma } = await chayLenh(lenh, bien);
			expect(ma, `${ten}: lenh thoat ma khac 0`).not.toBe(0);
			expect(loi, `${ten}: chi nhan https / goi dich danh`).toContain(goiTen);
			expect(loi, `${ten}: dung truoc khi goi mang`).not.toContain(
				"error_code",
			);
		});
	}
});

const GOC_KHO = join(import.meta.dir, "..", "..", "..");
const BIEN_ZALO = ["ZALO_BOT_TOKEN", "ZALO_WEBHOOK_SECRET"];

function docTep(duong: string): string {
	return readFileSync(join(GOC_KHO, duong), "utf8");
}

function boChuThich(nguon: string): string {
	let ra = "";
	let trongChuoi = false;
	for (let i = 0; i < nguon.length; i++) {
		const kyTu = nguon[i];
		const ke = nguon[i + 1];
		if (trongChuoi) {
			ra += kyTu;
			if (kyTu === "\\") {
				ra += ke ?? "";
				i++;
			} else if (kyTu === '"') trongChuoi = false;
			continue;
		}
		if (kyTu === '"') {
			trongChuoi = true;
			ra += kyTu;
			continue;
		}
		if (kyTu === "/" && ke === "*") {
			const het = nguon.indexOf("*/", i + 2);
			i = het === -1 ? nguon.length : het + 1;
			continue;
		}
		if (kyTu === "/" && ke === "/") {
			const het = nguon.indexOf("\n", i);
			i = het === -1 ? nguon.length : het - 1;
			continue;
		}
		ra += kyTu;
	}
	return ra.replace(/,(\s*[}\]])/g, "$1");
}

const turboGoc = z.object({
	globalEnv: z.array(z.string()),
	globalPassThroughEnv: z.array(z.string()),
});
const turboAgent = z.object({
	tasks: z.record(
		z.string(),
		z.object({ passThroughEnv: z.array(z.string()).optional() }),
	),
});

describe("khai-bien", () => {
	test("khai-bien: turbo.json cho hai bien Zalo di qua, khong dua vao khoa cache", () => {
		const goc = turboGoc.parse(JSON.parse(boChuThich(docTep("turbo.json"))));
		expect(
			BIEN_ZALO.filter((b) => !goc.globalPassThroughEnv.includes(b)),
			"globalPassThroughEnv thieu bien Zalo",
		).toEqual([]);
		expect(
			BIEN_ZALO.filter((b) => goc.globalEnv.includes(b)),
			"globalEnv khong chua bien Zalo",
		).toEqual([]);
	});

	test("khai-bien: dev va dev:headless cua agent cho ca hai bien di qua", () => {
		const agent = turboAgent.parse(
			JSON.parse(boChuThich(docTep("apps/agent/turbo.json"))),
		);
		for (const task of ["dev", "dev:headless"]) {
			const qua = agent.tasks[task]?.passThroughEnv ?? [];
			expect(
				BIEN_ZALO.filter((b) => !qua.includes(b)),
				`passThroughEnv cua ${task} thieu bien Zalo`,
			).toEqual([]);
		}
	});

	test("khai-bien: .env.example khai ZALO_WEBHOOK_SECRET kem ghi chu, chi dung noi tao bot", () => {
		const dong = docTep(".env.example").split("\n");
		const viTri = dong.findIndex((d) => d.startsWith("# ZALO_WEBHOOK_SECRET="));
		expect(viTri, ".env.example khai ZALO_WEBHOOK_SECRET").toBeGreaterThan(0);
		expect(
			dong[viTri - 1]?.startsWith("# ") &&
				!/^# [A-Z0-9_]+=/.test(dong[viTri - 1] ?? ""),
			"dong ghi chu ngay tren ZALO_WEBHOOK_SECRET",
		).toBe(true);
		const dauKhoi = dong.findIndex((d) =>
			d.includes("morning reminder on Zalo"),
		);
		const khoi = dong.slice(dauKhoi, viTri + 1).join("\n");
		expect(khoi, "chi noi tao bot la Zalo Bot Manager").toContain(
			"Zalo Bot Manager",
		);
		expect(khoi, "khong con chi tao bot tren web").not.toContain(
			"bot.zaloplatforms.com",
		);
	});

	test("khai-bien: docs/environment.md co hang ZALO_WEBHOOK_SECRET", () => {
		expect(
			docTep("docs/environment.md")
				.split("\n")
				.some((d) => d.startsWith("| `ZALO_WEBHOOK_SECRET`")),
			"docs/environment.md co hang ZALO_WEBHOOK_SECRET",
		).toBe(true);
	});
});
