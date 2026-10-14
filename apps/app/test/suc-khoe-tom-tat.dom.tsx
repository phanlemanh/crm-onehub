import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
	MA_BO_CAU,
	type MaBoCau,
	type TroLyTomTatQuanTriOutput,
	troLyTomTatQuanTriOutput,
} from "@crm/validation/okr-tom-tat";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, createElement, type ReactElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

type Json =
	| string
	| number
	| boolean
	| null
	| readonly Json[]
	| { readonly [khoa: string]: Json | undefined };
type DauVao = { readonly [khoa: string]: Json | undefined } | undefined;
type TuyChonGhi = {
	onSuccess?: (kq: Json, vao: DauVao) => void;
	onError?: (e: Error) => void;
};
type LoiGoi = { duong: string; dauVao: DauVao };
type Lay = (vao: DauVao) => unknown;

let daGoi: LoiGoi[] = [];
const duLieu = new Map<string, Lay>();

function dat(duong: string, lay: Lay): void {
	duLieu.set(duong, lay);
}

function thuTuc(duong: string) {
	const doc = async (vao: DauVao): Promise<unknown> => {
		daGoi.push({ duong, dauVao: vao });
		const lay = duLieu.get(duong);
		return lay ? lay(vao) : null;
	};
	return {
		queryKey: (vao?: DauVao) => (vao === undefined ? [duong] : [duong, vao]),
		pathKey: () => [duong],
		queryOptions: (vao?: DauVao) => ({
			queryKey: [duong, vao ?? null],
			queryFn: async () => doc(vao),
		}),
		mutationOptions: (chon?: TuyChonGhi) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async (vao: DauVao) => (await doc(vao)) ?? { ok: true },
		}),
	};
}

const trpcGia = new Proxy(
	{},
	{
		get: (_goc, khong: string) =>
			new Proxy({}, { get: (_g, ten: string) => thuTuc(`${khong}.${ten}`) }),
	},
);

mock.module("@/lib/trpc/client", () => ({ useTRPC: () => trpcGia }));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => new Proxy({}, { get: () => async () => {} }),
}));

mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => children,
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws/okr/toan-canh/suc-khoe",
}));

mock.module("next/link", () => ({
	default: ({
		href,
		children,
		...rest
	}: {
		href: string;
		children: ReactNode;
	}) => createElement("a", { href, ...rest }, children),
}));

