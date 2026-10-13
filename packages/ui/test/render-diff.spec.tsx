import { describe, expect, test } from "bun:test";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import type { ReactElement } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { AiFeedback } from "../src/components/ai-feedback";
import { AsyncButtonContent } from "../src/components/async-action";
import { AttendeeList } from "../src/components/attendee-list";
import { Board } from "../src/components/board";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "../src/components/carousel";
import { Combobox } from "../src/components/combobox";
import { CommandDialog } from "../src/components/command";
import { CopyValue } from "../src/components/copy-value";
import { DataTable } from "../src/components/data-table";
import { DatePicker } from "../src/components/date-picker";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogTitle,
} from "../src/components/dialog";
import { DotMatrix } from "../src/components/dot-matrix";
import { Heatmap } from "../src/components/heatmap";
import { KaraLabel } from "../src/components/kara";
import { KhungXuong } from "../src/components/khung-xuong";
import { LocaleProvider } from "../src/components/locale-provider";
import {
	MessageScrollerButton,
	MessageScrollerProvider,
} from "../src/components/message-scroller";
import { MoneyInput } from "../src/components/money-input";
import {
	ConfidenceIndicator,
	PaceIndicator,
} from "../src/components/okr-status";
import { PeriodSelect } from "../src/components/period-select";
import { Progress } from "../src/components/progress";
import { ProposedChange } from "../src/components/proposed-change";
import { Reasoning } from "../src/components/reasoning";
import { SaveBar } from "../src/components/save-bar";
import { Sheet, SheetContent, SheetTitle } from "../src/components/sheet";
import { SkeletonSwap } from "../src/components/skeleton-swap";
import { Toaster } from "../src/components/sonner";
import { SortableItem } from "../src/components/sortable-list";
import { Spinner } from "../src/components/spinner";
import { TablePagination } from "../src/components/table-pagination";
import { TargetLineChart } from "../src/components/target-line-chart";
import { ThinkingIndicator } from "../src/components/thinking-indicator";
import { ThreadMessage } from "../src/components/thread-message";
import { TooltipProvider } from "../src/components/tooltip";
import { DEFAULT_LOCALE, type Locale } from "../src/lib/locale";
import type { TableQueryState } from "../src/lib/table-query";
import { DU_LIEU, TEN_RIENG, TRUNG_TINH } from "./du-lieu";

const DOC_NGHE_DUOC = [
	"title",
	"aria-label",
	"aria-description",
	"aria-placeholder",
	"aria-roledescription",
	"aria-valuetext",
	"aria-keyshortcuts",
	"placeholder",
	"alt",
] as const;

async function chuNguoiDoc(html: string): Promise<Set<string>> {
	const ra = new Set<string>();
	const them = (s: string) => {
		const t = s.replace(/\s+/g, " ").trim();
		if (t && /\p{L}/u.test(t)) ra.add(t);
	};
	const rw = new HTMLRewriter().on("*", {
		element(el) {
			for (const ten of DOC_NGHE_DUOC) {
				const gt = el.getAttribute(ten);
				if (gt) them(gt);
			}
		},
		text(t) {
			them(t.text);
		},
	});
	await rw.transform(new Response(html)).text();
	return ra;
}

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

type Ca = {
	ten: string;
	ve: () => ReactElement;
	bam?: (goc: HTMLElement) => Element | null;
};

const bamTheoSo = (i: number) => (goc: HTMLElement) =>
	goc.querySelectorAll('[aria-haspopup="menu"]')[i] ?? null;

