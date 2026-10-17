import { afterEach, describe, expect, test } from "bun:test";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	DataTable,
	type DataTableFacet,
	type DataTableTabs,
} from "../src/components/data-table";
import { LocaleProvider } from "../src/components/locale-provider";
import { ToggleGroup, ToggleGroupItem } from "../src/components/toggle-group";
import { TooltipProvider } from "../src/components/tooltip";
import { ViewSwitch } from "../src/components/view-switch";
import type { TableQueryState } from "../src/lib/table-query";

type Dong = { id: string; name: string };

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

async function ve(el: ReactElement): Promise<HTMLElement> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	khung = o;
	root = createRoot(o);
	await act(async () => root?.render(el));
	return o;
}

function lopMo(el: Element): boolean {
	return [...el.classList].some((c) => c.startsWith("opacity-"));
}

function kiemChuPhu(el: Element, nhan: string) {
	if (lopMo(el)) throw new Error("lkx-dem: so dem mo bang opacity");
	if (
		!el.classList.contains("text-muted-foreground") ||
		!el.classList.contains("tabular-nums")
	)
		throw new Error(`lkx-dem: ${nhan} khong phai chu phu tabular-nums`);
}

function kiemDem(goc: ParentNode, nhan: string, mong: string | null) {
	const o = goc.querySelectorAll('[data-slot="toggle-group-item-count"]');
	if (mong === null) {
		if (o.length !== 0) throw new Error(`lkx-dem: ${nhan} co so dem thua`);
		return;
	}
	if (o.length !== 1) throw new Error(`lkx-dem: ${nhan} thieu so dem`);
	const so = o[0];
	if (!so) throw new Error(`lkx-dem: ${nhan} thieu so dem`);
	if (so.textContent !== mong)
		throw new Error(`lkx-dem: ${nhan} so ${so.textContent} thay vi ${mong}`);
	kiemChuPhu(so, nhan);
}

type OItem = {
	nhan: string;
	count: number | undefined;
	asChild: boolean;
	mong: string | null;
};

const MA_TRAN_ITEM: OItem[] = [
	{ nhan: "count 3", count: 3, asChild: false, mong: "3" },
	{ nhan: "count 0", count: 0, asChild: false, mong: "0" },
	{ nhan: "khong count", count: undefined, asChild: false, mong: null },
	{ nhan: "asChild", count: 5, asChild: true, mong: null },
];

function itemCua(o: OItem): ReactElement {
	return (
		<ToggleGroup type="single" variant="outline" size="sm" defaultValue="a">
			{o.asChild ? (
				<ToggleGroupItem asChild count={o.count} value="a">
					<button type="button">Mở</button>
				</ToggleGroupItem>
			) : (
				<ToggleGroupItem count={o.count} value="a">
					Mở
				</ToggleGroupItem>
			)}
		</ToggleGroup>
	);
}

function ItemGia() {
	return (
		<button type="button">
			Mở
			<span
				className="tabular-nums opacity-60"
				data-slot="toggle-group-item-count"
			>
				3
			</span>
		</button>
	);
}

