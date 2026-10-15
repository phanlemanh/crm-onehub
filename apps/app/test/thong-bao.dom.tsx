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
import { act, Children, isValidElement } from "react";
import { createRoot, type Root } from "react-dom/client";

type Vai = "owner" | "member" | "okr";
type Dong = {
	id: string;
	noiDung: {
		loai: "viec-qua-han";
		viecId: string;
		tieuDe: string;
		soNgay: number;
		banGhi: null;
	};
	duongDan: string;
	taoLuc: string;
	daDoc: boolean;
};

const HOI_LAI_THU_MS = 40;
const thatValidation = await import("@crm/validation/thong-bao");
mock.module("@crm/validation/thong-bao", () => ({
	...thatValidation,
	THONG_BAO: { ...thatValidation.THONG_BAO, hoiLaiMs: HOI_LAI_THU_MS },
}));

let vai: Vai = "member";
let soChuaDoc = 0;
let dongChuong: Dong[] = [];
let loiChuong = false;
let loiDocHet = false;
let daMo: string[] = [];
let daDocHet = 0;
let goiChuong = 0;
let daLamMoi: string[] = [];
let trangDs: Dong[][] = [[]];
let loiDs = false;
let vaoDs: { chiChuaDoc: boolean }[] = [];
let loiToast: string[] = [];

function truyVan<T>(ten: string, ra: () => T) {
	return {
		queryKey: () => {
			daLamMoi.push(ten);
			return [ten];
		},
		pathKey: () => {
			daLamMoi.push(ten);
			return [ten];
		},
		queryOptions: () => ({ queryKey: [ten], queryFn: async () => ra() }),
	};
}

function ghi<TVao, TRa>(ten: string, chay: (v: TVao) => TRa) {
	return {
		mutationOptions: (
			o: { onSuccess?: (d: TRa) => void; onError?: (e: Error) => void } = {},
		) => ({
			mutationKey: [ten],
			mutationFn: async (v: TVao) => chay(v),
			onSuccess: o.onSuccess,
			onError: o.onError,
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
			chuong: truyVan("thongBao.chuong", () => {
				goiChuong += 1;
				if (loiChuong) throw new Error("hong");
				return { soChuaDoc, dong: dongChuong };
			}),
			danhSach: {
				pathKey: () => {
					daLamMoi.push("thongBao.danhSach");
					return ["thongBao.danhSach"];
				},
				infiniteQueryOptions: (
					vao: { chiChuaDoc: boolean },
					o: { getNextPageParam: (t: { conTroSau: string | null }) => unknown },
				) => {
					vaoDs.push(vao);
					return {
						queryKey: ["thongBao.danhSach", vao],
						initialPageParam: undefined,
						getNextPageParam: o.getNextPageParam,
						queryFn: async ({ pageParam }: { pageParam?: string }) => {
							if (loiDs) throw new Error("hong");
							const i = pageParam ? Number(pageParam) : 0;
							const dong = (trangDs[i] ?? []).filter(
								(d) => !vao.chiChuaDoc || !d.daDoc,
							);
							return {
								dong,
								conTroSau: i + 1 < trangDs.length ? String(i + 1) : null,
							};
						},
					};
				},
			},
			moMot: ghi("thongBao.moMot", (v: { id: string }) => {
				daMo.push(v.id);
				return { ok: true };
			}),
			docHet: ghi("thongBao.docHet", () => {
				if (loiDocHet) throw new Error("hong");
				daDocHet += 1;
				soChuaDoc = 0;
				return { soDaDoc: 3 };
			}),
		},
		tinHieu: {
			gui: ghi("tinHieu.gui", () => ({ id: "t", ma: "crm-1" })),
		},
	}),
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, refresh: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws",
	useSearchParams: () => new URLSearchParams(),
}));

mock.module("next/link", () => ({
	default: ({
		href,
		children,
		onClick,
		...rest
	}: {
		href: string;
		children: ReactNode;
		onClick?: (e: MouseEvent) => void;
	}) => (
		<a
			href={href}
			{...rest}
			onClick={(e) => {
				onClick?.(e.nativeEvent);
				e.preventDefault();
			}}
		>
			{children}
		</a>
	),
}));

function khoi(ten: string) {
	const ham = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
	Object.defineProperty(ham, "name", { value: ten });
	return ham;
}

mock.module("@/components/page-shell", () => ({
	PageShell: khoi("PageShell"),
	PageShellHeader: khoi("PageShellHeader"),
	PageShellHeading: khoi("PageShellHeading"),
	PageShellTitle: khoi("PageShellTitle"),
	PageShellDescription: khoi("PageShellDescription"),
	PageShellActions: khoi("PageShellActions"),
	PageShellContent: khoi("PageShellContent"),
}));