const CA: Ca[] = [
	{
		ten: "DataTable",
		ve: () => (
			<DataTable
				query={query}
				rows={[{ id: "1", name: "Đất Xanh" }]}
				total={1}
				columns={[
					{ id: "name", header: "Tên cột", sortable: true, cell: () => null },
					{
						id: "domain",
						header: "Tên miền",
						sortable: true,
						hideable: true,
						cell: () => null,
					},
				]}
				getRowId={(row) => row.id}
				facets={[
					{
						id: "industry",
						label: "Ngành",
						options: [{ value: "bds", label: "Bất động sản" }],
						selected: ["bds"],
						onChange: () => {},
						searchable: true,
						search: "",
						onSearchChange: () => {},
					},
					{
						id: "owner",
						label: "Phụ trách",
						options: [{ value: "lan", label: "Lan" }],
						selected: ["lan"],
						onChange: () => {},
					},
				]}
				selection={{
					state: {
						ids: new Set<string>(["1"]),
						has: () => true,
						toggle: () => {},
						clear: () => {},
						toggleAll: () => {},
						count: 3,
					},
					rowLabel: (row) => row.name,
				}}
			/>
		),
	},
	{
		ten: "TablePagination",
		ve: () => (
			<TablePagination
				page={1}
				totalPages={3}
				pageSize={20}
				total={15}
				onPageChange={() => {}}
			/>
		),
	},
	{
		ten: "Board",
		ve: () => (
			<Board
				label={DU_LIEU.nhomLoc}
				columns={[
					{
						id: "dai",
						label: DU_LIEU.cot,
						count: 3,
						cards: [{ id: "a", href: "/a", title: DU_LIEU.tenCongTy }],
					},
					{ id: "trong", label: DU_LIEU.cotHai, count: 0, cards: [] },
				]}
			/>
		),
	},
	{ ten: "Spinner", ve: () => <Spinner /> },
	{
		ten: "CopyValue",
		ve: () => <CopyValue value="crm_9f2c" label={DU_LIEU.thu} />,
	},
	{
		ten: "Progress",
		ve: () => <Progress expected={47} value={30} variant="neutral" />,
	},
	{
		ten: "Heatmap",
		ve: () => (
			<Heatmap
				caption={DU_LIEU.cot}
				columns={[{ id: "a", label: "01/11" }]}
				rows={[{ id: "r", label: DU_LIEU.tenCongTy }]}
				values={[[null]]}
			/>
		),
	},
	{
		ten: "SaveBar",
		ve: () => (
			<SaveBar
				items={[{ id: "a", label: DU_LIEU.cot, href: "#a" }]}
				open
				title={DU_LIEU.tieuDeHopThoai}
			/>
		),
	},
	{
		ten: "PeriodSelect",
		ve: () => (
			<PeriodSelect
				groups={[
					{
						label: DU_LIEU.nhomLoc,
						items: [{ value: "q", label: DU_LIEU.cot, current: true }],
					},
				]}
				label={DU_LIEU.nhomLocHai}
				onValueChange={() => {}}
				value="q"
			/>
		),
	},
	{
		ten: "TargetLineChart",
		ve: () => (
			<TargetLineChart
				data={[{ x: "01/11", value: 1, expected: 1 }]}
				label={DU_LIEU.cot}
				target={2}
				targetLabel={DU_LIEU.cotHai}
			/>
		),
	},
	{
		ten: "OkrStatus",
		ve: () => (
			<>
				<ConfidenceIndicator level="cao" />
				<PaceIndicator pace="dung-nhip" />
			</>
		),
	},
	{ ten: "DotMatrix", ve: () => <DotMatrix /> },
	{ ten: "ThinkingIndicator", ve: () => <ThinkingIndicator /> },
	{
		ten: "AsyncAction",
		ve: () => (
			<AsyncButtonContent status="success">
				{DU_LIEU.tenNguoi}
			</AsyncButtonContent>
		),
	},
	{
		ten: "Combobox",
		ve: () => <Combobox options={[]} value="" onValueChange={() => {}} />,
	},
	{
		ten: "Command",
		ve: () => (
			<CommandDialog open>
				<span>{DU_LIEU.tenNguoi}</span>
			</CommandDialog>
		),
	},
	{ ten: "Sonner", ve: () => <Toaster /> },
	{
		ten: "Dialog",
		ve: () => (
			<Dialog open>
				<DialogContent>
					<DialogTitle>Ghi chú của tôi</DialogTitle>
					<DialogFooter showCloseButton />
				</DialogContent>
			</Dialog>
		),
	},
	{
		ten: "GiuThayDoi",
		ve: () => (
			<Dialog open coThayDoi>
				<DialogContent>
					<DialogTitle>Ghi chú của tôi</DialogTitle>
				</DialogContent>
			</Dialog>
		),
		bam: () =>
			document.querySelector(
				"[data-slot='dialog-content'] [data-slot='dialog-close']",
			),
	},
	{
		ten: "Sheet",
		ve: () => (
			<Sheet open>
				<SheetContent>
					<SheetTitle>Ghi chú của tôi</SheetTitle>
				</SheetContent>
			</Sheet>
		),
	},
	{
		ten: "ProposedChange",
		ve: () => (
			<ProposedChange
				kind="rewrite"
				value="Đất Xanh"
				editing={{ value: "Đất Xanh", onChange: () => {}, onCancel: () => {} }}
				actions={[]}
			/>
		),
	},
	{
		ten: "AiFeedback",
		ve: () => (
			<AiFeedback
				value
				onChange={() => {}}
				label={DU_LIEU.nhomLoc}
				thanks={DU_LIEU.tieuDeHopThoai}
			/>
		),
	},
	{
		ten: "Kara",
		ve: () => (
			<KaraLabel
				text={DU_LIEU.tenCongTy}
				reason={DU_LIEU.tieuDeHopThoai}
				readAt={DU_LIEU.ngayVi}
			/>
		),
		bam: () => document.querySelector("[data-slot='kara-label'] button"),
	},
	{
		ten: "Carousel",
		ve: () => (
			<Carousel>
				<CarouselContent>
					<CarouselItem>Đất Xanh</CarouselItem>
				</CarouselContent>
				<CarouselPrevious />
				<CarouselNext />
			</Carousel>
		),
	},
	{
		ten: "DatePicker",
		ve: () => <DatePicker value="2026-09-01" onChange={() => {}} />,
	},
	{
		ten: "MoneyInput",
		ve: () => (
			<MoneyInput
				id="so-tien"
				value="1.500,50"
				currency="USD"
				onValueChange={() => {}}
			/>
		),
	},
	{ ten: "SortableItem", ve: () => <SortableItem id="1" label="Tên cột" /> },
	{ ten: "KhungXuong", ve: () => <KhungXuong hinh="bang" /> },
	{
		ten: "SkeletonSwap",
		ve: () => (
			<SkeletonSwap loading={false} label="Tên cột">
				<span>Đất Xanh</span>
			</SkeletonSwap>
		),
	},
	{ ten: "Reasoning", ve: () => <Reasoning isStreaming>Đất Xanh</Reasoning> },
	{
		ten: "ThreadMessage",
		ve: () => (
			<ThreadMessage
				from="Lan"
				fromEmail="lan@onemount.com"
				sentAt="1"
				direction="INBOUND"
				body={null}
			/>
		),
	},
	{
		ten: "AttendeeList",
		ve: () => (
			<AttendeeList
				attendees={[{ email: "lan@onemount.com", responseStatus: "declined" }]}
			/>
		),
	},
	{
		ten: "MessageScrollerButton",
		ve: () => (
			<MessageScrollerProvider>
				<MessageScrollerButton direction="end" />
			</MessageScrollerProvider>
		),
	},
	{
		ten: "MessageScrollerButton · lên đầu",
		ve: () => (
			<MessageScrollerProvider>
				<MessageScrollerButton direction="start" />
			</MessageScrollerProvider>
		),
	},
	{
		ten: "TablePagination · không kết quả",
		ve: () => (
			<TablePagination
				page={1}
				totalPages={1}
				pageSize={20}
				total={0}
				onPageChange={() => {}}
			/>
		),
	},
	{
		ten: "DataTable · dòng mở rộng được",
		ve: () => (
			<DataTable
				query={query}
				rows={[{ id: "1", name: "Đất Xanh" }]}
				total={1}
				columns={[
					{ id: "name", header: "Tên cột", sortable: true, cell: () => null },
				]}
				getRowId={(row) => row.id}
				expandable={{
					isExpandable: () => true,
					subRows: () => [],
					subColumns: [],
					getSubRowId: () => "1",
				}}
			/>
		),
	},
	{
		ten: "DataTable · chọn dòng không có nhãn",
		ve: () => (
			<DataTable
				query={query}
				rows={[{ id: "1", name: "Đất Xanh" }]}
				total={1}
				columns={[
					{ id: "name", header: "Tên cột", sortable: true, cell: () => null },
				]}
				getRowId={(row) => row.id}
				selection={{
					state: {
						ids: new Set<string>(),
						has: () => false,
						toggle: () => {},
						clear: () => {},
						toggleAll: () => {},
						count: 0,
					},
				}}
			/>
		),
	},
	{
		ten: "DatePicker · mở lịch",
		ve: () => <DatePicker value="2026-09-01" onChange={() => {}} />,
		bam: (goc) => goc.querySelector("[data-slot=date-picker-trigger]"),
	},
];

