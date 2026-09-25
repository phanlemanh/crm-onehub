import { describe, expect, test } from "bun:test";
import {
	canManageOnboarding,
	WORKSPACE_ROLES,
	type WorkspaceRole,
} from "../src";

const MONG_DOI: ReadonlyArray<[WorkspaceRole | null, boolean]> = [
	["owner", true],
	["admin", true],
	["member", false],
	["okr", false],
	[null, false],
];

describe("quyen-dieu-phoi", () => {
	test("ma tran vai tro khop WORKSPACE_ROLES", () => {
		const trongMaTran = MONG_DOI.flatMap(([vai]) =>
			vai === null ? [] : [vai],
		);
		expect([...trongMaTran].sort()).toEqual([...WORKSPACE_ROLES].sort());
	});

	for (const [vai, duoc] of MONG_DOI) {
		test(`vai ${String(vai)} -> ${duoc}`, () => {
			expect(`${String(vai)}: ${canManageOnboarding(vai)}`).toBe(
				`${String(vai)}: ${duoc}`,
			);
		});
	}
});
