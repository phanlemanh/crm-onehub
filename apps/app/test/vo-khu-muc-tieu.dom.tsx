import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing";
import {
	act,
	cloneElement,
	isValidElement,
	type ReactElement,
	type ReactNode,
	Suspense,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import { cyclesOutput, okrAccessOutput } from "../../api/src/okr/okr.contracts";
import { hoiYNhanOutput } from "../../api/src/okr/okr-hoi-y.contracts";
import { danhSachOutput } from "../../api/src/okr/okr-xem.contracts";
import { orgTreeOutput } from "../../api/src/to-chuc/to-chuc.contracts";
import { cho, dat, datLai, dinhVi, nhip } from "./khung-soan-okr";

mock.module("@/lib/locale/server", () => ({ getLocale: async () => "vi" }));
mock.module("@/lib/session", () => ({ requireSession: async () => null }));
mock.module("@/lib/trpc/hydrate", () => ({
	HydrateClient: ({ children }: { children: ReactNode }) => children,
}));
mock.module("server-only", () => ({}));
const thuTucMayChu = new Proxy(
	{},
	{ get: () => new Proxy({}, { get: () => ({ queryOptions: () => ({}) }) }) },
);
mock.module("@/lib/trpc/server", () => ({
	getServerTrpc: () => thuTucMayChu,
	getServerQueryClient: () => ({
		fetchQuery: async () => {
			throw new Error("may chu gia khong tra du lieu");
		},
		prefetchQuery: async () => {},
	}),
	getServerTrpcClient: () => ({}),
}));

const { ThanhBenMucTieu } = await import(
	"@/app/(app)/[slug]/okr/thanh-ben-muc-tieu"
);
const { HanhDongKhu } = await import("@/app/(app)/[slug]/okr/hanh-dong-khu");
const { DauTrangOkrTrang } = await import(
	"@/app/(app)/[slug]/okr/dau-trang-okr"
);
const { TheoDonVi } = await import(
	"@/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi"
);
const { donDich } = await import("@/app/(app)/[slug]/okr/don-dich");
const { TAB } = await import("@/app/(app)/[slug]/okr/tab-okr");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { okrVoKhuMessages } = await import("@/lib/messages/okr-vo-khu");
const { khungUngDungMessages } = await import("@/lib/messages/khung-ung-dung");

const t = okrVoKhuMessages("vi");

const kyMau = (
	id: string,
	kind: "quy" | "nam",
	name: string,
	phase: "dang-chay" | "lap-ke-hoach" | "da-dong",
	startsOn: string,
) => ({
	id,
	kind,
	name,
	parentId: null,
	startsOn,
	endsOn: startsOn.replace(/-\d\d-01$/, "-12-31"),
	phase,
	breakStartsOn: null,
	breakEndsOn: null,
	updateWeekday: 1,
	cuaSoRa: null,
	anLuc: null,
	anLyDo: null,
	quyConHien: 0,
	viec: { suaMoiO: false, suaTen: false, go: false, an: false, hienLai: false },
});

const CHU_KY = cyclesOutput.parse({
	cycles: [
		kyMau("q4", "quy", "Quý 4/2026", "dang-chay", "2026-10-01"),
		kyMau("c2", "quy", "Quý 3/2026", "da-dong", "2026-07-01"),
		kyMau("c3", "nam", "Năm 2027", "lap-ke-hoach", "2027-01-01"),
	],
	currentId: "q4",
});

const CAY = orgTreeOutput.parse({
	divisions: [],
	chuaXep: [],
	chuaCoPhongBan: [],
	people: [],
	archived: { divisions: [], departments: [] },
	coverage: { members: 0, withPrimary: 0, departmentsWithoutHead: 0 },
});

function datNen({
	quanTri = false,
	soYKien = 0,
}: {
	quanTri?: boolean;
	soYKien?: number;
} = {}) {
	dat("okr.cycles", () => CHU_KY);
	dat("okr.access", () =>
		okrAccessOutput.parse({
			canManageProgram: quanTri,
			headOf: { divisions: [], departments: [] },
		}),
	);
	dat("okr.hoiYNhan", () =>
		hoiYNhanOutput.parse({
			coHoiY: soYKien > 0,
			trangThai: null,
			canGop: false,
			soChuDeChuaKetLuan: soYKien,
		}),
	);
	dat("org.tree", () => CAY);
	dat("workspace.get", () => ({ name: "OneHub" }));
	dat("okr.countByUnit", () => ({}));
	dat("okr.danhSach", () =>
		danhSachOutput.parse({
			rows: [],
			daBo: [],
			total: 0,
			facetCounts: {
				phuTrach: [],
				loai: [],
				trangThai: [],
				tuTin: [],
				gopY: [],
			},
			canEdit: true,
			canCreate: true,
		}),
	);
}

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];
let urlGhi: string[] = [];

