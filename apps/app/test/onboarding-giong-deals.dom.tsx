import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import {
	act,
	createElement as h,
	type MouseEvent as ReactMouseEvent,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import type { z } from "zod";
import type { DanhMucInput } from "@/app/(app)/[slug]/onboarding/onboarding-search-params";
import {
	danhMucOutput,
	planCreateFromTemplateInput,
	planListInput,
	planOutput,
} from "../../api/src/onboarding/onboarding.contracts";
import {
	dungHang,
	type HangDanhMuc,
	type KeHoachTho,
	manDanhMucTuHang,
} from "../../api/src/onboarding/onboarding-danh-muc";

type CheDo = "thanh-cong" | "loi" | "treo";
type Khuon = {
	id: string;
	name: string;
	partnerType: string | null;
	steps: [];
	archivedAt: null;
	purgeable: boolean;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const TOI = { id: "u-toi", name: "Lan", email: "lan@thu.test" };
const NGUOI_B = { id: "u-b", name: "Minh", email: "minh@thu.test" };
const NGUOI = [TOI, NGUOI_B];
const BO_PHAN = [
	{
		id: "bp-a",
		name: "Kinh doanh",
		position: 0,
		archivedAt: null,
		purgeable: false,
	},
	{
		id: "bp-z",
		name: "Phap che",
		position: 1,
		archivedAt: null,
		purgeable: false,
	},
];
const CONG_TY = [
	{ id: "ct-1", name: "Alpha Sàn", domain: null, iconUrl: null },
];
const KHUON_MOT: Khuon = {
	id: "khuon-1",
	name: "San moi gioi",
	partnerType: null,
	steps: [],
	archivedAt: null,
	purgeable: false,
};
const LOI_MAY_CHU = "may chu tu choi";

let tap: HangDanhMuc[] = [];
let khuon: Khuon[] = [];
let cheDoDanhMuc: CheDo = "thanh-cong";
let cheDoTao: CheDo = "thanh-cong";
let moTreo: (() => void) | null = null;
type LuotGoi =
	| { ten: "manDanhMuc"; dauVao: DanhMucInput }
	| {
			ten: "createFromTemplate";
			dauVao: z.output<typeof planCreateFromTemplateInput>;
	  };
type KeHoachRa = z.infer<typeof planOutput>;
let daGoi: LuotGoi[] = [];

const taoTra = planOutput.parse({
	id: "kh-vua-tao",
	companyId: "ct-1",
	templateId: "khuon-1",
	startedAt: new Date("2026-09-22T00:00:00.000Z"),
	targetDays: 30,
	closedAt: null,
	ownerId: TOI.id,
});

function keHoach(
	i: number,
	ten: string,
	buoc: { xong: boolean; ngayTruoc: number }[],
): KeHoachTho {
	return {
		id: `kh-${i}`,
		companyId: `ct-${i}`,
		company: { name: ten },
		startedAt: new Date(Date.now() - (10 + i) * DAY_MS),
		targetDays: 30,
		ownerId: TOI.id,
		closedAt: null,
		steps: buoc.map((b, vi) => ({
			completedAt: b.xong ? new Date() : null,
			label: `Buoc ${i}.${vi}`,
			position: vi,
			updatedAt: new Date(Date.now() - b.ngayTruoc * DAY_MS),
			assigneeId: TOI.id,
			assignee: { name: TOI.name },
			department: { id: "bp-a", name: "Kinh doanh", position: 0 },
		})),
	};
}

function hang(plan: KeHoachTho): HangDanhMuc {
	return dungHang(plan, new Date());
}

function ketQuaDanhMuc(v: DanhMucInput) {
	return danhMucOutput.parse(
		manDanhMucTuHang(tap, planListInput.parse(v), khuon.length),
	);
}

function thuTuc<TVao, TRa>(
	ten: string,
	doc: (dauVao: TVao) => TRa | Promise<TRa>,
	viet?: (dauVao: TVao) => Promise<unknown>,
) {
	return {
		queryKey: (dauVao?: TVao) => (dauVao === undefined ? [ten] : [ten, dauVao]),
		queryOptions: (dauVao: TVao) => ({
			queryKey: dauVao === undefined ? [ten] : [ten, dauVao],
			queryFn: async () => doc(dauVao),
		}),
		mutationOptions: (tuyChon?: {
			onSuccess?: (du: KeHoachRa) => void | Promise<void>;
			onError?: (loi: Error) => void;
		}) => ({
			mutationKey: [ten],
			mutationFn: viet ?? (async () => undefined),
			...tuyChon,
		}),
	};
}

const khongDoc = () => {
	throw new Error("khong doc thu tuc nay");
};

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		onboarding: {
			access: thuTuc("access", () => ({ canManage: true })),
			nguoiNhanViec: thuTuc("nguoiNhanViec", () => NGUOI),
			listDepartments: thuTuc("listDepartments", () => BO_PHAN),
			listTemplates: thuTuc("listTemplates", () => {
				soLanDocKhuon += 1;
				return khuon;
			}),
			manDanhMuc: thuTuc("manDanhMuc", (v: DanhMucInput) => {
				daGoi.push({ ten: "manDanhMuc", dauVao: v });
				if (cheDoDanhMuc === "loi") throw new Error(LOI_MAY_CHU);
				if (cheDoDanhMuc === "treo") {
					return new Promise((xong) => {
						moTreo = () => xong(ketQuaDanhMuc(v));
					});
				}
				return ketQuaDanhMuc(v);
			}),
			bangCot: thuTuc("bangCot", () => ({
				cachChia: "buoc",
				tranThe: 30,
				cot: [],
			})),
			createFromTemplate: thuTuc(
				"createFromTemplate",
				khongDoc,
				async (v: z.input<typeof planCreateFromTemplateInput>) => {
					daGoi.push({
						ten: "createFromTemplate",
						dauVao: planCreateFromTemplateInput.parse(v),
					});
					if (cheDoTao === "loi") throw new Error(LOI_MAY_CHU);
					return taoTra;
				},
			),
			plansOfCompany: thuTuc("plansOfCompany", () => []),
			planById: thuTuc("planById", khongDoc),
		},
		users: {
			list: thuTuc("users.list", () => NGUOI),
			me: thuTuc("users.me", () => TOI),
		},
		companies: {
			options: thuTuc("companies.options", () => CONG_TY),
			byId: thuTuc("companies.byId", khongDoc),
		},
	}),
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws/onboarding",
}));

