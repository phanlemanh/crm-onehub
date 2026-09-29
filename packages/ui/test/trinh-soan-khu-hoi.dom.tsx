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

	test("danh sach long ba cap tron loai giu dung cap khi nap", () => {
		expect(quaTrinhSoan(BA_CAP_TRON_LOAI)).toBe(BA_CAP_TRON_LOAI);
	});
});

type NutJson = { type?: string; text?: string; content?: NutJson[] };

function chuCua(nut: NutJson): string {
	return nut.text ?? (nut.content ?? []).map(chuCua).join("");
}

function oBang(doc: NutJson): string[][] | null {
	const bang = (doc.content ?? []).find((n) => n.type === "table");
	if (!bang) return null;
	return (bang.content ?? []).map((hang) => (hang.content ?? []).map(chuCua));
}

const MAU_ONG = [
	{
		ten: "giua",
		md: "| A | B |\n| --- | --- |\n| a\\|b | x |\n",
		o: [
			["A", "B"],
			["a|b", "x"],
		],
	},
	{
		ten: "dau",
		md: "| A | B |\n| --- | --- |\n| \\|x | y |\n",
		o: [
			["A", "B"],
			["|x", "y"],
		],
	},
	{
		ten: "cuoi",
		md: "| A | B |\n| --- | --- |\n| x\\| | y |\n",
		o: [
			["A", "B"],
			["x|", "y"],
		],
	},
	{
		ten: "go-nguyen-van",
		md: "| A | B |\n| --- | --- |\n| \\\\\\| | y |\n",
		o: [
			["A", "B"],
			["\\|", "y"],
		],
	},
	{
		ten: "dam",
		md: "| A | B |\n| --- | --- |\n| **a\\|b** | y |\n",
		o: [
			["A", "B"],
			["a|b", "y"],
		],
	},
	{ ten: "doan-van", md: "a | b\n", o: null },
] as const;

describe("ong-dung", () => {
	test("ong-dung: du 6 mau viet truoc", () => {
		expect(MAU_ONG.length).toBe(6);
	});

	for (const mau of MAU_ONG) {
		test(`ong-dung: khu hoi va giu o: ${mau.ten}`, () => {
			const lan1 = quaTrinhSoan(mau.md);
			const t = dung(lan1);
			const doc = t.editor().getJSON() as NutJson;
			const lan2 = t.md();
			t.goBo();
			const o = oBang(doc);
			if (mau.o === null) {
				expect(o).toBeNull();
				expect(chuCua(doc)).toBe("a | b");
				khangDinhBatDong(`ong-dung ${mau.ten}`, lan1, lan2);
				return;
			}
			const mong = mau.o[1][0];
			if (o?.[1]?.[0] !== mong) {
				const manh = mong.split("|").filter((m) => m.length > 0);
				const tach = (o?.[1] ?? []).filter((c) => manh.includes(c)).length;
				throw new Error(`ong-dung: o '${mong}' tach thanh ${tach} o`);
			}
			expect(o.map((h) => h.length)).toEqual(mau.o.map((h) => h.length));
			expect(o).toEqual(mau.o.map((h) => [...h]));
			khangDinhBatDong(`ong-dung ${mau.ten}`, lan1, lan2);
		});
	}

	test("ong-dung: go a|b vao o bang trong trinh soan thi luu dung", () => {
		const t = dung("");
		t.editor().commands.setContent({
			type: "doc",
			content: [
				{
					type: "table",
					content: [
						{
							type: "tableRow",
							content: ["A", "B"].map((c) => ({
								type: "tableHeader",
								content: [
									{ type: "paragraph", content: [{ type: "text", text: c }] },
								],
							})),
						},
						{
							type: "tableRow",
							content: ["a|b", "x"].map((c) => ({
								type: "tableCell",
								content: [
									{ type: "paragraph", content: [{ type: "text", text: c }] },
								],
							})),
						},
					],
				},
			],
		});
		const md = t.md();
		t.goBo();
		expect(md).toContain("a\\|b");
		const lai = dung(md);
		const o = oBang(lai.editor().getJSON() as NutJson);
		lai.goBo();
		expect(o?.[1]).toEqual(["a|b", "x"]);
	});
});
