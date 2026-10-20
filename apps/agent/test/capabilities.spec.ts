import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import {
	CONTEXT_DEV,
	CONTEXT_DEV_PEOPLE,
	CONTEXT_DEV_SOURCE,
	capabilities,
	capabilitiesFrom,
	enabled,
	LUU_NGUON,
	markdownFor,
	unavailable,
} from "../agent/lib/capabilities";
import {
	mayKhongLienKet,
	trongRequest,
	veOidc,
	voiEnv,
} from "./support/ve-oidc";

const KEYS = [
	"PERPLEXITY_API_KEY",
	"BLOB_READ_WRITE_TOKEN",
	"ZALO_BOT_TOKEN",
	"GOOGLE_SHEETS_EMAIL",
	"GOOGLE_SHEETS_KHOA",
	"AI_GATEWAY_API_KEY",
	"VERCEL_OIDC_TOKEN",
	"KHO_TAI_LIEU_AI_GATEWAY_API_KEY",
	"KHO_TAI_LIEU_BLOB_TOKEN",
	"GITHUB_APP_ID",
	"GITHUB_APP_PRIVATE_KEY",
] as const;

const saved: Record<string, string | undefined> = {};

beforeEach(() => {
	for (const key of KEYS) {
		saved[key] = process.env[key];
		delete process.env[key];
	}
});

afterEach(() => {
	for (const key of KEYS) {
		if (saved[key] === undefined) delete process.env[key];
		else process.env[key] = saved[key];
	}
});

describe("capabilities", () => {
	it("luu-nguon: 6 o hai bien x 2 muc = 12 ky vong viet truoc, khong nem", () => {
		const VANG = undefined;
		const BANG = [
			{
				o: "co-co",
				kho: "vercel_blob_rw_nguon_gia",
				logo: "vercel_blob_rw_logo_gia",
				nguon: true,
				anh: true,
			},
			{
				o: "co-vang",
				kho: "vercel_blob_rw_nguon_gia",
				logo: VANG,
				nguon: true,
				anh: false,
			},
			{
				o: "vang-co",
				kho: VANG,
				logo: "vercel_blob_rw_logo_gia",
				nguon: false,
				anh: true,
			},
			{ o: "vang-vang", kho: VANG, logo: VANG, nguon: false, anh: false },
			{
				o: "trang-co",
				kho: "   ",
				logo: "vercel_blob_rw_logo_gia",
				nguon: false,
				anh: true,
			},
			{
				o: "co-rong",
				kho: "vercel_blob_rw_nguon_gia",
				logo: "",
				nguon: true,
				anh: false,
			},
		] as const;
		const dat = (ten: string, gt: string | undefined) => {
			if (gt === undefined) delete process.env[ten];
			else process.env[ten] = gt;
		};
		let so = 0;
		for (const o of BANG) {
			dat("KHO_TAI_LIEU_BLOB_TOKEN", o.kho);
			dat("BLOB_READ_WRITE_TOKEN", o.logo);
			const bang = capabilitiesFrom(null);
			const nguon = bang.find((c) => c.id === LUU_NGUON);
			const anh = bang.find((c) => c.id === "BLOB_READ_WRITE_TOKEN");
			if (o.kho === "   " && nguon?.enabled)
				throw new Error(`khoang trang tinh la co khoa: o ${o.o}`);
			if (!o.nguon && nguon?.enabled)
				throw new Error(`luu nguon bat bang khoa logo: o ${o.o}`);
			if (o.nguon && !nguon?.enabled)
				throw new Error(`luu nguon tat du co khoa rieng: o ${o.o}`);
			expect(nguon?.from).toBe("KHO_TAI_LIEU_BLOB_TOKEN");
			expect(nguon?.enabled).toBe(o.nguon);
			expect(anh?.enabled).toBe(o.anh);
			so += 2;
		}
		expect(so).toBe(BANG.length * 2);
	});

	it("reports everything off on a bare install", async () => {
		expect(capabilitiesFrom(null).every((c) => !c.enabled)).toBe(true);
		expect(await enabled("PERPLEXITY_API_KEY")).toBe(false);
	});

	it("turns one on without turning on the others", async () => {
		process.env.PERPLEXITY_API_KEY = "pplx-test";

		expect(await enabled("PERPLEXITY_API_KEY")).toBe(true);
		expect(await enabled("BLOB_READ_WRITE_TOKEN")).toBe(false);
	});

	it("treats blank and whitespace as unset", async () => {
		process.env.PERPLEXITY_API_KEY = "   ";
		expect(await enabled("PERPLEXITY_API_KEY")).toBe(false);
	});

	it("is read live, so a late-configured process is not stuck off", async () => {
		expect(await enabled("PERPLEXITY_API_KEY")).toBe(false);
		process.env.PERPLEXITY_API_KEY = "key";
		expect(await enabled("PERPLEXITY_API_KEY")).toBe(true);
	});

	it("is unknown for a variable that is not a capability", async () => {
		process.env.SOMETHING_ELSE = "x";
		expect(await enabled("SOMETHING_ELSE")).toBe(false);
		delete process.env.SOMETHING_ELSE;
	});
});

