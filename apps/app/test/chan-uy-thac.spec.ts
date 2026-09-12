import { describe, expect, it } from "bun:test";
import {
	type BuilderConversationState,
	builderConversationIsWorking,
} from "../lib/agent-builder-state";
import { latestTurnFailure } from "../lib/agent-transcript";

const hoiThoai = (
	continuationToken: string | null,
): BuilderConversationState => ({
	sessionId: "wrun_1",
	continuationToken,
	submissions: [],
	createdVersions: [],
	agent: null,
});

describe("chan uy thac ve man", () => {
	it("hang da settle thi khong con dang chay nen", () => {
		expect(builderConversationIsWorking(hoiThoai("crm:builder:conv_1"))).toBe(
			false,
		);
		expect(builderConversationIsWorking(hoiThoai(null))).toBe(true);
	});

	it("dong su kien that bai lam the do hien, luot thuong thi khong", () => {
		const doHong = [
			{ type: "turn.started" as const, data: {} },
			{
				type: "turn.failed" as const,
				data: { code: "AGENT_FAILED", message: "builder threw" },
			},
		];
		const binhThuong = [
			{ type: "turn.started" as const, data: {} },
			{ type: "turn.completed" as const, data: {} },
		];
		expect(latestTurnFailure(doHong)).not.toBeNull();
		expect(latestTurnFailure(binhThuong)).toBeNull();
	});
});
