import { describe, expect, test } from "bun:test";
import { LOCALES } from "@crm/ui/lib/locale";
import { LOAI_THONG_BAO } from "@crm/validation/thong-bao";
import { cauThongBao } from "@/lib/thong-bao/cau";
import { MUC_MAU } from "../../agent/test/support/muc-mau";

describe("cau", () => {
	test("cau: moi loai co cau vi va en, khong chua undefined", () => {
		console.log(`cau: so loai ${LOAI_THONG_BAO.length}`);
		expect(Object.keys(MUC_MAU).sort()).toEqual([...LOAI_THONG_BAO].sort());
		for (const loai of LOAI_THONG_BAO)
			for (const locale of LOCALES) {
				const cau = cauThongBao(locale, MUC_MAU[loai]);
				expect(
					cau.length,
					`loai nhac thieu cau thong bao: ${loai} ${locale}`,
				).toBeGreaterThan(0);
				expect(cau, `cau con cho trong: ${loai} ${locale}`).not.toMatch(
					/\{\w+\}|undefined/,
				);
			}
	});
});
