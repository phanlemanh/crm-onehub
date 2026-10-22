import {
	afterEach,
	beforeEach,
	describe,
	expect,
	mock,
	spyOn,
	test,
} from "bun:test";
import { sapBoTri } from "@crm/db/fields-chuan";
import {
	type DehydratedState,
	dehydrate,
	HydrationBoundary,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import { parseAsBoolean, useQueryState } from "nuqs";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import {
	act,
	createContext,
	createElement as h,
	type ReactElement,
	type ReactNode,
	type Ref,
	useContext,
} from "react";
import { createRoot, hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";

type DealWrite = {
	name: string;
	companyId: string;
	amountCents: number | null;
	currency?: string;
	expectedCloseDate: string | null;
};
type MutationHooks = { onSuccess?: unknown; onError?: unknown };

const MA_THO = "QUALIFIED_TO_BUY";
const NHAN = "Qualified to buy";
const GIAI_DOAN = {
	canManage: true,
	tran: 20,
	stages: [
		{
			id: "CLOSED_WON",
			label: "Closed won",
			kind: "WON",
			position: 0,
			dealCount: 0,
		},
		{ id: MA_THO, label: NHAN, kind: "OPEN", position: 1, dealCount: 1 },
		{
			id: "CONTRACT_SENT",
			label: "Contract sent",
			kind: "OPEN",
			position: 2,
			dealCount: 0,
		},
	],
};
const MO_DAU_TIEN = GIAI_DOAN.stages.filter((g) => g.kind === "OPEN")[0];
const KHOA_NGAN = [
	"giaiDoan.list",
	"users.list",
	"users.me",
	"currency.settings",
] as const;

let createCalls: DealWrite[] = [];

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

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		giaiDoan: { list: thuTuc("giaiDoan.list", () => GIAI_DOAN) },
		users: {
			list: thuTuc("users.list", () => [{ id: "u1", name: "Người A" }]),
			me: thuTuc("users.me", () => ({ id: "u1", name: "Người A" })),
		},
		currency: {
			settings: thuTuc("currency.settings", () => ({
				reportingCurrency: "VND",
				currencies: [],
			})),
		},
		fields: {
			list: thuTuc("fields.list", () => []),
			layout: thuTuc("fields.layout", () => sapBoTri("DEAL", [], [])),
		},
		deals: {
			create: thuTuc(
				"deals.create",
				() => null,
				async (v: DealWrite) => {
					createCalls.push(v);
					return { id: `d${createCalls.length}`, name: v.name };
				},
			),
		},
	}),
}));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({ deal: async () => undefined }),
}));

mock.module("@/components/crm/record-sheet/record-stack", () => ({
	useOpenRecord: () => () => undefined,
}));

mock.module("@/components/crm/company-picker", () => ({
	CompanyPicker: ({
		onValueChange,
	}: {
		onValueChange: (value: string) => void;
	}) =>
		h(
			"button",
			{
				type: "button",
				"data-chon-cong-ty": "",
				onClick: () => onValueChange("c2"),
			},
			"chon c2",
		),
}));

mock.module("@crm/ui/components/date-picker", () => ({
	DatePicker: ({
		value,
		onChange,
	}: {
		value: string | null | undefined;
		onChange: (next: string) => void;
	}) =>
		h("input", {
			"data-ngay-chot": "",
			value: value ?? "",
			onChange: (e: { target: { value: string } }) => onChange(e.target.value),
		}),
}));

mock.module("sonner", () => ({
	toast: Object.assign(() => undefined, {
		error: () => undefined,
		success: () => undefined,
	}),
}));

type ChonCtx = { value: string; chon: (value: string) => void };
const SelectCtx = createContext<ChonCtx>({ value: "", chon: () => undefined });

const realSelect = await import("@crm/ui/components/select");

