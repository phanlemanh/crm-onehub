import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { FIELD_TYPES, type FieldTypeName } from "@crm/db/fields-shape";
import { tepTrongO } from "@crm/validation/tep-truong";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import ts from "typescript";
import { fieldListOutput } from "../../api/src/fields/fields.contracts";

type Json =
	| string
	| number
	| boolean
	| null
	| Json[]
	| { [khoa: string]: Json };
type DauVao = Json | undefined;
type TuyChonGhi = {
	onSuccess?: (kq: Json, vao: DauVao) => void;
	onError?: (e: Error) => void;
};

const duLieu = new Map<string, (vao: DauVao) => Json>();
let goi: Array<{ ten: string; vao: DauVao }> = [];

function thuTuc(ten: string) {
	const khoa = (vao?: DauVao) => (vao === undefined ? [ten] : [ten, vao]);
	const doc = (vao: DauVao): Json => {
		goi.push({ ten, vao });
		const f = duLieu.get(ten);
		return f ? f(vao) : null;
	};
	return {
		queryKey: khoa,
		pathKey: () => [ten],
		queryFilter: () => ({ queryKey: [ten] }),
		queryOptions: (vao?: DauVao) => ({
			queryKey: khoa(vao),
			queryFn: async () => doc(vao),
		}),
		mutationOptions: (chon?: TuyChonGhi) => ({
			...chon,
			mutationKey: [ten],
			mutationFn: async (vao: DauVao) => doc(vao),
		}),
	};
}

type ThuTuc = ReturnType<typeof thuTuc>;
type TrpcGia = { [ten: string]: TrpcGia } & Partial<ThuTuc>;
const MAT = new Set([
	"queryKey",
	"pathKey",
	"queryFilter",
	"queryOptions",
	"mutationOptions",
]);

function nhanh(duong: string[]): TrpcGia {
	return new Proxy<TrpcGia>(
		{},
		{
			get(_t, ten: string) {
				if (MAT.has(ten) && duong.length >= 2) {
					return thuTuc(duong.join("."))[ten as keyof ThuTuc];
				}
				return nhanh([...duong, ten]);
			},
		},
	);
}

mock.module("@/lib/trpc/client", () => ({ useTRPC: () => nhanh([]) }));
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
const { OTruongPhieu } = await import("@/components/crm/fields/kieu-truong");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { crmMessages } = await import("@/lib/messages/crm");
const { messages: uiMessages } = await import("@crm/ui/lib/messages");
const { fieldsCopy, filterPlacement, sheetPlacement, tablePlacement } =
	await import("@/components/crm/fields/fields-copy");
const { DealsTable } = await import("@/app/(app)/[slug]/deals/deals-table");
const { dealsSearchParams } = await import(
	"@/app/(app)/[slug]/deals/deals-search-params"
);
const { useTableQuery } = await import(
	"@/components/data-table/use-table-query"
);

const m = crmMessages("vi");
let roots: { o: HTMLElement; root: Root }[] = [];
let urls: UrlUpdateEvent[] = [];

beforeEach(() => {
	goi = [];
	urls = [];
	duLieu.clear();
});

afterEach(async () => {
	await donRoot();
	document.body.innerHTML = "";
});

async function donRoot() {
	for (const s of roots) {
		await act(async () => s.root.unmount());
		s.o.remove();
	}
	roots = [];
}

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

async function bamCon(nut: HTMLElement) {
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
}

