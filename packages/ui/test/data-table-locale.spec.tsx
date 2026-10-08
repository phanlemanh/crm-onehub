import { describe, expect, test } from "bun:test";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { renderToStaticMarkup } from "react-dom/server";
import { DataTable } from "../src/components/data-table";
import { LocaleProvider } from "../src/components/locale-provider";
import { TooltipProvider } from "../src/components/tooltip";
import type { Locale } from "../src/lib/locale";
import { messages } from "../src/lib/messages";
import type { TableQueryState } from "../src/lib/table-query";

const query: TableQueryState = {
	sort: "name",
	dir: "asc",
	page: 1,
	pageSize: 20,
	tab: "all",
	filters: {},
	toggleSort: () => {},
	setSort: () => {},
	setDir: () => {},
	setPage: async () => {},
	setTab: () => {},
	setFilter: () => {},
};

const COT_DAI = "Thoả thuận mở";

function ve(locale: Locale): string {
	return renderToStaticMarkup(
		<NuqsTestingAdapter>
			<LocaleProvider locale={locale}>
				<TooltipProvider>
					<DataTable
						query={query}
						rows={[{ id: "1", name: "Đất Xanh" }]}
						total={1}
						columns={[
							{
								id: "openDeals",
								header: locale === "vi" ? COT_DAI : "Open deals",
								sortable: true,
								width: "w-24",
								cell: () => null,
							},
						]}
						getRowId={(row) => row.id}
						selection={{
							state: {
								ids: new Set<string>(["1"]),
								has: () => true,
								toggle: () => {},
								clear: () => {},
								toggleAll: () => {},
								count: 2,
							},
							rowLabel: (row) => row.name,
						}}
					/>
				</TooltipProvider>
			</LocaleProvider>
		</NuqsTestingAdapter>,
	);
}

describe("AC-1 — bảng dùng chung nói tiếng của người đọc", () => {
	test("thanh công cụ hiện tiếng Việt", () => {
		const ra = ve("vi");
		const m = messages("vi").table;
		expect(ra).toContain(m.filters);
		expect(ra).toContain(m.sort);
		expect(ra).toContain(m.columns);
	});

	test("không chữ tiếng Anh nào của bảng lọt ra", () => {
		const ra = ve("vi");
		for (const chu of ["Filters", "Sort", "Columns", "Select every row"]) {
			expect(ra).not.toContain(chu);
		}
	});

	test("nhãn chọn dòng dùng tên do chỗ gọi đưa vào, và động từ là tiếng Việt", () => {
		expect(ve("vi")).toContain('aria-label="Chọn Đất Xanh"');
	});

	test("nhãn chọn cả trang là tiếng Việt", () => {
		expect(ve("vi")).toContain(messages("vi").table.selectAllRows);
	});

	test("cùng bảng đó ở tiếng Anh vẫn đúng tiếng Anh", () => {
		const ra = ve("en");
		expect(ra).toContain("Filters");
		expect(ra).not.toContain("Lọc");
	});
});

describe("AC-7 — tiêu đề cột dài không bị chém trần", () => {
	test("chữ trong tiêu đề nằm trong lớp cắt kèm dấu ba chấm", () => {
		expect(ve("vi")).toMatch(
			new RegExp(
				`data-slot="table-head-label"[^>]*class="line-clamp-2">${COT_DAI}`,
			),
		);
	});

	test("ô tiêu đề mang chữ đầy đủ cho trình đọc màn hình", () => {
		expect(ve("vi")).toContain(`title="${COT_DAI}"`);
	});

	test("chữ đầy đủ không bị cắt ngắn trong thuộc tính", () => {
		const ra = ve("vi");
		const khop = ra.match(/title="([^"]*)"/);
		expect(khop?.[1]).toBe(COT_DAI);
	});
});

const KHOA_LOC_RO = [
	"noMatch",
	"noMatchDescription",
	"resetFilters",
	"clearFilters",
] as const;

const CO_DAU = /[À-ỹ]/;

function veRong(locale: Locale, coBoLoc: boolean): string {
	return renderToStaticMarkup(
		<NuqsTestingAdapter>
			<LocaleProvider locale={locale}>
				<TooltipProvider>
					<DataTable
						query={{ ...query, filters: { owner: ["u1"] } }}
						rows={[]}
						total={0}
						columns={[{ id: "name", header: "Name", cell: () => null }]}
						getRowId={(row: { id: string }) => row.id}
						facets={[
							{
								id: "owner",
								label: "Owner",
								options: [{ value: "u1", label: "An" }],
							},
						]}
						onClearFilters={coBoLoc ? () => {} : undefined}
					/>
				</TooltipProvider>
			</LocaleProvider>
		</NuqsTestingAdapter>,
	);
}

