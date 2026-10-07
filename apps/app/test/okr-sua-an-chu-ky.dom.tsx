import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { viecChuKy } from "@crm/validation/okr-chu-ky";
import {
	QueryClient,
	QueryClientProvider,
	skipToken,
} from "@tanstack/react-query";
import { NuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import type { ChuKyOutput } from "../../api/src/okr/okr.contracts";

type TinhTrang = {
	trong: boolean;
	quyConHien?: number;
	anLuc?: string;
	anLyDo?: string;
};

const ky = (
	id: string,
	kind: ChuKyOutput["kind"],
	name: string,
	phase: ChuKyOutput["phase"],
	parentId: string | null,
	t: TinhTrang,
): ChuKyOutput => ({
	id,
	kind,
	name,
	parentId,
	startsOn: kind === "nam" ? "2026-01-01" : "2026-07-01",
	endsOn: kind === "nam" ? "2026-12-31" : "2026-09-30",
	phase,
	breakStartsOn: null,
	breakEndsOn: null,
	updateWeekday: 1,
	cuaSoRa: null,
	anLuc: t.anLuc ?? null,
	anLyDo: t.anLyDo ?? null,
	quyConHien: t.quyConHien ?? 0,
	viec: viecChuKy({
		phase,
		kind,
		trong: t.trong,
		daAn: t.anLuc !== undefined,
		quyConHien: t.quyConHien ?? 0,
	}),
});

const NAM = ky("nam-26", "nam", "Năm 2026", "dang-chay", null, {
	trong: false,
	quyConHien: 1,
});
const CO_DU_LIEU = ky("q3-26", "quy", "Quý 3/2026", "dang-chay", NAM.id, {
	trong: false,
});
const TRONG_KE_HOACH = ky("nam-27", "nam", "Năm 2027", "lap-ke-hoach", null, {
	trong: true,
});
const TRONG_DANG_CHAY = ky(
	"nam-28",
	"nam",
	"Năm 2028 nhầm",
	"dang-chay",
	null,
	{ trong: true },
);
const DA_DONG = ky("nam-25", "nam", "Năm 2025", "da-dong", null, {
	trong: false,
});
const DA_AN = ky("nam-26-thu", "nam", "Năm 2026 (thử)", "lap-ke-hoach", null, {
	trong: false,
	anLuc: "2026-09-30T03:00:00.000Z",
	anLyDo: "Mở thử trước khi chốt lịch",
});

const SAU_KHI_CO_DU_LIEU = ky(
	TRONG_KE_HOACH.id,
	"nam",
	TRONG_KE_HOACH.name,
	"lap-ke-hoach",
	null,
	{ trong: false },
);

let dsKy: ChuKyOutput[];
let kyHienTai: string | null;
let nemLoi: Map<string, string>;
let sauGoi: Map<string, () => void>;

type Json =
	| string
	| number
	| boolean
	| null
	| readonly Json[]
	| { readonly [khoa: string]: Json | undefined };
type DauVao = { readonly [khoa: string]: Json | undefined } | undefined;
let daGoi: { duong: string; dauVao: DauVao }[] = [];
let daLamMoi = 0;
let daToast: [string, string][] = [];
let toastKhongDich: (string | null)[] = [];
let khach: QueryClient | null = null;

function thuTuc<TRa>(duong: string, doc: () => TRa = () => null as TRa) {
	return {
		queryKey: () => [duong],
		pathKey: () => [duong],
		queryOptions: () => ({
			queryKey: [duong],
			queryFn: async () => doc(),
		}),
		mutationOptions: (chon?: {
			onSuccess?: (kq: { id: string }, vao: DauVao) => void;
			onError?: (e: Error) => void;
		}) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async (vao: DauVao) => {
				daGoi.push({ duong, dauVao: vao });
				const loi = nemLoi.get(duong);
				if (loi) throw new Error(loi);
				sauGoi.get(duong)?.();
				return { id: "ok" };
			},
		}),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		okr: {
			cycles: thuTuc("okr.cycles", () => ({
				cycles: dsKy,
				currentId: kyHienTai,
			})),
			program: thuTuc("okr.program", () => ({ canManage: true })),
			createCycle: thuTuc("okr.createCycle"),
			setCyclePhase: thuTuc("okr.setCyclePhase"),
			moRa: thuTuc("okr.moRa"),
			dongRa: thuTuc("okr.dongRa"),
			moLaiKy: thuTuc("okr.moLaiKy"),
			bangCham: thuTuc("okr.bangCham", () => ({
				thang: "0-1",
				conLai: 0,
				chuaCham: [],
				hocTapChuaGhi: [],
				mucTieu: [],
			})),
			suaChuKy: thuTuc("okr.suaChuKy"),
			goChuKy: thuTuc("okr.goChuKy"),
			anChuKy: thuTuc("okr.anChuKy"),
			hienChuKy: thuTuc("okr.hienChuKy"),
			access: thuTuc("okr.access", () => ({
				canManageProgram: true,
				headOf: { divisions: [], departments: [] },
			})),
			toanCanh: {
				queryOptions: (vao: { cycleId: string } | typeof skipToken) =>
					vao === skipToken
						? { queryKey: ["okr.toanCanh", "bo-qua"], queryFn: skipToken }
						: {
								queryKey: ["okr.toanCanh"],
								queryFn: () => new Promise<never>(() => {}),
							},
			},
		},
	}),
}));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({
		okr: async () => {
			daLamMoi += 1;
			await khach?.invalidateQueries();
		},
	}),
}));

