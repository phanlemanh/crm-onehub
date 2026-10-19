import { afterEach, describe, expect, mock, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	act,
	type ComponentProps,
	createElement as h,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";

type ChonDotBien = { onSuccess?: () => void; onError?: () => void };
const TRA_VE = new Map([["taiLieuNguon.trangThai", { bat: true }]]);

function nhanh(duong: readonly string[]): () => void {
	const ten = duong.join(".");
	return new Proxy(() => {}, {
		get(_dich, khoa) {
			if (khoa === "queryOptions")
				return () => ({
					queryKey: [ten],
					queryFn: async () => TRA_VE.get(ten) ?? null,
				});
			if (khoa === "mutationOptions")
				return (chon: ChonDotBien = {}) => ({
					...chon,
					mutationFn: async () => ({}),
				});
			if (khoa === "queryKey" || khoa === "pathKey") return () => [ten];
			return nhanh([...duong, String(khoa)]);
		},
	});
}

mock.module("@/lib/trpc/client", () => ({ useTRPC: () => nhanh([]) }));
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({ taiLieu: async () => {} }),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({
		push: () => {},
		prefetch: () => {},
		refresh: () => {},
	}),
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

const { NutTaiNguon } = await import(
	"@/app/(app)/[slug]/tai-lieu/hop-tai-nguon"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { taiLieuMessages } = await import("@/lib/messages/tai-lieu");
const { KIEU_NGUON, NGUON } = await import("@crm/validation/tai-lieu-nguon");

const CHAP_NHAN = KIEU_NGUON.map((k) => NGUON.duoi[k]).join(",");
const DUOI_CHEP_TAY = /["'`]\.(docx|pdf)\b/;

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

const nhip = () =>
	act(async () => {
		await new Promise((r) => setTimeout(r, 10));
	});

async function moHop(locale: "vi" | "en"): Promise<void> {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	const qc = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	await act(async () => {
		root?.render(
			<QueryClientProvider client={qc}>
				<LocaleProvider locale={locale}>
					<NutTaiNguon
						luaChon={{
							toiId: "u-toi",
							chuTrang: [{ id: "u-toi", ten: "Phan Lê Mạnh" }],
							donVi: [],
							trangDangDung: [],
						}}
					/>
				</LocaleProvider>
			</QueryClientProvider>,
		);
	});
	const nut = khung.querySelector<HTMLButtonElement>("[data-tai-nguon]");
	if (!nut) throw new Error("thieu nut tai nguon");
	for (let i = 0; i < 20 && nut.disabled; i += 1) await nhip();
	await act(async () => {
		nut.click();
	});
	await nhip();
}

function oTep(): HTMLInputElement {
	const o = document.body.querySelector<HTMLInputElement>("input[type='file']");
	if (!o) throw new Error("khong thay o chon tep");
	return o;
}

async function chonTep(ten: string): Promise<void> {
	const o = oTep();
	const f = new File([new Uint8Array(8)], ten, { type: "text/plain" });
	Object.defineProperty(o, "files", { value: [f], configurable: true });
	await act(async () => {
		o.dispatchEvent(new Event("change", { bubbles: true }));
	});
	for (let i = 0; i < 3; i += 1) await nhip();
}

describe("ssct-loai-tep", () => {
	test("ssct-loai-tep: ô chọn tệp nhận đúng chuỗi sinh từ KIEU_NGUON", async () => {
		await moHop("vi");
		expect(oTep().getAttribute("accept")).toBe(CHAP_NHAN);
	});

	test("ssct-loai-tep: tai-lieu-man.ts không còn đuôi tệp chép tay", () => {
		expect(DUOI_CHEP_TAY.test('chapNhan: ".docx,.pdf"')).toBe(true);
		const nguon = readFileSync(
			join(import.meta.dir, "..", "lib", "tai-lieu-man.ts"),
			"utf8",
		);
		expect(DUOI_CHEP_TAY.test(nguon)).toBe(false);
	});

	for (const locale of ["vi", "en"] as const) {
		test(`ssct-loai-tep: ${locale} chọn tệp .txt → câu báo nêu mọi loại nhận được`, async () => {
			await moHop(locale);
			await chonTep("ghi-chu.txt");
			const cau = taiLieuMessages(locale).nguon.hop.saiLoai;
			expect(document.body.textContent ?? "").toContain(cau);
			for (const k of KIEU_NGUON)
				expect(cau.toLowerCase()).toContain(NGUON.duoi[k].slice(1));
		});
	}
});
