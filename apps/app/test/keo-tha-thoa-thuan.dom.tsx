import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { BoardProps } from "@crm/ui/components/board";
import { formatMoney } from "@crm/ui/lib/format";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing";
import { act, createElement as h, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { DealBoardQueryInput } from "@/app/(app)/[slug]/deals/deals-search-params";
import type { DealBoard } from "@/app/(app)/[slug]/deals/use-deal-board-move";
import { dealBoardOutput } from "../../api/src/deals/deals.contracts";

type DealStage = string;
type BoardData = DealBoard;
type Column = BoardData["columns"][number];
type Card = Column["cards"][number];
type BoardInput = DealBoardQueryInput;
type StageWrite = { id: string; stage: DealStage; closedReason?: string };
type MutationHooks = { onSuccess?: unknown; onError?: unknown };

const FIXTURES = join(import.meta.dir, "fixtures");
const docFixture = (ten: string): BoardData =>
	dealBoardOutput.parse(JSON.parse(readFileSync(join(FIXTURES, ten), "utf8")));

const LOI_MAY_CHU = "Khong duoc doi.";

let boardState: BoardData = docFixture("deals-board-dem-tong.json");
let boardMode: "ok" | "loi" | "treo" = "ok";
let setStageMode: "ok" | "loi" | "treo" | "treo-loi" = "ok";
let moTreoGhi: (() => void) | null = null;
let boardInputs: BoardInput[] = [];
let setStageCalls: StageWrite[] = [];
let openCalls: { kind: string; id: string }[] = [];
let toastErrors: string[] = [];
let urlUpdates: URLSearchParams[] = [];

function column(stage: DealStage): Column {
	const found = boardState.columns.find((c) => c.stage === stage);
	if (!found) throw new Error(`thieu cot ${stage}`);
	return found;
}

function dichChuyenMayChu(id: string, stage: DealStage) {
	const from = boardState.columns.find((c) => c.cards.some((x) => x.id === id));
	if (!from) return;
	const card = from.cards.find((x) => x.id === id);
	if (!card) return;
	const to = column(stage);
	from.cards = from.cards.filter((x) => x.id !== id);
	from.count -= 1;
	to.cards = [{ ...card, stage }, ...to.cards];
	to.count += 1;
}

function thuTuc<TVao, TRa>(
	ten: string,
	doc: (v: TVao) => TRa | Promise<TRa>,
	viet?: (v: TVao) => Promise<unknown>,
) {
	return {
		queryKey: (v?: TVao) => (v === undefined ? [ten] : [ten, v]),
		pathKey: () => [ten],
		queryOptions: (v: TVao) => ({
			queryKey: v === undefined ? [ten] : [ten, v],
			queryFn: async () => doc(v),
		}),
		mutationOptions: (tuyChon?: MutationHooks) => ({
			mutationKey: [ten],
			mutationFn: viet ?? (async () => undefined),
			...tuyChon,
		}),
	};
}

const rong = () => [];

const GIAI_DOAN_GOC_THU = {
	canManage: true,
	tran: 20,
	stages: (
		[
			["DEMO_BOOKED", "Demo booked", "OPEN", 0],
			["QUALIFIED_TO_BUY", "Qualified to buy", "OPEN", 1],
			["DECISION_MAKER_BOUGHT_IN", "Decision maker in", "OPEN", 2],
			["CONTRACT_SENT", "Contract sent", "OPEN", 3],
			["CLOSED_WON", "Closed won", "WON", 0],
			["CLOSED_LOST", "Closed lost", "LOST", 0],
			["UNQUALIFIED_TO_BUY", "Unqualified", "LOST", 1],
		] as const
	).map(([id, label, kind, position]) => ({
		id,
		label,
		kind,
		position,
		dealCount: 0,
	})),
};

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		deals: {
			list: thuTuc("deals.list", () => ({
				rows: [],
				total: 0,
				facetCounts: {},
				openValueCents: null,
				reportingCurrency: "USD",
				unconverted: { count: 0, currencies: [] },
			})),
			board: thuTuc("deals.board", (v: BoardInput) => {
				boardInputs.push(v);
				if (boardMode === "loi") throw new Error("hong");
				if (boardMode === "treo") return new Promise(() => {});
				return structuredClone(boardState);
			}),
			setStage: thuTuc("deals.setStage", rong, async (v: StageWrite) => {
				setStageCalls.push(v);
				if (setStageMode === "loi") throw new Error(LOI_MAY_CHU);
				if (setStageMode === "treo" || setStageMode === "treo-loi") {
					await new Promise<void>((xong) => {
						moTreoGhi = xong;
					});
				}
				if (setStageMode === "treo-loi") throw new Error(LOI_MAY_CHU);
				dichChuyenMayChu(v.id, v.stage);
				return { id: v.id, stage: v.stage };
			}),
			byId: thuTuc("deals.byId", rong),
		},
		giaiDoan: {
			list: thuTuc("giaiDoan.list", () => GIAI_DOAN_GOC_THU),
		},
		users: { list: thuTuc("users.list", rong) },
		fields: {
			list: thuTuc("fields.list", rong),
			filters: thuTuc("fields.filters", rong),
		},
		savedViews: {
			list: thuTuc("savedViews.list", rong),
			create: thuTuc("savedViews.create", rong),
			update: thuTuc("savedViews.update", rong),
			delete: thuTuc("savedViews.delete", rong),
		},
	}),
}));

