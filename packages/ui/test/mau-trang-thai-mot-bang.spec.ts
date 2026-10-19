import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { quetMau, tepCanQuet } from "./quet-mau-trang-thai";

const GOC = join(import.meta.dir, "..", "..", "..");

const BON_DANG = [
	{
		ten: "Record satisfies",
		ma: `import type { StatusTone } from "x";\nconst T = { a: "success" } satisfies Record<"a", StatusTone>;`,
	},
	{
		ten: "doi tuong as const",
		ma: `import { StatusIndicator } from "x";\nconst T = { a: "warning" } as const;`,
	},
	{
		ten: "switch return",
		ma: `import { StatusIndicator } from "x";\nfunction f(s: string) {\n\tswitch (s) {\n\t\tcase "a":\n\t\t\treturn "error";\n\t}\n\treturn null;\n}`,
	},
	{
		ten: "new Map",
		ma: `import { IndicatorDot } from "x";\nconst T = new Map([["a", "info"]]);`,
	},
] as const;

describe("mtc-mot-bang", () => {
	test("doi chung duong: bon dang bang mau, moi dang dung mot vi pham", () => {
		let dem = 0;
		for (const d of BON_DANG) {
			const vp = quetMau(d.ma, `mau-${dem}.tsx`, { chat: false });
			expect(vp.length, `mtc-mot-bang: dang ${d.ten} khong bi bat`).toBe(1);
			dem += 1;
		}
		expect(dem).toBe(4);
	});

	test("kho khong co bang mau rieng nao", () => {
		const tep = tepCanQuet(GOC);
		expect(tep.length).toBeGreaterThan(100);
		for (const t of tep) {
			const vp = quetMau(readFileSync(join(GOC, t), "utf8"), t, {
				chat: false,
			});
			if (vp.length > 0)
				throw new Error(`mtc-mot-bang: ${t} khai bang mau rieng`);
		}
	});
});
