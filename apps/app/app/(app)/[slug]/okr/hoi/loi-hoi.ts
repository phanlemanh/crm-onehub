import { LY_DO_LUOT_HOI } from "@crm/validation/okr-tra-loi";
import { z } from "zod";
import type { LyDoKhoaHoi } from "./khung-hoi";

const thanLoi = z
	.string()
	.transform((chu, ctx) => {
		try {
			return JSON.parse(chu);
		} catch {
			ctx.addIssue({ code: "custom", message: "khong-phai-json" });
			return z.NEVER;
		}
	})
	.pipe(z.object({ error: z.enum(LY_DO_LUOT_HOI) }));

const loiHttp = z.object({ status: z.literal(429), body: thanLoi });

export function lyDoKhoaTu(loi: Error | undefined): LyDoKhoaHoi | null {
	const http = loiHttp.safeParse(loi);
	return http.success ? http.data.body.error : null;
}
