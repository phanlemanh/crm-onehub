import { defineSchedule } from "eve/schedules";
import crm from "../channels/crm";
import { lenLichDoiSoat } from "../lib/ai-doi-soat";
import { sweepBlankFacts } from "../lib/blank-facts";
import {
	pendingAgentRunIds,
	pendingBuilderSubmissionIds,
	queueDueAgentRuns,
} from "../lib/custom-agent-dispatch";
import { brief, drainAll, taskAuth } from "../lib/dispatch";
import { lenLichNhac } from "../lib/nhac-ke-hoach";
import { chupSoOkr } from "../lib/okr-chup";
import { reconcileStaleTasks } from "../lib/stale-tasks";
import { dongHoiKhoQuaHan, hoiKhoCho } from "../lib/tai-lieu-hoi-phien";
import { dongMaySoanQuaHan, nguonChoSoan } from "../lib/tai-lieu-phien";
import { kiemBot } from "../lib/zalo-bot";
import { dongHoiQuaHan } from "../lib/zalo-hoi";

export default defineSchedule({
	cron: "* * * * *",
	async run({ receive, waitUntil, appAuth }) {
		waitUntil(
			Promise.all([
				sweepBlankFacts(),
				lenLichNhac(),
				lenLichDoiSoat(),
				chupSoOkr(),
				kiemBot(),
				dongHoiQuaHan(),
				dongMaySoanQuaHan(),
				dongHoiKhoQuaHan(),

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
					const [builderIds, runIds, nguonIds, hoiIds] = await Promise.all([
						pendingBuilderSubmissionIds(),
						pendingAgentRunIds(),
						nguonChoSoan(),
						hoiKhoCho(),
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
						...nguonIds.map((nguonId) =>
							receive(crm, {
								message: "Draft a queued document source.",
								target: { nguonId },
								auth: appAuth,
							}),
						),
						...hoiIds.map((hoiId) =>
							receive(crm, {
								message: "Answer a queued document library question.",
								target: { hoiId },
								auth: appAuth,
							}),
						),
					]);
				})(),
			]),
		);
	},
});
