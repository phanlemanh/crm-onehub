import { afterEach, describe, expect, mock, test } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { act, createElement as h, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..");
let duongHienTai = "/ws/settings";

const KHOA_WORKSPACE = ["workspace.get"];
const KHOA_CUOC = ["conversations.builderList"];
const KHOA_TAC_NHAN = ["agents.list"];
const daDanhDau: { id: string }[] = [];
let cuocHienTai: unknown[] = [];

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		workspace: {
			get: {
				queryOptions: () => ({
					queryKey: KHOA_WORKSPACE,
					queryFn: async () => ({ viewerRole: "admin" }),
				}),
			},
		},
		conversations: {
			builderList: {
				queryOptions: () => ({
					queryKey: KHOA_CUOC,
					queryFn: async () => cuocHienTai,
				}),
				pathKey: () => KHOA_CUOC,
			},
			markRead: {
				mutationOptions: (o: { onSuccess?: () => unknown }) => ({
					...o,
					mutationFn: async (vao: { id: string }) => {
						daDanhDau.push(vao);
						return null;
					},
				}),
			},
		},
		agents: {
			list: {
				queryOptions: () => ({
					queryKey: KHOA_TAC_NHAN,
					queryFn: async () => [],
				}),
			},
		},
		thongBao: { chuong: { pathKey: () => ["thongBao.chuong"] } },
	}),
}));

mock.module("next/navigation", () => ({
	usePathname: () => duongHienTai,
	useParams: () => ({ slug: "ws" }),
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useSearchParams: () => new URLSearchParams(),
}));

mock.module("next/link", () => ({
	default: ({
		href,
		children,
		prefetch: _prefetch,
		transitionTypes: _transitionTypes,
		...rest
	}: {
		href: string;
		children: ReactNode;
		prefetch?: boolean;
		transitionTypes?: string[];
	}) => h("a", { href, ...rest }, children),
}));

mock.module("@/components/agent-builder/delete-chat-action", () => ({
	DeleteChatAction: ({ title }: { title: string }) =>
		h("button", {
			type: "button",
			"data-xoa": "",
			"aria-label": `xoa ${title}`,
		}),
}));

const { QueryClient, QueryClientProvider } = await import(
	"@tanstack/react-query"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { SettingsSidebar, SettingsSidebarFallback } = await import(
	"@/app/(app)/[slug]/settings/settings-sidebar"
);
const { AgentBuilderSidebar } = await import(
	"@/components/agent-builder/agent-builder-sidebar"
);
const { AgentBuilderSidebarFallback } = await import(
	"@/components/agent-builder/agent-builder-shell"
);
const { khungMessages } = await import("@/lib/messages/agent-builder-khung");

const t = khungMessages("vi").thanhBen;
const NGAY_MS = 86_400_000;
const BAY_GIO = Date.now();
const TIEU_DE_DAI = "Tác nhân tổng hợp ".repeat(7).trim().slice(0, 120);

function cuoc(
	id: string,
	truocNgay: number,
	tuy: {
		title?: string;
		unread?: boolean;
		state?: "working" | "unread" | "deployed" | "idle";
	} = {},
) {
	return {
		id,
		sessionId: null,
		continuationToken: null,
		streamIndex: 0,
		title: tuy.title ?? `Cuoc ${id}`,
		messageCount: 1,
		lastMessageAt: new Date(BAY_GIO - truocNgay * NGAY_MS).toISOString(),
		lastAssistantAt: null,
		unread: tuy.unread ?? false,
		state: tuy.state ?? "idle",
		agent: null,
	};
}

const CUOC = [
	cuoc("c1", 0, { unread: true, state: "unread", title: TIEU_DE_DAI }),
	cuoc("c2", 0, { state: "working" }),
	cuoc("c3", 1),
	cuoc("c4", 5),
];
function tacNhan(id: string, name: string) {
	const luc = new Date(BAY_GIO).toISOString();
	return {
		id,
		name,
		description: null,
		status: "LIVE" as const,
		createdAt: luc,
		updatedAt: luc,
		createdBy: { id: "u1", name: "Nguoi tao", image: null },
		currentVersion: null,
		triggers: [],
		runCount: 0,
	};
}
const TAC_NHAN = [tacNhan("a1", "Tac nhan mot"), tacNhan("a2", "Tac nhan hai")];

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
	daDanhDau.length = 0;
	duongHienTai = "/ws/settings";
});