mock.module("next/link", () => ({
	default: ({
		href,
		children,
		...rest
	}: {
		href: string;
		children: ReactNode;
	}) =>
		h(
			"a",
			{ ...rest, href, onClick: (e: ReactMouseEvent) => e.preventDefault() },
			children,
		),
}));

const { DanhMucTable } = await import(
	"@/app/(app)/[slug]/onboarding/danh-muc-table"
);
const { DanhMucHanhDong } = await import(
	"@/app/(app)/[slug]/onboarding/tao-ke-hoach"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { Toaster } = await import("@crm/ui/components/sonner");
const { EmptyCellValue } = await import("@crm/ui/components/empty-cell");
const { messages: uiMessages } = await import("@crm/ui/lib/messages");
const { onboardingMessages } = await import("@/lib/messages/onboarding");

const m = onboardingMessages("vi");
const ui = uiMessages("vi").table;
const O_TRONG = renderToStaticMarkup(<EmptyCellValue />);

type San = {
	o: HTMLElement;
	root: Root;
	url: () => URLSearchParams;
	client: QueryClient;
};
let dangMo: San[] = [];

function Trang() {
	return (
		<>
			<div data-slot="page-shell-actions">
				<DanhMucHanhDong />
			</div>
			<div data-vung="bang">
				<DanhMucTable />
			</div>
			<Toaster />
		</>
	);
}

async function mo(
	duong = "",
	tuyChon: { locale?: "vi" | "en"; choTai?: boolean } = {},
): Promise<San> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	let hienTai = new URLSearchParams(duong);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter
				searchParams={duong}
				hasMemory
				onUrlUpdate={(su) => {
					hienTai = new URLSearchParams(su.queryString);
				}}
			>
				<QueryClientProvider client={client}>
					<LocaleProvider locale={tuyChon.locale ?? "vi"}>
						<TooltipProvider>
							<Trang />
						</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	const san = { o, root, url: () => hienTai, client };
	dangMo.push(san);
	if (tuyChon.choTai !== false) {
		const nhan = onboardingMessages(tuyChon.locale ?? "vi").loading;
		await cho(
			() => daGoi.length > 0 && !o.textContent?.includes(nhan),
			"tai xong",
		);
	}
	return san;
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 150; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(
		`khong toi trang thai ${moTa} — noi dung: ${document.body.textContent?.slice(0, 400)}`,
	);
}

