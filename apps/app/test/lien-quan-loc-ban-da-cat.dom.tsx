import {
	afterEach,
	beforeEach,
	describe,
	expect,
	mock,
	setSystemTime,
	test,
} from "bun:test";
import {
	QueryClient,
	QueryClientProvider,
	skipToken,
} from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { NuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { RouterOutputs } from "@/lib/trpc/types";

type Json =
	| string
	| number
	| boolean
	| null
	| Json[]
	| { [khoa: string]: Json };
type DauVao = Json | undefined;
type Lay = (vao: DauVao) => unknown;
type LoiGoi = { duong: string; vao: DauVao };
type TuyChonGhi = {
	onSuccess?: (kq: Json, vao: DauVao) => void;
	onError?: (e: Error) => void;
};

let daGoi: LoiGoi[] = [];
const duLieu = new Map<string, Lay>();

function dat(duong: string, lay: Lay): void {
	duLieu.set(duong, lay);
}

function thuTuc(duong: string) {
	const doc = async (vao: DauVao): Promise<unknown> => {
		daGoi.push({ duong, vao });
		const lay = duLieu.get(duong);
		return lay ? lay(vao) : null;
	};
	return {
		queryKey: (vao?: DauVao) => (vao === undefined ? [duong] : [duong, vao]),
		pathKey: () => [duong],
		queryOptions: (
			vao?: DauVao | typeof skipToken,
			chon?: { enabled?: boolean },
		) =>
			vao === skipToken
				? { queryKey: [duong, "skip"], queryFn: skipToken }
				: {
						...chon,
						queryKey: [duong, vao ?? null],
						queryFn: async () => doc(vao),
					},
		infiniteQueryOptions: (vao?: DauVao) => ({
			queryKey: [duong, vao ?? null, "vo-han"],
			queryFn: async () => doc(vao),
			initialPageParam: null,
			getNextPageParam: () => undefined,
		}),
		mutationOptions: (chon?: TuyChonGhi) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async (vao: DauVao) => (await doc(vao)) ?? { id: "ok" },
		}),
	};
}

const trpcGia = new Proxy(
	{},
	{
		get: (_g, khong: string) =>
			new Proxy({}, { get: (_h, ten: string) => thuTuc(`${khong}.${ten}`) }),
	},
);

mock.module("@/lib/trpc/client", () => ({ useTRPC: () => trpcGia }));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws",
}));

const eveThat = await import("eve/react");
mock.module("eve/react", () => ({
	...eveThat,
	useEveAgent: () => ({
		status: "ready",
		error: undefined,
		data: { messages: [] },
		session: null,
		send: async () => {},
	}),
}));
const phienThat = await import("@/lib/agent-session");
mock.module("@/lib/agent-session", () => ({
	...phienThat,
	loadThread: () => new Promise(() => {}),
}));
globalThis.FormData = window.FormData;

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { Toaster } = await import("@crm/ui/components/sonner");
const { crmMessages } = await import("@/lib/messages/crm");
const { companyMessages } = await import("@/lib/messages/companies");
const { dealMessages } = await import("@/lib/messages/deals");
const { recordSheetMessages } = await import("@/lib/messages/record-sheet");
const { DetailSheet } = await import("@/components/detail-sheet");
const { ContactSheet } = await import(
	"@/components/crm/record-sheet/contact-sheet"
);
const { CompanySheet } = await import(
	"@/components/crm/record-sheet/company-sheet"
);
const { DealSheet } = await import("@/components/crm/record-sheet/deal-sheet");

type Locale = "vi" | "en";
type Loai = "contact" | "company" | "deal";
type CongTy = RouterOutputs["companies"]["byId"];
type CaNhan = RouterOutputs["contacts"]["byId"];
type ThoaThuan = RouterOutputs["deals"]["byId"];
type CaNhanCat = CongTy["archivedContacts"][number];
type ThoaThuanCat = CongTy["archivedDeals"][number];

const DAU_VIET = /[À-ỹ]/u;
const { LocalDay } = await import("@/components/local-date-time");

async function ngayCuaApp(ngay: string): Promise<string> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	await act(async () => {
		root.render(
			<LocaleProvider locale="vi">
				<LocalDay date={ngay} />
			</LocaleProvider>,
		);
	});
	const chu = (o.textContent ?? "").trim();
	await act(async () => root.unmount());
	o.remove();
	return chu;
}
const RS = recordSheetMessages("vi");

