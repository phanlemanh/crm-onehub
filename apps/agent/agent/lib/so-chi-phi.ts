import { db } from "@crm/db";
import { ghiChiPhi } from "@crm/db/ai-chi-phi";
import { okrViecCuaLoai, tinhNangCua } from "@crm/db/ai-chi-phi-danh-muc";
import type { HookEvent } from "eve/hooks";
import { z } from "zod";
import { docViecTheoPhienGoc } from "./okr/doc";
import { SUBAGENT_TRO_LY_OKR } from "./okr/uy-quyen";
import { type NguCanhKenh, phienChaCua, phienGocCua } from "./phien-con";
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

async function viecTheoPhienGoc(goc: string) {
	try {
		return await docViecTheoPhienGoc(goc);
	} catch (loi) {
		console.warn(
			`[so-chi-phi] không tra được việc của phiên gốc ${goc}: ${loi instanceof Error ? loi.message : String(loi)}`,
		);
		return null;
	}
}

async function viecOkrCuaBuoc(
	ctx: NguCanhSo,
	subagent: string | null,
): Promise<{ okrViec: string | null; taskId: string | null }> {
	const okrViec = attribute(ctx, "okrViec");
	const taskId = attribute(ctx, "okrTaskId");
	if (subagent !== SUBAGENT_TRO_LY_OKR || (okrViec && taskId)) {
		return { okrViec, taskId };
	}
	const goc = phienGocCua(ctx);
	const hang = goc ? await viecTheoPhienGoc(goc) : null;
	if (!hang) return { okrViec, taskId };
	return { okrViec: okrViecCuaLoai(hang.kind), taskId: hang.id };
}

export async function ghiBuoc(
	event: HookEvent<"step.completed">,
	ctx: NguCanhSo,
	subagent: string | null,
): Promise<boolean> {
	try {
		const b = buoc.parse(event);
		if (!b?.data.usage) return false;
		const u = b.data.usage;
		const okr = await viecOkrCuaBuoc(ctx, subagent);
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
				okrViec: okr.okrViec,
			}),
			taskId: okr.taskId ?? attribute(ctx, "taskId"),
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
