import { afterEach, describe, expect, it } from "bun:test";
import { Prisma, RateSource } from "@crm/db";
import { RatesService } from "../src/currency/rates.service";

const THAT = {
	USD: 1,
	VND: 26003.678815,
	AUD: 1.38969,
	CAD: 1.37927,
	CHF: 0.80821,
	CNY: 6.73549,
	EUR: 0.85971,
	GBP: 0.74612,
	HKD: 7.78,
	JPY: 156.019704,
	SGD: 1.28,
	ZAR: 17.55,
};

function lamTron(gia_tri: number): number {
	return Number(gia_tri.toFixed(6));
}

function nguon(goc: string) {
	const rates: Record<string, number> = {};
	for (const [ma, tren_usd] of Object.entries(THAT)) {
		rates[ma] = lamTron(tren_usd / THAT[goc as keyof typeof THAT]);
	}
	return {
		result: "success",
		time_last_update_unix: 1_767_225_600,
		rates,
	};
}

const goiTay: string[] = [];

function gaNguon() {
	goiTay.length = 0;
	globalThis.fetch = (async (url: string | URL) => {
		const duong = String(url);
		const goc = duong.slice(duong.lastIndexOf("/") + 1);
		goiTay.push(goc);
		return new Response(JSON.stringify(nguon(goc)), {
			status: 200,
			headers: { "content-type": "application/json" },
		});
	}) as typeof fetch;
}

function gaDb(reportingCurrency: string) {
	const daGhi = new Map<string, Prisma.Decimal>();

	const db = {
		appSetting: {
			findUnique: async () => ({ reportingCurrency }),
			upsert: async () => ({}),
		},
		exchangeRate: {
			upsert: async ({
				where,
				create,
			}: {
				where: {
					baseCurrency_quoteCurrency_source: { quoteCurrency: string };
				};
				create: { rate: Prisma.Decimal };
			}) => {
				daGhi.set(
					where.baseCurrency_quoteCurrency_source.quoteCurrency,
					create.rate,
				);
				return {};
			},
			deleteMany: async () => ({ count: 0 }),
		},
	};

	return { db, daGhi };
}

const goc = globalThis.fetch;

afterEach(() => {
	globalThis.fetch = goc;
});

describe("lay ty gia cho mot dong tien don vi nho", () => {
	it("hoi nguon bang mot goc co do chinh xac, khong bang chinh dong tien bao cao", async () => {
		gaNguon();
		const { db } = gaDb("VND");

		await new RatesService(db as never).refresh();

		expect(goiTay).toEqual(["USD"]);
	});

	it("khong de hai dong tien khac nhau sap vao cung mot ty gia", async () => {
		gaNguon();
		const { db, daGhi } = gaDb("VND");

		await new RatesService(db as never).refresh();

		const aud = daGhi.get("AUD");
		const cad = daGhi.get("CAD");

		expect(aud).toBeDefined();
		expect(cad).toBeDefined();
		expect(aud?.toString()).not.toBe(cad?.toString());
	});

	it("ty gia khop voi phep tinh cheo qua goc, trong mot phan nghin", async () => {
		gaNguon();
		const { db, daGhi } = gaDb("VND");

		await new RatesService(db as never).refresh();

		for (const ma of ["USD", "AUD", "CAD", "CHF", "CNY", "EUR"] as const) {
			const dung = THAT.VND / THAT[ma];
			const doDuoc = Number(daGhi.get(ma)?.toString() ?? Number.NaN);
			expect(Math.abs(doDuoc - dung) / dung).toBeLessThan(0.001);
		}
	});

	it("goc la do la thi ket qua khong doi so voi truoc", async () => {
		gaNguon();
		const { db, daGhi } = gaDb("USD");

		await new RatesService(db as never).refresh();

		const eur = Number(daGhi.get("EUR")?.toString() ?? Number.NaN);
		expect(Math.abs(eur - 1 / THAT.EUR) / (1 / THAT.EUR)).toBeLessThan(0.001);
	});
});

export { RateSource };
