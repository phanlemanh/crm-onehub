import { describe, expect, test } from "bun:test";
import { cauChuaLienKet, chuThuong } from "../src/tai-lieu-markdown";
import { boDauTungKyTu, doanTrich, dungTruyVan } from "../src/tai-lieu-tim";

describe("tai-lieu-tim", () => {
	test("tai-lieu-tim: truy van tach tu, bo ky hieu, NFC", () => {
		expect(dungTruyVan("Quy Định")?.tsquery).toBe("quy & định:*");
		expect(dungTruyVan("a & b | c:*")?.tsquery).toBe("a & b & c:*");
		expect(dungTruyVan("  (hoa)  !hồng ")?.tu).toEqual(["hoa", "hồng"]);
		expect(dungTruyVan("Quy Định".normalize("NFD"))?.tsquery).toBe(
			"quy & định:*",
		);
		expect(dungTruyVan("q")).toBeNull();
		expect(dungTruyVan("!!!")).toBeNull();
		expect(dungTruyVan("")).toBeNull();
	});

	test("tai-lieu-tim: bo dau giu dung vi tri tung ky tu", () => {
		const s = "Điều 3 — Hoa hồng ĐẠI LÝ";
		expect(boDauTungKyTu(s)).toBe("dieu 3 — hoa hong dai ly");
		expect(Array.from(boDauTungKyTu(s)).length).toBe(Array.from(s).length);
	});

	test("tai-lieu-tim: doan trich khop dung tu, giu chu co dau", () => {
		const cau = "Chính sách hoa hồng cho công ty đối tác";
		const d = doanTrich(cau, ["hoa", "ho"], 60);
		expect(d?.khop).toBe("hoa");
		expect(`${d?.truoc}${d?.khop}${d?.sau}`).toBe(cau);
		const tienTo = doanTrich(cau, ["cong", "ty", "đố"], 60);
		expect(tienTo?.khop).toBe("công");
		const giuaTu = doanTrich("Thoả hoahong", ["hoa"], 60);
		expect(giuaTu?.khop).toBe("hoa");
		expect(doanTrich("Thoả thuận", ["hoa"], 60)).toBeNull();
		expect(doanTrich(cau, ["dong"], 60)).toBeNull();
	});

	test("tai-lieu-tim: doan trich cat theo ranh gioi tu", () => {
		const dai = `${"mở đầu ".repeat(30)}hoa hồng ${"kết thúc ".repeat(30)}`;
		const d = doanTrich(dai, ["hoa"], 20);
		expect(d?.khop).toBe("hoa");
		expect((d?.truoc.length ?? 0) <= 20).toBe(true);
		expect(d?.truoc.startsWith("mở") || d?.truoc.startsWith("đầu")).toBe(true);
		expect(dai.includes(`${d?.truoc}${d?.khop}${d?.sau}`)).toBe(true);
	});

	test("tai-lieu-tim: chu thuong cua markdown", () => {
		expect(
			chuThuong("## Tiêu đề\n\nĐoạn **đậm** và [liên kết](/ws/tai-lieu/a)."),
		).toBe("Tiêu đề\nĐoạn đậm và liên kết.");
		expect(chuThuong("- một\n- hai\n")).toBe("một\nhai");
	});

	test("tai-lieu-tim: cau chua lien ket theo khoi gan nhat", () => {
		const bang =
			"| A | B |\n| --- | --- |\n| xem [quy định](/ws/tai-lieu/d) | y |\n";
		expect(cauChuaLienKet(bang, "d")).toEqual({
			cau: "xem quy định",
			vanBan: "quy định",
			soLan: 1,
		});
		const haiLan =
			"Đọc [lần đầu](/ws/tai-lieu/d) ở đây.\n\nRồi [lần hai](/tai-lieu/d) ở kia.\n";
		expect(cauChuaLienKet(haiLan, "d")).toEqual({
			cau: "Đọc lần đầu ở đây.",
			vanBan: "lần đầu",
			soLan: 2,
		});
		expect(cauChuaLienKet("## Xem [trang D](/ws/tai-lieu/d)\n", "d")?.cau).toBe(
			"Xem trang D",
		);
		expect(cauChuaLienKet("Không có gì.\n", "d")).toBeNull();
		const cauDai = `${"chữ ".repeat(80)}[đích](/ws/tai-lieu/d)${" đuôi".repeat(80)}`;
		const cat = cauChuaLienKet(cauDai, "d");
		expect(cat?.vanBan).toBe("đích");
		expect((cat?.cau.length ?? 0) <= 160).toBe(true);
		expect(cat?.cau.includes("đích")).toBe(true);
	});
});
