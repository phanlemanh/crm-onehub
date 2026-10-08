import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
	QueryClient,
	QueryClientProvider,
	useQueryClient,
} from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	type GiaiDoanList,
	giaiDoanListOutput,
} from "../../api/src/giai-doan/giai-doan.contracts";

type Hang = GiaiDoanList["stages"][number];

function hang(
	id: string,
	label: string,
	kind: Hang["kind"],
	position: number,
	dealCount = 0,
): Hang {
	return { id, label, kind, position, dealCount };
}

const BAY: Hang[] = [
	hang("DEMO_BOOKED", "Demo booked", "OPEN", 0, 4),
	hang("QUALIFIED_TO_BUY", "Qualified to buy", "OPEN", 1),
	hang("DECISION_MAKER_BOUGHT_IN", "Decision maker in", "OPEN", 2),
	hang("CONTRACT_SENT", "Contract sent", "OPEN", 3),
	hang("CLOSED_WON", "Closed won", "WON", 0),
	hang("CLOSED_LOST", "Closed lost", "LOST", 0, 2),
	hang("UNQUALIFIED_TO_BUY", "Unqualified", "LOST", 1),
];

let che: "ok" | "loi" | "treo" = "ok";
let duLieu: GiaiDoanList = giaiDoanListOutput.parse({
	canManage: true,
	tran: 20,
	stages: BAY,
});
let soLanDoc = 0;
let daCat: {
	id: string;
	label: string;
	kind: Hang["kind"];
	archivedAt: string;
}[] = [];
type DauVaoGhi = {
	readonly [khoa: string]: string | readonly string[] | undefined;
};
let goiGhi: { ten: string; v: DauVaoGhi }[] = [];
let ketQuaGhi: Record<string, () => Promise<{ id: string }>> = {};

type GoiToast = {
	loai: "thuong" | "xong" | "loi";
	chu: string;
	action?: { label: string; onClick: () => void };
};
const goiToast: GoiToast[] = [];

function ghiToast(loai: GoiToast["loai"]) {
	return (chu: string, o?: { action?: GoiToast["action"] }) => {
		goiToast.push({ loai, chu, action: o?.action });
	};
}

type MoiGhi = { onSuccess?: unknown; onError?: unknown; onSettled?: unknown };

function sapTheoLoai(stages: Hang[]): Hang[] {
	const thu = { OPEN: 0, WON: 1, LOST: 2 };
	return [...stages].sort(
		(a, b) => thu[a.kind] - thu[b.kind] || a.position - b.position,
	);
}

const HIEU_UNG = new Map<string, (v: DauVaoGhi) => void>([
	[
		"giaiDoan.archive",
		(v: DauVaoGhi) => {
			const ma = String(v.id);
			const g = duLieu.stages.find((x) => x.id === ma);
			if (!g) return;
			duLieu = { ...duLieu, stages: duLieu.stages.filter((x) => x.id !== ma) };
			daCat = [
				{
					id: g.id,
					label: g.label,
					kind: g.kind,
					archivedAt: new Date().toISOString(),
				},
				...daCat,
			];
		},
	],
	[
		"giaiDoan.restore",
		(v: DauVaoGhi) => {
			const ma = String(v.id);
			const c = daCat.find((x) => x.id === ma);
			if (!c) return;
			daCat = daCat.filter((x) => x.id !== ma);
			const cuoi = Math.max(
				-1,
				...duLieu.stages
					.filter((x) => x.kind === c.kind)
					.map((x) => x.position),
			);
			duLieu = {
				...duLieu,
				stages: sapTheoLoai([
					...duLieu.stages,
					hang(c.id, c.label, c.kind, cuoi + 1),
				]),
			};
		},
	],
	[
		"giaiDoan.reorder",
		(v: DauVaoGhi) => {
			const thuTu = [v.ids ?? []].flat();
			duLieu = {
				...duLieu,
				stages: sapTheoLoai(
					duLieu.stages.map((x) =>
						thuTu.includes(x.id) ? { ...x, position: thuTu.indexOf(x.id) } : x,
					),
				),
			};
		},
	],
]);

