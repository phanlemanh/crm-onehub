import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
} from "../src/components/breadcrumb";
import { LocaleProvider } from "../src/components/locale-provider";

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
	act(() => root?.render(cay));
	return o;
}

function Mau({ nhan }: { nhan?: string }) {
	return (
		<Breadcrumb aria-label={nhan}>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbPage>Trang</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	);
}

function kiemNhan(o: HTMLElement, mong: string, man: string) {
	const nhan = o
		.querySelector('nav[data-slot="breadcrumb"]')
		?.getAttribute("aria-label");
	if (nhan !== mong) {
		throw new Error(`cmt-breadcrumb: ${man} doc ${nhan} thay vi ${mong}`);
	}
}

describe("breadcrumb-nhan", () => {
	const O = [
		["vi", "vi", undefined, "Vị trí trang"],
		["en", "en", undefined, "Breadcrumb"],
		["vi-goi", "vi", "Đường về", "Đường về"],
	] as const;

	for (const [man, locale, nhan, mong] of O) {
		test(`${man} doc ${mong}`, () => {
			const o = ve(
				<LocaleProvider locale={locale}>
					<Mau nhan={nhan} />
				</LocaleProvider>,
			);
			kiemNhan(o, mong, man);
		});
	}

	test("ma tran du 3 o", () => {
		expect(O.length).toBe(3);
	});

	test("ngoai LocaleProvider van dung, khong nem", () => {
		const o = ve(<Mau />);
		expect(
			o
				.querySelector('nav[data-slot="breadcrumb"]')
				?.getAttribute("aria-label"),
		).toBeTruthy();
	});

	test("chieu do: nhan cung tieng Anh thi bai kiem bat", () => {
		const o = ve(<nav aria-label="breadcrumb" data-slot="breadcrumb" />);
		expect(() => kiemNhan(o, "Vị trí trang", "vi")).toThrow(
			"cmt-breadcrumb: vi doc breadcrumb thay vi Vị trí trang",
		);
	});
});
