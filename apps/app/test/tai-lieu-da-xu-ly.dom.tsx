import { afterEach, describe, expect, mock, test } from "bun:test";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { TRANG_THAI_DE_XUAT } from "@crm/validation/tai-lieu";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";

const NHAN = taiLieuMessages("vi").choDuyet.trangThai;

type Dong = { id: string; trangThai: string; cu: boolean };

const canh = { rows: [] as Dong[] };

function dong(d: Dong) {
	return {
		...d,
		slug: "quy-dinh-a",
		ten: `Bản ${d.id}`,
		taoBoi: { id: "u1", name: "Nguyễn Thu Hà" },
		luc: "2026-10-10T00:00:00.000Z",
		loai: "NOI_DUNG",
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		taiLieu: {
			proposals: {
				queryOptions: (vao: { nhom: string; page: number }) => ({
					queryKey: ["taiLieu.proposals", vao, canh.rows],
					queryFn: async () => ({
						rows: canh.rows.map(dong),
						total: canh.rows.length,
						choToiDuyet: 0,
					}),
				}),
			},
		},
	}),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, refresh: () => {}, prefetch: () => {} }),
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

const { ChoDuyet } = await import("@/app/(app)/[slug]/tai-lieu/cho-duyet");

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
	canh.rows = [];
});

const nhip = () => new Promise((r) => setTimeout(r, 30));

async function mo(rows: Dong[]): Promise<HTMLElement> {
	canh.rows = rows;
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	await act(async () => {
		root?.render(
			<NuqsTestingAdapter
				hasMemory
				searchParams="?tabTaiLieu=cho-duyet&nhomDeXuat=da-xu-ly"
			>
				<QueryClientProvider client={qc}>
					<LocaleProvider locale="vi">
						<ChoDuyet />
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	for (let i = 0; i < 6 && !khung.querySelector("[data-de-xuat]"); i += 1)
		await act(async () => {
			await nhip();
		});
	return khung;
}

const nhanCacDong = (goc: HTMLElement) =>
	[...goc.querySelectorAll("a[data-de-xuat]")].map((a) => ({
		id: a.getAttribute("data-de-xuat"),
		nhan: a.querySelector("[data-trang-thai]")?.textContent ?? null,
	}));

describe("tai-lieu-da-xu-ly", () => {
	test("da-xu-ly: ba dong da duyet, tra lai, cu mang ba nhan theo dung thu tu", async () => {
		const goc = await mo([
			{ id: "a", trangThai: "DA_DUYET", cu: false },
			{ id: "b", trangThai: "TRA_LAI", cu: false },
			{ id: "c", trangThai: "CU", cu: true },
		]);
		expect(nhanCacDong(goc)).toEqual([
			{ id: "a", nhan: NHAN.DA_DUYET },
			{ id: "b", nhan: NHAN.TRA_LAI },
			{ id: "c", nhan: NHAN.CU },
		]);
		expect([NHAN.DA_DUYET, NHAN.TRA_LAI, NHAN.CU]).toEqual([
			"Đã duyệt",
			"Đã trả lại",
			"Cũ",
		]);
	});

	test("da-xu-ly: chieu do — moi trang thai cua khuon co nhan, trang thai la khong de nhan rong", async () => {
		const daXuLy = TRANG_THAI_DE_XUAT.filter((t) => t !== "CHO_DUYET");
		const goc = await mo([
			...daXuLy.map((t) => ({ id: t, trangThai: t, cu: t === "CU" })),
			{ id: "la", trangThai: "XOA", cu: false },
		]);
		const ds = nhanCacDong(goc);
		for (const t of daXuLy)
			expect(`${t}: ${ds.find((d) => d.id === t)?.nhan}`).toBe(
				`${t}: ${NHAN[t]}`,
			);
		expect(ds.find((d) => d.id === "la")?.nhan).toBeNull();
		expect(
			[...goc.querySelectorAll("[data-trang-thai]")].filter(
				(b) => (b.textContent ?? "").trim() === "",
			),
		).toEqual([]);
	});
});
