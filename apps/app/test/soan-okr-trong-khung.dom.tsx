import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { act } from "react";
import {
	BAN_NHAP,
	bam,
	CUOC,
	cho,
	daDung,
	dat,
	datAgent,
	datDanhSach,
	datLai,
	dinhVi,
	diTrang,
	don,
	m,
	mo,
	moKhung,
	moTrang,
	nhip,
	nut,
	SAN_SANG_BAT,
	TrangSoan,
	urlDoi,
} from "./khung-soan-okr";

const { RecordSheetHost } = await import(
	"@/components/crm/record-sheet/record-sheet-host"
);
const { useOpenRecord } = await import(
	"@/components/crm/record-sheet/record-stack"
);
const { recordHref } = await import("@/lib/record-href");
const { donViCua, duongMoCuoc } = await import(
	"@/app/(app)/[slug]/okr/soan/luat-ban-nhap"
);
const { crmMessages } = await import("@/lib/messages/crm");
const { SEARCH_PARAM } = await import("@/lib/search-param-keys");

const q = (s: string) => document.querySelector(s);
const qa = (s: string) => [...document.querySelectorAll(s)];
const mc = crmMessages("vi");

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

function banGhiCuoi(): string | null {
	const chuoi = urlDoi.at(-1);
	return chuoi === undefined ? null : new URLSearchParams(chuoi).get("record");
}

function daBoRecord(truoc: number): boolean {
	return urlDoi.length > truoc && banGhiCuoi() === null;
}

function datQuyen(): void {
	dat("okr.access", () => ({
		canManageProgram: false,
		headOf: { divisions: [], departments: [] },
	}));
}

async function moKhungBanGhi(thamSo: string): Promise<void> {
	datQuyen();
	await mo(<RecordSheetHost cauNoiOkr />, thamSo);
	await nhip(10);
}

async function lamMoiSauLuot(): Promise<void> {
	await datAgent({ status: "streaming" });
	await datAgent({ status: "ready" });
	await nhip(10);
}

async function bamLopPhu(): Promise<void> {
	const lop = q(
		"[data-slot='sheet-overlay'],[data-slot='drawer-overlay']",
	) as HTMLElement | null;
	if (!lop) throw new Error("khong thay lop phu");
	await act(async () => {
		lop.dispatchEvent(
			new PointerEvent("pointerdown", {
				bubbles: true,
				button: 0,
				pointerType: "mouse",
			}),
		);
		lop.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
		lop.click();
	});
	await nhip(5);
}

async function esc(): Promise<void> {
	await act(async () => {
		(document.activeElement ?? document.body).dispatchEvent(
			new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
		);
	});
	await nhip(5);
}

function nutDong(): HTMLButtonElement | null {
	return (
		(qa(
			"[data-slot=sheet-header] button, [data-slot=drawer-header] button",
		).find((b) => b.textContent?.trim() === mc.sheet.close) as
			| HTMLButtonElement
			| undefined) ?? null
	);
}

beforeEach(datLai);
afterEach(don);

