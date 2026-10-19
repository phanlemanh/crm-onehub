import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import type { ReactNode } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

type Hang = {
	id: string;
	so: number;
	ma: string;
	tieuDe: string;
	muonLam: string;
	man: string;
	guiLuc: string;
	daKeoVe: boolean;
	daLuuTru: boolean;
	nguoiGui: { id: string; ten: string } | null;
	phongBan: { id: string; ten: string } | null;
	archivedAt: string | null;
	nguoiLuuTru: { id: string; ten: string } | null;
};
type KetCuc = "ok" | "cho" | "mang" | "da-lay-ve";
type Toast = {
	kieu: "success" | "error";
	chu: string;
	duration?: number;
	action?: { label: string; onClick: () => void };
};

let dangDung: Hang[] = [];
let daLuuTru: Hang[] = [];
let ketLuuTru: KetCuc = "ok";
let ketKhoiPhuc: KetCuc = "ok";
let goiLuuTru: string[] = [];
let goiKhoiPhuc: string[] = [];
let soLanTaiDangDung = 0;
let toasts: Toast[] = [];

class LoiTrpc extends Error {
	data = { httpStatus: 409, code: "CONFLICT" };
}

function truyVan<T>(ten: string, ra: () => T) {
	return {
		queryKey: () => [ten],
		pathKey: () => [ten],
		queryOptions: () => ({ queryKey: [ten], queryFn: async () => ra() }),
	};
}

async function chay(ket: KetCuc, viec: () => void) {
	if (ket === "cho") await new Promise(() => {});
	if (ket === "mang") throw new TypeError("Failed to fetch");
	if (ket === "da-lay-ve") throw new LoiTrpc("vua lay ve");
	viec();
	return { ok: true };
}

function ghi(ten: string, lam: (id: string) => Promise<unknown>) {
	return {
		mutationOptions: (o = {}) => ({
			...o,
			mutationKey: [ten],
			mutationFn: async (v: { id: string }) => lam(v.id),
		}),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		tinHieu: {
			cuaToi: truyVan("tinHieu.cuaToi", () => ({ rows: [] })),
			tatCa: truyVan("tinHieu.tatCa", () => {
				soLanTaiDangDung += 1;
				return { rows: dangDung };
			}),
			daLuuTru: truyVan("tinHieu.daLuuTru", () => ({ rows: daLuuTru })),
			luuTru: ghi("tinHieu.luuTru", (id) => {
				goiLuuTru.push(id);
				return chay(ketLuuTru, () => {
					const h = dangDung.find((x) => x.id === id);
					dangDung = dangDung.filter((x) => x.id !== id);
					if (h)
						daLuuTru = [
							{
								...h,
								daLuuTru: true,
								archivedAt: "2026-10-20T02:14:00.000Z",
								nguoiLuuTru: { id: "u-q", ten: "Đỗ Minh Quân" },
							},
							...daLuuTru,
						];
				});
			}),
			khoiPhuc: ghi("tinHieu.khoiPhuc", (id) => {
				goiKhoiPhuc.push(id);
				return chay(ketKhoiPhuc, () => {
					const h = daLuuTru.find((x) => x.id === id);
					daLuuTru = daLuuTru.filter((x) => x.id !== id);
					if (h)
						dangDung = [
							...dangDung,
							{ ...h, daLuuTru: false, archivedAt: null, nguoiLuuTru: null },
						];
				});
			}),
		},
	}),
}));

mock.module("sonner", () => ({
	toast: Object.assign(() => {}, {
		success: (chu: string, o: Omit<Toast, "kieu" | "chu"> = {}) =>
			toasts.push({ kieu: "success", chu, ...o }),
		error: (chu: string) => toasts.push({ kieu: "error", chu }),
	}),
	Toaster: () => null,
}));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { LUU_TRU } = await import("@crm/ui/lib/bao-luu-tru");
const { toneTheoNghia } = await import("@crm/ui/lib/status-tone");
const { TIN_HIEU } = await import("@crm/validation/tin-hieu");
const { TatCaTrang } = await import(
	"@/app/(app)/[slug]/tin-hieu/tat-ca/tat-ca-trang"
);
const { DanhSachTinHieu } = await import(
	"@/components/tin-hieu/danh-sach-tin-hieu"
);
const { tinHieuMessages } = await import("@/lib/messages/tin-hieu");
const { docTrangThaiTinHieu } = await import("@/lib/tin-hieu/trang-thai");
const { dien } = await import("@/components/crm/record-sheet/plan-copy");

