import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ClientError } from "eve/client";
import { CUA_OKR } from "@/lib/cua-okr-config";
import { chu, datAgent, datLai, don, m, moMan, q } from "./khung-soan-okr";

beforeEach(datLai);
afterEach(don);

async function loiCua(status: number, ma: string): Promise<ClientError> {
	const r = Response.json({ error: ma }, { status });
	return new ClientError(r.status, await r.text(), r.headers);
}

describe("loi-chua-cau-hinh", () => {
	test("loi-chua-cau-hinh: 503 chua-cau-hinh -> cau chua bat, khong Thu lai", async () => {
		await datAgent({
			status: "error",
			error: await loiCua(
				CUA_OKR.trangThaiChuaCauHinh,
				CUA_OKR.loi.chuaCauHinh,
			),
		});
		await moMan();
		expect(
			chu('[data-tu-choi="chua-cau-hinh"]'),
			"loi chua cau hinh hien chu chung",
		).toBe(m.nut.chuaCauHinh);
		expect(q('[data-nut="thu-lai"]')).toBeNull();
		expect(q('[data-luot="loi"]')).toBeNull();
	});

	test("loi-chua-cau-hinh: 503 ma khac -> chu chung, co Thu lai", async () => {
		await datAgent({
			status: "error",
			error: await loiCua(CUA_OKR.trangThaiChuaCauHinh, "khac"),
		});
		await moMan();
		expect(q('[data-tu-choi="chua-cau-hinh"]')).toBeNull();
		expect(q('[data-luot="loi"]')).not.toBeNull();
		expect(q('[data-nut="thu-lai"]')).not.toBeNull();
	});

	test("loi-chua-cau-hinh: loi mang khong status -> nhu hom nay", async () => {
		await datAgent({ status: "error", error: new Error("fetch failed") });
		await moMan();
		expect(q('[data-tu-choi="chua-cau-hinh"]')).toBeNull();
		expect(q('[data-luot="loi"]')).not.toBeNull();
	});

	test("loi-chua-cau-hinh: 401 chua-dang-nhap -> khong phai cau chua bat", async () => {
		await datAgent({
			status: "error",
			error: await loiCua(401, CUA_OKR.loi.chuaDangNhap),
		});
		await moMan();
		expect(q('[data-tu-choi="chua-cau-hinh"]')).toBeNull();
	});

	test("loi-chua-cau-hinh: cua tra dung hang", () => {
		const nguon = readFileSync(
			join(
				import.meta.dir,
				"../app/eve/agents/okr/eve/v1/[...path]/route.ts",
			),
			"utf8",
		);
		expect(nguon).toContain(
			"loi(CUA_OKR.trangThaiChuaCauHinh, CUA_OKR.loi.chuaCauHinh)",
		);
	});
});
