import {
	afterEach,
	describe,
	expect,
	mock,
	setSystemTime,
	test,
} from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import type { ReactNode } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

type NgonNgu = "vi" | "en";
type GuiVao = { muonLam: string; daXayRa: string; man: string };
type LoiGia = { status: number; message: string } | "mang" | null;
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
let duong = "/ws/okr/kr";
let daGui: GuiVao[] = [];
let daXoa: string[] = [];
let loiGui: LoiGia = null;
let loiXoa: LoiGia = null;
let hangCuaToi: Hang[] = [];
let treLamMoi = 0;

class LoiTrpc extends Error {
	data: { httpStatus: number; code: string };
	constructor(l: { status: number; message: string }) {
		super(l.message);
		this.data = {
			httpStatus: l.status,
			code:
				l.status === 429
					? "TOO_MANY_REQUESTS"
					: l.status === 409
						? "CONFLICT"
						: "INTERNAL_SERVER_ERROR",
		};
	}
}

function nem(l: LoiGia) {
	if (l === "mang") throw new TypeError("Failed to fetch");
	if (l) throw new LoiTrpc(l);
}

function truyVan<T>(ten: string, ra: () => Promise<T> | T) {
	return {
		queryKey: () => [ten],
		pathKey: () => [ten],
		queryOptions: () => ({ queryKey: [ten], queryFn: async () => ra() }),
	};
}

function ghi<TVao, TRa>(ten: string, chay: (v: TVao) => TRa) {
	return {
		mutationOptions: (o: Record<string, unknown> = {}) => ({
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
			gui: ghi("tinHieu.gui", (v: GuiVao) => {
				nem(loiGui);
				daGui.push(v);
				return { id: "t-12", ma: "crm-12" };
			}),
			xoa: ghi("tinHieu.xoa", (v: { id: string }) => {
				nem(loiXoa);
				daXoa.push(v.id);
				hangCuaToi = hangCuaToi.filter((h) => h.id !== v.id);
				return { ok: true };
			}),
			cuaToi: truyVan("tinHieu.cuaToi", async () => {
				if (treLamMoi > 0) await new Promise((r) => setTimeout(r, treLamMoi));
				return { rows: hangCuaToi };
			}),
		},
	}),
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, refresh: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => duong.split("?")[0],
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
const { buttonVariants } = await import("@crm/ui/components/button");
const { messages: uiMessages } = await import("@crm/ui/lib/messages");
const { DanhSachTinHieuTrang } = await import(
	"@/app/(app)/[slug]/tin-hieu/danh-sach-tin-hieu-trang"
);
const { NutGuiTinHieu } = await import(
	"@/components/tin-hieu/nut-gui-tin-hieu"
);
const { NutGuiDauTrang } = await import(
	"@/components/tin-hieu/hop-gui-tin-hieu"
);
const { tinHieuMessages } = await import("@/lib/messages/tin-hieu");
const { tenMan } = await import("@/lib/tin-hieu/ten-man");
const { dien } = await import("@/components/crm/record-sheet/plan-copy");
const { TIN_HIEU } = await import("@crm/validation/tin-hieu");

let root: Root | null = null;

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
	daGui = [];
	daXoa = [];
	loiGui = null;
	loiXoa = null;
	hangCuaToi = [];
	treLamMoi = 0;
	duong = "/ws/okr/kr";
	setSystemTime();
});

async function cho(ms = 30) {
	await act(async () => {
		await new Promise((r) => setTimeout(r, ms));
	});
}

