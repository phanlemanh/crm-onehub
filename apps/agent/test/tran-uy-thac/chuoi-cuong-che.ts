import { mock } from "bun:test";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
	buildPendingInputRequest,
	commandTypeFromAuthorization,
} from "@crm/validation/builder-question";
import type { HookEvent } from "eve/hooks";
import {
	type BuilderDelegationState,
	EMPTY_BUILDER_DELEGATION,
} from "../../agent/lib/builder-delegation";
import { builderSessionAttributes } from "../../agent/lib/custom-agent-dispatch";

const DAY = dirname(fileURLToPath(import.meta.url));

export const DUONG_STATE = resolve(
	DAY,
	"../../agent/lib/builder-delegation-state.ts",
);
export const DUONG_HOOK = resolve(
	DAY,
	"../../agent/hooks/builder-delegation.ts",
);

export type SuKienHook = HookEvent<"actions.requested">;
export type DuLieuHook = SuKienHook["data"];
export type HanhDong = DuLieuHook["actions"][number];

let kho: BuilderDelegationState = EMPTY_BUILDER_DELEGATION;
let nhatKy: string[] = [];

mock.module(DUONG_STATE, () => ({
	builderDelegationState: {
		get: () => {
			nhatKy.push("get");
			return kho;
		},
		update: (
			buoc: (current: BuilderDelegationState) => BuilderDelegationState,
		) => {
			nhatKy.push("update");
			kho = buoc(kho);
		},
	},
}));

export function datSlot(
	dau: BuilderDelegationState = EMPTY_BUILDER_DELEGATION,
) {
	kho = dau;
	nhatKy = [];
	return {
		doc: () => kho,
		get nhatKy() {
			return nhatKy;
		},
	};
}

export async function layHandler() {
	const hook = (await import(DUONG_HOOK)).default;
	return hook.events["actions.requested"] as (
		event: SuKienHook,
		ctx: never,
	) => void;
}

const goi = (callId: string, subagentName: string): HanhDong => ({
	callId,
	description: "dung ban nhap tac nhan",
	input: {},
	kind: "subagent-call",
	name: subagentName,
	nodeId: "node-1",
	subagentName,
});

export const goiBuilder = (callId: string) => goi(callId, "agent_builder");
export const goiKhac = (callId: string) => goi(callId, "agent_runner");

export const duLieu = (
	turnId: string,
	stepIndex: number,
	sequence: number,
	...actions: HanhDong[]
): DuLieuHook => ({ actions, sequence, stepIndex, turnId });

export const suKien = (data: DuLieuHook) => ({ data }) as unknown as SuKienHook;

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

export const phien = (over: Record<string, string> = {}, authorized = true) =>
	({
		session: {
			auth: {
				current: {
					attributes: {
						...builderSessionAttributes({
							commandType: commandTypeFromAuthorization(banGhi(authorized)),
							message: {
								text: "co",
								resources: [],
								inputResponse: { requestId: "req_1", text: "co" },
							},
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
	}) as never;
