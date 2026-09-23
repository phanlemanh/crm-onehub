import { afterEach, describe, expect, test } from "bun:test";
import { act, createElement as h } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	Board,
	type BoardColumn,
	type BoardMove,
} from "../src/components/board";
import { LocaleProvider } from "../src/components/locale-provider";

const COT: BoardColumn[] = [
	{
		id: "a",
		label: "Cột A",
		count: 3,
		cards: [
			{ id: "a1", href: "/ke-hoach/a1", title: "Thẻ A1" },
			{ id: "a2", href: "/ke-hoach/a2", title: "Thẻ A2", subtitle: "phụ" },
		],
	},
	{ id: "b", label: "Cột B", count: 0, cards: [] },
	{
		id: "c",
		label: "Cột C",
		count: 1,
		cards: [{ id: "c1", href: "/ke-hoach/c1", title: "Thẻ C1" }],
	},
];

const SO_THE = COT.reduce((n, c) => n + c.cards.length, 0);

let root: Root | null = null;
let khung: HTMLElement | null = null;

function dung(onMove?: (m: BoardMove) => void): HTMLElement {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() => {
		root?.render(
			h(
				LocaleProvider,
				{ locale: "vi" },
				h(Board, { columns: COT, label: "Bảng thử", onMove }),
			),
		);
	});
	return khung;
}

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
});

describe("board-giu-nguyen", () => {
	test("khong onMove: khong tay keo, the la duong dan", () => {
		const k = dung();
		const tayKeo = k.querySelectorAll('[data-slot="kanban-item-handle"]');
		if (tayKeo.length !== 0) {
			throw new Error(`khong onMove: co tay keo (${tayKeo.length})`);
		}
		const the = [...k.querySelectorAll("[data-board-card]")];
		expect(the.length).toBe(SO_THE);
		for (const el of the) {
			expect(el.tagName).toBe("A");
			expect(el.getAttribute("href")).toBe(
				`/ke-hoach/${el.getAttribute("data-board-card")}`,
			);
		}
		expect(k.querySelectorAll("[data-board-column]").length).toBe(COT.length);
		expect(k.querySelector('[data-slot="kanban"]')).toBeNull();
	});

	test("co onMove: moi the co tay keo, khong nut long trong role=button", () => {
		const k = dung(() => undefined);
		const tayKeo = [...k.querySelectorAll('[data-slot="kanban-item-handle"]')];
		expect(tayKeo.length).toBe(SO_THE);
		for (const el of tayKeo) {
			expect(el.getAttribute("role")).toBe("button");
			expect(el.getAttribute("aria-label")).toMatch(/^Kéo Thẻ /);
		}
		const theVaiNut = k.querySelectorAll(
			'[data-slot="kanban-item"][role="button"]',
		);
		expect(theVaiNut.length).toBe(0);
		expect(k.querySelectorAll('[role="button"] button').length).toBe(0);
		expect(k.querySelectorAll("[data-board-column]").length).toBe(COT.length);
		expect(
			k.querySelectorAll('[data-slot="kanban-column"][data-over]').length,
		).toBe(COT.length);
	});
});
