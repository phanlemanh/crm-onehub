import { z } from "zod";

export const LOAI_NHAC = [
	"buoc-qua-han",
	"buoc-sap-han",
	"ke-hoach-im",
	"moc-ngay",
] as const;

export type LoaiNhac = (typeof LOAI_NHAC)[number];

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
