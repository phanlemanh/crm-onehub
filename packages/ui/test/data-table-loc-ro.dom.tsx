import { afterEach, describe, expect, test } from "bun:test";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	DataTable,
	type DataTableFacet,
	DataTableFacetMenu,
	type DataTableProps,
	type DataTableTabs,
} from "../src/components/data-table";
import { LocaleProvider } from "../src/components/locale-provider";
import { TooltipProvider } from "../src/components/tooltip";
import { messages } from "../src/lib/messages";
import type { TableQueryState } from "../src/lib/table-query";

type Dong = { id: string; name: string };

const CAU_CUA_MAN = "CAU-CUA-MAN";
const vi = messages("vi").table;

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

function truyVan(
	filters: Record<string, string[]>,
	tab = "all",
	tabId?: string,
): TableQueryState {
	return {
		sort: "name",
		dir: "asc",
		page: 1,
		pageSize: 20,
		tab,
		tabId,
		filters,
		toggleSort: () => {},
		setSort: () => {},
		setDir: () => {},
		setPage: async () => {},
		setTab: () => {},
		setFilter: () => {},
	};
}

const TABS: DataTableTabs = {
	id: "status",
	allLabel: "Tất cả",
	options: [
		{ value: "open", label: "Mở" },
		{ value: "closed", label: "Đóng" },
	],
};

const FACETS: DataTableFacet[] = [
	{ id: "owner", label: "Người phụ trách", options: [{ value: "u1", label: "An" }] },
	{ id: "field:k", label: "Nguồn", options: [{ value: "o1", label: "Hội chợ" }] },
];

type ThemProps = Partial<DataTableProps<Dong, unknown>>;

async function ve(them: ThemProps): Promise<HTMLElement> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	khung = o;
	root = createRoot(o);
	const cay: ReactElement = (
		<NuqsTestingAdapter>
			<LocaleProvider locale="vi">
				<TooltipProvider>
					<DataTable<Dong>
						query={truyVan({})}
						rows={[]}
						total={0}
						columns={[{ id: "name", header: "Tên", cell: (r) => r.name }]}
						getRowId={(r) => r.id}
						facets={FACETS}
						empty={CAU_CUA_MAN}
						{...them}
					/>
				</TooltipProvider>
			</LocaleProvider>
		</NuqsTestingAdapter>
	);
	await act(async () => root?.render(cay));
	return o;
}

type Mong = "loc" | "man" | "tai";

function doc(o: HTMLElement): Mong | "khac" {
	const chu = o.textContent ?? "";
	const rong = o.querySelector('[data-slot="empty"]');
	const coLoc =
		rong !== null &&
		chu.includes(vi.noMatch) &&
		chu.includes(vi.noMatchDescription);
	const coMan = chu.includes(CAU_CUA_MAN);
	const coTai = o.querySelector('[data-slot="spinner"]') !== null;
	if (coTai && !coLoc && !coMan && !chu.includes(vi.noMatch)) return "tai";
	if (coLoc && !coMan) return "loc";
	if (coMan && !chu.includes(vi.noMatch)) return "man";
	return "khac";
}

const TRON = {
	query: truyVan(
		{ status: ["closed"], owner: ["u1"], "field:k": ["o1"] },
		"closed",
		"status",
	),
	tabs: TABS,
	searchActive: true,
} satisfies ThemProps;

const MA_TRAN: { ten: string; them: ThemProps; mong: Mong }[] = [
	{ ten: "1 tieu chi thuong", them: { query: truyVan({ owner: ["u1"] }) }, mong: "loc" },
	{ ten: "2 truong tuy chinh", them: { query: truyVan({ "field:k": ["o1"] }) }, mong: "loc" },
	{
		ten: "3 bo loc trang thai",
		them: { query: truyVan({ status: ["closed"] }, "closed", "status"), tabs: TABS },
		mong: "loc",
	},
	{ ten: "4 tim kiem", them: { searchActive: true }, mong: "loc" },
	{ ten: "5 tron", them: TRON, mong: "loc" },
	{
		ten: "6 khong-loc: phai hien cau cua man",
		them: { query: truyVan({ status: ["all"] }, "all", "status"), tabs: TABS, searchActive: false },
		mong: "man",
	},
	{ ten: "7 khong loc, filters rong", them: { query: truyVan({}) }, mong: "man" },
	{ ten: "8 dang tai", them: { ...TRON, loading: true }, mong: "tai" },
];

