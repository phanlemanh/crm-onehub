import { afterEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { soSanh, suKienDoi } from "@crm/validation/tai-lieu-diff";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { DiffTrang } from "../src/components/diff-trang";

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

const TRUOC = [
	"## Phản hồi khiếu nại",
	"",
	"Nhân viên ghi nhận khiếu nại vào hệ thống.",
	"",
	"Phản hồi đầu tiên trong 48 giờ kể từ khi nhận.",
	"",
	"Trưởng nhóm được báo qua thư.",
	"",
	"Mọi khiếu nại được lưu một năm.",
	"",
].join("\n");

const SAU = [
	"## Phản hồi khiếu nại",
	"",
	"Nhân viên ghi nhận khiếu nại vào hệ thống.",
	"",
	"Phản hồi đầu tiên trong 24 giờ kể từ khi nhận.",
	"",
	"Mọi khiếu nại được lưu một năm.",
	"",
	"Khách hàng nhận mã khiếu nại qua tin nhắn.",
	"",
].join("\n");

const NHAN = {
	nhanThem: "Thêm",
	nhanBo: "Bỏ",
	nhanDaiSo: "Con số và ngày bị đổi",
};

function ve(truoc: string, sau: string): HTMLElement {
	const khoi = soSanh(truoc, sau);
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() =>
		root?.render(<DiffTrang {...NHAN} dai={suKienDoi(khoi)} khoi={khoi} />),
	);
	return khung;
}

function nhanAn(el: Element): string | null {
	const dau = el.firstElementChild;
	if (!dau?.classList.contains("sr-only")) return null;
	return dau.textContent?.trim() ?? null;
}

function kiemNhanAn(goc: HTMLElement): void {
	for (const ins of goc.querySelectorAll("ins")) {
		if (nhanAn(ins) !== "Thêm:")
			throw new Error("ins thieu nhan cho trinh doc man hinh");
	}
	for (const del of goc.querySelectorAll("del")) {
		if (nhanAn(del) !== "Bỏ:")
			throw new Error("del thieu nhan cho trinh doc man hinh");
	}
}

function chuHien(el: Element): string {
	const ban = el.cloneNode(true);
	if (!(ban instanceof HTMLElement)) return "";
	for (const an of ban.querySelectorAll(".sr-only")) an.remove();
	return ban.textContent ?? "";
}