function chot(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

const CHU_SO_HUU = {
	id: "u-1",
	name: "Trần Minh Hải",
	email: "hai@onehub.vn",
	image: null,
};

const GIAI_DOAN = [
	{ id: "g1", label: "Tiep can", kind: "OPEN", color: null, position: 0 },
	{ id: "g2", label: "Thang", kind: "WON", color: null, position: 1 },
];

function datNen(): void {
	dat("users.list", () => [CHU_SO_HUU]);
	dat("giaiDoan.list", () => ({
		stages: GIAI_DOAN,
		canManage: false,
		tran: 0,
	}));
	dat("fields.filters", () => []);
	dat("fields.list", () => []);
	dat("savedViews.list", () => []);
	dat("companies.options", () => []);
	dat("deals.contactOptions", () => []);
	dat("onboarding.access", () => ({ canManage: false }));
	dat("onboarding.listTemplates", () => []);
	dat("onboarding.plansOfCompany", () => []);
	dat("onboarding.plansOfContact", () => []);
	dat("conversations.list", () => []);
	dat("conversations.events", () => []);
	for (const t of ["contacts", "companies", "deals"])
		dat(`${t}.list`, () => ({ rows: [], total: 0, facetCounts: {} }));
}

const caNhanCat = (id: string, ten: string, ngay: string): CaNhanCat => ({
	id,
	firstName: ten,
	lastName: "Cũ",
	email: null,
	archivedAt: ngay,
});

const thoaThuanCat = (id: string, ten: string, ngay: string): ThoaThuanCat => ({
	id,
	name: ten,
	archivedAt: ngay,
});

const caNhanTrongCongTy = (
	id: string,
	ten: string,
): CongTy["contacts"][number] => ({
	id,
	firstName: ten,
	lastName: "Đang",
	email: null,
	phone: null,
	title: null,
	imageUrl: null,
	owner: null,
});

const thoaThuanTrongCongTy = (
	id: string,
	ten: string,
	gia: number | null = null,
	chot_: string | null = null,
): CongTy["deals"][number] => ({
	id,
	name: ten,
	stage: "g1",
	currency: "USD",
	expectedCloseDate: chot_,
	owner: null,
	amountCents: gia,
	baseAmountCents: gia,
});

function congTyGia(phan: Partial<CongTy> = {}): CongTy {
	return {
		id: "co-1",
		name: "Thép Hòa Phát",
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
		reportingCurrency: "USD",
		soKeHoach: 0,
		xuongCoKhuon: false,
		deals: [],
		archivedContacts: [],
		archivedDeals: [],
		...phan,
	};
}

function caNhanGia(phan: Partial<CaNhan> = {}): CaNhan {
	return {
		id: "ct-1",
		firstName: "Hà",
		lastName: "Nguyễn",
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
		...phan,
	};
}

function thoaThuanGia(phan: Partial<ThoaThuan> = {}): ThoaThuan {
	return {
		id: "d-1",
		name: "Hợp đồng thép quý 4",
		description: null,
		stage: "g1",
		currency: "USD",
		closedReason: null,
		company: {
			id: "co-1",
			name: "Thép Hòa Phát",
			domain: null,
			iconUrl: null,
			iconDarkUrl: null,
			iconTone: null,
			logoUrl: null,
			industry: null,
		},
		owner: CHU_SO_HUU,
		fields: [],
		amountCents: null,
		baseAmountCents: null,
		reportingCurrency: "USD",
		fxRate: null,
		fxRateAt: null,
		stageChangedAt: "2026-09-01T00:00:00.000Z",
		expectedCloseDate: null,
		closedAt: null,
		createdAt: "2026-09-01T00:00:00.000Z",
		archivedAt: null,
		contacts: [],
		archivedContacts: [],
		...phan,
	};
}

const caNhanTrenThoaThuan = (
	id: string,
	ten: string,
): ThoaThuan["contacts"][number] => ({
	id,
	firstName: ten,
	lastName: "Đang",
	email: null,
	phone: null,
	title: null,
	imageUrl: null,
	role: null,
});

const thoaThuanCuaCaNhan = (
	id: string,
	ten: string,
): CaNhan["deals"][number] => ({
	id,
	name: ten,
	stage: "g1",
	currency: "USD",
	expectedCloseDate: null,
	owner: CHU_SO_HUU,
	role: null,
	amountCents: null,
});

const NGAY_1 = "2026-09-20T03:00:00.000Z";
const NGAY_2 = "2026-09-10T03:00:00.000Z";

type Bang = {
	ten: string;
	loai: Loai;
	id: string;
	duong: string;
	tab: string;
	kindMo: "contact" | "deal";
	dangDung: string[];
	daCat: { id: string; ten: string; ngay: string }[];
	lay: (coDangDung: boolean, coCat: boolean) => object;
	chuRong: string;
};

const CAT_NGUOI = [
	{ id: "cc-1", ten: "Cúc Cũ", ngay: NGAY_1 },
	{ id: "cc-2", ten: "Đào Cũ", ngay: NGAY_2 },
];
const CAT_THOA = [
	{ id: "dc-1", ten: "Thoả thuận đã cất 1", ngay: NGAY_1 },
	{ id: "dc-2", ten: "Thoả thuận đã cất 2", ngay: NGAY_2 },
];

const BANG: Bang[] = [
	{
		ten: "cong ty > ca nhan",
		loai: "company",
		id: "co-1",
		duong: "companies.byId",
		tab: "contacts",
		kindMo: "contact",
		dangDung: ["An Đang", "Bình Đang"],
		daCat: CAT_NGUOI,
		lay: (dd, cat) =>
			congTyGia({
				contacts: dd
					? [caNhanTrongCongTy("ca-1", "An"), caNhanTrongCongTy("ca-2", "Bình")]
					: [],
				archivedContacts: cat
					? CAT_NGUOI.map((c) =>
							caNhanCat(c.id, c.ten.split(" ")[0] ?? "", c.ngay),
						)
					: [],
			}),
		chuRong: RS.company.noContactsTitle,
	},
	{
		ten: "cong ty > thoa thuan",
		loai: "company",
		id: "co-1",
		duong: "companies.byId",
		tab: "deals",
		kindMo: "deal",
		dangDung: ["Thoả thuận A", "Thoả thuận B"],
		daCat: CAT_THOA,
		lay: (dd, cat) =>
			congTyGia({
				deals: dd
					? [
							thoaThuanTrongCongTy("da-1", "Thoả thuận A"),
							thoaThuanTrongCongTy("da-2", "Thoả thuận B"),
						]
					: [],
				archivedDeals: cat
					? CAT_THOA.map((d) => thoaThuanCat(d.id, d.ten, d.ngay))
					: [],
			}),
		chuRong: RS.company.noDealsTitle,
	},
	{
		ten: "ca nhan > thoa thuan",
		loai: "contact",
		id: "ct-1",
		duong: "contacts.byId",
		tab: "deals",
		kindMo: "deal",
		dangDung: ["Thoả thuận A", "Thoả thuận B"],
		daCat: CAT_THOA,
		lay: (dd, cat) =>
			caNhanGia({
				deals: dd
					? [
							thoaThuanCuaCaNhan("da-1", "Thoả thuận A"),
							thoaThuanCuaCaNhan("da-2", "Thoả thuận B"),
						]
					: [],
				archivedDeals: cat
					? CAT_THOA.map((d) => thoaThuanCat(d.id, d.ten, d.ngay))
					: [],
			}),
		chuRong: RS.contact.notOnDealsTitle,
	},
	{
		ten: "thoa thuan > ca nhan",
		loai: "deal",
		id: "d-1",
		duong: "deals.byId",
		tab: "contacts",
		kindMo: "contact",
		dangDung: ["An Đang", "Bình Đang"],
		daCat: CAT_NGUOI,
		lay: (dd, cat) =>
			thoaThuanGia({
				contacts: dd
					? [
							caNhanTrenThoaThuan("ca-1", "An"),
							caNhanTrenThoaThuan("ca-2", "Bình"),
						]
					: [],
				archivedContacts: cat
					? CAT_NGUOI.map((c) =>
							caNhanCat(c.id, c.ten.split(" ")[0] ?? "", c.ngay),
						)
					: [],
			}),
		chuRong: RS.deal.noContactsTitle,
	},
];

let goc: { o: HTMLElement; root: Root }[] = [];
let url = new URLSearchParams();

beforeEach(() => {
	daGoi = [];
	duLieu.clear();
	url = new URLSearchParams();
	datNen();
});

afterEach(async () => {
	for (const g of goc) {
		await act(async () => g.root.unmount());
		g.o.remove();
	}
	goc = [];
	document.body.innerHTML = "";
	setSystemTime();
});

async function nhip(lan = 5): Promise<void> {
	for (let i = 0; i < lan; i += 1)
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
}

async function cho(dieu: () => boolean, moTa: string): Promise<void> {
	for (let i = 0; i < 150; i += 1) {
		if (dieu()) return;
		await nhip(1);
	}
	throw new Error(
		`khong toi: ${moTa} — ${document.body.textContent?.slice(0, 500)}`,
	);
}

function manCua(loai: Loai, id: string): ReactElement {
	if (loai === "company") return <CompanySheet companyId={id} />;
	if (loai === "contact") return <ContactSheet contactId={id} />;
	return <DealSheet dealId={id} />;
}

async function moNgan(
	loai: Loai,
	id: string,
	tuyChon: { tab?: string; locale?: Locale } = {},
): Promise<void> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	goc.push({ o, root });
	const sp = `record=${loai}:${id}${tuyChon.tab ? `&tab=${tuyChon.tab}` : ""}`;
	url = new URLSearchParams(sp);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter
				hasMemory
				searchParams={sp}
				onUrlUpdate={(e: UrlUpdateEvent) => {
					url = new URLSearchParams(e.queryString);
				}}
			>
				<QueryClientProvider client={client}>
					<LocaleProvider locale={tuyChon.locale ?? "vi"}>
						<TooltipProvider>
							<Toaster />
							<DetailSheet open onOpenChange={() => {}}>
								{manCua(loai, id)}
							</DetailSheet>
						</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	await nhip(10);
}

