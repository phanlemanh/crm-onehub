import { describe, expect, test } from "bun:test";
import { duongCapNhatKr } from "../src/okr-cap-nhat";

describe("ctlk-duong-nhac", () => {
	test("ctlk-duong-nhac: mot KR toi KR, nhieu KR toi Cua toi, rong nem, khong tu=", () => {
		expect(duongCapNhatKr(["a"])).toBe("/okr/kr/a");
		const nhieu = [duongCapNhatKr(["a", "b"]), duongCapNhatKr(["a", "b", "c"])];
		for (const d of nhieu) {
			if (d.includes("tu=")) throw new Error("ctlk-duong-nhac: con tu=");
			expect(d).toBe("/okr");
		}
		expect(() => duongCapNhatKr([])).toThrow("krIds rỗng");
	});
});
