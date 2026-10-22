import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import {
	act,
	createElement as h,
	type ReactElement,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import { fieldListOutput } from "../../api/src/fields/fields.contracts";

type CheDo = "tra" | "treo" | "loi";

type TruongGia = {
	id: string;
	key: string;
	label: string;
	type?: string;
	required?: boolean;
	showOnSheet?: boolean;
	archived?: boolean;
};

type BienGhi = {
	entity?: string;
	key?: string;
	hidden?: boolean;
	id?: string;
	ids?: string[];
	items?: ({ standard: string } | { custom: string })[];
	required?: boolean;
	label?: string;
	data?: { required?: boolean; showOnSheet?: boolean };
};

type TuyChonGhi = {
	onError?: () => void;
	onSuccess?: () => void;
	onSettled?: () => Promise<void> | void;
};

const kho = {
	cheDoBoTri: "tra" as CheDo,
	boTri: [] as unknown[],
	truong: [] as TruongGia[],
	quyen: true,
	daGoi: [] as { ten: string; bien: BienGhi }[],
	loiGhi: new Map<string, string>(),
};

const toastLoi: string[] = [];
const toastDung: string[] = [];
const sonnerThat = await import("sonner");
const toastGia = Object.assign(
	(thongDiep: string) => {
		toastDung.push(thongDiep);
		return "ok";
	},
	sonnerThat.toast,
	{
		success: (thongDiep: string) => {
			toastDung.push(thongDiep);
			return "ok";
		},
		error: (thongDiep: string) => {
			toastLoi.push(thongDiep);
			return "loi";
		},
	},
);
mock.module("sonner", () => ({ ...sonnerThat, toast: toastGia }));

const eveThat = await import("eve/react");
mock.module("eve/react", () => ({
	...eveThat,
	useEveAgent: () => ({
		status: "ready",
		error: undefined,
		data: { messages: [] },
		session: null,
		send: async () => {},
	}),
}));

const phienThat = await import("@/lib/agent-session");
mock.module("@/lib/agent-session", () => ({
	...phienThat,
	loadThread: () => new Promise(() => {}),
}));

globalThis.FormData = window.FormData;

function quaJson<T>(giaTri: T): unknown {
	return JSON.parse(JSON.stringify(giaTri));
}

function dsTruong(entity: string) {
	return quaJson(
		fieldListOutput.parse(
			kho.truong.map((t, viTri) => ({
				id: t.id,
				entity,
				key: t.key,
				label: t.label,
				type: t.type ?? "TEXT",
				agentFilled: false,
				agentBrief: null,
				required: t.required ?? false,
				showOnSheet: t.showOnSheet ?? true,
				showOnTable: false,
				showOnFilter: false,
				position: viTri,
				archived: t.archived ?? false,
				options: [],
			})),
		),
	);
}

class LoiGia extends Error {}

function thuTuc<TVao>(ten: string, doc: (dauVao: TVao) => unknown) {
	return {
		queryKey: (dauVao?: TVao) => (dauVao === undefined ? [ten] : [ten, dauVao]),
		pathKey: () => [ten],
		infiniteQueryOptions: (dauVao: TVao) => ({
			queryKey: [ten, dauVao ?? null, "vo-han"],
			queryFn: async () => doc(dauVao),
			initialPageParam: null,
			getNextPageParam: () => undefined,
		}),
		queryOptions: (dauVao: TVao) => ({
			queryKey: dauVao === undefined ? [ten] : [ten, dauVao],
			queryFn: async () => doc(dauVao),
			retry: false,
		}),
		mutationOptions: (tuyChon: TuyChonGhi = {}) => ({
			...tuyChon,
			mutationKey: [ten],
			mutationFn: async (bien: BienGhi) => {
				kho.daGoi.push({ ten, bien });
				const loi = kho.loiGhi.get(ten);
				if (loi) throw new LoiGia(loi);
				if (ten === "fields.setStandardHidden") return kho.boTri;
				return doc(bien as TVao) ?? { id: "ok" };
			},
		}),
	};
}

const duLieu = new Map<string, (vao: BienGhi) => unknown>();

function datGia(duong: string, lay: (vao: BienGhi) => unknown) {
	duLieu.set(duong, lay);
}

const MAC_DINH = new Map<string, (vao: BienGhi) => unknown>([
	["fields.access", () => ({ canManage: kho.quyen })],
	["fields.list", (vao) => dsTruong(vao.entity ?? "DEAL")],
	[
		"fields.layout",
		() => {
			if (kho.cheDoBoTri === "treo") return new Promise(() => {});
			if (kho.cheDoBoTri === "loi") throw new LoiGia("layout failed");
			return kho.boTri;
		},
	],
	["fields.coverage", () => ({ filled: 0, total: 0 })],
	["users.list", () => []],
]);

function docGia(duong: string, vao: BienGhi): unknown {
	const lay = duLieu.get(duong) ?? MAC_DINH.get(duong);
	return lay ? lay(vao) : null;
}

const trpcGia = new Proxy(
	{},
	{
		get: (_goc, khong: string) =>
			new Proxy(
				{},
				{
					get: (_g, ten: string) =>
						thuTuc(`${khong}.${ten}`, (vao: BienGhi) =>
							docGia(`${khong}.${ten}`, vao),
						),
				},
			),
	},
);

mock.module("@/lib/trpc/client", () => ({ useTRPC: () => trpcGia }));
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({ fields: async () => {} }),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/settings/fields",
	useSearchParams: () => new URLSearchParams(),
}));
mock.module("next/link", () => ({
	default: ({ href, children }: { href: string; children: ReactNode }) =>
		h("a", { href }, children),
}));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { STANDARD_FIELD_KEYS } = await import("@crm/db/fields-chuan");
const { useBoTriTruong } = await import(
	"@/components/crm/fields/use-bo-tri-truong"
);
const { nhanTruongChuan } = await import(
	"@/components/crm/fields/truong-chuan"
);
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { sapBoTri } = await import("@crm/db/fields-chuan");
const { parseBoTriTruong } = await import("@crm/validation/bo-tri-truong");
const { FieldsSettings } = await import(
	"@/app/(app)/[slug]/settings/fields/fields-settings"
);
const { FieldEditor } = await import("@/components/crm/fields/field-editor");
const { crmMessages } = await import("@/lib/messages/crm");
const { messages: uiMessages } = await import("@crm/ui/lib/messages");

