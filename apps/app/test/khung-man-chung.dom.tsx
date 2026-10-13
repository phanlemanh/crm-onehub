import { afterEach, describe, expect, mock, test } from "bun:test";
import {
	QueryClient,
	QueryClientProvider,
	useQuery,
} from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import {
	act,
	createElement as h,
	type ReactElement,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";

type CheDo = "co" | "loi" | "treo";

const canh = {
	nguon: "bat" as "bat" | "tat" | "loi",
	danhMuc: "loi" as CheDo,
	bangCot: "loi" as CheDo,
	chienDich: "treo" as CheDo,
	danhMucRong: false,
	khuon: [] as { id: string; name: string }[],
	quyenToChuc: false,
	quyenSso: false,
	khuonLoi: false,
	goi: {} as Record<string, number>,
	xong: {} as Record<string, number>,
};

const CHIEN_DICH = {
	id: "cd-1",
	name: "Gọi lại tháng 10",
	segmentName: "Đối tác mới",
	savedViewId: "sv-1",
	startedAt: null,
	finishedAt: null,
	status: "DRAFT",
	stats: {
		members: 0,
		called: 0,
		answered: 0,
		answerRate: 0,
		meetings: 0,
		meetingRate: 0,
		noRate: 0,
	},
	control: null,
};

function dem(khoa: string) {
	canh.goi[khoa] = (canh.goi[khoa] ?? 0) + 1;
}

function theoCheDo<R>(khoa: string, cheDo: () => CheDo, tra: () => R) {
	return async () => {
		dem(khoa);
		const c = cheDo();
		if (c === "loi") throw new Error(`${khoa} loi`);
		if (c === "treo") return new Promise<R>(() => {});
		const ra = tra();
		canh.xong[khoa] = (canh.xong[khoa] ?? 0) + 1;
		return ra;
	};
}

type TuyDotBien = { onSuccess?: () => void; onError?: (loi: Error) => void };

function truyVan<R, V = undefined>(khoa: string, queryFn: () => Promise<R>) {
	return {
		queryKey: (v?: V) => (v === undefined ? [khoa] : [khoa, v]),
		queryOptions: (v?: V) => ({
			queryKey: v === undefined ? [khoa] : [khoa, v],
			queryFn,
		}),
		mutationOptions: (tuy: TuyDotBien = {}) => ({
			...tuy,
			mutationKey: [khoa],
			mutationFn: async () => undefined,
		}),
	};
}

const co = <R,>(khoa: string, tra: () => R) =>
	truyVan(
		khoa,
		theoCheDo(khoa, () => "co", tra),
	);

mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => children,
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({
		push: () => {},
		replace: () => {},
		refresh: () => {},
		prefetch: () => {},
	}),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws",
	useSearchParams: () => new URLSearchParams(),
}));

