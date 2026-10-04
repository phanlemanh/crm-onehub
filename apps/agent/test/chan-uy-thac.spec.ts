import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { builderSessionAttributes } from "../agent/lib/custom-agent-dispatch";
import {
	builderTurnAuthorized,
	purposeOf,
	SESSION_PURPOSES,
} from "../agent/lib/session-purpose";
import agentBuilder from "../agent/subagents/agent_builder/agent";
import {
	BUILDER_DENIED_REASON,
	builderTurnApproval,
} from "../agent/subagents/agent_builder/lib/authorization";
import { recordBuilderActions } from "../agent/subagents/agent_builder/lib/execution-state";

const GHIM =
	"This turn is not authorized to create or revise an agent. Stop now and return final_output with status not_authorized and this sentence as the reason. Do not write files, do not save a draft.";

const phienThat = (over: Record<string, string> = {}) => ({
	session: {
		auth: {
			current: {
				attributes: {
					...builderSessionAttributes({
						commandType: "CREATE_AGENT",
						conversationId: "conv_1",
						userId: "user_1",
						submissionId: "sub_1",
						hasTitle: true,
					}),
					...over,
				},
			},
			initiator: null,
		},
	},
});

const chamPolicy = (ctx: ReturnType<typeof phienThat>) =>
	builderTurnApproval({ ...ctx, toolName: "inspect_context" });

describe("quyen", () => {
	it("khoa fixture rut round-trip trung khoa policy doc", () => {
		const keys = Object.keys(
			builderSessionAttributes({
				commandType: "CREATE_AGENT",
				conversationId: "c",
				userId: "u",
				submissionId: "s",
				hasTitle: false,
			}),
		);
		expect(keys).toContain("purpose");
		expect(keys).toContain("commandType");
		expect(purposeOf(phienThat())).toBe("builder");
	});

	it("quyen: cap hai chieu tren cung fixture, khac dung mot truong", () => {
		expect(builderTurnAuthorized(phienThat())).toBe(true);
		expect(builderTurnAuthorized(phienThat({ commandType: "CHAT" }))).toBe(
			false,
		);
	});

	it("quyen: ma tran toan phan purpose nhan commandType", () => {
		expect(SESSION_PURPOSES).toHaveLength(8);
		const cases = SESSION_PURPOSES.flatMap((purpose) =>
			["CREATE_AGENT", "CHAT"].map((commandType) => ({ purpose, commandType })),
		);
		expect(cases).toHaveLength(SESSION_PURPOSES.length * 2);
		for (const purpose of SESSION_PURPOSES) {
			expect(purposeOf(phienThat({ purpose }))).toBe(purpose);
		}
		for (const c of cases) {
			const duocPhep =
				c.purpose === "builder" && c.commandType === "CREATE_AGENT";
			expect(builderTurnAuthorized(phienThat(c))).toBe(duocPhep);
			expect(chamPolicy(phienThat(c))).toEqual(
				duocPhep ? "not-applicable" : { type: "denied", reason: GHIM },
			);
		}
	});

	it("quyen: ba hinh dang thieu thuoc tinh deu dong", () => {
		const thieu = [
			{ purpose: "" },
			{ commandType: "" },
			{ purpose: "", commandType: "" },
		];
		expect(thieu).toHaveLength(3);
		for (const over of thieu) {
			expect(builderTurnAuthorized(phienThat(over))).toBe(false);
		}
	});

	it("quyen: policy tra denied kem hang ghim, khong nem", () => {
		expect(BUILDER_DENIED_REASON).toBe(GHIM);
		const denied = chamPolicy(phienThat({ commandType: "CHAT" }));
		expect(denied).toEqual({ type: "denied", reason: GHIM });
		expect(chamPolicy(phienThat())).toBe("not-applicable");
	});
});

const TOOL_DIR = join(
	import.meta.dir,
	"../agent/subagents/agent_builder/tools",
);
const TOOLS_GHIM = [
	"inspect_context",
	"write_agent_file",
	"save_agent_draft",
] as const;