describe("sk-duong", () => {
	let soO = 0;
	afterEach(() => {
		soO += 1;
	});

	test("Soạn khi chưa có cuộc: mở bản ghi soan trên Theo đơn vị, không rời trang", async () => {
		await moKhung("pb:pb-1", { sanSang: SAN_SANG_BAT });
		await bam(nut(m.nut.soan));
		await cho(() => banGhiCuoi() !== null, "ghi record");
		expect(banGhiCuoi()).toBe("soan:cuoc-1");
		expect(`van day sang trang rieng: ${diTrang.length}`).toBe(
			"van day sang trang rieng: 0",
		);
	});

	test("Tiếp tục: mở đúng cuộc đang soạn", async () => {
		await moKhung("pb:pb-1", {
			sanSang: {
				...SAN_SANG_BAT,
				cuocDang: { ...CUOC, id: "cuoc-dang", soDongTong: 3, soDongNhan: 1 },
				soCuocDaDung: 1,
			},
		});
		await bam(nut(m.nut.tiep));
		await cho(() => banGhiCuoi() !== null, "ghi record");
		expect(banGhiCuoi()).toBe("soan:cuoc-dang");
		expect(diTrang.length).toBe(0);
	});

	test("link cũ ?cuocSoan= thành record=soan bằng thay thế, bỏ cuocSoan", async () => {
		await moKhung("pb:pb-1", {
			sanSang: SAN_SANG_BAT,
			thamSo: "cuocSoan=cuoc-cu",
		});
		await cho(() => diTrang.length > 0, "thay url");
		const [lan] = diTrang;
		expect(`link cu them lich su: ${lan?.kieu}`).toBe(
			"link cu them lich su: replace",
		);
		const u = new URL(lan?.duong ?? "", "http://x");
		expect(u.pathname).toBe("/ws/okr/theo-don-vi");
		expect(u.searchParams.get("record")).toBe("soan:cuoc-cu");
		expect(u.searchParams.get("cuocSoan")).toBeNull();
		expect(diTrang.length).toBe(1);
	});

	test("đường cũ chuyển về Theo đơn vị của cuộc, kèm record", () => {
		const co = new URL(duongMoCuoc("ws", "cuoc-1", donViCua(CUOC)), "http://x");
		expect(co.pathname).toBe("/ws/okr/theo-don-vi");
		expect(co.searchParams.get(SEARCH_PARAM.okr.ky)).toBe("q1");
		expect(co.searchParams.get(SEARCH_PARAM.okr.don)).toBe("pb:pb-1");
		expect(co.searchParams.get("record")).toBe("soan:cuoc-1");
		const khong = new URL(duongMoCuoc("ws", "cuoc-x", null), "http://x");
		expect(khong.pathname).toBe("/ws/okr/theo-don-vi");
		expect([...khong.searchParams.keys()]).toEqual(["record"]);
	});

	test("record=soan với cuộc không có: khung hiện lỗi và đóng được", async () => {
		dat("okr.soanDanhSach", () => {
			throw new Error("NOT_FOUND");
		});
		await moKhungBanGhi("record=soan:khong-co");
		await cho(() => q("[data-kara-state='error']") !== null, "loi");
		const khung = q("[data-slot=sheet-content]");
		expect(
			khung?.querySelector("[data-kara-state='error']")?.textContent,
		).toContain(m.trang.khongMo);
		expect(nutDong()).not.toBeNull();
	});

	test("đếm ô sk-duong", () => {
		expect(soO).toBe(5);
	});
});

describe("sk-record", () => {
	let soO = 0;
	afterEach(() => {
		soO += 1;
	});

	test("soan là loại bản ghi, loại lạ không mở gì", async () => {
		await moKhungBanGhi("record=soan:cuoc-1");
		expect(
			`soan khong la ban ghi: ${q("[data-slot=sheet-content]")?.getAttribute("data-size")}`,
		).toBe("soan khong la ban ghi: kara");
		await don();
		datLai();
		await moKhungBanGhi("record=khong-loai:abc");
		expect(q("[data-slot=sheet-content]")).toBeNull();
	});

	test("recordHref của soan mở được khung soạn khi dùng làm địa chỉ", async () => {
		const u = new URL(
			recordHref("ws", "/okr/theo-don-vi", "soan", CUOC.id),
			"http://x",
		);
		expect(u.pathname).toBe("/ws/okr/theo-don-vi");
		await moKhungBanGhi(u.search.slice(1));
		await cho(() => q("[data-slot=sheet-header]") !== null, "dau khung");
		expect(q("[data-slot=sheet-content]")?.getAttribute("data-size")).toBe(
			"kara",
		);
		expect(q("[data-slot=sheet-header]")?.textContent).toContain(
			m.trang.tieuDe,
		);
	});

	test("mở trên trang Thoả thuận: khung soạn hiện ngay đó", async () => {
		dinhVi.duong = "/ws/deals";
		await moKhungBanGhi("record=soan:cuoc-1");
		await cho(() => q("[data-slot=sheet-header]") !== null, "dau khung");
		expect(q("[data-slot=sheet-header]")?.textContent).toContain(
			m.trang.tieuDe,
		);
		expect(`roi trang: ${diTrang.length}`).toBe("roi trang: 0");
	});

	test("đóng khung khi Kara rảnh: bỏ record, đường giữ nguyên", async () => {
		dinhVi.duong = "/ws/deals";
		await moKhungBanGhi("record=soan:cuoc-1");
		await cho(() => nutDong() !== null, "nut dong");
		const truoc = urlDoi.length;
		await act(async () => nutDong()?.click());
		await nhip(5);
		expect(`bo record: ${daBoRecord(truoc)}`).toBe("bo record: true");
		expect(`roi trang: ${diTrang.length}`).toBe("roi trang: 0");
	});

	test("đếm ô sk-record", () => {
		expect(soO).toBe(4);
	});
});

