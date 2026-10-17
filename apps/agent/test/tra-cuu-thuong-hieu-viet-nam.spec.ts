import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	spyOn,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { readContextDevKey, writeContextDevKey } from "@crm/db/settings";
import { docBrandRaw } from "@crm/validation/brand-raw";
import ContextDev from "context.dev";
import type { BrandRetrieveResponse } from "context.dev/resources/brand";
import { z } from "zod";
import { brandOutcome, runBrand, type Spend } from "../agent/lib/brand";
import { CONTEXT } from "../agent/lib/context-config";
import { brandByDomain, brandByEmail } from "../agent/lib/context-dev";

const HAU_TO = (process.env.TEST_RUN_ID ?? "tthv-agent").toLowerCase();
const KHOA = `ctx-tthv-${HAU_TO}`;
const URL_BRAND = "https://api.context.dev/v1/brand/retrieve";

const thanYeuCau = z.object({
	type: z.string(),
	force_language: z.string().optional(),
});

type YeuCau = { url: string; than: z.infer<typeof thanYeuCau> | null };

const daGui: YeuCau[] = [];
let phanHoi: BrandRetrieveResponse = {};
const fetchThat = globalThis.fetch;
let khoaCu: string | null = null;
const congTyTao: string[] = [];

const BRAND_A = {
	brand: {
		domain: "meta.com",
		title: "Meta",
		description: "Meta is a global technology company.",
		industries: {
			eic: [{ industry: "Technology", subindustry: "Software (B2C)" }],
		},
		address: {
			city: "Menlo Park",
			state_code: "CA",
			country: "United States",
			country_code: "US",
		},
	},
} satisfies BrandRetrieveResponse;

const BRAND_B = {
	brand: {
		domain: "meta.com",
		title: "Meta B",
		description: "Meta là công ty công nghệ toàn cầu.",
		phone: "111",
		industries: {
			eic: [
				{
					industry: "Real Estate & PropTech",
					subindustry: "Real Estate Marketplaces",
				},
			],
		},
		address: { city: "Hà Nội", country: "Vietnam", country_code: "VN" },
	},
} satisfies BrandRetrieveResponse;

const BRAND_NULL = {
	brand: {
		domain: "null-thu.vn",
		title: "Null thu",
		description: "Mô tả có trường null.",
		primary_language: null,
		links: {
			blog: null,
			careers: null,
			contact: null,
			pricing: null,
			privacy: null,
			terms: null,
		},
	},
} satisfies BrandRetrieveResponse;

function demBrand(): number {
	return daGui.filter((y) => y.url === URL_BRAND).length;
}

function chiTieu() {
	let lan = 0;
	const spend: Spend = () => {
		lan += 1;
		return { ok: true };
	};
	return { spend, lan: () => lan };
}

async function congTy(domain: string, ten = domain) {
	await db.company.deleteMany({ where: { domain } });
	const row = await db.company.create({
		data: { name: ten, domain, website: `https://${domain}` },
		select: { id: true },
	});
	congTyTao.push(row.id);
	return row.id;
}

beforeAll(async () => {
	khoaCu = await readContextDevKey(db);
	await writeContextDevKey(db, KHOA);
	globalThis.fetch = (async (vao: RequestInfo | URL, init?: RequestInit) => {
		const url = vao instanceof Request ? vao.url : String(vao);
		const chuoi = z.string().safeParse(init?.body);
		const than = chuoi.success
			? thanYeuCau.parse(JSON.parse(chuoi.data))
			: null;
		daGui.push({ url, than });
		if (url !== URL_BRAND) return new Response("{}", { status: 404 });
		return new Response(JSON.stringify(phanHoi), {
			status: 200,
			headers: { "content-type": "application/json" },
		});
	}) as typeof fetch;
});

afterAll(async () => {
	globalThis.fetch = fetchThat;
	await writeContextDevKey(db, khoaCu ?? "");
	await db.companyEnrichment.deleteMany({
		where: { companyId: { in: congTyTao } },
	});
	await db.company.deleteMany({ where: { id: { in: congTyTao } } });
});

beforeEach(() => {
	daGui.length = 0;
	phanHoi = BRAND_A;
});

