import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { StepList, StepListItem } from "../src/components/step-list";

const TIEN_DO_SEP = 0;
const TIEN_DO_XONG = 3;

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

function dung(el: ReactElement): HTMLElement {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() => root?.render(el));
	return khung;
}

function danhSach(n: number, tinh: boolean): HTMLElement {
	return dung(
		<StepList activeStep={2} label="Lần đầu vào?" markCompleted tinh={tinh}>
			{Array.from({ length: n }, (_, i) => (
				<StepListItem
					activeStep={2}
					key={`b${i + 1}`}
					step={i + 1}
					title={`bước ${i + 1}`}
				/>
			))}
		</StepList>,
	);
}

describe("StepList tinh co duong noi", () => {
	for (const n of [1, 2, 3, 4]) {
		test(`tinh n=${n}`, () => {
			const o = danhSach(n, true);
			const sep = [...o.querySelectorAll("[data-slot=stepper-separator]")];
			expect(
				sep.length,
				`tinh n=${n}: ${sep.length} duong noi, can ${n - 1}`,
			).toBe(n - 1);
			for (const s of sep) {
				expect(
					s.closest("[aria-hidden=true]"),
					"duong noi khong aria-hidden",
				).not.toBeNull();
			}
			const muc = [...o.querySelectorAll("[data-slot=stepper-item]")];
			expect(
				muc.at(-1)?.querySelector("[data-slot=stepper-separator]") ?? null,
			).toBeNull();
		});
	}

	test("che do tien do giu nguyen", () => {
		const o = danhSach(3, false);
		expect(o.querySelectorAll("[data-slot=stepper-separator]").length).toBe(
			TIEN_DO_SEP,
		);
		expect(o.querySelectorAll("[data-state=completed]").length).toBe(
			TIEN_DO_XONG,
		);
	});
});