describe("DiffTrang — E13 phía màn", () => {
	test("thêm một câu, bỏ một câu, đổi 48 giờ thành 24 giờ: 2 ins, 2 del", () => {
		const goc = ve(TRUOC, SAU);
		const ins = [...goc.querySelectorAll("ins")];
		const del = [...goc.querySelectorAll("del")];
		expect(ins.map(chuHien)).toEqual([
			"24",
			"Khách hàng nhận mã khiếu nại qua tin nhắn.",
		]);
		expect(del.map(chuHien)).toEqual(["48", "Trưởng nhóm được báo qua thư."]);
	});

	test("mỗi ins, del có nhãn ẩn cho trình đọc màn hình", () => {
		const goc = ve(TRUOC, SAU);
		expect(() => kiemNhanAn(goc)).not.toThrow();
		expect(goc.querySelectorAll("ins .sr-only")).toHaveLength(2);
		expect(goc.querySelectorAll("del .sr-only")).toHaveLength(2);
	});

	test("trang ở dạng đã trình bày: không dấu +/− đầu dòng, không chữ đơn cách", () => {
		const goc = ve(TRUOC, SAU);
		expect(goc.querySelector("h2")?.textContent).toBe("Phản hồi khiếu nại");
		expect(goc.querySelectorAll("p").length).toBeGreaterThanOrEqual(5);
		for (const dong of (goc.textContent ?? "").split("\n"))
			expect(dong.trimStart()).not.toMatch(/^[+−]/);
		for (const khoi of goc.querySelectorAll("h2, h3, p, li, td, th"))
			expect(chuHien(khoi).trimStart()).not.toMatch(/^[+−]/);
		expect(goc.querySelector(".font-mono")).toBeNull();
		expect(goc.querySelector("pre, code")).toBeNull();
	});

	test("ins có nền, del gạch ngang, đều qua token diff", () => {
		const goc = ve(TRUOC, SAU);
		for (const ins of goc.querySelectorAll("ins"))
			expect(ins.className).toContain("bg-diff-them/");
		for (const del of goc.querySelectorAll("del")) {
			expect(del.className).toContain("line-through");
			expect(del.className).toContain("decoration-diff-bo");
		}
	});

	test("đoạn bỏ và đoạn thêm liền kề cách nhau một khoảng trắng", () => {
		const goc = ve(TRUOC, SAU);
		const doan = [...goc.querySelectorAll("p")].find((p) =>
			p.textContent?.includes("Phản hồi đầu tiên"),
		);
		expect(doan).toBeDefined();
		expect(chuHien(doan as HTMLElement)).toBe(
			"Phản hồi đầu tiên trong 48 24 giờ kể từ khi nhận.",
		);
	});

	test("dải số đổi liệt kê 48 giờ → 24 giờ", () => {
		const goc = ve(TRUOC, SAU);
		const dai = goc.querySelector("[data-dai-so]");
		expect(dai?.textContent).toContain("Con số và ngày bị đổi");
		expect(
			[...(dai?.querySelectorAll("li") ?? [])].map((li) => li.textContent),
		).toEqual(["48 giờ → 24 giờ"]);
	});

	test("đối chứng: hai bản giống nhau → 0 ins, 0 del, không dải số", () => {
		const goc = ve(TRUOC, TRUOC);
		expect(goc.querySelectorAll("ins")).toHaveLength(0);
		expect(goc.querySelectorAll("del")).toHaveLength(0);
		expect(goc.querySelector("[data-dai-so]")).toBeNull();
		expect(goc.querySelector("h2")?.textContent).toBe("Phản hồi khiếu nại");
	});

	test("vẽ theo kiểu khối: h3, danh sách số, danh sách chấm, hàng bảng", () => {
		const goc = ve(
			"### Hạn\n\n1. Nhận\n2. Xử lý\n\n- Ghi 1 lần\n- Báo\n\n| Bước | Giờ |\n| --- | --- |\n| Nhận | 2 |\n",
			"### Hạn\n\n1. Nhận\n2. Xử lý\n\n- Ghi 2 lần\n- Báo\n\n| Bước | Giờ |\n| --- | --- |\n| Nhận | 3 |\n",
		);
		expect(goc.querySelector("h3")?.textContent).toBe("Hạn");
		expect(goc.querySelectorAll("ol > li")).toHaveLength(2);
		expect(goc.querySelectorAll("ul > li").length).toBeGreaterThanOrEqual(2);
		const hang = [...goc.querySelectorAll("table tr")];
		expect(hang).toHaveLength(2);
		expect([...(hang[0]?.children ?? [])].map((o) => o.textContent)).toEqual([
			"Bước",
			"Giờ",
		]);
		const o = [...(hang[1]?.children ?? [])];
		expect(o.map(chuHien)).toEqual(["Nhận", "2 3"]);
		expect(o[1]?.querySelector("del")).not.toBeNull();
		expect(o[1]?.querySelector("ins")).not.toBeNull();
		expect(() => kiemNhanAn(goc)).not.toThrow();
	});

	test("nội dung người nhập không bị trình duyệt tự dịch, nhãn ẩn thì được", () => {
		const goc = ve(TRUOC, SAU);
		const than = goc.querySelector("[data-diff-trang]");
		expect(than?.getAttribute("translate")).toBe("no");
		for (const an of goc.querySelectorAll("ins .sr-only, del .sr-only"))
			expect(an.getAttribute("translate")).toBe("yes");
	});
});

const GLOBALS = readFileSync(
	`${import.meta.dir}/../src/styles/globals.css`,
	"utf8",
);
const GEIST = readFileSync(
	`${import.meta.dir}/../src/styles/geist.css`,
	"utf8",
);

type GiaoDien = ":root" | ".dark";

function khoiCss(css: string, chon: GiaoDien): string {
	const i = css.indexOf(`${chon} {`);
	if (i < 0) throw new Error(`không thấy khối ${chon}`);
	return css.slice(i, css.indexOf("}", i));
}

function giaTri(css: string, chon: GiaoDien, ten: string): string {
	const m = khoiCss(css, chon).match(new RegExp(`--${ten}:\\s*([^;]+);`));
	if (!m?.[1]) throw new Error(`không thấy --${ten} trong ${chon}`);
	return m[1].trim();
}