const tabDangMo = () =>
	document.querySelector<HTMLElement>('[role="tabpanel"][data-state="active"]');

function nutGap(trong: ParentNode, locale: Locale = "vi") {
	const chu = recordSheetMessages(locale).archivedRows.toggle;
	return [...trong.querySelectorAll<HTMLButtonElement>("button")].filter(
		(b) => {
			const nhan = (b.textContent ?? "").trim();
			const so = /^\+(\d+) /.exec(nhan)?.[1];
			return so !== undefined && nhan === chu(so);
		},
	);
}

const dongCat = (trong: ParentNode) => [
	...trong.querySelectorAll<HTMLElement>("[data-da-luu-tru]"),
];

async function moBang(
	b: Bang,
	dd: boolean,
	cat: boolean,
	locale: Locale = "vi",
) {
	dat(b.duong, () => b.lay(dd, cat));
	await moNgan(b.loai, b.id, { tab: b.tab, locale });
	await cho(() => tabDangMo() !== null, `tab ${b.tab} cua ${b.ten}`);
	const tab = tabDangMo();
	if (!tab) throw new Error(`khong co tab ${b.ten}`);
	return tab;
}

async function dongHet(): Promise<void> {
	for (const g of goc) {
		await act(async () => g.root.unmount());
		g.o.remove();
	}
	goc = [];
	document.body.innerHTML = "";
}

