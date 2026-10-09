import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Drawer, DrawerContent, DrawerTitle } from "../src/components/drawer";
import { LocaleProvider } from "../src/components/locale-provider";
import { Sheet, SheetContent, SheetTitle } from "../src/components/sheet";

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

function lop(chon: string): string {
	const el = document.querySelector(chon);
	if (!el) throw new Error(`khong thay ${chon}`);
	return el.getAttribute("class") ?? "";
}

describe("sk-co-kara", () => {
	test("sheet cỡ kara rộng theo nội dung và có trần bằng màn trừ 2rem", () => {
		dung(
			<Sheet open>
				<SheetContent size="kara">
					<SheetTitle>Soạn OKR</SheetTitle>
				</SheetContent>
			</Sheet>,
		);
		const nd = document.querySelector("[data-slot=sheet-content]");
		expect(nd?.getAttribute("data-size")).toBe("kara");
		const c = lop("[data-slot=sheet-content]");
		expect(c, "kara khong rong theo noi dung").toContain(
			"data-[side=right]:sm:w-auto",
		);
		expect(c, "kara khong co tran").toContain(
			"data-[side=right]:sm:max-w-[calc(100%-2rem)]",
		);
	});

	test("sheet mặc định không mang lớp của kara", () => {
		dung(
			<Sheet open>
				<SheetContent>
					<SheetTitle>Khác</SheetTitle>
				</SheetContent>
			</Sheet>,
		);
		expect(lop("[data-slot=sheet-content]")).not.toContain(
			"max-w-[calc(100%-2rem)]",
		);
	});

	test("ngăn kéo phủ toàn màn khi bật phuToanMan, không khi tắt", () => {
		dung(
			<Drawer open>
				<DrawerContent phuToanMan>
					<DrawerTitle>Soạn OKR</DrawerTitle>
				</DrawerContent>
			</Drawer>,
		);
		const nd = document.querySelector("[data-slot=drawer-content]");
		expect(nd?.hasAttribute("data-phu-toan-man")).toBe(true);
		const c = lop("[data-slot=drawer-content]");
		expect(c, "ngan keo khong phu toan man").toContain(
			"data-[vaul-drawer-direction=bottom]:h-dvh",
		);
		expect(c).toContain("data-[vaul-drawer-direction=bottom]:max-h-dvh");
		expect(c).not.toContain("data-[vaul-drawer-direction=bottom]:max-h-[80vh]");
		act(() => root?.unmount());
		root = null;
		document.body.innerHTML = "";
		dung(
			<Drawer open>
				<DrawerContent>
					<DrawerTitle>Khác</DrawerTitle>
				</DrawerContent>
			</Drawer>,
		);
		const thuong = document.querySelector("[data-slot=drawer-content]");
		expect(thuong?.hasAttribute("data-phu-toan-man")).toBe(false);
	});
});
