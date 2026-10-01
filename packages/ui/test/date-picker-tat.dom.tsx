import { afterEach, describe, expect, test } from "bun:test";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { DatePicker } from "../src/components/date-picker";
import { LocaleProvider } from "../src/components/locale-provider";

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
	document.body.removeAttribute("style");
});

function dung(tat: boolean, onChange: (next: string) => void) {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() =>
		root?.render(
			<LocaleProvider locale="vi">
				<DatePicker value="2026-10-01" onChange={onChange} disabled={tat} />
			</LocaleProvider>,
		),
	);
	return document.querySelector(
		"[data-slot=date-picker-trigger]",
	) as HTMLButtonElement;
}

async function bam(el: HTMLElement) {
	await act(async () => {
		el.click();
	});
	await act(async () => {
		await new Promise((xong) => setTimeout(xong, 0));
	});
}

describe("DatePicker disabled", () => {
	test("tắt: nút bị khoá, bấm không mở lịch, không gọi onChange", async () => {
		const goi: string[] = [];
		const nut = dung(true, (next) => goi.push(next));
		expect(nut.disabled).toBe(true);
		expect(nut.hasAttribute("data-disabled")).toBe(true);
		await bam(nut);
		expect(document.querySelector("[role=dialog]")).toBeNull();
		expect(nut.getAttribute("aria-expanded")).not.toBe("true");
		expect(goi).toEqual([]);
	});

	test("đối chứng: không tắt thì bấm mở lịch", async () => {
		const nut = dung(false, () => undefined);
		expect(nut.disabled).toBe(false);
		expect(nut.hasAttribute("data-disabled")).toBe(false);
		await bam(nut);
		expect(document.querySelector("[role=dialog]")).not.toBeNull();
	});
});
