import { afterEach, describe, expect, mock, test } from "bun:test";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

const canh = {
	coTrang: true,
	boLocLoi: false,
	goiBoLoc: 0,
	den: [] as string[],
};

const DEM = { "quy-dinh": 1, "chinh-sach": 0, "quy-trinh": 0, "bieu-mau": 0 };

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		taiLieu: {
			list: {
				queryOptions: (vao: { page: number }) => ({
					queryKey: ["taiLieu.list", vao],
					queryFn: async () => ({
						rows: canh.coTrang
							? [
									{
										slug: "quy-dinh-a",
										ten: "Quy định A",
										loai: "quy-dinh",
										chuTrang: { id: "u1", name: "Hà" },
										donVi: { id: "dv1", name: "Phòng Kinh doanh" },
										capNhat: "2026-09-20T00:00:00.000Z",
										coBanCho: false,
									},
								]
							: [],
						total: canh.coTrang ? 1 : 0,
						facetCounts: canh.coTrang
							? DEM
							: {
									"quy-dinh": 0,
									"chinh-sach": 0,
									"quy-trinh": 0,
									"bieu-mau": 0,
								},
					}),
				}),
			},
			boLoc: {
				queryOptions: () => ({
					queryKey: ["taiLieu.boLoc"],
					queryFn: async () => {
						canh.goiBoLoc += 1;
						if (canh.boLocLoi) throw new Error("mang");
						return {
							donVi: [{ id: "dv1", ten: "Phòng Kinh doanh", so: 3 }],
							chuTrang: [{ id: "u1", ten: "Hà", so: 4 }],
						};
					},
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
		replace: () => {},
		refresh: () => {},
		prefetch: () => {},
	}),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/tai-lieu",
	useSearchParams: () => new URLSearchParams(),
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
const { duongLoc } = await import("@/app/(app)/[slug]/tai-lieu/danh-sach-loc");

type LocGia = {
	loai: "quy-dinh" | null;
	donVi: string | null;
	chu: string | null;
	page: number;
};

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
	canh.coTrang = true;
	canh.boLocLoi = false;
	canh.goiBoLoc = 0;
	canh.den = [];
});

const nhip = () => new Promise((r) => setTimeout(r, 30));

async function cho(): Promise<void> {
	for (let i = 0; i < 6; i += 1) {
		await act(async () => {
			await nhip();
		});
	}
}

async function mo(loc: LocGia): Promise<HTMLElement> {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	const duong = duongLoc("", loc);
	await act(async () => {
		root?.render(
			<NuqsTestingAdapter
				hasMemory
				onUrlUpdate={(e) => {
					canh.den.push(`/ws/tai-lieu${e.queryString}`);
				}}
				searchParams={duong}
			>
				<QueryClientProvider client={qc}>
					<LocaleProvider locale="vi">
						<DanhSachTrang />
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	await cho();
	return khung;
}

async function bam(el: Element | null | undefined): Promise<void> {
	if (!(el instanceof HTMLElement))
		throw new Error("man-loc: khong thay phan tu");
	await act(async () => {
		for (const ten of ["pointerdown", "mousedown", "pointerup", "mouseup"]) {
			el.dispatchEvent(
				new window.PointerEvent(ten, { bubbles: true, button: 0 }),
			);
		}
		el.click();
		await nhip();
	});
}

async function chon(khoa: string, nhan: string): Promise<void> {
	await bam(document.body.querySelector(`[${khoa}]`));
	const muc = [...document.body.querySelectorAll("[cmdk-item]")].find(
		(e) => e.textContent?.includes(nhan) ?? false,
	);
	await bam(muc);
}

function thamSoCuoi(): URLSearchParams {
	const den = canh.den.at(-1) ?? "";
	return new URLSearchParams(den.split("?")[1] ?? "");
}

describe("man-loc", () => {
	test("man-loc: chon don vi dua don vi len dia chi, giu loai, ve trang 1", async () => {
		await mo({ loai: "quy-dinh", donVi: null, chu: null, page: 3 });
		await chon("data-loc-don-vi", "Phòng Kinh doanh");
		const q = thamSoCuoi();
		if (q.get("page") !== null) {
			throw new Error("man-loc: doi loc khong ve trang 1");
		}
		expect(q.get("donVi")).toBe("dv1");
		expect(q.get("loai")).toBe("quy-dinh");
	});

	test("man-loc: chon them chu thi dia chi mang ca hai loc", async () => {
		await mo({ loai: null, donVi: "dv1", chu: null, page: 1 });
		await chon("data-loc-chu", "Hà");
		const q = thamSoCuoi();
		expect(q.get("donVi")).toBe("dv1");
		expect(q.get("chuTrang")).toBe("u1");
	});

	test("man-loc: loc ra rong thi noi khong trang nao khop va nut bo loc xoa ca ba", async () => {
		canh.coTrang = false;
		const goc = await mo({
			loai: "quy-dinh",
			donVi: "dv1",
			chu: "u1",
			page: 1,
		});
		expect(goc.textContent).toContain("Không có trang nào khớp bộ lọc");
		expect(goc.querySelector("[data-kho-rong]")).toBeNull();
		const nutBoLoc = (o: HTMLElement) =>
			[...o.querySelectorAll("button")].filter(
				(b) => b.textContent === "Bỏ lọc",
			);
		const soNut = nutBoLoc(goc).length;
		expect(soNut > 0).toBe(true);
		for (let i = 0; i < soNut; i += 1) {
			act(() => root?.unmount());
			khung?.remove();
			canh.den = [];
			const lai = await mo({
				loai: "quy-dinh",
				donVi: "dv1",
				chu: "u1",
				page: 1,
			});
			await bam(nutBoLoc(lai)[i]);
			const q = thamSoCuoi();
			expect(canh.den.length > 0).toBe(true);
			expect([q.get("loai"), q.get("donVi"), q.get("chuTrang")]).toEqual([
				null,
				null,
				null,
			]);
		}
	});

	test("man-loc: tai bo loc loi thi hien loi co nut thu lai", async () => {
		canh.boLocLoi = true;
		const goc = await mo({ loai: null, donVi: null, chu: null, page: 1 });
		const chu = goc.textContent ?? "";
		if (!chu.includes("Không tải được danh sách đơn vị và chủ trang.")) {
			throw new Error("man-loc: loi bo loc hien thanh rong");
		}
		const truoc = canh.goiBoLoc;
		canh.boLocLoi = false;
		await bam(
			[...goc.querySelectorAll("button")].find(
				(b) => b.textContent === "Thử lại",
			),
		);
		await cho();
		expect(canh.goiBoLoc).toBe(truoc + 1);
		expect(goc.querySelector("[data-loc-don-vi]")).not.toBeNull();
	});
});
