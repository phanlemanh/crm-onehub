import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
	BUILDER_AUTHORIZATION_KEY,
	buildPendingInputRequest,
	commandTypeFromAuthorization,
} from "@crm/validation/builder-question";
import { builderSessionAuthFromRow } from "../agent/lib/custom-agent-dispatch";
import { requireBuilderAttribute } from "../agent/lib/session-purpose";
import {
	BUILDER_DENIED_REASON,
	builderTurnApproval,
} from "../agent/subagents/agent_builder/lib/authorization";

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
		expect(commandTypeFromAuthorization(banGhi(true))).toBe("CREATE_AGENT");
		expect(commandTypeFromAuthorization(banGhi(false))).toBe("CHAT");
	});

	it("ke-thua: hai bien lam hai viec khac nhau, dung nhu san pham chay", () => {
		expect(() => buildPendingInputRequest({ kind: "question" }, true)).toThrow(
			"Builder input request is not a usable question.",
		);
		const hong = [
			null,
			{ kind: "question", requestId: "req_1", prompt: "x", options: [] },
			{ ...banGhi(true), [BUILDER_AUTHORIZATION_KEY]: "co" },
		];
		expect(hong).toHaveLength(3);
		for (const value of hong) {
			expect(commandTypeFromAuthorization(value)).toBe("CHAT");
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

const hangSubmission = (
	commandType: string,
	inputResponse: Record<string, string>,
) => ({
	id: "sub_1",
	commandType,
	message: {
		text: "Build me an agent that flags stalled deals",
		resources: [],
		attachments: [],
		inputResponse,
	},
	conversation: { userId: "user_1", title: null },
});

const BIEN_THE = [
	{ requestId: "req_1", text: "co" },
	{ requestId: "req_1", optionId: "opt_1" },
];

const KHOA_DA_GHIM = [
	"commandType",
	"conversationId",
	"needsTitle",
	"purpose",
	"submissionId",
	"userId",
];

const khoiThuocTinh = (
	commandType: string,
	inputResponse: Record<string, string>,
) =>
	builderSessionAuthFromRow(
		hangSubmission(commandType, inputResponse),
		"conv_1",
	).attributes;

describe("bat-bien", () => {
	it("bat-bien: doi inputResponse thi khoi thuoc tinh khong doi mot byte", () => {
		const [mot, hai] = BIEN_THE.map((ir) => khoiThuocTinh("CHAT", ir));
		expect(mot).toEqual(hai);
	});

	it("bat-bien: tap khoa cua khoi thuoc tinh bang dung tap da ghim", () => {
		expect(Object.keys(khoiThuocTinh("CHAT", BIEN_THE[0])).sort()).toEqual(
			KHOA_DA_GHIM,
		);
	});
});

const chamCong = (
	commandType: string,
	inputResponse: Record<string, string>,
) => {
	const auth = builderSessionAuthFromRow(
		hangSubmission(commandType, inputResponse),
		"conv_1",
	);
	const ctx = {
		session: {
			auth: { current: { attributes: auth.attributes }, initiator: null },
		},
	};
	return { ctx, cham: builderTurnApproval(ctx) };
};

describe("suy-dien", () => {
	it("suy-dien: hang khai CHAT thi cong dong, du tin nhan dung khuon xin dung tac nhan", () => {
		const luot = BIEN_THE.map((ir) => chamCong("CHAT", ir));
		expect(luot[0].cham).toEqual(luot[1].cham);
		for (const { ctx, cham } of luot) {
			expect(cham).toEqual({
				type: "denied",
				reason: BUILDER_DENIED_REASON,
			});
			expect(() => requireBuilderAttribute(ctx, "conversationId")).toThrow();
		}
	});

	it("suy-dien: doi DUNG MOT truong commandType cua hang thi cong mo", () => {
		const luot = BIEN_THE.map((ir) => chamCong("CREATE_AGENT", ir));
		expect(luot[0].cham).toEqual(luot[1].cham);
		for (const { ctx, cham } of luot) {
			expect(cham).toBe("not-applicable");
			expect(requireBuilderAttribute(ctx, "conversationId")).toBe("conv_1");
		}
	});
});

describe("cua-ra", () => {
	it("cua-ra: chi dan cua con khai not_authorized, va schema nhan dung ten do", async () => {
		const chiDan = readFileSync(
			join(import.meta.dir, "../agent/subagents/agent_builder/instructions.md"),
			"utf8",
		);
		const tenTrongChiDan = [
			...chiDan.matchAll(/status["`\s:=]+"?([a-z_]{4,})"?/g),
		]
			.map((m) => m[1])
			.filter((ten) => ten !== "draft_ready" && ten !== "status");
		expect(tenTrongChiDan.length).toBeGreaterThan(0);
		const agentBuilder = (
			await import("../agent/subagents/agent_builder/agent")
		).default;
		expect(
			[...new Set(tenTrongChiDan)].every(
				(ten) =>
					agentBuilder.outputSchema.safeParse({
						status: ten,
						reason: "khong duoc phep",
					}).success,
			),
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
