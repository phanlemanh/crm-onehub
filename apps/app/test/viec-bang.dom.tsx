import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, TRPCClientError, type TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "api/app-router";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, createElement, type ReactNode } from "react";
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
	useCrmCache: () =>
		new Proxy({}, { get: () => async () => queryClient.invalidateQueries() }),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/viec",
	useSearchParams: () => new URLSearchParams(),
}));
const toastLoi: { msg: string; action?: { label: string } }[] = [];
mock.module("sonner", () => ({
	toast: {
		error: (msg: string, o?: { action?: { label: string } }) =>
			toastLoi.push({ msg, action: o?.action }),
		success: () => {},
	},
}));
mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => children,
}));
mock.module("@/lib/locale/server", () => ({ getLocale: async () => "vi" }));

type BoardProps = {
	onMove?: (m: {
		cardId: string;
		from: string;
		to: string;
		order?: string[];
	}) => void;
	canDrop?: (cardId: string, columnId: string) => boolean;
	pendingIds?: readonly string[];
};
let boardProps: BoardProps = {};
const goc = await import("@crm/ui/components/board");
const BoardThat = goc.Board;
const boardDropThat = goc.boardDrop;
mock.module("@crm/ui/components/board", () => ({
	boardDrop: boardDropThat,
	Board: (props: Parameters<typeof BoardThat>[0]) => {
		boardProps = props;
		return createElement(BoardThat, props);
	},
}));

const { default: ViecPage } = await import("@/app/(app)/[slug]/viec/page");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { viecMessages } = await import("@/lib/messages/viec");
const { dien } = await import("@/components/crm/record-sheet/plan-copy");
const { messages: uiMessages } = await import("@crm/ui/lib/messages");

const V = viecMessages("vi");
const THU_LAI = uiMessages("vi").karaKhung.thuLai;
const urls: string[] = [];
let san: { o: HTMLElement; root: Root } | null = null;

const nguoi = (id: string, name: string) => ({ id, name, image: null });
type TT = "CHUA_LAM" | "DANG_LAM" | "CHO_DANH_GIA" | "XONG";

function the(
	id: string,
	trangThai: TT,
	chuyenDuoc: string[],
	them: Record<string, Json> = {},
) {
	return {
		id,
		tieuDe: `Việc ${id}`,
		trangThai,
		hanNgay: "2026-10-20",
		quaHan: false,
		nguoiGiao: nguoi("u-a", "Lê Quang Vinh"),
		nguoiThucHien: nguoi("u-b", "Phạm Thu Hà"),
		banGhi: [],
		chuyenDuoc,
		con: null,
		cha: null,
		conMo: 0,
		...them,
	};
}

type The = ReturnType<typeof the>;

function bangTu(ds: The[], tongXong = 0, soHuy = 0) {
	const cot = (["CHUA_LAM", "DANG_LAM", "CHO_DANH_GIA", "XONG"] as const).map(
		(trangThai) => {
			const viec = ds.filter((v) => v.trangThai === trangThai);
			return {
				trangThai,
				tong:
					trangThai === "XONG" ? Math.max(tongXong, viec.length) : viec.length,
				viec,
			};
		},
	);
	return {
		cot,
		soHuy,
		daHuy:
			soHuy > 0
				? [
						{
							...the("h", "XONG", []),
							trangThai: "HUY",
						},
					]
				: [],
	} as unknown as Json;
}

const CUA_TOI = {
	mo: [],
	daXong: [],
	daHuy: [],
	soXong: 0,
	soHuy: 0,
	demNhom: { "giao-cho-toi": 3, "toi-giao": 1, "dang-theo-doi": 1 },
} as unknown as Json;

const DS_CO = (): The[] => [
	the("w", "CHUA_LAM", ["DANG_LAM", "CHO_DANH_GIA", "XONG"]),
	the("d", "DANG_LAM", ["CHUA_LAM", "CHO_DANH_GIA", "XONG"]),
	the("v", "CHO_DANH_GIA", []),
	the("x", "XONG", []),
];

