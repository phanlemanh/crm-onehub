import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	it,
	spyOn,
} from "bun:test";
import { auth } from "@crm/auth";
import { type INestApplication, Logger } from "@nestjs/common";
import { APIError } from "better-auth/api";
import request from "supertest";
import { z } from "zod";
import { ApiKeysRouter } from "../src/api-keys/api-keys.router";
import { createApp } from "../src/create-app";
import { SettingsRouter } from "../src/settings/settings.router";
import { AuthMiddleware } from "../src/trpc/middlewares/auth.middleware";
import { SessionOnlyMiddleware } from "../src/trpc/middlewares/session-only.middleware";
import { SignedInMiddleware } from "../src/trpc/middlewares/signed-in.middleware";
import { WorkspaceRouter } from "../src/workspace/workspace.router";
import { soThuTuc } from "./ma-tran-thu";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const NGUOI = "cvv-doc-phien";

const loiTrpc = z.object({
	error: z.object({ data: z.object({ code: z.string() }) }),
});

let app: INestApplication;
let cookie = "";

beforeAll(async () => {
	await gieoThanhVien(NGUOI, "admin");
	cookie = (await mintPhien(NGUOI)).cookie;
	app = await createApp();
});

afterAll(async () => {
	await app.close();
});

const dangGia: { mockRestore(): void }[] = [];

function traLai() {
	for (const s of dangGia.splice(0)) s.mockRestore();
}

afterEach(traLai);

function phienNem() {
	dangGia.push(
		spyOn(auth.api, "getSession").mockRejectedValue(
			new Error("connect ECONNREFUSED"),
		),
	);
}

function phienNull() {
	dangGia.push(spyOn(auth.api, "getSession").mockResolvedValue(null));
}

async function goi(ten: string, loai: "query" | "mutation") {
	const duong = `/api/trpc/${ten}`;
	const r =
		loai === "query"
			? await request(app.getHttpServer()).get(duong).set("cookie", cookie)
			: await request(app.getHttpServer())
					.post(duong)
					.set("cookie", cookie)
					.send({});
	const loi = loiTrpc.safeParse(r.body);
	return {
		status: r.status,
		code: loi.success ? loi.data.error.data.code : null,
	};
}

describe("doc-phien", () => {
	it("doc-phien: getSession nem -> 503, null -> 401, binh thuong -> 200; mot dong log khong cookie", async () => {
		const loi = spyOn(Logger.prototype, "error");
		phienNem();
		const nem = await goi("settings.researchKey", "query");
		const dong = loi.mock.calls.map((c) => JSON.stringify(c));
		loi.mockRestore();
		traLai();
		phienNull();
		const khong = await goi("settings.researchKey", "query");
		traLai();
		const thuong = await goi("settings.researchKey", "query");

		expect(nem).toEqual({ status: 503, code: "SERVICE_UNAVAILABLE" });
		expect(khong).toEqual({ status: 401, code: "UNAUTHORIZED" });
		expect(thuong.status).toBe(200);
		const docPhien = dong.filter((d) =>
			d.includes("Could not read the session"),
		);
		expect(docPhien).toHaveLength(1);
		expect(docPhien[0]).not.toContain("session_token");
		expect(docPhien[0]).not.toContain(cookie.split("=")[1] ?? "khong-co");
	});
});

describe("doc-phien loi nguoi goi", () => {
	it("doc-phien: getSession nem APIError 4xx (khoa API tat, het han, sai) -> van 401, khong log loi doc phien", async () => {
		const ket: string[] = [];
		for (const [ma, maTrpc] of [
			["UNAUTHORIZED", "KEY_DISABLED"],
			["FORBIDDEN", "INVALID_API_KEY"],
		] as const) {
			const loi = spyOn(Logger.prototype, "error");
			dangGia.push(
				spyOn(auth.api, "getSession").mockRejectedValue(
					new APIError(ma, { code: maTrpc, message: maTrpc }),
				),
			);
			const r = await goi("settings.researchKey", "query");
			const docPhien = loi.mock.calls.filter((c) =>
				JSON.stringify(c).includes("Could not read the session"),
			).length;
			loi.mockRestore();
			traLai();
			ket.push(`${ma} ${r.status} ${r.code} log ${docPhien}`);
		}
		expect(ket).toEqual([
			"UNAUTHORIZED 401 UNAUTHORIZED log 0",
			"FORBIDDEN 401 UNAUTHORIZED log 0",
		]);
	});
});

