import { afterEach, describe, expect, mock, test } from "bun:test";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

const canh = {
	vao: [] as { nhom: string; page: number }[],
	den: [] as string[],
};

function dong(i: number) {
	return {
		id: `dx-${i}`,
		slug: "quy-dinh-a",
		ten: `Bản chờ ${i}`,
		taoBoi: { id: "u1", name: "Hà" },
		luc: "2026-09-20T00:00:00.000Z",
		trangThai: "CHO_DUYET",
		cu: false,
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		taiLieu: {
			proposals: {
				queryOptions: (vao: { nhom: string; page: number }) => ({
					queryKey: ["taiLieu.proposals", vao],
					queryFn: async () => {
						canh.vao.push(vao);
						const dau = (vao.page - 1) * 25;
						const so = Math.min(25, 30 - dau);
						return {
							rows: Array.from({ length: so }, (_, i) => dong(dau + i)),
							total: 30,
							choToiDuyet: 30,
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

const { ChoDuyet } = await import("@/app/(app)/[slug]/tai-lieu/cho-duyet");

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
	canh.vao = [];
	canh.den = [];
});

const nhip = () => new Promise((r) => setTimeout(r, 30));

async function mo(page: number): Promise<HTMLElement> {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	const duong = `?tabTaiLieu=cho-duyet${page > 1 ? `&page=${page}` : ""}`;
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
						<ChoDuyet />
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	for (let i = 0; i < 6; i += 1) {
		await act(async () => {
			await nhip();
		});
	}
	return khung;
}

describe("man-cho-duyet", () => {
	test("man-cho-duyet: 30 ban cho co phan trang, trang 1 co 25 dong, tong hien 30", async () => {
		const goc = await mo(1);
		expect(canh.vao[0]).toEqual({ nhom: "cho", page: 1 });
		expect(goc.querySelectorAll("[data-de-xuat]")).toHaveLength(25);
		const tiep = [...goc.querySelectorAll("button")].find((b) =>
			b.textContent?.includes("Tiếp"),
		);
		if (!tiep) {
			throw new Error("man-cho-duyet: khong co phan trang khi total > 25");
		}
		expect(goc.textContent).toContain("30");
		await act(async () => {
			tiep.click();
			await nhip();
		});
		const q = new URLSearchParams(canh.den.at(-1)?.split("?")[1] ?? "");
		expect([q.get("tabTaiLieu"), q.get("page")]).toEqual(["cho-duyet", "2"]);
	});

	test("man-cho-duyet: trang 2 hoi dung trang 2 va hien 5 dong con lai", async () => {
		const goc = await mo(2);
		expect(canh.vao[0]).toEqual({ nhom: "cho", page: 2 });
		expect(goc.querySelectorAll("[data-de-xuat]")).toHaveLength(5);
	});
});