function ghiToast(loai: string, chu: ReactNode): void {
	const o = document.createElement("div");
	o.innerHTML = renderToStaticMarkup(chu);
	daToast.push([loai, o.textContent ?? ""]);
	toastKhongDich.push(o.querySelector('[translate="no"]')?.textContent ?? null);
}

mock.module("sonner", () => ({
	toast: Object.assign(() => undefined, {
		error: (chu: ReactNode) => ghiToast("loi", chu),
		success: (chu: ReactNode) => ghiToast("xong", chu),
	}),
}));

mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => children,
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws/settings/okr",
}));

const { BangChuKy } = await import(
	"@/app/(app)/[slug]/settings/okr/bang-chu-ky"
);
const { ChonChuKy } = await import("@/app/(app)/[slug]/okr/chon-chu-ky");
const { ToanCanh } = await import("@/app/(app)/[slug]/okr/toan-canh/toan-canh");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { okrMessages } = await import("@/lib/messages/okr");
const { goiYChuKy } = await import("@/lib/okr-chu-ky-nhan");

const m = okrMessages("vi").caiDat;

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];
let url: string[] = [];

async function mo(thamSo = ""): Promise<void> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	khach = client;
	await act(async () => {
		root.render(
			<NuqsTestingAdapter
				hasMemory
				searchParams={thamSo}
				onUrlUpdate={(e: UrlUpdateEvent) => url.push(e.queryString)}
			>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>
							<ChonChuKy />
							<BangChuKy goiY={goiYChuKy("2026-09-30")} homNay="2026-09-30" />
						</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	dangMo.push({ o, root });
	await cho(
		() => document.body.querySelector("[data-chu-ky]") !== null,
		"bang tai xong",
	);
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 80; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(
		`khong toi: ${moTa} — ${document.body.textContent?.slice(0, 500)}`,
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
}

async function go(o: Element | null, chu: string): Promise<void> {
	if (!(o instanceof HTMLInputElement || o instanceof HTMLTextAreaElement))
		throw new Error("khong phai o nhap");
	const dat = Object.getOwnPropertyDescriptor(
		o instanceof HTMLInputElement
			? HTMLInputElement.prototype
			: HTMLTextAreaElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		dat?.call(o, chu);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

const q = (chon: string) => document.body.querySelector(chon);
const tatCa = (chon: string) => [...document.body.querySelectorAll(chon)];
const tat = (o: Element | null) =>
	o instanceof HTMLButtonElement ||
	o instanceof HTMLInputElement ||
	o instanceof HTMLTextAreaElement
		? o.disabled
		: null;

async function dongMenu(): Promise<void> {
	await act(async () => {
		document.dispatchEvent(
			new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
		);
	});
	await cho(() => q('[role="menuitem"]') === null, "menu dong");
}

async function moMenu(id: string): Promise<string[]> {
	const menu = q(`[data-menu-chu-ky="${id}"]`);
	if (!menu) throw new Error(`khong co menu ${id}`);
	await bam(menu);
	await cho(() => q('[role="menuitem"]') !== null, `menu ${id} mo`);
	return tatCa("[data-viec-chu-ky]").map((o) =>
		o.hasAttribute("data-disabled")
			? `${o.getAttribute("data-viec-chu-ky")}[disabled]`
			: (o.getAttribute("data-viec-chu-ky") ?? ""),
	);
}

async function chonMuc(viec: string): Promise<void> {
	const muc = q(`[data-viec-chu-ky="${viec}"]`);
	if (!muc) throw new Error(`khong co muc ${viec}`);
	await bam(muc);
}

function oTrongForm(chon: string): [string, boolean | null][] {
	return tatCa(
		`${chon} form input, ${chon} form textarea, ${chon} form button`,
	).map((o) => [o.getAttribute("id")?.split("-").at(-1) ?? o.tagName, tat(o)]);
}

beforeEach(() => {
	dsKy = [NAM, CO_DU_LIEU, TRONG_KE_HOACH, TRONG_DANG_CHAY, DA_DONG, DA_AN];
	kyHienTai = NAM.id;
	nemLoi = new Map();
	sauGoi = new Map();
	daGoi = [];
	daLamMoi = 0;
	daToast = [];
	toastKhongDich = [];
	url = [];
});

afterEach(async () => {
	for (const san of dangMo) {
		await act(async () => san.root.unmount());
		san.o.remove();
	}
	dangMo = [];
	khach = null;
	document.body.innerHTML = "";
});

describe("menu-theo-viec", () => {
	test("menu-theo-viec: moi hang co dung tap viec viet truoc, hang da an o cuoi mang nhan Da an", async () => {
		await mo();
		const theoHang: [string, string[]][] = [];
		for (const c of [
			TRONG_KE_HOACH,
			TRONG_DANG_CHAY,
			CO_DU_LIEU,
			NAM,
			DA_DONG,
			DA_AN,
		]) {
			theoHang.push([c.id, await moMenu(c.id)]);
			if (c.id === NAM.id)
				theoHang.push([
					"nam-an-khoa",
					[q('[data-viec-chu-ky="an"]')?.textContent ?? ""],
				]);
			await dongMenu();
		}
		const hang = tatCa("[data-chu-ky]");
		expect({
			theoHang,
			thuTu: hang.map((o) => o.getAttribute("data-chu-ky")),
			cuoi: hang.at(-1)?.textContent?.includes(m.chuKy.daAn),
			dongAn: q(`[data-dong-an="${DA_AN.id}"]`)?.textContent,
		}).toEqual({
			theoHang: [
				[TRONG_KE_HOACH.id, ["sua", "go", "chay"]],
				[TRONG_DANG_CHAY.id, ["sua", "go", "mo-ra", "sang-cham"]],
				[CO_DU_LIEU.id, ["sua", "an", "mo-ra", "sang-cham"]],
				[NAM.id, ["sua", "an[disabled]", "mo-ra", "sang-cham"]],
				[
					"nam-an-khoa",
					[`${m.chuKy.viec.an}Còn 1 quý đang hiện — ẩn hoặc gỡ quý trước`],
				],
				[DA_DONG.id, ["an", "mo-lai"]],
				[DA_AN.id, ["hien-lai"]],
			],
			thuTu: [
				NAM.id,
				CO_DU_LIEU.id,
				TRONG_KE_HOACH.id,
				TRONG_DANG_CHAY.id,
				DA_DONG.id,
				DA_AN.id,
			],
			cuoi: true,
			dongAn: `Ẩn 30 thg 9, 2026 lúc pha ${m.pha["lap-ke-hoach"]} · Mở thử trước khi chốt lịch`,
		});
	});
});

describe("sheet-sua", () => {
	test("sheet-sua: chu ky trong lap ke hoach sua duoc moi o, Luu bat khi doi, gui dung khuon", async () => {
		await mo();
		await moMenu(TRONG_KE_HOACH.id);
		await chonMuc("sua");
		const sheet = `[data-sheet-sua-chu-ky="${TRONG_KE_HOACH.id}"]`;
		await cho(() => q(sheet) !== null, "sheet sua mo");
		const luu = () => tat(q('[data-nut="luu-chu-ky"]'));
		const truoc = luu();
		await go(q(`${sheet} [data-o-ten]`), "Năm 2027 đúng");
		expect({
			url: url.at(-1),
			o: oTrongForm(sheet),
			thu: tat(q(`${sheet} [role="combobox"]`)),
			moTaKhoa: q(`${sheet} [data-mo-ta-khoa]`),
			truoc,
			sau: luu(),
			huy: q(`${sheet} [data-slot="sheet-footer"] [data-slot="sheet-close"]`)
				?.textContent,
		}).toEqual({
			url: `?suaChuKy=${TRONG_KE_HOACH.id}`,
			o: [
				["loai", true],
				["ten", false],
				["dau", false],
				["cuoi", false],
				["tu", false],
				["den", false],
				["thu", false],
			],
			thu: false,
			moTaKhoa: null,
			truoc: true,
			sau: false,
			huy: m.mo.huy,
		});
		const nut = q('[data-nut="luu-chu-ky"]');
		if (!nut) throw new Error("khong co nut Luu");
		await bam(nut);
		await cho(() => daLamMoi > 0, "lam moi sau sua");
		expect({ daGoi, daToast }).toEqual({
			daGoi: [
				{
					duong: "okr.suaChuKy",
					dauVao: {
						id: TRONG_KE_HOACH.id,
						name: "Năm 2027 đúng",
						startsOn: "2026-01-01",
						endsOn: "2026-12-31",
						breakStartsOn: null,
						breakEndsOn: null,
						updateWeekday: 1,
					},
				},
			],
			daToast: [["xong", m.sua.xong("Năm 2027 đúng")]],
		});
	});

	for (const [ten, c, moTa] of [
		["trong-dang-chay", TRONG_DANG_CHAY, m.sua.khoaRoiKeHoach],
		["co-du-lieu", CO_DU_LIEU, m.sua.khoaCoDuLieu],
	] as const) {
		test(`sheet-sua: ${ten} chi bat o ten, co dong giai thich`, async () => {
			await mo();
			await moMenu(c.id);
			await chonMuc("sua");
			const sheet = `[data-sheet-sua-chu-ky="${c.id}"]`;
			await cho(() => q(sheet) !== null, "sheet sua mo");
			const batDuoc = oTrongForm(sheet).filter(([, t]) => t === false);
			expect({
				batDuoc,
				thu: tat(q(`${sheet} [role="combobox"]`)),
				moTaKhoa: q(`${sheet} [data-mo-ta-khoa]`)?.textContent,
				namCha: (q(`${sheet} input[id$="-nam"]`) as HTMLInputElement | null)
					?.value,
			}).toEqual({
				batDuoc: [["ten", false]],
				thu: true,
				moTaKhoa: moTa,
				namCha: c.parentId === NAM.id ? NAM.name : undefined,
			});
		});
	}

	test("sua-loi-thanh-chi-ten: may chu tu choi vi ky vua co du lieu, sheet khoa o ngay ve gia tri da luu, Luu gui ten moi voi ngay cu", async () => {
		const CAU = "Năm 2027 vừa có mục tiêu — chỉ sửa được tên.";
		await mo();
		await moMenu(TRONG_KE_HOACH.id);
		await chonMuc("sua");
		const sheet = `[data-sheet-sua-chu-ky="${TRONG_KE_HOACH.id}"]`;
		await cho(() => q(sheet) !== null, "sheet sua mo");
		await go(q(`${sheet} [data-o-ten]`), "Năm 2027 đúng");
		const thu = q(`${sheet} [role="combobox"]`);
		if (!thu) throw new Error("khong co o thu");
		await bam(thu);
		await cho(() => tatCa('[role="option"]').length > 0, "select thu mo");
		const thuTu = tatCa('[role="option"]').find(
			(o) => o.textContent === m.mo.thu[2],
		);
		if (!thuTu) throw new Error("khong co Thu Tu");
		await act(async () => {
			thuTu.dispatchEvent(
				new KeyboardEvent("keydown", {
					key: "Enter",
					bubbles: true,
					cancelable: true,
				}),
			);
		});
		await cho(() => tatCa('[role="option"]').length === 0, "select dong");

		nemLoi.set("okr.suaChuKy", CAU);
		dsKy = dsKy.map((c) =>
			c.id === TRONG_KE_HOACH.id ? SAU_KHI_CO_DU_LIEU : c,
		);
		const luu = () => q('[data-nut="luu-chu-ky"]');
		const nut = luu();
		if (!nut) throw new Error("khong co nut Luu");
		await bam(nut);
		await cho(() => daLamMoi > 0, "lam moi sau tu choi");
		await cho(
			() => tat(q(`${sheet} [role="combobox"]`)) === true,
			"o thu khoa sau lam moi",
		);
		const sauLoi = {
			ten: (q(`${sheet} [data-o-ten]`) as HTMLInputElement | null)?.value,
			thu: q(`${sheet} [role="combobox"]`)?.textContent,
			luu: tat(luu()),
			moTaKhoa: q(`${sheet} [data-mo-ta-khoa]`)?.textContent,
		};

		nemLoi.delete("okr.suaChuKy");
		const lai = luu();
		if (!lai) throw new Error("khong co nut Luu");
		await bam(lai);
		await cho(() => daGoi.length === 2, "gui lan hai");
		expect({ sauLoi, daGoi, daToast }).toEqual({
			sauLoi: {
				ten: "Năm 2027 đúng",
				thu: m.mo.thu[0],
				luu: false,
				moTaKhoa: m.sua.khoaCoDuLieu,
			},
			daGoi: [
				{
					duong: "okr.suaChuKy",
					dauVao: {
						id: TRONG_KE_HOACH.id,
						name: "Năm 2027 đúng",
						startsOn: "2026-01-01",
						endsOn: "2026-12-31",
						breakStartsOn: null,
						breakEndsOn: null,
						updateWeekday: 3,
					},
				},
				{
					duong: "okr.suaChuKy",
					dauVao: {
						id: TRONG_KE_HOACH.id,
						name: "Năm 2027 đúng",
						startsOn: "2026-01-01",
						endsOn: "2026-12-31",
						breakStartsOn: null,
						breakEndsOn: null,
						updateWeekday: 1,
					},
				},
			],
			daToast: [
				["loi", CAU],
				["xong", m.sua.xong("Năm 2027 đúng")],
			],
		});
	});
});

describe("hop-an", () => {
	test("hop-an: ly do 9 ky tu thi tat, 10 thi bat, Huy boc DialogClose, gui dung ly do", async () => {
		await mo();
		await moMenu(CO_DU_LIEU.id);
		await chonMuc("an");
		await cho(() => q("[data-o-ly-do-an]") !== null, "hop an");
		const nut = () => tat(q('[data-nut="an-chu-ky"]'));
		const ra: [string, boolean | null][] = [["trong", nut()]];
		await go(q("[data-o-ly-do-an]"), "123456789");
		ra.push(["9", nut()]);
		await go(q("[data-o-ly-do-an]"), "1234567890");
		ra.push(["10", nut()]);
		expect({
			ra,
			khongDich: q("[data-o-ly-do-an]")?.getAttribute("translate"),
			huy: q(
				`[data-hop-an-chu-ky] [data-slot="dialog-footer"] [data-slot="dialog-close"]`,
			)?.textContent,
		}).toEqual({
			ra: [
				["trong", true],
				["9", true],
				["10", false],
			],
			khongDich: "no",
			huy: m.chuKy.an.huy,
		});
		await go(q("[data-o-ly-do-an]"), "Tạo nhầm quý, số liệu đã sang quý đúng");
		const gui = q('[data-nut="an-chu-ky"]');
		if (!gui) throw new Error("khong co nut An");
		await bam(gui);
		await cho(() => daLamMoi > 0, "lam moi sau an");
		expect(daGoi).toEqual([
			{
				duong: "okr.anChuKy",
				dauVao: {
					id: CO_DU_LIEU.id,
					lyDo: "Tạo nhầm quý, số liệu đã sang quý đúng",
				},
			},
		]);
	});
});

describe("mo-chu-ky-bo-nam-an", () => {
	test("mo-chu-ky-bo-nam-an: o Thuoc nam cua sheet Mo chu ky khong co nam da an", async () => {
		await mo("?moChuKy=true");
		await cho(() => q("[data-sheet-mo-chu-ky]") !== null, "sheet mo");
		const loai = q("[data-sheet-mo-chu-ky] [role='combobox']");
		if (!loai) throw new Error("khong co o loai");
		await bam(loai);
		await cho(() => tatCa('[role="option"]').length > 0, "select loai mo");
		const quy = tatCa('[role="option"]').find(
			(o) => o.textContent === okrMessages("vi").loaiChuKy.quy,
		);
		if (!quy) throw new Error("khong co lua chon quy");
		await act(async () => {
			quy.dispatchEvent(
				new KeyboardEvent("keydown", {
					key: "Enter",
					bubbles: true,
					cancelable: true,
				}),
			);
		});
		await cho(() => q("[data-o-nam-cha]") !== null, "o nam cha");
		await cho(() => tatCa('[role="option"]').length === 0, "select dong");
		const namCha = q("[data-o-nam-cha]");
		if (!namCha) throw new Error("khong co o nam cha");
		await bam(namCha);
		await cho(() => tatCa('[role="option"]').length > 0, "select nam mo");
		expect(tatCa('[role="option"]').map((o) => o.textContent)).toEqual([
			NAM.name,
			TRONG_KE_HOACH.name,
			TRONG_DANG_CHAY.name,
			DA_DONG.name,
		]);
	});
});

describe("go-bi-tu-choi", () => {
	test("go-bi-tu-choi: may chu tu choi go thi toast cau ghim va bang lam moi mat muc Go", async () => {
		const CAU =
			"Năm 2027 vừa có mục tiêu — không gỡ được. Ẩn chu kỳ thay vì gỡ.";
		nemLoi.set("okr.goChuKy", CAU);
		await mo();
		await moMenu(TRONG_KE_HOACH.id);
		await chonMuc("go");
		await cho(() => q('[role="alertdialog"]') !== null, "hoi go");
		const hop = q('[role="alertdialog"]');
		const xacNhan = [...(hop?.querySelectorAll("button") ?? [])].find(
			(b) => b.textContent === m.chuKy.go.nut,
		);
		if (!xacNhan) throw new Error("khong co nut Go");
		const tone = xacNhan.getAttribute("data-variant");
		dsKy = dsKy.map((c) =>
			c.id === TRONG_KE_HOACH.id ? SAU_KHI_CO_DU_LIEU : c,
		);
		await bam(xacNhan);
		await cho(() => daLamMoi > 0, "lam moi sau tu choi");
		await cho(() => q('[role="alertdialog"]') === null, "hop dong");
		const sau = await moMenu(TRONG_KE_HOACH.id);
		expect({ tone, daGoi, daToast, sau }).toEqual({
			tone: "destructive",
			daGoi: [{ duong: "okr.goChuKy", dauVao: { id: TRONG_KE_HOACH.id } }],
			daToast: [["loi", CAU]],
			sau: ["sua", "an", "chay"],
		});
	});
});

describe("sau-go-ky-mac-dinh", () => {
	test("sau-go-ky-mac-dinh: go chinh ky mac dinh thi bang mat hang, o chon ky roi ve ky mac dinh moi", async () => {
		kyHienTai = TRONG_DANG_CHAY.id;
		sauGoi.set("okr.goChuKy", () => {
			dsKy = dsKy.filter((c) => c.id !== TRONG_DANG_CHAY.id);
			kyHienTai = NAM.id;
		});
		await mo(`?kyOkr=${TRONG_DANG_CHAY.id}`);
		await cho(() => q("[data-chon-chu-ky]") !== null, "o chon ky");
		const truoc = q("[data-chon-chu-ky]")?.textContent;
		await moMenu(TRONG_DANG_CHAY.id);
		await chonMuc("go");
		await cho(() => q('[role="alertdialog"]') !== null, "hoi go");
		const xacNhan = [
			...(q('[role="alertdialog"]')?.querySelectorAll("button") ?? []),
		].find((b) => b.textContent === m.chuKy.go.nut);
		if (!xacNhan) throw new Error("khong co nut Go");
		await bam(xacNhan);
		await cho(
			() => q(`[data-chu-ky="${TRONG_DANG_CHAY.id}"]`) === null,
			"hang da go bien mat",
		);
		expect({
			truoc,
			sau: q("[data-chon-chu-ky]")?.textContent,
			hang: tatCa("[data-chu-ky]").length,
			daToast,
		}).toEqual({
			truoc: TRONG_DANG_CHAY.name,
			sau: NAM.name,
			hang: 5,
			daToast: [["xong", m.chuKy.go.xong(TRONG_DANG_CHAY.name)]],
		});
	});

	test("sau-go-ky-mac-dinh: o chon ky khong liet chu ky da an", async () => {
		await mo();
		await cho(() => q("[data-chon-chu-ky]") !== null, "o chon ky");
		const chon = q("[data-chon-chu-ky]");
		if (!chon) throw new Error("khong co o chon ky");
		await bam(chon);
		await cho(() => tatCa('[role="option"]').length > 0, "o chon mo");
		const ten = tatCa('[role="option"]').map((o) => o.textContent ?? "");
		expect(ten.some((t) => t.includes(DA_AN.name))).toBe(false);
		expect(ten.length).toBe(5);
	});
});

describe("ten-khong-dich", () => {
	test("ten-khong-dich: ten chu ky trong tieu de, mo ta va toast cua sheet Sua va hop An mang translate=no", async () => {
		await mo();
		await moMenu(TRONG_KE_HOACH.id);
		await chonMuc("sua");
		const sheet = `[data-sheet-sua-chu-ky="${TRONG_KE_HOACH.id}"]`;
		await cho(() => q(sheet) !== null, "sheet sua mo");
		const khongDich = (chon: string) =>
			q(`${chon} [translate="no"]`)?.textContent ?? null;
		const sua = {
			tieuDe: khongDich(`${sheet} [data-slot="sheet-title"]`),
			moTa: khongDich(`${sheet} [data-slot="sheet-description"]`),
			chuTieuDe: q(`${sheet} [data-slot="sheet-title"]`)?.textContent,
		};
		await go(q(`${sheet} [data-o-ten]`), "Năm 2027 đúng");
		const luu = q('[data-nut="luu-chu-ky"]');
		if (!luu) throw new Error("khong co nut Luu");
		await bam(luu);
		await cho(() => daToast.length > 0, "toast sua");
		await cho(() => q(sheet) === null, "sheet sua dong");

		await moMenu(CO_DU_LIEU.id);
		await chonMuc("an");
		const hop = "[data-hop-an-chu-ky]";
		await cho(() => q(hop) !== null, "hop an");
		const an = {
			tieuDe: khongDich(`${hop} [data-slot="dialog-title"]`),
			chuTieuDe: q(`${hop} [data-slot="dialog-title"]`)?.textContent,
		};
		await go(q("[data-o-ly-do-an]"), "Tạo nhầm quý, số liệu đã sang quý đúng");
		const gui = q('[data-nut="an-chu-ky"]');
		if (!gui) throw new Error("khong co nut An");
		await bam(gui);
		await cho(() => daToast.length > 1, "toast an");
		expect({ sua, an, daToast, toastKhongDich }).toEqual({
			sua: {
				tieuDe: TRONG_KE_HOACH.name,
				moTa: TRONG_KE_HOACH.name,
				chuTieuDe: m.sua.tieuDe(TRONG_KE_HOACH.name),
			},
			an: {
				tieuDe: CO_DU_LIEU.name,
				chuTieuDe: m.chuKy.an.tieuDe(CO_DU_LIEU.name),
			},
			daToast: [
				["xong", m.sua.xong("Năm 2027 đúng")],
				["xong", m.chuKy.an.xong(CO_DU_LIEU.name)],
			],
			toastKhongDich: ["Năm 2027 đúng", CO_DU_LIEU.name],
		});
	});
});

describe("toan-canh-moi-ky-an", () => {
	test("toan-canh-moi-ky-an: moi chu ky deu da an thi Toan canh noi chua co chu ky, khong xoay mai", async () => {
		dsKy = [DA_AN];
		kyHienTai = null;
		const o = document.createElement("div");
		document.body.appendChild(o);
		const root = createRoot(o);
		const client = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		await act(async () => {
			root.render(
				<NuqsTestingAdapter hasMemory searchParams="">
					<QueryClientProvider client={client}>
						<LocaleProvider locale="vi">
							<TooltipProvider>
								<ToanCanh />
							</TooltipProvider>
						</LocaleProvider>
					</QueryClientProvider>
				</NuqsTestingAdapter>,
			);
		});
		dangMo.push({ o, root });
		await cho(
			() => q('[data-trang-thai="ST-donvi-chuakychay"]') !== null,
			"toan canh noi chua co chu ky",
		);
		expect({
			chuaKy: q('[data-trang-thai="ST-donvi-chuakychay"]') !== null,
			dangTai: q('[data-trang-thai="ST-donvi-dangtai"]') !== null,
		}).toEqual({ chuaKy: true, dangTai: false });
	});
});
