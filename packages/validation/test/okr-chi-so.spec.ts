import { describe, expect, test } from "bun:test";
import { CHI_SO_OKR, dinhNghiaChiSo, MA_CHI_SO } from "../src/okr-chi-so";
import { datNguonKrInput, sheetIdTuUrl } from "../src/okr-nguon";

const BANG = {
	"thoa-thuan-chot-duoc": {
		donVi: "thoa-thuan",
		ngayKy: "closedAt",
		quyCong: "nguoi-phu-trach-thoa-thuan",
		banGhi: "deal",
	},
	"thoa-thuan-moi": {
		donVi: "thoa-thuan",
		ngayKy: "createdAt",
		quyCong: "nguoi-phu-trach-thoa-thuan",
		banGhi: "deal",
	},
	"goi-hen-duoc": {
		donVi: "cuoc-goi",
		ngayKy: "createdAt",
		quyCong: "nguoi-goi",
		banGhi: "contact",
	},
	"buoc-xong-dung-han": {
		donVi: "buoc",
		ngayKy: "completedAt",
		quyCong: "phong-ban-cua-buoc",
		banGhi: "plan",
	},
	"ghi-danh-dat-bac": {
		donVi: "ca-nhan",
		ngayKy: "ngay-dat-bac",
		quyCong: "nguoi-cam-trich",
		banGhi: "contact",
	},
	"form-thanh-ca-nhan": {
		donVi: "ca-nhan",
		ngayKy: "filedAt",
		quyCong: "nguoi-phu-trach-ca-nhan",
		banGhi: "contact",
	},
	"email-gui-ra": {
		donVi: "thu",
		ngayKy: "sentAt",
		quyCong: "nguoi-gui",
		banGhi: "email",
	},
} as const;
const PHAM_VI = ["toan-cong-ty", "bo-phan", "phong-ban", "nguoi"];

describe("danh-muc", () => {
	test("bảy mã, đúng bảng mục 2", () => {
		expect([...MA_CHI_SO]).toEqual(Object.keys(BANG));
		for (const ma of MA_CHI_SO) {
			const { phamVi, ...con } = CHI_SO_OKR[ma];
			expect({ ma, ...con }).toEqual({ ma, ...BANG[ma] });
			expect([...phamVi]).toEqual(PHAM_VI);
		}
	});
	test("đối chứng dương: bảy đầu vào hợp lệ", () => {
		for (const ma of MA_CHI_SO) {
			const phamVi = { kieu: "toan-cong-ty" };
			const vao =
				ma === "ghi-danh-dat-bac"
					? { chiSo: ma, phamVi, bac: "tai-khoan" }
					: { chiSo: ma, phamVi };
			expect(dinhNghiaChiSo.parse(vao)).toEqual(vao);
		}
	});
	const TU_CHOI: [string, unknown, string][] = [
		[
			"mã lạ",
			{ chiSo: "doanh-thu", phamVi: { kieu: "toan-cong-ty" } },
			"Chỉ số không có trong danh mục",
		],
		[
			"phạm vi lạ",
			{ chiSo: "thoa-thuan-moi", phamVi: { kieu: "nhom" } },
			"Phạm vi không hợp lệ",
		],
		[
			"bộ phận thiếu id",
			{ chiSo: "thoa-thuan-moi", phamVi: { kieu: "bo-phan" } },
			"Phạm vi không hợp lệ",
		],
		[
			"ghi danh thiếu bậc",
			{ chiSo: "ghi-danh-dat-bac", phamVi: { kieu: "toan-cong-ty" } },
			"Chọn bậc cho chỉ số ghi danh",
		],
		[
			"bậc lạ",
			{
				chiSo: "ghi-danh-dat-bac",
				phamVi: { kieu: "toan-cong-ty" },
				bac: "vip",
			},
			"Bậc không hợp lệ",
		],
		[
			"trường bieuThuc",
			{
				chiSo: "thoa-thuan-moi",
				phamVi: { kieu: "toan-cong-ty" },
				bieuThuc: "1=1",
			},
			"Trường không được phép",
		],
		[
			"trường cot",
			{
				chiSo: "thoa-thuan-moi",
				phamVi: { kieu: "toan-cong-ty" },
				cot: "amount",
			},
			"Trường không được phép",
		],
	];
	for (const [ten, vao, cau] of TU_CHOI) {
		test(`từ chối: ${ten}`, () => {
			const r = dinhNghiaChiSo.safeParse(vao);
			expect(r.success).toBe(false);
			expect(r.error?.issues.map((i) => i.message).join(" | ")).toContain(cau);
		});
	}
	test("url Sheets", () => {
		expect(
			sheetIdTuUrl(
				"https://docs.google.com/spreadsheets/d/1AbC_d-9/edit#gid=0",
			),
		).toBe("1AbC_d-9");
		expect(sheetIdTuUrl("https://drive.google.com/file/d/1AbC")).toBeNull();
		expect(
			datNguonKrInput.safeParse({
				keyResultId: "k",
				loai: "bang-tinh",
				url: "https://x.test/a",
				o: "Tổng!B2",
			}).success,
		).toBe(false);
		expect(
			datNguonKrInput.safeParse({
				keyResultId: "k",
				loai: "bang-tinh",
				url: "https://docs.google.com/spreadsheets/d/1Ab/edit",
				o: "B",
			}).success,
		).toBe(false);
	});
});
