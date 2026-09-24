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
import { chayNhac, lenLichNhac } from "../agent/lib/nhac-ke-hoach";
import { kiemBot } from "../agent/lib/zalo-bot";
import { ZALO } from "../agent/lib/zalo-config";
import { pollZalo } from "../agent/lib/zalo-poll";
import { nhanWebhook } from "../agent/lib/zalo-webhook";
import dispatch from "../agent/schedules/dispatch";
import { donDep, moXuong, slackGia, TIEN_TO } from "./support/nhac-gieo";
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

type BienZalo = "ZALO_BOT_TOKEN" | "ZALO_WEBHOOK_SECRET" | "ZALO_API_URL";

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
