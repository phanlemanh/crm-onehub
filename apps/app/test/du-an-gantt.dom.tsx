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

const chuCua = (el: Element | null | undefined) =>
	(el?.textContent ?? "").trim();

const nutChu = (chu: string) =>
	[...document.querySelectorAll("button")].find((b) => chuCua(b) === chu);

const urlCuoi = () => urls.at(-1) ?? "";

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

const NGAY_MS = 24 * 60 * 60 * 1000;
const KHUON_NGAY = /^\d{4}-\d{2}-\d{2}$/;

const so = (ds: readonly unknown[]) => ds.length;

const thanhLich = (
	id: string,
	batDau: string | null,
	han: string | null,
	suaDuoc: boolean,
) => ({
	id,
	tieuDe: `Việc ${id}`,
	chaId: null,
	batDau,
	han,
	nghia: "nhap",
	suaDuoc,
	phaiCho: [],
});

const LICH_P = {
	duAn: { id: "p1", ten: P1.ten, moTa: null, dong: false, taoBoiId: "u-t" },
	viec: [
		thanhLich("v", "2026-10-19", "2026-10-21", true),
		thanhLich("v2", "2026-10-22", "2026-10-23", false),
		thanhLich("v3", null, null, true),
	],
	moc: [
		{
			id: "m",
			ten: "Go-live",
			ngay: "2026-10-30",
			tre: false,
			treBoi: [],
			cho: [],
		},
	],
	lich: { ngayNghiTuan: [6, 7], ngayLe: [] },
};

const CUA_DU_AN = {
	mo: [
		viec("v", { id: "p1", ten: P1.ten }),
		viec("v2", { id: "p1", ten: P1.ten }),
	],
	daXong: [],
	daHuy: [],
	soXong: 0,
	soHuy: 0,
	demNhom: { "giao-cho-toi": 0, "toi-giao": 0, "dang-theo-doi": 0 },
};

function datDuAn(lich: () => Json | Promise<Json> = () => LICH_P): void {
	datMacDinh();
	traLoi.set("duAn.get", () => P1);
	traLoi.set("duAn.lich", lich);
	traLoi.set("viec.cuaToi", (vao) => {
		const duAnId = docVao(vao).duAnId ?? null;
		return duAnId ? CUA_DU_AN : CUA_TOI;
	});
}

const nutKieu = (chu: string) =>
	[...document.querySelectorAll('[data-view-switch="nut"] button')].find(
		(b) => chuCua(b) === chu,
	);

const kieuCo = () =>
	[...document.querySelectorAll('[data-view-switch="nut"] button')].map((b) =>
		chuCua(b),
	);

const suKien = (id: string) => ganttProps.events?.find((e) => e.id === id);