describe("the Context key is a setting, never a variable", () => {
	const contextDev = (stored: string | null) =>
		capabilitiesFrom(stored).find((c) => c.id === CONTEXT_DEV);

	it("is on when a key is stored", () => {
		expect(contextDev("ctx-from-the-settings-page")?.enabled).toBe(true);
	});

	it("is off when nothing has been stored", () => {
		expect(contextDev(null)?.enabled).toBe(false);
	});

	it("is not turned on by an environment variable", () => {
		process.env.CONTEXT_DEV_API_KEY = "a-variable-nothing-reads";

		expect(contextDev(null)?.enabled).toBe(false);

		delete process.env.CONTEXT_DEV_API_KEY;
	});

	it("points at the settings page rather than a variable name", () => {
		expect(contextDev(null)?.from).toBe("Settings → General");
	});
});

describe("reading a person comes from the same Context key", () => {
	const people = (stored: string | null) =>
		capabilitiesFrom(stored).find((c) => c.id === CONTEXT_DEV_PEOPLE);

	it("is on when a key is stored and off when it is not", () => {
		expect(people("ctx")?.enabled).toBe(true);
		expect(people(null)?.enabled).toBe(false);
	});

	it("points at the settings page rather than a variable name", () => {
		expect(people(null)?.from).toBe("Settings → General");
	});

	it("turns on and off with the brand lookup, because it is one key", () => {
		for (const stored of ["ctx", null]) {
			expect(people(stored)?.enabled).toBe(
				capabilitiesFrom(stored).find((c) => c.id === CONTEXT_DEV)?.enabled ===
					true,
			);
		}
	});
});

describe("the unavailable result", () => {
	it("says retrying will not help", () => {
		const result = unavailable(CONTEXT_DEV_SOURCE);

		expect(result.ok).toBe(false);
		expect(result.configured).toBe(false);
		expect(result.reason).toContain("retrying will not help");
		expect(result.reason).toContain(CONTEXT_DEV_SOURCE);
	});
});

describe("the capability briefing", () => {
	it("tells a bare install to work from the CRM alone", () => {
		const markdown = markdownFor(capabilitiesFrom(null));

		expect(markdown).toContain("No outside sources are configured");
		expect(markdown).toContain("read_crm_history");
	});

	it("lists what is on and what is off, separately", () => {
		const markdown = markdownFor(capabilitiesFrom("ctx"));

		expect(markdown).toContain("Available:");
		expect(markdown).toContain("LinkedIn");
		expect(markdown).toContain("Not configured here");
		expect(markdown).toContain("Web research");
	});

	it("counts a stored Context key as configured", () => {
		process.env.PERPLEXITY_API_KEY = "key";

		const markdown = markdownFor(capabilitiesFrom("ctx"));

		expect(markdown).toContain("Company brand data");
		expect(markdown.indexOf("Company brand data")).toBeLessThan(
			markdown.indexOf("Not configured here"),
		);
	});

	it("does not warn about missing sources when everything is on", () => {
		for (const key of KEYS) process.env[key] = "key";

		expect(markdownFor(capabilitiesFrom("ctx", true))).not.toContain(
			"Not configured here",
		);
	});
});

describe("mo-hinh-ai", () => {
	const O_NANG_LUC = [
		{ o: "chi-header-oidc", env: {}, header: true, bat: true },
		{ o: "khong-gi", env: {}, header: false, bat: false },
		{
			o: "chi-khoa-chung",
			env: { AI_GATEWAY_API_KEY: "c" },
			header: false,
			bat: true,
		},
		{
			o: "chi-khoa-rieng",
			env: { OKR_AI_GATEWAY_API_KEY: "r" },
			header: false,
			bat: false,
		},
		{
			o: "rieng-va-chung",
			env: { OKR_AI_GATEWAY_API_KEY: "r", AI_GATEWAY_API_KEY: "c" },
			header: false,
			bat: true,
		},
		{
			o: "rieng-va-header",
			env: { OKR_AI_GATEWAY_API_KEY: "r" },
			header: true,
			bat: true,
		},
		{
			o: "rieng-va-bien-oidc",
			env: { OKR_AI_GATEWAY_API_KEY: "r", VERCEL_OIDC_TOKEN: veOidc() },
			header: false,
			bat: true,
		},
	] as const;

	it("ma tran bay o viet truoc", async () => {
		let so = 0;
		for (const o of O_NANG_LUC) {
			const bang = await mayKhongLienKet(() =>
				voiEnv(o.env, () =>
					trongRequest(o.header ? veOidc() : null, () => capabilities()),
				),
			);
			const muc = bang.find((c) => c.id === "MO_HINH_AI");
			const coRieng = "OKR_AI_GATEWAY_API_KEY" in o.env;
			if (o.header && !coRieng && !muc?.enabled)
				throw new Error("nang luc lech nguon khoa");
			if (o.bat && coRieng && !muc?.enabled)
				throw new Error(`nang luc bi khoa rieng che: o ${o.o}`);
			expect(muc?.enabled, `o ${o.o}`).toBe(o.bat);
			so += 1;
		}
		console.log(`mo-hinh-ai: ${so}/${O_NANG_LUC.length} o`);
		expect(so).toBe(O_NANG_LUC.length);
	}, 30_000);

	it("muc khong doc bien khoa truc tiep", () => {
		const nguon = readFileSync(
			new URL("../agent/lib/capabilities.ts", import.meta.url),
			"utf8",
		);
		expect(nguon).not.toContain("process.env.VERCEL_OIDC_TOKEN");
		expect(nguon).not.toContain("process.env.AI_GATEWAY_API_KEY");
		expect(nguon).toContain("nguonKhoaMoHinh({ rieng: false })");
	});
});