const MO = [
	{ ten: "DataTable · menu Lọc", goc: "DataTable", so: 0 },
	{ ten: "DataTable · menu Sắp xếp", goc: "DataTable", so: 1 },
	{ ten: "DataTable · menu Cột", goc: "DataTable", so: 2 },
	{
		ten: "DataTable · menu Sắp xếp khi dòng mở rộng được",
		goc: "DataTable · dòng mở rộng được",
		so: 0,
	},
];

const SAU_KHI_MO = [
	{
		ten: "DataTable · menu con của mục lọc tìm được",
		goc: "DataTable",
		so: 0,
		trong: () =>
			document.querySelectorAll('[data-slot="dropdown-menu-sub-trigger"]')[0] ??
			null,
	},
	{
		ten: "DataTable · menu con của mục lọc thường",
		goc: "DataTable",
		so: 0,
		trong: () =>
			document.querySelectorAll('[data-slot="dropdown-menu-sub-trigger"]')[1] ??
			null,
	},
];

async function bam(dich: Element, ten: string): Promise<void> {
	const truoc = document.body.innerHTML.length;
	for (const buoc of [
		"pointermove",
		"pointerdown",
		"mousedown",
		"mouseup",
		"click",
		"pointerenter",
		"focus",
	]) {
		if (document.body.innerHTML.length > truoc + 200) break;
		await act(async () => {
			dich.dispatchEvent(
				buoc === "focus"
					? new window.FocusEvent(buoc, { bubbles: true })
					: new window.PointerEvent(buoc, {
							bubbles: true,
							button: 0,
							pointerType: "mouse",
						}),
			);
		});
	}
	if (document.body.innerHTML.length <= truoc) {
		throw new Error(
			`${ten}: bấm rồi mà bản vẽ không lớn thêm — không mở gì cả`,
		);
	}
}

