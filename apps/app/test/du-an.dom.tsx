import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	mock,
	test,
} from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, TRPCClientError, type TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "api/app-router";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { z } from "zod";

type Json =
	| string
	| number
	| boolean
	| null
	| Json[]
	| { [khoa: string]: Json | undefined };
type DauVao = Json | undefined;

const vaoGoi = z.object({
	trangThai: z.string().optional(),
	duAnId: z.string().optional(),
	batDauNgay: z.string().optional(),
	hanNgay: z.string().optional(),
});

const docVao = (vao: DauVao) => {
	const kq = vaoGoi.safeParse(vao);
	return kq.success ? kq.data : {};
};

const traLoi = new Map<string, (input: DauVao) => Json | Promise<Json>>();
const daGoi: { path: string; input: DauVao }[] = [];

const linkGia: TRPCLink<AppRouter> =
	() =>
	({ op }) =>
		observable((nguoiXem) => {
			const vao: DauVao = JSON.parse(JSON.stringify(op.input ?? null));
			daGoi.push({ path: op.path, input: vao });
			const lay = traLoi.get(op.path);
			Promise.resolve()
				.then(() => (lay ? lay(vao) : null))
				.then(
					(data) => {
						nguoiXem.next({ result: { type: "data", data } });
						nguoiXem.complete();
					},
					(loi: Error) => nguoiXem.error(loi as never),
				);
			return () => {};
		});

const trpcClient = createTRPCClient<AppRouter>({ links: [linkGia] });
let queryClient = new QueryClient();
mock.module("@/lib/trpc/client", () => ({
	useTRPC: () =>
		createTRPCOptionsProxy<AppRouter>({ client: trpcClient, queryClient }),
}));
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () =>
		new Proxy({}, { get: () => async () => queryClient.invalidateQueries() }),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/viec",
	useSearchParams: () => new URLSearchParams(),
}));
const toast: { loai: string; msg: string }[] = [];
mock.module("sonner", () => ({
	toast: {
		error: (msg: string) => toast.push({ loai: "loi", msg }),
		success: (msg: string) => toast.push({ loai: "xong", msg }),
	},
}));
mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => children,
}));
mock.module("@/lib/locale/server", () => ({ getLocale: async () => "vi" }));

const gocGantt = await import("@crm/ui/components/reui/gantt/gantt");
const GanttThat = gocGantt.Gantt;
type GanttProps = Parameters<typeof GanttThat>[0];
let ganttProps: Partial<GanttProps> = {};
mock.module("@crm/ui/components/reui/gantt/gantt", () => ({
	...gocGantt,
	Gantt: (props: Parameters<typeof GanttThat>[0]) => {
		ganttProps = props;
		return createElement(GanttThat, props);
	},
}));

const { default: ViecPage } = await import("@/app/(app)/[slug]/viec/page");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { viecMessages } = await import("@/lib/messages/viec");
const { duAnMessages } = await import("@/lib/messages/du-an");
const { dien } = await import("@/components/crm/record-sheet/plan-copy");
const { MUC_RAIL } = await import("@/lib/khung-dieu-huong");
const { messages: uiMessages } = await import("@crm/ui/lib/messages");

const V = viecMessages("vi");
const D = duAnMessages("vi");
const THU_LAI = uiMessages("vi").karaKhung.thuLai;
const urls: string[] = [];
let san: { o: HTMLElement; root: Root } | null = null;

const rongGoc = Object.getOwnPropertyDescriptor(
	window.HTMLElement.prototype,
	"clientWidth",
);
const mediaGoc = window.matchMedia;

beforeAll(() => {
	Object.defineProperty(window.HTMLElement.prototype, "clientWidth", {
		configurable: true,
		get: () => 1280,
	});
});

afterAll(() => {
	if (rongGoc) {
		Object.defineProperty(window.HTMLElement.prototype, "clientWidth", rongGoc);
	}
});

afterEach(async () => {
	if (san) {
		const { o, root } = san;
		await act(async () => root.unmount());
		o.remove();
	}
	san = null;
	traLoi.clear();
	daGoi.length = 0;
	urls.length = 0;
	toast.length = 0;
	ganttProps = {};
	window.matchMedia = mediaGoc;
	document.body.innerHTML = "";
});

const nguoi = (id: string, name: string) => ({ id, name, image: null });

