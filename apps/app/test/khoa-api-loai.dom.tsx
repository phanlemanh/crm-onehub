import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import type { ReactNode } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

type Vai = "owner" | "admin" | "member" | "okr";
type Loai = "toan-quyen" | "keo-tin-hieu";
type TaoVao = { name: string; expiresInDays: number | null; loai?: Loai };

let vai: Vai = "owner";
let daTao: TaoVao[] = [];
let hang: {
	id: string;
	name: string;
	start: string;
	enabled: boolean;
	createdAt: string;
	lastRequest: string | null;
	expiresAt: string | null;
	loai: Loai;
}[] = [];

function truyVan<T>(ten: string, ra: () => T) {
	return {
		queryKey: () => [ten],
		pathKey: () => [ten],
		queryOptions: () => ({
			queryKey: [ten],
			queryFn: async () => ra(),
		}),
	};
}

function ghi<TVao, TRa>(ten: string, chay: (v: TVao) => TRa) {
	return {
		mutationOptions: (o: { onSuccess?: (d: TRa) => void } = {}) => ({
			mutationKey: [ten],
			mutationFn: async (v: TVao) => chay(v),
			onSuccess: o.onSuccess,
		}),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		apiKeys: {
			list: truyVan("apiKeys.list", () => ({
				rows: hang,
				total: hang.length,
				facetCounts: {},
				taoDuocKeoTinHieu: vai === "owner" || vai === "admin",
			})),
			create: ghi("apiKeys.create", (v: TaoVao) => {
				daTao.push(v);
				return {
					id: "k-moi",
					name: v.name,
					start: "crm_ab",
					enabled: true,
					createdAt: "2026-10-14T00:00:00.000Z",
					lastRequest: null,
					expiresAt: null,
					loai: v.loai ?? "toan-quyen",
					key: "crm_khoaMoiTaoThu0123456789abcdefgh",
				};
			}),
			revoke: ghi("apiKeys.revoke", (v: { id: string }) => v),
		},
	}),
}));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({ apiKeys: async () => {} }),
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, refresh: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/settings/api-keys",
	useSearchParams: () => new URLSearchParams(),
}));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { CreateApiKeySheet } = await import(
	"@/app/(app)/[slug]/settings/api-keys/create-api-key-sheet"
);
const { ApiKeysTable } = await import(
	"@/app/(app)/[slug]/settings/api-keys/api-keys-table"
);
const { khoaApiMessages } = await import("@/lib/messages/settings-khoa-api");

let root: Root | null = null;

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
	daTao = [];
	hang = [];
});

function datKho(rong: number) {
	Object.defineProperty(window, "innerWidth", {
		value: rong,
		configurable: true,
	});
	window.matchMedia = ((q: string) => {
		const min = /min-width:\s*(\d+)px/.exec(q);
		const max = /max-width:\s*(\d+)px/.exec(q);
		const khop = min
			? rong >= Number(min[1])
			: max
				? rong <= Number(max[1])
				: false;
		return {
			matches: khop,
			media: q,
			onchange: null,
			addEventListener: () => {},
			removeEventListener: () => {},
			addListener: () => {},
			removeListener: () => {},
			dispatchEvent: () => false,
		};
	}) as typeof window.matchMedia;
}

