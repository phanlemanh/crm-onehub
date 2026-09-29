import { GIAI_DOAN } from "@crm/db/giai-doan";
import { z } from "zod";

export const loaiGiaiDoan = z.enum(GIAI_DOAN.loai);

export const nhanGiaiDoan = z.string().trim().min(1).max(GIAI_DOAN.nhan.toiDa);

export const stageChangeMeta = z
	.object({ from: z.string().min(1).nullable(), to: z.string().min(1) })
	.nullable();

export type StageChangeMeta = z.infer<typeof stageChangeMeta>;

export function parseStageChangeMeta(value: unknown): StageChangeMeta {
	const parsed = stageChangeMeta.safeParse(value);
	return parsed.success ? parsed.data : null;
}