async function ve(
	ca: Ca,
	locale: Locale,
	mo?: number,
	trong?: () => Element | null,
): Promise<string> {
	document.body.innerHTML = "";
	const host = document.createElement("div");
	document.body.appendChild(host);
	const root = createRoot(host);
	await act(async () => {
		root.render(
			<NuqsTestingAdapter>
				<LocaleProvider locale={locale}>
					<TooltipProvider delayDuration={0}>{ca.ve()}</TooltipProvider>
				</LocaleProvider>
			</NuqsTestingAdapter>,
		);
	});
	const dich =
		mo === undefined ? (ca.bam?.(host) ?? null) : bamTheoSo(mo)(host);
	if (mo !== undefined || ca.bam) {
		if (!dich) throw new Error(`${ca.ten}: không tìm được nút mở`);
		await bam(dich, ca.ten);
	}
	if (trong) {
		const sau = trong();
		if (!sau) throw new Error(`${ca.ten}: không tìm được nút mở lớp hai`);
		await bam(sau, `${ca.ten} lớp hai`);
	}
	const html = document.body.innerHTML;
	await act(async () => root.unmount());
	host.remove();
	return html;
}

async function chungNhau(
	ca: Ca,
	mo?: number,
	trong?: () => Element | null,
): Promise<string[]> {
	const en = await chuNguoiDoc(await ve(ca, "en", mo, trong));
	const vi = await chuNguoiDoc(await ve(ca, "vi", mo, trong));
	if (en.size === 0) throw new Error(`${ca.ten}: bản vẽ không có chữ nào`);
	return [...en].filter(
		(s) => vi.has(s) && !TRUNG_TINH.has(s) && !TEN_RIENG.has(s),
	);
}

