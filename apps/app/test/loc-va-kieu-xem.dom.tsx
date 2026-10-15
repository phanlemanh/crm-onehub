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

mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => <>{children}</>,
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
const { DanhSach } = await import("@/app/(app)/[slug]/tai-lieu/danh-sach");
const { DanhSachTrang } = await import(
	"@/app/(app)/[slug]/tai-lieu/danh-sach-trang"
);
const { ChoDuyet } = await import("@/app/(app)/[slug]/tai-lieu/cho-duyet");
const { loadTaiLieuSearchParams } = await import(
	"@/app/(app)/[slug]/tai-lieu/tai-lieu-search-params"
);
const { LOAI_TRANG } = await import("@crm/validation/tai-lieu");
const { taiLieuMessages } = await import("@/lib/messages/tai-lieu");
const { readFileSync } = await import("node:fs");
const { join } = await import("node:path");

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
	dat("taiLieu.list", (v) => {
		const loai = truong(v, "loai") ?? "tat-ca";
		const trang = truong(v, "page") ?? 1;
		const luuTru = truong(v, "archived") === true ? " luu tru" : "";
		const donVi = truong(v, "donViId") ?? "";
		const chu = truong(v, "chuTrangId") ?? "";
		return {
			rows: [
				{
					slug: `t-${loai}-${trang}`,
					ten: `Trang ${loai} ${trang}${luuTru} ${donVi} ${chu}`.trim(),
					loai: "quy-dinh",
					chuTrang: { id: "u1", name: "Hà" },
					donVi: { id: "dv1", name: "Phòng Kinh doanh" },
					capNhat: "2026-09-20T00:00:00.000Z",
					luuTruLuc: null,
					coBanCho: false,
				},
			],
			total: 30,
			facetCounts: Object.fromEntries(LOAI_TRANG.map((l, i) => [l, 9 - i])),
			soDaLuuTru: 1,
		};
	});
	dat("taiLieu.boLoc", () => ({
		donVi: [{ id: "dv1", ten: "Phòng Kinh doanh", so: 3 }],
		chuTrang: [{ id: "u1", ten: "Hà", so: 4 }],
	}));
	dat("taiLieu.proposals", (v) => {
		const nhom = truong(v, "nhom");
		return {
			choToiDuyet: 0,
			total: nhom === undefined ? 0 : 1,
			rows:
				nhom === undefined
					? []
					: [
							{
								id: `dx-${nhom}`,
								ten: `De xuat ${nhom}`,
								taoBoi: { name: "Hà" },
								luc: "2026-09-20T00:00:00.000Z",
								trangThai: "CHO_DUYET",
								cu: false,
								loai: "SUA",
							},
						],
		};
	});
}

