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
import type { RouterOutputs } from "@/lib/trpc/types";

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

async function doi(xong: () => boolean): Promise<void> {
	for (let vong = 0; vong < 120 && !xong(); vong += 1) {
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
}

function vungLoi(): HTMLElement | null {
	return form()?.querySelector<HTMLElement>("[data-vung-tai-loi]") ?? null;
}

function nutThuLai(): HTMLButtonElement | null {
	return (
		vungLoi()?.querySelector<HTMLButtonElement>('[data-slot="kara-retry"]') ??
		null
	);
}

function soLanDocPhongBan(): number {
	return daGoi.filter((g) => g.duong === "onboarding.listDepartments").length;
}

function danhSachLoi(): void {
	dat("onboarding.listDepartments", () => {
		throw new Error("mat ket noi");
	});
}

describe("phong-ban-loi", () => {
	test("phong-ban-loi: ke hoach rong — loi tai danh sach thanh vung loi, khong o chon trong", async () => {
		danhSachLoi();
		await moKeHoach([]);
		await cho(() => nutCo(m.addStep) !== undefined, "nut them buoc");
		await bam(nut(m.addStep));
		await cho(() => form() !== null, "mo form");
		await doi(() => vungLoi() !== null);
		expect(
			vungLoi() !== null,
			"loi tai danh sach phong ban thanh o chon trong",
		).toBe(true);
		expect(
			vungLoi()?.querySelector('[data-slot="empty-title"]')?.textContent,
		).toBe("Không tải được danh sách phòng ban");
		expect(vungLoi()?.textContent).toContain("Kiểm tra kết nối rồi thử lại.");
		expect(nutThuLai() !== null).toBe(true);
		expect(form()?.querySelector('[role="combobox"]')).toBeNull();
		expect(luuKhoa()).toBe(true);
	});

	test("phong-ban-loi: doi chung — danh sach tai duoc thi co o chon, khong vung loi", async () => {
		await moKeHoach([]);
		await cho(() => nutCo(m.addStep) !== undefined, "nut them buoc");
		await bam(nut(m.addStep));
		await cho(() => form() !== null, "mo form");
		expect(vungLoi()).toBeNull();
		expect(form()?.querySelector('[role="combobox"]') !== null).toBe(true);
	});

	test("phong-ban-loi: thu lai thanh cong thi o chon tro lai va luu dung phong ban", async () => {
		let lan = 0;
		dat("onboarding.listDepartments", () => {
			lan += 1;
			if (lan === 1) throw new Error("mat ket noi");
			return [
				{ ...BO_PHAN[0], id: "P1", name: "Phap che" },
				{ ...BO_PHAN[1], id: "P2", name: "Ke toan" },
			] as unknown as Json;
		});
		await moKeHoach([]);
		await cho(() => nutCo(m.addStep) !== undefined, "nut them buoc");
		await bam(nut(m.addStep));
		await cho(() => nutThuLai() !== null, "vung loi co nut thu lai");
		expect(soLanDocPhongBan()).toBe(1);
		await bam(nutThuLai() as HTMLButtonElement);
		await doi(() => soLanDocPhongBan() === 2);
		expect(
			soLanDocPhongBan(),
			"thu lai khong tai lai danh sach phong ban",
		).toBe(2);
		await cho(() => vungLoi() === null, "vung loi bien mat");
		expect((await moOChon()).sort()).toEqual(["Ke toan", "Phap che"]);
		await act(async () => {
			document.body.dispatchEvent(
				new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
			);
		});
		await go(oTen(), "Soan hop dong");
		await chonBoPhan("Ke toan");
		await cho(() => !luuKhoa(), "luu mo sau khi chon");
		await luu();
		await cho(
			() => daGoi.some((g) => g.duong === "onboarding.addStep"),
			"goi addStep",
		);
		const goi = daGoi.find((g) => g.duong === "onboarding.addStep")
			?.dauVao as Record<string, Json>;
		expect(goi.planId).toBe("kh-1");
		expect(goi.departmentId).toBe("P2");
		expect(goi.label).toBe("Soan hop dong");
		expect(String(goi.dueAt)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});

	test("phong-ban-loi: thu lai van loi thi vung loi con va nut thu lai khong ket", async () => {
		danhSachLoi();
		await moKeHoach([]);
		await cho(() => nutCo(m.addStep) !== undefined, "nut them buoc");
		await bam(nut(m.addStep));
		await cho(() => nutThuLai() !== null, "vung loi co nut thu lai");
		await bam(nutThuLai() as HTMLButtonElement);
		await cho(() => soLanDocPhongBan() === 2, "doc lai danh sach");
		await cho(
			() => nutThuLai()?.disabled === false,
			"nut thu lai mo lai sau lan doc loi",
		);
		expect(vungLoi() !== null).toBe(true);
		expect(nutThuLai()?.disabled).toBe(false);
	});

	test("phong-ban-loi: ke hoach co buoc — nut o phong ban khac van hien va mo ra vung loi", async () => {
		danhSachLoi();
		await moKeHoach([buoc("S1", "bp-a", "Kinh doanh")]);
		await cho(() => nutCo(m.addStep) !== undefined, "ve nhom A");
		await doi(() => nutCo(m.addStepOtherDepartment) !== undefined);
		expect(
			nutCo(m.addStepOtherDepartment) !== undefined,
			"nut them o phong ban khac bien mat khi danh sach loi",
		).toBe(true);
		await bam(nut(m.addStepOtherDepartment));
		await cho(() => vungLoi() !== null, "vung loi trong form phong ban khac");
		expect(vungLoi() !== null).toBe(true);
	});

	test("phong-ban-loi: ke hoach co buoc — form trong nhom A van luu duoc khi danh sach loi", async () => {
		danhSachLoi();
		await moKeHoach([buoc("S1", "bp-a", "Kinh doanh")]);
		await cho(() => nutCo(m.addStep) !== undefined, "ve nhom A");
		await bam(nut(m.addStep));
		await cho(() => form() !== null, "mo form nhom A");
		expect(vungLoi()).toBeNull();
		await go(oTen(), "Goi lai");
		await cho(() => !luuKhoa(), "luu mo");
		await luu();
		await cho(
			() => daGoi.some((g) => g.duong === "onboarding.addStep"),
			"goi addStep",
		);
		const goi = daGoi.find((g) => g.duong === "onboarding.addStep")
			?.dauVao as Record<string, Json>;
		expect(goi.departmentId).toBe("bp-a");
	});

	test("phong-ban-loi: doi chung — moi phong ban da co nhom thi khong co nut o phong ban khac", async () => {
		dat("onboarding.listDepartments", () => [BO_PHAN[0]] as unknown as Json);
		await moKeHoach([buoc("S1", "bp-a", "Kinh doanh")]);
		await cho(() => nutCo(m.addStep) !== undefined, "ve nhom A");
		expect(nutCo(m.addStepOtherDepartment)).toBeUndefined();
	});

	test("phong-ban-loi: ke hoach da dong thi khong form them nao ke ca khi danh sach loi", async () => {
		danhSachLoi();
		await moKeHoach([buoc("S1", "bp-a", "Kinh doanh")], true);
		await cho(
			() => document.body.textContent?.includes("Buoc S1") ?? false,
			"ve buoc",
		);
		expect(nutCo(m.addStep)).toBeUndefined();
		expect(nutCo(m.addStepOtherDepartment)).toBeUndefined();
	});
});

type TongQuan = RouterOutputs["dashboard"]["summary"];

function tongQuanMot(input: {
	hanBuoc: string;
	quaHan: { viec: number; buoc: number };
}): TongQuan {
	const thang = { count: 0, valueCents: 0 };
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
		overdueTasks: [],
		recentActivity: [],
		mySteps: [
			{
				stepId: "B1",
				nhan: "Buoc han D",
				dueAt: input.hanBuoc,
				planId: "P-1",
				company: { id: "ct-1", name: "Cong ty 1" },
			},
		],
		quaHan: input.quaHan,
		keHoachCanDeY: [],
		taiLieuChoDuyet: 0,
	};
}

async function moTongQuan(luc: string, du: TongQuan): Promise<HTMLElement> {
	setSystemTime(new Date(luc));
	dat("dashboard.summary", () => du as unknown as Json);
	await mo(<DashboardSummary />);
	await cho(
		() => document.body.querySelector('[data-khoi="viec-qua-han"]') !== null,
		"the viec qua han da ve",
	);
	return document.body.querySelector(
		'[data-khoi="viec-qua-han"]',
	) as HTMLElement;
}

function toneBuoc(): string | null {
	return (
		document.body
			.querySelector('[data-buoc="B1"] [data-slot="status-indicator"]')
			?.getAttribute("data-tone") ?? null
	);
}

function conSotCua(the: HTMLElement): string | null {
	return (
		the.querySelector("[data-con-sot]")?.getAttribute("data-con-sot") ?? null
	);
}

describe.if(process.env.TBD_MUI_GIO === "lui")("qua-han-lui", () => {
	const LUC = "2026-10-12T17:30:00Z";

	test("qua-han-lui: buoc han D quá hạn theo ngày VN, không có dòng còn sót", async () => {
		expect(
			Intl.DateTimeFormat().resolvedOptions().timeZone,
			"lenh khong chay o mui gio lui",
		).toBe("America/Los_Angeles");
		const the = await moTongQuan(
			LUC,
			tongQuanMot({ hanBuoc: "2026-10-12", quaHan: { viec: 0, buoc: 1 } }),
		);
		expect(
			conSotCua(the),
			"buoc qua han theo ngay VN bi dem them vao con sot",
		).toBeNull();
		expect(toneBuoc()).toBe("error");
		expect(the.textContent?.includes("nữa")).toBe(false);
		expect(
			the.querySelector('[data-slot="card-description"]')?.textContent,
		).toContain("1");
	});

	test("qua-han-lui: doi chung — mot viec qua han ngoai danh sach thi con sot 1", async () => {
		const the = await moTongQuan(
			LUC,
			tongQuanMot({ hanBuoc: "2026-10-12", quaHan: { viec: 1, buoc: 1 } }),
		);
		expect(conSotCua(the)).toBe("1");
	});
});

describe.if(process.env.TBD_MUI_GIO === "tien")("qua-han-tien", () => {
	const LUC = "2026-10-12T12:00:00Z";

	test("qua-han-tien: buoc han D chưa quá hạn theo ngày VN, việc ngoài danh sách vẫn được báo", async () => {
		expect(
			Intl.DateTimeFormat().resolvedOptions().timeZone,
			"lenh khong chay o mui gio tien",
		).toBe("Pacific/Kiritimati");
		const the = await moTongQuan(
			LUC,
			tongQuanMot({ hanBuoc: "2026-10-12", quaHan: { viec: 1, buoc: 0 } }),
		);
		expect(
			conSotCua(the),
			"buoc chua qua han theo ngay VN bi tru khoi con sot",
		).toBe("1");
		expect(toneBuoc()).toBe("neutral");
		expect(the.querySelector("[data-con-sot]")?.textContent?.trim()).toBe(
			"và 1 việc quá hạn nữa",
		);
	});

	test("qua-han-tien: doi chung — buoc han hom truoc thi mang dau qua han", async () => {
		await moTongQuan(
			LUC,
			tongQuanMot({ hanBuoc: "2026-10-11", quaHan: { viec: 0, buoc: 1 } }),
		);
		expect(toneBuoc()).toBe("error");
	});
});