function cacNut(goc: ParentNode, chu: string): HTMLButtonElement[] {
	return [...goc.querySelectorAll<HTMLButtonElement>("button")].filter(
		(b) => b.textContent?.trim() === chu,
	);
}

function nut(chu: string, goc: ParentNode = document.body): HTMLButtonElement {
	const tim = cacNut(goc, chu)[0];
	if (!tim) {
		throw new Error(
			`khong thay nut "${chu}" — cac nut: ${[...goc.querySelectorAll("button")].map((b) => b.textContent?.trim()).join(" | ")}`,
		);
	}
	return tim;
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

async function phim(o: Element, key: string): Promise<void> {
	await act(async () => {
		o.dispatchEvent(
			new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
		);
	});
}

function vungBang(san: San): HTMLElement {
	const v = san.o.querySelector<HTMLElement>('[data-vung="bang"]');
	if (!v) throw new Error("khong thay vung bang");
	return v;
}

function oTim(san: San): HTMLInputElement | null {
	return san.o.querySelector<HTMLInputElement>(
		`input[placeholder="${m.search}"]`,
	);
}

function khungBang(san: San): HTMLElement | null {
	return san.o.querySelector<HTMLElement>('[data-slot="table-container"]');
}

function goiDanhMucCuoi(): Partial<DanhMucInput> {
	const goi = daGoi.findLast((g) => g.ten === "manDanhMuc");
	return goi?.ten === "manDanhMuc" ? goi.dauVao : {};
}

let soLanDocKhuon = 0;

function khuonDaTai(): boolean {
	return soLanDocKhuon > 0;
}

function hopThoai(): HTMLElement | null {
	return document.body.querySelector<HTMLElement>('[role="dialog"]');
}

function oCua(san: San, tenCot: string, hangThu: number): HTMLElement {
	const tieuDe = [...san.o.querySelectorAll("thead th")];
	const cot = tieuDe.findIndex((th) => th.textContent?.trim() === tenCot);
	if (cot < 0) throw new Error(`khong thay cot ${tenCot}`);
	const tr = san.o.querySelectorAll("tbody tr")[hangThu];
	const td = tr?.children[cot];
	if (!(td instanceof HTMLElement))
		throw new Error(`khong thay o ${tenCot}#${hangThu}`);
	return td;
}

async function moMenu(chuBatDau: string): Promise<void> {
	const tro = [
		...document.body.querySelectorAll<HTMLElement>('[aria-haspopup="menu"]'),
	].find((o) => o.textContent?.trim().startsWith(chuBatDau));
	if (!tro) throw new Error(`khong thay nut mo menu ${chuBatDau}`);
	await bam(tro);
	await cho(
		() => document.body.querySelector('[role="menu"]') !== null,
		`mo menu ${chuBatDau}`,
	);
}

async function dongMenu(): Promise<void> {
	const menu = document.body.querySelector('[role="menu"]');
	if (menu) await phim(menu, "Escape");
	await cho(
		() => document.body.querySelector('[role="menu"]') === null,
		"dong menu",
	);
}

async function chonSelect(nhan: string, chu: string): Promise<void> {
	const tro = document.body.querySelector(`[aria-label="${nhan}"]`);
	if (!tro) throw new Error(`khong thay o chon "${nhan}"`);
	await bam(tro);
	await cho(
		() => document.body.querySelectorAll('[role="option"]').length > 0,
		`mo o chon ${nhan}`,
	);
	const lua = [...document.body.querySelectorAll('[role="option"]')].find((o) =>
		o.textContent?.includes(chu),
	);
	if (!lua) throw new Error(`o chon "${nhan}" khong co "${chu}"`);
	await phim(lua, "Enter");
	await cho(
		() => document.body.querySelectorAll('[role="option"]').length === 0,
		"dong o chon",
	);
}

async function chonCombobox(chu: string): Promise<void> {
	const tro = [
		...document.body.querySelectorAll('[role="dialog"] [role="combobox"]'),
	].find((b) => b.tagName === "BUTTON");
	if (!tro) throw new Error("khong thay combobox trong hop thoai");
	await bam(tro);
	await cho(
		() => document.body.querySelectorAll("[cmdk-item]").length > 0,
		"mo combobox",
	);
	const lua = [...document.body.querySelectorAll("[cmdk-item]")].find((o) =>
		o.textContent?.includes(chu),
	);
	if (!lua) throw new Error(`combobox khong co "${chu}"`);
	await bam(lua);
}

beforeEach(() => {
	tap = [
		hang(keHoach(1, "Beta Hub", [{ xong: false, ngayTruoc: 8 }])),
		hang(keHoach(2, "Gamma Land", [{ xong: false, ngayTruoc: 3 }])),
	];
	khuon = [KHUON_MOT];
	cheDoDanhMuc = "thanh-cong";
	cheDoTao = "thanh-cong";
	moTreo = null;
	daGoi = [];
	soLanDocKhuon = 0;
});

afterEach(async () => {
	for (const san of dangMo) {
		await act(async () => san.root.unmount());
		san.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

describe("nut-dau-trang", () => {
	test("nut-dau-trang: hai cach xem, nut tao o dau trang, to mau chinh, co icon, khong con trong thanh cong cu", async () => {
		const ket: string[] = [];
		for (const cachXem of ["bang", "bang-cot"] as const) {
			const san = await mo(`cachXem=${cachXem}`);
			await cho(
				() => cacNut(san.o, m.tao.keHoach.toolbar).length > 0,
				"nut tao",
			);
			const dau = san.o.querySelector('[data-slot="page-shell-actions"]');
			const nutDau = dau ? cacNut(dau, m.tao.keHoach.toolbar)[0] : undefined;
			ket.push(
				`${cachXem}: dau-trang=${nutDau !== undefined} bienThe=${nutDau?.getAttribute("data-variant")} icon=${nutDau?.querySelector("svg") !== null && nutDau !== undefined}`,
			);
			ket.push(
				`${cachXem}: nut trong thanh cong cu=${cacNut(vungBang(san), m.tao.keHoach.toolbar).length}`,
			);
			await act(async () => san.root.unmount());
			san.o.remove();
			dangMo = [];
		}
		expect(ket).toEqual([
			"bang: dau-trang=true bienThe=default icon=true",
			"bang: nut trong thanh cong cu=0",
			"bang-cot: dau-trang=true bienThe=default icon=true",
			"bang-cot: nut trong thanh cong cu=0",
		]);
	});
});

describe("nut-mo-va-khoa", () => {
	test("nut-mo-va-khoa: co khuon thi bam mo hop thoai, khong khuon thi nut khoa", async () => {
		const san = await mo();
		const nutTao = nut(m.tao.keHoach.toolbar, san.o);
		await cho(() => !nutTao.disabled, "nut tao bat");
		await bam(nutTao);
		await cho(() => hopThoai() !== null, "mo hop thoai");
		expect(`co khuon: tieu de hop thoai`).toBe(
			hopThoai()?.textContent?.includes(m.tao.keHoach.title)
				? "co khuon: tieu de hop thoai"
				: "co khuon: sai hop thoai",
		);
		await act(async () => san.root.unmount());
		san.o.remove();
		dangMo = [];
		document.body.innerHTML = "";

		khuon = [];
		const sanKhong = await mo();
		await cho(
			() => daGoi.some((g) => g.ten === "manDanhMuc"),
			"danh muc da goi",
		);
		const nutKhoa = nut(m.tao.keHoach.toolbar, sanKhong.o);
		await cho(() => nutKhoa.disabled, "khong khuon: nut khoa");
		expect(`khong khuon: nut khoa=${nutKhoa.disabled}`).toBe(
			"khong khuon: nut khoa=true",
		);
	});
});

describe("sap-mac-dinh", () => {
	test("sap-mac-dinh: khong tham so thi Ngay tang dan, menu chon Ngay, desc gui dir desc", async () => {
		const san = await mo();
		const thNgay = [...san.o.querySelectorAll("thead th")].find(
			(th) => th.textContent?.trim() === m.columns.days,
		);
		const dau = goiDanhMucCuoi();
		expect(
			`aria-sort=${thNgay?.getAttribute("aria-sort")} sort mac dinh: '${dau.sort}' dir=${dau.dir}`,
		).toBe("aria-sort=ascending sort mac dinh: 'startedAt' dir=asc");

		await moMenu(ui.sort);
		const muc = [
			...document.body.querySelectorAll('[role="menuitemradio"]'),
		].find((o) => o.textContent?.trim() === m.columns.days);
		expect(
			`menu Sap xep: Ngay aria-checked=${muc?.getAttribute("aria-checked")}`,
		).toBe("menu Sap xep: Ngay aria-checked=true");
		await dongMenu();
		await act(async () => san.root.unmount());
		san.o.remove();
		dangMo = [];

		daGoi = [];
		await mo("dir=desc");
		expect(`dir=${goiDanhMucCuoi().dir}`).toBe("dir=desc");
	});
});

describe("dang-tai", () => {
	test("dang-tai: lan dau va khi tai lai, thanh cong cu con, bang co dau tai, chu Dang tai trong aria-live", async () => {
		cheDoDanhMuc = "treo";
		const san = await mo("", { choTai: false });
		await cho(() => moTreo !== null && oTim(san) !== null, "lan dau treo");
		const khung = khungBang(san);
		const songCung = [...san.o.querySelectorAll('[aria-live="polite"]')].some(
			(o) => o.textContent?.includes(m.loading),
		);
		const ket = [
			`dang tai: o tim=${oTim(san) !== null}`,
			`dang tai: nut Bang=${cacNut(san.o, m.view.bang).length > 0}`,
			`dang tai: spinner trong khung bang=${khung?.querySelector('[data-slot="spinner"]') !== null && khung !== null}`,
			`dang tai: khong bao khong khop=${!(khung?.textContent ?? "").includes(m.noMatch.title) && !(khung?.textContent ?? "").includes(ui.noResults)}`,
			`dang tai: aria-live chua Dang tai=${songCung}`,
		];

		const mo1 = moTreo as (() => void) | null;
		moTreo = null;
		await act(async () => mo1?.());
		await cho(
			() => san.o.querySelectorAll("tbody tr").length === 2,
			"hang hien",
		);
		await cho(() => !san.o.textContent?.includes(m.loading), "Dang tai mat");

		const daDong = [...san.o.querySelectorAll("button")].find((b) =>
			b.textContent?.trim().startsWith(m.facets.closed),
		);
		if (!daDong) throw new Error("khong thay nut Da dong");
		await bam(daDong);
		await cho(() => moTreo !== null, "tai lai treo");
		ket.push(`tai lai: o tim=${oTim(san) !== null}`);
		ket.push(
			`tai lai: spinner=${vungBang(san).querySelector('[data-slot="spinner"]') !== null}`,
		);
		const mo2 = moTreo as (() => void) | null;
		await act(async () => mo2?.());

		expect(ket).toEqual([
			"dang tai: o tim=true",
			"dang tai: nut Bang=true",
			"dang tai: spinner trong khung bang=true",
			"dang tai: khong bao khong khop=true",
			"dang tai: aria-live chua Dang tai=true",
			"tai lai: o tim=true",
			"tai lai: spinner=true",
		]);
	});
});

describe("loi-giu-thanh-cong-cu", () => {
	test("loi-giu-thanh-cong-cu: loi nam trong bang, o tim con, thu lai goi lai", async () => {
		cheDoDanhMuc = "loi";
		const san = await mo("", { choTai: false });
		await cho(
			() => (khungBang(san)?.textContent ?? "").includes(m.error.title),
			"loi hien",
		);
		const khung = khungBang(san);
		expect(
			`loi: o tim=${oTim(san) !== null} loi trong bang=${(khung?.textContent ?? "").includes(m.error.title)} nut trong bang=${khung ? cacNut(khung, uiMessages("vi").karaKhung.thuLai).length : 0}`,
		).toBe("loi: o tim=true loi trong bang=true nut trong bang=1");

		const truoc = daGoi.filter((g) => g.ten === "manDanhMuc").length;
		await bam(nut(uiMessages("vi").karaKhung.thuLai, khung ?? san.o));
		await cho(
			() => daGoi.filter((g) => g.ten === "manDanhMuc").length === truoc + 1,
			"thu lai goi lai",
		);
		expect(daGoi.filter((g) => g.ten === "manDanhMuc").length).toBe(truoc + 1);
	});
});

describe("loi-giu-thanh-cong-cu", () => {
	test("loi-giu-thanh-cong-cu: da co hang ma tai lai hong thi loi va Thu lai van hien trong bang", async () => {
		const san = await mo();
		await cho(
			() => san.o.querySelectorAll("tbody tr").length === 2,
			"hang hien",
		);
		cheDoDanhMuc = "loi";
		await act(async () => {
			await san.client.invalidateQueries();
		});
		await cho(
			() =>
				(khungBang(san)?.textContent ?? "").includes(m.error.title) ||
				daGoi.filter((g) => g.ten === "manDanhMuc").length > 1,
			"tai lai",
		);
		for (let i = 0; i < 20; i += 1) {
			await act(async () => {
				await new Promise((r) => setTimeout(r, 0));
			});
		}
		const khung = khungBang(san);
		expect(
			`tai lai hong: loi trong bang=${(khung?.textContent ?? "").includes(m.error.title)} nut=${khung ? cacNut(khung, uiMessages("vi").karaKhung.thuLai).length : 0} o tim=${oTim(san) !== null}`,
		).toBe("tai lai hong: loi trong bang=true nut=1 o tim=true");
	});
});

describe("o-trong-va-so", () => {
	test("o-trong-va-so: o rong dung EmptyCellValue, cot so tabular-nums, im lang theo ngon ngu", async () => {
		tap = [
			hang(keHoach(1, "Da Xong", [{ xong: true, ngayTruoc: 0 }])),
			hang(keHoach(2, "Beta Hub", [{ xong: false, ngayTruoc: 8 }])),
		];
		const ket: string[] = [];
		const san = await mo("sort=companyName&dir=asc");
		const r0 = 1;
		const r1 = 0;
		for (const [ten, cot] of [
			["imNgay=0", m.columns.silent],
			["tacO=null", m.columns.stuckOn],
			["boPhanTac=null", m.columns.department],
		] as const) {
			ket.push(
				`${ten}: EmptyCellValue=${oCua(san, cot, r0).innerHTML.includes(O_TRONG)}`,
			);
		}
		for (const cot of [m.columns.silent, m.columns.steps, m.columns.days]) {
			ket.push(
				`${cot}: tabular-nums=${oCua(san, cot, r1).querySelector(".tabular-nums") !== null}`,
			);
		}
		ket.push(`vi: ${oCua(san, m.columns.silent, r1).textContent?.trim()}`);
		await act(async () => san.root.unmount());
		san.o.remove();
		dangMo = [];

		const en = onboardingMessages("en");
		const sanEn = await mo("sort=companyName&dir=asc", { locale: "en" });
		ket.push(`en: ${oCua(sanEn, en.columns.silent, r1).textContent?.trim()}`);

		expect(ket).toEqual([
			"imNgay=0: EmptyCellValue=true",
			"tacO=null: EmptyCellValue=true",
			"boPhanTac=null: EmptyCellValue=true",
			`${m.columns.silent}: tabular-nums=true`,
			`${m.columns.steps}: tabular-nums=true`,
			`${m.columns.days}: tabular-nums=true`,
			`vi: ${m.cells.silentDays.replace("{n}", "8")}`,
			`en: ${en.cells.silentDays.replace("{n}", "8")}`,
		]);
		expect(m.cells.silentDays.replace("{n}", "8")).toBe("8 ngày");
		expect(en.cells.silentDays.replace("{n}", "8")).toBe("8d");
	});
});

describe("doi-tac-khong-an", () => {
	test("doi-tac-khong-an: menu Cot khong co Doi tac, van co Dang tac o", async () => {
		await mo();
		await moMenu(ui.columns);
		const muc = [
			...document.body.querySelectorAll('[role="menuitemcheckbox"]'),
		].map((o) => o.textContent?.trim());
		expect(
			`menu cot: Doi tac an duoc=${muc.includes(m.columns.partner)} Dang tac o co=${muc.includes(m.columns.stuckOn)}`,
		).toBe("menu cot: Doi tac an duoc=false Dang tac o co=true");
		await dongMenu();
	});
});

describe("o-chu-mot-dong", () => {
	test("o-chu-mot-dong: ba cot chu cat mot dong, translate no", async () => {
		const san = await mo();
		const ket = [
			m.columns.partner,
			m.columns.stuckOn,
			m.columns.department,
		].map((cot) => {
			const td = oCua(san, cot, 0);
			const nhan = td.querySelector(".truncate");
			return `${cot}: mot dong=${nhan !== null && nhan.getAttribute("translate") === "no" && !td.className.includes("whitespace-normal")}`;
		});
		expect(ket).toEqual([
			`${m.columns.partner}: mot dong=true`,
			`${m.columns.stuckOn}: mot dong=true`,
			`${m.columns.department}: mot dong=true`,
		]);
	});
});

describe("nhan-bo-loc", () => {
	test("nhan-bo-loc: ba bo loc, nhan chi la ten, lua chon 0 bi bo tru khi dang chon", async () => {
		tap = [
			hang(keHoach(1, "Beta Hub", [{ xong: false, ngayTruoc: 8 }])),
			hang(keHoach(2, "Gamma Land", [{ xong: false, ngayTruoc: 3 }])),
		];
		const nhanNguoiGiao = (
			await import("@/lib/messages/ke-hoach-noi")
		).keHoachNoiMessages("vi").danhMuc.nguoiGiao;
		type Ten = { id: string; name: string };
		const MA_TRAN: { id: string; nhan: string; co: Ten; khong: Ten }[] = [
			{
				id: "boPhan",
				nhan: m.facets.department,
				co: { id: "bp-a", name: "Kinh doanh" },
				khong: { id: "bp-z", name: "Phap che" },
			},
			{ id: "nguoiCam", nhan: m.facets.owner, co: TOI, khong: NGUOI_B },
			{ id: "nguoiGiao", nhan: nhanNguoiGiao, co: TOI, khong: NGUOI_B },
		];
		const ket: string[] = [];
		for (const bl of MA_TRAN) {
			for (const ca of ["khong-chon", "dang-chon"] as const) {
				const san = await mo(
					ca === "dang-chon" ? `${bl.id}=${bl.khong.id}` : "",
				);
				await moMenu(ui.filters);
				const muc = [
					...document.body.querySelectorAll<HTMLElement>('[role="menuitem"]'),
				].find((o) => o.textContent?.includes(bl.nhan));
				if (!muc) throw new Error(`khong thay bo loc ${bl.nhan}`);
				muc.focus();
				await phim(muc, "ArrowRight");
				await cho(
					() =>
						document.body.querySelectorAll('[role="menuitemcheckbox"]').length >
						0,
					`mo bo loc ${bl.id}`,
				);
				const nhan = [
					...document.body.querySelectorAll('[role="menuitemcheckbox"]'),
				].map((o) => o.textContent?.trim() ?? "");
				ket.push(
					ca === "khong-chon"
						? `nhan bo loc ${bl.id}: co=${nhan.includes(bl.co.name)} khong-cham=${nhan.every((n) => !n.includes(" · "))} bo-so-0=${!nhan.some((n) => n.includes(bl.khong.name))}`
						: `nhan bo loc ${bl.id} dang chon: co=${nhan.includes(bl.khong.name)}`,
				);
				await dongMenu();
				await act(async () => san.root.unmount());
				san.o.remove();
				dangMo = [];
				document.body.innerHTML = "";
			}
		}
		expect(ket).toEqual(
			MA_TRAN.flatMap((bl) => [
				`nhan bo loc ${bl.id}: co=true khong-cham=true bo-so-0=true`,
				`nhan bo loc ${bl.id} dang chon: co=true`,
			]),
		);
	});
});

describe("tao-xong-mo", () => {
	async function dienVaLuu(san: San): Promise<void> {
		await bam(nut(m.tao.keHoach.toolbar, san.o));
		await cho(() => hopThoai() !== null, "mo hop thoai");
		await chonCombobox("Alpha Sàn");
		await chonSelect(m.tao.keHoach.template, KHUON_MOT.name);
		const luu = [...(hopThoai()?.querySelectorAll("button") ?? [])].find(
			(b) => b.getAttribute("type") === "submit",
		);
		if (!luu) throw new Error("khong thay nut Luu");
		await cho(() => !luu.disabled, "nut Luu bat");
		await bam(luu);
	}

	test("tao-xong-mo: luu xong co thong bao va mo ke hoach vua tao; loi thi khong", async () => {
		const san = await mo();
		await dienVaLuu(san);
		await cho(
			() => document.body.textContent?.includes(m.tao.keHoach.created) === true,
			"thong bao thanh cong",
		);
		await cho(
			() => (san.url().get("record") ?? "").includes(`plan:${taoTra.id}`),
			`tao xong: plan:${taoTra.id}`,
		);
		expect(`tao xong: ${san.url().get("record")}`).toBe(
			`tao xong: plan:${taoTra.id}`,
		);
		await act(async () => san.root.unmount());
		san.o.remove();
		dangMo = [];
		document.body.innerHTML = "";

		cheDoTao = "loi";
		const sanLoi = await mo();
		await dienVaLuu(sanLoi);
		await cho(
			() => hopThoai()?.textContent?.includes(LOI_MAY_CHU) === true,
			"loi trong hop thoai",
		);
		expect(
			`loi: thong bao=${document.body.textContent?.includes(m.tao.keHoach.created)} hop thoai mo=${hopThoai() !== null} record=${sanLoi.url().get("record")}`,
		).toBe("loi: thong bao=false hop thoai mo=true record=null");
	});
});

describe("trang-thai-trong", () => {
	test("trang-thai-trong: chua co ke hoach, khong khop, chua co khuon", async () => {
		const ket: string[] = [];

		tap = [];
		const sanTrong = await mo();
		await cho(
			() => sanTrong.o.textContent?.includes(m.empty.noPlan.title) === true,
			"moi tao ke hoach dau",
		);
		const dau = sanTrong.o.querySelector('[data-slot="page-shell-actions"]');
		const nutDau = dau ? cacNut(dau, m.tao.keHoach.toolbar)[0] : undefined;
		if (nutDau) {
			await cho(
				() => !nutDau.disabled || daGoi.some((g) => g.ten === "manDanhMuc"),
				"nut dau trang on dinh",
			);
			await cho(() => khuonDaTai(), "khuon da tai");
		}
		ket.push(
			`chua co ke hoach: nut dau trang co=${nutDau !== undefined} bat=${nutDau !== undefined && !nutDau.disabled}`,
		);
		await act(async () => sanTrong.root.unmount());
		sanTrong.o.remove();
		dangMo = [];

		tap = [hang(keHoach(1, "Beta Hub", [{ xong: false, ngayTruoc: 8 }]))];
		const sanKhop = await mo("boPhan=bp-z");
		await cho(
			() => (khungBang(sanKhop)?.textContent ?? "").includes(m.noMatch.title),
			"khong khop",
		);
		const khung = khungBang(sanKhop);
		ket.push(
			`khong khop: trong bang=${(khung?.textContent ?? "").includes(m.noMatch.title)} nut=${khung ? cacNut(khung, m.noMatch.action).length : 0} o tim=${oTim(sanKhop) !== null}`,
		);
		await bam(nut(m.noMatch.action, khung ?? sanKhop.o));
		await cho(() => !sanKhop.url().has("boPhan"), "xoa bo loc");
		ket.push(`khong khop: sau xoa boPhan=${sanKhop.url().get("boPhan")}`);
		await act(async () => sanKhop.root.unmount());
		sanKhop.o.remove();
		dangMo = [];

		khuon = [];
		tap = [];
		const sanKhuon = await mo();
		await cho(
			() => sanKhuon.o.textContent?.includes(m.empty.noTemplate.title) === true,
			"chua co khuon",
		);
		ket.push(
			`chua co khuon: moi viet khuon=${sanKhuon.o.textContent?.includes(m.empty.noTemplate.title)}`,
		);

		expect(ket).toEqual([
			"chua co ke hoach: nut dau trang co=true bat=true",
			"khong khop: trong bang=true nut=1 o tim=true",
			"khong khop: sau xoa boPhan=null",
			"chua co khuon: moi viet khuon=true",
		]);
	});
});
