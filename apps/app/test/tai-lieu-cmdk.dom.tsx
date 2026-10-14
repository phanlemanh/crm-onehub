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
	doiTac: "co" as "co" | "cam",
	taiLieu: "co" as "co" | "loi",
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
						if (canh.doiTac === "cam")
							throw Object.assign(new Error("Không có quyền."), {
								data: { code: "FORBIDDEN", httpStatus: 403 },
							});
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

function tieuDeNhom(): string[] {
	return [...document.body.querySelectorAll("[cmdk-group-heading]")].map(
		(e) => e.textContent?.trim() ?? "",
	);
}

describe("cmdk", () => {
	test("cmdk: thanh vien thay nhom Tai lieu kem doan trich, chon dong di toi trang", async () => {
		await mo(true);
		await go("quy dinh hoa hong");
		expect(tieuDeNhom()).toEqual(["Công ty", "Tài liệu"]);
		const dong = [...document.body.querySelectorAll("[data-tai-lieu]")];
		expect(dong.map((d) => d.getAttribute("data-tai-lieu"))).toEqual([
			"quy-dinh-hoa-hong",
			"nghi-phep-nam",
		]);
		expect(dong[0]?.querySelector("strong")?.textContent).toBe("hoa");
		await act(async () => {
			(dong[0] as HTMLElement).click();
			await nhip();
		});
		expect(canh.den).toEqual(["/ws/tai-lieu/quy-dinh-hoa-hong"]);
	});

	test("cmdk: vai okr chi co nhom Tai lieu, khong goi tim doi tac, khong bao loi, Enter mo trang", async () => {
		canh.doiTac = "cam";
		await mo(false);
		await go("dao tao");
		expect(canh.goi.quick).toBe(0);
		expect(tieuDeNhom()).toEqual(["Tài liệu"]);
		expect(document.body.querySelector("[role=alert]")).toBeNull();
		const o = document.body.querySelector<HTMLInputElement>("input");
		await act(async () => {
			o?.dispatchEvent(
				new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
			);
			await nhip();
		});
		expect(canh.den).toEqual(["/ws/tai-lieu/quy-dinh-hoa-hong"]);
	});

	test("cmdk: tim doi tac bi tu choi thi nhom doi tac an lang", async () => {
		canh.doiTac = "cam";
		await mo(true);
		await go("hoa hong");
		expect(tieuDeNhom()).toEqual(["Tài liệu"]);
		expect(document.body.querySelector("[role=alert]")).toBeNull();
	});

	test("cmdk: tim tai lieu loi thi noi loi, khong noi khong co trang nao khop", async () => {
		canh.taiLieu = "loi";
		await mo(false);
		await go("hoa hong");
		const chu = document.body.textContent ?? "";
		if (!chu.includes("Không tìm được lúc này. Thử lại.")) {
			throw new Error("cmdk: loi tim hien thanh khong-khop");
		}
		expect(chu.includes("Không có gì khớp.")).toBe(false);
	});
});
