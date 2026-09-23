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
