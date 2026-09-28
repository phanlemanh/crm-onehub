import { afterEach, describe, expect, mock, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	chiaDoanTrich,
	NguonCanhNhau,
} from "../src/components/nguon-canh-nhau";
import { NguonKeoTha } from "../src/components/nguon-keo-tha";

let root: Root | null = null;
let khung: HTMLElement | null = null;
const matchMediaGoc = window.matchMedia;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
	window.matchMedia = matchMediaGoc;
});

function manRong(rong: boolean): void {
	window.matchMedia = ((query: string) => ({
		matches: rong,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	})) as typeof window.matchMedia;
}

function ve(cay: ReactElement): HTMLElement {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() => root?.render(cay));
	return khung;
}

const CHU_NGUON = [
	"Quyết định số 12/2026 về hoa hồng bán hàng.",
	"",
	"Điều 1. Nhân viên kinh doanh hưởng 20% lợi nhuận gộp của mỗi hợp đồng.",
	"",
	"Điều 2. Hoa hồng được chi trước ngày 15 của tháng kế tiếp.",
	"",
	"Điều 3. Quyết định có hiệu lực từ ngày 01/10/2026.",
].join("\n");

const TRICH = [
	"hưởng 20% lợi nhuận gộp",
	"trước ngày 15 của tháng kế tiếp",
	"hiệu lực từ ngày 01/10/2026",
];

const NHAN = { nhanNguon: "Nguồn", nhanBan: "Bản máy soạn" };

function veCanhNhau(doanTrich: string[] = TRICH): HTMLElement {
	return ve(
		<NguonCanhNhau
			{...NHAN}
			banTrinhBay={<p data-ban-trinh-bay>Hoa hồng 20% lợi nhuận gộp.</p>}
			chuNguon={CHU_NGUON}
			doanTrich={doanTrich}
		/>,
	);
}

function kiemTrich(goc: HTMLElement, doanTrich: string[]): void {
	const chu = goc.querySelector('[data-slot="nguon-chu"]');
	if (!chu) throw new Error("khong thay khung chu nguon");
	if (chu.getAttribute("translate") !== "no")
		throw new Error("chu nguon thieu translate=no");
	const mark = [...chu.querySelectorAll("mark")].map((m) => m.textContent);
	for (const d of doanTrich)
		if (!mark.includes(d)) throw new Error(`thieu mark cho doan trich: «${d}»`);
	if (mark.length !== doanTrich.length)
		throw new Error(
			`so mark ${mark.length} khac so doan trich ${doanTrich.length}`,
		);
}

function kiemHaiThe(goc: HTMLElement): void {
	const the = [...goc.querySelectorAll('[role="tab"]')].map(
		(t) => t.textContent,
	);
	if (the.join("|") !== `${NHAN.nhanNguon}|${NHAN.nhanBan}`)
		throw new Error(`man hep khong thanh hai the: [${the.join("|")}]`);
}

function bamThe(goc: HTMLElement, ten: string): void {
	const the = [...goc.querySelectorAll('[role="tab"]')].find(
		(t) => t.textContent === ten,
	);
	if (!(the instanceof HTMLElement)) throw new Error(`khong thay the ${ten}`);
	act(() => {
		the.dispatchEvent(
			new MouseEvent("mousedown", { bubbles: true, button: 0 }),
		);
	});
}