describe("rong-vi-loc", () => {
	test("ma tran 8 dong: rong vi loc noi ro, khong loc giu cau cua man, dang tai giu spinner", async () => {
		const ketQua: Record<string, Mong | "khac"> = {};
		for (const dong of MA_TRAN) {
			const o = await ve(dong.them);
			ketQua[dong.ten] = doc(o);
			act(() => root?.unmount());
			o.remove();
			root = null;
			khung = null;
		}
		expect(ketQua).toEqual(
			Object.fromEntries(MA_TRAN.map((d) => [d.ten, d.mong])),
		);
		expect(Object.keys(ketQua).length).toBe(8);
	});
});

function nutBoLoc(o: HTMLElement): HTMLButtonElement[] {
	return [...o.querySelectorAll("button")].filter(
		(b) => b.textContent?.trim() === vi.resetFilters,
	);
}

describe("nut-bo-loc", () => {
	test("co onClearFilters: dung mot nut Bo loc, bam goi dung mot lan", async () => {
		let dem = 0;
		const o = await ve({
			query: truyVan({ owner: ["u1"] }),
			onClearFilters: () => {
				dem += 1;
			},
		});
		const nut = nutBoLoc(o);
		expect(nut.length).toBe(1);
		await act(async () => nut[0]?.click());
		expect(dem).toBe(1);
	});

	test("khong onClearFilters thi khong co nut Bo loc, cau van hien", async () => {
		const o = await ve({ query: truyVan({ owner: ["u1"] }) });
		expect({
			nut: nutBoLoc(o).length,
			cau: (o.textContent ?? "").includes(vi.noMatch),
		}).toEqual({ nut: 0, cau: true });
	});
});

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
}

function nutCo(chu: string): HTMLElement | undefined {
	return [
		...document.body.querySelectorAll('button[aria-haspopup="menu"]'),
	].find(
		(b): b is HTMLElement =>
			b instanceof HTMLElement && (b.textContent ?? "").includes(chu),
	);
}

function trigCon(nhan: string): HTMLElement | undefined {
	return [
		...document.body.querySelectorAll('[data-slot="dropdown-menu-sub-trigger"]'),
	].find((el): el is HTMLElement =>
		el instanceof HTMLElement && (el.textContent ?? "").includes(nhan),
	);
}

async function moCon(nhan: string): Promise<HTMLElement> {
	await bam(nutCo(vi.filters));
	const trig = trigCon(nhan);
	if (!trig) throw new Error(`khong thay menu con ${nhan}`);
	await act(async () => trig.click());
	const noi = document.body.querySelector(
		'[data-slot="dropdown-menu-sub-content"]',
	);
	if (!(noi instanceof HTMLElement)) throw new Error(`menu con ${nhan} khong mo`);
	return noi;
}

function mucBoChon(noi: HTMLElement): HTMLElement[] {
	return [...noi.querySelectorAll<HTMLElement>('[role="menuitem"], [role="option"]')].filter(
		(el) => (el.textContent ?? "").trim() === vi.clearFilters,
	);
}

const FACET_A: DataTableFacet = {
	id: "A",
	label: "Tiêu chí A",
	options: [
		{ value: "a1", label: "Một" },
		{ value: "a2", label: "Hai" },
	],
};

const FACET_B: DataTableFacet = {
	id: "B",
	label: "Tiêu chí B",
	searchable: true,
	options: [
		{ value: "b1", label: "Ba" },
		{ value: "b2", label: "Bốn" },
	],
};

async function veMenu(
	filters: Record<string, string[]>,
	onFilterChange: (id: string, values: string[]) => void,
	counts?: Record<string, Record<string, number>>,
): Promise<void> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	khung = o;
	root = createRoot(o);
	await act(async () =>
		root?.render(
			<LocaleProvider locale="vi">
				<DataTableFacetMenu
					facets={[FACET_A, FACET_B]}
					filters={filters}
					onFilterChange={onFilterChange}
					counts={counts}
				/>
			</LocaleProvider>,
		),
	);
}