describe("lqc-dong-gap", () => {
	test("bon bang chi hien ban dang dung, dong gap mo ra ban da cat", async () => {
		const o: string[] = [];
		const nd = nguoiDung();
		for (const b of BANG) {
			const tab = await moBang(b, true, true);
			const chu = tab.textContent ?? "";
			for (const ten of b.dangDung)
				expect(`${b.ten}: ${chu.includes(ten)}`).toBe(`${b.ten}: true`);
			for (const c of b.daCat)
				chot(!chu.includes(c.ten), "lqc: dong gap mo san");
			const nut = nutGap(tab);
			chot(
				nut.length === 1,
				b.loai === "deal"
					? "lqc: bang thoa thuan khong co dong gap"
					: `lqc: ${b.ten} khong co dong gap`,
			);
			const gap = nut[0] as HTMLButtonElement;
			expect((gap.textContent ?? "").trim()).toBe(RS.archivedRows.toggle("2"));
			expect(gap.getAttribute("aria-expanded")).toBe("false");
			chot(dongCat(tab).length === 0, "lqc: dong gap mo san");

			await nd.click(gap);
			await nhip(3);
			expect(gap.getAttribute("aria-expanded")).toBe("true");
			const dong = dongCat(tab);
			expect(`${b.ten}: ${dong.length}`).toBe(`${b.ten}: 2`);
			for (const [i, c] of b.daCat.entries()) {
				const d = dong[i] as HTMLElement;
				expect((d.textContent ?? "").includes(c.ten)).toBe(true);
				expect((d.textContent ?? "").includes(RS.archivedRows.on)).toBe(true);
				expect(
					(d.textContent ?? "").includes(
						c.ngay === NGAY_1 ? "20/09/2026" : "10/09/2026",
					),
				).toBe(true);
				const thaoTac = [
					...d.querySelectorAll(
						"button, a, input, [role=button], [role=combobox], [aria-haspopup]",
					),
				].filter((el) => (el.textContent ?? "").trim() !== c.ten);
				chot(thaoTac.length === 0, "lqc: dong da cat con thao tac");
			}

			await nd.click(gap);
			await nhip(3);
			expect(dongCat(tab).length).toBe(0);
			o.push(b.ten);
			await dongHet();

			const tabSach = await moBang(b, true, false);
			expect(nutGap(tabSach).length).toBe(0);
			await dongHet();
		}
		expect(o.length).toBe(4);
	});
});

