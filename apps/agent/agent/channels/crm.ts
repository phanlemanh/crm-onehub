import { EnrichmentStatus, Prisma } from "@crm/db";
import { MAX_ATTEMPTS } from "@crm/db/agent-tasks";
import { schemas } from "@crm/validation";
import {
	type EveTurnFailure,
	eveTurnFailure,
} from "@crm/validation/eve-stream";
import {
	type ChannelEvents,
	defineChannel,
	GET,
	POST,
	type SendOptions,
} from "eve/channels";
import { z } from "zod";
import { recordBuilderInputRequest } from "../lib/builder-input";
import { authorised } from "../lib/cau-noi-auth";
import { verifyKey } from "../lib/context-dev";
import {
	builderIdFromToken,
	builderToken,
	cancelRun,
	dispatchAgentRun,
	dispatchBuilderSubmission,
	drainAgentRuns,
	drainBuilder,
	failRun,
	runIdFromToken,
	runToken,
} from "../lib/custom-agent-dispatch";
import {
	brief,
	DRAIN_TIMEOUT_MS,
	dispatchHealth,
	drainAll,
	guiTuyChon,
	taskAuth,
} from "../lib/dispatch";
import { DISPATCH } from "../lib/dispatch-config";
import { choKetLuot } from "../lib/dong-luot-tac-nhan";
import { settle } from "../lib/enrichment";
import { TRO_LY_OKR } from "../lib/okr/config";
import { dongViecOkr, laHangTroLyOkr } from "../lib/okr/viec";
import { createSlackChannel } from "../lib/slack-membership";
import { reconcileStaleTasks } from "../lib/stale-tasks";
import {
	dongHoiKhoKhiPhienHong,
	dongHoiKhoKhiPhienXong,
	drainHoiKho,
	guiHoiKho,
} from "../lib/tai-lieu-hoi-phien";
import {
	dongKhiPhienHong,
	dongKhiPhienXong,
	drainMaySoan,
	guiMaySoan,
} from "../lib/tai-lieu-phien";
import { completeTask, taskSubject } from "../lib/tasks";
import { baoTacNhan } from "../lib/thong-bao-tac-nhan";

const TASK_MARKER = "task:";
const STALE_QUEUE_MS = DISPATCH.sweep.staleQueueMs;

type InternalDispatchPrincipal = {
	readonly authenticator: string;
	readonly principalId: string;
	readonly principalType: string;
} | null;

const identifier = z.string().trim().min(1).nullable().catch(null);

const cancelRunRequest = z.object({ runId: identifier }).catch({ runId: null });

const verifyKeyRequest = z
	.object({ apiKey: identifier })
	.catch({ apiKey: null });

const receiveTarget = z
	.object({
		builderSubmissionId: z.string().nullable().catch(null),
		runId: z.string().nullable().catch(null),
		taskId: z.string().nullable().catch(null),
		nguonId: z.string().nullable().catch(null),
		hoiId: z.string().nullable().catch(null),
	})
	.catch({
		builderSubmissionId: null,
		runId: null,
		taskId: null,
		nguonId: null,
		hoiId: null,
	});

export function taskToken(taskId: string): string {
	return `${TASK_MARKER}${taskId}`;
}

export function taskFromToken(token: string | undefined): string | null {
	if (!token) return null;

	const marker = token.lastIndexOf(TASK_MARKER);
	if (marker === -1) return null;

	const id = token.slice(marker + TASK_MARKER.length);
	return id.length > 0 ? id : null;
}

export async function closeTask(
	token: string | undefined,
	outcome: string,
	status: EnrichmentStatus = EnrichmentStatus.COMPLETE,
): Promise<boolean> {
	const taskId = taskFromToken(token);
	if (!taskId) return false;

	const subject =
		(await completeTask(taskId, outcome)) ?? (await taskSubject(taskId));
	if (subject) await settle(subject, status);

	return true;
}

async function dongViecOkrChuaNop(token: string | undefined): Promise<boolean> {
	const taskId = taskFromToken(token);
	if (!taskId || !(await laHangTroLyOkr(taskId))) return false;
	await dongViecOkr(taskId, TRO_LY_OKR.ketThuc.khongNop);
	return true;
}

function logBuilderFailure(
	conversationId: string,
	event: "turn.failed" | "session.failed",
	failure: EveTurnFailure,
) {
	console.error(
		`[agent] builder conversation ${conversationId} ${event}: ${failure.code ?? "AGENT_FAILED"} ${failure.message ?? ""}`,
	);
}

