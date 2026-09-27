import {
	KHOA_MUC_OKR,
	type LoaiNhacOkr,
	type MucOkr,
	viecOkr,
} from "@crm/db/okr-nhac";
import { LOAI_NHAC } from "@crm/db/onboarding-nhac";
import { z } from "zod";

export {
	KHOA_MUC_OKR,
	type MucOkr,
	type ViecOkr,
	viecOkr,
} from "@crm/db/okr-nhac";
export { LOAI_NHAC, type LoaiNhac } from "@crm/db/onboarding-nhac";

const ma = z.string().min(1);

function nhanhOkr(loai: LoaiNhacOkr): z.ZodType<MucOkr> {
	const nhanh = viecOkr.options.find((o) => o.shape.loai.value === loai);
	if (!nhanh) throw new Error(`khuôn mục nhắc OKR thiếu loại ${loai}`);
	const chon: Record<string, true> = { loai: true };
	for (const khoa of KHOA_MUC_OKR[loai]) chon[khoa] = true;
	return (nhanh as z.ZodObject<z.ZodRawShape>)
		.pick(chon)
		.strict() as unknown as z.ZodType<MucOkr>;
}

export const mucNhac = z.union([
	z
		.object({ loai: z.enum(LOAI_NHAC), planId: ma, stepId: ma.optional() })
		.strict(),
	nhanhOkr("okr-cap-nhat"),
	nhanhOkr("okr-kr-im"),
	nhanhOkr("okr-duoc-giao"),
	nhanhOkr("okr-nhac-ten"),
	nhanhOkr("okr-theo-doi"),
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
