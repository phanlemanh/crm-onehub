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
import fixture from "../../api/test/fixtures/may-nhac-payload.json";

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
let daLamMoi: string[] = [];
const duLieu = new Map<string, Lay>();

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

const { DetailSheet } = await import("@/components/detail-sheet");
const { DashboardSummary } = await import(
	"@/app/(app)/[slug]/dashboard-summary"
);
const { PlanSheet } = await import("@/components/crm/record-sheet/plan-sheet");
const { dien } = await import("@/components/crm/record-sheet/plan-copy");
const { nhacMessages } = await import("@/lib/messages/nhac");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");

const n = nhacMessages("vi");

const TOI = { id: "u-toi", name: "Lan", email: "lan@thu.test", image: null };

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

function tongQuanGia(): Json {
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
		viecQuaHan: [],
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
		],
		keHoachCanDeY: fixture.keHoachCanDeY,
	});
}

const IM = fixture.keHoachCanDeY.find((d) => d.loai === "ke-hoach-im");
const MOC = fixture.keHoachCanDeY.find((d) => d.loai === "moc-ngay");

function dongCua(loai: string): Element | null {
	return document.body.querySelector(`[data-can-de-y="${loai}"]`);
}

async function moTheTasks(): Promise<San> {
	setSystemTime(new Date(2026, 8, 22, 9, 0));
	dat("dashboard.summary", () => tongQuanGia());
	const san = await mo(<DashboardSummary />);
	await cho(
		() => document.body.querySelector('[data-buoc="S1"]') !== null,
		"the Tasks da ve",
	);
	return san;
}

describe("the-tasks", () => {
	afterEach(() => {
		setSystemTime();
	});

	test("the-tasks: dong Kế hoạch im mang so ngay im, ten cong ty, goi y", async () => {
		if (!IM) throw new Error("fixture thieu dong ke-hoach-im");
		await moTheTasks();
		const chu = dongCua("ke-hoach-im")?.textContent ?? "";
		expect(
			{
				nhan: chu.includes(n.keHoachIm),
				soNgay: chu.includes(dien(n.imNgay, { n: IM.soNgay })),
				congTy: chu.includes(IM.companyName),
				goiY: chu.includes(IM.goiY),
			},
			"the Tasks co dong Kế hoạch im",
		).toEqual({ nhan: true, soNgay: true, congTy: true, goiY: true });
	});

	test("the-tasks: dong Mốc ngày mang ngay thu va so buoc xong tren tong", async () => {
		if (!MOC) throw new Error("fixture thieu dong moc-ngay");
		await moTheTasks();
		const chu = dongCua("moc-ngay")?.textContent ?? "";
		expect(
			{
				nhan: chu.includes(n.mocNgay),
				ngayThu: chu.includes(
					dien(n.ngayThu, { n: MOC.soNgay, tong: MOC.targetDays ?? "" }),
				),
				buoc: chu.includes(`${MOC.soBuocXong}/${MOC.soBuocTong}`),
			},
			"the Tasks co dong Mốc ngày",
		).toEqual({ nhan: true, ngayThu: true, buoc: true });
	});

	test("the-tasks: dong Mốc ngày lay so ngay muc tieu cua ke hoach", async () => {
		if (!MOC?.targetDays) throw new Error("fixture thieu targetDays cua moc");
		await moTheTasks();
		expect(
			dongCua("moc-ngay")?.textContent ?? "",
			"moc ngay mang targetDays cua ke hoach",
		).toContain(`ngày ${MOC.soNgay}/${MOC.targetDays}`);
	});

	test("the-tasks: hai dong moi khong co o tich", async () => {
		await moTheTasks();
		const hai = [dongCua("ke-hoach-im"), dongCua("moc-ngay")];
		expect(
			hai.map((d) =>
				d === null
					? "thieu dong"
					: d.querySelectorAll('[role="checkbox"]').length,
			),
			"dong ke hoach khong co o tich",
		).toEqual([0, 0]);
	});

	test("the-tasks: mo ta the dem ke hoach im", async () => {
		await moTheTasks();
		const soIm = fixture.keHoachCanDeY.filter(
			(d) => d.loai === "ke-hoach-im",
		).length;
		expect(document.body.textContent, "mo ta the dem ke hoach im").toContain(
			dien(n.moTaIm, { n: soIm }),
		);
	});

	test("the-tasks: bam dong ke hoach im thi ngan sheet co dung ke hoach do", async () => {
		if (!IM) throw new Error("fixture thieu dong ke-hoach-im");
		const san = await moTheTasks();
		const dong = dongCua("ke-hoach-im");
		if (!dong) throw new Error("the Tasks co dong Kế hoạch im");
		await bam(dong);
		await nghi(1);
		expect(san.url().get("record"), "bam dong im mo dung ke hoach").toBe(
			`plan:${IM.planId}`,
		);
	});
});

const KE_HOACH_P = fixture.batTheoDoi.planId;
const NGUOI_KHAC = { id: "u-khac", name: "Huong Le" };

