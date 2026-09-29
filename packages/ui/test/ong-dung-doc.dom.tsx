import { afterEach, describe, expect, test } from "bun:test";
import { soSanh, suKienDoi } from "@crm/validation/tai-lieu-diff";
import { tuanTuHoa } from "@crm/validation/tai-lieu-markdown";
import type { JSONContent } from "@tiptap/core";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { DiffTrang } from "../src/components/diff-trang";
import { MarkdownReader } from "../src/components/markdown-reader";

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

const O_MAU = ["a|b", "\\|"] as const;

function doan(chu: string): JSONContent {
	return { type: "paragraph", content: [{ type: "text", text: chu }] };
}

function bang(o: string): string {
	return tuanTuHoa({
		type: "doc",
		content: [
			{
				type: "table",
				content: [
					{
						type: "tableRow",
						content: ["A", "B"].map((c) => ({
							type: "tableHeader",
							content: [doan(c)],
						})),
					},
					{
						type: "tableRow",
						content: [o, "x"].map((c) => ({
							type: "tableCell",
							content: [doan(c)],
						})),
					},
				],
			},
		],
	});
}

async function ve(jsx: React.ReactNode): Promise<HTMLElement> {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	await act(async () => {
		root?.render(jsx);
		await new Promise((r) => setTimeout(r, 50));
	});
	return khung;
}

function oDong(goc: HTMLElement, chon: string): string[] {
	const dong = goc.querySelector(chon);
	return [...(dong?.querySelectorAll("td") ?? [])].map(
		(td) => td.textContent?.trim() ?? "",
	);
}

function kiem(o: string, thay: string[]): void {
	if (thay[0] !== o) {
		throw new Error(`ong-dung-doc: o hien '${thay[0] ?? ""}'`);
	}
	expect(thay).toEqual([o, "x"]);
}

describe("ong-dung-doc", () => {
	for (const o of O_MAU) {
		test(`ong-dung-doc: trinh doc hien dung o ${o}`, async () => {
			const md = bang(o);
			const goc = await ve(<MarkdownReader>{md}</MarkdownReader>);
			kiem(o, oDong(goc, "tbody tr"));
			expect(md).toContain("\\|");
		});

		test(`ong-dung-doc: man duyet hien dung o ${o}`, async () => {
			const truoc = "Đoạn mở.\n";
			const sau = `Đoạn mở.\n${bang(o)}`;
			const khoi = soSanh(truoc, sau);
			const goc = await ve(
				<DiffTrang
					dai={suKienDoi(khoi)}
					khoi={khoi}
					nhanBo="Bỏ"
					nhanDaiSo="Con số và ngày bị đổi"
					nhanThem="Thêm"
				/>,
			);
			const chu = goc.textContent ?? "";
			expect(chu).toContain(o);
			expect(chu).not.toContain(o === "a|b" ? "a\\|b" : "\\\\|");
		});
	}
});
