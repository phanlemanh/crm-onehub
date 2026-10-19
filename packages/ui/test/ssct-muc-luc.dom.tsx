import { afterEach, describe, expect, test } from "bun:test";
import { tuanTuHoa } from "@crm/validation/tai-lieu-markdown";
import type { JSONContent } from "@tiptap/core";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	MarkdownReader,
	readerHeadings,
	readerSlug,
} from "../src/components/markdown-reader";

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

const TIEU_DE = [
	{ chu: "Lương & thưởng", cap: 2 },
	{ chu: "A < B", cap: 2 },
	{ chu: "Mục *quan trọng*", cap: 3 },
] as const;

function nguonTuTrinhSoan(): string {
	const content: JSONContent[] = TIEU_DE.flatMap((t) => [
		{
			type: "heading",
			attrs: { level: t.cap },
			content: [{ type: "text", text: t.chu }],
		},
		{ type: "paragraph", content: [{ type: "text", text: "Nội dung." }] },
	]);
	return tuanTuHoa({ type: "doc", content });
}

function mucLucDoiCu(markdown: string): { id: string; text: string }[] {
	const ra: { id: string; text: string }[] = [];
	for (const dong of markdown.split("\n")) {
		const khop = /^(#{2,3})\s+(.+?)\s*#*$/.exec(dong);
		if (!khop?.[2]) continue;
		const text = khop[2].replace(/[*_`~]/g, "").trim();
		ra.push({ id: readerSlug(text), text });
	}
	return ra;
}

async function ve(markdown: string): Promise<HTMLElement> {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	await act(async () => {
		root?.render(<MarkdownReader>{markdown}</MarkdownReader>);
		await new Promise((r) => setTimeout(r, 50));
	});
	return khung;
}

describe("ssct-muc-luc", () => {
	const nguon = nguonTuTrinhSoan();

	test("ssct-muc-luc: nguồn do trình soạn sinh có ký tự thoát", () => {
		expect(nguon).toContain("&amp;");
		expect(nguon).toContain("\\*");
	});

	test("ssct-muc-luc: mục lục hiện đúng chữ người viết", () => {
		expect(readerHeadings(nguon).map((h) => h.text)).toEqual(
			TIEU_DE.map((t) => t.chu),
		);
		expect(readerHeadings(nguon).map((h) => h.depth)).toEqual(
			TIEU_DE.map((t) => t.cap),
		);
	});

	test("ssct-muc-luc: mỗi mục lục trỏ đúng id tiêu đề trên trang", async () => {
		const goc = await ve(nguon);
		const idTrang = [...goc.querySelectorAll("h2, h3")].map((h) => h.id);
		const chuTrang = [...goc.querySelectorAll("h2, h3")].map(
			(h) => h.textContent,
		);
		expect(chuTrang).toEqual(TIEU_DE.map((t) => t.chu));
		expect(readerHeadings(nguon).map((h) => h.id)).toEqual(idTrang);
	});

	test("ssct-muc-luc: chiều đỏ — mục lục đời cũ đọc chữ thô lệch chữ và id", async () => {
		const goc = await ve(nguon);
		const idTrang = [...goc.querySelectorAll("h2, h3")].map((h) => h.id);
		const cu = mucLucDoiCu(nguon);
		const lech = cu
			.filter((h, i) => h.id !== idTrang[i] || h.text !== TIEU_DE[i]?.chu)
			.map((h) => h.text);
		expect(lech).toEqual([
			"Lương &amp; thưởng",
			"A &lt; B",
			"Mục \\quan trọng\\",
		]);
	});
});