let queryClient: QueryClient;

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({
		deal: () => queryClient.invalidateQueries(),
	}),
}));

mock.module("@/components/crm/record-sheet/record-stack", () => ({
	useOpenRecord: () => (ref: { kind: string; id: string }) => {
		openCalls.push(ref);
	},
}));

mock.module("@/components/crm/record-sheet/record-prefetch", () => ({
	usePrefetchRecord: () => () => undefined,
}));

mock.module("sonner", () => ({
	toast: Object.assign(() => undefined, {
		error: (m: string) => toastErrors.push(m),
		success: () => undefined,
	}),
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws/deals",
}));

const realBoard = await import("@crm/ui/components/board");
const RealBoard = realBoard.Board;
let lastBoard: BoardProps | null = null;
mock.module("@crm/ui/components/board", () => ({
	...realBoard,
	Board: (p: BoardProps) => {
		lastBoard = p;
		return h(RealBoard, p);
	},
}));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { DealsTable } = await import("@/app/(app)/[slug]/deals/deals-table");
const { CloseReasonDialog } = await import("@/components/crm/stage-change");
const { crmMessages } = await import("@/lib/messages/crm");
const { dealMessages } = await import("@/lib/messages/deals");

let root: Root | null = null;
let khung: HTMLElement | null = null;

async function cho(n = 6) {
	for (let i = 0; i < n; i += 1) {
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
}

async function dung(search: string, locale: "vi" | "en" = "vi") {
	queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	const cay: ReactNode = (
		<NuqsTestingAdapter
			searchParams={search}
			onUrlUpdate={(e: UrlUpdateEvent) => {
				urlUpdates.push(e.searchParams);
			}}
			hasMemory
		>
			<QueryClientProvider client={queryClient}>
				<LocaleProvider locale={locale}>
					<DealsTable />
					<CloseReasonDialog />
				</LocaleProvider>
			</QueryClientProvider>
		</NuqsTestingAdapter>
	);
	await act(async () => root?.render(cay));
	await cho();
	if (!khung) throw new Error("khong co khung");
	return khung;
}

function cotCua(k: HTMLElement, stage: string) {
	const el = k.querySelector(`[data-board-column="${stage}"]`);
	if (!el) throw new Error(`khong thay cot ${stage}`);
	return el as HTMLElement;
}

function theTrongCot(k: HTMLElement, stage: string) {
	return [...cotCua(k, stage).querySelectorAll("[data-board-card]")].map((el) =>
		el.getAttribute("data-board-card"),
	);
}

function motThe(stage: DealStage): Card {
	const card = column(stage).cards[0];
	if (!card) throw new Error(`cot ${stage} rong`);
	return card;
}

async function tha(cardId: string, from: string, to: string) {
	if (!lastBoard?.onMove) throw new Error("bang cot khong nhan onMove");
	await act(async () => lastBoard?.onMove?.({ cardId, from, to }));
}

beforeEach(() => {
	boardState = docFixture("deals-board-dem-tong.json");
	boardMode = "ok";
	setStageMode = "ok";
	moTreoGhi = null;
	boardInputs = [];
	setStageCalls = [];
	openCalls = [];
	toastErrors = [];
	urlUpdates = [];
	lastBoard = null;
});

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
});

