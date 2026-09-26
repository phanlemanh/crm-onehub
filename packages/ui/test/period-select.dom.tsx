import { afterEach, describe, expect, test } from "bun:test";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { LocaleProvider } from "../src/components/locale-provider";
import { PeriodSelect } from "../src/components/period-select";
import type { Locale } from "../src/lib/locale";

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

const NHOM = [
	{
		label: "2026",
		items: [
			{ value: "n26", label: "Năm 2026" },
			{ value: "q3", label: "Quý 3", closed: true },
			{ value: "q4", label: "Quý 4", current: true },
		],
	},
	{ label: "2027", items: [{ value: "n27", label: "Năm 2027" }] },
];

async function mo(locale: Locale, chon: string[]) {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	await act(async () =>
		root?.render(
			<LocaleProvider locale={locale}>
				<PeriodSelect
					groups={NHOM}
					label="Chu kỳ"
					onValueChange={(v) => chon.push(v)}
					value="q4"
				/>
			</LocaleProvider>,
		),
	);
	const nut = document.querySelector<HTMLElement>("[aria-label='Chu kỳ']");
	if (!nut) throw new Error("không thấy ô chọn chu kỳ");
	await act(async () => {
		nut.focus();
		nut.dispatchEvent(
			new KeyboardEvent("keydown", {
				key: "Enter",
				code: "Enter",
				bubbles: true,
			}),
		);
	});
}

describe("period-select — nhóm theo năm, chữ «hiện tại» và «đã đóng»", () => {
	test("thứ tự mục, nhãn nhóm, chữ trạng thái tiếng Việt", async () => {
		const chon: string[] = [];
		await mo("vi", chon);
		const muc = [...document.querySelectorAll("[role='option']")];
		expect(muc.map((m) => m.textContent)).toEqual([
			"Năm 2026",
			"Quý 3 · đã đóng",
			"Quý 4 · hiện tại",
			"Năm 2027",
		]);
		expect(
			[...document.querySelectorAll("[data-slot='select-label']")].map(
				(l) => l.textContent,
			),
		).toEqual(["2026", "2027"]);
		await act(async () => {
			(muc[1] as HTMLElement).click();
		});
		expect(chon).toEqual(["q3"]);
	});

	test("chữ trạng thái tiếng Anh khác tiếng Việt", async () => {
		await mo("en", []);
		const muc = [...document.querySelectorAll("[role='option']")];
		expect(muc.map((m) => m.textContent)).toEqual([
			"Năm 2026",
			"Quý 3 · closed",
			"Quý 4 · current",
			"Năm 2027",
		]);
	});
});