describe("dg-man-gantt", () => {
	test("dg-man-gantt: phạm vi dự án mặc định Gantt, ViewSwitch ghi URL, Danh sách có Bắt đầu, Bảng lọc dự án", async () => {
		datDuAn();
		await moTrang("?phamVi=p1");
		await cho(
			() =>
				document.querySelector("[data-gantt-du-an]") !== null &&
				document.querySelector("[data-dai-du-an]") !== null,
			"gantt",
		);
		const dai = chuCua(document.querySelector("[data-dai-du-an]"));
		if (!dai.includes(P1.ten) || !dai.includes("Go-live 30/10")) {
			throw new Error("dg: pham vi du an mac dinh khong phai gantt");
		}

		await bam(nutKieu(V.bang.danhSach));
		await cho(() => urlCuoi().includes("xemViec=danh-sach"), "danh sach");
		if (!urlCuoi().includes("phamVi=p1")) {
			throw new Error(`dg: url kieu xem sai ${urlCuoi()}`);
		}
		await cho(
			() => document.querySelector("tr[data-viec]") !== null,
			"dong viec",
		);
		const tieuDeCot = chuCua(document.querySelector("thead"));
		const dong = [...document.querySelectorAll("tr[data-viec]")].map((h) =>
			h.getAttribute("data-viec"),
		);
		const goiDs = daGoi.filter((g) => g.path === "viec.cuaToi");
		const goiCuoi = goiDs.at(-1)?.input;
		const duAnGoi = docVao(goiCuoi).duAnId ?? null;
		if (
			!tieuDeCot.includes(D.viec.batDau) ||
			duAnGoi !== "p1" ||
			dong.some((id) => id !== "v" && id !== "v2")
		) {
			throw new Error("dg: danh sach sai");
		}

		await bam(nutKieu(D.gantt.nhanKieu));
		await cho(() => urlCuoi().includes("xemViec=gantt"), "ve gantt");
		if (!urlCuoi().includes("phamVi=p1")) {
			throw new Error(`dg: url kieu xem sai ${urlCuoi()}`);
		}

		await bam(nutKieu(V.bang.bang));
		await cho(() => daGoi.some((g) => g.path === "viec.bang"), "goi bang");
		const bang = daGoi.find((g) => g.path === "viec.bang")?.input;
		const duAnBang = docVao(bang).duAnId ?? null;
		if (duAnBang !== "p1") throw new Error("dg: bang khong loc du an");
		expect(duAnBang).toBe("p1");
	});

	test("dg-man-gantt: Của tôi với xemViec=gantt hiện Danh sách và không có mục Gantt", async () => {
		datDuAn();
		await moTrang("?phamVi=cua-toi&xemViec=gantt");
		await cho(
			() => document.querySelector("tr[data-viec]") !== null,
			"danh sach",
		);
		if (
			kieuCo().includes(D.gantt.nhanKieu) ||
			document.querySelector("[data-gantt-du-an]") !== null
		) {
			throw new Error("dg: gantt lot ra cua toi");
		}
	});

	test("dg-man-gantt: chờ tải, lỗi tải, không việc; giữ kiểu xem khi tải lại", async () => {
		datDuAn(() => new Promise<Json>(() => {}));
		await moTrang("?phamVi=p1");
		await cho(() => document.querySelector("[data-dai-du-an]") !== null, "dai");
		if (
			document.querySelector("[data-gantt-cho-tai]") === null ||
			!(document.body.textContent ?? "").includes(V.trang.tieuDe)
		) {
			throw new Error("dg: gantt cho tai sai");
		}

		datDuAn(() => {
			throw new Error("hong");
		});
		await moTrangLai("?phamVi=p1");
		await cho(
			() => document.querySelector("[data-vung-tai-loi]") !== null,
			"loi",
		);
		const vung = document.querySelector("[data-vung-tai-loi]");
		if (
			!chuCua(vung).includes(D.gantt.loi) ||
			![...(vung?.querySelectorAll("button") ?? [])].some((b) =>
				chuCua(b).includes(THU_LAI),
			)
		) {
			throw new Error("dg: gantt loi sai");
		}

		datDuAn(() => ({ ...LICH_P, viec: [], moc: [] }));
		await moTrangLai("?phamVi=p1");
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
			!chuCua(rong).includes(D.gantt.rong) ||
			![...(rong?.querySelectorAll("button") ?? [])].some(
				(b) => chuCua(b) === D.gantt.giaoViec,
			)
		) {
			throw new Error("dg: gantt rong sai");
		}

		datDuAn();
		await moTrangLai("?phamVi=p1&xemViec=bang");
		await cho(() => daGoi.some((g) => g.path === "viec.bang"), "bang");
		const dangChon = document.querySelector(
			'[data-view-switch="nut"] button[data-state="on"]',
		);
		if (chuCua(dangChon) !== V.bang.bang)
			throw new Error("dg: khong giu kieu xem");
	});
});