const THU_TU = [
	"DEMO_BOOKED",
	"QUALIFIED_TO_BUY",
	"DECISION_MAKER_BOUGHT_IN",
	"CONTRACT_SENT",
	"CLOSED_WON",
	"CLOSED_LOST",
	"UNQUALIFIED_TO_BUY",
];

describe("chuyen-cach-xem", () => {
	test("bam Bang cot thi co bay cot dung thu tu, tai lai van giu", async () => {
		const m = dealMessages("vi");
		const k = await dung("");
		expect(k.querySelector("[data-board-column]")).toBeNull();
		const nut = [...k.querySelectorAll("button")].find(
			(b) => b.textContent === m.view.board,
		);
		if (!nut) throw new Error("khong co nut Bang cot");
		await act(async () => nut.click());
		await cho();
		expect(urlUpdates.at(-1)?.get("view")).toBe("board");
		const cot = [...k.querySelectorAll("[data-board-column]")].map((el) =>
			el.getAttribute("data-board-column"),
		);
		for (const [i, stage] of THU_TU.entries()) {
			if (cot[i] !== stage)
				throw new Error(`cot ${i + 1}: ${cot[i]} != ${stage}`);
		}
		expect(k.querySelector('input[type="search"], input')).not.toBeNull();
		act(() => root?.unmount());
		khung?.remove();
		const lai = await dung("?view=board");
		expect(lai.querySelectorAll("[data-board-column]").length).toBe(7);
	});

	test("luu tru: nut chuyen khoa, bang cot khong hien", async () => {
		const k = await dung("?view=board&archived=true");
		if (k.querySelector("[data-board-column]")) {
			throw new Error("luu tru: bang cot van hien");
		}
		const nhom = k.querySelector(
			`[aria-label="${dealMessages("vi").view.label}"]`,
		);
		const nut = [...(nhom?.querySelectorAll("button") ?? [])];
		expect(nut.length).toBe(2);
		expect(nut.every((b) => b.disabled)).toBe(true);
		const doiChung = await dungLai("?view=board");
		expect(doiChung.querySelectorAll("[data-board-column]").length).toBe(7);
	});
});

async function dungLai(search: string) {
	act(() => root?.unmount());
	khung?.remove();
	return dung(search);
}

describe("tha-goi-setstage", () => {
	test("tha sang cot mo: the doi ngay, goi setStage mot lan, mo khi dang luu", async () => {
		setStageMode = "treo";
		const k = await dung("?view=board");
		const the = motThe("DEMO_BOOKED");
		await tha(the.id, "DEMO_BOOKED", "DECISION_MAKER_BOUGHT_IN");
		await cho(2);
		if (!theTrongCot(k, "DECISION_MAKER_BOUGHT_IN").includes(the.id)) {
			throw new Error("the chua o cot B khi dang luu");
		}
		expect(setStageCalls).toEqual([
			{ id: the.id, stage: "DECISION_MAKER_BOUGHT_IN" },
		]);
		const item = k.querySelector(
			`[data-board-card="${the.id}"]`,
		) as HTMLElement | null;
		expect(item?.getAttribute("data-disabled")).toBe("true");
		await act(async () => moTreoGhi?.());
		await cho();
		expect(
			item?.isConnected ? item.getAttribute("data-disabled") : "false",
		).not.toBe("true");
	});

	test("tha vao Closed won goi thang, khong mo hop thoai", async () => {
		await dung("?view=board");
		const the = motThe("DEMO_BOOKED");
		await tha(the.id, "DEMO_BOOKED", "CLOSED_WON");
		await cho();
		expect(setStageCalls).toEqual([{ id: the.id, stage: "CLOSED_WON" }]);
		expect(urlUpdates.some((u) => u.has("closeDeal"))).toBe(false);
	});

	test("ba ca khong gui gi: cung cot, khong dich, huy", async () => {
		const k = await dung("?view=board");
		const the = motThe("DEMO_BOOKED");
		await tha(the.id, "DEMO_BOOKED", "DEMO_BOOKED");
		await tha(the.id, "DEMO_BOOKED", "KHONG_CO_COT");
		await cho();
		if (setStageCalls.length !== 0) {
			throw new Error(`cung cot: setStage goi ${setStageCalls.length} lan`);
		}
		expect(theTrongCot(k, "DEMO_BOOKED")).toContain(the.id);
	});
});

