import {
	afterEach,
	beforeEach,
	describe,
	expect,
	mock,
	setSystemTime,
	test,
} from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { TimelineEntryData } from "@/components/crm/timeline/timeline-entry";
import payload from "../../api/test/fixtures/han-viec-payload.json";

type Json =
	| string
	| number
	| boolean
	| null
	| Json[]
	| { [khoa: string]: Json | undefined };

type DauVao = Json | undefined;

type Lay = (dauVao: DauVao) => Json | Promise<Json>;

const duLieu = new Map<string, Lay>();

function dat(duong: string, lay: Lay): void {
	duLieu.set(duong, lay);
}

function thuTuc(duong: string) {
	const doc = async (v: DauVao): Promise<Json> => {
		const lay = duLieu.get(duong);
		return lay ? lay(v) : null;
	};
	return {
		queryKey: (v?: DauVao) => (v === undefined ? [duong] : [duong, v]),
		pathKey: () => [duong],
		queryOptions: (v?: DauVao, chon?: { enabled?: boolean }) => ({
			...chon,
			queryKey: [duong, v],
			queryFn: async () => doc(v),
		}),
		infiniteQueryOptions: (v?: DauVao) => ({
			queryKey: [duong, v],
			queryFn: async () => doc(v),
			initialPageParam: null,
			getNextPageParam: () => null,
		}),
		mutationOptions: (chon?: {
			onSuccess?: (kq: Json, v: DauVao) => void;
			onError?: (e: Error) => void;
		}) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async (v: DauVao) => (await doc(v)) ?? { id: "ok" },
		}),
	};
}

const trpcGia = new Proxy(
	{},
	{
		get: (_goc, khongGian: string) =>
			new Proxy(
				{},
				{ get: (_g, ten: string) => thuTuc(`${khongGian}.${ten}`) },
			),
	},
);

mock.module("@/lib/trpc/client", () => ({ useTRPC: () => trpcGia }));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () =>
		new Proxy(
			{},
			{
				get: () => async () => {},
			},
		),
}));

mock.module("@/components/crm/agent-panel", () => ({ AgentPanel: () => null }));
mock.module("@/components/crm/timeline/timeline", () => ({
	Timeline: () => null,
}));
mock.module("@/components/crm/website-activity", () => ({
	WebsiteActivity: () => null,
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws",
}));

const { DashboardSummary } = await import(
	"@/app/(app)/[slug]/dashboard-summary"
);
const { TimelineEntry } = await import(
	"@/components/crm/timeline/timeline-entry"
);
const { crmMessages } = await import("@/lib/messages/crm");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");

const c = crmMessages("vi");

const BAY_GIO = new Date("2026-09-22T13:54:00Z");
const HAN_HOM_NAY = "2026-09-21T17:00:00.000Z";
const HAN_HOM_QUA = "2026-09-20T17:00:00.000Z";

const TOI = { id: "u-toi", name: "Lan", email: "lan@thu.test", image: null };

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

async function mo(man: ReactElement, duong = ""): Promise<San> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter hasMemory searchParams={duong}>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	const san = { o, root };
	dangMo.push(san);
	return san;
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 120; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(
		`khong toi trang thai ${moTa} — noi dung: ${document.body.textContent?.slice(0, 500)}`,
	);
}

beforeEach(() => {
	duLieu.clear();
	dat("users.list", () => [TOI]);
	dat("users.me", () => TOI);
	setSystemTime(BAY_GIO);
});

