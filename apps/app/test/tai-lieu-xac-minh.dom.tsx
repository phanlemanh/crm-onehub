import { afterEach, describe, expect, mock, test } from "bun:test";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	act,
	type ComponentProps,
	createElement as h,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";

type LoiTrpc = Error & { data?: { httpStatus?: number } };
type DatXacMinhVao = { slug: string; den: string | null };
type ChonMutation = { onSuccess?: () => void };
type Canh = { goi: DatXacMinhVao[]; loi: LoiTrpc | null; lamMoi: number };

function canhMoi(): Canh {
	return { goi: [], loi: null, lamMoi: 0 };
}

const canh = canhMoi();

const treo = () => new Promise<never>(() => {});

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		taiLieu: {
			nhacToi: {
				queryOptions: (vao: { slug: string }) => ({
					queryKey: ["taiLieu.nhacToi", vao],
					queryFn: treo,
				}),
			},
			datXacMinh: {
				mutationOptions: (chon?: ChonMutation) => ({
					...chon,
					mutationFn: async (v: DatXacMinhVao) => {
						canh.goi.push(v);
						if (canh.loi) throw canh.loi;
						return { ok: true };
					},
				}),
			},
		},
	}),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({
		push: () => {},
		prefetch: () => {},
		refresh: () => {
			canh.lamMoi += 1;
		},
	}),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/tai-lieu/hoa-hong",
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

type TrangDoc = ComponentProps<typeof ManDoc>["trang"];

const SLUG = "hoa-hong";

function trangVoi(xacMinh: TrangDoc["xacMinh"]): TrangDoc {
	return {
		slug: SLUG,
		ten: "Quy định hoa hồng",
		loai: "quy-dinh",
		chuTrang: "Hà",
		donVi: null,
		phienBan: { so: 3, duyetLuc: "2026-09-05T03:00:00.000Z" },
		noiDung: "## Mức\n\nTầng 2 hưởng 1,2%.",
		choLanDau: null,
		soBanCho: 0,
		deXuatChoId: null,
		nguon: null,
		xacMinh,
	};
}

const TUONG_LAI = {
	den: "2026-12-20T05:00:00.000Z",
	quaHan: false,
	coQuyen: true,
};

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
	Object.assign(canh, canhMoi());
});

const nhip = () => new Promise((r) => setTimeout(r, 30));

async function cho(): Promise<void> {
	for (let i = 0; i < 6; i += 1) {
		await act(async () => {
			await nhip();
		});
	}
}

async function mo(trang: TrangDoc): Promise<HTMLElement> {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	const qc = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	await act(async () => {
		root?.render(
			<QueryClientProvider client={qc}>
				<LocaleProvider locale="vi">
					<ManDoc trang={trang} />
				</LocaleProvider>
			</QueryClientProvider>,
		);
	});
	await cho();
	return khung;
}

function nut(goc: ParentNode, chu: string): HTMLButtonElement | undefined {
	return [...goc.querySelectorAll("button")].find(
		(b) => b.textContent?.trim() === chu,
	);
}

async function bam(b: Element | undefined | null): Promise<void> {
	if (!(b instanceof HTMLElement))
		throw new Error("tlk-man-xac-minh: thieu nut");
	await act(async () => {
		b.click();
		await nhip();
	});
	await cho();
}

async function chonNgay(ngay: string): Promise<void> {
	const trigger = document.body.querySelector(
		'[role=dialog] [data-slot="date-picker-trigger"]',
	);
	let o: Element | null = null;
	for (let lan = 0; lan < 5 && o === null; lan += 1) {
		await bam(trigger);
		o = document.body.querySelector(`button[data-day="${ngay}"]`);
	}
	await bam(o);
}

describe("tlk-man-xac-minh", () => {
	test("tlk-man-xac-minh: o 1 co quyen, han tuong lai: dong xac minh den va nut dat han", async () => {
		const goc = await mo(trangVoi(TUONG_LAI));
		expect(goc.querySelector("[data-xac-minh]")?.textContent).toContain(
			"Xác minh đến 20/12/2026",
		);
		expect(nut(goc, "Đặt hạn xác minh")).toBeDefined();
	});

	test("tlk-man-xac-minh: o 2 qua han: nhan Qua han xac minh", async () => {
		const goc = await mo(
			trangVoi({
				den: "2026-09-20T05:00:00.000Z",
				quaHan: true,
				coQuyen: false,
			}),
		);
		const dong = goc.querySelector("[data-xac-minh]")?.textContent ?? "";
		expect(dong).toContain("Quá hạn xác minh");
		expect(dong).not.toContain("Xác minh đến");
	});

	test("tlk-man-xac-minh: o 3 khong co quyen: khong co nut dat han", async () => {
		const goc = await mo(trangVoi({ ...TUONG_LAI, coQuyen: false }));
		expect(goc.querySelector("[data-xac-minh]")?.textContent).toContain(
			"Xác minh đến 20/12/2026",
		);
		if (nut(goc, "Đặt hạn xác minh")) {
			throw new Error("tlk-man-xac-minh: o 3 thay nut");
		}
	});

	test("tlk-man-xac-minh: o 4 chon ngay va luu goi mutation dung slug va ngay", async () => {
		const goc = await mo(trangVoi(TUONG_LAI));
		await bam(nut(goc, "Đặt hạn xác minh"));
		await chonNgay("2026-12-24");
		await bam(nut(document.body, "Lưu"));
		expect(canh.goi).toEqual([{ slug: SLUG, den: "2026-12-24" }]);
		expect(document.body.querySelector("[role=dialog]")).toBeNull();
		expect(canh.lamMoi).toBe(1);
	});

	test("tlk-man-xac-minh: o 6 go han: mutation goi den null, hop dong, trang lam moi", async () => {
		const goc = await mo(trangVoi(TUONG_LAI));
		await bam(nut(goc, "Đặt hạn xác minh"));
		const go = nut(document.body, "Gỡ hạn");
		if (!go) throw new Error("tlk-man-xac-minh: o 6 khong co nut go han");
		await bam(go);
		expect(canh.goi).toEqual([{ slug: SLUG, den: null }]);
		expect(document.body.querySelector("[role=dialog]")).toBeNull();
		expect(canh.lamMoi).toBe(1);
	});

	test("tlk-man-xac-minh: o 7 chua co han thi khong co nut go han", async () => {
		const goc = await mo(trangVoi({ den: null, quaHan: false, coQuyen: true }));
		await bam(nut(goc, "Đặt hạn xác minh"));
		expect(nut(document.body, "Gỡ hạn")).toBeUndefined();
	});

	test("tlk-man-xac-minh: o 5 mutation loi: hien loi, hop van mo", async () => {
		canh.loi = Object.assign(
			new Error("Không có quyền đặt hạn xác minh trang này."),
			{
				data: { httpStatus: 403 },
			},
		);
		const goc = await mo(trangVoi(TUONG_LAI));
		await bam(nut(goc, "Đặt hạn xác minh"));
		await chonNgay("2026-12-24");
		await bam(nut(document.body, "Lưu"));
		const hop = document.body.querySelector("[role=dialog]");
		expect(hop).not.toBeNull();
		expect(hop?.textContent).toContain(
			"Chưa lưu được: Không có quyền đặt hạn xác minh trang này.",
		);
		expect(canh.lamMoi).toBe(0);
	});
});