function tuyenTinh(c: number): number {
	return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function doSang(gt: string, chon: GiaoDien): number {
	const ref = gt.match(/^var\(--([\w-]+)\)$/);
	if (ref?.[1]) return doSang(giaTri(GEIST, chon, ref[1]), chon);
	const hsla = gt.match(/^hsla\(var\(--([\w-]+)\)/);
	if (hsla?.[1]) {
		const [, , l] = giaTri(GEIST, chon, hsla[1]).split(",");
		return tuyenTinh(Number.parseFloat(l ?? "0") / 100);
	}
	const lab = gt.match(/^lab\(([\d.]+)%/);
	if (lab) {
		const fy = (Number(lab[1]) + 16) / 116;
		return fy ** 3 > 0.008856 ? fy ** 3 : (fy - 16 / 116) / 7.787;
	}
	const ok = gt.match(/^oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)/);
	if (!ok) throw new Error(`không đọc được màu ${gt}`);
	const L = Number(ok[1]) / 100;
	const C = Number(ok[2]);
	const h = (Number(ok[3]) * Math.PI) / 180;
	const a = C * Math.cos(h);
	const b = C * Math.sin(h);
	const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
	const kep = (x: number) => Math.min(1, Math.max(0, x));
	const r = kep(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
	const g = kep(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
	const bl = kep(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s);
	return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
}

function tuongPhan(a: number, b: number): number {
	return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

describe("token --diff-them, --diff-bo", () => {
	for (const chon of [":root", ".dark"] as const)
		for (const ten of ["diff-them", "diff-bo"])
			test(`${ten} ở ${chon} đạt 3:1 với nền trang và nền thẻ`, () => {
				const mau = doSang(giaTri(GLOBALS, chon, ten), chon);
				for (const nen of ["ds-background-100", "ds-background-200"]) {
					const sangNen = doSang(`var(--${nen})`, chon);
					expect(tuongPhan(mau, sangNen)).toBeGreaterThanOrEqual(3);
				}
			});

	test("hai token có lớp màu Tailwind", () => {
		expect(GLOBALS).toContain("--color-diff-them: var(--diff-them);");
		expect(GLOBALS).toContain("--color-diff-bo: var(--diff-bo);");
	});

	const BANG = (hang: string) =>
		`| Mục | Tỉ lệ |\n| --- | --- |\n${hang}\n| giữ | 1 |\n`;
	const O_DOI: [string, string, string, [string, string][]][] = [
		[
			"them-chu-cuoi-o",
			"| a | 5% |",
			"| a x | 5% |",
			[
				["a x", "5%"],
				["giữ", "1"],
			],
		],
		[
			"bo-chu-cuoi-o",
			"| b c | 7 |",
			"| b | 7 d |",
			[
				["b c", "7 d"],
				["giữ", "1"],
			],
		],
	];
	for (const [ten, truoc, sau, mong] of O_DOI)
		test(`bang-dung-so-o: ${ten}`, () => {
			const goc = ve(BANG(truoc), BANG(sau));
			expect(goc.querySelectorAll("thead th").length).toBe(2);
			const hang = [...goc.querySelectorAll("tbody tr")].map((tr) =>
				[...tr.querySelectorAll("td")].map((td) =>
					chuHien(td).replace(/\s+/g, " ").trim(),
				),
			);
			for (const o of hang.flat())
				if (o.includes("|")) throw new Error(`o bang con dau ngan: ${ten}`);
			if (hang.some((h) => h.length !== 2))
				throw new Error(`hang bang gop o: ${ten}`);
			expect(hang).toEqual(mong);
		});
	test("bang-dung-so-o: doi-so-cot", () => {
		const goc = ve(
			"| Mục | Tỉ lệ |\n| --- | --- |\n| a | 5% |\n",
			"| Mục | Tỉ lệ | Ghi chú |\n| --- | --- | --- |\n| a | 5% | x |\n",
		);
		expect(goc.querySelectorAll("table").length).toBe(2);
		const o = [...goc.querySelectorAll("td, th")];
		expect(o.length).toBeGreaterThan(0);
		for (const td of o)
			if (chuHien(td).includes("|"))
				throw new Error("o bang con dau ngan: doi-so-cot");
		expect(goc.querySelectorAll("del").length).toBeGreaterThan(0);
		expect(goc.querySelectorAll("ins").length).toBeGreaterThan(0);
	});
});
