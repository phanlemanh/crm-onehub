import { describe, expect, test } from "bun:test";
import {
	chuanCau,
	gopYInput,
	ketQuaBanTruoc,
	soLieuHoiY,
	thuTuXao,
	trangThaiHoiY,
} from "../src/okr-hoi-y";

const dong = (nhan: string, giaTri: string, ghiChu = "") => ({
	nhan,
	giaTri,
	ghiChu,
});
const CA_SO_LIEU: [unknown, boolean][] = [
	[[dong("Doanh thu", "92%")], true],
	[[1, 2, 3, 4, 5].map((i) => dong(`Số ${i}`, "1")), true],
	[[], false],
	[[1, 2, 3, 4, 5, 6].map((i) => dong(`Số ${i}`, "1")), false],
	[[dong("D", "1")], false],
	[[dong("x".repeat(61), "1")], false],
	[[dong("Doanh thu", "")], false],
	[[dong("Doanh thu", "x".repeat(41))], false],
	[[dong("Doanh thu", "1", "x".repeat(121))], false],
	[[dong("Doanh thu", "1", "x".repeat(120))], true],
];

describe("okr-hoi-y", () => {
	test("so lieu", () =>
		expect(CA_SO_LIEU.map(([v]) => soLieuHoiY.safeParse(v).success)).toEqual(
			CA_SO_LIEU.map(([, k]) => k),
		));
	test("y: 9 va 301 ky tu bi tu choi, chu la giu nguyen", () => {
		const co = (noiDung: string) =>
			gopYInput.safeParse({ hoiYId: "h", noiDung, viSao: "", doBangGi: "" })
				.success;
		expect([
			co("x".repeat(9)),
			co("x".repeat(301)),
			co("Launch 🚀 kho lạnh <b>x</b>"),
			co("x".repeat(300)),
		]).toEqual([false, false, true, true]);
	});
	test("trang thai theo han nua mo va luc cong bo", () => {
		const han = new Date("2026-12-08T10:00:00.000Z");
		expect([
			trangThaiHoiY(
				{ hanLuc: han, congBoLuc: null },
				new Date(han.getTime() - 1),
			),
			trangThaiHoiY({ hanLuc: han, congBoLuc: null }, han),
			trangThaiHoiY(
				{ hanLuc: han, congBoLuc: new Date("2026-12-14T03:00:00.000Z") },
				new Date("2026-12-20T00:00:00.000Z"),
			),
		]).toEqual(["dang-mo", "dang-gom", "da-cong-bo"]);
	});
	test("thu tu xao on dinh theo hat, khac giua hai hat, khong theo thu tu vao", () => {
		const ids = Array.from({ length: 12 }, (_, i) => `y${i}`);
		const a1 = thuTuXao(ids, "h:u1");
		expect(a1).toEqual(thuTuXao([...ids].reverse(), "h:u1"));
		expect(a1).not.toEqual(thuTuXao(ids, "h:u2"));
		expect(a1).not.toEqual(ids);
		expect([...a1].sort()).toEqual([...ids].sort());
	});
	test("chuan cau", () =>
		expect(chuanCau("  Giao  hàng LẠNH ")).toBe("giao hàng lạnh"));
	test("hai chủ đề chọn nối cùng một câu, chủ đề đầu khác chữ, chủ đề sau trùng chữ: giữ nguyên — cùng một hàm cho màn xem trước và lúc công bố", () =>
		expect(
			ketQuaBanTruoc(
				{
					cau: ["Giữ tỉ lệ khách quay lại mỗi quý từ 70% trở lên", "Mở kho"],
					boQua: false,
				},
				[
					{
						noiBanTruoc: "cau-1",
						cauMucTieu: "Gọi lại mọi khách đã ngừng đặt",
					},
					{
						noiBanTruoc: "cau-1",
						cauMucTieu: "giữ tỉ lệ khách quay lại  mỗi quý từ 70% trở lên",
					},
				],
			),
		).toEqual({ cau: ["giu", "bo"], doi: 0, them: 0, boQua: false }));
});
