import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
	BUILDER_AUTHORIZATION_KEY,
	buildPendingInputRequest,
	commandTypeFromAuthorization,
	readBuilderAuthorization,
} from "@crm/validation/builder-question";
import { builderCommandType } from "../agent/lib/custom-agent-dispatch";

const banGhi = (authorized: boolean) =>
	buildPendingInputRequest(
		{
			kind: "question",
			requestId: "req_1",
			prompt: "Chon mot muc",
			options: [],
		},
		authorized,
	);

describe("ke-thua", () => {
	it("ke-thua: doc duoc ca hai chieu tren cung khuon", () => {
		expect(readBuilderAuthorization(banGhi(true))).toBe(true);
		expect(readBuilderAuthorization(banGhi(false))).toBe(false);
	});

	it("ke-thua: sai khuon thi nem loi CO THONG DIEP, khong nuot", () => {
		const hong = [
			null,
			{ kind: "question", requestId: "req_1", prompt: "x", options: [] },
			{ ...banGhi(true), [BUILDER_AUTHORIZATION_KEY]: "co" },
		];
		expect(hong).toHaveLength(3);
		for (const value of hong) {
			expect(() => readBuilderAuthorization(value)).toThrow(
				"Builder input request is missing a usable authorization flag.",
			);
		}
	});

	it("ke-thua: ham dung ban ghi la mot, va no tu choi cau hoi sai khuon", () => {
		expect(banGhi(true)[BUILDER_AUTHORIZATION_KEY]).toBe(true);
		expect(banGhi(false)[BUILDER_AUTHORIZATION_KEY]).toBe(false);
		expect(banGhi(true).requestId).toBe("req_1");
		expect(() => buildPendingInputRequest({ kind: "question" }, true)).toThrow(
			"Builder input request is not a usable question.",
		);
	});

	it("ke-thua: suy commandType dong khi khong doc duoc", () => {
		expect(commandTypeFromAuthorization(banGhi(true))).toBe("CREATE_AGENT");
		expect(commandTypeFromAuthorization(banGhi(false))).toBe("CHAT");
		expect(commandTypeFromAuthorization(null)).toBe("CHAT");
		expect(commandTypeFromAuthorization({ kind: "question" })).toBe("CHAT");
	});
});

describe("suy-dien", () => {
	it("suy-dien: message co inputResponse KHONG con nang quyen", () => {
		const traLoi = [
			{
				text: "co",
				resources: [],
				inputResponse: { requestId: "r1", text: "co" },
			},
			{
				text: "co",
				resources: [],
				inputResponse: { requestId: "r1", optionId: "o1" },
			},
		];
		expect(traLoi).toHaveLength(2);
		for (const message of traLoi) {
			expect(builderCommandType("CHAT", message)).toBe("CHAT");
			expect(builderCommandType("CREATE_AGENT", message)).toBe("CREATE_AGENT");
		}
	});

	it("suy-dien: khong con cho nao suy quyen tu hinh dang tin nhan", () => {
		const nguon = readFileSync(
			join(import.meta.dir, "../agent/lib/custom-agent-dispatch.ts"),
			"utf8",
		);
		expect(nguon.includes('? "CREATE_AGENT" :')).toBe(false);
	});
});

describe("cua-ra", () => {
	it("cua-ra: chi dan cua con khai not_authorized, va schema nhan dung ten do", async () => {
		const chiDan = readFileSync(
			join(import.meta.dir, "../agent/subagents/agent_builder/instructions.md"),
			"utf8",
		);
		expect(chiDan.includes("not_authorized")).toBe(true);
		const agentBuilder = (
			await import("../agent/subagents/agent_builder/agent")
		).default;
		expect(
			agentBuilder.outputSchema.safeParse({
				status: "not_authorized",
				reason: "khong duoc phep",
			}).success,
		).toBe(true);
	});

	it("cua-ra: hang ly do noi voi con, khong noi voi cha", async () => {
		const { BUILDER_DENIED_REASON } = await import(
			"../agent/subagents/agent_builder/lib/authorization"
		);
		expect(BUILDER_DENIED_REASON.includes("not_authorized")).toBe(true);
		expect(BUILDER_DENIED_REASON.includes("Tell the user")).toBe(false);
		expect(
			BUILDER_DENIED_REASON.includes("answer what they actually asked"),
		).toBe(false);
	});
});

describe("cong-dong", () => {
	const GHIM =
		"This turn is not authorized to create or revise an agent. Stop now and return final_output with status not_authorized and this sentence as the reason. Do not write files, do not save a draft.";

	const chuoiQuyen = async (authorized: boolean) => {
		const { builderSessionAttributes } = await import(
			"../agent/lib/custom-agent-dispatch"
		);
		const { builderTurnApproval } = await import(
			"../agent/subagents/agent_builder/lib/authorization"
		);
		const commandType = commandTypeFromAuthorization(banGhi(authorized));
		const attributes = builderSessionAttributes({
			commandType,
			message: {
				text: "co",
				resources: [],
				inputResponse: { requestId: "req_1", text: "co" },
			},
			conversationId: "conv_1",
			userId: "user_1",
			submissionId: "sub_1",
			hasTitle: true,
		});
		return builderTurnApproval({
			session: { auth: { current: { attributes }, initiator: null } },
			toolName: "inspect_context",
		});
	};

	it("cong-dong: ban ghi khong duoc phep -> policy tu choi kem hang ghim", async () => {
		const { BUILDER_DENIED_REASON } = await import(
			"../agent/subagents/agent_builder/lib/authorization"
		);
		expect(BUILDER_DENIED_REASON).toBe(GHIM);
		expect(await chuoiQuyen(false)).toEqual({ type: "denied", reason: GHIM });
	});

	it("cong-dong: ban ghi duoc phep -> policy cho di tiep", async () => {
		expect(await chuoiQuyen(true)).toBe("not-applicable");
	});
});