mock.module("@/lib/locale/server", () => ({ getLocale: async () => "vi" }));

mock.module("@/lib/session", () => ({ requireSession: async () => ({}) }));

mock.module("next-themes", () => ({
	useTheme: () => ({ resolvedTheme: "light", setTheme: () => {} }),
}));

mock.module("sonner", () => ({
	toast: Object.assign(() => {}, {
		error: (chu: string) => loiToast.push(chu),
		success: () => {},
	}),
	Toaster: () => null,
}));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { AppHeader } = await import("@/components/app-header");
const { MobileNavProvider } = await import("@/components/mobile-nav");
const { DanhSachThongBaoTrang } = await import(
	"@/app/(app)/[slug]/thong-bao/danh-sach-thong-bao-trang"
);
const { thongBaoMessages } = await import("@/lib/messages/thong-bao");
const { THONG_BAO } = await import("@crm/validation/thong-bao");
const { dien } = await import("@/components/crm/record-sheet/plan-copy");

const m = thongBaoMessages("vi");
const USER = { name: "Lan", email: "lan@onehub.test", image: null };
let root: Root | null = null;
let urls: string[] = [];

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
	vai = "member";
	soChuaDoc = 0;
	dongChuong = [];
	loiChuong = false;
	loiDocHet = false;
	daMo = [];
	daDocHet = 0;
	goiChuong = 0;
	daLamMoi = [];
	trangDs = [[]];
	loiDs = false;
	vaoDs = [];
	loiToast = [];
	urls = [];
	setSystemTime();
});

async function cho(ms = 30) {
	await act(async () => {
		await new Promise((r) => setTimeout(r, ms));
	});
}