mock.module("@crm/ui/components/select", () => ({
	...realSelect,
	Select: ({
		value,
		onValueChange,
		children,
	}: {
		value: string;
		onValueChange: (value: string) => void;
		children: ReactNode;
	}) =>
		h(SelectCtx.Provider, { value: { value, chon: onValueChange } }, children),
	SelectTrigger: ({
		ref,
		children,
		...props
	}: {
		ref?: Ref<HTMLButtonElement>;
		children: ReactNode;
		"aria-label"?: string;
		id?: string;
	}) =>
		h(
			"button",
			{
				ref,
				type: "button",
				"data-select-trigger": "",
				"aria-label": props["aria-label"],
				id: props.id,
			},
			children,
		),
	SelectValue: ({ placeholder }: { placeholder?: string }) => {
		const { value } = useContext(SelectCtx);
		return value || placeholder || "";
	},
	SelectContent: ({ children }: { children: ReactNode }) =>
		h("span", null, children),
	SelectItem: ({ value, children }: { value: string; children: ReactNode }) => {
		const { value: dangChon, chon } = useContext(SelectCtx);
		return h(
			"button",
			{
				type: "button",
				"data-select-item": value,
				"data-checked": dangChon === value ? "" : undefined,
				onClick: () => chon(value),
			},
			children,
		);
	},
}));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { CreateDealSheet } = await import(
	"@/app/(app)/[slug]/deals/create-deal-sheet"
);
const { DealStageIndicator } = await import("@/components/crm/deal-stage");

const LOI_HYDRAT = /hydrat|didn't match|Hydration/i;
const O_GIAI_DOAN = "[data-slot='status-indicator'] .truncate";

let goc: Root | null = null;

afterEach(() => {
	act(() => goc?.unmount());
	goc = null;
	document.body.innerHTML = "";
});

beforeEach(() => {
	createCalls = [];
});

function mayMoi(): QueryClient {
	return new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
}

function trangGiaiDoan(): DehydratedState {
	const nguon = new QueryClient();
	nguon.setQueryData(["giaiDoan.list"], GIAI_DOAN);
	return dehydrate(nguon);
}

function cayGiaiDoan(may: QueryClient, trang: DehydratedState): ReactElement {
	return (
		<NuqsTestingAdapter searchParams="">
			<QueryClientProvider client={may}>
				<LocaleProvider locale="vi">
					<CreateDealSheet />
					<HydrationBoundary state={trang}>
						<DealStageIndicator stage={MA_THO} />
					</HydrationBoundary>
				</LocaleProvider>
			</QueryClientProvider>
		</NuqsTestingAdapter>
	);
}

type KetQua = {
	loi: string[];
	o: HTMLElement;
	html: string;
	chuO: string[];
};

async function hydratCay(
	mayChu: ReactElement,
	trinhDuyet: ReactElement,
): Promise<KetQua> {
	const html = renderToString(mayChu);
	const o = document.createElement("div");
	o.innerHTML = html;
	document.body.appendChild(o);
	const docO = () => o.querySelector(O_GIAI_DOAN)?.textContent ?? null;
	const chuO: string[] = [];
	const dau = docO();
	if (dau !== null) chuO.push(dau);
	const ghi = () => {
		const chu = docO();
		if (chu !== null && chu !== chuO.at(-1)) chuO.push(chu);
	};
	const theoDoi = new MutationObserver(ghi);
	theoDoi.observe(o, { subtree: true, childList: true, characterData: true });
	const loi: string[] = [];
	const nghe = spyOn(console, "error").mockImplementation((...doiSo) => {
		const chu = doiSo.map(String).join(" ");
		if (LOI_HYDRAT.test(chu)) loi.push(`console.error: ${chu}`);
	});
	try {
		await act(async () => {
			goc = hydrateRoot(o, trinhDuyet, {
				onRecoverableError: (e) => loi.push(String(e)),
			});
		});
	} finally {
		nghe.mockRestore();
		theoDoi.takeRecords();
		ghi();
		theoDoi.disconnect();
	}
	return { loi, o, html, chuO };
}

function chiChu(html: string): string[] {
	return html
		.replace(/<[^>]*>/g, "\n")
		.split("\n")
		.map((s) => s.trim())
		.filter(Boolean);
}

