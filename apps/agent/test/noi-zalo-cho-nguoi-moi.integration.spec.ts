import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { join } from "node:path";
import { db } from "@crm/db";
import { SETTINGS_ID } from "@crm/db/settings";
import { taoMaLienKet } from "@crm/db/zalo-lien-ket";
import {
	type DatBotYeuCau,
	type GuiThuPhanHoi,
	type GuiThuYeuCau,
	guiThuPhanHoi,
} from "@crm/validation/zalo-cau-noi";
import kenhZalo from "../agent/channels/zalo";
import { chayNhac, lenLichNhac } from "../agent/lib/nhac-ke-hoach";
import { kiemBot } from "../agent/lib/zalo-bot";
import { ZALO } from "../agent/lib/zalo-config";
import { pollZalo } from "../agent/lib/zalo-poll";
import { nhanWebhook } from "../agent/lib/zalo-webhook";
import dispatch from "../agent/schedules/dispatch";
import {
	donDep,
	gieoNguoi,
	khopSlack,
	moXuong,
	noiSlack,
	slackGia,
	TIEN_TO,
} from "./support/nhac-gieo";
import { gieoGui, hangCua } from "./support/nhac-gui-gieo";
import { type ChonZaloGia, type LoiGoiZalo, zaloGia } from "./support/zalo-gia";
import { zaloMayChu } from "./support/zalo-may-chu";
import { thanWebhook, yeuCauWebhook } from "./support/zalo-tin";

const GOC = new Date("2026-10-10T02:00:00Z");
const TOK_A = "111:aaa";
const TOK_B = "222:bbb";
const KHOA_A = "khoa-A-du-dai";
const KHOA_B = "khoa-B-du-dai";
const APP_URL = "https://crm.test";
const THU_MUC_TAC_TU = join(import.meta.dir, "..");
const CHO_LOI_GOI_MS = 30_000;
const NHIP_CHO_MS = 100;
const URL_WEBHOOK = "https://tac-tu.test/zalo/webhook";

type BienZalo =
	| "ZALO_BOT_TOKEN"
	| "ZALO_WEBHOOK_SECRET"
	| "ZALO_API_URL"
	| "AGENT_BRIDGE_SECRET";

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

function voiBien<T>(
	bien: Partial<Record<BienZalo, string | undefined>>,
	chay: () => Promise<T>,
): Promise<T> {
	const ten = Object.keys(bien) as BienZalo[];
	const cu = new Map(ten.map((k) => [k, process.env[k]]));
	const dat = (k: BienZalo, giaTri: string | undefined) => {
		if (giaTri === undefined) delete process.env[k];
		else process.env[k] = giaTri;
	};
	for (const k of ten) dat(k, bien[k]);
	return chay().finally(() => {
		for (const k of ten) dat(k, cu.get(k));
	});
}

async function datCaiDat(data: {
	zaloBotToken?: string | null;
	zaloWebhookSecret?: string | null;
	zaloBotName?: string | null;
}): Promise<void> {
	await db.appSetting.upsert({
		where: { id: SETTINGS_ID },
		create: { id: SETTINGS_ID, ...data },
		update: data,
	});
}

function tenToken(tok: string | undefined): string {
	if (tok === TOK_A) return "A";
	if (tok === TOK_B) return "B";
	return tok ?? "?";
}

function duongDau(goi: LoiGoiZalo[]): string {
	const dau = goi[0];
	return dau ? `/bot${tenToken(dau.token)}/` : "0 goi";
}

async function chayNhipDispatch(): Promise<void> {
	const viec: Promise<unknown>[] = [];
	await dispatch.run({
		receive: async () => ({}),
		waitUntil: (p: Promise<unknown>) => {
			viec.push(p);
		},
		appAuth: null,
	} as unknown as Parameters<typeof dispatch.run>[0]);
	await Promise.allSettled(viec);
}

async function choLoiGoi(goi: LoiGoiZalo[]): Promise<void> {
	const han = Date.now() + CHO_LOI_GOI_MS;
	while (goi.length === 0 && Date.now() < han) await Bun.sleep(NHIP_CHO_MS);
}

function moiTruongCon(
	env: Record<"ZALO_BOT_TOKEN" | "ZALO_WEBHOOK_SECRET", string>,
	zaloUrl: string,
) {
	return { ...process.env, ...env, ZALO_API_URL: zaloUrl };
}

const DUONG = [
	"webhook-KA",
	"webhook-KB",
	"kiemBot",
	"nhac",
	"pollZalo",
	"zalo:poll",
	"zalo:webhook",
] as const;
type Duong = (typeof DUONG)[number];

const CAU_HINH = ["man+env", "env", "rong"] as const;
type CauHinh = (typeof CAU_HINH)[number];

const KY_VONG = {
	"man+env": {
		"webhook-KA": "200",
		"webhook-KB": "403",
		kiemBot: "/botA/",
		nhac: "/botA/",
		pollZalo: "/botA/",
		"zalo:poll": "/botA/",
		"zalo:webhook": "/botA/ secret=KA",
	},
	env: {
		"webhook-KA": "403",
		"webhook-KB": "200",
		kiemBot: "/botB/",
		nhac: "/botB/",
		pollZalo: "/botB/",
		"zalo:poll": "/botB/",
		"zalo:webhook": "/botB/ secret=KB",
	},
	rong: {
		"webhook-KA": "404",
		"webhook-KB": "404",
		kiemBot: "0 goi",
		nhac: "khong zalo",
		pollZalo: "0 goi",
		"zalo:poll": "exit!=0 ZALO_BOT_TOKEN",
		"zalo:webhook": "exit!=0 ZALO_BOT_TOKEN",
	},
} satisfies Record<CauHinh, Record<Duong, string>>;

