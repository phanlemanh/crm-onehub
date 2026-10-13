import { afterEach, describe, expect, test } from "bun:test";
import { act, createElement as h } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	Board,
	type BoardColumn,
	type BoardMove,
	boardDrop,
} from "../src/components/board";
import { LocaleProvider } from "../src/components/locale-provider";

const COT: BoardColumn[] = [
	{
		id: "a",
		label: "Cột A",
		count: 3,
		cards: [
			{ id: "c1", href: "/v/c1", title: "Thẻ 1" },
			{ id: "c2", href: "/v/c2", title: "Thẻ 2" },
			{ id: "c3", href: "/v/c3", title: "Thẻ 3" },
		],
	},
	{ id: "b", label: "Cột B", count: 0, cards: [] },
	{
		id: "c",
		label: "Cột C",
		count: 1,
		cards: [{ id: "d1", href: "/v/d1", title: "Thẻ D1" }],
	},
];

let root: Root | null = null;
let khung: HTMLElement | null = null;

function dung(props: {
	onMove?: (m: BoardMove) => void;
	canDrop?: (cardId: string, columnId: string) => boolean;
	reorder?: boolean;
}): HTMLElement {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() => {
		root?.render(
			h(
				LocaleProvider,
				{ locale: "vi" },
				h(Board, { columns: COT, label: "Bảng thử", ...props }),
			),
		);
	});
	return khung;
}

function nhac(k: HTMLElement, cardId: string) {
	const tay = k.querySelector(
		`[data-board-card="${cardId}"] [data-slot="kanban-item-handle"]`,
	);
	if (!(tay instanceof HTMLElement)) throw new Error("board: khong co tay keo");
	act(() => {
		tay.focus();
		tay.dispatchEvent(
			new KeyboardEvent("keydown", { code: "Space", key: " ", bubbles: true }),
		);
	});
	return tay;
}

async function tha(tay: HTMLElement) {
	await act(async () => {
		await new Promise((r) => setTimeout(r, 10));
		tay.dispatchEvent(
			new KeyboardEvent("keydown", {
				code: "Escape",
				key: "Escape",
				bubbles: true,
			}),
		);
		await new Promise((r) => setTimeout(r, 10));
	});
}

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
});

const keo = (from: string, to: string, fromIndex: number, toIndex: number) => ({
	cardId: COT.find((c) => c.id === from)?.cards[fromIndex]?.id ?? "",
	from,
	to,
	fromIndex,
	toIndex,
});

describe("board-can-drop", () => {
	test("board-can-drop: thả vào cột cấm không gọi onMove", () => {
		const cam = (_id: string, cot: string) => cot !== "b";
		const ra = boardDrop(keo("a", "b", 0, 0), COT, { canDrop: cam });
		if (ra !== null) throw new Error("board: tha vao cot cam van goi onMove");
		const duoc = boardDrop(keo("a", "c", 0, 1), COT, { canDrop: cam });
		expect(duoc).toEqual({ cardId: "c1", from: "a", to: "c" });
	});

	test("board-can-drop: đang kéo thì cột không nhận mang data-khong-nhan", async () => {
		const k = dung({
			onMove: () => undefined,
			canDrop: (_id, cot) => cot !== "b",
		});
		const tay = nhac(k, "c1");
		const cotB = k.querySelector('[data-board-column="b"]');
		const cotC = k.querySelector('[data-board-column="c"]');
		if (
			cotB?.getAttribute("data-khong-nhan") !== "true" ||
			cotC?.hasAttribute("data-khong-nhan")
		) {
			throw new Error("board: cot cam khong mo");
		}
		await tha(tay);
		if (k.querySelector("[data-khong-nhan]")) {
			throw new Error("board: cot cam con mo sau khi tha");
		}
	});
});

describe("board-reorder", () => {
	test("board-reorder: kéo thẻ thứ ba lên đầu cùng cột báo thứ tự mới", () => {
		const ra = boardDrop(keo("a", "a", 2, 0), COT, { reorder: true });
		if (
			JSON.stringify(ra) !==
			JSON.stringify({
				cardId: "c3",
				from: "a",
				to: "a",
				order: ["c3", "c1", "c2"],
			})
		) {
			throw new Error(`board: reorder sai ${JSON.stringify(ra)}`);
		}
		const xuong = boardDrop(keo("a", "a", 0, 2), COT, { reorder: true });
		expect(xuong?.order).toEqual(["c2", "c3", "c1"]);
		const sang = boardDrop(keo("a", "c", 1, 0), COT, { reorder: true });
		expect(sang?.order).toEqual(["c2", "d1"]);
		const cuoi = boardDrop(keo("a", "b", 0, 0), COT, { reorder: true });
		expect(cuoi?.order).toEqual(["c1"]);
		expect(boardDrop(keo("a", "a", 1, 1), COT, { reorder: true })).toBeNull();
	});

	test("board-reorder: tắt reorder thì thả trong cùng cột không báo", () => {
		const ra = boardDrop(keo("a", "a", 2, 0), COT, {});
		if (ra !== null) throw new Error("board: reorder tat van bao");
	});
});

describe("board-cu", () => {
	test("board-cu: không lựa chọn mới — khác cột báo như cũ, không thứ tự, không cột mờ", async () => {
		const ra = boardDrop(keo("a", "c", 0, 1), COT, {});
		expect(ra).toEqual({ cardId: "c1", from: "a", to: "c" });
		const k = dung({ onMove: () => undefined });
		const tay = nhac(k, "c1");
		expect(k.querySelectorAll("[data-khong-nhan]").length).toBe(0);
		await tha(tay);
		expect(k.querySelectorAll('[data-slot="kanban-item-handle"]').length).toBe(
			4,
		);
	});

	test("board-cu: không onMove — thẻ là đường dẫn, không tay kéo", () => {
		const k = dung({});
		expect(k.querySelectorAll('[data-slot="kanban-item-handle"]').length).toBe(
			0,
		);
		expect(k.querySelectorAll("a[data-board-card]").length).toBe(4);
	});
});