async function ve(nut: ReactNode, locale: "vi" | "en", moTo: boolean) {
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root?.render(
			<NuqsTestingAdapter hasMemory searchParams={moTo ? "?new=true" : ""}>
				<QueryClientProvider client={client}>
					<LocaleProvider locale={locale}>{nut}</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	await cho();
}

async function cho() {
	await act(async () => {
		await new Promise((r) => setTimeout(r, 30));
	});
}

async function bam(o: Element) {
	await act(async () => {
		for (const loai of [
			"pointerdown",
			"mousedown",
			"pointerup",
			"mouseup",
			"click",
		])
			o.dispatchEvent(
				new MouseEvent(loai, { bubbles: true, cancelable: true, button: 0 }),
			);
	});
	await cho();
}

async function go(o: HTMLInputElement, chu: string) {
	await act(async () => {
		Object.getOwnPropertyDescriptor(
			HTMLInputElement.prototype,
			"value",
		)?.set?.call(o, chu);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

async function gui(nut: HTMLButtonElement) {
	expect(nut.disabled, "nut tao bi khoa").toBe(false);
	await act(async () => {
		document
			.querySelector<HTMLFormElement>(`form#${nut.getAttribute("form")}`)
			?.requestSubmit();
	});
	await cho();
}

const nhom = () => document.querySelector("[data-slot=loai-khoa]");
const nutRadio = () => [
	...document.querySelectorAll<HTMLElement>("[role=radio]"),
];

describe("tvk-man", () => {
	for (const locale of ["vi", "en"] as const) {
		const t = khoaApiMessages(locale);
		for (const v of ["owner", "admin", "member", "okr"] as const) {
			for (const [kho, rong] of [
				["desktop", 1280],
				["mobile", 375],
			] as const) {
				test(`tvk-man: ${locale} ${v} ${kho} — to tao khoa theo vai`, async () => {
					vai = v;
					datKho(rong);
					await ve(<CreateApiKeySheet />, locale, true);
					const quanTri = v === "owner" || v === "admin";
					if (!quanTri) {
						expect(nhom(), "vai khong phai quan tri thay loai khoa").toBeNull();
						expect(
							nutRadio().length,
							"vai khong phai quan tri thay loai khoa",
						).toBe(0);
						return;
					}
					expect(nhom()?.textContent).toContain(t.tao.loai);
					const radio = nutRadio();
					expect(radio.length).toBe(2);
					expect(radio[0]?.getAttribute("aria-checked")).toBe("true");
					expect(radio[0]?.getAttribute("value")).toBe("toan-quyen");
					for (const mo of [t.tao.loaiToanQuyenMoTa, t.tao.loaiKeoTinHieuMoTa])
						expect(nhom()?.textContent).toContain(mo);
				});
			}
		}

		test(`tvk-man: ${locale} owner chon chi keo thi loai di toi may chu, hop dan dat bi mat`, async () => {
			vai = "owner";
			datKho(1280);
			await ve(<CreateApiKeySheet />, locale, true);
			const ten = document.querySelector<HTMLInputElement>(
				"form input[required]",
			);
			if (!ten) throw new Error("khong thay o ten");
			await go(ten, "Lich keo");
			const keo = nutRadio().find(
				(r) => r.getAttribute("value") === "keo-tin-hieu",
			);
			if (!keo) throw new Error("khong thay muc chi keo");
			await bam(keo);
			const nutTao = [
				...document.querySelectorAll<HTMLButtonElement>("button[type=submit]"),
			].find((b) => b.textContent === t.tao.taoKhoa);
			if (!nutTao) throw new Error("khong thay nut tao");
			await gui(nutTao);
			expect(daTao.at(-1)?.loai, "loai khoa khong di toi may chu").toBe(
				"keo-tin-hieu",
			);
			expect(document.body.textContent).toContain(t.daTao.keoTinHieu);
		});

		test(`tvk-man: ${locale} owner khong cham loai thi tao khoa toan quyen, hop khong dan`, async () => {
			vai = "owner";
			datKho(1280);
			await ve(<CreateApiKeySheet />, locale, true);
			const ten = document.querySelector<HTMLInputElement>(
				"form input[required]",
			);
			if (!ten) throw new Error("khong thay o ten");
			await go(ten, "May CI");
			const nutTao = [
				...document.querySelectorAll<HTMLButtonElement>("button[type=submit]"),
			].find((b) => b.textContent === t.tao.taoKhoa);
			if (!nutTao) throw new Error("khong thay nut tao");
			await gui(nutTao);
			expect(daTao.length).toBe(1);
			expect(daTao.at(-1)?.loai ?? "toan-quyen").toBe("toan-quyen");
			expect(document.body.textContent).not.toContain(t.daTao.keoTinHieu);
		});

		test(`tvk-man: ${locale} danh sach ghi nhan chi keo dung dong`, async () => {
			vai = "owner";
			datKho(1280);
			hang = [
				{
					id: "k1",
					name: "Lich keo",
					start: "crm_aa",
					enabled: true,
					createdAt: "2026-10-14T00:00:00.000Z",
					lastRequest: null,
					expiresAt: null,
					loai: "keo-tin-hieu",
				},
				{
					id: "k2",
					name: "May CI",
					start: "crm_bb",
					enabled: true,
					createdAt: "2026-10-13T00:00:00.000Z",
					lastRequest: null,
					expiresAt: null,
					loai: "toan-quyen",
				},
			];
			await ve(<ApiKeysTable />, locale, false);
			const nhan = [...document.querySelectorAll("[data-slot=nhan-loai-khoa]")];
			expect(nhan.length, "danh sach khong noi khoa chi keo").toBe(1);
			expect(nhan[0]?.textContent).toBe(t.bang.loaiKeoTinHieu);
			expect(nhan[0]?.closest("tr")?.textContent).toContain("Lich keo");
		});
	}
});
