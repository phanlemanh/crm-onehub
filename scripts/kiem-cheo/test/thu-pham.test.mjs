import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { phanLoai } from "../thu-pham.mjs";

const T = "T";
const GOP = ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"];
const D = "M8";
const VI_TRI = Object.fromEntries([T, ...GOP].map((s, i) => [s, i]));

function chayTu(doTu, { lanDauDoXanhLai = false } = {}) {
	const goi = [];
	let daChayD = false;
	const chay = async (sha) => {
		goi.push(sha);
		if (lanDauDoXanhLai && sha === D && !daChayD) {
			daChayD = true;
			return 0;
		}
		return VI_TRI[sha] >= VI_TRI[doTu] ? 1 : 0;
	};
	return { chay, goi };
}

const coTu = (vao) => async (sha) => VI_TRI[sha] >= VI_TRI[vao];

describe("kcs-thu-pham", () => {
	test("do tu M5 -> do-moi M5, so lan chay <= ceil(log2 8) + 3", async () => {
		const { chay, goi } = chayTu("M5");
		const kq = await phanLoai({ D, T, lanGop: GOP, chay, coO: coTu(T) });
		assert.deepEqual(kq, { loai: "do-moi", lan_gop: "M5" });
		assert.ok(goi.length <= 3 + 3, `goi ${goi.length} lan: ${goi.join(",")}`);
	});

	for (const m of GOP) {
		test(`do tu ${m} -> do-moi ${m}`, async () => {
			const { chay } = chayTu(m);
			const kq = await phanLoai({ D, T, lanGop: GOP, chay, coO: coTu(T) });
			assert.deepEqual(kq, { loai: "do-moi", lan_gop: m }, `phai goi ten ${m}`);
		});
	}

	test("do tu T -> do-san, khong goi ten lan gop nao", async () => {
		const { chay } = chayTu(T);
		const kq = await phanLoai({ D, T, lanGop: GOP, chay, coO: coTu(T) });
		assert.deepEqual(kq, { loai: "do-san" });
	});

	test("chay lai o D xanh -> chap-chon", async () => {
		const { chay } = chayTu("M3", { lanDauDoXanhLai: true });
		const kq = await phanLoai({ D, T, lanGop: GOP, chay, coO: coTu(T) });
		assert.deepEqual(kq, { loai: "chap-chon" });
	});

	test("ho so vao o M2, do tu M6 -> do-moi M6 (khong phai do-san du lenh o T loi)", async () => {
		const { chay } = chayTu("M6");
		const chayCoLoiOT = async (sha) =>
			VI_TRI[sha] < VI_TRI.M2 ? 1 : chay(sha);
		const kq = await phanLoai({
			D,
			T,
			lanGop: GOP,
			chay: chayCoLoiOT,
			coO: coTu("M2"),
		});
		assert.deepEqual(kq, { loai: "do-moi", lan_gop: "M6" });
	});

	test("ho so vao o M2 va do ngay tu M2 -> do-moi M2", async () => {
		const { chay } = chayTu("M2");
		const kq = await phanLoai({ D, T, lanGop: GOP, chay, coO: coTu("M2") });
		assert.deepEqual(kq, { loai: "do-moi", lan_gop: "M2" });
	});

	test("doi chung: ho so co tu T, do tu T -> do-san", async () => {
		const { chay } = chayTu(T);
		const kq = await phanLoai({ D, T, lanGop: GOP, chay, coO: coTu(T) });
		assert.equal(kq.loai, "do-san");
	});
});