describe("sk-khung", () => {
	let soO = 0;
	let traLai: (() => void) | null = null;
	afterEach(() => {
		soO += 1;
		traLai?.();
		traLai = null;
	});

	test("rộng, chưa có dòng nháp: chỉ cột Kara, không tab, cỡ kara", async () => {
		traLai = beRong(1440);
		await moTrang();
		expect(qa("[data-o=hoi-thoai]").length).toBe(1);
		expect(q("[data-o=ban-nhap]")).toBeNull();
		expect(q("[role=tablist]")).toBeNull();
		expect(q("[data-slot=sheet-content]")?.getAttribute("data-size")).toBe(
			"kara",
		);
	});

	test("rộng, có nháp: bản nháp đứng trước Kara, không thanh kéo", async () => {
		traLai = beRong(1440);
		datDanhSach({ dong: BAN_NHAP });
		await moTrang();
		const nhap = q("[data-o=ban-nhap]");
		const kara = q("[data-o=hoi-thoai]");
		if (!nhap || !kara) throw new Error("thieu o");
		expect(
			`ban nhap khong o ben trai: ${Boolean(nhap.compareDocumentPosition(kara) & Node.DOCUMENT_POSITION_FOLLOWING)}`,
		).toBe("ban nhap khong o ben trai: true");
		expect(
			`con thanh keo: ${qa("[data-slot=resizable-handle],[data-slot=resizable-panel-group]").length}`,
		).toBe("con thanh keo: 0");
	});

	test("bản nháp đầu tới: khung rộng ra, ô soạn không bị dựng lại", async () => {
		traLai = beRong(1440);
		await moTrang();
		const oSoan = q("[data-o=hoi-thoai] textarea");
		expect(oSoan).not.toBeNull();
		datDanhSach({ dong: BAN_NHAP });
		await lamMoiSauLuot();
		await cho(() => q("[data-o=ban-nhap]") !== null, "ban nhap toi");
		expect(q("[data-o=hoi-thoai] textarea") === oSoan).toBe(true);
	});

	test("hẹp: hai tab Trò chuyện và Bản nháp", async () => {
		traLai = beRong(800);
		datDanhSach({ dong: BAN_NHAP });
		await moTrang();
		const tab = qa("[role=tab]").map((t) => t.textContent?.trim());
		expect(tab).toEqual([
			m.man.tabTroChuyen,
			m.man.tabBanNhap(String(BAN_NHAP.length)),
		]);
	});

	test("đếm ô sk-khung", () => {
		expect(soO).toBe(4);
	});
});

describe("sk-dau", () => {
	const O = [
		"dang-mo",
		"kara-soan-ban-dau",
		"co-nhap",
		"khong-mo",
		"chua-cau-hinh",
		"cuoc-dong",
	] as const;

	test("ma trận sáu trạng thái viết trước: một đầu khung, lượt ở cột Kara, không ô bản nháp rỗng khi Kara soạn", async () => {
		let soO = 0;
		for (const ca of O) {
			datLai();
			if (ca === "dang-mo") {
				dat("okr.soanDanhSach", () => new Promise(() => {}));
				datQuyen();
				await mo(<TrangSoan cuocSoanId={CUOC.id} cauNoi />);
				expect(q("[data-kara-state='working']")).not.toBeNull();
			} else if (ca === "kara-soan-ban-dau") {
				await moTrang();
				await datAgent({ status: "streaming" });
				expect(
					`o ban nhap rong khi kara soan: ${qa("[data-o=ban-nhap]").length}`,
				).toBe("o ban nhap rong khi kara soan: 0");
				const dauKara = q("[data-o=hoi-thoai] [data-slot=kara-dock-header]");
				expect(
					dauKara?.querySelector("[data-kara-state='working']"),
				).not.toBeNull();
				expect(document.body.textContent?.includes(m.banNhap.rong)).toBe(false);
			} else if (ca === "co-nhap") {
				datDanhSach({ dong: BAN_NHAP });
				await moTrang();
				const moTa = q("[data-dau-soan]");
				expect(moTa?.querySelector("[translate='no']")?.textContent).toBe(
					CUOC.tenDonVi,
				);
				expect(moTa?.textContent).toContain(CUOC.tenChuKy);
				const luot = m.man.luot(String(CUOC.soLuot), String(CUOC.tranLuot));
				expect(q("[data-slot=sheet-header]")?.textContent).not.toContain(luot);
				const dauKara = q("[data-o=hoi-thoai] [data-slot=kara-dock-header]");
				expect(dauKara?.querySelector("[data-slot=kara-mark]")).not.toBeNull();
				expect(dauKara?.textContent).toContain(luot);
			} else if (ca === "khong-mo") {
				dat("okr.soanDanhSach", () => {
					throw new Error("NOT_FOUND");
				});
				await moTrang();
				expect(q("[data-kara-state='error']")).not.toBeNull();
			} else if (ca === "chua-cau-hinh") {
				await moTrang(false, false);
				expect(q("[data-kara-state='unconfigured']")).not.toBeNull();
			} else {
				datDanhSach({ cuoc: { ...CUOC, trangThai: "bo" }, dong: BAN_NHAP });
				await moTrang();
				expect(document.body.textContent).toContain(m.hoiThoai.cuocDong);
			}
			expect(qa("[data-slot=sheet-header]").length).toBe(1);
			expect(q("[data-slot=sheet-header]")?.textContent).toContain(
				m.trang.tieuDe,
			);
			expect(
				`con dau trang rieng: ${qa("[data-slot=page-shell-title],[data-nut=ve-theo-don-vi]").length}`,
			).toBe("con dau trang rieng: 0");
			expect(q("[data-slot=spinner]")).toBeNull();
			soO += 1;
			await don();
		}
		expect(soO).toBe(6);
	});
});

