import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { KaraArtifact } from "../src/components/kara/artifact";
import {
	KaraDock,
	KaraDockBody,
	KaraDockFooter,
	KaraDockHeader,
} from "../src/components/kara/dock";
import { LocaleProvider } from "../src/components/locale-provider";

let root: Root | null = null;

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
});

function dung(el: ReactElement) {
	const khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() => root?.render(<LocaleProvider locale="vi">{el}</LocaleProvider>));
}

function lop(el: Element | null): string {
	if (!el) throw new Error("khong thay phan tu");
	return el.getAttribute("class") ?? "";
}

describe("sk-kara-dock", () => {
	test("cột rail lấy bề ngang từ token và có đúng một đường kẻ bên trái", () => {
		dung(
			<div>
				<KaraDock side="fill" data-o="ban-nhap">
					<KaraDockHeader>Bản nháp</KaraDockHeader>
				</KaraDock>
				<KaraDock side="rail" data-o="hoi-thoai">
					<KaraDockHeader>Kara</KaraDockHeader>
					<KaraDockBody>tin</KaraDockBody>
					<KaraDockFooter>o soan</KaraDockFooter>
				</KaraDock>
			</div>,
		);
		const rail = lop(document.querySelector("[data-o=hoi-thoai]"));
		const fill = lop(document.querySelector("[data-o=ban-nhap]"));
		expect(rail, "cot kara khong theo token").toContain(
			"w-(--container-assist-rail)",
		);
		expect(rail).toContain("border-l");
		expect(fill, "ban nhap khong theo token").toContain(
			"w-(--container-assist)",
		);
		expect(fill).not.toContain("border");
		expect(
			document.querySelectorAll("[data-slot=kara-dock-header]").length,
		).toBe(2);
	});

	test("cột đứng một mình phủ hết bề ngang, không kẻ", () => {
		dung(
			<KaraDock side="rail" alone data-o="hoi-thoai">
				<KaraDockHeader>Kara</KaraDockHeader>
			</KaraDock>,
		);
		const c = lop(document.querySelector("[data-o=hoi-thoai]"));
		expect(c).toContain("flex-1");
		expect(c).not.toContain("border-l");
	});

	test("KaraArtifact docked không viền, không bo; mặc định giữ khung thẻ", () => {
		dung(
			<KaraArtifact title="Bản nháp" variant="docked" footer={<span>chan</span>}>
				<p>than</p>
			</KaraArtifact>,
		);
		const docked = document.querySelector("[data-slot=kara-artifact]");
		expect(docked?.getAttribute("data-variant")).toBe("docked");
		expect(lop(docked), "docked con vien").not.toMatch(/\bborder\b|rounded/);
		expect(document.querySelector("[data-slot=kara-dock-header]")).not.toBeNull();
		expect(document.querySelector("[data-slot=kara-dock-footer]")).not.toBeNull();
		act(() => root?.unmount());
		root = null;
		document.body.innerHTML = "";
		dung(
			<KaraArtifact title="Bản nháp">
				<p>than</p>
			</KaraArtifact>,
		);
		const the = document.querySelector("[data-slot=kara-artifact]");
		expect(the?.hasAttribute("data-variant")).toBe(false);
		expect(lop(the)).toContain("rounded-lg");
	});
});