describe("tha-vao-cot-thua", () => {
	function hopThoai() {
		return document.querySelector('[role="dialog"]');
	}

	async function go(o: HTMLTextAreaElement, gia: string) {
		const setter = Object.getOwnPropertyDescriptor(
			HTMLTextAreaElement.prototype,
			"value",
		)?.set;
		await act(async () => {
			setter?.call(o, gia);
			o.dispatchEvent(new Event("input", { bubbles: true }));
		});
	}

	for (const cot of ["CLOSED_LOST", "UNQUALIFIED_TO_BUY"] as const) {
		test(`${cot} luu: chua ghi truoc khi co ly do, luu thi ghi kem ly do`, async () => {
			const m = crmMessages("vi");
			const k = await dung("?view=board");
			const the = motThe("DEMO_BOOKED");
			await tha(the.id, "DEMO_BOOKED", cot);
			await cho();
			if (setStageCalls.length !== 0) {
				throw new Error("cot thua: ghi truoc khi co ly do");
			}
			const hop = hopThoai();
			if (!hop) throw new Error("cot thua: hop thoai ly do khong mo");
			expect(theTrongCot(k, "DEMO_BOOKED")).toContain(the.id);
			const o = hop.querySelector("textarea");
			if (!(o instanceof HTMLTextAreaElement)) throw new Error("thieu o ly do");
			await go(o, "Het ngan sach");
			const luu = [...hop.querySelectorAll("button")].find(
				(b) => b.textContent?.trim() === m.close.save,
			);
			await act(async () => luu?.click());
			await cho();
			expect(setStageCalls).toEqual([
				{ id: the.id, stage: cot, closedReason: "Het ngan sach" },
			]);
			expect(theTrongCot(k, cot)).toContain(the.id);
		});

		test(`${cot} huy: khong ghi gi, the o cot cu`, async () => {
			const m = crmMessages("vi");
			const k = await dung("?view=board");
			const the = motThe("DEMO_BOOKED");
			await tha(the.id, "DEMO_BOOKED", cot);
			await cho();
			const hop = hopThoai();
			if (!hop) throw new Error("cot thua: hop thoai ly do khong mo");
			const huy = [...hop.querySelectorAll("button")].find(
				(b) => b.textContent?.trim() === m.sheet.cancel,
			);
			await act(async () => huy?.click());
			await cho();
			expect(setStageCalls).toEqual([]);
			expect(hopThoai()).toBeNull();
			expect(theTrongCot(k, "DEMO_BOOKED")).toContain(the.id);
		});
	}
});

describe("tu-choi-ve-cho-cu", () => {
	test("may chu tu choi: the ve cot cu, bao dung cau loi", async () => {
		setStageMode = "loi";
		const k = await dung("?view=board");
		const the = motThe("DEMO_BOOKED");
		await tha(the.id, "DEMO_BOOKED", "CONTRACT_SENT");
		await cho();
		if (theTrongCot(k, "CONTRACT_SENT").includes(the.id)) {
			throw new Error("tu choi: the van o cot moi");
		}
		expect(theTrongCot(k, "DEMO_BOOKED")).toContain(the.id);
		expect(toastErrors).toEqual([LOI_MAY_CHU]);
	});

	test("doi chung: may chu nhan thi the o cot moi, khong bao loi", async () => {
		const k = await dung("?view=board");
		const the = motThe("DEMO_BOOKED");
		await tha(the.id, "DEMO_BOOKED", "CONTRACT_SENT");
		await cho();
		expect(theTrongCot(k, "CONTRACT_SENT")).toContain(the.id);
		expect(toastErrors).toEqual([]);
	});
});

