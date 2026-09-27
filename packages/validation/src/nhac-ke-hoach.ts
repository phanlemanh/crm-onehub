import { LOAI_NHAC } from "@crm/db/onboarding-nhac";
import { z } from "zod";

export { LOAI_NHAC, type LoaiNhac } from "@crm/db/onboarding-nhac";

const ma = z.string().min(1);

const thangMa = z.string().regex(/^\d{4}-\d{2}$/);

export const mucNhac = z.union([
	z
		.object({ loai: z.enum(LOAI_NHAC), planId: ma, stepId: ma.optional() })
		.strict(),
	z
		.object({ loai: z.literal("okr-cap-nhat"), krIds: z.array(ma).min(1) })
		.strict(),
	z.object({ loai: z.enum(["okr-kr-im"]), keyResultId: ma }).strict(),
	z
		.object({
			loai: z.literal("okr-duoc-giao"),
			objectiveId: ma,
			keyResultId: ma.optional(),
		})
		.strict(),
	z.object({ loai: z.literal("okr-nhac-ten"), commentId: ma }).strict(),
	z.object({ loai: z.literal("okr-theo-doi"), objectiveId: ma }).strict(),
	z
		.object({
			loai: z.literal("ai-tran"),
			thang: thangMa,
			muc: z.union([z.literal(80), z.literal(100)]),
		})
		.strict(),
	z.object({ loai: z.literal("ai-doi-soat-lech"), thang: thangMa }).strict(),
]);

export type MucNhac = z.infer<typeof mucNhac>;

export const nhacPayload = z
	.object({
		muc: z.array(mucNhac),
		daGui: z.array(mucNhac).optional(),
		kenh: z.enum(["zalo", "slack"]).optional(),
		lechKenh: z.boolean().optional(),
	})
	.strict();

export type NhacPayload = z.infer<typeof nhacPayload>;

export function parseNhacPayload(value: unknown): NhacPayload {
	const ket = nhacPayload.safeParse(value);
	if (!ket.success) {
		throw new Error(`payload nhac-ke-hoach hong: ${ket.error.message}`);
	}
	return ket.data;
}
