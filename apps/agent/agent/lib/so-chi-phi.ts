import { db } from "@crm/db";
import { ghiChiPhi } from "@crm/db/ai-chi-phi";
import { tinhNangCua } from "@crm/db/ai-chi-phi-danh-muc";
import type { HookEvent } from "eve/hooks";
import { z } from "zod";
import { type NguCanhKenh, phienChaCua } from "./phien-con";
import { attribute, type PurposeContext, purposeOf } from "./session-purpose";

const soDem = z.number().refine(Number.isFinite).nullable().catch(null);

const buoc = z
	.object({
		meta: z.object({
			id: z.string().min(1),
			at: z.string().nullable().catch(null),
		}),
		data: z
			.object({
				usage: z
					.object({
						inputTokens: soDem.optional(),
						cacheReadTokens: soDem.optional(),
						outputTokens: soDem.optional(),
						costUsd: soDem.optional(),
					})
					.nullable()
					.catch(null),
			})
			.catch({ usage: null }),
	})
	.nullable()
	.catch(null);

export type NguCanhSo = PurposeContext &
	NguCanhKenh & {
		readonly session: PurposeContext["session"] & { readonly id: string };
	};

export async function ghiBuoc(
	event: HookEvent<"step.completed">,
	ctx: NguCanhSo,
	subagent: string | null,
): Promise<boolean> {
	try {
		const b = buoc.parse(event);
		if (!b?.data.usage) return false;
		const u = b.data.usage;
		await ghiChiPhi(db, {
			id: b.meta.id,
			at: b.meta.at ? new Date(b.meta.at) : new Date(),
			sessionId: ctx.session.id,
			phienCha: phienChaCua(ctx),
			kenh: ctx.channel?.kind ?? null,
			tinhNang: tinhNangCua({
				kenh: subagent ? null : (ctx.channel?.kind ?? null),
				purpose: subagent ? null : purposeOf(ctx),
				subagent,
				okrViec: attribute(ctx, "okrViec"),
			}),
			taskId: attribute(ctx, "okrTaskId") ?? attribute(ctx, "taskId"),
			modelId: null,
			inputTokens: u.inputTokens ?? null,
			cacheReadTokens: u.cacheReadTokens ?? null,
			outputTokens: u.outputTokens ?? null,
			costUsd: u.costUsd ?? null,
		});
		return true;
	} catch (loi) {
		console.warn(
			`[so-chi-phi] không ghi được bước: ${loi instanceof Error ? loi.message : String(loi)}`,
		);
		return false;
	}
}
