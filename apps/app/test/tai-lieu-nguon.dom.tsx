import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	act,
	type ComponentProps,
	createElement as h,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";

type VaoXinCho = { tenTep: string; kichThuoc: number; kieu: string };
type VaoNhan = {
	pathname: string;
	phieu: string;
	tenTep: string;
	dich: unknown;
};
type TuyChonDotBien<V, R> = { onSuccess?: (r: R, v: V) => unknown };

type HangGia = {
	id: string;
	tenTep: string;
	kieu: "docx" | "pdf";
	trangThai:
		| "CHO_DOC"
		| "CHO_SOAN"
		| "DANG_SOAN"
		| "DA_SOAN"
		| "CAN_GO_TAY"
		| "LOI";
	lyDo: string | null;
	taiLuc: Date;
	taiBoi: { id: string; name: string };
	trang: { slug: string; ten: string };
	deXuatId: string | null;
	coTheSoanLai: boolean;
};

const MB = 1024 * 1024;
const PATHNAME = "kho-tai-lieu/nguon/0b6f3c1e-9a4d-4c55-8f0e-2a1b3c4d5e6f";
const URL_PUT = "https://blob.gia/put";
const PHIEU = "1790000000000.phieu-gia";

const goi = {
	xinCho: [] as VaoXinCho[],
	nhan: [] as VaoNhan[],
	soanLai: [] as { id: string }[],
	put: [] as string[],
	den: [] as string[],
};

const canh = {
	bat: true,
	hang: [] as HangGia[],
	ketNhan: { nguonId: "ng-moi", trung: false },
};

function dotBien<V, R>(ten: string, ghi: V[], tra: (v: V) => R) {
	return {
		mutationOptions: (tuy: TuyChonDotBien<V, R> = {}) => ({
			...tuy,
			mutationKey: [ten],
			mutationFn: async (v: V) => {
				ghi.push(v);
				return tra(v);
			},
		}),
	};
}

function truyVan<R>(khoa: string, tra: () => R) {
	return {
		queryKey: () => [khoa],
		queryOptions: () => ({ queryKey: [khoa], queryFn: async () => tra() }),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		taiLieu: {
			list: truyVan("taiLieu.list", () => ({
				rows: [],
				total: 0,
				facetCounts: {
					"quy-dinh": 0,
					"chinh-sach": 0,
					"quy-trinh": 0,
					"bieu-mau": 0,
					"chien-luoc": 0,
				},
			})),
			boLoc: truyVan("taiLieu.boLoc", () => ({ donVi: [], chuTrang: [] })),
			proposals: truyVan("taiLieu.proposals", () => ({
				rows: [],
				choToiDuyet: 0,
			})),
		},
		taiLieuNguon: {
			trangThai: truyVan("taiLieuNguon.trangThai", () => ({ bat: canh.bat })),
			list: truyVan("taiLieuNguon.list", () => ({ rows: canh.hang })),
			xinCho: dotBien("taiLieuNguon.xinCho", goi.xinCho, () => ({
				pathname: PATHNAME,
				url: URL_PUT,
				hetHan: Date.now() + 600_000,
				phieu: PHIEU,
			})),
			nhan: dotBien("taiLieuNguon.nhan", goi.nhan, () => canh.ketNhan),
			soanLai: dotBien("taiLieuNguon.soanLai", goi.soanLai, () => ({
				ok: true as const,
			})),
		},
	}),
}));
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({ taiLieu: async () => {} }),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({
		push: (den: string) => {
			goi.den.push(den);
		},
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
		...props
	}: ComponentProps<"a"> & { children?: ReactNode }) => h("a", props, children),
}));
const khoi =
	(the: string) =>
	({ children }: { children?: ReactNode }) =>
		h(the, null, children);
