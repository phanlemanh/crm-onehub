import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
	boDoanMa,
	CAM_TEN_CU,
	dongLoiTenCu,
	soatTenCu,
} from "../src/ten-cu-okr";

const GOC = join(import.meta.dir, "..", "..", "..");
const BAI_DUNG_LUAT = [
	"apps/api/test/chu-may-sinh-ten-moi.spec.ts",
	"apps/agent/test/chu-may-sinh-ten-moi.spec.ts",
	"apps/agent-okr/test/chu-may-sinh-ten-moi.spec.ts",
];

const hoaDau = (s: string) => s.charAt(0).toLocaleUpperCase("vi") + s.slice(1);

describe("cmst-luat", () => {
	test("moi cum cam bi bat dung mot loi, goi ten nguon va khoa", () => {
		const muc = CAM_TEN_CU.map((cum, i) => ({
			nguon: "gia",
			khoa: `k${i}`,
			chu: `Câu thử: ${hoaDau(cum)} ở đây.`,
		}));
		const loi = soatTenCu(muc).map(dongLoiTenCu);
		expect(loi).toEqual(CAM_TEN_CU.map((cum, i) => `gia#k${i}: ${cum}`));
	});

	test("chu moi va ten san pham khong bi bat", () => {
		const giu = ["Lấy ý kiến", "Sơ đồ cả công ty", "OneHub Center"].map(
			(chu, i) => ({ nguon: "giu", khoa: `g${i}`, chu }),
		);
		expect(soatTenCu(giu)).toEqual([]);
	});

	test("bo doan ma truoc khi soat cau dan", () => {
		const trongMa = "Never write `căn chỉnh` or `hỏi ý` to the person.";
		const ngoaiMa = "Never write «căn chỉnh» or «hỏi ý» to the person.";
		const soat = (chu: string) =>
			soatTenCu([{ nguon: "d", khoa: "cau", chu: boDoanMa(chu) }]);
		expect(soat(trongMa)).toEqual([]);
		expect(soat(ngoaiMa).map((l) => l.cum)).toEqual(["căn chỉnh", "hỏi ý"]);
		expect(boDoanMa("dùng \\`dichCanChinh\\` và \\`hỏi ý\\`")).toBe(
			"dùng  và ",
		);
	});

	test("ba bai cua api, agent, agent-okr deu dung luat chung", () => {
		const thieu = BAI_DUNG_LUAT.filter(
			(t) =>
				!/import\s*\{[^}]*\bsoatTenCu\b[^}]*\}\s*from\s*"@crm\/validation\/ten-cu-okr"/.test(
					readFileSync(join(GOC, t), "utf8"),
				),
		);
		expect(thieu.map((t) => `cmst: luat khong duoc dung ${t}`)).toEqual([]);
	});
});
