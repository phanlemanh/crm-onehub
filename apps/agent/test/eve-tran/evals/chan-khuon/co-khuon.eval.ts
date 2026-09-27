import { defineEval } from "eve/evals";
import { BUILDER_OUTPUT_SCHEMA_MESSAGE } from "../../agent/_chep/builder-delegation";
import { KICH_BAN } from "../../agent/kich-ban";

export default defineEval({
	description:
		"A root call to agent_builder carrying outputSchema fails the turn before any child session starts.",
	async test(t) {
		await t.send(KICH_BAN.coKhuon);
		t.event("turn.failed").label("luot hong");
		t.notEvent("subagent.called").label("khong phien con nao");
		t.eventsSatisfy("loi mang cau chan outputSchema", (events) =>
			JSON.stringify(events).includes(BUILDER_OUTPUT_SCHEMA_MESSAGE),
		);
	},
});
