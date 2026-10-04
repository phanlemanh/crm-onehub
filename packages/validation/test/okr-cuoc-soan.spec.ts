import { describe, expect, test } from "bun:test";
import {
	BAN_NHAP_LOI,
	BAN_NHAP_TRAN,
	BUOC_CAT,
	banNhap,
	type KrNhap,
	laChoGiuPhien,
	type MucTieuNhap,
	PHIEN_CHO_EVE,
	parseBanNhap,
	parseDaCat,
	soanDuaVaoInput,
	soGhiKhacNguoiGo,
	vetTaoKrSoan,
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
			tenToiThieu: 3,
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

describe("bảng đã cắt", () => {
	const bang = {
		buoc: [...BUOC_CAT],
		truocToken: 20_000,
		sauToken: 16_000,
		chienLuocCatKyTu: 0,
	};
	test("đọc được bảng đúng khuôn", () => {
		expect(parseDaCat(bang)).toEqual(bang);
	});
	test("bước lạ, số âm, thiếu trường thì ném", () => {
		expect(() => parseDaCat({ ...bang, buoc: ["0-5"] })).toThrow(
			"bảng đã cắt không đọc được",
		);
		expect(() => parseDaCat({ ...bang, sauToken: -1 })).toThrow();
		expect(() =>
			parseDaCat({ buoc: [], truocToken: 1, sauToken: 1 }),
		).toThrow();
	});
});

describe("vết tạo KR từ soạn", () => {
	const vet = {
		title: "Hợp đồng ký mới",
		kind: "tang-toi",
		startValue: 0,
		targetValue: 10,
		soNguoiGoKhoiDiem: 0,
		soNguoiGoDich: 10,
	};
	test("số ghi bằng số người gõ thì không lệch; khác đích thì lệch", () => {
		expect(soGhiKhacNguoiGo(vetTaoKrSoan.parse(vet))).toBe(false);
		expect(
			soGhiKhacNguoiGo(vetTaoKrSoan.parse({ ...vet, targetValue: 999 })),
		).toBe(true);
		expect(
			soGhiKhacNguoiGo(vetTaoKrSoan.parse({ ...vet, startValue: 3 })),
		).toBe(true);
	});
	test("thiếu số người gõ, hay mốc mang số người gõ hay số khác luật mốc, đều không đọc được", () => {
		const { soNguoiGoDich: _bo, ...thieu } = vet;
		expect(vetTaoKrSoan.safeParse(thieu).success).toBe(false);
		const moc = {
			kind: "moc",
			startValue: 0,
			targetValue: 1,
			soNguoiGoKhoiDiem: null,
			soNguoiGoDich: null,
		};
		expect(soGhiKhacNguoiGo(vetTaoKrSoan.parse(moc))).toBe(false);
		expect(vetTaoKrSoan.safeParse({ ...moc, soNguoiGoDich: 1 }).success).toBe(
			false,
		);
		expect(vetTaoKrSoan.safeParse({ ...moc, targetValue: 5 }).success).toBe(
			false,
		);
	});
});

describe("cho-giu-phien", () => {
	test("chỗ giữ mang tiền tố riêng; mã phiên eve thì không", () => {
		expect(laChoGiuPhien(`${PHIEN_CHO_EVE}1f0e`)).toBe(true);
		expect(laChoGiuPhien("wrun_01ARYZ6S41TSV4RRFFQ69G5FAV")).toBe(false);
		expect(laChoGiuPhien("xcho-eve:1")).toBe(false);
	});
});

describe("trung-khoa", () => {
	const loi = (v: unknown) => {
		const r = banNhap.safeParse(v);
		if (r.success) throw new Error("ban nhap trung khoa lot qua schema");
		return r.error.issues.map(({ path, message }) => ({ path, message }));
	};
	const MT = BAN_NHAP_LOI.mucTieuTrungKhoa;
	const KR = BAN_NHAP_LOI.krTrungKhoa;

	test("trung-khoa (a) hai Mục tiêu cùng khoá → một issue ở Mục tiêu lặp lại", () => {
		expect(
			loi({ mucTieu: [mucTieu(1), { ...mucTieu(2), khoa: "mt-1" }] }),
		).toEqual([{ path: ["mucTieu", 1, "khoa"], message: `${MT}: mt-1` }]);
	});

	test("trung-khoa (b) khoá chỉ khác khoảng trắng đầu/cuối là trùng", () => {
		expect(
			loi({ mucTieu: [mucTieu(1), { ...mucTieu(2), khoa: " mt-1 " }] }),
		).toEqual([{ path: ["mucTieu", 1, "khoa"], message: `${MT}: mt-1` }]);
	});

	test("trung-khoa (c) hai KR cùng khoá dưới một Mục tiêu → một issue ở KR lặp lại", () => {
		const m = { ...mucTieu(1), kr: [kr(10), { ...kr(11), khoa: "kr-10" }] };
		expect(loi({ mucTieu: [m, mucTieu(2)] })).toEqual([
			{ path: ["mucTieu", 0, "kr", 1, "khoa"], message: `${KR}: kr-10` },
		]);
	});

	test("trung-khoa (d) nhiều chỗ trùng cùng lúc → mỗi lần lặp một issue", () => {
		const m0 = { ...mucTieu(1), kr: [kr(10), { ...kr(11), khoa: "kr-10" }] };
		const ra = loi({
			mucTieu: [
				m0,
				{ ...mucTieu(2), khoa: "mt-1" },
				{ ...mucTieu(3), khoa: "mt-1" },
			],
		});
		expect(ra).toHaveLength(3);
		expect(ra).toEqual(
			expect.arrayContaining([
				{ path: ["mucTieu", 1, "khoa"], message: `${MT}: mt-1` },
				{ path: ["mucTieu", 2, "khoa"], message: `${MT}: mt-1` },
				{ path: ["mucTieu", 0, "kr", 1, "khoa"], message: `${KR}: kr-10` },
			]),
		);
	});

	test("trung-khoa (e) KR cùng khoá dưới hai Mục tiêu khác nhau vẫn nhận", () => {
		const v = {
			mucTieu: [
				{ ...mucTieu(1), kr: [kr(1), kr(2)] },
				{ ...mucTieu(2), kr: [kr(1), kr(2)] },
			],
		};
		expect(banNhap.parse(v)).toEqual(v);
	});

	test("trung-khoa (f) KR mang khoá của một Mục tiêu vẫn nhận", () => {
		const v = {
			mucTieu: [
				{ ...mucTieu(1), kr: [{ ...kr(1), khoa: "mt-1" }, kr(2)] },
				mucTieu(2),
			],
		};
		expect(banNhap.parse(v)).toEqual(v);
	});

	test("trung-khoa (g) khoá khác hoa/thường là hai khoá", () => {
		const v = { mucTieu: [mucTieu(1), { ...mucTieu(2), khoa: "MT-1" }] };
		expect(banNhap.parse(v)).toEqual(v);
	});
});
