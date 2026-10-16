import { afterEach, describe, expect, mock, test } from "bun:test";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

const KHONG = {
	"quy-dinh": 0,
	"chinh-sach": 0,
	"quy-trinh": 0,
	"bieu-mau": 0,
	"chien-luoc": 0,
};

const canh = { soDaLuuTru: 0, den: [] as string[] };

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		taiLieu: {
			list: {
				queryOptions: (vao: { archived?: boolean }) => ({
					queryKey: ["taiLieu.list", vao, canh.soDaLuuTru],
					queryFn: async () => ({
						rows: [],
						total: 0,
						facetCounts: KHONG,
						soDaLuuTru: canh.soDaLuuTru,
					}),
				}),
			},
			boLoc: {
				queryOptions: () => ({
					queryKey: ["taiLieu.boLoc"],
					queryFn: async () => ({ donVi: [], chuTrang: [] }),
				}),
			},
		},
	}),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({
		push: (den: string) => {
			canh.den.push(den);
		},
		refresh: () => {},
		prefetch: () => {},
	}),
	useParams: () => ({ slug: "ws" }),
}));
mock.module("next/link", () => ({
	default: ({
		children,
		href,
		...props
	}: {
		children: ReactNode;
		href: string;
	}) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

const { DanhSachTrang } = await import(
	"@/app/(app)/[slug]/tai-lieu/danh-sach-trang"
);

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
	canh.soDaLuuTru = 0;
	canh.den = [];
});

const nhip = () => new Promise((r) => setTimeout(r, 30));

async function mo(archived: boolean): Promise<HTMLElement> {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	await act(async () => {
		root?.render(
			<NuqsTestingAdapter
				hasMemory
				onUrlUpdate={(e) => {
					canh.den.push(`/ws/tai-lieu${e.queryString}`);
				}}
				searchParams={archived ? "?archived=true" : ""}
			>
				<QueryClientProvider client={qc}>
					<LocaleProvider locale="vi">
						<DanhSachTrang />
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	for (let i = 0; i < 6; i += 1)
		await act(async () => {
			await nhip();
		});
	return khung;
}

describe("tai-lieu-kho-rong-luu-tru", () => {
	test("kho-rong: moi trang deu da luu tru — van co nut Da luu tru, khong man kho rong; doi chung khong co trang luu tru thi man kho rong", async () => {
		canh.soDaLuuTru = 2;
		const goc = await mo(false);
		expect(goc.querySelector("[data-kho-rong]")).toBeNull();
		const nut = goc.querySelector<HTMLElement>("[data-nut-da-luu-tru]");
		expect(nut).not.toBeNull();
		await act(async () => {
			nut?.click();
		});
		expect(canh.den).toEqual(["/ws/tai-lieu?archived=true"]);

		act(() => root?.unmount());
		canh.soDaLuuTru = 0;
		const rong = await mo(false);
		expect(rong.querySelector("[data-kho-rong]")).not.toBeNull();
		expect(rong.querySelector("[data-nut-da-luu-tru]")).toBeNull();
	});

	test("kho-rong: che do Da luu tru khong co trang nao — cau rong rieng, nut van bat", async () => {
		const goc = await mo(true);
		expect(goc.querySelector("[data-da-luu-tru-rong]")?.textContent).toContain(
			"Chưa có trang nào đã lưu trữ",
		);
		expect(
			goc.querySelector("[data-nut-da-luu-tru]")?.getAttribute("aria-pressed"),
		).toBe("true");
	});
});