describe("ac5", () => {
	test("cong ty mang ten mien nen tang khong goi context.dev", async () => {
		const id = await congTy("facebook.com", `Titan ${HAU_TO}`);
		const { spend, lan } = chiTieu();

		await runBrand({ companyId: id, spend });
		await runBrand({ companyId: id, fresh: true, spend });

		expect(demBrand()).toBe(0);
		expect(lan()).toBe(0);
		const sau = await db.company.findUniqueOrThrow({
			where: { id },
			select: { enrichmentStatus: true, enrichmentError: true },
		});
		expect(sau.enrichmentStatus).toBe("SKIPPED");
		expect(sau.enrichmentError).toContain("Facebook");
	});

	test("doi chung duong: ten mien that goi dung mot lan", async () => {
		const id = await congTy(`tthv-that-${HAU_TO}.vn`);
		const { spend, lan } = chiTieu();

		await runBrand({ companyId: id, spend });

		expect(demBrand()).toBe(1);
		expect(lan()).toBe(1);
	});

	test("cong ty tao tu email linkedin cung bi bo qua", async () => {
		const id = await congTy("linkedin.com");
		const { spend, lan } = chiTieu();

		await runBrand({ companyId: id, spend });

		expect(demBrand()).toBe(0);
		expect(lan()).toBe(0);
		const sau = await db.company.findUniqueOrThrow({
			where: { id },
			select: { enrichmentStatus: true, enrichmentError: true },
		});
		expect(sau.enrichmentStatus).toBe("SKIPPED");
		expect(sau.enrichmentError).toContain("LinkedIn");
	});
});

describe("ac6", () => {
	test("tra theo ten mien va theo email deu xin tieng Viet", async () => {
		await brandByDomain("tthv-that.vn");
		await brandByEmail("a@tthv-that.vn");

		const gui = daGui.filter((y) => y.url === URL_BRAND);
		expect(gui.length).toBe(2);
		for (const y of gui) {
			expect(y.than?.force_language).toBe(CONTEXT.brandLanguage);
		}
		expect(gui.map((y) => y.than?.type)).toEqual(["by_domain", "by_email"]);
		expect(CONTEXT.brandLanguage).toBe("vietnamese");
	});

	test("chieu do: goi SDK tran khong truyen force_language", async () => {
		await new ContextDev({ apiKey: KHOA }).brand.retrieve({
			type: "by_domain",
			domain: "x.vn",
		});
		const gui = daGui.filter((y) => y.url === URL_BRAND);
		expect(gui.length).toBe(1);
		expect(gui[0]?.than?.type).toBe("by_domain");
		expect(
			gui[0]?.than?.force_language,
			"thieu force_language",
		).toBeUndefined();
	});
});

describe("ac7", () => {
	test("tra cuu lai thay truong may dien, giu truong rep sua", async () => {
		const mien = `tthv-lai-${HAU_TO}.vn`;
		const id = await congTy(mien);

		phanHoi = BRAND_A;
		await runBrand({ companyId: id });
		const sau1 = await db.company.findUniqueOrThrow({ where: { id } });
		expect(sau1.name).toBe("Meta");
		expect(sau1.description).toBe(BRAND_A.brand.description);
		expect(sau1.industry).toBe("Technology");
		expect(sau1.city).toBe("Menlo Park");

		await db.company.update({
			where: { id },
			data: { industry: "Bất động sản", phone: "0909" },
		});

		phanHoi = BRAND_B;
		await runBrand({ companyId: id, fresh: true });
		const sau2 = await db.company.findUniqueOrThrow({ where: { id } });
		expect(sau2.description).toBe(BRAND_B.brand.description);
		expect(sau2.city).toBe("Hà Nội");
		expect(sau2.country).toBe("Vietnam");
		expect(sau2.countryCode).toBe("VN");
		expect(sau2.industry).toBe("Bất động sản");
		expect(sau2.phone).toBe("0909");
		expect(sau2.name).toBe("Meta");
	});

	test("mau du truong co null", async () => {
		const id = await congTy(`tthv-null-${HAU_TO}.vn`);

		phanHoi = BRAND_NULL;
		await runBrand({ companyId: id });
		const raw = await db.companyEnrichment.findUniqueOrThrow({
			where: { companyId: id },
			select: { raw: true },
		});
		const doc = docBrandRaw(raw.raw);
		expect(doc.ok).toBe(true);

		expect(
			docBrandRaw({
				brand: {
					title: "Null",
					slogan: null,
					email: null,
					phone: null,
					address: { city: null, state_code: null, country_code: null },
					links: { pricing: null, careers: null },
				},
			}).ok,
		).toBe(true);

		phanHoi = BRAND_B;
		await runBrand({ companyId: id, fresh: true });
		const sau = await db.company.findUniqueOrThrow({ where: { id } });
		expect(sau.description).toBe(BRAND_B.brand.description);
	});

	test("raw hong khuon", async () => {
		const id = await congTy(`tthv-hong-${HAU_TO}.vn`);
		phanHoi = BRAND_A;
		await runBrand({ companyId: id });

		const canhBao = spyOn(console, "warn");
		try {
			phanHoi = BRAND_B;
			await runBrand({ companyId: id, fresh: true });
			const dongDung = canhBao.mock.calls.filter((goi) =>
				String(goi[0]).startsWith("brand raw unreadable:"),
			);
			expect(dongDung.length).toBe(0);

			await db.companyEnrichment.update({
				where: { companyId: id },
				data: { raw: { brand: 7 } },
			});
			await db.company.update({
				where: { id },
				data: { description: BRAND_A.brand.description },
			});
			canhBao.mockClear();

			await runBrand({ companyId: id, fresh: true });
			const dongHong = canhBao.mock.calls.filter((goi) =>
				String(goi[0]).startsWith("brand raw unreadable:"),
			);
			expect(dongHong.length).toBe(1);
			const sau = await db.company.findUniqueOrThrow({ where: { id } });
			expect(sau.description).toBe(BRAND_A.brand.description);
			expect(sau.enrichmentStatus).not.toBe("FAILED");
		} finally {
			canhBao.mockRestore();
		}
	});
});

