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
	useContext,
} from "react";
import { createRoot, type Root } from "react-dom/client";

type DealWrite = {
	name: string;
	amountCents: number | null;
	currency?: string;
};
type MutationHooks = { onSuccess?: unknown; onError?: unknown };

let createCalls: DealWrite[] = [];
let reportingCurrency = "VND";
let settingsTreo = false;

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
		users: {
			list: thuTuc("users.list", () => [{ id: "u1", name: "Người A" }]),
			me: thuTuc("users.me", () => ({ id: "u1", name: "Người A" })),
		},
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
		currency: {
			settings: thuTuc("currency.settings", () =>
				settingsTreo
					? new Promise(() => {})
					: { reportingCurrency, currencies: [] },
			),
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
	CompanyPicker: () => null,
}));

mock.module("sonner", () => ({
	toast: Object.assign(() => undefined, {
		error: () => undefined,
		success: () => undefined,
	}),
}));

const SelectCtx = createContext<(value: string) => void>(() => undefined);

const realSelect = await import("@crm/ui/components/select");

mock.module("@crm/ui/components/select", () => ({
	...realSelect,
	Select: ({
		onValueChange,
		children,
	}: {
		onValueChange: (value: string) => void;
		children: ReactNode;
	}) => h(SelectCtx.Provider, { value: onValueChange }, children),
	SelectTrigger: ({ children }: { children: ReactNode }) =>
		h("span", null, children),
	SelectValue: () => null,
	SelectContent: ({ children }: { children: ReactNode }) =>
		h("span", null, children),
	SelectItem: ({ value, children }: { value: string; children: ReactNode }) => {
		const chon = useContext(SelectCtx);
		return h(
			"button",
			{ type: "button", "data-select-item": value, onClick: () => chon(value) },
			children,
		);
	},
}));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { CreateDealSheet } = await import(
	"@/app/(app)/[slug]/deals/create-deal-sheet"
);
const { InlineMoneyField } = await import("@/components/crm/inline-field");
const { QuickAddDeal } = await import(
	"@/components/crm/record-sheet/quick-add"
);

let root: Root | null = null;
let khung: HTMLElement | null = null;