describe("menu-giai-doan", () => {
	function phim(el: Element, key: string) {
		el.dispatchEvent(
			new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
		);
	}

	async function chonBangPhim(k: HTMLElement, cardId: string, nhan: string) {
		const el = k.querySelector(`[data-board-card="${cardId}"]`);
		const menu = el?.querySelector('[aria-haspopup="menu"]');
		if (!(menu instanceof HTMLElement)) {
			throw new Error("the khong co menu giai doan");
		}
		if (menu.closest('[role="button"]')) {
			throw new Error("menu giai doan nam trong tay keo");
		}
		await act(async () => {
			menu.focus();
			phim(menu, "Enter");
		});
		await cho(2);
		const muc = [...document.querySelectorAll('[role="menuitemradio"]')].find(
			(m) => m.textContent?.trim() === nhan,
		);
		if (!(muc instanceof HTMLElement)) {
			throw new Error(`menu khong mo bang ban phim (thieu muc ${nhan})`);
		}
		await act(async () => {
			muc.focus();
			phim(muc, "Enter");
		});
		await cho();
	}

	test("chon giai doan mo bang ban phim: ghi mot lan, the sang cot moi", async () => {
		const k = await dung("?view=board");
		const the = motThe("DEMO_BOOKED");
		await chonBangPhim(k, the.id, "Qualified to buy");
		expect(setStageCalls).toEqual([{ id: the.id, stage: "QUALIFIED_TO_BUY" }]);
		expect(theTrongCot(k, "QUALIFIED_TO_BUY")).toContain(the.id);
	});

	test("chon Closed lost bang ban phim: mo hop thoai ly do, chua ghi", async () => {
		const k = await dung("?view=board");
		const the = motThe("DEMO_BOOKED");
		await chonBangPhim(k, the.id, "Closed lost");
		expect(setStageCalls).toEqual([]);
		const cuoi = urlUpdates.at(-1);
		expect(cuoi?.get("closeDeal")).toBe(the.id);
		expect(cuoi?.get("closeStage")).toBe("CLOSED_LOST");
	});
});

describe("bam-mo-tam", () => {
	test("bam than the mo tam, bam menu thi khong", async () => {
		const k = await dung("?view=board");
		const the = motThe("DEMO_BOOKED");
		const el = k.querySelector(`[data-board-card="${the.id}"]`);
		const menu = el?.querySelector(
			'[aria-haspopup="menu"]',
		) as HTMLElement | null;
		await act(async () => menu?.click());
		if (openCalls.length !== 0) throw new Error("bam menu mo tam");
		const mo = el?.querySelector("[data-open-deal]") as HTMLElement | null;
		await act(async () => mo?.click());
		expect(openCalls).toEqual([{ kind: "deal", id: the.id }]);
	});
});

describe("tai-va-loi", () => {
	test("dang tai: o tim va nut chuyen van hien, co dau dang tai", async () => {
		boardMode = "treo";
		const m = dealMessages("vi");
		const k = await dung("?view=board");
		if (!k.querySelector("input")) throw new Error("dang tai: mat o tim");
		expect(k.querySelector('[role="group"]')).not.toBeNull();
		expect(
			k.querySelector('[data-trang-thai="ST-bangcot-dangtai"]'),
		).not.toBeNull();
		expect(k.textContent).toContain(m.board.loading);
	});

	test("loi: loi va Thu lai trong vung bang, bam thi goi lai", async () => {
		boardMode = "loi";
		const m = dealMessages("vi");
		const k = await dung("?view=board");
		if (!k.querySelector("input")) throw new Error("loi: mat o tim");
		const vung = k.querySelector('[data-trang-thai="ST-bangcot-loitai"]');
		expect(vung?.textContent).toContain(m.board.errorTitle);
		const truoc = boardInputs.length;
		const nut = [...(vung?.querySelectorAll("button") ?? [])].find(
			(b) => b.textContent === m.board.retry,
		);
		boardMode = "ok";
		await act(async () => nut?.click());
		await cho();
		expect(boardInputs.length).toBe(truoc + 1);
		expect(k.querySelectorAll("[data-board-column]").length).toBe(7);
	});
});