function dung(noiDung: ReactNode): HTMLElement {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	const hoi = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	hoi.setQueryData(KHOA_WORKSPACE, { viewerRole: "admin" });
	act(() =>
		root?.render(
			<QueryClientProvider client={hoi}>
				<LocaleProvider locale="vi">{noiDung}</LocaleProvider>
			</QueryClientProvider>,
		),
	);
	return khung;
}

type Placement = "area" | "panel";

function hoiThoai(
	placement: Placement,
	tuy: { cuoc?: typeof CUOC; onNavigate?: () => void } = {},
) {
	cuocHienTai = tuy.cuoc ?? CUOC;
	return h(AgentBuilderSidebar, {
		placement,
		onNavigate: tuy.onNavigate,
		initialData: {
			conversations: tuy.cuoc ?? CUOC,
			agents: TAC_NHAN,
			updatedAt: BAY_GIO,
		},
	});
}

const asideKhu = (k: HTMLElement) =>
	k.querySelector("aside[data-slot='area-sidebar']");
const hangNgang = (k: HTMLElement) =>
	[...k.querySelectorAll("[data-slot='nav-strip']")].find(
		(n) => !n.closest("aside"),
	) ?? null;
const chu = (ds: Iterable<Element>) =>
	[...ds].map((e) => e.textContent?.trim());
const href = (ds: Iterable<Element>) =>
	[...ds].map((e) => e.getAttribute("href"));

