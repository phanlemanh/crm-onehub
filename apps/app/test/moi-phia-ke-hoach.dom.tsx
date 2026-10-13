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
import { z } from "zod";
import payload from "../../api/test/fixtures/moi-phia-payload.json";

type Json =
	| string
	| number
	| boolean
	| null
	| Json[]
	| { [khoa: string]: Json };

type DauVao = Json | undefined;

type LoiGoi = { duong: string; dauVao: DauVao };

type Lay = (dauVao: DauVao) => Json;

let daGoi: LoiGoi[] = [];
let daLamMoi: string[] = [];
const duLieu = new Map<string, Lay>();

function dat(duong: string, lay: Lay): void {
	duLieu.set(duong, lay);
}

function thuTuc(duong: string) {
	const doc = (v: DauVao): Json => {
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
			mutationFn: async (v: DauVao) => doc(v) ?? { id: "ok" },
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
				get: (_g, ten: string) => async (id?: string) => {
					daLamMoi.push(`${ten}:${id ?? ""}`);
				},
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

const { CompanySheet } = await import(
	"@/components/crm/record-sheet/company-sheet"
);
const { ContactSheet } = await import(
	"@/components/crm/record-sheet/contact-sheet"
);
const { DetailSheet } = await import("@/components/detail-sheet");
const { DanhMucTable } = await import(
	"@/app/(app)/[slug]/onboarding/danh-muc-table"
);
const { MembersTable } = await import(
	"@/app/(app)/[slug]/settings/members/members-table"
);
const { DashboardSummary } = await import(
	"@/app/(app)/[slug]/dashboard-summary"
);
const { tongQuanMessages } = await import("@/lib/messages/tong-quan");
const { formatCount } = await import("@crm/ui/lib/format");
const { recordSheetMessages } = await import("@/lib/messages/record-sheet");
const { crmMessages } = await import("@/lib/messages/crm");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { keHoachNoiMessages } = await import("@/lib/messages/ke-hoach-noi");

const { onboardingMessages } = await import("@/lib/messages/onboarding");

const k = keHoachNoiMessages("vi");
const ob = onboardingMessages("vi");

const CONG_TY_K = "ct-k";
const TOI = { id: "u-toi", name: "Lan", email: "lan@thu.test", image: null };

function congTy(soKeHoach: number, xuongCoKhuon: boolean) {
	return {
		id: CONG_TY_K,
		name: "One Mount",
		domain: null,
		website: null,
		description: null,
		logoUrl: null,
		logoDarkUrl: null,
		iconUrl: null,
		iconDarkUrl: null,
		iconTone: null,
		brandColor: null,
		industry: null,
		subIndustry: null,
		city: null,
		stateCode: null,
		country: null,
		countryCode: null,
		phone: null,
		email: null,
		linkedinUrl: null,
		twitterUrl: null,
		githubUrl: null,
		pricingUrl: null,
		careersUrl: null,
		enrichmentStatus: "COMPLETE",
		enrichmentError: null,
		source: "MANUAL",
		owner: null,
		contacts: [],
		fields: [],
		queued: false,
		createdAt: "2026-09-01T00:00:00.000Z",
		archivedAt: null,
		enrichedAt: null,
		primaryContactId: null,
		primaryContact: null,
		reportingCurrency: "VND",
		soKeHoach,
		xuongCoKhuon,
		deals: [],
		archivedContacts: [],
		archivedDeals: [],
	};
}

function hangKeHoach(id: string, dong: boolean) {
	return {
		id,
		companyId: CONG_TY_K,
		companyName: "One Mount",
		startedAt: "2026-09-10T00:00:00.000Z",
		targetDays: 30,
		ngayThu: 12,
		buocXong: 1,
		buocTong: 4,
		tacO: dong ? null : "Dao tao",
		boPhanTac: null,
		boPhanTacId: null,
		imNgay: 2,
		ownerId: TOI.id,
		closedAt: dong ? "2026-09-20T00:00:00.000Z" : null,
		ownerName: TOI.name,
		templateName: `Khuon ${id}`,
	};
}

type San = { o: HTMLElement; root: Root; url: () => URLSearchParams };
let dangMo: San[] = [];

async function mo(man: ReactElement, duong = ""): Promise<San> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	let hienTai = new URLSearchParams(duong);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter
				hasMemory
				onUrlUpdate={(su) => {
					hienTai = new URLSearchParams(su.queryString);
				}}
				searchParams={duong}
			>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	const san = { o, root, url: () => hienTai };
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

async function nghi(ms: number): Promise<void> {
	await act(async () => {
		await new Promise((r) => setTimeout(r, ms));
	});
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

function nut(chu: string, goc: ParentNode = document.body): HTMLElement {
	const tim = [
		...goc.querySelectorAll<HTMLElement>(
			"button, [role='tab'], [role='menuitem']",
		),
	].find((b) => b.textContent?.trim().startsWith(chu));
	if (!tim) {
		throw new Error(
			`khong thay nut "${chu}" — cac nut: ${[...goc.querySelectorAll("button, [role='tab'], [role='menuitem']")].map((b) => b.textContent?.trim()).join(" | ")}`,
		);
	}
	return tim;
}

function coNut(chu: string): boolean {
	return [
		...document.body.querySelectorAll<HTMLElement>("button, [role='tab']"),
	].some((b) => b.textContent?.trim().startsWith(chu));
}

function trongSheet(con: ReactElement): ReactElement {
	return (
		<DetailSheet onOpenChange={() => {}} open>
			{con}
		</DetailSheet>
	);
}

beforeEach(() => {
	daGoi = [];
	daLamMoi = [];
	duLieu.clear();
	dat("users.list", () => [TOI]);
	dat("users.me", () => TOI);
	dat("onboarding.listTemplates", () => []);
});

afterEach(async () => {
	for (const san of dangMo) {
		await act(async () => {
			san.root.unmount();
		});
		san.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

describe("tab-cong-ty-man", () => {
	test("tab-cong-ty-man: so tren nhan bang so dong, bam dong hai chong ke hoach P2", async () => {
		dat("companies.byId", () => congTy(2, true));
		dat("onboarding.plansOfCompany", () => [
			hangKeHoach("P1", false),
			hangKeHoach("P2", true),
		]);
		const san = await mo(
			trongSheet(<CompanySheet companyId={CONG_TY_K} />),
			`?record=company:${CONG_TY_K}`,
		);
		await cho(() => coNut(k.congTy.tab), "tab 30 ngay dau");
		const tab = nut(k.congTy.tab);
		expect(tab.textContent, "nhan tab mang so 2").toContain("2");

		await bam(tab);
		await cho(
			() => document.body.querySelectorAll("[data-ke-hoach]").length === 2,
			"hai dong ke hoach",
		);
		const goi = daGoi.filter((g) => g.duong === "onboarding.plansOfCompany");
		expect(goi.length, "dung mot loi goi plansOfCompany").toBe(1);
		expect(goi[0]?.dauVao, "input bang muc keHoachCongTy").toEqual({
			...payload.keHoachCongTy,
			companyId: CONG_TY_K,
		});
		expect(Object.keys(payload.keHoachCongTy)).toEqual(["companyId"]);

		const dong2 = document.body.querySelector('[data-ke-hoach="P2"]');
		if (!dong2) throw new Error("khong thay dong P2");
		await bam(dong2);
		await nghi(1);
		expect(san.url().get("record"), "Expected plan:P2").toBe(
			`company:${CONG_TY_K},plan:P2`,
		);
	});

	test("tab-cong-ty-man: xuong khong khuon va cong ty khong ke hoach thi khong co tab", async () => {
		dat("companies.byId", () => congTy(0, false));
		await mo(
			trongSheet(<CompanySheet companyId={CONG_TY_K} />),
			`?record=company:${CONG_TY_K}`,
		);
		await cho(
			() => document.body.textContent?.includes("One Mount") === true,
			"sheet cong ty",
		);
		await nghi(5);
		expect(coNut(k.congTy.tab), "khong co tab khi 0 khuon 0 ke hoach").toBe(
			false,
		);
	});

	test("tab-cong-ty-man: doi chung duong — co mot ke hoach thi co tab", async () => {
		dat("companies.byId", () => congTy(1, false));
		dat("onboarding.plansOfCompany", () => [hangKeHoach("P1", false)]);
		await mo(
			trongSheet(<CompanySheet companyId={CONG_TY_K} />),
			`?record=company:${CONG_TY_K}`,
		);
		await cho(() => coNut(k.congTy.tab), "co tab");
	});

	test("tab-cong-ty-man: co khuon ma chua co ke hoach thi man rong mo tao ke hoach khoa cong ty", async () => {
		dat("companies.byId", () => congTy(0, true));
		dat("onboarding.plansOfCompany", () => []);
		await mo(
			trongSheet(<CompanySheet companyId={CONG_TY_K} />),
			`?record=company:${CONG_TY_K}&tab=plans`,
		);
		await cho(
			() => document.body.textContent?.includes(k.congTy.rongTieuDe) === true,
			"man rong",
		);
		const nutTao = [...document.body.querySelectorAll("button")].find(
			(b) => b.textContent?.trim() === k.congTy.tao,
		);
		if (!nutTao) throw new Error("khong thay nut tao ke hoach");
		await bam(nutTao);
		await cho(
			() =>
				[...document.body.querySelectorAll("input")].some(
					(i) => i.value === "One Mount" && i.disabled,
				),
			"o cong ty dien san va khoa",
		);
	});
});

const CA_NHAN_C = "cn-c";

function caNhan() {
	return {
		id: CA_NHAN_C,
		firstName: "Trinh",
		lastName: "Cam Thuong",
		email: null,
		phone: null,
		title: null,
		linkedinUrl: null,
		twitterUrl: null,
		githubUrl: null,
		imageUrl: null,
		enrichmentStatus: "COMPLETE",
		enrichmentError: null,
		owner: null,
		company: null,
		fields: [],
		queued: false,
		createdAt: "2026-09-01T00:00:00.000Z",
		archivedAt: null,
		brief: null,
		facts: [],
		relationship: {
			emails: 0,
			threads: 0,
			lastReplyAt: null,
			meetings: 0,
			nextMeeting: null,
			colleagues: [],
		},
		isPrimaryContact: false,
		deals: [],
		archivedDeals: [],
	};
}

function tieuDeMuc(): boolean {
	return [...document.body.querySelectorAll("h3")].some(
		(h) => h.textContent?.trim() === k.caNhan.tieuDe,
	);
}

describe("muc-ca-nhan-man", () => {
	test("muc-ca-nhan-man: mot dong cho ke hoach dang chay, bam mo ke hoach chong len", async () => {
		dat("contacts.byId", () => caNhan());
		dat("onboarding.plansOfContact", () => [
			{ planId: "P1", companyName: "One Mount", bac: "accountAt" },
		]);
		const san = await mo(
			trongSheet(<ContactSheet contactId={CA_NHAN_C} />),
			`?record=contact:${CA_NHAN_C}`,
		);
		await cho(
			() => document.body.querySelector("[data-ke-hoach]") !== null,
			"dong ke hoach",
		);

		const goi = daGoi.filter((g) => g.duong === "onboarding.plansOfContact");
		expect(goi.length, "dung mot loi goi plansOfContact").toBe(1);
		expect(goi[0]?.dauVao, "input bang muc keHoachCaNhan").toEqual({
			...payload.keHoachCaNhan,
			contactId: CA_NHAN_C,
		});

		const dong = document.body.querySelectorAll("[data-ke-hoach]");
		expect(dong.length, "dung mot dong").toBe(1);
		expect(dong[0]?.textContent).toContain("One Mount");
		expect(dong[0]?.textContent).toContain(ob.bac.accountAt);

		const nutDong = dong[0];
		if (!nutDong) throw new Error("khong thay dong ke hoach");
		await bam(nutDong);
		await nghi(1);
		expect(san.url().get("record"), "Expected plan:P1").toBe(
			`contact:${CA_NHAN_C},plan:P1`,
		);
	});

	test("muc-ca-nhan-man: doi chung am — khong ghi danh thi khong co muc", async () => {
		dat("contacts.byId", () => caNhan());
		dat("onboarding.plansOfContact", () => []);
		await mo(
			trongSheet(<ContactSheet contactId={CA_NHAN_C} />),
			`?record=contact:${CA_NHAN_C}`,
		);
		await cho(
			() => daGoi.some((g) => g.duong === "onboarding.plansOfContact"),
			"da hoi plansOfContact",
		);
		await nghi(5);
		expect(tieuDeMuc(), "khong co tieu de muc 30 ngay dau").toBe(false);
	});
});

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

function tongQuanGia() {
	const thang = { count: 0, valueCents: 0 };
	return voiQuaHan({
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
		overdueTasks: [
			{
				id: "viec-1",
				subject: "Goi lai chi Thuong",
				company: { id: "ct-x", name: "Song Hong Land" },
				deal: null,
				dueAt: "2026-09-20T09:00:00.000Z",
			},
		],
		recentActivity: [],
		mySteps: [
			{
				stepId: "S1",
				nhan: "Ky hop dong khung",
				dueAt: "2026-09-21",
				planId: "P-S1",
				company: { id: "ct-nx", name: "Nha Xanh" },
			},
			{
				stepId: "S2",
				nhan: "Dao tao nen tang",
				dueAt: "2026-09-22",
				planId: "P-S2",
				company: { id: CONG_TY_K, name: "One Mount" },
			},
		],
		keHoachCanDeY: [],
	});
}

describe("the-tasks-man", () => {
	afterEach(() => {
		setSystemTime();
	});

	test("the-tasks-man: tich buoc thu hai goi setStepDone dung buoc, lam moi tong quan va ke hoach", async () => {
		setSystemTime(new Date(2026, 8, 22, 23, 30));
		dat("dashboard.summary", () => tongQuanGia());
		const tq = tongQuanMessages("vi");
		await mo(<DashboardSummary />);
		await cho(
			() => document.body.querySelector('[data-buoc="S2"]') !== null,
			"dong buoc S2",
		);

		const s1 = document.body.querySelector('[data-buoc="S1"]');
		const s2 = document.body.querySelector('[data-buoc="S2"]');
		if (!s1 || !s2) throw new Error("thieu dong buoc");
		expect(
			s1.querySelector('[data-tone="error"]'),
			"S1 qua han phai to do",
		).not.toBeNull();
		expect(
			s2.querySelector('[data-tone="error"]'),
			"S2 han hom nay khong qua han",
		).toBeNull();
		expect(s2.textContent).toContain("One Mount");
		expect(nut(k.tasks.keHoach, s2).textContent).toBe(k.tasks.keHoach);
		expect(
			document.body.textContent,
			"mo ta dem ca viec va buoc qua han",
		).toContain(tq.tasks.pastDue(formatCount(2, tq.tasks.taskNoun, "vi")));

		const truoc = daGoi.filter((g) => g.duong === "dashboard.summary").length;
		const o = s2.querySelector('[role="checkbox"]');
		if (!o) throw new Error("khong thay o tich cua S2");
		await bam(o);
		await cho(() => daLamMoi.includes("plan:P-S2"), "lam moi ke hoach P-S2");

		const xong = daGoi.filter((g) => g.duong === "onboarding.setStepDone");
		expect(xong.length, "dung mot loi goi setStepDone").toBe(1);
		expect(xong[0]?.dauVao, "Expected stepId S2").toEqual({
			...payload.tichXong,
			stepId: "S2",
		});
		expect(
			daGoi.some((g) => g.duong === "activities.complete"),
			"khong goi activities.complete",
		).toBe(false);
		await cho(
			() => daGoi.filter((g) => g.duong === "dashboard.summary").length > truoc,
			"tong quan duoc lam moi",
		);
	});
});

const NGUOI_A = { id: "u-a", name: "An", email: "an@thu.test", image: null };

function danhMucGia() {
	return {
		rows: [
			{
				...hangKeHoach("P1", false),
				boPhanTac: "Kinh doanh",
				boPhanTacId: "bp-1",
			},
		],
		total: 1,
		facetCounts: {
			trangThai: { "dang-chay": 1 },
			boPhan: { "bp-1": 1 },
			nguoiCam: { [TOI.id]: 1 },
			nguoiGiao: { [NGUOI_A.id]: 1 },
		},
		soKhuon: 1,
		trangThai: "ST-danhmuc-codulieu",
	};
}

async function phim(o: Element, key: string): Promise<void> {
	await act(async () => {
		o.dispatchEvent(
			new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
		);
	});
}

const dauVaoDanhMuc = z
	.object({
		nguoiGiao: z.array(z.string()),
		nguoiCam: z.array(z.string()),
		boPhan: z.array(z.string()),
	})
	.partial();

function goiDanhMucCuoi(
	khoa: "nguoiGiao" | "nguoiCam" | "boPhan",
): string[] | undefined {
	const goi = daGoi.filter((g) => g.duong === "onboarding.manDanhMuc");
	const ket = dauVaoDanhMuc.safeParse(goi.at(-1)?.dauVao);
	return ket.success ? ket.data[khoa] : undefined;
}

describe("loc-nguoi-giao-man", () => {
	test("loc-nguoi-giao-man: chon A o o loc Nguoi duoc giao gui nguoiGiao [A], bo chon thi rong", async () => {
		dat("users.list", () => [TOI, NGUOI_A]);
		dat("onboarding.manDanhMuc", () => danhMucGia());
		const san = await mo(<DanhMucTable />);
		await cho(
			() => san.o.textContent?.includes("One Mount") === true,
			"hang One Mount",
		);

		const moLoc = [
			...document.body.querySelectorAll<HTMLElement>('[aria-haspopup="menu"]'),
		].find((o) => o.textContent?.trim().startsWith("Lọc"));
		if (!moLoc) throw new Error("khong thay nut mo menu Loc");
		await bam(moLoc);
		await cho(
			() =>
				[...document.body.querySelectorAll('[role="menuitem"]')].some((o) =>
					o.textContent?.includes(k.danhMuc.nguoiGiao),
				),
			"muc Nguoi duoc giao",
		);
		const muc = [
			...document.body.querySelectorAll<HTMLElement>('[role="menuitem"]'),
		].find((o) => o.textContent?.includes(k.danhMuc.nguoiGiao));
		if (!muc) throw new Error("khong thay muc Nguoi duoc giao");
		muc.focus();
		await phim(muc, "ArrowRight");
		await cho(
			() =>
				[...document.body.querySelectorAll('[role="menuitemcheckbox"]')].some(
					(o) => o.textContent?.includes(NGUOI_A.name),
				),
			"lua chon An",
		);
		const chonA = [
			...document.body.querySelectorAll<HTMLElement>(
				'[role="menuitemcheckbox"]',
			),
		].find((o) => o.textContent?.includes(NGUOI_A.name));
		if (!chonA) throw new Error("khong thay lua chon An");
		await bam(chonA);
		await cho(() => {
			const v = goiDanhMucCuoi("nguoiGiao");
			return Array.isArray(v) && v.length === 1;
		}, "loi goi danh muc mang nguoiGiao");
		expect(goiDanhMucCuoi("nguoiGiao"), "Expected nguoiGiao [A]").toEqual([
			NGUOI_A.id,
		]);
		expect(goiDanhMucCuoi("nguoiCam"), "nguoiCam giu nguyen").toEqual([]);
		expect(goiDanhMucCuoi("boPhan"), "boPhan giu nguyen").toEqual([]);
		expect(san.url().get("nguoiGiao"), "tham so duong dan").toContain(
			NGUOI_A.id,
		);

		const lai = [
			...document.body.querySelectorAll<HTMLElement>(
				'[role="menuitemcheckbox"]',
			),
		].find((o) => o.textContent?.includes(NGUOI_A.name));
		if (!lai) throw new Error("menu da dong, khong bo chon duoc");
		await bam(lai);
		await cho(() => {
			const v = goiDanhMucCuoi("nguoiGiao");
			return Array.isArray(v) && v.length === 0;
		}, "doi chung: bo chon thi nguoiGiao rong");
	});
});

const THANH_VIEN = [
	{ id: "m-h", userId: "u-h", name: "Huong Le" },
	{ id: "m-t", userId: "u-t", name: "Tuan Do" },
	{ id: "m-k", userId: "u-k", name: "Kim Anh" },
];

function datThanhVien(
	canManage: boolean,
	xemTruoc: { keHoach: number; buoc: number },
) {
	dat("workspace.get", () => ({
		id: "ws",
		name: "OneHub",
		slug: "ws",
		viewerRole: "admin",
		canRename: true,
		canChangeRoles: false,
		canManageMembers: true,
		canIssuePasswordLink: false,
	}));
	dat("workspace.members", () => ({
		rows: THANH_VIEN.map((n) => ({
			...n,
			email: `${n.userId}@thu.test`,
			image: null,
			role: "member",
			joinedAt: "2026-09-01T00:00:00.000Z",
			isViewer: false,
			passwordLinkIssuedAt: null,
			passwordLinkIssuedByName: null,
		})),
		total: THANH_VIEN.length,
		facetCounts: { role: { member: 3 } },
	}));
	dat("onboarding.access", () => ({ canManage }));
	dat("onboarding.transferPreview", () => xemTruoc);
	dat("users.list", () =>
		THANH_VIEN.map((n) => ({
			id: n.userId,
			name: n.name,
			email: `${n.userId}@thu.test`,
			image: null,
		})),
	);
	dat("onboarding.nguoiNhanViec", () =>
		THANH_VIEN.map((n) => ({
			id: n.userId,
			name: n.name,
			email: `${n.userId}@thu.test`,
			image: null,
		})),
	);
}

async function moMenuCua(ten: string): Promise<void> {
	await cho(
		() => document.body.textContent?.includes(ten) === true,
		`hang ${ten}`,
	);
	const hang = [...document.body.querySelectorAll("tr")].find((r) =>
		r.textContent?.includes(ten),
	);
	const trigger = hang?.querySelector('[aria-haspopup="menu"]');
	if (!trigger) throw new Error(`khong thay nut menu cua ${ten}`);
	await bam(trigger);
	await cho(
		() => document.body.querySelector('[role="menu"]') !== null,
		"menu mo",
	);
}

function mucChuyen(): HTMLElement | undefined {
	return [
		...document.body.querySelectorAll<HTMLElement>('[role="menuitem"]'),
	].find((o) => o.textContent?.trim() === k.chuyen.menu);
}

const thayMa = (gia: string) =>
	gia === "NGUOI_DI" ? "u-h" : gia === "NGUOI_NHAN" ? "u-t" : gia;

describe("chuyen-giao-man", () => {
	test("chuyen-giao-man: xem truoc dung nguoi, chon T, gui dung payload chuyen giao", async () => {
		datThanhVien(true, { keHoach: 2, buoc: 3 });
		await mo(<MembersTable />);
		await moMenuCua("Huong Le");
		const muc = mucChuyen();
		if (!muc) throw new Error("khong thay muc chuyen viec");
		await bam(muc);
		await cho(
			() => document.body.textContent?.includes("2 kế hoạch") === true,
			"hop thoai nêu so",
		);

		const xem = daGoi.filter((g) => g.duong === "onboarding.transferPreview");
		expect(
			xem.at(-1)?.dauVao,
			"Expected fromUserId u-h / Received ma member",
		).toEqual({
			fromUserId: thayMa(payload.xemTruoc.fromUserId),
		});
		const hop = document.body.querySelector('[role="dialog"]');
		if (!hop) throw new Error("khong thay hop thoai");
		expect(hop.textContent).toContain("2 kế hoạch");
		expect(hop.textContent).toContain("3 bước");

		const o = hop.querySelector(`[aria-label="${k.chuyen.nguoiNhan}"]`);
		if (!o) throw new Error("khong thay o nguoi nhan");
		await bam(o);
		await cho(
			() => document.body.querySelectorAll("[cmdk-item]").length > 0,
			"danh sach nguoi nhan",
		);
		const ten = [...document.body.querySelectorAll("[cmdk-item]")].map(
			(i) => i.textContent?.trim() ?? "",
		);
		expect(ten.sort(), "nguoi nhan khong co H").toEqual(["Kim Anh", "Tuan Do"]);
		const chonT = [...document.body.querySelectorAll("[cmdk-item]")].find((i) =>
			i.textContent?.includes("Tuan Do"),
		);
		if (!chonT) throw new Error("khong thay Tuan Do");
		await bam(chonT);

		await cho(() => {
			const x = [...hop.querySelectorAll("button")].find(
				(b) => b.textContent?.trim() === k.chuyen.xacNhan,
			);
			return x !== undefined && !x.disabled;
		}, "nut chuyen mo khoa");
		const xacNhan = [...hop.querySelectorAll("button")].find(
			(b) => b.textContent?.trim() === k.chuyen.xacNhan,
		);
		if (!xacNhan) throw new Error("khong thay nut chuyen");
		await bam(xacNhan);
		await cho(
			() => daGoi.some((g) => g.duong === "onboarding.transferWork"),
			"loi goi chuyen",
		);
		const chuyen = daGoi.filter((g) => g.duong === "onboarding.transferWork");
		expect(chuyen.length, "dung mot loi goi transferWork").toBe(1);
		expect(chuyen[0]?.dauVao, "payload bang muc chuyenGiao").toEqual({
			fromUserId: thayMa(payload.chuyenGiao.fromUserId),
			toUserId: thayMa(payload.chuyenGiao.toUserId),
		});
	});

	test("chuyen-giao-man: xem truoc bang 0 thi nut chuyen khoa", async () => {
		datThanhVien(true, { keHoach: 0, buoc: 0 });
		await mo(<MembersTable />);
		await moMenuCua("Huong Le");
		const muc = mucChuyen();
		if (!muc) throw new Error("khong thay muc chuyen viec");
		await bam(muc);
		await cho(
			() => document.body.textContent?.includes("không cầm trịch") === true,
			"cau khong co viec",
		);
		const xacNhan = [
			...document.body.querySelectorAll<HTMLButtonElement>(
				'[role="dialog"] button',
			),
		].find((b) => b.textContent?.trim() === k.chuyen.xacNhan);
		expect(xacNhan?.disabled, "nut chuyen khoa khi 0 va 0").toBe(true);
	});

	test("chuyen-giao-man: doi chung am — khong co quyen thi khong co muc chuyen viec", async () => {
		datThanhVien(false, { keHoach: 2, buoc: 3 });
		await mo(<MembersTable />);
		await moMenuCua("Huong Le");
		await nghi(5);
		expect(mucChuyen(), "khong co muc chuyen viec").toBeUndefined();
	});
});

function truongChon(value: string | null) {
	return {
		id: "f-hang",
		entity: "COMPANY",
		key: "hang_doi_tac",
		label: "Hang doi tac",
		type: "SELECT",
		agentFilled: false,
		agentBrief: null,
		required: false,
		showOnSheet: true,
		showOnTable: false,
		showOnFilter: false,
		position: 0,
		archived: false,
		options: [{ id: "o-vang", label: "Vang", color: null, position: 0 }],
		value,
	};
}

function thoaThuan(id: string, amountCents: number | null) {
	return {
		id,
		name: `Thoa thuan ${id}`,
		stage: "DEMO_BOOKED",
		currency: "VND",
		amountCents,
		baseAmountCents: amountCents,
		expectedCloseDate: null,
		owner: null,
	};
}

function oCuaNhan(nhan: string): HTMLElement {
	const nhanO = [...document.body.querySelectorAll("label")].find(
		(l) => l.textContent?.trim() === nhan,
	);
	const o = nhanO?.htmlFor ? document.getElementById(nhanO.htmlFor) : null;
	if (!o) throw new Error(`khong thay o cua nhan ${nhan}`);
	return o;
}

function coRongChuan(o: Element): boolean {
	return [...o.querySelectorAll("span")].some(
		(x) =>
			x.textContent === "—" && x.className.includes("text-muted-foreground"),
	);
}

async function moSheetLech(
	chon: string | null,
	chuSoHuu: typeof TOI | null,
	gia: number | null,
): Promise<void> {
	dat("companies.byId", () => ({
		...congTy(0, false),
		owner: chuSoHuu,
		fields: [truongChon(chon)],
		deals: [thoaThuan("d1", gia), thoaThuan("d2", null)],
	}));
	await mo(
		trongSheet(<CompanySheet companyId={CONG_TY_K} />),
		`?record=company:${CONG_TY_K}`,
	);
	await cho(
		() =>
			[...document.body.querySelectorAll("label")].some(
				(l) => l.textContent?.trim() === "Hang doi tac",
			),
		"truong chon tren sheet",
	);
}

describe("ba-lech", () => {
	const rs = recordSheetMessages("vi");
	const crm = crmMessages("vi");

	test("ba-lech: truong chon, chu so huu va gia tri dang mo rong deu hien o rong chuan", async () => {
		await moSheetLech(null, null, null);

		const oChon = oCuaNhan("Hang doi tac");
		expect(coRongChuan(oChon), "truong chon rong hien o rong chuan").toBe(true);
		expect(document.body.textContent, "khong con chu None").not.toContain(
			"None",
		);

		const oChu = oCuaNhan(rs.company.fields.owner);
		expect(coRongChuan(oChu), "chu so huu rong hien o rong chuan").toBe(true);
		expect(oChu.textContent, "o thu gon khong hien Chua giao").not.toContain(
			rs.company.fields.unassigned,
		);

		const oGia = [...document.body.querySelectorAll("*")].find(
			(x) =>
				x.children.length > 0 &&
				x.textContent?.startsWith(rs.company.openPipeline) === true &&
				x.textContent.length < 60,
		);
		if (!oGia) throw new Error("khong thay o Gia tri dang mo");
		expect(coRongChuan(oGia), "gia tri dang mo rong").toBe(true);

		await bam(oChon);
		await cho(
			() => document.body.querySelectorAll('[role="option"]').length > 0,
			"menu truong chon",
		);
		const luaChon = [...document.body.querySelectorAll('[role="option"]')].map(
			(o) => o.textContent?.trim(),
		);
		expect(luaChon, "menu co Khong chon").toContain(crm.fieldValue.none);
		expect(luaChon).not.toContain("None");
	});

	test("ba-lech: menu chu so huu van co Chua giao", async () => {
		await moSheetLech(null, null, null);
		await bam(oCuaNhan(rs.company.fields.owner));
		await cho(
			() => document.body.querySelectorAll('[role="option"]').length > 0,
			"menu chu so huu",
		);
		expect(
			[...document.body.querySelectorAll('[role="option"]')].map((o) =>
				o.textContent?.trim(),
			),
		).toContain(rs.company.fields.unassigned);
	});

	test("ba-lech: doi chung duong — co gia tri thi hien gia tri", async () => {
		await moSheetLech("o-vang", TOI, 5_000_000);
		expect(oCuaNhan("Hang doi tac").textContent).toContain("Vang");
		await cho(
			() =>
				oCuaNhan(rs.company.fields.owner).textContent?.includes(TOI.name) ===
				true,
			"ten chu so huu",
		);
		const oGia = [...document.body.querySelectorAll("*")].find(
			(x) =>
				x.children.length > 0 &&
				x.textContent?.startsWith(rs.company.openPipeline) === true &&
				x.textContent.length < 60,
		);
		if (!oGia) throw new Error("khong thay o Gia tri dang mo");
		expect(coRongChuan(oGia), "co gia thi khong con o rong").toBe(false);
		expect(oGia.textContent).toMatch(/\d/);
	});
});
