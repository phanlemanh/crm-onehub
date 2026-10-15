import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
	QueryClient,
	QueryClientProvider,
	skipToken,
} from "@tanstack/react-query";
import { NuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing";
import {
	act,
	createElement as h,
	type MouseEvent as ReactMouseEvent,
	type ReactElement,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	danhMucOutput,
	planListInput,
} from "../../api/src/onboarding/onboarding.contracts";
import {
	dungHang,
	type KeHoachTho,
	manDanhMucTuHang,
} from "../../api/src/onboarding/onboarding-danh-muc";

type Json =
	| string
	| number
	| boolean
	| null
	| Json[]
	| { [khoa: string]: Json };
type DauVao = Json | undefined;
type LoiGoi = { duong: string; dauVao: DauVao };
type Lay = (dauVao: DauVao) => unknown;

let daGoi: LoiGoi[] = [];
let soLanPush = 0;
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
	useCrmCache: () => new Proxy({}, { get: () => async () => {} }),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({
		push: () => {
			soLanPush += 1;
		},
		replace: () => {},
		prefetch: () => {},
		refresh: () => {},
	}),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws",
}));
mock.module("next/link", () => ({
	default: ({
		href,
		children,
		...rest
	}: {
		href: string;
		children: ReactNode;
	}) =>
		h(
			"a",
			{ ...rest, href, onClick: (e: ReactMouseEvent) => e.preventDefault() },
			children,
		),
}));

