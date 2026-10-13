import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	act,
	createElement as h,
	type ReactElement,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";

type CheDo = "co" | "loi" | "treo";

const canh = {
	nguon: "bat" as "bat" | "tat" | "loi",
	goi: {} as Record<string, number>,
};

function dem(khoa: string) {
	canh.goi[khoa] = (canh.goi[khoa] ?? 0) + 1;
}

function theoCheDo<R>(khoa: string, cheDo: () => CheDo, tra: () => R) {
	return async () => {
		dem(khoa);
		const c = cheDo();
		if (c === "loi") throw new Error(`${khoa} loi`);
		if (c === "treo") return new Promise<R>(() => {});
		return tra();
	};
}

function truyVan<R>(khoa: string, queryFn: () => Promise<R>) {
	return {
		queryKey: (v?: unknown) => (v === undefined ? [khoa] : [khoa, v]),
		queryOptions: (v?: unknown) => ({
			queryKey: v === undefined ? [khoa] : [khoa, v],
			queryFn,
		}),
	};
}

mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => children,
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({
		push: () => {},
		replace: () => {},
		refresh: () => {},
		prefetch: () => {},
	}),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws",
	useSearchParams: () => new URLSearchParams(),
}));

mock.module("next/link", () => ({
	default: ({
		href,
		children,
		scroll: _cuon,
		...rest
	}: {
		href: string;
		children: ReactNode;
		scroll?: boolean;
	}) => h("a", { ...rest, href }, children),
}));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({ taiLieu: async () => {} }),
}));

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		taiLieuNguon: {
			trangThai: truyVan(
				"taiLieuNguon.trangThai",
				theoCheDo(
					"taiLieuNguon.trangThai",
					() => (canh.nguon === "loi" ? "loi" : "co"),
					() => ({ bat: canh.nguon === "bat" }),
				),
			),
		},
	}),
}));

const {
	PageShellActions,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellNote,
	PageShellTitle,
} = await import("@/components/page-shell");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { DongNguonTat, HanhDongTaiLieu } = await import(
	"@/app/(app)/[slug]/tai-lieu/dau-trang-tai-lieu"
);
const { taiLieuMessages } = await import("@/lib/messages/tai-lieu");

const TL = taiLieuMessages("vi");

let root: Root | null = null;

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
	canh.goi = {};
});

function ve(cay: ReactElement): HTMLElement {
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	act(() =>
		root?.render(
			<QueryClientProvider client={client}>
				<LocaleProvider locale="vi">{cay}</LocaleProvider>
			</QueryClientProvider>,
		),
	);
	return o;
}

