import { describe, expect, it, mock } from "bun:test";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("@/lib/locale/server", () => ({
	getLocale: async () => "vi" as const,
}));

const vo = await import("@/components/auth-shell");
const { authMessages } = await import("@/lib/messages/auth");

const DONG_TIEU_DE = "CRM của OneHub: đối tác, kế hoạch 30 ngày và OKR.";

async function ve(gioiThieu?: ReactNode): Promise<HTMLElement> {
	const cay = await vo.AuthShell({
		children: <p data-khung="">khung đăng nhập</p>,
		gioiThieu,
	});
	const o = document.createElement("div");
	o.innerHTML = renderToStaticMarkup(cay);
	document.body.appendChild(o);
	return o;
}

function phanCuaMain(o: HTMLElement): HTMLElement[] {
	return [...o.querySelectorAll<HTMLElement>("main > section")];
}

function coHieuUngNen(el: Element | undefined): boolean {
	return [...(el?.querySelectorAll("[aria-hidden=true]") ?? [])].some((e) =>
		(e.getAttribute("class") ?? "").includes("radial-gradient"),
	);
}

describe("AuthShell la ban that", () => {
	it("khong phai mock ro tu tep khac", () => {
		expect(vo.AuthShell.name).toBe("AuthShell");
		expect(vo.AuthHeading.name).toBe("AuthHeading");
	});
});

describe("AuthShell khong nhan khoi cot trai", () => {
	it("giu cot trai an duoi lg, hieu ung nen, chu CRM va dong tieu de moi", async () => {
		const o = await ve();
		const [trai, phai] = phanCuaMain(o);
		expect(trai?.className).toContain("hidden");
		expect(trai?.className).toContain("lg:flex");
		expect(coHieuUngNen(trai)).toBe(true);
		expect(trai?.textContent).toContain("CRM");
		expect(trai?.querySelector("h1")?.textContent).toBe(DONG_TIEU_DE);
		expect(authMessages("vi").shell.headline).toBe(DONG_TIEU_DE);
		expect(phai?.querySelector("[data-khung]")).not.toBeNull();
	});

	it("khong phan tu nao cua khung mang lop dark", async () => {
		const o = await ve();
		expect(o.querySelector(".dark")).toBeNull();
	});
});

describe("AuthShell nhan khoi cot trai — doi chung", () => {
	it("khung dang nhap dung truoc trong DOM, khoi sang cot trai tu lg", async () => {
		const o = await ve(<div data-khoi="">khối</div>);
		const [dau, sau] = phanCuaMain(o);
		expect(dau?.querySelector("[data-khung]")).not.toBeNull();
		expect(sau?.querySelector("[data-khoi]")).not.toBeNull();
		expect(sau?.className).toContain("lg:order-first");
		expect(sau?.className).not.toContain("hidden");
		expect(sau?.className).toContain("bg-muted");
	});

	it("khong hieu ung nen, khong dong tieu de cua khung", async () => {
		const o = await ve(<div data-khoi="">khối</div>);
		expect(phanCuaMain(o).some(coHieuUngNen)).toBe(false);
		expect(o.textContent).not.toContain(DONG_TIEU_DE);
	});

	it("logo cua cot trai chi de nhin, khong phai lien ket", async () => {
		const o = await ve(<div data-khoi="">khối</div>);
		const [, sau] = phanCuaMain(o);
		expect(sau?.querySelector("a")).toBeNull();
		expect(sau?.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
	});
});

describe("AuthHeading", () => {
	it("mac dinh h2, cap h1 khi duoc yeu cau", async () => {
		const hai = renderToStaticMarkup(
			await vo.AuthHeading({ title: "Tiêu đề", description: "Mô tả" }),
		);
		const mot = renderToStaticMarkup(
			await vo.AuthHeading({
				title: "Tiêu đề",
				description: "Mô tả",
				cap: "h1",
			}),
		);
		expect(hai).toContain("<h2");
		expect(mot).toContain("<h1");
		expect(mot).not.toContain("<h2");
	});
});