describe("bo nghe loi hydrat bat duoc ca hai kenh", () => {
	test("e0 lech chu vao onRecoverableError", async () => {
		const { loi } = await hydratCay(<p>a</p>, <p>b</p>);
		expect(
			loi.some((t) =>
				t.includes(
					"Hydration failed because the server rendered text didn't match the client",
				),
			),
		).toBe(true);
	});

	test("e0 lech mot thuoc tinh vao console.error", async () => {
		const { loi } = await hydratCay(
			<span data-tone="neutral">x</span>,
			<span data-tone="info">x</span>,
		);
		expect(loi.some((t) => t.startsWith("console.error:"))).toBe(true);
		expect(loi.join("\n")).toContain("data-tone");
	});
});

describe("o giai doan tren man Deals hydrat khop may chu", () => {
	test("e1 may chu ve nhan va sac cua giai doan", () => {
		const html = renderToString(cayGiaiDoan(mayMoi(), trangGiaiDoan()));
		const o = document.createElement("div");
		o.innerHTML = html;
		const chiBao = o.querySelector("[data-slot='status-indicator']");
		expect({
			tone: chiBao?.getAttribute("data-tone"),
			chu: o.querySelector(O_GIAI_DOAN)?.textContent,
		}).toEqual({ tone: "info", chu: NHAN });
		expect(chiChu(html)).not.toContain(MA_THO);
	});

	test("e2 trinh duyet da co du lieu truoc khi vung bang hydrat", async () => {
		const trinhDuyet = mayMoi();
		trinhDuyet.setQueryData(["giaiDoan.list"], GIAI_DOAN);
		const { loi, o } = await hydratCay(
			cayGiaiDoan(mayMoi(), trangGiaiDoan()),
			cayGiaiDoan(trinhDuyet, trangGiaiDoan()),
		);
		expect(loi).toEqual([]);
		expect({
			tone: o
				.querySelector("[data-slot='status-indicator']")
				?.getAttribute("data-tone"),
			chu: o.querySelector(O_GIAI_DOAN)?.textContent,
		}).toEqual({ tone: "info", chu: NHAN });
	});

	test("e3 trinh duyet trong, o khong di qua ma tho", async () => {
		const { loi, chuO } = await hydratCay(
			cayGiaiDoan(mayMoi(), trangGiaiDoan()),
			cayGiaiDoan(mayMoi(), trangGiaiDoan()),
		);
		expect(chuO).toEqual([NHAN]);
		expect(loi).toEqual([]);
	});
});

let datMo: ((mo: boolean | null) => Promise<URLSearchParams>) | null = null;

function DieuKhien() {
	const [, dat] = useQueryState("new", parseAsBoolean);
	datMo = dat;
	return null;
}

