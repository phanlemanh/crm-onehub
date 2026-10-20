import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
	QueryClient,
	QueryClientProvider,
	useQueryClient,
} from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	type SanPhamDanhSach,
	type SanPhamHang,
	sanPhamDanhSach,
} from "../../api/src/lo-trinh/san-pham.contracts";

type DauVaoGhi = {
	readonly [khoa: string]: string | readonly string[] | undefined;
};
type GoiToast = {
	loai: "thuong" | "xong" | "loi";
	chu: string;
	action?: { label: string; onClick: () => void };
};
type MoiGhi = { onSuccess?: unknown; onError?: unknown; onSettled?: unknown };

function hang(ma: string, them: Partial<SanPhamHang> = {}): SanPhamHang {
	return {
		ma,
		ten: `San pham ${ma}`,
		kho: `phanlemanh/${ma}`,
		nhanh: "main",
		duongTep: "LO-TRINH.html",
		trangThaiLay: "da-lay",
		chiTietLay: null,
		layLuc: "2026-10-20T01:05:00.000Z",
		phienBanKhuon: 2,
		coLichSu: true,
		nguonDoi: false,
		...them,
	};
}

let duLieu: SanPhamDanhSach = sanPhamDanhSach.parse({
	quanTri: true,
	sanPham: [],
});
let daCat: SanPhamHang[] = [];
let goiGhi: { ten: string; v: DauVaoGhi }[] = [];
const goiToast: GoiToast[] = [];

function ghiToast(loai: GoiToast["loai"]) {
	return (chu: string, o?: { action?: GoiToast["action"] }) => {
		goiToast.push({ loai, chu, action: o?.action });
	};
}

function thuTuc<TVao, TRa>(ten: string, doc: (v: TVao) => TRa | Promise<TRa>) {
	return {
		queryKey: (v?: TVao) => (v === undefined ? [ten] : [ten, v]),
		pathKey: () => [ten],
		queryOptions: (v: TVao) => ({
			queryKey: v === undefined ? [ten] : [ten, v],
			queryFn: async () => doc(v),
		}),
		mutationOptions: (tuyChon?: MoiGhi) => ({
			mutationKey: [ten],
			mutationFn: async (v: DauVaoGhi) => {
				goiGhi.push({ ten, v });
				return { ma: String(v.ma ?? "moi") };
			},
			...tuyChon,
		}),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		sanPhamLoTrinh: {
			danhSach: thuTuc("danhSach", () => duLieu),
			daLuuTru: thuTuc("daLuuTru", () => daCat),
			nguoiXem: thuTuc("nguoiXem", () => []),
			tao: thuTuc("tao", () => null),
			sua: thuTuc("sua", () => null),
			datNguoiXem: thuTuc("datNguoiXem", () => null),
			luuTru: thuTuc("luuTru", () => null),
			khoiPhuc: thuTuc("khoiPhuc", () => null),
			xoa: thuTuc("xoa", () => null),
			xoaVinhVien: thuTuc("xoaVinhVien", () => null),
		},
	}),
}));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => {
		const qc = useQueryClient();
		return { sanPhamLoTrinh: () => qc.invalidateQueries() };
	},
}));

mock.module("sonner", () => ({
	toast: Object.assign(ghiToast("thuong"), {
		error: ghiToast("loi"),
		success: ghiToast("xong"),
	}),
}));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { toneTheoNghia } = await import("@crm/ui/lib/status-tone");
const { TRANG_THAI_LAY } = await import("@crm/validation/san-pham-lo-trinh");
const { DongChiDoc, NutThemSanPham, SanPhamSettings } = await import(
	"@/app/(app)/[slug]/settings/san-pham/san-pham-settings"
);
const { sanPhamMessages } = await import("@/lib/messages/san-pham");
const { NGHIA_TRANG_THAI_LAY } = await import(
	"@/lib/lo-trinh/nghia-trang-thai-lay"
);
const { NHOM_CAI_DAT } = await import("@/lib/cai-dat-dieu-huong");

let root: Root | null = null;
let khung: HTMLElement | null = null;

beforeEach(() => {
	duLieu = sanPhamDanhSach.parse({ quanTri: true, sanPham: [] });
	daCat = [];
	goiGhi = [];
	goiToast.length = 0;
});

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

async function cho(n = 6) {
	for (let i = 0; i < n; i += 1)
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
}

async function dung(
	thamSo = "",
	locale: "vi" | "en" = "vi",
): Promise<HTMLElement> {
	act(() => root?.unmount());
	khung?.remove();
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	const nut: ReactNode = (
		<>
			<DongChiDoc />
			<NutThemSanPham />
			<SanPhamSettings />
		</>
	);
	await act(async () =>
		root?.render(
			<NuqsTestingAdapter searchParams={thamSo} hasMemory>
				<QueryClientProvider client={queryClient}>
					<LocaleProvider locale={locale}>{nut}</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		),
	);
	await cho();
	return khung as HTMLElement;
}

