import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { type HinhKhungXuong, KhungXuong } from "../src/components/khung-xuong";
import { LocaleProvider } from "../src/components/locale-provider";
import { SectionHeading } from "../src/components/section-heading";
import { VungTaiLoi } from "../src/components/vung-tai-loi";
import { messages } from "../src/lib/messages";

const VI = messages("vi");

const MA_TRAN: readonly [HinhKhungXuong, Record<string, number>][] = [
	["bang", { "thanh-cong-cu": 1, "dau-bang": 1, hang: 8 }],
	["danh-sach", { dong: 6 }],
	["the", { the: 2, hang: 6 }],
	["tong-quan", { "o-so": 4, hang: 5 }],
	["chi-tiet", { "tieu-de": 1, doan: 3 }],
];

const TABBABLE =
	'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

let root: Root | null = null;

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
});

function ve(cay: ReactElement): HTMLElement {
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	act(() => root?.render(<LocaleProvider locale="vi">{cay}</LocaleProvider>));
	return o;
}

function phai(dieu: boolean, thongDiep: string) {
	if (!dieu) throw new Error(thongDiep);
}

function kiemKhungXuong(
	o: HTMLElement,
	hinh: HinhKhungXuong,
	dem: Record<string, number>,
) {
	const khung = o.querySelector<HTMLElement>(`[data-khung-xuong="${hinh}"]`);
	phai(khung !== null, `kmc-xuong: thieu khung ${hinh}`);
	phai(
		khung?.getAttribute("aria-busy") === "true",
		`kmc-xuong: ${hinh} khong aria-busy`,
	);
	const trangThai = khung?.querySelectorAll('[role="status"]') ?? [];
	phai(
		trangThai.length === 1 &&
			trangThai[0]?.textContent === VI.khungXuong.dangTai,
		"kmc-xuong: thieu dong Đang tải…",
	);
	const phanVe = khung?.querySelector('[aria-hidden="true"]');
	phai(
		phanVe !== null && phanVe !== undefined,
		`kmc-xuong: ${hinh} phan ve khong an`,
	);
	for (const [loai, so] of Object.entries(dem)) {
		const thuc =
			khung?.querySelectorAll(`[data-khung-hang="${loai}"]`).length ?? 0;
		phai(thuc === so, `kmc-xuong: ${hinh} co ${thuc} ${loai}, bang ghi ${so}`);
	}
	phai(
		(khung?.querySelectorAll(TABBABLE).length ?? 0) === 0,
		"kmc-xuong: vach nhan tieu diem",
	);
}

describe("khung-xuong", () => {
	for (const [hinh, dem] of MA_TRAN) {
		test(`hinh ${hinh}: dung so vach, mot dong Đang tải…, khong nhan tieu diem`, () => {
			kiemKhungXuong(ve(<KhungXuong hinh={hinh} />), hinh, dem);
		});
	}

	test("nam hinh cho nam cay khac nhau", () => {
		const cay = MA_TRAN.map(([hinh]) => {
			const o = ve(<KhungXuong hinh={hinh} />);
			const html = o.innerHTML;
			act(() => root?.unmount());
			root = null;
			return html;
		});
		phai(new Set(cay).size === MA_TRAN.length, "kmc-xuong: hai hinh trung cay");
	});

	test("chieu do: vach co tabindex thi bai kiem bat", () => {
		const o = ve(<KhungXuong hinh="danh-sach" />);
		o.querySelector('[data-khung-hang="dong"]')?.setAttribute("tabindex", "0");
		expect(() => kiemKhungXuong(o, "danh-sach", { dong: 6 })).toThrow(
			"kmc-xuong: vach nhan tieu diem",
		);
	});

	test("chieu do: mat dong trang thai thi bai kiem bat", () => {
		const o = ve(<KhungXuong hinh="the" />);
		o.querySelector('[role="status"]')?.remove();
		expect(() => kiemKhungXuong(o, "the", { the: 2, hang: 6 })).toThrow(
			"kmc-xuong: thieu dong Đang tải…",
		);
	});
});

describe("tuy-chon", () => {
	test("the cot 2: luoi hai cot tu md, van 2 the x 3 hang", () => {
		const o = ve(<KhungXuong cot={2} hinh="the" />);
		kiemKhungXuong(o, "the", { the: 2, hang: 6 });
		const luoi = o.querySelector('[data-khung-hang="the"]')?.parentElement;
		phai(
			(luoi?.getAttribute("class") ?? "")
				.split(/\s+/)
				.includes("md:grid-cols-2"),
			"kmc-xuong: the cot 2 khong co luoi hai cot",
		);
	});

	function kiemCoTieuDe(o: HTMLElement) {
		const tieuDe = o.querySelectorAll('[data-khung-hang="tieu-de"]');
		phai(tieuDe.length === 1, "kmc-xuong: coTieuDe khong co hang tieu de");
		const sau = o.querySelector(
			'[data-khung-hang]:not([data-khung-hang="tieu-de"])',
		);
		phai(
			Boolean(
				tieuDe[0] &&
					sau &&
					tieuDe[0].compareDocumentPosition(sau) &
						Node.DOCUMENT_POSITION_FOLLOWING,
			),
			"kmc-xuong: hang tieu de khong dung truoc than",
		);
	}

	for (const [hinh] of MA_TRAN) {
		if (hinh === "chi-tiet") continue;
		test(`${hinh} coTieuDe them dung mot hang tieu de, khong coTieuDe thi khong co`, () => {
			kiemCoTieuDe(ve(<KhungXuong coTieuDe hinh={hinh} />));
			act(() => root?.unmount());
			root = null;
			const o = ve(<KhungXuong hinh={hinh} />);
			expect(o.querySelectorAll('[data-khung-hang="tieu-de"]').length).toBe(0);
		});
	}

	test("chieu do: coTieuDe bi bo qua thi bai kiem bat", () => {
		const o = ve(<KhungXuong hinh="tong-quan" />);
		expect(() => kiemCoTieuDe(o)).toThrow(
			"kmc-xuong: coTieuDe khong co hang tieu de",
		);
	});
});

describe("vung-tai-loi-ma", () => {
	test("chuyen data-trang-thai len khung", () => {
		const o = ve(
			<VungTaiLoi
				data-trang-thai="ST-x-loi"
				moTa="b"
				onThuLai={() => {}}
				tieuDe="a"
			/>,
		);
		phai(
			o.querySelector('[data-vung-tai-loi][data-trang-thai="ST-x-loi"]') !==
				null,
			"kmc-loi: ST-x-loi mat data-trang-thai",
		);
	});
});

describe("tieu-de-muc", () => {
	test("level 2 dung h2 mang id, wrapper khong mang id", () => {
		const o = ve(
			<SectionHeading id="muc-x" level={2}>
				Mục
			</SectionHeading>,
		);
		phai(o.querySelector("h2#muc-x") !== null, "kmc-muc: id khong nam tren h2");
		phai(
			o.querySelector('[data-slot="section-heading"]')?.hasAttribute("id") ===
				false,
			"kmc-muc: id khong nam tren h2",
		);
	});

	test("level 3 va 4 van ra h3, h4", () => {
		const o = ve(
			<>
				<SectionHeading>Ba</SectionHeading>
				<SectionHeading level={4}>Bốn</SectionHeading>
			</>,
		);
		expect(o.querySelectorAll("h3").length).toBe(1);
		expect(o.querySelectorAll("h4").length).toBe(1);
	});
});
