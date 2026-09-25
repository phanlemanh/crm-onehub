import { afterEach, describe, expect, test } from "bun:test";
import { act, createElement as h } from "react";
import { createRoot, type Root } from "react-dom/client";
import Logo from "../src/components/logo";

let root: Root | null = null;
let khung: HTMLElement | null = null;

function dung(noiDung: ReturnType<typeof h>): SVGSVGElement[] {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() => {
		root?.render(noiDung);
	});
	return Array.from(khung.querySelectorAll("svg"));
}

function dai(svg: SVGSVGElement): Element {
	const found = svg.querySelector("linearGradient");
	if (!found) throw new Error("khong thay linearGradient trong svg");
	return found;
}

function dat(dieuKien: boolean, thongDiep: string): void {
	if (!dieuKien) throw new Error(thongDiep);
}

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
});

function haiLogo() {
	return dung(
		h(
			"div",
			null,
			h(Logo, { key: "a" }),
			h(Logo, { key: "b", className: "size-5", "aria-hidden": "true" }),
		),
	);
}

describe("Logo", () => {
	test("a: mac dinh la hinh co ten OneHub", () => {
		const [dau] = haiLogo();
		expect(dau?.getAttribute("role")).toBe("img");
		expect(dau?.getAttribute("aria-label")).toBe("OneHub");
	});

	test("b: hai logo co hai id dai mau khac nhau", () => {
		const [dau, sau] = haiLogo();
		if (!dau || !sau) throw new Error("khong du hai svg");
		const idDau = dai(dau).id;
		const idSau = dai(sau).id;
		dat(idDau.length > 0 && idSau.length > 0, "id rong");
		dat(idDau !== idSau, `id trung: ${idDau}`);
	});

	test("c: moi logo to bang dai mau cua chinh no", () => {
		for (const svg of haiLogo()) {
			const gradient = dai(svg);
			const path = svg.querySelector("path");
			expect(path?.getAttribute("fill")).toBe(`url(#${gradient.id})`);
			const theoId = document.getElementById(gradient.id);
			dat(theoId === gradient, `url(#${gradient.id}) tro sang phan tu khac`);
			dat(svg.contains(theoId), `dai mau ${gradient.id} nam ngoai svg`);
		}
	});

	test("d: className va aria-hidden cua cho goi de duoc mac dinh", () => {
		const [, sau] = haiLogo();
		expect(sau?.getAttribute("class")).toBe("size-5");
		expect(sau?.getAttribute("aria-hidden")).toBe("true");
	});
});