async function ve(nut: ReactNode, locale: "vi" | "en" = "vi", query = "") {
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root?.render(
			<NuqsTestingAdapter
				hasMemory
				searchParams={query}
				onUrlUpdate={(e) => urls.push(e.queryString)}
			>
				<QueryClientProvider client={client}>
					<LocaleProvider locale={locale}>
						<MobileNavProvider>{nut}</MobileNavProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	await cho();
}

async function bam(o: Element, them: MouseEventInit = {}) {
	await act(async () => {
		for (const loai of [
			"pointerdown",
			"mousedown",
			"pointerup",
			"mouseup",
			"click",
		])
			o.dispatchEvent(
				new MouseEvent(loai, {
					bubbles: true,
					cancelable: true,
					button: 0,
					...them,
				}),
			);
	});
	await cho();
}

const chuong = () =>
	document.querySelector<HTMLButtonElement>("[data-slot=chuong-thong-bao]");
const so = () => document.querySelector("[data-slot=so-chua-doc]");
const nutChu = (chu: string) =>
	[...document.querySelectorAll("button")].find(
		(b) => b.textContent?.trim() === chu,
	) ?? null;

function dong(
	i: number,
	taoLuc: string,
	daDoc = false,
	tieuDe = `Viec ${i}`,
): Dong {
	return {
		id: `tb${i}`,
		noiDung: {
			loai: "viec-qua-han",
			viecId: `v${i}`,
			tieuDe,
			soNgay: 2,
			banGhi: null,
		},
		duongDan: `/viec?record=viec:v${i}`,
		taoLuc,
		daDoc,
	};
}

describe("chuong", () => {
	for (const v of ["owner", "member", "okr"] as const)
		for (const n of [0, 1, 99, 100]) {
			test(`chuong: vai ${v}, ${n} chua doc`, async () => {
				vai = v;
				soChuaDoc = n;
				await ve(<AppHeader user={USER} />);
				expect(chuong(), `vai ${v} khong co chuong`).not.toBeNull();
				const kyVong =
					n === 0
						? null
						: n > THONG_BAO.tranSo
							? `${THONG_BAO.tranSo}+`
							: String(n);
				if (kyVong === null) expect(so(), "chuong hien so 0").toBeNull();
				else expect(so()?.textContent).toBe(kyVong);
				expect(chuong()?.getAttribute("aria-label")).toBe(
					kyVong === null
						? m.chuong.nhan
						: dien(m.chuong.nhanSo, { so: kyVong }),
				);
			});
		}

	test("chuong: mo chuong khong doi so, khong goi ghi", async () => {
		soChuaDoc = 3;
		dongChuong = [dong(1, new Date().toISOString())];
		await ve(<AppHeader user={USER} />);
		await bam(chuong() as Element);
		expect(daMo.length + daDocHet, "mo chuong xoa so chua doc").toBe(0);
		expect(so()?.textContent).toBe("3");
	});

	test("chuong: hoi-lai — so moi hien khong tai lai trang, bao trinh doc man", async () => {
		soChuaDoc = 2;
		await ve(<AppHeader user={USER} />);
		expect(so()?.textContent).toBe("2");
		soChuaDoc = 5;
		await cho(HOI_LAI_THU_MS * 4);
		expect(so()?.textContent, "so chua doc khong tu cap nhat").toBe("5");
		expect(
			document.querySelector("[role=status][aria-live=polite]")?.textContent,
		).toBe(dien(m.chuong.nhanSo, { so: "5" }));
		const truoc = goiChuong;
		soChuaDoc = 7;
		await act(async () => {
			window.dispatchEvent(new Event("visibilitychange"));
			window.dispatchEvent(new Event("focus"));
		});
		await cho();
		expect(goiChuong).toBeGreaterThan(truoc);
		expect(so()?.textContent).toBe("7");
	});

	test("chuong: danh-sach — Hom nay / Truoc do theo gio Viet Nam, toi da 20, moi nhat truoc", async () => {
		setSystemTime(new Date("2026-10-14T01:00:00.000Z"));
		soChuaDoc = 3;
		dongChuong = [
			...[1, 2, 3].map((i) => dong(i, "2026-10-13T17:30:00.000Z")),
			...Array.from({ length: THONG_BAO.soTrenChuong - 3 }, (_, k) =>
				dong(10 + k, "2026-10-13T09:00:00.000Z", true),
			),
		];
		await ve(<AppHeader user={USER} />);
		await bam(chuong() as Element);
		const nhom = [
			...document.querySelectorAll("[data-slot=danh-sach-thong-bao] section"),
		];
		expect(
			nhom.map((s) => s.getAttribute("aria-label")),
			"Hom nay tinh theo ngay UTC",
		).toEqual([m.chuong.homNay, m.chuong.truocDo]);
		expect(
			nhom[0]?.querySelectorAll("[data-slot=item]").length,
			"Hom nay tinh theo ngay UTC",
		).toBe(3);
		expect(
			document.querySelectorAll(
				"[data-slot=danh-sach-thong-bao] [data-slot=item]",
			).length,
		).toBe(THONG_BAO.soTrenChuong);
		const chuaDoc = document.querySelectorAll("[data-chua-doc]");
		expect(chuaDoc.length).toBe(3);
		for (const d of chuaDoc)
			expect(d.querySelector("[data-tone=primary]")).not.toBeNull();
		const dauTien =
			document.querySelector<HTMLAnchorElement>("[data-chua-doc]");
		expect(dauTien?.getAttribute("href")).toBe("/ws/viec?record=viec:v1");
		const tatCa = [...document.querySelectorAll("a")].find(
			(a) => a.textContent === m.chuong.xemTatCa,
		);
		expect(tatCa?.getAttribute("href")).toBe("/ws/thong-bao");
	});

	test("chuong: rong, cho tai, loi", async () => {
		await ve(<AppHeader user={USER} />);
		await bam(chuong() as Element);
		expect(document.body.textContent).toContain(m.chuong.rongTieuDe);
		act(() => root?.unmount());
		document.body.innerHTML = "";
		loiChuong = true;
		await ve(<AppHeader user={USER} />);
		await bam(chuong() as Element);
		expect(document.body.textContent).toContain(m.chuong.loiTieuDe);
		const truoc = goiChuong;
		loiChuong = false;
		const thuLai = [...document.querySelectorAll("button")].find((b) =>
			b.textContent?.includes("Thử lại"),
		);
		if (thuLai) await bam(thuLai);
		expect(goiChuong).toBeGreaterThan(truoc);
	});

	test("chuong: tieng Anh dung cau cua loai", async () => {
		setSystemTime(new Date("2026-10-14T01:00:00.000Z"));
		soChuaDoc = 1;
		dongChuong = [dong(1, "2026-10-14T00:30:00.000Z", false, "Gửi báo giá")];
		await ve(<AppHeader user={USER} />, "en");
		await bam(chuong() as Element);
		const en = thongBaoMessages("en");
		expect(document.body.textContent).toContain(
			dien(en.cau["viec-qua-han"], { tieuDe: "Gửi báo giá", soNgay: 2 }),
		);
	});

	test("chuong: bam — dong chua doc goi mo mot dung id, ke ca Cmd+bam", async () => {
		soChuaDoc = 2;
		dongChuong = [
			dong(1, new Date().toISOString()),
			dong(2, new Date().toISOString()),
		];
		await ve(<AppHeader user={USER} />);
		await bam(chuong() as Element);
		await bam(document.querySelector("[data-chua-doc]") as Element);
		expect(daMo).toEqual(["tb1"]);
		expect(daLamMoi).toContain("thongBao.chuong");
		await bam(chuong() as Element);
		const thuHai = document.querySelectorAll("[data-chua-doc]")[1];
		await bam(thuHai as Element, { metaKey: true });
		expect(daMo, "mo the moi khong danh dau da doc").toEqual(["tb1", "tb2"]);
	});

	test("chuong: doc-het — khoa khi 0, xoa so khi xong, giu so khi loi", async () => {
		soChuaDoc = 0;
		await ve(<AppHeader user={USER} />);
		await bam(chuong() as Element);
		expect(nutChu(m.chuong.docHet)?.disabled).toBe(true);
		act(() => root?.unmount());
		document.body.innerHTML = "";
		soChuaDoc = 3;
		loiDocHet = true;
		await ve(<AppHeader user={USER} />);
		await bam(chuong() as Element);
		await bam(nutChu(m.chuong.docHet) as Element);
		expect(so()?.textContent, "loi danh dau het van xoa so").toBe("3");
		expect(loiToast).toEqual([m.chuong.docHetLoi]);
		loiDocHet = false;
		await bam(nutChu(m.chuong.docHet) as Element);
		await cho(50);
		expect(daDocHet).toBe(1);
		expect(so()).toBeNull();
	});
});

function timChu(el: ReactNode, kieu: string): string[] {
	if (!isValidElement<{ children?: ReactNode }>(el)) return [];
	const ten = (el.type as { name?: string }).name ?? "";
	const con = Children.toArray(el.props.children);
	const ra =
		ten === kieu
			? con.flatMap((c) => (isValidElement(c) ? [] : [String(c)]))
			: [];
	return [...ra, ...con.flatMap((c) => timChu(c, kieu))];
}

describe("trang", () => {
	test("trang: tieu de va mot cau mo ta dung trong page", async () => {
		const { default: ThongBaoPage } = await import(
			"@/app/(app)/[slug]/thong-bao/page"
		);
		const cay = await ThongBaoPage();
		expect(timChu(cay, "PageShellTitle")).toEqual([m.trang.tieuDe]);
		expect(timChu(cay, "PageShellDescription")).toEqual([m.trang.moTa]);
	});

	test("trang: loc Chua doc ghi tren duong dan, goi danh sach chi chua doc", async () => {
		trangDs = [[dong(1, new Date().toISOString())]];
		await ve(<DanhSachThongBaoTrang />);
		const loc = [...document.querySelectorAll("button")].find(
			(b) => b.textContent === m.trang.loc.chuaDoc,
		);
		await bam(loc as Element);
		await cho(50);
		expect(urls.join("|"), "loc khong ghi tren duong dan").toContain(
			"locThongBao=chua-doc",
		);
		expect(vaoDs.at(-1)).toEqual({ chiChuaDoc: true });
	});

	test("trang: tai lai voi loc chua doc thi goi chi chua doc; rong thi da doc het", async () => {
		trangDs = [[dong(1, new Date().toISOString(), true)]];
		await ve(<DanhSachThongBaoTrang />, "vi", "?locThongBao=chua-doc");
		expect(vaoDs[0]).toEqual({ chiChuaDoc: true });
		expect(document.body.textContent).toContain(m.trang.daDocHetTieuDe);
		await bam(nutChu(m.trang.xemTatCa) as Element);
		await cho(50);
		expect(vaoDs.at(-1)).toEqual({ chiChuaDoc: false });
	});

	test("trang: nhom theo ngay moi nhat truoc, xem them nap trang sau", async () => {
		setSystemTime(new Date("2026-10-14T03:00:00.000Z"));
		trangDs = [
			[
				dong(1, "2026-10-14T01:30:00.000Z"),
				dong(2, "2026-10-13T01:30:00.000Z", true),
			],
			[dong(3, "2026-10-12T01:30:00.000Z", true)],
		];
		await ve(<DanhSachThongBaoTrang />);
		const nhan = () =>
			[
				...document.querySelectorAll("[data-slot=danh-sach-thong-bao] section"),
			].map((s) => s.getAttribute("aria-label"));
		expect(nhan()[0]).toBe(m.chuong.homNay);
		expect(nhan().length).toBe(2);
		await bam(nutChu(m.trang.xemThem) as Element);
		await cho(50);
		expect(nhan().length).toBe(3);
		expect(nutChu(m.trang.xemThem)).toBeNull();
	});

	test("trang: tai hong dung vung loi chung co Thu lai", async () => {
		loiDs = true;
		await ve(<DanhSachThongBaoTrang />);
		expect(document.body.textContent).toContain(m.trang.taiLoiTieuDe);
	});
});