type DuAnMau = {
	id: string;
	ten: string;
	soViec?: number;
	soXong?: number;
	dong?: boolean;
	coLichSu?: boolean;
	quyen?: { dong: boolean; xoa: boolean };
};

const duAn = (p: DuAnMau) => ({
	id: p.id,
	ten: p.ten,
	moTa: null,
	soViec: p.soViec ?? 3,
	soXong: p.soXong ?? 1,
	batDauSom: "2026-10-19",
	hanMuon: "2026-11-06",
	mocKe: { ten: "Go-live", ngay: "2026-10-30", tre: false },
	taoBoi: { id: "u-t", name: "Lê Quang Vinh" },
	dong: p.dong ?? false,
	coLichSu: p.coLichSu ?? true,
	quyen: p.quyen ?? { dong: true, xoa: false },
});

const P1 = duAn({ id: "p1", ten: "Triển khai Ngân hàng A" });
const P2 = duAn({ id: "p2", ten: "Triển khai Ngân hàng C" });
const P3 = duAn({ id: "p3", ten: "Triển khai đợt cũ", dong: true });

const viec = (id: string, duAnRa: { id: string; ten: string } | null) => ({
	id,
	tieuDe: `Việc ${id}`,
	trangThai: "CHUA_LAM",
	hanNgay: "2026-10-23",
	batDauNgay: "2026-10-20",
	duAn: duAnRa,
	quaHan: false,
	nguoiGiao: nguoi("u-a", "Lê Quang Vinh"),
	nguoiThucHien: nguoi("u-b", "Phạm Thu Hà"),
	banGhi: [],
});

const CUA_TOI = {
	mo: [viec("v1", { id: "p1", ten: P1.ten }), viec("v2", null)],
	daXong: [],
	daHuy: [],
	soXong: 0,
	soHuy: 0,
	demNhom: { "giao-cho-toi": 2, "toi-giao": 0, "dang-theo-doi": 0 },
};

const LICH = (dong: boolean) => ({
	duAn: { id: "p1", ten: P1.ten, moTa: null, dong, taoBoiId: "u-t" },
	viec: [
		{
			id: "v1",
			tieuDe: "Việc v1",
			chaId: null,
			batDau: "2026-10-20",
			han: "2026-10-23",
			nghia: "nhap",
			suaDuoc: true,
			phaiCho: [],
		},
	],
	moc: [],
	lich: { ngayNghiTuan: [6, 7], ngayLe: [] },
});

function datMacDinh(): void {
	traLoi.set("duAn.list", (vao) => {
		const trangThai = docVao(vao).trangThai;
		return trangThai === "dong" ? [P3] : [P1, P2];
	});
	traLoi.set("viec.cuaToi", () => CUA_TOI);
}