const ENV_CUA = {
	"man+env": { ZALO_BOT_TOKEN: TOK_B, ZALO_WEBHOOK_SECRET: KHOA_B },
	env: { ZALO_BOT_TOKEN: TOK_B, ZALO_WEBHOOK_SECRET: KHOA_B },
	rong: { ZALO_BOT_TOKEN: "", ZALO_WEBHOOK_SECRET: "" },
} satisfies Record<
	CauHinh,
	Record<"ZALO_BOT_TOKEN" | "ZALO_WEBHOOK_SECRET", string>
>;

async function gieoCauHinh(cauHinh: CauHinh): Promise<void> {
	await donZalo();
	if (cauHinh === "man+env") {
		await datCaiDat({ zaloBotToken: TOK_A, zaloWebhookSecret: KHOA_A });
	}
}

async function doWebhook(khoa: string, so: string): Promise<string> {
	const z = zaloGia();
	const than = JSON.stringify(
		thanWebhook({ messageId: `nt-${so}`, fromId: "Z", text: "xin chao" }),
	);
	const res = await nhanWebhook(yeuCauWebhook(than, khoa).request, {
		fetcher: z.fetcher,
		now: () => GOC,
	});
	return String(res.status);
}

async function doKiemBot(): Promise<string> {
	const z = zaloGia();
	await kiemBot({ fetcher: z.fetcher, now: () => GOC });
	return duongDau(z.goi);
}

async function doNhac(): Promise<string> {
	await donDep();
	const g = await gieoGui();
	await db.zaloLink.create({
		data: { crmUserId: g.A.id, zaloUserId: "ZA", zaloDisplayName: "Zalo ZA" },
	});
	await datCaiDat({ zaloBotName: "Bot OneHub" });
	setSystemTime(g.goc);
	try {
		await lenLichNhac(g.goc);
		const z = zaloGia();
		const s = slackGia();
		await chayNhac(await hangCua(g.A.id), {
			fetcher: s.fetcher,
			zaloFetcher: z.fetcher,
			appUrl: APP_URL,
		});
		const gui = z.goi.filter((g2) => g2.method === "sendMessage");
		return gui.length === 0 ? "khong zalo" : duongDau(gui);
	} finally {
		setSystemTime();
		await donDep();
	}
}

async function doPoll(): Promise<string> {
	const z = zaloGia();
	await pollZalo({ fetcher: z.fetcher, now: () => GOC, timeoutGiay: 0 });
	return duongDau(z.goi);
}

async function doLenhPoll(cauHinh: CauHinh): Promise<string> {
	const may = zaloMayChu();
	const con = Bun.spawn(["bun", "run", "zalo:poll"], {
		cwd: THU_MUC_TAC_TU,
		env: moiTruongCon(ENV_CUA[cauHinh], may.url),
		stdout: "pipe",
		stderr: "pipe",
	});
	try {
		if (cauHinh === "rong") {
			const ma = await con.exited;
			const loi = await new Response(con.stderr).text();
			return ma !== 0 && loi.includes("ZALO_BOT_TOKEN")
				? "exit!=0 ZALO_BOT_TOKEN"
				: `exit=${ma} ${loi.trim()}`;
		}
		await choLoiGoi(may.goi);
		return duongDau(may.goi);
	} finally {
		con.kill();
		await con.exited;
		may.dung();
	}
}

async function doLenhWebhook(cauHinh: CauHinh): Promise<string> {
	const may = zaloMayChu();
	const con = Bun.spawn(["bun", "run", "zalo:webhook", URL_WEBHOOK], {
		cwd: THU_MUC_TAC_TU,
		env: moiTruongCon(ENV_CUA[cauHinh], may.url),
		stdout: "pipe",
		stderr: "pipe",
	});
	try {
		const ma = await con.exited;
		const loi = await new Response(con.stderr).text();
		if (cauHinh === "rong") {
			return ma !== 0 && loi.includes("ZALO_BOT_TOKEN")
				? "exit!=0 ZALO_BOT_TOKEN"
				: `exit=${ma} ${loi.trim()}`;
		}
		const dat = may.goi.find((g) => g.method === "setWebhook");
		if (!dat) return `khong setWebhook exit=${ma} ${loi.trim()}`;
		const khoa = dat.body.secret_token;
		const tenKhoa =
			khoa === KHOA_A ? "KA" : khoa === KHOA_B ? "KB" : (khoa ?? "?");
		return `/bot${tenToken(dat.token)}/ secret=${tenKhoa}`;
	} finally {
		may.dung();
	}
}

async function doMotO(cauHinh: CauHinh, duong: Duong): Promise<string> {
	await gieoCauHinh(cauHinh);
	return voiBien(ENV_CUA[cauHinh], async () => {
		if (duong === "webhook-KA") return doWebhook(KHOA_A, `${cauHinh}-a`);
		if (duong === "webhook-KB") return doWebhook(KHOA_B, `${cauHinh}-b`);
		if (duong === "kiemBot") return doKiemBot();
		if (duong === "nhac") return doNhac();
		if (duong === "pollZalo") return doPoll();
		if (duong === "zalo:poll") return doLenhPoll(cauHinh);
		return doLenhWebhook(cauHinh);
	});
}

