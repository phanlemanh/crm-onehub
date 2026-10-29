import { afterEach, describe, expect, mock, test } from "bun:test";
import {
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { join, relative, resolve } from "node:path";
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
	{ id: "A", name: "Mục tiêu A", con: ["A1", "A2"] },
	{ id: "B", name: "Mục tiêu B", con: ["B1"] },
	{ id: "C", name: "Mục tiêu C", con: [] },
	{ id: "D", name: "Mục tiêu D", con: [] },
];

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

const moRong = (
	moSan: boolean | undefined,
): DataTableExpandable<Dong, string> => ({
	isExpandable: (row) => row.con.length > 0,
	getSubRows: (row) => row.con,
	getSubRowId: (sub) => sub,
	renderSubCell: (sub, cot) =>
		cot === "name" ? <span data-dong-con={sub}>{sub}</span> : null,
	rowLabel: (row) => row.name,
	moSan,
});

let root: Root | null = null;
let khung: HTMLElement | null = null;
let url = new URLSearchParams();

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	url = new URLSearchParams();
	document.body.innerHTML = "";
});

async function ve(moSan: boolean | undefined, ban = ""): Promise<HTMLElement> {
	url = new URLSearchParams(ban);
	const o = document.createElement("div");
	document.body.appendChild(o);
	khung = o;
	root = createRoot(o);
	await act(async () => {
		root?.render(
			<NuqsTestingAdapter
				hasMemory
				onUrlUpdate={(e) => {
					url = new URLSearchParams(e.queryString);
				}}
				searchParams={ban}
			>
				<LocaleProvider locale="vi">
					<TooltipProvider>
						<DataTable<Dong, string>
							columns={[{ id: "name", header: "Tên", cell: (r) => r.name }]}
							expandable={moRong(moSan)}
							getRowId={(r) => r.id}
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

const nutDong = (o: HTMLElement, id: string) =>
	o.querySelector<HTMLButtonElement>(`[data-mo-dong="${id}"]`);

const conHien = (o: HTMLElement) =>
	[...o.querySelectorAll("[data-dong-con]")].map((e) => e.textContent);

const nutTatCa = (o: HTMLElement) =>
	[...o.querySelectorAll<HTMLButtonElement>("button")].find((b) =>
		["Mở tất cả", "Gập tất cả"].includes(b.textContent?.trim() ?? ""),
	) ?? null;

const danhSach = (k: string) => url.get(k)?.split(",").filter(Boolean) ?? null;

async function bam(nut: HTMLButtonElement | null) {
	await act(async () => {
		nut?.click();
	});
}

const VONG_CHO_URL = 100;

async function choUrl(dat: () => boolean) {
	for (let i = 0; i < VONG_CHO_URL && !dat(); i += 1)
		await act(async () => {
			await new Promise((r) => setTimeout(r, 5));
		});
}

function lechMoSan(o: HTMLElement): string[] {
	const loi: string[] = [];
	for (const id of ["A", "B"])
		if (nutDong(o, id)?.getAttribute("aria-expanded") !== "true")
			loi.push(`bco-mo-san: ${id} lech`);
	for (const id of ["C", "D"])
		if (nutDong(o, id) !== null) loi.push(`bco-mo-san: ${id} lech`);
	if (conHien(o).join() !== "A1,A2,B1") loi.push("bco-mo-san: con lech");
	return loi;
}

describe("bco-mo-san", () => {
	test("bco-mo-san: URL trong thi moi dong mo duoc deu mo; bam A chi gap A, ghi gap=[A], khong khoa expand", async () => {
		const o = await ve(true);
		expect(lechMoSan(o)).toEqual([]);
		await bam(nutDong(o, "A"));
		await choUrl(() => url.has("gap"));
		const loi: string[] = [];
		if (nutDong(o, "A")?.getAttribute("aria-expanded") !== "false")
			loi.push("bco-mo-san: A lech");
		if (nutDong(o, "B")?.getAttribute("aria-expanded") !== "true")
			loi.push("bco-mo-san: B lech");
		if (conHien(o).join() !== "B1") loi.push("bco-mo-san: con lech");
		if (danhSach("gap")?.join() !== "A") loi.push("bco-mo-san: gap lech");
		if (url.has("expand")) loi.push("bco-mo-san: expand lech");
		expect(loi).toEqual([]);
	});

	test("bco-mo-san-do: bo moSan thi khang dinh mo san bat duoc bang gap", async () => {
		const o = await ve(false);
		expect(lechMoSan(o)).toContain("bco-mo-san: A lech");
	});
});

type Buoc = { nhan: string; mo: number; gap: string[] | null };

const CHUOI: Buoc[] = [
	{ nhan: "Gập tất cả", mo: 2, gap: null },
	{ nhan: "Mở tất cả", mo: 1, gap: ["A"] },
	{ nhan: "Gập tất cả", mo: 2, gap: null },
	{ nhan: "Mở tất cả", mo: 0, gap: ["A", "B"] },
	{ nhan: "Mở tất cả", mo: 0, gap: ["A", "B"] },
];

function docBuoc(o: HTMLElement): Buoc {
	const nut = nutTatCa(o);
	return {
		nhan: nut?.textContent?.trim() ?? "",
		mo: ["A", "B"].filter(
			(id) => nutDong(o, id)?.getAttribute("aria-expanded") === "true",
		).length,
		gap: danhSach("gap"),
	};
}

function lechChuoi(thuc: Buoc[]): string[] {
	return CHUOI.flatMap((mong, i) => {
		const t = thuc[i];
		const dung =
			t !== undefined &&
			t.nhan === mong.nhan &&
			t.mo === mong.mo &&
			(t.gap?.join() ?? null) === (mong.gap?.join() ?? null);
		return dung ? [] : [`bco-mo-san-nut: buoc ${i + 1} lech`];
	});
}

async function chayChuoi() {
	const thuc: Buoc[] = [];
	let o = await ve(true);
	thuc.push(docBuoc(o));
	await bam(nutDong(o, "A"));
	await choUrl(() => danhSach("gap")?.join() === "A");
	thuc.push(docBuoc(o));
	const nut = nutTatCa(o);
	const nutInfo = {
		kieu: nut?.type,
		ten: nut?.getAttribute("aria-label") ?? nut?.textContent?.trim(),
	};
	nut?.focus();
	const focus = document.activeElement === nut;
	await bam(nut);
	await choUrl(() => !url.has("gap"));
	thuc.push(docBuoc(o));
	await bam(nutTatCa(o));
	await choUrl(() => danhSach("gap")?.length === 2);
	thuc.push(docBuoc(o));
	const ban = url.toString();
	act(() => root?.unmount());
	khung?.remove();
	o = await ve(true, ban);
	thuc.push(docBuoc(o));
	return { thuc, nutInfo, focus };
}

const DUONG_CHU = "../src/lib/messages";
const chuGoc = await import(DUONG_CHU);

describe("bco-mo-san-nut", () => {
	test("bco-mo-san-nut: nut doi nhan theo dong gap, Mo tat ca xoa gap, Gap tat ca ghi moi dong, dung lai voi URL giu nguyen", async () => {
		const { thuc, nutInfo, focus } = await chayChuoi();
		expect(nutInfo).toEqual({ kieu: "button", ten: "Mở tất cả" });
		expect(focus).toBe(true);
		expect(lechChuoi(thuc)).toEqual([]);
	});

	test("bco-mo-san-nut-do: ban DataTable co nhan nut co dinh thi buoc 2 lech", async () => {
		const goc = chuGoc.messages;
		mock.module(DUONG_CHU, () => ({
			...chuGoc,
			messages: (l: Parameters<typeof goc>[0]) => {
				const m = goc(l);
				return { ...m, table: { ...m.table, moTatCa: m.table.gapTatCa } };
			},
		}));
		try {
			const { thuc } = await chayChuoi();
			expect(lechChuoi(thuc)).toContain("bco-mo-san-nut: buoc 2 lech");
		} finally {
			mock.module(DUONG_CHU, () => ({ ...chuGoc }));
		}
	});
});

const GOC_APP = resolve(import.meta.dir, "../../../apps/app");

const CO_EXPANDABLE = [
	"app/(app)/[slug]/okr/khoi-muc-tieu.tsx",
	"app/(app)/[slug]/okr/theo-don-vi/bang.tsx",
	"app/proto/_modules/bo-okr-co-so/index.tsx",
	"app/proto/_modules/bo-okr-chi-don-vi/index.tsx",
	"app/proto/_modules/trang-don-vi-mot-bang/index.tsx",
];

const CO_MO_SAN = [
	"app/(app)/[slug]/okr/theo-don-vi/bang.tsx",
	"app/proto/_modules/bo-okr-chi-don-vi/index.tsx",
];

function quetTsx(thu: string): string[] {
	return readdirSync(thu).flatMap((ten) => {
		if (ten === "node_modules" || ten === ".next") return [];
		const duong = join(thu, ten);
		if (statSync(duong).isDirectory()) return quetTsx(duong);
		return ten.endsWith(".tsx") ? [duong] : [];
	});
}

function lechDanhSach(quet: string[], vietTay: string[]): string[] {
	const loi = quet
		.filter((t) => !vietTay.includes(t))
		.map((t) => `bco-mac-dinh: ${t} lech`);
	return [
		...loi,
		...vietTay
			.filter((t) => !quet.includes(t))
			.map((t) => `bco-mac-dinh: ${t} lech`),
	];
}

function quetExpandable(): string[] {
	return quetTsx(join(GOC_APP, "app"))
		.concat(quetTsx(join(GOC_APP, "components")))
		.filter((t) => readFileSync(t, "utf8").includes("expandable={"))
		.map((t) => relative(GOC_APP, t))
		.sort();
}

const TEP_GIA = "app/__bco-tep-gia.tsx";

describe("bco-mac-dinh", () => {
	test("bco-mac-dinh: khong moSan thi gap mac dinh, bam ghi expand, khong nut tat ca; chi bang mot bo mang moSan", async () => {
		const o = await ve(undefined);
		const loi: string[] = [];
		if (nutDong(o, "A")?.getAttribute("aria-expanded") !== "false")
			loi.push("bco-mac-dinh: gap-mac-dinh lech");
		if (nutTatCa(o) !== null) loi.push("bco-mac-dinh: nut lech");
		await bam(nutDong(o, "A"));
		await choUrl(() => url.has("expand"));
		if (danhSach("expand")?.join() !== "A")
			loi.push("bco-mac-dinh: expand lech");
		if (url.has("gap")) loi.push("bco-mac-dinh: gap lech");
		loi.push(...lechDanhSach(quetExpandable(), CO_EXPANDABLE));
		const moSan = CO_EXPANDABLE.filter((t) =>
			/moSan:\s*true/.test(readFileSync(join(GOC_APP, t), "utf8")),
		);
		loi.push(...lechDanhSach(moSan, CO_MO_SAN));
		expect(loi).toEqual([]);
	});

	test("bco-mac-dinh-do: mo san mac dinh thi gap-mac-dinh lech; tep la co expandable thi lech", async () => {
		const o = await ve(true);
		const loi: string[] = [];
		if (nutDong(o, "A")?.getAttribute("aria-expanded") !== "false")
			loi.push("bco-mac-dinh: gap-mac-dinh lech");
		expect(loi).toEqual(["bco-mac-dinh: gap-mac-dinh lech"]);
		writeFileSync(
			join(GOC_APP, TEP_GIA),
			"export const X = <DataTable expandable={{}} />;\n",
		);
		try {
			expect(lechDanhSach(quetExpandable(), CO_EXPANDABLE)).toEqual([
				`bco-mac-dinh: ${TEP_GIA} lech`,
			]);
		} finally {
			rmSync(join(GOC_APP, TEP_GIA), { force: true });
		}
	});
});