async function moTrang(query = ""): Promise<void> {
	queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	san = { o, root };
	const thamSo = new URLSearchParams(query);
	const man = await ViecPage({
		searchParams: Promise.resolve(Object.fromEntries(thamSo.entries())),
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter
				hasMemory
				onUrlUpdate={(e) => urls.push(e.queryString)}
				searchParams={query}
			>
				<QueryClientProvider client={queryClient}>
					<LocaleProvider locale="vi">
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	await nhip();
}

async function nhip(ms = 0) {
	await act(async () => {
		await new Promise((r) => setTimeout(r, ms));
	});
}

async function cho(dk: () => boolean, moTa: string) {
	for (let i = 0; i < 200; i += 1) {
		if (dk()) return;
		await nhip();
	}
	throw new Error(`het gio cho ${moTa}`);
}

async function bam(el: Element | null | undefined) {
	if (!el) throw new Error("khong co phan tu de bam");
	await act(async () => {
		el.dispatchEvent(
			new PointerEvent("pointerdown", { bubbles: true, button: 0 }),
		);
		el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
		el.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
		(el as HTMLElement).click();
	});
	await nhip();
}

async function go(el: HTMLInputElement, chu: string) {
	const datGiaTri = Object.getOwnPropertyDescriptor(
		HTMLInputElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		datGiaTri?.call(el, chu);
		el.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

const chuCua = (el: Element | null | undefined) =>
	(el?.textContent ?? "").trim();

const mucMenu = () =>
	[...document.querySelectorAll('[role="menuitem"]')].map((el) => chuCua(el));

const nutMenu = (chu: string) =>
	[...document.querySelectorAll('[role="menuitem"]')].find(
		(el) => chuCua(el) === chu,
	);

const nutChu = (chu: string) =>
	[...document.querySelectorAll("button")].find((b) => chuCua(b) === chu);

const urlCuoi = () => urls.at(-1) ?? "";

const lan = (n: number): number => n;

async function moPhamVi() {
	const nut = document.querySelector("[data-o-pham-vi]");
	await bam(nut);
	await cho(() => mucMenu().length > 0, "menu pham vi");
}

const loiTrpc = (msg: string, code: string, httpStatus: number) =>
	new TRPCClientError(msg, {
		result: {
			error: {
				code: -32600,
				message: msg,
				data: { code, httpStatus },
			},
		},
	});

describe("dg-man-ds", () => {
	test("dg-man-ds: mặc định Của tôi, ô Phạm vi, Tất cả dự án, tạo dự án, ba ca tải, 375", async () => {
		datMacDinh();
		await moTrang();
		await cho(
			() => document.querySelectorAll("[data-nhom]").length === 3,
			"chip",
		);
		if (
			!chuCua(document.querySelector("[data-o-pham-vi]")).includes(
				D.phamVi.cuaToi,
			) ||
			document.querySelector('[data-slot="simple-table"], table') === null
		) {
			throw new Error("dg: mac dinh khong phai cua toi");
		}
		if (MUC_RAIL.some((muc) => String(muc.key) === "du-an")) {
			throw new Error("dg: con muc du an rieng");
		}

		await moPhamVi();
		const muc = mucMenu();
		for (const can of [
			D.phamVi.cuaToi,
			D.phamVi.tatCa,
			P1.ten,
			P2.ten,
			dien(D.phamVi.daDong, { n: 1 }),
			D.phamVi.tao,
		]) {
			if (!muc.includes(can)) throw new Error(`dg: o pham vi thieu ${can}`);
		}

		await bam(nutMenu(D.phamVi.tatCa));
		await cho(
			() => document.querySelector("[data-du-an]") !== null,
			"bang du an",
		);
		if (!urlCuoi().includes("phamVi=tat-ca-du-an")) {
			throw new Error(`dg: url pham vi sai ${urlCuoi()}`);
		}
		const kieu = [
			...document.querySelectorAll('[data-view-switch="nut"] button'),
		].map((b) => chuCua(b));
		if (kieu.includes(D.gantt.nhanKieu)) {
			throw new Error("dg: gantt o tat ca du an");
		}
		const hang = [
			...document.querySelectorAll("tr[data-du-an]"),
		] as HTMLElement[];
		const dungHang = hang.filter((h) => {
			const chu = h.textContent ?? "";
			return (
				chu.includes(dien(D.ds.tienDo, { x: 1, y: 3 })) &&
				chu.includes("19/10 – 06/11") &&
				chu.includes("Go-live 30/10") &&
				chu.includes("Lê Quang Vinh")
			);
		});
		if (
			hang.length !== 2 ||
			dungHang.length !== 2 ||
			!(hang[0]?.textContent ?? "").includes(P1.ten)
		) {
			throw new Error(`dg: bang du an sai ${hang.length}`);
		}

		const dem = { tao: 0 };
		traLoi.set("duAn.tao", () => {
			dem.tao += 1;
			return { id: "p-moi" };
		});
		await moPhamVi();
		await bam(nutMenu(D.phamVi.tao));
		await cho(
			() => document.querySelector("[data-hop-du-an]") !== null,
			"hop tao",
		);
		await bam(nutChu(D.form.nutTao));
		const loiTen = document.querySelector(
			'[data-hop-du-an] [data-slot="field-error"]',
		);
		if (chuCua(loiTen) !== D.form.tenTrong || lan(dem.tao) !== 0) {
			throw new Error("dg: ten trong van gui");
		}
		const o = document.querySelector<HTMLInputElement>("#ten-du-an");
		if (!o) throw new Error("dg: thieu o ten");
		await go(o, "Triển khai Ngân hàng B");
		await bam(nutChu(D.form.nutTao));
		await cho(() => urlCuoi().includes("phamVi=p-moi"), "sang du an moi");
		if (lan(dem.tao) !== 1 || !urlCuoi().includes("xemViec=gantt")) {
			throw new Error("dg: tao khong sang pham vi moi");
		}
		expect(lan(dem.tao)).toBe(1);
	});

	test("dg-man-ds: ba ca tải ở Tất cả dự án, 375 là Item, giữ phạm vi khi tải lại", async () => {
		traLoi.set("viec.cuaToi", () => CUA_TOI);
		traLoi.set("duAn.list", () => new Promise<Json>(() => {}));
		await moTrang("?phamVi=tat-ca-du-an");
		await nhip(10);
		if (
			document.querySelector("[data-du-an-cho] [data-slot='skeleton']") ===
				null ||
			!(document.body.textContent ?? "").includes(V.trang.tieuDe)
		) {
			throw new Error("dg: ds cho tai sai");
		}
		if (
			!chuCua(document.querySelector("[data-o-pham-vi]")).includes(
				D.phamVi.tatCa,
			)
		) {
			throw new Error("dg: khong giu pham vi");
		}
	});

	test("dg-man-ds: lỗi tải ở Tất cả dự án có Thử lại", async () => {
		traLoi.set("viec.cuaToi", () => CUA_TOI);
		traLoi.set("duAn.list", () => {
			throw new Error("hong");
		});
		await moTrang("?phamVi=tat-ca-du-an");
		await cho(
			() => document.querySelector("[data-vung-tai-loi]") !== null,
			"loi",
		);
		const vung = document.querySelector("[data-vung-tai-loi]");
		if (
			!chuCua(vung).includes(D.ds.loi) ||
			![...(vung?.querySelectorAll("button") ?? [])].some((b) =>
				chuCua(b).includes(THU_LAI),
			)
		) {
			throw new Error("dg: ds loi sai");
		}
	});

	test("dg-man-ds: rỗng ở Tất cả dự án có nút tạo; 375 bảng là Item", async () => {
		traLoi.set("viec.cuaToi", () => CUA_TOI);
		traLoi.set("duAn.list", () => []);
		await moTrang("?phamVi=tat-ca-du-an");
		await cho(
			() =>
				document.querySelector(
					'[data-slot="empty"]:not([data-vung-tai-loi])',
				) !== null,
			"rong",
		);
		const rong = document.querySelector(
			'[data-slot="empty"]:not([data-vung-tai-loi])',
		);
		if (
			!chuCua(rong).includes(D.ds.rong) ||
			![...(rong?.querySelectorAll("button") ?? [])].some(
				(b) => chuCua(b) === D.ds.taoDuAn,
			)
		) {
			throw new Error("dg: ds rong sai");
		}
		await act(async () => root375());
		datMacDinh();
		await moTrangLai("?phamVi=tat-ca-du-an");
		await cho(
			() => document.querySelector("[data-du-an]") !== null,
			"bang 375",
		);
		const the = document.querySelectorAll('[data-slot="item"][data-du-an]');
		if (the.length !== 2) throw new Error("dg: 375 khong la item");
	});

	test("dg-man-ds: phamVi không tồn tại về Của tôi và báo một dòng", async () => {
		datMacDinh();
		traLoi.set("duAn.get", () => {
			throw loiTrpc("Không có dự án nào mang mã x.", "NOT_FOUND", 404);
		});
		await moTrang("?phamVi=khong-co");
		await cho(
			() => document.querySelector("[data-pham-vi-khong-thay]") !== null,
			"bao khong thay",
		);
		if (
			!chuCua(document.querySelector("[data-o-pham-vi]")).includes(
				D.phamVi.cuaToi,
			) ||
			urlCuoi().includes("khong-co")
		) {
			throw new Error("dg: pham vi la khong ve cua toi");
		}
	});
});

function root375() {
	window.matchMedia = ((q: string) => ({
		matches: q.includes("max-width"),
		media: q,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	})) as typeof window.matchMedia;
}

async function moTrangLai(query: string) {
	if (san) {
		const { o, root } = san;
		await act(async () => root.unmount());
		o.remove();
		san = null;
	}
	await moTrang(query);
}

describe("dg-man-dong", () => {
	const moDuAn = async (p: ReturnType<typeof duAn>, coViecMo = true) => {
		datMacDinh();
		traLoi.set("duAn.list", (vao) => {
			const trangThai = docVao(vao).trangThai;
			if (trangThai === "dong") return p.dong ? [p] : [];
			return p.dong ? [P2] : [p, P2];
		});
		traLoi.set("duAn.get", () => p);
		traLoi.set("duAn.lich", () => LICH(p.dong));
		await moTrangLai(`?phamVi=${p.id}`);
		await cho(
			() => document.querySelector("[data-dai-du-an]") !== null,
			"dai du an",
		);
		void coViecMo;
	};

	const moMenu = async () => {
		await bam(document.querySelector(`[aria-label="${D.dai.thaoTac}"]`));
		await cho(() => mucMenu().length > 0, "menu du an");
	};

	test("dg-man-dong: hỏi khi còn việc mở, thôi không gọi, đồng ý gọi một lần", async () => {
		const p = duAn({ id: "p1", ten: P1.ten, soViec: 3, soXong: 2 });
		await moDuAn(p);
		const dong = { n: 0 };
		traLoi.set("duAn.dong", () => {
			dong.n += 1;
			return { ok: true };
		});
		await moMenu();
		await bam(nutMenu(D.dai.dong));
		await cho(
			() =>
				document.querySelector('[role="alertdialog"]') !== null ||
				lan(dong.n) > 0,
			"hoi",
		);
		const hoi = chuCua(document.querySelector('[role="alertdialog"]'));
		if (!hoi.includes(dien(D.dai.hoiDong, { n: 1 })) || lan(dong.n) !== 0) {
			throw new Error("dg: dong khong hoi");
		}
		await bam(nutChu(D.dai.thoi));
		await nhip(10);
		if (lan(dong.n) !== 0) throw new Error("dg: thoi van dong");
		await moMenu();
		await bam(nutMenu(D.dai.dong));
		await cho(
			() => document.querySelector('[role="alertdialog"]') !== null,
			"hoi lan hai",
		);
		await bam(nutChu(D.dai.vanDong));
		await cho(() => lan(dong.n) > 0, "goi dong");
		await nhip(10);
		if (lan(dong.n) !== 1) throw new Error("dg: dong goi sai");
	});

	test("dg-man-dong: hết việc mở thì đóng không hỏi", async () => {
		const p = duAn({ id: "p1", ten: P1.ten, soViec: 3, soXong: 3 });
		await moDuAn(p);
		const dong = { n: 0 };
		traLoi.set("duAn.dong", () => {
			dong.n += 1;
			return { ok: true };
		});
		await moMenu();
		await bam(nutMenu(D.dai.dong));
		await cho(() => lan(dong.n) > 0, "dong thang");
		if (document.querySelector('[role="alertdialog"]') !== null) {
			throw new Error("dg: hoi thua");
		}
	});

	test("dg-man-dong: dự án đã đóng chỉ đọc", async () => {
		const p = duAn({ id: "p1", ten: P1.ten, dong: true });
		await moDuAn(p);
		await cho(() => (ganttProps.events?.length ?? 0) > 0, "gantt");
		const dai = chuCua(document.querySelector("[data-dai-du-an]"));
		if (!dai.includes(D.dai.daDong)) throw new Error("dg: trang dong sai dai");
		if (ganttProps.events?.some((e) => e.draggable !== false)) {
			throw new Error("dg: trang dong sai thanh");
		}
		await moMenu();
		if (!mucMenu().includes(D.dai.moLai))
			throw new Error("dg: trang dong sai mo lai");
		await act(async () => {
			document.dispatchEvent(
				new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
			);
		});
		await nhip();
		await bam(nutChu(V.trang.giaoViec));
		await cho(
			() => document.querySelector("[data-o-soan-viec]") !== null,
			"o soan",
		);
		const oDuAn = document.querySelector(`[aria-label="${V.oSoan.duAn}"]`);
		if (chuCua(oDuAn).includes(P1.ten))
			throw new Error("dg: trang dong sai giao viec");
		await bam(oDuAn);
		await nhip(10);
		const chon = [...document.querySelectorAll('[role="option"]')].map((x) =>
			chuCua(x),
		);
		if (chon.some((x) => x.includes(P1.ten))) {
			throw new Error("dg: trang dong sai o soan");
		}
	});

	test("dg-man-dong: có lịch sử thì không Xoá; người khác không thấy Đóng", async () => {
		await moDuAn(
			duAn({
				id: "p1",
				ten: P1.ten,
				coLichSu: true,
				quyen: { dong: true, xoa: false },
			}),
		);
		await moMenu();
		if (mucMenu().includes(D.dai.xoa)) throw new Error("dg: xoa hien sai");
		await moDuAn(
			duAn({ id: "p1", ten: P1.ten, quyen: { dong: false, xoa: false } }),
		);
		await moMenu();
		if (mucMenu().includes(D.dai.dong))
			throw new Error("dg: dong hien cho khac");
	});
});
