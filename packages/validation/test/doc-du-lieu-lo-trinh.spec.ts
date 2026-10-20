import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import path from "node:path";

const GOC = path.join(import.meta.dir, "..", "..", "..");
const BAN_APP = "apps/app/lib/lo-trinh/doc-du-lieu.js";
const BAN_GOI = "packages/validation/src/doc-du-lieu-lo-trinh.js";

describe("doc-du-lieu-lo-trinh", () => {
	test("bản chép trong gói trùng từng byte với bản chép của app", () => {
		const app = readFileSync(path.join(GOC, BAN_APP));
		const goi = readFileSync(path.join(GOC, BAN_GOI));
		expect(app.length).toBeGreaterThan(0);
		if (!app.equals(goi)) throw new Error(`ban chep bo doc lech: ${BAN_GOI}`);
	});
});