describe("ttp-cai-dat", () => {
	test("ttp-cai-dat: kiểu Tệp có trong ô chọn, ẩn Kara điền, lưu đúng cờ", async () => {
		duLieu.set("fields.create", (vao) => vao ?? null);
		duLieu.set("fields.coverage", () => ({ filled: 0, total: 0 }));
		const o = await mo(
			<FieldEditor
				entity="DEAL"
				field={undefined}
				onArchive={() => {}}
				onDone={() => {}}
			/>,
		);
		const nhanKara = fieldsCopy("vi").agentLabel;
		const coKara = () =>
			[...o.querySelectorAll("label")].some((l) =>
				l.textContent?.includes(nhanKara),
			);
		if (!coKara()) throw new Error("ttp cai dat: doi chung TEXT");

		const chon = o.querySelector<HTMLElement>('[role="combobox"]');
		if (!chon) throw new Error("ttp cai dat: khong co o chon kieu");
		await bamCon(chon);
		await cho(
			() => document.querySelectorAll('[role="option"]').length > 0,
			"o chon mo",
		);
		const tep = [
			...document.querySelectorAll<HTMLElement>('[role="option"]'),
		].find((x) => x.textContent?.trim() === m.fields.type.file);
		if (!tep) throw new Error("ttp cai dat: thieu kieu Tep");
		await act(async () => {
			tep.dispatchEvent(
				new KeyboardEvent("keydown", {
					key: "Enter",
					bubbles: true,
					cancelable: true,
				}),
			);
		});
		await nhip(2);
		if (coKara()) throw new Error("ttp cai dat: con Kara dien");
		for (const nhan of [
			sheetPlacement("DEAL", "vi"),
			tablePlacement("DEAL", "vi"),
			filterPlacement("DEAL", "vi"),
		]) {
			if (
				![...o.querySelectorAll("label")].some((l) =>
					l.textContent?.includes(nhan),
				)
			) {
				throw new Error(`ttp cai dat: thieu ${nhan}`);
			}
		}
		const oTen = o.querySelector<HTMLInputElement>("input");
		if (!oTen) throw new Error("ttp cai dat: thieu o ten");
		await act(async () => {
			const dat = Object.getOwnPropertyDescriptor(
				HTMLInputElement.prototype,
				"value",
			)?.set;
			dat?.call(oTen, "Hợp đồng");
			oTen.dispatchEvent(new Event("input", { bubbles: true }));
		});
		const nhanLoc = [...o.querySelectorAll("label")].find((l) =>
			l.textContent?.includes(filterPlacement("DEAL", "vi")),
		);
		const oLoc = nhanLoc?.querySelector<HTMLElement>('[role="checkbox"]');
		await act(async () => oLoc?.click());
		const luu = [...o.querySelectorAll("button")].find(
			(b) => b.textContent?.trim() === fieldsCopy("vi").addField,
		);
		await act(async () => luu?.click());
		await cho(() => goi.some((g) => g.ten === "fields.create"), "luu");
		const vao = goi.find((g) => g.ten === "fields.create")?.vao as {
			type: string;
			showOnFilter: boolean;
			agentFilled: boolean;
		};
		if (
			vao?.type !== "FILE" ||
			vao.showOnFilter !== true ||
			vao.agentFilled !== false
		) {
			throw new Error(`ttp cai dat: luu ${JSON.stringify(vao)}`);
		}
	});
});

function tepMau(id: string, ten: string, coTheMo: boolean, coTheXoa: boolean) {
	return tepTrongO.parse({
		id,
		tenTep: ten,
		kieu: "pdf",
		kichThuoc: 2048,
		taiLuc: "2026-10-20T03:00:00.000Z",
		taiBoi: { id: "u1", ten: "An" },
		coTheMo,
		coTheXoa,
	});
}

const TRANG_THAI = [
	{ ten: "co tep", bat: true, luuTru: false },
	{ ten: "luu tru", bat: true, luuTru: true },
	{ ten: "tat", bat: false, luuTru: false },
] as const;
type TrangThai = (typeof TRANG_THAI)[number];
const TEN_TEP = "Hợp đồng hợp tác.pdf";

function nutCua(o: HTMLElement, chu: string) {
	const nut = [...o.querySelectorAll<HTMLButtonElement>("button")].filter((b) =>
		b.textContent?.includes(chu),
	);
	const dung = nut.find((b) => b.getAttribute("aria-label")?.includes(TEN_TEP));
	if (nut.length > 0 && !dung) throw new Error("ttp o tep: nhan nut");
	return dung;
}

function kiemLyDo(o: HTMLElement, tt: TrangThai, coTheMo: boolean, ve: string) {
	const chu = o.textContent ?? "";
	if (chu.includes(m.tepTruong.khongMo) !== (!coTheMo && tt.bat)) {
		throw new Error(`ttp o tep: ${tt.ten} ${ve} ly do khong mo`);
	}
	if (chu.includes(m.tepTruong.tat) !== (!tt.bat && !tt.luuTru)) {
		throw new Error(`ttp o tep: ${tt.ten} ${ve} ly do tat`);
	}
}

function kiemVungTai(o: HTMLElement, tt: TrangThai, ve: string) {
	const vung = o.querySelector('[data-slot="nguon-keo-tha"]');
	if (tt.luuTru ? vung !== null : vung === null) {
		throw new Error(`ttp o tep: ${tt.ten} ${ve} vung tai`);
	}
	if (!tt.luuTru && vung?.getAttribute("data-tat") !== String(!tt.bat)) {
		throw new Error(`ttp o tep: ${tt.ten} ${ve} vung tai khoa`);
	}
}

