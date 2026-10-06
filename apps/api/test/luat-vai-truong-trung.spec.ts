import { describe, expect, test } from "bun:test";
import { canManageFields } from "@crm/auth";
import { laQuanTriWorkspace } from "@crm/validation/vai-workspace";

const BANG = [
	["owner", true],
	["admin", true],
	["member", false],
	["okr", false],
	[null, false],
] as const;

describe("luat-vai", () => {
	test("luat-vai: agent va API cung ket qua tren 5 gia tri", () => {
		expect(BANG.length).toBe(5);
		const lech = BANG.filter(
			([vai, mong]) =>
				laQuanTriWorkspace(vai) !== mong || canManageFields(vai) !== mong,
		).map(([vai]) => `luat-vai: lech o ${vai}`);
		expect(lech).toEqual([]);
	});
});
