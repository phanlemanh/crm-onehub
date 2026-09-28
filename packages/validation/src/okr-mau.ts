import { z } from "zod";
import { kiemSoTheoKieu, kieuKr, krInput, soKr } from "./okr-kr";
import {
	type CapMucTieu,
	donViMucTieu,
	LOAI_MUC_TIEU,
	mucTieuInput,
} from "./okr-muc-tieu";

function doDai(chu: z.ZodString): { min: number; max: number } {
	const { minLength: min, maxLength: max } = chu;
	if (min === null || max === null)
		throw new Error(
			"Khuôn tiêu đề OKR phải khai cả độ dài tối thiểu và tối đa.",
		);
	return { min, max };
}

const tieuDeKr = krInput.shape.title;
const cauMucTieu = mucTieuInput.shape.title;

export const OKR_MAU = {
	krToiDa: 10,
	ten: { min: 3, max: 120 },
	tenKr: doDai(tieuDeKr),
	cauMucTieu: doDai(cauMucTieu),
} as const;

const ma = z.string().trim().min(1).max(120);

export const mauKr = z
	.object({
		title: tieuDeKr,
		kind: kieuKr,
		unit: z.string().trim().max(24),
		startValue: soKr.nullable(),
		targetValue: soKr.nullable(),
	})
	.superRefine((v, ctx) => {
		if (v.startValue === null || v.targetValue === null) return;
		const loi = kiemSoTheoKieu(v.kind, v.startValue, v.targetValue);
		if (loi)
			ctx.addIssue({ code: "custom", message: loi, path: ["targetValue"] });
	});
export type MauKr = z.infer<typeof mauKr>;

export const mauNoiDung = z.object({
	cauMucTieu,
	loai: z.enum(LOAI_MUC_TIEU),
	krs: z.array(mauKr).min(1).max(OKR_MAU.krToiDa),
});
export type MauNoiDung = z.infer<typeof mauNoiDung>;

export function parseMauNoiDung(value: unknown): MauNoiDung {
	const r = mauNoiDung.safeParse(value);
	if (!r.success) {
		const duongDan = r.error.issues.map((i) => i.path.join(".")).join(", ");
		throw new Error(`Nội dung mẫu OKR không đọc được: ${duongDan}`);
	}
	return r.data;
}

export const CAP_MAU = [
	"bo-phan",
	"phong-ban",
	"ca-nhan",
] as const satisfies readonly CapMucTieu[];
export type CapMau = (typeof CAP_MAU)[number];

export const luuMauInput = z.object({
	id: ma.nullable(),
	ten: z.string().trim().min(OKR_MAU.ten.min).max(OKR_MAU.ten.max),
	cap: z.enum(CAP_MAU),
	donViIds: z.array(ma),
	noiDung: mauNoiDung,
});
export type LuuMauInput = z.infer<typeof luuMauInput>;

export const taoTuMauInput = z.object({
	mauId: ma,
	cycleId: ma,
	unit: donViMucTieu,
	ownerUserId: ma,
	krs: z.array(
		z.object({
			startValue: soKr.nullable(),
			targetValue: soKr.nullable(),
			ownerUserId: ma,
		}),
	),
});
export type TaoTuMauInput = z.infer<typeof taoTuMauInput>;