async function cho(n = 6) {
	for (let i = 0; i < n; i += 1) {
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
}

async function dung(cay: ReactNode, search: string, may = mayMoi()) {
	const khung = document.createElement("div");
	document.body.appendChild(khung);
	goc = createRoot(khung);
	await act(async () =>
		goc?.render(
			<NuqsTestingAdapter searchParams={search} hasMemory>
				<QueryClientProvider client={may}>
					<LocaleProvider locale="vi">
						<DieuKhien />
						{cay}
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		),
	);
	await cho();
	return may;
}

function khoaTrongCache(may: QueryClient): string[] {
	return may
		.getQueryCache()
		.getAll()
		.map((q) => String(q.queryKey[0]));
}

describe("ngan tao deal chi tao truy van khi mo", () => {
	test("e4 ngan dong khong tao truy van, ngan mo tao du bon", async () => {
		const dong = await dung(<CreateDealSheet />, "");
		const khoaDong = khoaTrongCache(dong);
		for (const khoa of KHOA_NGAN) {
			expect({
				ngan: "dong",
				khoa,
				coTrongCache: khoaDong.includes(khoa),
			}).toEqual({ ngan: "dong", khoa, coTrongCache: false });
		}
		act(() => goc?.unmount());
		document.body.innerHTML = "";

		const mo = await dung(<CreateDealSheet />, "?new=true");
		const khoaMo = khoaTrongCache(mo);
		for (const khoa of KHOA_NGAN) {
			expect({ ngan: "mo", khoa, coTrongCache: khoaMo.includes(khoa) }).toEqual(
				{
					ngan: "mo",
					khoa,
					coTrongCache: true,
				},
			);
		}
		expect(
			document.querySelector("#create-deal-stage")?.textContent ?? "",
		).toBe(MO_DAU_TIEN?.id ?? "-");
		expect(
			document.querySelector(`[data-select-item="${MO_DAU_TIEN?.id}"]`)
				?.textContent,
		).toBe(MO_DAU_TIEN?.label ?? "-");
		expect(
			[...document.querySelectorAll("[data-select-item]")]
				.map((b) => b.getAttribute("data-select-item"))
				.filter((id) => GIAI_DOAN.stages.some((g) => g.id === id)),
		).toEqual(
			GIAI_DOAN.stages.filter((g) => g.kind === "OPEN").map((g) => g.id),
		);
	});
});

function oTen(): HTMLInputElement {
	const o = document.querySelector<HTMLInputElement>(
		'form#create-deal input:not([data-slot="money-input"] input):not([data-ngay-chot])',
	);
	if (!o) throw new Error("khong thay o ten");
	return o;
}

function oSoTien(): HTMLInputElement {
	const o = document.querySelector<HTMLInputElement>(
		'[data-slot="money-input"] input',
	);
	if (!o) throw new Error("khong thay o so tien");
	return o;
}

function oNgay(): HTMLInputElement {
	const o = document.querySelector<HTMLInputElement>("[data-ngay-chot]");
	if (!o) throw new Error("khong thay o ngay chot");
	return o;
}

function oTienTe(): string {
	return (
		document.querySelector('[data-select-trigger][aria-label="Tiền tệ"]')
			?.textContent ?? ""
	);
}

function go(input: HTMLInputElement, chu: string) {
	const dat = Object.getOwnPropertyDescriptor(
		window.HTMLInputElement.prototype,
		"value",
	)?.set;
	act(() => {
		dat?.call(input, chu);
		input.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

function bam(sel: string) {
	const b = document.querySelector<HTMLElement>(sel);
	if (!b) throw new Error(`khong thay ${sel}`);
	act(() => b.click());
}

async function gui() {
	const form = document.querySelector<HTMLFormElement>("form#create-deal");
	if (!form) throw new Error("ngan tao khong mo");
	await act(async () => {
		form.requestSubmit();
	});
	await cho();
}

async function datUrl(mo: boolean | null) {
	await act(async () => {
		await datMo?.(mo);
	});
	await cho();
}

function ok(o: string, dat: boolean) {
	expect({ o, dat }).toEqual({ o, dat: true });
	console.log(`ok: ${o}`);
}

describe("nhap cua ngan tao deal", () => {
	test("e5 nhap giu qua dong mo, tao xong xoa bon o, cong ty giu", async () => {
		await dung(<CreateDealSheet companyId="c1" />, "?new=true");
		go(oTen(), "Hợp đồng kho lạnh");
		await datUrl(null);
		expect(document.querySelector("form#create-deal")).toBeNull();
		await datUrl(true);
		ok("ten giu qua dong mo", oTen().value === "Hợp đồng kho lạnh");

		go(oSoTien(), "1500");
		bam('[data-select-item="USD"]');
		go(oNgay(), "2026-12-31");
		expect([oTienTe(), oNgay().value]).toEqual(["USD", "2026-12-31"]);
		await gui();
		expect(createCalls.length).toBe(1);
		expect(createCalls[0]?.companyId).toBe("c1");
		await datUrl(true);
		ok("ten trong", oTen().value === "");
		ok("so tien trong", oSoTien().value === "");
		ok("tien te ve VND", oTienTe() === "VND");
		ok("ngay chot trong", oNgay().value === "");
		go(oTen(), "Lần hai");
		await gui();
		ok("cong ty truyen vao giu", createCalls[1]?.companyId === "c1");

		act(() => goc?.unmount());
		document.body.innerHTML = "";
		createCalls = [];
		await dung(<CreateDealSheet />, "?new=true");
		bam("[data-chon-cong-ty]");
		go(oTen(), "Lần một");
		await gui();
		await datUrl(true);
		go(oTen(), "Lần hai");
		await gui();
		ok(
			"cong ty nguoi chon giu",
			createCalls.map((c) => c.companyId).join(",") === "c2,c2",
		);
	});
});