describe("loc-vao-board", () => {
	const ca: [string, string, (v: BoardInput) => unknown, unknown][] = [
		["q", "?view=board&q=alpha", (v) => v.q, "alpha"],
		["owner", "?view=board&owner=u-1", (v) => v.owner, ["u-1"]],
		["closing", "?view=board&closing=overdue", (v) => v.closing, ["overdue"]],
		[
			"fields",
			`?view=board&fields=${encodeURIComponent(JSON.stringify({ k: ["o1"] }))}`,
			(v) => v.fields,
			{ k: ["o1"] },
		],
		[
			"sort",
			"?view=board&sort=name&dir=asc",
			(v) => [v.sort, v.dir],
			["name", "asc"],
		],
	];
	for (const [ten, search, lay, mong] of ca) {
		test(`${ten} di vao input board`, async () => {
			await dung(search);
			const v = boardInputs.at(-1);
			if (!v) throw new Error(`input board thieu ${ten}`);
			if (JSON.stringify(lay(v)) !== JSON.stringify(mong)) {
				throw new Error(`input board thieu ${ten}: ${JSON.stringify(lay(v))}`);
			}
		});
	}
	test("input board khong co stage, status, page", async () => {
		await dung("?view=board&stage=CLOSED_WON&status=open&page=2");
		const v = boardInputs.at(-1) ?? {};
		expect(["stage", "status", "page"].filter((k) => k in v)).toEqual([]);
	});
});

describe("dau-cot", () => {
	test("dau cot lay tu dau ra that cua may chu", async () => {
		const k = await dung("?view=board");
		let dem = 0;
		for (const col of boardState.columns) {
			const h3 = cotCua(k, col.stage).querySelector("h3");
			const chu = h3?.textContent ?? "";
			if (!chu.includes(String(col.count))) {
				throw new Error(`cot ${col.stage}: hien ${chu} thieu ${col.count}`);
			}
			dem += 1;
			const tien = new Intl.NumberFormat("vi-VN").format(
				Math.trunc((col.valueCents ?? 0) / 100),
			);
			expect(chu.replace(/\s/g, " ")).toContain(tien.replace(/\s/g, " "));
			dem += 1;
		}
		expect(dem).toBe(14);
	});

	test("thoa thuan chua quy doi duoc noi ra, khong bien tong thanh 0", async () => {
		const m = dealMessages("vi");
		const tien0 = new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: boardState.reportingCurrency,
		}).format(0);
		const cotChf = column("CONTRACT_SENT");
		cotChf.valueCents = null;
		cotChf.unconverted = { count: 2, currencies: ["CHF"] };
		const k = await dung("?view=board");
		const demo = column("DEMO_BOOKED");
		const chuDemo =
			cotCua(k, "DEMO_BOOKED").querySelector("h3")?.textContent ?? "";
		const bao = m.meta.notCounted(
			String(demo.unconverted.count),
			demo.unconverted.currencies.join(", "),
		);
		if (!chuDemo.includes(bao)) {
			throw new Error(
				`cot DEMO_BOOKED: thieu loi bao chua quy doi (${chuDemo})`,
			);
		}
		const chuChf =
			cotCua(k, "CONTRACT_SENT").querySelector("h3")?.textContent ?? "";
		if (chuChf.includes(tien0)) {
			throw new Error(`cot CONTRACT_SENT: tong rong bi in thanh ${tien0}`);
		}
		expect(chuChf).toContain(m.meta.notCounted("2", "CHF"));
	});

	test("cot 53 co +3, cot 50 thi khong", async () => {
		boardState = docFixture("deals-board-tran-50.json");
		const k = await dung("?view=board");
		const cot = cotCua(k, "QUALIFIED_TO_BUY");
		const hien = cot.querySelectorAll("[data-board-card]").length;
		if (hien !== 50)
			throw new Error(`cot QUALIFIED_TO_BUY: hien ${hien} != 50`);
		const soDauCot = cot.querySelector("h3 span span:last-child")?.textContent;
		if (soDauCot !== "53") {
			throw new Error(`cot QUALIFIED_TO_BUY: hien ${soDauCot} != 53`);
		}
		expect(cot.textContent).toContain("còn 3 thẻ");
		act(() => root?.unmount());
		khung?.remove();
		const c = column("QUALIFIED_TO_BUY");
		c.count = 50;
		const lai = await dung("?view=board");
		expect(cotCua(lai, "QUALIFIED_TO_BUY").textContent).not.toContain("còn");
	});

	test("luu xong thi dau hai cot doi so khong can tai lai", async () => {
		const k = await dung("?view=board");
		const truocA = column("DEMO_BOOKED").count;
		const truocB = column("QUALIFIED_TO_BUY").count;
		const the = motThe("DEMO_BOOKED");
		await tha(the.id, "DEMO_BOOKED", "QUALIFIED_TO_BUY");
		await cho();
		const soDau = (stage: string) =>
			cotCua(k, stage).querySelector("h3 span span:last-child")?.textContent;
		expect(soDau("DEMO_BOOKED")).toBe(String(truocA - 1));
		expect(soDau("QUALIFIED_TO_BUY")).toBe(String(truocB + 1));
	});
});

