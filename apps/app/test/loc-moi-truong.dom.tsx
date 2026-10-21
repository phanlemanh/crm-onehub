import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { FIELD_TYPES, type FieldTypeName } from "@crm/db/fields-shape";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { fieldListOutput } from "../../api/src/fields/fields.contracts";

type TuyChonGhi = {
	onSuccess?: (kq: unknown, vao: unknown) => unknown;
	onError?: (e: Error) => unknown;
};

const duLieu = new Map<string, (vao: unknown) => unknown>();
let goi: Array<{ ten: string; vao: unknown }> = [];

function thuTuc(ten: string) {
	const khoa = (vao?: unknown) => (vao === undefined ? [ten] : [ten, vao]);
	const doc = (vao: unknown) => {
		goi.push({ ten, vao });
		const f = duLieu.get(ten);
		return f ? f(vao) : null;
	};
	return {
		queryKey: khoa,
		pathKey: () => [ten],
		queryFilter: () => ({ queryKey: [ten] }),
		infiniteQueryOptions: (vao?: unknown) => ({
			queryKey: khoa(vao),
			queryFn: async () => doc(vao),
			initialPageParam: 0,
			getNextPageParam: () => undefined,
		}),
		queryOptions: (vao?: unknown) => ({
			queryKey: khoa(vao),
			queryFn: async () => doc(vao),
		}),
		mutationOptions: (chon?: TuyChonGhi) => ({
			...chon,
			mutationKey: [ten],
			mutationFn: async (vao: unknown) => doc(vao),
		}),
	};
}

function nhanh(duong: string[]): unknown {
	return new Proxy(() => {}, {
		get(_t, ten: string) {
			if (
				[
					"queryKey",
					"pathKey",
					"queryFilter",
					"queryOptions",
					"mutationOptions",
					"infiniteQueryOptions",
				].includes(ten) &&
				duong.length >= 2
			) {
				return (thuTuc(duong.join(".")) as Record<string, unknown>)[ten];
			}
			return nhanh([...duong, ten]);
		},
	});
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => nhanh([]),
}));
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => new Proxy({}, { get: () => async () => {} }),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/deals",
	useSearchParams: () => new URLSearchParams(),
}));

const { FieldEditor } = await import("@/components/crm/fields/field-editor");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { crmMessages } = await import("@/lib/messages/crm");
const { fieldsCopy } = await import("@/components/crm/fields/fields-copy");

let roots: { o: HTMLElement; root: Root }[] = [];
let urls: UrlUpdateEvent[] = [];