const BRAND_KHONG_DIA_CHI = {
	brand: {
		domain: "meta.com",
		title: "Meta",
		description: "Mô tả không kèm địa chỉ.",
	},
} satisfies BrandRetrieveResponse;

const BRAND_A_DOI_MO_TA = {
	brand: { ...BRAND_A.brand, description: "Meta đổi mô tả." },
} satisfies BrandRetrieveResponse;

const OTHUONGHIEU = {
	description: true,
	industry: true,
	subIndustry: true,
	city: true,
	stateCode: true,
	country: true,
	countryCode: true,
	phone: true,
	email: true,
} as const;

describe("ac10", () => {
	test("dia chi thieu bang thi o bang may dien tro ve trong", async () => {
		const id = await congTy(`tthv-dc-${HAU_TO}.vn`);
		phanHoi = BRAND_A;
		await runBrand({ companyId: id });
		expect(
			(await db.company.findUniqueOrThrow({ where: { id } })).stateCode,
		).toBe("CA");

		phanHoi = BRAND_B;
		const ket = await runBrand({ companyId: id, fresh: true });
		const sau = await db.company.findUniqueOrThrow({ where: { id } });
		expect(sau.stateCode).toBeNull();
		expect(sau.city).toBe("Hà Nội");
		expect(sau.countryCode).toBe("VN");
		expect(ket.cleared).toEqual(["stateCode"]);
	});

	test("doi chung: bang rep tu go giu nguyen", async () => {
		const id = await congTy(`tthv-dc-go-${HAU_TO}.vn`);
		phanHoi = BRAND_A;
		await runBrand({ companyId: id });
		await db.company.update({ where: { id }, data: { stateCode: "HN" } });

		phanHoi = BRAND_B;
		await runBrand({ companyId: id, fresh: true });
		const sau = await db.company.findUniqueOrThrow({ where: { id } });
		expect(sau.stateCode).toBe("HN");
	});

	test("doi chung: ket qua moi khong co dia chi thi khong xoa", async () => {
		const id = await congTy(`tthv-dc-rong-${HAU_TO}.vn`);
		phanHoi = BRAND_A;
		await runBrand({ companyId: id });

		phanHoi = BRAND_KHONG_DIA_CHI;
		await runBrand({ companyId: id, fresh: true });
		const sau = await db.company.findUniqueOrThrow({ where: { id } });
		expect(sau.stateCode).toBe("CA");
		expect(sau.city).toBe("Menlo Park");
		expect(sau.description).toBe(BRAND_KHONG_DIA_CHI.brand.description);
	});

	test("tra lai cung ket qua thi khong ghi gi va bao da co", async () => {
		const id = await congTy(`tthv-trung-${HAU_TO}.vn`);
		phanHoi = BRAND_A;
		await runBrand({ companyId: id });
		const truoc = await db.company.findUniqueOrThrow({
			where: { id },
			select: OTHUONGHIEU,
		});

		const ket = await runBrand({ companyId: id, fresh: true });
		expect(ket.filled).toEqual([]);
		expect(ket.cleared).toEqual([]);
		expect(brandOutcome(ket)).toBe(
			"Everything Context.dev returned was already on the record.",
		);
		expect(
			await db.company.findUniqueOrThrow({
				where: { id },
				select: OTHUONGHIEU,
			}),
		).toEqual(truoc);

		phanHoi = BRAND_A_DOI_MO_TA;
		const doi = await runBrand({ companyId: id, fresh: true });
		expect(doi.filled).toEqual(["description"]);
	});
});