function truyVan(): TableQueryState {
	return {
		sort: "name",
		dir: "asc",
		page: 1,
		pageSize: 20,
		tab: "open",
		tabId: "status",
		filters: { owner: ["u1"] },
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
	label: "Trạng thái",
	allLabel: "Tất cả",
	options: [
		{ value: "open", label: "Đang mở" },
		{ value: "closed", label: "Đã chốt" },
	],
};

const FACETS: DataTableFacet[] = [
	{
		id: "owner",
		label: "Người phụ trách",
		options: [{ value: "u1", label: "An" }],
	},
];

function bang(): ReactElement {
	return (
		<NuqsTestingAdapter>
			<LocaleProvider locale="vi">
				<TooltipProvider>
					<DataTable<Dong>
						query={truyVan()}
						rows={[]}
						total={0}
						columns={[{ id: "name", header: "Tên", cell: (r) => r.name }]}
						getRowId={(r) => r.id}
						facets={FACETS}
						facetCounts={{ status: { open: 4, closed: 0 }, owner: { u1: 2 } }}
						tabs={TABS}
					/>
				</TooltipProvider>
			</LocaleProvider>
		</NuqsTestingAdapter>
	);
}

const KIEU = [
	{ value: "bang", label: "Bảng" },
	{ value: "bang-cot", label: "Bảng cột" },
];

function kiemKhoa(o: HTMLElement) {
	const nut = [...o.querySelectorAll('[data-view-switch="nut"] button')];
	if (nut.length !== KIEU.length)
		throw new Error(`lkx-dem: nhom nut co ${nut.length} nut`);
	for (const n of nut)
		if (!(n instanceof HTMLButtonElement) || !n.disabled)
			throw new Error("lkx-dem: nut khong khoa");
	const chon = o.querySelector('[data-view-switch="chon"] button');
	if (!(chon instanceof HTMLButtonElement) || !chon.disabled)
		throw new Error("lkx-dem: o chon khong khoa");
}

function ViewSwitchGia({ disabled }: { disabled: boolean }) {
	return (
		<>
			<div data-view-switch="nut">
				{KIEU.map((k) => (
					<button disabled={disabled} key={k.value} type="button">
						{k.label}
					</button>
				))}
			</div>
			<div data-view-switch="chon">
				<button type="button">Bảng</button>
			</div>
		</>
	);
}

describe("lkx-dem", () => {
	test("ma tran ToggleGroupItem count: 4 o viet truoc", async () => {
		let dem = 0;
		for (const o of MA_TRAN_ITEM) {
			const goc = await ve(itemCua(o));
			kiemDem(goc, o.nhan, o.mong);
			dem += 1;
			act(() => root?.unmount());
			goc.remove();
			root = null;
		}
		expect(dem).toBe(4);
	});

	test("chieu do: item ve so dem bang opacity bi bat", async () => {
		const goc = await ve(<ItemGia />);
		expect(() => kiemDem(goc, "gia", "3")).toThrow(
			"lkx-dem: so dem mo bang opacity",
		);
	});

	test("DataTable: chip trang thai, so facet va so bo loc deu la chu phu", async () => {
		const goc = await ve(bang());
		const nhom = goc.querySelector(
			'[data-slot="toggle-group"][aria-label="Trạng thái"]',
		);
		expect(nhom).not.toBeNull();
		const chip = [
			...(nhom?.querySelectorAll('[data-slot="toggle-group-item"]') ?? []),
		];
		const nhanChip = (c: Element) =>
			[...c.childNodes]
				.filter((n) => n.nodeType === Node.TEXT_NODE)
				.map((n) => n.textContent)
				.join("");
		expect(chip.map(nhanChip)).toEqual(["Tất cả", "Đang mở", "Đã chốt"]);
		const so = chip.map((c) => {
			const s = c.querySelector('[data-slot="toggle-group-item-count"]');
			if (!s) throw new Error("lkx-dem: chip thieu so dem");
			kiemChuPhu(s, "chip trang thai");
			return s.textContent;
		});
		expect(so).toEqual(["4", "4", "0"]);
		const menuTrangThai = [
			...goc.querySelectorAll('[data-slot="dropdown-menu-trigger"]'),
		].filter((t) => (t.textContent ?? "").includes("Tất cả"));
		expect(menuTrangThai).toHaveLength(0);
		const nutLoc = [...goc.querySelectorAll("button")].find(
			(b) => b.getAttribute("aria-controls") !== null,
		);
		const soLoc = nutLoc?.querySelector("span span");
		if (!soLoc) throw new Error("lkx-dem: nut bo loc thieu so");
		expect(soLoc.textContent).toBe("(2)");
		kiemChuPhu(soLoc, "nut bo loc");
	});

	test("DataTable: so trong menu facet la chu phu", async () => {
		await ve(bang());
		const nutLoc = [
			...document.body.querySelectorAll('button[aria-haspopup="menu"]'),
		].find((b) => (b.textContent ?? "").includes("Lọc"));
		if (!(nutLoc instanceof HTMLElement))
			throw new Error("lkx-dem: khong thay nut Loc");
		await act(async () => {
			for (const loai of ["pointerdown", "mousedown", "pointerup", "click"])
				nutLoc.dispatchEvent(
					new window.PointerEvent(loai, {
						bubbles: true,
						cancelable: true,
						button: 0,
						pointerType: "mouse",
					}),
				);
		});
		const trig = [
			...document.body.querySelectorAll(
				'[data-slot="dropdown-menu-sub-trigger"]',
			),
		].find((el) => (el.textContent ?? "").includes("Người phụ trách"));
		if (!(trig instanceof HTMLElement))
			throw new Error("lkx-dem: khong thay menu con facet");
		await act(async () => trig.click());
		const facet = [
			...document.body.querySelectorAll('[data-slot="facet-count"]'),
		];
		expect(facet.length).toBeGreaterThan(0);
		for (const f of facet) kiemChuPhu(f, "facet");
		const soNgoac = [...document.body.querySelectorAll("span")].filter((s) =>
			/^\(\d+\)$/.test((s.textContent ?? "").trim()),
		);
		const nhanSo = soNgoac.map((s) =>
			(s.closest("button,[role=menuitem]")?.textContent ?? "").replace(
				/\(\d+\)/,
				"",
			),
		);
		expect(nhanSo.filter((n) => n.includes("Lọc")).length).toBeGreaterThan(1);
		expect(nhanSo.some((n) => n.includes("Người phụ trách"))).toBe(true);
		expect(nhanSo.some((n) => n.includes("Cột"))).toBe(true);
		for (const s of soNgoac) kiemChuPhu(s, `so (n) ${s.textContent}`);
	});

	test("ViewSwitch disabled khoa ca nut lan o chon", async () => {
		const goc = await ve(
			<ViewSwitch
				disabled
				items={KIEU}
				label="Cách xem"
				value="bang"
				onValueChange={() => {}}
			/>,
		);
		kiemKhoa(goc);
	});

	test("chieu do: ViewSwitch gia bo disabled o o chon bi bat", async () => {
		const goc = await ve(<ViewSwitchGia disabled />);
		expect(() => kiemKhoa(goc)).toThrow("lkx-dem: o chon khong khoa");
	});
});
