import { db } from "@crm/db";
import { z } from "zod";
import { failRun } from "./custom-agent-dispatch";
import { DISPATCH } from "./dispatch-config";
import { finishRun, runResultOf } from "./run-runtime";
import { attribute, type PurposeContext, purposeOf } from "./session-purpose";

export const LY_DO_DONG_LUOT = {
	khongNop: "Bộ chạy dừng trước khi nộp kết quả.",
	khongLyDo: "Bộ chạy báo lỗi nhưng không nói lý do.",
} as const;

const loiCoCau = z.object({ message: z.string().trim().min(1) });

export const loiBoChay = z.object({
	result: z.object({
		kind: z.literal("subagent-result"),
		subagentName: z.literal("agent_runner"),
		isError: z.literal(true),
		output: loiCoCau.nullable().catch(null),
	}),
});

export type LoiBoChay = z.infer<typeof loiBoChay>;

export async function dongLuotKhiBoChayLoi(
	loi: LoiBoChay,
	ctx: PurposeContext,
): Promise<void> {
	if (purposeOf(ctx) !== "team-agent") return;
	const runId = attribute(ctx, "runId");
	if (!runId) return;
	const coCau = loi.result.output;
	await failRun(
		runId,
		"RUNNER_FAILED",
		coCau
			? coCau.message.slice(0, DISPATCH.run.failureReasonMaxChars)
			: LY_DO_DONG_LUOT.khongLyDo,
	);
}

export async function choKetLuot(runId: string): Promise<void> {
	const run = await db.agentRun.findUnique({
		where: { id: runId },
		select: { status: true, summary: true, result: true },
	});
	if (run?.status !== "RUNNING") return;
	if (run.result === null) {
		await failRun(runId, "RUNNER_NO_RESULT", LY_DO_DONG_LUOT.khongNop);
		return;
	}

	try {
		await finishRun(runId, {
			summary: run.summary ?? "The agent run completed.",
			result: runResultOf(run.result),
		});
	} catch (error) {
		await failRun(
			runId,
			"NEVER_SETTLED",
			error instanceof Error ? error.message : String(error),
		).catch(() => {});
	}
}
