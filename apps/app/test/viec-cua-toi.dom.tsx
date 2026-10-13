import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, type TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "api/app-router";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

type Json =
	| string
	| number
	| boolean
	| null
	| Json[]
	| { [khoa: string]: Json | undefined };

type DauVao = Json | undefined;

type Goi = { path: string; input: DauVao };
const traLoi = new Map<string, (input: DauVao) => Json | Promise<Json>>();
const daGoi: Goi[] = [];

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
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { viecMessages } = await import("@/lib/messages/viec");
const { messages: uiMessages } = await import("@crm/ui/lib/messages");

const V = viecMessages("vi");
const THU_LAI = uiMessages("vi").karaKhung.thuLai;
const urls: string[] = [];

let san: { o: HTMLElement; root: Root } | null = null;

const nguoi = (id: string, name: string) => ({ id, name, image: null });
const viec = (
	id: string,
	hanNgay: string | null,
	quaHan: boolean,
	trangThai = "CHUA_LAM",
) => ({
	id,
	tieuDe: `Việc ${id}`,
	trangThai,
	hanNgay,
	quaHan,
	nguoiGiao: nguoi("u-a", "Lê Quang Vinh"),
	nguoiThucHien: nguoi("u-b", "Phạm Thu Hà"),
	banGhi: [{ loai: "deal", id: "d1", ten: "Thoả thuận An Phát" }],
});

const DU_E7 = {
	mo: [
		viec("qh", "2026-10-12", true),
		viec("hn", "2026-10-14", false),
		viec("ts", "2026-10-21", false),
		viec("kh", null, false),
	],
	daXong: [viec("x", "2026-10-13", false, "XONG")],
	daHuy: [viec("h", "2026-10-13", false, "HUY")],
	demNhom: { "giao-cho-toi": 4, "toi-giao": 1, "dang-theo-doi": 1 },
};

