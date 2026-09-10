import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
	BUILDER_AUTHORIZATION_KEY,
	buildPendingInputRequest,
	commandTypeFromAuthorization,
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

	it("suy-dien: dem tren dia so cho suy quyen tu hinh dang tin nhan phai bang 0", () => {
		const demTrong = (nguon: string) =>
			nguon
				.split("\n")
				.map((dong, i) => ({ dong, so: i + 1 }))
				.filter(({ dong }) => /\?\s*["']CREATE_AGENT["']\s*:/.test(dong));

		const chung =
			'return requestId && (optionId || text) ? "CREATE_AGENT" : commandType;';
		expect(demTrong(chung)).toHaveLength(1);

		const goc = [
			join(import.meta.dir, "../agent"),
			join(import.meta.dir, "../../api/src"),
		];
		const quet = (thuMuc: string): string[] =>
			readdirSync(thuMuc, { withFileTypes: true }).flatMap((muc) => {
				const duong = join(thuMuc, muc.name);
				if (muc.isDirectory()) return quet(duong);
				return muc.name.endsWith(".ts") ? [duong] : [];
			});
		const tepTs = goc.flatMap(quet);
		expect(tepTs.length).toBeGreaterThan(50);
		const dinh = tepTs.flatMap((duong) =>
			demTrong(readFileSync(duong, "utf8")).map(
				({ so }) => `${duong.slice(duong.indexOf("apps/"))}:${so}`,
			),
		);
		if (dinh.length > 0) {
			throw new Error(
				`con suy quyen tu hinh dang tin nhan: ${dinh.join(", ")}`,
			);
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
