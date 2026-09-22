import { LOAI_NHAC } from "@crm/db/onboarding-nhac";
import { z } from "zod";

export { LOAI_NHAC, type LoaiNhac } from "@crm/db/onboarding-nhac";

export const mucNhac = z
	.object({
		loai: z.enum(LOAI_NHAC),
		planId: z.string().min(1),
		stepId: z.string().min(1).optional(),
	})
	.strict();

export const nhacPayload = z
	.object({ muc: z.array(mucNhac), daGui: z.array(mucNhac).optional() })
	.strict();

export type NhacPayload = z.infer<typeof nhacPayload>;

export function parseNhacPayload(value: unknown): NhacPayload {
	const ket = nhacPayload.safeParse(value);
	if (!ket.success) {
		throw new Error(`payload nhac-ke-hoach hong: ${ket.error.message}`);
	}
	return ket.data;
}