function keHoachGia(): Json {
	return {
		id: KE_HOACH_P,
		companyId: "ct-p",
		companyName: "One Mount",
		templateId: null,
		startedAt: "2026-09-10T00:00:00.000Z",
		targetDays: 30,
		closedAt: null,
		ownerId: NGUOI_KHAC.id,
		company: {
			id: "ct-p",
			name: "One Mount",
			iconUrl: null,
			iconDarkUrl: null,
			iconTone: null,
			logoUrl: null,
		},
		owner: { ...NGUOI_KHAC, email: "huong@thu.test", image: null },
		templateName: "San giao dich",
		ngayThu: 12,
		buocXong: 0,
		buocTong: 0,
		imNgay: 3,
		tacO: null,
		dangTheoDoi: false,
		nguoiTheoDoi: [NGUOI_KHAC],
	};
}

const SO_TRUOC = 1;

function nutTheoDoi(): HTMLButtonElement {
	const tim = document.body.querySelector<HTMLButtonElement>(
		"button[aria-pressed]",
	);
	if (!tim) throw new Error("khong thay nut theo doi");
	return tim;
}

async function moSheet(): Promise<void> {
	dat("onboarding.planById", () => keHoachGia());
	dat("onboarding.listSteps", () => ({ rows: [], total: 0 }));
	dat("onboarding.listEnrollments", () => []);
	dat("onboarding.listDepartments", () => []);
	dat("onboarding.access", () => ({ canManage: true }));
	await mo(
		<DetailSheet onOpenChange={() => {}} open>
			<PlanSheet planId={KE_HOACH_P} />
		</DetailSheet>,
		`?record=plan:${KE_HOACH_P}`,
	);
	await cho(
		() => document.body.querySelector("button[aria-pressed]") !== null,
		"nut theo doi",
	);
}

describe("nut-theo-doi", () => {
	test("nut-theo-doi: bam Theo dõi gui dung mot loi goi watch mang ma ke hoach", async () => {
		dat("onboarding.watch", () => ({
			dangTheoDoi: true,
			soNguoiTheoDoi: SO_TRUOC + 1,
		}));
		await moSheet();
		await bam(nut(n.theoDoi));
		await cho(
			() => daGoi.some((g) => g.duong === "onboarding.watch"),
			"loi goi watch",
		);
		expect(
			daGoi.filter((g) => g.duong === "onboarding.watch").map((g) => g.dauVao),
			"payload man gui khop fixture batTheoDoi",
		).toEqual([fixture.batTheoDoi]);
	});

	test("nut-theo-doi: thanh Đang theo dõi, aria-pressed bat, so nguoi tang mot", async () => {
		dat("onboarding.watch", () => ({
			dangTheoDoi: true,
			soNguoiTheoDoi: SO_TRUOC + 1,
		}));
		await moSheet();
		await bam(nut(n.theoDoi));
		await cho(
			() => nutTheoDoi().getAttribute("aria-pressed") === "true",
			"nut da bat",
		);
		const o = nutTheoDoi();
		expect(
			{
				nhan: o.textContent?.trim().startsWith(n.dangTheoDoi),
				pressed: o.getAttribute("aria-pressed"),
				so: o.querySelector("[data-so-theo-doi]")?.textContent?.trim(),
			},
			"nut thanh Đang theo dõi va so tang mot",
		).toEqual({ nhan: true, pressed: "true", so: String(SO_TRUOC + 1) });
	});

	test("nut-theo-doi: loi goi dang treo thi nut khoa", async () => {
		let giai: (kq: Json) => void = () => {};
		dat(
			"onboarding.watch",
			() =>
				new Promise<Json>((r) => {
					giai = r;
				}),
		);
		await moSheet();
		await bam(nut(n.theoDoi));
		await cho(
			() => daGoi.some((g) => g.duong === "onboarding.watch"),
			"loi goi watch",
		);
		await nghi(1);
		expect(
			{
				khoa: nutTheoDoi().disabled,
				pressed: nutTheoDoi().getAttribute("aria-pressed"),
			},
			"dang gui thi nut khoa, giu nhan cu",
		).toEqual({ khoa: true, pressed: "false" });
		await act(async () => {
			giai({ dangTheoDoi: true, soNguoiTheoDoi: SO_TRUOC + 1 });
		});
	});

	test("nut-theo-doi: loi goi loi thi nut ve lai Theo dõi va bao khong luu", async () => {
		dat("onboarding.watch", () => {
			throw new Error("mat ket noi");
		});
		await moSheet();
		await bam(nut(n.theoDoi));
		await cho(
			() =>
				daGoi.some((g) => g.duong === "onboarding.watch") &&
				!nutTheoDoi().disabled,
			"loi goi watch xong",
		);
		await nghi(1);
		const o = nutTheoDoi();
		expect(
			{
				nhan: o.textContent?.trim().startsWith(n.theoDoi),
				pressed: o.getAttribute("aria-pressed"),
				bao: document.body.textContent?.includes(n.khongLuu),
			},
			"loi thi nut ve lai Theo dõi",
		).toEqual({ nhan: true, pressed: "false", bao: true });
	});
});