describe("NguonCanhNhau — đoạn trích tô nền", () => {
	test("mỗi đoạn trích là đúng một mark, chữ nguồn giữ nguyên từng ký tự", () => {
		manRong(true);
		const goc = veCanhNhau();
		expect(() => kiemTrich(goc, TRICH)).not.toThrow();
		const chu = goc.querySelector('[data-slot="nguon-chu"]');
		expect(chu?.textContent).toBe(CHU_NGUON);
		for (const m of chu?.querySelectorAll("mark") ?? [])
			expect(m.className).toContain("bg-warning/");
	});

	test("chiều đỏ: đoạn trích không có trong nguồn thì không có mark, phép kiểm nói rõ đoạn nào", () => {
		manRong(true);
		const lech = [...TRICH.slice(0, 2), "hiệu lực từ ngày 01/11/2026"];
		const goc = veCanhNhau(lech);
		expect(goc.querySelectorAll("mark")).toHaveLength(2);
		expect(() => kiemTrich(goc, lech)).toThrow(
			"thieu mark cho doan trich: «hiệu lực từ ngày 01/11/2026»",
		);
	});

	test("chiều đỏ: chữ nguồn không gắn translate=no thì phép kiểm bác", () => {
		const goc = ve(
			<div>
				<div data-slot="nguon-chu">
					<mark>{TRICH[0]}</mark>
				</div>
			</div>,
		);
		expect(() => kiemTrich(goc, [TRICH[0] ?? ""])).toThrow(
			"chu nguon thieu translate=no",
		);
	});

	test("hai đoạn trích chồng nhau gộp thành một mark, không lặp chữ", () => {
		const doan = chiaDoanTrich("abcdefgh", ["bcd", "cdef", "zz", ""]);
		expect(doan).toEqual([
			{ chu: "a", trich: false },
			{ chu: "bcdef", trich: true },
			{ chu: "gh", trich: false },
		]);
		expect(doan.map((d) => d.chu).join("")).toBe("abcdefgh");
	});

	test("hai đoạn trích liền nhau vẫn là hai mark", () => {
		expect(chiaDoanTrich("abcdef", ["cd", "ab"])).toEqual([
			{ chu: "ab", trich: true },
			{ chu: "cd", trich: true },
			{ chu: "ef", trich: false },
		]);
	});
});

describe("NguonCanhNhau — bố cục theo bề rộng", () => {
	test("màn rộng: hai cột cạnh nhau, không có thẻ, bản trình bày vẽ một lần", () => {
		manRong(true);
		const goc = veCanhNhau();
		const khungCanh = goc.querySelector('[data-slot="nguon-canh-nhau"]');
		expect(khungCanh?.getAttribute("data-bo-cuc")).toBe("hai-cot");
		expect(goc.querySelectorAll('[role="tab"]')).toHaveLength(0);
		expect(goc.querySelectorAll("[data-ban-trinh-bay]")).toHaveLength(1);
		expect(
			[...goc.querySelectorAll('[data-slot="card-title"]')].map(
				(t) => t.textContent,
			),
		).toEqual([NHAN.nhanNguon, NHAN.nhanBan]);
		expect(() => kiemHaiThe(goc)).toThrow("man hep khong thanh hai the: []");
	});

	test("màn hẹp: hai thẻ Nguồn / Bản máy soạn, mở ở Nguồn, bấm thẻ kia thì thấy bản", () => {
		manRong(false);
		const goc = veCanhNhau();
		expect(
			goc
				.querySelector('[data-slot="nguon-canh-nhau"]')
				?.getAttribute("data-bo-cuc"),
		).toBe("hai-the");
		expect(() => kiemHaiThe(goc)).not.toThrow();
		expect(() => kiemTrich(goc, TRICH)).not.toThrow();
		expect(goc.querySelector("[data-ban-trinh-bay]")).toBeNull();
		bamThe(goc, NHAN.nhanBan);
		expect(goc.querySelectorAll("[data-ban-trinh-bay]")).toHaveLength(1);
		expect(goc.querySelector('[data-slot="nguon-chu"]')).toBeNull();
	});
});

function tep(ten: string, byte = 1024): File {
	const f = new File(["x"], ten);
	Object.defineProperty(f, "size", { value: byte });
	return f;
}

const MB = 1024 * 1024;

const KEO_THA = {
	nhan: "Kéo tệp vào đây, hoặc chọn tệp",
	moTa: "Word (.docx) hoặc PDF, tới 20 MB",
	chapNhan: ".docx,.pdf",
	toiDaByte: 20 * MB,
};

function chonTep(goc: HTMLElement, f: File): void {
	const o = goc.querySelector('input[type="file"]');
	if (!(o instanceof HTMLInputElement)) throw new Error("khong thay o tep");
	Object.defineProperty(o, "files", { value: [f], configurable: true });
	act(() => {
		o.dispatchEvent(new Event("change", { bubbles: true }));
	});
}

