import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	mock,
	test,
} from "bun:test";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	act,
	createElement as h,
	type ReactElement,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";

mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => children,
}));

mock.module("next/link", () => ({
	default: ({
		href,
		children,
		...rest
	}: {
		href: string;
		children: ReactNode;
	}) => h("a", { href, ...rest }, children),
}));

const DAY = dirname(fileURLToPath(import.meta.url));
const TAM = join(DAY, ".tam-ktcd");
const BAN_GOC = join(DAY, "fixtures", "page-shell-truoc-width.tsx.txt");

const BE_RONG = [
	["narrow", "max-w-(--container-narrow)", false],
	["page", "max-w-(--container-page)", false],
	["wide", "max-w-(--container-page-wide)", false],
	["full", null, false],
	[undefined, "max-w-7xl", true],
] as const;

const TRANG_CON = [
	[
		"/ws/settings/connections/google",
		["Kết nối", "Google"],
		["/ws/settings/connections"],
	],
	[
		"/ws/settings/connections/microsoft",
		["Kết nối", "Microsoft"],
		["/ws/settings/connections"],
	],
	[
		"/ws/settings/connections/slack",
		["Kết nối", "Slack"],
		["/ws/settings/connections"],
	],
	[
		"/ws/settings/connections/slack/people",
		["Kết nối", "Slack", "Người"],
		["/ws/settings/connections", "/ws/settings/connections/slack"],
	],
	[
		"/ws/settings/connections/zalo",
		["Kết nối", "Zalo"],
		["/ws/settings/connections"],
	],
	[
		"/ws/settings/connections/intake",
		["Kết nối", "Điểm nhận dữ liệu"],
		["/ws/settings/connections"],
	],
] as const;

const TRANG_MUC = [
	"/ws/settings",
	"/ws/settings/currencies",
	"/ws/settings/fields",
	"/ws/settings/members",
	"/ws/settings/organization",
	"/ws/settings/onboarding",
	"/ws/settings/connections",
	"/ws/settings/tracking",
	"/ws/settings/sso",
	"/ws/settings/api-keys",
] as const;

let root: Root | null = null;
let khung: HTMLElement | null = null;

beforeAll(() => {
	const nguon = readFileSync(BAN_GOC, "utf8").replaceAll(
		'from "./',
		'from "@/components/',
	);
	mkdirSync(TAM, { recursive: true });
	writeFileSync(join(TAM, "page-shell-goc.tsx"), nguon);
});

afterAll(() => {
	rmSync(TAM, { recursive: true, force: true });
});

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

function lopKhoi(k: HTMLElement): string[] {
	const khoi = k.querySelector("[data-slot='page-shell']");
	if (!khoi) throw new Error("khong thay khoi page-shell");
	return (khoi.getAttribute("class") ?? "").split(/\s+/);
}

type BoKhung = typeof import("@/components/page-shell");

function dauTrang(m: BoKhung): ReactElement {
	return h(
		m.PageShell,
		null,
		h(
			m.PageShellHeader,
			null,
			h(
				m.PageShellHeading,
				null,
				h(m.PageShellTitle, null, "Chung"),
				h(m.PageShellDescription, null, "OneHub là ai."),
			),
			h(m.PageShellActions, null, h("button", { type: "button" }, "Lưu")),
		),
		h(m.PageShellContent, null, h("p", null, "noi dung")),
	);
}

describe("khung-trang-cai-dat", () => {
	test("be-rong: moi gia tri width dung lop, bon gia tri can trai, khong truyen giu nhu cu", async () => {
		const m = await import("@/components/page-shell");
		for (const [width, maxW, canGiua] of BE_RONG) {
			const k = dung(
				h(m.PageShell, width ? { width } : null, h("p", null, "x")),
			);
			const lop = lopKhoi(k);
			const coMaxW = lop.filter((c) => c.startsWith("max-w-"));
			expect(
				coMaxW,
				`width=${width ?? "khong truyen"}: lop max-w lech`,
			).toEqual(maxW ? [maxW] : []);
			expect(
				lop.includes("mx-auto"),
				canGiua
					? `width=${width ?? "khong truyen"}: mat mx-auto`
					: `width=${width} van can giua`,
			).toBe(canGiua);
			act(() => root?.unmount());
			root = null;
		}
	});

	test("be-rong: khong truyen width thi dau trang dung giong het ban goc", async () => {
		const moi = await import("@/components/page-shell");
		const cu = (await import(join(TAM, "page-shell-goc.tsx"))) as BoKhung;
		const htmlMoi = dung(dauTrang(moi)).innerHTML;
		act(() => root?.unmount());
		root = null;
		const htmlCu = dung(dauTrang(cu)).innerHTML;
		expect(htmlMoi, "khong width: outerHTML khac ban goc").toBe(htmlCu);
	});

	test("breadcrumb: sau trang con co duong dan dung, muc cuoi la trang hien tai", async () => {
		const { duongCaiDat } = await import("@/lib/cai-dat-breadcrumb");
		const { CaiDatBreadcrumb } = await import(
			"@/components/cai-dat-breadcrumb"
		);
		const m = await import("@/components/page-shell");
		for (const [duong, nhan, cha] of TRANG_CON) {
			const cap = duongCaiDat(duong, "vi");
			if (!cap) throw new Error(`${duong}: khong co duong dan`);
			const k = dung(
				h(
					m.PageShellHeader,
					{ breadcrumb: h(CaiDatBreadcrumb, { cap }) },
					h(m.PageShellHeading, null, h(m.PageShellTitle, null, "t")),
				),
			);
			const nav = k.querySelector("nav[data-slot='breadcrumb']");
			const muc = [
				...(nav?.querySelectorAll(
					"[data-slot='breadcrumb-link'], [data-slot='breadcrumb-page']",
				) ?? []),
			];
			expect(
				muc.map((e) => e.textContent),
				`${duong}: chuoi nhan lech`,
			).toEqual([...nhan]);
			expect(
				muc
					.slice(0, -1)
					.map((e) =>
						e.tagName === "A" ? e.getAttribute("href") : "khong-phai-a",
					),
				`${duong}: muc truoc cuoi khong tro dung cha`,
			).toEqual([...cha]);
			const cuoi = muc.at(-1);
			expect(
				cuoi?.tagName !== "A" && cuoi?.getAttribute("aria-current") === "page",
				`${duong}: muc cuoi la lien ket`,
			).toBe(true);
			act(() => root?.unmount());
			root = null;
		}
	});

	test("breadcrumb: muoi trang muc khong co duong dan", async () => {
		const { duongCaiDat } = await import("@/lib/cai-dat-breadcrumb");
		const m = await import("@/components/page-shell");
		for (const duong of TRANG_MUC) {
			const cap = duongCaiDat(duong, "vi");
			expect(cap, `${duong}: trang muc co duong dan`).toBeNull();
			const k = dung(
				h(
					m.PageShellHeader,
					null,
					h(m.PageShellHeading, null, h(m.PageShellTitle, null, "t")),
				),
			);
			expect(k.querySelector("nav[data-slot='breadcrumb']")).toBeNull();
			act(() => root?.unmount());
			root = null;
		}
	});
});