async function kiemMotO(tt: TrangThai, coTheMo: boolean, coTheXoa: boolean) {
	duLieu.set("fieldFiles.status", () => ({ bat: tt.bat }));
	const o = await mo(
		<OTruongPhieu
			moTa={{
				khoa: "hop_dong",
				nhan: "Hợp đồng",
				kieu: "FILE",
				giaTri: null,
				luu: () => {},
				tep: [tepMau("t1", TEN_TEP, coTheMo, coTheXoa)],
				dichTep: { entity: "DEAL", recordId: "d1", luuTru: tt.luuTru },
			}}
		/>,
	);
	await nhip(3);
	const ve = `${coTheMo ? "mo" : "khong-mo"}/${coTheXoa ? "xoa" : "khong-xoa"}`;
	if (!o.querySelector('[data-slot="o-tep"]')) {
		throw new Error(`ttp o tep: ${tt.ten} ${coTheMo} thieu o`);
	}
	const nutMo = nutCua(o, m.tepTruong.nutMo);
	const nutXoa = nutCua(o, m.tepTruong.nutXoa);
	if (tt.ten === "co tep" && coTheMo && nutMo?.disabled !== false) {
		throw new Error("ttp o tep: doi chung");
	}
	if (!nutMo || nutMo.disabled === (coTheMo && tt.bat)) {
		throw new Error(`ttp o tep: ${tt.ten} ${ve} mo`);
	}
	if (Boolean(nutXoa) !== (coTheXoa && !tt.luuTru)) {
		throw new Error(`ttp o tep: ${tt.ten} ${ve} xoa`);
	}
	kiemVungTai(o, tt, ve);
	kiemLyDo(o, tt, coTheMo, ve);
	const tenEl = [...o.querySelectorAll("[translate]")].find(
		(x) => x.textContent === TEN_TEP,
	);
	if (tenEl?.getAttribute("translate") !== "no") {
		throw new Error("ttp o tep: dich ten");
	}
	await donRoot();
}

describe("ttp-o-tep", () => {
	test("ttp-o-tep: 3 trạng thái × 4 cặp cờ, khoá nút đúng câu trả lời máy chủ", async () => {
		let so = 0;
		for (const tt of TRANG_THAI) {
			for (const coTheMo of [true, false]) {
				for (const coTheXoa of [true, false]) {
					await kiemMotO(tt, coTheMo, coTheXoa);
					so += 1;
				}
			}
		}
		if (so !== 12) throw new Error(`ttp o tep: thieu o ${so}`);
	});

	test("ttp-o-tep: màn không tự tính quyền", () => {
		const goc = path.join(import.meta.dir, "..", "components", "crm", "fields");
		for (const tep of ["o-tep.tsx", "kieu-truong.tsx"]) {
			const chu = readFileSync(path.join(goc, tep), "utf8");
			const src = ts.createSourceFile(
				tep,
				chu,
				ts.ScriptTarget.Latest,
				true,
				ts.ScriptKind.TSX,
			);
			const tham = (n: ts.Node) => {
				const la =
					(ts.isStringLiteral(n) && ["admin", "owner"].includes(n.text)) ||
					(ts.isIdentifier(n) && n.text === "isWorkspaceAdmin");
				if (la) {
					const { line } = src.getLineAndCharacterOfPosition(n.getStart());
					throw new Error(`ttp o tep: quyen tu tinh ${tep}:${line + 1}`);
				}
				ts.forEachChild(n, tham);
			};
			tham(src);
		}
	});
});

