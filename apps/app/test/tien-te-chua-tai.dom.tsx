import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { sapBoTri } from "@crm/db/fields-chuan";
import { formatMoney } from "@crm/ui/lib/format";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import {
	act,
	createContext,
	createElement as h,
	type ReactNode,
	type Ref,
	useContext,
} from "react";
import { createRoot, type Root } from "react-dom/client";

type DealWrite = {
	name: string;
	amountCents: number | null;
	currency?: string;
};
type MutationHooks = { onSuccess?: unknown; onError?: unknown };
type CheDo = "ve" | "treo" | "loi";

let createCalls: DealWrite[] = [];
let cheDo: CheDo[] = ["ve"];
let soLanGoi = 0;
let moTreo: (() => void) | null = null;

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

const THIET_LAP = { reportingCurrency: "VND", currencies: [] };

function docThietLap() {
	const lan = soLanGoi;
	soLanGoi += 1;
	const mode = cheDo[Math.min(lan, cheDo.length - 1)];
	if (mode === "loi") throw new Error("thiet lap hong");
	if (mode === "treo") {
		return new Promise<typeof THIET_LAP>((xong) => {
			moTreo = () => xong(THIET_LAP);
		});
	}
	return THIET_LAP;
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		giaiDoan: {
			list: thuTuc("giaiDoan.list", () => ({
				canManage: true,
				tran: 20,
				stages: [
					{
						id: "DEMO_BOOKED",
						label: "Demo booked",
						kind: "OPEN",
						position: 0,
						dealCount: 0,
					},
				],
			})),
		},
		users: {
			list: thuTuc("users.list", () => [{ id: "u1", name: "Người A" }]),
			me: thuTuc("users.me", () => ({ id: "u1", name: "Người A" })),
		},
		currency: { settings: thuTuc("currency.settings", docThietLap) },
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
	CompanyPicker: () => null,
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
const { QuickAddDeal } = await import(
	"@/components/crm/record-sheet/quick-add"
);

const CAU_TAO_DANG_TAI = "Đang tải đồng tiền báo cáo…";
const CAU_TAO_LOI =
	"Không tải được đồng tiền báo cáo — chọn đồng tiền bên cạnh để nhập số tiền.";
const CAU_NHANH_LOI =
	"Không tải được đồng tiền báo cáo, nên chưa lưu được số tiền. Bỏ trống số tiền để tạo thoả thuận, hoặc thử lại.";
const docLa = (currency: string) =>
	`Đọc là ${formatMoney(15_000_000_000, currency, "vi")}`;

let root: Root | null = null;
let khung: HTMLElement | null = null;

async function cho(n = 6) {
	for (let i = 0; i < n; i += 1) {
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
}

async function dung(cay: ReactNode, search = "", locale: "vi" | "en" = "vi") {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	await act(async () =>
		root?.render(
			<NuqsTestingAdapter searchParams={search} hasMemory>
				<QueryClientProvider client={queryClient}>
					<LocaleProvider locale={locale}>{cay}</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		),
	);
	await cho();
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

function oSoTien(goc: ParentNode = document): HTMLInputElement {
	const o = goc.querySelector<HTMLInputElement>(
		'[data-slot="money-input"] input',
	);
	if (!o) throw new Error("khong thay o so tien");
	return o;
}

function dong(goc: ParentNode = document): string {
	return (
		goc.querySelector('[data-slot="money-input"] [aria-live]')?.textContent ??
		""
	);
}

function oChon(): HTMLButtonElement {
	const b = document.querySelector<HTMLButtonElement>(
		'[data-select-trigger][aria-label="Tiền tệ"]',
	);
	if (!b) throw new Error("khong thay o chon dong tien");
	return b;
}

function chon(ma: string) {
	const b = document.querySelector<HTMLButtonElement>(
		`[data-select-item="${ma}"]`,
	);
	if (!b) throw new Error(`khong thay dong ${ma}`);
	act(() => b.click());
}

async function gui(form: HTMLFormElement) {
	await act(async () => {
		form.requestSubmit();
	});
	await cho();
}

const lenh = () =>
	JSON.stringify(createCalls.map((c) => [c.amountCents, c.currency ?? "-"]));

async function moTam() {
	await dung(h(CreateDealSheet, { companyId: "c1" }), "?new=true");
	const form = document.querySelector<HTMLFormElement>("form#create-deal");
	if (!form) throw new Error("tam tao khong mo");
	const ten = form.querySelector<HTMLInputElement>(
		'input:not([data-slot="money-input"] input)',
	);
	if (!ten) throw new Error("khong thay o ten");
	go(ten, "Thoả thuận thử");
	return form;
}

async function moNhanh() {
	await dung(
		h(QuickAddDeal, {
			companyId: "c1",
			companyName: "Công ty A",
			ownerId: "u1",
			onDone: () => undefined,
		}),
	);
	const form = khung?.querySelector("form");
	if (!form) throw new Error("khong thay form them nhanh");
	const ten = form.querySelector<HTMLInputElement>(
		'input:not([data-slot="money-input"] input)',
	);
	if (!ten) throw new Error("khong thay o ten");
	go(ten, "Thoả thuận nhanh");
	await cho();
	const nut = form.querySelector<HTMLButtonElement>('button[type="submit"]');
	if (!nut) throw new Error("khong thay nut Tao");
	return { form, nut };
}

function nutThuLai(goc: ParentNode) {
	return [...goc.querySelectorAll("button")].find(
		(b) => b.textContent === "Thử lại",
	);
}

function don() {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
}

beforeEach(() => {
	createCalls = [];
	cheDo = ["ve"];
	soLanGoi = 0;
	moTreo = null;
});

afterEach(don);

describe("tao-dang-tai", () => {
	test("tao-dang-tai: khong doan dong tien, doc khi thiet lap ve", async () => {
		cheDo = ["treo"];
		const lech: string[] = [];
		const form = await moTam();
		const o = oSoTien();
		go(o, "150.000.000");
		if (dong() !== CAU_TAO_DANG_TAI)
			lech.push(`tao dang tai: dong «${dong()}»`);
		if (o.getAttribute("aria-invalid") !== null) {
			lech.push("tao dang tai: o mang aria-invalid");
		}
		if (oChon().textContent !== "Tiền tệ") {
			lech.push(
				`tao dang tai: o chon dong tien «${oChon().textContent}» != «Tiền tệ»`,
			);
		}
		const dongDaChon = [
			...document.querySelectorAll("[data-select-item][data-checked]"),
		]
			.map((x) => x.getAttribute("data-select-item") ?? "")
			.filter((ma) => /^[A-Z]{3}$/.test(ma));
		if (dongDaChon.length !== 0) {
			lech.push(
				`tao dang tai: dong tien dang duoc chon ${dongDaChon.join(",")}`,
			);
		}
		await gui(form);
		if (lenh() !== "[]") lech.push(`tao dang tai: gui ${lenh()} != []`);
		expect(lech).toEqual([]);
		if (document.activeElement !== oChon()) {
			lech.push("tao dang tai: focus khong o o chon dong tien");
		}
		await act(async () => moTreo?.());
		await cho();
		if (dong() !== docLa("VND")) lech.push(`tao sau khi ve: dong «${dong()}»`);
		await gui(form);
		if (lenh() !== JSON.stringify([[15_000_000_000, "VND"]])) {
			lech.push(`tao sau khi ve: gui ${lenh()}`);
		}
		expect(lech).toEqual([]);
	});
});

describe("tao-loi", () => {
	test("tao-loi: noi cach sua, chon dong tien thi gui dung dong do", async () => {
		cheDo = ["loi"];
		const lech: string[] = [];
		const form = await moTam();
		go(oSoTien(), "150.000.000");
		if (dong() !== CAU_TAO_LOI) {
			lech.push(`tao loi: dong «${dong()}» != «${CAU_TAO_LOI}»`);
		}
		await gui(form);
		if (lenh() !== "[]") lech.push(`tao loi: gui ${lenh()} != []`);
		expect(lech).toEqual([]);
		if (document.activeElement !== oChon()) {
			lech.push("tao loi: focus khong o o chon dong tien");
		}
		chon("VND");
		if (dong() !== docLa("VND"))
			lech.push(`tao loi sau khi chon: dong «${dong()}»`);
		await gui(form);
		if (lenh() !== JSON.stringify([[15_000_000_000, "VND"]])) {
			lech.push(`tao loi sau khi chon: gui ${lenh()}`);
		}
		expect(lech).toEqual([]);
	});
});

type O = {
	thietLap: CheDo;
	chonUsd: boolean;
	coSo: boolean;
	lenh: [number | null, string][];
};

const MA_TRAN: O[] = [
	{
		thietLap: "ve",
		chonUsd: false,
		coSo: true,
		lenh: [[15_000_000_000, "VND"]],
	},
	{ thietLap: "ve", chonUsd: false, coSo: false, lenh: [[null, "VND"]] },
	{
		thietLap: "ve",
		chonUsd: true,
		coSo: true,
		lenh: [[15_000_000_000, "USD"]],
	},
	{ thietLap: "ve", chonUsd: true, coSo: false, lenh: [[null, "USD"]] },
	{ thietLap: "treo", chonUsd: false, coSo: true, lenh: [] },
	{ thietLap: "treo", chonUsd: false, coSo: false, lenh: [[null, "-"]] },
	{
		thietLap: "treo",
		chonUsd: true,
		coSo: true,
		lenh: [[15_000_000_000, "USD"]],
	},
	{ thietLap: "treo", chonUsd: true, coSo: false, lenh: [[null, "USD"]] },
	{ thietLap: "loi", chonUsd: false, coSo: true, lenh: [] },
	{ thietLap: "loi", chonUsd: false, coSo: false, lenh: [[null, "-"]] },
	{
		thietLap: "loi",
		chonUsd: true,
		coSo: true,
		lenh: [[15_000_000_000, "USD"]],
	},
	{ thietLap: "loi", chonUsd: true, coSo: false, lenh: [[null, "USD"]] },
];

describe("tao-ma-tran", () => {
	test("tao-ma-tran: dong tien gui di bang dong tien da doc so", async () => {
		const lech: string[] = [];
		let daChay = 0;
		for (const c of MA_TRAN) {
			createCalls = [];
			cheDo = [c.thietLap];
			soLanGoi = 0;
			const nhan = `${c.thietLap}/${c.chonUsd ? "chon-USD" : "khong-chon"}/${c.coSo ? "so" : "trong"}`;
			const form = await moTam();
			if (c.chonUsd) chon("USD");
			if (c.coSo) {
				go(oSoTien(), "150.000.000");
				const muon =
					c.lenh.length > 0
						? docLa(c.lenh[0]?.[1] ?? "")
						: c.thietLap === "loi"
							? CAU_TAO_LOI
							: CAU_TAO_DANG_TAI;
				if (dong() !== muon)
					lech.push(`${nhan}: dong «${dong()}» != «${muon}»`);
			}
			await gui(form);
			daChay += 1;
			if (lenh() !== JSON.stringify(c.lenh)) {
				lech.push(`${nhan}: ${lenh()} != ${JSON.stringify(c.lenh)}`);
			}
			don();
		}
		expect(lech).toEqual([]);
		expect(daChay).toBe(12);
	});
});

describe("nhanh-dang-tai", () => {
	test("nhanh-dang-tai: nut khoa khi dang tai, mo khi ve", async () => {
		cheDo = ["treo"];
		const lech: string[] = [];
		const { nut } = await moNhanh();
		if (nut.disabled !== true)
			lech.push(`nhanh dang tai: nut Tao disabled ${nut.disabled} != true`);
		await act(async () => moTreo?.());
		await cho();
		if (nut.disabled !== false)
			lech.push(`nhanh sau khi ve: nut Tao disabled ${nut.disabled} != false`);
		expect(lech).toEqual([]);
	});
});

describe("nhanh-loi", () => {
	test("nhanh-loi: nut mo, co Thu lai, co so thi khong gui, trong thi gui", async () => {
		cheDo = ["loi"];
		const lech: string[] = [];
		const { form, nut } = await moNhanh();
		if (nut.disabled !== false)
			lech.push(`nhanh loi: nut Tao disabled ${nut.disabled} != false`);
		if (!nutThuLai(form)) lech.push("nhanh loi: khong thay nut Thử lại");
		const o = oSoTien(form);
		go(o, "150.000.000");
		if (dong(form) !== CAU_NHANH_LOI)
			lech.push(`nhanh loi: dong «${dong(form)}»`);
		await gui(form);
		if (createCalls.length !== 0) {
			lech.push(`nhanh loi «150.000.000»: ${createCalls.length} lenh != 0`);
		}
		if (document.activeElement !== o)
			lech.push("nhanh loi: focus khong o o so tien");
		go(o, "");
		if (dong(form) !== "") lech.push(`nhanh loi trong: dong «${dong(form)}»`);
		await gui(form);
		if (lenh() !== JSON.stringify([[null, "-"]])) {
			lech.push(`nhanh loi trong: gui ${lenh()} != [[null,"-"]]`);
		}
		expect(lech).toEqual([]);
	});
});

describe("nhanh-thu-lai", () => {
	test("nhanh-thu-lai: Thu lai goi lai thiet lap roi doc so", async () => {
		cheDo = ["loi", "ve"];
		const lech: string[] = [];
		const { form } = await moNhanh();
		go(oSoTien(form), "150.000.000");
		const truoc = soLanGoi;
		const thu = nutThuLai(form);
		if (!thu) throw new Error("khong thay nut Thử lại");
		await act(async () => thu.click());
		await cho();
		if (soLanGoi !== truoc + 1) {
			lech.push(`nhanh thu lai: so lan goi ${soLanGoi} != ${truoc + 1}`);
		}
		if (nutThuLai(form)) lech.push("nhanh thu lai: nut Thử lại van con");
		if (dong(form) !== docLa("VND"))
			lech.push(`nhanh thu lai: dong «${dong(form)}»`);
		await gui(form);
		if (lenh() !== JSON.stringify([[15_000_000_000, "VND"]])) {
			lech.push(`nhanh thu lai: gui ${lenh()}`);
		}
		expect(lech).toEqual([]);
	});

	test("nhanh-thu-lai: Thu lai hong lan nua thi van con cach thu", async () => {
		cheDo = ["loi", "loi"];
		const { form } = await moNhanh();
		const thu = nutThuLai(form);
		if (!thu) throw new Error("khong thay nut Thử lại");
		await act(async () => thu.click());
		await cho();
		expect(soLanGoi).toBe(2);
		expect(nutThuLai(form)).toBeTruthy();
	});
});

describe("ten-bao-cao", () => {
	test("ten-bao-cao: tam tao goi dung ten dong tien bao cao o hai tieng", async () => {
		const ca: { locale: "vi" | "en"; mode: CheDo; so: string; dong: string }[] =
			[
				{
					locale: "vi",
					mode: "treo",
					so: "150.000.000",
					dong: "Đang tải đồng tiền báo cáo…",
				},
				{
					locale: "vi",
					mode: "loi",
					so: "150.000.000",
					dong: "Không tải được đồng tiền báo cáo — chọn đồng tiền bên cạnh để nhập số tiền.",
				},
				{
					locale: "en",
					mode: "treo",
					so: "150,000,000",
					dong: "Loading the reporting currency…",
				},
				{
					locale: "en",
					mode: "loi",
					so: "150,000,000",
					dong: "Couldn't load the reporting currency — pick a currency next to the amount to enter it.",
				},
			];
		const lech: string[] = [];
		let daChay = 0;
		for (const c of ca) {
			cheDo = [c.mode];
			soLanGoi = 0;
			await dung(
				h(CreateDealSheet, { companyId: "c1" }),
				"?new=true",
				c.locale,
			);
			go(oSoTien(), c.so);
			daChay += 1;
			const nhan = `${c.locale}/${c.mode === "treo" ? "dang-tai" : "loi"}`;
			if (dong() !== c.dong)
				lech.push(`${nhan}: dong «${dong()}» != «${c.dong}»`);
			don();
		}
		expect(lech).toEqual([]);
		expect(daChay).toBe(4);
	});
});
