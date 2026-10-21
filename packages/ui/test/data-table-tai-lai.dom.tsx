import { afterEach, describe, test } from "bun:test";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { DataTable, type DataTableFacet } from "../src/components/data-table";
import { LocaleProvider } from "../src/components/locale-provider";
import { TooltipProvider } from "../src/components/tooltip";
import { messages } from "../src/lib/messages";
import type { TableQueryState } from "../src/lib/table-query";

type Dong = { id: string; name: string };

const vi = messages("vi").table;

let root: Root | null = null;

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
});

const TRUY_VAN: TableQueryState = {
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

const FACETS: DataTableFacet[] = [
	{
		id: "owner",
		label: "Người phụ trách",
		options: [{ value: "u1", label: "An" }],
	},
];

const DONG: Dong[] = [
	{ id: "a", name: "Mục tiêu A" },
	{ id: "b", name: "Mục tiêu B" },
];

async function ve(refreshing: boolean | undefined): Promise<HTMLElement> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	await act(async () =>
		root?.render(
			<NuqsTestingAdapter>
				<LocaleProvider locale="vi">
					<TooltipProvider>
						<DataTable<Dong>
							query={TRUY_VAN}
							rows={DONG}
							total={DONG.length}
							columns={[{ id: "name", header: "Tên", cell: (r) => r.name }]}
							getRowId={(r) => r.id}
							facets={FACETS}
							search={<input data-o-tim="" />}
							meta={<span data-meta-bang="" />}
							refreshing={refreshing}
						/>
					</TooltipProvider>
				</LocaleProvider>
			</NuqsTestingAdapter>,
		),
	);
	return o;
}

function phai(dieuKien: boolean, thongDiep: string): void {
	if (!dieuKien) throw new Error(thongDiep);
}

function nutLoc(o: HTMLElement): HTMLButtonElement | undefined {
	return [...o.querySelectorAll("button")].find(
		(b) => b.textContent?.trim().startsWith(vi.filters) === true,
	);
}

function vungCua(o: HTMLElement): HTMLElement[] {
	return [...o.querySelectorAll<HTMLElement>('[data-slot="vung-dang-tai"]')];
}

describe("ldv-bang", () => {
	test("ldv-bang: refreshing true boc rieng vung bang, ban va mo", async () => {
		const o = await ve(true);
		const vung = vungCua(o);
		phai(vung.length === 1, `ldv-bang: can dung mot vung, co ${vung.length}`);
		const v = vung[0] as HTMLElement;
		phai(
			v.getAttribute("aria-busy") === "true",
			"ldv-bang: vung khong aria-busy",
		);
		phai(v.hasAttribute("data-dang-tai"), "ldv-bang: vung khong data-dang-tai");
		phai(
			v.querySelector('[data-slot="table-container"]') !== null,
			"ldv-bang: vung khong chua bang",
		);
		const nut = nutLoc(o);
		phai(nut !== undefined, "ldv-bang: khong thay nut Loc");
		phai(!v.contains(nut ?? null), "ldv-bang: nut Loc nam trong vung mo");
		phai(
			o.querySelector("[data-o-tim]") !== null,
			"ldv-bang: o tim khong duoc ve",
		);
		phai(
			o.querySelector("[data-meta-bang]") !== null,
			"ldv-bang: phan trang khong duoc ve",
		);
		phai(
			v.querySelector("[data-o-tim]") === null,
			"ldv-bang: o tim nam trong vung mo",
		);
		phai(
			v.querySelector("[data-meta-bang]") === null,
			"ldv-bang: phan trang nam trong vung mo",
		);
	});

	test("ldv-bang: refreshing false co vung nhung khong ban", async () => {
		const o = await ve(false);
		const vung = vungCua(o);
		phai(vung.length === 1, `ldv-bang: can dung mot vung, co ${vung.length}`);
		const v = vung[0] as HTMLElement;
		phai(!v.hasAttribute("aria-busy"), "ldv-bang: false van aria-busy");
		phai(!v.hasAttribute("data-dang-tai"), "ldv-bang: false van data-dang-tai");
	});

	test("ldv-bang: khong truyen refreshing thi khong co vung nao", async () => {
		const o = await ve(undefined);
		phai(vungCua(o).length === 0, "ldv-bang: khong truyen van co vung");
		phai(
			o.querySelector('[data-slot="table-container"]') !== null,
			"ldv-bang: khong truyen thi mat bang",
		);
	});
});
