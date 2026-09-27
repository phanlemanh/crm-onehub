import { defineEval } from "eve/evals";
import { equals } from "eve/evals/expect";
import { builderDeliveryMessage } from "../../agent/_chep/builder-delivery";
import { DAU_BUOC_HAI, KICH_BAN } from "../../agent/kich-ban";

export default defineEval({
	description:
		"A child parked on session-limit stops when the root answers stop, and the root turn is cancelled instead of parking again.",
	async test(t) {
		await t.send(KICH_BAN.dung);
		const yeuCau = t.requireInputRequest();
		t.check(yeuCau.kind, equals("session-limit"));

		const tin = builderDeliveryMessage("bai-nop-thu", {
			text: "Stop",
			inputResponse: {
				requestId: yeuCau.requestId,
				optionId: "stop",
				kind: "session-limit",
			},
		});
		if (Array.isArray(tin) || !("inputResponses" in tin)) {
			throw new Error("builderDeliveryMessage khong tra inputResponses");
		}
		await t.send(tin);

		t.eventsSatisfy("phien con khong chay buoc hai", (events) =>
			!JSON.stringify(events).includes(DAU_BUOC_HAI),
		);
		t.check(t.pendingInputRequests.length, equals(0));
		t.event("turn.cancelled").label("luot goc bi huy, khong do tiep");
		t.notEvent("subagent.completed").label("phien con khong nop ket qua");
	},
});