const { SucKhoe } = await import(
	"@/app/(app)/[slug]/okr/toan-canh/suc-khoe/suc-khoe"
);
const { TomTatQuanTri } = await import(
	"@/app/(app)/[slug]/okr/toan-canh/suc-khoe/tom-tat-quan-tri"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");

const DUONG_THIET_KE = join(
	import.meta.dir,
	"..",
	"..",
	"..",
	"docs",
	"superpowers",
	"specs",
	"2026-09-30-tro-ly-okr-tom-tat-design.md",
);

function idBangTrangThai(): string[] {
	const chu = readFileSync(DUONG_THIET_KE, "utf8");
	const dau = chu.indexOf("<<<UX-STATE-TABLE");
	const cuoi = chu.indexOf("UX-STATE-TABLE>>>");
	if (dau < 0 || cuoi < dau) throw new Error("khong thay bang UX-STATE-TABLE");
	return [...chu.slice(dau, cuoi).matchAll(/^\|\s*(ST-[a-z0-9-]+)\s*\|/gm)]
		.map((k) => k[1] ?? "")
		.filter((id) => id.startsWith("ST-suckhoe-tomtat-"));
}

const NHAN_MA_BO = {
	"nguon-ngoai-goi": "Dẫn nguồn ngoài phòng",
	"so-lech": "Số lệch với nguồn",
	"sai-chieu": "Sai chiều tăng giảm",
	"noi-ve-nguoi": "Nêu tên người",
	"tu-cam": "Dùng từ cấm",
	"trung-cau": "Trùng câu trước",
} satisfies Record<MaBoCau, string>;

function nhanMaBo(ma: MaBoCau): string {
	const nhan = Object.entries(NHAN_MA_BO).find(([k]) => k === ma)?.[1];
	if (!nhan) throw new Error(`nhan ma bo chua co: ${ma}`);
	return nhan;
}

const NGUON_A = {
	id: "ci-a",
	mat: false,
	ngay: "2026-10-12",
	krTen: "Doanh thu hợp đồng mới đạt 12 tỷ",
} as const;
const NGUON_B = {
	id: "ci-b",
	mat: false,
	ngay: "2026-10-13",
	krTen: "Thêm 40 khách hàng doanh nghiệp",
} as const;
const NGUON_MAT = { id: "ci-mat", mat: true } as const;

const DONG_NGUON = {
	"ci-a": "Cập nhật 12/10 · Doanh thu hợp đồng mới đạt 12 tỷ",
	"ci-b": "Cập nhật 13/10 · Thêm 40 khách hàng doanh nghiệp",
	"ci-mat": "lần cập nhật không còn trong kho",
} satisfies Record<string, string>;

function nguonHien(n: { id: string; mat: boolean }): string {
	const ky = Object.entries(DONG_NGUON).find(([k]) => k === n.id)?.[1];
	if (!ky) throw new Error(`nguon chua co ky vong: ${n.id}`);
	return ky;
}

function kiemNguon(
	o: Element,
	nguon: readonly { id: string; mat: boolean; krTen?: string }[],
): void {
	const dong = o.querySelector("[data-nguon-cau]");
	expect(chu(dong)).toBe(`Nguồn: ${nguon.map(nguonHien).join("; ")}`);
	for (const n of nguon) {
		const phan = dong?.querySelector(`[data-nguon="${n.id}"]`);
		if (!phan) throw new Error(`thieu nguon ${n.id}`);
		const ten = phan.querySelector('[translate="no"]');
		if (n.mat) expect(ten).toBeNull();
		else expect(chu(ten)).toBe(n.krTen ?? "");
	}
}

const CAU_CON = [
	{ vanBan: "Doanh thu hợp đồng mới lên 7,5 tỷ.", nguon: [NGUON_A] },
	{ vanBan: "Hai KR giữ mức tự tin vừa.", nguon: [NGUON_A, NGUON_B] },
];

const CAU_BO = MA_BO_CAU.map((ma, i) => ({
	vanBan: `Câu bị bỏ thứ ${i + 1} của phòng Kinh doanh.`,
	nguon: ma === "nguon-ngoai-goi" ? [NGUON_MAT] : [NGUON_B],
	maBo: ma,
}));

const RONG_BAN = {
	tomTatId: null,
	soCau: 0,
	soCauBo: 0,
	huuIch: 0,
	khongHuuIch: 0,
	cau: [],
	bo: [],
};

const PHONG = [
	{
		departmentId: "pb-a",
		ten: "Kinh doanh miền Bắc",
		nac: "bat",
		trangThai: "hien",
		tomTatId: "tt-a",
		soCau: 2,
		soCauBo: 0,
		huuIch: 3,
		khongHuuIch: 1,
		cau: CAU_CON,
		bo: [],
	},
	{
		departmentId: "pb-b",
		ten: "Chăm sóc khách hàng",
		nac: "an",
		trangThai: "hien",
		tomTatId: "tt-b",
		soCau: 2,
		soCauBo: 0,
		huuIch: 0,
		khongHuuIch: 0,
		cau: CAU_CON,
		bo: [],
	},
	{
		departmentId: "pb-c",
		ten: "Kinh doanh miền Nam",
		nac: "bat",
		trangThai: "can-xem",
		tomTatId: "tt-c",
		soCau: CAU_CON.length,
		soCauBo: CAU_BO.length,
		huuIch: 0,
		khongHuuIch: 0,
		cau: CAU_CON,
		bo: CAU_BO,
	},
	{
		departmentId: "pb-d",
		ten: "Vận hành",
		nac: "an",
		trangThai: "khong-lam-duoc",
		...RONG_BAN,
	},
	{
		departmentId: "pb-e",
		ten: "Tài chính",
		nac: "bat",
		trangThai: "dang-soan",
		...RONG_BAN,
	},
	{
		departmentId: "pb-f",
		ten: "Nhân sự",
		nac: "an",
		trangThai: "chua-cap-nhat",
		...RONG_BAN,
	},
];

const NHAN_TRANG_THAI = {
	"pb-a": "Đã hiện",
	"pb-b": "Qua bộ kiểm, chỉ quản trị thấy",
	"pb-c": "Giữ lại",
	"pb-d": "Không làm được",
	"pb-e": "Đang soạn",
	"pb-f": "Chưa có cập nhật",
} satisfies Record<string, string>;

function quanTri(phong: unknown[]): TroLyTomTatQuanTriOutput {
	return troLyTomTatQuanTriOutput.parse({ tuan: "2026-10-12", phong });
}

let hienTai: () => unknown = () => quanTri(PHONG);

beforeEach(() => {
	daGoi = [];
	duLieu.clear();
	hienTai = () => quanTri(PHONG);
	dat("okr.troLyTomTatQuanTri", () => hienTai());
	dat("okr.cycles", () => ({
		cycles: [{ id: "q4", name: "Quý 4/2026", kind: "quy" }],
		currentId: "q4",
	}));
	dat("okr.access", () => ({
		canManageProgram: true,
		headOf: { divisions: [], departments: [] },
	}));
	dat("okr.sucKhoe", () => ({
		tongQuan: {
			tongKr: 0,
			chuaKhoiDiem: 0,
			chuaNoiKenh: 0,
			dungTuan: 0,
			krIm: 0,
		},
		hang: [],
	}));
	dat("okr.moCoi", () => []);
});

let dangMo: { o: HTMLElement; root: Root }[] = [];

afterEach(async () => {
	for (const s of dangMo) {
		await act(async () => s.root.unmount());
		s.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

async function nhip(lan = 1): Promise<void> {
	for (let i = 0; i < lan; i += 1) {
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
}

async function mo(man: ReactElement): Promise<void> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter hasMemory searchParams="">
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	dangMo.push({ o, root });
	await nhip(10);
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 150; vong += 1) {
		if (xong()) return;
		await nhip();
	}
	throw new Error(
		`khong toi: ${moTa} — ${document.body.textContent?.slice(0, 600)}`,
	);
}

function chu(o: Element | null | undefined): string {
	return o?.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function trangThai(id: string): HTMLElement | null {
	return document.body.querySelector<HTMLElement>(`[data-trang-thai="${id}"]`);
}

function hang(id: string): HTMLElement {
	const h = document.body.querySelector<HTMLElement>(`[data-phong="${id}"]`);
	if (!h) throw new Error(`khong thay hang ${id}`);
	return h;
}

function goiCua(duong: string): LoiGoi[] {
	return daGoi.filter((g) => g.duong === duong);
}

const CA = {
	"ST-suckhoe-tomtat-co": async () => {
		await mo(<TomTatQuanTri cycleId="q4" />);
		await cho(() => trangThai("ST-suckhoe-tomtat-co") !== null, "bang");
		const khoi = document.body.querySelector('[data-khoi="tom-tat-quan-tri"]');
		expect(chu(khoi?.querySelector('[data-slot="card-title"]'))).toBe(
			"Tóm tắt tuần của Kara",
		);
		expect(
			chu(khoi?.querySelector('[data-slot="card-description"]')),
		).toContain("Tuần 12/10");
		for (const p of PHONG) {
			const h = hang(p.departmentId);
			expect(chu(h)).toContain(p.ten);
			const nac = h.querySelector<HTMLElement>("td.hidden [data-nac]");
			expect(nac?.dataset.nac).toBe(p.nac);
			expect(chu(nac)).toBe(p.nac === "bat" ? "Bật" : "Chế độ ẩn");
			const tt = h.querySelector("td.hidden [data-trang-thai-ban]");
			expect(chu(tt)).toBe(
				Object.entries(NHAN_TRANG_THAI).find(
					([k]) => k === p.departmentId,
				)?.[1] ?? "",
			);
			const coBan = p.tomTatId !== null;
			expect(chu(h.querySelector('[data-cot="cau"]'))).toBe(
				coBan ? String(p.soCau) : "—",
			);
			expect(chu(h.querySelector('[data-cot="bo"]'))).toBe(
				coBan ? String(p.soCauBo) : "—",
			);
			expect(chu(h.querySelector('[data-cot="phan-hoi"]'))).toBe(
				coBan ? `${p.huuIch} / ${p.khongHuuIch}` : "—",
			);
			expect(h.querySelector("[data-mo-ban]") !== null).toBe(coBan);
		}
	},
	"ST-suckhoe-tomtat-rong": async () => {
		hienTai = () => quanTri([]);
		await mo(<TomTatQuanTri cycleId="q4" />);
		await cho(() => trangThai("ST-suckhoe-tomtat-rong") !== null, "rong");
		expect(chu(trangThai("ST-suckhoe-tomtat-rong"))).toContain(
			"Tuần này chưa có tóm tắt nào",
		);
		expect(document.body.querySelector("[data-phong]")).toBeNull();
	},
	"ST-suckhoe-tomtat-ngan": async () => {
		await mo(<TomTatQuanTri cycleId="q4" />);
		await cho(() => trangThai("ST-suckhoe-tomtat-co") !== null, "bang");
		const nut = hang("pb-c").querySelector<HTMLElement>("[data-mo-ban]");
		if (!nut) throw new Error("khong co nut mo ban");
		await act(async () => nut.click());
		await cho(() => trangThai("ST-suckhoe-tomtat-ngan") !== null, "ngan");
		const ngan = trangThai("ST-suckhoe-tomtat-ngan");
		expect(chu(ngan?.querySelector('[data-slot="sheet-title"]'))).toBe(
			"Kinh doanh miền Nam · tuần 12/10",
		);
		expect(chu(ngan?.querySelector('[data-slot="sheet-description"]'))).toBe(
			`Bật · Giữ lại — bỏ ${CAU_BO.length}/${CAU_BO.length + CAU_CON.length} câu`,
		);
		const con = [...(ngan?.querySelectorAll("[data-cau-con-dong]") ?? [])];
		expect(con).toHaveLength(CAU_CON.length);
		CAU_CON.forEach((c, i) => {
			const o = con[i];
			if (!o) throw new Error(`thieu cau con ${i}`);
			expect(chu(o.querySelector('p[translate="no"]'))).toBe(c.vanBan);
			kiemNguon(o, c.nguon);
		});
		const bo = ngan?.querySelector("[data-cau-bo]");
		expect(bo?.querySelectorAll("[data-ma-bo]").length).toBe(MA_BO_CAU.length);
		for (const ma of MA_BO_CAU) {
			const dong = bo?.querySelector(`[data-ma-bo="${ma}"]`);
			if (!dong) throw new Error(`thieu cau bi bo ma ${ma}`);
			expect(chu(dong.querySelector("del"))).toContain("Câu bị bỏ thứ");
			expect(chu(dong.querySelector(`[data-nhan-ma-bo="${ma}"]`))).toBe(
				nhanMaBo(ma),
			);
			const cauBo = CAU_BO.find((c) => c.maBo === ma);
			if (!cauBo) throw new Error(`thieu co dinh ma ${ma}`);
			kiemNguon(dong, cauBo.nguon);
		}
		const tieuDe = [
			...(ngan?.querySelectorAll('section > [data-slot="card-title"]') ?? []),
		];
		expect(tieuDe.map((h) => chu(h))).toEqual([
			`Câu còn lại · ${CAU_CON.length}`,
			`Câu bị bỏ · ${CAU_BO.length}`,
		]);
		for (const h of tieuDe)
			expect(h.closest("section")?.getAttribute("aria-labelledby")).toBe(h.id);
		expect(ngan?.querySelector('[data-slot="sheet-body"]')).not.toBeNull();
	},
} satisfies Record<string, () => Promise<void>>;

describe("trang-thai tu bang UX-STATE-TABLE", () => {
	const ids = idBangTrangThai();
	test("bang co ba trang thai ST-suckhoe-tomtat-*", () => {
		expect(ids.length).toBeGreaterThanOrEqual(3);
	});
	for (const id of ids) {
		test(`trang-thai ${id}`, async () => {
			const ca = Object.entries(CA).find(([k]) => k === id)?.[1];
			if (!ca) throw new Error(`trang thai chua do: ${id}`);
			await ca();
		});
	}
});

describe("chi quan tri chuong trinh", () => {
	test("quan tri thay khoi tren man Suc khoe, goi dung chu ky", async () => {
		await mo(<SucKhoe />);
		await cho(
			() =>
				document.body.querySelector('[data-khoi="tom-tat-quan-tri"]') !== null,
			"khoi quan tri",
		);
		await cho(() => trangThai("ST-suckhoe-tomtat-co") !== null, "bang");
		expect(goiCua("okr.troLyTomTatQuanTri")[0]?.dauVao).toEqual({
			cycleId: "q4",
		});
	});

	const VAI = {
		"thanh-vien": { divisions: [], departments: [] },
		"truong-phong": { divisions: [], departments: ["pb-a"] },
		"truong-bo-phan": { divisions: ["bp-1"], departments: [] },
	};
	for (const [vai, headOf] of Object.entries(VAI)) {
		test(`${vai}: khong co khoi, khong goi troLyTomTatQuanTri`, async () => {
			dat("okr.access", () => ({ canManageProgram: false, headOf }));
			await mo(<SucKhoe />);
			await cho(
				() => trangThai("ST-suckhoe-khongquyen") !== null,
				"khong quyen",
			);
			await nhip(5);
			if (
				goiCua("okr.troLyTomTatQuanTri").length > 0 ||
				document.body.querySelector('[data-khoi="tom-tat-quan-tri"]') !== null
			)
				throw new Error(`quan tri lot: ${vai}`);
		});
	}
});