describe("lqc-mo-ngan", () => {
	test("bam ten ban da cat mo dung ngan cua no", async () => {
		const o: string[] = [];
		const nd = nguoiDung();
		for (const b of BANG) {
			const tab = await moBang(b, true, true);
			await nd.click(nutGap(tab)[0] as HTMLButtonElement);
			await nhip(3);
			const dau = b.daCat[0];
			if (!dau) throw new Error("thieu ban da cat");
			const nutTen = [
				...(dongCat(tab)[0]?.querySelectorAll("button") ?? []),
			].find((e) => (e.textContent ?? "").trim() === dau.ten);
			await nd.click(nutTen as HTMLButtonElement);
			await nhip(3);
			chot(
				(url.get("record") ?? "").split(",").at(-1) === `${b.kindMo}:${dau.id}`,
				"lqc: mo sai ngan",
			);
			o.push(b.ten);
			await dongHet();
		}
		expect(o.length).toBe(4);

		dat("deals.byId", () => thoaThuanGia({ id: "dc-1", archivedAt: NGAY_1 }));
		await moNgan("deal", "dc-1");
		await cho(
			() => document.querySelectorAll("[data-dai-luu-tru]").length === 1,
			"dai bao",
		);
	});
});

describe("lqc-so-dem", () => {
	test("so tren tab, so lieu dau ngan va nguoi tham gia chi dem ban dang dung", async () => {
		setSystemTime(new Date("2026-10-15T03:00:00Z"));
		dat("companies.byId", () =>
			congTyGia({
				deals: [
					thoaThuanTrongCongTy(
						"da-1",
						"Thoả thuận đang mở",
						100_000,
						"2026-12-01",
					),
				],
				archivedDeals: [thoaThuanCat("dc-1", "Thoả thuận cất", NGAY_1)],
				contacts: [caNhanTrongCongTy("ca-1", "An")],
				archivedContacts: [caNhanCat("cc-1", "Cúc", NGAY_1)],
			}),
		);
		await moNgan("company", "co-1");
		await cho(
			() => (document.body.textContent ?? "").includes(RS.company.openPipeline),
			"so lieu dau ngan",
		);

		const so = (nhan: string) =>
			[...document.querySelectorAll("dt")]
				.find((e) => (e.textContent ?? "").trim() === nhan)
				?.nextElementSibling?.textContent?.trim() ?? "";
		const soTab = (nhan: string) =>
			[...document.querySelectorAll('[role="tab"]')]
				.find((e) => (e.textContent ?? "").startsWith(nhan))
				?.textContent?.replace(nhan, "")
				.trim() ?? "";

		const giaTri = so(RS.company.openPipeline);
		chot(
			!giaTri.includes("10.000") && !giaTri.includes("10,000"),
			"lqc: so lieu dau ngan tinh ban da cat",
		);
		const chot12 = await ngayCuaApp("2026-12-01");
		const chot11 = await ngayCuaApp("2026-11-01");
		const o: [string, boolean][] = [
			["tab thoa thuan = 1", soTab(RS.tabs.deals) === "1"],
			["tab ca nhan = 1", soTab(RS.tabs.contacts) === "1"],
			[
				"gia tri dang mo 1.000",
				giaTri.includes("1.000") || giaTri.includes("1,000"),
			],
			["so thoa thuan dang mo = 1", so(RS.company.openDeals) === "1"],
			[
				"ngay chot gan nhat 01/12/2026",
				so(RS.company.nextClose) === chot12 && chot12 !== chot11,
			],
		];
		chot(soTab(RS.tabs.contacts) === "1", "lqc: so tab ca nhan dem ban da cat");
		await dongHet();

		dat("deals.byId", () =>
			thoaThuanGia({
				contacts: [caNhanTrenThoaThuan("ca-1", "An")],
				archivedContacts: [caNhanCat("cc-1", "Cúc", NGAY_1)],
			}),
		);
		await moNgan("deal", "d-1");
		await cho(
			() => (document.body.textContent ?? "").includes(RS.section.onIt),
			"nguoi tham gia",
		);
		const thamGia =
			[...document.querySelectorAll("span")].find(
				(e) => (e.textContent ?? "").trim() === RS.section.onIt,
			)?.nextElementSibling?.textContent ?? "";
		chot(thamGia.length > 0, "lqc: khong tim thay muc nguoi tham gia");
		o.push([
			"nguoi tham gia chi co nguoi dang dung",
			thamGia.includes("An") && !thamGia.includes("Cúc"),
		]);
		o.push(["tab ca nhan thoa thuan = 1", soTab(RS.tabs.contacts) === "1"]);
		for (const [ten, dung] of o) expect(`${ten}: ${dung}`).toBe(`${ten}: true`);
		expect(o.length).toBe(7);
	});
});

