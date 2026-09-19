import { strict as assert } from "node:assert";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { GOC, ghim } from "./chung.mjs";

assert.ok(
	existsSync(join(GOC, "_acceptance", "config.yaml")),
	"GOC phai tro dung goc kho",
);

let nem = null;
try {
	ghim("so tep", 3, 4);
} catch (loi) {
	nem = loi.message;
}
assert.ok(
	nem?.includes("so tep"),
	"ghim phai nem kem TEN hang, khong chi con so",
);
assert.ok(
	nem?.includes("3") && nem?.includes("4"),
	"ghim phai in ca hai con so",
);
assert.equal(ghim("so tep", 4, 4), 4, "ghim khop thi tra chinh gia tri");

console.log("chung.mjs: 4 khang dinh dat");
