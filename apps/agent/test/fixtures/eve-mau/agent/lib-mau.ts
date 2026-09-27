import { appendFileSync } from "node:fs";
import type { HookContext, HookEvent } from "eve/hooks";
import { z } from "zod";

const thuocTinh = z
	.object({ attributes: z.record(z.string(), z.unknown()).catch({}) })
	.nullable()
	.catch(null);

const nguCanh = z.object({
	session: z.object({
		id: z.string(),
		auth: z
			.object({ current: thuocTinh, initiator: thuocTinh })
			.catch({ current: null, initiator: null }),
	}),
	channel: z.looseObject({ kind: z.string() }).nullable().catch(null),
	agent: z.looseObject({}).nullable().catch(null),
});

export function ghiLai(
	ten: string,
	event: HookEvent<"step.completed">,
	ctx: HookContext,
): void {
	const tep = process.env.MAU_GHI;
	if (!tep) return;
	const doc = nguCanh.safeParse(ctx);
	appendFileSync(
		tep,
		`${JSON.stringify({ ten, event, ctx: doc.success ? doc.data : null })}\n`,
	);
}

export function demGhiDau(): number {
	const tep = process.env.MAU_DEM;
	if (!tep) throw new Error("MAU_DEM chua dat");
	appendFileSync(tep, "1\n");
	return 1;
}
