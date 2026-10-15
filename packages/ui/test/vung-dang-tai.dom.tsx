import { afterEach, expect, test } from "bun:test";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { VungDangTai } from "../src/components/vung-dang-tai";

let root: Root | null = null;

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
});

function dung(dangTai: boolean): HTMLElement {
	const khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() =>
		root?.render(
			<VungDangTai dangTai={dangTai}>
				<p>hang</p>
			</VungDangTai>,
		),
	);
	const vung = khung.querySelector('[data-slot="vung-dang-tai"]');
	if (!(vung instanceof HTMLElement))
		throw new Error("vung-dang-tai: khong dung");
	return vung;
}

test("vung-dang-tai: dang tai thi aria-busy, data-dang-tai va mo", () => {
	const vung = dung(true);
	expect(vung.getAttribute("aria-busy")).toBe("true");
	expect(vung.hasAttribute("data-dang-tai")).toBe(true);
	expect(vung.className).toContain("opacity-60");
	expect(vung.textContent).toBe("hang");
});

test("vung-dang-tai: xong thi khong aria-busy, khong data-dang-tai, khong mo", () => {
	const vung = dung(false);
	expect(vung.hasAttribute("aria-busy")).toBe(false);
	expect(vung.hasAttribute("data-dang-tai")).toBe(false);
	expect(vung.className).not.toContain("opacity-60");
	expect(vung.textContent).toBe("hang");
});
