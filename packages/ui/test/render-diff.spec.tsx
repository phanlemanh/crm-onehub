import { describe, expect, test } from "bun:test";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import type { ReactElement } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { AttendeeList } from "../src/components/attendee-list";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "../src/components/carousel";
import { DataTable } from "../src/components/data-table";
import { DatePicker } from "../src/components/date-picker";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogTitle,
} from "../src/components/dialog";
import { LocaleProvider } from "../src/components/locale-provider";
import {
	MessageScrollerButton,
	MessageScrollerProvider,
} from "../src/components/message-scroller";
import { Reasoning } from "../src/components/reasoning";
import { Sheet, SheetContent, SheetTitle } from "../src/components/sheet";
import { SkeletonSwap } from "../src/components/skeleton-swap";
import { SortableItem } from "../src/components/sortable-list";
import { Spinner } from "../src/components/spinner";
import { Suggestion } from "../src/components/suggestion";
import { TablePagination } from "../src/components/table-pagination";
import { ThreadMessage } from "../src/components/thread-message";
import { TooltipProvider } from "../src/components/tooltip";
import type { Locale } from "../src/lib/locale";
import type { TableQueryState } from "../src/lib/table-query";

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

const TRUNG_TINH = new Set([
	"Đất Xanh",
	"lan@onemount.com",
	"Lan",
	"LA",
	"Tên cột",
	"Tên miền",
	"Ngành",
	"Bất động sản",
	"Ghi chú của tôi",
	"1 thg 9, 2026",
	"Sep 1, 2026",
]);

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

type Ca = { ten: string; mo?: number; ve: () => ReactElement };

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
	{ ten: "Spinner", ve: () => <Spinner /> },
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
		ten: "Suggestion",
		ve: () => (
			<Suggestion onAccept={() => {}} onDismiss={() => {}}>
				Đất Xanh
			</Suggestion>
		),
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
	{ ten: "SortableItem", ve: () => <SortableItem id="1" label="Tên cột" /> },
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
];

const MO = [
	{ ten: "DataTable · menu Lọc", goc: "DataTable", so: 0 },
	{ ten: "DataTable · menu Sắp xếp", goc: "DataTable", so: 1 },
	{ ten: "DataTable · menu Cột", goc: "DataTable", so: 2 },
];

async function ve(ca: Ca, locale: Locale, mo?: number): Promise<string> {
	const host = document.createElement("div");
	document.body.appendChild(host);
	const root = createRoot(host);
	await act(async () => {
		root.render(
			<NuqsTestingAdapter>
				<LocaleProvider locale={locale}>
					<TooltipProvider>{ca.ve()}</TooltipProvider>
				</LocaleProvider>
			</NuqsTestingAdapter>,
		);
	});
	if (mo !== undefined) {
		const nut = host.querySelectorAll('[aria-haspopup="menu"]');
		const dich = nut[mo];
		if (!dich) throw new Error(`không có nút mở thứ ${mo}`);
		await act(async () => {
			dich.dispatchEvent(
				new window.PointerEvent("pointerdown", {
					bubbles: true,
					button: 0,
					ctrlKey: false,
				}),
			);
		});
	}
	const html = document.body.innerHTML;
	await act(async () => root.unmount());
	host.remove();
	return html;
}

async function chungNhau(ca: Ca, mo?: number): Promise<string[]> {
	const en = await chuNguoiDoc(await ve(ca, "en", mo));
	const vi = await chuNguoiDoc(await ve(ca, "vi", mo));
	if (en.size === 0) throw new Error(`${ca.ten}: bản vẽ không có chữ nào`);
	return [...en].filter((s) => vi.has(s) && !TRUNG_TINH.has(s));
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
