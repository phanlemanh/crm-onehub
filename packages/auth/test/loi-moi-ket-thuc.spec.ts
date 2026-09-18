import { describe, expect, it } from "bun:test";
import { type AllowanceRow, decideSignIn, docHang } from "../src/allow-list";
import {
	CANCELLED_CU,
	conHieuLuc,
	docTrangThai,
	TRANG_THAI_CHO,
	TRANG_THAI_HUY,
	TRANG_THAI_LOI_MOI,
	TRANG_THAI_NHAN,
	TRANG_THAI_TU_CHOI,
} from "../src/invitation-status";

const O = {
	pending: TRANG_THAI_CHO,
	accepted: TRANG_THAI_NHAN,
	rejected: TRANG_THAI_TU_CHOI,
	canceled: TRANG_THAI_HUY,
} as const;

const dungThu = (status: AllowanceRow["status"]) =>
	decideSignIn({
		email: "khue@gmail.com",
		allowances: [{ email: "khue@gmail.com", role: "admin", status }],
		seedList: "",
		anyUserExists: true,
	});

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
				dungThu(doc.trangThai).allowed,
				`o "${ten}" chuoi "${chuoi}": mong ${mong ? "CHO VAO" : "TU CHOI"}, nhan trang thai ${doc.trangThai}`,
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

describe("hang-co-ten", () => {
	it("bon hang mang dung chuoi that, va deu nam trong tu vung", () => {
		const BANG: readonly [string, string, string][] = [
			["TRANG_THAI_CHO", TRANG_THAI_CHO, "pending"],
			["TRANG_THAI_NHAN", TRANG_THAI_NHAN, "accepted"],
			["TRANG_THAI_TU_CHOI", TRANG_THAI_TU_CHOI, "rejected"],
			["TRANG_THAI_HUY", TRANG_THAI_HUY, "canceled"],
		];

		expect(BANG.length).toBe(4);

		for (const [ten, hang, chuoi] of BANG) {
			expect(
				hang,
				`hang ${ten} phai mang chuoi "${chuoi}", nhan "${hang}"`,
			).toBe(chuoi);
			expect(
				(TRANG_THAI_LOI_MOI as readonly string[]).includes(hang),
				`hang ${ten} mang "${hang}" khong nam trong tu vung cua goi`,
			).toBe(true);
		}
	});
});