async function ve(nut: ReactNode, locale: NgonNgu = "vi") {
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	await act(async () => {
		root?.render(
			<NuqsTestingAdapter hasMemory>
				<QueryClientProvider client={client}>
					<LocaleProvider locale={locale}>{nut}</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
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

async function go(o: HTMLTextAreaElement | null, chu: string) {
	if (!o) throw new Error("khong co o nhap");
	await act(async () => {
		o.focus();
		o.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true }));
		const set = Object.getOwnPropertyDescriptor(
			HTMLTextAreaElement.prototype,
			"value",
		)?.set;
		set?.call(o, chu);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

function hang(id: string, so: number, daKeoVe = false, man = "/okr"): Hang {
	return {
		id,
		so,
		ma: `crm-${so}`,
		tieuDe: `gặp ${so}`,
		muonLam: `muốn ${so}`,
		man,
		guiLuc: "2026-10-14T02:05:00.000Z",
		daKeoVe,
	};
}

const hop = () => document.querySelector<HTMLElement>("[data-hop-tin-hieu]");
const oMuonLam = () =>
	document.querySelector<HTMLTextAreaElement>("textarea[name=muon-lam]");
const oDaXayRa = () =>
	document.querySelector<HTMLTextAreaElement>("textarea[name=da-xay-ra]");
const nutTrongHop = (chu: string) =>
	[
		...document.querySelectorAll<HTMLButtonElement>(
			"[data-hop-tin-hieu] button",
		),
	].find((b) => b.textContent?.trim() === chu);
const coHoiLai = () => document.querySelector("[role=alertdialog]") !== null;

async function moHop(locale: NgonNgu = "vi") {
	await ve(<NutGuiTinHieu nut={<NutGuiDauTrang />} />, locale);
	await bam(document.querySelector("[data-slot=nut-gui-tin-hieu]"));
}

async function guiHaiO(m: ReturnType<typeof tinHieuMessages>) {
	await go(oMuonLam(), "cập nhật KR");
	await go(oDaXayRa(), "không thấy số tuần trước");
	await bam(nutTrongHop(m.hop.gui));
}

function gioMong(iso: string, locale: NgonNgu) {
	return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
		timeZone: "Asia/Ho_Chi_Minh",
		day: "2-digit",
		month: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(iso));
}

describe("sgt-bang", () => {
	for (const locale of ["vi", "en"] as const) {
		test(`sgt-bang: ${locale} — bon cot, cot Gui hai phan`, async () => {
			const m = tinHieuMessages(locale);
			hangCuaToi = [
				hang("t-1", 1),
				hang("t-2", 2, true, "/tai-lieu/abc"),
				hang("t-3", 3, true, "/settings/members"),
			];
			const o = await ve(
				<DanhSachTinHieuTrang banVeDocDuoc trangThai={{}} />,
				locale,
			);
			const tieuDe = [...o.querySelectorAll("table thead th")].map(
				(th) => th.textContent?.trim() || th.getAttribute("aria-label"),
			);
			expect(tieuDe, "bang con cot man rieng, cot ke bi bop").toEqual([
				m.trang.cot.dieuDaKe,
				m.trang.cot.gui,
				m.trang.cot.trangThai,
				m.trang.cot.thaoTac,
			]);
			const lop = [...o.querySelectorAll("table thead th")].map(
				(th) => th.className,
			);
			expect(lop[0]).not.toMatch(/\bw-/);
			expect(lop[1]).toContain("w-36");
			expect(lop[2]).toContain("w-[30%]");
			for (const h of hangCuaToi) {
				const dong = o.querySelector(`tr[data-tin-hieu='${h.ma}']`);
				expect(dong?.querySelector("[data-ten-man]")?.textContent).toBe(
					tenMan(h.man, locale),
				);
				expect(dong?.querySelector("[data-gio-gui]")?.textContent).toBe(
					gioMong(h.guiLuc, locale),
				);
			}
		});
	}
});

describe("sgt-loi", () => {
	const CA = [
		{ ten: "429", loi: { status: 429, message: THONG_DIEP_MAY_CHU } },
		{ ten: "500", loi: { status: 500, message: THONG_DIEP_MAY_CHU } },
		{ ten: "mang", loi: "mang" as const },
	];
	let soKhangDinh = 0;
	for (const locale of ["vi", "en"] as const)
		for (const ca of CA) {
			test(`sgt-loi: ${ca.ten}-${locale} — vung loi cua ca hop, giu chu`, async () => {
				const m = tinHieuMessages(locale);
				await moHop(locale);
				loiGui = ca.loi;
				await guiHaiO(m);
				const h = hop();
				const vung = h?.querySelectorAll("[role=alert]") ?? [];
				expect(vung.length, "loi gui gan vao mot o").toBe(1);
				const v = vung[0] as HTMLElement;
				const chan = h?.querySelector("[data-slot=dialog-footer]");
				const o2 = oDaXayRa();
				expect(
					Boolean(
						o2 &&
							o2.compareDocumentPosition(v) & Node.DOCUMENT_POSITION_FOLLOWING,
					) &&
						Boolean(
							chan &&
								v.compareDocumentPosition(chan) &
									Node.DOCUMENT_POSITION_FOLLOWING,
						),
					"loi gui gan vao mot o",
				).toBe(true);
				expect(
					h?.querySelectorAll("[aria-invalid=true], [data-invalid]").length,
					"loi gui gan vao mot o",
				).toBe(0);
				soKhangDinh += 1;
				const mong =
					ca.ten === "429"
						? dien(m.hop.quaTran, { tran: String(TIN_HIEU.tranMoiNgay) })
						: m.hop.chuaGui;
				expect(v.textContent?.trim()).toBe(mong);
				expect(
					document.body.textContent,
					"loi qua tran hien cau may chu",
				).not.toContain(THONG_DIEP_MAY_CHU);
				soKhangDinh += 1;
				expect(oMuonLam()?.value).toBe("cập nhật KR");
				expect(oDaXayRa()?.value).toBe("không thấy số tuần trước");
				soKhangDinh += 1;
				const gui = nutTrongHop(m.hop.gui);
				if (ca.ten === "429") {
					expect(gui?.disabled).toBe(true);
					expect(gui?.getAttribute("aria-describedby") ?? "").toContain(v.id);
				} else expect(gui?.disabled).toBe(false);
				soKhangDinh += 1;
			});
		}

	test("sgt-loi-ngay: khoa qua tran theo ngay gio Viet Nam", async () => {
		const m = tinHieuMessages("vi");
		setSystemTime(new Date("2026-10-14T16:58:00.000Z"));
		await moHop("vi");
		loiGui = { status: 429, message: THONG_DIEP_MAY_CHU };
		await guiHaiO(m);
		loiGui = null;
		await phim("Escape");
		if (coHoiLai())
			await bam(
				[...document.querySelectorAll("[role=alertdialog] button")].find(
					(b) => b.textContent === uiMessages("vi").dialog.boThayDoi.bo,
				),
			);
		setSystemTime(new Date("2026-10-14T16:59:00.000Z"));
		await bam(document.querySelector("[data-slot=nut-gui-tin-hieu]"));
		await go(oMuonLam(), "a");
		await go(oDaXayRa(), "b");
		expect(
			nutTrongHop(m.hop.gui)?.disabled,
			"khoa qua tran mat khi mo lai",
		).toBe(true);
		expect(hop()?.querySelector("[role=alert]")?.textContent?.trim()).toBe(
			dien(m.hop.quaTran, { tran: String(TIN_HIEU.tranMoiNgay) }),
		);
		await phim("Escape");
		if (coHoiLai())
			await bam(
				[...document.querySelectorAll("[role=alertdialog] button")].find(
					(b) => b.textContent === uiMessages("vi").dialog.boThayDoi.bo,
				),
			);
		setSystemTime(new Date("2026-10-14T17:00:00.000Z"));
		await bam(document.querySelector("[data-slot=nut-gui-tin-hieu]"));
		await go(oMuonLam(), "a");
		await go(oDaXayRa(), "b");
		expect(
			nutTrongHop(m.hop.gui)?.disabled,
			"khoa qua tran khong mo sang ngay moi gio VN",
		).toBe(false);
		expect(hop()?.querySelector("[role=alert]")).toBeNull();
		console.log(`sgt-loi: ${soKhangDinh} + 3 khang dinh`);
	});
});

describe("sgt-gio", () => {
	for (const locale of ["vi", "en"] as const)
		test(`sgt-gio: ${locale} — gio theo ngon ngu, gio VN, cung o voi ten man`, async () => {
			hangCuaToi = [hang("t-1", 1)];
			const o = await ve(
				<DanhSachTinHieuTrang banVeDocDuoc trangThai={{}} />,
				locale,
			);
			const gio = [...o.querySelectorAll<HTMLElement>("[data-gio-gui]")];
			expect(gio.length).toBe(2);
			for (const g of gio) {
				expect(g.textContent, "gio gui theo mui gio may").toContain("09:05");
				expect(g.textContent, "gio gui khong theo ngon ngu").toBe(
					gioMong("2026-10-14T02:05:00.000Z", locale),
				);
				expect(g.className).not.toContain("text-right");
				expect(g.closest("td")?.className ?? "").not.toContain("text-right");
			}
			expect(o.querySelector("tr [data-ten-man]")?.closest("td")).toBe(
				o.querySelector("tr [data-gio-gui]")?.closest("td") ?? null,
			);
			expect(gioMong("2026-10-14T02:05:00.000Z", "vi")).not.toBe(
				gioMong("2026-10-14T02:05:00.000Z", "en"),
			);
		});
});

describe("sgt-ma", () => {
	test("sgt-ma: moi dong co ma; hop xoa neu dieu da ke", async () => {
		const m = tinHieuMessages("vi");
		hangCuaToi = [hang("t-3", 3), hang("t-12", 12), hang("t-104", 104)];
		const o = await ve(<DanhSachTinHieuTrang banVeDocDuoc trangThai={{}} />);
		let so = 0;
		for (const h of hangCuaToi) {
			for (const chon of [
				`tr[data-tin-hieu='${h.ma}']`,
				`div[data-tin-hieu='${h.ma}']`,
			]) {
				const ma = [
					...(o.querySelector(chon)?.querySelectorAll("[translate=no]") ?? []),
				].some((e) => e.textContent?.trim() === h.ma);
				expect(
					ma,
					chon.startsWith("div")
						? "dong dien thoai thieu ma tin hieu"
						: "dong bang thieu ma tin hieu",
				).toBe(true);
				so += 1;
			}
		}
		await bam(
			o.querySelector("tr[data-tin-hieu='crm-12'] [data-thao-tac-tin-hieu]"),
		);
		await bam(document.querySelector("[data-xoa-tin-hieu='crm-12']"));
		const hoi = document.querySelector("[role=alertdialog]");
		expect(hoi?.textContent).toContain(
			dien(m.trang.xoaTieuDe, { ma: "crm-12" }),
		);
		const ke = [...(hoi?.querySelectorAll("[translate=no]") ?? [])].map(
			(e) => e.textContent,
		);
		expect(
			ke.some((t) => t?.includes("gặp 12")),
			"hop xoa khong neu dieu da ke",
		).toBe(true);
		expect(hoi?.textContent).not.toContain("gặp 104");
		console.log(`sgt-ma: ${so} khang dinh ma + 2 hop xoa`);
	});
});

describe("sgt-tieu-diem", () => {
	const CA = [
		{ ten: "a", ds: [1, 2, 3], xoa: 2, dich: "nut-3" },
		{ ten: "b", ds: [1, 2, 3], xoa: 3, dich: "nut-2" },
		{ ten: "c", ds: [1], xoa: 1, dich: "rong" },
		{ ten: "d", ds: [1, -2], xoa: 1, dich: "dong-2" },
		{ ten: "e", ds: [1, 2], xoa: 1, dich: "nut-2", tre: 50 },
	];
	let so = 0;
	for (const ca of CA)
		test(`sgt-tieu-diem: o ${ca.ten} — xoa crm-${ca.xoa} -> ${ca.dich}`, async () => {
			const m = tinHieuMessages("vi");
			hangCuaToi = ca.ds.map((s) =>
				hang(`t-${Math.abs(s)}`, Math.abs(s), s < 0),
			);
			const o = await ve(<DanhSachTinHieuTrang banVeDocDuoc trangThai={{}} />);
			treLamMoi = ca.tre ?? 0;
			await bam(
				o.querySelector(
					`tr[data-tin-hieu='crm-${ca.xoa}'] [data-thao-tac-tin-hieu]`,
				),
			);
			await bam(document.querySelector(`[data-xoa-tin-hieu='crm-${ca.xoa}']`));
			await bam(
				[
					...document.querySelectorAll<HTMLButtonElement>(
						"[role=alertdialog] button",
					),
				].find((b) => b.textContent === m.trang.xoaNut),
			);
			await cho(120);
			const dang = document.activeElement as HTMLElement | null;
			expect(dang, "tieu diem roi ve dau trang sau xoa").not.toBe(
				document.body,
			);
			so += 1;
			if (ca.dich.startsWith("nut-"))
				expect(dang?.getAttribute("data-thao-tac-tin-hieu")).toBe(
					`crm-${ca.dich.slice(4)}`,
				);
			else if (ca.dich.startsWith("dong-"))
				expect(dang?.getAttribute("data-tin-hieu")).toBe(
					`crm-${ca.dich.slice(5)}`,
				);
			else expect(dang?.getAttribute("data-slot")).toBe("nut-gui-tin-hieu-tao");
			so += 1;
			expect(
				document.querySelector("[aria-live=polite][data-da-xoa]")?.textContent,
			).toBe(dien(m.trang.daXoa, { ma: `crm-${ca.xoa}` }));
			so += 1;
		});

	for (const locale of ["vi", "en"] as const)
		for (const loai of ["409", "mang"] as const)
			test(`sgt-tieu-diem: xoa hong ${loai}-${locale} — dong con, noi vi sao`, async () => {
				const m = tinHieuMessages(locale);
				hangCuaToi = [hang("t-1", 1), hang("t-2", 2)];
				const o = await ve(
					<DanhSachTinHieuTrang banVeDocDuoc trangThai={{}} />,
					locale,
				);
				loiXoa =
					loai === "409"
						? { status: 409, message: THONG_DIEP_MAY_CHU }
						: "mang";
				await bam(
					o.querySelector("tr[data-tin-hieu='crm-1'] [data-thao-tac-tin-hieu]"),
				);
				await bam(document.querySelector("[data-xoa-tin-hieu='crm-1']"));
				await bam(
					[
						...document.querySelectorAll<HTMLButtonElement>(
							"[role=alertdialog] button",
						),
					].find((b) => b.textContent === m.trang.xoaNut),
				);
				await cho(80);
				expect(o.querySelector("tr[data-tin-hieu='crm-1']")).not.toBeNull();
				so += 1;
				expect(
					o.querySelector("[data-xoa-hong]")?.textContent?.trim(),
					"xoa hong khong noi vi sao",
				).toBe(
					dien(loai === "409" ? m.trang.xoaHongDaLayVe : m.trang.xoaHong, {
						ma: "crm-1",
					}),
				);
				so += 1;
				if (locale === "en" && loai === "mang")
					console.log(`sgt-tieu-diem: ${so} khang dinh (5 x 3 + 4 x 2)`);
			});
});

describe("sgt-cham", () => {
	test("sgt-cham: nut thao tac dien thoai icon-lg, bang giu co", async () => {
		hangCuaToi = [hang("t-1", 1), hang("t-2", 2, true)];
		const o = await ve(<DanhSachTinHieuTrang banVeDocDuoc trangThai={{}} />);
		for (const ma of ["crm-1", "crm-2"]) {
			const dt = o.querySelector<HTMLElement>(
				`div[data-tin-hieu='${ma}'] [data-thao-tac-tin-hieu]`,
			);
			expect(dt?.dataset.size, "nut thao tac dien thoai duoi co cham").toBe(
				"icon-lg",
			);
			expect(buttonVariants({ size: "icon-lg" })).toContain("size-9");
			const bang = o.querySelector<HTMLElement>(
				`tr[data-tin-hieu='${ma}'] [data-thao-tac-tin-hieu]`,
			);
			expect([bang?.dataset.variant, bang?.dataset.size]).toEqual([
				"ghost",
				"icon-xs",
			]);
		}
	});

	test("sgt-cham: ma tran chin to hop — nut Gui khoa noi vi sao", async () => {
		const m = tinHieuMessages("vi");
		await moHop("vi");
		const gia = { rong: "", trang: "   \n ", chu: "có chữ" } as const;
		let so = 0;
		for (const [ta, a] of Object.entries(gia))
			for (const [tb, b] of Object.entries(gia)) {
				await go(oMuonLam(), a);
				await go(oDaXayRa(), b);
				const du = ta === "chu" && tb === "chu";
				const lyDo = hop()?.querySelectorAll("[data-ly-do-khoa]") ?? [];
				const gui = nutTrongHop(m.hop.gui);
				const moTa = gui?.getAttribute("aria-describedby") ?? "";
				if (du) {
					expect(lyDo.length).toBe(0);
					expect(moTa).not.toContain("ly-do");
				} else {
					expect(lyDo.length, "nut gui khoa khong noi vi sao").toBe(1);
					const d = lyDo[0] as HTMLElement;
					expect(d.textContent?.trim()).toBe(m.hop.lyDoKhoa);
					expect(moTa.split(" ")).toContain(d.id);
				}
				so += 1;
			}
		expect(so).toBe(9);
	});
});

describe("sgt-dong", () => {
	const DUONG_DONG = ["dong", "esc", "x", "lop-phu", "xem"] as const;
	async function dongBang(cach: string, m: ReturnType<typeof tinHieuMessages>) {
		if (cach === "dong") await bam(nutTrongHop(m.hop.dong));
		else if (cach === "huy") await bam(nutTrongHop(m.hop.huy));
		else if (cach === "esc") await phim("Escape");
		else if (cach === "x")
			await bam(
				hop()?.querySelector("[data-slot=dialog-close]:not([data-variant])") ??
					[...(hop()?.querySelectorAll("button") ?? [])].find((b) =>
						b.querySelector(".sr-only"),
					),
			);
		else if (cach === "lop-phu") {
			const lp = document.querySelector("[data-slot=dialog-overlay]");
			await act(async () => {
				lp?.dispatchEvent(
					new PointerEvent("pointerdown", { bubbles: true, cancelable: true }),
				);
			});
			await bam(lp);
		} else if (cach === "xem")
			await bam(
				[...document.querySelectorAll("a")].find(
					(a) => a.textContent === m.hop.xemDaGui,
				),
			);
	}
	let so = 0;
	for (const cach of DUONG_DONG)
		test(`sgt-dong: bien nhan / ${cach} — dong ngay khong hoi`, async () => {
			const m = tinHieuMessages("vi");
			await moHop();
			await guiHaiO(m);
			expect(hop()?.getAttribute("data-hop-tin-hieu")).toBe("da-gui");
			await dongBang(cach, m);
			expect(coHoiLai(), "bien nhan van hoi bo chu da nhap").toBe(false);
			expect(hop(), "bien nhan van hoi bo chu da nhap").toBeNull();
			so += 1;
		});
	for (const cach of ["huy", "esc", "x"] as const)
		test(`sgt-dong: dang soan co chu / ${cach} — van hoi lai`, async () => {
			const m = tinHieuMessages("vi");
			await moHop();
			await go(oDaXayRa(), "đang kể dở");
			await dongBang(cach, m);
			expect(coHoiLai()).toBe(true);
			expect(
				document.querySelector("[role=alertdialog]")?.textContent,
			).toContain(uiMessages("vi").dialog.boThayDoi.tieuDe);
			so += 1;
		});
	for (const cach of ["huy", "esc"] as const)
		test(`sgt-dong: go roi xoa het / ${cach} — dong ngay`, async () => {
			const m = tinHieuMessages("vi");
			await moHop();
			await go(oDaXayRa(), "x");
			await go(oDaXayRa(), "");
			await dongBang(cach, m);
			expect(coHoiLai()).toBe(false);
			expect(hop()).toBeNull();
			so += 1;
			if (cach === "esc") console.log(`sgt-dong: ${so} khang dinh`);
		});
});

describe("sgt-ten-man", () => {
	test("sgt-ten-man: hop hien ten man, gui len duong dan; dong cu hien ten", async () => {
		const m = tinHieuMessages("vi");
		duong = "/ws/okr/kr?x=1";
		await moHop("vi");
		const dongMan =
			hop()?.querySelector("[data-gui-tu-man]")?.textContent ?? "";
		expect(dongMan).toContain(tenMan("/okr", "vi"));
		expect(dongMan, "hop van hien duong dan tho").not.toContain("/okr");
		await guiHaiO(m);
		expect(daGui[0]?.man, "gia tri gui len doi khoi duong dan").toBe("/okr/kr");
		act(() => root?.unmount());
		document.body.innerHTML = "";
		hangCuaToi = [hang("t-1", 1, false, "/tai-lieu/abc")];
		const o = await ve(<DanhSachTinHieuTrang banVeDocDuoc trangThai={{}} />);
		expect(o.querySelector("tr [data-ten-man]")?.textContent).toBe(
			tenMan("/tai-lieu", "vi"),
		);
	});
});

describe("sgt-chu", () => {
	const CAM = {
		vi: ["gom", "kéo về", "kit", "khối", "bản vẽ", "lượt", "hồ sơ"],
		en: ["group", "pull", "kit", "block", "snapshot", "run"],
	} as const;

	function laChuoi(o: unknown, ra: string[] = []): string[] {
		if (typeof o === "string") ra.push(o);
		else if (o && typeof o === "object")
			for (const v of Object.values(o)) laChuoi(v, ra);
		return ra;
	}

	test("sgt-chu: chu nguoi gui khong dung tu noi bo, cau khong lap nhan", () => {
		const loi: string[] = [];
		for (const locale of ["vi", "en"] as const) {
			const m = tinHieuMessages(locale);
			const chuoi = laChuoi({
				hop: m.hop,
				trang: m.trang,
				nhan: m.nhan,
				trangThai: m.trangThai,
			});
			expect(chuoi.length).toBeGreaterThan(0);
			for (const c of chuoi)
				for (const tu of CAM[locale])
					if (new RegExp(`(^|[^\\p{L}])${tu}([^\\p{L}]|$)`, "iu").test(c))
						loi.push(`chu trang thai dung tu noi bo: ${tu} — «${c}»`);
			for (const [nhan, cau] of [
				[m.nhan.choLayVe, m.trangThai.choKeoVe],
				[m.nhan.choGom, m.trangThai.choGom],
			] as const)
				if (cau.toLowerCase().includes(nhan.toLowerCase()))
					loi.push(`cau lap nhan: «${nhan}» trong «${cau}»`);
			console.log(`sgt-chu: ${locale} duyet ${chuoi.length} chuoi`);
		}
		expect(loi).toEqual([]);
	});

	test("sgt-chu: dong da lay ve — Xoa khoa kem ly do, khong mo hop hoi", async () => {
		const m = tinHieuMessages("vi");
		hangCuaToi = [hang("t-2", 2, true)];
		const o = await ve(<DanhSachTinHieuTrang banVeDocDuoc trangThai={{}} />);
		const nut = o.querySelector(
			"tr[data-tin-hieu='crm-2'] [data-thao-tac-tin-hieu]",
		);
		expect(nut, "dong da lay ve mat nut xoa khong noi vi sao").not.toBeNull();
		await bam(nut);
		const muc = document.querySelector<HTMLElement>(
			"[data-xoa-tin-hieu='crm-2']",
		);
		expect(muc?.hasAttribute("data-disabled")).toBe(true);
		expect(muc?.getAttribute("aria-disabled")).toBe("true");
		expect(document.querySelector("[role=menu]")?.textContent).toContain(
			m.trang.khongXoaDuoc,
		);
		await bam(muc);
		expect(coHoiLai()).toBe(false);
	});
});
