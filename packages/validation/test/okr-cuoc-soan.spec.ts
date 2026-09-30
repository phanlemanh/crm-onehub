import { describe, expect, test } from "bun:test";
import {
	BAN_NHAP_TRAN,
	banNhap,
	type KrNhap,
	type MucTieuNhap,
	parseBanNhap,
	soanDuaVaoInput,
} from "../src/okr-cuoc-soan";

const kr = (i: number): KrNhap => ({
	khoa: `kr-${i}`,
	ten: `Giảm thời gian giao hàng tuyến ${i}`,
	kieu: "giam-xuong",
	donVi: "giờ",
	khoiDiemGoiY: null,
	viSao: "Đối tác than phiền về thời gian giao ở tuyến này.",
});

const mucTieu = (i: number, soKr = 2): MucTieuNhap => ({
	khoa: `mt-${i}`,
	ten: `Giao hàng đúng hẹn trên tuyến ${i}`,
	viSaoLucNay: "Quý này mở thêm hai kho vệ tinh.",
	loai: "cam-ket",
	viSao: "Đúng hẹn là điều đối tác nhắc nhiều nhất kỳ trước.",
	canChinhId: null,
	kr: Array.from({ length: soKr }, (_, j) => kr(i * 10 + j)),
});

describe("ban-nhap", () => {
	test("2–4 Mục tiêu, mỗi Mục tiêu 2–4 KR; đơn vị rỗng và đích có mặt vẫn parse (bộ kiểm bắt theo dòng)", () => {
		const lanh = { mucTieu: [mucTieu(1), mucTieu(2, 4)] };
		expect(parseBanNhap(lanh)).toEqual(lanh);
		expect(BAN_NHAP_TRAN).toEqual({
			mucTieu: { min: 2, max: 4 },
			kr: { min: 2, max: 4 },
			khoa: 40,
			donVi: 24,
		});
		expect(
			banNhap.safeParse({ mucTieu: [mucTieu(1)] }).success,
			"1 muc tieu lot",
		).toBe(false);
		expect(
			banNhap.safeParse({ mucTieu: [1, 2, 3, 4, 5].map((i) => mucTieu(i)) })
				.success,
			"5 muc tieu lot",
		).toBe(false);
		expect(
			banNhap.safeParse({ mucTieu: [mucTieu(1, 1), mucTieu(2)] }).success,
			"1 kr lot",
		).toBe(false);
		expect(
			banNhap.safeParse({ mucTieu: [mucTieu(1, 5), mucTieu(2)] }).success,
			"5 kr lot",
		).toBe(false);
		const khongDonVi = {
			mucTieu: [
				mucTieu(1),
				{ ...mucTieu(2), kr: [{ ...kr(1), donVi: " " }, kr(2)] },
			],
		};
		const rDonVi = banNhap.parse(khongDonVi);
		expect(
			rDonVi.mucTieu[1]?.kr[0]?.donVi,
			"khuon chan ca ban vi mot kr thieu don vi",
		).toBe("");
		const coDich = {
			mucTieu: [
				mucTieu(1),
				{ ...mucTieu(2), kr: [{ ...kr(1), dich: 5 }, kr(2)] },
			],
		};
		const rDich = banNhap.parse(coDich);
		expect(
			rDich.mucTieu[1]?.kr[0]?.dich,
			"khuon chan ca ban vi mot kr mang dich",
		).toBe(5);
		expect(rDich.mucTieu[0]?.kr[0]?.dich).toBeUndefined();
		expect(
			banNhap.safeParse({
				mucTieu: [
					mucTieu(1),
					{ ...mucTieu(2), kr: [{ ...kr(1), dich: "nhiều" }, kr(2)] },
				],
			}).success,
		).toBe(false);
		expect(() => parseBanNhap({ mucTieu: [] })).toThrow(
			/bản nháp không đọc được/,
		);
	});

	test("soanDuaVaoInput: mỗi KR đã nhận cần khởi điểm và đích là số hữu hạn", () => {
		expect(
			soanDuaVaoInput.safeParse({
				cuocSoanId: "cs1",
				kr: [{ deXuatId: "dx1", khoiDiem: 0, dich: 15 }],
			}).success,
		).toBe(true);
		expect(
			soanDuaVaoInput.safeParse({
				cuocSoanId: "cs1",
				kr: [{ deXuatId: "dx1", khoiDiem: 0, dich: Number.NaN }],
			}).success,
		).toBe(false);
	});
});
