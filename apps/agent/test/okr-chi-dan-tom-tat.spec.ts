import { describe, expect, test } from "bun:test";
import { MUC_TOM_TAT } from "../agent/lib/okr/chi-dan-tom-tat";

const HANH_DONG_NGAY =
	"Act at once. Do not reason at length: your first reply is the `nop_tom_tat` call.";

describe("chỉ dẫn tóm tắt tuần", () => {
	test("câu «Act at once» là dòng đầu tiên sau tiêu đề", () => {
		const dong = MUC_TOM_TAT.split("\n").filter((d) => d.trim() !== "");
		expect(dong[0]?.startsWith("## Tóm tắt tuần")).toBe(true);
		expect(dong[1]).toBe(HANH_DONG_NGAY);
	});

	test("ba lời về số: chép nguyên, bỏ số trong tên KR, không đếm", () => {
		expect(MUC_TOM_TAT).toContain("never round it, never change its unit");
		expect(MUC_TOM_TAT).toContain("`donVi`");
		expect(MUC_TOM_TAT).toContain("leave out any number inside the name");
		expect(MUC_TOM_TAT).toContain("from `ghiChu`, from `dangBan`");
		expect(MUC_TOM_TAT).toContain("leave out every number of the note");
		expect(MUC_TOM_TAT).toContain("Never count anything");
	});
});