const khoa = (el: Element | null) =>
	el !== null &&
	(el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true");

async function go(o: HTMLInputElement, giaTri: string) {
	const datGia = Object.getOwnPropertyDescriptor(
		HTMLInputElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		datGia?.call(o, giaTri);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

async function bam(el: Element | null) {
	if (!(el instanceof HTMLElement)) throw new Error("khong co phan tu de bam");
	await act(async () => {
		el.click();
	});
	await cho(3);
}

async function moMenu(k: HTMLElement, ma: string) {
	const nut = k.querySelector(
		`[data-san-pham="${ma}"] [data-nut="thao-tac-san-pham"]`,
	);
	if (!(nut instanceof HTMLElement)) throw new Error(`khong co menu ${ma}`);
	await act(async () => {
		nut.focus();
		nut.dispatchEvent(
			new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
		);
	});
	await cho(2);
	return [...document.querySelectorAll('[role="menuitem"]')];
}

const oNhap = (ten: string) => {
	const o = document.querySelector(`[data-o="${ten}"] input`);
	if (!(o instanceof HTMLInputElement)) throw new Error(`khong co o ${ten}`);
	return o;
};

describe("ltsp-cau-trang-thai", () => {
	test("ltsp-cau-trang-thai: mỗi trạng thái một câu riêng, màu theo nghĩa", async () => {
		console.log(`ltsp-cau-trang-thai: ${TRANG_THAI_LAY.length} trang thai`);
		for (const loc of ["vi", "en"] as const) {
			const tt = sanPhamMessages(loc).trangThai;
			const chu = new Map<string, string>();
			for (const t of TRANG_THAI_LAY) {
				duLieu = sanPhamDanhSach.parse({
					quanTri: true,
					sanPham: [hang("p", { trangThaiLay: t })],
				});
				const k = await dung("", loc);
				const o = k.querySelector("[data-san-pham-trang-thai]");
				const text = (o?.textContent ?? "").trim();
				expect(`${loc}:${t}:${text}`).toBe(`${loc}:${t}:${tt[t]}`);
				const dot =
					o?.querySelector("[data-tone]") ??
					(o?.hasAttribute("data-tone") ? o : null);
				expect(`${t}:${dot?.getAttribute("data-tone")}`).toBe(
					`${t}:${toneTheoNghia(NGHIA_TRANG_THAI_LAY[t])}`,
				);
				const trung = [...chu.entries()].find(([, c]) => c === text);
				if (trung)
					throw new Error(`hai trang thai cung mot cau: ${trung[0]}, ${t}`);
				chu.set(t, text);
			}
			expect(chu.size).toBe(TRANG_THAI_LAY.length);
		}
	});
});

describe("ltsp-danh-ba-trang", () => {
	test("ltsp-danh-ba-trang: thành viên thấy danh sách nhưng mọi điều khiển khoá", async () => {
		duLieu = sanPhamDanhSach.parse({
			quanTri: false,
			sanPham: [hang("a"), hang("b", { coLichSu: false })],
		});
		const k = await dung();
		expect(khoa(k.querySelector('[data-nut="them-san-pham"]'))).toBe(true);
		const menu = [...k.querySelectorAll('[data-nut="thao-tac-san-pham"]')];
		expect(menu.length).toBe(2);
		expect(menu.every(khoa)).toBe(true);
		expect(
			(
				k.querySelector("[data-san-pham-khong-quyen]")?.textContent ?? ""
			).trim(),
		).not.toBe("");
		expect(
			k.querySelectorAll('[data-san-pham]:not([data-san-pham="crm"])').length,
		).toBe(2);
	});

	test("ltsp-danh-ba-trang: đối chứng quản trị không khoá gì", async () => {
		duLieu = sanPhamDanhSach.parse({ quanTri: true, sanPham: [hang("a")] });
		const k = await dung();
		expect(khoa(k.querySelector('[data-nut="them-san-pham"]'))).toBe(false);
		expect(k.querySelector("[data-san-pham-khong-quyen]")).toBeNull();
	});

	test("ltsp-danh-ba-trang: ô khai sai báo lỗi đúng ô, khai đúng thì gửi bốn ô", async () => {
		await dung("suaSanPham=moi");
		const SAI: [string, string][] = [
			["kho", "khong-co-gach"],
			["kho", "a/b/c"],
			["nhanh", ""],
			["nhanh", "co khoang"],
			["duongTep", "../x.html"],
			["duongTep", "/x.html"],
			["ten", ""],
			["ten", "x".repeat(61)],
		];
		const HOP_LE = {
			ten: "Kit nghiệm thu",
			kho: "phanlemanh/acceptance-gate-kit",
			nhanh: "main",
			duongTep: "LO-TRINH.html",
		};
		for (const [o, gt] of Object.entries(HOP_LE)) await go(oNhap(o), gt);
		for (const [o, gt] of SAI) {
			await go(oNhap(o), gt);
			const loi = document.querySelector(
				`[data-o="${o}"] [data-slot="field-error"]`,
			);
			if (o === "duongTep" && loi === null)
				throw new Error("o tep nhan ../ khong bao loi");
			expect(`${o}:${gt}:${loi === null}`).toBe(`${o}:${gt}:false`);
			expect(khoa(document.querySelector('[data-nut="luu-san-pham"]'))).toBe(
				true,
			);
			await go(oNhap(o), HOP_LE[o as keyof typeof HOP_LE]);
		}
		const luu = document.querySelector('[data-nut="luu-san-pham"]');
		expect(khoa(luu)).toBe(false);
		await bam(luu);
		const tao = goiGhi.find((g) => g.ten === "tao");
		expect(tao?.v).toEqual(HOP_LE);
	});

	test("ltsp-danh-ba-trang: CRM là dòng cố định, mục Sản phẩm ở nhóm Kết nối và dữ liệu", async () => {
		duLieu = sanPhamDanhSach.parse({ quanTri: true, sanPham: [hang("a")] });
		const k = await dung();
		const crm = k.querySelector('[data-san-pham="crm"]');
		expect(crm?.querySelector('[data-nut="thao-tac-san-pham"]')).toBeNull();
		expect(crm?.querySelector("[data-san-pham-khai-trong-ma]")).not.toBeNull();
		const nhom = NHOM_CAI_DAT.find((n) => n.khoa === "ketNoiDuLieu");
		expect(nhom?.muc.map((m) => m.href)).toContain("/settings/san-pham");
	});
});

describe("ltsp-vong-doi-trang", () => {
	test("ltsp-vong-doi-trang: chưa có lịch sử thì Xoá có hỏi lại; có lịch sử thì Lưu trữ có Hoàn tác", async () => {
		const t = sanPhamMessages("vi");
		duLieu = sanPhamDanhSach.parse({
			quanTri: true,
			sanPham: [
				hang("moi", { coLichSu: false }),
				hang("cu", { coLichSu: true }),
			],
		});
		const k = await dung();
		const muc1 = await moMenu(k, "moi");
		const xoa = muc1.find((m) => m.getAttribute("data-muc") === "xoa-san-pham");
		expect(xoa?.textContent).toBe(t.the.xoa);
		await bam(xoa ?? null);
		expect(
			document.querySelector('[role="alertdialog"]')?.textContent,
		).toContain(t.hoiXoa.moTa);
		await act(async () => {
			document.dispatchEvent(
				new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
			);
		});
		await cho(3);
		const muc2 = await moMenu(k, "cu");
		if (muc2.some((m) => m.getAttribute("data-muc") === "xoa-san-pham"))
			throw new Error("xoa hien cho san pham da co lich su");
		const luuTru = muc2.find(
			(m) => m.getAttribute("data-muc") === "luu-tru-san-pham",
		);
		expect(luuTru?.textContent).toBe(t.the.luuTru);
		await bam(luuTru ?? null);
		await cho(4);
		expect(goiGhi.some((g) => g.ten === "luuTru" && g.v.ma === "cu")).toBe(
			true,
		);
		const bao = goiToast.find((g) => g.action?.label === t.bao.hoanTac);
		expect(bao).toBeDefined();
	});

	test("ltsp-vong-doi-trang: mục Đã lưu trữ có Khôi phục và Xoá vĩnh viễn hỏi lại", async () => {
		const t = sanPhamMessages("vi");
		duLieu = sanPhamDanhSach.parse({ quanTri: true, sanPham: [hang("a")] });
		daCat = [hang("da-cat", { ten: "Zalo CRM" })];
		const k = await dung();
		const gap = k.querySelector('[data-slot="archived-list"]');
		expect(gap?.textContent).toContain(`${t.daLuuTru.nhan} (1)`);
		await bam(gap?.querySelector("button") ?? null);
		const nut = [...k.querySelectorAll('[data-slot="archived-list"] button')];
		expect(nut.some((b) => b.textContent?.includes(t.daLuuTru.khoiPhuc))).toBe(
			true,
		);
		const vv = nut.find((b) => b.textContent?.includes(t.daLuuTru.xoaVinhVien));
		await bam(vv ?? null);
		expect(
			document.querySelector('[role="alertdialog"]')?.textContent,
		).toContain(t.hoiXoaVinhVien.moTa);
	});
});

describe("ltsp-khuon", () => {
	test("ltsp-khuon: Cài đặt hiện bản khuôn của từng sản phẩm", async () => {
		duLieu = sanPhamDanhSach.parse({
			quanTri: true,
			sanPham: [
				hang("k1", { phienBanKhuon: 1 }),
				hang("k2", { phienBanKhuon: 2 }),
				hang("k3", { phienBanKhuon: 3 }),
			],
		});
		const k = await dung();
		for (const [ma, n] of [
			["k1", 1],
			["k2", 2],
			["k3", 3],
		] as const) {
			const o = k.querySelector(
				`[data-san-pham="${ma}"] [data-san-pham-khuon]`,
			);
			expect(o?.getAttribute("data-san-pham-khuon")).toBe(String(n));
			expect(o?.textContent).toContain(String(n));
		}
	});
});
