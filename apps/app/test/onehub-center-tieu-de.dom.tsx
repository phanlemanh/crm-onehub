import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

let locale: "vi" | "en" = "vi";
mock.module("@/lib/locale/server", () => ({ getLocale: async () => locale }));

const { AuthShell, AuthHeading } = await import("@/components/auth-shell");
const { authMessages } = await import("@/lib/messages/auth");
const { cuaVaoMessages } = await import("@/lib/messages/cua-vao");

const KY_VONG = {
	vi: {
		h1: "Đăng nhập vào OneHub Center",
		neo: "OneHub Center: đối tác, kế hoạch 30 ngày và OKR.",
	},
	en: {
		h1: "Sign in to OneHub Center",
		neo: "OneHub Center: partners, 30-day plans and OKRs.",
	},
} as const;

const TRANG = [
	["sign-in", true],
	["dat-mat-khau", false],
	["grant-access", false],
	["onboarding", false],
	["onboarding/research", false],
] as const;

async function ve(coKhoi: boolean): Promise<HTMLElement> {
	const cay = await AuthShell({
		children: await AuthHeading({
			cap: "h1",
			title: authMessages(locale).signIn.title,
			description: "",
		}),
		gioiThieu: coKhoi ? <div data-khoi="" /> : undefined,
	});
	const o = document.createElement("div");
	o.innerHTML = renderToStaticMarkup(cay);
	return o;
}

describe("tieu de OneHub Center", () => {
	for (const l of ["vi", "en"] as const) {
		for (const [trang, coKhoi] of TRANG) {
			it(`${trang}/${l}`, async () => {
				locale = l;
				const o = await ve(coKhoi);
				const nhanCu = [...o.querySelectorAll("*")].filter(
					(e) => e.textContent?.trim() === "CRM",
				);
				expect(nhanCu.length, `${trang}/${l}: con nhan CRM`).toBe(0);
				expect(
					authMessages(l).shell.headline,
					`tieu de: ${authMessages(l).shell.headline}`,
				).toBe(KY_VONG[l].neo);
				if (trang === "sign-in") {
					expect(authMessages(l).signIn.title).toBe(KY_VONG[l].h1);
					expect(o.querySelector("h1")?.textContent).toBe(KY_VONG[l].h1);
				}
			});
		}
	}

	it("mo ta khoi huong dan (vi)", () => {
		expect(cuaVaoMessages("vi").lanDau.moTa).toBe(
			"OneHub Center chỉ mở cho địa chỉ quản trị viên đã cho phép.",
		);
	});
});
