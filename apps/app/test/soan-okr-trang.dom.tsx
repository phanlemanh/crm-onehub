import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { act } from "react";
import { donViCua } from "@/app/(app)/[slug]/okr/soan/dung-cuoc-soan";
import { duongTheoDonVi } from "@/app/(app)/[slug]/okr/soan/luat-ban-nhap";
import {
	bam,
	CUOC,
	cho,
	DauTrangOkr,
	dat,
	datLai,
	diTrang,
	dinhVi,
	don,
	KhungSoanXuat,
	m,
	mo,
	moKhung,
	moTrang,
	nhip,
	nut,
	SAN_SANG_BAT,
	SOAN_UI,
	urlDoi,
} from "./khung-soan-okr";

const q = (s: string) => document.querySelector(s);
const qa = (s: string) => [...document.querySelectorAll(s)];

async function nhanTab(o: Element | undefined): Promise<void> {
	if (!o) throw new Error("khong thay tab");
	await act(async () => {
		o.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }));
	});
	await nhip(3);
}

function beRong(rong: number): () => void {
	const goc = window.matchMedia;
	const gia = (truyVan: string) => {
		const tran = /max-width:\s*(\d+)px/.exec(truyVan);
		return {
			matches: tran ? rong <= Number(tran[1]) : false,
			media: truyVan,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		};
	};
	Object.defineProperty(window, "matchMedia", {
		value: gia,
		writable: true,
		configurable: true,
	});
	return () =>
		Object.defineProperty(window, "matchMedia", {
			value: goc,
			writable: true,
			configurable: true,
		});
}

beforeEach(datLai);
afterEach(don);

describe("k2-duong", () => {
	let o = 0;
	afterEach(() => {
		o += 1;
	});

	test("Soạn khi chưa có cuộc: đi tới trang soạn, không mở sheet", async () => {
		await moKhung("pb:pb-1", { sanSang: SAN_SANG_BAT });
		await bam(nut(m.nut.soan));
		await cho(() => diTrang.length > 0, "di trang");
		expect(diTrang).toEqual([{ kieu: "push", duong: "/ws/okr/soan/cuoc-1" }]);
		expect(`con sheet: ${qa('[data-slot="sheet-content"]').length}`).toBe(
			"con sheet: 0",
		);
	});

	test("Tiếp tục khi có cuộc đang soạn: đi tới đúng cuộc đó", async () => {
		await moKhung("pb:pb-1", {
			sanSang: {
				...SAN_SANG_BAT,
				cuocDang: { ...CUOC, id: "cuoc-dang", soDongTong: 3, soDongNhan: 1 },
				soCuocDaDung: 1,
			},
		});
		await bam(nut(m.nut.tiep));
		expect(diTrang).toEqual([
			{ kieu: "push", duong: "/ws/okr/soan/cuoc-dang" },
		]);
	});

	test("link cũ ?cuocSoan= trên Theo đơn vị được thay bằng trang soạn, không thêm lịch sử", async () => {
		await moKhung("pb:pb-1", {
			sanSang: SAN_SANG_BAT,
			thamSo: "cuocSoan=cuoc-cu",
		});
		expect(diTrang).toEqual([
			{ kieu: "replace", duong: "/ws/okr/soan/cuoc-cu" },
		]);
	});

	test("trang soạn không có thanh tab OKR hay ô chọn chu kỳ; Theo đơn vị vẫn có (đối chứng dương)", async () => {
		dinhVi.duong = "/ws/okr/soan/cuoc-1";
		await mo(<DauTrangOkr chonChuKy={<span data-chon-ky />} />);
		expect(
			`dau trang okr tren trang soan: ${qa('[role="tablist"]').length + qa("[data-chon-ky]").length}`,
		).toBe("dau trang okr tren trang soan: 0");
		await don();
		dinhVi.duong = "/ws/okr/theo-don-vi";
		await mo(<DauTrangOkr chonChuKy={<span data-chon-ky />} />);
		expect(qa('[role="tablist"]').length).toBe(1);
		expect(qa("[data-chon-ky]").length).toBe(1);
	});

	test("đầu trang soạn: lối về đúng đơn vị và chu kỳ, tên đơn vị không dịch, số lượt; cuộc không mở được thì báo và vẫn có lối về", async () => {
		await moTrang();
		const ve = q('[data-nut="ve-theo-don-vi"]');
		expect(ve?.getAttribute("href")).toBe(duongTheoDonVi("ws", donViCua(CUOC)));
		expect(ve?.getAttribute("href")).toContain("pb-1");
		expect(ve?.textContent).toContain(m.trang.veTheoDonVi);
		const dau = q("[data-dau-soan]");
		expect(dau?.querySelector('[translate="no"]')?.textContent).toBe(
			CUOC.tenDonVi,
		);
		expect(dau?.textContent).toContain(CUOC.tenChuKy);
		expect(dau?.textContent).toContain(
			m.man.luot(String(CUOC.soLuot), String(CUOC.tranLuot)),
		);
		await don();
		datLai();
		dat("okr.soanDanhSach", () => {
			throw new Error("NOT_FOUND");
		});
		await moTrang();
		expect(q('[data-kara-state="error"]')?.textContent).toContain(
			m.trang.khongMo,
		);
		expect(q('[data-nut="ve-theo-don-vi"]')?.getAttribute("href")).toBe(
			"/ws/okr/theo-don-vi",
		);
	});

	test("đếm ô k2-duong", () => {
		expect(o).toBe(5);
	});
});

