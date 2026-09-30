import { describe, expect, test } from "bun:test";
import { LOI_KHO_THU, moiTruongModelTacGia } from "./support/khoi-dong";

const MAY = "postgresql://thu@localhost:5432";

describe("moi-truong-model", () => {
	test("kho chung crm, không run id → ném, không trả DATABASE_URL", () => {
		expect(() =>
			moiTruongModelTacGia({ TEST_DATABASE_URL: `${MAY}/crm` }),
		).toThrow(`${LOI_KHO_THU.khongDungMotLan}: crm`);
	});

	test("kho crm_test có TEST_RUN_ID → kho riêng của lượt, NODE_ENV development", () => {
		const ra = moiTruongModelTacGia({
			TEST_DATABASE_URL: `${MAY}/crm_test`,
			TEST_RUN_ID: "abc123",
		});
		expect(ra.NODE_ENV).toBe("development");
		expect(new URL(ra.DATABASE_URL).pathname).toBe("/crm_abc123_test");
	});

	test("thiếu TEST_DATABASE_URL → ném lỗi có tên", () => {
		expect(() => moiTruongModelTacGia({ TEST_RUN_ID: "abc123" })).toThrow(
			LOI_KHO_THU.thieu,
		);
		expect(() => moiTruongModelTacGia({ TEST_DATABASE_URL: "  " })).toThrow(
			LOI_KHO_THU.thieu,
		);
	});
});