mock.module("next/link", () => ({
	default: ({
		href,
		children,
		scroll: _cuon,
		...rest
	}: {
		href: string;
		children: ReactNode;
		scroll?: boolean;
	}) => h("a", { ...rest, href }, children),
}));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => new Proxy({}, { get: () => async () => {} }),
}));

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		onboarding: {
			manDanhMuc: truyVan(
				"onboarding.manDanhMuc",
				theoCheDo(
					"onboarding.manDanhMuc",
					() => (canh.danhMucRong ? "co" : canh.danhMuc),
					() => ({ trangThai: "ST-danhmuc-empty" }),
				),
			),
			listTemplates: truyVan(
				"onboarding.listTemplates",
				theoCheDo(
					"onboarding.listTemplates",
					() => (canh.khuonLoi ? "loi" : "co"),
					() => canh.khuon,
				),
			),
			nguoiNhanViec: co("onboarding.nguoiNhanViec", () => []),
			createFromTemplate: co("onboarding.createFromTemplate", () => null),
			bangCot: truyVan(
				"onboarding.bangCot",
				theoCheDo(
					"onboarding.bangCot",
					() => canh.bangCot,
					() => null,
				),
			),
			listDepartments: co("onboarding.listDepartments", () => []),
		},
		users: {
			list: co("users.list", () => []),
			me: co("users.me", () => ({ id: "u", name: "Lan" })),
		},
		org: {
			access: co("org.access", () => ({ canManage: canh.quyenToChuc })),
			tree: co("org.tree", () => ({ boPhan: [], chuaXep: [] })),
		},
		sso: {
			settings: co("sso.settings", () => ({
				canConfigure: canh.quyenSso,
				callbackBase: "https://x.test/api/auth/sso/callback",
			})),
			register: co("sso.register", () => null),
		},
		campaigns: {
			byId: truyVan(
				"campaigns.byId",
				theoCheDo(
					"campaigns.byId",
					() => canh.chienDich,
					() => CHIEN_DICH,
				),
			),
			members: truyVan(
				"campaigns.members",
				theoCheDo(
					"campaigns.members",
					() => "treo",
					() => null,
				),
			),
			start: co("campaigns.start", () => null),
			finish: co("campaigns.finish", () => null),
			repoint: co("campaigns.repoint", () => null),
			touch: co("campaigns.touch", () => null),
		},
		giaiDoan: {
			list: co("giaiDoan.list", () => ({
				stages: [],
				canManage: false,
				tran: 50,
			})),
		},
		savedViews: {
			list: co("savedViews.list", () => [{ id: "sv-1", name: "Đối tác mới" }]),
		},
		taiLieuNguon: {
			trangThai: truyVan(
				"taiLieuNguon.trangThai",
				theoCheDo(
					"taiLieuNguon.trangThai",
					() => (canh.nguon === "loi" ? "loi" : "co"),
					() => ({ bat: canh.nguon === "bat" }),
				),
			),
		},
	}),
}));

const {
	PageShellActions,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellNote,
	PageShellTitle,
} = await import("@/components/page-shell");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { DongNguonTat, HanhDongTaiLieu } = await import(
	"@/app/(app)/[slug]/tai-lieu/dau-trang-tai-lieu"
);
const { taiLieuMessages } = await import("@/lib/messages/tai-lieu");
const { LoiXem } = await import("@/app/(app)/[slug]/okr/toan-canh/toan-canh");
const { LoiTai } = await import("@/app/(app)/[slug]/tai-lieu/loi-tai");
const { Loi } = await import("@/app/(app)/[slug]/okr/trang-thai-okr");
const { DanhMucTable } = await import(
	"@/app/(app)/[slug]/onboarding/danh-muc-table"
);
const { CampaignDetail } = await import(
	"@/app/(app)/[slug]/campaigns/[campaignId]/campaign-detail"
);
const { messages: uiMessages } = await import("@crm/ui/lib/messages");
const { campaignMessages } = await import("@/lib/messages/campaigns");

const THU_LAI = uiMessages("vi").karaKhung.thuLai;
const { DanhMucHanhDong, DongKhoaKeHoach } = await import(
	"@/app/(app)/[slug]/onboarding/tao-ke-hoach"
);
const { DongChiDoc, HanhDongToChuc } = await import(
	"@/app/(app)/[slug]/settings/organization/hanh-dong-dau-trang"
);
const { AddSsoProviderSheet, DongKhoaSso } = await import(
	"@/app/(app)/[slug]/settings/sso/add-sso-provider-sheet"
);
const { LyDoGiaiDoan } = await import(
	"@/app/(app)/[slug]/settings/giai-doan/giai-doan-settings"
);
const { CaiDatBreadcrumb } = await import("@/components/cai-dat-breadcrumb");
const { VungTaiLoi } = await import("@crm/ui/components/vung-tai-loi");
const { settingsMessages } = await import("@/lib/messages/settings");
const { onboardingMessages } = await import("@/lib/messages/onboarding");
const { toChucMessages } = await import("@/lib/messages/to-chuc");
const { ssoMessages } = await import("@/lib/messages/settings-sso");
const OB = onboardingMessages("vi");
const TC = toChucMessages("vi");
const SSO = ssoMessages("vi");
const CD = campaignMessages("vi");
const GD = settingsMessages("vi").giaiDoan;

