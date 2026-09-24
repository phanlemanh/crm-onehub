import { afterAll, afterEach, beforeEach, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { SETTINGS_ID } from "@crm/db/settings";
import type { DatBotYeuCau } from "@crm/validation/zalo-cau-noi";
import kenhZalo from "../agent/channels/zalo";
import { kiemBot } from "../agent/lib/zalo-bot";
import { ZALO } from "../agent/lib/zalo-config";
import { type ChonZaloGia, zaloGia } from "./support/zalo-gia";

const BI_MAT = "bi-mat-goi-thu-hong";
const GOC_HTTPS = "https://tac-tu.test";
const DUONG_BOT = "/internal/zalo/bot";
const URL_TAC_TU = `${GOC_HTTPS}${ZALO.webhook.duong}`;
const TOK_CU = "111:bot-cu";
const TOK_MOI = "222:bot-moi";
const KHOA_CU = "khoa-cu-du-dai-8";
const TEN_CU = "Bot Cũ";
const TEN_MOI = "Bot Mới";
const URL_CU = "https://u-cu.test/zalo/webhook";
const URL_ZALO = "https://u-zalo.test/zalo/webhook";

type BienZalo =
	| "ZALO_BOT_TOKEN"
	| "ZALO_WEBHOOK_SECRET"
	| "ZALO_API_URL"
	| "AGENT_BRIDGE_SECRET";

type Cot = {
	token: string | null;
	khoa: string | null;
	ten: string | null;
	url: string | null;
	lyDo: string | null;
};

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

const KHONG_ENV = {
	ZALO_BOT_TOKEN: "",
	ZALO_WEBHOOK_SECRET: "",
	ZALO_API_URL: undefined,
	AGENT_BRIDGE_SECRET: BI_MAT,
} satisfies Partial<Record<BienZalo, string | undefined>>;

async function donZalo(): Promise<void> {
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

async function gieo(cot: Partial<Cot>): Promise<void> {
	const data = {
		zaloBotToken: cot.token ?? null,
		zaloWebhookSecret: cot.khoa ?? null,
		zaloBotName: cot.ten ?? null,
		zaloWebhookUrl: cot.url ?? null,
		zaloWebhookLyDo: cot.lyDo ?? null,
	};
	await db.appSetting.upsert({
		where: { id: SETTINGS_ID },
		create: { id: SETTINGS_ID, ...data },
		update: data,
	});
}

const BOT_CU: Cot = {
	token: TOK_CU,
	khoa: KHOA_CU,
	ten: TEN_CU,
	url: URL_CU,
	lyDo: null,
};

async function docCot(): Promise<Cot> {
	const s = await db.appSetting.findUnique({ where: { id: SETTINGS_ID } });
	return {
		token: s?.zaloBotToken ?? null,
		khoa: s?.zaloWebhookSecret ?? null,
		ten: s?.zaloBotName ?? null,
		url: s?.zaloWebhookUrl ?? null,
		lyDo: s?.zaloWebhookLyDo ?? null,
	};
}

function routeBot() {
	const ds = kenhZalo.routes.filter(
		(r) => r.method === "POST" && r.path === DUONG_BOT,
	);
	expect(ds.length, "route dat bot mount dung mot").toBe(1);
	const r = ds[0];
	if (!r) throw new Error("thieu route dat bot");
	return r;
}

function thayFetch(z: ReturnType<typeof zaloGia>): () => void {
	const cu = globalThis.fetch;
	globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
		if (String(input).startsWith(ZALO.api)) return z.fetcher(input, init);
		return new Response("", { status: 503 });
	}) as typeof fetch;
	return () => {
		globalThis.fetch = cu;
	};
}

type PhanHoi = {
	outcome: string;
	tenBot?: string;
	webhook?: string;
	reason?: string;
};

async function goiRoute(
	than: DatBotYeuCau,
	chon: ChonZaloGia,
): Promise<{ phanHoi: PhanHoi; tho: string; z: ReturnType<typeof zaloGia> }> {
	const z = zaloGia({ tenBot: TEN_MOI, ...chon });
	const traLai = thayFetch(z);
	try {
		const req = new Request(`${GOC_HTTPS}${DUONG_BOT}`, {
			method: "POST",
			headers: {
				authorization: `Bearer ${BI_MAT}`,
				"content-type": "application/json",
			},
			body: JSON.stringify(than),
		});
		const res = await voiBien(KHONG_ENV, async () =>
			routeBot().handler(req, {} as never),
		);
		if (!(res instanceof Response)) throw new Error("route khong tra Response");
		const tho = await res.text();
		return { phanHoi: JSON.parse(tho) as PhanHoi, tho, z };
	} finally {
		traLai();
	}
}

function khoaZaloNhan(z: ReturnType<typeof zaloGia>): string | null {
	return (
		z.goi.find((g) => g.method === "setWebhook")?.body.secret_token ?? null
	);
}

