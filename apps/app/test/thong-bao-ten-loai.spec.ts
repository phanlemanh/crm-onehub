import { describe, expect, test } from "bun:test";
import { LOAI_THONG_BAO } from "@crm/validation/thong-bao";
import { thongBaoMessages } from "@/lib/messages/thong-bao";

describe("tbk-ten", () => {
	test("tbk-ten: moi loai co ten khac rong o ca vi va en", () => {
		for (const locale of ["vi", "en"] as const) {
			const ten: Record<string, string | undefined> =
				thongBaoMessages(locale).tenLoai;
			for (const loai of LOAI_THONG_BAO) {
				expect(
					(ten[loai] ?? "").trim().length,
					`thieu ten loai ${locale}: ${loai}`,
				).toBeGreaterThan(0);
			}
		}
	});
});