describe("bo-chon", () => {
	test("menu thuong: Bo chon chi lam rong tieu chi do, menu con van mo", async () => {
		const goi: [string, string[]][] = [];
		await veMenu({ A: ["a1"], B: ["b1"] }, (id, v) => goi.push([id, v]));
		const noi = await moCon(FACET_A.label);
		const muc = mucBoChon(noi);
		expect(muc.length).toBe(1);
		await act(async () => muc[0]?.click());
		expect({
			goi,
			vanMo:
				document.body.querySelector('[data-slot="dropdown-menu-sub-content"]') !==
				null,
		}).toEqual({ goi: [["A", []]], vanMo: true });
	});

	test("menu co o tim thieu Bo chon — phai co va chi bo tieu chi B", async () => {
		const goi: [string, string[]][] = [];
		await veMenu({ A: ["a1"], B: ["b1"] }, (id, v) => goi.push([id, v]));
		const noi = await moCon(FACET_B.label);
		const muc = mucBoChon(noi);
		expect(muc.length).toBe(1);
		await act(async () => muc[0]?.click());
		expect(goi).toEqual([["B", []]]);
	});

	test("doi chung: tieu chi chua chon gi thi khong co Bo chon", async () => {
		await veMenu({}, () => {});
		const a = mucBoChon(await moCon(FACET_A.label)).length;
		expect(a).toBe(0);
	});

	test("chu: vi Bo chon, en Clear, khong con Bo het tieu chi", () => {
		const viTable: Record<string, unknown> = messages("vi").table;
		expect({
			vi: messages("vi").table.clearFilters,
			en: messages("en").table.clearFilters,
			conChuCu: Object.values(viTable).includes("Bỏ hết tiêu chí"),
		}).toEqual({ vi: "Bỏ chọn", en: "Clear", conChuCu: false });
	});
});

function soTrong(noi: HTMLElement, nhan: string[]): (string | null)[] {
	return nhan.map((n) => {
		const muc = [
			...noi.querySelectorAll<HTMLElement>(
				'[role="menuitemcheckbox"], [role="option"], [role="menuitemradio"]',
			),
		].find((el) => (el.textContent ?? "").includes(n));
		if (!muc) return "VANG";
		return muc.querySelector('[data-slot="facet-count"]')?.textContent ?? null;
	});
}

describe("so-dem", () => {
	const OWNER: DataTableFacet = {
		id: "owner",
		label: "Người phụ trách",
		options: [
			{ value: "u1", label: "An" },
			{ value: "u2", label: "Bình" },
			{ value: "u3", label: "Chi" },
		],
	};
	const X: DataTableFacet = {
		id: "x",
		label: "Không đếm",
		options: [{ value: "x1", label: "Xa" }],
	};

	async function veBang(
		facetCounts: Record<string, Record<string, number>>,
		setFilter: (id: string, v: string[]) => void = () => {},
	): Promise<void> {
		await ve({
			query: { ...truyVan({ status: ["all"] }, "all", "status"), setFilter },
			rows: [{ id: "1", name: "Dòng" }],
			total: 1,
			facets: [OWNER, X],
			tabs: TABS,
			facetCounts,
		});
	}

	test("so 4,0,0 theo thu tu; lua chon so 0 tick duoc", async () => {
		const goi: [string, string[]][] = [];
		await veBang({ owner: { u1: 4, u2: 0 }, status: { open: 2, closed: 0 } }, (id, v) =>
			goi.push([id, v]),
		);
		const noi = await moCon(OWNER.label);
		expect(soTrong(noi, ["An", "Bình", "Chi"])).toEqual(["4", "0", "0"]);
		const chi = [...noi.querySelectorAll<HTMLElement>('[role="menuitemcheckbox"]')].find(
			(el) => (el.textContent ?? "").includes("Chi"),
		);
		await act(async () => chi?.click());
		expect(goi).toEqual([["owner", ["u3"]]]);
	});

	test("doi chung duong: so 4,1,7", async () => {
		await veBang({ owner: { u1: 4, u2: 1, u3: 7 } });
		expect(soTrong(await moCon(OWNER.label), ["An", "Bình", "Chi"])).toEqual([
			"4",
			"1",
			"7",
		]);
	});

	test("tieu chi khong co muc dem thi khong in so", async () => {
		await veBang({ owner: { u1: 4 } });
		expect(soTrong(await moCon(X.label), ["Xa"])).toEqual([null]);
	});

	test("lua chon trang thai so 0 phai hien, kem so", async () => {
		await veBang({ owner: {}, status: { open: 2, closed: 0 } });
		await bam(nutCo(TABS.allLabel ?? ""));
		const noi = document.body.querySelector('[data-slot="dropdown-menu-content"]');
		if (!(noi instanceof HTMLElement)) throw new Error("menu trang thai khong mo");
		expect(soTrong(noi, ["Mở", "Đóng"])).toEqual(["2", "0"]);
	});
});