const { DealsTable } = await import("@/app/(app)/[slug]/deals/deals-table");
const { DanhMucTable } = await import(
	"@/app/(app)/[slug]/onboarding/danh-muc-table"
);
const { DANH_MUC_CACH_CHIA } = await import(
	"@/app/(app)/[slug]/onboarding/onboarding-search-params"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { dealMessages } = await import("@/lib/messages/deals");
const { onboardingMessages } = await import("@/lib/messages/onboarding");

const md = dealMessages("vi");
const mo = onboardingMessages("vi");

const NGUOI = [{ id: "u1", name: "An", email: "an@thu.test", image: null }];
const GIAI_DOAN = [
	{ id: "g1", label: "Tiep can", kind: "OPEN", color: null, position: 0 },
	{ id: "g3", label: "Thang", kind: "WON", color: null, position: 1 },
];

const DAY_MS = 24 * 60 * 60 * 1000;

function keHoachMau(): KeHoachTho {
	return {
		id: "kh-1",
		companyId: "ct-1",
		company: { name: "Alpha" },
		startedAt: new Date(Date.now() - 10 * DAY_MS),
		targetDays: 30,
		ownerId: "u1",
		closedAt: null,
		steps: [
			{
				completedAt: null,
				label: "Buoc 1",
				position: 0,
				updatedAt: new Date(Date.now() - 2 * DAY_MS),
				assigneeId: "u1",
				assignee: { name: "An" },
				department: { id: "bp-a", name: "Kinh doanh", position: 0 },
			},
		],
	};
}

function datChung(): void {
	dat("users.list", () => NGUOI);
	dat("users.me", () => NGUOI[0] ?? null);
	dat("fields.filters", () => []);
	dat("fields.list", () => []);
	dat("savedViews.list", () => []);
	dat("companies.options", () => []);
	dat("giaiDoan.list", () => ({
		stages: GIAI_DOAN,
		canManage: false,
		tran: 0,
	}));
	dat("deals.list", () => ({
		rows: [],
		total: 0,
		facetCounts: { status: { open: 4, closed: 2 } },
		openValueCents: null,
		reportingCurrency: "USD",
		unconverted: { count: 0, currencies: [] },
	}));
	dat("deals.board", () => ({ columns: [], total: 0 }));
	dat("onboarding.access", () => ({ canManage: true }));
	dat("onboarding.nguoiNhanViec", () => NGUOI);
	dat("onboarding.listDepartments", () => []);
	dat("onboarding.listTemplates", () => []);
	dat("onboarding.manDanhMuc", (v) =>
		danhMucOutput.parse(
			manDanhMucTuHang(
				[dungHang(keHoachMau(), new Date())],
				planListInput.parse(v),
				1,
			),
		),
	);
	dat("onboarding.bangCot", () => ({ cachChia: "buoc", tranThe: 30, cot: [] }));
}

let root: Root | null = null;
let khung: HTMLElement | null = null;
let duongDan: string[] = [];

beforeEach(() => {
	daGoi = [];
	soLanPush = 0;
	duLieu.clear();
	duongDan = [];
	datChung();
});

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

async function cho(nhip = 8): Promise<void> {
	for (let i = 0; i < nhip; i += 1) {
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
}

async function dung(
	man: ReactElement,
	searchParams = "",
): Promise<HTMLElement> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	khung = o;
	root = createRoot(o);
	duongDan = [searchParams.replace(/^\?/, "")];
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root?.render(
			<NuqsTestingAdapter
				hasMemory
				searchParams={searchParams}
				onUrlUpdate={(e: UrlUpdateEvent) => {
					duongDan.push(e.queryString.replace(/^\?/, ""));
				}}
			>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	await cho();
	return o;
}

function urlCuoi(): URLSearchParams {
	return new URLSearchParams(duongDan.at(-1) ?? "");
}

async function bam(el: Element | null | undefined): Promise<void> {
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
	await cho();
}

function daGoiTruyVan(duong: string): number {
	return daGoi.filter((g) => g.duong === duong).length;
}

function nhanChip(c: Element): string {
	return [...c.childNodes]
		.filter((n) => n.nodeType === Node.TEXT_NODE)
		.map((n) => n.textContent)
		.join("")
		.trim();
}

type DocChip = { nhan: string; so: string | null }[];

function docChipTrangThai(goc: ParentNode, nhan: string): DocChip | null {
	const nhom = goc.querySelector(
		`[data-slot="toggle-group"][aria-label="${nhan}"]`,
	);
	if (!nhom) return null;
	return [...nhom.querySelectorAll('[data-slot="toggle-group-item"]')].map(
		(c) => ({
			nhan: nhanChip(c),
			so:
				c.querySelector('[data-slot="toggle-group-item-count"]')?.textContent ??
				null,
		}),
	);
}

function kiemChipTrangThai(goc: ParentNode): void {
	const menu = [
		...goc.querySelectorAll('[data-slot="dropdown-menu-trigger"]'),
	].some((t) => (t.textContent ?? "").includes(md.tabs.all));
	if (menu)
		throw new Error("lkx-trang-thai: thoa thuan loc trang thai bang menu tha");
	const chip = docChipTrangThai(goc, md.tabs.label);
	if (!chip)
		throw new Error("lkx-trang-thai: thoa thuan loc trang thai bang menu tha");
	expect(chip).toEqual([
		{ nhan: md.tabs.all, so: "6" },
		{ nhan: md.tabs.open, so: "4" },
		{ nhan: md.tabs.closed, so: "2" },
	]);
}

function kiemVeTrang1(truoc: URLSearchParams, sau: URLSearchParams): void {
	if (truoc.get("page") !== "2")
		throw new Error("lkx-trang-thai: doi chung khong bat dau o trang 2");
	if (sau.has("page"))
		throw new Error("lkx-trang-thai: doi trang thai khong ve trang 1");
}

describe("trang-thai", () => {
	test("thoa thuan loc trang thai bang ba chip co so dem, bam chip ve trang 1", async () => {
		const goc = await dung(<DealsTable />, "?page=2");
		expect(daGoiTruyVan("deals.list")).toBeGreaterThan(0);
		kiemChipTrangThai(goc);
		const truoc = urlCuoi();
		const chot = [
			...goc.querySelectorAll(
				`[data-slot="toggle-group"][aria-label="${md.tabs.label}"] [data-slot="toggle-group-item"]`,
			),
		].find((c) => nhanChip(c) === md.tabs.closed);
		await bam(chot);
		const sau = urlCuoi();
		expect(sau.get("status")).toBe("closed");
		kiemVeTrang1(truoc, sau);
	});

	test("chieu do: bang gia giu menu tha thi bai bat", async () => {
		const goc = document.createElement("div");
		goc.innerHTML = `<button data-slot="dropdown-menu-trigger">${md.tabs.all}</button>`;
		expect(() => kiemChipTrangThai(goc)).toThrow(
			"lkx-trang-thai: thoa thuan loc trang thai bang menu tha",
		);
	});

	test("chieu do: doi trang thai ma giu page=2 thi bai bat", () => {
		expect(() =>
			kiemVeTrang1(
				new URLSearchParams("page=2"),
				new URLSearchParams("status=closed&page=2"),
			),
		).toThrow("lkx-trang-thai: doi trang thai khong ve trang 1");
	});
});

type CongTac = {
	ten: string;
	nhan: string;
	khoa: string;
	thuHai: string;
	man: () => ReactElement;
	duong: string;
	locGiu: [string, string] | null;
};

const CONG_TAC: CongTac[] = [
	{
		ten: "thoa-thuan view",
		nhan: md.view.label,
		khoa: "view",
		thuHai: "board",
		man: () => <DealsTable />,
		duong: "?status=open",
		locGiu: ["status", "open"],
	},
	{
		ten: "onboarding cachXem",
		nhan: mo.view.label,
		khoa: "cachXem",
		thuHai: "bang-cot",
		man: () => <DanhMucTable />,
		duong: "?trangThai=da-dong",
		locGiu: ["trangThai", "da-dong"],
	},
	{
		ten: "onboarding cachChia",
		nhan: mo.chia.label,
		khoa: "cachChia",
		thuHai: DANH_MUC_CACH_CHIA[1] ?? "",
		man: () => <DanhMucTable />,
		duong: "?cachXem=bang-cot",
		locGiu: ["cachXem", "bang-cot"],
	},
];

function viewSwitchCua(goc: ParentNode, nhan: string) {
	const nut = [...goc.querySelectorAll('[data-view-switch="nut"]')].filter(
		(n) => n.getAttribute("aria-label") === nhan,
	);
	const chon = [...goc.querySelectorAll('[data-view-switch="chon"]')].filter(
		(c) => c.querySelector(`[aria-label="${nhan}"]`) !== null,
	);
	return { nut, chon };
}

function kiemViewSwitch(goc: ParentNode, ct: Pick<CongTac, "ten" | "nhan">) {
	const { nut, chon } = viewSwitchCua(goc, ct.nhan);
	if (nut.length !== 1 || chon.length !== 1)
		throw new Error(`lkx-kieu-xem: ${ct.ten} khong dung ViewSwitch`);
	return { nut: nut[0], chon: chon[0] };
}

describe("kieu-xem", () => {
	test("ma tran 3 cong tac x 2 dang: nut ghi duong dan, o chon theo cung gia tri", async () => {
		let dem = 0;
		for (const ct of CONG_TAC) {
			const goc = await dung(ct.man(), ct.duong);
			const { nut, chon } = kiemViewSwitch(goc, ct);
			const nutThuHai = nut?.querySelectorAll("button")[1];
			await bam(nutThuHai);
			const sau = urlCuoi();
			expect(`${ct.ten} ${sau.get(ct.khoa)}`).toBe(`${ct.ten} ${ct.thuHai}`);
			dem += 1;
			if (ct.locGiu)
				expect(`${ct.ten} giu ${sau.get(ct.locGiu[0])}`).toBe(
					`${ct.ten} giu ${ct.locGiu[1]}`,
				);
			const trig = chon?.querySelector(`[aria-label="${ct.nhan}"]`);
			expect(trig?.getAttribute("role")).toBe("combobox");
			expect(trig instanceof HTMLButtonElement && !trig.disabled).toBe(true);
			dem += 1;
			act(() => root?.unmount());
			khung?.remove();
			root = null;
		}
		expect(dem).toBe(6);
	});

	test("thoa thuan xem luu tru: ViewSwitch khoa ca nut lan o chon", async () => {
		const goc = await dung(<DealsTable />, "?archived=true");
		const { nut, chon } = kiemViewSwitch(goc, {
			ten: "thoa-thuan luu tru",
			nhan: md.view.label,
		});
		const cacNut = [...(nut?.querySelectorAll("button") ?? [])];
		expect(cacNut.length).toBe(2);
		for (const b of cacNut)
			expect(b instanceof HTMLButtonElement && b.disabled).toBe(true);
		const trig = chon?.querySelector(`[aria-label="${md.view.label}"]`);
		expect(trig instanceof HTMLButtonElement && trig.disabled).toBe(true);
	});

	test("chieu do: ToggleGroup tu ghep thi bai bat", () => {
		const goc = document.createElement("div");
		goc.innerHTML = `<div data-slot="toggle-group" aria-label="${md.view.label}"><button>Bang</button><button>Bang cot</button></div>`;
		expect(() =>
			kiemViewSwitch(goc, { ten: "thoa-thuan view", nhan: md.view.label }),
		).toThrow("lkx-kieu-xem: thoa-thuan view khong dung ViewSwitch");
	});
});
