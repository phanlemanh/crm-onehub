import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { getVercelOidcToken } from "@vercel/oidc";
import { nguonKhoaMoHinh } from "../agent/lib/mo-hinh-khoa";
import { TRO_LY_OKR } from "../agent/lib/okr/config";
import {
	type DemMang,
	mayKhongLienKet,
	trongRequest,
	veOidc,
	voiEnv,
} from "./support/ve-oidc";

const K = TRO_LY_OKR.khoa;

type O = {
	ten: string;
	env: Record<string, string>;
	header: string | null;
	layVe?: () => Promise<string>;
	ky: string | null;
};

const O_NGUON: readonly O[] = [
	{ ten: "rieng", env: { [K.rieng]: "r" }, header: null, ky: "khoa-rieng" },
	{ ten: "chung", env: { [K.chung]: "c" }, header: null, ky: "khoa-chung" },
	{
		ten: "ca-hai",
		env: { [K.rieng]: "r", [K.chung]: "c" },
		header: null,
		ky: "khoa-rieng",
	},
	{ ten: "header-oidc", env: {}, header: veOidc(), ky: "oidc" },
	{
		ten: "bien-oidc",
		env: { VERCEL_OIDC_TOKEN: veOidc() },
		header: null,
		ky: "oidc",
	},
	{ ten: "khong-co", env: {}, header: null, ky: null },
	{ ten: "ve-het-han", env: {}, header: veOidc({ hetHan: true }), ky: null },
	{ ten: "ve-sai-khuon", env: {}, header: "tok", ky: null },
	{
		ten: "lay-ve-nem",
		env: {},
		header: null,
		layVe: () => Promise.reject(new Error("khong lay duoc ve")),
		ky: null,
	},
	{
		ten: "khoa-trang",
		env: { [K.rieng]: "  ", [K.chung]: " " },
		header: null,
		ky: null,
	},
];

const chayO = (o: O, dem: DemMang, rieng?: boolean) =>
	mayKhongLienKet(
		() =>
			voiEnv(o.env, () =>
				trongRequest(o.header, () =>
					nguonKhoaMoHinh({ layVe: o.layVe, rieng }),
				),
			),
		dem,
	);

describe("nguon-khoa", () => {
	test("fixture ve dung khuon voi bo giai ma cua @vercel/oidc", async () => {
		const ve = veOidc();
		const doc = await mayKhongLienKet(() =>
			voiEnv({}, () => trongRequest(ve, () => getVercelOidcToken())),
		);
		expect(doc, "fixture ve sai khuon").toBe(ve);
	});

	test("ma tran toan phan viet truoc", async () => {
		const dem: DemMang = { soLan: 0 };
		let soKhang = 0;
		for (const o of O_NGUON) {
			expect(await chayO(o, dem), `o lech: ${o.ten}`).toBe(o.ky);
			soKhang += 1;
		}
		console.log(`nguon-khoa: ${soKhang}/${O_NGUON.length} o`);
		expect(soKhang).toBe(O_NGUON.length);
		expect(dem.soLan, "goi mang khi doc nguon khoa").toBe(0);
	});

	test("khong goi model: ham khong cham Gateway", () => {
		const nguon = readFileSync(
			new URL("../agent/lib/mo-hinh-khoa.ts", import.meta.url),
			"utf8",
		);
		expect(nguon, "ham nguon khoa cham Gateway").not.toMatch(
			/@ai-sdk\/gateway|from "ai"|createGateway|generateText/,
		);
		expect(nguon).toContain("getVercelOidcToken");
	});

	test("khong o nao nem", async () => {
		for (const o of O_NGUON) {
			await expect(chayO(o, { soLan: 0 })).resolves.toBeDefined();
		}
	});
});