describe("thanh-ben-khu", () => {
	test("tbk-cai-dat: thanh ben Cai dat dung trong area-sidebar", () => {
		for (const [ten, the] of [
			["that", SettingsSidebar],
			["vo tai", SettingsSidebarFallback],
		] as const) {
			const k = dung(h(the));
			const aside = asideKhu(k);
			expect(aside, `Cai dat (${ten}) khong dung AreaSidebar`).not.toBeNull();
			expect(
				aside?.querySelector("nav")?.getAttribute("aria-label"),
				`${ten}: sai nhan`,
			).toBe("Cài đặt");
			expect(hangNgang(k), `${ten}: thieu hang ngang`).not.toBeNull();
			act(() => root?.unmount());
			root = null;
		}
	});

	test("tbk-hoi-thoai-may-tinh: nhom ngay, muc, nut xoa, nhom tac nhan", () => {
		duongHienTai = "/ws/chat/c3";
		const k = dung(hoiThoai("area"));
		const aside = asideKhu(k);
		expect(aside, "Hoi thoai khong dung AreaSidebar").not.toBeNull();
		if (!aside) return;
		const dau = aside.querySelector("[data-slot='area-sidebar-header']");
		expect(dau?.textContent, "dau thanh thieu chu Hoi thoai").toContain(
			t.hoiThoai,
		);
		const moi = dau?.querySelector("a[href='/ws/chat']");
		expect(
			moi?.getAttribute("aria-label"),
			"thieu lien ket Hoi thoai moi",
		).toBe(t.hoiThoaiMoi);
		expect(
			chu(aside.querySelectorAll("[data-slot='nav-group-label']")),
			"nhan nhom khong phai nav-group-label hoac sai thu tu",
		).toEqual([
			t.nhom.Today,
			t.nhom.Yesterday,
			t.nhom["Last 7 days"],
			`${t.tacNhanCuaDoi}2`,
		]);
		const mucCuoc = [
			...aside.querySelectorAll("a[data-slot='nav-item']"),
		].filter((a) => a.getAttribute("href")?.startsWith("/ws/chat/"));
		expect(href(mucCuoc), "muc cuoc lech").toEqual([
			"/ws/chat/c1",
			"/ws/chat/c2",
			"/ws/chat/c3",
			"/ws/chat/c4",
		]);
		expect(
			href(aside.querySelectorAll("[aria-current='page']")),
			"nhieu hon mot aria-current hoac sai muc",
		).toEqual(["/ws/chat/c3"]);
		for (const a of mucCuoc) {
			const span = a.querySelector("[translate='no']");
			const lop = (span?.getAttribute("class") ?? "").split(/\s+/);
			expect(
				lop.includes("truncate") && lop.includes("min-w-0"),
				`${a.getAttribute("href")}: tieu de khong cat`,
			).toBe(true);
		}
		expect(mucCuoc[0]?.textContent, "tieu de dai lech").toContain(TIEU_DE_DAI);
		expect(
			aside.querySelectorAll("[data-xoa]").length,
			"phai co 4 nut xoa",
		).toBe(4);
		const nhanTacNhan = [
			...aside.querySelectorAll("[data-slot='nav-group-label']"),
		].at(-1);
		expect(
			nhanTacNhan?.querySelector("a")?.getAttribute("href"),
			"nhan tac nhan khong tro /agents",
		).toBe("/ws/agents");
		expect(
			href(
				[...aside.querySelectorAll("a[data-slot='nav-item']")].filter((a) =>
					a.getAttribute("href")?.startsWith("/ws/agents/"),
				),
			),
			"muc tac nhan lech",
		).toEqual(["/ws/agents/a1", "/ws/agents/a2"]);
	});

	test("tbk-hoi-thoai-bam: bam cuoc chua doc thi danh dau da doc", async () => {
		duongHienTai = "/ws/chat/c3";
		let soLanDi = 0;
		const k = dung(hoiThoai("area", { onNavigate: () => (soLanDi += 1) }));
		const aside = asideKhu(k);
		const chuaDoc = aside?.querySelector(
			"a[href='/ws/chat/c1']",
		) as HTMLElement | null;
		const daDoc = aside?.querySelector(
			"a[href='/ws/chat/c3']",
		) as HTMLElement | null;
		await act(async () => {
			chuaDoc?.dispatchEvent(
				new MouseEvent("click", { bubbles: true, cancelable: true }),
			);
			await new Promise((r) => setTimeout(r, 0));
		});
		expect(daDanhDau, "markRead khong goi dung mot lan voi c1").toEqual([
			{ id: "c1" },
		]);
		expect(soLanDi, "onNavigate khong goi").toBe(1);
		await act(async () => {
			daDoc?.dispatchEvent(
				new MouseEvent("click", { bubbles: true, cancelable: true }),
			);
			await new Promise((r) => setTimeout(r, 0));
		});
		expect(daDanhDau.length, "markRead goi cho cuoc da doc").toBe(1);
		expect(soLanDi, "onNavigate khong goi lan hai").toBe(2);
	});

	test("tbk-hoi-thoai-rong: khong cuoc nao thi cau rong va nhom tac nhan", () => {
		duongHienTai = "/ws/chat";
		const k = dung(hoiThoai("area", { cuoc: [] }));
		const aside = asideKhu(k);
		expect(aside?.textContent, "thieu cau rong").toContain(t.trongBayNgay);
		expect(aside?.textContent, "mat nhom tac nhan").toContain(t.tacNhanCuaDoi);
		expect(
			hangNgang(k)?.textContent?.includes(t.trongBayNgay),
			"hang ngang co cau rong",
		).toBe(false);
	});

	test("tbk-hoi-thoai-dien-thoai: hang ngang cung thu tu, khong nut xoa", () => {
		duongHienTai = "/ws/chat/c3";
		const k = dung(hoiThoai("area"));
		const strip = hangNgang(k);
		expect(strip, "Hoi thoai thieu hang ngang").not.toBeNull();
		if (!strip) return;
		expect(strip.getAttribute("aria-label"), "hang ngang sai nhan").toBe(
			t.danhSachHoiThoai,
		);
		const doc = href(
			asideKhu(k)?.querySelectorAll("a[data-slot='nav-item']") ?? [],
		);
		expect(
			href(strip.querySelectorAll("a[data-slot='nav-item']")),
			"thu tu hang ngang lech thanh doc",
		).toEqual(doc);
		expect(doc.length, "thanh doc phai co 6 muc").toBe(6);
		expect(
			href(strip.querySelectorAll("[aria-current='page']")),
			"hang ngang sai muc dang mo",
		).toEqual(["/ws/chat/c3"]);
		expect(
			strip.querySelectorAll("[data-xoa]").length,
			"hang ngang co nut xoa",
		).toBe(0);
		expect(
			strip.querySelectorAll("[data-slot='nav-group-label']").length,
			"hang ngang co nhan nhom",
		).toBe(0);
		const bang = k.querySelector("[data-slot='area-sidebar-strip']");
		const dau = bang?.querySelector("[data-slot='area-sidebar-header']");
		expect(dau?.textContent, "dai dien thoai thieu Hoi thoai").toContain(
			t.hoiThoai,
		);
		expect(
			dau?.querySelector("a[href='/ws/chat']"),
			"dai dien thoai thieu Hoi thoai moi",
		).not.toBeNull();
		expect(
			Boolean(
				dau &&
					dau.compareDocumentPosition(strip) & Node.DOCUMENT_POSITION_FOLLOWING,
			),
			"dau thanh khong dung truoc hang ngang",
		).toBe(true);
	});

	test("tbk-hoi-thoai-ngan: ngan dien thoai giu bo cuc doc", () => {
		duongHienTai = "/ws/chat/c3";
		const k = dung(hoiThoai("panel"));
		expect(
			k.querySelectorAll("[data-slot='nav-strip']").length,
			"ngan co hang ngang",
		).toBe(0);
		expect(
			k.querySelectorAll("[data-slot='nav-group-label']").length,
			"ngan thieu nhan nhom",
		).toBe(4);
		expect(k.querySelectorAll("[data-xoa]").length, "ngan thieu nut xoa").toBe(
			4,
		);
		const nguon = readFileSync(
			join(GOC, "components", "app-icon-rail.tsx"),
			"utf8",
		);
		const the = [...nguon.matchAll(/<AgentBuilderSidebar\b[^>]*>/g)].map(
			(m) => m[0],
		);
		expect(
			the.length,
			"ngan mat bo cuc doc: khong thay AgentBuilderSidebar",
		).toBeGreaterThan(0);
		for (const t_ of the)
			expect(t_, "ngan mat bo cuc doc").toContain('placement="panel"');
	});

	test("tbk-dang-tai: vo tai hai khu cung khung, khong 213px", () => {
		for (const [ten, the, nhan] of [
			["Cai dat", SettingsSidebarFallback, "Cài đặt"],
			["Hoi thoai", AgentBuilderSidebarFallback, t.danhSachHoiThoai],
		] as const) {
			const k = dung(h(the));
			const nav = asideKhu(k)?.querySelector("nav");
			expect(nav, `${ten}: vo tai khong dung AreaSidebar`).not.toBeNull();
			expect(
				nav?.getAttribute("aria-busy"),
				`${ten}: vo tai khong aria-busy`,
			).toBe("true");
			expect(nav?.getAttribute("aria-label"), `${ten}: vo tai sai nhan`).toBe(
				nhan,
			);
			act(() => root?.unmount());
			root = null;
		}
		for (const tep of [
			join(GOC, "components", "agent-builder", "agent-builder-shell.tsx"),
			join(GOC, "app", "(app)", "[slug]", "(agent-builder)", "layout.tsx"),
		])
			expect(
				readFileSync(tep, "utf8").includes("w-[213px]"),
				`${tep}: con w-[213px]`,
			).toBe(false);
	});
});