async function moTrang(): Promise<void> {
	queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	san = { o, root };
	const man = await ViecPage();
	await act(async () => {
		root.render(
			<NuqsTestingAdapter
				hasMemory
				onUrlUpdate={(e) => urls.push(e.queryString)}
			>
				<QueryClientProvider client={queryClient}>
					<LocaleProvider locale="vi">
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
}

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
	document.body.innerHTML = "";
});

async function nhip() {
	await act(async () => {
		await new Promise((r) => setTimeout(r, 0));
	});
}

async function cho(dk: () => boolean, moTa: string) {
	for (let i = 0; i < 200; i += 1) {
		if (dk()) return;
		await nhip();
	}
	throw new Error(`het gio cho ${moTa}`);
}

async function bam(el: Element | null) {
	if (!el) throw new Error("khong co phan tu de bam");
	await act(async () => {
		el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
		el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
		(el as HTMLElement).click();
	});
	await nhip();
}

const giuTieuDe = (ca: string) => {
	const chu = document.body.textContent ?? "";
	if (!chu.includes(V.trang.tieuDe) || !chu.includes(V.trang.moTa)) {
		throw new Error(`vc: mat tieu de khi ${ca}`);
	}
};

describe("vc-man-co-viec", () => {
	test("vc-man-co-viec: ba chip có số, nhóm lên đường dẫn, bốn dòng đúng thứ tự, dòng quá hạn đỏ, hai dòng gập đóng sẵn", async () => {
		traLoi.set("viec.cuaToi", () => DU_E7);
		await moTrang();
		await cho(
			() => document.querySelectorAll("[data-nhom]").length === 3,
			"chip",
		);
		const so = ["giao-cho-toi", "toi-giao", "dang-theo-doi"].map(
			(n) =>
				document.querySelector(`[data-nhom="${n}"] [data-dem]`)?.textContent,
		);
		const nhan = ["giao-cho-toi", "toi-giao", "dang-theo-doi"].map(
			(n) => document.querySelector(`[data-nhom="${n}"]`)?.textContent ?? "",
		);
		if (
			JSON.stringify(so) !== JSON.stringify(["4", "1", "1"]) ||
			!nhan[0]?.includes(V.nhom["giao-cho-toi"]) ||
			!nhan[1]?.includes(V.nhom["toi-giao"]) ||
			!nhan[2]?.includes(V.nhom["dang-theo-doi"])
		) {
			throw new Error("vc: chip nhom sai");
		}
		const thuTu = [...document.querySelectorAll("tr[data-viec]")].map((e) =>
			e.getAttribute("data-viec"),
		);
		if (
			JSON.stringify(thuTu) !== JSON.stringify(["qh", "hn", "ts", "kh"]) ||
			document.querySelector(
				'tr[data-viec="qh"] [data-slot="status-indicator"][data-tone="error"]',
			) === null ||
			document.querySelectorAll(
				'tr[data-viec] [data-slot="status-indicator"][data-tone="error"]',
			).length !== 1
		) {
			throw new Error("vc: dong qua han khong do");
		}
		const gap = [...document.querySelectorAll("[data-dong-gap] button")].map(
			(b) => `${b.textContent}|${b.getAttribute("data-state")}`,
		);
		if (
			JSON.stringify(gap) !==
			JSON.stringify(["Đã xong (1)|closed", "Đã huỷ (1)|closed"])
		) {
			throw new Error("vc: dong gap sai");
		}
		await bam(document.querySelector('[data-nhom="toi-giao"]'));
		await cho(() => urls.some((u) => u.includes("nhom=toi-giao")), "duong dan");
		if (!urls.some((u) => u.includes("nhom=toi-giao"))) {
			throw new Error("vc: nhom khong len duong dan");
		}
	});

	test("vc-man-co-viec: đổi nhóm khi dữ liệu nhóm mới chưa về — chip vẫn còn, không hiện khung xương", async () => {
		let xong: (() => void) | null = null;
		const treo = new Promise<void>((r) => {
			xong = r;
		});
		traLoi.set("viec.cuaToi", async (vao) => {
			if ((vao as { nhom?: string } | null)?.nhom === "toi-giao") {
				await treo;
				return { ...DU_E7, mo: [viec("tg", null, false)] };
			}
			return DU_E7;
		});
		await moTrang();
		await cho(
			() => document.querySelectorAll("[data-nhom]").length === 3,
			"chip",
		);
		await bam(document.querySelector('[data-nhom="toi-giao"]'));
		await cho(
			() =>
				daGoi.some(
					(g) => (g.input as { nhom?: string } | null)?.nhom === "toi-giao",
				),
			"goi nhom moi",
		);
		await nhip();
		if (
			document.querySelectorAll("[data-nhom]").length !== 3 ||
			document.querySelector("[data-viec-cho-tai]") !== null
		) {
			throw new Error("vc: doi nhom mat chip");
		}
		await act(async () => {
			xong?.();
		});
		await cho(
			() => document.querySelector('tr[data-viec="tg"]') !== null,
			"du lieu nhom moi",
		);
	});

	test("vc-man-co-viec: đối chứng — không có việc quá hạn thì không dòng nào đỏ", async () => {
		traLoi.set("viec.cuaToi", () => ({
			...DU_E7,
			mo: DU_E7.mo.filter((v) => !v.quaHan),
		}));
		await moTrang();
		await cho(
			() => document.querySelectorAll("tr[data-viec]").length === 3,
			"ba dong",
		);
		expect(
			document.querySelectorAll(
				'tr[data-viec] [data-slot="status-indicator"][data-tone="error"]',
			).length,
		).toBe(0);
	});
});

describe("vc-man-trang-thai", () => {
	test("vc-man-trang-thai: chờ tải — khung xương, không vòng quay, tiêu đề giữ", async () => {
		traLoi.set("viec.cuaToi", () => new Promise(() => {}));
		await moTrang();
		await nhip();
		giuTieuDe("cho tai");
		if (
			document.querySelector("[data-viec-cho-tai]") === null ||
			document.querySelector('[data-slot="spinner"]') !== null
		) {
			throw new Error("vc: cho tai sai");
		}
	});

	test("vc-man-trang-thai: lỗi — VungTaiLoi có Thử lại, bấm gọi lại", async () => {
		traLoi.set("viec.cuaToi", () => {
			throw new Error("hong");
		});
		await moTrang();
		await cho(
			() => document.querySelector("[data-vung-tai-loi]") !== null,
			"vung loi",
		);
		giuTieuDe("loi");
		const truoc = daGoi.filter((g) => g.path === "viec.cuaToi").length;
		const nut =
			[...document.querySelectorAll("[data-vung-tai-loi] button")].find((b) =>
				(b.textContent ?? "").includes(THU_LAI),
			) ?? null;
		if (!nut) throw new Error("vc: loi tai sai");
		await bam(nut);
		await cho(
			() => daGoi.filter((g) => g.path === "viec.cuaToi").length > truoc,
			"goi lai",
		);
	});

	test("vc-man-trang-thai: rỗng — Empty có lời và nút Giao việc", async () => {
		traLoi.set("viec.cuaToi", () => ({
			mo: [],
			daXong: [],
			daHuy: [],
			demNhom: { "giao-cho-toi": 0, "toi-giao": 0, "dang-theo-doi": 0 },
		}));
		await moTrang();
		await cho(
			() =>
				document.querySelector(
					'[data-slot="empty"]:not([data-vung-tai-loi])',
				) !== null,
			"rong",
		);
		giuTieuDe("rong");
		const rong = document.querySelector(
			'[data-slot="empty"]:not([data-vung-tai-loi])',
		);
		const chu = rong?.textContent ?? "";
		if (
			!chu.includes("Chưa có việc nào giao cho bạn") ||
			![...(rong?.querySelectorAll("button") ?? [])].some(
				(b) => b.textContent === V.trang.giaoViec,
			)
		) {
			throw new Error("vc: rong sai");
		}
	});

	test("vc-man-trang-thai: đối chứng — có việc thì không ca nào trong ba ca hiện", async () => {
		traLoi.set("viec.cuaToi", () => DU_E7);
		await moTrang();
		await cho(
			() => document.querySelectorAll("tr[data-viec]").length === 4,
			"co viec",
		);
		expect(document.querySelector("[data-viec-cho-tai]")).toBeNull();
		expect(document.querySelector("[data-vung-tai-loi]")).toBeNull();
		expect(document.querySelector('[data-slot="empty"]')).toBeNull();
	});
});
