import { KHOA_MUC_OKR, viecOkr } from "@crm/db/okr-nhac";
import { LOAI_NHAC } from "@crm/db/onboarding-nhac";
import { LOAI_NHAC_VIEC } from "@crm/db/viec";
import { z } from "zod";

export {
	KHOA_MUC_OKR,
	type MucOkr,
	type ViecOkr,
	viecOkr,
} from "@crm/db/okr-nhac";
export { LOAI_NHAC, type LoaiNhac } from "@crm/db/onboarding-nhac";

const ma = z.string().min(1);

const thangMa = z.string().regex(/^\d{4}-\d{2}$/);

const [
	capNhat,
	krIm,
	duocGiao,
	nhacTen,
	ghiNhan,
	theoDoi,
	choDuyet,
	traLai,
	hoiYGop,
	hoiYCongBo,
] = viecOkr.options;

export const mucNhac = z.union([
	z.object({ loai: z.enum(LOAI_NHAC_VIEC), viecId: ma }).strict(),
	z
		.object({ loai: z.enum(LOAI_NHAC), planId: ma, stepId: ma.optional() })
		.strict(),
	capNhat.pick(KHOA_MUC_OKR["okr-cap-nhat"]).strict(),
	krIm.pick(KHOA_MUC_OKR["okr-kr-im"]).strict(),
	duocGiao.pick(KHOA_MUC_OKR["okr-duoc-giao"]).strict(),
	nhacTen.pick(KHOA_MUC_OKR["okr-nhac-ten"]).strict(),
	ghiNhan.pick(KHOA_MUC_OKR["okr-ghi-nhan"]).strict(),
	theoDoi.pick(KHOA_MUC_OKR["okr-theo-doi"]).strict(),
	choDuyet.pick(KHOA_MUC_OKR["okr-cho-duyet"]).strict(),
	traLai.pick(KHOA_MUC_OKR["okr-tra-lai"]).strict(),
	hoiYGop.pick(KHOA_MUC_OKR["okr-hoi-y-gop"]).strict(),
	hoiYCongBo.pick(KHOA_MUC_OKR["okr-hoi-y-cong-bo"]).strict(),
	z
		.object({
			loai: z.literal("ai-tran"),
			thang: thangMa,
			muc: z.union([z.literal(80), z.literal(100)]),
		})
		.strict(),
	z
		.object({
			loai: z.literal("okr-tom-tat"),
			tomTatId: ma,
			departmentId: ma,
			cycleId: ma,
			soKrDangBan: z.number().int().nonnegative(),
		})
		.strict(),
	z.object({ loai: z.literal("ai-doi-soat-lech"), thang: thangMa }).strict(),
	z
		.object({
			loai: z.literal("tai-lieu-cho-duyet"),
			so: z.number().int().positive(),
		})
		.strict(),
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
