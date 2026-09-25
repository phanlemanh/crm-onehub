import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "../src/components/breadcrumb";
import { NavGroup, NavGroupLabel, NavItem } from "../src/components/nav-item";

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

function lop(el: Element | null): string[] {
	if (!el) throw new Error("khong thay phan tu");
	return (el.getAttribute("class") ?? "").split(/\s+/);
}

describe("khung-trang-cai-dat-ui", () => {
	test("nav-item-ngang: horizontal co w-auto, khong w-full; mac dinh giu w-full", () => {
		const k = dung(
			<nav>
				<NavItem orientation="horizontal">Chung</NavItem>
				<NavItem>Tiền tệ</NavItem>
			</nav>,
		);
		const [ngang, doc] = [...k.querySelectorAll("[data-slot='nav-item']")];
		const lopNgang = lop(ngang ?? null);
		expect(lopNgang, "horizontal: thieu w-auto").toContain("w-auto");
		expect(lopNgang, "horizontal: con w-full").not.toContain("w-full");
		expect(lop(doc ?? null), "mac dinh: mat w-full").toContain("w-full");
	});

	test("nav-group: nhom co role group tro dung nhan nhom", () => {
		const k = dung(
			<nav>
				<NavGroup aria-labelledby="nhom-a">
					<NavGroupLabel id="nhom-a">Không gian làm việc</NavGroupLabel>
					<NavItem>Chung</NavItem>
				</NavGroup>
			</nav>,
		);
		const nhom = k.querySelector("[data-slot='nav-group']");
		const nhan = k.querySelector("[data-slot='nav-group-label']");
		expect(nhom?.getAttribute("role")).toBe("group");
		expect(nhan?.textContent).toBe("Không gian làm việc");
		expect(nhom?.getAttribute("aria-labelledby")).toBe(nhan?.id ?? "khong-id");
	});

	test("breadcrumb: muc truoc la lien ket, muc cuoi aria-current va khong phai lien ket", () => {
		const k = dung(
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/ws/settings/connections">
							Kết nối
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Google</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>,
		);
		const lienKet = [...k.querySelectorAll("a")];
		expect(lienKet.map((a) => a.getAttribute("href"))).toEqual([
			"/ws/settings/connections",
		]);
		const cuoi = k.querySelector("[data-slot='breadcrumb-page']");
		expect(cuoi?.getAttribute("aria-current")).toBe("page");
		expect(cuoi?.closest("a")).toBeNull();
		expect(
			k.querySelector("[data-slot='breadcrumb-separator'] svg"),
		).not.toBeNull();
	});
});
