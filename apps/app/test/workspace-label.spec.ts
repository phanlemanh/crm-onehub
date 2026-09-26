import { describe, expect, it } from "bun:test";
import { DEFAULT_WORKSPACE_NAME } from "@crm/auth";
import { workspaceLabel } from "../lib/workspace-label";

const SAN_PHAM = "OneHub Center";

const TEN_CU = "CRM";

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

	for (const [vao, ra] of MA_TRAN) {
		it(`${JSON.stringify(vao)} -> ${ra}`, () => {
			expect(workspaceLabel(vao)).toBe(ra);
		});
	}
});