function truong(v: DauVao, khoa: string): Json | undefined {
	if (
		v === null ||
		v === undefined ||
		Array.isArray(v) ||
		!(v instanceof Object)
	)
		return undefined;
	return v[khoa];
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

const GOC_TAI_LIEU = join(import.meta.dir, "../app/(app)/[slug]/tai-lieu");

function docTep(ten: string): string {
	return readFileSync(join(GOC_TAI_LIEU, ten), "utf8");
}

function goiTruyVanCuoi(duong: string): DauVao {
	return daGoi.filter((g) => g.duong === duong).at(-1)?.dauVao;
}

function goiCoKhoa(duong: string, khoa: string): DauVao {
	return daGoi
		.filter((g) => g.duong === duong && truong(g.dauVao, khoa) !== undefined)
		.at(-1)?.dauVao;
}

function tenHangDau(goc: ParentNode): string {
	const hang = goc.querySelector("[data-trang]");
	return (hang?.textContent ?? "").trim();
}

async function chonCombobox(khoa: string, nhan: string): Promise<void> {
	await bam(document.body.querySelector(`[${khoa}]`));
	const muc = [...document.body.querySelectorAll("[cmdk-item]")].find(
		(e) => e.textContent?.includes(nhan) ?? false,
	);
	await bam(muc);
}

type QuanSat = {
	ten: string;
	soPush: number;
	truocCoTrang2: boolean;
	sau: URLSearchParams;
	mongKhoa: [string, string | null];
	doiLoc: boolean;
	goiMoi: boolean;
	hangDoi: boolean;
};

function kiemHanhDong(q: QuanSat): void {
	if (q.soPush > 0)
		throw new Error(`lkx-tai-lieu: ${q.ten} di qua router.push`);
	if (!q.goiMoi || !q.hangDoi)
		throw new Error(`lkx-tai-lieu: ${q.ten} khong doi danh sach tren trang`);
	const [khoa, gia] = q.mongKhoa;
	if (q.sau.get(khoa) !== gia)
		throw new Error(
			`lkx-tai-lieu: ${q.ten} ghi ${khoa}=${q.sau.get(khoa)} thay vi ${gia}`,
		);
	if (q.doiLoc) {
		if (!q.truocCoTrang2)
			throw new Error(`lkx-tai-lieu: ${q.ten} doi chung khong o trang 2`);
		if (q.sau.has("page"))
			throw new Error(`lkx-tai-lieu: ${q.ten} khong ve trang 1`);
	}
}

type HanhDong = {
	ten: string;
	man: () => ReactElement;
	duong: string;
	truyVan: string;
	lam: (goc: HTMLElement) => Promise<void>;
	mongKhoa: [string, string | null];
	doiLoc: boolean;
	ganGia: (v: DauVao) => boolean;
	docHang: (goc: HTMLElement) => string;
};

const LOAI_HAI = LOAI_TRANG[1] ?? "chinh-sach";

const HANH_DONG: HanhDong[] = [
	{
		ten: "chon loai",
		man: () => <DanhSachTrang />,
		duong: "?page=2",
		truyVan: "taiLieu.list",
		lam: async (goc) => bam(goc.querySelector(`[data-loai="${LOAI_HAI}"]`)),
		mongKhoa: ["loai", LOAI_HAI],
		doiLoc: true,
		ganGia: (v) => truong(v, "loai") === LOAI_HAI,
		docHang: tenHangDau,
	},
	{
		ten: "chon don vi",
		man: () => <DanhSachTrang />,
		duong: "?page=2",
		truyVan: "taiLieu.list",
		lam: async () => chonCombobox("data-loc-don-vi", "Phòng Kinh doanh"),
		mongKhoa: ["donVi", "dv1"],
		doiLoc: true,
		ganGia: (v) => truong(v, "donViId") === "dv1",
		docHang: tenHangDau,
	},
	{
		ten: "chon chu trang",
		man: () => <DanhSachTrang />,
		duong: "?page=2",
		truyVan: "taiLieu.list",
		lam: async () => chonCombobox("data-loc-chu", "Hà"),
		mongKhoa: ["chuTrang", "u1"],
		doiLoc: true,
		ganGia: (v) => truong(v, "chuTrangId") === "u1",
		docHang: tenHangDau,
	},
	{
		ten: "bat luu tru",
		man: () => <DanhSachTrang />,
		duong: "?page=2",
		truyVan: "taiLieu.list",
		lam: async (goc) => bam(goc.querySelector("[data-nut-da-luu-tru]")),
		mongKhoa: ["archived", "true"],
		doiLoc: true,
		ganGia: (v) => truong(v, "archived") === true,
		docHang: tenHangDau,
	},
	{
		ten: "xoa loc",
		man: () => <DanhSachTrang />,
		duong: `?loai=quy-dinh&page=2`,
		truyVan: "taiLieu.list",
		lam: async (goc) => bam(goc.querySelector("[data-bo-loc-xoa]")),
		mongKhoa: ["loai", null],
		doiLoc: true,
		ganGia: (v) => truong(v, "loai") === undefined && truong(v, "page") === 1,
		docHang: tenHangDau,
	},
	{
		ten: "sang trang 2",
		man: () => <DanhSachTrang />,
		duong: "",
		truyVan: "taiLieu.list",
		lam: async (goc) =>
			bam(
				[...goc.querySelectorAll("button")].find(
					(b) => b.textContent === "Tiếp",
				),
			),
		mongKhoa: ["page", "2"],
		doiLoc: false,
		ganGia: (v) => truong(v, "page") === 2,
		docHang: tenHangDau,
	},
	{
		ten: "doi nhom de xuat",
		man: () => <ChoDuyet />,
		duong: "?tabTaiLieu=cho-duyet&page=2",
		truyVan: "taiLieu.proposals",
		lam: async (goc) => bam(goc.querySelector('[data-nhom="da-xu-ly"]')),
		mongKhoa: ["nhomDeXuat", "da-xu-ly"],
		doiLoc: true,
		ganGia: (v) => truong(v, "nhom") === "da-xu-ly",
		docHang: (goc) =>
			(goc.querySelector("[data-de-xuat]")?.textContent ?? "").trim(),
	},
];

async function quanSat(hd: HanhDong): Promise<QuanSat> {
	const goc = await dung(hd.man(), hd.duong);
	expect(daGoiTruyVan(hd.truyVan)).toBeGreaterThan(0);
	const truocCoTrang2 = urlCuoi().get("page") === "2";
	const hangTruoc = hd.docHang(goc);
	const soGoiTruoc = daGoiTruyVan(hd.truyVan);
	soLanPush = 0;
	await hd.lam(goc);
	const sau = urlCuoi();
	const moi = daGoi
		.filter((g) => g.duong === hd.truyVan)
		.slice(soGoiTruoc)
		.some((g) => hd.ganGia(g.dauVao));
	return {
		ten: hd.ten,
		soPush: soLanPush,
		truocCoTrang2,
		sau,
		mongKhoa: hd.mongKhoa,
		doiLoc: hd.doiLoc,
		goiMoi: moi,
		hangDoi: hd.docHang(goc) !== hangTruoc && hd.docHang(goc) !== "",
	};
}

describe("tai-lieu", () => {
	test("ma tran 7 hanh dong: ghi duong dan qua nuqs, ve trang 1, danh sach doi tren trang", async () => {
		let dem = 0;
		for (const hd of HANH_DONG) {
			const q = await quanSat(hd);
			kiemHanhDong(q);
			if (hd.ten === "xoa loc") expect(q.sau.has("loai")).toBe(false);
			const may = await loadTaiLieuSearchParams(q.sau);
			if (hd.mongKhoa[0] === "loai" && hd.ten !== "xoa loc")
				expect(may.loai).toBe(LOAI_HAI);
			if (hd.mongKhoa[0] === "page") expect(may.page).toBe(2);
			if (hd.mongKhoa[0] === "nhomDeXuat")
				expect(may.nhomDeXuat).toBe("da-xu-ly");
			dem += 1;
			act(() => root?.unmount());
			khung?.remove();
			root = null;
		}
		expect(dem).toBe(7);
	});

	test("bam hang mo trang qua lien ket cua hang", async () => {
		const goc = await dung(<DanhSachTrang />, "");
		const hang = goc.querySelector("[data-trang]");
		const lienKet = hang?.querySelector("a");
		let daBam = 0;
		lienKet?.addEventListener("click", () => {
			daBam += 1;
		});
		await act(async () => {
			hang?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		});
		expect(daBam).toBe(1);
		expect(lienKet?.getAttribute("href")).toBe("/ws/tai-lieu/t-tat-ca-1");
	});

	test("the trang con dung duong dan tu cung bo parser, xoa bo loc", async () => {
		const goc = await dung(<DanhSach />, "?loai=quy-dinh&donVi=dv1&page=3");
		const choDuyet = goc.querySelector("[data-tab-cho-duyet]");
		const href = choDuyet?.getAttribute("href") ?? "";
		const may = await loadTaiLieuSearchParams(
			new URLSearchParams(href.split("?")[1] ?? ""),
		);
		expect(may.tabTaiLieu).toBe("cho-duyet");
		expect([may.loai, may.donVi, may.page]).toEqual([null, null, 1]);
	});

	test("quet tep: khong router.push o loc, khong URLSearchParams tu ghep", () => {
		expect(docTep("danh-sach-trang.tsx")).not.toContain("router.push");
		expect(docTep("cho-duyet.tsx")).not.toContain("router.push");
		expect(docTep("danh-sach-loc.ts")).not.toContain("URLSearchParams");
		expect(docTep("danh-sach-loc.ts")).toContain(
			"createSerializer(taiLieuParsers)",
		);
	});

	test("chieu do: ban gia di qua router.push thi bai bat", () => {
		expect(() =>
			kiemHanhDong({
				ten: "chon loai",
				soPush: 1,
				truocCoTrang2: true,
				sau: new URLSearchParams(),
				mongKhoa: ["loai", LOAI_HAI],
				doiLoc: true,
				goiMoi: true,
				hangDoi: true,
			}),
		).toThrow("lkx-tai-lieu: chon loai di qua router.push");
	});

	test("chieu do: ghi duong dan ma danh sach doc prop may chu thi bai bat", () => {
		expect(() =>
			kiemHanhDong({
				ten: "chon loai",
				soPush: 0,
				truocCoTrang2: true,
				sau: new URLSearchParams(`loai=${LOAI_HAI}`),
				mongKhoa: ["loai", LOAI_HAI],
				doiLoc: true,
				goiMoi: false,
				hangDoi: false,
			}),
		).toThrow("lkx-tai-lieu: chon loai khong doi danh sach tren trang");
	});
});

const mt = taiLieuMessages("vi");

function chipBat(goc: ParentNode, nhan: string): string | null {
	const on = goc.querySelector(
		`[data-slot="toggle-group"][aria-label="${nhan}"] [data-slot="toggle-group-item"][data-state="on"]`,
	);
	return on ? nhanChip(on) : null;
}

function nutBat(goc: ParentNode, nhan: string): string | null {
	const on = goc.querySelector(
		`[data-view-switch="nut"][aria-label="${nhan}"] button[data-state="on"]`,
	);
	return on ? nhanChip(on) : null;
}

type TrangThai = Record<string, Json | undefined>;

type ODuongDan = {
	ten: string;
	man: () => ReactElement;
	duong: string;
	doc: (goc: HTMLElement) => TrangThai;
	mong: TrangThai;
	doi: (goc: HTMLElement) => Promise<void>;
};

function chipTheoChu(
	goc: ParentNode,
	nhan: string,
	chu: string,
): Element | undefined {
	return [
		...goc.querySelectorAll(
			`[data-slot="toggle-group"][aria-label="${nhan}"] [data-slot="toggle-group-item"]`,
		),
	].find((c) => nhanChip(c) === chu);
}

const O_DUONG_DAN: ODuongDan[] = [
	{
		ten: "thoa thuan bang",
		man: () => <DealsTable />,
		duong: "?status=closed&page=2",
		doc: (goc) => ({
			chip: chipBat(goc, md.tabs.label),
			kieu: nutBat(goc, md.view.label),
			status: truong(goiTruyVanCuoi("deals.list"), "status"),
			page: truong(goiTruyVanCuoi("deals.list"), "page"),
		}),
		mong: {
			chip: md.tabs.closed,
			kieu: md.view.table,
			status: "closed",
			page: 2,
		},
		doi: async (goc) => bam(chipTheoChu(goc, md.tabs.label, md.tabs.open)),
	},
	{
		ten: "thoa thuan bang cot",
		man: () => <DealsTable />,
		duong: "?view=board",
		doc: (goc) => ({
			kieu: nutBat(goc, md.view.label),
			coBang: goc.querySelector("table") !== null,
		}),
		mong: { kieu: md.view.board, coBang: false },
		doi: async (goc) =>
			bam(
				[
					...goc.querySelectorAll(
						`[data-view-switch="nut"][aria-label="${md.view.label}"] button`,
					),
				][0],
			),
	},
	{
		ten: "onboarding",
		man: () => <DanhMucTable />,
		duong: "?trangThai=da-dong&cachXem=bang-cot&cachChia=bo-phan",
		doc: (goc) => ({
			chip: chipBat(goc, mo.facets.status),
			kieu: nutBat(goc, mo.view.label),
			chia: nutBat(goc, mo.chia.label),
			status: truong(goiTruyVanCuoi("onboarding.manDanhMuc"), "status"),
			cachChia: truong(goiTruyVanCuoi("onboarding.bangCot"), "cachChia"),
		}),
		mong: {
			chip: mo.facets.closed,
			kieu: mo.view["bang-cot"],
			chia: mo.chia["bo-phan"],
			status: "da-dong",
			cachChia: "bo-phan",
		},
		doi: async (goc) =>
			bam(chipTheoChu(goc, mo.facets.status, mo.facets.running)),
	},
	{
		ten: "tai lieu",
		man: () => <DanhSachTrang />,
		duong: `?loai=${LOAI_HAI}&donVi=dv1&chuTrang=u1&archived=true&page=2`,
		doc: (goc) => ({
			chip: chipBat(goc, mt.loc.nhan),
			luuTru:
				goc
					.querySelector("[data-nut-da-luu-tru]")
					?.getAttribute("aria-pressed") ?? null,
			donVi: (goc.querySelector("[data-loc-don-vi]")?.textContent ?? "").trim(),
			chu: (goc.querySelector("[data-loc-chu]")?.textContent ?? "").trim(),
			loai: truong(goiTruyVanCuoi("taiLieu.list"), "loai"),
			donViId: truong(goiTruyVanCuoi("taiLieu.list"), "donViId"),
			chuTrangId: truong(goiTruyVanCuoi("taiLieu.list"), "chuTrangId"),
			archived: truong(goiTruyVanCuoi("taiLieu.list"), "archived"),
			page: truong(goiTruyVanCuoi("taiLieu.list"), "page"),
		}),
		mong: {
			chip: mt.loai[LOAI_HAI],
			luuTru: "true",
			donVi: "Phòng Kinh doanh",
			chu: "Hà",
			loai: LOAI_HAI,
			donViId: "dv1",
			chuTrangId: "u1",
			archived: true,
			page: 2,
		},
		doi: async (goc) => bam(chipTheoChu(goc, mt.loc.nhan, mt.loc.tatCa)),
	},
	{
		ten: "cho duyet",
		man: () => <DanhSach />,
		duong: "?tabTaiLieu=cho-duyet&nhomDeXuat=da-xu-ly&page=2",
		doc: (goc) => ({
			nhom: chipBat(goc, mt.choDuyet.nhom.nhan),
			nhomVao: truong(goiCoKhoa("taiLieu.proposals", "nhom"), "nhom"),
			page: truong(goiCoKhoa("taiLieu.proposals", "nhom"), "page"),
		}),
		mong: {
			nhom: mt.choDuyet.nhom.daXuLy,
			nhomVao: "da-xu-ly",
			page: 2,
		},
		doi: async (goc) =>
			bam(chipTheoChu(goc, mt.choDuyet.nhom.nhan, mt.choDuyet.nhom.cho)),
	},
];

function kiemDuongDan(o: Pick<ODuongDan, "ten" | "mong">, thay: TrangThai) {
	for (const [khoa, gia] of Object.entries(o.mong)) {
		if (thay[khoa] === gia) continue;
		if (o.ten === "thoa thuan bang cot" && khoa === "kieu")
			throw new Error("lkx-duong-dan: thoa thuan mo duong dan mat bang cot");
		if (o.ten === "tai lieu" && (khoa === "chip" || khoa === "loai"))
			throw new Error("lkx-duong-dan: tai lieu mo duong dan mat loai");
		throw new Error(
			`lkx-duong-dan: ${o.ten} ${khoa}=${String(thay[khoa])} thay vi ${String(gia)}`,
		);
	}
}

async function goLai(o: ODuongDan, duong: string): Promise<HTMLElement> {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	daGoi = [];
	return dung(o.man(), duong);
}

describe("duong-dan", () => {
	test("ma tran 5 o: dung man chi tu duong dan, roi khu hoi sau mot lan doi", async () => {
		let dem = 0;
		for (const o of O_DUONG_DAN) {
			const goc = await dung(o.man(), o.duong);
			kiemDuongDan(o, o.doc(goc));
			await o.doi(goc);
			const sauBam = o.doc(goc);
			const duongMoi = duongDan.at(-1) ?? "";
			expect(`${o.ten} ${duongMoi}`).not.toBe(`${o.ten} ${o.duong.slice(1)}`);
			const lai = await goLai(o, duongMoi === "" ? "" : `?${duongMoi}`);
			expect({ ten: o.ten, ...o.doc(lai) }).toEqual({ ten: o.ten, ...sauBam });
			dem += 1;
			act(() => root?.unmount());
			khung?.remove();
			root = null;
			daGoi = [];
		}
		expect(dem).toBe(5);
	});

	test("gia tri la tren duong dan ve mac dinh, khong loi", async () => {
		const tl = await dung(<DanhSachTrang />, "?loai=xyz&page=abc");
		expect(chipBat(tl, mt.loc.nhan)).toBe(mt.loc.tatCa);
		expect(truong(goiTruyVanCuoi("taiLieu.list"), "loai")).toBeUndefined();
		expect(truong(goiTruyVanCuoi("taiLieu.list"), "page")).toBe(1);
		act(() => root?.unmount());
		khung?.remove();
		root = null;
		const ob = await dung(<DanhMucTable />, "?trangThai=abc&cachXem=xyz");
		expect(chipBat(ob, mo.facets.status)).toBe(mo.facets.running);
		expect(nutBat(ob, mo.view.label)).toBe(mo.view.bang);
	});

	test("chieu do: thoa thuan doc view tu mac dinh thi bai bat", () => {
		expect(() =>
			kiemDuongDan(
				{ ten: "thoa thuan bang cot", mong: { kieu: md.view.board } },
				{ kieu: md.view.table },
			),
		).toThrow("lkx-duong-dan: thoa thuan mo duong dan mat bang cot");
	});

	test("chieu do: tai lieu doc loai tu state khoi tao null thi bai bat", () => {
		expect(() =>
			kiemDuongDan(
				{ ten: "tai lieu", mong: { chip: mt.loai[LOAI_HAI] } },
				{ chip: mt.loc.tatCa },
			),
		).toThrow("lkx-duong-dan: tai lieu mo duong dan mat loai");
	});
});
