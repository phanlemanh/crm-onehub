import { afterEach, describe, expect, mock, test } from "bun:test";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { soSanh, suKienDoi } from "@crm/validation/tai-lieu-diff";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	act,
	type ComponentProps,
	createElement as h,
	type ReactElement,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import { taiLieuLichSuMessages } from "@/lib/messages/tai-lieu-lich-su";

const M = taiLieuLichSuMessages("vi");

const NGUOI = {
	ha: { id: "u-ha", name: "Nguyễn Thu Hà" },
	quan: { id: "u-quan", name: "Trần Minh Quân" },
	yen: { id: "u-yen", name: "Lê Hoàng Yến" },
};

const BA_BAN = [
	{
		so: 2,
		ten: "Quy định hoa hồng",
		duyetLuc: "2026-10-02T03:00:00.000Z",
		nguoiDuyet: NGUOI.ha,
		nguoiDeXuat: NGUOI.yen,
		dangDung: false,
	},
	{
		so: 3,
		ten: "Quy định hoa hồng",
		duyetLuc: "2026-10-08T03:00:00.000Z",
		nguoiDuyet: NGUOI.ha,
		nguoiDeXuat: NGUOI.quan,
		dangDung: true,
	},
	{
		so: 1,
		ten: "Quy định hoa hồng",
		duyetLuc: "2026-09-20T03:00:00.000Z",
		nguoiDuyet: NGUOI.ha,
		nguoiDeXuat: NGUOI.quan,
		dangDung: false,
	},
];

const canh = {
	kieu: "ba" as "ba" | "mot" | "loi",
	goi: 0,
	quayLai: [] as { slug: string; so: number }[],
};

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		taiLieu: {
			lichSu: {
				queryOptions: (vao: { slug: string }) => ({
					queryKey: ["taiLieu.lichSu", vao],
					queryFn: async () => {
						canh.goi += 1;
						if (canh.kieu === "loi") throw new Error("mang");
						return canh.kieu === "mot"
							? [{ ...BA_BAN[2], so: 1, dangDung: true }]
							: BA_BAN;
					},
				}),
			},
			quayLai: {
				mutationOptions: (chon: object) => ({
					...chon,
					mutationFn: async (vao: { slug: string; so: number }) => {
						canh.quayLai.push(vao);
						return { deXuatId: "dx-moi" };
					},
				}),
			},
		},
	}),
}));
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({ taiLieu: async () => {} }),
}));
mock.module("next/navigation", () => ({
	useParams: () => ({ slug: "ws" }),
	useRouter: () => ({ push: () => {}, prefetch: () => {}, refresh: () => {} }),
}));
mock.module("next/link", () => ({
	default: ({
		children,
		...props
	}: ComponentProps<"a"> & { children?: ReactNode }) => h("a", props, children),
}));
const khoi =
	(the: string) =>
	({ children, ...props }: { children?: ReactNode }) =>
		h(the, props, children);
mock.module("@/components/page-shell", () => ({
	PageShellHeader: khoi("header"),
	PageShellHeading: khoi("div"),
	PageShellTitle: khoi("h1"),
	PageShellDescription: khoi("p"),
	PageShellContent: khoi("div"),
}));

const { ManLichSu } = await import(
	"@/app/(app)/[slug]/tai-lieu/[trang]/lich-su/man-lich-su"
);
const { BanCu } = await import(
	"@/app/(app)/[slug]/tai-lieu/[trang]/lich-su/[so]/ban-cu"
);

const BAN_1 = "## Mức\n\nTầng 2 hưởng 1% doanh thu.\n\nÁp dụng từ quý một.";
const BAN_3 = "## Mức\n\nTầng 2 hưởng 1,2% doanh thu.\n\nThêm thưởng cuối năm.";

function banCu(so: number, laBanDangDung: boolean) {
	const khoiDoi = soSanh(BAN_3, so === 3 ? BAN_3 : BAN_1);
	return {
		slug: "hoa-hong",
		tenTrang: "Quy định hoa hồng",
		so,
		noiDung: so === 3 ? BAN_3 : BAN_1,
		duyetLuc: "2026-09-20T03:00:00.000Z",
		nguoiDuyet: NGUOI.ha.name,
		laBanDangDung,
		daLuuTru: false,
		khoi: khoiDoi,
		dai: suKienDoi(khoiDoi),
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
	canh.kieu = "ba";
	canh.goi = 0;
	canh.quayLai = [];
});

const nhip = () => new Promise((r) => setTimeout(r, 30));

async function cho(): Promise<void> {
	for (let i = 0; i < 6; i += 1)
		await act(async () => {
			await nhip();
		});
}

async function mo(nut: ReactElement): Promise<HTMLElement> {
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
	});
	await cho();
	return khung;
}

function nutChuaChu(goc: HTMLElement, chu: string): Element[] {
	return [...goc.querySelectorAll("*")].filter(
		(e) =>
			[...e.childNodes].some(
				(n) => n.nodeType === 3 && (n.textContent ?? "").includes(chu),
			),
	);
}

