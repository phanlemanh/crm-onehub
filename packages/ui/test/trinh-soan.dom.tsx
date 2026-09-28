import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { act } from "react";
import { donDep, dung, GOI_Y, NHAN_NUT, NHAN_O } from "./trinh-soan-vat";

const NUT_VIET_TRUOC = [
	["tieuDe2", "tieu de 2"],
	["tieuDe3", "tieu de 3"],
	["dam", "dam"],
	["nghieng", "nghieng"],
	["danhSachSo", "danh sach so"],
	["danhSachCham", "danh sach cham"],
	["bang", "bang"],
	["lienKet", "lien ket"],
	["hoanTac", "hoan tac"],
	["lamLai", "lam lai"],
] as const;

const NHAN_CAM = /ảnh|hình|màu|cỡ chữ|phông|image|picture|colou?r|font|size/i;

const DOAN = "Một đoạn văn";

afterEach(donDep);

function cuoi(phat: string[]): string {
	const md = phat.at(-1);
	if (md === undefined) throw new Error("trinh soan chua phat markdown");
	return md;
}

describe("E9 o soan", () => {
	test("o soan la textbox nhieu dong co nhan, goi y va khong dich", () => {
		const t = dung("");
		const o = t.o();
		expect(o.getAttribute("role")).toBe("textbox");
		expect(o.getAttribute("aria-multiline")).toBe("true");
		expect(o.getAttribute("aria-label")).toBe(NHAN_O);
		expect(o.getAttribute("aria-placeholder")).toBe(GOI_Y);
		expect(o.getAttribute("translate")).toBe("no");
	});
});

describe("E9 nhan nut", () => {
	for (const [k, ten] of NUT_VIET_TRUOC) {
		test(`nut co nhan: ${ten}`, () => {
			const t = dung(DOAN);
			const nhan = t.nut(k).getAttribute("aria-label")?.trim() ?? "";
			if (nhan === "") throw new Error(`nut thieu nhan: ${ten}`);
			expect(nhan).toBe(NHAN_NUT[k]);
		});
	}

	test("tap nut dung bang danh sach viet truoc, khong nut anh, mau, co chu", () => {
		const t = dung(DOAN);
		const nut = Array.from(t.thanh().querySelectorAll("button"));
		const nhan = nut.map((n) => n.getAttribute("aria-label") ?? "").sort();
		expect(nhan).toEqual(NUT_VIET_TRUOC.map(([k]) => NHAN_NUT[k]).sort());
		const cam = nut.filter((n) =>
			NHAN_CAM.test(`${n.getAttribute("aria-label")} ${n.title}`),
		);
		expect(cam.map((n) => n.getAttribute("aria-label"))).toEqual([]);
	});
});

describe("E9 bam nut tren doan chon", () => {
	test("tieu de 2", () => {
		const t = dung(DOAN);
		t.chon(1, 1 + DOAN.length);
		t.bam(t.nut("tieuDe2"));
		expect(cuoi(t.phat)).toBe(`## ${DOAN}`);
	});

	test("tieu de 3", () => {
		const t = dung(DOAN);
		t.chon(1, 1 + DOAN.length);
		t.bam(t.nut("tieuDe3"));
		expect(cuoi(t.phat)).toBe(`### ${DOAN}`);
	});

	test("dam", () => {
		const t = dung(DOAN);
		t.chon(1, 4);
		t.bam(t.nut("dam"));
		expect(cuoi(t.phat)).toBe("**Một** đoạn văn");
	});

	test("nghieng", () => {
		const t = dung(DOAN);
		t.chon(1, 4);
		t.bam(t.nut("nghieng"));
		expect(cuoi(t.phat)).toBe("*Một* đoạn văn");
	});

	test("danh sach so", () => {
		const t = dung(DOAN);
		t.chon(1, 4);
		t.bam(t.nut("danhSachSo"));
		expect(cuoi(t.phat)).toBe(`1. ${DOAN}`);
	});

	test("danh sach cham", () => {
		const t = dung(DOAN);
		t.chon(1, 4);
		t.bam(t.nut("danhSachCham"));
		expect(cuoi(t.phat)).toBe(`- ${DOAN}`);
	});

	test("bang", () => {
		const t = dung(DOAN);
		t.chon(1 + DOAN.length, 1 + DOAN.length);
		t.bam(t.nut("bang"));
		const md = cuoi(t.phat);
		expect(md.startsWith(`${DOAN}\n`)).toBe(true);
		expect(md).toMatch(/^\| -+ \| -+ \| -+ \|$/m);
		expect(t.editor().getJSON().content?.[1]?.type).toBe("table");
	});

	test("lien ket", () => {
		const t = dung(DOAN);
		t.chon(1, 4);
		t.bam(t.nut("lienKet"));
		const o = document.body.querySelector<HTMLInputElement>(
			`input[aria-label="${NHAN_NUT.lienKet}"]`,
		);
		if (!o) throw new Error("khong thay o nhap lien ket");
		act(() => {
			o.value = "https://vi.wikipedia.org/wiki/Hoa_hồng";
			o.dispatchEvent(
				new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
			);
		});
		expect(cuoi(t.phat)).toBe(
			"[Một](https://vi.wikipedia.org/wiki/Hoa_hồng) đoạn văn",
		);
	});

	test("hoan tac roi lam lai", () => {
		const t = dung(DOAN);
		t.chon(1, 4);
		t.bam(t.nut("dam"));
		expect(cuoi(t.phat)).toBe("**Một** đoạn văn");
		t.bam(t.nut("hoanTac"));
		expect(cuoi(t.phat)).toBe(DOAN);
		t.bam(t.nut("lamLai"));
		expect(cuoi(t.phat)).toBe("**Một** đoạn văn");
	});
});