describe("AC-5 — chấm bản vẽ, không chấm mã", () => {
	test.each(CA.map((c) => [c.ten, c] as const))(
		"%s: không chữ nào đứng yên khi đổi tiếng",
		async (_ten, ca) => {
			expect(await chungNhau(ca)).toEqual([]);
		},
	);

	test.each(MO.map((m) => [m.ten, m] as const))(
		"%s: chữ trong menu cũng đổi",
		async (_ten, m) => {
			const ca = CA.find((c) => c.ten === m.goc);
			if (!ca) throw new Error(`không có ca ${m.goc}`);
			expect(await chungNhau(ca, m.so)).toEqual([]);
		},
	);

	test.each(SAU_KHI_MO.map((m) => [m.ten, m] as const))(
		"%s: chữ ở lớp hai cũng đổi",
		async (_ten, m) => {
			const ca = CA.find((c) => c.ten === m.goc);
			if (!ca) throw new Error(`không có ca ${m.goc}`);
			expect(await chungNhau(ca, m.so, m.trong)).toEqual([]);
		},
	);

	test.each(CA.map((c) => [c.ten, c] as const))(
		"%s: dựng NGOÀI nhà cung cấp thì vẫn vẽ, vẫn ra tiếng mặc định, không nổ",
		async (_ten, ca) => {
			const khong_boc = renderToStaticMarkup(
				<NuqsTestingAdapter>
					<TooltipProvider delayDuration={0}>{ca.ve()}</TooltipProvider>
				</NuqsTestingAdapter>,
			);
			const co_boc = renderToStaticMarkup(
				<NuqsTestingAdapter>
					<LocaleProvider locale={DEFAULT_LOCALE}>
						<TooltipProvider delayDuration={0}>{ca.ve()}</TooltipProvider>
					</LocaleProvider>
				</NuqsTestingAdapter>,
			);
			expect(khong_boc).toBe(co_boc);
		},
	);

	test("mọi component đọc bảng dịch đều có mặt trong danh sách ca", async () => {
		const { readdirSync, readFileSync } = await import("node:fs");
		const goc = `${import.meta.dir}/../src/components`;
		const doc: string[] = [];
		for (const ten of readdirSync(goc)) {
			if (!ten.endsWith(".tsx")) continue;
			if (ten === "locale-provider.tsx") continue;
			if (readFileSync(`${goc}/${ten}`, "utf8").includes("useMessages()")) {
				doc.push(ten.replace(".tsx", ""));
			}
		}
		const co_ca = new Set(
			CA.map((c) =>
				c.ten
					.replace(/([a-z])([A-Z])/g, "$1-$2")
					.toLowerCase()
					.replace(/-(button|item|list)$/, ""),
			),
		);
		const thieu = doc.filter(
			(ten) => !co_ca.has(ten) && !co_ca.has(ten.replace(/-list$/, "")),
		);
		expect(thieu).toEqual([]);
	});
});
