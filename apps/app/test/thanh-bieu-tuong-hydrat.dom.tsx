import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import {
	type DehydratedState,
	dehydrate,
	HydrationBoundary,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import { act, type ReactElement } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";

const KHOA = ["workspace.get"];

type Workspace = { slug: string; name: string; viewerRole: string | null };

const trpcGia = {
	workspace: {
		get: {
			queryOptions: () => ({
				queryKey: KHOA,
				queryFn: async (): Promise<Workspace> => new Promise(() => {}),
			}),
		},
	},
};

mock.module("@/lib/trpc/client", () => ({ useTRPC: () => trpcGia }));

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws/okr",
}));

mock.module("@/components/crm/section-prefetch", () => ({
	usePrefetchSection: () => () => {},
}));

mock.module("@/components/agent-builder/agent-builder-sidebar", () => ({
	AgentBuilderSidebar: () => null,
}));

const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { AppIconRail } = await import("@/components/app-icon-rail");
const { MobileNavProvider } = await import("@/components/mobile-nav");
const { MUC_RAIL } = await import("@/lib/khung-dieu-huong");
const { mucRailChoVai } = await import("@/lib/pham-vi-man");

const QUAN_TRI: Workspace = { slug: "ws", name: "WS", viewerRole: "admin" };
const CHI_OKR: Workspace = { ...QUAN_TRI, viewerRole: "okr" };
const SO_MUC_DU = MUC_RAIL.length;
const SO_MUC_CHI_OKR = mucRailChoVai("okr").length;

let goc: Root | null = null;

afterEach(() => {
	act(() => goc?.unmount());
	goc = null;
	document.body.innerHTML = "";
});

function cayRail(
	may: QueryClient,
	trang: DehydratedState,
	workspace: Workspace | null,
): ReactElement {
	return (
		<QueryClientProvider client={may}>
			<TooltipProvider>
				<MobileNavProvider>
					<HydrationBoundary state={trang}>
						<AppIconRail
							workspace={
								workspace ? { viewerRole: workspace.viewerRole } : null
							}
						/>
					</HydrationBoundary>
				</MobileNavProvider>
			</TooltipProvider>
		</QueryClientProvider>
	);
}

function trangCo(workspace: Workspace | null): DehydratedState {
	const nguon = new QueryClient();
	if (workspace) nguon.setQueryData(KHOA, workspace);
	return dehydrate(nguon);
}

function cacheCoTruyVanRong(): QueryClient {
	const may = new QueryClient();
	may.getQueryCache().build(may, { queryKey: KHOA });
	return may;
}

function cacheCoDuLieu(workspace: Workspace): QueryClient {
	const may = new QueryClient();
	may.setQueryData(KHOA, workspace);
	return may;
}

const LOI_HYDRAT = /hydrat|didn't match|Hydration/i;

type KetQua = { loi: string[]; o: HTMLElement; html: string };

async function hydratCay(
	mayChu: ReactElement,
	trinhDuyet: ReactElement,
): Promise<KetQua> {
	const html = renderToString(mayChu);
	const o = document.createElement("div");
	o.innerHTML = html;
	document.body.appendChild(o);
	const loi: string[] = [];
	const nghe = spyOn(console, "error").mockImplementation((...doiSo) => {
		const chu = doiSo.map(String).join(" ");
		if (LOI_HYDRAT.test(chu)) loi.push(`console.error: ${chu}`);
	});
	try {
		await act(async () => {
			goc = hydrateRoot(o, trinhDuyet, {
				onRecoverableError: (e) => loi.push(String(e)),
			});
		});
	} finally {
		nghe.mockRestore();
	}
	return { loi, o, html };
}

function hydrat(
	mayChu: QueryClient,
	trinhDuyet: QueryClient,
	trang: DehydratedState,
	workspace: Workspace | null,
): Promise<KetQua> {
	return hydratCay(
		cayRail(mayChu, trang, workspace),
		cayRail(trinhDuyet, trang, workspace),
	);
}

function soMuc(o: HTMLElement): number {
	return o.querySelectorAll("nav a[href]").length;
}

