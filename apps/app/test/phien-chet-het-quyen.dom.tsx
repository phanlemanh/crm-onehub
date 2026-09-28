import { describe, expect, it, mock } from "bun:test";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

class ChuyenHuong extends Error {
	constructor(readonly dich: string) {
		super(`chuyen huong toi ${dich}`);
	}
}

const may = { phien: null as { user: { id: string } } | null };

mock.module("@/lib/session", () => ({
	getSession: async () => may.phien,
	requireSession: async () => may.phien,
	requireMailboxAccess: async () => may.phien,
}));
mock.module("@/lib/locale/server", () => ({
	getLocale: async () => "vi" as const,
}));
mock.module("next/navigation", () => ({
	redirect: (dich: string) => {
		throw new ChuyenHuong(dich);
	},
	useRouter: () => ({ push: () => undefined, refresh: () => undefined }),
}));

const { default: HetQuyenPage } = await import(
	"@/app/(landing)/het-quyen/page"
);
const { thanhVienMessages } = await import(
	"@/lib/messages/settings-thanh-vien"
);
const t = thanhVienMessages("vi").hetQuyen;

describe("het-quyen", () => {
	it("sends a stranger to sign in and keeps the page for a live session", async () => {
		const sai: string[] = [];

		may.phien = null;
		const loi = await Promise.resolve(HetQuyenPage()).then(
			() => null,
			(e: unknown) => e,
		);
		if (!(loi instanceof ChuyenHuong && loi.dich === "/sign-in")) {
			sai.push("het-quyen: khong phien ma khong ve /sign-in");
		}

		may.phien = { user: { id: "u" } };
		const o = document.createElement("div");
		o.innerHTML = renderToStaticMarkup((await HetQuyenPage()) as ReactElement);
		const nut = [...o.querySelectorAll("button")].map((b) => b.textContent);
		if (
			o.querySelector("h1")?.textContent !== t.tieuDe ||
			!nut.includes(t.dangXuat)
		) {
			sai.push("het-quyen: nguoi con phien mat trang");
		}

		expect(sai).toEqual([]);
	});
});
