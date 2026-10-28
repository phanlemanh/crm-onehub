import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { KaraArtifact } from "../src/components/kara/artifact";
import { LocaleProvider } from "../src/components/locale-provider";
import { Textarea } from "../src/components/textarea";

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

function lop(el: Element | null): string[] {
	if (!el) throw new Error("khong thay phan tu");
	return (el.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

describe("vk10-kara-artifact-muted", () => {
	test("ô vật phẩm dựng bố cục dock mà không mang nhãn Kara", () => {
		dung(
			<KaraArtifact
				variant="docked"
				metaStyle="muted"
				title="Bộ OKR quý 4"
				meta="Phòng Kinh doanh"
				actions={<button type="button">Đóng</button>}
				footer={<button type="button">Công bố 2</button>}
			>
				<p>Nội dung</p>
			</KaraArtifact>,
		);
		const vatPham = document.querySelector("[data-slot=kara-artifact]");
		expect(vatPham).not.toBeNull();
		expect(document.querySelector("[data-slot=kara-mark]")).toBeNull();
		expect(
			vatPham?.querySelector("[data-slot=kara-dock-header]"),
		).not.toBeNull();
		expect(vatPham?.querySelector("[data-slot=kara-dock-body]")).not.toBeNull();
		const chan = vatPham?.querySelector("[data-slot=kara-dock-footer]");
		expect(chan?.textContent).toBe("Công bố 2");
		expect(vatPham?.textContent).toContain("Bộ OKR quý 4");
		expect(
			vatPham?.querySelector("[data-slot=kara-artifact-meta]")?.textContent,
		).toBe("Phòng Kinh doanh");
		expect(vatPham?.textContent).toContain("Nội dung");
	});

	test("không có chân thì không dựng chân", () => {
		dung(
			<KaraArtifact variant="docked" metaStyle="muted" title="Bộ trống">
				<p>Trống</p>
			</KaraArtifact>,
		);
		expect(document.querySelector("[data-slot=kara-artifact]")).not.toBeNull();
		expect(document.querySelector("[data-slot=kara-dock-footer]")).toBeNull();
	});

	test("dòng tài liệu có hai cỡ chữ khác nhau, không viền, tự cao theo chữ", () => {
		dung(
			<div>
				<Textarea variant="tai-lieu" size="tieu-de" data-o="tieu-de" />
				<Textarea variant="tai-lieu" size="dong" data-o="dong" />
			</div>,
		);
		const tieuDe = lop(document.querySelector("[data-o=tieu-de]"));
		const dong = lop(document.querySelector("[data-o=dong]"));
		const coChu = (ds: string[]) =>
			ds.filter((c) => /^(md:)?text-(xs|sm|base|lg|xl)$/.test(c)).sort();
		expect(coChu(tieuDe)).not.toEqual(coChu(dong));
		expect(coChu(tieuDe)).not.toContain("md:text-xs");
		expect(coChu(dong)).not.toContain("md:text-xs");
		expect(tieuDe).toContain("font-semibold");
		expect(dong).not.toContain("font-semibold");
		for (const ds of [tieuDe, dong]) {
			expect(ds).toContain("border-transparent");
			expect(ds).toContain("bg-transparent");
			expect(ds).toContain("field-sizing-content");
			expect(ds).not.toContain("border-input");
			expect(ds).not.toContain("max-h-40");
		}
	});
});