const m = tinHieuMessages("vi");
const t = m.tatCa.luuTru;
const LUC = "2026-10-20T03:00:00.000Z";
let root: Root | null = null;
let duongHienTai = new URLSearchParams();

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
	dangDung = [];
	daLuuTru = [];
	ketLuuTru = "ok";
	ketKhoiPhuc = "ok";
	goiLuuTru = [];
	goiKhoiPhuc = [];
	soLanTaiDangDung = 0;
	toasts = [];
});

async function cho(ms = 30) {
	await act(async () => {
		await new Promise((r) => setTimeout(r, ms));
	});
}

async function ve(nut: ReactNode, duong = "") {
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	duongHienTai = new URLSearchParams(duong);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	await act(async () => {
		root?.render(
			<NuqsTestingAdapter
				hasMemory
				onUrlUpdate={(e) => {
					duongHienTai = new URLSearchParams(e.searchParams);
				}}
				searchParams={duong}
			>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">{nut}</LocaleProvider>
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

function hang(so: number, daKeoVe = false): Hang {
	return {
		id: `t-${so}`,
		so,
		ma: `crm-${so}`,
		tieuDe: `dieu gap ${so}`,
		muonLam: `muon ${so}`,
		man: `/man/${so}`,
		guiLuc: "2026-10-16T02:14:00.000Z",
		daKeoVe,
		daLuuTru: false,
		nguoiGui: { id: "u-lan", ten: "Nguyễn Thị Lan" },
		phongBan:
			so % 2 === 0
				? { id: "pb-kd", ten: "Kinh doanh" }
				: { id: "pb-ns", ten: "Nhân sự" },
		archivedAt: null,
		nguoiLuuTru: null,
	};
}

function luuSan(so: number, nguoi: Hang["nguoiLuuTru"]): Hang {
	return {
		...hang(so),
		daLuuTru: true,
		archivedAt: "2026-10-20T02:14:00.000Z",
		nguoiLuuTru: nguoi,
	};
}

const trang = (duong = "") =>
	ve(<TatCaTrang banVeDocDuoc coCho={[]} luc={LUC} trangThai={{}} />, duong);

const menuCua = (o: Element, ma: string) =>
	o.querySelector(`[data-thao-tac-tat-ca="${ma}"]`);
const trongMenu = (chon: string) =>
	document.body.querySelector(`[role=menu] ${chon}`);
const maHien = (o: Element) =>
	[...o.querySelectorAll("[data-tin-hieu-tat-ca]")].map((e) =>
		e.getAttribute("data-tin-hieu-tat-ca"),
	);
const oThuNhat = (o: Element) =>
	o.querySelector("[data-slot=stat-card] .text-3xl")?.textContent;

async function luuTruDong(o: Element, ma: string) {
	await bam(menuCua(o, ma));
	await bam(trongMenu(`[data-luu-tru-tin-hieu="${ma}"]`));
	await cho(60);
}

describe("hoan-tac", () => {
	test("hoan-tac: luu tru goi mot lan, thong bao co Hoan tac qua baoDaLuuTru, Hoan tac goi khoi phuc mot lan", async () => {
		dangDung = [hang(1), hang(2)];
		const o = await trang();
		await luuTruDong(o, "crm-1");
		expect(goiLuuTru).toEqual(["t-1"]);
		const bao = toasts.find((x) => x.chu === dien(t.daLuuTru, { ma: "crm-1" }));
		expect(bao?.kieu).toBe("success");
		expect(bao?.duration).toBe(LUU_TRU.hoanTacMs);
		expect(bao?.action?.label, "thong bao luu tru khong co Hoan tac").toBe(
			t.hoanTac,
		);
		await act(async () => bao?.action?.onClick());
		await cho(60);
		expect(goiKhoiPhuc).toEqual(["t-1"]);
		await act(async () => bao?.action?.onClick());
		await cho(60);
		expect(goiKhoiPhuc).toEqual(["t-1"]);
		expect(maHien(o)).toContain("crm-1");
	});
});

describe("thanh-cong-cu", () => {
	test("thanh-cong-cu: nut Da luu tru o ca hai dang, bat ghi duong dan, ve trang dau, giu bo loc", async () => {
		dangDung = [hang(1), hang(2)];
		daLuuTru = [luuSan(9, { id: "u-q", ten: "Đỗ Minh Quân" })];
		const o = await trang("?page=2&phongBan=pb-kd");
		const nut = o.querySelector("[data-nut-da-luu-tru]");
		expect(nut?.textContent).toContain(t.nut);
		await bam(nut);
		expect(duongHienTai.get("archived")).toBe("true");
		expect(duongHienTai.get("page")).toBeNull();
		expect(duongHienTai.get("phongBan")).toBe("pb-kd");
		expect(o.querySelector("[data-nut-da-luu-tru]")?.textContent).toContain(
			t.nut,
		);
	});

	test("thanh-cong-cu: dang dung — chua lay ve bam duoc Luu tru; da lay ve bi khoa kem ly do", async () => {
		dangDung = [hang(1), hang(2, true)];
		const o = await trang();
		await bam(menuCua(o, "crm-1"));
		const muc = trongMenu('[data-luu-tru-tin-hieu="crm-1"]');
		expect(muc?.textContent).toBe(t.luuTru);
		expect(muc?.hasAttribute("data-disabled")).toBe(false);
		expect(trongMenu("[data-khong-luu-tru-duoc]")).toBeNull();
		document.body.dispatchEvent(
			new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
		);
		await cho();
		await bam(menuCua(o, "crm-2"));
		expect(
			trongMenu('[data-luu-tru-tin-hieu="crm-2"]')?.hasAttribute(
				"data-disabled",
			),
			"luu tru bat duoc tren tin hieu da lay ve",
		).toBe(true);
		expect(trongMenu("[data-khong-luu-tru-duoc]")?.textContent).toBe(
			t.khongLuuTruDuoc,
		);
	});

	test("thanh-cong-cu: dang da luu tru — hai cot, gio Viet Nam, Khoi phuc, nguoi da xoa tai khoan", async () => {
		daLuuTru = [luuSan(9, { id: "u-q", ten: "Đỗ Minh Quân" }), luuSan(8, null)];
		const o = await trang("?archived=true");
		const dau = [...o.querySelectorAll("thead th")].map((x) => x.textContent);
		expect(dau).toContain(t.cotLuc);
		expect(dau).toContain(t.cotNguoi);
		expect(o.querySelector("[data-luu-tru-luc]")?.textContent).toBe(
			"09:14 20-10",
		);
		const nguoi = [...o.querySelectorAll("[data-nguoi-luu-tru]")];
		expect(nguoi[0]?.textContent).toBe("Đỗ Minh Quân");
		expect(nguoi[0]?.getAttribute("translate")).toBe("no");
		expect(nguoi[1]?.textContent).toBe(m.tatCa.khongConTaiKhoan);
		await bam(menuCua(o, "crm-9"));
		expect(trongMenu('[data-khoi-phuc-tin-hieu="crm-9"]')?.textContent).toBe(
			t.khoiPhuc,
		);
		expect(trongMenu("[data-luu-tru-tin-hieu]")).toBeNull();
	});

	test("thanh-cong-cu: dang da luu tru rong noi chua luu tru tin hieu nao", async () => {
		dangDung = [hang(1)];
		const o = await trang("?archived=true");
		expect(o.textContent).toContain(t.rongTieuDe);
	});

	test("thanh-cong-cu: loc phong ban o dang da luu tru dem tren dang dang xem", async () => {
		dangDung = [hang(2), hang(4), hang(6)];
		daLuuTru = [luuSan(1, null), luuSan(8, null)];
		const o = await trang("?archived=true&phongBan=pb-kd");
		expect(maHien(o)).toEqual(["crm-8"]);
		expect(o.textContent).toContain(dien(t.meta, { so: "1" }));
	});
});

describe("ba-so-giu", () => {
	test("ba-so-giu: ba o so khong doi theo dang xem, doi ngay sau luu tru va Hoan tac", async () => {
		dangDung = [hang(1), hang(2), hang(3), hang(4), hang(5)];
		daLuuTru = [luuSan(9, null), luuSan(8, null)];
		const o = await trang();
		expect(oThuNhat(o)).toBe("5");
		await bam(o.querySelector("[data-nut-da-luu-tru]"));
		await cho(60);
		expect(oThuNhat(o), "ba o so doi theo dang Da luu tru").toBe("5");
		await bam(o.querySelector("[data-nut-da-luu-tru]"));
		await cho(60);
		await luuTruDong(o, "crm-1");
		expect(oThuNhat(o), "ba o so con dem tin hieu vua luu tru").toBe("4");
		const bao = toasts.find((x) => x.chu === dien(t.daLuuTru, { ma: "crm-1" }));
		await act(async () => bao?.action?.onClick());
		await cho(80);
		expect(oThuNhat(o)).toBe("5");
	});
});

describe("ca-man", () => {
	const O = [
		["luuTru", "cho"],
		["luuTru", "mang"],
		["luuTru", "da-lay-ve"],
		["khoiPhuc", "cho"],
		["khoiPhuc", "mang"],
	] as const;
	test("ca-man: ma tran nam o viet truoc", () => {
		expect(O.length).toBe(5);
	});
	for (const [thuTuc, ket] of O)
		test(`ca-man: ${thuTuc} ${ket}`, async () => {
			if (thuTuc === "luuTru") {
				dangDung = [hang(1)];
				ketLuuTru = ket;
			} else {
				dangDung = [];
				daLuuTru = [luuSan(1, null)];
				ketKhoiPhuc = ket;
			}
			const o = await trang(thuTuc === "luuTru" ? "" : "?archived=true");
			const chon =
				thuTuc === "luuTru"
					? '[data-luu-tru-tin-hieu="crm-1"]'
					: '[data-khoi-phuc-tin-hieu="crm-1"]';
			await bam(menuCua(o, "crm-1"));
			const taiTruoc = soLanTaiDangDung;
			await bam(trongMenu(chon));
			await cho(60);
			const goi = thuTuc === "luuTru" ? goiLuuTru : goiKhoiPhuc;
			if (ket === "cho") {
				await bam(menuCua(o, "crm-1"));
				expect(trongMenu(chon)?.hasAttribute("data-disabled")).toBe(true);
				await bam(trongMenu(chon));
				expect(goi.length).toBe(1);
				return;
			}
			expect(maHien(o)).toContain("crm-1");
			const loi = toasts.filter((x) => x.kieu === "error").map((x) => x.chu);
			if (ket === "mang")
				expect(loi).toEqual([
					dien(thuTuc === "luuTru" ? t.luuTruHong : t.khoiPhucHong, {
						ma: "crm-1",
					}),
				]);
			else {
				expect(loi, "loi vua lay ve noi nhu loi mang").toEqual([
					dien(t.vuaLayVe, { ma: "crm-1" }),
				]);
				expect(soLanTaiDangDung).toBeGreaterThan(taiTruoc);
			}
		});
});

describe("nguoi-gui", () => {
	test("nguoi-gui: tin hieu da luu tru mang nhan xam va cau rieng, van xoa duoc, khong lo nguoi luu tru", async () => {
		for (const html of [null, "<html></html>"]) {
			const kq = docTrangThaiTinHieu(
				html,
				[
					{ ma: "crm-1", daKeoVe: false, daLuuTru: true },
					{ ma: "crm-2", daKeoVe: false, daLuuTru: false },
				],
				m,
			);
			const tt = kq.trangThai["crm-1"];
			expect(tt?.nhan, "nguoi gui khong biet tin hieu da bi luu tru").toBe(
				m.nhan.daLuuTru,
			);
			expect(tt?.cau).toBe(m.trangThai.daLuuTru);
			expect(tt && toneTheoNghia(tt.nghia)).toBe("neutral");
			expect(kq.trangThai["crm-2"]?.nhan).not.toBe(m.nhan.daLuuTru);
		}
		const kq = docTrangThaiTinHieu(
			null,
			[{ ma: "crm-1", daKeoVe: false, daLuuTru: true }],
			m,
		);
		const tt = kq.trangThai["crm-1"];
		if (!tt) throw new Error("thieu trang thai");
		const o = await ve(
			<DanhSachTinHieu
				banVeDocDuoc
				dangXoa={null}
				dong={[
					{
						id: "t-1",
						ma: "crm-1",
						tieuDe: "dieu gap 1",
						muonLam: "muon 1",
						man: "/okr",
						guiLuc: "2026-10-16T02:14:00.000Z",
						coTheXoa: true,
						trangThai: tt,
					},
				]}
				nutGui={null}
				onXoa={() => {}}
			/>,
		);
		expect(o.querySelector("[data-nghia]")?.getAttribute("data-nghia")).toBe(
			tt.nghia,
		);
		expect(o.textContent).toContain(m.trangThai.daLuuTru);
		expect(o.innerHTML).not.toContain(t.cotNguoi);
		expect(o.innerHTML).not.toContain("Đỗ Minh Quân");
		await bam(o.querySelector('[data-thao-tac-tin-hieu="crm-1"]'));
		expect(
			document.body
				.querySelector('[data-xoa-tin-hieu="crm-1"]')
				?.hasAttribute("data-disabled"),
		).toBe(false);
	});

	test("nguoi-gui: chu loi luu tru da lay ve dung bang chu may chu", () => {
		expect(TIN_HIEU.loi.luuTruDaLayVe).toBe(
			"Đội sản phẩm đã lấy tín hiệu này về — không lưu trữ được nữa.",
		);
	});
});
