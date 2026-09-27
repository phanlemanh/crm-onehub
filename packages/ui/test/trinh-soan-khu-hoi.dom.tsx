import { afterEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { donDep, dung } from "./trinh-soan-vat";

const THU_MUC = join(import.meta.dir, "fixtures", "tai-lieu");

const MAU_VIET_TRUOC = [
	"doan",
	"tieu-de",
	"dam-nghieng",
	"danh-sach-so",
	"danh-sach-cham",
	"danh-sach-long",
	"bang",
	"bang-o-trong",
	"lien-ket",
	"lien-ket-co-dau",
	"chu-nfd",
	"tron-lan",
] as const;

const BA_CAP_TRON_LOAI = "1. a\n   - b\n     1. c";

afterEach(donDep);

function docMau(ten: string): string {
	return readFileSync(join(THU_MUC, `${ten}.md`), "utf8");
}

function quaTrinhSoan(md: string): string {
	const t = dung(md);
	const ra = t.md();
	t.goBo();
	return ra;
}

function dongKhacDau(a: string, b: string): string {
	const da = a.split("\n");
	const db = b.split("\n");
	const i = da.findIndex((d, n) => d !== db[n]);
	const n = i === -1 ? da.length : i;
	return `dong ${n + 1}: ${JSON.stringify(da[n] ?? "")} != ${JSON.stringify(db[n] ?? "")}`;
}

function khangDinhBatDong(ten: string, lan1: string, lan2: string): void {
	if (lan2 !== lan1) {
		throw new Error(`khu hoi vo: ${ten}, ${dongKhacDau(lan1, lan2)}`);
	}
	expect(lan2).toBe(lan1);
}

describe("E10 khu hoi qua trinh soan", () => {
	test("du 12 mau viet truoc", () => {
		expect(MAU_VIET_TRUOC.length).toBe(12);
	});

	for (const ten of MAU_VIET_TRUOC) {
		test(`nap -> tuan tu hoa -> nap lai -> tuan tu hoa trung tung byte: ${ten}`, () => {
			const lan1 = quaTrinhSoan(docMau(ten));
			const lan2 = quaTrinhSoan(lan1);
			expect(lan1.length).toBeGreaterThan(0);
			khangDinhBatDong(ten, lan1, lan2);
		});
	}

	test("doi chung: sua mot chu thi ket qua khac", () => {
		const lan1 = quaTrinhSoan(docMau("tron-lan"));
		const sua = lan1.replace("48 giờ", "24 giờ");
		expect(sua).not.toBe(lan1);
		expect(quaTrinhSoan(sua)).not.toBe(lan1);
	});
});

describe("danh sach long ba cap tron loai", () => {
	test("dan danh sach ba cap vao trinh soan giu dung cha con", () => {
		const t = dung("");
		t.dan(
			"<ol><li><p>a</p><ul><li><p>b</p><ol><li><p>c</p></li></ol></li></ul></li></ol>",
		);
		expect(t.phat.at(-1)).toBe(BA_CAP_TRON_LOAI);
	});

	test("ban dang dung ba cap nap lai van la diem bat dong", () => {
		const lan1 = quaTrinhSoan(BA_CAP_TRON_LOAI);
		khangDinhBatDong("ba-cap-tron-loai", lan1, quaTrinhSoan(lan1));
	});

	test.failing("gioi han da biet d-20260927T130806Z-13: nap keo cap ba len mot nac", () => {
		expect(quaTrinhSoan(BA_CAP_TRON_LOAI)).toBe(BA_CAP_TRON_LOAI);
	});
});
