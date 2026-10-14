import { afterEach, describe, expect, mock, test } from "bun:test";
import type { Locale } from "@crm/ui/lib/locale";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	act,
	type ComponentProps,
	createElement as h,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";

let soLanLamMoi = 0;

type ChonDotBien = { onSuccess?: () => void; onError?: () => void };
const choMai = () => new Promise<never>(() => {});
const thuTucCho = {
	mutationOptions: (chon: ChonDotBien) => ({ ...chon, mutationFn: choMai }),
};
mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		taiLieu: {
			nhacToi: {
				queryOptions: (vao: { slug: string }) => ({
					queryKey: ["taiLieu.nhacToi", vao],
					queryFn: choMai,
				}),
			},
			deXuatLuuTru: thuTucCho,
			deXuatKhoiPhuc: thuTucCho,
			datXacMinh: thuTucCho,
		},
	}),
}));
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({ taiLieu: async () => {} }),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({
		push: () => {},
		prefetch: () => {},
		refresh: () => {
			soLanLamMoi += 1;
		},
	}),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/tai-lieu/chinh-sach",
	useSearchParams: () => new URLSearchParams(),
}));
mock.module("next/link", () => ({
	default: ({
		children,
		...props
	}: ComponentProps<"a"> & { children?: ReactNode }) => h("a", props, children),
}));
const khoi =
	(the: string) =>
	({ children }: { children?: ReactNode }) =>
		h(the, null, children);
mock.module("@/components/page-shell", () => ({
	PageShellHeader: khoi("header"),
	PageShellHeading: khoi("div"),
	PageShellTitle: khoi("h1"),
	PageShellDescription: khoi("p"),
	PageShellActions: khoi("div"),
	PageShellContent: khoi("div"),
}));

const { ManDoc } = await import("@/app/(app)/[slug]/tai-lieu/[trang]/man-doc");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { taiLieuMessages } = await import("@/lib/messages/tai-lieu");
const { duongDeXuat } = await import("@/lib/tai-lieu-man");
const { workspaceUrl } = await import("@/lib/workspace-url");
const { dien } = await import("@/components/crm/record-sheet/plan-copy");
const { banChoCuaTrang, tomTatBanCho } = await import("@/lib/tai-lieu-cho");

type TrangDoc = ComponentProps<typeof ManDoc>["trang"];
type DongCho = Parameters<typeof banChoCuaTrang>[0][number];

const SLUG = "chinh-sach-nhan-vien";

const dong = (
	id: string,
	loai: DongCho["loai"],
	them: Partial<DongCho> = {},
): DongCho => ({
	id,
	slug: SLUG,
	trangThai: "CHO_DUYET",
	loai,
	cu: false,
	...them,
});

const BANG_HAI_LOAI: DongCho[] = [
	dong("dx-noi-dung", "NOI_DUNG"),
	dong("dx-luu-tru", "LUU_TRU"),
	dong("dx-khoi-phuc", "KHOI_PHUC"),
	dong("dx-noi-dung-cu", "NOI_DUNG", { cu: true }),
	dong("dx-trang-khac", "NOI_DUNG", { slug: "trang-khac" }),
];
const BANG_CHI_LUU_TRU: DongCho[] = [dong("dx-luu-tru", "LUU_TRU")];

function locDoiCu(rows: readonly DongCho[], slug: string): DongCho[] {
	return rows.filter(
		(r) => r.slug === slug && r.trangThai === "CHO_DUYET" && !r.cu,
	);
}

function trangVoi(tom: ReturnType<typeof tomTatBanCho>): TrangDoc {
	return {
		slug: SLUG,
		ten: "Chính sách nhân viên",
		loai: "quy-dinh",
		chuTrang: "Phan Lê Mạnh",
		donVi: null,
		phienBan: { so: 2, duyetLuc: "2026-10-01T05:00:00.000Z" },
		noiDung: "## Mục một\n\nNội dung.",
		choLanDau: null,
		nguon: null,
		...tom,
	};
}

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