function thaTep(goc: HTMLElement, f: File): void {
	const vung = goc.querySelector('[data-slot="nguon-keo-tha"]');
	if (!vung) throw new Error("khong thay vung keo tha");
	const su = new Event("drop", { bubbles: true, cancelable: true });
	Object.defineProperty(su, "dataTransfer", { value: { files: [f] } });
	act(() => {
		vung.dispatchEvent(su);
	});
}

describe("NguonKeoTha", () => {
	test("hiện nhãn, mô tả; ô tệp nhận đúng loại và được mô tả", () => {
		const goc = ve(<NguonKeoTha {...KEO_THA} onChon={() => {}} />);
		expect(goc.textContent).toContain(KEO_THA.nhan);
		expect(goc.textContent).toContain(KEO_THA.moTa);
		const o = goc.querySelector('input[type="file"]');
		expect(o?.getAttribute("accept")).toBe(".docx,.pdf");
		const moTa = o?.getAttribute("aria-describedby") ?? "";
		expect(document.getElementById(moTa.split(" ")[0] ?? "")?.textContent).toBe(
			KEO_THA.moTa,
		);
		expect(o?.getAttribute("aria-invalid")).toBeNull();
	});

	test("chọn hay thả một tệp đúng loại, đúng cỡ thì gọi onChon đúng tệp đó", () => {
		const onChon = mock((_: File) => {});
		const goc = ve(<NguonKeoTha {...KEO_THA} onChon={onChon} />);
		const a = tep("Quyet-dinh.DOCX", MB);
		const b = tep("quy-trinh.pdf", 20 * MB);
		chonTep(goc, a);
		thaTep(goc, b);
		expect(onChon.mock.calls.map((c) => c[0])).toEqual([a, b]);
	});

	test("chiều đỏ: sai loại hay quá cỡ thì không gọi onChon, báo lý do qua onTuChoi", () => {
		const onChon = mock((_: File) => {});
		const onTuChoi = mock((_: File, __: string) => {});
		const goc = ve(
			<NguonKeoTha {...KEO_THA} onChon={onChon} onTuChoi={onTuChoi} />,
		);
		const anh = tep("anh.jpg");
		const to = tep("lon.pdf", 21 * MB);
		chonTep(goc, anh);
		thaTep(goc, to);
		expect(onChon).not.toHaveBeenCalled();
		expect(onTuChoi.mock.calls).toEqual([
			[anh, "loai"],
			[to, "co"],
		]);
	});

	test("có lỗi thì câu lỗi gắn vào ô tệp qua aria-describedby", () => {
		const loi = "Chỉ nhận Word (.docx) hoặc PDF, tới 20 MB";
		const goc = ve(<NguonKeoTha {...KEO_THA} loi={loi} onChon={() => {}} />);
		const o = goc.querySelector('input[type="file"]');
		const bao = goc.querySelector('[data-slot="field-error"]');
		expect(bao?.textContent).toBe(loi);
		expect(o?.getAttribute("aria-invalid")).toBe("true");
		expect((o?.getAttribute("aria-describedby") ?? "").split(" ")).toContain(
			bao?.id ?? "?",
		);
	});

	test("tắt: ô tệp khoá, lý do hiện ra, thả tệp không gọi onChon", () => {
		const onChon = mock((_: File) => {});
		const lyDo = "Chưa bật lưu tệp nguồn — nhờ quản trị cấu hình";
		const goc = ve(<NguonKeoTha {...KEO_THA} onChon={onChon} tat={{ lyDo }} />);
		const o = goc.querySelector('input[type="file"]');
		expect(o?.hasAttribute("disabled")).toBe(true);
		expect(goc.textContent).toContain(lyDo);
		thaTep(goc, tep("a.pdf"));
		expect(onChon).not.toHaveBeenCalled();
		expect(
			goc
				.querySelector('[data-slot="nguon-keo-tha"]')
				?.getAttribute("data-tat"),
		).toBe("true");
	});
});
