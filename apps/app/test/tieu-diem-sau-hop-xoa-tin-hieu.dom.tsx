import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import type { ReactNode } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

type NgonNgu = "vi" | "en";
type Kho = 375 | 1280;
type LoiXoa = "409" | "500" | "mang" | null;
type Hang = {
	id: string;
	so: number;
	ma: string;
	tieuDe: string;
	muonLam: string;
	man: string;
	guiLuc: string;
	daKeoVe: boolean;
};

const THONG_DIEP_MAY_CHU = "THONG-DIEP-MAY-CHU";
const KHO: Kho[] = [375, 1280];
let daXoa: string[] = [];
let loiXoa: LoiXoa = null;
let treXoa = 0;
let hangCuaToi: Hang[] = [];

const loiTrpc = (code: string, httpStatus: number) =>
	new TRPCClientError(THONG_DIEP_MAY_CHU, {
		result: {
			error: {
				code: -32600,
				message: THONG_DIEP_MAY_CHU,
				data: { code, httpStatus },
			},
		},
	});

function truyVan<T>(ten: string, ra: () => Promise<T> | T) {
	return {
		queryKey: () => [ten],
		pathKey: () => [ten],
		queryOptions: () => ({ queryKey: [ten], queryFn: async () => ra() }),
	};
}

function ghi<TVao, TRa>(ten: string, chay: (v: TVao) => Promise<TRa>) {
	return {
		mutationOptions: (
			o: {
				onSuccess?: (d: TRa) => void;
				onError?: (e: Error) => void;
				onSettled?: () => void;
			} = {},
		) => ({
			...o,
			mutationKey: [ten],
			mutationFn: async (v: TVao) => chay(v),
		}),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		workspace: {
			get: truyVan("workspace.get", () => ({
				name: "OneHub",
				viewerRole: "member",
			})),
		},
		tinHieu: {
			gui: ghi("tinHieu.gui", async () => ({ id: "t-12", ma: "crm-12" })),
			xoa: ghi("tinHieu.xoa", async (v: { id: string }) => {
				if (treXoa > 0) await new Promise((r) => setTimeout(r, treXoa));
				if (loiXoa === "mang") throw new TypeError("Failed to fetch");
				if (loiXoa === "500") throw loiTrpc("INTERNAL_SERVER_ERROR", 500);
				if (loiXoa === "409") {
					hangCuaToi = hangCuaToi.map((h) =>
						h.id === v.id ? { ...h, daKeoVe: true } : h,
					);
					throw loiTrpc("CONFLICT", 409);
				}
				daXoa.push(v.id);
				hangCuaToi = hangCuaToi.filter((h) => h.id !== v.id);
				return { ok: true };
			}),
			tatCa: truyVan("tinHieu.tatCa", () => ({ rows: [] })),
			daLuuTru: truyVan("tinHieu.daLuuTru", () => ({ rows: [] })),
			cuaToi: truyVan("tinHieu.cuaToi", () => ({ rows: hangCuaToi })),
		},
	}),
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, refresh: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/tin-hieu",
	useSearchParams: () => new URLSearchParams(),
}));

mock.module("next/link", () => ({
	default: ({
		href,
		children,
		...rest
	}: {
		href: string;
		children: ReactNode;
	}) => (
		<a href={href} {...rest}>
			{children}
		</a>
	),
}));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { DanhSachTinHieuTrang } = await import(
	"@/app/(app)/[slug]/tin-hieu/danh-sach-tin-hieu-trang"
);
const { DanhSachTinHieu } = await import(
	"@/components/tin-hieu/danh-sach-tin-hieu"
);
const { tinHieuMessages } = await import("@/lib/messages/tin-hieu");
const { dien } = await import("@/components/crm/record-sheet/plan-copy");

const goc = HTMLElement.prototype.getClientRects;
let root: Root | null = null;

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
	HTMLElement.prototype.getClientRects = goc;
	daXoa = [];
	loiXoa = null;
	treXoa = 0;
	hangCuaToi = [];
});

const KHOI = {
	375: ".md\\:hidden",
	1280: ".hidden.md\\:block",
} satisfies Record<Kho, string>;

function datKho(w: Kho) {
	HTMLElement.prototype.getClientRects = function (this: HTMLElement) {
		const co = this.closest(KHOI[w]) !== null;
		return (co ? [new DOMRect(0, 0, 36, 36)] : []) as unknown as DOMRectList;
	};
}

function trongBanHien(e: Element | null, w: Kho) {
	return e?.closest(KHOI[w]) != null;
}

