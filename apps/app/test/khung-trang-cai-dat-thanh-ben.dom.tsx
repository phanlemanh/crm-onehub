import { afterEach, describe, expect, mock, test } from "bun:test";
import { act, createElement as h, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

let duongHienTai = "/ws/settings";
let vaiHienTai = "admin";

const KHOA_WORKSPACE = ["workspace.get"];

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		workspace: {
			get: {
				queryOptions: () => ({
					queryKey: KHOA_WORKSPACE,
					queryFn: async () => ({ viewerRole: vaiHienTai }),
				}),
			},
		},
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

const { QueryClient, QueryClientProvider } = await import(
	"@tanstack/react-query"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { SettingsSidebar, SettingsSidebarFallback } = await import(
	"@/app/(app)/[slug]/settings/settings-sidebar"
);

const NHOM = [
	[
		"Không gian làm việc",
		["Chung", "Tiền tệ", "Trường", "Giai đoạn thoả thuận", "Lịch làm việc"],
	],
	[
		"Con người",
		["Thành viên", "Tổ chức", "Chương trình OKR", "Điều phối 30 ngày"],
	],
	["Kết nối và dữ liệu", ["Kết nối", "Theo dõi & phân tích"]],
	["Bảo mật", ["SSO", "Khoá API"]],
] as const;

const DUONG = [
	["/ws/settings", "Chung"],
	["/ws/settings/currencies", "Tiền tệ"],
	["/ws/settings/fields", "Trường"],
	["/ws/settings/lich-lam-viec", "Lịch làm việc"],
	["/ws/settings/members", "Thành viên"],
	["/ws/settings/organization", "Tổ chức"],
	["/ws/settings/okr", "Chương trình OKR"],
	["/ws/settings/onboarding", "Điều phối 30 ngày"],
	["/ws/settings/connections", "Kết nối"],
	["/ws/settings/tracking", "Theo dõi & phân tích"],
	["/ws/settings/sso", "SSO"],
	["/ws/settings/api-keys", "Khoá API"],
	["/ws/settings/connections/google", "Kết nối"],
	["/ws/settings/connections/microsoft", "Kết nối"],
	["/ws/settings/connections/slack", "Kết nối"],
	["/ws/settings/connections/slack/people", "Kết nối"],
	["/ws/settings/connections/zalo", "Kết nối"],
	["/ws/settings/connections/intake", "Kết nối"],
] as const;

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	vaiHienTai = "admin";
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

function dung(noiDung: ReactNode): HTMLElement {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	const hoi = new QueryClient();
	hoi.setQueryData(KHOA_WORKSPACE, { viewerRole: vaiHienTai });
	act(() =>
		root?.render(
			<QueryClientProvider client={hoi}>
				<LocaleProvider locale="vi">{noiDung}</LocaleProvider>
			</QueryClientProvider>,
		),
	);
	return khung;
}

function doc(k: HTMLElement) {
	const aside = k.querySelector("aside nav");
	if (!aside) throw new Error("khong thay thanh ben desktop");
	return [...aside.querySelectorAll("[data-slot='nav-group']")].map((nhom) => ({
		nhan: nhom.querySelector("[data-slot='nav-group-label']")?.textContent,
		muc: [...nhom.querySelectorAll("[data-slot='nav-item']")].map(
			(m) => m.textContent,
		),
	}));
}

describe("khung-trang-cai-dat-thanh-ben", () => {
	test("thanh-ben: bon nhom dung ten, dung thu tu, moi muc la nav-item", () => {
		const k = dung(h(SettingsSidebar));
		expect(doc(k)).toEqual(
			NHOM.map(([nhan, muc]) => ({ nhan, muc: [...muc] })),
		);
		const aside = k.querySelector("aside nav");
		const mucTrongAside = aside?.querySelectorAll("a, button") ?? [];
		for (const m of mucTrongAside) {
			expect(
				m.getAttribute("data-slot"),
				`${m.textContent}: khong phai nav-item`,
			).toBe("nav-item");
		}
	});

	test("thanh-ben: moi duong dung mot muc sang, dung ten", () => {
		for (const [duong, mong] of DUONG) {
			duongHienTai = duong;
			const k = dung(h(SettingsSidebar));
			const sang = [
				...(k
					.querySelector("aside nav")
					?.querySelectorAll("[aria-current='page']") ?? []),
			];
			expect(sang.length, `${duong}: ${sang.length} muc aria-current`).toBe(1);
			expect(sang[0]?.textContent, `${duong}: muc sang lech`).toBe(mong);
			act(() => root?.unmount());
			root = null;
		}
		duongHienTai = "/ws/settings";
	});

	test("thanh-ben: vo tai cung so nhom va cung thu tu muc", () => {
		const that = doc(dung(h(SettingsSidebar)));
		act(() => root?.unmount());
		root = null;
		const vo = doc(dung(h(SettingsSidebarFallback)));
		expect(that.length, "thanh ben that khong du bon nhom").toBe(4);
		expect(vo, "vo tai lech thanh ben that").toEqual(that);
	});

	test("thanh-ben: khong con muc Thong bao cua ban", () => {
		const k = dung(h(SettingsSidebar));
		const href = [...k.querySelectorAll("a")].map((a) =>
			a.getAttribute("href"),
		);
		expect(href).not.toContain("/ws/settings/notifications");
		expect(k.textContent).not.toContain("Thông báo của bạn");
	});

	test("thanh-ben: hang ngang kho hep co du muc theo thu tu nhom", () => {
		const k = dung(h(SettingsSidebar));
		const hang = [...k.querySelectorAll("nav")].find(
			(n) => !n.closest("aside"),
		);
		expect(
			[...(hang?.querySelectorAll("[data-slot='nav-item']") ?? [])].map(
				(m) => m.textContent,
			),
		).toEqual(NHOM.flatMap(([, muc]) => [...muc]));
		expect(hang?.querySelector("[data-slot='nav-group-label']")).toBeNull();
	});

	test("thanh-ben: vai chi okr chi thay nhom Bao mat voi Khoa API", () => {
		vaiHienTai = "okr";
		duongHienTai = "/ws/settings/api-keys";
		const k = dung(h(SettingsSidebar));
		expect(doc(k)).toEqual([{ nhan: "Bảo mật", muc: ["Khoá API"] }]);
		expect(
			[...k.querySelectorAll("a")].map((a) => a.getAttribute("href")),
		).toEqual(["/ws/settings/api-keys", "/ws/settings/api-keys"]);
		duongHienTai = "/ws/settings";
	});
});
