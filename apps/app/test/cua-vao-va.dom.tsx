import { afterEach, describe, expect, mock, test } from "bun:test";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { default: LoiTrongKhung } = await import("@/app/(app)/[slug]/error");
const { default: LoiNgoaiKhung } = await import("@/app/(app)/error");

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

afterEach(() => {
	for (const { o, root } of dangMo) {
		act(() => root.unmount());
		o.remove();
	}
	dangMo = [];
});

async function mo(con: ReactNode): Promise<HTMLElement> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	await act(async () => {
		root.render(<LocaleProvider locale="vi">{con}</LocaleProvider>);
	});
	dangMo.push({ o, root });
	return o;
}

const TRANG_LOI = [
	["trong-khung", LoiTrongKhung],
	["ngoai-khung", LoiNgoaiKhung],
] as const;

describe("trang-loi", () => {
	for (const [ca, Trang] of TRANG_LOI) {
		test(ca, async () => {
			const retry = mock(() => {});
			const o = await mo(<Trang error={new Error("x")} retry={retry} />);
			expect(retry).toHaveBeenCalledTimes(0);

			const tieuDe = [...o.querySelectorAll("[role='heading']")].map(
				(h) => h.textContent,
			);
			expect(tieuDe).toEqual(["Hệ thống đang trục trặc"]);
			expect(o.textContent).toContain("Phiên của bạn vẫn còn");
			const nut = [...o.querySelectorAll("button")];
			expect(nut.map((n) => n.textContent)).toEqual(["Thử lại"]);
			expect(document.activeElement, "nut Thu lai nhan focus").toBe(nut[0]);
			expect(o.querySelectorAll("a[href='/sign-in']")).toHaveLength(0);
			expect(o.textContent).not.toContain("Đăng xuất");

			await act(async () => {
				nut[0]?.click();
			});
			expect(retry, "retry phai duoc goi 1 lan").toHaveBeenCalledTimes(1);
		});
	}
});