function thuTuc<TVao, TRa>(ten: string, doc: (v: TVao) => TRa | Promise<TRa>) {
	return {
		queryKey: (v?: TVao) => (v === undefined ? [ten] : [ten, v]),
		pathKey: () => [ten],
		queryOptions: (v: TVao) => ({
			queryKey: v === undefined ? [ten] : [ten, v],
			queryFn: async () => doc(v),
		}),
		mutationOptions: (tuyChon?: MoiGhi) => ({
			mutationKey: [ten],
			mutationFn: async (v: DauVaoGhi) => {
				goiGhi.push({ ten, v });
				const lam = ketQuaGhi[ten];
				if (lam) return lam();
				HIEU_UNG.get(ten)?.(v);
				return { id: "x" };
			},
			...tuyChon,
		}),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		giaiDoan: {
			list: thuTuc("giaiDoan.list", () => {
				soLanDoc += 1;
				if (che === "loi") throw new Error("hong");
				if (che === "treo") return new Promise(() => {});
				return duLieu;
			}),
			create: thuTuc("giaiDoan.create", () => null),
			rename: thuTuc("giaiDoan.rename", () => null),
			reorder: thuTuc("giaiDoan.reorder", () => null),
			archive: thuTuc("giaiDoan.archive", () => null),
			restore: thuTuc("giaiDoan.restore", () => null),
			archived: thuTuc("giaiDoan.archived", () => daCat),
		},
	}),
}));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => {
		const qc = useQueryClient();
		return {
			giaiDoan: () => qc.invalidateQueries(),
			deal: async () => undefined,
		};
	},
}));

mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => children,
}));

mock.module("sonner", () => ({
	toast: Object.assign(ghiToast("thuong"), {
		error: ghiToast("loi"),
		success: ghiToast("xong"),
	}),
}));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { GiaiDoanSettings, LyDoGiaiDoan } = await import(
	"@/app/(app)/[slug]/settings/giai-doan/giai-doan-settings"
);
const { settingsMessages } = await import("@/lib/messages/settings");
const { messages: uiMessages } = await import("@crm/ui/lib/messages");
const { NHOM_CAI_DAT } = await import("@/lib/cai-dat-dieu-huong");
const t = settingsMessages("vi");

let root: Root | null = null;
let khung: HTMLElement | null = null;

beforeEach(() => {
	che = "ok";
	soLanDoc = 0;
	daCat = [];
	goiGhi = [];
	ketQuaGhi = {};
	goiToast.length = 0;
	duLieu = giaiDoanListOutput.parse({ canManage: true, tran: 20, stages: BAY });
});

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