beforeEach(async () => {
	await moXuong();
	await donZalo();
});

afterEach(async () => {
	setSystemTime();
	await donZalo();
});

afterAll(async () => {
	await donZalo();
	await donDep();
});

describe("nguon-token", () => {
	test(
		"nguon-token: AppSetting thang env o ca bay cho dung token, 21 o",
		async () => {
			const thucTe = {} as Record<CauHinh, Record<Duong, string>>;
			for (const cauHinh of CAU_HINH) {
				const hang = {} as Record<Duong, string>;
				for (const duong of DUONG) hang[duong] = await doMotO(cauHinh, duong);
				thucTe[cauHinh] = hang;
			}
			console.table(thucTe);
			const soO = Object.values(thucTe).reduce(
				(tong, hang) => tong + Object.keys(hang).length,
				0,
			);
			expect(soO, "ma tran du 21 o").toBe(CAU_HINH.length * DUONG.length);
			expect(thucTe, "AppSetting thang env").toEqual(KY_VONG);
		},
		{ timeout: 180_000 },
	);
});

describe("ten-bot", () => {
	test("ten-bot: nhip dispatch ghi display_name, khong ghi account_name", async () => {
		const chon: ChonZaloGia = {};
		const z = zaloGia(chon);
		const cu = globalThis.fetch;
		globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) =>
			String(input).startsWith(ZALO.api)
				? z.fetcher(input, init)
				: new Response("", { status: 503 })) as typeof fetch;
		try {
			await voiBien(
				{ ZALO_BOT_TOKEN: TOK_B, ZALO_WEBHOOK_SECRET: KHOA_B },
				() => chayNhipDispatch(),
			);
		} finally {
			globalThis.fetch = cu;
		}
		const s = await db.appSetting.findUnique({ where: { id: SETTINGS_ID } });
		expect(s?.zaloBotName, "ten bot theo display_name").toBe("Bot OneHub");
		expect(s?.zaloBotName, "khong ghi account_name").not.toBe("bot.uipSwwnr");
	});
});

function thayFetchZalo(z: ReturnType<typeof zaloGia>): () => void {
	const cu = globalThis.fetch;
	globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) =>
		String(input).startsWith(ZALO.api)
			? z.fetcher(input, init)
			: new Response("", { status: 503 })) as typeof fetch;
	return () => {
		globalThis.fetch = cu;
	};
}

const URL_CU = "https://cu.test/zalo/webhook";

async function nhipVoi(chon: ChonZaloGia): Promise<void> {
	await datCaiDat({ zaloBotToken: "1:abc" });
	await db.appSetting.update({
		where: { id: SETTINGS_ID },
		data: { zaloWebhookUrl: URL_CU },
	});
	const traLai = thayFetchZalo(zaloGia(chon));
	try {
		await voiBien({ ZALO_BOT_TOKEN: "", ZALO_WEBHOOK_SECRET: "" }, () =>
			chayNhipDispatch(),
		);
	} finally {
		traLai();
	}
}

async function urlDangGhi(): Promise<string | null> {
	const s = await db.appSetting.findUnique({ where: { id: SETTINGS_ID } });
	return s?.zaloWebhookUrl ?? null;
}

describe("trang-thai-webhook", () => {
	const CA: { ten: string; chon: ChonZaloGia; ky: string | null }[] = [
		{
			ten: "a co url",
			chon: { webhookInfo: { url: "https://u.test/zalo/webhook" } },
			ky: "https://u.test/zalo/webhook",
		},
		{ ten: "b 404", chon: { webhookInfo: 404 }, ky: null },
		{ ten: "c 500 giu cu", chon: { webhookInfo: 500 }, ky: URL_CU },
		{ ten: "d than la", chon: { webhookInfo: "la" }, ky: null },
	];
	for (const ca of CA) {
		test(`trang-thai-webhook: nhip ${ca.ten}`, async () => {
			const loi: string[] = [];
			const goc = console.error;
			console.error = (...m: unknown[]) => {
				loi.push(m.map(String).join(" "));
			};
			try {
				await nhipVoi(ca.chon);
			} finally {
				console.error = goc;
			}
			expect(await urlDangGhi(), `nhip ${ca.ten}`).toBe(ca.ky);
			if (ca.ten.startsWith("d")) {
				expect(
					loi.filter(
						(d) =>
							d.includes("getWebhookInfo") &&
							d.includes("ok,result") &&
							d.includes("khac"),
					),
					"than la ghi mot dong log khoa cap dau",
				).toHaveLength(1);
			}
		});
	}

	test("trang-thai-webhook: getMe 401 thi ten bot va url ve null", async () => {
		await nhipVoi({ getMe: 401, webhookInfo: { url: "https://u.test/x" } });
		const s = await db.appSetting.findUnique({ where: { id: SETTINGS_ID } });
		expect(
			{ ten: s?.zaloBotName ?? null, url: s?.zaloWebhookUrl ?? null },
			"bot bi xoa thi trang ve chua bat",
		).toEqual({ ten: null, url: null });
	});
});

