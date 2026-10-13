import { afterEach, describe, expect, mock, test } from "bun:test";
import { act, type ReactElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => children,
}));

const {
	PageShellActions,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellNote,
	PageShellTitle,
} = await import("@/components/page-shell");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");

let root: Root | null = null;

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
});

function ve(cay: ReactElement): HTMLElement {
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	act(() => root?.render(<LocaleProvider locale="vi">{cay}</LocaleProvider>));
	return o;
}

function phai(dieu: boolean, thongDiep: string) {
	if (!dieu) throw new Error(thongDiep);
}

function truoc(a: Element | null, b: Element | null): boolean {
	if (!a || !b) return false;
	return Boolean(
		a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING,
	);
}

function lop(el: Element | null): string[] {
	return (el?.getAttribute("class") ?? "").split(/\s+/);
}

describe("dau-trang", () => {
	test("thu tu tieu de, mo ta, dong ly do, nut; lop thu tu theo kho", () => {
		const o = ve(
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>Tiêu đề</PageShellTitle>
					<PageShellDescription>Mô tả</PageShellDescription>
					<PageShellNote id="ly-do-x">Vì sao nút tắt</PageShellNote>
				</PageShellHeading>
				<PageShellActions>
					<button type="button">Phụ</button>
					<button type="button" disabled aria-describedby="ly-do-x">
						Chính
					</button>
				</PageShellActions>
			</PageShellHeader>,
		);
		const tieuDe = o.querySelector('[data-slot="page-shell-title"]');
		const moTa = o.querySelector('[data-slot="page-shell-description"]');
		const ghiChu = o.querySelector('[data-slot="page-shell-note"]');
		const nut = o.querySelector('[data-slot="page-shell-actions"]');
		phai(truoc(tieuDe, moTa), "kmc-dau-trang: tieu de khong dung truoc mo ta");
		phai(truoc(moTa, ghiChu), "kmc-dau-trang: dong ly do dung truoc mo ta");
		phai(truoc(ghiChu, nut), "kmc-dau-trang: nut dung truoc dong ly do");
		const lopMoTa = lop(moTa);
		phai(
			lopMoTa.includes("md:order-last") && !lopMoTa.includes("order-last"),
			"kmc-dau-trang: mo ta dung sau nut duoi md",
		);
		phai(
			lopMoTa.includes("basis-full"),
			"kmc-dau-trang: mo ta chen hang nut o 1280",
		);
		phai(
			lop(nut).some((l) => /^order-\d$/.test(l)) &&
				lop(nut).includes("md:order-none"),
			"kmc-dau-trang: nut khong xuong duoi mo ta duoi md",
		);
		expect(ghiChu?.id).toBe("ly-do-x");
		expect(
			document.getElementById(
				o.querySelector("button[disabled]")?.getAttribute("aria-describedby") ??
					"",
			)?.textContent,
		).toBe("Vì sao nút tắt");
	});
});
