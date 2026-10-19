import { afterEach, beforeEach, describe, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, TRPCClientError, type TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "api/app-router";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	datHinhHocKeo,
	keoBangPhim,
} from "../../../packages/ui/test/hinh-hoc-keo";

type Json =
	| string
	| number
	| boolean
	| null
	| Json[]
	| { [khoa: string]: Json | undefined };
type DauVao = Json | undefined;

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
	useCrmCache: () => new Proxy({}, { get: () => async () => {} }),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/viec",
	useSearchParams: () => new URLSearchParams(),
}));
mock.module("sonner", () => ({
	toast: { error: () => {}, success: () => {} },
}));
mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => children,
}));
mock.module("@/lib/locale/server", () => ({ getLocale: async () => "vi" }));

const { default: ViecPage } = await import("@/app/(app)/[slug]/viec/page");
const { RecordSheetHost } = await import(
	"@/components/crm/record-sheet/record-sheet-host"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { viecMessages } = await import("@/lib/messages/viec");
const { dien } = await import("@/components/crm/record-sheet/plan-copy");

const V = viecMessages("vi");
let san: { o: HTMLElement; root: Root } | null = null;

const nguoi = (id: string, name: string) => ({ id, name, image: null });
const A = nguoi("u-a", "Lê Quang Vinh");
const B = nguoi("u-b", "Phạm Thu Hà");

async function cho(ms = 30): Promise<void> {
	await act(async () => {
		await new Promise((r) => setTimeout(r, ms));
	});
}

async function mo(man: ReactElement, query: string): Promise<void> {
	queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	san = { o, root };
	await act(async () => {
		root.render(
			<NuqsTestingAdapter hasMemory searchParams={query}>
				<QueryClientProvider client={queryClient}>
					<LocaleProvider locale="vi">
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	await cho();
}

async function dong(): Promise<void> {
	if (san) {
		const { o, root } = san;
		await act(async () => root.unmount());
		o.remove();
		san = null;
	}
	document.body.innerHTML = "";
}

async function bam(el: Element | null | undefined): Promise<void> {
	if (!(el instanceof HTMLElement))
		throw new Error("kv: khong co phan tu de bam");
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
	await cho();
}

async function go(el: Element | null, chu: string): Promise<void> {
	if (!(el instanceof HTMLInputElement))
		throw new Error("kv: khong co o de go");
	const dat = Object.getOwnPropertyDescriptor(
		HTMLInputElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		dat?.call(el, chu);
		el.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

const nutChu = (chu: string) =>
	[...document.querySelectorAll("button")].find(
		(b) => (b.textContent ?? "").trim() === chu,
	);

const dem = (path: string) => daGoi.filter((g) => g.path === path).length;

function chiTiet(
	id: string,
	tieuDe: string,
	trangThai: string,
	dich: string[],
) {
	return {
		id,
		tieuDe,
		trangThai,
		hanNgay: "2026-10-20",
		quaHan: false,
		nguoiGiao: A,
		nguoiThucHien: B,
		banGhi: [{ loai: "deal", id: "d1", ten: "Thoả thuận An Phát" }],
		moTa: null,
		nguoiTheoDoi: [],
		coLichSu: true,
		quyen: {
			trangThai: dich,
			sua: true,
			doiNguoi: false,
			gan: true,
			theoDoiKhac: true,
			dangTheoDoi: false,
			xoa: false,
		},
	};
}

const CON_K = {
	id: "k1",
	tieuDe: "Mở tài khoản đại lý",
	trangThai: "CHUA_LAM",
	nguoiThucHien: B,
};

async function moKhung(du: Json, con: Json): Promise<void> {
	traLoi.set("viec.get", () => du);
	traLoi.set("viec.con", () => con);
	traLoi.set("viec.lichSu", () => []);
	traLoi.set("onboarding.nguoiNhanViec", () => [A, B]);
	traLoi.set("users.me", () => B);
	await mo(<RecordSheetHost />, `?record=viec:${(du as { id: string }).id}`);
	await cho(60);
}

function the(id: string, trangThai: string, con: Json, conMo: number) {
	return {
		id,
		tieuDe: `Việc ${id}`,
		trangThai,
		hanNgay: "2026-10-20",
		quaHan: false,
		nguoiGiao: A,
		nguoiThucHien: B,
		banGhi: [],
		chuyenDuoc: ["DANG_LAM", "CHO_DANH_GIA", "XONG"],
		con,
		cha: null,
		conMo,
	};
}

async function moBang(): Promise<void> {
	traLoi.set("viec.cuaToi", () => ({
		mo: [],
		daXong: [],
		daHuy: [],
		soXong: 0,
		soHuy: 0,
		demNhom: { "giao-cho-toi": 2, "toi-giao": 0, "dang-theo-doi": 0 },
	}));
	traLoi.set("viec.bang", () => ({
		cot: [
			{
				trangThai: "CHUA_LAM",
				tong: 2,
				viec: [
					the("p", "CHUA_LAM", { xong: 1, tong: 2 }, 1),
					the("q", "CHUA_LAM", null, 0),
				],
			},
			{ trangThai: "DANG_LAM", tong: 0, viec: [] },
			{ trangThai: "CHO_DANH_GIA", tong: 0, viec: [] },
			{ trangThai: "XONG", tong: 0, viec: [] },
		],
		soHuy: 0,
		daHuy: [],
	}));
	traLoi.set("viec.keo", () => ({ ok: true }));
	const man = await ViecPage();
	await mo(man, "?xemViec=bang");
}

let traHinhHoc: (() => void) | null = null;
beforeEach(() => {
	traHinhHoc = datHinhHocKeo();
});

afterEach(async () => {
	traHinhHoc?.();
	traHinhHoc = null;
	await dong();
	traLoi.clear();
	daGoi.length = 0;
});

describe("kv-man-con", () => {
	test("kv-man-con: khung cha có mục Việc con, thêm con gọi đúng, lỗi giữ chữ", async () => {
		await moKhung(chiTiet("p1", "Triển khai An Phát", "DANG_LAM", ["XONG"]), {
			cha: null,
			con: [CON_K],
			conMo: 1,
			themDuoc: true,
		});
		const muc = document.querySelector("[data-muc-viec-con]");
		if (
			!muc?.textContent?.includes(dien(V.con.muc, { xong: 0, tong: 1 })) ||
			!document.querySelector('[data-viec-con="k1"]')
		) {
			throw new Error("kv: khung thieu muc con");
		}
		await bam(document.querySelector("[data-them-viec-con]"));
		await go(
			document.querySelector('input[name="tieuDeViecCon"]'),
			"Đặt lịch đào tạo",
		);
		traLoi.set("viec.taoCon", () => ({ id: "k2" }));
		await bam(nutChu(V.con.themNut));
		const goi = daGoi.filter((g) => g.path === "viec.taoCon");
		const vao = goi[0]?.input as
			| { chaId?: string; tieuDe?: string }
			| undefined;
		if (
			goi.length !== 1 ||
			vao?.chaId !== "p1" ||
			vao.tieuDe !== "Đặt lịch đào tạo"
		) {
			throw new Error(`kv: them con goi sai ${JSON.stringify(goi)}`);
		}
		await bam(document.querySelector("[data-them-viec-con]"));
		await go(
			document.querySelector('input[name="tieuDeViecCon"]'),
			"Việc hỏng",
		);
		traLoi.set("viec.taoCon", () => {
			throw new TRPCClientError("Chỉ thêm việc con cho việc đang mở.", {
				result: {
					error: {
						code: -32600,
						message: "Chỉ thêm việc con cho việc đang mở.",
						data: { code: "BAD_REQUEST", httpStatus: 400 },
					},
				},
			} as never);
		});
		await bam(nutChu(V.con.themNut));
		const o = document.querySelector('input[name="tieuDeViecCon"]');
		if (
			!(o instanceof HTMLInputElement) ||
			o.value !== "Việc hỏng" ||
			!document.body.textContent?.includes(
				"Chỉ thêm việc con cho việc đang mở.",
			)
		) {
			throw new Error("kv: them con mat chu");
		}
	});

	test("kv-man-con: khung con có dòng Thuộc việc, không nút thêm", async () => {
		await moKhung(
			chiTiet("k1", "Mở tài khoản đại lý", "CHUA_LAM", ["DANG_LAM"]),
			{
				cha: { id: "p1", tieuDe: "Triển khai An Phát" },
				con: [],
				conMo: 0,
				themDuoc: false,
			},
		);
		const thuoc = document.querySelector("[data-thuoc-viec]");
		if (
			!thuoc?.textContent?.includes("Triển khai An Phát") ||
			document.querySelector("[data-them-viec-con]")
		) {
			throw new Error("kv: khung con sai");
		}
	});

	test("kv-man-con: đối chứng — người chỉ theo dõi không có nút thêm", async () => {
		await moKhung(chiTiet("p1", "Triển khai An Phát", "DANG_LAM", []), {
			cha: null,
			con: [CON_K],
			conMo: 1,
			themDuoc: false,
		});
		if (!document.querySelector('[data-viec-con="k1"]')) {
			throw new Error("kv: khung thieu muc con");
		}
		if (document.querySelector("[data-them-viec-con]")) {
			throw new Error("kv: theo doi them con duoc");
		}
	});
});

describe("kv-man-hoi-cha", () => {
	test("kv-man-hoi-cha: thẻ cha đếm con, thả và menu sang Xong đều hỏi lại", async () => {
		await moBang();
		const theP = document.querySelector('[data-the-viec="p"]');
		if (
			!theP?.textContent?.includes(dien(V.bang.conXong, { xong: 1, tong: 2 }))
		) {
			throw new Error("kv: the cha sai dem");
		}
		const hoi = dien(V.con.hoiXong, { n: 1 });
		await keoBangPhim(document.body, "p", [
			"ArrowRight",
			"ArrowRight",
			"ArrowRight",
		]);
		await cho();
		if (!document.body.textContent?.includes(hoi) || dem("viec.keo") !== 0) {
			throw new Error("kv: khong hoi lai dong cha");
		}
		await bam(nutChu(V.con.thoi));
		if (dem("viec.keo") !== 0 || document.body.textContent?.includes(hoi)) {
			throw new Error("kv: thoi van ghi");
		}
		await keoBangPhim(document.body, "p", [
			"ArrowRight",
			"ArrowRight",
			"ArrowRight",
		]);
		await cho();
		await bam(nutChu(V.con.dongYXong));
		const goi = daGoi.filter((g) => g.path === "viec.keo");
		if (
			goi.length !== 1 ||
			(goi[0]?.input as { den?: string })?.den !== "XONG"
		) {
			throw new Error("kv: dong y khong ghi");
		}
		daGoi.length = 0;
		await bam(document.querySelector('[data-the-viec="p"] [data-chuyen-sang]'));
		await bam(document.querySelector('[data-dich="XONG"]'));
		if (!document.body.textContent?.includes(hoi) || dem("viec.keo") !== 0) {
			throw new Error("kv: menu dong cha khong hoi");
		}
		await bam(nutChu(V.con.thoi));
		await keoBangPhim(document.body, "q", [
			"ArrowRight",
			"ArrowRight",
			"ArrowRight",
		]);
		await cho();
		await bam(document.querySelector('[data-the-viec="q"] [data-chuyen-sang]'));
		await bam(document.querySelector('[data-dich="XONG"]'));
		if (
			dem("viec.keo") !== 2 ||
			document.body.textContent?.includes(dien(V.con.hoiXong, { n: 0 }))
		) {
			throw new Error("kv: hoi ca khi khong con");
		}
	});

	test("kv-man-hoi-cha: nút Xong và Huỷ trong khung cha hỏi lại", async () => {
		await moKhung(
			chiTiet("p1", "Triển khai An Phát", "DANG_LAM", ["XONG", "HUY"]),
			{
				cha: null,
				con: [CON_K],
				conMo: 1,
				themDuoc: true,
			},
		);
		await bam(
			[...document.querySelectorAll("[data-nut-trang-thai] button")].find(
				(b) => b.textContent?.trim() === V.nut.xong,
			),
		);
		if (
			!document.body.textContent?.includes(dien(V.con.hoiXong, { n: 1 })) ||
			dem("viec.doiTrangThai") !== 0
		) {
			throw new Error("kv: khung xong khong hoi");
		}
		await bam(nutChu(V.con.thoi));
		await bam(
			[...document.querySelectorAll("[data-nut-trang-thai] button")].find(
				(b) => b.textContent?.trim() === V.nut.huy,
			),
		);
		if (!document.body.textContent?.includes(dien(V.con.hoiHuy, { n: 1 }))) {
			throw new Error("kv: khung huy khong hoi");
		}
	});
});
