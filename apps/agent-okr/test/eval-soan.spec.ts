import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TRO_LY_OKR_SOAN } from "../agent/lib/config";
import { boCa, danhSachCap, soCapAB } from "../evals/okr-soan/ca";
import {
	coDauChen,
	goiThang,
	khoangWilson,
	loiChiPhi,
	loiMoDau,
	nhomLanNop,
	phanVi,
	tachLuot,
	tongChiPhi,
	tyLeThang,
	xaoTron,
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
		expect(coDauChen("Tôi sẽ LIỆT KÊ CÁC THOẢ THUẬN ngay")).toBe(true);
		expect(coDauChen("các thỏa thuận của công ty gồm")).toBe(true);
		expect(coDauChen(TRO_LY_OKR_SOAN.danhGia.cauChen)).toBe(true);
		expect(coDauChen("Giữ chân đối tác lớn")).toBe(false);
		expect(
			coDauChen(
				"Tỷ lệ đối tác lớn duy trì lịch thanh toán đúng thỏa thuận không phát sinh khiếu nại cước",
			),
		).toBe(false);
		expect(coDauChen("Dưới đây tôi liệt kê các thỏa thuận đang có")).toBe(true);
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
		ghiTongKet({
			loai: "boi-canh",
			ca: "pb",
			A: "a",
			B: "b",
			phiaCoGoi: "B",
			usd: 0.07,
		});
		ghiTongKet({
			loai: "do-tre",
			ca: "pb",
			cuoc: 2,
			ms: [1200, 900],
			usd: 0.01,
		});
		expect(docTongKet(readFileSync(tep, "utf8"))).toEqual([
			{
				loai: "boi-canh",
				ca: "pb",
				A: "a",
				B: "b",
				phiaCoGoi: "B",
				usd: 0.07,
			},
			{
				loai: "do-tre",
				ca: "pb",
				cuoc: 2,
				ms: [1200, 900],
				tach: [],
				usd: 0.01,
			},
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

describe("eval-soan: chi phí và xáo", () => {
	test("loiChiPhi đỏ khi một bước có costUsd null hay bằng 0, tongChiPhi đếm dòng thiếu", () => {
		expect(loiChiPhi([{ costUsd: 0.002 }, { costUsd: 0.001 }])).toEqual([]);
		expect(loiChiPhi([{ costUsd: 0.002 }, { costUsd: null }])).toEqual([
			"dong 2 costUsd null",
		]);
		expect(loiChiPhi([{ costUsd: 0 }])).toEqual(["dong 1 costUsd 0"]);
		expect(tongChiPhi([{ costUsd: 0.25 }, { costUsd: null }])).toEqual({
			usd: 0.25,
			thieu: 1,
		});
	});

	test("xaoTron là Fisher–Yates: giữ đủ phần tử, phân bố đều ở vị trí đầu", () => {
		let hat = 7;
		const ngauNhien = () => {
			hat = (hat * 48_271) % 2_147_483_647;
			return hat / 2_147_483_647;
		};
		const dem = [0, 0, 0, 0];
		for (let i = 0; i < 4_000; i++) {
			const ra = xaoTron([0, 1, 2, 3], ngauNhien);
			expect([...ra].sort()).toEqual([0, 1, 2, 3]);
			dem[ra[0] ?? 0] = (dem[ra[0] ?? 0] ?? 0) + 1;
		}
		for (const d of dem) expect(Math.abs(d - 1_000)).toBeLessThan(150);
		expect(xaoTron([], ngauNhien)).toEqual([]);
	});
});

describe("eval-soan: tách thời gian lượt và khoảng tin cậy", () => {
	const su = (type: string, giay: number) => ({
		type,
		meta: {
			at: new Date(Date.UTC(2026, 8, 30, 0, 0, giay)).toISOString(),
			id: `${type}-${giay}`,
		},
	});

	test("tachLuot cộng thời gian mô hình theo cặp bước và thời gian công cụ theo cặp lời gọi", () => {
		expect(
			tachLuot([
				su("message.received", 0),
				su("step.started", 1),
				su("actions.requested", 9),
				su("step.completed", 9),
				su("action.result", 12),
				su("step.started", 12),
				su("step.completed", 15),
				{ type: "message.appended" },
			]),
		).toEqual({ soBuoc: 2, moHinhMs: 11_000, congCuMs: 3_000, soCongCu: 1 });
		expect(tachLuot([])).toEqual({
			soBuoc: 0,
			moHinhMs: 0,
			congCuMs: 0,
			soCongCu: 0,
		});
	});

	test("khoangWilson khớp số tra tay: 2/5 và 2/3", () => {
		const a = khoangWilson(2, 5);
		expect(a?.duoi).toBeCloseTo(0.118, 2);
		expect(a?.tren).toBeCloseTo(0.769, 2);
		const b = khoangWilson(2, 3);
		expect(b?.duoi).toBeCloseTo(0.208, 2);
		expect(b?.tren).toBeCloseTo(0.939, 2);
		expect(khoangWilson(0, 0)).toBeNull();
	});

	test("docTomTat giữ choice của judge để tách ca không chấm được", () => {
		const tom = docTomTat(
			JSON.stringify({
				totalEvals: 2,
				passed: 1,
				failed: 1,
				scored: 0,
				skipped: 0,
				evals: [
					{
						id: "a",
						verdict: "passed",
						assertions: [
							{
								name: "judge [boi-canh:x]",
								score: 1,
								passed: true,
								metadata: { choice: "Y", rationale: "…" },
							},
						],
					},
					{
						id: "b",
						verdict: "failed",
						assertions: [
							{
								name: "judge [boi-canh:y]",
								score: 0,
								passed: false,
								metadata: null,
								message: "No tool calls in response",
							},
						],
					},
				],
			}),
		);
		expect(
			tom.evals.map((e) => e.assertions[0]?.metadata?.choice ?? null),
		).toEqual(["Y", null]);
	});
});

describe("eval-soan: số cặp judge mù", () => {
	const bien = TRO_LY_OKR_SOAN.danhGia.env.soCapAB;
	afterEach(() => {
		delete process.env[bien];
	});

	test("mặc định 15 cặp = 3 vòng × 5 đơn vị, mỗi vòng một câu trả lời khác, khoá cặp không trùng", () => {
		expect(soCapAB()).toBe(TRO_LY_OKR_SOAN.danhGia.boiCanh.soCapMacDinh);
		const cap = danhSachCap(boCa(), soCapAB());
		expect(cap.length).toBe(15);
		expect(new Set(cap.map((c) => c.khoa)).size).toBe(15);
		expect(new Set(cap.map((c) => c.traLoi)).size).toBe(3);
		for (const id of new Set(cap.map((c) => c.ca.id)))
			expect(
				new Set(cap.filter((c) => c.ca.id === id).map((c) => c.traLoi)).size,
			).toBe(3);
	});

	test("TDX_SO_CAP_AB đặt số cặp; giá trị hỏng quay về mặc định", () => {
		process.env[bien] = "7";
		expect(
			danhSachCap(boCa(), soCapAB())
				.map((c) => c.khoa)
				.at(-1),
		).toBe("bp-kinh-doanh#v2");
		process.env[bien] = "khong-so";
		expect(soCapAB()).toBe(TRO_LY_OKR_SOAN.danhGia.boiCanh.soCapMacDinh);
	});
});