describe("sk-dong", () => {
	let soO = 0;
	afterEach(() => {
		soO += 1;
	});

	async function moKhiSoan(dangSoan: boolean): Promise<void> {
		datDanhSach({ dong: BAN_NHAP });
		await moKhungBanGhi("record=soan:cuoc-1");
		await cho(() => q("[data-trang-soan='dang']") !== null, "khung mo");
		if (dangSoan) await datAgent({ status: "streaming" });
		await nhip(5);
	}

	const hop = () => q("[role=alertdialog]");

	for (const cach of ["ra-ngoai", "esc", "nut-dong"] as const) {
		test(`Kara đang soạn × ${cach}`, async () => {
			await moKhiSoan(true);
			if (cach === "ra-ngoai") {
				await bamLopPhu();
				expect(
					`ra ngoai dong khung khi dang soan: ${q("[data-slot=sheet-content]") === null}`,
				).toBe("ra ngoai dong khung khi dang soan: false");
				expect(hop()).toBeNull();
				return;
			}
			if (cach === "esc") await esc();
			else await act(async () => nutDong()?.click());
			await nhip(5);
			expect(hop()?.textContent).toContain(m.trang.hoiDong.tieuDe);
			expect(hop()?.textContent).toContain(m.trang.hoiDong.than);
			await bam(nut(m.trang.hoiDong.thoi, hop() ?? document.body));
			expect(hop()).toBeNull();
			expect(q("[data-slot=sheet-content]")).not.toBeNull();
			await act(async () => nutDong()?.click());
			await nhip(5);
			const truoc = urlDoi.length;
			await bam(nut(m.trang.hoiDong.nut, hop() ?? document.body));
			await nhip(5);
			expect(`bo record: ${daBoRecord(truoc)}`).toBe("bo record: true");
			expect(`dong khung dung luot: ${daDung}`).toBe("dong khung dung luot: 0");
		});
	}

	for (const cach of ["ra-ngoai", "esc", "nut-dong"] as const) {
		test(`Kara rảnh × ${cach}`, async () => {
			await moKhiSoan(false);
			const truoc = urlDoi.length;
			if (cach === "ra-ngoai") await bamLopPhu();
			else if (cach === "esc") await esc();
			else await act(async () => nutDong()?.click());
			await nhip(5);
			expect(hop()).toBeNull();
			expect(`bo record: ${daBoRecord(truoc)}`).toBe("bo record: true");
		});
	}

	test("đóng xong focus về nút đã mở khung", async () => {
		datDanhSach({ dong: BAN_NHAP });
		datQuyen();
		function NutMo() {
			const moBanGhi = useOpenRecord();
			return (
				<button
					type="button"
					data-nut-mo
					onClick={() => moBanGhi({ kind: "soan", id: CUOC.id })}
				>
					mo
				</button>
			);
		}
		await mo(
			<>
				<NutMo />
				<RecordSheetHost cauNoiOkr />
			</>,
		);
		const nutMo = q("[data-nut-mo]") as HTMLButtonElement;
		nutMo.focus();
		await act(async () => nutMo.click());
		await cho(() => nutDong() !== null, "nut dong");
		await act(async () => nutDong()?.click());
		await nhip(10);
		expect(document.activeElement === nutMo).toBe(true);
	});

	test("đếm ô sk-dong", () => {
		expect(soO).toBe(7);
	});
});