describe("lqc-chi-cat", () => {
	test("bang rong van hien o trong cu va dong gap ngay duoi", async () => {
		const o: string[] = [];
		const nd = nguoiDung();
		for (const b of BANG) {
			const tab = await moBang(b, false, true);
			chot(
				(tab.textContent ?? "").includes(b.chuRong),
				`lqc: ${b.ten} mat o trong cu`,
			);
			const nut = nutGap(tab);
			chot(nut.length === 1, "lqc: bang rong giau ban da cat");
			await nd.click(nut[0] as HTMLButtonElement);
			await nhip(3);
			expect(dongCat(tab).length).toBe(2);
			o.push(b.ten);
			await dongHet();
		}
		expect(o.length).toBe(4);
	});
});

async function chonMenu(nutChu: string, mucChu: string): Promise<void> {
	const nd = nguoiDung();
	const trigger = [
		...document.querySelectorAll<HTMLElement>('button[aria-haspopup="menu"]'),
	].find(
		(b) =>
			(b.textContent ?? "").includes(nutChu) ||
			b.getAttribute("aria-label") === nutChu,
	);
	if (!trigger) throw new Error(`khong co nut menu ${nutChu}`);
	await nd.click(trigger);
	await cho(
		() =>
			[...document.querySelectorAll("[role=menuitem]")].some(
				(e) => (e.textContent ?? "").trim() === mucChu,
			),
		`muc ${mucChu}`,
	);
	const muc = [
		...document.querySelectorAll<HTMLElement>("[role=menuitem]"),
	].find((e) => (e.textContent ?? "").trim() === mucChu);
	await nd.click(muc as HTMLElement);
	await nhip(3);
}

const chuHop = () =>
	document.querySelector('[role="alertdialog"]')?.textContent ?? "";