function railBan(o: ParentNode): boolean {
	return o.querySelector("nav[aria-busy='true']") !== null;
}

describe("bo nghe loi hydrat bat duoc ca hai kenh", () => {
	test("e0 lech cau truc vao onRecoverableError", async () => {
		const { loi } = await hydratCay(<nav />, <section />);
		expect(
			loi.some((t) =>
				t.includes(
					"Hydration failed because the server rendered HTML didn't match the client",
				),
			),
		).toBe(true);
	});

	test("e0 lech mot thuoc tinh vao console.error", async () => {
		const { loi } = await hydratCay(<nav aria-busy="true" />, <nav />);
		expect(loi.some((t) => t.startsWith("console.error:"))).toBe(true);
		expect(loi.join("\n")).toContain("aria-busy");
	});
});

describe("AppIconRail hydrat khop may chu du cache hai phia lech nhau", () => {
	test("e1 may chu co truy van rong, trinh duyet da co du lieu", async () => {
		const { loi, o, html } = await hydrat(
			cacheCoTruyVanRong(),
			cacheCoDuLieu(QUAN_TRI),
			trangCo(QUAN_TRI),
			QUAN_TRI,
		);
		expect(loi).toEqual([]);
		expect(html).not.toContain("aria-busy");
		expect(railBan(o)).toBe(false);
		expect(soMuc(o)).toBe(SO_MUC_DU);
	});

	test("e2 may chu co du lieu, trinh duyet con truy van rong", async () => {
		const { loi, o, html } = await hydrat(
			cacheCoDuLieu(QUAN_TRI),
			cacheCoTruyVanRong(),
			trangCo(QUAN_TRI),
			QUAN_TRI,
		);
		expect(loi).toEqual([]);
		expect(html).not.toContain("aria-busy");
		expect(railBan(o)).toBe(false);
		expect(soMuc(o)).toBe(SO_MUC_DU);
	});

	test("e3 vai chi okr tu may chu cho ra dung so muc ngay luot dau", async () => {
		const { loi, o, html } = await hydrat(
			cacheCoTruyVanRong(),
			cacheCoTruyVanRong(),
			trangCo(CHI_OKR),
			CHI_OKR,
		);
		const truocHydrat = document.createElement("div");
		truocHydrat.innerHTML = html;
		expect(loi).toEqual([]);
		expect(soMuc(truocHydrat)).toBe(SO_MUC_CHI_OKR);
		expect(soMuc(o)).toBe(SO_MUC_CHI_OKR);
		expect(SO_MUC_CHI_OKR).toBeLessThan(SO_MUC_DU);
	});
});

describe("AppIconRail sau hydrat van theo truy van", () => {
	test("e4 du lieu truy van den sau ghi de vai may chu", async () => {
		const trinhDuyet = cacheCoTruyVanRong();
		const { loi, o } = await hydrat(
			cacheCoTruyVanRong(),
			trinhDuyet,
			trangCo(QUAN_TRI),
			QUAN_TRI,
		);
		expect(loi).toEqual([]);
		expect(soMuc(o)).toBe(SO_MUC_DU);
		await act(async () => {
			trinhDuyet.setQueryData(KHOA, CHI_OKR);
		});
		expect(soMuc(o)).toBe(SO_MUC_CHI_OKR);
	});
});

describe("AppIconRail khi may chu khong tai duoc workspace", () => {
	test("e5 ban cho o may chu, hydrat khop, roi hien du khi cache co du lieu", async () => {
		const { loi, o, html } = await hydrat(
			cacheCoTruyVanRong(),
			cacheCoDuLieu(QUAN_TRI),
			trangCo(null),
			null,
		);
		const truocHydrat = document.createElement("div");
		truocHydrat.innerHTML = html;
		expect(loi).toEqual([]);
		expect(railBan(truocHydrat)).toBe(true);
		expect(soMuc(truocHydrat)).toBe(0);
		expect(railBan(o)).toBe(false);
		expect(soMuc(o)).toBe(SO_MUC_DU);
	});
});
