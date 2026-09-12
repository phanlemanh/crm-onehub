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

export type SuKienHanhDong = HookEvent<"actions.requested">;
export type DuLieuHanhDong = SuKienHanhDong["data"];
export type HanhDong = DuLieuHanhDong["actions"][number];
let kho: BuilderDelegationState = { ...EMPTY_BUILDER_DELEGATION };
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

export function datSlot() {
	kho = { ...EMPTY_BUILDER_DELEGATION };
	nhatKy = [];
	return {
		doc: () => kho,
		get nhatKy() {
			return nhatKy;
		},
	};
}

export async function layHookTu(duong: string) {
	const hook = (await import(duong)).default;
	return {
		hanhDong: hook.events["actions.requested"] as (
			event: SuKienHanhDong,
			ctx: never,
		) => void,
	};
}

export const layHook = () => layHookTu(DUONG_HOOK);

export type Hook = Awaited<ReturnType<typeof layHookTu>>;

export const CHUOI_SONG = {
	daGhi: true,
	oSauLanMot: { turnId: "turn-1", callIds: ["call-a"] },
	nemOLanHai: true,
} as const;

export function kiemChuoiCuongChe(hook: Hook) {
	const slot = datSlot();
	hook.hanhDong(suKien(duLieu("turn-1", 2, goiBuilder("call-a"))), phien());
	const daGhi = slot.nhatKy.length > 0;
	const oSauLanMot = slot.doc();
	let nemOLanHai = false;
	try {
		hook.hanhDong(suKien(duLieu("turn-1", 2, goiBuilder("call-b"))), phien());
	} catch {
		nemOLanHai = true;
	}
	return { daGhi, oSauLanMot, nemOLanHai };
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
	...actions: HanhDong[]
): DuLieuHanhDong => ({ actions, sequence: 0, stepIndex, turnId });

export const suKien = (data: DuLieuHanhDong) =>
	({ data }) as unknown as SuKienHanhDong;

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