describe("moi-tool", () => {
	it("moi-tool: moi tool con song tren dia deu nam trong danh sach ghim", async () => {
		const tatCa = readdirSync(TOOL_DIR)
			.filter((f) => f.endsWith(".ts"))
			.map((f) => f.replace(/\.ts$/, ""))
			.sort();
		expect(tatCa.length).toBeGreaterThan(TOOLS_GHIM.length);

		const conSong: string[] = [];
		for (const name of tatCa) {
			const mod = await import(
				`../agent/subagents/agent_builder/tools/${name}`
			);
			if (mod.default.kind === "eve:disabled-tool") continue;
			conSong.push(name);
		}
		expect(conSong.sort()).toEqual([...TOOLS_GHIM].sort());
	});

	it("moi-tool: moi tool ghim deu khai policy VA giu lop trong", async () => {
		expect(TOOLS_GHIM).toHaveLength(3);
		for (const name of TOOLS_GHIM) {
			const mod = await import(
				`../agent/subagents/agent_builder/tools/${name}`
			);
			expect(mod.default.approval).toBe(builderTurnApproval);
			await expect(
				mod.default.execute({}, phienThat({ commandType: "CHAT" })),
			).rejects.toThrow(
				"Agent creation requires an explicit request to create or build an agent.",
			);
		}
	});

	it("moi-tool: ly do tu choi cua moi tool la mot chuoi duy nhat", async () => {
		expect(TOOLS_GHIM).toHaveLength(3);
		for (const name of TOOLS_GHIM) {
			const mod = await import(
				`../agent/subagents/agent_builder/tools/${name}`
			);
			expect(
				mod.default.approval({
					...phienThat({ commandType: "CHAT" }),
					toolName: name,
				}),
			).toEqual({ type: "denied", reason: GHIM });
			expect(readFileSync(join(TOOL_DIR, `${name}.ts`), "utf8")).not.toContain(
				BUILDER_DENIED_REASON,
			);
		}
	});
});

const trangThaiMoi = () => ({
	turnId: null,
	stepIndex: null,
	callIds: [],
	stepCallIds: [],
	saveCallIds: [],
	savePending: false,
	saved: false,
});

describe("ket-thuc", () => {
	it("ket-thuc: schema nhan not_authorized va van nhan draft_ready", () => {
		const schema = agentBuilder.outputSchema;
		expect(
			schema.safeParse({ status: "not_authorized", reason: "khong duoc phep" })
				.success,
		).toBe(true);
		expect(
			schema.safeParse({
				status: "draft_ready",
				summary: "xong",
				agentId: "a",
				versionId: "v",
			}).success,
		).toBe(true);
		expect(schema.safeParse({ status: "not_authorized" }).success).toBe(false);
		expect(
			schema.safeParse({ status: "draft_ready", summary: "xong" }).success,
		).toBe(false);
	});

	it("ket-thuc: goc JSON Schema la object, vi eve giao thang cho final_output", () => {
		const shape = z.toJSONSchema(agentBuilder.outputSchema, {
			target: "draft-7",
		});
		expect(shape.type).toBe("object");
		expect(shape.oneOf).toBeUndefined();
		expect(shape.anyOf).toBeUndefined();
	});

	it("ket-thuc: chot khoa theo STATUS tra ve, khong theo co quyen", () => {
		expect(() =>
			recordBuilderActions(trangThaiMoi(), "t1", 0, [
				{
					callId: "c1",
					kind: "tool-call",
					toolName: "final_output",
					input: { status: "not_authorized", reason: "khong duoc phep" },
				},
			]),
		).not.toThrow();
		expect(() =>
			recordBuilderActions(trangThaiMoi(), "t1", 0, [
				{
					callId: "c1",
					kind: "tool-call",
					toolName: "final_output",
					input: {
						status: "draft_ready",
						summary: "x",
						agentId: "a",
						versionId: "v",
					},
				},
			]),
		).toThrow("Save the draft before returning draft_ready.");
	});
});
