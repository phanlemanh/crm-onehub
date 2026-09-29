import { afterEach, describe, expect, mock, test } from "bun:test";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

const HAI_DONG = [
	{
		slug: "an-toan",
		ten: "An toàn thông tin",
		cau: "Xem quy trình khiếu nại trước khi trả lời khách.",
		vanBan: "quy trình khiếu nại",
		soLan: 1,
	},
	{
		slug: "phu-luc",
		ten: "Phụ lục khiếu nại",
		cau: "Đọc lần đầu ở đây.",
		vanBan: "lần đầu",
		soLan: 2,
	},
];

const canh = {
	kieu: "co" as "co" | "rong" | "loi",
	goi: 0,
};

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		taiLieu: {
			nhacToi: {
				queryOptions: (vao: { slug: string }) => ({
					queryKey: ["taiLieu.nhacToi", vao],
					queryFn: async () => {
						canh.goi += 1;
						if (canh.kieu === "loi") throw new Error("mang");
						return { rows: canh.kieu === "co" ? HAI_DONG : [] };
					},
				}),
			},
		},
	}),
}));
mock.module("next/navigation", () => ({
	useParams: () => ({ slug: "ws" }),
	useRouter: () => ({ push: () => {}, prefetch: () => {} }),
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

const { NhacToi } = await import(
	"@/app/(app)/[slug]/tai-lieu/[trang]/nhac-toi"
);

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
	canh.kieu = "co";
	canh.goi = 0;
});

const nhip = () => new Promise((r) => setTimeout(r, 30));

async function mo(): Promise<HTMLElement> {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	await act(async () => {
		root?.render(
			<QueryClientProvider client={qc}>
				<LocaleProvider locale="vi">
					<NhacToi slug="quy-trinh-khieu-nai" />
				</LocaleProvider>
			</QueryClientProvider>,
		);
		await nhip();
	});
	for (let i = 0; i < 10 && !khung.textContent; i += 1) {
		await act(async () => {
			await nhip();
		});
	}
	return khung;
}

describe("man-nhac-toi", () => {
	test("man-nhac-toi: hai trang nguon, moi dong la lien ket kem cau co chu lien ket dam", async () => {
		const goc = await mo();
		expect(goc.textContent).toContain("Trang nhắc tới trang này (2)");
		const dong = [...goc.querySelectorAll("a[data-nhac-toi-dong]")];
		expect(dong.map((d) => d.getAttribute("href"))).toEqual([
			"/ws/tai-lieu/an-toan",
			"/ws/tai-lieu/phu-luc",
		]);
		expect(dong.map((d) => d.querySelector("strong")?.textContent)).toEqual([
			"quy trình khiếu nại",
			"lần đầu",
		]);
	});

	test("man-nhac-toi: khong trang nao nhac thi ghi cau rong", async () => {
		canh.kieu = "rong";
		const goc = await mo();
		expect(goc.textContent).toContain("Chưa trang nào nhắc tới trang này.");
		expect(goc.querySelectorAll("a[data-nhac-toi-dong]")).toHaveLength(0);
	});

	test("man-nhac-toi: tai loi thi hien loi co nut thu lai, khong hien cau rong", async () => {
		canh.kieu = "loi";
		const goc = await mo();
		const chu = goc.textContent ?? "";
		if (chu.includes("Chưa trang nào nhắc tới trang này.")) {
			throw new Error("man-nhac-toi: loi hien thanh rong");
		}
		expect(chu).toContain("Không tải được các trang nhắc tới trang này.");
		const nut = [...goc.querySelectorAll("button")].find(
			(b) => b.textContent === "Thử lại",
		);
		const truoc = canh.goi;
		canh.kieu = "co";
		await act(async () => {
			nut?.click();
			await nhip();
		});
		expect(canh.goi).toBe(truoc + 1);
		expect(goc.textContent).toContain("Trang nhắc tới trang này (2)");
	});
});
