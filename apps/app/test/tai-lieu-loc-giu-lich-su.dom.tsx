import { afterEach, describe, expect, mock, test } from "bun:test";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

type Man = "trang" | "cho-duyet";

const canh = {
	goi: { list: 0, proposals: 0 },
	treo: false,
	loi: false,
	rong: false,
	luotLoi: false,
	cho: [] as (() => void)[],
	capNhat: [] as { qs: string; history: string }[],
};

const TONG = 60;
const DEM = { "quy-dinh": 2, "chinh-sach": 2, "quy-trinh": 2, "bieu-mau": 0 };

async function luot(): Promise<void> {
	if (canh.treo) await new Promise<void>((r) => canh.cho.push(r));
	if (canh.loi || canh.luotLoi) throw new Error("mang");
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		taiLieu: {
			list: {
				queryOptions: (vao: { page: number }) => ({
					queryKey: ["taiLieu.list", vao],
					queryFn: async () => {
						canh.goi.list += 1;
						const n = canh.goi.list;
						await luot();
						const rong = canh.rong && n > 1;
						return {
							rows: rong
								? []
								: [
										{
											slug: `trang-${n}`,
											ten: `Trang lượt ${n}`,
											loai: "quy-dinh",
											chuTrang: { id: "u1", name: "Hà" },
											donVi: { id: "dv1", name: "Phòng Kinh doanh" },
											capNhat: "2026-09-20T00:00:00.000Z",
											luuTruLuc: null,
											coBanCho: false,
										},
									],
							total: rong ? 0 : TONG,
							facetCounts: DEM,
							soDaLuuTru: 1,
						};
					},
				}),
			},
			boLoc: {
				queryOptions: () => ({
					queryKey: ["taiLieu.boLoc"],
					queryFn: async () => ({
						donVi: [{ id: "dv1", ten: "Phòng Kinh doanh", so: 3 }],
						chuTrang: [{ id: "u1", ten: "Hà", so: 4 }],
					}),
				}),
			},
			proposals: {
				queryOptions: (vao: { nhom: string; page: number }) => ({
					queryKey: ["taiLieu.proposals", vao],
					queryFn: async () => {
						canh.goi.proposals += 1;
						const n = canh.goi.proposals;
						await luot();
						return {
							rows: [
								{
									id: `dx-${n}`,
									slug: "quy-dinh-a",
									ten: `Đề xuất lượt ${n}`,
									taoBoi: { id: "u1", name: "Hà" },
									luc: "2026-09-20T00:00:00.000Z",
									trangThai: "CHO_DUYET",
									cu: false,
									loai: "SUA",
								},
							],
							total: TONG,
							choToiDuyet: TONG,
						};
					},
				}),
			},
		},
	}),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({
		push: () => {},
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

const { DanhSachTrang } = await import(
	"@/app/(app)/[slug]/tai-lieu/danh-sach-trang"
);
const { ChoDuyet } = await import("@/app/(app)/[slug]/tai-lieu/cho-duyet");
const { taiLieuParsers } = await import(
	"@/app/(app)/[slug]/tai-lieu/tai-lieu-search-params"
);
const { SEARCH_PARAM } = await import("@/lib/search-param-keys");

const TEN = {
	trang: (n: number) => `Trang lượt ${n}`,
	"cho-duyet": (n: number) => `Đề xuất lượt ${n}`,
} as const;

let root: Root | null = null;
let khung: HTMLElement | null = null;

function datLai(): void {
	canh.goi = { list: 0, proposals: 0 };
	canh.treo = false;
	canh.loi = false;
	canh.rong = false;
	canh.luotLoi = false;
	for (const r of canh.cho) r();
	canh.cho = [];
	canh.capNhat = [];
}

async function dong(): Promise<void> {
	await act(async () => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
	datLai();
}

afterEach(dong);

const nhip = () => new Promise((r) => setTimeout(r, 30));

async function cho(): Promise<void> {
	for (let i = 0; i < 6; i += 1) {
		await act(async () => {
			await nhip();
		});
	}
}

function ghim(dk: boolean, thongDiep: string): void {
	if (!dk) throw new Error(thongDiep);
}

async function mo(man: Man, duong: string): Promise<HTMLElement> {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	await act(async () => {
		root?.render(
			<NuqsTestingAdapter
				hasMemory
				onUrlUpdate={(e) => {
					canh.capNhat.push({
						qs: e.queryString,
						history: e.options.history,
					});
				}}
				searchParams={duong}
			>
				<QueryClientProvider client={qc}>
					<LocaleProvider locale="vi">
						{man === "trang" ? <DanhSachTrang /> : <ChoDuyet />}
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	await cho();
	return khung;
}

async function tha(): Promise<void> {
	canh.treo = false;
	const cho1 = canh.cho;
	canh.cho = [];
	for (const r of cho1) r();
	await cho();
}

async function bam(el: Element | null | undefined): Promise<HTMLElement> {
	if (!(el instanceof HTMLElement))
		throw new Error("tlg: khong thay phan tu de bam");
	await act(async () => {
		for (const ten of ["pointerdown", "mousedown", "pointerup", "mouseup"]) {
			el.dispatchEvent(
				new window.PointerEvent(ten, { bubbles: true, button: 0 }),
			);
		}
		el.focus();
		el.click();
		await nhip();
	});
	return el;
}

async function chon(khoa: string, nhan: string): Promise<void> {
	await bam(document.body.querySelector(`[${khoa}]`));
	const muc = [...document.body.querySelectorAll("[cmdk-item]")].find(
		(e) => e.textContent?.includes(nhan) ?? false,
	);
	await bam(muc);
}

function nutChu(goc: ParentNode, chu: string): HTMLElement | undefined {
	return [...goc.querySelectorAll("button")].find(
		(b) => b.textContent?.trim() === chu,
	);
}

function q(chon: string): Element | null {
	return document.body.querySelector(chon);
}

const KHOA = {
	loai: SEARCH_PARAM.taiLieu.loai,
	donVi: SEARCH_PARAM.taiLieu.donVi,
	chu: SEARCH_PARAM.taiLieu.chu,
	nhom: SEARCH_PARAM.taiLieu.nhom,
	page: SEARCH_PARAM.list.page,
	archived: SEARCH_PARAM.list.archived,
} as const;

const HANH_DONG: {
	ten: string;
	man: Man;
	duong: string;
	lam: () => Promise<unknown>;
}[] = [
	{
		ten: "chon loai",
		man: "trang",
		duong: "",
		lam: () => bam(q('[data-loai="chinh-sach"]')),
	},
	{
		ten: "chon don vi",
		man: "trang",
		duong: "",
		lam: () => chon("data-loc-don-vi", "Phòng Kinh doanh"),
	},
	{
		ten: "chon chu trang",
		man: "trang",
		duong: "",
		lam: () => chon("data-loc-chu", "Hà"),
	},
	{
		ten: "bat luu tru",
		man: "trang",
		duong: "",
		lam: () => bam(q("[data-nut-da-luu-tru]")),
	},
	{
		ten: "bo loc",
		man: "trang",
		duong: "?loai=quy-dinh&donVi=dv1",
		lam: () => bam(q("[data-bo-loc-xoa]")),
	},
	{
		ten: "sang trang 2",
		man: "trang",
		duong: "",
		lam: () => bam(nutChu(document.body, "Tiếp")),
	},
	{
		ten: "doi nhom de xuat",
		man: "cho-duyet",
		duong: "",
		lam: () => bam(q('[data-nhom="da-xu-ly"]')),
	},
];

describe("lich-su", () => {
	test("lich-su: ma tran 7 hanh dong, moi lan mot cap nhat push", async () => {
		let dem = 0;
		for (const h of HANH_DONG) {
			await mo(h.man, h.duong);
			canh.capNhat = [];
			await h.lam();
			await cho();
			ghim(
				canh.capNhat.length === 1,
				`tlg-lich-su: ${h.ten} ra ${canh.capNhat.length} cap nhat`,
			);
			ghim(
				canh.capNhat[0]?.history === "push",
				`tlg-lich-su: ${h.ten} ghi de muc lich su`,
			);
			dem += 1;
			await dong();
		}
		expect(dem).toBe(7);
	});

	test("lich-su: sau khoa loc cua taiLieuParsers mang history push", () => {
		for (const [ten, khoa] of Object.entries(KHOA)) {
			ghim(
				taiLieuParsers[khoa].history === "push",
				`tlg-lich-su: khoa ${ten} khong push`,
			);
		}
		ghim(
			taiLieuParsers[SEARCH_PARAM.taiLieu.tab].history !== "push",
			"tlg-lich-su: tab bi doi sang push",
		);
	});
});

type O = {
	ten: string;
	man: Man;
	giu: (n: Element) => boolean;
	nut: (goc: HTMLElement) => Element | null | undefined;
};

const coNutTiep = (n: Element) =>
	n.matches("button") ? n.textContent?.trim() === "Tiếp" : !!nutChu(n, "Tiếp");

const O_GIU: O[] = [
	{
		ten: "trang chon loai",
		man: "trang",
		giu: (n) =>
			n.matches("[data-bo-loc]") || !!n.querySelector("[data-bo-loc]"),
		nut: (g) => g.querySelector('[data-loai="chinh-sach"]'),
	},
	{
		ten: "trang sang trang 2",
		man: "trang",
		giu: (n) =>
			n.matches("[data-bo-loc]") ||
			!!n.querySelector("[data-bo-loc]") ||
			coNutTiep(n),
		nut: (g) => nutChu(g, "Tiếp"),
	},
	{
		ten: "cho duyet doi nhom",
		man: "cho-duyet",
		giu: (n) => n.matches("[data-nhom]") || !!n.querySelector("[data-nhom]"),
		nut: (g) => g.querySelector('[data-nhom="da-xu-ly"]'),
	},
	{
		ten: "cho duyet sang trang 2",
		man: "cho-duyet",
		giu: (n) =>
			n.matches("[data-nhom]") ||
			!!n.querySelector("[data-nhom]") ||
			coNutTiep(n),
		nut: (g) => nutChu(g, "Tiếp"),
	},
];

function demGo(goc: Element, giu: (n: Element) => boolean) {
	let so = 0;
	const ob = new MutationObserver((ds) => {
		for (const d of ds) {
			for (const n of d.removedNodes) {
				if (n instanceof Element && giu(n)) so += 1;
			}
		}
	});
	ob.observe(goc, { childList: true, subtree: true });
	return { so: () => so, dung: () => ob.disconnect() };
}

const vung = (g: HTMLElement) => g.querySelector('[data-slot="vung-dang-tai"]');
const dangTai = (g: HTMLElement) => {
	const v = vung(g);
	return (
		v?.getAttribute("aria-busy") === "true" ||
		(v?.hasAttribute("data-dang-tai") ?? false)
	);
};
const khungXuong = (g: HTMLElement) =>
	g.querySelector('[data-slot="skeleton"]') !== null;

describe("giu-loc", () => {
	test("giu-loc: ma tran 4 o", async () => {
		let dem = 0;
		for (const o of O_GIU) {
			const g = await mo(o.man, "");
			ghim(!dangTai(g), `tlg-giu-loc: ${o.ten} dang tai truoc khi bam`);
			ghim(
				g.textContent?.includes(TEN[o.man](1)) ?? false,
				`tlg-giu-loc: ${o.ten} thieu hang cu truoc khi bam`,
			);
			canh.treo = true;
			const go = demGo(g, o.giu);
			const nut = await bam(o.nut(g));
			ghim(go.so() === 0, `tlg-giu-loc: ${o.ten} go thanh loc`);
			ghim(
				nut.isConnected && document.activeElement === nut,
				`tlg-giu-loc: ${o.ten} mat tieu diem`,
			);
			const v = vung(g);
			ghim(
				v?.getAttribute("aria-busy") === "true" &&
					v.hasAttribute("data-dang-tai"),
				`tlg-giu-loc: ${o.ten} khong bao dang tai`,
			);
			ghim(
				g.textContent?.includes(TEN[o.man](1)) ?? false,
				`tlg-giu-loc: ${o.ten} mat hang cu`,
			);
			await tha();
			ghim(go.so() === 0, `tlg-giu-loc: ${o.ten} go thanh loc khi ve`);
			ghim(
				g.textContent?.includes(TEN[o.man](2)) ?? false,
				`tlg-giu-loc: ${o.ten} khong co hang moi`,
			);
			ghim(!dangTai(g), `tlg-giu-loc: ${o.ten} con dang tai sau khi ve`);
			go.dung();
			dem += 1;
			await dong();
		}
		expect(dem).toBe(4);
	});

	test("giu-loc: bam hai chip lien truoc khi ve van giu danh sach cu", async () => {
		const g = await mo("trang", "");
		canh.treo = true;
		await bam(g.querySelector('[data-loai="chinh-sach"]'));
		const nut = await bam(g.querySelector('[data-loai="quy-trinh"]'));
		ghim(!khungXuong(g), "tlg-giu-loc: bam lien hien khung xuong");
		ghim(
			g.textContent?.includes(TEN.trang(1)) ?? false,
			"tlg-giu-loc: bam lien mat hang cu",
		);
		ghim(document.activeElement === nut, "tlg-giu-loc: bam lien mat tieu diem");
		await tha();
		ghim(!dangTai(g), "tlg-giu-loc: bam lien con dang tai sau khi ve");
		ghim(
			g.querySelector('[data-loai="quy-trinh"]')?.getAttribute("data-state") ===
				"on",
			"tlg-giu-loc: bam lien chip cuoi khong bat",
		);
	});

	test("giu-loc: loc ra rong chi hien rong khi du lieu moi ve", async () => {
		const g = await mo("trang", "");
		canh.treo = true;
		canh.rong = true;
		await bam(g.querySelector('[data-loai="chinh-sach"]'));
		ghim(
			g.querySelector("[data-loc-rong]") === null,
			"tlg-giu-loc: loc ra rong hien rong khi chua ve",
		);
		await tha();
		ghim(
			g.querySelector("[data-loc-rong]") !== null,
			"tlg-giu-loc: loc ra rong khong hien rong khi ve",
		);
	});
});

describe("lan-dau", () => {
	test("lan-dau: ma tran 2 man x 2 trang thai", async () => {
		let dem = 0;
		for (const man of ["trang", "cho-duyet"] as const) {
			canh.treo = true;
			const g = await mo(man, man === "trang" ? "?loai=chinh-sach" : "");
			ghim(khungXuong(g), `tlg-lan-dau: ${man} lan dau khong co khung xuong`);
			ghim(
				g.querySelector("[data-bo-loc], [data-nhom]") === null,
				`tlg-lan-dau: ${man} lan dau co thanh loc`,
			);
			await tha();
			ghim(
				g.querySelector('[aria-busy="true"]') === null,
				`tlg-lan-dau: ${man} con aria-busy sau khi ve`,
			);
			dem += 1;
			await dong();

			canh.loi = true;
			const gl = await mo(man, "");
			const nut = nutChu(gl, "Thử lại");
			ghim(nut !== undefined, `tlg-lan-dau: ${man} loi khong co nut thu lai`);
			const truoc = canh.goi.list + canh.goi.proposals;
			canh.loi = false;
			await bam(nut);
			await cho();
			ghim(
				canh.goi.list + canh.goi.proposals === truoc + 1,
				`tlg-lan-dau: ${man} thu lai khong goi lai`,
			);
			dem += 1;
			await dong();
		}
		expect(dem).toBe(4);
	});
});

describe("doi-loc-loi", () => {
	test("doi-loc-loi: ma tran 2 o", async () => {
		let dem = 0;
		const O_LOI = [
			{ man: "trang", ten: "trang", nut: '[data-loai="chinh-sach"]' },
			{ man: "cho-duyet", ten: "cho duyet", nut: '[data-nhom="da-xu-ly"]' },
		] as const;
		for (const o of O_LOI) {
			const g = await mo(o.man, "");
			ghim(
				g.textContent?.includes(TEN[o.man](1)) ?? false,
				`tlg-doi-loc-loi: ${o.ten} thieu hang cu truoc khi bam`,
			);
			canh.luotLoi = true;
			await bam(g.querySelector(o.nut));
			await cho();
			ghim(
				!(g.textContent?.includes(TEN[o.man](1)) ?? false),
				`tlg-doi-loc-loi: ${o.ten} doi loc loi treo danh sach cu`,
			);
			const nut = nutChu(g, "Thử lại");
			ghim(nut !== undefined, `tlg-doi-loc-loi: ${o.ten} khong co nut thu lai`);
			ghim(!khungXuong(g), `tlg-doi-loc-loi: ${o.ten} hien khung xuong`);
			ghim(
				g.querySelector('[aria-busy="true"]') === null,
				`tlg-doi-loc-loi: ${o.ten} con aria-busy`,
			);
			const truoc = canh.goi.list + canh.goi.proposals;
			canh.luotLoi = false;
			await bam(nut);
			await cho();
			ghim(
				canh.goi.list + canh.goi.proposals === truoc + 1,
				`tlg-doi-loc-loi: ${o.ten} thu lai khong goi lai`,
			);
			ghim(
				g.textContent?.includes(TEN[o.man](truoc + 1)) ?? false,
				`tlg-doi-loc-loi: ${o.ten} thu lai khong hien hang moi`,
			);
			dem += 1;
			await dong();
		}
		expect(dem).toBe(2);
	});
});
