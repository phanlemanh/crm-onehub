import { describe, expect, test } from "bun:test";
import { phanXu, tachBoRa } from "./giu-ho-so.mjs";

const ev = (id, ky = 0) => ({ hoSo: "ho-so-a", id, ky, cmd: null });

function demGoi(ma) {
	const goi = { n: 0 };
	return { goi, chay: () => ((goi.n += 1), ma) };
}

describe("vk7-giu-ho-so phanXu", () => {
	test("HEAD dat ky vong thi GIU va khong chay cay nen", () => {
		const nen = demGoi(1);
		const lai = demGoi(1);
		const kq = phanXu([ev("E1")], 0, nen.chay, lai.chay);
		expect(kq.map((k) => k.loai)).toEqual(["GIU"]);
		expect(nen.goi.n).toBe(0);
		expect(lai.goi.n).toBe(0);
	});

	test("HEAD do, nen xanh, chay lai van do thi DO — hoi quy khong bi tha", () => {
		const nen = demGoi(0);
		const lai = demGoi(1);
		const kq = phanXu([ev("E1")], 1, nen.chay, lai.chay);
		expect(kq).toEqual([{ loai: "DO", e: ev("E1"), chu: "1" }]);
		expect(lai.goi.n).toBe(1);
	});

	test("HEAD do va nen cung do thi DO-SAN-NEN, khong chay lai HEAD", () => {
		const nen = demGoi(1);
		const lai = demGoi(0);
		const kq = phanXu([ev("E1")], 1, nen.chay, lai.chay);
		expect(kq).toEqual([
			{ loai: "DO-SAN-NEN", e: ev("E1"), chu: "HEAD 1 · nen 1" },
		]);
		expect(lai.goi.n).toBe(0);
	});

	test("HEAD do, nen xanh, chay lai xanh thi CHAP-CHON", () => {
		const kq = phanXu([ev("E1")], 1, demGoi(0).chay, demGoi(0).chay);
		expect(kq.map((k) => k.loai)).toEqual(["CHAP-CHON"]);
	});

	test("ky vong khac 0 duoc so dung theo tung eval trong nhom", () => {
		const kq = phanXu(
			[ev("E1", 2), ev("E2", 0)],
			2,
			demGoi(2).chay,
			demGoi(2).chay,
		);
		expect(kq.map((k) => k.loai)).toEqual(["GIU", "DO-SAN-NEN"]);
	});
});

describe("vk7-giu-ho-so tachBoRa", () => {
	test("eval co ten trong boRa ra khoi tap chay", () => {
		const { conLai, daBo, loi } = tachBoRa([ev("E1"), ev("E2")], {
			"ho-so-a#E2": "luat pham vi vong",
		});
		expect(conLai.map((e) => e.id)).toEqual(["E1"]);
		expect(daBo.map((e) => e.id)).toEqual(["E2"]);
		expect(loi).toEqual([]);
	});

	test("muc boRa khong khop eval nao thi bao BO RA THUA", () => {
		const { loi } = tachBoRa([ev("E1")], { "ho-so-a#E9": "cu" });
		expect(loi).toEqual(["BO RA THUA ho-so-a/E9"]);
	});
});