describe("E9 go dau dong", () => {
	test('go "1. " dau dong thanh danh sach so', () => {
		const t = dung("");
		t.go("1. mục một");
		expect(t.editor().getJSON().content?.[0]?.type).toBe("orderedList");
		expect(cuoi(t.phat)).toBe("1. mục một");
	});

	test('go "- " dau dong thanh danh sach cham', () => {
		const t = dung("");
		t.go("- mục một");
		expect(t.editor().getJSON().content?.[0]?.type).toBe("bulletList");
		expect(cuoi(t.phat)).toBe("- mục một");
	});
});

describe("E9 thanh cong cu ban phim", () => {
	test("dung mot nut nhan tab, mui ten chuyen focus, nut khoa bi bo qua", () => {
		const t = dung(DOAN);
		const vao = () =>
			Array.from(t.thanh().querySelectorAll<HTMLElement>("button")).filter(
				(n) => n.tabIndex === 0,
			);
		expect(vao().map((n) => n.dataset.nut)).toEqual(["tieuDe2"]);
		expect(t.nut("hoanTac").hasAttribute("disabled")).toBe(true);

		const phim = (key: string) => {
			act(() => {
				document.activeElement?.dispatchEvent(
					new window.KeyboardEvent("keydown", { key, bubbles: true }),
				);
			});
		};

		act(() => {
			t.nut("tieuDe2").focus();
		});
		phim("ArrowRight");
		expect(document.activeElement).toBe(t.nut("tieuDe3"));
		expect(vao().map((n) => n.dataset.nut)).toEqual(["tieuDe3"]);
		phim("ArrowLeft");
		expect(document.activeElement).toBe(t.nut("tieuDe2"));
		phim("ArrowLeft");
		expect(document.activeElement).toBe(t.nut("lienKet"));
		phim("Home");
		expect(document.activeElement).toBe(t.nut("tieuDe2"));
		phim("End");
		expect(document.activeElement).toBe(t.nut("lienKet"));
	});
});

describe("dan-co-anh", () => {
	test("dan noi dung co anh, mau, phong la: anh bi bo, chu con, khong loi", () => {
		const loi = spyOn(console, "error");
		const t = dung("");
		t.dan(
			[
				'<p style="font-family:Comic Sans MS">Chữ <span style="color:#ff0000;font-size:28px">màu</span> ',
				'<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" alt="ảnh">',
				'<font face="Wingdings" color="blue">còn lại</font></p>',
				'<p><img src="https://example.com/a.png"></p>',
			].join(""),
			"Chữ màu còn lại",
		);
		const md = cuoi(t.phat);
		expect(md).toBe("Chữ màu còn lại");
		for (const chuoi of ["![", "img", "color", "font", "style=", "data:"]) {
			expect(md.includes(chuoi)).toBe(false);
		}
		expect(t.o().querySelector("img")).toBeNull();
		expect(loi).not.toHaveBeenCalled();
		loi.mockRestore();
	});
});
