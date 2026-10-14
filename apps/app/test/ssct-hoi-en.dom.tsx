import { afterEach, describe, expect, mock, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import type { Locale } from "@crm/ui/lib/locale";
import {
	cauLoiHoi,
	dungTuChoi,
	TAI_LIEU_HOI,
} from "@crm/validation/tai-lieu-hoi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	act,
	type ComponentProps,
	createElement as h,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";

type TinhHuong = "tu-choi" | "loi" | "qua-han";
type DongMau = { tinhHuong: TinhHuong; ketQua: unknown };

const MAU: DongMau[] = JSON.parse(
	readFileSync(
		join(
			import.meta.dir,
			"..",
			"..",
			"..",
			"_acceptance",
			"sua-sau-chay-that",
			"rang",
			"ket-qua-hoi.json",
		),
		"utf8",
	),
);

const canh = { ketQua: null as unknown };

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		hoiKho: {
			ketQua: {
				queryOptions: (vao: { hoiId: string }) => ({
					queryKey: ["hoiKho.ketQua", vao],
					queryFn: async () => canh.ketQua,
				}),
			},
			baoSai: {
				mutationOptions: (chon: object = {}) => ({
					...chon,
					mutationFn: async () => ({ soViec: 0 }),
				}),
			},
		},
	}),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, prefetch: () => {}, refresh: () => {} }),
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

const { LuotHoiKho } = await import("@/app/(app)/[slug]/tai-lieu/hoi-tra-loi");
const { taiLieuMessages } = await import("@/lib/messages/tai-lieu");

const CO_DAU = /[à-ỹđ]/i;

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

async function ve(locale: Locale, ketQua: unknown): Promise<HTMLElement> {
	canh.ketQua = ketQua;
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	await act(async () => {
		root?.render(
			<QueryClientProvider client={qc}>
				<LocaleProvider locale={locale}>
					<LuotHoiKho
						hoiLai={() => {}}
						luot={{ hoiId: "h1", cauHoi: "Nghỉ phép năm tính thế nào?" }}
					/>
				</LocaleProvider>
			</QueryClientProvider>,
		);
		await new Promise((r) => setTimeout(r, 30));
	});
	for (let i = 0; i < 20 && !khung.querySelector("[data-cau-tro-ly]"); i += 1) {
		await act(async () => {
			await new Promise((r) => setTimeout(r, 10));
		});
	}
	return khung;
}

function cauMong(locale: Locale, tinh: TinhHuong): string {
	const m = taiLieuMessages(locale).hoi;
	if (tinh === "tu-choi") return m.tuChoi;
	return m.loi[tinh === "loi" ? "loi-model" : "qua-han"];
}

function cauHien(goc: HTMLElement): string {
	const o = goc.querySelector("[data-ket-qua-hoi] [data-cau-tro-ly]");
	return o?.textContent ?? "";
}

describe("ssct-hoi-en", () => {
	test("ssct-hoi-en: ma trận ba tình huống × hai ngôn ngữ viết trước", () => {
		expect(MAU.map((d) => d.tinhHuong)).toEqual(["tu-choi", "loi", "qua-han"]);
	});

	for (const locale of ["en", "vi"] as const) {
		for (const dong of MAU) {
			test(`ssct-hoi-en: ${locale} × ${dong.tinhHuong}`, async () => {
				const goc = await ve(locale, dong.ketQua);
				const hien = cauHien(goc);
				expect(hien).toBe(cauMong(locale, dong.tinhHuong));
				if (locale === "en") expect(CO_DAU.test(hien)).toBe(false);
			});
		}
	}

	test("ssct-hoi-en: bản vi trùng từng chữ câu cũ", () => {
		const m = taiLieuMessages("vi").hoi;
		expect([
			m.tuChoi,
			m.loi["loi-model"],
			m.loi["qua-han"],
			m.loi["het-tran"],
		]).toEqual([
			TAI_LIEU_HOI.tuChoi,
			cauLoiHoi("loi-model"),
			cauLoiHoi("qua-han"),
			cauLoiHoi("het-tran"),
		]);
	});

	test("ssct-hoi-en: đối chứng — câu gửi qua Zalo vẫn tiếng Việt", () => {
		expect(dungTuChoi([])).toBe(TAI_LIEU_HOI.tuChoi);
		expect(CO_DAU.test(dungTuChoi([]))).toBe(true);
		expect(CO_DAU.test(cauLoiHoi("qua-han"))).toBe(true);
	});
});