describe("ba-lop", () => {
	type LopMiddleware = abstract new (...doiSo: never[]) => object;

	const KHOA_MIDDLEWARE = "Symbol(trpc:middlewares_key)";

	type DichKhai =
		| (abstract new (
				...doiSo: never[]
		  ) => object)
		| ((...doiSo: never[]) => unknown);

	function khaiTren(dich: DichKhai): LopMiddleware[] {
		const khoa = Reflect.getMetadataKeys(dich).find(
			(k) => String(k) === KHOA_MIDDLEWARE,
		);
		return khoa === undefined ? [] : Reflect.getMetadata(khoa, dich);
	}

	function la(lop: LopMiddleware, goc: LopMiddleware): boolean {
		return lop === goc || lop.prototype instanceof goc;
	}

	const MA_TRAN = [
		{
			nhan: "AuthMiddleware",
			thuTuc: "settings.researchKey",
			loai: "query",
			khai: khaiTren(SettingsRouter),
			can: [AuthMiddleware],
		},
		{
			nhan: "SignedInMiddleware",
			thuTuc: "workspace.get",
			loai: "query",
			khai: khaiTren(WorkspaceRouter.prototype.get),
			can: [SignedInMiddleware],
		},
		{
			nhan: "SessionOnlyMiddleware+AuthMiddleware",
			thuTuc: "apiKeys.list",
			loai: "query",
			khai: khaiTren(ApiKeysRouter),
			can: [SessionOnlyMiddleware, AuthMiddleware],
		},
	] as const;

	it("ba-lop: metadata router mang dung lop da goi ten", () => {
		const thieu = MA_TRAN.flatMap((o) =>
			o.can
				.filter((goc) => !o.khai.some((lop) => la(lop, goc)))
				.map((goc) => `${o.thuTuc} thieu ${goc.name}`),
		);
		expect(thieu).toEqual([]);
	});

	it("ba-lop: 3 lop x 2 tinh trang", async () => {
		const co = new Set(soThuTuc(app).map((t) => t.ten));
		expect(
			MA_TRAN.filter((o) => !co.has(o.thuTuc)).map((o) => o.thuTuc),
		).toEqual([]);
		const ket: string[] = [];
		for (const { nhan, thuTuc, loai } of MA_TRAN) {
			phienNem();
			const a = await goi(thuTuc, loai);
			traLai();
			phienNull();
			const b = await goi(thuTuc, loai);
			traLai();
			ket.push(
				`${nhan} nem ${a.status} ${a.code}`,
				`${nhan} null ${b.status} ${b.code}`,
			);
		}
		expect(ket).toEqual(
			MA_TRAN.flatMap(({ nhan }) => [
				`${nhan} nem 503 SERVICE_UNAVAILABLE`,
				`${nhan} null 401 UNAUTHORIZED`,
			]),
		);
	});

	it("quet-het: moi thu tuc tra 401 khi khong phien deu tra 503 khi getSession nem", async () => {
		const tatCa = soThuTuc(app);
		phienNull();
		const a: string[] = [];
		for (const t of tatCa) {
			if ((await goi(t.ten, t.loai)).status === 401) a.push(t.ten);
		}
		traLai();
		phienNem();
		const b: string[] = [];
		for (const ten of a) {
			const t = tatCa.find((x) => x.ten === ten);
			if (t && (await goi(t.ten, t.loai)).status === 503) b.push(ten);
		}
		const sot = a.filter((t) => !b.includes(t));
		console.log(`|A|=${a.length} |B|=${b.length} A\\B=${sot.join(",")}`);
		expect(a.length).toBeGreaterThan(3);
		expect(sot).toEqual([]);
	}, 120_000);
});

describe("cong-khai", () => {
	it("cong-khai: sso.signInOptions van 200 khi getSession nem", async () => {
		const thuong = await request(app.getHttpServer())
			.get("/api/trpc/sso.signInOptions")
			.set("cookie", cookie);
		phienNem();
		const nem = await request(app.getHttpServer())
			.get("/api/trpc/sso.signInOptions")
			.set("cookie", cookie);

		expect(thuong.status).toBe(200);
		expect(nem.status).toBe(200);
		expect(nem.body.result.data).toEqual(thuong.body.result.data);
	});
});