const BI_MAT = "bi-mat-cau-noi";
const TOK_T = "999:ttt";
const GOC_HTTPS = "https://tac-tu.test";
const GOC_HTTP = "http://127.0.0.1:2000";
const DUONG_BOT = "/internal/zalo/bot";
const DUONG_GUI_THU = "/internal/zalo/gui-thu";
const KHOA_CU = "khoa-cu-du-dai";

type MangGia = {
	z: ReturnType<typeof zaloGia>;
	s: ReturnType<typeof slackGia>;
};

function thayFetchHai(mang: MangGia): () => void {
	const cu = globalThis.fetch;
	globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
		const url = String(input);
		if (url.startsWith(ZALO.api)) return mang.z.fetcher(input, init);
		if (url.includes("slack.com")) return mang.s.fetcher(input, init);
		return new Response("", { status: 503 });
	}) as typeof fetch;
	return () => {
		globalThis.fetch = cu;
	};
}

function routeCua(duong: string) {
	const ds = kenhZalo.routes.filter(
		(r) => r.method === "POST" && r.path === duong,
	);
	expect(ds.length, `route ${duong} mount dung mot`).toBe(1);
	const route = ds[0];
	if (!route) throw new Error(`thieu route ${duong}`);
	return route;
}

async function goiCau(
	goc: string,
	duong: string,
	than: DatBotYeuCau | GuiThuYeuCau,
	auth: string | null = `Bearer ${BI_MAT}`,
): Promise<Response> {
	const headers = new Headers({ "content-type": "application/json" });
	if (auth !== null) headers.set("authorization", auth);
	const req = new Request(`${goc}${duong}`, {
		method: "POST",
		headers,
		body: JSON.stringify(than),
	});
	return voiBien(
		{
			AGENT_BRIDGE_SECRET: BI_MAT,
			ZALO_BOT_TOKEN: "",
			ZALO_WEBHOOK_SECRET: "",
		},
		async () => routeCua(duong).handler(req, {} as never),
	);
}

async function cotZalo() {
	const s = await db.appSetting.findUnique({
		where: { id: SETTINGS_ID },
		select: {
			zaloBotName: true,
			zaloBotToken: true,
			zaloWebhookSecret: true,
			zaloWebhookUrl: true,
			zaloWebhookLyDo: true,
		},
	});
	return (
		s ?? {
			zaloBotName: null,
			zaloBotToken: null,
			zaloWebhookSecret: null,
			zaloWebhookUrl: null,
			zaloWebhookLyDo: null,
		}
	);
}

