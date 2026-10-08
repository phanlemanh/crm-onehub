import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	jest,
	mock,
	test,
} from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
	OKR_TOM_TAT,
	type TroLyTomTatOutput,
	troLyTomTatOutput,
} from "@crm/validation/okr-tom-tat";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	type HopTuanOutput,
	hopTuanOutput,
} from "../../api/src/okr/okr-xem.contracts";

type Json =
	| string
	| number
	| boolean
	| null
	| readonly Json[]
	| { readonly [khoa: string]: Json | undefined };
type DauVao = { readonly [khoa: string]: Json | undefined } | undefined;
type LoiGoi = { duong: string; dauVao: DauVao };
type Lay = (vao: DauVao) => unknown;
type TuyChonGhi = {
	onSuccess?: (kq: Json, vao: DauVao) => void;
	onError?: (e: Error) => void;
};

let daGoi: LoiGoi[] = [];
let daMoDienBien: [string, string][] = [];
const duLieu = new Map<string, Lay>();

function dat(duong: string, lay: Lay): void {
	duLieu.set(duong, lay);
}

function thuTuc(duong: string) {
	const doc = async (vao: DauVao): Promise<unknown> => {
		daGoi.push({ duong, dauVao: vao });
		const lay = duLieu.get(duong);
		return lay ? lay(vao) : null;
	};
	return {
		queryKey: (vao?: DauVao) => (vao === undefined ? [duong] : [duong, vao]),
		pathKey: () => [duong],
		queryOptions: (vao?: DauVao) => ({
			queryKey: [duong, vao ?? null],
			queryFn: async () => doc(vao),
		}),
		mutationOptions: (chon?: TuyChonGhi) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async (vao: DauVao) => (await doc(vao)) ?? { ok: true },
		}),
	};
}

const trpcGia = new Proxy(
	{},
	{
		get: (_goc, khong: string) =>
			new Proxy({}, { get: (_g, ten: string) => thuTuc(`${khong}.${ten}`) }),
	},
);

mock.module("@/lib/trpc/client", () => ({ useTRPC: () => trpcGia }));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => new Proxy({}, { get: () => async () => {} }),
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws/okr/theo-don-vi",
}));

mock.module("@/components/crm/record-sheet/dien-bien-kr", () => ({
	useMoDienBien: () => (objectiveId: string, keyResultId: string) => {
		daMoDienBien.push([objectiveId, keyResultId]);
	},
}));

const { HopTuan } = await import("@/app/(app)/[slug]/okr/hop-tuan");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { Toaster } = await import("@crm/ui/components/sonner");
const { okrToanCanhMessages } = await import("@/lib/messages/okr-toan-canh");
const { messages } = await import("@crm/ui/lib/messages");

const mt = okrToanCanhMessages("vi");
const m = mt.tomTat;
const phanHoi = messages("vi").aiFeedback;
const msgUi = messages("vi");

const DUONG_THIET_KE = join(
	import.meta.dir,
	"..",
	"..",
	"..",
	"docs",
	"superpowers",
	"specs",
	"2026-09-30-tro-ly-okr-tom-tat-design.md",
);

function idBangTrangThai(): string[] {
	const chu = readFileSync(DUONG_THIET_KE, "utf8");
	const dau = chu.indexOf("<<<UX-STATE-TABLE");
	const cuoi = chu.indexOf("UX-STATE-TABLE>>>");
	if (dau < 0 || cuoi < dau) throw new Error("khong thay bang UX-STATE-TABLE");
	return [...chu.slice(dau, cuoi).matchAll(/^\|\s*(ST-[a-z0-9-]+)\s*\|/gm)]
		.map((k) => k[1] ?? "")
		.filter((id) => id.startsWith("ST-tomtat-"));
}

const RONG = 320;

const moTaGoc = {
	offsetWidth: Object.getOwnPropertyDescriptor(
		HTMLElement.prototype,
		"offsetWidth",
	),
	offsetHeight: Object.getOwnPropertyDescriptor(
		HTMLElement.prototype,
		"offsetHeight",
	),
	offsetLeft: Object.getOwnPropertyDescriptor(
		HTMLElement.prototype,
		"offsetLeft",
	),
};

