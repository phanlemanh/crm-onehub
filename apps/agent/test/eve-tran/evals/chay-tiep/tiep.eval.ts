import { defineEval } from "eve/evals";
import { equals } from "eve/evals/expect";
import { builderDeliveryMessage } from "../../agent/_chep/builder-delivery";
import { DAU_BUOC_HAI, KICH_BAN } from "../../agent/kich-ban";

export default defineEval({
	description:
		"A child parked on session-limit resumes when the root answers continue in the shape CRM dispatch sends.",
	async test(t) {
		await t.send(KICH_BAN.tiep);
		const yeuCau = t.requireInputRequest();
		t.check(yeuCau.kind, equals("session-limit"));
		t.check(
			(yeuCau.options ?? []).map((option) => option.id),
			equals(["continue", "stop"]),
		);

		const tin = builderDeliveryMessage("bai-nop-thu", {
			text: "Approve",
			inputResponse: {
				requestId: yeuCau.requestId,
				optionId: "continue",
				kind: "session-limit",
			},
		});
		if (Array.isArray(tin) || !("inputResponses" in tin)) {
			throw new Error("khong chay tiep: builderDeliveryMessage khong tra inputResponses");
		}
		await t.send(tin);

		t.eventsSatisfy("khong chay tiep: phien con khong ve buoc hai", (events) =>
			events.some(
				(event) =>
					event.type === "subagent.completed" &&
					JSON.stringify(event).includes(DAU_BUOC_HAI),
			),
		);
		t.check(t.pendingInputRequests.length, equals(0));
	},
});