afterEach(async () => {
	setSystemTime();
	for (const san of dangMo) {
		await act(async () => {
			san.root.unmount();
		});
		san.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

function viec(id: string, dueAt: string): TimelineEntryData {
	return {
		id,
		type: "TASK",
		subject: `Viec ${id}`,
		body: null,
		occurredAt: null,
		dueAt,
		completedAt: null,
		meta: null,
		createdAt: "2026-09-19T02:00:00.000Z",
		createdBy: TOI,
		company: { id: "ct-1", name: "Song Hong Land" },
		contact: null,
		deal: null,
		planId: null,
		emailThread: null,
		calendarEvent: null,
	};
}

type ChiBao = { quaHan: boolean; tone: string | null };

function chiBao(dong: Element | undefined): ChiBao {
	const o = dong?.querySelector('[data-slot="status-indicator"]');
	return {
		quaHan: (o?.textContent ?? "").includes(c.closing.overdue),
		tone: o?.getAttribute("data-tone") ?? null,
	};
}

async function moDongThoiGian(): Promise<Element[]> {
	const san = await mo(
		<ul>
			<TimelineEntry
				anchor={{ companyId: "ct-1" }}
				entry={viec("hom-nay", HAN_HOM_NAY)}
			/>
			<TimelineEntry
				anchor={{ companyId: "ct-1" }}
				entry={viec("hom-qua", HAN_HOM_QUA)}
			/>
		</ul>,
	);
	await cho(() => san.o.querySelectorAll("li").length === 2, "hai dong viec");
	return [...san.o.querySelectorAll("li")];
}

describe("dong-thoi-gian", () => {
	test("dong-thoi-gian: viec han hom nay mang chi bao han thuong", async () => {
		const [homNay] = await moDongThoiGian();
		const kq = chiBao(homNay);
		expect(
			{
				quaHan: kq.quaHan,
				toneLoi: kq.tone === "error",
				coChiBao: kq.tone !== null,
			},
			"dong thoi gian khong to do viec han hom nay",
		).toEqual({ quaHan: false, toneLoi: false, coChiBao: true });
	});

	test("dong-thoi-gian: viec han hom qua mang chi bao do Quá hạn", async () => {
		const [, homQua] = await moDongThoiGian();
		expect(chiBao(homQua), "dong thoi gian to do viec han hom qua").toEqual({
			quaHan: true,
			tone: "error",
		});
	});
});

type CheDo = keyof typeof payload;

const { buocQuaHan } = await import("@/app/(app)/[slug]/dong-buoc");

function voiQuaHan<
	T extends {
		overdueTasks: unknown[];
		mySteps: Parameters<typeof buocQuaHan>[0][];
	},
>(du: T): T & { quaHan: { viec: number; buoc: number } } {
	return {
		...du,
		quaHan: {
			viec: du.overdueTasks.length,
			buoc: du.mySteps.filter((b) => buocQuaHan(b, new Date())).length,
		},
	};
}

function tongQuan(cheDo: CheDo): Json {
	const thang = { count: 0, valueCents: 0 };
	return voiQuaHan({
		scope: payload[cheDo].scope,
		reportingCurrency: "VND",
		unconverted: { count: 0, currencies: [] },
		pipeline: { stages: [], totalCents: 0, totalDeals: 0 },
		wonThisMonth: thang,
		wonPrevMonth: thang,
		performance: {
			windowDays: 90,
			wins: 0,
			losses: 0,
			winRate: null,
			avgDealCents: null,
			avgCycleDays: null,
		},
		trend: [],
		closingThisMonthTotal: thang,
		biggestOpen: [],
		viecQuaHan: [],
		overdueTasks: payload[cheDo].overdueTasks.map((v) => ({
			...v,
			dueAt: HAN_HOM_QUA,
		})),
		recentActivity: [],
		mySteps: [],
		keHoachCanDeY: [],
	});
}

const VIEC_U = payload.team.overdueTasks.find((v) => v.id === "VIEC_U");
const VIEC_T2 = payload.me.overdueTasks.find((v) => v.id === "VIEC_T2");

function dongViec(id: string): Element | null {
	return document.body.querySelector(`[data-viec="${id}"]`);
}

async function moTheViec(cheDo: CheDo, doi: string): Promise<void> {
	dat("dashboard.summary", () => tongQuan(cheDo));
	await mo(
		<DashboardSummary />,
		cheDo === "team" ? `?scope=${payload.team.scope}` : "",
	);
	await cho(() => dongViec(doi) !== null, `the Việc quá hạn co dong ${doi}`);
}

function tenTrongDong(dong: Element | null, ten: string): Element | undefined {
	return [...(dong?.querySelectorAll("*") ?? [])].find(
		(o) => o.children.length === 0 && o.textContent?.trim() === ten,
	);
}

describe("the-ca-doi", () => {
	test("the-ca-doi: che do Cả đội dong U mo dau dong phu bang ten nguoi tao", async () => {
		if (!VIEC_U) throw new Error("fixture thieu VIEC_U o team");
		await moTheViec("team", VIEC_U.id);
		const ten = tenTrongDong(dongViec(VIEC_U.id), VIEC_U.createdBy.name);
		expect(
			{
				coTen: ten !== undefined,
				translate: ten?.closest("[translate]")?.getAttribute("translate"),
				dauDongPhu: ten?.parentElement?.firstElementChild === ten,
			},
			"the ca doi hien ten nguoi tao",
		).toEqual({ coTen: true, translate: "no", dauDongPhu: true });
	});

	test("the-ca-doi: che do Tôi khong co dong U", async () => {
		if (!VIEC_U || !VIEC_T2)
			throw new Error("fixture thieu VIEC_U hoac VIEC_T2");
		await moTheViec("me", VIEC_T2.id);
		expect(
			dongViec(VIEC_U.id),
			"che do Tôi khong hien viec cua nguoi khac",
		).toBeNull();
	});
});
