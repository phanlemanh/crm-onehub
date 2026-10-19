import { writeFileSync } from "node:fs";
import { defineEval } from "eve/evals";
import { equals } from "eve/evals/expect";
import { builderDeliveryMessage } from "../../agent/_chep/builder-delivery";
import { CAU_HOI_THU, CHO_TRA_LOI_MS, KICH_BAN } from "../../agent/kich-ban";

type Loai = "question" | "session-limit";

function napTraLoi(requestId: string, loai: Loai) {
	const tin = builderDeliveryMessage("bai-nop-thu", {
		text: "tra loi",
		inputResponse:
			loai === "question"
				? { requestId, optionId: CAU_HOI_THU.option.id, kind: "question" }
				: { requestId, optionId: "continue", kind: "session-limit" },
	});
	if (Array.isArray(tin) || !("inputResponses" in tin)) {
		throw new Error("builderDeliveryMessage khong tra inputResponses");
	}
	return { ...tin, signal: AbortSignal.timeout(CHO_TRA_LOI_MS) };
}

export default defineEval({
	description:
		"Two root turns each delegate to a fresh child that asks; the root channel receives both input.requested payloads.",
	async test(t) {
		const ra = process.env.TNV_HAI_LUOT_RA;
		if (!ra) throw new Error("thieu TNV_HAI_LUOT_RA");

		const luot: Array<[string, Loai]> = [
			[KICH_BAN.hoi, "question"],
			[KICH_BAN.hoi, "question"],
			[KICH_BAN.tiep, "session-limit"],
			[KICH_BAN.tiep, "session-limit"],
		];
		for (const [kichBan, loai] of luot) {
			await t.send(kichBan);
			const yeuCau = t.requireInputRequest();
			t.check(yeuCau.kind, equals(loai));
			await t.send(napTraLoi(yeuCau.requestId, loai));
			t.check(t.pendingInputRequests.length, equals(0));
		}

		const payload = t.events
			.filter((event) => event.type === "input.requested")
			.map((event) => event.data);
		t.check(payload.length, equals(luot.length));
		writeFileSync(ra, JSON.stringify(payload, null, 2));
	},
});