const goc = {
	root: null as Root | null,
	el: null as HTMLElement | null,
};

async function ve(phan: ReactElement, locale: "vi" | "en" = "vi") {
	const el = document.createElement("div");
	document.body.appendChild(el);
	const qc = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	const root = createRoot(el);
	await act(async () => {
		root.render(
			<QueryClientProvider client={qc}>
				<LocaleProvider locale={locale}>
					<NuqsTestingAdapter searchParams="" hasMemory>
						<TooltipProvider>{phan}</TooltipProvider>
					</NuqsTestingAdapter>
				</LocaleProvider>
			</QueryClientProvider>,
		);
	});
	goc.root = root;
	goc.el = el;
	return el;
}

async function cho(ms = 20) {
	await act(async () => {
		await new Promise((r) => setTimeout(r, ms));
	});
}

afterEach(async () => {
	await act(async () => {
		goc.root?.unmount();
	});
	goc.el?.remove();
	kho.cheDoBoTri = "tra";
	kho.boTri = [];
	kho.truong = [];
	kho.quyen = true;
	kho.daGoi = [];
	kho.loiGhi.clear();
	duLieu.clear();
	toastLoi.length = 0;
	toastDung.length = 0;
});

function InBoTri({ entity }: { entity: "DEAL" | "COMPANY" | "CONTACT" }) {
	const { muc } = useBoTriTruong(entity);
	return h("ol", null, ...muc.map((m) => h("li", { key: m.key }, m.key)));
}

const TIENG_ANH_CU = [
	"Name",
	"Amount",
	"Currency",
	"Close date",
	"Owner",
	"First name",
	"Last name",
	"Stage",
];

describe("tcc-moc-bo-tri", () => {
	test("bo tri treo hay loi thi ve thu tu mac dinh cua danh muc", async () => {
		for (const cheDo of ["treo", "loi"] as const) {
			for (const entity of ["DEAL", "COMPANY", "CONTACT"] as const) {
				kho.cheDoBoTri = cheDo;
				const el = await ve(h(InBoTri, { entity }));
				await cho();
				const khoa = [...el.querySelectorAll("li")].map((li) => li.textContent);
				if (
					JSON.stringify(khoa) !== JSON.stringify(STANDARD_FIELD_KEYS[entity])
				) {
					throw new Error(
						`tcc moc bo tri: ${cheDo} ${entity} ${JSON.stringify(khoa)}`,
					);
				}
				await act(async () => {
					goc.root?.unmount();
				});
				el.remove();
			}
		}
		expect(true).toBe(true);
	});

	test("nhan truong chuan theo locale, khong con tieng Anh o vi", () => {
		let so = 0;
		for (const entity of ["DEAL", "COMPANY", "CONTACT"] as const) {
			const vi = STANDARD_FIELD_KEYS[entity].map((k) =>
				nhanTruongChuan(entity, k, "vi"),
			);
			const en = STANDARD_FIELD_KEYS[entity].map((k) =>
				nhanTruongChuan(entity, k, "en"),
			);
			for (const [i, nhan] of vi.entries()) {
				if (!nhan || nhan === STANDARD_FIELD_KEYS[entity][i])
					throw new Error(`tcc moc bo tri: thieu nhan ${entity} ${i}`);
				if (TIENG_ANH_CU.includes(nhan))
					throw new Error(`tcc moc bo tri: con tieng anh ${nhan}`);
				so += 1;
			}
			if (new Set(vi).size !== vi.length || new Set(en).size !== en.length)
				throw new Error(`tcc moc bo tri: nhan trung ${entity}`);
		}
		if (so !== 24) throw new Error(`tcc moc bo tri: thieu ${so}`);
		expect(so).toBe(24);
	});
});

type Loai = "DEAL" | "COMPANY" | "CONTACT";
const KIND = { DEAL: "deal", COMPANY: "company", CONTACT: "contact" } as const;

function boTriGia(
	entity: Loai,
	{
		tuTao = [],
		an = [],
		thuTu,
	}: {
		tuTao?: { id: string; key: string }[];
		an?: string[];
		thuTu?: string[];
	} = {},
) {
	const goc = sapBoTri(
		entity,
		[],
		tuTao.map((t, position) => ({ ...t, position })),
	).map((m) =>
		m.kind === "standard" ? { ...m, hidden: an.includes(m.key) } : m,
	);
	const sap = thuTu
		? thuTu
				.map((k) => goc.find((m) => m.key === k))
				.filter((m) => m !== undefined)
		: goc;
	return quaJson(parseBoTriTruong(sap));
}

async function choDen(xong: () => boolean, moTa: string) {
	for (let vong = 0; vong < 150; vong += 1) {
		if (xong()) return;
		await cho(5);
	}
	throw new Error(
		`khong toi ${moTa} — ${document.body.textContent?.slice(0, 300)}`,
	);
}

function hangDanhSach(): HTMLElement[] {
	return [...document.body.querySelectorAll<HTMLElement>("[data-muc-keo]")];
}

function nhanHang(): string[] {
	return hangDanhSach().map(
		(x) => x.querySelector("span")?.textContent?.trim() ?? "",
	);
}

function congTac(nhan: string): HTMLButtonElement | undefined {
	return [
		...document.body.querySelectorAll<HTMLButtonElement>("[role=switch]"),
	].find((s) => s.getAttribute("aria-label")?.includes(nhan));
}

const mVi = crmMessages("vi");

async function moCaiDat(entity: Loai, locale: "vi" | "en" = "vi") {
	const el = await ve(h(FieldsSettings, { kindBanDau: KIND[entity] }), locale);
	await choDen(() => hangDanhSach().length > 0, "danh sach");
	if (kho.quyen)
		await choDen(
			() => !document.body.textContent?.includes(mVi.fields.canQuyen),
			"quyen quan tri",
		);
	await cho(20);
	return el;
}

