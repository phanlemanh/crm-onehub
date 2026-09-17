import { describe, expect, it } from "bun:test";
import {
	CANCELLED_CU,
	conHieuLuc,
	docTrangThai,
	TRANG_THAI_LOI_MOI,
} from "../src/invitation-status";

const O = {
	pending: TRANG_THAI_LOI_MOI[0],
	accepted: TRANG_THAI_LOI_MOI[1],
	rejected: TRANG_THAI_LOI_MOI[2],
	canceled: TRANG_THAI_LOI_MOI[3],
} as const;

describe("ma-tran-trang-thai", () => {
	it("sau o viet truoc, sau khang dinh", () => {
		expect(O.canceled).not.toBe(CANCELLED_CU);

		const BANG: readonly [string, string, boolean][] = [
			["pending", O.pending, true],
			["accepted", O.accepted, true],
			["canceled", O.canceled, false],
			["rejected", O.rejected, false],
			["cancelled-cu", CANCELLED_CU, false],
			["rac", "khong-phai-trang-thai-nao", false],
		];

		expect(BANG.length).toBe(6);

		for (const [ten, chuoi, mong] of BANG) {
			const doc = docTrangThai(chuoi);
			expect(
				conHieuLuc(doc.trangThai),
				`o "${ten}" chuoi "${chuoi}": mong ${mong ? "CON HIEU LUC" : "HET HIEU LUC"}, nhan ${doc.trangThai}`,
			).toBe(mong);
		}
	});
});

describe("gia-tri-la", () => {
	it("chuoi rac ra unknown co ten, khong mac dinh im lang", () => {
		const doc = docTrangThai("mot-chuoi-chua-tung-thay");
		expect(doc.trangThai, "gia tri la phai ra unknown").toBe("unknown");
		expect(doc.loi ?? "", "loi phai neu ten truong status").toContain("status");
		expect(conHieuLuc(doc.trangThai), "unknown KHONG duoc con hieu luc").toBe(
			false,
		);
	});
});
