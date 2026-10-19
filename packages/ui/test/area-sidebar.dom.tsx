import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	AreaSidebar,
	AreaSidebarGroup,
	AreaSidebarItem,
	useAreaSidebarOrientation,
} from "../src/components/area-sidebar";

let root: Root | null = null;
let goc: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	goc?.remove();
	root = null;
	goc = null;
});

function dung(noiDung: ReactNode): HTMLElement {
	goc = document.createElement("div");
	document.body.appendChild(goc);
	root = createRoot(goc);
	act(() => root?.render(noiDung));
	return goc;
}

function Muc({ ten, mo = false }: { ten: string; mo?: boolean }) {
	return (
		<AreaSidebarItem asChild active={mo}>
			<a href={`/${ten}`}>{ten}</a>
		</AreaSidebarItem>
	);
}

function ChiDoc() {
	return useAreaSidebarOrientation() === "vertical" ? <span>chi-doc</span> : null;
}

function Khu({ placement }: { placement?: "area" | "panel" }) {
	return (
		<AreaSidebar
			label="Khu thu"
			header={<span>Dau</span>}
			footer={<span>Chan</span>}
			placement={placement}
		>
			<AreaSidebarGroup>
				<Muc ten="A" />
				<Muc ten="B" />
			</AreaSidebarGroup>
			<AreaSidebarGroup label="Nhom hai">
				<Muc ten="C" />
				<Muc ten="D" mo />
			</AreaSidebarGroup>
			<AreaSidebarGroup label="Nhom ba">
				<Muc ten="E" />
				<ChiDoc />
			</AreaSidebarGroup>
		</AreaSidebar>
	);
}

const chu = (ds: Iterable<Element>) => [...ds].map((e) => e.textContent);

describe("area-sidebar", () => {
	test("tbk-khung: thanh doc co nhom, nhan, dau, chan; hang ngang cung muc, khong nhan", () => {
		const k = dung(<Khu />);
		const aside = k.querySelector("aside[data-slot='area-sidebar']");
		expect(aside, "khong thay aside area-sidebar").not.toBeNull();
		const navs = aside?.querySelectorAll("nav") ?? [];
		expect(navs.length, "aside phai co dung mot nav").toBe(1);
		const nav = navs[0];
		expect(nav?.getAttribute("aria-label"), "nav doc sai nhan").toBe("Khu thu");
		const nhom = [...(aside?.querySelectorAll("[data-slot='nav-group']") ?? [])];
		expect(nhom.length, "thanh doc phai co 3 nhom").toBe(3);
		expect(
			nhom.map((n) => n.querySelector("[data-slot='nav-group-label']")?.textContent ?? null),
			"nhan nhom lech",
		).toEqual([null, "Nhom hai", "Nhom ba"]);
		const muc = [...(aside?.querySelectorAll("a") ?? [])];
		expect(chu(muc), "muc doc lech").toEqual(["A", "B", "C", "D", "E"]);
		for (const m of muc)
			expect(m.getAttribute("data-slot"), `${m.textContent}: khong phai nav-item`).toBe("nav-item");
		expect(
			chu(aside?.querySelectorAll("[aria-current='page']") ?? []),
			"muc dang mo lech",
		).toEqual(["D"]);
		const dau = [...(aside?.querySelectorAll("span") ?? [])].find((s) => s.textContent === "Dau");
		const chan = [...(aside?.querySelectorAll("span") ?? [])].find((s) => s.textContent === "Chan");
		expect(dau, "thieu dau thanh").toBeDefined();
		expect(chan, "thieu chan thanh").toBeDefined();
		if (!dau || !chan || !nav) throw new Error("thieu phan tu");
		expect(
			Boolean(dau.compareDocumentPosition(nav) & Node.DOCUMENT_POSITION_FOLLOWING),
			"dau thanh khong o truoc nav",
		).toBe(true);
		expect(
			Boolean(nav.compareDocumentPosition(chan) & Node.DOCUMENT_POSITION_FOLLOWING),
			"chan thanh khong o sau nav",
		).toBe(true);

		const strips = [...k.querySelectorAll("[data-slot='nav-strip']")].filter(
			(s) => !s.closest("aside"),
		);
		expect(strips.length, "phai co dung mot hang ngang ngoai aside").toBe(1);
		const strip = strips[0];
		expect(strip?.getAttribute("aria-label"), "hang ngang sai nhan").toBe("Khu thu");
		expect(chu(strip?.querySelectorAll("a") ?? []), "muc hang ngang lech").toEqual([
			"A",
			"B",
			"C",
			"D",
			"E",
		]);
		expect(
			strip?.querySelectorAll("[data-slot='nav-group-label']").length,
			"hang ngang co nhan nhom",
		).toBe(0);
		expect(strip?.textContent?.includes("Chan"), "hang ngang co chan thanh").toBe(false);
		const bang = k.querySelector("[data-slot='area-sidebar-strip']");
		expect(bang?.textContent?.includes("Dau"), "dai dien thoai thieu dau thanh").toBe(true);
		expect(
			chu(strip?.querySelectorAll("[aria-current='page']") ?? []),
			"hang ngang sai muc dang mo",
		).toEqual(["D"]);
	});

	test("tbk-panel: chi bo cuc doc, khong an theo kho, khong ten chuyen canh", () => {
		const k = dung(<Khu placement="panel" />);
		expect(k.querySelectorAll("[data-slot='nav-strip']").length, "panel co hang ngang").toBe(0);
		const aside = k.querySelector("aside[data-slot='area-sidebar']");
		const lop = (aside?.getAttribute("class") ?? "").split(/\s+/);
		expect(lop.includes("hidden"), "panel an theo kho").toBe(false);
		expect(
			(aside?.getAttribute("class") ?? "").includes("view-transition-name"),
			"panel mang ten chuyen canh",
		).toBe(false);
		expect(
			[...k.querySelectorAll("span")].filter((s) => s.textContent === "chi-doc").length,
			"panel thieu phan chi-doc",
		).toBe(1);

		act(() => root?.unmount());
		goc?.remove();
		const k2 = dung(<Khu />);
		const aside2 = k2.querySelector("aside[data-slot='area-sidebar']");
		const bang = k2.querySelector("[data-slot='area-sidebar-strip']");
		expect(aside2?.getAttribute("class"), "aside thieu ten chuyen canh").toContain(
			"[view-transition-name:area-sidebar]",
		);
		expect(bang?.getAttribute("class"), "dai dien thoai thieu ten chuyen canh").toContain(
			"[view-transition-name:area-sidebar]",
		);
		const chiDoc = [...k2.querySelectorAll("span")].filter((s) => s.textContent === "chi-doc");
		expect(chiDoc.length, "chi-doc xuat hien trong hang ngang").toBe(1);
		expect(chiDoc[0]?.closest("aside"), "chi-doc khong nam trong aside").not.toBeNull();
	});
});
