import { afterEach, describe, expect, mock, test } from "bun:test";
import type { ReactNode } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, refresh: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws",
	useSearchParams: () => new URLSearchParams(),
}));

mock.module("next/link", () => ({
	default: ({
		href,
		children,
		...rest
	}: {
		href: string;
		children: ReactNode;
	}) => (
		<a href={href} {...rest}>
			{children}
		</a>
	),
}));

mock.module("next-themes", () => ({
	useTheme: () => ({ resolvedTheme: "light", setTheme: () => {} }),
}));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { UserMenu } = await import("@/components/app-header");

const NHAN = {
	vi: { nhac: "Nhắc buổi sáng", giaoDien: "Nền tối" },
	en: { nhac: "Morning reminders", giaoDien: "Dark mode" },
} as const;

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

async function bam(o: Element): Promise<void> {
	await act(async () => {
		for (const loai of [
			"pointerdown",
			"mousedown",
			"pointerup",
			"mouseup",
			"click",
		]) {
			o.dispatchEvent(
				new MouseEvent(loai, { bubbles: true, cancelable: true, button: 0 }),
			);
		}
	});
}

async function phim(o: Element, key: string): Promise<void> {
	await act(async () => {
		o.dispatchEvent(
			new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
		);
	});
}

describe("khung-trang-cai-dat-menu", () => {
	for (const locale of ["vi", "en"] as const) {
		test(`menu-nguoi-dung: ${locale} co Nhac buoi sang ngay truoc doi giao dien, la lien ket, toi bang ban phim`, async () => {
			khung = document.createElement("div");
			document.body.appendChild(khung);
			root = createRoot(khung);
			act(() =>
				root?.render(
					<LocaleProvider locale={locale}>
						<UserMenu
							user={{ name: "Manh Phan", email: "manh@onehub.vn", image: null }}
							onSignOut={() => {}}
						/>
					</LocaleProvider>,
				),
			);
			const nut = khung.querySelector("button");
			if (!nut) throw new Error("khong thay nut mo menu");
			await bam(nut);
			const muc = [
				...document.querySelectorAll<HTMLElement>("[role='menuitem']"),
			];
			const chu = muc.map((m) => m.textContent?.trim());
			const iNhac = chu.indexOf(NHAN[locale].nhac);
			const iGiaoDien = chu.indexOf(NHAN[locale].giaoDien);
			expect(
				iNhac >= 0 && iNhac + 1 === iGiaoDien,
				`${locale}: Nhac buoi sang khong dung ngay truoc doi giao dien (${JSON.stringify(chu)})`,
			).toBe(true);
			const nhac = muc[iNhac];
			expect(
				nhac?.tagName === "A" ? nhac.getAttribute("href") : "khong-phai-a",
				`${locale}: muc khong phai lien ket toi /ws/reminders`,
			).toBe("/ws/reminders");
			const noiDung = document.querySelector("[role='menu']");
			if (!noiDung) throw new Error("menu chua mo");
			await phim(noiDung, "ArrowDown");
			expect(
				document.activeElement?.textContent?.trim(),
				`${locale}: ArrowDown khong dung vao Nhac buoi sang`,
			).toBe(NHAN[locale].nhac);
		});
	}
});
