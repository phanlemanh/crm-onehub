import { z } from "zod";
import { CUA_OKR } from "@/lib/cua-okr-config";
import type { LyDoLuot } from "./kieu";

const laLyDoLuot = (ma: string): ma is LyDoLuot =>
	Object.hasOwn(CUA_OKR.trangThaiTuChoiLuot, ma);

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
	.pipe(z.object({ error: z.string().refine(laLyDoLuot) }));

const loiHttp = z.object({ status: z.number(), body: thanLoi });

export function lyDoTuChoiLuot(loi: Error | undefined): LyDoLuot | null {
	const http = loiHttp.safeParse(loi);
	if (!http.success) return null;
	const ma = http.data.body.error;
	if (!laLyDoLuot(ma)) return null;
	return CUA_OKR.trangThaiTuChoiLuot[ma] === http.data.status ? ma : null;
}