describe("cau-noi", () => {
	let traLai: (() => void) | null = null;
	afterEach(() => {
		traLai?.();
		traLai = null;
	});

	function mang(chon: ChonZaloGia = {}): MangGia {
		const m = { z: zaloGia(chon), s: slackGia() };
		traLai?.();
		traLai = thayFetchHai(m);
		return m;
	}

	test("luu-bot: token dung, goc https -> getMe, setWebhook, ghi AppSetting, khong tra token", async () => {
		const { z } = mang();
		const res = await goiCau(GOC_HTTPS, DUONG_BOT, { token: TOK_T });
		const than = await res.json();
		expect(
			{ getMe: z.soGoi("getMe"), setWebhook: z.soGoi("setWebhook") },
			"dung mot getMe, mot setWebhook",
		).toEqual({ getMe: 1, setWebhook: 1 });
		const dat = z.goi.find((g) => g.method === "setWebhook");
		expect(dat?.body.url, "url webhook tu goc yeu cau").toBe(
			"https://tac-tu.test/zalo/webhook",
		);
		expect(dat?.body.secret_token ?? "", "khoa 64 ky tu hex").toMatch(
			/^[0-9a-f]{64}$/,
		);
		expect(await cotZalo(), "ghi AppSetting").toEqual({
			zaloBotName: "Bot OneHub",
			zaloBotToken: TOK_T,
			zaloWebhookSecret: dat?.body.secret_token ?? "?",
			zaloWebhookUrl: "https://tac-tu.test/zalo/webhook",
			zaloWebhookLyDo: null,
		});
		expect(JSON.stringify(than).includes(TOK_T), "token khong ve").toBe(false);
		expect(than).toEqual({
			outcome: "valid",
			tenBot: "Bot OneHub",
			webhook: "da-dang-ky",
		});
	});

	test("luu-bot: doi chung am, khong header -> 401, khong goi Zalo", async () => {
		const { z } = mang();
		const res = await goiCau(GOC_HTTPS, DUONG_BOT, { token: TOK_T }, null);
		expect(res.status).toBe(401);
		expect(z.goi.length, "khong goi Zalo").toBe(0);
	});

	test("luu-bot: hai lan lien tiep -> lan sau thang tron, token di cung khoa", async () => {
		const { z } = mang();
		await goiCau(GOC_HTTPS, DUONG_BOT, { token: "1:mot" });
		await goiCau(GOC_HTTPS, DUONG_BOT, { token: "2:hai" });
		const dat = z.goi.filter((g) => g.method === "setWebhook");
		const c = await cotZalo();
		expect(
			{ token: c.zaloBotToken, khoa: c.zaloWebhookSecret },
			"lan sau thang tron",
		).toEqual({ token: "2:hai", khoa: dat[1]?.body.secret_token ?? "?" });
	});

	test("token-sai: getMe 401 -> invalid, khong setWebhook, AppSetting khong doi", async () => {
		const { z } = mang({ getMe: 401 });
		const truoc = await cotZalo();
		const res = await goiCau(GOC_HTTPS, DUONG_BOT, { token: "12345:abc" });
		const than = await res.json();
		expect(than.outcome).toBe("invalid");
		expect(String(than.reason)).toContain("Zalo không nhận token này");
		expect(z.soGoi("setWebhook"), "khong setWebhook").toBe(0);
		expect(await cotZalo(), "AppSetting khong doi").toEqual(truoc);
	});

	test("token-sai: doi chung duong, getMe 200 -> co setWebhook", async () => {
		const { z } = mang();
		await goiCau(GOC_HTTPS, DUONG_BOT, { token: "12345:abc" });
		expect(z.soGoi("setWebhook")).toBe(1);
	});

	test("can-https: goc http -> luu token, khong setWebhook, ly do can-https", async () => {
		const { z } = mang();
		const res = await goiCau(GOC_HTTP, DUONG_BOT, { token: TOK_T });
		const than = await res.json();
		expect(
			{ getMe: z.soGoi("getMe"), setWebhook: z.soGoi("setWebhook") },
			"http thi khong setWebhook",
		).toEqual({ getMe: 1, setWebhook: 0 });
		const c = await cotZalo();
		expect({
			token: c.zaloBotToken,
			ten: c.zaloBotName,
			url: c.zaloWebhookUrl,
			lyDo: c.zaloWebhookLyDo,
			webhook: than.webhook,
		}).toEqual({
			token: TOK_T,
			ten: "Bot OneHub",
			url: null,
			lyDo: "can-https",
			webhook: "can-https",
		});
	});

	test("quyen-cau: hai route x ba header sai -> 401, khong goi Zalo, AppSetting khong doi", async () => {
		const { z } = mang();
		const truoc = await cotZalo();
		const thucTe: Record<string, number> = {};
		for (const duong of [DUONG_BOT, DUONG_GUI_THU]) {
			for (const auth of [null, "Bearer ", "Bearer sai"]) {
				const than = duong === DUONG_BOT ? { token: TOK_T } : { userId: "x" };
				const res = await goiCau(GOC_HTTPS, duong, than, auth);
				thucTe[`${duong} ${auth ?? "(khong)"}`] = res.status;
			}
		}
		expect(Object.values(thucTe), "sau o deu 401").toEqual([
			401, 401, 401, 401, 401, 401,
		]);
		expect(z.goi.length, "khong goi Zalo").toBe(0);
		expect(await cotZalo(), "AppSetting khong doi").toEqual(truoc);
	});

	test("quyen-cau: doi chung duong, Bearer dung -> khong 401", async () => {
		mang();
		const a = await goiCau(GOC_HTTPS, DUONG_BOT, { token: TOK_T });
		const b = await goiCau(GOC_HTTPS, DUONG_GUI_THU, { userId: "x" });
		expect([a.status, b.status]).toEqual([200, 200]);
	});

	test("trang-thai-webhook: dang ky lai bang token dang luu, khoa moi thay khoa cu", async () => {
		const { z } = mang();
		await datCaiDat({ zaloBotToken: TOK_T, zaloWebhookSecret: KHOA_CU });
		await goiCau(GOC_HTTPS, DUONG_BOT, {});
		const dat = z.goi.filter((g) => g.method === "setWebhook");
		expect(dat.length, "dung mot setWebhook").toBe(1);
		expect(dat[0]?.token, "dung token dang luu").toBe(TOK_T);
		const khoaMoi = dat[0]?.body.secret_token ?? "";
		expect(khoaMoi, "khoa moi khac khoa cu").not.toBe(KHOA_CU);
		const guiVoi = async (khoa: string, so: string) => {
			const than = JSON.stringify(
				thanWebhook({ messageId: `dkl-${so}`, fromId: "Z", text: "chao" }),
			);
			const res = await voiBien(
				{ ZALO_BOT_TOKEN: "", ZALO_WEBHOOK_SECRET: "" },
				() =>
					nhanWebhook(yeuCauWebhook(than, khoa).request, {
						fetcher: z.fetcher,
						now: () => GOC,
					}),
			);
			return res.status;
		};
		expect(
			[await guiVoi(KHOA_CU, "cu"), await guiVoi(khoaMoi, "moi")],
			"khoa cu 403, khoa moi 200",
		).toEqual([403, 200]);
	});

	test("gui-thu: U Zalo, V Slack, W khong kenh -> dung kenh, khong tao AgentTask", async () => {
		const { z, s } = mang();
		await datCaiDat({ zaloBotToken: TOK_T, zaloBotName: "Bot OneHub" });
		const U = await gieoNguoi("Uyen Gui Thu");
		const V = await gieoNguoi("Vinh Gui Thu");
		const W = await gieoNguoi("Wai Gui Thu");
		await db.zaloLink.create({
			data: { crmUserId: U.id, zaloUserId: "ZU", zaloDisplayName: "Zalo U" },
		});
		await noiSlack(V.id);
		await khopSlack(V.id, "SV");
		try {
			const truoc = await db.agentTask.count();
			const ket: Record<string, GuiThuPhanHoi["kenh"]> = {};
			for (const [ten, nguoi] of [
				["U", U],
				["V", V],
				["W", W],
			] as const) {
				const res = await goiCau(GOC_HTTPS, DUONG_GUI_THU, {
					userId: nguoi.id,
				});
				ket[ten] = guiThuPhanHoi.parse(await res.json()).kenh;
			}
			expect(ket, "kenh tung nguoi").toEqual({
				U: "zalo",
				V: "slack",
				W: null,
			});
			const guiU = z.guiToi("ZU");
			expect(guiU.length, "U mot sendMessage").toBe(1);
			expect(guiU[0]?.body.text ?? "").toContain("Tin thử từ OneHub Center");
			expect(z.soGoi("sendMessage"), "chi U nhan Zalo").toBe(1);
			expect(
				s.goi
					.filter((c) => c.url.endsWith("conversations.open"))
					.map((c) => c.body.users),
				"V mo DM Slack",
			).toEqual(["SV"]);
			expect(
				s.goi.filter((c) => c.url.endsWith("chat.postMessage")).length,
				"V mot tin Slack",
			).toBe(1);
			expect(await db.agentTask.count(), "khong tao AgentTask").toBe(truoc);
		} finally {
			await db.slackMemberMatch.deleteMany({ where: { crmUserId: V.id } });
			await db.account.deleteMany({ where: { userId: V.id } });
		}
	});
});