export const crmEvents: ChannelEvents = {
	async "input.requested"(data, channel, ctx) {
		await recordBuilderInputRequest(data, channel.continuationToken, ctx);
	},

	async "message.completed"(data, channel) {
		const conversationId = builderIdFromToken(channel.continuationToken);
		if (!conversationId || !data.message?.trim()) return;

		await import("@crm/db").then(({ db }) =>
			db.agentConversation.updateMany({
				where: { id: conversationId, kind: "BUILDER" },
				data: {
					lastAssistantAt: new Date(),
					lastMessageAt: new Date(),
					messageCount: { increment: 1 },
				},
			}),
		);
	},

	async "session.waiting"(_data, channel) {
		if (await dongViecOkrChuaNop(channel.continuationToken)) return;
		if (await closeTask(channel.continuationToken, "ran")) return;

		const conversationId = builderIdFromToken(channel.continuationToken);
		if (!conversationId) return;

		await import("@crm/db").then(({ db }) =>
			db.agentConversation.updateMany({
				where: { id: conversationId, kind: "BUILDER" },
				data: { continuationToken: builderToken(conversationId) },
			}),
		);
		await baoTacNhan(conversationId, "cho");
	},

	async "turn.failed"(data, channel) {
		const taskId = taskFromToken(channel.continuationToken);
		const reason =
			eveTurnFailure.parse(data).message ?? "The agent turn failed.";
		if (await dongKhiPhienHong(channel.continuationToken, reason)) return;
		if (await dongHoiKhoKhiPhienHong(channel.continuationToken, reason)) return;

		if (taskId) {
			if (await laHangTroLyOkr(taskId)) {
				await dongViecOkr(taskId, TRO_LY_OKR.ketThuc.turnFailed);
				return;
			}
			const subject = await taskSubject(taskId);
			if (subject) await settle(subject, EnrichmentStatus.FAILED, reason);
			return;
		}

		const conversationId = builderIdFromToken(channel.continuationToken);
		if (conversationId) {
			logBuilderFailure(
				conversationId,
				"turn.failed",
				eveTurnFailure.parse(data),
			);
			const { db } = await import("@crm/db");
			await db.agentConversation.updateMany({
				where: { id: conversationId, kind: "BUILDER" },
				data: {
					continuationToken: builderToken(conversationId),
					pendingInputRequest: Prisma.DbNull,
				},
			});
			await baoTacNhan(conversationId, "hong");
			return;
		}

		const runId = runIdFromToken(channel.continuationToken);
		if (runId) await failRun(runId, "TURN_FAILED", reason);
	},

	async "session.completed"(_data, channel) {
		if (await dongKhiPhienXong(channel.continuationToken)) return;
		if (await dongHoiKhoKhiPhienXong(channel.continuationToken)) return;
		if (await dongViecOkrChuaNop(channel.continuationToken)) return;
		if (await closeTask(channel.continuationToken, "ran")) return;

		const conversationId = builderIdFromToken(channel.continuationToken);
		if (conversationId) {
			const { db } = await import("@crm/db");
			await db.agentConversation.updateMany({
				where: { id: conversationId, kind: "BUILDER" },
				data: { pendingInputRequest: Prisma.DbNull },
			});
			return;
		}

		const runId = runIdFromToken(channel.continuationToken);
		if (!runId) return;

		await choKetLuot(runId);
	},

	async "turn.cancelled"(_data, channel) {
		if (
			await closeTask(
				channel.continuationToken,
				"stopped",
				EnrichmentStatus.SKIPPED,
			)
		) {
			return;
		}

		const conversationId = builderIdFromToken(channel.continuationToken);
		if (conversationId) {
			const { db } = await import("@crm/db");
			await db.agentConversation.updateMany({
				where: { id: conversationId, kind: "BUILDER" },
				data: {
					continuationToken: builderToken(conversationId),
					pendingInputRequest: Prisma.DbNull,
				},
			});
			return;
		}

		const runId = runIdFromToken(channel.continuationToken);
		if (runId) {
			await cancelRun(
				runId,
				"CANCELLED",
				"The run was stopped before it finished.",
			);
		}
	},

	async "session.failed"(data, channel) {
		if (await dongKhiPhienHong(channel.continuationToken, data.message)) {
			return;
		}
		if (await dongHoiKhoKhiPhienHong(channel.continuationToken, data.message)) {
			return;
		}
		const conversationId = builderIdFromToken(channel.continuationToken);
		if (conversationId) {
			logBuilderFailure(
				conversationId,
				"session.failed",
				eveTurnFailure.parse(data),
			);
			const { db } = await import("@crm/db");
			await db.agentConversation.updateMany({
				where: { id: conversationId, kind: "BUILDER" },
				data: {
					continuationToken: builderToken(conversationId),
					pendingInputRequest: Prisma.DbNull,
					lastAssistantAt: new Date(),
					lastMessageAt: new Date(),
				},
			});
			await baoTacNhan(conversationId, "hong");
			return;
		}

		const runId = runIdFromToken(channel.continuationToken);
		if (runId) await failRun(runId, data.code, data.message);
	},
};