async function cho(ms = 30) {
	await act(async () => {
		await new Promise((r) => setTimeout(r, ms));
	});
}

function boc(nut: ReactNode, locale: NgonNgu) {
	return (
		<NuqsTestingAdapter hasMemory>
			<QueryClientProvider
				client={
					new QueryClient({
						defaultOptions: {
							queries: { retry: false },
							mutations: { retry: false },
						},
					})
				}
			>
				<LocaleProvider locale={locale}>{nut}</LocaleProvider>
			</QueryClientProvider>
		</NuqsTestingAdapter>
	);
}

async function ve(nut: ReactNode, locale: NgonNgu = "vi") {
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	await act(async () => {
		root?.render(boc(nut, locale));
	});
	await cho();
	return o;
}

async function bam(o: Element | null | undefined) {
	if (!o) throw new Error("khong tim thay phan tu de bam");
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

async function phim(key: string) {
	await act(async () => {
		(document.activeElement ?? document.body).dispatchEvent(
			new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
		);
	});
	await cho();
}

function hang(so: number, daKeoVe = false): Hang {
	return {
		id: `t-${so}`,
		so,
		ma: `crm-${so}`,
		tieuDe: `gặp ${so}`,
		muonLam: `muốn ${so}`,
		man: "/okr",
		guiLuc: "2026-10-14T02:05:00.000Z",
		daKeoVe,
	};
}

function nutHien(ma: string, w: Kho) {
	return document.querySelector<HTMLElement>(
		`${KHOI[w]} [data-thao-tac-tin-hieu='${ma}']`,
	);
}

function dangTieuDiem() {
	return document.activeElement as HTMLElement | null;
}

async function moHopXoa(ma: string, w: Kho) {
	await bam(nutHien(ma, w));
	await bam(document.querySelector(`[data-xoa-tin-hieu='${ma}']`));
	if (!document.querySelector("[role=alertdialog]"))
		throw new Error(`hop hoi xoa khong mo cho ${ma}`);
}

async function xacNhan(locale: NgonNgu) {
	const m = tinHieuMessages(locale);
	await bam(
		[
			...document.querySelectorAll<HTMLButtonElement>(
				"[role=alertdialog] button",
			),
		].find((b) => b.textContent === m.trang.xoaNut),
	);
}

describe("tdx-giu-lai", () => {
	const VI_TRI = [
		{ ten: "dau", ds: [1, 2, 3], so: 1 },
		{ ten: "giua", ds: [1, 2, 3], so: 2 },
		{ ten: "cuoi", ds: [1, 2, 3], so: 3 },
		{ ten: "duy-nhat", ds: [1], so: 1 },
	];
	const CACH = ["giu-lai", "esc"] as const;
	let dem = 0;
	for (const cach of CACH)
		for (const vt of VI_TRI)
			for (const w of KHO)
				test(`tdx-giu-lai: ${cach}/${vt.ten}/${w}`, async () => {
					const m = tinHieuMessages("vi");
					datKho(w);
					hangCuaToi = vt.ds.map((s) => hang(s));
					const ma = `crm-${vt.so}`;
					await ve(<DanhSachTinHieuTrang banVeDocDuoc trangThai={{}} />);
					await moHopXoa(ma, w);
					if (cach === "giu-lai")
						await bam(
							[
								...document.querySelectorAll<HTMLButtonElement>(
									"[role=alertdialog] button",
								),
							].find((b) => b.textContent === m.trang.thoi),
						);
					else await phim("Escape");
					await cho();
					const dang = dangTieuDiem();
					expect(
						dang !== document.body &&
							dang?.getAttribute("data-thao-tac-tin-hieu") === ma,
						`tieu diem roi ve dau trang sau ${cach === "giu-lai" ? "giu lai" : "esc"}`,
					).toBe(true);
					dem += 1;
					expect(trongBanHien(dang, w), "tieu diem toi ban an").toBe(true);
					dem += 1;
					expect({
						hop: document.querySelector("[role=alertdialog]") === null,
						xoa: daXoa.length,
						dong: document.querySelector(`[data-tin-hieu='${ma}']`) !== null,
					}).toEqual({ hop: true, xoa: 0, dong: true });
					dem += 1;
					if (cach === "esc" && vt.ten === "duy-nhat" && w === 1280)
						console.log(`tdx-giu-lai: ${dem} khang dinh (16 x 3)`);
				});
});

describe("tdx-bien", () => {
	test("tdx-bien: ban-dau — hop mo san tu hoiXoaBanDau, Esc ve nut cua dong", async () => {
		datKho(1280);
		const dong = [1, 2, 3].map((s) => {
			const h = hang(s);
			return {
				id: h.id,
				ma: h.ma,
				tieuDe: h.tieuDe,
				muonLam: h.muonLam,
				man: h.man,
				guiLuc: h.guiLuc,
				coTheXoa: true,
				trangThai: { nhan: "Đã nhận", cau: "câu", nghia: "nhap" as const },
			};
		});
		await ve(
			<DanhSachTinHieu
				banVeDocDuoc
				dangXoa={null}
				dong={dong}
				hoiXoaBanDau="t-2"
				nutGui={null}
				onXoa={() => {}}
			/>,
		);
		expect(document.querySelector("[role=alertdialog]") !== null).toBe(true);
		await act(async () => {
			document.querySelector<HTMLElement>("[role=alertdialog] button")?.focus();
		});
		await phim("Escape");
		await cho();
		expect(dangTieuDiem()?.getAttribute("data-thao-tac-tin-hieu")).toBe(
			"crm-2",
		);
	});

	test("tdx-bien: dong-mat — dong mo hop bien mat truoc khi dong, khong nem loi", async () => {
		datKho(1280);
		const dong = [1, 2].map((s) => {
			const h = hang(s);
			return {
				id: h.id,
				ma: h.ma,
				tieuDe: h.tieuDe,
				muonLam: h.muonLam,
				man: h.man,
				guiLuc: h.guiLuc,
				coTheXoa: true,
				trangThai: { nhan: "Đã nhận", cau: "câu", nghia: "nhap" as const },
			};
		});
		const props = {
			banVeDocDuoc: true,
			dangXoa: null,
			nutGui: null,
			onXoa: () => {},
		};
		await ve(<DanhSachTinHieu {...props} dong={dong} />);
		await moHopXoa("crm-2", 1280);
		await act(async () => {
			root?.render(
				boc(<DanhSachTinHieu {...props} dong={dong.slice(0, 1)} />, "vi"),
			);
		});
		await cho();
		await phim("Escape");
		await cho();
		expect(document.querySelector("[role=alertdialog]") === null).toBe(true);
		expect(document.querySelector("[data-tin-hieu='crm-1']") !== null).toBe(
			true,
		);
	});
});

describe("tdx-hong", () => {
	let dem = 0;
	for (const locale of ["vi", "en"] as const)
		for (const w of KHO)
			test(`tdx-hong: 409/${locale}/${w} — dong con, noi vi sao, tieu diem o nut, Xoa khoa`, async () => {
				const m = tinHieuMessages(locale);
				datKho(w);
				hangCuaToi = [1, 2, 3].map((s) => hang(s));
				loiXoa = "409";
				await ve(<DanhSachTinHieuTrang banVeDocDuoc trangThai={{}} />, locale);
				await moHopXoa("crm-2", w);
				await xacNhan(locale);
				await cho(80);
				expect(
					document.querySelector("[data-tin-hieu='crm-2']") !== null,
					"xoa hong lam mat dong",
				).toBe(true);
				dem += 1;
				const bao = [...document.querySelectorAll("[role=alert]")];
				expect(
					bao.map((e) => e.textContent?.trim()),
					"xoa hong khong noi vi sao",
				).toEqual([dien(m.trang.xoaHongDaLayVe, { ma: "crm-2" })]);
				expect(document.body.textContent).not.toContain(THONG_DIEP_MAY_CHU);
				dem += 1;
				const dang = dangTieuDiem();
				expect(
					dang?.getAttribute("data-thao-tac-tin-hieu") === "crm-2" &&
						trongBanHien(dang, w),
					"tieu diem roi ve dau trang sau xoa hong",
				).toBe(true);
				dem += 1;
				await phim("Enter");
				const muc = document.querySelector("[data-xoa-tin-hieu='crm-2']");
				const nhan = [
					...document.querySelectorAll(
						"[role=menu] [role=none], [role=menu] *",
					),
				].some((e) => e.textContent?.trim() === m.trang.khongXoaDuoc);
				expect(
					{ khoa: muc?.getAttribute("aria-disabled"), nhan },
					"dong da lay ve mat nut xoa khong noi vi sao",
				).toEqual({ khoa: "true", nhan: true });
				dem += 1;
				if (locale === "en" && w === 1280)
					console.log(`tdx-hong 409: ${dem} khang dinh (4 x 4)`);
			});

	let demMang = 0;
	for (const loai of ["mang", "500"] as const)
		for (const locale of ["vi", "en"] as const)
			for (const w of KHO)
				test(`tdx-hong: ${loai}/${locale}/${w} — dong con, tieu diem o nut, xoa lai duoc`, async () => {
					const m = tinHieuMessages(locale);
					datKho(w);
					hangCuaToi = [1, 2, 3].map((s) => hang(s));
					loiXoa = loai;
					await ve(
						<DanhSachTinHieuTrang banVeDocDuoc trangThai={{}} />,
						locale,
					);
					await moHopXoa("crm-2", w);
					await xacNhan(locale);
					await cho(80);
					expect(
						document.querySelector("[data-tin-hieu='crm-2']") !== null,
						"xoa hong lam mat dong",
					).toBe(true);
					demMang += 1;
					expect(
						[...document.querySelectorAll("[role=alert]")].map((e) =>
							e.textContent?.trim(),
						),
						"xoa hong khong noi vi sao",
					).toEqual([dien(m.trang.xoaHong, { ma: "crm-2" })]);
					expect(document.body.textContent).not.toContain(THONG_DIEP_MAY_CHU);
					demMang += 1;
					const dang = dangTieuDiem();
					expect(
						dang?.getAttribute("data-thao-tac-tin-hieu") === "crm-2" &&
							trongBanHien(dang, w),
						"tieu diem roi ve dau trang sau xoa hong",
					).toBe(true);
					demMang += 1;
					loiXoa = null;
					await phim("Enter");
					await bam(document.querySelector("[data-xoa-tin-hieu='crm-2']"));
					await xacNhan(locale);
					await cho(80);
					expect(
						{
							xoa: daXoa,
							conDong:
								document.querySelector("[data-tin-hieu='crm-2']") !== null,
						},
						"xoa hong khong xoa lai duoc",
					).toEqual({ xoa: ["t-2"], conDong: false });
					demMang += 1;
					if (loai === "500" && locale === "en" && w === 1280)
						console.log(`tdx-hong mang/may-chu: ${demMang} khang dinh (8 x 4)`);
				});
});

describe("tdx-cho", () => {
	let dem = 0;
	for (const w of KHO) {
		test(`tdx-cho: cho-dung-yen/${w}`, async () => {
			datKho(w);
			hangCuaToi = [1, 2, 3].map((s) => hang(s));
			treXoa = 150;
			await ve(<DanhSachTinHieuTrang banVeDocDuoc trangThai={{}} />);
			await moHopXoa("crm-2", w);
			await xacNhan("vi");
			const dang = dangTieuDiem();
			expect(
				dang !== document.body &&
					dang?.getAttribute("data-thao-tac-tin-hieu") === "crm-2",
				"tieu diem roi ve dau trang luc cho xoa",
			).toBe(true);
			dem += 1;
			expect(trongBanHien(dang, w), "tieu diem toi ban an").toBe(true);
			dem += 1;
			await cho(250);
		});

		test(`tdx-cho: tu-doi-roi-hong/${w}`, async () => {
			const m = tinHieuMessages("vi");
			datKho(w);
			hangCuaToi = [1, 2, 3].map((s) => hang(s));
			treXoa = 150;
			loiXoa = "mang";
			await ve(<DanhSachTinHieuTrang banVeDocDuoc trangThai={{}} />);
			await moHopXoa("crm-2", w);
			await xacNhan("vi");
			await act(async () => {
				nutHien("crm-1", w)?.focus();
			});
			await cho(250);
			expect(
				dangTieuDiem()?.getAttribute("data-thao-tac-tin-hieu"),
				"giat tieu diem khoi cho nguoi dung da doi",
			).toBe("crm-1");
			dem += 1;
			expect(document.querySelector("[role=alert]")?.textContent?.trim()).toBe(
				dien(m.trang.xoaHong, { ma: "crm-2" }),
			);
			dem += 1;
		});

		test(`tdx-cho: tu-doi-roi-xong/${w}`, async () => {
			datKho(w);
			hangCuaToi = [1, 2, 3].map((s) => hang(s));
			treXoa = 150;
			await ve(<DanhSachTinHieuTrang banVeDocDuoc trangThai={{}} />);
			await moHopXoa("crm-2", w);
			await xacNhan("vi");
			await act(async () => {
				nutHien("crm-1", w)?.focus();
			});
			await cho(250);
			const dang = dangTieuDiem();
			expect(
				dang?.getAttribute("data-thao-tac-tin-hieu") === "crm-3" &&
					trongBanHien(dang, w),
				"xoa xong khong toi dong ke",
			).toBe(true);
			dem += 1;
			if (w === 1280)
				console.log(`tdx-cho: ${dem} khang dinh (2 x (2 + 2 + 1))`);
		});
	}
});
