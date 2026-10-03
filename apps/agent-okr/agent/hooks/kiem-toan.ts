import { db, type Prisma } from "@crm/db";
import { defineHook } from "eve/hooks";
import { TRO_LY_OKR_SOAN } from "../lib/config";

export default defineHook({
	events: {
		async "*"(event, ctx) {
			const id = event.meta?.id;
			if (!id || event.type.endsWith(TRO_LY_OKR_SOAN.suKien.duoiChiTruyen))
				return;
			try {
				await db.agentEvent.createMany({
					data: [
						{
							id,
							sessionId: ctx.session.id,
							contactId: null,
							conversationId: null,
							type: event.type,
							data: ("data" in event
								? (event.data ?? {})
								: {}) as Prisma.InputJsonObject,
							emittedAt: event.meta?.at ? new Date(event.meta.at) : new Date(),
						},
					],
					skipDuplicates: true,
				});
			} catch (loi) {
				console.warn(
					`[kiem-toan] khong ghi duoc su kien ${event.type}: ${loi instanceof Error ? loi.message : String(loi)}`,
				);
			}
		},
	},
});