describe("k2-khung", () => {
	const O = [
		{ rong: 1440, hep: false },
		{ rong: 1024, hep: false },
		{ rong: 1023, hep: true },
		{ rong: 375, hep: true },
	] as const;

	test("hằng cỡ ô hội thoại theo SOAN_UI: 380 px mặc định, 300 px tối thiểu, tối đa nửa thân", () => {
		expect(KhungSoanXuat.CO_O_HOI_THOAI).toEqual({
			defaultSize: SOAN_UI.ocHoiThoai.macDinhPx,
			minSize: SOAN_UI.ocHoiThoai.toiThieuPx,
			maxSize: SOAN_UI.ocHoiThoai.toiDaPhanTram,
		});
		expect([
			SOAN_UI.ocHoiThoai.macDinhPx,
			SOAN_UI.ocHoiThoai.toiThieuPx,
			SOAN_UI.ocHoiThoai.toiDaPhanTram,
		]).toEqual([380, 300, "50"]);
	});

	test("ma trận khổ viết trước: từ 1024 px là hai ô co giãn, dưới đó là hai tab trên URL", async () => {
		let soO = 0;
		for (const { rong, hep } of O) {
			const tra = beRong(rong);
			try {
				await moTrang();
				const tay = qa('[data-slot="resizable-handle"]');
				const tab = qa('[role="tab"]');
				if (!hep) {
					expect(`o ${rong}: ${tay.length} tay, ${tab.length} tab`).toBe(
						`o ${rong}: 1 tay, 0 tab`,
					);
					expect(tay[0]?.getAttribute("role")).toBe("separator");
					expect(tay[0]?.getAttribute("aria-label")).toBe(m.trang.thanhKeo);
					const o = qa('[data-slot="resizable-panel"]');
					expect(o.map((x) => x.getAttribute("data-o"))).toEqual([
						"hoi-thoai",
						"ban-nhap",
					]);
				} else {
					expect(
						`o ${rong} khong phai hai tab: ${tay.length} tay, ${tab.length} tab`,
					).toBe(`o ${rong} khong phai hai tab: 0 tay, 2 tab`);
					expect(tab.map((t) => t.textContent)).toEqual([
						m.man.tabTroChuyen,
						m.man.tabBanNhap("0"),
					]);
					await nhanTab(tab[1]);
					expect(`tab khong tren url: ${urlDoi.at(-1) ?? ""}`).toBe(
						"tab khong tren url: ?tab=ban-nhap",
					);
					await don();
					await moTrang(false, true, "?tab=ban-nhap");
					expect(qa('[role="tab"]')[1]?.getAttribute("aria-selected")).toBe(
						"true",
					);
				}
				soO += 1;
			} finally {
				tra();
				await don();
				datLai();
			}
		}
		expect(soO).toBe(4);
	});
});
