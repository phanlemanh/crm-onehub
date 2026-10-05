import { describe, expect, test } from "bun:test";
import { zaloGoiTho } from "../agent/lib/zalo-api";
import { type PhanGetMe, phanLopGetMe } from "../agent/lib/zalo-getme";
import { zaloGia } from "./support/zalo-gia";
import {
	BANG_TAM,
	BANG_TU_CHOI,
	type DangGetMe,
	SO_TAM,
	SO_TU_CHOI,
} from "./support/zalo-va-bang";

const TOK = "777:zalo-va";

async function phanQuaGia(d: DangGetMe): Promise<PhanGetMe | null> {
	const z = zaloGia(d.chon);
	try {
		return await zaloGoiTho(z.fetcher, TOK, "getMe", {});
	} catch {
		return null;
	}
}

describe("phan-lop", () => {
	test("phan-lop: ma tran viet truoc du 11 dang tam va 8 dang tu choi", () => {
		expect(BANG_TAM.length).toBe(SO_TAM);
		expect(BANG_TU_CHOI.length).toBe(SO_TU_CHOI);
	});

	for (const d of BANG_TAM) {
		test(`phan-lop: ${d.ten} la tam-loi`, async () => {
			expect(phanLopGetMe(await phanQuaGia(d)), `phan-lop: ${d.ten}`).toEqual({
				loai: "loi",
				loi: { lop: d.lop, http: d.http, maThan: d.maThan, ketLuan: "tam-loi" },
			});
		});
	}

	for (const d of BANG_TU_CHOI) {
		test(`phan-lop: ${d.ten} la token-sai`, async () => {
			expect(phanLopGetMe(await phanQuaGia(d)), `phan-lop: ${d.ten}`).toEqual({
				loai: "loi",
				loi: {
					lop: d.lop,
					http: d.http,
					maThan: d.maThan,
					ketLuan: "token-sai",
				},
			});
		});
	}

	test("phan-lop: doi chung duong, getMe 200 dung khuon la duoc", async () => {
		const z = zaloGia({ tenBot: "Bot OneHub" });
		expect(phanLopGetMe(await zaloGoiTho(z.fetcher, TOK, "getMe", {}))).toEqual(
			{
				loai: "duoc",
				tenBot: "Bot OneHub",
			},
		);
	});
});