describe("tro-nang", () => {
	test("ten thoa thuan va cong ty khong bi tu dich", async () => {
		const k = await dung("?view=board");
		const the = [...k.querySelectorAll("[data-board-card]")];
		expect(the.length).toBeGreaterThan(0);
		for (const el of the) {
			const nut = el.querySelector("[data-open-deal]");
			const khongDich = nut?.querySelectorAll('[translate="no"]') ?? [];
			if (khongDich.length !== 2) {
				throw new Error("the: ten cong ty thieu translate=no");
			}
			expect(el.querySelectorAll('[role="button"] button').length).toBe(0);
			expect(
				el
					.querySelector('[data-slot="kanban-item-handle"]')
					?.getAttribute("tabindex"),
			).toBe("0");
		}
	});

	test("loi bao cho trinh doc man hinh theo tieng cua man", () => {
		const vi = dealMessages("vi").board;
		const en = dealMessages("en").board;
		const cap: [string, string][] = [
			[vi.pickedUp("X"), en.pickedUp("X")],
			[vi.over("Y"), en.over("Y")],
			[vi.dropped("Y"), en.dropped("Y")],
		];
		for (const [a, b] of cap) {
			expect(a).not.toBe(b);
			expect(a.length).toBeGreaterThan(0);
		}
		expect(cap.length * 2).toBe(6);
	});
});

function dauCot(k: HTMLElement, stage: string) {
	return cotCua(k, stage).querySelector("h3")?.textContent ?? "";
}

function soDauCot(k: HTMLElement, stage: string) {
	return cotCua(k, stage).querySelector("h3 span span:last-child")?.textContent;
}

function theDemo(counted: boolean): Card {
	const card = column("DEMO_BOOKED").cards.find(
		(c) => c.counted === counted && c.amountCents !== null,
	);
	if (!card)
		throw new Error(`fixture thieu the DEMO_BOOKED counted=${counted}`);
	return card;
}

