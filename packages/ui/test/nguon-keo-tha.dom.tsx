import { afterEach, describe, expect, mock, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { NguonKeoTha } from "../src/components/nguon-keo-tha";

let root: Root | null = null;
let khung: HTMLElement | null = null;

function don(): void {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
}

afterEach(don);

const MB = 1024 * 1024;
const VUNG = {
	nhan: "Kéo tệp vào đây, hoặc chọn tệp",
	moTa: "Word (.docx) hoặc PDF, tới 20 MB",
	nutChon: "Chọn tệp",
	chapNhan: ".docx,.pdf",
	toiDaByte: 20 * MB,
};
const LY_DO_TAT = "Chưa bật lưu tệp nguồn — nhờ quản trị cấu hình";

function ghim(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

function ve(cay: ReactElement): HTMLElement {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() => root?.render(cay));
	return khung;
}

function vung(goc: HTMLElement): HTMLElement {
	const v = goc.querySelector<HTMLElement>('[data-slot="nguon-keo-tha"]');
	if (!v) throw new Error("khong thay vung keo tha");
	return v;
}

function nut(goc: HTMLElement): HTMLButtonElement {
	const n = vung(goc).querySelector("button");
	if (!n) throw new Error("khong thay nut chon");
	return n;
}

function oTep(goc: HTMLElement): HTMLInputElement {
	const o = vung(goc).querySelector<HTMLInputElement>('input[type="file"]');
	if (!o) throw new Error("khong thay o tep");
	return o;
}

function tapId(e: Element): string[] {
	return (e.getAttribute("aria-describedby") ?? "")
		.split(/\s+/)
		.filter(Boolean)
		.sort();
}

function demBam(o: HTMLInputElement) {
	const dem = { so: 0 };
	o.addEventListener("click", (e) => {
		dem.so += 1;
		e.preventDefault();
	});
	return dem;
}

function keo(el: Element, loai: string, tu: Node | null = null): void {
	const su = new Event(loai, { bubbles: true, cancelable: true });
	Object.defineProperty(su, "dataTransfer", { value: { files: [] } });
	Object.defineProperty(su, "relatedTarget", { value: tu });
	act(() => {
		el.dispatchEvent(su);
	});
}

function chon(goc: HTMLElement, f: File): void {
	const o = oTep(goc);
	Object.defineProperty(o, "files", { value: [f], configurable: true });
	act(() => {
		o.dispatchEvent(new Event("change", { bubbles: true }));
	});
}

describe("NguonKeoTha — nút chọn", () => {
	test("nut-chon: bấm nút mở ô tệp", () => {
		const goc = ve(<NguonKeoTha {...VUNG} onChon={() => {}} />);
		const n = nut(goc);
		const o = oTep(goc);
		const dem = demBam(o);
		expect(dem.so).toBe(0);
		expect(n.textContent).toBe(VUNG.nutChon);
		expect(n.getAttribute("data-variant")).toBe("outline");
		act(() => n.click());
		ghim(dem.so === 1, "nut chon khong mo o tep");
		expect(o.tabIndex).toBe(-1);
		expect(o.getAttribute("aria-label")).toBe(VUNG.nutChon);
		expect(n.tabIndex).toBeGreaterThanOrEqual(0);
	});

	test("nut-chon: nút mang mô tả và câu lỗi", () => {
		const sach = ve(<NguonKeoTha {...VUNG} onChon={() => {}} />);
		ghim(
			tapId(nut(sach)).length === 1 &&
				tapId(nut(sach)).join() === tapId(oTep(sach)).join(),
			"nut khong mang mo ta",
		);
		don();
		const loi = "Chỉ nhận Word (.docx) hoặc PDF, tới 20 MB";
		const goc = ve(<NguonKeoTha {...VUNG} loi={loi} onChon={() => {}} />);
		const bao = goc.querySelector('[data-slot="field-error"]');
		ghim(
			tapId(nut(goc)).length === 2 &&
				tapId(nut(goc)).join() === tapId(oTep(goc)).join(),
			"nut khong mang mo ta",
		);
		expect(tapId(nut(goc))).toContain(bao?.id ?? "?");
	});

	test("nut-chon: tắt thì nút khoá", () => {
		const mo = ve(<NguonKeoTha {...VUNG} onChon={() => {}} />);
		expect(nut(mo).disabled).toBe(false);
		don();
		const goc = ve(
			<NguonKeoTha {...VUNG} onChon={() => {}} tat={{ lyDo: LY_DO_TAT }} />,
		);
		const dem = demBam(oTep(goc));
		ghim(nut(goc).disabled, "nut chon khong khoa khi tat");
		act(() => nut(goc).click());
		expect(dem.so).toBe(0);
	});

	test("nut-chon: chọn lại đúng tệp vừa bị từ chối vẫn báo lại", () => {
		const onTuChoi = mock((_: File, __: string) => {});
		const goc = ve(
			<NguonKeoTha {...VUNG} onChon={() => {}} onTuChoi={onTuChoi} />,
		);
		const anh = new File([new Uint8Array(8)], "anh.jpg");
		chon(goc, anh);
		chon(goc, anh);
		expect(onTuChoi.mock.calls).toEqual([
			[anh, "loai"],
			[anh, "loai"],
		]);
	});
});

describe("NguonKeoTha — đang kéo", () => {
	test("dang-keo: kéo vào, ra, thả bật tắt data-keo", () => {
		const goc = ve(<NguonKeoTha {...VUNG} onChon={() => {}} />);
		const v = vung(goc);
		keo(v, "dragenter");
		ghim(v.getAttribute("data-keo") === "true", "keo vao khong bat data-keo");
		keo(v, "dragleave", nut(goc));
		expect(v.getAttribute("data-keo")).toBe("true");
		keo(v, "dragleave", null);
		expect(v.getAttribute("data-keo")).toBe("false");
		keo(v, "dragenter");
		keo(v, "drop");
		expect(v.getAttribute("data-keo")).toBe("false");
	});

	test("dang-keo: vùng tắt không bật data-keo", () => {
		const goc = ve(
			<NguonKeoTha {...VUNG} onChon={() => {}} tat={{ lyDo: LY_DO_TAT }} />,
		);
		const v = vung(goc);
		keo(v, "dragenter");
		ghim(v.getAttribute("data-keo") === "false", "vung tat van bat data-keo");
	});
});

function tha(el: Element, cacTep: File[]): void {
	const su = new Event("drop", { bubbles: true, cancelable: true });
	Object.defineProperty(su, "dataTransfer", { value: { files: cacTep } });
	act(() => {
		el.dispatchEvent(su);
	});
}

function chonNhieu(goc: HTMLElement, cacTep: File[]): void {
	const o = oTep(goc);
	Object.defineProperty(o, "files", { value: cacTep, configurable: true });
	act(() => {
		o.dispatchEvent(new Event("change", { bubbles: true }));
	});
}

describe("NguonKeoTha — nhiều tệp", () => {
	test("nhieu: bật thì mỗi tệp hợp lệ một lần onChon, tệp sai một lần onTuChoi", () => {
		const nhan: string[] = [];
		const tuChoi: string[] = [];
		const goc = ve(
			<NguonKeoTha
				{...VUNG}
				nhieu
				onChon={(f) => nhan.push(f.name)}
				onTuChoi={(f, lyDo) => tuChoi.push(`${f.name}:${lyDo}`)}
			/>,
		);
		ghim(oTep(goc).multiple === true, "nhieu: o tep khong multiple");
		chonNhieu(goc, [
			new File(["a"], "a.pdf", { type: "application/pdf" }),
			new File(["b"], "b.docx"),
			new File(["c"], "c.xlsx"),
		]);
		ghim(nhan.join() === "a.pdf,b.docx", `nhieu: onChon ${nhan.join()}`);
		ghim(tuChoi.join() === "c.xlsx:loai", `nhieu: onTuChoi ${tuChoi.join()}`);
	});

	test("nhieu: thả nhiều tệp nhận đủ, thả lại tệp cũ ở lượt sau vẫn nhận", () => {
		const nhan: string[] = [];
		const goc = ve(
			<NguonKeoTha {...VUNG} nhieu onChon={(f) => nhan.push(f.name)} />,
		);
		const a = new File(["a"], "a.pdf", { type: "application/pdf" });
		const b = new File(["b"], "b.pdf", { type: "application/pdf" });
		tha(vung(goc), [a, b]);
		ghim(nhan.join() === "a.pdf,b.pdf", `nhieu: tha ${nhan.join()}`);
		tha(vung(goc), [a]);
		ghim(nhan.join() === "a.pdf,b.pdf,a.pdf", `nhieu: tha lai ${nhan.join()}`);
	});

	test("nhieu: vắng prop thì vẫn chỉ nhận tệp đầu như cũ", () => {
		const nhan: string[] = [];
		const goc = ve(<NguonKeoTha {...VUNG} onChon={(f) => nhan.push(f.name)} />);
		ghim(oTep(goc).multiple === false, "mac dinh: o tep multiple");
		chonNhieu(goc, [
			new File(["a"], "a.pdf", { type: "application/pdf" }),
			new File(["b"], "b.pdf", { type: "application/pdf" }),
		]);
		ghim(nhan.join() === "a.pdf", `mac dinh: onChon ${nhan.join()}`);
	});
});
