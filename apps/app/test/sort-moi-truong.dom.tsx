import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { FIELD_TYPES, sapDuocTheoKieu } from "@crm/db/fields-shape";
import {
	QueryClient,
	QueryClientProvider,
	skipToken,
} from "@tanstack/react-query";
import { NuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	dealBoardOutput,
	dealListInput,
} from "../../api/src/deals/deals.contracts";
import { fieldListOutput } from "../../api/src/fields/fields.contracts";

type Json =
	| string
	| number
	| boolean
	| null
	| Json[]
	| { [khoa: string]: Json };
type DauVao = Json | undefined;
type Lay = (dauVao: DauVao) => unknown;

let daGoi: { duong: string; dauVao: DauVao }[] = [];
const duLieu = new Map<string, Lay>();

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
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws",
}));

const { ContactsTable, columnsFor: cotLienHe } = await import(
	"@/app/(app)/[slug]/contacts/contacts-table"
);
const { CompaniesTable, columnsFor: cotCongTy } = await import(
	"@/app/(app)/[slug]/companies/companies-table"
);
const { DealsTable, columnsFor: cotThoaThuan } = await import(
	"@/app/(app)/[slug]/deals/deals-table"
);
const { DealsBoard } = await import("@/app/(app)/[slug]/deals/deals-board");
const { dealsSearchParams } = await import(
	"@/app/(app)/[slug]/deals/deals-search-params"
);
const { KIEU_TRUONG, HienThiTruong } = await import(
	"@/components/crm/fields/kieu-truong"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { messages } = await import("@crm/ui/lib/messages");
const { contactMessages } = await import("@/lib/messages/contacts");
const { companyMessages } = await import("@/lib/messages/companies");
const { dealMessages } = await import("@/lib/messages/deals");

const ui = messages("vi").table;

const DAP_AN_SAP = {
	TEXT: true,
	LONG_TEXT: true,
	NUMBER: true,
	DATE: true,
	CHECKBOX: false,
	SELECT: true,
	URL: true,
	EMAIL: true,
	PHONE: true,
	USER: true,
} satisfies Record<(typeof FIELD_TYPES)[number], boolean>;

const DAP_AN_AN = {
	MONEY: "sm",
	NUMBER: "sm",
	USER: "md",
	URL: "md",
	EMAIL: "md",
	PHONE: "md",
	TEXT: "lg",
	LONG_TEXT: "lg",
	DATE: "lg",
	SELECT: "lg",
	CHECKBOX: "lg",
} as const;

const TRUONG = fieldListOutput.parse(
	FIELD_TYPES.map((kieu, i) => ({
		id: `f${i}`,
		entity: "DEAL",
		key: `t_${kieu.toLowerCase()}`,
		label: `Trường ${kieu}`,
		type: kieu,
		agentFilled: false,
		agentBrief: null,
		required: false,
		showOnSheet: true,
		showOnTable: true,
		showOnFilter: false,
		position: i,
		archived: false,
		options: [],
	})),
);

const BANG = [
	{ ten: "deals", man: () => <DealsTable />, list: "deals.list" },
	{ ten: "companies", man: () => <CompaniesTable />, list: "companies.list" },
	{ ten: "contacts", man: () => <ContactsTable />, list: "contacts.list" },
] as const;

function datChung(): void {
	duLieu.set("users.list", () => []);
	duLieu.set("fields.filters", () => []);
	duLieu.set("fields.list", () => TRUONG);
	duLieu.set("savedViews.list", () => []);
	duLieu.set("companies.options", () => []);
	duLieu.set("giaiDoan.list", () => ({
		stages: [
			{
				id: "DEMO_BOOKED",
				label: "Demo",
				kind: "OPEN",
				color: null,
				position: 0,
			},
		],
		canManage: false,
		tran: 0,
	}));
	for (const ten of ["contacts.list", "companies.list", "deals.list"]) {
		duLieu.set(ten, () => ({ rows: [], total: 0, facetCounts: {} }));
	}
	duLieu.set("onboarding.access", () => ({ canManage: false }));
}

let root: Root | null = null;
let khung: HTMLElement | null = null;
let url = new URLSearchParams();

beforeEach(() => {
	daGoi = [];
	duLieu.clear();
	url = new URLSearchParams();
	datChung();
});

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

async function cho(): Promise<void> {
	for (let i = 0; i < 6; i += 1) {
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
}

async function mo(man: ReactElement): Promise<HTMLElement> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	khung = o;
	root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root?.render(
			<NuqsTestingAdapter
				hasMemory
				searchParams=""
				onUrlUpdate={(e: UrlUpdateEvent) => {
					url = new URLSearchParams(e.queryString);
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

async function bamTro(el: Element | null | undefined): Promise<void> {
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

function tieuDe(o: HTMLElement, nhan: string): HTMLElement | null {
	return o.querySelector<HTMLElement>(`th[title="${nhan}"]`);
}

describe("smt-cot-sap", () => {
	test("smt-cot-sap: cột trường sắp được theo kiểu, bấm tiêu đề gửi sort", async () => {
		for (const kieu of FIELD_TYPES) {
			if (DAP_AN_SAP[kieu] !== sapDuocTheoKieu(kieu)) {
				throw new Error(`smt cot sap: dap an lech bang chung ${kieu}`);
			}
		}

		let soO = 0;
		for (const bang of BANG) {
			const o = await mo(bang.man());
			for (const field of TRUONG) {
				const th = tieuDe(o, field.label);
				if (!th)
					throw new Error(`smt cot sap: ${bang.ten} thieu cot ${field.type}`);
				const coNut = th.querySelector("button") !== null;
				if (coNut !== DAP_AN_SAP[field.type]) {
					throw new Error(
						`smt cot sap: ${bang.ten} ${field.type} ${coNut ? "co" : "khong"}`,
					);
				}
				soO += 1;
			}
			if (bang.ten === "contacts") {
				const phone = tieuDe(o, contactMessages("vi").headers.phone);
				if (!phone?.querySelector("button")) {
					throw new Error("smt cot sap: phone khong sap");
				}
			}
			act(() => root?.unmount());
			khung?.remove();
		}
		if (soO !== 30) throw new Error(`smt cot sap: thieu o ${soO}`);

		const chieuMacDinh = dealsSearchParams.config.defaultDir;
		const o = await mo(<DealsTable />);
		const nut = tieuDe(o, "Trường NUMBER")?.querySelector("button");
		await bamTro(nut);
		if (
			url.get("sort") !== "field:t_number" ||
			(url.get("dir") ?? chieuMacDinh) !== chieuMacDinh
		) {
			throw new Error(`smt cot sap: url ${url.toString()}`);
		}
		const cuoi = daGoi.filter((g) => g.duong === "deals.list").at(-1)?.dauVao;
		const vao = dealListInput.parse(cuoi);
		if (vao.sort !== "field:t_number" || vao.dir !== chieuMacDinh) {
			throw new Error(`smt cot sap: tai ${JSON.stringify(cuoi)}`);
		}

		const nutMenu = [...document.body.querySelectorAll("button")].find(
			(b) => (b.textContent ?? "").trim() === ui.sort,
		);
		await bamTro(nutMenu);
		const muc = [
			...document.body.querySelectorAll('[role="menuitemradio"]'),
		].map((el) => (el.textContent ?? "").trim());
		if (!muc.includes("Trường NUMBER"))
			throw new Error("smt cot sap: menu thieu");
		expect(soO).toBe(30);
	});
});

describe("smt-an-theo-kieu", () => {
	test("smt-an-theo-kieu: cột ẩn dưới khổ theo kiểu, chuẩn và tự tạo cùng bảng", async () => {
		let soO = 0;
		for (const [kieu, mong] of Object.entries(DAP_AN_AN)) {
			const thuc = KIEU_TRUONG[kieu as keyof typeof KIEU_TRUONG].anDuoi;
			if (thuc !== mong)
				throw new Error(`smt an theo kieu: bang ${kieu} ${thuc}`);
			soO += 1;
		}

		for (const bang of BANG) {
			const o = await mo(bang.man());
			for (const field of TRUONG) {
				const th = tieuDe(o, field.label);
				const lop = th?.className ?? "";
				const mong = DAP_AN_AN[field.type];
				if (!lop.split(/\s+/).includes(`${mong}:table-cell`)) {
					throw new Error(
						`smt an theo kieu: tu tao ${bang.ten} ${field.type} ${lop}`,
					);
				}
				soO += 1;
			}
			act(() => root?.unmount());
			khung?.remove();
		}

		const deals = cotThoaThuan(dealMessages("vi"));
		const companies = cotCongTy(companyMessages("vi"), "vi");
		const contacts = cotLienHe(contactMessages("vi"));
		const DAP_AN_CHUAN: [
			string,
			typeof deals | typeof companies | typeof contacts,
			string,
			string | undefined,
		][] = [
			["deals", deals, "amount", "sm"],
			["deals", deals, "owner", "md"],
			["deals", deals, "expectedCloseDate", "lg"],
			["deals", deals, "name", undefined],
			["companies", companies, "domain", "md"],
			["companies", companies, "owner", "md"],
			["companies", companies, "name", undefined],
			["contacts", contacts, "phone", "md"],
			["contacts", contacts, "title", "lg"],
			["contacts", contacts, "email", "md"],
			["contacts", contacts, "owner", "md"],
			["contacts", contacts, "name", undefined],
		];
		for (const [ten, cot, id, mong] of DAP_AN_CHUAN) {
			const thuc = cot.find((c) => c.id === id)?.hideBelow;
			if (thuc !== mong)
				throw new Error(`smt an theo kieu: chuan ${ten} ${id} ${thuc}`);
			soO += 1;
		}
		if (soO !== 11 + 30 + 12)
			throw new Error(`smt an theo kieu: thieu o ${soO}`);
		expect(soO).toBe(53);
	});
});

describe("smt-the-kanban", () => {
	test("smt-the-kanban: thẻ hiện hai trường tự tạo đầu có giá trị", async () => {
		const goc = JSON.parse(
			readFileSync(
				join(import.meta.dir, "fixtures", "deals-board-dem-tong.json"),
				"utf8",
			),
		);
		const cot = goc.columns[0];
		const [a, b] = cot.cards;
		const bang = dealBoardOutput.parse({
			...goc,
			columns: [
				{
					...cot,
					cards: [
						{
							...a,
							name: "The A smt",
							fields: { smt_the_so: 1234.5, smt_the_ngay: "2026-11-05" },
						},
						{
							...b,
							name: "The B smt",
							fields: { smt_the_so: null, smt_the_ngay: "2026-11-05" },
						},
					],
				},
			],
		});
		const truongThe = fieldListOutput.parse(
			[
				["smt_the_so", "Số thẻ", "NUMBER"],
				["smt_the_ngay", "Ngày thẻ", "DATE"],
				["smt_the_ba", "Ba thẻ", "TEXT"],
			].map(([key, label, type], i) => ({
				id: `the${i}`,
				entity: "DEAL",
				key,
				label,
				type,
				agentFilled: false,
				agentBrief: null,
				required: false,
				showOnSheet: true,
				showOnTable: true,
				showOnFilter: false,
				position: i,
				archived: false,
				options: [],
			})),
		);
		duLieu.set("deals.board", () => bang);
		duLieu.set("fields.list", () => truongThe);
		duLieu.set("giaiDoan.list", () => ({
			stages: [
				{
					id: cot.stage,
					label: "Demo",
					kind: "OPEN",
					color: null,
					position: 0,
				},
			],
			canManage: false,
			tran: 0,
		}));

		const doiChung = await mo(
			<HienThiTruong kieu="DATE" giaTri="2026-11-05" />,
		);
		const chuNgay = (doiChung.textContent ?? "").trim();
		act(() => root?.unmount());
		khung?.remove();

		const o = await mo(
			<DealsBoard
				input={{
					q: "",
					sort: "",
					dir: "asc",
					owner: [],
					closing: [],
					fields: {},
				}}
			/>,
		);
		const the = (ten: string) =>
			[...o.querySelectorAll<HTMLElement>("[data-open-deal]")].find((el) =>
				(el.textContent ?? "").includes(ten),
			)?.parentElement ?? null;
		const theA = the("The A smt");
		const theB = the("The B smt");
		if (!theA || !theB) throw new Error("smt the kanban: doi chung thieu the");

		const dong = (theEl: HTMLElement, nhan: string) =>
			[...theEl.querySelectorAll<HTMLElement>("span")].find(
				(s) => s.firstElementChild?.textContent === nhan,
			) ?? null;

		const soA = dong(theA, "Số thẻ");
		const giaSo = soA?.querySelector(".tabular-nums");
		if (!soA || !giaSo || !(giaSo.textContent ?? "").includes("1.234,5")) {
			throw new Error(`smt the kanban: A so ${soA?.textContent ?? ""}`);
		}
		const ngayA = dong(theA, "Ngày thẻ");
		if (!ngayA || !(ngayA.textContent ?? "").includes(chuNgay)) {
			throw new Error(`smt the kanban: A ngay ${ngayA?.textContent ?? ""}`);
		}
		if ((theA.textContent ?? "").includes("Ba thẻ")) {
			throw new Error("smt the kanban: truong thu ba");
		}
		if (dong(theB, "Số thẻ"))
			throw new Error("smt the kanban: B trong van hien");
		if (!dong(theB, "Ngày thẻ"))
			throw new Error("smt the kanban: B thieu ngay");
		expect(chuNgay.length).toBeGreaterThan(0);
	});
});
