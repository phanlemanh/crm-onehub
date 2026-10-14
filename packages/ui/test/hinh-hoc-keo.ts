import { act } from "react";

const COT_X = 20;
const COT_RONG = 260;
const COT_CACH = 300;
const COT_CAO = 600;
const THE_Y = 60;
const THE_CACH = 100;
const THE_CAO = 80;
const CHO_PHIM_MS = 30;

function hop(x: number, y: number, w: number, h: number): DOMRect {
	return {
		x,
		y,
		left: x,
		top: y,
		width: w,
		height: h,
		right: x + w,
		bottom: y + h,
		toJSON: () => ({}),
	};
}

function hopThe(the: Element): DOMRect {
	const cot = the.closest("[data-board-column]");
	const cots = [...document.querySelectorAll("[data-board-column]")];
	const i = cot ? cots.indexOf(cot) : 0;
	const ds = cot ? [...cot.querySelectorAll("[data-board-card]")] : [the];
	const j = ds.indexOf(the);
	return hop(
		COT_X + i * COT_CACH + 8,
		THE_Y + j * THE_CACH,
		COT_RONG - 16,
		THE_CAO,
	);
}

export function datHinhHocKeo(): () => void {
	const goc = Element.prototype.getBoundingClientRect;
	Element.prototype.getBoundingClientRect = function (this: Element) {
		if (this.closest(".cursor-grabbing")) {
			const dang = document.activeElement?.closest("[data-board-card]");
			return dang ? hopThe(dang) : goc.call(this);
		}
		const cot = this.closest("[data-board-column]");
		if (!cot) return goc.call(this);
		const the = this.closest("[data-board-card]");
		if (the) return hopThe(the);
		const cots = [...document.querySelectorAll("[data-board-column]")];
		return hop(COT_X + cots.indexOf(cot) * COT_CACH, 20, COT_RONG, COT_CAO);
	};
	return () => {
		Element.prototype.getBoundingClientRect = goc;
	};
}

async function phim(code: string): Promise<void> {
	const key = code === "Space" ? " " : code;
	await act(async () => {
		document.activeElement?.dispatchEvent(
			new KeyboardEvent("keydown", { code, key, bubbles: true }),
		);
		await new Promise((r) => setTimeout(r, CHO_PHIM_MS));
	});
}

export async function keoBangPhim(
	goc: ParentNode,
	cardId: string,
	buoc: ("ArrowRight" | "ArrowLeft" | "ArrowUp" | "ArrowDown")[],
): Promise<void> {
	const tay = goc.querySelector(
		`[data-board-card="${cardId}"] [data-slot="kanban-item-handle"]`,
	);
	if (!(tay instanceof HTMLElement)) {
		throw new Error(`keo phim: khong co tay keo ${cardId}`);
	}
	tay.focus();
	await phim("Space");
	for (const b of buoc) await phim(b);
	await phim("Space");
}
