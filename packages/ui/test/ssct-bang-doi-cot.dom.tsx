import { afterEach, describe, expect, test } from "bun:test";
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

const HAI_COT = [
	"| Tầng | Tỉ lệ |",
	"| --- | --- |",
	"| Một | 1% |",
	"| Hai | 2% |",
].join("\n");

const BA_COT = [
	"| Tầng | Tỉ lệ | Hạn |",
	"| --- | --- | --- |",
	"| Một | 1% | Quý |",
	"| Hai | 2% | Năm |",
].join("\n");

const HAI_COT_DOI_O = HAI_COT.replace("| Hai | 2% |", "| Hai | 3% |");

type Ca = {
	ten: string;
	truoc: string;
	sau: string;
	dauCu: string[];
	dauMoi: string[];
};

const CA: readonly Ca[] = [
	{
		ten: "thêm một cột",
		truoc: HAI_COT,
		sau: BA_COT,
		dauCu: ["Tầng", "Tỉ lệ"],
		dauMoi: ["Tầng", "Tỉ lệ", "Hạn"],
	},
	{
		ten: "bớt một cột",
		truoc: BA_COT,
		sau: HAI_COT,
		dauCu: ["Tầng", "Tỉ lệ", "Hạn"],
		dauMoi: ["Tầng", "Tỉ lệ"],
	},
];

function ve(truoc: string, sau: string): HTMLElement {
	const khoi = soSanh(truoc, sau);
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() => {
		root?.render(
			<DiffTrang
				dai={suKienDoi(khoi)}
				khoi={khoi}
				nhanBo="Bỏ"
				nhanDaiSo="Con số và ngày bị đổi"
				nhanThem="Thêm"
			/>,
		);
	});
	return khung;
}

const chuO = (o: Element) =>
	[...o.childNodes]
		.map((n) =>
			n instanceof Element && n.matches(".sr-only") ? "" : n.textContent,
		)
		.join("")
		.replace(/^(Bỏ|Thêm): /, "")
		.trim();

function oCua(bang: Element, chon: string): string[][] {
	return [...bang.querySelectorAll(chon)].map((hang) =>
		[...hang.querySelectorAll("th, td")].map((o) =>
			chuO(o.querySelector("del, ins") ?? o),
		),
	);
}

function moiOLa(bang: Element, the: "del" | "ins"): boolean {
	return [...bang.querySelectorAll("th, td")].every(
		(o) => o.querySelector(the) !== null,
	);
}

describe("ssct-bang-doi-cot", () => {
	test("ssct-bang-doi-cot: hai ca viết trước", () => {
		expect(CA.map((c) => c.ten)).toEqual(["thêm một cột", "bớt một cột"]);
	});

	for (const ca of CA) {
		test(`ssct-bang-doi-cot: ${ca.ten} → hai bảng riêng, đúng tiêu đề`, () => {
			const goc = ve(ca.truoc, ca.sau);
			const bang = [...goc.querySelectorAll("table")];
			expect(bang.length).toBe(2);
			const [cu, moi] = bang as [HTMLTableElement, HTMLTableElement];
			expect(moiOLa(cu, "del")).toBe(true);
			expect(moiOLa(moi, "ins")).toBe(true);
			expect(oCua(cu, "thead tr")).toEqual([ca.dauCu]);
			expect(oCua(moi, "thead tr")).toEqual([ca.dauMoi]);
			const than = [...oCua(cu, "tbody tr"), ...oCua(moi, "tbody tr")];
			const dau = [ca.dauCu, ca.dauMoi].map((d) => JSON.stringify(d));
			expect(than.filter((h) => dau.includes(JSON.stringify(h)))).toEqual([]);
		});
	}

	test("ssct-bang-doi-cot: đối chứng — cùng số cột chỉ đổi một ô vẫn một bảng", () => {
		const goc = ve(HAI_COT, HAI_COT_DOI_O);
		expect(goc.querySelectorAll("table").length).toBe(1);
	});
});