const CHON_KET_QUA = {
	"goi-thu-duoc": { setWebhook: { outcome: ZALO.webhook.xacMinhOk } },
	"goi-thu-hong": { setWebhook: { outcome: "webhook.failed" } },
	"ok-false": { setWebhook: "ok-false" },
	"loi-mang": { setWebhook: "loi-mang" },
} satisfies Record<string, ChonZaloGia>;
type KetQua = keyof typeof CHON_KET_QUA;
const KET_QUA = Object.keys(CHON_KET_QUA) as KetQua[];

const CACH_GOI = {
	"token-moi": { truoc: BOT_CU, than: { token: TOK_MOI } },
	"lan-dau": { truoc: null, than: { token: TOK_MOI } },
	"dang-ky-lai": { truoc: BOT_CU, than: {} },
} satisfies Record<string, { truoc: Cot | null; than: DatBotYeuCau }>;
type CachGoi = keyof typeof CACH_GOI;
const CACH = Object.keys(CACH_GOI) as CachGoi[];

type O = Cot & { outcome: string; webhook: string | null; tenBot: string | null };

function kyVong(cach: CachGoi, ket: KetQua, khoaNhan: string | null): O {
	const { truoc, than } = CACH_GOI[cach];
	const tokenMoi = "token" in than ? than.token : TOK_CU;
	if (ket === "goi-thu-duoc" || ket === "goi-thu-hong") {
		const hong = ket === "goi-thu-hong";
		return {
			token: tokenMoi,
			khoa: khoaNhan,
			ten: TEN_MOI,
			url: hong ? null : URL_TAC_TU,
			lyDo: hong ? "zalo-tu-choi" : null,
			outcome: "valid",
			webhook: hong ? "zalo-tu-choi" : "da-dang-ky",
			tenBot: TEN_MOI,
		};
	}
	return {
		token: truoc?.token ?? null,
		khoa: truoc?.khoa ?? null,
		ten: truoc?.ten ?? null,
		url: truoc?.url ?? null,
		lyDo: "zalo-tu-choi",
		outcome: "invalid",
		webhook: null,
		tenBot: null,
	};
}

beforeEach(donZalo);
afterEach(donZalo);
afterAll(donZalo);

describe("luu-bot-moi", () => {
	test("luu-bot-moi: token moi, Zalo nhan nhung goi thu hong -> da luu bot moi, bao valid zalo-tu-choi", async () => {
		await gieo(BOT_CU);
		const { phanHoi, tho, z } = await goiRoute(
			{ token: TOK_MOI },
			CHON_KET_QUA["goi-thu-hong"],
		);
		const c = await docCot();
		expect(
			{
				outcome: phanHoi.outcome,
				tenBot: phanHoi.tenBot ?? null,
				webhook: phanHoi.webhook ?? null,
				coToken: tho.includes(TOK_MOI),
				token: c.token,
				ten: c.ten,
				khoaLaKhoaZaloNhan: c.khoa !== null && c.khoa === khoaZaloNhan(z),
				url: c.url,
				lyDo: c.lyDo,
			},
			"goi thu hong van da luu bot moi",
		).toEqual({
			outcome: "valid",
			tenBot: TEN_MOI,
			webhook: "zalo-tu-choi",
			coToken: false,
			token: TOK_MOI,
			ten: TEN_MOI,
			khoaLaKhoaZaloNhan: true,
			url: null,
			lyDo: "zalo-tu-choi",
		});
	});

	test("luu-bot-moi: doi chung, goi thu duoc -> da-dang-ky", async () => {
		await gieo(BOT_CU);
		const { phanHoi } = await goiRoute(
			{ token: TOK_MOI },
			CHON_KET_QUA["goi-thu-duoc"],
		);
		expect(phanHoi.webhook, "goi thu duoc thi da dang ky").toBe("da-dang-ky");
	});
});

describe("ma-tran-goi", () => {
	test("ma-tran-goi: 3 cach goi x 4 ket qua Zalo, bang viet truoc", async () => {
		const thucTe: Record<string, O> = {};
		const mongDoi: Record<string, O> = {};
		for (const cach of CACH) {
			for (const ket of KET_QUA) {
				await donZalo();
				const { truoc, than } = CACH_GOI[cach];
				if (truoc) await gieo(truoc);
				const { phanHoi, z } = await goiRoute(than, CHON_KET_QUA[ket]);
				const o = `${cach}/${ket}`;
				thucTe[o] = {
					...(await docCot()),
					outcome: phanHoi.outcome,
					webhook: phanHoi.webhook ?? null,
					tenBot: phanHoi.tenBot ?? null,
				};
				mongDoi[o] = kyVong(cach, ket, khoaZaloNhan(z));
			}
		}
		expect(Object.keys(mongDoi), "du 12 o").toHaveLength(
			CACH.length * KET_QUA.length,
		);
		expect(thucTe, "ma tran goi x ket qua Zalo").toEqual(mongDoi);
	});
});