async function guiTinWebhook(
	z: ReturnType<typeof zaloGia>,
	messageId: string,
	fromId: string,
	text: string,
	ten?: string,
): Promise<number> {
	const than = JSON.stringify(thanWebhook({ messageId, fromId, text, ten }));
	const res = await voiBien(
		{ ZALO_BOT_TOKEN: TOK_T, ZALO_WEBHOOK_SECRET: KHOA_B },
		() =>
			nhanWebhook(yeuCauWebhook(than, KHOA_B).request, {
				fetcher: z.fetcher,
				now: () => GOC,
			}),
	);
	return res.status;
}

async function batLog(chay: () => Promise<unknown>): Promise<string[]> {
	const loi: string[] = [];
	const goc = console.error;
	console.error = (...m: unknown[]) => {
		loi.push(m.map(String).join(" "));
	};
	try {
		await chay();
	} finally {
		console.error = goc;
	}
	return loi;
}

async function demTin(messageId: string, crmUserId: string) {
	return {
		seen: await db.zaloUpdateSeen.count({ where: { messageId } }),
		link: await db.zaloLink.count({ where: { crmUserId } }),
	};
}

describe("tin-den", () => {
	test("db-loi: transaction noi hong -> 500, khong seen, gui lai khi lanh -> noi dung mot lan", async () => {
		const U = await gieoNguoi("Uyen Db Loi");
		const { ma } = await taoMaLienKet(db, U.id, GOC);
		const z = zaloGia();
		await db.$executeRawUnsafe(
			`CREATE OR REPLACE FUNCTION nzm_chan() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'nzm-chan'; END $$ LANGUAGE plpgsql`,
		);
		await db.$executeRawUnsafe(
			`CREATE TRIGGER nzm_chan BEFORE INSERT ON "zaloLink" FOR EACH ROW EXECUTE FUNCTION nzm_chan()`,
		);
		let lan1: number;
		try {
			lan1 = await guiTinWebhook(z, "dl-1", "ZD", ma);
		} finally {
			await db.$executeRawUnsafe(
				`DROP TRIGGER IF EXISTS nzm_chan ON "zaloLink"`,
			);
			await db.$executeRawUnsafe(`DROP FUNCTION IF EXISTS nzm_chan()`);
		}
		expect(
			{
				status: lan1,
				...(await demTin("dl-1", U.id)),
				gui: z.soGoi("sendMessage"),
			},
			"DB loi: 500, khong seen, khong link, khong gui",
		).toEqual({ status: 500, seen: 0, link: 0, gui: 0 });
		const lan2 = await guiTinWebhook(z, "dl-1", "ZD", ma);
		expect(
			{
				status: lan2,
				...(await demTin("dl-1", U.id)),
				gui: z.soGoi("sendMessage"),
			},
			"tin gap DB loi phai xu ly lai duoc",
		).toEqual({ status: 200, seen: 1, link: 1, gui: 1 });
	});

	test("gui-hong: noi xong ma gui hong -> 200, co link va seen, mot dong log; gui lai khong gui them", async () => {
		const U = await gieoNguoi("Uyen Gui Hong");
		const { ma } = await taoMaLienKet(db, U.id, GOC);
		const z = zaloGia({ send: 500 });
		let lan1 = 0;
		const log = await batLog(async () => {
			lan1 = await guiTinWebhook(z, "gh-1", "ZG", ma);
		});
		expect(
			{ status: lan1, ...(await demTin("gh-1", U.id)) },
			"gui hong van tinh la xong",
		).toEqual({ status: 200, seen: 1, link: 1 });
		expect(
			log.filter((d) => d.includes("message_id=gh-1")),
			"mot dong log chua message_id",
		).toHaveLength(1);
		const guiTruoc = z.soGoi("sendMessage");
		const lan2 = await guiTinWebhook(z, "gh-1", "ZG", ma);
		expect(
			{
				status: lan2,
				gui: z.soGoi("sendMessage"),
				...(await demTin("gh-1", U.id)),
			},
			"gui lai khong gui them",
		).toEqual({ status: 200, gui: guiTruoc, seen: 1, link: 1 });
	});

	test("gui-hong: doi chung duong, gui ok -> khong dong log loi", async () => {
		const U = await gieoNguoi("Uyen Gui Ok");
		const { ma } = await taoMaLienKet(db, U.id, GOC);
		const z = zaloGia();
		const log = await batLog(() => guiTinWebhook(z, "go-1", "ZO", ma));
		expect(log.filter((d) => d.includes("message_id=go-1"))).toHaveLength(0);
	});

	test("da-noi-roi: nguoi da noi nhan chu -> ban da noi voi <ten>, 08:30; nguoi chua noi -> huong dan", async () => {
		const U = await db.user.update({
			where: { id: (await gieoNguoi("x")).id },
			data: { name: "Phan Lê Mạnh" },
		});
		await db.zaloLink.create({
			data: { crmUserId: U.id, zaloUserId: "ZM", zaloDisplayName: "Mạnh" },
		});
		const z = zaloGia();
		await guiTinWebhook(z, "dn-1", "ZM", "xin chào");
		await guiTinWebhook(z, "dn-2", "ZY", "xin chào");
		const toiZ = z.guiToi("ZM");
		expect(toiZ.length, "Z nhan dung mot tin").toBe(1);
		const chu = toiZ[0]?.body.text ?? "";
		expect(chu).toContain("Bạn đã nối với Phan Lê Mạnh");
		expect(chu).toContain("08:30");
		expect(chu.includes(ZALO.loi.huongDan), "khong phai cau huong dan").toBe(
			false,
		);
		expect(
			await db.zaloLinkAttempt.findUnique({ where: { zaloUserId: "ZM" } }),
			"bo dem sai cua Z khong tang",
		).toBeNull();
		expect(z.guiToi("ZY")[0]?.body.text, "Y chua noi nhan huong dan").toBe(
			ZALO.loi.huongDan,
		);
	});

	test("da-noi-roi: nguoi da noi nhan mot ma da dung -> ghi sai, nhan huong dan", async () => {
		const U = await gieoNguoi("Uyen Ma Cu");
		const { ma } = await taoMaLienKet(db, U.id, GOC);
		const z = zaloGia();
		await guiTinWebhook(z, "mc-1", "ZC", ma);
		await guiTinWebhook(z, "mc-2", "ZC", ma);
		const tin = z.guiToi("ZC").map((g) => g.body.text ?? "");
		expect(tin[1], "ma da dung la ma hong").toBe(ZALO.loi.huongDan);
		const dem = await db.zaloLinkAttempt.findUnique({
			where: { zaloUserId: "ZC" },
		});
		expect(dem?.failures, "bo dem sai tang 1").toBe(1);
	});
});