beforeAll(() => {
	Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
		configurable: true,
		get: () => RONG,
	});
	Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
		configurable: true,
		get: () => 40,
	});
	Object.defineProperty(HTMLElement.prototype, "offsetLeft", {
		configurable: true,
		get(this: HTMLElement) {
			if (this.dataset.slot !== "carousel-item" || !this.parentElement)
				return 0;
			return [...this.parentElement.children].indexOf(this) * RONG;
		},
	});
});

afterAll(() => {
	for (const [ten, mo] of Object.entries(moTaGoc)) {
		if (mo) Object.defineProperty(HTMLElement.prototype, ten, mo);
	}
});

const NGUON_A = {
	id: "ci-a",
	keyResultId: "kr-doanh-thu",
	krTen: "Doanh thu hợp đồng mới đạt 12 tỷ",
	mucTieuId: "mt-bac",
	mucTieuTen: "Tăng trưởng miền Bắc bền vững",
	ngay: "2026-10-12",
	giaTri: 7.5,
	donVi: "tỷ",
	tuTin: "vua",
	ghiChu: "Chậm hai hợp đồng lớn ở Hải Phòng",
} as const;

const NGUON_B = {
	id: "ci-b",
	keyResultId: "kr-khach",
	krTen: "Thêm 40 khách hàng doanh nghiệp",
	mucTieuId: "mt-bac",
	mucTieuTen: "Tăng trưởng miền Bắc bền vững",
	ngay: "2026-10-13",
	giaTri: 22,
	donVi: "khách",
	tuTin: "thap",
	ghiChu: "",
} as const;

const NGUON_C = {
	id: "ci-c",
	keyResultId: "kr-giu",
	krTen: "Tỷ lệ rời bỏ dưới 3%",
	mucTieuId: "mt-giu",
	mucTieuTen: "Giữ chân khách cũ",
	ngay: "2026-10-11",
	giaTri: 2.8,
	donVi: "%",
	tuTin: "cao",
	ghiChu: "Ổn định",
} as const;

const CAU_1 = "Tuần này doanh thu hợp đồng mới lên 7,5 tỷ.";
const CAU_2 = "Ba KR đáng bàn, một KR tụt mức tự tin.";

function tomTat(thay: Partial<TroLyTomTatOutput>): TroLyTomTatOutput {
	return troLyTomTatOutput.parse({
		ban: null,
		dangSoan: false,
		chuaCapNhat: false,
		...thay,
	});
}

function ban(
	thay: Partial<NonNullable<TroLyTomTatOutput["ban"]>> = {},
): TroLyTomTatOutput {
	return tomTat({
		ban: {
			id: "tt-1",
			tuan: "2026-10-12",
			soLanCapNhat: 5,
			cau: [
				{ vanBan: CAU_1, nguon: [NGUON_A] },
				{ vanBan: CAU_2, nguon: [NGUON_A, NGUON_B, NGUON_C] },
			],
			phanHoiCuaToi: null,
			...thay,
		},
	});
}

const HOP_TUAN: HopTuanOutput = hopTuanOutput.parse({
	tuan: "2026-10-12",
	tuanDau: false,
	daCapNhat: 3,
	tongKr: 5,
	dangBan: [
		{
			keyResultId: "kr-doanh-thu",
			objectiveId: "mt-bac",
			tieuDe: "Doanh thu hợp đồng mới đạt 12 tỷ",
			mucTieu: "Tăng trưởng miền Bắc bền vững",
			chuTen: "Trần Minh Hải",
			progress: 62,
			expected: 70,
			laMoc: false,
			tuTin: "vua",
			ghiChu: "Chậm hai hợp đồng lớn ở Hải Phòng",
			lyDo: [{ loai: "ghi-chu", ngay: "2026-10-12" }],
		},
	],
	conLai: [],
});

let tomTatHienTai: () => unknown = () => ban();

