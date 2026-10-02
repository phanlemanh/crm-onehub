import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogTitle,
} from "../src/components/dialog";
import { LocaleProvider } from "../src/components/locale-provider";
import {
	Sheet,
	SheetBody,
	SheetContent,
	SheetFooter,
	SheetTitle,
} from "../src/components/sheet";

let root: Root | null = null;

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
	document.body.removeAttribute("style");
});

function dung(el: ReactElement) {
	const khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() => root?.render(<LocaleProvider locale="vi">{el}</LocaleProvider>));
}

async function cho() {
	await act(async () => {
		await new Promise((r) => setTimeout(r, 20));
	});
}

function Ngan({
	rong,
	split,
	cuonRieng,
}: {
	rong: boolean;
	split: boolean;
	cuonRieng?: boolean;
}) {
	return (
		<Sheet open>
			<SheetContent side="right" size={rong ? "assist" : undefined}>
				<SheetTitle>Ngăn thử</SheetTitle>
				<SheetBody split={split} cuonRieng={cuonRieng}>
					<form data-khoi="form" />
					<section data-khoi="cot" />
				</SheetBody>
				<SheetFooter>
					<button type="button" data-nut="huy">
						Huỷ
					</button>
					<button type="submit" data-nut="chinh">
						Lưu
					</button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}

const ngan = () => document.querySelector('[data-slot="sheet-content"]');
const than = () => document.querySelector('[data-slot="sheet-body"]');

function coDataSize(): string {
	const gia = ngan()?.getAttribute("data-size");
	if (!gia) throw new Error("thieu data-size");
	return gia;
}

describe("Ngăn chung", () => {
	test("cỡ assist mang data-size=assist, không truyền cỡ thì sm", async () => {
		dung(<Ngan rong split />);
		await cho();
		expect(coDataSize()).toBe("assist");
		act(() => root?.unmount());
		document.body.innerHTML = "";
		dung(<Ngan rong={false} split={false} />);
		await cho();
		expect(coDataSize()).toBe("sm");
	});

	test("thân ngăn mang data-split theo tham số và chứa cả form lẫn cột", async () => {
		dung(<Ngan rong split />);
		await cho();
		expect(than()?.getAttribute("data-split")).toBe("true");
		expect(than()?.querySelector('[data-khoi="form"]')).not.toBeNull();
		expect(than()?.querySelector('[data-khoi="cot"]')).not.toBeNull();
		act(() => root?.unmount());
		document.body.innerHTML = "";
		dung(<Ngan rong={false} split={false} />);
		await cho();
		expect(than()?.getAttribute("data-split")).toBe("false");
	});

	test("cuonRieng: thân không cuộn, hai cột chia chiều cao và tự cuộn", async () => {
		dung(<Ngan rong split cuonRieng />);
		await cho();
		const lop = new Set(than()?.className.split(/\s+/));
		expect(than()?.getAttribute("data-cuon-rieng")).toBe("true");
		expect(lop.has("overflow-hidden")).toBe(true);
		expect(lop.has("overflow-y-auto")).toBe(false);
		expect(lop.has("lg:grid-rows-[minmax(0,1fr)]")).toBe(true);
		expect(lop.has("lg:items-start")).toBe(false);
		expect(lop.has("content-start")).toBe(false);
	});

	test("không cuonRieng thì thân vẫn cuộn như cũ", async () => {
		dung(<Ngan rong split />);
		await cho();
		const lop = new Set(than()?.className.split(/\s+/));
		expect(than()?.getAttribute("data-cuon-rieng")).toBe("false");
		expect(lop.has("overflow-y-auto")).toBe(true);
		expect(lop.has("overflow-hidden")).toBe(false);
	});

	test("chân giữ thứ tự truyền vào và xếp như chân hộp thoại", async () => {
		dung(
			<>
				<Ngan rong={false} split={false} />
				<Dialog open>
					<DialogContent>
						<DialogTitle>Hộp thử</DialogTitle>
						<DialogFooter>
							<button type="button">Huỷ</button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</>,
		);
		await cho();
		const chan = document.querySelector('[data-slot="sheet-footer"]');
		const thuTu = [...(chan?.querySelectorAll("button") ?? [])].map((b) =>
			b.getAttribute("data-nut"),
		);
		expect(thuTu).toEqual(["huy", "chinh"]);
		const lopNgan = new Set(chan?.className.split(/\s+/));
		const lopHop = (
			document.querySelector('[data-slot="dialog-footer"]')?.className ?? ""
		)
			.split(/\s+/)
			.filter(Boolean);
		expect(lopHop.length).toBeGreaterThan(0);
		const thieu = lopHop.filter((l) => !lopNgan.has(l));
		expect(thieu).toEqual([]);
	});
});