describe("lqc-xoa-vinh-vien", () => {
	test("loi bao xoa vinh vien dem ca ban da cat", async () => {
		const c = RS.company;
		const crm = crmMessages("vi");
		const o: [string, boolean][] = [];

		const congTy = async (archivedDeals: number, archivedContacts: number) => {
			dat("companies.byId", () =>
				congTyGia({
					archivedAt: NGAY_2,
					deals: [thoaThuanTrongCongTy("da-1", "Thoả thuận A")],
					archivedDeals: CAT_THOA.slice(0, archivedDeals).map((d) =>
						thoaThuanCat(d.id, d.ten, d.ngay),
					),
					contacts: [caNhanTrongCongTy("ca-1", "An")],
					archivedContacts: CAT_NGUOI.slice(0, archivedContacts).map((n) =>
						caNhanCat(n.id, "Cúc", n.ngay),
					),
				}),
			);
			await moNgan("company", "co-1");
			await chonMenu(
				crm.sheet.moreActions,
				crm.sheet.deleteForever(companyMessages("vi").noun),
			);
			await cho(() => chuHop().length > 0, "hop xoa vinh vien cong ty");
			const chu = chuHop();
			await dongHet();
			return chu;
		};

		const hai = await congTy(1, 1);
		chot(
			hai.includes(c.deleteDeals(c.manyDeals("2"))),
			"lqc: hop xoa vinh vien dem thieu",
		);
		o.push([
			"cong ty 2 thoa thuan 2 nguoi",
			hai.includes(c.deleteContacts(c.manyPeople("2"))),
		]);
		const mot = await congTy(0, 0);
		o.push([
			"doi chung cong ty 1 thoa thuan",
			mot.includes(c.deleteDeals(c.oneDeal)),
		]);

		const en = recordSheetMessages("en");
		const crmEn = crmMessages("en");
		const thoa = async (archivedContacts: number) => {
			dat("deals.byId", () =>
				thoaThuanGia({
					archivedAt: NGAY_2,
					contacts: [caNhanTrenThoaThuan("ca-1", "An")],
					archivedContacts: CAT_NGUOI.slice(0, archivedContacts).map((n) =>
						caNhanCat(n.id, "Cuc", n.ngay),
					),
				}),
			);
			await moNgan("deal", "d-1", { locale: "en" });
			await chonMenu(
				crmEn.sheet.moreActions,
				crmEn.sheet.deleteForever(dealMessages("en").noun),
			);
			await cho(() => chuHop().length > 0, "hop xoa vinh vien thoa thuan");
			const chu = chuHop();
			await dongHet();
			return chu;
		};
		const nhieu = await thoa(1);
		chot(
			nhieu.includes(en.deal.deleteWarning("Thép Hòa Phát", en.deal.people)),
			"lqc: loi bao xoa thoa thuan dem thieu",
		);
		o.push(["thoa thuan 2 nguoi", true]);
		const motNguoi = await thoa(0);
		o.push([
			"doi chung thoa thuan 1 nguoi",
			motNguoi.includes(en.deal.deleteWarning("Thép Hòa Phát", en.deal.person)),
		]);

		for (const [ten, dung] of o) expect(`${ten}: ${dung}`).toBe(`${ten}: true`);
		expect(o.length).toBe(4);
	});
});

describe("lqc-chu", () => {
	test("chu dong gap hai thu tieng", async () => {
		const vi = recordSheetMessages("vi").archivedRows;
		const en = recordSheetMessages("en").archivedRows;
		expect(vi.toggle("3")).toBe("+3 đã lưu trữ");
		expect(en.toggle("3")).toBe("+3 archived");
		expect(vi.on.startsWith("Đã lưu trữ ngày")).toBe(true);
		expect(en.on.startsWith("Archived on")).toBe(true);
		chot(
			!DAU_VIET.test(en.toggle("3")) && !DAU_VIET.test(en.on),
			"lqc: chu en co dau Viet",
		);

		const b = BANG[1] as Bang;
		const tab = await moBang(b, true, true, "en");
		const nut = nutGap(tab, "en")[0] as HTMLButtonElement;
		expect((nut.textContent ?? "").trim()).toBe("+2 archived");
		await nguoiDung().click(nut);
		await nhip(3);
		const dong = dongCat(tab)[0]?.textContent ?? "";
		expect(dong.includes("Archived on")).toBe(true);
	});
});

describe("lqc-ban-phim", () => {
	test("nut gap va ten dong da cat dung duoc bang ban phim", async () => {
		const nd = nguoiDung();
		const b = BANG[1] as Bang;
		const tab = await moBang(b, true, true);
		const gap = nutGap(tab)[0] as HTMLButtonElement;
		expect(gap.tagName).toBe("BUTTON");
		expect(gap.getAttribute("aria-expanded")).toBe("false");
		const chevron = gap.querySelector("svg");
		expect(chevron?.getAttribute("aria-hidden")).toBe("true");
		gap.focus();
		await nd.keyboard("{Enter}");
		await nhip(3);
		expect(gap.getAttribute("aria-expanded")).toBe("true");
		await nd.tab();
		const dau = b.daCat[0];
		const dangFocus = document.activeElement;
		chot(
			dangFocus?.tagName === "BUTTON" &&
				(dangFocus.textContent ?? "").trim() === dau?.ten,
			"lqc: ten dong da cat khong toi duoc bang ban phim",
		);
		await nd.keyboard("{Enter}");
		await nhip(3);
		expect((url.get("record") ?? "").split(",").at(-1)).toBe(`deal:${dau?.id}`);
	});
});

const nguoiDung = () => userEvent.setup({ document });