function mo(trang: TrangDoc, locale: Locale = "vi"): HTMLElement {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() => {
		root?.render(
			<QueryClientProvider
				client={
					new QueryClient({ defaultOptions: { queries: { retry: false } } })
				}
			>
				<LocaleProvider locale={locale}>
					<ManDoc trang={trang} />
				</LocaleProvider>
			</QueryClientProvider>,
		);
	});
	return khung;
}

const m = taiLieuMessages("vi");
const nutXemBanCho = (goc: HTMLElement) =>
	[...goc.querySelectorAll("a")].filter(
		(a) => a.textContent === m.doc.xemBanCho,
	);

describe("ssct-doc-cho", () => {
	test("ssct-doc-cho: bộ lọc chỉ giữ đề xuất sửa nội dung chờ, chưa cũ, đúng trang", () => {
		expect(banChoCuaTrang(BANG_HAI_LOAI, SLUG).map((r) => r.id)).toEqual([
			"dx-noi-dung",
		]);
		expect(banChoCuaTrang(BANG_CHI_LUU_TRU, SLUG)).toEqual([]);
	});

	test("ssct-doc-cho: chiều đỏ — bộ lọc bỏ điều kiện loại đếm cả đề xuất lưu trữ", () => {
		const ca = "chỉ lưu trữ chờ";
		expect({ ca, so: locDoiCu(BANG_CHI_LUU_TRU, SLUG).length }).toEqual({
			ca,
			so: 1,
		});
		expect({ ca, so: banChoCuaTrang(BANG_CHI_LUU_TRU, SLUG).length }).toEqual({
			ca,
			so: 0,
		});
	});

	test("ssct-doc-cho: sửa nội dung + lưu trữ cùng chờ → «1 bản» dẫn tới đề xuất sửa", () => {
		const goc = mo(trangVoi(tomTatBanCho(true, { rows: BANG_HAI_LOAI }, SLUG)));
		const huyHieu = goc.querySelector("[data-co-ban-cho]");
		expect(huyHieu?.textContent).toBe(dien(m.doc.coBanCho, { so: 1 }));
		const nut = nutXemBanCho(goc);
		expect(nut.length).toBe(1);
		expect(nut[0]?.getAttribute("href")).toBe(
			workspaceUrl("ws", duongDeXuat("dx-noi-dung")),
		);
	});

	test("ssct-doc-cho: chỉ lưu trữ chờ → không số, không nút", () => {
		const goc = mo(
			trangVoi(tomTatBanCho(false, { rows: BANG_CHI_LUU_TRU }, SLUG)),
		);
		expect(goc.querySelector("[data-co-ban-cho]")).toBeNull();
		expect(nutXemBanCho(goc).length).toBe(0);
	});

	test("ssct-doc-cho: tải bản chờ lỗi → dòng báo + Thử lại, không số; bấm thì tải lại", () => {
		soLanLamMoi = 0;
		const goc = mo(trangVoi(tomTatBanCho(true, null, SLUG)));
		const dongLoi = goc.querySelector("[data-loi-ban-cho]");
		expect(dongLoi?.textContent ?? "").toContain(m.doc.loiBanCho);
		expect(goc.querySelector("[data-co-ban-cho]")).toBeNull();
		expect(nutXemBanCho(goc).length).toBe(0);
		const thuLai = [...(dongLoi?.querySelectorAll("button") ?? [])].find(
			(b) => b.textContent === m.loiTai.thuLai,
		);
		if (!thuLai) throw new Error("thieu nut Thu lai");
		act(() => thuLai.click());
		expect(soLanLamMoi).toBe(1);
	});

	test("ssct-doc-cho: đối chứng — tải được thì không có dòng lỗi", () => {
		const goc = mo(trangVoi(tomTatBanCho(true, { rows: BANG_HAI_LOAI }, SLUG)));
		expect(goc.querySelector("[data-loi-ban-cho]")).toBeNull();
		expect(goc.textContent ?? "").not.toContain(m.doc.loiBanCho);
	});
});