function ngoaiVungKhongDich(goc: HTMLElement, chu: readonly string[]): string[] {
	return chu.flatMap((c) => {
		const nut = nutChuaChu(goc, c);
		if (nut.length === 0) return [`khong thay: ${c}`];
		return nut
			.filter((n) => !n.closest('[translate="no"]'))
			.map((n) => `${n.tagName.toLowerCase()}: ${c}`);
	});
}

const dongBang = (goc: HTMLElement) =>
	[...goc.querySelectorAll("[data-bang-lich-su] tr[data-phien-ban]")].map(
		(r) => ({
			so: r.getAttribute("data-phien-ban"),
			dangDung: (r.textContent ?? "").includes(M.lichSu.dangDung),
		}),
	);

describe("tai-lieu-lich-su", () => {
	test("lich-su: mot phien ban — mot dong Dang dung va cau mot phien ban", async () => {
		canh.kieu = "mot";
		const goc = await mo(<ManLichSu slug="hoa-hong" ten="Quy định hoa hồng" />);
		expect(dongBang(goc)).toEqual([{ so: "1", dangDung: true }]);
		expect(goc.querySelector("[data-mot-ban]")?.textContent).toBe(
			M.lichSu.motBan,
		);
	});

	test("lich-su: ba phien ban dau vao xao tron — bang moi nhat truoc, Dang dung dung dong", async () => {
		const goc = await mo(<ManLichSu slug="hoa-hong" ten="Quy định hoa hồng" />);
		expect(dongBang(goc)).toEqual([
			{ so: "3", dangDung: true },
			{ so: "2", dangDung: false },
			{ so: "1", dangDung: false },
		]);
		expect(goc.querySelector("[data-mot-ban]")).toBeNull();
		expect(
			[...goc.querySelectorAll("[data-the-lich-su] a[data-phien-ban]")].map(
				(a) => a.getAttribute("href"),
			),
		).toEqual([
			"/ws/tai-lieu/hoa-hong/lich-su/3",
			"/ws/tai-lieu/hoa-hong/lich-su/2",
			"/ws/tai-lieu/hoa-hong/lich-su/1",
		]);
	});

	test("lich-su: loi tai — VungTaiLoi, Thu lai goi lai truy van", async () => {
		canh.kieu = "loi";
		const goc = await mo(<ManLichSu slug="hoa-hong" ten="Quy định hoa hồng" />);
		expect(goc.textContent).toContain(M.lichSu.loi.tieuDe);
		expect(canh.goi).toBe(1);
		const thuLai = [...goc.querySelectorAll("button")].find((b) =>
			(b.textContent ?? "").includes("Thử lại"),
		);
		if (!thuLai) throw new Error("khong co nut Thu lai");
		await act(async () => {
			thuLai.click();
		});
		await cho();
		expect(canh.goi).toBe(2);
	});

	test("lich-su: ten trang, ten nguoi nam trong vung translate=no; chieu do bat duoc o bi bo thuoc tinh", async () => {
		const goc = await mo(<ManLichSu slug="hoa-hong" ten="Quy định hoa hồng" />);
		const DU_LIEU = ["Quy định hoa hồng", NGUOI.ha.name, NGUOI.quan.name];
		expect(ngoaiVungKhongDich(goc, DU_LIEU)).toEqual([]);
		goc.querySelector("h1")?.removeAttribute("translate");
		expect(ngoaiVungKhongDich(goc, DU_LIEU)).toEqual([
			"h1: Quy định hoa hồng",
		]);
	});

	test("ban-cu: chuyen giua so sanh (co them va bo) va toan van; nut quay lai goi dung so", async () => {
		const goc = await mo(<BanCu ban={banCu(1, false)} />);
		expect(goc.querySelector("[data-diff-trang] ins")).not.toBeNull();
		expect(goc.querySelector("[data-diff-trang] del")).not.toBeNull();
		const toanVan = goc.querySelector<HTMLElement>('[data-kieu="toan-van"]');
		if (!toanVan) throw new Error("khong co nut Toan van");
		await act(async () => {
			toanVan.click();
		});
		await cho();
		expect(goc.querySelector("[data-diff-trang]")).toBeNull();
		expect(goc.textContent).toContain("Áp dụng từ quý một.");
		const nut = goc.querySelector<HTMLElement>("[data-nut-quay-lai]");
		expect(nut?.textContent).toBe("Quay lại phiên bản 1");
		await act(async () => {
			nut?.click();
		});
		await cho();
		expect(canh.quayLai).toEqual([{ slug: "hoa-hong", so: 1 }]);
		expect(
			ngoaiVungKhongDich(goc, ["Quy định hoa hồng", "Áp dụng từ quý một."]),
		).toEqual([]);
	});

	test("ban-cu: phien ban la ban dang dung — khong nut quay lai, co cau ban dang dung", async () => {
		const goc = await mo(<BanCu ban={banCu(3, true)} />);
		expect(goc.querySelector("[data-nut-quay-lai]")).toBeNull();
		expect(goc.querySelector("[data-la-ban-dang-dung]")?.textContent).toBe(
			M.banCu.laBanDangDung,
		);
		expect(goc.querySelector("[data-diff-trang]")).toBeNull();
	});
});
