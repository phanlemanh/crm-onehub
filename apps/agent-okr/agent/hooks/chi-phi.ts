import { db } from "@crm/db";
import { ghiChiPhi } from "@crm/db/ai-chi-phi";
import { defineHook } from "eve/hooks";
import { z } from "zod";
import { TRO_LY_OKR_HOI, TRO_LY_OKR_SOAN } from "../lib/config";
import { thuocTinhPhien } from "../lib/phien";

const so = z.number().refine(Number.isFinite).nullable().catch(null);

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
						inputTokens: so.optional(),
						cacheReadTokens: so.optional(),
						outputTokens: so.optional(),
						costUsd: so.optional(),
					})
					.nullable()
					.catch(null),
			})
			.catch({ usage: null }),
	})
	.nullable()
	.catch(null);

export default defineHook({
	events: {
		async "step.completed"(event, ctx) {
			const b = buoc.parse(event);
			if (!b?.data.usage) return;
			const u = b.data.usage;
			const p = thuocTinhPhien(ctx);
			const laHoi = p.purpose === TRO_LY_OKR_HOI.purpose;
			try {
				await ghiChiPhi(db, {
					id: b.meta.id,
					at: b.meta.at ? new Date(b.meta.at) : new Date(),
					sessionId: ctx.session.id,
					phienCha: null,
					kenh: ctx.channel.kind ?? null,
					tinhNang: laHoi ? TRO_LY_OKR_HOI.tinhNang : TRO_LY_OKR_SOAN.tinhNang,
					taskId: laHoi ? p.cuocHoiId : p.cuocSoanId,
					modelId: null,
					inputTokens: u.inputTokens ?? null,
					cacheReadTokens: u.cacheReadTokens ?? null,
					outputTokens: u.outputTokens ?? null,
					costUsd: u.costUsd ?? null,
				});
			} catch (loi) {
				console.warn(
					`[chi-phi] khong ghi duoc buoc: ${loi instanceof Error ? loi.message : String(loi)}`,
				);
			}
		},
	},
});
