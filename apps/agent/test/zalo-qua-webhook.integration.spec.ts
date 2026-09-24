import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { SETTINGS_ID } from "@crm/db/settings";
import { taoMaLienKet } from "@crm/db/zalo-lien-ket";
import { ZALO } from "../agent/lib/zalo-config";
import { pollZalo, vongTay } from "../agent/lib/zalo-poll";
import dispatch from "../agent/schedules/dispatch";
import { donDep, gieoNguoi, moXuong, TIEN_TO } from "./support/nhac-gieo";
import { zaloGia } from "./support/zalo-gia";
import { thanGetUpdates } from "./support/zalo-tin";

const GOC = new Date("2026-10-10T02:00:00Z");
const TOKEN = "1:abc";
const KHOA = "khoa-webhook-du-dai";
const GIAY_TIN_DEN = 30;
const NHIP_CU = [0, 60, 120];
const HET_DONG_HO = 180;

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

async function gieoMa() {
	const U = await gieoNguoi("Uyen Webhook");
	const { ma } = await taoMaLienKet(db, U.id, GOC);
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
			vongTay({ fetcher: z.fetcher, conTiep: () => z.dongHo() < HET_DONG_HO }),
		);
		expect(
			(await db.zaloLink.findMany({ where: { crmUserId: U.id } })).map(
				(l) => l.zaloUserId,
			),
			"vong tay bat duoc tin",
		).toEqual(["Z2"]);
	});
});
