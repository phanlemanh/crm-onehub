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

type Json =
	| string
	| number
	| boolean
	| null
	| Json[]
	| { [khoa: string]: Json | undefined };

type DauVao = Json | undefined;

type LoiGoi = { duong: string; dauVao: DauVao };

type Lay = (dauVao: DauVao) => Json | Promise<Json>;

let daGoi: LoiGoi[] = [];
const duLieu = new Map<string, Lay>();
const loiGhi = new Map<string, string>();

function dat(duong: string, lay: Lay): void {
	duLieu.set(duong, lay);
}

function thuTuc(duong: string) {
	const doc = async (v: DauVao): Promise<Json> => {
		daGoi.push({ duong, dauVao: v });
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
			mutationFn: async (v: DauVao) => {
				const kq = await doc(v);
				const loi = loiGhi.get(duong);
				if (loi !== undefined) throw new Error(loi);
				return kq ?? { id: "ok" };
			},
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

const { DetailSheet } = await import("@/components/detail-sheet");
const { DashboardSummary } = await import(
	"@/app/(app)/[slug]/dashboard-summary"
);
const { PlanSteps } = await import("@/components/crm/record-sheet/plan-steps");
const { onboardingMessages } = await import("@/lib/messages/onboarding");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");

type PlanDetail = Parameters<typeof PlanSteps>[0]["plan"];

const m = onboardingMessages("vi").sheet;

const TOI = { id: "u-toi", name: "Lan", email: "lan@thu.test", image: null };

const BO_PHAN = [
	{
		id: "bp-a",
		name: "Kinh doanh",
		position: 0,
		archivedAt: null,
		purgeable: false,
	},
	{
		id: "bp-b",
		name: "Dao tao",
		position: 1,
		archivedAt: null,
		purgeable: false,
	},
	{
		id: "bp-c",
		name: "Van hanh",
		position: 2,
		archivedAt: null,
		purgeable: false,
	},
];

function keHoach(closedAt: string | null = null): PlanDetail {
	return {
		id: "kh-1",
		companyId: "ct-1",
		companyName: "One Mount",
		templateId: null,
		startedAt: "2026-09-10T00:00:00.000Z",
		targetDays: 30,
		closedAt,
		ownerId: TOI.id,
		company: {
			id: "ct-1",
			name: "One Mount",
			iconUrl: null,
			iconDarkUrl: null,
			iconTone: null,
			logoUrl: null,
		},
		owner: TOI,
		templateName: null,
		ngayThu: 12,
		buocXong: 0,
		buocTong: 0,
		imNgay: 0,
		tacO: null,
		dangTheoDoi: false,
		nguoiTheoDoi: [],
	} as unknown as PlanDetail;
}

function buoc(id: string, departmentId: string, departmentName: string) {
	return {
		id,
		planId: "kh-1",
		label: `Buoc ${id}`,
		departmentId,
		departmentName,
		assigneeId: null,
		assignee: null,
		dueAt: "2026-09-22T00:00:00.000Z",
		completedAt: null,
		position: 0,
	};
}

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

async function mo(man: ReactElement, locale: "vi" | "en" = "vi"): Promise<San> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter hasMemory searchParams="">
				<QueryClientProvider client={client}>
					<LocaleProvider locale={locale}>
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

async function bam(o: Element): Promise<void> {
	await act(async () => {
		for (const loai of [
			"pointerdown",
			"mousedown",
			"pointerup",
			"mouseup",
			"click",
		]) {
			const Kieu = loai.startsWith("pointer") ? PointerEvent : MouseEvent;
			o.dispatchEvent(
				new Kieu(loai, {
					bubbles: true,
					cancelable: true,
					button: 0,
					pointerType: "mouse",
				} as PointerEventInit),
			);
		}
	});
}

function nutCo(chu: string): HTMLButtonElement | undefined {
	return [...document.body.querySelectorAll<HTMLButtonElement>("button")].find(
		(b) => b.textContent?.trim() === chu,
	);
}

function nut(chu: string): HTMLButtonElement {
	const tim = nutCo(chu);
	if (!tim) {
		throw new Error(
			`khong thay nut "${chu}" — cac nut: ${[...document.body.querySelectorAll("button")].map((b) => b.textContent?.trim()).join(" | ")}`,
		);
	}
	return tim;
}

function form(): HTMLFormElement | null {
	return document.body.querySelector<HTMLFormElement>("[data-them-buoc]");
}

function oTen(): HTMLInputElement {
	const o = form()?.querySelector<HTMLInputElement>(
		`input[aria-label="${m.newStepLabel}"]`,
	);
	if (!o) throw new Error("khong thay o ten buoc");
	return o;
}

async function go(o: HTMLInputElement, giaTri: string): Promise<void> {
	await act(async () => {
		const dat = Object.getOwnPropertyDescriptor(
			HTMLInputElement.prototype,
			"value",
		)?.set;
		dat?.call(o, giaTri);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

async function moOChon(): Promise<string[]> {
	const oChon = form()?.querySelector('[role="combobox"]');
	if (!oChon) throw new Error("form khong co o chon bo phan");
	await bam(oChon);
	await cho(
		() => document.body.querySelectorAll('[role="option"]').length > 0,
		"mo o chon bo phan",
	);
	return [...document.body.querySelectorAll('[role="option"]')].map(
		(o) => o.textContent?.trim() ?? "",
	);
}

async function chonBoPhan(ten: string): Promise<void> {
	await moOChon();
	const luaChon = [...document.body.querySelectorAll('[role="option"]')].find(
		(o) => o.textContent?.trim() === ten,
	);
	if (!luaChon) throw new Error(`khong co bo phan ${ten}`);
	await act(async () => {
		luaChon.dispatchEvent(
			new KeyboardEvent("keydown", {
				key: "Enter",
				bubbles: true,
				cancelable: true,
			}),
		);
	});
}

async function luu(): Promise<void> {
	const f = form();
	if (!f) throw new Error("khong co form them buoc");
	await act(async () => {
		f.requestSubmit();
	});
}

function luuKhoa(): boolean {
	const o = form()?.querySelector<HTMLButtonElement>('button[type="submit"]');
	return o?.disabled ?? false;
}

async function moKeHoach(rows: ReturnType<typeof buoc>[], dong = false) {
	dat("onboarding.listSteps", () => ({ rows, total: rows.length }));
	await mo(
		<DetailSheet onOpenChange={() => {}} open>
			<PlanSteps plan={keHoach(dong ? "2026-09-20T00:00:00.000Z" : null)} />
		</DetailSheet>,
	);
	await cho(
		() => daGoi.some((g) => g.duong === "onboarding.listDepartments"),
		"doc bo phan",
	);
	await act(async () => {
		await new Promise((r) => setTimeout(r, 0));
	});
}

beforeEach(() => {
	daGoi = [];
	duLieu.clear();
	loiGhi.clear();
	dat("users.list", () => [TOI]);
	dat("onboarding.listDepartments", () => BO_PHAN);
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

describe("ke-hoach-rong", () => {
	test("ke-hoach-rong: khung trong co nut them buoc, chon bo phan roi luu", async () => {
		await moKeHoach([]);
		await cho(
			() => nutCo(m.addStep) !== undefined,
			"nut them buoc trong khung trong",
		);
		expect(
			document.body.textContent?.includes(m.noSteps.title),
			"ke hoach rong khong co nut them buoc",
		).toBe(true);

		await bam(nut(m.addStep));
		await cho(() => form() !== null, "mo form them buoc");
		expect(form()?.querySelector('[role="combobox"]') !== null).toBe(true);
		expect(luuKhoa()).toBe(true);

		await go(oTen(), "Goi dien chao mung");
		expect(luuKhoa(), "luu mo khi chua chon bo phan").toBe(true);

		await chonBoPhan("Dao tao");
		await cho(() => !luuKhoa(), "luu mo sau khi chon");
		await luu();
		await cho(
			() => daGoi.some((g) => g.duong === "onboarding.addStep"),
			"goi addStep",
		);
		const goi = daGoi.find((g) => g.duong === "onboarding.addStep")
			?.dauVao as Record<string, Json>;
		expect(goi.planId).toBe("kh-1");
		expect(goi.departmentId).toBe("bp-b");
		expect(goi.label).toBe("Goi dien chao mung");
		expect(typeof goi.dueAt).toBe("string");
	});
});

describe("bo-phan-khac", () => {
	test("bo-phan-khac: nut them o bo phan khac chi liet bo phan chua co buoc", async () => {
		await moKeHoach([buoc("S1", "bp-a", "Kinh doanh")]);
		await cho(
			() => nutCo(m.addStepOtherDepartment) !== undefined,
			"nut them buoc o bo phan khac",
		);
		await bam(nut(m.addStepOtherDepartment));
		await cho(() => form() !== null, "mo form bo phan khac");
		const luaChon = await moOChon();
		expect(
			luaChon.includes("Kinh doanh"),
			"o chon liet bo phan da co nhom",
		).toBe(false);
		expect(luaChon.sort()).toEqual(["Dao tao", "Van hanh"]);
	});

	test("bo-phan-khac: moi bo phan da co buoc thi khong co nut", async () => {
		await moKeHoach([
			buoc("S1", "bp-a", "Kinh doanh"),
			buoc("S2", "bp-b", "Dao tao"),
			buoc("S3", "bp-c", "Van hanh"),
		]);
		await cho(() => nutCo(m.addStep) !== undefined, "ve xong cac nhom");
		expect(nutCo(m.addStepOtherDepartment) === undefined).toBe(true);
	});

	test("bo-phan-khac: ke hoach da dong thi khong co nut them nao", async () => {
		await moKeHoach([buoc("S1", "bp-a", "Kinh doanh")], true);
		await cho(
			() => document.body.textContent?.includes("Buoc S1") ?? false,
			"ve buoc",
		);
		expect(nutCo(m.addStep) === undefined).toBe(true);
		expect(nutCo(m.addStepOtherDepartment) === undefined).toBe(true);
	});
});

describe("loi-bo-phan", () => {
	test("loi-bo-phan: luu loi thi bao trong form, giu chu, form khong dong", async () => {
		const cau =
			"Phòng ban Dao tao đã lưu trữ — khôi phục hoặc chọn phòng ban khác.";
		loiGhi.set("onboarding.addStep", cau);
		await moKeHoach([]);
		await cho(() => nutCo(m.addStep) !== undefined, "nut them buoc");
		await bam(nut(m.addStep));
		await cho(() => form() !== null, "mo form");
		await go(oTen(), "Ky hop dong");
		await chonBoPhan("Dao tao");
		await cho(() => !luuKhoa(), "luu mo");
		await luu();
		await cho(
			() => form()?.textContent?.includes(cau) ?? false,
			"loi trong form",
		);
		expect(form() !== null, "form dong khi luu loi").toBe(true);
		expect(oTen().value).toBe("Ky hop dong");
		expect(form()?.querySelector('[role="combobox"]') !== null).toBe(true);
	});

	test("loi-bo-phan: doi chung — luu thanh cong thi form dong", async () => {
		await moKeHoach([]);
		await cho(() => nutCo(m.addStep) !== undefined, "nut them buoc");
		await bam(nut(m.addStep));
		await cho(() => form() !== null, "mo form");
		await go(oTen(), "Ky hop dong");
		await chonBoPhan("Kinh doanh");
		await cho(() => !luuKhoa(), "luu mo");
		await luu();
		await cho(() => form() === null, "form dong sau khi luu");
		expect(form() === null).toBe(true);
	});
});

function tongQuan(input: {
	viec: number;
	buocQuaHan: number;
	buocSapHan: number;
	quaHan: { viec: number; buoc: number };
}): Json {
	const thang = { count: 0, valueCents: 0 };
	const viec = Array.from({ length: input.viec }, (_, i) => ({
		id: `viec-${i}`,
		subject: `Viec ${i}`,
		company: null,
		deal: null,
		dueAt: "2026-09-18T09:00:00.000Z",
	}));
	const buocQua = Array.from({ length: input.buocQuaHan }, (_, i) => ({
		stepId: `QH${i}`,
		nhan: `Buoc qua han ${i}`,
		dueAt: "2026-09-19",
		planId: `P-${i}`,
		company: { id: `ct-${i}`, name: `Cong ty ${i}` },
	}));
	const buocSap = Array.from({ length: input.buocSapHan }, (_, i) => ({
		stepId: `SH${i}`,
		nhan: `Buoc sap han ${i}`,
		dueAt: "2026-09-24",
		planId: `P-s${i}`,
		company: { id: `ct-s${i}`, name: `Cong ty s${i}` },
	}));
	return {
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
		overdueTasks: viec,
		recentActivity: [],
		mySteps: [...buocQua, ...buocSap],
		quaHan: input.quaHan,
		keHoachCanDeY: [],
		taiLieuChoDuyet: 0,
	};
}

async function moThe(
	du: Json,
	locale: "vi" | "en" = "vi",
): Promise<HTMLElement> {
	setSystemTime(new Date(2026, 8, 22, 9, 0));
	dat("dashboard.summary", () => du);
	await mo(<DashboardSummary />, locale);
	await cho(
		() => document.body.querySelector('[data-khoi="viec-qua-han"]') !== null,
		"the viec qua han da ve",
	);
	return document.body.querySelector(
		'[data-khoi="viec-qua-han"]',
	) as HTMLElement;
}

describe("the-qua-han", () => {
	test("the-qua-han: ghi tong that va dong con sot", async () => {
		const the = await moThe(
			tongQuan({
				viec: 10,
				buocQuaHan: 6,
				buocSapHan: 4,
				quaHan: { viec: 25, buoc: 15 },
			}),
		);
		const chu = the.textContent ?? "";
		expect(chu.includes("40"), "so qua han dem tren danh sach da cat").toBe(
			true,
		);
		expect(chu.includes("và 24 việc quá hạn nữa")).toBe(true);
	});

	test("the-qua-han: tieng Anh ghi dong con sot", async () => {
		const the = await moThe(
			tongQuan({
				viec: 10,
				buocQuaHan: 6,
				buocSapHan: 4,
				quaHan: { viec: 25, buoc: 15 },
			}),
			"en",
		);
		expect((the.textContent ?? "").includes("and 24 more past due")).toBe(true);
	});

	test("the-qua-han: hien du thi khong co dong con sot", async () => {
		const the = await moThe(
			tongQuan({
				viec: 3,
				buocQuaHan: 1,
				buocSapHan: 0,
				quaHan: { viec: 3, buoc: 1 },
			}),
		);
		const chu = the.textContent ?? "";
		expect(chu.includes("4")).toBe(true);
		expect(chu.includes("nữa"), "dong con sot hien khi khong sot").toBe(false);
	});

	test("the-qua-han: khong co gi qua han thi khong co dong con sot", async () => {
		const the = await moThe(
			tongQuan({
				viec: 0,
				buocQuaHan: 0,
				buocSapHan: 0,
				quaHan: { viec: 0, buoc: 0 },
			}),
		);
		expect((the.textContent ?? "").includes("nữa")).toBe(false);
	});
});