async function cho(n = 6) {
	for (let i = 0; i < n; i += 1) {
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
}

async function dung(cay: ReactNode, search = "") {
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
					<LocaleProvider locale="vi">{cay}</LocaleProvider>
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

function phim(input: HTMLInputElement, key: string): KeyboardEvent {
	const e = new KeyboardEvent("keydown", {
		key,
		bubbles: true,
		cancelable: true,
	});
	act(() => {
		input.dispatchEvent(e);
	});
	return e;
}

function oSoTien(goc: ParentNode = document): HTMLInputElement {
	const o = goc.querySelector<HTMLInputElement>(
		'[data-slot="money-input"] input',
	);
	if (!o) throw new Error("khong thay o so tien");
	return o;
}

function dongDocLai(goc: ParentNode = document): string {
	return (
		goc.querySelector('[data-slot="money-input"] [aria-live]')?.textContent ??
		""
	);
}

async function gui(form: HTMLFormElement) {
	await act(async () => {
		form.requestSubmit();
	});
	await cho();
}

beforeEach(() => {
	createCalls = [];
	reportingCurrency = "VND";
	settingsTreo = false;
});

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

describe("tao-thoa-thuan", () => {
	async function moTam() {
		await dung(h(CreateDealSheet, { companyId: "c1" }), "?new=true");
		const form = document.querySelector<HTMLFormElement>("form#create-deal");
		if (!form) throw new Error("tam tao khong mo");
		const ten = form.querySelector<HTMLInputElement>(
			'input:not([data-slot="money-input"] input)',
		);
		if (!ten) throw new Error("khong thay o ten");
		go(ten, "Thoả thuận thử");
		const nut = document.querySelector<HTMLButtonElement>(
			'button[type="submit"][form="create-deal"]',
		);
		if (!nut) throw new Error("khong thay nut Tao");
		return { form, nut };
	}

	test("tao-thoa-thuan: doc dung, tu choi, rong", async () => {
		const lech: string[] = [];
		{
			const { form } = await moTam();
			go(oSoTien(), "150.000.000");
			await gui(form);
			const lenh = JSON.stringify(
				createCalls.map((c) => [c.amountCents, c.currency]),
			);
			if (lenh !== JSON.stringify([[15_000_000_000, "VND"]])) {
				lech.push(`tao: amountCents ${lenh} != [[15000000000,"VND"]]`);
			}
		}
		act(() => root?.unmount());
		document.body.innerHTML = "";
		createCalls = [];
		{
			const { form, nut } = await moTam();
			const o = oSoTien();
			go(o, "1.5");
			await gui(form);
			if (createCalls.length !== 0) {
				lech.push(`tao «1.5»: ${createCalls.length} lenh != 0`);
			}
			if (document.activeElement !== o) {
				lech.push("tao «1.5»: focus khong o o so tien");
			}
			if (
				dongDocLai() !==
				"Chưa đọc được số này. Dấu chấm ngăn hàng nghìn, dấu phẩy đứng trước phần lẻ — ví dụ 150.000.000."
			) {
				lech.push(`tao «1.5»: dong «${dongDocLai()}»`);
			}
			if (nut.disabled) lech.push("tao «1.5»: nut Tao bi khoa");
			if (phim(o, "Enter").defaultPrevented) {
				lech.push("tao: o so tien nuot phim Enter");
			}
		}
		act(() => root?.unmount());
		document.body.innerHTML = "";
		createCalls = [];
		{
			const { form } = await moTam();
			await gui(form);
			const lenh = JSON.stringify(createCalls.map((c) => c.amountCents));
			if (lenh !== "[null]") lech.push(`tao rong: ${lenh} != [null]`);
		}
		expect(lech).toEqual([]);
	});

	test("tao-thoa-thuan: doi dong tien sau khi go", async () => {
		const lech: string[] = [];
		const { form } = await moTam();
		const chon = (ma: string) => {
			const b = document.querySelector<HTMLButtonElement>(
				`[data-select-item="${ma}"]`,
			);
			if (!b) throw new Error(`khong thay dong ${ma}`);
			act(() => b.click());
		};
		chon("USD");
		go(oSoTien(), "1.500,50");
		chon("VND");
		await gui(form);
		if (createCalls.length !== 0) {
			lech.push(`doi dong VND: ${createCalls.length} lenh != 0`);
		}
		if (
			dongDocLai() !== "VND không có phần lẻ — gõ số tròn, ví dụ 150.000.000."
		) {
			lech.push(`doi dong VND: dong «${dongDocLai()}»`);
		}
		expect(lech).toEqual([]);
		chon("USD");
		await gui(form);
		const lenh = JSON.stringify(
			createCalls.map((c) => [c.amountCents, c.currency]),
		);
		if (lenh !== JSON.stringify([[150_050, "USD"]])) {
			lech.push(`doi lai USD: ${lenh} != [[150050,"USD"]]`);
		}
		expect(lech).toEqual([]);
	});
});

describe("sua-tai-cho", () => {
	let luu: (number | null)[] = [];

	async function mo() {
		luu = [];
		await dung(
			h(InlineMoneyField, {
				label: "Giá trị",
				cents: 150_000_050,
				currency: "USD",
				onSave: (next: number | null) => luu.push(next),
			}),
		);
		const nut = khung?.querySelector("button");
		if (!nut) throw new Error("khong thay nut so tien");
		act(() => nut.click());
		return oSoTien(khung ?? document);
	}

	test("sua-tai-cho: mo, luu, tu choi, Esc, de trong", async () => {
		const lech: string[] = [];
		let o = await mo();
		if (o.value !== "1.500.000,50")
			lech.push(`mo sua: «${o.value}» != «1.500.000,50»`);
		go(o, "2.000.000,75");
		phim(o, "Enter");
		if (JSON.stringify(luu) !== "[200000075]") {
			lech.push(
				`sua-tai-cho «2.000.000,75»: ${JSON.stringify(luu)} != [200000075]`,
			);
		}
		act(() => root?.unmount());

		o = await mo();
		go(o, "1.5");
		phim(o, "Enter");
		if (luu.length !== 0)
			lech.push(`sua-tai-cho «1.5»: onSave goi ${luu.length} lan != 0`);
		if (!khung?.querySelector('[data-slot="money-input"] input')) {
			lech.push("sua-tai-cho «1.5» Enter: roi che do sua");
		}
		if (
			!dongDocLai(khung ?? document).startsWith(
				"Số này viết theo kiểu tiếng Anh",
			)
		) {
			lech.push(`sua-tai-cho «1.5»: dong «${dongDocLai(khung ?? document)}»`);
		}
		act(() => {
			o.focus();
			o.blur();
		});
		if (luu.length !== 0)
			lech.push(`sua-tai-cho «1.5» blur: onSave goi ${luu.length} lan != 0`);
		if (!khung?.querySelector('[data-slot="money-input"] input')) {
			lech.push("sua-tai-cho «1.5» blur: roi che do sua");
		}
		phim(o, "Escape");
		const nutSau = khung?.querySelector("button");
		if (nutSau?.textContent !== formatMoney(150_000_050, "USD", "vi")) {
			lech.push(`Esc: nut «${nutSau?.textContent}»`);
		}
		if (luu.length !== 0) lech.push(`Esc: onSave goi ${luu.length} lan != 0`);
		act(() => root?.unmount());

		o = await mo();
		go(o, "");
		phim(o, "Enter");
		if (JSON.stringify(luu) !== "[null]") {
			lech.push(`de trong: ${JSON.stringify(luu)} != [null]`);
		}
		expect(lech).toEqual([]);
	});
});

describe("them-nhanh", () => {
	async function mo() {
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
		return form;
	}

	test("them-nhanh: doc dung, tu choi, rong", async () => {
		const lech: string[] = [];
		let form = await mo();
		go(oSoTien(form), "150.000.000");
		await gui(form);
		let lenh = JSON.stringify(
			createCalls.map((c) => [c.amountCents, c.currency]),
		);
		if (lenh !== JSON.stringify([[15_000_000_000, "VND"]])) {
			lech.push(`them-nhanh: amountCents ${lenh} != [[15000000000,"VND"]]`);
		}
		act(() => root?.unmount());
		createCalls = [];

		form = await mo();
		const o = oSoTien(form);
		go(o, "1,5");
		if (
			dongDocLai(form) !==
			"VND không có phần lẻ — gõ số tròn, ví dụ 150.000.000."
		) {
			lech.push(`them-nhanh «1,5»: dong «${dongDocLai(form)}»`);
		}
		await gui(form);
		if (createCalls.length !== 0)
			lech.push(`them-nhanh «1,5»: ${createCalls.length} lenh != 0`);
		if (document.activeElement !== o)
			lech.push("them-nhanh «1,5»: focus khong o o so tien");
		act(() => root?.unmount());
		createCalls = [];

		form = await mo();
		await gui(form);
		lenh = JSON.stringify(createCalls.map((c) => [c.amountCents, c.currency]));
		if (lenh !== JSON.stringify([[null, "VND"]])) {
			lech.push(`them-nhanh rong: ${lenh} != [[null,"VND"]]`);
		}
		expect(lech).toEqual([]);
	});

	test("them-nhanh: chua tai xong thiet lap tien te thi nut Tao bi khoa", async () => {
		settingsTreo = true;
		const form = await mo();
		const nut = form.querySelector<HTMLButtonElement>('button[type="submit"]');
		expect(nut?.disabled).toBe(true);
	});
});