export default defineChannel({
	routes: [
		GET("/internal/crm/dispatch-health", async (request) => {
			if (!authorised(request)) {
				return new Response("Unauthorized", { status: 401 });
			}

			const health = dispatchHealth();
			const { db } = await import("@crm/db");
			const now = new Date();
			const overdue = await db.agentTask.count({
				where: {
					finishedAt: null,
					dueAt: { lte: new Date(now.getTime() - STALE_QUEUE_MS) },
					attempts: { lt: MAX_ATTEMPTS },
					OR: [{ leasedUntil: null }, { leasedUntil: { lt: now } }],
				},
			});

			const wedged = health.stalledMs > DRAIN_TIMEOUT_MS;
			return Response.json(
				{
					ok: !wedged && overdue === 0,
					wedged,
					overdueTasks: overdue,
					...health,
				},
				{ status: wedged || overdue > 0 ? 503 : 200 },
			);
		}),

		POST("/internal/crm/dispatch", async (request, { send, waitUntil }) => {
			if (!authorised(request)) {
				return new Response("Unauthorized", { status: 401 });
			}

			waitUntil(
				(async () => {
					await reconcileStaleTasks();
					await drainAll((task) =>
						send(brief(task), {
							auth: taskAuth(task),
							continuationToken: taskToken(task.id),
							...guiTuyChon(task),
						}),
					);
					await drainAgentRuns(send);
					await drainMaySoan(send);
					await drainHoiKho(send);
				})(),
			);

			return new Response(null, { status: 202 });
		}),

		POST(
			"/internal/crm/builder-dispatch",
			async (request, { send, waitUntil }) => {
				if (!authorised(request)) {
					return new Response("Unauthorized", { status: 401 });
				}

				waitUntil(drainBuilder(send));
				return new Response(null, { status: 202 });
			},
		),

		POST(
			"/internal/crm/agent-dispatch",
			async (request, { send, waitUntil }) => {
				if (!authorised(request)) {
					return new Response("Unauthorized", { status: 401 });
				}

				waitUntil(drainAgentRuns(send));
				return new Response(null, { status: 202 });
			},
		),

		POST("/internal/crm/cancel-run", async (request, { cancel }) => {
			if (!authorised(request)) {
				return new Response("Unauthorized", { status: 401 });
			}

			const { runId } = cancelRunRequest.parse(
				await request.json().catch(() => null),
			);
			if (!runId) {
				return Response.json({ error: "No run id was sent." }, { status: 400 });
			}

			return Response.json(
				await cancel({ continuationToken: runToken(runId) }),
			);
		}),

		POST("/internal/crm/slack/create-channel", async (request) => {
			if (!authorised(request)) {
				return new Response("Unauthorized", { status: 401 });
			}

			const parsed = schemas.slack.createPayload.safeParse(
				await request.json().catch(() => null),
			);

			if (!parsed.success) {
				return Response.json(
					{ error: "That channel name is not usable." },
					{ status: 400 },
				);
			}

			const outcome = await createSlackChannel(
				parsed.data.channelName,
				parsed.data.isPrivate,
			);

			return "error" in outcome
				? Response.json({ error: outcome.error }, { status: 422 })
				: Response.json({ channel: outcome });
		}),

		POST("/internal/crm/verify-key", async (request) => {
			if (!authorised(request)) {
				return new Response("Unauthorized", { status: 401 });
			}

			const { apiKey } = verifyKeyRequest.parse(
				await request.json().catch(() => null),
			);

			if (!apiKey) {
				return Response.json(
					{ outcome: "invalid", reason: "No API key was sent." },
					{ status: 400 },
				);
			}

			return Response.json(await verifyKey(apiKey));
		}),
	],

	events: crmEvents,

	async receive(input, { send }) {
		const target = receiveTarget.parse(input.target);
		if (target.builderSubmissionId) {
			assertInternalDispatchAuth(input.auth);
			return dispatchBuilderSubmission(target.builderSubmissionId, send);
		}

		if (target.runId) {
			assertInternalDispatchAuth(input.auth);
			return dispatchAgentRun(target.runId, send);
		}

		if (target.nguonId) {
			assertInternalDispatchAuth(input.auth);
			return guiMaySoan(target.nguonId, send);
		}

		if (target.hoiId) {
			assertInternalDispatchAuth(input.auth);
			const phien = await guiHoiKho(target.hoiId, send);
			if (!phien) throw new Error("This question is not waiting to be sent.");
			return phien;
		}

		const tuyChon: SendOptions = {
			auth: input.auth,
			continuationToken: target.taskId
				? taskToken(target.taskId)
				: `crm:adhoc:${crypto.randomUUID()}`,
		};
		if (input.auth?.attributes?.purpose === "okr") tuyChon.mode = "task";
		return send(input.message, tuyChon);
	},
});

function assertInternalDispatchAuth(auth: InternalDispatchPrincipal): void {
	if (
		auth?.authenticator !== "app" ||
		auth.principalType !== "runtime" ||
		auth.principalId !== "eve:app"
	) {
		throw new Error("Internal agent dispatch requires Eve app authentication.");
	}
}