mock.module("@/components/page-shell", () => ({
	PageShellHeader: khoi("header"),
	PageShellHeading: khoi("div"),
	PageShellTitle: khoi("h1"),
	PageShellDescription: khoi("p"),
	PageShellActions: ({ children }: { children?: ReactNode }) =>
		h("div", { "data-hanh-dong-dau": "" }, children),
	PageShellContent: khoi("div"),
	PageShellNote: ({
		children,
		...props
	}: { children?: ReactNode } & Record<string, unknown>) =>
		h("p", { ...props, "data-dong-ly-do": "" }, children),
}));

const fetchGoc = globalThis.fetch;
globalThis.fetch = (async (vao: RequestInfo | URL) => {
	goi.put.push(String(vao));
	return new Response(null, { status: 200 });
}) as typeof fetch;

const { DanhSach } = await import("@/app/(app)/[slug]/tai-lieu/danh-sach");
const { DongNguonTat, HanhDongTaiLieu } = await import(
	"@/app/(app)/[slug]/tai-lieu/dau-trang-tai-lieu"
);
const { PageShellActions } = await import("@/components/page-shell");
const { NutTaiNguon } = await import(
	"@/app/(app)/[slug]/tai-lieu/hop-tai-nguon"
);
const { BangNguon } = await import("@/app/(app)/[slug]/tai-lieu/bang-nguon");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");

type LuaChonTai = ComponentProps<typeof NutTaiNguon>["luaChon"];

const LUA_CHON: LuaChonTai = {
	toiId: "u-1",
	chuTrang: [
		{ id: "u-1", ten: "Nguyễn Thu Hà" },
		{ id: "u-2", ten: "Trần An" },
	],
	donVi: [{ id: "pb-1", ten: "Phòng Đối tác" }],
	trangDangDung: [{ id: "quy-dinh-hoa-hong", ten: "Quy định hoa hồng" }],
};

const CAU_SAI_LOAI = "Chỉ nhận Word (.docx) hoặc PDF, tới 20 MB";
const CAU_TAT = "Chưa bật lưu tệp nguồn — nhờ quản trị cấu hình";
const LY_DO_LOI = "Chưa có trang Quy tắc viết đã duyệt";
const TEN_TRANG = "Quy định hoa hồng đối tác 2026";

const NGUOI_TAI = { id: "u-1", name: "Nguyễn Thu Hà" };
const TRANG_DICH = { slug: "quy-dinh-hoa-hong", ten: "Quy định hoa hồng" };
const LUC = new Date("2026-09-28T03:00:00.000Z");

const HANG_LOI: HangGia = {
	id: "ng-loi",
	tenTep: "quyet-dinh-18-2026.docx",
	kieu: "docx",
	trangThai: "LOI",
	lyDo: LY_DO_LOI,
	taiLuc: LUC,
	taiBoi: NGUOI_TAI,
	trang: TRANG_DICH,
	deXuatId: null,
	coTheSoanLai: true,
};
const HANG_GO_TAY: HangGia = {
	...HANG_LOI,
	id: "ng-go-tay",
	tenTep: "quy-che-cu-ban-quet.pdf",
	kieu: "pdf",
	trangThai: "CAN_GO_TAY",
	lyDo: null,
	coTheSoanLai: false,
};
const HANG_DANG_SOAN: HangGia = {
	...HANG_LOI,
	id: "ng-dang-soan",
	tenTep: "bien-ban-hop-24-09.docx",
	trangThai: "DANG_SOAN",
	lyDo: null,
	coTheSoanLai: false,
};
const HANG_DA_SOAN: HangGia = {
	...HANG_LOI,
	id: "ng-da-soan",
	tenTep: "quyet-dinh-12-2026.pdf",
	kieu: "pdf",
	trangThai: "DA_SOAN",
	lyDo: null,
	deXuatId: "dx-9",
	coTheSoanLai: false,
};
const BON_HANG = [HANG_LOI, HANG_GO_TAY, HANG_DANG_SOAN, HANG_DA_SOAN];

let dangMo: Root[] = [];

