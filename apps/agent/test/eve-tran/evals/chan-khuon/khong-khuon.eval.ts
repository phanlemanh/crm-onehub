import { defineEval } from "eve/evals";
import { KICH_BAN } from "../../agent/kich-ban";

export default defineEval({
	description:
		"The same agent_builder call without outputSchema reaches the child and completes.",
	async test(t) {
		await t.send(KICH_BAN.khongKhuon);
		t.succeeded();
		t.calledSubagent("agent_builder", { count: 1 });
		t.event("subagent.completed").label("phien con xong");
		t.notEvent("turn.failed").label("luot khong hong");
	},
});
