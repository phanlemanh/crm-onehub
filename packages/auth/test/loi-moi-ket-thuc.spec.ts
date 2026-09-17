import { describe, expect, it } from "bun:test";
import {
	CANCELLED_CU,
	conHieuLuc,
	docTrangThai,
	TRANG_THAI_LOI_MOI,
} from "../src/invitation-status";
import { type AllowanceRow, decideSignIn, docHang } from "../src/allow-list";

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

describe("ranh-gioi-doc", () => {
	it("dong la thanh unknown co ten, dong lanh di qua nguyen ven", () => {
		const { rows, loi } = docHang([
			{ email: "a@x.com", role: "member", status: "pending" },
			{ email: "b@x.com", role: "admin", status: 42 },
		]);

		expect(rows.length, "hai dong vao thi hai dong ra").toBe(2);
		expect(rows[0]?.status, "dong lanh giu nguyen trang thai").toBe("pending");
		expect(rows[1]?.status, "dong la phai thanh unknown").toBe("unknown");
		expect(loi.length, "dong la phai de lai dung mot loi co ten").toBe(1);
		expect(loi[0] ?? "", "loi phai neu ten truong status").toContain("status");
	});
});

const dungThu = (status: AllowanceRow["status"]) =>
	decideSignIn({
		email: "khue@gmail.com",
		allowances: [{ email: "khue@gmail.com", role: "admin", status }],
		seedList: "",
		anyUserExists: true,
	});

describe("huy-qua-goi", () => {
	it("trang thai canceled mot chu L thi tu choi", () => {
		expect(O.canceled).not.toBe(CANCELLED_CU);
		expect(
			dungThu(O.canceled).allowed,
			`chuoi "${O.canceled}" phai bi tu choi`,
		).toBe(false);
	});
});

describe("tu-choi-loi-moi", () => {
	it("trang thai rejected thi tu choi", () => {
		expect(
			dungThu(O.rejected).allowed,
			`chuoi "${O.rejected}" phai bi tu choi`,
		).toBe(false);
	});
});

describe("du-lieu-cu", () => {
	it("dong cu mang cancelled hai chu L van bi tu choi", () => {
		const doc = docTrangThai(CANCELLED_CU);
		expect(doc.trangThai, "cancelled cu khong nam trong tu vung goi").toBe(
			"unknown",
		);
		expect(
			dungThu(doc.trangThai).allowed,
			`chuoi "${CANCELLED_CU}" phai bi tu choi`,
		).toBe(false);
	});
});