async function cho(dieu: () => boolean, moTa: string) {
	for (let i = 0; i < 150; i += 1) {
		if (dieu()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(`khong toi: ${moTa}`);
}

function phai(dieu: boolean, thongDiep: string) {
	if (!dieu) throw new Error(thongDiep);
}

function truoc(a: Element | null, b: Element | null): boolean {
	if (!a || !b) return false;
	return Boolean(
		a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING,
	);
}

function lop(el: Element | null): string[] {
	return (el?.getAttribute("class") ?? "").split(/\s+/);
}

function nutTen(goc: ParentNode, ten: string): HTMLButtonElement | null {
	return (
		[...goc.querySelectorAll<HTMLButtonElement>("button")].find(
			(b) => b.textContent?.trim() === ten,
		) ?? null
	);
}

function moTaCua(el: Element | null): Element | null {
	const id = el?.getAttribute("aria-describedby");
	return id ? document.getElementById(id) : null;
}

describe("dau-trang", () => {
	test("thu tu tieu de, mo ta, dong ly do, nut; lop thu tu theo kho", () => {
		const o = ve(
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>Tiêu đề</PageShellTitle>
					<PageShellDescription>Mô tả</PageShellDescription>
					<PageShellNote id="ly-do-x">Vì sao nút tắt</PageShellNote>
				</PageShellHeading>
				<PageShellActions>
					<button type="button">Phụ</button>
					<button type="button" disabled aria-describedby="ly-do-x">
						Chính
					</button>
				</PageShellActions>
			</PageShellHeader>,
		);
		const tieuDe = o.querySelector('[data-slot="page-shell-title"]');
		const moTa = o.querySelector('[data-slot="page-shell-description"]');
		const ghiChu = o.querySelector('[data-slot="page-shell-note"]');
		const nut = o.querySelector('[data-slot="page-shell-actions"]');
		phai(truoc(tieuDe, moTa), "kmc-dau-trang: tieu de khong dung truoc mo ta");
		phai(truoc(moTa, ghiChu), "kmc-dau-trang: dong ly do dung truoc mo ta");
		phai(truoc(ghiChu, nut), "kmc-dau-trang: nut dung truoc dong ly do");
		const lopMoTa = lop(moTa);
		phai(
			lopMoTa.includes("md:order-last") && !lopMoTa.includes("order-last"),
			"kmc-dau-trang: mo ta dung sau nut duoi md",
		);
		phai(
			lopMoTa.includes("basis-full"),
			"kmc-dau-trang: mo ta chen hang nut o 1280",
		);
		phai(
			lop(nut).some((l) => /^order-\d$/.test(l)) &&
				lop(nut).includes("md:order-none"),
			"kmc-dau-trang: nut khong xuong duoi mo ta duoi md",
		);
		expect(moTaCua(o.querySelector("button[disabled]"))?.textContent).toBe(
			"Vì sao nút tắt",
		);
	});
});

function DauTrangTaiLieu() {
	return (
		<PageShellHeader>
			<PageShellHeading>
				<PageShellTitle>{TL.tieuDe}</PageShellTitle>
				<PageShellDescription>{TL.moTa}</PageShellDescription>
				<DongNguonTat />
			</PageShellHeading>
			<PageShellActions>
				<HanhDongTaiLieu
					loai={null}
					luaChon={{ toiId: "u", chuTrang: [], donVi: [], trangDangDung: [] }}
					page={1}
					tab="trang"
				/>
			</PageShellActions>
		</PageShellHeader>
	);
}

describe("tai-lieu", () => {
	async function moVoi(nguon: typeof canh.nguon) {
		canh.nguon = nguon;
		const o = ve(<DauTrangTaiLieu />);
		await cho(
			() => (canh.goi["taiLieuNguon.trangThai"] ?? 0) > 0,
			"doc trang thai nguon",
		);
		return o;
	}

	test("nguon tat: dong duoi tieu de, ngoai khoi nut, nut tro toi dong", async () => {
		const o = await moVoi("tat");
		await cho(() => o.querySelector("[data-nguon-tat]") !== null, "dong tat");
		const dong = o.querySelector("[data-nguon-tat]");
		phai(
			dong?.closest('[data-slot="page-shell-header"]') !== null,
			"kmc-tai-lieu: dong nguon tat ngoai dau trang",
		);
		phai(
			dong?.closest('[data-slot="page-shell-actions"]') === null,
			"kmc-tai-lieu: dong nguon tat nam trong actions",
		);
		expect(dong?.textContent).toBe(TL.nguon.tat);
		const nut = nutTen(o, TL.nguon.nutTai);
		expect(nut?.disabled).toBe(true);
		expect(moTaCua(nut)).toBe(dong);
	});

	test("khong doc duoc trang thai: nut tat kem dong noi dung that", async () => {
		const o = await moVoi("loi");
		await cho(
			() => o.querySelector("[data-nguon-khong-doc]") !== null,
			"dong khong doc",
		);
		const dong = o.querySelector("[data-nguon-khong-doc]");
		expect(dong?.textContent).toBe(TL.nguon.khongDocDuoc);
		expect(dong?.textContent).not.toBe(TL.nguon.tat);
		phai(
			dong?.closest('[data-slot="page-shell-actions"]') === null,
			"kmc-tai-lieu: dong nguon tat nam trong actions",
		);
		const nut = nutTen(o, TL.nguon.nutTai);
		expect(nut?.disabled).toBe(true);
		expect(moTaCua(nut)).toBe(dong);
	});

	test("doi chung: da bat thi nut bat, khong dong nao", async () => {
		const o = await moVoi("bat");
		await cho(
			() => nutTen(o, TL.nguon.nutTai)?.disabled === false,
			"nut bat",
		);
		expect(o.querySelector('[data-slot="page-shell-note"]')).toBeNull();
		expect(
			nutTen(o, TL.nguon.nutTai)?.getAttribute("aria-describedby"),
		).toBeNull();
	});
});