const gocRect = Element.prototype.getBoundingClientRect;
function datViTri() {
	Element.prototype.getBoundingClientRect = function viTri(this: Element) {
		if (this.querySelector(":scope > [data-muc-keo]") === null) {
			return {
				x: 0,
				y: -10000,
				top: -10000,
				left: 0,
				bottom: 10000,
				right: 1000,
				width: 1000,
				height: 20000,
				toJSON: () => ({}),
			} as DOMRect;
		}
		const cha = this.parentElement;
		const i = cha ? [...cha.children].indexOf(this) : 0;
		const doi =
			this instanceof HTMLElement
				? Number(
						/translate3d\([^,]+,\s*(-?[\d.]+)px/.exec(
							this.style.transform,
						)?.[1] ?? 0,
					)
				: 0;
		const tren = i * 40 + doi;
		return {
			x: 0,
			y: tren,
			top: tren,
			left: 0,
			bottom: tren + 32,
			right: 300,
			width: 300,
			height: 32,
			toJSON: () => ({}),
		} as DOMRect;
	};
}

async function phim(o: Element, key: string) {
	await act(async () => {
		o.dispatchEvent(
			new KeyboardEvent("keydown", {
				key,
				code: key === " " ? "Space" : key,
				bubbles: true,
				cancelable: true,
			}),
		);
	});
	await cho(20);
}

async function keoLen(nhan: string, buoc: number) {
	const reo = uiMessages("vi").sortableList.reorder(nhan);
	const tay = [...document.body.querySelectorAll("button")].find(
		(b) => b.querySelector(".sr-only")?.textContent === reo,
	);
	if (!tay) throw new Error("tcc sap lai: doi chung thieu tay keo");
	tay.focus();
	await phim(tay, " ");
	for (let i = 0; i < buoc; i += 1) await phim(tay, "ArrowUp");
	await phim(tay, " ");
}

const TIENG_ANH_STD = ["Close date", "Owner", "First name", "Stage"];

describe("tcc-danh-muc", () => {
	test("Cai dat liet dung truong chuan cua muc Chi tiet, theo locale", async () => {
		let cap = 0;
		for (const locale of ["vi", "en"] as const) {
			for (const entity of ["DEAL", "COMPANY", "CONTACT"] as const) {
				kho.boTri = boTriGia(entity) as unknown[];
				await moCaiDat(entity, locale);
				const nhan = nhanHang();
				const mong = STANDARD_FIELD_KEYS[entity].map((k) =>
					nhanTruongChuan(entity, k, locale),
				);
				if (nhan.length !== mong.length)
					throw new Error(`tcc danh muc: so hang ${entity} ${nhan.length}`);
				if (JSON.stringify(nhan) !== JSON.stringify(mong))
					throw new Error(
						`tcc danh muc: lech ${locale} ${entity} cai-dat=${JSON.stringify(nhan)} phieu=${JSON.stringify(mong)}`,
					);
				if (locale === "vi") {
					for (const x of nhan)
						if (TIENG_ANH_STD.includes(x))
							throw new Error(`tcc danh muc: con tieng anh ${x}`);
				}
				for (const thua of ["Mô tả", "Giai đoạn", "Description", "Stage"])
					if (nhan.includes(thua))
						throw new Error(`tcc danh muc: thua ${thua}`);
				cap += 1;
				await act(async () => goc.root?.unmount());
				goc.el?.remove();
			}
		}
		if (cap !== 6) throw new Error(`tcc danh muc: thieu cap ${cap}`);
		expect(cap).toBe(6);
	});
});

describe("tcc-sap-lai", () => {
	test("keo bang ban phim gui danh sach tron; loi thi ve thu tu cu", async () => {
		datViTri();
		try {
			const tuTao = [{ id: "f-hang", key: "hang_doi_tac" }];
			kho.truong = [
				{ id: "f-hang", key: "hang_doi_tac", label: "Hạng đối tác" },
			];
			kho.boTri = boTriGia("DEAL", { tuTao }) as unknown[];
			await moCaiDat("DEAL");
			const truocKeo = nhanHang();
			await keoLen("Hạng đối tác", 3);
			await choDen(
				() => kho.daGoi.some((g) => g.ten === "fields.reorder"),
				"goi reorder",
			);
			const goi = kho.daGoi.filter((g) => g.ten === "fields.reorder");
			const mong = {
				entity: "DEAL",
				items: [
					{ standard: "name" },
					{ standard: "amount" },
					{ standard: "currency" },
					{ custom: "f-hang" },
					{ standard: "expectedCloseDate" },
					{ standard: "company" },
					{ standard: "owner" },
				],
			};
			if (goi.length !== 1) throw new Error("tcc sap lai: khong luu");
			if (JSON.stringify(goi[0]?.bien) !== JSON.stringify(mong))
				throw new Error(`tcc sap lai: gui ${JSON.stringify(goi[0]?.bien)}`);
			const sauKeo = nhanHang();
			if (sauKeo[3] !== "Hạng đối tác")
				throw new Error(`tcc sap lai: dom ${JSON.stringify(sauKeo)}`);

			await act(async () => goc.root?.unmount());
			goc.el?.remove();
			kho.daGoi = [];
			kho.loiGhi.set(
				"fields.reorder",
				"That order names a field which is not on this record type.",
			);
			await moCaiDat("DEAL");
			await keoLen("Hạng đối tác", 3);
			await choDen(() => toastLoi.length > 0, "bao loi");
			await cho(30);
			if (JSON.stringify(nhanHang()) !== JSON.stringify(truocKeo))
				throw new Error(
					`tcc sap lai: loi khong ve ${JSON.stringify(nhanHang())}`,
				);
			if (toastLoi.length !== 1 || toastLoi[0] !== mVi.fields.orderFailed)
				throw new Error("tcc sap lai: khong bao loi");
			if (toastLoi.some((t) => t.includes("That order")))
				throw new Error("tcc sap lai: in cau may chu");
			expect(goi.length).toBe(1);
		} finally {
			Element.prototype.getBoundingClientRect = gocRect;
		}
	});
});

describe("tcc-an", () => {
	test("tat Hien tren ho so cua Thanh pho; loi thi ve gia tri cu", async () => {
		kho.boTri = boTriGia("COMPANY") as unknown[];
		await moCaiDat("COMPANY");
		const nhan = nhanTruongChuan("COMPANY", "city", "vi");
		const ct = congTac(nhan);
		if (!ct) throw new Error("tcc an: thieu cong tac");
		await act(async () => ct.click());
		await choDen(() => kho.daGoi.length > 0, "goi an");
		const goi = kho.daGoi.filter((g) => g.ten === "fields.setStandardHidden");
		if (
			goi.length !== 1 ||
			JSON.stringify(goi[0]?.bien) !==
				JSON.stringify({ entity: "COMPANY", key: "city", hidden: true })
		)
			throw new Error(`tcc an: gui ${JSON.stringify(kho.daGoi)}`);
		await choDen(() => toastDung.length > 0, "bao xong");

		await act(async () => goc.root?.unmount());
		goc.el?.remove();
		kho.daGoi = [];
		kho.loiGhi.set("fields.setStandardHidden", "Hidden failed.");
		await moCaiDat("COMPANY");
		const ct2 = congTac(nhan);
		if (!ct2) throw new Error("tcc an: thieu cong tac");
		await act(async () => ct2.click());
		await choDen(() => toastLoi.length > 0, "bao loi");
		await cho(30);
		if (congTac(nhan)?.getAttribute("aria-checked") !== "true")
			throw new Error("tcc an: khong ve gia tri cu");
		if (toastLoi[0] !== mVi.truongKieu.chuaLuu(nhan))
			throw new Error("tcc an: khong bao loi");
		if (toastLoi.some((t) => t.includes("Hidden failed")))
			throw new Error("tcc an: in cau may chu");
		expect(toastLoi.length).toBe(1);
	});
});

const CAP_BAT_BUOC: [Loai, string][] = [
	["DEAL", "name"],
	["DEAL", "currency"],
	["DEAL", "company"],
	["DEAL", "owner"],
	["COMPANY", "name"],
	["CONTACT", "firstName"],
];

describe("tcc-chuan-bat-buoc", () => {
	test("hang chuan bat buoc co cong tac bat va khoa, noi vi sao", async () => {
		let so = 0;
		for (const entity of ["DEAL", "COMPANY", "CONTACT"] as const) {
			kho.boTri = boTriGia(entity) as unknown[];
			await moCaiDat(entity);
			const batBuoc = new Set(
				CAP_BAT_BUOC.filter(([e]) => e === entity).map(([, k]) => k),
			);
			for (const key of STANDARD_FIELD_KEYS[entity]) {
				const nhan = nhanTruongChuan(entity, key, "vi");
				const ct = congTac(nhan);
				if (!ct) throw new Error(`tcc chuan bat buoc: thieu ${entity} ${key}`);
				if (!batBuoc.has(key)) {
					if (ct.disabled)
						throw new Error(`tcc chuan bat buoc: khoa thua ${entity} ${key}`);
					continue;
				}
				if (ct.getAttribute("aria-checked") !== "true" || !ct.disabled)
					throw new Error(`tcc chuan bat buoc: ${entity} ${key} khong khoa`);
				const moTa = ct.getAttribute("aria-describedby");
				const lyDo = moTa ? document.getElementById(moTa)?.textContent : "";
				if (lyDo !== mVi.fields.requiredLocked)
					throw new Error(`tcc chuan bat buoc: ${entity} ${key} thieu ly do`);
				const hang =
					ct.closest("[data-muc-keo]")?.parentElement ?? ct.parentElement;
				if (!hang?.textContent?.includes(mVi.fields.required))
					throw new Error(`tcc chuan bat buoc: ${entity} ${key} thieu nhan`);
				so += 1;
			}
			await act(async () => goc.root?.unmount());
			goc.el?.remove();
		}
		if (so !== 6) throw new Error(`tcc chuan bat buoc: thieu ${so}`);
		expect(so).toBe(6);
	});
});

async function moSua(field?: TruongGia) {
	kho.truong = field ? [field] : [];
	const list = field ? (dsTruong("DEAL") as { id: string }[]) : [];
	await ve(
		h(FieldEditor, {
			entity: "DEAL",
			field: list[0] as never,
			onDone: () => {},
			onArchive: () => {},
		}),
	);
	await cho(20);
}

function oNhap(nhan: string): HTMLElement | undefined {
	const label = [...document.body.querySelectorAll("label")].find(
		(l) => l.textContent?.trim() === nhan,
	);
	const id = label?.getAttribute("for");
	return id ? (document.getElementById(id) ?? undefined) : undefined;
}

async function bamLuu() {
	const nut = [...document.body.querySelectorAll("button")].find(
		(b) =>
			b.textContent?.trim() === mVi.fields.saveChanges ||
			b.textContent?.trim() === mVi.fields.addField,
	);
	if (!nut) throw new Error("khong thay nut Luu");
	await act(async () => nut.click());
	await cho(20);
}

describe("tcc-bat-buoc-luu", () => {
	test("cong tac Bat buoc gui required o ca tao lan sua", async () => {
		await moSua();
		const nhanO = oNhap(mVi.fields.labelLabel) as HTMLInputElement | undefined;
		if (!nhanO) throw new Error("khong thay o Nhan");
		await act(async () => {
			const dat = Object.getOwnPropertyDescriptor(
				HTMLInputElement.prototype,
				"value",
			)?.set;
			dat?.call(nhanO, "Mã hồ sơ");
			nhanO.dispatchEvent(new Event("input", { bubbles: true }));
		});
		const bb = oNhap(mVi.fields.requiredLabel);
		if (!bb) throw new Error("tcc bat buoc: khong thay cong tac");
		await act(async () => bb.click());
		await bamLuu();
		const tao = kho.daGoi.find((g) => g.ten === "fields.create")?.bien as
			| { required?: boolean }
			| undefined;
		if (tao?.required !== true)
			throw new Error(`tcc bat buoc: tao gui ${JSON.stringify(tao)}`);

		await act(async () => goc.root?.unmount());
		goc.el?.remove();
		kho.daGoi = [];
		await moSua({ id: "f-ma", key: "ma_ho_so", label: "Mã hồ sơ" });
		await act(async () => oNhap(mVi.fields.requiredLabel)?.click());
		await bamLuu();
		const sua = kho.daGoi.find((g) => g.ten === "fields.update")?.bien as
			| { data?: { required?: boolean } }
			| undefined;
		if (sua?.data?.required !== true)
			throw new Error(`tcc bat buoc: sua gui ${JSON.stringify(sua)}`);

		await act(async () => goc.root?.unmount());
		goc.el?.remove();
		kho.daGoi = [];
		await moSua({
			id: "f-ma",
			key: "ma_ho_so",
			label: "Mã hồ sơ",
			required: true,
		});
		await act(async () => oNhap(mVi.fields.requiredLabel)?.click());
		await bamLuu();
		const tat = kho.daGoi.find((g) => g.ten === "fields.update")?.bien as
			| { data?: { required?: boolean } }
			| undefined;
		if (tat?.data?.required !== false)
			throw new Error(`tcc bat buoc: tat gui ${JSON.stringify(tat)}`);
		expect(tat?.data?.required).toBe(false);
	});
});

describe("tcc-bat-buoc-hien", () => {
	test("bat buoc thi Hien tren ho so bat va khoa", async () => {
		await moSua({
			id: "f-an",
			key: "an_di",
			label: "Ẩn đi",
			showOnSheet: false,
		});
		await act(async () => oNhap(mVi.fields.requiredLabel)?.click());
		await cho(10);
		const hien = [...document.body.querySelectorAll("label")]
			.find((l) => l.textContent?.includes(mVi.fields.showDeal))
			?.querySelector("[role=checkbox]");
		if (
			hien?.getAttribute("aria-checked") !== "true" ||
			!(hien as HTMLButtonElement).disabled
		)
			throw new Error("tcc bat buoc hien: o sua khong khoa");
		await bamLuu();
		const sua = kho.daGoi.find((g) => g.ten === "fields.update")?.bien as
			| { data?: { required?: boolean; showOnSheet?: boolean } }
			| undefined;
		if (sua?.data?.required !== true || sua?.data?.showOnSheet !== true)
			throw new Error(`tcc bat buoc hien: gui ${JSON.stringify(sua?.data)}`);

		await act(async () => goc.root?.unmount());
		goc.el?.remove();
		const tuTao = [
			{ id: "f-bb", key: "bat_buoc" },
			{ id: "f-tu", key: "tu_do" },
		];
		kho.truong = [
			{ id: "f-bb", key: "bat_buoc", label: "Bắt buộc tmc", required: true },
			{ id: "f-tu", key: "tu_do", label: "Tự do tmc" },
		];
		kho.boTri = boTriGia("DEAL", { tuTao }) as unknown[];
		await moCaiDat("DEAL");
		const ctBb = congTac("Bắt buộc tmc");
		if (ctBb?.getAttribute("aria-checked") !== "true" || !ctBb.disabled)
			throw new Error("tcc bat buoc hien: danh sach khong khoa");
		const ctTu = congTac("Tự do tmc");
		if (!ctTu || ctTu.disabled) throw new Error("tcc bat buoc hien: doi chung");
		expect(ctBb.disabled).toBe(true);
	});
});

describe("tcc-khong-quyen", () => {
	test("nguoi khong quan tri: moi dieu khien khoa, co dong ly do", async () => {
		const tuTao = [{ id: "f-1", key: "nguon" }];
		kho.truong = [{ id: "f-1", key: "nguon", label: "Nguồn" }];
		kho.boTri = boTriGia("DEAL", { tuTao }) as unknown[];
		kho.quyen = false;
		await moCaiDat("DEAL");
		await cho(30);
		const hang = hangDanhSach();
		const tay = [...document.body.querySelectorAll("button")].filter((b) =>
			b.querySelector(".sr-only")?.textContent?.startsWith("Đổi thứ tự"),
		);
		if (tay.length !== hang.length)
			throw new Error(`tcc khong quyen: thieu tay keo ${tay.length}`);
		for (const b of tay)
			if (!b.disabled) throw new Error("tcc khong quyen: mo tay keo");
		for (const s of document.body.querySelectorAll<HTMLButtonElement>(
			"[role=switch]",
		))
			if (!s.disabled)
				throw new Error(
					`tcc khong quyen: mo cong tac ${s.getAttribute("aria-label")}`,
				);
		if (!document.body.textContent?.includes(mVi.fields.canQuyen))
			throw new Error("tcc khong quyen: thieu ly do");

		await act(async () => goc.root?.unmount());
		goc.el?.remove();
		kho.quyen = true;
		await moCaiDat("DEAL");
		await cho(30);
		const mo = [
			...document.body.querySelectorAll<HTMLButtonElement>("[role=switch]"),
		].some((s) => !s.disabled);
		if (!mo) throw new Error("tcc khong quyen: doi chung");
		expect(mo).toBe(true);
	});
});

const { dealDetailOutput } = await import(
	"../../api/src/deals/deals.contracts"
);
const { companyDetailOutput } = await import(
	"../../api/src/companies/companies.contracts"
);
const { contactByIdOutput } = await import(
	"../../api/src/contacts/contacts.contracts"
);
const { DetailSheet } = await import("@/components/detail-sheet");
const { DealSheet } = await import("@/components/crm/record-sheet/deal-sheet");
const { CompanySheet } = await import(
	"@/components/crm/record-sheet/company-sheet"
);
const { ContactSheet } = await import(
	"@/components/crm/record-sheet/contact-sheet"
);
const { recordSheetMessages } = await import("@/lib/messages/record-sheet");

const NGUOI_PHIEU = [
	{ id: "u-an", name: "An Trần", email: "an@onehub.vn", image: null },
];
const CHU = NGUOI_PHIEU[0];

type TruongPhieu = {
	key: string;
	label: string;
	value: string | number | boolean | null;
	required?: boolean;
	showOnSheet?: boolean;
};

function truongPhieu(entity: Loai, t: TruongPhieu) {
	return {
		id: `f-${t.key}`,
		entity,
		key: t.key,
		label: t.label,
		type: "TEXT",
		agentFilled: false,
		agentBrief: null,
		required: t.required ?? false,
		showOnSheet: t.showOnSheet ?? true,
		showOnTable: true,
		showOnFilter: false,
		position: 0,
		archived: false,
		options: [],
		value: t.value,
	};
}

function thoaThuanGia(fields: TruongPhieu[], currency = "VND") {
	return quaJson(
		dealDetailOutput.parse({
			id: "d-1",
			name: "Thoả thuận tcc",
			description: "Mô tả tcc",
			stage: "lead",
			currency,
			closedReason: null,
			company: {
				id: "co-1",
				name: "Công ty tcc",
				domain: "tcc.vn",
				iconUrl: null,
				iconDarkUrl: null,
				iconTone: null,
				logoUrl: null,
				industry: null,
			},
			owner: CHU,
			fields: fields.map((t) => truongPhieu("DEAL", t)),
			amountCents: 123450,
			baseAmountCents: 3000000000,
			reportingCurrency: "VND",
			fxRate: null,
			fxRateAt: null,
			stageChangedAt: "2026-10-01T00:00:00.000Z",
			expectedCloseDate: "2026-10-22T00:00:00.000Z",
			closedAt: null,
			createdAt: "2026-10-01T00:00:00.000Z",
			archivedAt: null,
			contacts: [],
			archivedContacts: [],
		}),
	);
}

function congTyGia(fields: TruongPhieu[] = []) {
	return quaJson(
		companyDetailOutput.parse({
			id: "co-1",
			name: "Công ty tcc",
			domain: "tcc.vn",
			website: "tcc.vn",
			description: null,
			logoUrl: null,
			logoDarkUrl: null,
			iconUrl: null,
			iconDarkUrl: null,
			iconTone: null,
			brandColor: null,
			industry: null,
			subIndustry: null,
			city: "Đà Nẵng",
			stateCode: null,
			country: null,
			countryCode: null,
			phone: "0901 234 567",
			email: "lienhe@tcc.vn",
			linkedinUrl: null,
			twitterUrl: null,
			githubUrl: null,
			pricingUrl: null,
			careersUrl: null,
			enrichmentStatus: "COMPLETE",
			enrichmentError: null,
			source: "MANUAL",
			owner: CHU,
			contacts: [],
			fields: fields.map((t) => truongPhieu("COMPANY", t)),
			queued: false,
			createdAt: "2026-09-01T00:00:00.000Z",
			archivedAt: null,
			enrichedAt: null,
			primaryContactId: null,
			primaryContact: null,
			reportingCurrency: "VND",
			soKeHoach: 0,
			xuongCoKhuon: false,
			deals: [],
			archivedContacts: [],
			archivedDeals: [],
		}),
	);
}

function lienHeGia() {
	return quaJson(
		contactByIdOutput.parse({
			id: "ct-1",
			firstName: "Lan",
			lastName: "Phạm",
			email: "lan@tcc.vn",
			phone: "0901 234 567",
			title: "Giám đốc",
			linkedinUrl: "linkedin.com/in/lan",
			twitterUrl: null,
			githubUrl: null,
			imageUrl: null,
			enrichmentStatus: "COMPLETE",
			enrichmentError: null,
			owner: CHU,
			company: null,
			fields: [],
			queued: false,
			createdAt: "2026-09-01T00:00:00.000Z",
			archivedAt: null,
			brief: null,
			facts: [],
			relationship: {
				emails: 0,
				threads: 0,
				lastReplyAt: null,
				meetings: 0,
				nextMeeting: null,
				colleagues: [],
			},
			isPrimaryContact: false,
			deals: [],
			archivedDeals: [],
		}),
	);
}

function datNenPhieu() {
	datGia("users.list", () => NGUOI_PHIEU);
	datGia("onboarding.listTemplates", () => []);
	datGia("onboarding.listSteps", () => ({ steps: [], phases: [] }));
	datGia("onboarding.listEnrollments", () => []);
	datGia("onboarding.listDepartments", () => []);
	datGia("onboarding.access", () => ({ canManage: true }));
	datGia("onboarding.plansOfCompany", () => []);
	datGia("conversations.list", () => []);
	datGia("conversations.events", () => []);
}

const LOAI_PHIEU = {
	DEAL: "deal",
	COMPANY: "company",
	CONTACT: "contact",
} as const;
const ID_PHIEU = { DEAL: "d-1", COMPANY: "co-1", CONTACT: "ct-1" } as const;

async function moPhieu(entity: Loai, locale: "vi" | "en" = "vi") {
	datNenPhieu();
	const ngan =
		entity === "DEAL" ? (
			<DealSheet dealId="d-1" />
		) : entity === "COMPANY" ? (
			<CompanySheet companyId="co-1" />
		) : (
			<ContactSheet contactId="ct-1" />
		);
	const el = document.createElement("div");
	document.body.appendChild(el);
	const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	const root = createRoot(el);
	await act(async () => {
		root.render(
			<NuqsTestingAdapter
				searchParams={`record=${LOAI_PHIEU[entity]}:${ID_PHIEU[entity]}`}
				hasMemory
			>
				<QueryClientProvider client={qc}>
					<LocaleProvider locale={locale}>
						<TooltipProvider>
							<DetailSheet open onOpenChange={() => {}}>
								{ngan}
							</DetailSheet>
						</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	goc.root = root;
	goc.el = el;
	await choDen(
		() => document.querySelectorAll("label").length > 3,
		`phieu ${entity}`,
	);
	await cho(30);
}

async function dongPhieu() {
	await act(async () => goc.root?.unmount());
	goc.el?.remove();
	document.body.innerHTML = "";
}

function nhanChiTiet(entity: Loai, locale: "vi" | "en" = "vi"): string[] {
	const r = recordSheetMessages(locale);
	const tieuDe =
		entity === "DEAL"
			? r.deal.details
			: entity === "COMPANY"
				? r.company.details
				: r.contact.details;
	const muc = [...document.body.querySelectorAll("section, [data-slot]")].find(
		(x) =>
			[...x.querySelectorAll("h2, h3, h4, [data-slot=card-title]")].some(
				(h) => h.textContent?.trim() === tieuDe,
			) && x.querySelectorAll("label").length > 0,
	);
	const goc_ = muc ?? document.body;
	return [...goc_.querySelectorAll("label")]
		.filter((l) => l.parentElement?.firstElementChild === l)
		.map((l) => l.textContent?.trim() ?? "");
}

function hangPhieu(nhan: string): HTMLElement | null {
	const l = [...document.body.querySelectorAll("label")].find(
		(x) => x.textContent?.trim() === nhan,
	);
	return (l?.parentElement as HTMLElement | null) ?? null;
}

const rVi = recordSheetMessages("vi");

describe("tcc-danh-muc", () => {
	test("nhan muc Chi tiet ba phieu khop nhan o Cai dat, hai locale", async () => {
		let cap = 0;
		for (const locale of ["vi", "en"] as const) {
			for (const entity of ["DEAL", "COMPANY", "CONTACT"] as const) {
				kho.boTri = boTriGia(entity) as unknown[];
				datGia("deals.byId", () => thoaThuanGia([]));
				datGia("companies.byId", () => congTyGia());
				datGia("contacts.byId", () => lienHeGia());
				await moPhieu(entity, locale);
				const phieu = nhanChiTiet(entity, locale);
				const caiDat = STANDARD_FIELD_KEYS[entity].map((k) =>
					nhanTruongChuan(entity, k, locale),
				);
				if (JSON.stringify(phieu) !== JSON.stringify(caiDat))
					throw new Error(
						`tcc danh muc: lech ${locale} ${entity} cai-dat=${JSON.stringify(caiDat)} phieu=${JSON.stringify(phieu)}`,
					);
				const banChep = phieu.slice(0, -1);
				if (JSON.stringify(banChep) === JSON.stringify(caiDat))
					throw new Error("tcc danh muc: thuoc mu");
				cap += 1;
				await dongPhieu();
			}
		}
		if (cap !== 6) throw new Error(`tcc danh muc: thieu cap ${cap}`);
		expect(cap).toBe(6);
	});
});

describe("tcc-phieu-thu-tu", () => {
	test("phieu Thoa thuan ve muc Chi tiet theo bo tri", async () => {
		const tuTao = [{ id: "f-hang_doi_tac", key: "hang_doi_tac" }];
		datGia("deals.byId", () =>
			thoaThuanGia([
				{ key: "hang_doi_tac", label: "Hạng đối tác", value: "Vàng" },
			]),
		);
		const r = rVi;
		const mong = [
			r.deal.fields.name,
			r.deal.fields.amount,
			r.deal.fields.currency,
			"Hạng đối tác",
			r.deal.fields.closeDate,
			crmMessages("vi").standard.company,
			r.deal.fields.owner,
		];
		kho.boTri = boTriGia("DEAL", {
			tuTao,
			thuTu: [
				"name",
				"amount",
				"currency",
				"hang_doi_tac",
				"expectedCloseDate",
				"company",
				"owner",
			],
		}) as unknown[];
		await moPhieu("DEAL");
		const thuTu = nhanChiTiet("DEAL");
		if (JSON.stringify(thuTu) !== JSON.stringify(mong))
			throw new Error(`tcc phieu thu tu: ${JSON.stringify(thuTu)}`);
		await dongPhieu();

		kho.boTri = boTriGia("DEAL", { tuTao }) as unknown[];
		await moPhieu("DEAL");
		const macDinh = nhanChiTiet("DEAL");
		if (macDinh.at(-1) !== "Hạng đối tác")
			throw new Error(`tcc phieu thu tu: doi chung ${JSON.stringify(macDinh)}`);
		expect(thuTu).toEqual(mong);
	});
});

describe("tcc-phieu-chua-tai", () => {
	test("bo tri treo hay loi thi phieu Lien he van du truong mac dinh", async () => {
		const mong = STANDARD_FIELD_KEYS.CONTACT.map((k) =>
			nhanTruongChuan("CONTACT", k, "vi"),
		);
		datGia("contacts.byId", () => lienHeGia());
		let soCa = 0;
		for (const cheDo of ["treo", "loi"] as const) {
			kho.cheDoBoTri = cheDo;
			await moPhieu("CONTACT");
			const nhan = nhanChiTiet("CONTACT");
			if (JSON.stringify(nhan) !== JSON.stringify(mong))
				throw new Error(`tcc phieu chua tai: ${cheDo} ${JSON.stringify(nhan)}`);
			soCa += 1;
			await dongPhieu();
		}
		kho.cheDoBoTri = "tra";
		kho.boTri = boTriGia("CONTACT", { an: ["title"] }) as unknown[];
		await moPhieu("CONTACT");
		if (nhanChiTiet("CONTACT").includes(rVi.contact.fields.title))
			throw new Error("tcc phieu chua tai: doi chung");
		if (soCa !== 2) throw new Error(`tcc phieu chua tai: thieu ${soCa}`);
		expect(soCa).toBe(2);
	});
});

describe("tcc-an", () => {
	test("phieu Cong ty bo hang Thanh pho khi an, hien lai dung cho", async () => {
		datGia("companies.byId", () => congTyGia());
		const thanhPho = rVi.company.fields.city;
		kho.boTri = boTriGia("COMPANY", { an: ["city"] }) as unknown[];
		await moPhieu("COMPANY");
		if (nhanChiTiet("COMPANY").includes(thanhPho))
			throw new Error("tcc an: phieu con hang");
		await dongPhieu();
		kho.boTri = boTriGia("COMPANY") as unknown[];
		await moPhieu("COMPANY");
		const i = nhanChiTiet("COMPANY").indexOf(thanhPho);
		if (i !== 5) throw new Error(`tcc an: hien lai sai cho ${i}`);
		expect(i).toBe(5);
	});
});

describe("tcc-phieu-quy-doi", () => {
	test("Quy doi theo Gia tri: an Gia tri thi khong ve, dao Tien te len truoc thi ngay sau Gia tri", async () => {
		datGia("deals.byId", () => thoaThuanGia([], "USD"));
		const quyDoi = rVi.deal.inCurrency("VND");
		const viTri = (chu: string) =>
			[...document.body.querySelectorAll("*")].findIndex(
				(x) => x.childElementCount === 0 && x.textContent?.trim() === chu,
			);

		kho.boTri = boTriGia("DEAL") as unknown[];
		await moPhieu("DEAL");
		if (viTri(quyDoi) < 0)
			throw new Error("tcc phieu quy doi: doi chung thieu");
		await dongPhieu();

		kho.boTri = boTriGia("DEAL", {
			thuTu: [
				"name",
				"currency",
				"amount",
				"expectedCloseDate",
				"company",
				"owner",
			],
		}) as unknown[];
		await moPhieu("DEAL");
		const iGiaTri = viTri(rVi.deal.fields.amount);
		const iQuyDoi = viTri(quyDoi);
		const iNgay = viTri(rVi.deal.fields.closeDate);
		if (!(iGiaTri < iQuyDoi && iQuyDoi < iNgay))
			throw new Error(
				`tcc phieu quy doi: sai cho ${iGiaTri} ${iQuyDoi} ${iNgay}`,
			);
		await dongPhieu();

		kho.boTri = boTriGia("DEAL", { an: ["amount"] }) as unknown[];
		await moPhieu("DEAL");
		if (viTri(quyDoi) >= 0) throw new Error("tcc phieu quy doi: con khi an");
		expect(true).toBe(true);
	});
});

describe("tcc-bat-buoc-luu", () => {
	test("phieu that: xoa trong truong bat buoc thi bao, khong luu", async () => {
		const tuTao = [{ id: "f-ma_ho_so", key: "ma_ho_so" }];
		kho.boTri = boTriGia("DEAL", { tuTao }) as unknown[];
		for (const batBuoc of [true, false]) {
			kho.daGoi = [];
			datGia("deals.byId", () =>
				thoaThuanGia([
					{
						key: "ma_ho_so",
						label: "Mã hồ sơ",
						value: "HS-1",
						required: batBuoc,
					},
				]),
			);
			await moPhieu("DEAL");
			const hang = hangPhieu("Mã hồ sơ");
			const nutSua = hang?.querySelector("button");
			if (!nutSua) throw new Error("tcc bat buoc: phieu thieu hang");
			await act(async () => nutSua.click());
			await cho(20);
			const o = hang?.querySelector("input");
			if (!o) throw new Error("tcc bat buoc: phieu thieu o nhap");
			await act(async () => {
				const dat = Object.getOwnPropertyDescriptor(
					HTMLInputElement.prototype,
					"value",
				)?.set;
				dat?.call(o, "");
				o.dispatchEvent(new Event("input", { bubbles: true }));
			});
			await phim(o, "Enter");
			await cho(30);
			const luu = kho.daGoi.filter((g) => g.ten === "deals.update");
			if (batBuoc) {
				if (luu.length > 0) throw new Error("tcc bat buoc: phieu van luu");
				const cau = mVi.truongKieu.trong("Mã hồ sơ");
				if (!hang?.textContent?.includes(cau))
					throw new Error(`tcc bat buoc: phieu cau ${hang?.textContent}`);
			} else if (
				JSON.stringify(luu[0]?.bien) !==
				JSON.stringify({ id: "d-1", data: { fields: { ma_ho_so: null } } })
			) {
				throw new Error(`tcc bat buoc: doi chung ${JSON.stringify(luu)}`);
			}
			await dongPhieu();
		}
		expect(true).toBe(true);
	});
});

const { CompaniesTable } = await import(
	"@/app/(app)/[slug]/companies/companies-table"
);
const { companyMessages } = await import("@/lib/messages/companies");

function dongBangGia() {
	return {
		id: "co-1",
		name: "Công ty tcc bảng",
		domain: "tcc-bang.vn",
		iconUrl: null,
		iconDarkUrl: null,
		iconTone: null,
		logoUrl: null,
		brandColor: null,
		industry: null,
		enrichmentStatus: "COMPLETE",
		queued: false,
		source: "MANUAL",
		owner: null,
		contactCount: 0,
		openDealCount: 0,
		lastActivityAt: null,
		createdAt: "2026-09-01T00:00:00.000Z",
		archivedAt: null,
		fields: {},
	};
}

describe("tcc-an", () => {
	test("an truong chuan khoi ho so khong an cot tren bang Cong ty", async () => {
		datGia("fields.filters", () => []);
		datGia("savedViews.list", () => []);
		datGia("companies.list", () => ({
			rows: [dongBangGia()],
			total: 1,
			facetCounts: { industry: {} },
		}));
		kho.boTri = boTriGia("COMPANY", { an: ["domain"] }) as unknown[];
		await ve(<CompaniesTable />);
		await choDen(
			() => document.body.textContent?.includes("Công ty tcc bảng") === true,
			"bang cong ty",
		);
		const h = companyMessages("vi").headers;
		const tieuDe = [...document.body.querySelectorAll("th")].map(
			(x) => x.textContent?.trim() ?? "",
		);
		if (!tieuDe.includes(h.name)) throw new Error("tcc an: bang doi chung");
		if (
			!tieuDe.includes(h.domain) ||
			!document.body.textContent?.includes("tcc-bang.vn")
		)
			throw new Error("tcc an: bang mat cot");
		expect(tieuDe).toContain(h.domain);
	});
});