beforeEach(() => {
	daGoi = [];
	daMoDienBien = [];
	duLieu.clear();
	tomTatHienTai = () => ban();
	dat("okr.hopTuan", () => HOP_TUAN);
	dat("okr.moHopTuan", () => ({ ghi: true }));
	dat("okr.troLyTomTat", () => tomTatHienTai());
	dat("okr.troLyTomTatPhanHoi", () => ({ ok: true }));
});

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];
let dongHoGia = false;

async function moToaster(): Promise<void> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	await act(async () => {
		root.render(<Toaster />);
	});
	dangMo.push({ o, root });
}

async function mo(man: ReactElement): Promise<San> {
	if (dangMo.length === 0) await moToaster();
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter hasMemory searchParams="">
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	const san = { o, root };
	dangMo.push(san);
	await nhip(10);
	return san;
}

async function troi(ms: number): Promise<void> {
	const BUOC = 250;
	for (let t = 0; t < ms; t += BUOC) {
		await act(async () => {
			jest.advanceTimersByTime(Math.min(BUOC, ms - t));
		});
		await act(async () => {
			await Promise.resolve();
		});
	}
}

async function nhip(lan = 1): Promise<void> {
	for (let i = 0; i < lan; i += 1) {
		if (dongHoGia) {
			await troi(10);
		} else {
			await act(async () => {
				await new Promise((r) => setTimeout(r, 0));
			});
		}
	}
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 150; vong += 1) {
		if (xong()) return;
		await nhip();
	}
	throw new Error(
		`khong toi: ${moTa} — ${document.body.textContent?.slice(0, 600)}`,
	);
}

async function bam(o: Element): Promise<void> {
	await act(async () => {
		for (const loai of [
			"pointerdown",
			"mousedown",
			"pointerup",
			"mouseup",
			"click",
		]) {
			const Kieu = loai.startsWith("pointer") ? PointerEvent : MouseEvent;
			o.dispatchEvent(
				new Kieu(loai, {
					bubbles: true,
					cancelable: true,
					button: 0,
					pointerType: "mouse",
				} as PointerEventInit),
			);
		}
	});
	await nhip(3);
}

async function phim(
	dich: Element,
	loai: "keydown" | "keyup",
	key: string,
): Promise<boolean> {
	let khongChan = true;
	await act(async () => {
		khongChan = dich.dispatchEvent(
			new KeyboardEvent(loai, { key, bubbles: true, cancelable: true }),
		);
	});
	return khongChan;
}

async function kichHoatNhuTrinhDuyet(
	dich: HTMLElement,
	key: "Enter" | " ",
): Promise<void> {
	const laNut = dich instanceof HTMLButtonElement;
	const xuong = await phim(dich, "keydown", key);
	if (key === "Enter") {
		if (laNut && xuong) await act(async () => dich.click());
		await nhip(3);
		return;
	}
	const len = await phim(dich, "keyup", key);
	if (laNut && xuong && len) await act(async () => dich.click());
	await nhip(3);
}

