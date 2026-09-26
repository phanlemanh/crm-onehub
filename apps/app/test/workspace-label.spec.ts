import { describe, expect, it } from "bun:test";
import { execFileSync } from "node:child_process";
import { DEFAULT_WORKSPACE_NAME } from "@crm/auth";
import { workspaceLabel } from "../lib/workspace-label";

const SAN_PHAM = "OneHub Center";

function tenCu(): string {
	const goc = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
	const base = execFileSync("git", ["-C", goc, "merge-base", "HEAD", "origin/onehub"], {
		encoding: "utf8",
	}).trim();
	const nguon = execFileSync("git", ["-C", goc, "show", `${base}:packages/auth/src/organization.ts`], {
		encoding: "utf8",
	});
	return nguon.match(/DEFAULT_WORKSPACE_NAME = "([^"]+)"/)?.[1] ?? "";
}

const TEN_CU = tenCu();

const MA_TRAN: [string | undefined, string][] = [
	[undefined, SAN_PHAM],
	["", SAN_PHAM],
	["   ", SAN_PHAM],
	[DEFAULT_WORKSPACE_NAME, SAN_PHAM],
	[TEN_CU, SAN_PHAM],
	[TEN_CU.toLowerCase(), SAN_PHAM],
	[` ${TEN_CU} `, SAN_PHAM],
	[SAN_PHAM, SAN_PHAM],
	["Acme", "Acme"],
	["  Acme  ", "Acme"],
	["Acme CRM", "Acme CRM"],
];

describe("nhan dau trang", () => {
	it("ten mac dinh moi", () => {
		expect(DEFAULT_WORKSPACE_NAME).toBe(SAN_PHAM);
	});

	it("rut duoc ten cu tu merge-base", () => {
		expect(TEN_CU.length, "khong rut duoc ten cu").toBeGreaterThan(0);
	});

	for (const [vao, ra] of MA_TRAN) {
		it(`${JSON.stringify(vao)} -> ${ra}`, () => {
			expect(workspaceLabel(vao)).toBe(ra);
		});
	}
});
