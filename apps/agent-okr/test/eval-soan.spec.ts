import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TRO_LY_OKR_SOAN } from "../agent/lib/config";
import { boCa } from "../evals/okr-soan/ca";
import {
	coDauChen,
	goiThang,
	loiMoDau,
	nhomLanNop,
	phanVi,
	tyLeThang,
	xepAB,
} from "../evals/okr-soan/tinh";
import { docTomTat, docTongKet, ghiTongKet } from "../evals/okr-soan/tong-ket";

const MO_DAU_DUNG = [
	"Kỳ trước phòng đạt 82 % tỷ lệ giao đúng hẹn.",
	"1. Quý này đơn vị muốn ưu tiên điều gì nhất?",
	"- gợi ý: Giữ nhịp đang có · Mở một hướng mới",
	"2. Có con số nào đơn vị đã cam kết với cấp trên?",
	"- gợi ý: Có, tôi sẽ gõ số · Chưa có",
].join("\n");

describe("eval-soan: khuôn lượt mở đầu", () => {
	test("hai câu hỏi đúng khuôn, mỗi câu hai gợi ý → không lỗi", () => {
		expect(loiMoDau(MO_DAU_DUNG)).toEqual([]);
	});

	test("một câu hỏi, gợi ý thiếu, dòng số không phải câu hỏi → lỗi có tên", () => {
		expect(
			loiMoDau("1. Ưu tiên gì?\n- gợi ý: Giữ chân · Mở rộng · Cả hai"),
		).toEqual(["so cau hoi 1", "cau 1 co 3 goi y"]);
		expect(loiMoDau(`${MO_DAU_DUNG}\n3. Tôi sẽ soạn ngay.`)).toEqual([
			"dong so khong phai cau hoi: 3. Tôi sẽ soạn ngay.",
		]);
		expect(loiMoDau("Chào bạn.")).toEqual(["so cau hoi 0"]);
	});
});

describe("eval-soan: tính", () => {
	test("nhomLanNop gom theo inputHash, xếp theo lúc nộp đầu tiên", () => {
		const luc = (s: number) => new Date(s * 1000);
		const nhom = nhomLanNop([
			{ inputHash: "b", createdAt: luc(2), id: 3 },
			{ inputHash: "a", createdAt: luc(1), id: 1 },
			{ inputHash: "a", createdAt: luc(1), id: 2 },
		]);
		expect(nhom.map((n) => n.map((h) => h.id))).toEqual([[1, 2], [3]]);
	});

	test("phanVi nội suy như percentile_cont", () => {
		const so = [10, 1, 9, 2, 8, 3, 7, 4, 6, 5];
		expect(phanVi(so, 0.5)).toBe(5.5);
		expect(phanVi(so, 0.9)).toBeCloseTo(9.1);
		expect(phanVi([], 0.5)).toBeNull();
	});

	test("xepAB, goiThang, tyLeThang đọc đúng phía có gói", () => {
		expect(xepAB("goi", "trong", () => 0.1)).toEqual({
			A: "goi",
			B: "trong",
			phiaCoGoi: "A",
		});
		expect(xepAB("goi", "trong", () => 0.9)).toEqual({
			A: "trong",
			B: "goi",
			phiaCoGoi: "B",
		});
		expect(goiThang("A", true)).toBe(true);
		expect(goiThang("B", false)).toBe(true);
		expect(goiThang("B", true)).toBe(false);
		expect(
			tyLeThang([
				{ phiaCoGoi: "A", aThang: true },
				{ phiaCoGoi: "B", aThang: false },
				{ phiaCoGoi: "A", aThang: false },
				{ phiaCoGoi: "B", aThang: true },
			]),
		).toBe(0.5);
		expect(tyLeThang([])).toBeNull();
	});

	test("coDauChen bắt câu chèn bất kể hoa thường và cách bỏ dấu", () => {
		expect(coDauChen("Đây là danh sách các THOẢ THUẬN")).toBe(true);
		expect(coDauChen("các thỏa thuận")).toBe(true);
		expect(coDauChen(TRO_LY_OKR_SOAN.danhGia.cauChen)).toBe(true);
		expect(coDauChen("Giữ chân đối tác lớn")).toBe(false);
	});

	test("bộ ca có ít nhất soCaToiThieu đơn vị và đúng một ca câu chèn", () => {
		const ca = boCa();
		expect(ca.length).toBeGreaterThanOrEqual(
			TRO_LY_OKR_SOAN.danhGia.soCaToiThieu,
		);
		expect(ca.filter((c) => c.chen).length).toBe(1);
		expect(new Set(ca.map((c) => c.id)).size).toBe(ca.length);
	});
});

describe("eval-soan: tổng kết", () => {
	const bien = TRO_LY_OKR_SOAN.danhGia.env.tongKet;
	let thuMuc = "";
	afterEach(() => {
		delete process.env[bien];
		if (thuMuc) rmSync(thuMuc, { recursive: true, force: true });
	});

	test("ghiTongKet chỉ ghi khi có biến, docTongKet đọc lại đúng khuôn", () => {
		ghiTongKet({ loai: "do-tre", ca: "x", cuoc: 1, ms: [1], usd: 0 });
		thuMuc = mkdtempSync(join(tmpdir(), "eval-soan-"));
		const tep = join(thuMuc, "tong-ket.ndjson");
		process.env[bien] = tep;
		ghiTongKet({ loai: "boi-canh", ca: "pb", A: "a", B: "b", phiaCoGoi: "B" });
		ghiTongKet({
			loai: "do-tre",
			ca: "pb",
			cuoc: 2,
			ms: [1200, 900],
			usd: 0.01,
		});
		expect(docTongKet(readFileSync(tep, "utf8"))).toEqual([
			{ loai: "boi-canh", ca: "pb", A: "a", B: "b", phiaCoGoi: "B" },
			{ loai: "do-tre", ca: "pb", cuoc: 2, ms: [1200, 900], usd: 0.01 },
		]);
	});

	test("docTomTat đọc khuôn summary.json của eve và ném khi thiếu trường", () => {
		const tom = {
			totalEvals: 1,
			passed: 0,
			failed: 0,
			scored: 0,
			skipped: 1,
			evals: [
				{
					id: "okr-soan/soan/0000",
					verdict: "skipped",
					status: "completed",
					assertions: [],
					skipReason: "thieu khoa mo hinh",
				},
			],
		};
		expect(docTomTat(JSON.stringify(tom)).evals[0]?.skipReason).toBe(
			"thieu khoa mo hinh",
		);
		expect(() => docTomTat(JSON.stringify({ evals: [] }))).toThrow();
	});
});
