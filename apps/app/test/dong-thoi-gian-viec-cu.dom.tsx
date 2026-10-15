import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, type TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "api/app-router";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";

type Json =
	| string
	| number
	| boolean
	| null
	| Json[]
	| { [khoa: string]: Json | undefined };

type DauVao = Json | undefined;

const traLoi = new Map<string, (input: DauVao) => Json>();
const daGoi: { path: string; input: DauVao }[] = [];

const linkGia: TRPCLink<AppRouter> =
	() =>
	({ op }) =>
		observable((nguoiXem) => {
			const vao: DauVao = JSON.parse(JSON.stringify(op.input ?? null));
			daGoi.push({ path: op.path, input: vao });
			const lay = traLoi.get(op.path);
			Promise.resolve()
				.then(() => (lay ? lay(vao) : null))
				.then(
					(data) => {
						nguoiXem.next({ result: { type: "data", data } });
						nguoiXem.complete();
					},
					(loi: Error) => nguoiXem.error(loi as never),
				);
			return () => {};
		});

const trpcClient = createTRPCClient<AppRouter>({ links: [linkGia] });
let queryClient = new QueryClient();
mock.module("@/lib/trpc/client", () => ({
	useTRPC: () =>
		createTRPCOptionsProxy<AppRouter>({ client: trpcClient, queryClient }),
}));
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => new Proxy({}, { get: () => async () => {} }),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws",
	useSearchParams: () => new URLSearchParams(),
}));
mock.module("sonner", () => ({
	toast: { error: () => {}, success: () => {} },
}));

