import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	act,
	type ComponentProps,
	createElement as h,
	type ReactElement,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";

const TRA_VE: Record<string, unknown> = {
	"taiLieuNguon.trangThai": { bat: true },
};

function nhanh(duong: readonly string[]): unknown {
	const ten = duong.join(".");
	return new Proxy(() => {}, {
		get(_dich, khoa) {
			if (khoa === "queryOptions")
				return () => ({
					queryKey: [ten],
					queryFn: async () => TRA_VE[ten] ?? null,
				});
			if (khoa === "mutationOptions")
				return (chon: object = {}) => ({
					...chon,
					mutationFn: async () => ({}),
				});
			if (khoa === "queryKey" || khoa === "pathKey") return () => [ten];
			return nhanh([...duong, String(khoa)]);
		},
	});
}

const canhMayChu = { thanhVienLoi: false, toChucLoi: false };
let soLanLamMoi = 0;

mock.module("@/lib/trpc/client", () => ({ useTRPC: () => nhanh([]) }));
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({ taiLieu: async () => {} }),
}));
mock.module("@/lib/trpc/server", () => ({
	getServerTrpc: () => nhanh([]),
	getServerQueryClient: () => ({
		fetchQuery: async ({ queryKey }: { queryKey: string[] }) => {
			if (queryKey[0] === "okr.thanhVien") {
				if (canhMayChu.thanhVienLoi) throw new Error("máy chủ không trả lời");
				return [];
			}
			if (canhMayChu.toChucLoi) throw new Error("máy chủ không trả lời");
			return { divisions: [], chuaXep: [] };
		},
	}),
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
	usePathname: () => "/ws/tai-lieu",
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

const { chuTrangVaDonVi } = await import(
	"@/app/(app)/[slug]/tai-lieu/lua-chon-trang"
);
const { ManSoan } = await import("@/app/(app)/[slug]/tai-lieu/man-soan");
const { NutTaiNguon } = await import(
	"@/app/(app)/[slug]/tai-lieu/hop-tai-nguon"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { taiLieuMessages } = await import("@/lib/messages/tai-lieu");

const M = taiLieuMessages("vi");
const TOI = { id: "u-toi", name: "Phan Lê Mạnh" };

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
	canhMayChu.thanhVienLoi = false;
	canhMayChu.toChucLoi = false;
});

async function ve(nut: ReactElement): Promise<HTMLElement> {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	const qc = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	await act(async () => {
		root?.render(
			<QueryClientProvider client={qc}>
				<LocaleProvider locale="vi">{nut}</LocaleProvider>
			</QueryClientProvider>,
		);
		await new Promise((r) => setTimeout(r, 20));
	});
	return khung;
}

type Noi = "trang-moi" | "hop-tai-nguon";

async function moNoi(
	noi: Noi,
	chon: Awaited<ReturnType<typeof chuTrangVaDonVi>>,
): Promise<void> {
	if (noi === "trang-moi") {
		await ve(<ManSoan vao={{ kieu: "moi", toiId: TOI.id, ...chon }} />);
		return;
	}
	const goc = await ve(
		<NutTaiNguon luaChon={{ toiId: TOI.id, ...chon, trangDangDung: [] }} />,
	);
	const nut = goc.querySelector<HTMLButtonElement>("[data-tai-nguon]");
	if (!nut) throw new Error("thieu nut tai nguon");
	for (let i = 0; i < 20 && nut.disabled; i += 1) {
		await act(async () => {
			await new Promise((r) => setTimeout(r, 10));
		});
	}
	if (nut.disabled) throw new Error("nut tai nguon con khoa");
	await act(async () => {
		nut.click();
		await new Promise((r) => setTimeout(r, 20));
	});
}

function dongLoi(): HTMLElement | null {
	return document.body.querySelector<HTMLElement>("[data-loi-lua-chon]");
}

describe("ssct-chon-loi", () => {
	test("ssct-chon-loi: tải thành viên lỗi thì hàm trả cờ lỗi, không phải rỗng im lặng", async () => {
		canhMayChu.thanhVienLoi = true;
		const chon = await chuTrangVaDonVi(TOI);
		expect(chon.loiTai).toEqual({ thanhVien: true, donVi: false });
		canhMayChu.thanhVienLoi = false;
		const binhThuong = await chuTrangVaDonVi(TOI);
		expect(binhThuong.loiTai).toEqual({ thanhVien: false, donVi: false });
	});

	for (const noi of ["trang-moi", "hop-tai-nguon"] as const) {
		test(`ssct-chon-loi: ${noi} thấy dòng chưa tải được danh sách thành viên + Thử lại`, async () => {
			canhMayChu.thanhVienLoi = true;
			await moNoi(noi, await chuTrangVaDonVi(TOI));
			const dong = dongLoi();
			expect(dong?.textContent ?? "").toContain(M.soan.loiThanhVien);
			const thuLai = [...(dong?.querySelectorAll("button") ?? [])].find(
				(b) => b.textContent === M.loiTai.thuLai,
			);
			if (!thuLai) throw new Error(`${noi}: thieu nut Thu lai`);
			soLanLamMoi = 0;
			act(() => thuLai.click());
			expect(soLanLamMoi).toBe(1);
		});

		test(`ssct-chon-loi: ${noi} đối chứng — danh sách thật rỗng không lỗi thì không có dòng lỗi`, async () => {
			await moNoi(noi, await chuTrangVaDonVi(TOI));
			if (
				noi === "hop-tai-nguon" &&
				!document.body.querySelector("[data-hop-tai-nguon]")
			)
				throw new Error("hop tai nguon khong mo");
			expect(dongLoi()).toBeNull();
			expect(document.body.textContent ?? "").not.toContain(
				M.soan.loiThanhVien,
			);
		});
	}
});
