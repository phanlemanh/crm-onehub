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
import payload from "../../api/test/fixtures/moi-phia-payload.json";

type LoiGoi = { duong: string; dauVao: unknown };

let daGoi: LoiGoi[] = [];
let daLamMoi: string[] = [];
let duLieu: Record<string, (dauVao: unknown) => unknown> = {};

function thuTuc(duong: string) {
	const doc = (v: unknown) => {
		daGoi.push({ duong, dauVao: v });
		const lay = duLieu[duong];
		return lay ? lay(v) : null;
	};
	return {
		queryKey: (v?: unknown) => (v === undefined ? [duong] : [duong, v]),
		pathKey: () => [duong],
		queryOptions: (v?: unknown, chon?: object) => ({
			...chon,
			queryKey: [duong, v],
			queryFn: async () => doc(v),
		}),
		infiniteQueryOptions: (v?: unknown) => ({
			queryKey: [duong, v],
			queryFn: async () => doc(v),
			initialPageParam: null,
			getNextPageParam: () => null,
		}),
		mutationOptions: (chon?: {
			onSuccess?: (kq: unknown, v: unknown) => void;
			onError?: (e: Error) => void;
		}) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async (v: unknown) => doc(v) ?? { id: "ok" },
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
const { DashboardSummary } = await import(
	"@/app/(app)/[slug]/dashboard-summary"
);
const { tongQuanMessages } = await import("@/lib/messages/tong-quan");
const { formatCount } = await import("@crm/ui/lib/format");
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
	duLieu = {
		"users.list": () => [TOI],
		"users.me": () => TOI,
		"onboarding.listTemplates": () => [],
	};
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
		duLieu["companies.byId"] = () => congTy(2, true);
		duLieu["onboarding.plansOfCompany"] = () => [
			hangKeHoach("P1", false),
			hangKeHoach("P2", true),
		];
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
		duLieu["companies.byId"] = () => congTy(0, false);
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
		duLieu["companies.byId"] = () => congTy(1, false);
		duLieu["onboarding.plansOfCompany"] = () => [hangKeHoach("P1", false)];
		await mo(
			trongSheet(<CompanySheet companyId={CONG_TY_K} />),
			`?record=company:${CONG_TY_K}`,
		);
		await cho(() => coNut(k.congTy.tab), "co tab");
	});

	test("tab-cong-ty-man: co khuon ma chua co ke hoach thi man rong mo tao ke hoach khoa cong ty", async () => {
		duLieu["companies.byId"] = () => congTy(0, true);
		duLieu["onboarding.plansOfCompany"] = () => [];
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
	};
}

function tieuDeMuc(): boolean {
	return [...document.body.querySelectorAll("h3")].some(
		(h) => h.textContent?.trim() === k.caNhan.tieuDe,
	);
}

describe("muc-ca-nhan-man", () => {
	test("muc-ca-nhan-man: mot dong cho ke hoach dang chay, bam mo ke hoach chong len", async () => {
		duLieu["contacts.byId"] = () => caNhan();
		duLieu["onboarding.plansOfContact"] = () => [
			{ planId: "P1", companyName: "One Mount", bac: "accountAt" },
		];
		const san = await mo(
			trongSheet(<ContactSheet contactId={CA_NHAN_C} />),
			`?record=contact:${CA_NHAN_C}`,
		);
		await cho(() => tieuDeMuc(), "muc 30 ngay dau");

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
		duLieu["contacts.byId"] = () => caNhan();
		duLieu["onboarding.plansOfContact"] = () => [];
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

function tongQuanGia() {
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
	};
}

describe("the-tasks-man", () => {
	afterEach(() => {
		setSystemTime();
	});

	test("the-tasks-man: tich buoc thu hai goi setStepDone dung buoc, lam moi tong quan va ke hoach", async () => {
		setSystemTime(new Date(2026, 8, 22, 23, 30));
		duLieu["dashboard.summary"] = () => tongQuanGia();
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