describe("dang-ky-thu-tu", () => {
	let traLai: (() => void) | null = null;
	afterEach(() => {
		traLai?.();
		traLai = null;
	});

	function mang2(chon: ChonZaloGia = {}): MangGia {
		const m = { z: zaloGia(chon), s: slackGia() };
		traLai?.();
		traLai = thayFetchHai(m);
		return m;
	}

	let soGoiThu = 0;
	async function goiThuWebhook(_url: string, khoa: string): Promise<number> {
		soGoiThu += 1;
		const than = JSON.stringify(
			thanWebhook({ messageId: `gn-${soGoiThu}`, fromId: "ZG", text: "chao" }),
		);
		const res = await nhanWebhook(yeuCauWebhook(than, khoa).request, {
			fetcher: zaloGia().fetcher,
			now: () => GOC,
		});
		return res.status;
	}

	test("goi-nguoc: a Zalo goi thu trong luc setWebhook -> 200, url duoc ghi", async () => {
		const { z } = mang2({ goiNguoc: goiThuWebhook });
		await goiCau(GOC_HTTPS, DUONG_BOT, { token: TOK_T });
		const c = await cotZalo();
		expect(z.goiNguoc, "Zalo goi thu phai gap khoa moi").toEqual([200]);
		expect({ url: c.zaloWebhookUrl, lyDo: c.zaloWebhookLyDo }).toEqual({
			url: "https://tac-tu.test/zalo/webhook",
			lyDo: null,
		});
	});

	test("goi-nguoc: b xac minh hong -> zalo-tu-choi, url null, khong bao da dang ky", async () => {
		mang2({ setWebhook: { outcome: "webhook.failed" } });
		const res = await goiCau(GOC_HTTPS, DUONG_BOT, { token: TOK_T });
		const than = await res.json();
		const c = await cotZalo();
		expect(
			{
				lyDo: c.zaloWebhookLyDo,
				url: c.zaloWebhookUrl,
				outcome: than.outcome,
				webhook: than.webhook ?? null,
			},
			"xac minh hong khong bao da dang ky",
		).toEqual({
			lyDo: "zalo-tu-choi",
			url: null,
			outcome: "valid",
			webhook: "zalo-tu-choi",
		});
	});

	test("goi-nguoc: c da co url, dang ky lai ma xac minh hong -> url null, giu khoa Zalo vua nhan", async () => {
		const { z } = mang2({ setWebhook: { outcome: "webhook.failed" } });
		await datCaiDat({ zaloBotToken: TOK_T, zaloWebhookSecret: KHOA_CU });
		await db.appSetting.update({
			where: { id: SETTINGS_ID },
			data: { zaloWebhookUrl: "https://u.test/zalo/webhook" },
		});
		const res = await goiCau(GOC_HTTPS, DUONG_BOT, {});
		const than = await res.json();
		const c = await cotZalo();
		const khoaZaloGiu = z.goi.find((g) => g.method === "setWebhook")?.body
			.secret_token;
		expect(
			{
				url: c.zaloWebhookUrl,
				lyDo: c.zaloWebhookLyDo,
				token: c.zaloBotToken,
				khoa: c.zaloWebhookSecret,
				outcome: than.outcome,
			},
			"xac minh hong khi da co url: url null, khoa theo Zalo",
		).toEqual({
			url: null,
			lyDo: "zalo-tu-choi",
			token: TOK_T,
			khoa: khoaZaloGiu ?? "?",
			outcome: "valid",
		});
	});

	const CACH_GOI = [
		["dang-ky-lai", {}],
		["token-moi", { token: "777:moi" }],
	] as const;
	const CACH_HONG = ["ok-false", "loi-mang"] as const;

	test("dang-ky-hong: 2 cach goi x 2 cach hong -> giu token va khoa dang dung", async () => {
		type OHong = {
			token: string | null;
			khoa: string | null;
			lyDo: string | null;
			khoaCu: number;
			outcome: string;
		};
		const thucTe: Record<string, OHong> = {};
		for (const [tenGoi, than] of CACH_GOI) {
			for (const hong of CACH_HONG) {
				const { z } = mang2({ setWebhook: hong });
				await datCaiDat({ zaloBotToken: TOK_T, zaloWebhookSecret: KHOA_CU });
				await db.appSetting.update({
					where: { id: SETTINGS_ID },
					data: { zaloWebhookUrl: "https://u.test/zalo/webhook" },
				});
				const res = await goiCau(GOC_HTTPS, DUONG_BOT, than);
				const phanHoi = await res.json();
				const c = await cotZalo();
				const tin = JSON.stringify(
					thanWebhook({
						messageId: `dh-${tenGoi}-${hong}`,
						fromId: "ZH",
						text: "chao",
					}),
				);
				const voiKhoaCu = await voiBien(
					{ ZALO_BOT_TOKEN: "", ZALO_WEBHOOK_SECRET: "" },
					() =>
						nhanWebhook(yeuCauWebhook(tin, KHOA_CU).request, {
							fetcher: z.fetcher,
							now: () => GOC,
						}),
				);
				thucTe[`${tenGoi}/${hong}`] = {
					token: c.zaloBotToken,
					khoa: c.zaloWebhookSecret,
					lyDo: c.zaloWebhookLyDo,
					khoaCu: voiKhoaCu.status,
					outcome: String(phanHoi.outcome),
				};
				await donZalo();
			}
		}
		console.table(thucTe);
		const moiO = {
			token: TOK_T,
			khoa: KHOA_CU,
			lyDo: "zalo-tu-choi",
			khoaCu: 200,
			outcome: "invalid",
		};
		expect(thucTe, "dang ky hong giu khoa dang dung").toEqual({
			"dang-ky-lai/ok-false": moiO,
			"dang-ky-lai/loi-mang": moiO,
			"token-moi/ok-false": moiO,
			"token-moi/loi-mang": moiO,
		});
	});

	test("dang-ky-hong: doi chung duong, setWebhook ok -> token va khoa doi sang moi", async () => {
		const { z } = mang2();
		await datCaiDat({ zaloBotToken: TOK_T, zaloWebhookSecret: KHOA_CU });
		await goiCau(GOC_HTTPS, DUONG_BOT, { token: "777:moi" });
		const c = await cotZalo();
		const khoaMoi = z.goi.find((g) => g.method === "setWebhook")?.body
			.secret_token;
		expect({ token: c.zaloBotToken, khoa: c.zaloWebhookSecret }).toEqual({
			token: "777:moi",
			khoa: khoaMoi ?? "?",
		});
	});

	test("nhip-tron: getWebhookInfo 500 -> giu url, ghi zaloPolledAt moi, don seen cu", async () => {
		const cuQua = new Date(Date.now() - ZALO.poll.giuDauMs - 60_000);
		const moc = new Date(Date.now() - 60_000);
		await datCaiDat({ zaloBotToken: "1:abc" });
		await db.appSetting.update({
			where: { id: SETTINGS_ID },
			data: {
				zaloWebhookUrl: "https://u.test/zalo/webhook",
				zaloPolledAt: moc,
			},
		});
		await db.zaloUpdateSeen.create({
			data: { messageId: "nt-cu", seenAt: cuQua },
		});
		const traLaiNhip = thayFetchZalo(zaloGia({ webhookInfo: 500 }));
		try {
			await voiBien({ ZALO_BOT_TOKEN: "", ZALO_WEBHOOK_SECRET: "" }, () =>
				chayNhipDispatch(),
			);
		} finally {
			traLaiNhip();
		}
		const s = await db.appSetting.findUnique({ where: { id: SETTINGS_ID } });
		expect(
			{
				url: s?.zaloWebhookUrl,
				polledMoi: (s?.zaloPolledAt?.getTime() ?? 0) > moc.getTime(),
				seenCu: await db.zaloUpdateSeen.count({
					where: { messageId: "nt-cu" },
				}),
			},
			"nhip chay tron khi getWebhookInfo 500",
		).toEqual({
			url: "https://u.test/zalo/webhook",
			polledMoi: true,
			seenCu: 0,
		});
	});
});