afterEach(() => {
	for (const root of dangMo) act(() => root.unmount());
	dangMo = [];
	document.body.innerHTML = "";
	goi.xinCho.length = 0;
	goi.nhan.length = 0;
	goi.soanLai.length = 0;
	goi.put.length = 0;
	goi.den.length = 0;
	canh.bat = true;
	canh.hang = [];
	canh.ketNhan = { nguonId: "ng-moi", trung: false };
});

process.on("exit", () => {
	globalThis.fetch = fetchGoc;
});

async function nhip(): Promise<void> {
	await act(async () => {
		await new Promise((r) => setTimeout(r, 0));
	});
}

async function mo(nut: ReactNode): Promise<void> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	dangMo.push(root);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	await act(async () => {
		root.render(
			<QueryClientProvider client={client}>
				<LocaleProvider locale="vi">{nut}</LocaleProvider>
			</QueryClientProvider>,
		);
	});
	for (let i = 0; i < 4; i += 1) await nhip();
}

function ghim(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

function nutTheoChu(chu: string, goc: ParentNode = document.body) {
	return [...goc.querySelectorAll<HTMLButtonElement>("button")].find(
		(b) => b.textContent?.trim() === chu,
	);
}

function nut(chu: string, goc: ParentNode = document.body): HTMLButtonElement {
	const n = nutTheoChu(chu, goc);
	if (!n)
		throw new Error(`khong thay nut ${chu} — ${document.body.textContent}`);
	return n;
}

async function bam(n: HTMLElement): Promise<void> {
	await act(async () => {
		n.click();
	});
	for (let i = 0; i < 4; i += 1) await nhip();
}

function oTep(): HTMLInputElement {
	const o = document.body.querySelector<HTMLInputElement>("input[type='file']");
	if (!o) throw new Error("khong thay o chon tep");
	return o;
}

function oTen(): HTMLInputElement {
	const o = document.body.querySelector<HTMLInputElement>("input[name='ten']");
	if (!o) throw new Error("khong thay o ten trang");
	return o;
}

async function go(o: HTMLInputElement, chu: string): Promise<void> {
	const dat = Object.getOwnPropertyDescriptor(
		HTMLInputElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		dat?.call(o, chu);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
	await nhip();
}

function tep(ten: string, kieu: string, co: number): File {
	const f = new File([new Uint8Array(8)], ten, { type: kieu });
	Object.defineProperty(f, "size", { value: co });
	return f;
}

async function chonTep(f: File): Promise<void> {
	const o = oTep();
	Object.defineProperty(o, "files", { value: [f], configurable: true });
	await act(async () => {
		o.dispatchEvent(new Event("change", { bubbles: true }));
	});
	for (let i = 0; i < 3; i += 1) await nhip();
}

async function moHop(): Promise<void> {
	await mo(<NutTaiNguon luaChon={LUA_CHON} />);
	await bam(nut("Tải nguồn lên"));
}

async function thuTaiLen(): Promise<void> {
	const n = nutTheoChu("Tải lên");
	if (n && !n.disabled) await bam(n);
}

function loiDuoiOTep(): string {
	const o = oTep();
	const ids = (o.getAttribute("aria-describedby") ?? "").split(/\s+/);
	return ids
		.map((id) => document.getElementById(id))
		.filter((e): e is HTMLElement => e?.dataset.slot === "field-error")
		.map((e) => e.textContent ?? "")
		.join(" ");
}

const DOCX =
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document";

describe("tai-loi — hộp tải từ chối tệp sai ở máy khách (E3d)", () => {
	test("tai-loi: tệp .jpg bị từ chối dưới ô chọn tệp, không gọi xinCho, tên trang giữ nguyên", async () => {
		await moHop();
		await go(oTen(), TEN_TRANG);
		await chonTep(tep("anh-chup.jpg", "image/jpeg", 200_000));
		await thuTaiLen();

		ghim(goi.xinCho.length === 0, "goi xinCho voi tep sai loai");
		expect(loiDuoiOTep()).toContain(CAU_SAI_LOAI);
		expect(oTen().value).toBe(TEN_TRANG);
	});

	test("tai-loi: tệp .docx 21 MB bị từ chối cùng câu, không gọi xinCho", async () => {
		await moHop();
		await go(oTen(), TEN_TRANG);
		await chonTep(tep("quy-dinh-lon.docx", DOCX, 21 * MB));
		await thuTaiLen();

		ghim(goi.xinCho.length === 0, "goi xinCho voi tep sai loai");
		expect(loiDuoiOTep()).toContain(CAU_SAI_LOAI);
		expect(oTen().value).toBe(TEN_TRANG);
	});

	test("tai-loi: đối chứng — tệp .docx 1 MB gọi xinCho đúng một lần rồi PUT và nhận", async () => {
		await moHop();
		await go(oTen(), TEN_TRANG);
		await chonTep(tep("quy-dinh.docx", DOCX, MB));
		expect(loiDuoiOTep()).toBe("");
		await bam(nut("Tải lên"));
		for (let i = 0; i < 4; i += 1) await nhip();

		expect(goi.xinCho).toEqual([
			{ tenTep: "quy-dinh.docx", kichThuoc: MB, kieu: "docx" },
		]);
		expect(goi.put).toEqual([URL_PUT]);
		expect(goi.nhan).toEqual([
			{
				pathname: PATHNAME,
				phieu: PHIEU,
				tenTep: "quy-dinh.docx",
				dich: {
					loai: "moi",
					ten: TEN_TRANG,
					loaiTrang: "quy-dinh",
					chuTrangId: "u-1",
					departmentId: null,
				},
			},
		]);
	});
});

describe("nguon-tat — nút tải khoá khi chưa bật lưu tệp (E5d)", () => {
	async function moDanhSach(): Promise<void> {
		await mo(
			<>
				<header data-dau-trang="">
					<DongNguonTat />
					<PageShellActions>
						<HanhDongTaiLieu
							loai={null}
							luaChon={LUA_CHON}
							page={1}
							tab="trang"
						/>
					</PageShellActions>
				</header>
				<DanhSach loai={null} page={1} tab="trang" />
			</>,
		);
	}

	function lienKetTrangMoi(): HTMLAnchorElement {
		const a = document.body.querySelector<HTMLAnchorElement>(
			"[data-hanh-dong-dau] a[href='/ws/tai-lieu/moi']",
		);
		if (!a) throw new Error("khong thay lien ket viet trang moi");
		return a;
	}

	test("nguon-tat: chưa bật thì «Tải nguồn lên» khoá, câu giải thích dưới tiêu đề nút trỏ tới, trang mới vẫn bấm được", async () => {
		canh.bat = false;
		await moDanhSach();

		const n = nut("Tải nguồn lên");
		ghim(n.disabled, "nut tai van mo khi chua bat");
		const dong = document.body.querySelector("[data-dau-trang] [data-dong-ly-do]");
		expect(dong?.textContent).toContain(CAU_TAT);
		expect(dong?.closest("[data-hanh-dong-dau]")).toBeNull();
		const moTa = (n.getAttribute("aria-describedby") ?? "")
			.split(/\s+/)
			.map((id) => document.getElementById(id)?.textContent ?? "")
			.join(" ");
		expect(moTa).toContain(CAU_TAT);

		const a = lienKetTrangMoi();
		expect(a.getAttribute("aria-disabled")).toBeNull();
		expect(a.closest("[disabled], [aria-disabled='true'], [inert]")).toBeNull();
	});

	test("nguon-tat: đối chứng — đã bật thì nút bấm được và không có câu", async () => {
		canh.bat = true;
		await moDanhSach();

		const n = nut("Tải nguồn lên");
		expect(n.disabled).toBe(false);
		expect(document.body.textContent).not.toContain(CAU_TAT);
		await bam(n);
		expect(document.body.textContent).toContain("Kéo tệp vào đây");
	});
});

describe("hang-nguon — tab Nguồn nói trạng thái bằng chữ thường (E10d)", () => {
	function hang(id: string, goc: string): HTMLElement {
		const e = document.body.querySelector<HTMLElement>(
			`${goc} [data-nguon='${id}']`,
		);
		if (!e) throw new Error(`khong thay hang ${id} trong ${goc}`);
		return e;
	}

	const HAI_KHUNG = ["[data-bang-nguon]", "[data-the-nguon]"];

	test("hang-nguon: hàng Chưa soạn được hiện lý do và «Soạn lại» cho người tải", async () => {
		canh.hang = BON_HANG;
		await mo(<BangNguon />);

		for (const goc of HAI_KHUNG) {
			const r = hang(HANG_LOI.id, goc);
			expect(r.textContent).toContain("Chưa soạn được");
			expect(r.textContent).toContain(LY_DO_LOI);
			expect(nutTheoChu("Soạn lại", r)).toBeDefined();
		}
		await bam(nut("Soạn lại", hang(HANG_LOI.id, "[data-bang-nguon]")));
		expect(goi.soanLai).toEqual([{ id: HANG_LOI.id }]);
	});

	test("hang-nguon: cùng hàng với thành viên khác (coTheSoanLai false) không có «Soạn lại»", async () => {
		canh.hang = [{ ...HANG_LOI, coTheSoanLai: false }];
		await mo(<BangNguon />);

		for (const goc of HAI_KHUNG) {
			const r = hang(HANG_LOI.id, goc);
			expect(r.textContent).toContain(LY_DO_LOI);
			ghim(
				nutTheoChu("Soạn lại", r) === undefined,
				"soan lai lo cho nguoi khong duoc thay",
			);
		}
	});

	test("hang-nguon: Cần gõ tay, Máy đang soạn, Đã soạn kèm «Xem bản đề xuất»", async () => {
		canh.hang = BON_HANG;
		await mo(<BangNguon />);

		for (const goc of HAI_KHUNG) {
			expect(hang(HANG_GO_TAY.id, goc).textContent).toContain("Cần gõ tay");
			expect(hang(HANG_DANG_SOAN.id, goc).textContent).toContain(
				"Máy đang soạn",
			);
			const daSoan = hang(HANG_DA_SOAN.id, goc);
			expect(daSoan.textContent).toContain("Đã soạn");
			const lk = [...daSoan.querySelectorAll("a")].find(
				(a) => a.textContent?.trim() === "Xem bản đề xuất",
			);
			expect(lk?.getAttribute("href")).toBe("/ws/tai-lieu/de-xuat/dx-9");
			for (const h of [HANG_GO_TAY, HANG_DANG_SOAN, HANG_DA_SOAN])
				expect(nutTheoChu("Soạn lại", hang(h.id, goc))).toBeUndefined();
		}
	});

	test("hang-nguon: không hàng nào in mã thô của trạng thái", async () => {
		canh.hang = BON_HANG;
		await mo(<BangNguon />);

		const chu = document.body.textContent ?? "";
		for (const ma of [
			"LOI",
			"CAN_GO_TAY",
			"DANG_SOAN",
			"DA_SOAN",
			"CHO_DOC",
			"CHO_SOAN",
		])
			expect(chu).not.toMatch(new RegExp(`\\b${ma}\\b`));
	});

	test("hang-nguon: hộp tải nhận { trung: true } thì báo «Nguồn này đã có» và dẫn tới nguồn cũ", async () => {
		canh.ketNhan = { nguonId: "ng-cu", trung: true };
		await moHop();
		await go(oTen(), TEN_TRANG);
		await chonTep(tep("quy-dinh-ban-sao.docx", DOCX, MB));
		await bam(nut("Tải lên"));
		for (let i = 0; i < 4; i += 1) await nhip();

		expect(goi.nhan).toHaveLength(1);
		const bao = document.body.querySelector<HTMLElement>("[data-nguon-da-co]");
		expect(bao?.textContent).toContain("Nguồn này đã có");
		const lk = bao?.querySelector("a");
		expect(lk?.getAttribute("href")).toContain("ng-cu");
	});
});