describe("dang-luu-dau-cot", () => {
	test("the duoc tinh: dau hai cot doi ngay, cot cu khong hien con", async () => {
		setStageMode = "treo";
		const k = await dung("?view=board");
		const cu = structuredClone(column("DEMO_BOOKED"));
		const moi = structuredClone(column("QUALIFIED_TO_BUY"));
		const the = theDemo(true);
		await tha(the.id, "DEMO_BOOKED", "QUALIFIED_TO_BUY");
		await cho(2);
		const soCu = soDauCot(k, "DEMO_BOOKED");
		if (soCu !== String(cu.count - 1)) {
			throw new Error(
				`dang luu: cot DEMO_BOOKED hien ${soCu} != ${cu.count - 1}`,
			);
		}
		expect(soDauCot(k, "QUALIFIED_TO_BUY")).toBe(String(moi.count + 1));
		const tong = (cents: number) =>
			formatMoney(cents, boardState.reportingCurrency, "vi").replace(
				/\s/g,
				" ",
			);
		expect(dauCot(k, "DEMO_BOOKED").replace(/\s/g, " ")).toContain(
			tong((cu.valueCents ?? 0) - (the.baseAmountCents ?? 0)),
		);
		expect(dauCot(k, "QUALIFIED_TO_BUY").replace(/\s/g, " ")).toContain(
			tong(the.baseAmountCents ?? 0),
		);
		if (cotCua(k, "DEMO_BOOKED").textContent?.includes("còn")) {
			throw new Error("dang luu: cot DEMO_BOOKED co dong còn 1 thẻ");
		}
		await act(async () => moTreoGhi?.());
		await cho();
		expect(soDauCot(k, "DEMO_BOOKED")).toBe(
			String(column("DEMO_BOOKED").count),
		);
		expect(soDauCot(k, "QUALIFIED_TO_BUY")).toBe(
			String(column("QUALIFIED_TO_BUY").count),
		);
	});

	test("the chua quy doi: loi chua quy doi doi cot, cot moi tong rong nhu may chu tra", async () => {
		setStageMode = "treo";
		const m = dealMessages("vi");
		const k = await dung("?view=board");
		const the = theDemo(false);
		const bao = m.meta.notCounted("1", the.currency);
		if (!dauCot(k, "DEMO_BOOKED").includes(bao)) {
			throw new Error(
				"doi chung: cot DEMO_BOOKED truoc khi tha thieu loi chua quy doi",
			);
		}
		expect(dauCot(k, "QUALIFIED_TO_BUY")).not.toContain(the.currency);
		const tongCu = formatMoney(
			column("DEMO_BOOKED").valueCents ?? 0,
			boardState.reportingCurrency,
			"vi",
		).replace(/\s/g, " ");
		const tongMoi = formatMoney(
			column("QUALIFIED_TO_BUY").valueCents ?? 0,
			boardState.reportingCurrency,
			"vi",
		).replace(/\s/g, " ");
		expect(dauCot(k, "DEMO_BOOKED").replace(/\s/g, " ")).toContain(tongCu);
		expect(dauCot(k, "QUALIFIED_TO_BUY").replace(/\s/g, " ")).toContain(
			tongMoi,
		);
		await tha(the.id, "DEMO_BOOKED", "QUALIFIED_TO_BUY");
		await cho(2);
		if (!dauCot(k, "QUALIFIED_TO_BUY").includes(bao)) {
			throw new Error(`dang luu: cot QUALIFIED_TO_BUY thieu ${the.currency}`);
		}
		expect(dauCot(k, "DEMO_BOOKED")).not.toContain(the.currency);
		expect(dauCot(k, "DEMO_BOOKED").replace(/\s/g, " ")).toContain(tongCu);
		expect(dauCot(k, "QUALIFIED_TO_BUY").replace(/\s/g, " ")).not.toContain(
			tongMoi,
		);
		await act(async () => moTreoGhi?.());
		await cho();
	});
});

describe("loi-tra-dau-cot", () => {
	test("may chu tu choi: dau ca bay cot ve dung nhu truoc khi keo", async () => {
		setStageMode = "treo-loi";
		const k = await dung("?view=board");
		const anh = new Map(THU_TU.map((stage) => [stage, dauCot(k, stage)]));
		const the = theDemo(false);
		await tha(the.id, "DEMO_BOOKED", "QUALIFIED_TO_BUY");
		await cho(2);
		expect(dauCot(k, "DEMO_BOOKED")).not.toBe(anh.get("DEMO_BOOKED"));
		await act(async () => moTreoGhi?.());
		await cho();
		let khang = 0;
		for (const stage of THU_TU) {
			if (dauCot(k, stage) !== anh.get(stage)) {
				throw new Error(`sau tu choi: cot ${stage} khac anh chup`);
			}
			khang += 1;
		}
		expect(khang).toBe(7);
		expect(theTrongCot(k, "DEMO_BOOKED")).toContain(the.id);
		expect(toastErrors).toEqual([LOI_MAY_CHU]);
	});
});
