import { randomUUID } from "node:crypto";
import { db } from "@crm/db";
import { z } from "zod";
import { MODEL_DANH_MUC } from "./model-config";

type NguCanhPhien = { readonly session?: { readonly id?: string } } | undefined;

const daGhi = new Set<string>();

export async function ghiModelPhien(
	ctx: NguCanhPhien,
	modelId: string,
): Promise<void> {
	const sessionId = ctx?.session?.id;
	if (!sessionId || daGhi.has(sessionId)) return;
	try {
		await db.agentEvent.create({
			data: {
				id: randomUUID(),
				sessionId,
				type: MODEL_DANH_MUC.suKienChon,
				data: { modelId },
				emittedAt: new Date(),
			},
		});
		daGhi.add(sessionId);
	} catch (loi) {
		console.error("[agent] could not record the session model", {
			sessionId,
			loi,
		});
	}
}

const duLieuChon = z.object({ modelId: z.string().min(1) });

export async function modelPhienDaGhi(
	sessionId: string,
): Promise<string | null> {
	const hang = await db.agentEvent.findFirst({
		where: { sessionId, type: MODEL_DANH_MUC.suKienChon },
		orderBy: { emittedAt: "desc" },
		select: { data: true },
	});
	const chon = duLieuChon.safeParse(hang?.data);
	return chon.success ? chon.data.modelId : null;
}
