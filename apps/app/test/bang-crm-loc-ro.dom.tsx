import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
	QueryClient,
	QueryClientProvider,
	skipToken,
} from "@tanstack/react-query";
import { NuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { RouterOutputs } from "@/lib/trpc/types";

type DauVao = Record<string, unknown> | undefined;
type LoiGoi = { duong: string; dauVao: DauVao };
type Lay = (dauVao: DauVao) => unknown;

let daGoi: LoiGoi[] = [];
const duLieu = new Map<string, Lay>();

function dat(duong: string, lay: Lay): void {
	duLieu.set(duong, lay);
}

function thuTuc(duong: string) {
	const doc = async (v: DauVao): Promise<unknown> => {
		daGoi.push({ duong, dauVao: v });
		const lay = duLieu.get(duong);
		return lay ? lay(v) : null;
	};
	return {
		queryKey: (v?: DauVao) => (v === undefined ? [duong] : [duong, v]),
		pathKey: () => [duong],
		queryOptions: (
			v?: DauVao | typeof skipToken,
			chon?: { enabled?: boolean },
		) =>
			v === skipToken
				? { queryKey: [duong, "skip"], queryFn: skipToken }
				: { ...chon, queryKey: [duong, v], queryFn: async () => doc(v) },
		mutationOptions: (chon?: object) => ({
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
	useCrmCache: () => new Proxy({}, { get: () => async () => {} }),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws",
}));

const { ContactsTable } = await import(
	"@/app/(app)/[slug]/contacts/contacts-table"
);
const { CompaniesTable } = await import(
	"@/app/(app)/[slug]/companies/companies-table"
);
const { DealsTable } = await import("@/app/(app)/[slug]/deals/deals-table");
const { MembersTable } = await import(
	"@/app/(app)/[slug]/settings/members/members-table"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { messages } = await import("@crm/ui/lib/messages");
const { contactMessages } = await import("@/lib/messages/contacts");
const { companyMessages } = await import("@/lib/messages/companies");
const { dealMessages } = await import("@/lib/messages/deals");
const { thanhVienMessages } = await import("@/lib/messages/settings-thanh-vien");
const { activityFacetOptions } = await import("@/lib/activity-recency");
const { enrichmentFacetOptions } = await import("@/lib/enrichment-status");
const { closingOptions } = await import("@/components/crm/closing-window");

type Locale = "vi" | "en";
type DemMat = RouterOutputs["contacts"]["list"]["facetCounts"];

const ui = messages("vi").table;

const NGUOI = [
	{ id: "u1", name: "An Nguyen", email: "an@thu.test", image: null },
	{ id: "u2", name: "Binh Tran", email: "binh@thu.test", image: null },
];

const TRUONG = [
	{
		key: "k1",
		label: "Nguon khach",
		type: "SELECT",
		options: [
			{ id: "o1", label: "Hoi cho" },
			{ id: "o2", label: "Gioi thieu" },
		],
	},
	{
		key: "k2",
		label: "Khu vuc",
		type: "SELECT",
		options: [
			{ id: "o3", label: "Mien Bac" },
			{ id: "o4", label: "Mien Nam" },
		],
	},
];

const CONG_TY = [
	{ id: "c1", name: "Dat Xanh" },
	{ id: "c2", name: "Song Hong" },
];

const GIAI_DOAN = [
	{ id: "g1", label: "Tiep can", kind: "OPEN", color: null, position: 0 },
	{ id: "g2", label: "Dam phan", kind: "OPEN", color: null, position: 1 },
	{ id: "g3", label: "Thang", kind: "WON", color: null, position: 2 },
];

let dem: DemMat = {};

function datChung(): void {
	dat("users.list", () => NGUOI);
	dat("fields.filters", () => TRUONG);
	dat("fields.list", () => []);
	dat("savedViews.list", () => []);
	dat("companies.options", () => CONG_TY);
	dat("giaiDoan.list", () => ({ stages: GIAI_DOAN, canManage: false, tran: 0 }));
	dat("contacts.list", () => ({ rows: [], total: 0, facetCounts: dem }));
	dat("companies.list", () => ({ rows: [], total: 0, facetCounts: dem }));
	dat("deals.list", () => ({ rows: [], total: 0, facetCounts: dem }));
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
	dat("workspace.members", () => ({ rows: [], total: 0, facetCounts: dem }));
	dat("onboarding.access", () => ({ canManage: false }));
}

let root: Root | null = null;
let khung: HTMLElement | null = null;
let url: URLSearchParams = new URLSearchParams();

beforeEach(() => {
	daGoi = [];
	duLieu.clear();
	dem = {};
	url = new URLSearchParams();
	datChung();
});

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

async function cho(): Promise<void> {
	for (let i = 0; i < 5; i += 1) {
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
}

async function mo(
	man: ReactElement,
	searchParams = "",
	locale: Locale = "vi",
): Promise<HTMLElement> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	khung = o;
	root = createRoot(o);
	url = new URLSearchParams(searchParams);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root?.render(
			<NuqsTestingAdapter
				hasMemory
				searchParams={searchParams}
				onUrlUpdate={(e: UrlUpdateEvent) => {
					url = new URLSearchParams(e.queryString);
				}}
			>
				<QueryClientProvider client={client}>
					<LocaleProvider locale={locale}>
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	await cho();
	return o;
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
}

function nutMenu(chu: string): HTMLElement | undefined {
	return [...document.body.querySelectorAll('button[aria-haspopup="menu"]')].find(
		(b): b is HTMLElement =>
			b instanceof HTMLElement && (b.textContent ?? "").includes(chu),
	);
}

async function moMenuCon(nhan: string): Promise<HTMLElement> {
	await bamTro(nutMenu(ui.filters));
	const trig = [
		...document.body.querySelectorAll('[data-slot="dropdown-menu-sub-trigger"]'),
	].find(
		(el): el is HTMLElement =>
			el instanceof HTMLElement && (el.textContent ?? "").includes(nhan),
	);
	if (!trig) throw new Error(`khong thay tieu chi ${nhan}`);
	await act(async () => trig.click());
	await cho();
	const noi = document.body.querySelector(
		'[data-slot="dropdown-menu-sub-content"]',
	);
	if (!(noi instanceof HTMLElement)) throw new Error(`tieu chi ${nhan} khong mo`);
	return noi;
}

function mucLuaChon(noi: HTMLElement): HTMLElement[] {
	return [
		...noi.querySelectorAll<HTMLElement>('[role="menuitemcheckbox"], [role="option"]'),
	].filter((el) => (el.textContent ?? "").trim() !== ui.clearFilters);
}

function soCua(muc: HTMLElement): string | null {
	return muc.querySelector('[data-slot="facet-count"]')?.textContent ?? null;
}

function cuoiCung(duong: string, loc: (v: DauVao) => boolean = () => true): DauVao {
	return daGoi.filter((g) => g.duong === duong && loc(g.dauVao)).at(-1)?.dauVao;
}

const FIELDS_HAI = encodeURIComponent(JSON.stringify({ k1: ["o1"], k2: ["o3"] }));

type BangBoLoc = {
	ten: string;
	man: () => ReactElement;
	list: string;
	url: string;
	sort: string;
	coFields: boolean;
	coArchived: boolean;
	tieuChi: string;
	trangThai?: string;
};

const BANG_BO_LOC: BangBoLoc[] = [
	{
		ten: "ca-nhan",
		man: () => <ContactsTable />,
		list: "contacts.list",
		url: `q=abc&owner=u1&fields=${FIELDS_HAI}&archived=true&sort=name&dir=desc&page=3`,
		sort: "name",
		coFields: true,
		coArchived: true,
		tieuChi: "owner",
	},
	{
		ten: "cong-ty",
		man: () => <CompaniesTable />,
		list: "companies.list",
		url: `q=abc&owner=u1&fields=${FIELDS_HAI}&archived=true&sort=name&dir=desc&page=3`,
		sort: "name",
		coFields: true,
		coArchived: true,
		tieuChi: "owner",
	},
	{
		ten: "thoa-thuan",
		man: () => <DealsTable />,
		list: "deals.list",
		url: `q=abc&owner=u1&fields=${FIELDS_HAI}&status=closed&archived=true&sort=name&dir=desc&page=3`,
		sort: "name",
		coFields: true,
		coArchived: true,
		tieuChi: "owner",
		trangThai: "status",
	},
	{
		ten: "thanh-vien",
		man: () => <MembersTable />,
		list: "workspace.members",
		url: "q=abc&role=member&sort=name&dir=desc&page=3",
		sort: "name",
		coFields: false,
		coArchived: false,
		tieuChi: "role",
	},
];

function nutBoLoc(): HTMLElement[] {
	return [...document.body.querySelectorAll<HTMLElement>("button")].filter(
		(b) => (b.textContent ?? "").trim() === ui.resetFilters,
	);
}

function fieldsCon(): string[] {
	const tho = url.get("fields");
	if (!tho) return [];
	return Object.keys(JSON.parse(tho) as Record<string, string[]>);
}

describe("bo-loc", () => {
	for (const bang of BANG_BO_LOC) {
		test(`${bang.ten}: mot lan bam Bo loc xoa tieu chi, truong tuy chinh, trang thai, tim kiem; giu luu tru va sap xep`, async () => {
			await mo(bang.man(), bang.url);
			const nut = nutBoLoc();
			expect(nut.length).toBe(1);
			await act(async () => nut[0]?.click());
			await cho();
			const dauVao = cuoiCung(bang.list, (v) => v?.sort === bang.sort);
			const ketQua = {
				q: url.get("q"),
				tieuChi: url.getAll(bang.tieuChi),
				fields: fieldsCon().length === 0 ? "rong" : `fields con ${fieldsCon().join(",")}`,
				trangThai: bang.trangThai ? (url.get(bang.trangThai) ?? "all") : "all",
				page: url.get("page") ?? "1",
				archived: url.get("archived"),
				dauVao: {
					sort: dauVao?.sort,
					dir: dauVao?.dir,
					q: dauVao?.q,
					tieuChi: dauVao?.[bang.tieuChi],
					fields: dauVao?.fields ?? {},
					archived: dauVao?.archived ?? false,
				},
			};
			expect(ketQua).toEqual({
				q: null,
				tieuChi: [],
				fields: "rong",
				trangThai: "all",
				page: "1",
				archived: bang.coArchived ? "true" : null,
				dauVao: {
					sort: bang.sort,
					dir: "desc",
					q: "",
					tieuChi: [],
					fields: {},
					archived: bang.coArchived,
				},
			});
		});
	}
});

type O = { bang: string; man: () => ReactElement; nhan: string; nguon: number };

function maTranSo0(): O[] {
	const c = contactMessages("vi");
	const co = companyMessages("vi");
	const d = dealMessages("vi");
	const t = thanhVienMessages("vi");
	const k1 = TRUONG[0]?.label ?? "";
	const soTruong = TRUONG[0]?.options.length ?? 0;
	return [
		{ bang: "ca-nhan", man: () => <ContactsTable />, nhan: c.facets.owner, nguon: NGUOI.length + 1 },
		{ bang: "ca-nhan", man: () => <ContactsTable />, nhan: c.facets.company, nguon: CONG_TY.length + 1 },
		{ bang: "ca-nhan", man: () => <ContactsTable />, nhan: c.facets.activity, nguon: activityFacetOptions("vi").length },
		{ bang: "ca-nhan", man: () => <ContactsTable />, nhan: k1, nguon: soTruong },
		{ bang: "cong-ty", man: () => <CompaniesTable />, nhan: co.facets.owner, nguon: NGUOI.length + 1 },
		{ bang: "cong-ty", man: () => <CompaniesTable />, nhan: co.facets.enrichment, nguon: enrichmentFacetOptions("vi").length },
		{ bang: "cong-ty", man: () => <CompaniesTable />, nhan: co.facets.activity, nguon: activityFacetOptions("vi").length },
		{ bang: "cong-ty", man: () => <CompaniesTable />, nhan: k1, nguon: soTruong },
		{ bang: "thoa-thuan", man: () => <DealsTable />, nhan: d.facets.owner, nguon: NGUOI.length },
		{ bang: "thoa-thuan", man: () => <DealsTable />, nhan: d.facets.stage, nguon: GIAI_DOAN.length },
		{ bang: "thoa-thuan", man: () => <DealsTable />, nhan: d.facets.closing, nguon: closingOptions("vi").length },
		{ bang: "thoa-thuan", man: () => <DealsTable />, nhan: k1, nguon: soTruong },
		{ bang: "thanh-vien", man: () => <MembersTable />, nhan: t.bang.vaiTro, nguon: Object.keys(t.vaiTro).length },
	];
}

const MOT_GIA_TRI: DemMat = {
	owner: { u1: 3 },
	company: { c1: 2 },
	activity: { week: 1 },
	enrichment: { ENRICHED: 1 },
	stage: { g1: 4 },
	closing: { overdue: 1 },
	role: { owner: 1 },
	"field:k1": { o1: 2 },
	"field:k2": { o3: 1 },
};

describe("so-0", () => {
	const MA_TRAN = maTranSo0();
	test(`ma tran ${MA_TRAN.length} o bang x tieu chi: du moi lua chon nguon, co lua chon mang so 0`, async () => {
		const ketQua: Record<string, string> = {};
		const mong: Record<string, string> = {};
		for (const o of MA_TRAN) {
			dem = MOT_GIA_TRI;
			const ten = `${o.bang}/${o.nhan}`;
			mong[ten] = `${o.nguon} muc, co so 0`;
			await mo(o.man());
			const muc = mucLuaChon(await moMenuCon(o.nhan));
			const coSo0 = muc.some((m) => soCua(m) === "0");
			ketQua[ten] = `${muc.length} muc, ${coSo0 ? "co" : "thieu"} so 0`;
			act(() => root?.unmount());
			khung?.remove();
			document.body.innerHTML = "";
			root = null;
			khung = null;
		}
		expect(ketQua).toEqual(mong);
		expect(Object.keys(ketQua).length).toBe(13);
	});

	const TU_DO = [
		{ bang: "ca-nhan", man: () => <ContactsTable />, mat: "title", nhan: contactMessages("vi").facets.title },
		{ bang: "ca-nhan", man: () => <ContactsTable />, mat: "seniority", nhan: contactMessages("vi").facets.seniority },
		{ bang: "ca-nhan", man: () => <ContactsTable />, mat: "persona", nhan: contactMessages("vi").facets.persona },
		{ bang: "cong-ty", man: () => <CompaniesTable />, mat: "industry", nhan: companyMessages("vi").facets.industry },
	];

	test("tu-do: lua chon dang chon khong con trong dem van hien, kem so 0", async () => {
		const ketQua: Record<string, string | null> = {};
		for (const o of TU_DO) {
			dem = { [o.mat]: { KHAC: 2 } };
			await mo(o.man(), `${o.mat}=GHIM`);
			const muc = mucLuaChon(await moMenuCon(o.nhan)).find((m) =>
				(m.textContent ?? "").includes("GHIM"),
			);
			ketQua[`${o.bang}/${o.mat}`] = muc ? soCua(muc) : "GHIM vang";
			act(() => root?.unmount());
			khung?.remove();
			document.body.innerHTML = "";
			root = null;
			khung = null;
		}
		expect(ketQua).toEqual(
			Object.fromEntries(TU_DO.map((o) => [`${o.bang}/${o.mat}`, "0"])),
		);
	});

	test("kanban: menu Loc cua Kanban thoa thuan in so", async () => {
		dem = MOT_GIA_TRI;
		await mo(<DealsTable />, "view=board");
		const muc = mucLuaChon(await moMenuCon(dealMessages("vi").facets.owner));
		expect(muc.map(soCua)).toEqual(["3", "0"]);
	});
});

const BANG_RONG = [
	{ ten: "thoa-thuan", man: () => <DealsTable />, chu: (l: Locale) => dealMessages(l) },
	{ ten: "ca-nhan", man: () => <ContactsTable />, chu: (l: Locale) => contactMessages(l) },
	{ ten: "cong-ty", man: () => <CompaniesTable />, chu: (l: Locale) => companyMessages(l) },
];

const CAU_RONG: Record<string, Record<Locale, string>> = {
	"thoa-thuan": { vi: "Chưa có thoả thuận nào.", en: "No deals yet." },
	"ca-nhan": { vi: "Chưa có cá nhân nào.", en: "No contacts yet." },
	"cong-ty": { vi: "Chưa có công ty nào.", en: "No companies yet." },
};

describe("khong-loc", () => {
	test("12 o: khong loc thi hien cau cua man, khong noi bo loc; luu tru giu cau cu", async () => {
		const ketQua: Record<string, string> = {};
		const mong: Record<string, string> = {};
		for (const bang of BANG_RONG) {
			for (const locale of ["vi", "en"] as const) {
				for (const cheDo of ["thuong", "luu-tru"] as const) {
					const ten = `${bang.ten}/${cheDo}/${locale}`;
					const cauMan =
						cheDo === "thuong" ? CAU_RONG[bang.ten]?.[locale] : bang.chu(locale).emptyArchived;
					mong[ten] = `hien: ${cauMan}`;
					const o = await mo(bang.man(), cheDo === "luu-tru" ? "archived=true" : "", locale);
					const chu = o.textContent ?? "";
					const noMatch = messages(locale).table.noMatch;
					ketQua[ten] =
						cauMan && chu.includes(cauMan) && !chu.includes(noMatch)
							? `hien: ${cauMan}`
							: chu.includes(noMatch)
								? "khong loc thi hien cau cua man — lai hien noMatch"
								: "thieu cau cua man";
					act(() => root?.unmount());
					khung?.remove();
					document.body.innerHTML = "";
					root = null;
					khung = null;
				}
			}
		}
		expect(ketQua).toEqual(mong);
		expect(Object.keys(ketQua).length).toBe(12);
	});

	test("chu ba man: en khac vi, en khong co dau, vi khong noi bo loc", () => {
		const ketQua: Record<string, string> = {};
		for (const bang of BANG_RONG) {
			const v = bang.chu("vi").empty;
			const e = bang.chu("en").empty;
			const loi = [
				v === e ? "en trung vi" : null,
				/[À-ỹ]/.test(e) ? `en lot chu Viet: ${bang.ten}.empty` : null,
				/bộ lọc|filter|match/i.test(`${v} ${e}`) ? "con noi bo loc" : null,
			].filter((x): x is string => x !== null);
			ketQua[bang.ten] = loi.length === 0 ? "dung" : loi.join("; ");
		}
		expect(ketQua).toEqual({ "thoa-thuan": "dung", "ca-nhan": "dung", "cong-ty": "dung" });
	});
});