async function moTrang(query: string): Promise<void> {
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
	await cho();
}

async function cho(ms = 20): Promise<void> {
	await act(async () => {
		await new Promise((r) => setTimeout(r, ms));
	});
}

function k(): HTMLElement {
	if (!san) throw new Error("kv: chua mo trang");
	return san.o;
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

function the_trong(cot: string, id: string): boolean {
	return (
		k().querySelector(
			`[data-board-column="${cot}"] [data-board-card="${id}"]`,
		) !== null
	);
}

let traHinhHoc: (() => void) | null = null;
beforeEach(() => {
	traHinhHoc = datHinhHocKeo();
});

afterEach(async () => {
	traHinhHoc?.();
	traHinhHoc = null;
	if (san) {
		const { o, root } = san;
		await act(async () => root.unmount());
		o.remove();
		san = null;
	}
	document.body.innerHTML = "";
	traLoi.clear();
	daGoi.length = 0;
	urls.length = 0;
	toastLoi.length = 0;
	boardProps = {};
});

describe("kv-man-bang", () => {
	test("kv-man-bang: mặc định là danh sách", async () => {
		traLoi.set("viec.cuaToi", () => CUA_TOI);
		await moTrang("");
		if (
			k().querySelector("[data-bang-viec]") ||
			k().querySelector("[data-board-column]")
		) {
			throw new Error("kv: mac dinh khong phai danh sach");
		}
	});

	test("kv-man-bang: chọn Bảng ghi xemViec cạnh nhomViec; đổi nhóm giữ kiểu xem", async () => {
		traLoi.set("viec.cuaToi", () => CUA_TOI);
		traLoi.set("viec.bang", () => bangTu(DS_CO()));
		await moTrang("?nhomViec=toi-giao");
		const nut = [
			...k().querySelectorAll('[data-view-switch="nut"] button'),
		].find((b) => b.textContent === V.bang.bang);
		await bam(nut);
		const url = urls[urls.length - 1] ?? "";
		if (!url.includes("xemViec=bang") || !url.includes("nhomViec=toi-giao")) {
			throw new Error(`kv: url kieu xem sai ${url}`);
		}
		await bam(k().querySelector('[data-nhom="dang-theo-doi"]'));
		const sau = urls[urls.length - 1] ?? "";
		if (!sau.includes("xemViec=bang")) {
			throw new Error(`kv: url kieu xem sai ${sau}`);
		}
	});

	test("kv-man-bang: ?xemViec=bang giữ bốn cột, dòng Xong cũ, dòng gập Huỷ", async () => {
		traLoi.set("viec.cuaToi", () => CUA_TOI);
		traLoi.set("viec.bang", () => bangTu(DS_CO(), 4, 1));
		await moTrang("?xemViec=bang");
		const cot = [...k().querySelectorAll("[data-board-column]")].map((c) =>
			c.getAttribute("data-board-column"),
		);
		if (
			JSON.stringify(cot) !==
			JSON.stringify(["CHUA_LAM", "DANG_LAM", "CHO_DANH_GIA", "XONG"])
		) {
			throw new Error("kv: khong giu kieu xem bang");
		}
		const xongCu = k().querySelector("[data-xong-cu]");
		const hienXong = k().querySelectorAll(
			'[data-board-column="XONG"] [data-board-card]',
		).length;
		const canChu = dien(V.bang.xongCu, { n: 4 - hienXong });
		if (hienXong !== 1 || xongCu?.textContent?.trim() !== canChu)
			throw new Error("kv: thieu dong xong cu");
		if (!k().textContent?.includes("Đã huỷ (1)"))
			throw new Error("kv: thieu dong gap huy");
		await bam(xongCu);
		const sauBam = urls[urls.length - 1] ?? "";
		if (
			sauBam.includes("xemViec=bang") ||
			k().querySelector("[data-bang-viec]")
		)
			throw new Error("kv: thieu dong xong cu");
	});

	test("kv-man-bang: chờ tải, lỗi tải, rỗng", async () => {
		traLoi.set("viec.cuaToi", () => CUA_TOI);
		traLoi.set("viec.bang", () => new Promise<Json>(() => {}));
		await moTrang("?xemViec=bang");
		if (
			!k().querySelector("[data-bang-cho-tai]") ||
			!k().textContent?.includes(V.trang.tieuDe)
		) {
			throw new Error("kv: cho tai sai");
		}
		await act(async () => san?.root.unmount());
		san = null;
		traLoi.set("viec.bang", () => {
			throw new Error("hong");
		});
		await moTrang("?xemViec=bang");
		const loi = k().querySelector("[data-vung-tai-loi]");
		if (!loi || !loi.textContent?.includes(THU_LAI))
			throw new Error("kv: loi tai sai");
		await act(async () => san?.root.unmount());
		san = null;
		traLoi.set("viec.bang", () => bangTu([]));
		await moTrang("?xemViec=bang");
		const cotRong = [...k().querySelectorAll("[data-board-column]")];
		const rong =
			cotRong.length === 4 &&
			cotRong.every((c) => c.textContent?.includes(V.bang.rongCot));
		if (!rong) throw new Error("kv: rong sai");
	});
});

describe("kv-man-keo", () => {
	test("kv-man-keo: menu theo chuyenDuoc, kéo gọi đúng nguồn, canDrop nối, theo dõi không kéo", async () => {
		traLoi.set("viec.cuaToi", () => CUA_TOI);
		traLoi.set("viec.bang", () => bangTu(DS_CO()));
		traLoi.set("viec.keo", () => ({ ok: true }));
		await moTrang("?xemViec=bang");
		const nutV = k().querySelector('[data-the-viec="v"] [data-chuyen-sang]');
		if (
			!(nutV instanceof HTMLButtonElement) ||
			!nutV.disabled ||
			!k()
				.querySelector('[data-the-viec="v"]')
				?.textContent?.includes(V.bang.choDanhGiaKhoa)
		) {
			throw new Error("kv: menu cho danh gia sai");
		}
		await bam(k().querySelector('[data-the-viec="w"] [data-chuyen-sang]'));
		const muc = [...document.querySelectorAll("[data-dich]")].map(
			(e) => e.textContent,
		);
		if (
			JSON.stringify(muc) !==
			JSON.stringify([V.nut.batDau, V.nut.guiDanhGia, V.nut.xong])
		) {
			throw new Error(`kv: menu sai dich ${JSON.stringify(muc)}`);
		}
		await bam(document.querySelector('[data-dich="DANG_LAM"]'));
		const menuGoi = daGoi.filter((g) => g.path === "viec.keo");
		const vao0 = menuGoi[0]?.input as { nguon?: string } | undefined;
		if (menuGoi.length !== 1 || vao0?.nguon !== "bang-menu") {
			throw new Error("kv: menu goi sai");
		}
		await cho(50);
		daGoi.length = 0;
		await keoBangPhim(k(), "w", ["ArrowRight"]);
		await cho();
		const keoGoi = daGoi.filter((g) => g.path === "viec.keo");
		const vao1 = keoGoi[0]?.input as
			| { den?: string; nguon?: string }
			| undefined;
		if (
			keoGoi.length !== 1 ||
			vao1?.den !== "DANG_LAM" ||
			vao1.nguon !== "bang-keo"
		) {
			throw new Error("kv: keo phim sai");
		}
		if (
			!boardProps.canDrop ||
			boardProps.canDrop("v", "XONG") ||
			!boardProps.canDrop("w", "DANG_LAM")
		) {
			throw new Error("kv: canDrop khong noi");
		}
		const tay = k().querySelector(
			'[data-board-card="v"] [data-slot="kanban-item-handle"]',
		);
		if (!(tay instanceof HTMLElement)) throw new Error("kv: mat tay keo");
		await act(async () => {
			tay.focus();
			tay.dispatchEvent(
				new KeyboardEvent("keydown", {
					code: "Space",
					key: " ",
					bubbles: true,
				}),
			);
		});
		if (
			k()
				.querySelector('[data-board-column="XONG"]')
				?.getAttribute("data-khong-nhan") !== "true"
		) {
			throw new Error("kv: canDrop khong noi");
		}
		await act(async () => {
			await new Promise((r) => setTimeout(r, 10));
			tay.dispatchEvent(
				new KeyboardEvent("keydown", {
					code: "Escape",
					key: "Escape",
					bubbles: true,
				}),
			);
			await new Promise((r) => setTimeout(r, 10));
		});
		const truocTha = daGoi.filter((g) => g.path === "viec.keo").length;
		await keoBangPhim(k(), "v", ["ArrowRight"]);
		await cho();
		if (daGoi.filter((g) => g.path === "viec.keo").length !== truocTha)
			throw new Error("kv: canDrop khong noi");
		await keoBangPhim(k(), "d", ["ArrowRight"]);
		await cho();
		const sauTha = daGoi.filter((g) => g.path === "viec.keo");
		const vaoW = sauTha[sauTha.length - 1]?.input as
			| { id?: string; den?: string; nguon?: string }
			| undefined;
		if (
			sauTha.length !== truocTha + 1 ||
			vaoW?.id !== "d" ||
			vaoW.den !== "CHO_DANH_GIA" ||
			vaoW.nguon !== "bang-keo"
		)
			throw new Error("kv: doi chung canDrop hong");
	});

	test("kv-man-keo: thẻ đang chờ máy chủ khoá tay kéo", async () => {
		traLoi.set("viec.cuaToi", () => CUA_TOI);
		traLoi.set("viec.bang", () => bangTu(DS_CO()));
		traLoi.set("viec.keo", () => new Promise<Json>(() => {}));
		await moTrang("?xemViec=bang");
		await keoBangPhim(k(), "w", ["ArrowRight"]);
		await cho();
		await cho();
		if (!boardProps.pendingIds?.includes("w") || !the_trong("DANG_LAM", "w")) {
			throw new Error("kv: the cho khong khoa");
		}
	});

	test("kv-man-keo: nhóm Đang theo dõi không tay kéo, không menu", async () => {
		traLoi.set("viec.cuaToi", () => CUA_TOI);
		traLoi.set("viec.bang", () => bangTu(DS_CO()));
		await moTrang("?xemViec=bang&nhomViec=dang-theo-doi");
		if (k().querySelectorAll("[data-board-card]").length !== DS_CO().length)
			throw new Error("kv: theo doi keo duoc");
		if (
			k().querySelectorAll('[data-slot="kanban-item-handle"]').length !== 0 ||
			k().querySelectorAll("[data-chuyen-sang]").length !== 0
		) {
			throw new Error("kv: theo doi keo duoc");
		}
		await act(async () => san?.root.unmount());
		san = null;
		await moTrang("?xemViec=bang");
		if (
			!k().querySelector(
				'[data-board-card="w"] [data-slot="kanban-item-handle"]',
			)
		) {
			throw new Error("kv: mat tay keo");
		}
	});
});

describe("kv-man-tra-ve", () => {
	test("kv-man-tra-ve: máy chủ từ chối — thẻ về chỗ cũ, toast đúng lời, bảng tải lại", async () => {
		const LOI = "Không chuyển được việc từ «Huỷ» sang «Đang làm».";
		traLoi.set("viec.cuaToi", () => CUA_TOI);
		traLoi.set("viec.bang", () => bangTu(DS_CO()));
		traLoi.set("viec.keo", () => {
			throw new TRPCClientError(LOI, {
				result: {
					error: {
						code: -32600,
						message: LOI,
						data: { code: "BAD_REQUEST", httpStatus: 400 },
					},
				},
			} as never);
		});
		await moTrang("?xemViec=bang");
		const bangTruoc = daGoi.filter((g) => g.path === "viec.bang").length;
		await keoBangPhim(k(), "w", ["ArrowRight"]);
		await cho();
		await cho(60);
		if (!the_trong("CHUA_LAM", "w")) throw new Error("kv: the khong ve cho cu");
		if (toastLoi[0]?.msg !== LOI)
			throw new Error(`kv: toast sai loi ${JSON.stringify(toastLoi)}`);
		if (daGoi.filter((g) => g.path === "viec.bang").length <= bangTruoc) {
			throw new Error("kv: khong tai lai");
		}
	});

	test("kv-man-tra-ve: mất mạng — toast có Thử lại", async () => {
		traLoi.set("viec.cuaToi", () => CUA_TOI);
		traLoi.set("viec.bang", () => bangTu(DS_CO()));
		traLoi.set("viec.keo", () => {
			throw new TypeError("fetch failed");
		});
		await moTrang("?xemViec=bang");
		await keoBangPhim(k(), "w", ["ArrowRight"]);
		await cho();
		await cho(60);
		if (toastLoi[0]?.action?.label !== V.bang.thuLai)
			throw new Error("kv: thieu thu lai");
	});

	test("kv-man-tra-ve: đối chứng — máy chủ nhận thì thẻ ở cột mới, không toast", async () => {
		let ds = DS_CO();
		traLoi.set("viec.cuaToi", () => CUA_TOI);
		traLoi.set("viec.bang", () => bangTu(ds));
		traLoi.set("viec.keo", () => {
			ds = ds.map((v) =>
				v.id === "w" ? { ...v, trangThai: "DANG_LAM" as TT } : v,
			);
			return { ok: true };
		});
		await moTrang("?xemViec=bang");
		await keoBangPhim(k(), "w", ["ArrowRight"]);
		await cho();
		await cho(60);
		if (!the_trong("DANG_LAM", "w") || toastLoi.length !== 0) {
			throw new Error("kv: doi chung tra ve hong");
		}
		expect(the_trong("CHUA_LAM", "w")).toBe(false);
	});
});

describe("dg-man-dong-phu", () => {
	const P = { id: "p1", ten: "Triển khai Ngân hàng A" };
	const dongCo = (id: string, duAn: { id: string; ten: string } | null) => ({
		...the(id, "CHUA_LAM", ["DANG_LAM"]),
		batDauNgay: null,
		duAn,
	});

	const kiem = (kieu: string) => {
		const cua = (id: string) =>
			k().querySelector(
				kieu === "danh-sach"
					? `tr[data-viec="${id}"]`
					: `[data-the-viec="${id}"]`,
			);
		const lienKet = cua("v")?.querySelector(`a[data-dong-du-an="${P.id}"]`);
		if (
			!lienKet ||
			!(lienKet.getAttribute("href") ?? "").includes(`phamVi=${P.id}`) ||
			!(lienKet.textContent ?? "").includes(P.ten)
		) {
			throw new Error(`dg: thieu dong du an ${kieu}`);
		}
		if (cua("v3")?.querySelector("[data-dong-du-an]")) {
			throw new Error("dg: dong du an thua");
		}
	};

	test("dg-man-dong-phu: Của tôi kiểu Danh sách — việc trong dự án có dòng phụ là liên kết", async () => {
		traLoi.set("viec.cuaToi", () => ({
			mo: [dongCo("v", P), dongCo("v3", null)],
			daXong: [],
			daHuy: [],
			soXong: 0,
			soHuy: 0,
			demNhom: { "giao-cho-toi": 2, "toi-giao": 0, "dang-theo-doi": 0 },
		}));
		await moTrang("");
		await cho(20);
		kiem("danh-sach");
	});

	test("dg-man-dong-phu: Của tôi kiểu Bảng — thẻ việc trong dự án có dòng phụ là liên kết", async () => {
		traLoi.set("viec.cuaToi", () => CUA_TOI);
		traLoi.set("viec.bang", () =>
			bangTu([dongCo("v", P), dongCo("v3", null)] as unknown as The[]),
		);
		await moTrang("?xemViec=bang");
		await cho(20);
		kiem("bang");
	});
});
