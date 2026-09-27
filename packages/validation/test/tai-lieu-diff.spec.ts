import { describe, expect, test } from "bun:test";
import {
	diffHash,
	type KhoiDoi,
	soSanh,
	suKienDoi,
} from "../src/tai-lieu-diff";

const TRUOC = `## Thời hạn chi trả

Hoa hồng được chi trả trong vòng 48 giờ kể từ khi ký.

Đối tác gửi chứng từ đầy đủ cho vận hành.

Mọi thắc mắc gửi về bộ phận vận hành.
`;

const SAU = `## Thời hạn chi trả

Hoa hồng được chi trả trong vòng 24 giờ kể từ khi ký.

Mọi thắc mắc gửi về bộ phận vận hành.

Bản này áp dụng cho mọi đối tác.
`;

function dem(khoi: KhoiDoi[], loai: "them" | "bo"): number {
	return khoi.flatMap((k) => k.doan).filter((d) => d.loai === loai).length;
}

function chuTheo(khoi: KhoiDoi[], loai: "them" | "bo"): string[] {
	return khoi
		.flatMap((k) => k.doan)
		.filter((d) => d.loai === loai)
		.map((d) => d.chu);
}

function vanBanDai(tu: string, doanSo: number): string {
	const cau: string[] = [];
	for (let i = 0; cau.join("\n\n").length < 200_000; i += 1)
		cau.push(
			`${tu} ${i} ${"lorem ipsum dolor ".repeat((i % doanSo) + 3)}${tu} ${i}.`,
		);
	return cau.join("\n\n").slice(0, 200_000);
}

describe("tai-lieu-diff", () => {
	test("thêm một câu, bỏ một câu, đổi 48 giờ thành 24 giờ", () => {
		const khoi = soSanh(TRUOC, SAU);
		expect(dem(khoi, "them")).toBe(2);
		expect(dem(khoi, "bo")).toBe(2);
		expect(chuTheo(khoi, "bo")).toEqual([
			"48",
			"Đối tác gửi chứng từ đầy đủ cho vận hành.",
		]);
		expect(chuTheo(khoi, "them")).toEqual([
			"24",
			"Bản này áp dụng cho mọi đối tác.",
		]);
		expect(khoi.map((k) => k.kieu)).toEqual([
			"tieu-de-2",
			"doan",
			"doan",
			"doan",
			"doan",
		]);
		expect(suKienDoi(khoi)).toEqual([{ truoc: "48 giờ", sau: "24 giờ" }]);
	});

	test("hai bản giống nhau sau chuẩn hoá thì không có thêm hay bỏ", () => {
		const nfd = `${TRUOC.normalize("NFD")}\n\n- một\n- hai\n`;
		const nfc = `${TRUOC}\n\n* một\n* hai\n`;
		expect(nfd).not.toBe(nfc);
		const khoi = soSanh(nfd, nfc);
		expect(dem(khoi, "them")).toBe(0);
		expect(dem(khoi, "bo")).toBe(0);
		expect(suKienDoi(khoi)).toEqual([]);
	});

	test("kiểu khối theo cây: tiêu đề, mục số, mục chấm, hàng bảng", () => {
		const md =
			"## Hai\n\n### Ba\n\n1. số\n   - chấm\n\n| A | B |\n| --- | --- |\n| 1 | 2 |\n";
		const khoi = soSanh(md, md);
		expect(khoi.map((k) => k.kieu)).toEqual([
			"tieu-de-2",
			"tieu-de-3",
			"muc-so",
			"muc-cham",
			"hang-bang",
			"hang-bang",
		]);
		expect(khoi.every((k) => k.doan.every((d) => d.loai === "giu"))).toBe(true);
	});

	test("dải số: phần trăm và ngày trong khối thêm, bỏ", () => {
		const khoi = soSanh(
			"Mức 12% từ 01/10/2026.\n\nGiữ nguyên.",
			"Mức 15% từ 01/01/2027.\n\nGiữ nguyên.\n\nThêm 3 ngày nghỉ.",
		);
		expect(suKienDoi(khoi)).toEqual([
			{ truoc: "12%", sau: "15%" },
			{ truoc: "01/10/2026", sau: "01/01/2027" },
			{ truoc: "", sau: "3 ngày" },
		]);
	});

	test("diffHash ổn định, đổi một chữ thì lệch", async () => {
		const a = await diffHash(soSanh(TRUOC, SAU));
		const b = await diffHash(soSanh(TRUOC, SAU));
		expect(a).toMatch(/^[0-9a-f]{64}$/);
		expect(b).toBe(a);
		const c = await diffHash(soSanh(TRUOC, SAU.replace("24 giờ", "12 giờ")));
		expect(c).not.toBe(a);
	});

	test("diff-trang-dai: hai bản 200 000 ký tự khác toàn bộ trả dưới 2 giây", () => {
		const truoc = vanBanDai("alpha", 7);
		const sau = vanBanDai("omega", 5);
		expect(truoc.length).toBe(200_000);
		expect(sau.length).toBe(200_000);
		const bd = performance.now();
		const khoi = soSanh(truoc, sau);
		const ms = performance.now() - bd;
		expect(ms).toBeLessThan(2_000);
		expect(dem(khoi, "them") + dem(khoi, "bo")).toBeGreaterThan(0);
	});

	test("diff-trang-dai: một đoạn 200 000 ký tự viết lại trả dưới 2 giây", () => {
		const truoc = "a b c d e ".repeat(20_000);
		const sau = "f g h i j ".repeat(20_000);
		const bd = performance.now();
		const khoi = soSanh(truoc, sau);
		expect(performance.now() - bd).toBeLessThan(2_000);
		expect(dem(khoi, "them")).toBeGreaterThan(0);
		expect(dem(khoi, "bo")).toBeGreaterThan(0);
	});
});