async function cho(n = 6) {
	for (let i = 0; i < n; i += 1) {
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
}

async function dung(locale: "vi" | "en" = "vi") {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	await act(async () =>
		root?.render(
			<NuqsTestingAdapter searchParams="" hasMemory>
				<QueryClientProvider client={queryClient}>
					<LocaleProvider locale={locale}>
						<LyDoGiaiDoan />
						<GiaiDoanSettings />
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		),
	);
	await cho();
	return khung as HTMLElement;
}

function nutThem(k: HTMLElement) {
	return [...k.querySelectorAll("button")].filter(
		(b) => b.textContent?.trim() === t.giaiDoan.them,
	);
}

function khoa(el: Element) {
	return (
		el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true"
	);
}

function nutMenu(k: HTMLElement) {
	return [...k.querySelectorAll("[data-menu-giai-doan]")];
}

function tayCam(k: HTMLElement) {
	return [...k.querySelectorAll("[data-the-giai-doan] button")].filter((b) =>
		b.querySelector(".sr-only"),
	);
}

async function moMenu(k: HTMLElement, id: string) {
	const nut = k.querySelector(
		`[data-hang-giai-doan="${id}"] [data-menu-giai-doan]`,
	);
	if (!(nut instanceof HTMLElement)) throw new Error(`khong co menu ${id}`);
	await act(async () => {
		nut.focus();
		nut.dispatchEvent(
			new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
		);
	});
	await cho(2);
	return [...document.querySelectorAll('[role="menuitem"]')];
}

describe("khong-quyen", () => {
	test("member: moi dieu khien khoa va co dong ly do", async () => {
		duLieu = giaiDoanListOutput.parse({
			canManage: false,
			tran: 20,
			stages: BAY,
		});
		const k = await dung();
		const them = nutThem(k);
		expect(them, "member: nut Them bien mat thay vi khoa").toHaveLength(3);
		expect(them.every(khoa), "member: nut Them bien mat thay vi khoa").toBe(
			true,
		);
		const menu = nutMenu(k);
		expect(menu).toHaveLength(BAY.length);
		expect(menu.every(khoa)).toBe(true);
		const tay = tayCam(k);
		expect(tay).toHaveLength(BAY.length);
		expect(tay.every(khoa)).toBe(true);
		expect(k.textContent).toContain(t.giaiDoan.khongQuyen);
	});

	test("doi chung: quan tri khong co gi khoa", async () => {
		const k = await dung();
		expect(nutThem(k).some(khoa)).toBe(false);
		expect(nutMenu(k).some(khoa)).toBe(false);
		expect(k.textContent).not.toContain(t.giaiDoan.khongQuyen);
	});
});

describe("trang-thai", () => {
	test("dang tai: ba khung xuong, khong tra rong", async () => {
		che = "treo";
		const k = await dung();
		expect(
			k.querySelectorAll('[data-slot="skeleton"]').length,
			"dang tai: khong co khung xuong",
		).toBeGreaterThan(2);
	});

	test("loi: Empty co nut thu lai, bam thi goi lai", async () => {
		che = "loi";
		const k = await dung();
		expect(k.textContent).toContain(t.giaiDoan.loiTai);
		const nut = [...k.querySelectorAll("button")].find(
			(b) => b.textContent?.trim() === t.giaiDoan.thuLai,
		);
		if (!nut) throw new Error("khong co nut thu lai");
		che = "ok";
		await act(async () => nut.click());
		await cho();
		expect(soLanDoc).toBe(2);
	});

	test("co du lieu: ba the dung thu tu, dem hang moi the, nhan translate=no", async () => {
		const k = await dung();
		const the = [...k.querySelectorAll("[data-the-giai-doan]")];
		expect(the.map((e) => e.getAttribute("data-the-giai-doan"))).toEqual([
			"OPEN",
			"WON",
			"LOST",
		]);
		for (const kind of ["OPEN", "WON", "LOST"] as const) {
			const o = k.querySelector(`[data-the-giai-doan="${kind}"]`);
			const hangs = [...(o?.querySelectorAll("[data-hang-giai-doan]") ?? [])];
			expect(hangs.map((h) => h.getAttribute("data-hang-giai-doan"))).toEqual(
				BAY.filter((g) => g.kind === kind).map((g) => g.id),
			);
		}
		const nhan = [...k.querySelectorAll("[data-nhan-giai-doan]")];
		expect(nhan).toHaveLength(BAY.length);
		expect(nhan.every((e) => e.getAttribute("translate") === "no")).toBe(true);
	});

	test("giai doan duy nhat cua loai: muc Luu tru khoa", async () => {
		const k = await dung();
		const muc = await moMenu(k, "CLOSED_WON");
		const luu = muc.find((m) => m.textContent?.includes(t.giaiDoan.luuTru));
		if (!luu) throw new Error("khong co muc Luu tru");
		expect(khoa(luu)).toBe(true);
	});

	test("dat tran: ba nut Them khoa, ly do hien", async () => {
		duLieu = giaiDoanListOutput.parse({
			canManage: true,
			tran: 7,
			stages: BAY,
		});
		const k = await dung();
		expect(nutThem(k).every(khoa)).toBe(true);
		expect(k.textContent).toContain(
			t.giaiDoan.datTranLuuTru.replace("{so}", "7"),
		);
	});

	test("con thoa thuan (ke ca luu tru): Luu tru mo hop chuyen, khong mo hop hoi lai", async () => {
		const k = await dung();
		const muc = await moMenu(k, "CLOSED_LOST");
		const luu = muc.find((m) => m.textContent?.includes(t.giaiDoan.luuTru));
		if (!(luu instanceof HTMLElement)) throw new Error("khong co muc Luu tru");
		await act(async () => luu.click());
		await cho();
		expect(document.body.textContent).toContain(
			t.giaiDoan.conThoaThuanLuuTru.replace("{so}", "2"),
		);
		expect(document.querySelector('[role="alertdialog"]')).toBeNull();
	});

	test("thanh ben: muc Giai doan thoa thuan ngay sau Truong", () => {
		const khongGian = NHOM_CAI_DAT.find((n) => n.khoa === "khongGian");
		const khoaMuc = khongGian?.muc.map((m) => m.khoa) ?? [];
		expect(khoaMuc.indexOf("giaiDoan")).toBe(khoaMuc.indexOf("truong") + 1);
	});
});

const gocRect = Element.prototype.getBoundingClientRect;

function datViTri(): void {
	Element.prototype.getBoundingClientRect = function viTri(this: Element) {
		if (this.querySelector(":scope > [data-hang-giai-doan]") === null) {
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

async function nghi(ms: number): Promise<void> {
	await act(async () => {
		await new Promise((r) => setTimeout(r, ms));
	});
}

async function phim(o: Element, key: string): Promise<void> {
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
	await nghi(5);
}

async function keoLen(ten: string): Promise<void> {
	const tay = [...document.body.querySelectorAll("button")].find(
		(b) => b.textContent === `Đổi thứ tự ${ten}`,
	);
	if (!tay) throw new Error(`khong thay tay keo ${ten}`);
	tay.focus();
	await phim(tay, " ");
	await nghi(20);
	await phim(tay, "ArrowUp");
	await nghi(20);
	await phim(tay, " ");
	await nghi(30);
	await cho();
}

function thuTuThe(kind: Hang["kind"]): string[] {
	return [
		...document.body.querySelectorAll(
			`[data-the-giai-doan="${kind}"] [data-hang-giai-doan]`,
		),
	].map((h) => h.getAttribute("data-hang-giai-doan") ?? "");
}

const GOC_MO = BAY.filter((g) => g.kind === "OPEN").map((g) => g.id);
const daLuuChu = uiMessages("vi").sortableList.saved;

describe("luu-loi", () => {
	afterEach(() => {
		Element.prototype.getBoundingClientRect = gocRect;
	});

	test("luu-loi: may chu tu choi thi the tro lai thu tu cu, mot toast loi, khong toast da luu", async () => {
		datViTri();
		ketQuaGhi["giaiDoan.reorder"] = async () => {
			throw new Error("tu choi");
		};
		await dung();
		const docTruoc = soLanDoc;
		await keoLen("Qualified to buy");
		expect({
			goi: goiGhi.filter((g) => g.ten === "giaiDoan.reorder").length,
			thuTu:
				thuTuThe("OPEN").join() === GOC_MO.join()
					? "cu"
					: "giu thu tu vua keo khi luu loi",
			loi: goiToast.filter((x) => x.loai === "loi").map((x) => x.chu),
			daLuu: goiToast.filter((x) => x.loai === "xong" && x.chu === daLuuChu)
				.length,
			taiLai: soLanDoc - docTruoc <= 1,
		}).toEqual({
			goi: 1,
			thuTu: "cu",
			loi: ["tu choi"],
			daLuu: 0,
			taiLai: true,
		});
	});

	test("luu-loi: doi chung — may chu nhan thi mot toast da luu", async () => {
		datViTri();
		await dung();
		await keoLen("Qualified to buy");
		expect({
			goi: goiGhi.find((g) => g.ten === "giaiDoan.reorder")?.v,
			daLuu: goiToast.filter((x) => x.loai === "xong" && x.chu === daLuuChu)
				.length,
		}).toEqual({
			goi: {
				kind: "OPEN",
				ids: [
					"QUALIFIED_TO_BUY",
					"DEMO_BOOKED",
					"DECISION_MAKER_BOUGHT_IN",
					"CONTRACT_SENT",
				],
			},
			daLuu: 1,
		});
	});
});

async function chonMuc(k: HTMLElement, id: string, chu: string) {
	const muc = await moMenu(k, id);
	const m = muc.find((x) => x.textContent?.includes(chu));
	if (!(m instanceof HTMLElement)) throw new Error(`khong co muc ${chu}`);
	await act(async () => m.click());
	await cho();
	return m;
}

describe("luu-tru-ngay", () => {
	test("luu-tru-ngay: giai doan trong luu tru ngay, toast co Hoan tac ve dung cho cu", async () => {
		const k = await dung();
		const muc = await moMenu(k, "QUALIFIED_TO_BUY");
		const chu = muc.map((m) => m.textContent ?? "");
		await act(async () => {
			document.dispatchEvent(
				new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
			);
		});
		await cho(2);
		await chonMuc(k, "QUALIFIED_TO_BUY", t.giaiDoan.luuTru);
		const toastLuu = goiToast.find((x) => x.action !== undefined);
		expect({
			coLuuTru: chu.some((c) => c.includes(t.giaiDoan.luuTru)),
			coXoa: chu.some((c) => c.includes("Xoá")),
			hop: document.querySelector('[role="dialog"], [role="alertdialog"]'),
			archive: goiGhi.filter((g) => g.ten === "giaiDoan.archive"),
			toast: [toastLuu?.chu, toastLuu?.action?.label],
		}).toEqual({
			coLuuTru: true,
			coXoa: false,
			hop: null,
			archive: [{ ten: "giaiDoan.archive", v: { id: "QUALIFIED_TO_BUY" } }],
			toast: [
				t.giaiDoan.daLuuTruTen.replace("{ten}", "Qualified to buy"),
				t.giaiDoan.hoanTac,
			],
		});
		const lucBam = thuTuThe("OPEN");
		expect(
			lucBam.includes("QUALIFIED_TO_BUY")
				? "gia lap khong bo giai doan khoi danh sach"
				: "khu hoi",
		).toBe("khu hoi");
		await act(async () => toastLuu?.action?.onClick());
		await act(async () => toastLuu?.action?.onClick());
		await cho();
		const sau = goiGhi.filter((g) => g.ten !== "giaiDoan.archive");
		expect(
			sau.map((g) => g.ten).join() === "giaiDoan.restore,giaiDoan.reorder" &&
				[sau[1]?.v.ids ?? []].flat().join() === GOC_MO.join()
				? "dung"
				: "hoan tac luu tru khong tra dung cho cu",
		).toBe("dung");
		expect({
			goi: sau,
			lucBam,
			sauCung: thuTuThe("OPEN"),
		}).toEqual({
			goi: [
				{ ten: "giaiDoan.restore", v: { id: "QUALIFIED_TO_BUY" } },
				{ ten: "giaiDoan.reorder", v: { kind: "OPEN", ids: GOC_MO } },
			],
			lucBam: GOC_MO.filter((id) => id !== "QUALIFIED_TO_BUY"),
			sauCung: GOC_MO,
		});
	});

	test("luu-tru-ngay: luu tru lai roi Hoan tac lan hai van chay; tra loi thi bam lai duoc", async () => {
		const k = await dung();
		const soRestore = () =>
			goiGhi.filter((g) => g.ten === "giaiDoan.restore").length;
		const toastMoi = () =>
			goiToast.filter((x) => x.action !== undefined).at(-1);
		await chonMuc(k, "QUALIFIED_TO_BUY", t.giaiDoan.luuTru);
		await act(async () => toastMoi()?.action?.onClick());
		await cho();
		await chonMuc(k, "QUALIFIED_TO_BUY", t.giaiDoan.luuTru);
		await act(async () => toastMoi()?.action?.onClick());
		await cho();
		expect(
			soRestore() === 2 ? "dung" : "hoan tac luu tru lan hai khong chay",
		).toBe("dung");
		await chonMuc(k, "QUALIFIED_TO_BUY", t.giaiDoan.luuTru);
		ketQuaGhi["giaiDoan.restore"] = async () => {
			throw new Error("mang");
		};
		const lan3 = toastMoi();
		await act(async () => lan3?.action?.onClick());
		await cho();
		await act(async () => lan3?.action?.onClick());
		await cho();
		expect({
			restore: soRestore(),
			loi: goiToast.filter((x) => x.loai === "loi").map((x) => x.chu),
		}).toEqual({ restore: 4, loi: ["mang", "mang"] });
	});

	test("luu-tru-ngay: khoi phuc xong ma sap lai bi tu choi thi bao loi", async () => {
		ketQuaGhi["giaiDoan.reorder"] = async () => {
			throw new Error("lech");
		};
		const k = await dung();
		await chonMuc(k, "QUALIFIED_TO_BUY", t.giaiDoan.luuTru);
		const toastLuu = goiToast.find((x) => x.action !== undefined);
		await act(async () => toastLuu?.action?.onClick());
		await cho();
		expect(goiToast.filter((x) => x.loai === "loi").map((x) => x.chu)).toEqual([
			"lech",
		]);
	});

	test("luu-tru-ngay: trang khong con chu Xoa cho giai doan, vi va en", async () => {
		duLieu = giaiDoanListOutput.parse({
			canManage: true,
			tran: 7,
			stages: BAY,
		});
		const vi = await dung();
		const mucVi = (await moMenu(vi, "QUALIFIED_TO_BUY")).map(
			(m) => m.textContent ?? "",
		);
		const chuVi = document.body.textContent ?? "";
		act(() => root?.unmount());
		khung?.remove();
		const en = await dung("en");
		const tEn = settingsMessages("en").giaiDoan;
		const mucEn = (await moMenu(en, "QUALIFIED_TO_BUY")).map(
			(m) => m.textContent ?? "",
		);
		const chuEn = document.body.textContent ?? "";
		const thay = {
			viCoLuuTru: mucVi.some((c) => c.includes(t.giaiDoan.luuTru)),
			enCoLuuTru: mucEn.some((c) => c.includes(tEn.luuTru)),
			viTran: chuVi.includes(t.giaiDoan.datTranLuuTru.replace("{so}", "7")),
			enTran: chuEn.includes(tEn.datTranLuuTru.replace("{so}", "7")),
			viXoa: /xoá/i.test(chuVi),
			enDelete: /delete|remove/i.test(chuEn),
		};
		expect(
			thay.viXoa || thay.enDelete
				? "trang con chu Xoa cho giai doan"
				: "khong con",
		).toBe("khong con");
		expect(thay).toEqual({
			viCoLuuTru: true,
			enCoLuuTru: true,
			viTran: true,
			enTran: true,
			viXoa: false,
			enDelete: false,
		});
	});

	test("luu-tru-ngay: giai doan cuoi nhom khoa Luu tru va khong goi archive; doi chung nhom nhieu giai doan goi", async () => {
		const k = await dung();
		const m = await chonMuc(k, "CLOSED_WON", t.giaiDoan.luuTru);
		expect({
			khoa: khoa(m),
			lyDo: m.textContent?.includes(t.giaiDoan.xoaCuoiCung),
			archive: goiGhi.filter((g) => g.ten === "giaiDoan.archive").length,
		}).toEqual({ khoa: true, lyDo: true, archive: 0 });
	});

	test("luu-tru-ngay: nguoi khong quan tri thay tay keo va menu khoa", async () => {
		duLieu = giaiDoanListOutput.parse({
			canManage: false,
			tran: 20,
			stages: BAY,
		});
		const k = await dung();
		const tay = tayCam(k);
		const menu = nutMenu(k);
		const khoaKhach = { tay: tay.map(khoa), menu: menu.map(khoa) };
		act(() => root?.unmount());
		khung?.remove();
		duLieu = giaiDoanListOutput.parse({
			canManage: true,
			tran: 20,
			stages: BAY,
		});
		const q = await dung();
		const khoaQuanTri = {
			tay: tayCam(q).map(khoa),
			menu: nutMenu(q).map(khoa),
		};
		expect({ khoaKhach, khoaQuanTri }).toEqual({
			khoaKhach: {
				tay: BAY.map(() => true),
				menu: BAY.map(() => true),
			},
			khoaQuanTri: {
				tay: BAY.map(() => false),
				menu: BAY.map(() => false),
			},
		});
	});
});

async function chonDich(nhan: string): Promise<void> {
	const trigger = document.body.querySelector(
		'[role="dialog"] [role="combobox"]',
	);
	if (!trigger) throw new Error("khong thay o chon dich");
	await act(async () => {
		for (const loai of [
			"pointerdown",
			"mousedown",
			"pointerup",
			"mouseup",
			"click",
		]) {
			const Kieu = loai.startsWith("pointer") ? PointerEvent : MouseEvent;
			trigger.dispatchEvent(
				new Kieu(loai, {
					bubbles: true,
					cancelable: true,
					button: 0,
					pointerType: "mouse",
				} as PointerEventInit),
			);
		}
	});
	await cho();
	const lua = [...document.body.querySelectorAll('[role="option"]')].find((o) =>
		o.textContent?.includes(nhan),
	);
	if (!lua) throw new Error(`khong co lua chon ${nhan}`);
	await act(async () => {
		lua.dispatchEvent(
			new KeyboardEvent("keydown", {
				key: "Enter",
				bubbles: true,
				cancelable: true,
			}),
		);
	});
	await cho();
}

describe("luu-tru-chuyen", () => {
	test("luu-tru-chuyen: hop chuyen dung chu, nut khoa toi khi chon dich, toast khong Hoan tac", async () => {
		const k = await dung();
		await chonMuc(k, "DEMO_BOOKED", t.giaiDoan.luuTru);
		const hop = document.querySelector('[role="dialog"]');
		const nut = () =>
			[...(hop?.querySelectorAll("button") ?? [])].find(
				(b) => b.textContent?.trim() === t.giaiDoan.chuyenVaLuuTru,
			);
		const tieuDe = hop?.querySelector("h2")?.textContent;
		const khoaTruoc = nut()?.disabled;
		await chonDich("Qualified to buy");
		const khoaSau = nut()?.disabled;
		const n = nut();
		if (!n) throw new Error("khong co nut Chuyen va luu tru");
		await act(async () => n.click());
		await cho();
		const xong = goiToast.filter(
			(x) => x.loai === "xong" && x.chu.includes("Demo booked"),
		);
		expect(
			xong.every((x) => x.action === undefined)
				? "dung"
				: "toast luu tru co thoa thuan co Hoan tac",
		).toBe("dung");
		expect({
			tieuDe,
			than: hop?.textContent?.includes(
				t.giaiDoan.conThoaThuanLuuTru.replace("{so}", "4"),
			),
			khoaTruoc,
			khoaSau,
			archive: goiGhi.filter((g) => g.ten === "giaiDoan.archive"),
			toast: xong.map((x) => [x.chu, x.action === undefined]),
		}).toEqual({
			tieuDe: t.giaiDoan.luuTruTieuDe.replace("{ten}", "Demo booked"),
			than: true,
			khoaTruoc: true,
			khoaSau: false,
			archive: [
				{
					ten: "giaiDoan.archive",
					v: { id: "DEMO_BOOKED", moveTo: "QUALIFIED_TO_BUY" },
				},
			],
			toast: [[t.giaiDoan.daLuuTruTen.replace("{ten}", "Demo booked"), true]],
		});
		expect(t.giaiDoan.conThoaThuanLuuTru).toContain("«Đã lưu trữ»");
	});
});

describe("da-luu-tru", () => {
	const HAI = [
		{
			id: "CU_MO",
			label: "Cũ mở",
			kind: "OPEN" as const,
			archivedAt: "2026-10-08T01:00:00.000Z",
		},
		{
			id: "CU_THUA",
			label: "Cũ thua",
			kind: "LOST" as const,
			archivedAt: "2026-10-07T01:00:00.000Z",
		},
	];

	async function moGap(k: HTMLElement) {
		const gap = k.querySelector('[data-slot="archived-list"] button');
		if (!(gap instanceof HTMLElement)) throw new Error("khong co muc gap");
		await act(async () => gap.click());
		await cho();
		return gap;
	}

	function nutKhoiPhuc(k: HTMLElement) {
		return [...k.querySelectorAll("[data-luu-tru] button")].filter(
			(b) => b.textContent?.trim() === t.giaiDoan.khoiPhuc,
		);
	}

	test("da-luu-tru: muc gap cuoi trang, ten va nhom, chi Khoi phuc", async () => {
		daCat = HAI;
		const k = await dung();
		const khoi = k.querySelector('[data-slot="archived-list"]');
		const cuoi = [...(khoi?.parentElement?.children ?? [])]
			.filter((e) =>
				e.matches("[data-the-giai-doan], [data-slot='archived-list']"),
			)
			.at(-1);
		const gap = await moGap(k);
		const dong = [...k.querySelectorAll("[data-luu-tru]")];
		expect(khoi === null ? "khong co muc gap Da luu tru" : "co").toBe("co");
		expect({
			cuoi: cuoi === khoi,
			nhan: gap.textContent?.trim(),
			dong: dong.map((d) => [
				d.getAttribute("data-luu-tru"),
				d.textContent?.includes(
					d.getAttribute("data-luu-tru") === "CU_MO" ? "Cũ mở" : "Cũ thua",
				),
				d.textContent?.includes(
					d.getAttribute("data-luu-tru") === "CU_MO"
						? t.giaiDoan.mo
						: t.giaiDoan.khongThanh,
				),
				d.querySelectorAll("button").length,
			]),
			khoiPhuc: nutKhoiPhuc(k).length,
			xoaVinhVien: k.textContent?.includes(t.giaiDoan.xoaVinhVien),
		}).toEqual({
			cuoi: true,
			nhan: `${t.giaiDoan.daLuuTru} (2)`,
			dong: [
				["CU_MO", true, true, 1],
				["CU_THUA", true, true, 1],
			],
			khoiPhuc: 2,
			xoaVinhVien: false,
		});
	});

	test("da-luu-tru: khong co giai doan da cat thi khong co muc gap", async () => {
		const k = await dung();
		expect(k.querySelector('[data-slot="archived-list"]')).toBeNull();
	});

	test("da-luu-tru: khoi phuc xong co toast; bi chan thi bao loi, danh sach giu", async () => {
		daCat = HAI;
		const k = await dung();
		await moGap(k);
		const [dau] = nutKhoiPhuc(k);
		if (!(dau instanceof HTMLElement))
			throw new Error("khong co nut Khoi phuc");
		const dongDau = k.querySelectorAll("[data-luu-tru]").length;
		await act(async () => dau.click());
		await cho();
		const dongSauKhoiPhuc = k.querySelectorAll("[data-luu-tru]").length;
		expect({
			goi: goiGhi.filter((g) => g.ten === "giaiDoan.restore"),
			toast: goiToast.filter((x) => x.loai === "xong").map((x) => x.chu),
			dong: [dongDau, dongSauKhoiPhuc],
		}).toEqual({
			goi: [{ ten: "giaiDoan.restore", v: { id: "CU_MO" } }],
			toast: [t.giaiDoan.daKhoiPhucTen.replace("{ten}", "Cũ mở")],
			dong: [2, 1],
		});
		ketQuaGhi["giaiDoan.restore"] = async () => {
			throw new Error("trung");
		};
		const [lai] = nutKhoiPhuc(k);
		if (!(lai instanceof HTMLElement))
			throw new Error("khong co nut Khoi phuc");
		await act(async () => lai.click());
		await cho();
		expect({
			loi: goiToast.filter((x) => x.loai === "loi").map((x) => x.chu),
			dong: k.querySelectorAll("[data-luu-tru]").length,
		}).toEqual({ loi: ["trung"], dong: 1 });
	});

	test("da-luu-tru: nguoi khong quan tri thay Khoi phuc khoa", async () => {
		daCat = HAI;
		duLieu = giaiDoanListOutput.parse({
			canManage: false,
			tran: 20,
			stages: BAY,
		});
		const k = await dung();
		await moGap(k);
		expect(nutKhoiPhuc(k).map(khoa)).toEqual([true, true]);
	});
});
