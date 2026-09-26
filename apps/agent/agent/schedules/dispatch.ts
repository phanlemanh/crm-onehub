import { defineSchedule } from "eve/schedules";
import crm from "../channels/crm";
import { sweepBlankFacts } from "../lib/blank-facts";
import {
	pendingAgentRunIds,
	pendingBuilderSubmissionIds,
	queueDueAgentRuns,
} from "../lib/custom-agent-dispatch";
import { brief, drainAll, taskAuth } from "../lib/dispatch";
import { lenLichNhac } from "../lib/nhac-ke-hoach";
import { reconcileStaleTasks } from "../lib/stale-tasks";
import { kiemBot } from "../lib/zalo-bot";
import { dongHoiQuaHan } from "../lib/zalo-hoi";

export default defineSchedule({
	cron: "* * * * *",
	async run({ receive, waitUntil, appAuth }) {
		waitUntil(
			Promise.all([
				sweepBlankFacts(),
				lenLichNhac(),
				kiemBot(),
				dongHoiQuaHan(),

				(async () => {
					await reconcileStaleTasks();
					await drainAll((task) =>
						receive(crm, {
							message: brief(task),
							target: { taskId: task.id },
							auth: taskAuth(task, appAuth),
						}),
					);
					await queueDueAgentRuns();
					const [builderIds, runIds] = await Promise.all([
						pendingBuilderSubmissionIds(),
						pendingAgentRunIds(),
					]);

					await Promise.all([
						...builderIds.map((builderSubmissionId) =>
							receive(crm, {
								message: "Continue a queued private agent-builder chat.",
								target: { builderSubmissionId },
								auth: appAuth,
							}),
						),
						...runIds.map((runId) =>
							receive(crm, {
								message: "Execute a queued deployed agent run.",
								target: { runId },
								auth: appAuth,
							}),
						),
					]);
				})(),
			]),
		);
	},
});
