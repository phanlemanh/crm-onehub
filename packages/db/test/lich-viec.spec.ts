import { describe, expect, test } from "bun:test";
import type { LichLam } from "../src/lich-lam-viec";
import {
	type CanhPhuThuoc,
	LoiLich,
	type NutLich,
	timVong,
	tinhDoi,
} from "../src/lich-viec";

const LICH: LichLam = { ngayNghiTuan: [6, 7], ngayLe: ["2026-10-26"] };
const KHONG_LE: LichLam = { ngayNghiTuan: [6, 7], ngayLe: [] };

function nut(
	id: string,
	batDau: string | null,
	han: string | null,
	dong = false,
): NutLich {
	return { id, tieuDe: id, batDau, han, dong };
}

const CHUOI: NutLich[] = [
	nut("A", "2026-10-19", "2026-10-21"),
	nut("B", "2026-10-22", "2026-10-23"),
	nut("C", "2026-10-27", "2026-10-28"),
	nut("D", "2026-11-10", "2026-11-11"),
];
const CANH: CanhPhuThuoc[] = [
	{ truocId: "A", sauId: "B" },
	{ truocId: "B", sauId: "C" },
	{ truocId: "A", sauId: "D" },
];
const KEO_A = { id: "A", batDau: "2026-10-19", han: "2026-10-23" };

describe("lv-tinh-doi", () => {
	test("lv-tinh-doi: chuỗi A → B → C dời bỏ cuối tuần và ngày lễ, giữ số ngày làm việc; D đã đủ muộn", () => {
		const doi = tinhDoi(CHUOI, CANH, KEO_A, LICH);
		const mong = [
			{ id: "B", batDau: "2026-10-27", han: "2026-10-28", boi: "A" },
			{ id: "C", batDau: "2026-10-29", han: "2026-10-30", boi: "B" },
		];
		if (JSON.stringify(doi) !== JSON.stringify(mong)) {
			throw new Error(`lv: doi chuoi sai ${JSON.stringify(doi)}`);
		}
		if (doi.some((d) => d.id === "D"))
			throw new Error("lv: doi viec da du muon");
		expect(doi).toEqual(mong);
	});

	test("lv-tinh-doi: hạn việc trước sớm lên thì không việc sau nào lùi", () => {
		const doi = tinhDoi(
			CHUOI,
			CANH,
			{ id: "A", batDau: "2026-10-19", han: "2026-10-20" },
			LICH,
		);
		if (doi.length !== 0) throw new Error(`lv: keo lui ${JSON.stringify(doi)}`);
		expect(doi).toEqual([]);
	});

	test("lv-tinh-doi: việc sau đã Xong không dời, việc kế tính theo hạn cũ của nó", () => {
		const nutXong = CHUOI.map((n) => (n.id === "B" ? { ...n, dong: true } : n));
		const doi = tinhDoi(nutXong, CANH, KEO_A, LICH);
		if (doi.some((d) => d.id === "B" || d.id === "C")) {
			throw new Error(`lv: viec xong bi doi ${JSON.stringify(doi)}`);
		}
		expect(doi).toEqual([]);
	});

	test("lv-tinh-doi: đối chứng — không có ngày lễ thì B dời sang Thứ Hai 26/10", () => {
		const doi = tinhDoi(CHUOI, CANH, KEO_A, KHONG_LE);
		if (doi[0]?.id !== "B" || doi[0]?.batDau !== "2026-10-26") {
			throw new Error(`lv: doi chung le hong ${JSON.stringify(doi)}`);
		}
		expect(doi[0]).toEqual({
			id: "B",
			batDau: "2026-10-26",
			han: "2026-10-27",
			boi: "A",
		});
	});

	test("lv-tinh-doi: việc Huỷ giữa chuỗi không dời và không chặn, việc sau tính theo hạn cũ của nó", () => {
		const nutHuy = [
			nut("A", "2026-10-19", "2026-10-21"),
			nut("H", "2026-10-22", "2026-10-22", true),
			nut("E", "2026-10-23", "2026-10-23"),
		];
		const canh = [
			{ truocId: "A", sauId: "H" },
			{ truocId: "H", sauId: "E" },
		];
		const doi = tinhDoi(nutHuy, canh, KEO_A, LICH);
		if (doi.some((d) => d.id === "H")) throw new Error("lv: viec huy bi doi");
		expect(doi).toEqual([]);
	});

	test("lv-tinh-doi: dữ liệu đã có vòng thì dừng và báo lỗi có tên chuỗi", () => {
		const vong = [
			{ truocId: "A", sauId: "B" },
			{ truocId: "B", sauId: "A" },
		];
		let loi: unknown = null;
		try {
			tinhDoi(CHUOI, vong, KEO_A, LICH);
		} catch (e) {
			loi = e;
		}
		if (!(loi instanceof LoiLich) || loi.ma !== "vong") {
			throw new Error(`lv: vong san khong bao ${String(loi)}`);
		}
		expect(loi.chuoi.length).toBeGreaterThan(1);
	});
});

describe("lv-tim-vong", () => {
	test("lv-tim-vong: hai đỉnh, ba đỉnh, và đối chứng không vòng", () => {
		expect(
			timVong([{ truocId: "A", sauId: "B" }], { truocId: "B", sauId: "A" }),
		).toEqual(["B", "A", "B"]);
		expect(
			timVong(
				[
					{ truocId: "A", sauId: "B" },
					{ truocId: "B", sauId: "C" },
				],
				{ truocId: "C", sauId: "A" },
			),
		).toEqual(["C", "A", "B", "C"]);
		expect(
			timVong([{ truocId: "A", sauId: "B" }], { truocId: "B", sauId: "C" }),
		).toBeNull();
	});
});