describe("dg-man-keo", () => {
	const moGantt = async () => {
		await moTrangLai("?phamVi=p1");
		await cho(() => suKien("v") !== undefined, "thanh v");
	};

	test("dg-man-keo: thả gọi doiLich, phím dời một ngày, V2 khoá, khuôn ngày", async () => {
		const goiDoi: DauVao[] = [];
		datDuAn();
		traLoi.set("viec.doiLich", (vao) => {
			goiDoi.push(vao);
			return { daDoi: [] };
		});
		await moGantt();
		const v = suKien("v");
		if (!v || !ganttProps.onEventUpdate) throw new Error("dg: thieu thanh v");
		await act(async () => {
			ganttProps.onEventUpdate?.({
				event: v,
				start: new Date(v.start.getTime() + 2 * NGAY_MS),
				end: new Date(v.end.getTime() + 2 * NGAY_MS),
				allDay: true,
				occurrence: null,
				source: "drag",
			});
		});
		await cho(() => so(goiDoi) > 0, "goi doi lich");
		await nhip(10);
		const dau = goiDoi[0];
		if (
			so(goiDoi) !== 1 ||
			JSON.stringify(dau) !==
				JSON.stringify({
					id: "v",
					batDauNgay: "2026-10-21",
					hanNgay: "2026-10-23",
				})
		) {
			throw new Error(`dg: tha khong goi doiLich ${JSON.stringify(goiDoi)}`);
		}
		for (const g of goiDoi) {
			const o = docVao(g);
			if (
				!KHUON_NGAY.test(String(o.batDauNgay)) ||
				!KHUON_NGAY.test(String(o.hanNgay))
			) {
				throw new Error(`dg: khuon ngay gui sai ${JSON.stringify(g)}`);
			}
		}

		const thanhV = document.querySelector<HTMLElement>('[data-viec="v"]');
		if (!thanhV) throw new Error("dg: phim khong doi lich");
		await act(async () => {
			thanhV.focus();
			thanhV.dispatchEvent(
				new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
			);
		});
		await act(async () => {
			thanhV.dispatchEvent(
				new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
			);
		});
		await nhip(10);
		if (
			so(goiDoi) !== 2 ||
			JSON.stringify(goiDoi[1]) !==
				JSON.stringify({
					id: "v",
					batDauNgay: "2026-10-20",
					hanNgay: "2026-10-22",
				})
		) {
			throw new Error(`dg: phim khong doi lich ${JSON.stringify(goiDoi)}`);
		}

		const v2 = suKien("v2");
		const thanhV2 = document.querySelector<HTMLElement>('[data-viec="v2"]');
		await act(async () => {
			thanhV2?.focus();
			thanhV2?.dispatchEvent(
				new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
			);
			thanhV2?.dispatchEvent(
				new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
			);
		});
		await nhip(10);
		if (v2?.draggable !== false || so(goiDoi) !== 2) {
			throw new Error("dg: v2 keo duoc");
		}
		expect(so(goiDoi)).toBe(2);
	});

	test("dg-man-keo: 375 Đặt ngày cho việc chưa có lịch", async () => {
		const goiDoi: DauVao[] = [];
		root375();
		datDuAn();
		traLoi.set("viec.doiLich", (vao) => {
			goiDoi.push(vao);
			return { daDoi: [] };
		});
		await moGantt();
		await bam(nutChu(uiMessages("vi").gantt.datNgay));
		await cho(
			() =>
				document.querySelectorAll(
					'[role="dialog"] [data-slot="date-picker-trigger"]',
				).length === 2,
			"hop dat ngay",
		);
		const chonNgay = async (thu: number, ngay: string) => {
			const trigger = document.querySelectorAll(
				'[role="dialog"] [data-slot="date-picker-trigger"]',
			)[thu];
			let o: Element | null = null;
			for (let lan = 0; lan < 5 && o === null; lan += 1) {
				await bam(trigger);
				for (let k = 0; k < 20 && o === null; k += 1) {
					await nhip(1);
					o = document.body.querySelector(`button[data-day="${ngay}"]`);
				}
			}
			await bam(o);
		};
		await chonNgay(0, "2026-10-19");
		await chonNgay(1, "2026-10-21");
		await bam(nutChu(D.gantt.luu));
		await cho(() => so(goiDoi) > 0, "luu dat ngay");
		if (
			JSON.stringify(goiDoi[0]) !==
			JSON.stringify({
				id: "v3",
				batDauNgay: "2026-10-19",
				hanNgay: "2026-10-21",
			})
		) {
			throw new Error(`dg: dat ngay 375 sai ${JSON.stringify(goiDoi)}`);
		}
	});

	test("dg-man-keo: máy chủ từ chối thì thanh về chỗ cũ và toast đúng lời; thành công thì làm mới", async () => {
		const LOI = "Việc này phải bắt đầu sau khi «A» xong (hạn 23/10).";
		datDuAn();
		traLoi.set("viec.doiLich", () => {
			throw loiTrpc(LOI, "BAD_REQUEST", 400);
		});
		await moGantt();
		const v = suKien("v");
		if (!v) throw new Error("dg: thieu thanh v");
		const batDauCu = v.start.getTime();
		await act(async () => {
			ganttProps.onEventUpdate?.({
				event: v,
				start: new Date(v.start.getTime() + 2 * NGAY_MS),
				end: new Date(v.end.getTime() + 2 * NGAY_MS),
				allDay: true,
				occurrence: null,
				source: "drag",
			});
		});
		await cho(() => toast.length > 0, "toast");
		await nhip(10);
		if (suKien("v")?.start.getTime() !== batDauCu) {
			throw new Error("dg: thanh khong ve cho cu");
		}
		const loi = toast.filter((t) => t.loai === "loi");
		if (loi.length !== 1 || loi[0]?.msg !== LOI) {
			throw new Error("dg: toast sai loi");
		}

		toast.length = 0;
		traLoi.set("viec.doiLich", () => ({ daDoi: [] }));
		const lichTruoc = daGoi.filter((g) => g.path === "duAn.lich").length;
		const v2 = suKien("v");
		if (!v2) throw new Error("dg: doi chung keo hong");
		await act(async () => {
			ganttProps.onEventUpdate?.({
				event: v2,
				start: new Date(v2.start.getTime() + NGAY_MS),
				end: new Date(v2.end.getTime() + NGAY_MS),
				allDay: true,
				occurrence: null,
				source: "drag",
			});
		});
		await cho(
			() => daGoi.filter((g) => g.path === "duAn.lich").length > lichTruoc,
			"lam moi lich",
		);
		if (toast.some((t) => t.loai === "loi"))
			throw new Error("dg: doi chung keo hong");
	});
});
