import { afterEach, describe, expect, mock, test } from "bun:test";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

type TrangTim = {
	slug: string;
	ten: string;
	loai: string;
	chuTrang: { id: string; name: string };
	phienBan: number;
	doanTrich: { truoc: string; khop: string; sau: string };
};

const canh = {
	doiTac: "co" as "co" | "cam" | "loi" | "rong",
	taiLieu: "co" as "co" | "loi" | "rong",
	goi: { quick: 0, tim: 0 },
	den: [] as string[],
};

const TRANG: TrangTim[] = [
	{
		slug: "quy-dinh-hoa-hong",
		ten: "Quy định hoa hồng đối tác",
		loai: "quy-dinh",
		chuTrang: { id: "u1", name: "Hà" },
		phienBan: 3,
		doanTrich: { truoc: "Tỉ lệ ", khop: "hoa", sau: " hồng cho đối tác" },
	},
	{
		slug: "nghi-phep-nam",
		ten: "Nghỉ phép năm",
		loai: "quy-dinh",
		chuTrang: { id: "u2", name: "Vinh" },
		phienBan: 1,
		doanTrich: { truoc: "không tính ", khop: "hoa", sau: " hồng" },
	},
];

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		search: {
			quick: {
				queryOptions: (vao: { q: string }) => ({
					queryKey: ["search.quick", vao],
					queryFn: async () => {
						canh.goi.quick += 1;
						if (canh.doiTac === "loi") throw new Error("mang");
						if (canh.doiTac === "rong") return { hits: [] };
						return {
							hits: [
								{
									kind: "company",
									id: "c1",
									label: "Công ty Hoa Hồng",
									detail: null,
									iconUrl: null,
									iconDarkUrl: null,
									iconTone: null,
									imageUrl: null,
								},
							],
						};
					},
				}),
			},
		},
		taiLieu: {
			tim: {
				queryOptions: (vao: { q: string }) => ({
					queryKey: ["taiLieu.tim", vao],
					queryFn: async () => {
						canh.goi.tim += 1;
						if (canh.taiLieu === "loi") throw new Error("mang");
						if (canh.taiLieu === "rong") return { rows: [] };
						return { rows: TRANG };
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
	usePathname: () => "/ws",
	useSearchParams: () => new URLSearchParams(),
}));
mock.module("@/components/crm/record-sheet/record-stack", () => ({
	useOpenRecord: () => () => {},
}));

const { QuickSwitcher } = await import("@/components/crm/quick-switcher");

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
	canh.doiTac = "co";
	canh.taiLieu = "co";
	canh.goi = { quick: 0, tim: 0 };
	canh.den = [];
});

const nhip = () => new Promise((r) => setTimeout(r, 30));

async function mo(coDoiTac: boolean): Promise<void> {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	await act(async () => {
		root?.render(
			<NuqsTestingAdapter hasMemory searchParams="?k=true">
				<QueryClientProvider client={qc}>
					<LocaleProvider locale="vi">
						<QuickSwitcher coDoiTac={coDoiTac} />
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
		await nhip();
	});
}

async function go(chu: string): Promise<void> {
	const o = document.body.querySelector<HTMLInputElement>("input");
	if (!o) throw new Error("cmdk: khong thay o tim");
	const dat = Object.getOwnPropertyDescriptor(
		window.HTMLInputElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		dat?.call(o, chu);
		o.dispatchEvent(new window.Event("input", { bubbles: true }));
		await nhip();
		await nhip();
	});
}

const { khungUngDungMessages } = await import("@/lib/messages/khung-ung-dung");
const M = khungUngDungMessages("vi").switcher;

describe("ssct-tim-nhanh-loi", () => {
	test("ssct-tim-nhanh-loi: tìm CRM lỗi, tìm trang được → dòng báo CRM + trang, không «Không có gì khớp»", async () => {
		canh.doiTac = "loi";
		await mo(true);
		await go("quy dinh hoa hong");
		const dong = document.body.querySelector("[data-crm-loi]");
		expect(dong?.textContent ?? "").toBe(M.crmLoi);
		expect(
			[...document.body.querySelectorAll("[data-tai-lieu]")].map((d) =>
				d.getAttribute("data-tai-lieu"),
			),
		).toEqual(["quy-dinh-hoa-hong", "nghi-phep-nam"]);
		expect(document.body.textContent ?? "").not.toContain(M.noMatch);
	});

	test("ssct-tim-nhanh-loi: chiều đỏ — cả hai tìm được và rỗng → «Không có gì khớp», không dòng lỗi", async () => {
		canh.doiTac = "rong";
		canh.taiLieu = "rong";
		await mo(true);
		await go("khong co gi");
		expect(document.body.querySelector("[data-crm-loi]")).toBeNull();
		expect(document.body.textContent ?? "").toContain(M.noMatch);
	});
});