function chu(o: Element | null): string {
	return o?.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function khoi(): HTMLElement | null {
	return document.body.querySelector<HTMLElement>('[data-khoi="tom-tat"]');
}

function trangThai(id: string): HTMLElement | null {
	return document.body.querySelector<HTMLElement>(`[data-trang-thai="${id}"]`);
}

function nutTrichDan(thuTu: number): HTMLButtonElement {
	const nut = document.body.querySelector<HTMLButtonElement>(
		`button[data-trich-dan="${thuTu}"]`,
	);
	if (!nut) throw new Error(`khong thay nhan trich dan ${thuTu}`);
	return nut;
}

function the(): HTMLElement | null {
	return document.body.querySelector<HTMLElement>(
		'[data-slot="popover-content"]',
	);
}

function nutPhanHoi(nhan: string): HTMLElement {
	const nut = [
		...document.body.querySelectorAll<HTMLElement>(
			'[data-slot="toggle-group-item"], [role="radio"]',
		),
	].find((b) => chu(b) === nhan);
	if (!nut) throw new Error(`khong thay nut phan hoi ${nhan}`);
	return nut;
}

function dangNhan(nhan: string): boolean {
	const n = nutPhanHoi(nhan);
	return (
		n.getAttribute("data-state") === "on" ||
		n.getAttribute("aria-checked") === "true"
	);
}

function goiCua(duong: string): LoiGoi[] {
	return daGoi.filter((g) => g.duong === duong);
}

function chiSo(t: HTMLElement): string {
	return chu(t.querySelector("[data-chi-so]"));
}

const PB = { loai: "pb", id: "pb-1" } as const;

async function moBang(unit: Parameters<typeof HopTuan>[0]["unit"] = PB) {
	return mo(<HopTuan cycleId="q4" unit={unit} />);
}

async function moCoCau(): Promise<void> {
	await moBang();
	await cho(() => trangThai("ST-tomtat-co-cau") !== null, "khoi co cau");
}

afterEach(async () => {
	if (dongHoGia) {
		jest.useRealTimers();
		dongHoGia = false;
	}
	for (const s of dangMo) {
		await act(async () => s.root.unmount());
		s.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

const CA = {
	"ST-tomtat-dang-tai": async () => {
		tomTatHienTai = () => new Promise(() => {});
		await moBang();
		await cho(() => trangThai("ST-tomtat-dang-tai") !== null, "dang tai");
		const o = trangThai("ST-tomtat-dang-tai");
		expect(o?.getAttribute("aria-busy")).toBe("true");
		expect(chu(o)).toBe(m.dangTai);
		expect(o?.querySelectorAll('[data-slot="skeleton"]').length).toBe(4);
		expect(chu(khoi()?.querySelector('[data-slot="card-title"]') ?? null)).toBe(
			m.tieuDe,
		);
	},
	"ST-tomtat-co-cau": async () => {
		await moCoCau();
		const k = khoi();
		if (!k) throw new Error("khong co khoi");
		expect(chu(k.querySelector('[data-slot="card-title"]'))).toBe(
			"Tóm tắt tuần của Trợ lý OKR",
		);
		expect(chu(k.querySelector("[data-dong-nguon]"))).toBe(
			"Trợ lý OKR tóm tắt từ 5 lần cập nhật · tuần 12/10",
		);
		const cau = [...k.querySelectorAll("li[data-cau]")];
		expect(cau).toHaveLength(2);
		const van = cau.map((li) =>
			chu(li.querySelector('[translate="no"]') ?? null),
		);
		expect(van).toEqual([CAU_1, CAU_2]);
		expect(chu(nutTrichDan(1))).toBe("Cập nhật 12/10");
		expect(chu(nutTrichDan(2))).toBe("Cập nhật 13/10 +2");
		expect(dangNhan(phanHoi.useful)).toBe(false);
		expect(dangNhan(phanHoi.notUseful)).toBe(false);
		expect(chu(k.querySelector('[role="status"]'))).toBe("");
		const dangBan = document.getElementById("dang-ban");
		if (!dangBan) throw new Error("mat bang dang ban");
		expect(
			k.compareDocumentPosition(dangBan) & Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
	},
	"ST-tomtat-trich-dan": async () => {
		await moCoCau();
		await act(async () => nutTrichDan(1).click());
		await nhip(3);
		const t = the();
		if (!t) throw new Error("trich dan khong bam duoc");
		expect(chu(t)).toContain(NGUON_A.krTen);
		expect(chu(t)).toContain(NGUON_A.mucTieuTen);
		expect(chu(t)).toContain("12/10/2026");
		expect(chu(t.querySelector("[data-gia-tri]"))).toBe("7,5 tỷ");
		expect(t.querySelector("[data-gia-tri]")?.getAttribute("translate")).toBe(
			"no",
		);
		expect(t.querySelector("[data-tu-tin]")?.getAttribute("data-tu-tin")).toBe(
			"vua",
		);
		const ghiChu = t.querySelector("[data-ghi-chu]");
		expect(chu(ghiChu)).toBe(NGUON_A.ghiChu);
		expect(ghiChu?.getAttribute("translate")).toBe("no");
		expect(t.querySelector("[data-chi-so]")).toBeNull();
		const xem = t.querySelector<HTMLElement>("[data-xem-dien-bien]");
		if (!xem) throw new Error("khong co loi Xem dien bien KR");
		expect(chu(xem)).toBe(m.xemDienBien);
		await bam(xem);
		expect(daMoDienBien).toEqual([[NGUON_A.mucTieuId, NGUON_A.keyResultId]]);
	},
	"ST-tomtat-dang-soan": async () => {
		tomTatHienTai = () => tomTat({ dangSoan: true });
		await moBang();
		await cho(() => trangThai("ST-tomtat-dang-soan") !== null, "dang soan");
		const o = trangThai("ST-tomtat-dang-soan");
		expect(o?.getAttribute("aria-busy")).toBe("true");
		expect(chu(o)).toContain(m.dangSoan);
		expect(chu(o)).toContain(m.dangSoanMoTa);
	},
	"ST-tomtat-chua-cap-nhat": async () => {
		tomTatHienTai = () => tomTat({ chuaCapNhat: true });
		await moBang();
		await cho(
			() => trangThai("ST-tomtat-chua-cap-nhat") !== null,
			"chua cap nhat",
		);
		expect(chu(trangThai("ST-tomtat-chua-cap-nhat"))).toContain(
			"Tuần này chưa có Cập nhật tuần nào",
		);
		expect(khoi()?.querySelector("li[data-cau]")).toBeNull();
	},
	"ST-tomtat-loc-het": async () => {
		tomTatHienTai = () => ban({ cau: [] });
		await moBang();
		await cho(() => trangThai("ST-tomtat-loc-het") !== null, "loc het");
		expect(chu(trangThai("ST-tomtat-loc-het"))).toContain(
			"Không có câu nào bạn xem được trong tóm tắt tuần này",
		);
		expect(document.body.querySelector("[data-phan-hoi]")).toBeNull();
	},
	"ST-tomtat-da-phan-hoi": async () => {
		tomTatHienTai = () => ban({ phanHoiCuaToi: true });
		await moBang();
		await cho(() => trangThai("ST-tomtat-da-phan-hoi") !== null, "da phan hoi");
		expect(dangNhan(phanHoi.useful)).toBe(true);
		expect(dangNhan(phanHoi.notUseful)).toBe(false);
		expect(chu(khoi()?.querySelector('[role="status"]') ?? null)).toBe(m.daGhi);
		await bam(nutPhanHoi(phanHoi.notUseful));
		await cho(
			() => goiCua("okr.troLyTomTatPhanHoi").length === 1,
			"goi phan hoi",
		);
		expect(goiCua("okr.troLyTomTatPhanHoi")[0]?.dauVao).toEqual({
			tomTatId: "tt-1",
			huuIch: false,
		});
		await cho(() => dangNhan(phanHoi.notUseful), "doi y");
		expect(dangNhan(phanHoi.useful)).toBe(false);
		expect(chu(khoi()?.querySelector('[role="status"]') ?? null)).toBe(m.daGhi);
	},
	"ST-tomtat-loi": async () => {
		let hong = true;
		tomTatHienTai = () => {
			if (hong) throw new Error("hong");
			return ban();
		};
		await moBang();
		await cho(() => trangThai("ST-tomtat-loi") !== null, "loi");
		const o = trangThai("ST-tomtat-loi");
		expect(chu(o)).toContain(msgUi.karaKhung.chuaDuoc(m.loiKara));
		expect(chu(o)).toContain(m.loiMoTa);
		await cho(
			() => document.getElementById("dang-ban") !== null,
			"bang dang ban van hien",
		);
		const thuLai = [...(o?.querySelectorAll("button") ?? [])].find(
			(b) => chu(b) === mt.thuLai,
		);
		if (!thuLai) throw new Error("khong co nut Thu lai");
		const truoc = goiCua("okr.troLyTomTat").length;
		hong = false;
		await bam(thuLai);
		await cho(() => trangThai("ST-tomtat-co-cau") !== null, "thu lai xong");
		expect(goiCua("okr.troLyTomTat").length).toBe(truoc + 1);
	},
} satisfies Record<string, () => Promise<void>>;

describe("trang-thai tu bang UX-STATE-TABLE", () => {
	const ids = idBangTrangThai();
	test("bang co du tam trang thai ST-tomtat-*", () => {
		expect(ids.length).toBeGreaterThanOrEqual(8);
	});
	for (const id of ids) {
		test(`trang-thai ${id}`, async () => {
			const ca = Object.entries(CA).find(([k]) => k === id)?.[1];
			if (!ca) throw new Error(`trang thai chua do: ${id}`);
			await ca();
		});
	}
});

describe("nhan trich dan", () => {
	test("Enter mo the, Esc dong", async () => {
		await moCoCau();
		const nut = nutTrichDan(1);
		nut.focus();
		await kichHoatNhuTrinhDuyet(nut, "Enter");
		const t = the();
		if (!t) throw new Error("trich dan khong mo bang Enter");
		await phim(t, "keydown", "Escape");
		await nhip(3);
		if (the()) throw new Error("Esc khong dong trich dan");
	});

	test("Space mo the", async () => {
		await moCoCau();
		const nut = nutTrichDan(1);
		nut.focus();
		await kichHoatNhuTrinhDuyet(nut, " ");
		if (!the()) throw new Error("trich dan khong mo bang Space");
	});

	test("nhieu nguon lat 1/3 → 2/3, the hien dung nguon", async () => {
		await moCoCau();
		await act(async () => nutTrichDan(2).click());
		await nhip(5);
		const t = the();
		if (!t) throw new Error("trich dan khong bam duoc");
		expect(chiSo(t)).toBe("1/3");
		const nguon = [...t.querySelectorAll("[data-nguon]")].map((n) =>
			n.getAttribute("data-nguon"),
		);
		expect(nguon).toEqual([NGUON_A.id, NGUON_B.id, NGUON_C.id]);
		const sau = t.querySelector<HTMLButtonElement>(
			`button[aria-label="${msgUi.inlineCitation.nextSource}"]`,
		);
		if (!sau) throw new Error("khong thay nut lat nguon");
		await act(async () => sau.click());
		await nhip(5);
		expect(chiSo(t)).toBe("2/3");
		const b = t.querySelector(`[data-nguon="${NGUON_B.id}"]`);
		expect(chu(b?.querySelector("[data-gia-tri]") ?? null)).toBe("22 khách");
		expect(b?.querySelector("[data-tu-tin]")?.getAttribute("data-tu-tin")).toBe(
			"thap",
		);
		expect(b?.querySelector("[data-ghi-chu]")).toBeNull();
	});
});

describe("phan hoi", () => {
	test("mot cham Huu ich ghi true va hien Cam on", async () => {
		await moCoCau();
		await bam(nutPhanHoi(phanHoi.useful));
		await cho(
			() => goiCua("okr.troLyTomTatPhanHoi").length === 1,
			"goi phan hoi",
		);
		expect(goiCua("okr.troLyTomTatPhanHoi")[0]?.dauVao).toEqual({
			tomTatId: "tt-1",
			huuIch: true,
		});
		await cho(
			() => chu(khoi()?.querySelector('[role="status"]') ?? null) === m.daGhi,
			"cam on",
		);
		expect(dangNhan(phanHoi.useful)).toBe(true);
	});

	test("gui hong thi nut ve trang thai cu va bao loi", async () => {
		dat("okr.troLyTomTatPhanHoi", () => {
			throw new Error("hong");
		});
		await moCoCau();
		await bam(nutPhanHoi(phanHoi.notUseful));
		await cho(
			() => document.body.textContent?.includes(m.phanHoiLoi) ?? false,
			"toast loi",
		);
		expect(dangNhan(phanHoi.notUseful)).toBe(false);
		expect(dangNhan(phanHoi.useful)).toBe(false);
	});
});

describe("don vi", () => {
	test("pb goi troLyTomTat dung chu ky va phong", async () => {
		await moCoCau();
		expect(goiCua("okr.troLyTomTat")[0]?.dauVao).toEqual({
			cycleId: "q4",
			departmentId: "pb-1",
		});
	});

	for (const unit of [
		{ loai: "bp", id: "bp-1" },
		{ loai: "goc" },
		{ loai: "nguoi", id: "u-1" },
	] as const) {
		test(`${unit.loai}: khong co khoi, khong goi troLyTomTat`, async () => {
			await moBang(unit);
			await cho(
				() => document.getElementById("dang-ban") !== null,
				"bang dang ban",
			);
			await nhip(5);
			expect(goiCua("okr.troLyTomTat")).toHaveLength(0);
			expect(khoi()).toBeNull();
		});
	}

	for (const [nhanh, thay] of [
		["ST-hoptuan-tuandau", { tuanDau: true }],
		["ST-hoptuan-yenang", { dangBan: [] }],
	] as const) {
		test(`khoi dung truoc than bang o nhanh ${nhanh}`, async () => {
			dat("okr.hopTuan", () => hopTuanOutput.parse({ ...HOP_TUAN, ...thay }));
			await moBang();
			await cho(
				() =>
					trangThai(nhanh) !== null && trangThai("ST-tomtat-co-cau") !== null,
				`khoi va ${nhanh}`,
			);
			const k = khoi();
			const than = trangThai(nhanh);
			if (!k || !than) throw new Error(`thieu khoi hoac ${nhanh}`);
			expect(
				k.compareDocumentPosition(than) & Node.DOCUMENT_POSITION_FOLLOWING,
			).toBeTruthy();
			expect(k.parentElement).toBe(than.parentElement);
		});
	}

	test("phong khong o nac bat hay ban bi giu: khong co khoi", async () => {
		tomTatHienTai = () => tomTat({});
		await moBang();
		await cho(
			() => document.getElementById("dang-ban") !== null,
			"bang dang ban",
		);
		await nhip(5);
		expect(goiCua("okr.troLyTomTat").length).toBeGreaterThan(0);
		expect(khoi()).toBeNull();
	});
});

describe("dang soan hoi lai", () => {
	test(`hoi lai moi ${OKR_TOM_TAT.hoiLaiMs} ms, dung sau ${OKR_TOM_TAT.tranChoMs} ms`, async () => {
		jest.useFakeTimers();
		dongHoGia = true;
		tomTatHienTai = () => tomTat({ dangSoan: true });
		await moBang();
		await cho(() => trangThai("ST-tomtat-dang-soan") !== null, "dang soan");
		const luc0 = goiCua("okr.troLyTomTat").length;
		expect(luc0).toBe(1);
		await troi(OKR_TOM_TAT.hoiLaiMs - 250);
		expect(goiCua("okr.troLyTomTat").length).toBe(1);
		await troi(500);
		expect(goiCua("okr.troLyTomTat").length).toBe(2);
		await troi(OKR_TOM_TAT.hoiLaiMs);
		expect(goiCua("okr.troLyTomTat").length).toBe(3);
		await troi(OKR_TOM_TAT.tranChoMs);
		const khiDung = goiCua("okr.troLyTomTat").length;
		expect(khiDung).toBe(1 + OKR_TOM_TAT.tranChoMs / OKR_TOM_TAT.hoiLaiMs);
		await troi(OKR_TOM_TAT.tranChoMs);
		expect(goiCua("okr.troLyTomTat").length).toBe(khiDung);
		expect(chu(trangThai("ST-tomtat-dang-soan"))).toContain(m.quaHanMoTa);
	}, 60_000);

	test("xong soan thi thoi hoi va hien cau", async () => {
		jest.useFakeTimers();
		dongHoGia = true;
		let lan = 0;
		tomTatHienTai = () => {
			lan += 1;
			return lan < 3 ? tomTat({ dangSoan: true }) : ban();
		};
		await moBang();
		await cho(() => trangThai("ST-tomtat-dang-soan") !== null, "dang soan");
		await troi(OKR_TOM_TAT.hoiLaiMs * 2 + 250);
		await cho(() => trangThai("ST-tomtat-co-cau") !== null, "co cau");
		const sau = goiCua("okr.troLyTomTat").length;
		await troi(OKR_TOM_TAT.hoiLaiMs * 3);
		expect(goiCua("okr.troLyTomTat").length).toBe(sau);
	}, 30_000);

	test("roi bang thi so lan hoi ngung tang", async () => {
		jest.useFakeTimers();
		dongHoGia = true;
		tomTatHienTai = () => tomTat({ dangSoan: true });
		const san = await moBang();
		await cho(() => trangThai("ST-tomtat-dang-soan") !== null, "dang soan");
		await troi(OKR_TOM_TAT.hoiLaiMs * 2 + 250);
		const truocKhiRoi = goiCua("okr.troLyTomTat").length;
		expect(truocKhiRoi).toBe(3);
		await act(async () => san.root.unmount());
		dangMo = dangMo.filter((s) => s !== san);
		san.o.remove();
		await troi(OKR_TOM_TAT.hoiLaiMs * 4);
		expect(goiCua("okr.troLyTomTat").length).toBe(truocKhiRoi);
	}, 30_000);
});

describe("kts", () => {
	test("kts-tom-tat-dang-soan: Kara dang tom tat bang chi bao cua Kara", async () => {
		tomTatHienTai = () => tomTat({ dangSoan: true });
		await moBang();
		await cho(() => trangThai("ST-tomtat-dang-soan") !== null, "dang soan");
		const o = trangThai("ST-tomtat-dang-soan");
		if (!o?.querySelector("[data-kara-state=working]"))
			throw new Error("tom-tat: dang soan khong phai chi bao Kara");
		expect(m.dangSoan).toBe("Kara đang tóm tắt tuần này…");
		expect(chu(o)).toContain(m.dangSoan);
	});

	test("kts-tom-tat-loi: Kara chua tai duoc, Thu lai, khong Alert", async () => {
		let hong = true;
		tomTatHienTai = () => {
			if (hong) throw new Error("boom-tom-tat");
			return ban();
		};
		await moBang();
		await cho(() => trangThai("ST-tomtat-loi") !== null, "loi");
		const o = trangThai("ST-tomtat-loi");
		if (o?.querySelector("[data-slot=alert]"))
			throw new Error("tom-tat: loi con Alert");
		if (!o?.querySelector("[data-kara-state=error]"))
			throw new Error("tom-tat: loi khong phai trang thai Kara");
		const tieuDe = chu(o?.querySelector("[data-slot=empty-title]") ?? null);
		if (tieuDe.includes("Kara chưa Kara"))
			throw new Error("tom-tat: tieu de loi lap chu Kara");
		expect(tieuDe).toBe("Kara chưa tải tóm tắt tuần được");
		expect(chu(o)).toContain(m.loiMoTa);
		expect(chu(o)).not.toContain("boom-tom-tat");
		const thuLai = [...(o?.querySelectorAll("button") ?? [])].find(
			(b) => chu(b) === mt.thuLai,
		);
		if (!thuLai) throw new Error("khong co nut Thu lai");
		const truoc = goiCua("okr.troLyTomTat").length;
		hong = false;
		await bam(thuLai);
		await cho(() => trangThai("ST-tomtat-co-cau") !== null, "thu lai xong");
		expect(goiCua("okr.troLyTomTat").length).toBe(truoc + 1);
	});

	test("kts-da-ghi: loi cam on noi dieu gi xay ra", async () => {
		await moCoCau();
		await bam(nutPhanHoi(phanHoi.useful));
		await cho(
			() => goiCua("okr.troLyTomTatPhanHoi").length === 1,
			"goi phan hoi",
		);
		await cho(
			() => chu(khoi()?.querySelector('[role="status"]') ?? null) !== "",
			"cam on",
		);
		const camOn = chu(khoi()?.querySelector('[role="status"]') ?? null);
		if (camOn === "Cảm ơn, đã ghi")
			throw new Error("da-ghi: loi cam on khong noi gi xay ra");
		expect(camOn).toBe(
			"Đã ghi — quản trị viên thấy số phản hồi này ở Toàn cảnh › Sức khoẻ chương trình.",
		);
	});
});
