import { afterEach, describe, expect, test } from "bun:test";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	DataTable,
	type DataTableExpandable,
} from "../src/components/data-table";
import { LocaleProvider } from "../src/components/locale-provider";
import { TooltipProvider } from "../src/components/tooltip";
import type { TableQueryState } from "../src/lib/table-query";

type Dong = { id: string; name: string; con: string[] };

const DONG: Dong[] = [
	{ id: "r1", name: "Doanh thu quý", con: ["r1-a", "r1-b"] },
	{ id: "r2", name: "Khách hàng mới", con: ["r2-a"] },
	{ id: "r3", name: "Chưa có KR", con: [] },
];

function phai(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

const truyVan: TableQueryState = {
	sort: "",
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

const MO_RONG: DataTableExpandable<Dong, string> = {
	isExpandable: (row) => row.con.length > 0,
	getSubRows: (row) => row.con,
	getSubRowId: (sub) => sub,
	renderSubCell: (sub, cot) =>
		cot === "name" ? <span data-dong-con={sub}>{sub}</span> : null,
	rowLabel: (row) => row.name,
};

let root: Root | null = null;
let khung: HTMLElement | null = null;
let bamDong: string[] = [];

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	bamDong = [];
	document.body.innerHTML = "";
});

async function ve(coMoRong: boolean): Promise<HTMLElement> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	khung = o;
	root = createRoot(o);
	await act(async () => {
		root?.render(
			<NuqsTestingAdapter hasMemory>
				<LocaleProvider locale="vi">
					<TooltipProvider>
						<DataTable<Dong, string>
							columns={[
								{ id: "name", header: "Tên", cell: (r) => r.name },
								{ id: "ghi-chu", header: "Ghi chú", cell: () => null },
							]}
							expandable={coMoRong ? MO_RONG : undefined}
							getRowId={(r) => r.id}
							onRowClick={(r) => bamDong.push(r.id)}
							query={truyVan}
							rows={DONG}
							total={DONG.length}
						/>
					</TooltipProvider>
				</LocaleProvider>
			</NuqsTestingAdapter>,
		);
	});
	return o;
}

function dongCua(o: HTMLElement, id: string): HTMLTableRowElement {
	const dong = [...o.querySelectorAll<HTMLTableRowElement>("tbody tr")].find(
		(tr) =>
			tr.textContent?.includes(DONG.find((d) => d.id === id)?.name ?? "?"),
	);
	if (!dong) throw new Error(`data-table-mo-rong: khong thay dong ${id}`);
	return dong;
}

function nutMuiTen(o: HTMLElement, id: string): HTMLButtonElement | null {
	return (
		dongCua(o, id)
			.querySelector("td")
			?.querySelector<HTMLButtonElement>("button[aria-expanded]") ?? null
	);
}

async function nhanPhim(nut: HTMLButtonElement, phim: "Enter" | " ") {
	await act(async () => {
		nut.focus();
		const xuong = new KeyboardEvent("keydown", {
			key: phim,
			bubbles: true,
			cancelable: true,
		});
		const duoc = nut.dispatchEvent(xuong);
		if (phim === "Enter" && duoc) nut.click();
		const len = new KeyboardEvent("keyup", {
			key: phim,
			bubbles: true,
			cancelable: true,
		});
		if (nut.dispatchEvent(len) && phim === " " && duoc) nut.click();
	});
}

async function bam(el: HTMLElement) {
	await act(async () => {
		el.click();
	});
}

const CACH_MO = {
	Enter: async (o: HTMLElement, id: string) => {
		const nut = nutMuiTen(o, id);
		if (nut) await nhanPhim(nut, "Enter");
	},
	Space: async (o: HTMLElement, id: string) => {
		const nut = nutMuiTen(o, id);
		if (nut) await nhanPhim(nut, " ");
	},
	"bam nut": async (o: HTMLElement, id: string) => {
		const nut = nutMuiTen(o, id);
		if (nut) await bam(nut);
	},
	"bam o trong": async (o: HTMLElement, id: string) => {
		const o_trong = dongCua(o, id).querySelectorAll("td")[2];
		if (o_trong instanceof HTMLElement) await bam(o_trong);
	},
} satisfies Record<string, (o: HTMLElement, id: string) => Promise<void>>;

describe("data-table-mo-rong", () => {
	test("3 dong x co/khong nut: dong mo duoc co dung 1 button[aria-expanded] mang ten dong", async () => {
		const o = await ve(true);
		for (const d of DONG) {
			const o_mui_ten = dongCua(o, d.id).querySelector("td");
			const nut = o_mui_ten?.querySelectorAll("button[aria-expanded]") ?? [];
			if (d.con.length > 0) {
				phai(
					nut.length === 1,
					`data-table-mo-rong: dong ${d.id} khong co button[aria-expanded] trong o mui ten`,
				);
				const n = nut[0];
				phai(
					n?.getAttribute("aria-expanded") === "false" &&
						(n?.getAttribute("aria-label") ?? "").includes(d.name) &&
						n instanceof HTMLButtonElement &&
						n.tabIndex >= 0,
					`data-table-mo-rong: dong ${d.id} nut mo khong dung (aria-expanded/nhan/tab)`,
				);
			} else {
				phai(
					nut.length === 0 && o_mui_ten?.querySelector("button") === null,
					`data-table-mo-rong: dong ${d.id} khong mo duoc ma co nut`,
				);
			}
		}
	});

	for (const id of ["r1", "r2"]) {
		for (const [cach, lam] of Object.entries(CACH_MO)) {
			test(`${id} x ${cach}: aria-expanded false -> true va hien dong con`, async () => {
				const o = await ve(true);
				phai(
					nutMuiTen(o, id) !== null,
					`data-table-mo-rong: dong ${id} khong co button[aria-expanded] trong o mui ten`,
				);
				phai(
					o.querySelectorAll("[data-dong-con]").length === 0,
					`data-table-mo-rong: ${id} mo san truoc khi ${cach}`,
				);
				await lam(o, id);
				const con = DONG.find((d) => d.id === id)?.con ?? [];
				phai(
					nutMuiTen(o, id)?.getAttribute("aria-expanded") === "true" &&
						con.every((c) => o.querySelector(`[data-dong-con="${c}"]`)),
					`data-table-mo-rong: ${id} ${cach} khong mo dong`,
				);
				phai(
					nutMuiTen(o, id)
						?.getAttribute("aria-label")
						?.includes(DONG.find((d) => d.id === id)?.name ?? "?") === true,
					`data-table-mo-rong: ${id} nhan nut sau khi mo mat ten dong`,
				);
				expect(bamDong).toEqual([]);
			});
		}
	}

	test("Space lan hai thu dong lai", async () => {
		const o = await ve(true);
		await CACH_MO.Space(o, "r1");
		await CACH_MO.Space(o, "r1");
		expect(nutMuiTen(o, "r1")?.getAttribute("aria-expanded")).toBe("false");
		expect(o.querySelectorAll("[data-dong-con]").length).toBe(0);
	});

	test("doi chung duong: bang khong expandable khong co cot mui ten", async () => {
		const o = await ve(false);
		expect({
			dauBang: o.querySelectorAll("thead th").length,
			nut: o.querySelectorAll("tbody button[aria-expanded]").length,
			oDau: dongCua(o, "r1").querySelector("td")?.textContent,
		}).toEqual({ dauBang: 2, nut: 0, oDau: DONG[0]?.name });
		await bam(dongCua(o, "r3"));
		expect(bamDong).toEqual(["r3"]);
	});
});
