import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import type { ReactNode } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

type Vai = "owner" | "member" | "okr";
type GuiVao = { muonLam: string; daXayRa: string; man: string };
type LoiGia = { status: number; message: string } | null;

let vai: Vai = "owner";
let duong = "/ws/okr/kr";
let daGui: GuiVao[] = [];
let daXoa: string[] = [];
let loiGui: LoiGia = null;
let hangCuaToi: {
	id: string;
	so: number;
	ma: string;
	tieuDe: string;
	muonLam: string;
	man: string;
	guiLuc: string;
	daKeoVe: boolean;
}[] = [];
let daLamMoi: string[] = [];

class LoiTrpc extends Error {
	data: { httpStatus: number };
	constructor(l: { status: number; message: string }) {
		super(l.message);
		this.data = { httpStatus: l.status };
	}
}

function truyVan<T>(ten: string, ra: () => T) {
	return {
		queryKey: () => [ten],
		pathKey: () => [ten],
		queryOptions: () => ({ queryKey: [ten], queryFn: async () => ra() }),
	};
}

function ghi<TVao, TRa>(ten: string, chay: (v: TVao) => TRa) {
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
				viewerRole: vai,
			})),
		},
		enrichment: {
			queue: truyVan("enrichment.queue", () => ({
				rows: [],
				total: 0,
				scheduled: [],
				scheduledTotal: 0,
			})),
		},
		thongBao: {
			chuong: truyVan("thongBao.chuong", () => ({ soChuaDoc: 0, dong: [] })),
			moMot: ghi("thongBao.moMot", () => ({ ok: true })),
			docHet: ghi("thongBao.docHet", () => ({ soDaDoc: 0 })),
		},
		tinHieu: {
			gui: ghi("tinHieu.gui", (v: GuiVao) => {
				if (loiGui) throw new LoiTrpc(loiGui);
				daGui.push(v);
				return { id: "t-1", ma: "crm-12" };
			}),
			xoa: ghi("tinHieu.xoa", (v: { id: string }) => {
				daXoa.push(v.id);
				return { ok: true };
			}),
			tatCa: truyVan("tinHieu.tatCa", () => ({ rows: [] })),
			cuaToi: {
				...truyVan("tinHieu.cuaToi", () => ({ rows: hangCuaToi })),
				queryKey: () => {
					daLamMoi.push("tinHieu.cuaToi");
					return ["tinHieu.cuaToi"];
				},
			},
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

mock.module("next-themes", () => ({
	useTheme: () => ({ resolvedTheme: "light", setTheme: () => {} }),
}));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { AppHeader } = await import("@/components/app-header");
const { MobileNavProvider } = await import("@/components/mobile-nav");
const { DanhSachTinHieuTrang } = await import(
	"@/app/(app)/[slug]/tin-hieu/danh-sach-tin-hieu-trang"
);
const { tinHieuMessages } = await import("@/lib/messages/tin-hieu");
const { TIN_HIEU } = await import("@crm/validation/tin-hieu");
const { toneTheoNghia } = await import("@crm/ui/lib/status-tone");
const { tenMan } = await import("@/lib/tin-hieu/ten-man");
const { dien } = await import("@/components/crm/record-sheet/plan-copy");

const m = tinHieuMessages("vi");
let root: Root | null = null;

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
	daGui = [];
	daXoa = [];
	loiGui = null;
	daLamMoi = [];
	hangCuaToi = [];
});

