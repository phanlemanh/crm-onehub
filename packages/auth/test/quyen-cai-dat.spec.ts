import { describe, expect, test } from "bun:test";
import {
	canManageWorkspaceSettings,
	WORKSPACE_ROLES,
	type WorkspaceRole,
} from "../src";

const MONG_DOI: ReadonlyArray<[WorkspaceRole | null, boolean]> = [
	["owner", true],
	["admin", true],
	["member", false],
	[null, false],
];

describe("quyen-cai-dat", () => {
	test("ma tran vai tro khop WORKSPACE_ROLES", () => {
		const trongMaTran = MONG_DOI.flatMap(([vai]) =>
			vai === null ? [] : [vai],
		);
		expect([...trongMaTran].sort()).toEqual([...WORKSPACE_ROLES].sort());
	});

	for (const [vai, duoc] of MONG_DOI) {
		test(`vai ${String(vai)} -> ${duoc}`, () => {
			expect(`${String(vai)}: ${canManageWorkspaceSettings(vai)}`).toBe(
				`${String(vai)}: ${duoc}`,
			);
		});
	}
});