const TL = taiLieuMessages("vi");

let root: Root | null = null;
let khach: QueryClient | null = null;

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
	canh.goi = {};
	canh.xong = {};
	khach = null;
});

function ve(cay: ReactElement, thamSo = ""): HTMLElement {
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	khach = client;
	act(() =>
		root?.render(
			<NuqsTestingAdapter hasMemory searchParams={thamSo}>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">{cay}</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		),
	);
	return o;
}

async function cho(dieu: () => boolean, moTa: string, luot = 150) {
	for (let i = 0; i < luot; i += 1) {
		if (dieu()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(`khong toi: ${moTa}`);
}

function phai(dieu: boolean, thongDiep: string) {
	if (!dieu) throw new Error(thongDiep);
}

function truoc(a: Element | null, b: Element | null): boolean {
	if (!a || !b) return false;
	return Boolean(
		a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING,
	);
}

function lop(el: Element | null): string[] {
	return (el?.getAttribute("class") ?? "").split(/\s+/);
}

function nutTen(goc: ParentNode, ten: string): HTMLButtonElement | null {
	return (
		[...goc.querySelectorAll<HTMLButtonElement>("button")].find(
			(b) => b.textContent?.trim() === ten,
		) ?? null
	);
}

function moTaCua(el: Element | null): Element | null {
	const id = el?.getAttribute("aria-describedby");
	return id ? document.getElementById(id) : null;
}

describe("dau-trang", () => {
	test("thu tu tieu de, mo ta, dong ly do, nut; lop thu tu theo kho", () => {
		const o = ve(
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>Tiêu đề</PageShellTitle>
					<PageShellDescription>Mô tả</PageShellDescription>
					<PageShellNote id="ly-do-x">Vì sao nút tắt</PageShellNote>
				</PageShellHeading>
				<PageShellActions>
					<button type="button">Phụ</button>
					<button type="button" disabled aria-describedby="ly-do-x">
						Chính
					</button>
				</PageShellActions>
			</PageShellHeader>,
		);
		const tieuDe = o.querySelector('[data-slot="page-shell-title"]');
		const moTa = o.querySelector('[data-slot="page-shell-description"]');
		const ghiChu = o.querySelector('[data-slot="page-shell-note"]');
		const nut = o.querySelector('[data-slot="page-shell-actions"]');
		phai(truoc(tieuDe, moTa), "kmc-dau-trang: tieu de khong dung truoc mo ta");
		phai(truoc(moTa, ghiChu), "kmc-dau-trang: dong ly do dung truoc mo ta");
		phai(truoc(ghiChu, nut), "kmc-dau-trang: nut dung truoc dong ly do");
		const lopMoTa = lop(moTa);
		phai(
			lopMoTa.includes("md:order-last") && !lopMoTa.includes("order-last"),
			"kmc-dau-trang: mo ta dung sau nut duoi md",
		);
		phai(
			lopMoTa.includes("basis-full"),
			"kmc-dau-trang: mo ta chen hang nut o 1280",
		);
		phai(
			lop(nut).some((l) => /^order-\d$/.test(l)) &&
				lop(nut).includes("md:order-none"),
			"kmc-dau-trang: nut khong xuong duoi mo ta duoi md",
		);
		expect(moTaCua(o.querySelector("button[disabled]"))?.textContent).toBe(
			"Vì sao nút tắt",
		);
	});
});

function DauTrangTaiLieu() {
	return (
		<PageShellHeader>
			<PageShellHeading>
				<PageShellTitle>{TL.tieuDe}</PageShellTitle>
				<PageShellDescription>{TL.moTa}</PageShellDescription>
				<DongNguonTat />
			</PageShellHeading>
			<PageShellActions>
				<HanhDongTaiLieu
					loai={null}
					luaChon={{ toiId: "u", chuTrang: [], donVi: [], trangDangDung: [] }}
					page={1}
					tab="trang"
				/>
			</PageShellActions>
		</PageShellHeader>
	);
}

describe("tai-lieu", () => {
	async function moVoi(nguon: typeof canh.nguon) {
		canh.nguon = nguon;
		const o = ve(<DauTrangTaiLieu />);
		await cho(
			() => (canh.goi["taiLieuNguon.trangThai"] ?? 0) > 0,
			"doc trang thai nguon",
		);
		return o;
	}

	test("nguon tat: dong duoi tieu de, ngoai khoi nut, nut tro toi dong", async () => {
		const o = await moVoi("tat");
		await cho(() => o.querySelector("[data-nguon-tat]") !== null, "dong tat");
		const dong = o.querySelector("[data-nguon-tat]");
		phai(
			dong?.closest('[data-slot="page-shell-header"]') !== null,
			"kmc-tai-lieu: dong nguon tat ngoai dau trang",
		);
		phai(
			dong?.closest('[data-slot="page-shell-actions"]') === null,
			"kmc-tai-lieu: dong nguon tat nam trong actions",
		);
		expect(dong?.textContent).toBe(TL.nguon.tat);
		const nut = nutTen(o, TL.nguon.nutTai);
		expect(nut?.disabled).toBe(true);
		expect(moTaCua(nut)).toBe(dong);
	});

	test("khong doc duoc trang thai: nut tat kem dong noi dung that", async () => {
		const o = await moVoi("loi");
		await cho(
			() => o.querySelector("[data-nguon-khong-doc]") !== null,
			"dong khong doc",
		);
		const dong = o.querySelector("[data-nguon-khong-doc]");
		expect(dong?.textContent).toBe(TL.nguon.khongDocDuoc);
		expect(dong?.textContent).not.toBe(TL.nguon.tat);
		phai(
			dong?.closest('[data-slot="page-shell-actions"]') === null,
			"kmc-tai-lieu: dong nguon tat nam trong actions",
		);
		const nut = nutTen(o, TL.nguon.nutTai);
		expect(nut?.disabled).toBe(true);
		expect(moTaCua(nut)).toBe(dong);
	});

	test("doi chung: da bat thi nut bat, khong dong nao", async () => {
		const o = await moVoi("bat");
		await cho(() => nutTen(o, TL.nguon.nutTai)?.disabled === false, "nut bat");
		expect(o.querySelector('[data-slot="page-shell-note"]')).toBeNull();
		expect(
			nutTen(o, TL.nguon.nutTai)?.getAttribute("aria-describedby"),
		).toBeNull();
	});
});

function kiemKhungLoi(o: HTMLElement, ma: string) {
	const khung = o.querySelector(`[data-vung-tai-loi][data-trang-thai="${ma}"]`);
	phai(khung !== null, `kmc-loi: ${ma} mat data-trang-thai`);
	phai(
		(khung?.querySelector('[data-slot="empty-title"]')?.textContent ?? "") !==
			"",
		`kmc-loi: ${ma} thieu tieu de`,
	);
	phai(
		(khung?.querySelector('[data-slot="empty-description"]')?.textContent ??
			"") !== "",
		`kmc-loi: ${ma} thieu cau mo ta`,
	);
	const nut = khung ? nutTen(khung, THU_LAI) : null;
	phai(nut !== null, `kmc-loi: ${ma} thieu nut Thử lại`);
	return nut as HTMLButtonElement;
}

describe("loi", () => {
	test("ba khung truyen thang: ma giu nguyen, tieu de, cau, Thử lại goi mot lan", async () => {
		const ca: [ReactElement, string, () => number][] = [];
		let goiXem = 0;
		let goiTai = 0;
		let goiOkr = 0;
		ca.push([
			<LoiXem
				cau="Không đọc được toàn cảnh."
				key="x"
				thuLai={() => {
					goiXem += 1;
				}}
				trangThai="ST-toancanh-loi"
			/>,
			"ST-toancanh-loi",
			() => goiXem,
		]);
		ca.push([
			<LoiTai
				key="t"
				m={TL}
				thuLai={() => {
					goiTai += 1;
				}}
			/>,
			"ST-tailieu-loi",
			() => goiTai,
		]);
		ca.push([
			<Loi
				key="o"
				thuLai={() => {
					goiOkr += 1;
				}}
			/>,
			"ST-donvi-loi",
			() => goiOkr,
		]);
		for (const [cay, ma, dem] of ca) {
			const o = ve(cay);
			const nut = kiemKhungLoi(o, ma);
			await act(async () => nut.click());
			expect(`${ma}:${dem()}`).toBe(`${ma}:1`);
			act(() => root?.unmount());
			root = null;
		}
		expect(ca.length).toBe(3);
	});

	test("danh muc Onboarding loi: VungTaiLoi, Thử lại goi lai truy van", async () => {
		canh.danhMuc = "loi";
		const o = ve(<DanhMucTable />);
		await cho(
			() => o.querySelector('[data-trang-thai="ST-danhmuc-loi"]') !== null,
			"khung loi danh muc",
		);
		const truocBam = canh.goi["onboarding.manDanhMuc"] ?? 0;
		const nut = kiemKhungLoi(o, "ST-danhmuc-loi");
		await act(async () => nut.click());
		await cho(
			() => (canh.goi["onboarding.manDanhMuc"] ?? 0) === truocBam + 1,
			"goi lai danh muc",
		);
	});

	test("bang cot Onboarding loi: VungTaiLoi, Thử lại goi lai truy van", async () => {
		canh.danhMuc = "treo";
		canh.bangCot = "loi";
		const o = ve(<DanhMucTable />, "cachXem=bang-cot");
		await cho(
			() => o.querySelector('[data-trang-thai="ST-bangcot-loi"]') !== null,
			"khung loi bang cot",
		);
		const truocBam = canh.goi["onboarding.bangCot"] ?? 0;
		const nut = kiemKhungLoi(o, "ST-bangcot-loi");
		await act(async () => nut.click());
		await cho(
			() => (canh.goi["onboarding.bangCot"] ?? 0) === truocBam + 1,
			"goi lai bang cot",
		);
		canh.danhMuc = "loi";
	});

	test("chieu do: khung thieu ma thi bai kiem bat", () => {
		const o = ve(<div data-vung-tai-loi="" />);
		expect(() => kiemKhungLoi(o, "ST-danhmuc-loi")).toThrow(
			"kmc-loi: ST-danhmuc-loi mat data-trang-thai",
		);
	});
});

const DUONG_DAN = (
	<CaiDatBreadcrumb cap={[{ nhan: CD.title, href: "/ws/campaigns" }]} />
);

function kiemDuongDan(o: HTMLElement) {
	const dau = o.querySelectorAll('[data-slot="page-shell-header"]');
	const lienKet = dau[0]?.querySelector('a[href="/ws/campaigns"]');
	phai(
		dau.length === 1 && lienKet?.textContent?.trim() === CD.title,
		"kmc-chi-tiet: dau trang chien dich mat breadcrumb",
	);
}

describe("chi-tiet", () => {
	test("dang tai: khung tong-quan co hang tieu de, khong vong quay", async () => {
		canh.chienDich = "treo";
		const o = ve(<CampaignDetail duongDan={DUONG_DAN} id="cd-1" />);
		await cho(() => (canh.goi["campaigns.byId"] ?? 0) > 0, "doc chien dich");
		phai(
			o.querySelector(
				'[data-khung-xuong="tong-quan"] [data-khung-hang="tieu-de"]',
			) !== null,
			"kmc-chi-tiet: dang tai khong co khung tong-quan co tieu de",
		);
		expect(o.querySelector('[data-slot="spinner"]')).toBeNull();
		kiemDuongDan(o);
	});

	test("co du lieu: tieu de la ten chien dich, breadcrumb van dung", async () => {
		canh.chienDich = "co";
		const o = ve(<CampaignDetail duongDan={DUONG_DAN} id="cd-1" />);
		await cho(
			() => o.querySelector('[data-slot="page-shell-title"]') !== null,
			"tieu de chien dich",
		);
		expect(o.querySelector('[data-slot="page-shell-title"]')?.textContent).toBe(
			CHIEN_DICH.name,
		);
		kiemDuongDan(o);
	});

	test("loi: VungTaiLoi va breadcrumb, Thử lại goi lai", async () => {
		canh.chienDich = "loi";
		const o = ve(<CampaignDetail duongDan={DUONG_DAN} id="cd-1" />);
		await cho(
			() => o.querySelector("[data-vung-tai-loi]") !== null,
			"khung loi chien dich",
		);
		phai(
			o.querySelector("[data-khung-xuong]") === null,
			"kmc-chi-tiet: loi van hien khung xuong",
		);
		kiemDuongDan(o);
		const nut = kiemKhungLoi(o, "ST-chiendich-loi");
		expect(o.textContent).toContain(CD.detail.loadErrorTitle);
		const truocBam = canh.goi["campaigns.byId"] ?? 0;
		await act(async () => nut.click());
		await cho(
			() => (canh.goi["campaigns.byId"] ?? 0) === truocBam + 1,
			"goi lai chien dich",
		);
	});

	test("chieu do: khong truyen breadcrumb thi bai kiem bat", async () => {
		canh.chienDich = "loi";
		const o = ve(<CampaignDetail id="cd-1" />);
		await cho(
			() => o.querySelector("[data-vung-tai-loi]") !== null,
			"khung loi chien dich",
		);
		expect(() => kiemDuongDan(o)).toThrow(
			"kmc-chi-tiet: dau trang chien dich mat breadcrumb",
		);
	});
});

async function lamMoiLoi(o: HTMLElement) {
	await cho(
		() =>
			o.querySelector('[data-slot="page-shell-title"]')?.textContent ===
			CHIEN_DICH.name,
		"tieu de chien dich",
	);
	canh.chienDich = "loi";
	await act(async () => {
		await khach?.refetchQueries({ queryKey: ["campaigns.byId"] });
	});
	await cho(
		() =>
			khach?.getQueryCache().findAll({ queryKey: ["campaigns.byId"] })[0]?.state
				.status === "error",
		"lam moi loi",
	);
	phai(
		o.querySelector('[data-slot="page-shell-title"]')?.textContent ===
			CHIEN_DICH.name && o.querySelector("[data-vung-tai-loi]") === null,
		"kmc-lam-moi: lam moi loi thay trang dang xem bang khung loi",
	);
}

function ThayKhiLoi() {
	const q = useQuery({
		queryKey: ["campaigns.byId", { id: "cd-1" }],
		queryFn: theoCheDo(
			"campaigns.byId",
			() => canh.chienDich,
			() => CHIEN_DICH,
		),
	});
	if (q.isError) {
		return (
			<VungTaiLoi
				moTa={CD.detail.loadErrorBody}
				onThuLai={() => q.refetch()}
				tieuDe={CD.detail.loadErrorTitle}
			/>
		);
	}
	if (!q.data) return null;
	return (
		<PageShellHeader>
			<PageShellHeading>
				<PageShellTitle>{q.data.name}</PageShellTitle>
			</PageShellHeading>
		</PageShellHeader>
	);
}

describe("lam-moi", () => {
	test("lam moi nen loi khi da co du lieu: giu trang dang xem", async () => {
		canh.chienDich = "co";
		const o = ve(<CampaignDetail duongDan={DUONG_DAN} id="cd-1" />);
		await lamMoiLoi(o);
		kiemDuongDan(o);
	});

	test("chieu do: isError dat truoc nhanh co du lieu thi bai kiem bat", async () => {
		canh.chienDich = "co";
		const o = ve(<ThayKhiLoi />);
		await expect(lamMoiLoi(o)).rejects.toThrow(
			"kmc-lam-moi: lam moi loi thay trang dang xem bang khung loi",
		);
	});
});

function DauTrangThu({
	ghiChu,
	hanhDong,
}: {
	ghiChu: ReactNode;
	hanhDong: ReactNode;
}) {
	return (
		<PageShellHeader>
			<PageShellHeading>
				<PageShellTitle>Màn</PageShellTitle>
				<PageShellDescription>Mô tả</PageShellDescription>
				{ghiChu}
			</PageShellHeading>
			<PageShellActions>{hanhDong}</PageShellActions>
		</PageShellHeader>
	);
}

const TRUY_VAN_KHOA = {
	onboarding: "onboarding.listTemplates",
	"to-chuc": "org.access",
	sso: "sso.settings",
} as const;

async function choTruyVan(man: string) {
	const khoa = Object.entries(TRUY_VAN_KHOA).find(([m]) => m === man)?.[1];
	if (!khoa) return;
	await cho(() => (canh.xong[khoa] ?? 0) > 0, `${man} truy van`, 8).catch(
		() => {
			throw new Error(`kmc-khoa: ${man} chua doc xong khuon`);
		},
	);
	await act(async () => {
		await new Promise((r) => setTimeout(r, 0));
	});
}

async function kiemKhoa(
	o: HTMLElement,
	tenNut: string,
	khoa: boolean,
	man: string,
) {
	await choTruyVan(man);
	await cho(() => nutTen(o, tenNut) !== null, `nut ${tenNut}`);
	await cho(
		() => (nutTen(o, tenNut)?.disabled ?? !khoa) === khoa,
		`${man} nut ${khoa ? "tat" : "bat"}`,
	);
	await cho(
		() => !khoa || o.querySelector('[data-slot="page-shell-note"]') !== null,
		`${man} dong ly do`,
		20,
	).catch(() => {});
	const nut = nutTen(o, tenNut);
	const dong = o.querySelector('[data-slot="page-shell-note"]');
	if (!khoa) {
		expect(
			`${man}:${dong === null}:${nut?.getAttribute("aria-describedby")}`,
		).toBe(`${man}:true:null`);
		return;
	}
	phai(dong !== null, `kmc-khoa: ${man} nut tat khong ly do`);
	phai(
		dong?.closest('[data-slot="page-shell-header"]') !== null &&
			dong?.closest('[data-slot="page-shell-actions"]') === null,
		`kmc-khoa: ${man} dong ly do khong nam duoi tieu de`,
	);
	phai(moTaCua(nut) === dong, `kmc-khoa: ${man} nut khong tro ly do`);
}

async function kiemGiaiDoan(o: HTMLElement) {
	await cho(
		() => o.textContent?.includes(GD.khongQuyen) ?? false,
		"giai doan ly do",
	);
	const dau = o.querySelector('[data-slot="page-shell-header"]');
	const ghiChu = dau?.querySelector('[data-slot="page-shell-note"]');
	phai(
		dau?.querySelectorAll('[data-slot="page-shell-description"]').length ===
			1 && ghiChu?.textContent === GD.khongQuyen,
		"kmc-khoa: giai-doan ly do la mo ta thu hai",
	);
}

describe("khoa", () => {
	test("onboarding chua co khuon: Kế hoạch mới tat, dong ly do co lien ket Cai dat › Khuon", async () => {
		canh.khuon = [];
		const o = ve(
			<DauTrangThu
				ghiChu={<DongKhoaKeHoach />}
				hanhDong={<DanhMucHanhDong />}
			/>,
		);
		await kiemKhoa(o, OB.tao.keHoach.toolbar, true, "onboarding");
		const lienKet = o.querySelector('[data-slot="page-shell-note"] a');
		expect(lienKet?.getAttribute("href")).toBe("/ws/settings/onboarding");
	});

	test("onboarding co mot khuon: nut bat, khong dong ly do", async () => {
		canh.khuon = [{ id: "k1", name: "Sàn môi giới" }];
		const o = ve(
			<DauTrangThu
				ghiChu={<DongKhoaKeHoach />}
				hanhDong={<DanhMucHanhDong />}
			/>,
		);
		await kiemKhoa(o, OB.tao.keHoach.toolbar, false, "onboarding");
	});

	test("onboarding khung trong: chi mot nut to, nut khung trong la outline", async () => {
		canh.khuon = [{ id: "k1", name: "Sàn môi giới" }];
		canh.danhMucRong = true;
		try {
			const o = ve(
				<>
					<DauTrangThu
						ghiChu={<DongKhoaKeHoach />}
						hanhDong={<DanhMucHanhDong />}
					/>
					<DanhMucTable />
				</>,
			);
			await cho(
				() => nutTen(o, OB.empty.noPlan.action) !== null,
				"nut khung trong",
			);
			phai(
				nutTen(o, OB.empty.noPlan.action)?.getAttribute("data-variant") ===
					"outline",
				"kmc-khoa: onboarding hai nut to",
			);
			expect(o.querySelectorAll('[data-variant="default"]').length).toBe(1);
		} finally {
			canh.danhMucRong = false;
		}
	});

	for (const [man, quyen] of [
		["to-chuc", false],
		["to-chuc", true],
		["sso", false],
		["sso", true],
	] as const) {
		test(`${man} ${quyen ? "co quyen" : "khong quyen"}`, async () => {
			canh.quyenToChuc = quyen;
			canh.quyenSso = quyen;
			const o =
				man === "to-chuc"
					? ve(
							<DauTrangThu
								ghiChu={<DongChiDoc />}
								hanhDong={<HanhDongToChuc />}
							/>,
						)
					: ve(
							<DauTrangThu
								ghiChu={<DongKhoaSso />}
								hanhDong={<AddSsoProviderSheet />}
							/>,
						);
			await kiemKhoa(
				o,
				man === "to-chuc" ? TC.themBoPhan : SSO.them.nut,
				!quyen,
				man,
			);
		});
	}

	test("giai doan khong quyen: ly do la dong ghi chu, mot cau mo ta", async () => {
		const o = ve(<DauTrangThu ghiChu={<LyDoGiaiDoan />} hanhDong={null} />);
		await kiemGiaiDoan(o);
	});

	test("chieu do: giai doan dung mo ta thu hai thi bai kiem bat", async () => {
		const o = ve(
			<DauTrangThu
				ghiChu={<PageShellDescription>{GD.khongQuyen}</PageShellDescription>}
				hanhDong={null}
			/>,
		);
		await expect(kiemGiaiDoan(o)).rejects.toThrow(
			"kmc-khoa: giai-doan ly do la mo ta thu hai",
		);
	});

	test("chieu do: o doi chung voi truy van chua xong thi bai kiem bat", async () => {
		canh.khuonLoi = true;
		canh.khuon = [{ id: "k1", name: "Sàn môi giới" }];
		try {
			const o = ve(
				<DauTrangThu
					ghiChu={<DongKhoaKeHoach />}
					hanhDong={<DanhMucHanhDong />}
				/>,
			);
			await expect(
				kiemKhoa(o, OB.tao.keHoach.toolbar, false, "onboarding"),
			).rejects.toThrow("kmc-khoa: onboarding chua doc xong khuon");
		} finally {
			canh.khuonLoi = false;
		}
	});

	test("chieu do: nut tat ma khong dong ly do thi bai kiem bat", async () => {
		const o = ve(
			<DauTrangThu
				ghiChu={null}
				hanhDong={
					<button disabled type="button">
						Chính
					</button>
				}
			/>,
		);
		await expect(kiemKhoa(o, "Chính", true, "gia")).rejects.toThrow(
			"kmc-khoa: gia nut tat khong ly do",
		);
	});
});