describe("loc-ro-chu — chữ của ô rỗng vì lọc đủ hai thứ tiếng", () => {
	test("bốn khoá: bản en khác bản vi và không lọt chữ có dấu", () => {
		const ketQua = Object.fromEntries(
			KHOA_LOC_RO.map((khoa) => {
				const v = messages("vi").table[khoa];
				const e = messages("en").table[khoa];
				const loi = [
					v === e ? `en trung vi: table.${khoa}` : null,
					CO_DAU.test(e) ? `en lot chu Viet: table.${khoa}` : null,
					v.trim() === "" || e.trim() === "" ? `trong: table.${khoa}` : null,
				].filter((x): x is string => x !== null);
				return [khoa, loi.length === 0 ? "dung" : loi.join("; ")];
			}),
		);
		expect(ketQua).toEqual(
			Object.fromEntries(KHOA_LOC_RO.map((khoa) => [khoa, "dung"])),
		);
	});
});

describe("loc-ro-en — bảng tiếng Anh rỗng vì lọc", () => {
	test("có đủ ba câu tiếng Anh và không chữ có dấu nào", () => {
		const ra = veRong("en", true);
		const en = messages("en").table;
		const chu = ra.replace(/<[^>]+>/g, " ");
		expect({
			noMatch: chu.includes(en.noMatch),
			noMatchDescription: chu.includes(en.noMatchDescription),
			resetFilters: chu.includes(en.resetFilters),
			coDau: CO_DAU.test(chu),
		}).toEqual({
			noMatch: true,
			noMatchDescription: true,
			resetFilters: true,
			coDau: false,
		});
	});
});

describe("loc-ro-vi — bảng tiếng Việt rỗng vì lọc", () => {
	test("có đủ ba câu tiếng Việt, không chữ tiếng Anh của vòng", () => {
		const ra = veRong("vi", true);
		const v = messages("vi").table;
		const en = messages("en").table;
		expect({
			noMatch: ra.includes(v.noMatch),
			noMatchDescription: ra.includes(v.noMatchDescription),
			resetFilters: ra.includes(v.resetFilters),
			chuAnh: [en.noMatch, en.resetFilters].filter((c) => ra.includes(c)),
		}).toEqual({
			noMatch: true,
			noMatchDescription: true,
			resetFilters: true,
			chuAnh: [],
		});
	});
});

describe("loc-ro-en — menu con tiếng Anh", () => {
	test("menu con có lựa chọn đang chọn hiện Clear, không chữ có dấu", async () => {
		const { createRoot } = await import("react-dom/client");
		const { act } = await import("react");
		const { DataTableFacetMenu } = await import("../src/components/data-table");
		const o = document.createElement("div");
		document.body.appendChild(o);
		const goc = createRoot(o);
		await act(async () =>
			goc.render(
				<LocaleProvider locale="en">
					<DataTableFacetMenu
						facets={[
							{
								id: "owner",
								label: "Owner",
								options: [{ value: "u1", label: "Anna" }],
							},
						]}
						filters={{ owner: ["u1"] }}
						onFilterChange={() => {}}
						counts={{ owner: { u1: 2 } }}
					/>
				</LocaleProvider>,
			),
		);
		const nut = o.querySelector('button[aria-haspopup="menu"]');
		if (!(nut instanceof HTMLElement)) throw new Error("khong co nut Filters");
		await act(async () => {
			for (const loai of ["pointerdown", "mousedown", "pointerup", "click"])
				nut.dispatchEvent(
					new window.PointerEvent(loai, {
						bubbles: true,
						cancelable: true,
						button: 0,
						pointerType: "mouse",
					}),
				);
		});
		const trig = document.body.querySelector(
			'[data-slot="dropdown-menu-sub-trigger"]',
		);
		if (!(trig instanceof HTMLElement)) throw new Error("khong co menu con");
		await act(async () => trig.click());
		const noi = document.body.querySelector(
			'[data-slot="dropdown-menu-sub-content"]',
		);
		const chu = noi?.textContent ?? "";
		expect({ clear: chu.includes("Clear"), coDau: CO_DAU.test(chu) }).toEqual({
			clear: true,
			coDau: false,
		});
		await act(async () => goc.unmount());
		o.remove();
		document.body.innerHTML = "";
	});
});
