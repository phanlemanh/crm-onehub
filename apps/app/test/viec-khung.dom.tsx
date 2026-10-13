import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, type TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "api/app-router";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { CrmCache } from "@/lib/trpc/cache";

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
const daLamMoi: string[] = [];
const { useCrmCache: useCrmCacheThat } = await import("@/lib/trpc/cache");
let dungCacheThat = false;
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => {
		const that = useCrmCacheThat();
		return dungCacheThat
			? that
			: new Proxy(
					{},
					{
						get: (_, khoa: string) => async () => {
							daLamMoi.push(khoa);
						},
					},
				);
	},
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/deals",
	useSearchParams: () => new URLSearchParams(),
}));
const toastLoi: string[] = [];
mock.module("sonner", () => ({
	toast: { error: (m: string) => toastLoi.push(m), success: () => {} },
}));

const { RecordSheetHost } = await import(
	"@/components/crm/record-sheet/record-sheet-host"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { viecMessages } = await import("@/lib/messages/viec");
const { VIEC } = await import("@crm/validation/viec");

const V = viecMessages("vi");

let san: { o: HTMLElement; root: Root } | null = null;

async function mo(man: ReactElement, searchParams: string) {
	queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	san = { o, root };
	await act(async () => {
		root.render(
			<NuqsTestingAdapter hasMemory searchParams={searchParams}>
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
	toastLoi.length = 0;
	daLamMoi.length = 0;
	dungCacheThat = false;
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

async function go(el: HTMLInputElement | null, chu: string) {
	if (!el) throw new Error("khong co o de go");
	const datGiaTri = Object.getOwnPropertyDescriptor(
		HTMLInputElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		datGiaTri?.call(el, chu);
		el.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

async function roi(el: Element | null) {
	if (!el) throw new Error("khong co o de roi");
	await act(async () => {
		el.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
	});
	await nhip();
}

const nguoi = (id: string, name: string) => ({ id, name, image: null });

type VaiXem = "giao" | "thucHien" | "theoDoi";

const NGUOI_XEM = {
	giao: nguoi("u-a", "Lê Quang Vinh"),
	thucHien: nguoi("u-b", "Phạm Thu Hà"),
	theoDoi: nguoi("u-w", "Nguyễn Hải Yến"),
} as const satisfies Record<VaiXem, ReturnType<typeof nguoi>>;

const DICH_API = {
	giao: {
		CHUA_LAM: ["DANG_LAM", "CHO_DANH_GIA", "XONG", "HUY"],
		DANG_LAM: ["CHUA_LAM", "CHO_DANH_GIA", "XONG", "HUY"],
		CHO_DANH_GIA: ["DANG_LAM", "XONG", "HUY"],
	},
	thucHien: {
		CHUA_LAM: ["DANG_LAM", "CHO_DANH_GIA", "XONG"],
		DANG_LAM: ["CHUA_LAM", "CHO_DANH_GIA", "XONG"],
		CHO_DANH_GIA: [],
	},
	theoDoi: { CHUA_LAM: [], DANG_LAM: [], CHO_DANH_GIA: [] },
} as const satisfies Record<VaiXem, Record<string, readonly string[]>>;

function chiTiet(
	trangThai: keyof (typeof DICH_API)["giao"],
	vai: VaiXem,
	coLichSu: boolean,
) {
	const lamViec = vai === "giao" || vai === "thucHien";
	return {
		id: "v1",
		tieuDe: "Gọi xác nhận lịch đào tạo",
		trangThai,
		hanNgay: "2026-10-14",
		quaHan: false,
		nguoiGiao: NGUOI_XEM.giao,
		nguoiThucHien: NGUOI_XEM.thucHien,
		banGhi: [{ loai: "deal", id: "d1", ten: "Thoả thuận An Phát" }],
		moTa: null,
		nguoiTheoDoi: [NGUOI_XEM.theoDoi],
		coLichSu,
		quyen: {
			trangThai: [...DICH_API[vai][trangThai]],
			sua: lamViec,
			doiNguoi: false,
			gan: lamViec,
			theoDoiKhac: false,
			dangTheoDoi: vai === "theoDoi",
			xoa: vai === "giao" && !coLichSu,
		},
	};
}

const VET = [
	{
		id: "e3",
		luc: "2026-10-13T03:00:00.000Z",
		nguon: "zalo",
		loai: "doi-trang-thai",
		nguoi: { id: "u-b", name: "Phạm Thu Hà" },
		vet: {
			loai: "doi-trang-thai",
			truoc: { trangThai: "CHUA_LAM" },
			sau: { trangThai: "DANG_LAM" },
		},
	},
	{
		id: "e2",
		luc: "2026-10-12T03:00:00.000Z",
		nguon: "web",
		loai: "doi-trang-thai",
		nguoi: { id: "u-a", name: "Lê Quang Vinh" },
		vet: {
			loai: "doi-trang-thai",
			truoc: { trangThai: "DANG_LAM" },
			sau: { trangThai: "CHUA_LAM" },
		},
	},
	{
		id: "e1",
		luc: "2026-10-11T03:00:00.000Z",
		nguon: "web",
		loai: "tao",
		nguoi: { id: "u-a", name: "Lê Quang Vinh" },
		vet: {
			loai: "tao",
			truoc: null,
			sau: {
				tieuDe: "Gọi xác nhận lịch đào tạo",
				nguoiThucHien: { id: "u-b", ten: "Phạm Thu Hà" },
				hanNgay: "2026-10-14",
				banGhi: [],
				nguoiTheoDoi: [],
			},
		},
	},
];

async function moKhung(
	du: Json,
	vai: VaiXem = "thucHien",
	them?: ReactElement,
) {
	traLoi.set("viec.get", () => du);
	traLoi.set("viec.lichSu", () => VET);
	traLoi.set("onboarding.nguoiNhanViec", () => []);
	traLoi.set("users.me", () => NGUOI_XEM[vai]);
	await mo(
		<>
			<RecordSheetHost />
			{them}
		</>,
		"?record=viec:v1",
	);
	await cho(
		() =>
			(document.body.textContent ?? "").includes("Gọi xác nhận lịch đào tạo"),
		"khung viec",
	);
}

const nutTrangThai = () =>
	[...document.querySelectorAll("[data-nut-trang-thai] button")].map((b) =>
		(b.textContent ?? "").trim(),
	);

const nutChu = (chu: string) =>
	[...document.querySelectorAll("button")].find(
		(b) => (b.textContent ?? "").trim() === chu,
	) ?? null;

describe("vc-man-khung", () => {
	test("vc-man-khung: thẻ Lịch sử ba dòng mới nhất trước, dòng Zalo ghi «qua Zalo»", async () => {
		await moKhung(chiTiet("DANG_LAM", "thucHien", true));
		const tab =
			[...document.querySelectorAll('[role="tab"]')].find((t) =>
				(t.textContent ?? "").includes(V.khung.tabLichSu),
			) ?? null;
		await bam(tab);
		await cho(
			() =>
				document.querySelectorAll("[data-lich-su-viec] [data-vet]").length ===
				3,
			"lich su",
		);
		const dong = [
			...document.querySelectorAll("[data-lich-su-viec] [data-vet]"),
		];
		if (
			dong.map((d) => d.getAttribute("data-vet-id")).join(",") !== "e3,e2,e1" ||
			!(dong[0]?.textContent ?? "").includes("qua Zalo")
		) {
			throw new Error("vc: khung lich su sai");
		}
	});

	test.each([
		["nguoi-thuc-hien", "DANG_LAM", "thucHien", ["Gửi đánh giá", "Xong"]],
		[
			"nguoi-giao-cho-danh-gia",
			"CHO_DANH_GIA",
			"giao",
			["Xong", "Làm lại", "Huỷ"],
		],
		["nguoi-theo-doi", "DANG_LAM", "theoDoi", []],
	] as const)(
		"vc-man-khung: nút trạng thái — %s",
		async (ca, trangThai, vai, mong) => {
			await moKhung(chiTiet(trangThai, vai, true), vai);
			await nhip();
			const co = nutTrangThai();
			const chiXem =
				document.querySelector("[data-chi-xem]")?.textContent ?? "";
			const dung =
				JSON.stringify(co) === JSON.stringify(mong) &&
				(mong.length > 0 || chiXem === V.khung.chiXem);
			if (!dung) throw new Error(`vc: nut trang thai sai ${ca}`);
		},
	);

	test("vc-man-khung: bấm Xong gọi doiTrangThai một lần; bị từ chối thì nhãn giữ cũ và toast lời máy chủ", async () => {
		traLoi.set("viec.doiTrangThai", () => {
			throw new Error("Chỉ người giao được đánh dấu xong.");
		});
		await moKhung(chiTiet("DANG_LAM", "thucHien", true));
		const xong =
			[...document.querySelectorAll("[data-nut-trang-thai] button")].find(
				(b) => b.textContent === V.nut.xong,
			) ?? null;
		await bam(xong);
		await cho(() => toastLoi.length > 0, "toast");
		const goi = daGoi.filter((g) => g.path === "viec.doiTrangThai");
		const nhan =
			document.querySelector("[data-trang-thai-viec]")?.textContent ?? "";
		if (
			goi.length !== 1 ||
			(goi[0]?.input as { den?: string })?.den !== "XONG" ||
			!nhan.includes(V.trangThai.DANG_LAM) ||
			toastLoi[0] !== "Chỉ người giao được đánh dấu xong." ||
			!daLamMoi.includes("viec")
		) {
			throw new Error("vc: khung khong lui khi bi tu choi");
		}
	});

	test("vc-man-khung: Xoá chỉ hiện khi chưa có lịch sử, qua hộp hỏi lại, gọi viec.xoa một lần", async () => {
		traLoi.set("viec.xoa", () => ({ id: "v1" }));
		await moKhung(chiTiet("CHUA_LAM", "giao", false), "giao");
		await bam(nutChu(V.nut.xoa));
		await cho(() => nutChu(V.xoa.nut) !== null, "hop hoi lai");
		await bam(nutChu(V.xoa.nut));
		await cho(() => daGoi.some((g) => g.path === "viec.xoa"), "goi xoa");
		if (daGoi.filter((g) => g.path === "viec.xoa").length !== 1) {
			throw new Error("vc: xoa khong qua hoi lai");
		}
	});

	test("vc-man-khung: người theo dõi bỏ theo dõi việc riêng thì khung đóng, việc có bản ghi gắn thì khung ở lại", async () => {
		traLoi.set("viec.boTheoDoi", () => ({ id: "v1" }));
		const goc = chiTiet("DANG_LAM", "theoDoi", true);
		const rieng = { ...goc, banGhi: [] };
		await moKhung(rieng, "theoDoi");
		await bam(nutChu(V.khung.boTheoDoi));
		await cho(() => daGoi.some((g) => g.path === "viec.boTheoDoi"), "goi bo");
		await cho(
			() =>
				!(document.body.textContent ?? "").includes(
					"Gọi xác nhận lịch đào tạo",
				),
			"khung dong",
		);
		await act(async () => {
			san?.root.unmount();
		});
		san?.o.remove();
		san = null;
		document.body.innerHTML = "";
		daGoi.length = 0;
		await moKhung(goc, "theoDoi");
		await bam(nutChu(V.khung.boTheoDoi));
		await cho(() => daGoi.some((g) => g.path === "viec.boTheoDoi"), "goi bo 2");
		for (let i = 0; i < 5; i += 1) await nhip();
		expect(document.body.textContent ?? "").toContain(
			"Gọi xác nhận lịch đào tạo",
		);
	});

	test("vc-man-khung: việc đã có lịch sử thì không có nút Xoá", async () => {
		await moKhung(chiTiet("DANG_LAM", "giao", true), "giao");
		if (nutChu(V.nut.xoa) !== null) {
			throw new Error("vc: nut xoa hien khi co lich su");
		}
	});
});

const trpcThat = () =>
	createTRPCOptionsProxy<AppRouter>({ client: trpcClient, queryClient });

let cacheSonde: CrmCache | null = null;

function Sonde() {
	cacheSonde = useCrmCacheThat();
	return null;
}

const KHOA_DANH_SACH = () => [
	trpcThat().viec.cuaToi.queryKey({ nhom: "giao-cho-toi" }),
	trpcThat().viec.cuaBanGhi.queryKey({ dealId: "d1" }),
];

async function nopDanhSach() {
	traLoi.set("viec.cuaToi", () => ({ mo: [], daXong: [], daHuy: [] }));
	traLoi.set("viec.cuaBanGhi", () => ({ mo: [], daXong: [], daHuy: [] }));
	await queryClient.prefetchQuery(
		trpcThat().viec.cuaToi.queryOptions({ nhom: "giao-cho-toi" }),
	);
	await queryClient.prefetchQuery(
		trpcThat().viec.cuaBanGhi.queryOptions({ dealId: "d1" }),
	);
}

const daCu = (khoa: unknown[]) =>
	queryClient.getQueryState(khoa)?.isInvalidated === true;

describe("vc-cache-xoa", () => {
	test("vc-cache-xoa: xoá việc không làm mới viec.get của chính việc đó, danh sách việc làm mới", async () => {
		dungCacheThat = true;
		traLoi.set("viec.xoa", () => ({ id: "v1" }));
		await moKhung(chiTiet("CHUA_LAM", "giao", false), "giao");
		await nopDanhSach();
		const truoc = daGoi.filter((g) => g.path === "viec.get").length;
		await bam(nutChu(V.nut.xoa));
		await cho(() => nutChu(V.xoa.nut) !== null, "hop hoi lai");
		await bam(nutChu(V.xoa.nut));
		await cho(() => daGoi.some((g) => g.path === "viec.xoa"), "goi xoa");
		for (let i = 0; i < 8; i += 1) await nhip();
		const sau = daGoi.filter((g) => g.path === "viec.get").length;
		if (sau !== truoc) throw new Error("vc: xoa viec doc lai viec.get cua no");
		if (!KHOA_DANH_SACH().every(daCu)) {
			throw new Error("vc: xoa viec khong lam moi danh sach");
		}
	});

	test("vc-cache-xoa: xoá vĩnh viễn thoả thuận làm mới danh sách việc và viec.get đang mở", async () => {
		dungCacheThat = true;
		await moKhung(chiTiet("DANG_LAM", "giao", true), "giao", <Sonde />);
		await nopDanhSach();
		const truoc = daGoi.filter((g) => g.path === "viec.get").length;
		await act(async () => {
			await cacheSonde?.removed({ kind: "deal", id: "d1" });
		});
		await cho(
			() => daGoi.filter((g) => g.path === "viec.get").length > truoc,
			"viec.get doc lai",
		);
		if (!KHOA_DANH_SACH().every(daCu)) {
			throw new Error("vc: xoa ban ghi khong lam moi danh sach viec");
		}
	});
});

describe("vc-khung-sua-tai-cho", () => {
	test("vc-khung-sua-tai-cho: người thực hiện sửa tiêu đề thì viec.sua được gọi một lần với tiêu đề mới", async () => {
		const du = chiTiet("DANG_LAM", "thucHien", true);
		traLoi.set("viec.sua", () => du);
		await moKhung(du);
		await bam(document.querySelector(`button[aria-label="${V.khung.tieuDe}"]`));
		const o = document.querySelector<HTMLInputElement>(
			`input[aria-label="${V.khung.tieuDe}"]`,
		);
		await go(o, "Gọi xác nhận lịch đào tạo tuần sau");
		await roi(o);
		await cho(() => daGoi.some((g) => g.path === "viec.sua"), "goi sua");
		const goi = daGoi.filter((g) => g.path === "viec.sua");
		const vao = goi[0]?.input as { id?: string; tieuDe?: string } | undefined;
		if (
			goi.length !== 1 ||
			vao?.id !== "v1" ||
			vao.tieuDe !== "Gọi xác nhận lịch đào tạo tuần sau"
		) {
			throw new Error("vc: khung khong sua tai cho");
		}
	});

	test("vc-khung-sua-tai-cho: ô sửa tiêu đề và mô tả mang giới hạn độ dài của việc", async () => {
		const du = chiTiet("DANG_LAM", "thucHien", true);
		await moKhung(du);
		await bam(document.querySelector(`button[aria-label="${V.khung.tieuDe}"]`));
		const tieuDe = document.querySelector<HTMLInputElement>(
			`input[aria-label="${V.khung.tieuDe}"]`,
		);
		expect(tieuDe?.maxLength).toBe(VIEC.tieuDeToiDa);
		await roi(tieuDe);
		await bam(document.querySelector(`button[aria-label="${V.khung.moTa}"]`));
		const moTa = document.querySelector<HTMLTextAreaElement>(
			`textarea[aria-label="${V.khung.moTa}"]`,
		);
		expect(moTa?.maxLength).toBe(VIEC.moTaToiDa);
	});

	test("vc-khung-sua-tai-cho: bấm «Xoá ngày» ở ô hạn thì viec.sua nhận hanNgay null, không phải chuỗi rỗng", async () => {
		const du = chiTiet("DANG_LAM", "thucHien", true);
		traLoi.set("viec.sua", () => du);
		await moKhung(du);
		await bam(document.querySelector('[data-slot="date-picker-trigger"]'));
		await cho(
			() =>
				[...document.querySelectorAll("button")].some(
					(b) => (b.textContent ?? "").trim() === "Xoá ngày",
				),
			"nut xoa ngay",
		);
		await bam(
			[...document.querySelectorAll("button")].find(
				(b) => (b.textContent ?? "").trim() === "Xoá ngày",
			) ?? null,
		);
		await cho(() => daGoi.some((g) => g.path === "viec.sua"), "goi sua");
		const goi = daGoi.filter((g) => g.path === "viec.sua");
		expect(goi).toHaveLength(1);
		expect(goi[0]?.input).toEqual({ id: "v1", hanNgay: null });
	});

	test("vc-khung-sua-tai-cho: người thực hiện ở Chờ đánh giá thấy lời chờ người giao, người theo dõi vẫn thấy lời cũ", async () => {
		const lamViec = chiTiet("CHO_DANH_GIA", "thucHien", true);
		await moKhung(lamViec);
		expect(document.querySelector("[data-chi-xem]")?.textContent ?? "").toBe(
			V.khung.choNguoiGiao,
		);
		await act(async () => {
			san?.root.unmount();
		});
		san?.o.remove();
		san = null;
		document.body.innerHTML = "";
		await moKhung(chiTiet("CHO_DANH_GIA", "theoDoi", true), "theoDoi");
		expect(document.querySelector("[data-chi-xem]")?.textContent ?? "").toBe(
			V.khung.chiXem,
		);
	});

	test("vc-khung-sua-tai-cho: người theo dõi không có ô sửa tiêu đề và mô tả", async () => {
		await moKhung(chiTiet("DANG_LAM", "theoDoi", true), "theoDoi");
		await nhip();
		if (
			document.querySelector(`[aria-label="${V.khung.tieuDe}"]`) !== null ||
			document.querySelector(`[aria-label="${V.khung.moTa}"]`) !== null
		) {
			throw new Error("vc: khung cho nguoi theo doi sua");
		}
	});
});