function truongMau(type: FieldTypeName, i: number) {
	return {
		id: `f-${i}`,
		entity: "DEAL",
		key: type === "FILE" ? "ttp_loc" : `ttp_${type.toLowerCase()}`,
		label: type === "FILE" ? "Hợp đồng" : `Ttp ${type}`,
		type,
		agentFilled: false,
		agentBrief: null,
		required: false,
		showOnSheet: true,
		showOnTable: true,
		showOnFilter: true,
		position: i,
		archived: false,
		options: type === "SELECT" ? [{ id: "o-a", label: "A", position: 0 }] : [],
	};
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

describe("ttp-man-loc", () => {
	test("ttp-man-loc: menu Có tệp / Chưa có tệp, ghi field:<khoá>=none, vòng lưu", async () => {
		const truong = JSON.parse(
			JSON.stringify(fieldListOutput.parse(FIELD_TYPES.map(truongMau))),
		) as Array<ReturnType<typeof truongMau>>;
		duLieu.set("fields.filters", () => truong);
		duLieu.set("fields.list", () => []);
		duLieu.set("users.list", () => []);
		duLieu.set("savedViews.list", () => []);
		duLieu.set("companies.options", () => []);
		duLieu.set("giaiDoan.list", () => ({
			stages: [],
			canManage: false,
			tran: 0,
		}));
		duLieu.set("deals.list", () => ({ rows: [], total: 0, facetCounts: {} }));

		duLieu.set("deals.list", () => ({
			rows: [],
			total: 0,
			facetCounts: {
				"field:ttp_loc": { some: 2, none: 3 },
				"field:ttp_select": { "o-a": 1 },
			},
		}));
		const o = await mo(<DealsTable />);
		await cho(() => goi.some((g) => g.ten === "fields.filters"), "tai bo loc");
		await nhip(3);
		const nutLoc = [
			...o.querySelectorAll<HTMLElement>('button[aria-haspopup="menu"]'),
		].find((b) => b.textContent?.includes(uiMessages("vi").table.filters));
		if (!nutLoc) throw new Error("ttp man loc: khong co nut loc");
		await bamCon(nutLoc);
		await nhip(2);
		const trig = [
			...document.querySelectorAll<HTMLElement>(
				'[data-slot="dropdown-menu-sub-trigger"]',
			),
		].find((x) => x.textContent?.includes("Hợp đồng"));
		if (!trig) throw new Error(`ttp man loc: thieu ${m.tepTruong.loc.coTep}`);
		await act(async () => trig.click());
		await nhip(3);
		const noi = document.querySelector<HTMLElement>(
			'[data-slot="dropdown-menu-sub-content"]',
		);
		const mucTep = [
			...(noi?.querySelectorAll<HTMLElement>('[role="menuitemcheckbox"]') ??
				[]),
		];
		for (const [nhan, dem] of [
			[m.tepTruong.loc.coTep, "2"],
			[m.tepTruong.loc.chuaCoTep, "3"],
		] as const) {
			const muc = mucTep.find((x) => x.textContent?.includes(nhan));
			if (
				!muc ||
				muc.querySelector('[data-slot="facet-count"]')?.textContent !== dem
			) {
				throw new Error(`ttp man loc: thieu ${nhan}`);
			}
		}
		const chuaCo = mucTep.find((x) =>
			x.textContent?.includes(m.tepTruong.loc.chuaCoTep),
		);
		if (chuaCo) await act(async () => chuaCo.click());
		await nhip(3);
		const qsMenu = urls.at(-1)?.queryString ?? "";
		if (!new URLSearchParams(qsMenu).getAll("field:ttp_loc").includes("none")) {
			throw new Error(`ttp man loc: url ${qsMenu}`);
		}
		const tai = () =>
			goi
				.filter((g) => g.ten === "deals.list")
				.map(
					(g) =>
						(g.vao as { fields?: Record<string, string[]> } | undefined)
							?.fields,
				);
		await cho(
			() => tai().some((f) => f?.ttp_loc !== undefined),
			"tai deals.list",
		).catch(() => {});
		const vaoMenu =
			tai().findLast((f) => f?.ttp_loc !== undefined) ?? tai().at(-1);
		if (JSON.stringify(vaoMenu?.ttp_loc) !== JSON.stringify(["none"])) {
			throw new Error(`ttp man loc: tai ${JSON.stringify(vaoMenu)}`);
		}
		await donRoot();

		await mo(<Moc truong={truong.map(({ key, type }) => ({ key, type }))} />);
		await nhip(3);
		await act(async () => {
			hienTai?.query.setFilter("field:ttp_loc", ["none"]);
			hienTai?.query.setFilter("field:ttp_select", ["o-a"]);
		});
		await nhip(2);
		const qs = urls.at(-1)?.queryString ?? "";
		if (!new URLSearchParams(qs).getAll("field:ttp_loc").includes("none")) {
			throw new Error(`ttp man loc: url ${qs}`);
		}
		if (new URLSearchParams(qs).get("field:ttp_select") !== "o-a") {
			throw new Error("ttp man loc: doi chung");
		}
		const view = hienTai?.currentView;
		await donRoot();
		await mo(<Moc truong={truong.map(({ key, type }) => ({ key, type }))} />);
		await nhip(3);
		await act(async () => {
			if (view) hienTai?.applyView(view);
		});
		await nhip(2);
		if (JSON.stringify(hienTai?.currentView) !== JSON.stringify(view)) {
			throw new Error("ttp man loc: vong luu");
		}
		await donRoot();

		expect(true).toBe(true);
	});
});
