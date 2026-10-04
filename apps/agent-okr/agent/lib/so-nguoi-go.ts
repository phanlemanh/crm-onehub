import { db } from "@crm/db";
import { trichSo } from "@crm/validation/okr-kiem-de-xuat";
import { z } from "zod";
import { TRO_LY_OKR_SOAN } from "./config";

const thanTin = z
	.object({ message: z.string().catch("") })
	.catch({ message: "" });

export async function docSoNguoiGo(
	sessionIds: readonly string[],
): Promise<Set<string>> {
	const ds = await db.agentEvent.findMany({
		where: {
			sessionId: { in: [...sessionIds] },
			type: TRO_LY_OKR_SOAN.suKien.nguoiGo,
		},
		select: { data: true },
	});
	return new Set(
		ds.flatMap((d) => trichSo(thanTin.parse(d.data).message)).map(String),
	);
}
