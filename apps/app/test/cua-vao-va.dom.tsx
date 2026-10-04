import { afterEach, describe, expect, mock, test } from "bun:test";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { default: LoiTrongKhung } = await import("@/app/(app)/[slug]/error");
const { default: LoiNgoaiKhung } = await import("@/app/(app)/error");
const { QuenMatKhauForm } = await import(
	"@/app/(landing)/quen-mat-khau/quen-mat-khau-form"
);
const { authMessages } = await import("@/lib/messages/auth");

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
			expect(document.activeElement, "nut Thu lai nhan focus").toBe(
				nut[0] ?? null,
			);
			expect(o.querySelectorAll("a[href='/sign-in']")).toHaveLength(0);
			expect(o.textContent).not.toContain("Đăng xuất");

			await act(async () => {
				nut[0]?.click();
			});
			expect(retry, "retry phai duoc goi 1 lan").toHaveBeenCalledTimes(1);
		});
	}
});

function logoTruocTieuDe(o: HTMLElement, tieuDe: string): boolean {
	const logo = o.querySelector("a[href='/'] svg");
	const h = [...o.querySelectorAll("h1, h2")].find(
		(x) => x.textContent === tieuDe,
	);
	if (!logo || !h) return false;
	return Boolean(
		logo.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING,
	);
}

describe("logo", () => {
	test("logo truoc tieu de o ca hai trang thai", async () => {
		const q = authMessages("vi").quenMatKhau;
		const xin = mock(async () => ({ error: null }));
		const o = await mo(
			<QuenMatKhauForm
				dangGui={q.dangGui}
				description={q.description}
				diaChi={q.diaChi}
				gui={q.gui}
				loi={q.loi}
				quaLuot={q.quaLuot(15)}
				quayLai={q.quayLai}
				title={q.title}
				xin={xin}
				xong={{
					title: q.xong.title,
					description: q.xong.description(45),
					quayLai: q.xong.quayLai,
				}}
			/>,
		);
		const nhap = logoTruocTieuDe(o, q.title);
		const lienKetNhap = o
			.querySelector("a[href='/']")
			?.getAttribute("aria-label");

		const oNhap = o.querySelector<HTMLInputElement>("input[type='email']");
		await act(async () => {
			if (oNhap) {
				const dat = Object.getOwnPropertyDescriptor(
					HTMLInputElement.prototype,
					"value",
				)?.set;
				dat?.call(oNhap, "ada@onehub.center");
				oNhap.dispatchEvent(new Event("input", { bubbles: true }));
			}
			o.querySelector("form")?.requestSubmit();
		});
		for (let i = 0; i < 50 && !o.textContent?.includes(q.xong.title); i += 1) {
			await act(async () => {
				await new Promise((r) => setTimeout(r, 0));
			});
		}
		expect(o.textContent, "chua sang trang thai da gui").toContain(
			q.xong.title,
		);
		const daGui = logoTruocTieuDe(o, q.xong.title);

		expect(lienKetNhap).toBe("Trang chủ");
		expect(nhap, "trang thai nhap: thieu logo").toBe(true);
		expect(daGui, "trang thai da gui: thieu logo").toBe(true);
	});
});
