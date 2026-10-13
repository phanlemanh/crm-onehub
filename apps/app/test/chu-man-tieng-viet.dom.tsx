import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { FIELD_TYPES, type FieldTypeName } from "@crm/db/fields-shape";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { fieldListOutput } from "../../api/src/fields/fields.contracts";

type Locale = "vi" | "en";

const NGAN: Record<Locale, Record<FieldTypeName, string>> = {
	vi: {
		TEXT: "Chữ",
		LONG_TEXT: "Chữ dài",
		NUMBER: "Số",
		DATE: "Ngày",
		CHECKBOX: "Ô đánh dấu",
		SELECT: "Chọn",
		URL: "URL",
		EMAIL: "Email",
		PHONE: "Số điện thoại",
		USER: "Người",
	},
	en: {
		TEXT: "Text",
		LONG_TEXT: "Long text",
		NUMBER: "Number",
		DATE: "Date",
		CHECKBOX: "Checkbox",
		SELECT: "Select",
		URL: "URL",
		EMAIL: "Email",
		PHONE: "Phone",
		USER: "User",
	},
};

let daGoi: string[] = [];

function truong(type: FieldTypeName, i: number) {
	return {
		id: `f-${i}`,
		entity: "CONTACT",
		key: `cmt_${type.toLowerCase()}`,
		label: `Trường ${type}`,
		type,
		agentFilled: false,
		agentBrief: null,
		required: false,
		showOnSheet: true,
		showOnTable: false,
		showOnFilter: false,
		position: i,
		archived: false,
		options:
			type === "SELECT" ? [{ id: "o-1", label: "Một", position: 0 }] : [],
	};
}

function dsTruong() {
	return JSON.parse(
		JSON.stringify(fieldListOutput.parse(FIELD_TYPES.map(truong))),
	);
}

function thuTuc(ten: string, doc: () => unknown) {
	const khoa = (vao?: unknown) => (vao === undefined ? [ten] : [ten, vao]);
	return {
		queryKey: khoa,
		pathKey: () => [ten],
		queryOptions: (vao?: unknown) => ({
			queryKey: khoa(vao),
			queryFn: async () => {
				daGoi.push(ten);
				return doc();
			},
		}),
		mutationOptions: (chon?: object) => ({
			...chon,
			mutationKey: [ten],
			mutationFn: async () => doc(),
		}),
	};
}

const khongDoc = () => {
	throw new Error("khong doc thu tuc nay");
};

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		fields: {
			list: thuTuc("fields.list", dsTruong),
			coverage: thuTuc("fields.coverage", () => ({ filled: 0, total: 0 })),
			create: thuTuc("fields.create", khongDoc),
			update: thuTuc("fields.update", khongDoc),
			reorder: thuTuc("fields.reorder", khongDoc),
			restore: thuTuc("fields.restore", khongDoc),
			archive: thuTuc("fields.archive", khongDoc),
			backfill: thuTuc("fields.backfill", khongDoc),
		},
	}),
}));
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => new Proxy({}, { get: () => async () => {} }),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/settings/fields",
	useSearchParams: () => new URLSearchParams(),
}));

const { FieldsList } = await import("@/components/crm/fields/fields-list");
const { FieldEditor } = await import("@/components/crm/fields/field-editor");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { crmMessages } = await import("@/lib/messages/crm");
const { TYPE_KEY } = await import("@/components/crm/fields/fields-copy");

let roots: { o: HTMLElement; root: Root }[] = [];

beforeEach(() => {
	daGoi = [];
});

afterEach(async () => {
	for (const s of roots) {
		await act(async () => s.root.unmount());
		s.o.remove();
	}
	roots = [];
	document.body.innerHTML = "";
});