beforeEach(() => {
	goi = [];
	urls = [];
	duLieu.clear();
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

async function mo(man: ReactElement, searchParams = "") {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter
				hasMemory
				searchParams={searchParams}
				onUrlUpdate={(e) => urls.push(e)}
			>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	roots.push({ o, root });
	return o;
}

function truongMau(type: FieldTypeName, i: number) {
	return {
		id: `f-${i}`,
		entity: "DEAL",
		key: `lmt_${type.toLowerCase()}`,
		label: `Lmt ${type}`,
		type,
		agentFilled: false,
		agentBrief: null,
		required: false,
		showOnSheet: true,
		showOnTable: true,
		showOnFilter: false,
		position: i,
		archived: false,
		options:
			type === "SELECT"
				? [
						{ id: "o-a", label: "A", position: 0 },
						{ id: "o-b", label: "B", position: 1 },
					]
				: [],
	};
}

function dsTruong() {
	return JSON.parse(
		JSON.stringify(fieldListOutput.parse(FIELD_TYPES.map(truongMau))),
	) as Array<ReturnType<typeof truongMau>>;
}

describe("lmt-cai-dat", () => {
	test("lmt-cai-dat: o Hien trong bo loc co cho moi kieu va luu showOnFilter", async () => {
		const nhan = crmMessages("vi").fields.filterDeal;
		const truong = dsTruong();
		let soKieu = 0;
		const kq: Record<string, boolean> = {};
		for (const f of truong) {
			goi = [];
			duLieu.set("fields.update", (vao) => vao);
			const o = await mo(
				<FieldEditor
					entity="DEAL"
					field={f as never}
					onArchive={() => {}}
					onDone={() => {}}
				/>,
			);
			const nhanO = [...o.querySelectorAll("label")].find((l) =>
				l.textContent?.includes(nhan),
			);
			const oTich = nhanO?.querySelector<HTMLElement>('[role="checkbox"]');
			if (!oTich) {
				kq[f.type] = false;
				if (f.type !== "SELECT")
					throw new Error(`lmt cai dat: thieu o ${f.type}`);
				throw new Error("lmt cai dat: doi chung SELECT");
			}
			await act(async () => oTich.click());
			const luu = [...o.querySelectorAll("button")].find(
				(b) => b.textContent?.trim() === fieldsCopy("vi").save,
			);
			await act(async () => luu?.click());
			await cho(
				() => goi.some((g) => g.ten === "fields.update"),
				`luu ${f.type}`,
			);
			const vao = goi.find((g) => g.ten === "fields.update")?.vao as {
				data: { showOnFilter: boolean };
			};
			if (vao?.data?.showOnFilter !== true) {
				throw new Error(`lmt cai dat: luu ${f.type} ${JSON.stringify(vao)}`);
			}
			kq[f.type] = true;
			soKieu += 1;
			for (const s of roots) {
				await act(async () => s.root.unmount());
				s.o.remove();
			}
			roots = [];
		}
		if (soKieu !== FIELD_TYPES.length) {
			throw new Error(`lmt cai dat: thieu o ${soKieu}`);
		}
		expect(Object.keys(kq).length).toBe(FIELD_TYPES.length);
	});
});

const { DealsTable } = await import("@/app/(app)/[slug]/deals/deals-table");
const { CompaniesTable } = await import(
	"@/app/(app)/[slug]/companies/companies-table"
);
const { ContactsTable } = await import(
	"@/app/(app)/[slug]/contacts/contacts-table"
);
const { dealsSearchParams } = await import(
	"@/app/(app)/[slug]/deals/deals-search-params"
);
const { useTableQuery } = await import(
	"@/components/data-table/use-table-query"
);
const { savedViewFilters } = await import("@crm/validation/saved-view");

const GIAI_DOAN = [
	{ id: "g1", label: "Tiep can", kind: "OPEN", color: null, position: 0 },
	{ id: "g2", label: "Thang", kind: "WON", color: null, position: 1 },
];

function datChung() {
	const truong = dsTruong().map((f) => ({ ...f, showOnFilter: true }));
	duLieu.set("fields.filters", () => truong);
	duLieu.set("fields.list", () => []);
	duLieu.set("users.list", () => []);
	duLieu.set("savedViews.list", () => []);
	duLieu.set("companies.options", () => []);
	duLieu.set("giaiDoan.list", () => ({
		stages: GIAI_DOAN,
		canManage: false,
		tran: 0,
	}));
	for (const ten of ["contacts.list", "companies.list", "deals.list"]) {
		duLieu.set(ten, () => ({ rows: [], total: 0, facetCounts: {} }));
	}
	return truong;
}

function urlCuoi() {
	return new URLSearchParams(urls.at(-1)?.queryString ?? "");
}

type Bang = { ten: string; thuTuc: string; man: () => ReactElement };
const BANG: Bang[] = [
	{ ten: "deals", thuTuc: "deals.list", man: () => <DealsTable /> },
	{ ten: "companies", thuTuc: "companies.list", man: () => <CompaniesTable /> },
	{ ten: "contacts", thuTuc: "contacts.list", man: () => <ContactsTable /> },
];

function lanTaiCuoi(thuTuc: string) {
	return goi.filter((g) => g.ten === thuTuc).at(-1)?.vao as
		| { fields: Record<string, string[]> }
		| undefined;
}

let hienTai: ReturnType<typeof useTableQuery> | null = null;
function Moc({
	truong,
}: {
	truong: Array<{ key: string; type: FieldTypeName }>;
}) {
	hienTai = useTableQuery(dealsSearchParams, { truongLoc: truong }) as never;
	return null;
}

describe("lmt-duong-dan", () => {
	test("lmt-duong-dan: khoa lap field:<khoa>, may chu bang may khach, duong dan cu, gia tri hong, vong luu", async () => {
		const truong = datChung().map(({ key, type }) => ({ key, type }));
		await mo(<Moc truong={truong} />);
		await nhip(3);
		await act(async () => {
			hienTai?.query.setFilter("field:lmt_number", ["gte:5", "lte:20"]);
		});
		await nhip(2);
		await act(async () => {
			hienTai?.query.setFilter("field:lmt_select", ["o-a"]);
			hienTai?.query.setFilter("stage", ["g1"]);
		});
		await nhip(2);
		const u = urlCuoi();
		if (u.getAll("field:lmt_number").join(",") !== "gte:5,lte:20") {
			throw new Error(`lmt duong dan: ghi ${u.toString()}`);
		}
		if (u.has("fields")) throw new Error("lmt duong dan: con json");
		if (u.getAll("stage").join(",") !== "g1") {
			throw new Error(`lmt duong dan: chuan doi ${u.toString()}`);
		}

		const qs =
			"?field:lmt_number=gte:5&field:lmt_number=lte:20&field:lmt_select=o-a";
		const mayChu = dealsSearchParams.toInput(
			await dealsSearchParams.load(new URLSearchParams(qs)),
		).fields;
		for (const s of roots) {
			await act(async () => s.root.unmount());
			s.o.remove();
		}
		roots = [];
		urls = [];
		await mo(<Moc truong={truong} />, qs);
		await nhip(3);
		const mayKhach = hienTai?.input.fields;
		const mong = { lmt_number: ["gte:5", "lte:20"], lmt_select: ["o-a"] };
		if (
			JSON.stringify(mayChu) !== JSON.stringify(mong) ||
			JSON.stringify(mayKhach) !== JSON.stringify(mong)
		) {
			throw new Error(
				`lmt duong dan: may chu lech may khach ${JSON.stringify({ mayChu, mayKhach })}`,
			);
		}

		for (const bang of BANG) {
			for (const s of roots) {
				await act(async () => s.root.unmount());
				s.o.remove();
			}
			roots = [];
			goi = [];
			urls = [];
			datChung();
			await mo(bang.man(), '?fields={"lmt_select":["o-a"]}');
			await cho(
				() => !!lanTaiCuoi(bang.thuTuc)?.fields?.lmt_select,
				`${bang.ten} cu`,
			);
			if (
				JSON.stringify(lanTaiCuoi(bang.thuTuc)?.fields) !==
				JSON.stringify({ lmt_select: ["o-a"] })
			) {
				throw new Error("lmt duong dan: cu doc sai");
			}
			await cho(
				() => urlCuoi().get("field:lmt_select") === "o-a",
				`${bang.ten} ghi lai`,
			);
			if (urlCuoi().has("fields"))
				throw new Error("lmt duong dan: cu khong ghi lai");

			for (const s of roots) {
				await act(async () => s.root.unmount());
				s.o.remove();
			}
			roots = [];
			goi = [];
			datChung();
			await mo(
				bang.man(),
				"?field:lmt_number=gte:abc&field:lmt_checkbox=maybe&field:lmt_date=this-month",
			);
			await cho(
				() => !!lanTaiCuoi(bang.thuTuc)?.fields?.lmt_date,
				`${bang.ten} hong`,
			);
			for (const g of goi.filter((x) => x.ten === bang.thuTuc)) {
				const f = (g.vao as { fields: Record<string, string[]> }).fields;
				for (const gia of ["gte:abc", "maybe"]) {
					if (JSON.stringify(f).includes(gia)) {
						throw new Error(`lmt duong dan: gui hong ${gia}`);
					}
				}
			}
		}

		const GIA: Record<FieldTypeName, string[]> = {
			TEXT: ["has:lmt", "none"],
			LONG_TEXT: ["has:dai"],
			URL: ["none"],
			EMAIL: ["has:@x.vn"],
			PHONE: ["has:0903"],
			NUMBER: ["gte:1.5", "lte:20"],
			DATE: ["overdue", "later", "none"],
			CHECKBOX: ["yes", "no"],
			SELECT: ["o-a", "none"],
			USER: ["u-1", "none"],
		};
		for (const { key, type } of truong) {
			for (const s of roots) {
				await act(async () => s.root.unmount());
				s.o.remove();
			}
			roots = [];
			await mo(<Moc truong={truong} />);
			await nhip(2);
			await act(async () =>
				hienTai?.query.setFilter(`field:${key}`, GIA[type]),
			);
			await nhip(2);
			const view = hienTai?.currentView;
			if (!savedViewFilters.safeParse(view).success) {
				throw new Error("lmt duong dan: khuon luu");
			}
			for (const s of roots) {
				await act(async () => s.root.unmount());
				s.o.remove();
			}
			roots = [];
			await mo(<Moc truong={truong} />);
			await nhip(2);
			await act(async () => hienTai?.applyView(savedViewFilters.parse(view)));
			await nhip(2);
			if (JSON.stringify(hienTai?.currentView) !== JSON.stringify(view)) {
				throw new Error(`lmt duong dan: vong luu ${type}`);
			}
		}
		expect(truong.length).toBe(FIELD_TYPES.length);
	});
});

async function bamTro(el: Element | null | undefined, moTa: string) {
	if (!(el instanceof HTMLElement)) throw new Error(`khong co ${moTa}`);
	await act(async () => {
		for (const loai of ["pointerdown", "mousedown", "pointerup", "click"]) {
			el.dispatchEvent(
				new window.PointerEvent(loai, {
					bubbles: true,
					cancelable: true,
					button: 0,
					pointerType: "mouse",
				}),
			);
		}
	});
	await nhip(2);
}

function nutTheoChu(chu: string) {
	return [...document.body.querySelectorAll("button, [role='menuitem']")].find(
		(b) => (b.textContent ?? "").trim().startsWith(chu),
	);
}

async function dongHet() {
	for (const s of roots) {
		await act(async () => s.root.unmount());
		s.o.remove();
	}
	roots = [];
	document.body.innerHTML = "";
}

function khuon(x: unknown) {
	const sap = (v: unknown): unknown =>
		Array.isArray(v)
			? v.map(sap)
			: v && typeof v === "object"
				? Object.fromEntries(
						Object.entries(v as Record<string, unknown>)
							.sort(([a], [b]) => a.localeCompare(b))
							.map(([k, w]) => [k, sap(w)]),
					)
				: v;
	return JSON.stringify(sap(x));
}

describe("lmt-luu-thoa-thuan", () => {
	test("lmt-luu-thoa-thuan: menu bo loc da luu o bang va bang cot, luu, ap, giu kieu xem", async () => {
		const v = crmMessages("vi").views;
		for (const view of ["table", "board"] as const) {
			datChung();
			duLieu.set("deals.board", () => ({
				columns: [],
				reportingCurrency: "VND",
			}));
			await mo(<DealsTable />, view === "board" ? "?view=board" : "");
			await nhip(3);
			if (!nutTheoChu(v.button)) {
				throw new Error(`lmt luu thoa thuan: thieu menu ${view}`);
			}
			await dongHet();
		}

		datChung();
		const qs =
			"?status=open&owner=u-1&closing=this-month&field:lmt_number=gte:5&field:lmt_select=o-a";
		await mo(<DealsTable />, qs);
		await nhip(3);
		await bamTro(nutTheoChu(v.button), "nut menu");
		await bamTro(nutTheoChu(v.saveCurrent), "muc luu");
		const o = document.getElementById(
			"saved-view-name",
		) as HTMLInputElement | null;
		if (!o) throw new Error("lmt luu thoa thuan: khong mo hop luu");
		await act(async () => {
			const dat = Object.getOwnPropertyDescriptor(
				window.HTMLInputElement.prototype,
				"value",
			)?.set;
			dat?.call(o, "Lmt cho ky");
			o.dispatchEvent(new window.Event("input", { bubbles: true }));
		});
		duLieu.set("savedViews.create", (vao) => vao);
		const nutLuu = [...document.body.querySelectorAll("button")].find(
			(b) => b.textContent?.trim() === v.save,
		);
		await bamTro(nutLuu, "nut luu");
		await cho(() => goi.some((g) => g.ten === "savedViews.create"), "luu");
		const daLuu = goi.find((g) => g.ten === "savedViews.create")?.vao as {
			entity: string;
			filters: unknown;
		};
		const mongLuu = {
			q: "",
			sort: "createdAt",
			dir: "desc",
			archived: false,
			filters: {
				status: ["open"],
				owner: ["u-1"],
				stage: [],
				closing: ["this-month"],
				"field:lmt_number": ["gte:5"],
				"field:lmt_select": ["o-a"],
			},
		};
		if (daLuu?.entity !== "DEAL" || khuon(daLuu.filters) !== khuon(mongLuu)) {
			throw new Error(`lmt luu thoa thuan: luu ${JSON.stringify(daLuu)}`);
		}
		if ("view" in (daLuu.filters as object)) {
			throw new Error("lmt luu thoa thuan: kieu xem");
		}
		await dongHet();

		for (const view of ["table", "board"] as const) {
			datChung();
			duLieu.set("deals.board", () => ({
				columns: [],
				reportingCurrency: "VND",
			}));
			duLieu.set("savedViews.list", () => [
				{
					id: "sv-1",
					entity: "DEAL",
					name: "Lmt cho ky",
					shared: false,
					filters: mongLuu,
					size: null,
					mine: true,
					usedBy: [],
					createdAt: "2026-10-22T00:00:00.000Z",
					updatedAt: "2026-10-22T00:00:00.000Z",
				},
			]);
			goi = [];
			urls = [];
			await mo(<DealsTable />, view === "board" ? "?view=board" : "");
			await nhip(3);
			await bamTro(nutTheoChu(v.button), "nut menu");
			await bamTro(nutTheoChu("Lmt cho ky"), "muc bo loc");
			await nhip(3);
			const u = urlCuoi();
			if (
				u.get("field:lmt_number") !== "gte:5" ||
				u.get("closing") !== "this-month" ||
				u.get("owner") !== "u-1"
			) {
				throw new Error(`lmt luu thoa thuan: ap url ${view} ${u.toString()}`);
			}
			if (view === "board" && u.get("view") !== "board") {
				throw new Error("lmt luu thoa thuan: kieu xem");
			}
			const thuTuc = view === "board" ? "deals.board" : "deals.list";
			await cho(
				() =>
					(
						goi.filter((g) => g.ten === thuTuc).at(-1)?.vao as {
							fields?: object;
						}
					)?.fields !== undefined &&
					khuon(
						(
							goi.filter((g) => g.ten === thuTuc).at(-1)?.vao as {
								fields: object;
							}
						).fields,
					) === khuon({ lmt_number: ["gte:5"], lmt_select: ["o-a"] }),
				`ap tai ${view}`,
			);
			await dongHet();
		}

		const nguon = await Bun.file(
			new URL(
				"../app/(app)/[slug]/campaigns/create-campaign-sheet.tsx",
				import.meta.url,
			),
		).text();
		if (
			!/savedViews\.list\.queryOptions\(\{\s*entity:\s*"CONTACT"\s*\}\)/.test(
				nguon,
			)
		) {
			throw new Error("lmt luu thoa thuan: lot vao chien dich");
		}
		expect(khuon(daLuu.filters)).toBe(khuon(mongLuu));
	});
});
