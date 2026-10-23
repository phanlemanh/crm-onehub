import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Item } from "../src/components/item";

let root: Root | null = null;

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
});

function ve(cay: ReactElement) {
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	act(() => root?.render(cay));
	return o;
}

const LOP_KHOA = [
	"aria-disabled:cursor-not-allowed",
	"aria-disabled:opacity-50",
	"aria-disabled:hover:bg-transparent",
];

describe("Item — dòng nút và dòng khoá", () => {
	test("item-khoa: dong nut co nen khi re chuot, dong aria-disabled mo va khong to nen", () => {
		const nut = ve(
			<Item asChild variant="outline">
				<button type="button">x</button>
			</Item>,
		).querySelector("button");
		expect(nut?.className).toContain("[button]:hover:bg-muted");
		act(() => root?.unmount());
		const khoa = ve(
			<Item asChild variant="outline">
				<button aria-disabled="true" type="button">
					x
				</button>
			</Item>,
		).querySelector("button");
		expect(khoa?.getAttribute("aria-disabled")).toBe("true");
		for (const lop of LOP_KHOA) {
			if (!khoa?.className.includes(lop))
				throw new Error(`item-khoa: thieu lop ${lop}`);
		}
	});
});