const { Timeline } = await import("@/components/crm/timeline/timeline");
const { DashboardSummary } = await import(
	"@/app/(app)/[slug]/dashboard-summary"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { crmMessages } = await import("@/lib/messages/crm");

const c = crmMessages("vi");
const TOI = {
	id: "u-toi",
	name: "Phạm Thu Hà",
	email: "ha@thu.test",
	image: null,
};
const DONG = {
	subject: null,
	body: null,
	occurredAt: "2026-10-12T03:00:00.000Z",
	dueAt: null,
	completedAt: null,
	meta: null,
	createdAt: "2026-10-12T03:00:00.000Z",
	createdBy: TOI,
	company: null,
	contact: null,
	deal: null,
	planId: null,
	emailThread: null,
	calendarEvent: null,
};
const GHI_CHU = {
	...DONG,
	id: "a-ghi-chu",
	type: "NOTE",
	body: "Ghi chú đầu tiên",
};
const VIEC_CU = {
	...DONG,
	id: "a-viec-cu",
	type: "TASK",
	subject: "Gửi hồ sơ năng lực",
	dueAt: "2026-10-01T17:00:00.000Z",
	occurredAt: "2026-10-11T03:00:00.000Z",
	createdAt: "2026-10-11T03:00:00.000Z",
};

let san: { o: HTMLElement; root: Root } | null = null;

async function mo(man: ReactElement, tim = "") {
	queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	san = { o, root };
	await act(async () => {
		root.render(
			<NuqsTestingAdapter hasMemory searchParams={tim}>
				<QueryClientProvider client={queryClient}>
					<LocaleProvider locale="vi">
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
}

afterEach(async () => {
	if (san) {
		const { o, root } = san;
		await act(async () => root.unmount());
		o.remove();
	}
	san = null;
	traLoi.clear();
	daGoi.length = 0;
	document.body.innerHTML = "";
});

async function cho(dk: () => boolean, moTa: string) {
	for (let i = 0; i < 200; i += 1) {
		if (dk()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(`het gio cho ${moTa}`);
}

function hong(dieu: boolean, thongDiep: string): void {
	if (!dieu) throw new Error(thongDiep);
}

function datDongThoiGian() {
	traLoi.set("activities.timelineCounts", () => ({
		all: 2,
		notes: 1,
		email: 0,
		meetings: 0,
	}));
	traLoi.set("activities.timeline", () => ({
		entries: [GHI_CHU, VIEC_CU],
		nextCursor: null,
	}));
	traLoi.set("viec.cuaBanGhi", () => ({ mo: [], daXong: [], daHuy: [] }));
	traLoi.set("onboarding.nguoiNhanViec", () => [TOI]);
	traLoi.set("users.me", () => TOI);
}

function nhanThe(n: Element): string {
	return (n.textContent ?? "").replace(/\d+/g, "").trim();
}

function thanhThe(): Element[] {
	const nhom = [
		...document.querySelectorAll('[data-slot="toggle-group"]'),
	].find((g) =>
		[...g.querySelectorAll('[data-slot="toggle-group-item"]')].some(
			(n) => nhanThe(n) === c.timeline.tabs.all,
		),
	);
	return nhom
		? [...nhom.querySelectorAll('[data-slot="toggle-group-item"]')]
		: [];
}

function cacThe(): string[] {
	return thanhThe().map(nhanThe);
}

function dongCo(chu: string): Element | null {
	return (
		[...document.querySelectorAll("li")].find((li) =>
			(li.textContent ?? "").includes(chu),
		) ?? null
	);
}

describe("cvc-man-dong-thoi-gian", () => {
	test("cvc-man-dong-thoi-gian: bốn thẻ, việc cũ chỉ đọc, không khối ghim", async () => {
		datDongThoiGian();
		await mo(<Timeline anchor={{ dealId: "d1" }} />);
		await cho(() => dongCo("Gửi hồ sơ năng lực") !== null, "dong viec cu");

		const the = cacThe();
		const ky = [
			c.timeline.tabs.all,
			c.timeline.tabs.notes,
			c.timeline.tabs.emails,
			c.timeline.tabs.meetings,
		];
		hong(
			JSON.stringify(the) === JSON.stringify(ky),
			`cvc: the con sap toi da xong ${JSON.stringify(the)}`,
		);

		const viecCu = dongCo("Gửi hồ sơ năng lực");
		hong(
			viecCu?.querySelector('[role="checkbox"]') === null,
			"cvc: dong viec cu con o tich",
		);
		hong(
			document.querySelector('[data-khoi="viec-can-lam-ghim"]') === null,
			"cvc: con khoi ghim",
		);
		hong(
			!daGoi.some(
				(g) => (g.input as { filter?: string } | null)?.filter === "upcoming",
			),
			"cvc: con khoi ghim",
		);
		expect(dongCo("Ghi chú đầu tiên")).not.toBeNull();
	});

	test("cvc-man-dong-thoi-gian: đường dẫn ?tab=upcoming về thẻ Tất cả", async () => {
		datDongThoiGian();
		await mo(<Timeline anchor={{ dealId: "d1" }} />, "?timeline=upcoming");
		await cho(() => cacThe().length > 0, "thanh the");
		const dangChon = thanhThe().find(
			(n) =>
				n.getAttribute("data-state") === "on" ||
				n.getAttribute("aria-pressed") === "true" ||
				n.getAttribute("aria-checked") === "true",
		);
		hong(
			(dangChon?.textContent ?? "").replace(/\d+/g, "").trim() ===
				c.timeline.tabs.all,
			"cvc: tab cu khong ve tat ca",
		);
		const loc = daGoi
			.filter((g) => g.path === "activities.timeline")
			.map((g) => (g.input as { filter?: string }).filter);
		hong(
			loc.every((f) => f === "all"),
			"cvc: tab cu khong ve tat ca",
		);
	});

	test("cvc-man-dong-thoi-gian: dòng việc cũ quá hạn ở Tổng quan không có ô tích", async () => {
		const thang = { count: 0, valueCents: 0 };
		traLoi.set("dashboard.summary", () => ({
			scope: "me",
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
			overdueTasks: [
				{
					id: "a-viec-cu",
					subject: "Gửi hồ sơ năng lực",
					dueAt: "2026-10-01T17:00:00.000Z",
					createdBy: { id: TOI.id, name: TOI.name },
					company: null,
					deal: null,
				},
			],
			recentActivity: [],
			mySteps: [],
			keHoachCanDeY: [],
			quaHan: { viec: 1, buoc: 0 },
		}));
		await mo(<DashboardSummary />);
		await cho(
			() => document.querySelector('[data-viec="a-viec-cu"]') !== null,
			"dong viec cu tong quan",
		);
		const dong = document.querySelector('[data-viec="a-viec-cu"]');
		hong(
			dong?.querySelector('[role="checkbox"]') === null,
			"cvc: tong quan con o tich",
		);
	});
});