async function ve(nut: ReactNode) {
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root?.render(
			<NuqsTestingAdapter hasMemory>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<MobileNavProvider>{nut}</MobileNavProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	await act(async () => {
		await new Promise((r) => setTimeout(r, 20));
	});
	return o;
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
	await act(async () => {
		await new Promise((r) => setTimeout(r, 20));
	});
}

async function go(o: HTMLTextAreaElement, chu: string) {
	await act(async () => {
		const set = Object.getOwnPropertyDescriptor(
			HTMLTextAreaElement.prototype,
			"value",
		)?.set;
		set?.call(o, chu);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

const USER = { name: "Lan", email: "lan@onehub.test", image: null };
const nutGui = () =>
	document.querySelector<HTMLButtonElement>("[data-slot=nut-gui-tin-hieu]");
const oMuonLam = () =>
	document.querySelector<HTMLTextAreaElement>("textarea[name=muon-lam]");
const oDaXayRa = () =>
	document.querySelector<HTMLTextAreaElement>("textarea[name=da-xay-ra]");
const nutGuiTrongHop = () =>
	[
		...document.querySelectorAll<HTMLButtonElement>(
			"[data-hop-tin-hieu] button",
		),
	].find((b) => b.textContent === m.hop.gui);

describe("hop", () => {
	for (const v of ["owner", "member", "okr"] as const) {
		test(`hop: vai ${v} — nut co tren thanh dau trang, cung kieu cum, mo hop hai o, man bo slug`, async () => {
			vai = v;
			duong = "/ws/okr/kr?x=1";
			await ve(<AppHeader user={USER} />);
			const nut = nutGui();
			expect(nut, `vai ${v} khong co nut`).not.toBeNull();
			expect(nut?.getAttribute("aria-label")).toBe(m.nut);
			const chuan = { variant: "outline", size: "sm" };
			const cum = nut?.parentElement?.querySelectorAll<HTMLElement>(
				"button[data-variant=outline]",
			);
			for (const b of cum ?? [])
				if (b !== nut)
					expect(
						[b.dataset.variant, b.dataset.size],
						"nut gui tin hieu lech kieu cum nut dau trang",
					).toEqual([nut?.dataset.variant, nut?.dataset.size]);
			expect(
				[nut?.dataset.variant, nut?.dataset.size],
				"nut gui tin hieu lech kieu cum nut dau trang",
			).toEqual([chuan.variant, chuan.size]);
			if (nut) await bam(nut);
			expect(document.body.textContent).toContain(m.hop.muonLam);
			expect(document.body.textContent).toContain(m.hop.daXayRa);
			expect(
				document.body.textContent,
				"man con mang ten khong gian lam viec",
			).toContain(dien(m.hop.man, { man: tenMan("/okr/kr", "vi") }));
		});
	}

	test("hop: ma tran hai o x {rong, khoang trang, co chu} — Gui chi mo khi ca hai co chu", async () => {
		await ve(<AppHeader user={USER} />);
		const nut = nutGui();
		if (nut) await bam(nut);
		const gia = { rong: "", trang: "   \n ", chu: "có chữ" } as const;
		for (const [ta, a] of Object.entries(gia))
			for (const [tb, b] of Object.entries(gia)) {
				const o1 = oMuonLam();
				const o2 = oDaXayRa();
				if (o1) await go(o1, a);
				if (o2) await go(o2, b);
				const mo = ta === "chu" && tb === "chu";
				expect(
					nutGuiTrongHop()?.disabled,
					mo ? `${ta}/${tb} phai mo` : "o toan khoang trang van gui duoc",
				).toBe(!mo);
			}
	});

	test("hop: gui — mutation nhan dung hai o va man, bien nhan co ma va lien ket, lam moi danh sach", async () => {
		duong = "/ws/okr/kr";
		await ve(<AppHeader user={USER} />);
		const nut = nutGui();
		if (nut) await bam(nut);
		const o1 = oMuonLam();
		const o2 = oDaXayRa();
		if (o1) await go(o1, "cập nhật KR");
		if (o2) await go(o2, "không thấy số tuần trước");
		const g = nutGuiTrongHop();
		if (g) await bam(g);
		expect(daGui).toEqual([
			{
				muonLam: "cập nhật KR",
				daXayRa: "không thấy số tuần trước",
				man: "/okr/kr",
			},
		]);
		expect(document.body.textContent).toContain("Đã nhận tín hiệu crm-12");
		const lk = [...document.querySelectorAll("a")].find(
			(a) => a.textContent === m.hop.xemDaGui,
		);
		expect(lk?.getAttribute("href")).toBe("/ws/tin-hieu");
		expect(daLamMoi, "gui xong khong lam moi danh sach").toContain(
			"tinHieu.cuaToi",
		);
	});

	test("hop: loi — 500 hien cau chung bam lai duoc; 429 hien cau tran cua tep loi, khoa Gui, giu chu; maxLength moi o", async () => {
		await ve(<AppHeader user={USER} />);
		const nut = nutGui();
		if (nut) await bam(nut);
		expect(oMuonLam()?.maxLength).toBe(TIN_HIEU.doDaiMoiO);
		expect(oDaXayRa()?.maxLength).toBe(TIN_HIEU.doDaiMoiO);
		const o1 = oMuonLam();
		const o2 = oDaXayRa();
		if (o1) await go(o1, "a");
		if (o2) await go(o2, "b");
		loiGui = { status: 500, message: "chi tiet may chu" };
		const g2 = nutGuiTrongHop();
		if (g2) await bam(g2);
		expect(document.body.textContent).toContain(m.hop.chuaGui);
		expect(document.body.textContent).not.toContain("chi tiet may chu");
		loiGui = { status: 429, message: "Hôm nay bạn đã gửi 10 tín hiệu" };
		const g = nutGuiTrongHop();
		if (g) await bam(g);
		expect(document.body.textContent).toContain(
			dien(m.hop.quaTran, { tran: String(TIN_HIEU.tranMoiNgay) }),
		);
		expect(oDaXayRa()?.value, "loi lam mat chu da go").toBe("b");
		expect(nutGuiTrongHop()?.disabled).toBe(true);
	});

	test("hop: menu — menu nguoi dung co muc Tin hieu da gui tro trang", async () => {
		for (const v of ["owner", "member", "okr"] as const) {
			vai = v;
			await ve(<AppHeader user={USER} />);
			const mo = document.querySelector<HTMLElement>(
				"[aria-label='Tài khoản'], [aria-haspopup=menu]",
			);
			if (mo) await bam(mo);
			const lk = [...document.querySelectorAll("a")].find((a) =>
				a.textContent?.includes(m.menu),
			);
			expect(
				lk?.getAttribute("href"),
				"khong co loi vao trang tin hieu tu menu",
			).toBe("/ws/tin-hieu");
			act(() => root?.unmount());
			document.body.innerHTML = "";
		}
	});
});

const TT = {
	"crm-1": {
		nhan: m.nhan.choLayVe,
		cau: m.trangThai.choKeoVe,
		nghia: "nhap" as const,
	},
	"crm-2": {
		nhan: m.nhan.dangLam,
		cau: "vào nhóm A → việc H4: Đang làm",
		nghia: "dangChay" as const,
	},
	"crm-3": {
		nhan: m.nhan.daGiao,
		cau: "đã có việc đã giao: x (Đã giao)",
		nghia: "xong" as const,
	},
};

function hang(id: string, so: number, daKeoVe: boolean) {
	return {
		id,
		so,
		ma: `crm-${so}`,
		tieuDe: `gặp ${so}`,
		muonLam: `muốn ${so}`,
		man: "/okr",
		guiLuc: "2026-10-14T03:00:00.000Z",
		daKeoVe,
	};
}

describe("trang", () => {
	test("trang: dong — nhan, cau, tone theo nghia, chu nguoi go khong dich", async () => {
		hangCuaToi = [
			hang("t-1", 1, false),
			hang("t-2", 2, true),
			hang("t-3", 3, true),
		];
		const o = await ve(<DanhSachTinHieuTrang banVeDocDuoc trangThai={TT} />);
		for (const h of hangCuaToi) {
			const dong = o.querySelector(`tr[data-tin-hieu='${h.ma}']`);
			const tt = TT[h.ma as keyof typeof TT];
			const chi = dong?.querySelector("[data-slot=status-indicator]");
			expect(chi?.getAttribute("data-tone")).toBe(toneTheoNghia(tt.nghia));
			expect(chi?.textContent).toBe(tt.nhan);
			expect(dong?.querySelector("[data-cau-trang-thai]")?.textContent).toBe(
				tt.cau,
			);
			expect(
				dong?.querySelector("[translate=no]")?.textContent,
				"chu nguoi go khong danh dau khong dich",
			).toBe(h.tieuDe);
		}
	});

	test("trang: xoa — chi dong chua keo ve co thao tac, cung kieu nut thao tac dong, hoi lai roi goi xoa", async () => {
		hangCuaToi = [hang("t-1", 1, false), hang("t-2", 2, true)];
		const o = await ve(<DanhSachTinHieuTrang banVeDocDuoc trangThai={TT} />);
		const tt1 = o.querySelector<HTMLElement>(
			"tr[data-tin-hieu='crm-1'] [data-thao-tac-tin-hieu]",
		);
		const tt2 = o.querySelector(
			"tr[data-tin-hieu='crm-2'] [data-thao-tac-tin-hieu]",
		);
		expect(tt1).not.toBeNull();
		expect(tt2, "dong da lay ve mat nut thao tac").not.toBeNull();
		if (tt2) await bam(tt2);
		expect(
			document
				.querySelector("[data-xoa-tin-hieu='crm-2']")
				?.getAttribute("aria-disabled"),
			"dong da lay ve van xoa duoc",
		).toBe("true");
		await act(async () => {
			document.dispatchEvent(
				new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
			);
		});
		expect([tt1?.dataset.variant, tt1?.dataset.size]).toEqual([
			"ghost",
			"icon-xs",
		]);
		if (tt1) await bam(tt1);
		const muc = document.querySelector<HTMLElement>(
			"[data-xoa-tin-hieu='crm-1']",
		);
		if (muc) await bam(muc);
		expect(document.body.textContent).toContain("Xoá tín hiệu crm-1?");
		const xn = [...document.querySelectorAll<HTMLButtonElement>("button")].find(
			(b) => b.textContent === m.trang.xoaNut,
		);
		if (xn) await bam(xn);
		expect(daXoa).toEqual(["t-1"]);
	});

	test("trang: dau trang co dung mot nut chinh Gui tin hieu", async () => {
		const { NutGuiTrang } = await import(
			"@/app/(app)/[slug]/tin-hieu/nut-gui-trang"
		);
		hangCuaToi = [hang("t-1", 1, false)];
		const o = await ve(
			<>
				<NutGuiTrang />
				<DanhSachTinHieuTrang banVeDocDuoc trangThai={TT} />
			</>,
		);
		const chinh = o.querySelectorAll("button[data-variant=default]");
		expect(chinh.length, "dau trang co hon mot nut chinh").toBe(1);
		expect(chinh[0]?.textContent).toContain(m.nut);
	});
});

describe("khoan-dung", () => {
	test("khoan-dung: ban ve chua doc duoc — van du dong, trang thai luc gui, mot dong bao", async () => {
		hangCuaToi = [hang("t-1", 1, false), hang("t-9", 9, true)];
		const o = await ve(
			<DanhSachTinHieuTrang banVeDocDuoc={false} trangThai={{}} />,
		);
		expect(o.querySelectorAll("tr[data-tin-hieu]").length).toBe(2);
		expect(o.querySelectorAll("[data-ban-ve-chua-doc]").length).toBe(1);
		expect(
			o.querySelector("tr[data-tin-hieu='crm-1'] [data-cau-trang-thai]")
				?.textContent,
		).toBe(m.trangThai.choKeoVe);
		expect(
			o.querySelector("tr[data-tin-hieu='crm-9'] [data-cau-trang-thai]")
				?.textContent,
		).toBe(m.trangThai.choGom);
	});

	test("khoan-dung: chua gui tin hieu nao — cau rong kem nut gui", async () => {
		const o = await ve(<DanhSachTinHieuTrang banVeDocDuoc trangThai={{}} />);
		expect(o.querySelector("[data-tin-hieu-rong]")?.textContent).toContain(
			m.trang.rongTieuDe,
		);
		expect(
			o.querySelector("[data-tin-hieu-rong] [data-slot=nut-gui-tin-hieu-tao]"),
		).not.toBeNull();
	});
});