async function nhip(lan = 1) {
	for (let i = 0; i < lan; i += 1) {
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
}

async function cho(dieu: () => boolean, moTa: string) {
	for (let i = 0; i < 100; i += 1) {
		if (dieu()) return;
		await nhip();
	}
	throw new Error(`khong toi: ${moTa}`);
}

async function mo(man: ReactElement, locale: Locale) {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter hasMemory>
				<QueryClientProvider client={client}>
					<LocaleProvider locale={locale}>
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	roots.push({ o, root });
	return o;
}

function kiemNhanKieu(o: ParentNode, locale: Locale) {
	const nhan = [...o.querySelectorAll<HTMLElement>("[data-nhan-kieu]")];
	let dem = 0;
	for (const kieu of FIELD_TYPES) {
		const el = nhan.find((x) => x.dataset.nhanKieu === kieu);
		const chu = el?.textContent?.trim() ?? null;
		const mong = NGAN[locale][kieu];
		if (chu?.includes("—")) {
			throw new Error(
				`cmt-nhan-kieu: ${locale} ${kieu.toLowerCase()} doc cau dai thay vi ${mong}`,
			);
		}
		if (chu !== mong) {
			throw new Error(
				`cmt-nhan-kieu: ${locale} ${kieu.toLowerCase()} doc ${chu} thay vi ${mong}`,
			);
		}
		dem += 1;
	}
	return dem;
}

describe("nhan-kieu", () => {
	for (const locale of ["vi", "en"] as const) {
		test(`${locale}: muoi kieu doc ten ngan, khong co dau gach`, async () => {
			const o = await mo(
				<FieldsList
					entity="CONTACT"
					khoa={false}
					onArchive={() => {}}
					onEdit={() => {}}
					onNew={() => {}}
				/>,
				locale,
			);
			await cho(() => daGoi.includes("fields.list"), "doc danh sach truong");
			await cho(
				() =>
					o.querySelectorAll("[data-nhan-kieu]").length >= FIELD_TYPES.length,
				"du muoi nhan kieu",
			);
			expect(kiemNhanKieu(o, locale)).toBe(10);
		});
	}

	test("ma tran du 20 o", () => {
		expect(FIELD_TYPES.length * Object.keys(NGAN).length).toBe(20);
	});

	test("chieu do: hang dung cau dai thi bai kiem bat", () => {
		const o = document.createElement("div");
		o.innerHTML = FIELD_TYPES.map(
			(k) =>
				`<span data-nhan-kieu="${k}">${k === "SELECT" ? "Chọn — một trong danh sách cố định" : NGAN.vi[k]}</span>`,
		).join("");
		expect(() => kiemNhanKieu(o, "vi")).toThrow(
			"cmt-nhan-kieu: vi select doc cau dai thay vi Chọn",
		);
	});
});

async function moOChon(o: HTMLElement) {
	const nut = o.querySelector<HTMLElement>('[role="combobox"]');
	if (!nut) throw new Error("khong co o chon kieu");
	await act(async () => {
		for (const loai of ["pointerdown", "mousedown", "pointerup", "click"]) {
			nut.dispatchEvent(
				new window.PointerEvent(loai, {
					bubbles: true,
					cancelable: true,
					button: 0,
					pointerType: "mouse",
				}),
			);
		}
	});
	await cho(
		() => document.querySelectorAll('[role="option"]').length > 0,
		"o chon kieu mo",
	);
}

function kiemOChon(locale: Locale, chu: string[]) {
	const dai = crmMessages(locale).fields.type;
	const mong = FIELD_TYPES.map((k) => dai[TYPE_KEY[k]]);
	for (const [i, m] of mong.entries()) {
		if (chu[i] !== m) {
			throw new Error(
				`cmt-o-chon: ${locale} ${FIELD_TYPES[i]?.toLowerCase()} mat cau dai`,
			);
		}
	}
	return mong.length;
}

describe("o-chon", () => {
	for (const locale of ["vi", "en"] as const) {
		test(`${locale}: o Kieu doc cau mo ta day du`, async () => {
			const o = await mo(
				<FieldEditor
					entity="CONTACT"
					field={undefined}
					onArchive={() => {}}
					onDone={() => {}}
				/>,
				locale,
			);
			await moOChon(o);
			const chu = [...document.querySelectorAll('[role="option"]')].map(
				(x) => x.textContent?.trim() ?? "",
			);
			expect(kiemOChon(locale, chu)).toBe(10);
		});
	}

	test("chieu do: o chon dung ten ngan thi bai kiem bat", () => {
		const dai = crmMessages("vi").fields.type;
		expect(() =>
			kiemOChon(
				"vi",
				FIELD_TYPES.map((k) =>
					k === "SELECT" ? NGAN.vi[k] : dai[TYPE_KEY[k]],
				),
			),
		).toThrow("cmt-o-chon: vi select mat cau dai");
	});
});
