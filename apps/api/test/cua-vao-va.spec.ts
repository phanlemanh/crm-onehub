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
import request from "supertest";
import { z } from "zod";
import { createApp } from "../src/create-app";
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

describe("ba-lop", () => {
	const MA_TRAN = [
		["AuthMiddleware", "settings.researchKey", "query"],
		["SignedInMiddleware", "workspace.get", "query"],
		["SessionOnlyMiddleware", "apiKeys.list", "query"],
	] as const;

	it("ba-lop: 3 lop x 2 tinh trang", async () => {
		const co = new Set(soThuTuc(app).map((t) => t.ten));
		expect(MA_TRAN.filter(([, thuTuc]) => !co.has(thuTuc))).toEqual([]);
		const ket: string[] = [];
		for (const [lop, thuTuc, loai] of MA_TRAN) {
			phienNem();
			const a = await goi(thuTuc, loai);
			traLai();
			phienNull();
			const b = await goi(thuTuc, loai);
			traLai();
			ket.push(
				`${lop} nem ${a.status} ${a.code}`,
				`${lop} null ${b.status} ${b.code}`,
			);
		}
		expect(ket).toEqual(
			MA_TRAN.flatMap(([lop]) => [
				`${lop} nem 503 SERVICE_UNAVAILABLE`,
				`${lop} null 401 UNAUTHORIZED`,
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
