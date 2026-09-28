import { appendFileSync } from "node:fs";
import { defineEval } from "eve/evals";

export function kichBan(cau: string) {
	return defineEval({
		description: `Fixture run: ${cau}`,
		async test(t) {
			await t.send(cau).catch(() => undefined);
			const tep = process.env.MAU_SU_KIEN;
			if (!tep) return;
			appendFileSync(
				tep,
				`${JSON.stringify({ cau, sessionId: t.sessionId, events: t.events })}\n`,
			);
		},
	});
}
