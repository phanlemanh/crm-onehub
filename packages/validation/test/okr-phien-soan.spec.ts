import { describe, expect, test } from "bun:test";
import {
	OKR_PHIEN_SOAN,
	parseThuocTinhPhienSoan,
	theCuaPhienSoan,
	thuocTinhPhienSoan,
} from "../src/okr-phien-soan";

const day = {
	purpose: OKR_PHIEN_SOAN.purpose,
	cuocSoanId: "cuoc-1",
	vai: "okr",
	email: "a@onehub.test",
	name: "A",
} as const;

describe("okr-phien-soan", () => {
	test("thuộc tính cửa ghi đọc lại nguyên vẹn; sai mục đích, thiếu cuộc hay vai lạ thì hỏng", () => {
		expect(parseThuocTinhPhienSoan(day)).toEqual(day);
		expect(() => parseThuocTinhPhienSoan({ ...day, purpose: "okr" })).toThrow(
			"thuộc tính phiên soạn không đọc được",
		);
		expect(
			thuocTinhPhienSoan.safeParse({ ...day, cuocSoanId: " " }).success,
		).toBe(false);
		expect(thuocTinhPhienSoan.safeParse({ ...day, vai: "khach" }).success).toBe(
			false,
		);
	});

	test("thẻ cửa không mang vai: vai lấy lại từ hàng member, không tin thẻ", () => {
		expect(theCuaPhienSoan.parse(day)).toEqual({
			purpose: day.purpose,
			cuocSoanId: day.cuocSoanId,
			email: day.email,
			name: day.name,
		});
		expect(
			theCuaPhienSoan.safeParse({ purpose: day.purpose, cuocSoanId: "c" })
				.success,
		).toBe(true);
	});
});
