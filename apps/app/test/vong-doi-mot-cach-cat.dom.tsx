import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
	QueryClient,
	QueryClientProvider,
	skipToken,
	useQuery,
} from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { NuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";

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

const goiCua = (duong: string) => daGoi.filter((g) => g.duong === duong);

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
const { formatCount } = await import("@crm/ui/lib/format");
const { crmMessages } = await import("@/lib/messages/crm");
const { contactMessages } = await import("@/lib/messages/contacts");
const { companyMessages } = await import("@/lib/messages/companies");
const { dealMessages } = await import("@/lib/messages/deals");
const { recordSheetMessages } = await import("@/lib/messages/record-sheet");
const { ContactsBulkActions } = await import(
	"@/app/(app)/[slug]/contacts/contacts-bulk-actions"
);
const { CompaniesBulkActions } = await import(
	"@/app/(app)/[slug]/companies/companies-bulk-actions"
);
const { DealsBulkActions } = await import(
	"@/app/(app)/[slug]/deals/deals-bulk-actions"
);
const { DealsTable } = await import("@/app/(app)/[slug]/deals/deals-table");
const { DetailSheet } = await import("@/components/detail-sheet");
const { ContactSheet } = await import(
	"@/components/crm/record-sheet/contact-sheet"
);
const { CompanySheet } = await import(
	"@/components/crm/record-sheet/company-sheet"
);
const { DealSheet } = await import("@/components/crm/record-sheet/deal-sheet");
const { RecordActions } = await import(
	"@/components/crm/record-sheet/record-actions"
);

type Locale = "vi" | "en";
type Loai = "contact" | "company" | "deal";

const THU_TUC = {
	contact: "contacts",
	company: "companies",
	deal: "deals",
} as const satisfies Record<Loai, string>;

const DAU_VIET = /[À-ỹ]/u;

function chot(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

function dem(loai: Loai, n: number, locale: Locale): string {
	if (loai === "contact")
		return formatCount(n, contactMessages(locale).noun, locale);
	if (loai === "company") {
		const m = companyMessages(locale);
		return formatCount(n, m.noun, locale, m.nounPlural);
	}
	return formatCount(n, dealMessages(locale).noun, locale);
}

const chuLuuTru = (loai: Loai, n: number, l: Locale) =>
	loai === "contact"
		? contactMessages(l).bulk.archived(dem(loai, n, l))
		: loai === "company"
			? companyMessages(l).bulk.archived(dem(loai, n, l))
			: dealMessages(l).bulk.archived(dem(loai, n, l));

const chuKhoiPhuc = (loai: Loai, n: number, l: Locale) =>
	loai === "contact"
		? contactMessages(l).bulk.restored(dem(loai, n, l))
		: loai === "company"
			? companyMessages(l).bulk.restored(dem(loai, n, l))
			: dealMessages(l).bulk.restored(dem(loai, n, l));

const GIAI_DOAN = [
	{ id: "g1", label: "Tiep can", kind: "OPEN", color: null, position: 0 },
	{ id: "g2", label: "Thang", kind: "WON", color: null, position: 1 },
];

const TRUONG = {
	id: "f1",
	key: "nguon",
	label: "Nguồn khách",
	type: "TEXT",
	showOnSheet: true,
	options: [],
	value: null,
};

function datNen(): void {
	dat("users.list", () => [
		{ id: "u-1", name: "Trần Minh Hải", email: "hai@onehub.vn", image: null },
	]);
	dat("giaiDoan.list", () => ({
		stages: GIAI_DOAN,
		canManage: false,
		tran: 0,
	}));
	dat("fields.filters", () => []);
	dat("fields.list", () => []);
	dat("savedViews.list", () => []);
	dat("companies.options", () => []);
	dat("onboarding.access", () => ({ canManage: false }));
	dat("onboarding.listTemplates", () => []);
	dat("onboarding.plansOfCompany", () => []);
	dat("onboarding.plansOfContact", () => []);
	dat("conversations.list", () => []);
	dat("conversations.events", () => []);
	for (const t of Object.values(THU_TUC))
		dat(`${t}.list`, () => ({ rows: [], total: 0, facetCounts: {} }));
}

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

async function mo(
	man: ReactElement,
	tuyChon: { searchParams?: string; locale?: Locale } = {},
): Promise<void> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	goc.push({ o, root });
	url = new URLSearchParams(tuyChon.searchParams ?? "");
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter
				hasMemory
				searchParams={tuyChon.searchParams ?? ""}
				onUrlUpdate={(e: UrlUpdateEvent) => {
					url = new URLSearchParams(e.queryString);
				}}
			>
				<QueryClientProvider client={client}>
					<LocaleProvider locale={tuyChon.locale ?? "vi"}>
						<TooltipProvider>
							<Toaster />
							{man}
						</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	await nhip(10);
}

const nguoiDung = () => userEvent.setup({ document });

function nutCo(chu: string, trong: ParentNode = document.body) {
	return (
		[...trong.querySelectorAll<HTMLButtonElement>("button")].find(
			(b) => (b.textContent ?? "").trim() === chu,
		) ?? null
	);
}

async function bamTro(el: Element | null | undefined): Promise<void> {
	if (!(el instanceof HTMLElement)) throw new Error("khong co phan tu de bam");
	await act(async () => {
		for (const loai of ["pointerdown", "mousedown", "pointerup", "click"])
			el.dispatchEvent(
				new window.PointerEvent(loai, {
					bubbles: true,
					cancelable: true,
					button: 0,
					pointerType: "mouse",
				}),
			);
	});
	await nhip(3);
}

async function chonMenu(nutChu: string, mucChu: string): Promise<void> {
	const trigger = [
		...document.querySelectorAll('button[aria-haspopup="menu"]'),
	].find((b) => (b.textContent ?? "").includes(nutChu));
	await bamTro(trigger);
	await cho(
		() =>
			[...document.querySelectorAll("[role=menuitem]")].some(
				(e) => (e.textContent ?? "").trim() === mucChu,
			),
		`muc ${mucChu}`,
	);
	const muc = [...document.querySelectorAll("[role=menuitem]")].find(
		(e) => (e.textContent ?? "").trim() === mucChu,
	);
	await bamTro(muc);
}

const vungToast = () =>
	document.querySelector("[data-sonner-toaster]")?.textContent ?? "";

function DanhSach({ loai }: { loai: Loai }) {
	const duong = `${THU_TUC[loai]}.list`;
	useQuery({
		queryKey: [duong, { archived: false }],
		queryFn: async () => {
			daGoi.push({ duong, vao: { archived: false } });
			return duLieu.get(duong)?.({ archived: false }) ?? null;
		},
	});
	return null;
}

function BangLoat({ loai, archived }: { loai: Loai; archived: boolean }) {
	const ids = ["a", "b", "c"];
	if (loai === "contact")
		return (
			<ContactsBulkActions ids={ids} onDone={() => {}} archived={archived} />
		);
	if (loai === "company")
		return (
			<CompaniesBulkActions ids={ids} onDone={() => {}} archived={archived} />
		);
	return <DealsBulkActions ids={ids} onDone={() => {}} archived={archived} />;
}

const LOAI: Loai[] = ["contact", "company", "deal"];

const VI = crmMessages("vi");
const NGAY_CAT = "2026-09-15T03:00:00.000Z";
const MO_TA = "__mo-ta__";
const MANG_MS = 200;

const caNhanGia = () => ({
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
	archivedAt: null as string | null,
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
});

const congTyGia = () => ({
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
	archivedAt: null as string | null,
	enrichedAt: null,
	primaryContactId: null,
	primaryContact: null,
	reportingCurrency: "VND",
	soKeHoach: 0,
	xuongCoKhuon: false,
	deals: [],
});

const thoaThuanGia = () => ({
	id: "d-1",
	name: "Hợp đồng thép quý 4",
	description: null,
	stage: "g1",
	currency: "VND",
	closedReason: null,
	company: { id: "co-1", name: "Thép Hòa Phát", domain: null, iconUrl: null },
	owner: {
		id: "u-1",
		name: "Trần Minh Hải",
		email: "hai@onehub.vn",
		image: null,
	},
	fields: [],
	amountCents: null,
	baseAmountCents: null,
	reportingCurrency: "VND",
	fxRate: null,
	fxRateAt: null,
	stageChangedAt: "2026-09-01T00:00:00.000Z",
	expectedCloseDate: null,
	closedAt: null,
	createdAt: "2026-09-01T00:00:00.000Z",
	archivedAt: null as string | null,
	contacts: [],
});

const RS = recordSheetMessages("vi");

type Ngan = {
	loai: Loai;
	thuTuc: string;
	duong: string;
	id: string;
	ten: string;
	danhTu: string;
	man: ReactElement;
	lay: () => object;
	oSua: string[];
};

const NGAN: Ngan[] = [
	{
		loai: "contact",
		thuTuc: "contacts",
		duong: "contacts.byId",
		id: "ct-1",
		ten: "Hà",
		danhTu: contactMessages("vi").noun,
		man: <ContactSheet contactId="ct-1" />,
		lay: caNhanGia,
		oSua: [
			RS.contact.fields.firstName,
			RS.contact.fields.email,
			VI.standard.company,
			RS.contact.fields.owner,
			TRUONG.label,
		],
	},
	{
		loai: "company",
		thuTuc: "companies",
		duong: "companies.byId",
		id: "co-1",
		ten: "Thép Hòa Phát",
		danhTu: companyMessages("vi").noun,
		man: <CompanySheet companyId="co-1" />,
		lay: congTyGia,
		oSua: [
			RS.company.fields.name,
			RS.company.fields.domain,
			RS.company.fields.owner,
			TRUONG.label,
		],
	},
	{
		loai: "deal",
		thuTuc: "deals",
		duong: "deals.byId",
		id: "d-1",
		ten: "Hợp đồng thép quý 4",
		danhTu: dealMessages("vi").noun,
		man: <DealSheet dealId="d-1" />,
		lay: thoaThuanGia,
		oSua: [
			RS.deal.fields.name,
			RS.deal.fields.amount,
			VI.standard.company,
			MO_TA,
			TRUONG.label,
			"__giai-doan__",
		],
	},
];

async function moNgan(n: Ngan, locale: Locale = "vi"): Promise<void> {
	await mo(
		<DetailSheet open onOpenChange={() => {}}>
			{n.man}
		</DetailSheet>,
		{ searchParams: `record=${n.loai}:${n.id}`, locale },
	);
}

async function dongHet(): Promise<void> {
	for (const g of goc) {
		await act(async () => g.root.unmount());
		g.o.remove();
	}
	goc = [];
	document.body.innerHTML = "";
}

const tabDangMo = () =>
	document.querySelector<HTMLElement>('[role="tabpanel"][data-state="active"]');

const CHON_SUA =
	'button, input, textarea, select, [role=combobox], [role=button], [contenteditable="true"], [tabindex]:not([tabindex="-1"])';
const FORM = "button, input, textarea, select";

type DemSua = { tong: number; bat: number; khongForm: number };

function demChoSua(): DemSua {
	const tab = tabDangMo();
	if (!tab) return { tong: 0, bat: 0, khongForm: 0 } satisfies DemSua;
	const tat = [...tab.querySelectorAll<HTMLElement>(CHON_SUA)].filter(
		(e) => e.closest("[data-dai-luu-tru]") === null,
	);
	const form = tat.filter((e) => e.matches(FORM));
	return {
		tong: tat.length,
		bat: form.filter((e) => !e.matches(":disabled")).length,
		khongForm: tat.length - form.length,
	};
}

function timO(nhan: string): HTMLElement | null {
	if (nhan === "__giai-doan__")
		return (
			document.querySelector<HTMLElement>("[data-giai-doan-tinh] button") ??
			document.querySelector<HTMLElement>("[data-giai-doan-tinh]")
		);
	const tab = tabDangMo();
	if (!tab) return null;
	if (nhan === MO_TA)
		return tab.querySelector<HTMLElement>(
			`[aria-label="${RS.deal.description}"]`,
		);
	const nhanEl = [...tab.querySelectorAll("label")].find(
		(l) => (l.textContent ?? "").trim() === nhan,
	);
	return (
		nhanEl?.parentElement?.querySelector<HTMLElement>(
			"button, input, textarea, [role=combobox]",
		) ?? null
	);
}

const soChoMo = () =>
	document.querySelectorAll(
		"input:not([type=hidden]), textarea, [role=listbox], [role=menu], [role=dialog]:not([data-slot=sheet-content]):not([data-slot=drawer-content])",
	).length;

const HAU_QUA = {
	deal: (l: Locale) => dealMessages(l).bulk.deleteWarning,
	contact: (l: Locale) => contactMessages(l).bulk.deleteWarning,
	company: (l: Locale) => crmMessages(l).bulk.cannotUndo,
} satisfies Record<Loai, (l: Locale) => string>;

const DANH_TU = {
	deal: (l: Locale) => dealMessages(l).noun,
	contact: (l: Locale) => contactMessages(l).noun,
	company: (l: Locale) => companyMessages(l).noun,
} satisfies Record<Loai, (l: Locale) => string>;

const NGAN_CHU: [Loai, Locale][] = [
	["contact", "vi"],
	["company", "vi"],
	["deal", "vi"],
	["contact", "en"],
	["company", "en"],
	["deal", "en"],
];

describe("vong-doi-mot-cach-cat", () => {
	test("vdc-hoan-tac-loat: luu tru hang loat co Hoan tac, khoi phuc dung id mot lan, danh sach lam moi", async () => {
		const c = crmMessages("vi");
		const o: string[] = [];
		for (const loai of LOAI) {
			for (const ket of ["du", "mot-phan"] as const) {
				daGoi = [];
				const t = THU_TUC[loai];
				dat(`${t}.bulkArchive`, () =>
					ket === "du"
						? { requested: 3, succeeded: 3, failed: 0, message: null }
						: { requested: 3, succeeded: 2, failed: 1, message: null },
				);
				dat(`${t}.bulkRestore`, () =>
					ket === "du"
						? { requested: 3, succeeded: 3, failed: 0, message: null }
						: {
								requested: 3,
								succeeded: 2,
								failed: 1,
								message: "loi-tho-khong-co-id",
							},
				);
				await mo(
					<>
						<DanhSach loai={loai} />
						<BangLoat loai={loai} archived={false} />
					</>,
				);
				await chonMenu(c.bulkMenu.actions, c.bulk.archive);
				await cho(() => goiCua(`${t}.bulkArchive`).length === 1, "goi luu tru");
				const ids = goiCua(`${t}.bulkArchive`)[0]?.vao as { ids: string[] };
				expect(JSON.stringify(ids.ids)).toBe('["a","b","c"]');
				const mong =
					ket === "du"
						? chuLuuTru(loai, 3, "vi")
						: c.bulkMenu.leftAlone(chuLuuTru(loai, 2, "vi"), "1", ".");
				await cho(() => vungToast().includes(mong), `${loai}/${ket} toast`);
				const hoanTac = nutCo(c.sheet.hoanTac);
				chot(hoanTac !== null, "vdc: luu tru loat khong co hoan tac");
				await nhip(10);
				const dsTruoc = goiCua(`${t}.list`).length;
				await act(async () => {
					(hoanTac as HTMLButtonElement).click();
					(hoanTac as HTMLButtonElement).click();
				});
				const soKhoiPhuc = ket === "du" ? 3 : 2;
				await cho(
					() =>
						vungToast().includes(chuKhoiPhuc(loai, soKhoiPhuc, "vi")) ||
						vungToast().includes("loi-tho-khong-co-id"),
					`${loai}/${ket} da khoi phuc`,
				);
				chot(
					!vungToast().includes("loi-tho-khong-co-id") &&
						document.querySelector("[data-sonner-toast][data-type=error]") ===
							null,
					"vdc: hoan tac mot phan bao loi tho",
				);
				expect(vungToast().includes(chuKhoiPhuc(loai, soKhoiPhuc, "vi"))).toBe(
					true,
				);
				const goiKhoiPhuc = goiCua(`${t}.bulkRestore`);
				const idKhoiPhuc = JSON.stringify(
					(goiKhoiPhuc[0]?.vao as { ids?: string[] } | undefined)?.ids ?? [],
				);
				chot(idKhoiPhuc === '["a","b","c"]', "vdc: hoan tac sai id");
				chot(goiKhoiPhuc.length === 1, "vdc: hoan tac goi hai lan");
				await nhip(10);
				chot(
					goiCua(`${t}.list`).length > dsTruoc,
					"vdc: hoan tac khong lam moi danh sach",
				);
				expect(goiKhoiPhuc.length).toBe(1);
				o.push(`${loai}/${ket}`);
				for (const g of goc) {
					await act(async () => g.root.unmount());
					g.o.remove();
				}
				goc = [];
				document.body.innerHTML = "";
			}
		}
		expect(o.length).toBe(6);
	});

	test("vdc-hoan-tac-loi: hoan tac hong bao ro, khong loi tho, ca ban en", async () => {
		const o: string[] = [];
		const ca: { loai: Loai; locale: Locale }[] = [
			{ loai: "contact", locale: "vi" },
			{ loai: "company", locale: "vi" },
			{ loai: "deal", locale: "vi" },
			{ loai: "contact", locale: "en" },
		];
		for (const { loai, locale } of ca) {
			const c = crmMessages(locale);
			const t = THU_TUC[loai];
			dat(`${t}.bulkArchive`, () => ({
				requested: 3,
				succeeded: 3,
				failed: 0,
				message: null,
			}));
			dat(`${t}.bulkRestore`, () => {
				throw new Error("loi-tho-may-chu");
			});
			await mo(<BangLoat loai={loai} archived={false} />, { locale });
			await chonMenu(c.bulkMenu.actions, c.bulk.archive);
			await cho(() => nutCo(c.sheet.hoanTac) !== null, `${loai} hoan tac`);
			await act(async () =>
				nguoiDung().click(nutCo(c.sheet.hoanTac) as HTMLButtonElement),
			);
			await cho(
				() =>
					vungToast().includes(c.bulk.hoanTacLoi) ||
					vungToast().includes("loi-tho-may-chu"),
				`${loai}/${locale} bao loi`,
			);
			chot(
				!vungToast().includes("loi-tho-may-chu"),
				"vdc: hoan tac loi in loi tho",
			);
			expect(vungToast().includes(c.bulk.hoanTacLoi)).toBe(true);
			if (locale === "en") expect(DAU_VIET.test(c.bulk.hoanTacLoi)).toBe(false);
			if (locale === "vi") o.push(loai);
			for (const g of goc) {
				await act(async () => g.root.unmount());
				g.o.remove();
			}
			goc = [];
			document.body.innerHTML = "";
		}
		expect(o.length).toBe(3);
	});

	test("vdc-dai-bao: ngan da luu tru co dai bao, Khoi phuc goi dung mot lan, dai mat va o bat lai", async () => {
		const o: string[] = [];
		for (const n of NGAN) {
			for (const daCat of [true, false]) {
				let conCat = daCat;
				dat(n.duong, () => ({
					...n.lay(),
					fields: [TRUONG],
					archivedAt: conCat ? NGAY_CAT : null,
				}));
				dat(`${n.thuTuc}.restore`, () => {
					conCat = false;
					return { id: n.id, name: n.ten };
				});
				await moNgan(n);
				if (!daCat) {
					await cho(
						() => (tabDangMo()?.textContent ?? "").includes(n.ten),
						`${n.loai} da tai ban ghi`,
					);
					await nhip(5);
					expect(document.querySelector("[data-dai-luu-tru]") === null).toBe(
						true,
					);
					o.push(`${n.loai}/dang-dung`);
					await dongHet();
					continue;
				}
				await cho(
					() => document.querySelector("[data-dai-luu-tru]") !== null,
					`${n.loai} dai bao`,
				).catch(() => null);
				const dai = document.querySelector("[data-dai-luu-tru]") as Element;
				chot(dai !== null, "vdc: ngan da cat khong bao");
				expect((dai.textContent ?? "").includes(VI.sheet.daLuuTruNgay)).toBe(
					true,
				);
				await cho(
					() => (dai.textContent ?? "").includes("15/09/2026"),
					`${n.loai} ngay luu tru`,
				);
				const docTruoc = goiCua(n.duong).length;
				const nut = nutCo(VI.bulk.restore, dai);
				expect(nut === null).toBe(false);
				await act(async () => nguoiDung().click(nut as HTMLButtonElement));
				await nhip(5);
				chot(
					goiCua(`${n.thuTuc}.archive`).length === 0,
					"vdc: dai bao goi sai lenh",
				);
				await cho(
					() => goiCua(`${n.thuTuc}.restore`).length >= 1,
					`${n.loai} goi khoi phuc`,
				);
				const vao = goiCua(`${n.thuTuc}.restore`)[0]?.vao as { id?: string };
				expect(vao.id).toBe(n.id);
				await cho(
					() => document.querySelector("[data-dai-luu-tru]") === null,
					`${n.loai} dai mat`,
				);
				await nhip(10);
				chot(
					goiCua(n.duong).length > docTruoc && demChoSua().bat > 0,
					"vdc: khoi phuc xong o van khoa",
				);
				expect(goiCua(`${n.thuTuc}.restore`).length).toBe(1);
				o.push(`${n.loai}/da-cat`);
				await dongHet();
			}
		}
		expect(o.length).toBe(6);

		dat("contacts.byId", () => ({ ...caNhanGia(), archivedAt: NGAY_CAT }));
		await moNgan(NGAN[0] as Ngan, "en");
		await cho(
			() => document.querySelector("[data-dai-luu-tru]") !== null,
			"dai bao en",
		);
		const chuEn =
			document.querySelector("[data-dai-luu-tru]")?.textContent ?? "";
		expect(chuEn.includes(crmMessages("en").sheet.daLuuTruNgay)).toBe(true);
		expect(DAU_VIET.test(chuEn)).toBe(false);
	});

	test("vdc-chi-doc: ngan da luu tru tat moi cho sua trong tab chi tiet, menu van mo", async () => {
		const ngan: string[] = [];
		const o: string[] = [];
		for (const n of NGAN) {
			dat(n.duong, () => ({
				...n.lay(),
				fields: [TRUONG],
				archivedAt: NGAY_CAT,
			}));
			await moNgan(n);
			await cho(() => tabDangMo() !== null, `${n.loai} tab`);
			await nhip(10);
			const capNhatTruoc = goiCua(`${n.thuTuc}.update`).length;
			for (const nhan of n.oSua) {
				const oSua = timO(nhan);
				chot(
					oSua !== null,
					nhan === MO_TA
						? "vdc: mo ta ban da cat van sua duoc"
						: `vdc: khong thay o ${nhan}`,
				);
				const moTruoc = soChoMo();
				await act(async () => {
					await nguoiDung()
						.click(oSua as HTMLElement)
						.catch(() => null);
				});
				await nhip(3);
				chot(
					soChoMo() === moTruoc,
					nhan === MO_TA
						? "vdc: mo ta ban da cat van sua duoc"
						: "vdc: ngan da cat van sua duoc",
				);
				o.push(`${n.loai}/${nhan}`);
			}
			const d = demChoSua();
			chot(d.tong > 0, `vdc: ${n.loai} khong dem duoc cho sua`);
			chot(d.bat === 0 && d.khongForm === 0, "vdc: ngan da cat van sua duoc");
			expect(goiCua(`${n.thuTuc}.update`).length - capNhatTruoc).toBe(0);
			const menu = [
				...document.querySelectorAll('button[aria-haspopup="menu"]'),
			].find((b) => (b.textContent ?? "").includes(VI.sheet.moreActions));
			chot(
				menu instanceof HTMLButtonElement && !menu.matches(":disabled"),
				"vdc: khoa ca khoi phuc",
			);
			await bamTro(menu);
			await cho(
				() =>
					[...document.querySelectorAll("[role=menuitem]")].some((e) =>
						(e.textContent ?? "").includes(VI.sheet.restore(n.danhTu)),
					),
				`${n.loai} menu khoi phuc`,
			);
			const chuMenu = [...document.querySelectorAll("[role=menuitem]")]
				.map((e) => e.textContent ?? "")
				.join("|");
			expect(chuMenu.includes(VI.sheet.deleteForever(n.danhTu))).toBe(true);
			await dongHet();

			dat(n.duong, () => ({ ...n.lay(), fields: [TRUONG], archivedAt: null }));
			await moNgan(n);
			await cho(() => tabDangMo() !== null, `${n.loai} tab dang dung`);
			await nhip(10);
			expect(demChoSua().bat > 0).toBe(true);
			if (n.loai === "deal") {
				const truocMenu = soChoMo();
				const giaiDoan = [
					...document.querySelectorAll('button[aria-haspopup="menu"]'),
				].find((b) => !(b.textContent ?? "").includes(VI.sheet.moreActions));
				await bamTro(giaiDoan);
				await cho(
					() => soChoMo() > truocMenu,
					"menu giai doan mo tren thoa thuan dang dung",
				);
				expect(document.querySelector("[role=menu]") === null).toBe(false);
			}
			ngan.push(n.loai);
			await dongHet();
		}
		expect(o.length).toBe(15);
		expect(ngan.length).toBe(3);
	});

	test("vdc-kanban: Kanban co nut Da luu tru, bam sang bang da luu tru, bam lai ve Kanban", async () => {
		const m = dealMessages("vi");
		await mo(<DealsTable />, { searchParams: "view=board" });
		await cho(() => nutCo(m.archivedToggle) !== null, "nut kanban").catch(
			() => null,
		);
		const nut = nutCo(m.archivedToggle);
		chot(nut !== null, "vdc: kanban khong co da luu tru");
		const bangTruoc = goiCua("deals.board").length;
		expect(bangTruoc > 0).toBe(true);
		await act(async () => nguoiDung().click(nut as HTMLButtonElement));
		await nhip(10);
		expect(url.get("archived")).toBe("true");
		expect(url.get("view")).toBe("board");
		await cho(
			() =>
				goiCua("deals.list").some(
					(g) => (g.vao as { archived?: boolean })?.archived === true,
				),
			"danh sach da luu tru",
		);
		const dangChon = nutCo(m.archivedToggle);
		expect(dangChon?.getAttribute("aria-pressed")).toBe("true");
		const bangGiua = goiCua("deals.board").length;
		await act(async () => nguoiDung().click(dangChon as HTMLButtonElement));
		await nhip(10);
		expect(url.get("archived")).toBe(null);
		await cho(() => goiCua("deals.board").length > bangGiua, "ve kanban");
		expect(nutCo(m.archivedToggle)?.getAttribute("aria-pressed")).toBe("false");
		await dongHet();

		await mo(<DealsTable />, { searchParams: "view=table" });
		await cho(() => nutCo(m.archivedToggle) !== null, "nut dang bang");
		expect(nutCo(m.archivedToggle) === null).toBe(false);
	});

	test("vdc-chu: bo chu Da luu tru, Xoa vinh vien, khong an; hop xoa vinh vien bam hai lan chi xoa mot lan", async () => {
		for (const [ten, chu] of [
			["deals", dealMessages],
			["contacts", contactMessages],
			["companies", companyMessages],
		] as const) {
			expect(`${ten}:${chu("vi").archivedToggle}`).toBe(`${ten}:Đã lưu trữ`);
			expect(`${ten}:${chu("en").archivedToggle}`).toBe(`${ten}:Archived`);
		}
		const truongVi = `${VI.fields.archivedNote} ${VI.fields.archiveBody}`;
		const truongEn = `${crmMessages("en").fields.archivedNote} ${crmMessages("en").fields.archiveBody}`;
		expect(/ẩn/iu.test(truongVi)).toBe(false);
		expect(/hidden/i.test(truongEn)).toBe(false);
		expect(VI.fields.archivedNote).toBe("giữ giá trị, cất khỏi mọi nơi");
		expect(crmMessages("en").fields.archivedNote).toBe(
			"values kept, removed from every view",
		);

		const o: string[] = [];
		for (const locale of ["vi", "en"] as const) {
			const c = crmMessages(locale);
			for (const loai of LOAI) {
				const t = THU_TUC[loai];
				dat(
					`${t}.bulkPurge`,
					() =>
						new Promise((xong) =>
							setTimeout(
								() =>
									xong({
										requested: 3,
										succeeded: 3,
										failed: 0,
										message: null,
									}),
								MANG_MS,
							),
						),
				);
				await mo(<BangLoat loai={loai} archived />, { locale });
				await chonMenu(c.bulkMenu.actions, c.bulk.deleteForever);
				await cho(
					() => document.querySelector("[role=alertdialog]") !== null,
					`${loai} hop xoa`,
				);
				const hop = document.querySelector("[role=alertdialog]") as Element;
				const chuNut = locale === "vi" ? "Xoá vĩnh viễn" : "Delete forever";
				const xacNhan = nutCo(chuNut, hop);
				chot(xacNhan !== null, "vdc: hop xoa vinh vien ghi Xoa tran");
				expect((hop.textContent ?? "").includes(HAU_QUA[loai](locale))).toBe(
					true,
				);
				const truoc = goiCua(`${t}.bulkPurge`).length;
				await act(async () => (xacNhan as HTMLButtonElement).click());
				await nhip(1);
				await act(async () => (xacNhan as HTMLButtonElement).click());
				await nhip(10);
				chot(
					goiCua(`${t}.bulkPurge`).length - truoc === 1,
					"vdc: xoa vinh vien goi hai lan",
				);
				o.push(`loat/${locale}/${loai}`);
				await dongHet();
			}
		}
		for (const [loai, locale] of NGAN_CHU) {
			const c = crmMessages(locale);
			const t = THU_TUC[loai];
			dat(
				`${t}.purge`,
				() =>
					new Promise((xong) =>
						setTimeout(() => xong({ id: "r1", name: "Hà" }), MANG_MS),
					),
			);
			await mo(
				<RecordActions
					record={{ kind: loai, id: "r1" }}
					name="Hà"
					consequence="⟦hau qua⟧"
					archivedAt={NGAY_CAT}
				/>,
				{ locale },
			);
			const danhTu = DANH_TU[loai](locale);
			await chonMenu(c.sheet.moreActions, c.sheet.deleteForever(danhTu));
			await cho(
				() => document.querySelector("[role=alertdialog]") !== null,
				`${loai} hop xoa ngan`,
			);
			const hop = document.querySelector("[role=alertdialog]") as Element;
			expect((hop.textContent ?? "").includes("⟦hau qua⟧")).toBe(true);
			const xacNhan = nutCo(
				locale === "vi" ? "Xoá vĩnh viễn" : "Delete forever",
				hop,
			);
			chot(xacNhan !== null, "vdc: hop xoa vinh vien ghi Xoa tran");
			const truoc = goiCua(`${t}.purge`).length;
			await act(async () => (xacNhan as HTMLButtonElement).click());
			await nhip(1);
			await act(async () => (xacNhan as HTMLButtonElement).click());
			await nhip(10);
			chot(
				goiCua(`${t}.purge`).length - truoc === 1,
				"vdc: xoa vinh vien goi hai lan",
			);
			o.push(`ngan/${locale}/${loai}`);
			await dongHet();
		}
		expect(o.length).toBe(12);
	});
});
