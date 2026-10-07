import { afterEach, describe, expect, test } from "bun:test";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	DataTable,
	type DataTableFacet,
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