async function nhip(chon: ChonZaloGia): Promise<string> {
	const z = zaloGia(chon);
	return voiBien(KHONG_ENV, () => kiemBot({ fetcher: z.fetcher }));
}

const TRANG_THAI = {
	i: { lyDo: null, url: null },
	ii: { lyDo: "zalo-tu-choi", url: null },
	iii: { lyDo: "zalo-tu-choi", url: URL_CU },
} satisfies Record<string, Pick<Cot, "lyDo" | "url">>;
type TrangThai = keyof typeof TRANG_THAI;

const TRA_LOI = {
	url: { url: URL_ZALO },
	"404": 404,
	"500": 500,
	la: "la",
} satisfies Record<string, ChonZaloGia["webhookInfo"]>;
type TraLoi = keyof typeof TRA_LOI;

const URL_SAU_NHIP = {
	i: { url: URL_ZALO, "404": null, "500": null, la: null },
	ii: { url: null, "404": null, "500": null, la: null },
	iii: { url: URL_CU, "404": null, "500": URL_CU, la: null },
} satisfies Record<TrangThai, Record<TraLoi, string | null>>;

describe("nhip-giu-co", () => {
	test("nhip-giu-co: 3 trang thai co x 4 tra loi getWebhookInfo, bang viet truoc", async () => {
		const thucTe: Record<string, { url: string | null; lyDo: string | null; ket: string }> = {};
		const mongDoi: typeof thucTe = {};
		for (const tt of Object.keys(TRANG_THAI) as TrangThai[]) {
			for (const tl of Object.keys(TRA_LOI) as TraLoi[]) {
				await donZalo();
				await gieo({ token: TOK_CU, ten: TEN_CU, ...TRANG_THAI[tt] });
				const ket = await nhip({ webhookInfo: TRA_LOI[tl] });
				const c = await docCot();
				thucTe[`${tt}/${tl}`] = { url: c.url, lyDo: c.lyDo, ket };
				mongDoi[`${tt}/${tl}`] = {
					url: URL_SAU_NHIP[tt][tl],
					lyDo: TRANG_THAI[tt].lyDo,
					ket: "song",
				};
			}
		}
		expect(Object.keys(mongDoi), "du 12 o").toHaveLength(12);
		expect(thucTe, "nhip giu co zalo-tu-choi").toEqual(mongDoi);
	});

	test("nhip-giu-co: 13 luu bot goi-thu-hong chen giua luc nhip doc va luc ghi -> co con", async () => {
		await gieo({ token: TOK_CU, ten: TEN_CU, lyDo: null, url: null });
		const zNhip = zaloGia({ webhookInfo: { url: URL_ZALO } });
		const chen = (async (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
			if (String(input).endsWith("/getWebhookInfo")) {
				await goiRoute({ token: TOK_MOI }, CHON_KET_QUA["goi-thu-hong"]);
			}
			return zNhip.fetcher(input, init);
		}) as typeof fetch;
		await voiBien(KHONG_ENV, () => kiemBot({ fetcher: chen }));
		const c = await docCot();
		expect(
			{ token: c.token, url: c.url, lyDo: c.lyDo },
			"nhip chen khong go co",
		).toEqual({ token: TOK_MOI, url: null, lyDo: "zalo-tu-choi" });
	});
});

describe("go-co", () => {
	test("go-co: dang ky lai goi thu duoc thi go co, nhip sau ghi url", async () => {
		await gieo(BOT_CU);
		await goiRoute({ token: TOK_MOI }, CHON_KET_QUA["goi-thu-hong"]);
		const { phanHoi } = await goiRoute({}, CHON_KET_QUA["goi-thu-duoc"]);
		const sauDangKy = await docCot();
		await nhip({ webhookInfo: { url: URL_ZALO } });
		const sauNhip = await docCot();
		expect(
			{
				url: sauDangKy.url,
				lyDo: sauDangKy.lyDo,
				outcome: phanHoi.outcome,
				webhook: phanHoi.webhook ?? null,
				urlSauNhip: sauNhip.url,
			},
			"dang ky lai thanh cong go co",
		).toEqual({
			url: URL_TAC_TU,
			lyDo: null,
			outcome: "valid",
			webhook: "da-dang-ky",
			urlSauNhip: URL_ZALO,
		});
	});

	test("go-co: doi chung, dang ky lai van goi thu hong -> sau nhip url van null", async () => {
		await gieo(BOT_CU);
		await goiRoute({ token: TOK_MOI }, CHON_KET_QUA["goi-thu-hong"]);
		await goiRoute({}, CHON_KET_QUA["goi-thu-hong"]);
		await nhip({ webhookInfo: { url: URL_ZALO } });
		const c = await docCot();
		expect({ url: c.url, lyDo: c.lyDo }, "co con khi van hong").toEqual({
			url: null,
			lyDo: "zalo-tu-choi",
		});
	});
});