beforeEach(() => {
	datLai();
	urlGhi = [];
});

afterEach(async () => {
	for (const s of dangMo) {
		await act(async () => s.root.unmount());
		s.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

async function dung(
	man: ReactElement,
	duongDayDu: string,
): Promise<HTMLElement> {
	const [duong = "", tham = ""] = duongDayDu.split("?");
	dinhVi.duong = duong;
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
				onUrlUpdate={(e: UrlUpdateEvent) => urlGhi.push(e.queryString)}
				searchParams={tham ? `?${tham}` : ""}
			>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	dangMo.push({ o, root });
	await nhip(10);
	return o;
}

const q = (chon: string, goc: ParentNode = document) =>
	goc.querySelector<HTMLElement>(chon);
const qa = (chon: string, goc: ParentNode = document) => [
	...goc.querySelectorAll<HTMLElement>(chon),
];
const aside = () => q("aside[data-slot=area-sidebar]");

function mucTrenAside(): HTMLElement[] {
	return qa("nav [data-slot=nav-item]", aside() ?? document);
}

const MA_TRAN_SANG: [string, string][] = [
	["/ws/okr", "/ws/okr"],
	["/ws/okr/bo-okr", "/ws/okr/bo-okr"],
	["/ws/okr/bo-okr?donOkr=pb:x", "/ws/okr/bo-okr"],
	["/ws/okr/lay-y-kien", "/ws/okr/lay-y-kien"],
	["/ws/okr/suc-khoe", "/ws/okr/suc-khoe"],
	["/ws/okr/so-do", "/ws/okr/so-do"],
	["/ws/okr/so-do/muc-tieu/m1", "/ws/okr/so-do"],
];

const HREF_MUC = [
	"/ws/okr",
	"/ws/okr/bo-okr",
	"/ws/okr/lay-y-kien",
	"/ws/okr/suc-khoe",
	"/ws/okr/so-do",
];

async function don() {
	for (const s of dangMo) await act(async () => s.root.unmount());
	dangMo = [];
	document.body.innerHTML = "";
}

describe("vkm-thanh-ben", () => {
	test("vkm-thanh-ben: nhan, ba nhom, nam muc va dung mot muc sang o 7 duong", async () => {
		const ket: string[] = [];
		for (const [duong, mong] of MA_TRAN_SANG) {
			datNen();
			await dung(<ThanhBenMucTieu />, duong);
			await cho(() => aside() !== null, `thanh ben ${duong}`);
			const nav = q("nav", aside() ?? document);
			if (
				nav?.getAttribute("aria-label") !== khungUngDungMessages("vi").rail.okr
			)
				throw new Error(
					`vkm-thanh-ben: nav aria-label «${nav?.getAttribute("aria-label")}»`,
				);
			const nhom = qa("[data-slot=nav-group]", aside() ?? document).map(
				(g) => q("[data-slot=nav-group-label]", g)?.textContent ?? null,
			);
			if (
				JSON.stringify(nhom) !==
				JSON.stringify([null, t.nhom.okr, t.nhom.baoCao])
			)
				throw new Error(`vkm-thanh-ben: nhan nhom ${JSON.stringify(nhom)}`);
			const muc = mucTrenAside();
			const href = muc.map((a) => a.getAttribute("href"));
			if (JSON.stringify(href) !== JSON.stringify(HREF_MUC))
				throw new Error(`vkm-thanh-ben: href muc ${JSON.stringify(href)}`);
			const nhanMuc = muc.map((a) => a.textContent);
			const mongNhan = [
				t.muc.cuaToi,
				t.muc.boOkr,
				t.muc.layYKien,
				t.muc.sucKhoe,
				t.muc.soDo,
			];
			if (JSON.stringify(nhanMuc) !== JSON.stringify(mongNhan))
				throw new Error(`vkm-thanh-ben: nhan muc ${JSON.stringify(nhanMuc)}`);
			const sang = muc.filter((a) => a.getAttribute("aria-current") === "page");
			if (sang.length === 0)
				throw new Error(`vkm-thanh-ben: ${duong} khong muc nao sang`);
			if (sang.length > 1)
				throw new Error(`vkm-thanh-ben: ${duong} ${sang.length} muc cung sang`);
			if (sang[0]?.getAttribute("href") !== mong)
				throw new Error(
					`vkm-thanh-ben: ${duong} sang «${sang[0]?.getAttribute("href")}», mong «${mong}»`,
				);
			ket.push(`${duong} → ${mong}`);
			await don();
		}
		expect(ket).toHaveLength(7);
	});

	test("vkm-thanh-ben: so y kien can gop tren muc Lay y kien, khong so khi bang 0", async () => {
		const layYKien = () =>
			mucTrenAside().find(
				(a) => a.getAttribute("href") === "/ws/okr/lay-y-kien",
			);
		datNen({ soYKien: 3 });
		await dung(<ThanhBenMucTieu />, "/ws/okr");
		await cho(
			() => q("[data-slot=badge]", layYKien() ?? document) !== null,
			"so y kien",
		);
		const coSo = layYKien()?.textContent ?? "";
		await don();
		datNen({ soYKien: 0 });
		await dung(<ThanhBenMucTieu />, "/ws/okr");
		await cho(() => layYKien() !== undefined, "muc lay y kien");
		await nhip(10);
		const khongSo = layYKien()?.textContent ?? "";
		if (!coSo.includes("3"))
			throw new Error(`vkm-thanh-ben: so y kien 3 vang «${coSo}»`);
		if (/\d/.test(khongSo))
			throw new Error(`vkm-thanh-ben: so y kien 0 van hien «${khongSo}»`);
		expect([coSo, khongSo]).toEqual([`${t.muc.layYKien}3`, t.muc.layYKien]);
	});

	test("vkm-thanh-ben: chan Chuong trinh OKR chi cho nguoi quan ly chuong trinh", async () => {
		datNen({ quanTri: true });
		await dung(<ThanhBenMucTieu />, "/ws/okr");
		await cho(
			() => q("[data-slot=area-sidebar-footer]") !== null,
			"chan thanh ben quan tri",
		);
		const quanTri = q(
			'[data-slot=area-sidebar-footer] a[href="/ws/settings/okr"]',
		)?.textContent;
		await don();
		datNen({ quanTri: false });
		await dung(<ThanhBenMucTieu />, "/ws/okr");
		await cho(() => aside() !== null, "thanh ben vai thuong");
		await nhip(10);
		if (q("[data-slot=area-sidebar-footer]") !== null)
			throw new Error("vkm-thanh-ben: vai thuong thay Chuong trinh OKR");
		expect(quanTri).toBe(t.chuongTrinh);
	});
});

function hrefMuc(): string[] {
	return mucTrenAside().map((a) => a.getAttribute("href") ?? "");
}

async function chonKy(ten: string) {
	const o = q("[data-slot=area-sidebar] [data-chon-chu-ky]");
	if (!o) throw new Error("vkm-chu-ky: khong thay o chu ky tren thanh ben");
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
	await cho(() => qa('[role="option"]').length > 0, "o chu ky mo");
	const muc = qa('[role="option"]').find((x) => x.textContent?.includes(ten));
	if (!muc) throw new Error(`vkm-chu-ky: khong co chu ky ${ten}`);
	await act(async () => {
		muc.dispatchEvent(
			new KeyboardEvent("keydown", {
				key: "Enter",
				bubbles: true,
				cancelable: true,
			}),
		);
	});
	await cho(() => qa('[role="option"]').length === 0, "o chu ky dong");
	await nhip(5);
}

describe("vkm-chu-ky", () => {
	test("vkm-chu-ky: o chu ky nam o dau thanh ben, ca hang dien thoai, khong o hang nut", async () => {
		datNen();
		await dung(<ThanhBenMucTieu />, "/ws/okr");
		await cho(() => q("[data-chon-chu-ky]") !== null, "o chu ky");
		const tatCa = qa("[data-chon-chu-ky]");
		const trongDau = tatCa.filter(
			(o) => o.closest("[data-slot=area-sidebar-header]") !== null,
		);
		const trongAside = trongDau.filter((o) => o.closest("aside") !== null);
		const trongDai = trongDau.filter(
			(o) => o.closest("[data-slot=area-sidebar-strip]") !== null,
		);
		if (trongAside.length !== 1 || trongDai.length !== 1 || tatCa.length !== 2)
			throw new Error(
				`vkm-chu-ky: o chu ky ${tatCa.length} cho, aside ${trongAside.length}, dai ${trongDai.length}`,
			);
		await don();

		const QUYEN = [
			{ kieu: "an" as const },
			{ kieu: "cho" as const },
			{
				kieu: "xong" as const,
				dich: donDich("cua-toi", null, undefined),
				duoc: true,
				lyDo: null,
				cycleId: "q4",
				phaKy: "dang-chay" as const,
				quanTri: false,
				canEdit: false,
			},
		];
		for (const quyen of QUYEN) {
			datNen();
			await dung(
				<div data-hang-thu="">
					<HanhDongKhu cauNoi={false} q={quyen} tab="cua-toi" />
				</div>,
				"/ws/okr",
			);
			await nhip(10);
			const soO = qa("[data-hang-thu] [data-chon-chu-ky]").length;
			if (soO !== 0)
				throw new Error(
					`vkm-chu-ky: o chu ky con trong hang nut (${quyen.kieu}: ${soO})`,
				);
			await don();
		}
		expect(trongDau).toHaveLength(2);
	});

	test("vkm-chu-ky: lien ket muc mang kyOkr dang xem, va doi theo khi chon chu ky khac", async () => {
		datNen();
		await dung(<ThanhBenMucTieu />, "/ws/okr?kyOkr=c2");
		await cho(() => mucTrenAside().length === 5, "nam muc");
		const coKy = hrefMuc();
		if (
			!coKy.every(
				(h) => new URL(h, "http://x").searchParams.get("kyOkr") === "c2",
			)
		)
			throw new Error(
				`vkm-chu-ky: lien ket muc mat chu ky ${JSON.stringify(coKy)}`,
			);
		await don();

		datNen();
		await dung(<ThanhBenMucTieu />, "/ws/okr");
		await cho(() => mucTrenAside().length === 5, "nam muc khong ky");
		const khongKy = hrefMuc();
		if (khongKy.some((h) => h.includes("kyOkr")))
			throw new Error(
				`vkm-chu-ky: lien ket muc tu them chu ky ${JSON.stringify(khongKy)}`,
			);

		await chonKy("Năm 2027");
		const sauChon = hrefMuc();
		if (!urlGhi.some((u) => new URLSearchParams(u).get("kyOkr") === "c3"))
			throw new Error(
				`vkm-chu-ky: url khong nhan kyOkr=c3 ${JSON.stringify(urlGhi)}`,
			);
		if (
			!sauChon.every(
				(h) => new URL(h, "http://x").searchParams.get("kyOkr") === "c3",
			)
		)
			throw new Error(
				`vkm-chu-ky: lien ket muc mat chu ky sau khi chon ${JSON.stringify(sauChon)}`,
			);
		expect(sauChon.map((h) => new URL(h, "http://x").pathname)).toEqual(
			HREF_MUC,
		);
	});
});

type NutMayChu = ReactElement<{ children?: ReactNode }>;
type ThanhPhanMayChu = (props: NutMayChu["props"]) => Promise<ReactNode>;
const HAM_BAT_DONG_BO = (async () => null).constructor;

function laThanhPhanMayChu(kieu: NutMayChu["type"]): kieu is ThanhPhanMayChu {
	return kieu instanceof HAM_BAT_DONG_BO;
}

async function giaiMayChu(nut: ReactNode): Promise<ReactNode> {
	if (Array.isArray(nut)) return Promise.all(nut.map(giaiMayChu));
	if (!isValidElement(nut)) return nut;
	const { type, props } = nut as NutMayChu;
	if (type === Suspense) return giaiMayChu(props.children);
	if (laThanhPhanMayChu(type)) return giaiMayChu(await type(props));
	if (props.children === undefined) return nut;
	return cloneElement(nut, undefined, await giaiMayChu(props.children));
}

const DUONG_TAB_MOI = {
	"cua-toi": "/ws/okr",
	"theo-don-vi": "/ws/okr/bo-okr",
	"toan-canh": "/ws/okr/suc-khoe",
	"hoi-y": "/ws/okr/lay-y-kien",
} as const;

function demThanhThe(): number {
	return qa("[role=tablist]").length;
}

describe("vkm-mot-lop", () => {
	test("vkm-mot-lop: bon dau trang khu khong con thanh the khu; trang don vi chi mot lop the", async () => {
		const ket: [string, number][] = [];
		const sai: string[] = [];
		for (const tab of TAB) {
			datNen();
			const dau = await giaiMayChu(await DauTrangOkrTrang({ tab }));
			await dung(<>{dau}</>, DUONG_TAB_MOI[tab]);
			await cho(
				() => q("h1, [data-slot=page-shell-title]") !== null,
				`dau trang ${tab}`,
			);
			const so = qa("[data-khung-tab]").length + demThanhThe();
			if (so !== 0) sai.push(`vkm-mot-lop: ${tab} con thanh the khu (${so})`);
			ket.push([tab, so]);
			await don();
		}

		datNen();
		const dau = await giaiMayChu(
			await DauTrangOkrTrang({
				tab: "theo-don-vi",
				searchParams: Promise.resolve({ donOkr: "goc" }),
			}),
		);
		await dung(
			<>
				{dau}
				<TheoDonVi />
			</>,
			"/ws/okr/bo-okr",
		);
		await cho(
			() => q("[data-view-switch=nut]") !== null,
			"chuyen kieu xem trang don vi",
		);
		const lop = demThanhThe() + qa("[data-view-switch=nut]").length;
		if (lop !== 1)
			sai.push(`vkm-mot-lop: trang don vi con thanh the khu, dem = ${lop}`);
		if (sai.length > 0) throw new Error(sai.join("\n"));
		ket.push(["bo-okr", lop]);
		expect(ket).toEqual([
			["cua-toi", 0],
			["theo-don-vi", 0],
			["toan-canh", 0],
			["hoi-y", 0],
			["bo-okr", 1],
		]);
	});
});
