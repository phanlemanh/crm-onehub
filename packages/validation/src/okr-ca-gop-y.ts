import { z } from "zod";
import { KIEU_KR, soKr } from "./okr-kr";
import { CAP_MUC_TIEU, LOAI_MUC_TIEU } from "./okr-muc-tieu";
import { MA_VAN_DE } from "./okr-tro-ly";

export const BO_CA_GOP_Y = ["viet-lai", "ng"] as const;
export const NGON_NGU_CA = ["vi", "tron-anh-viet"] as const;
export const TRUONG_VIET_LAI_CA = ["title", "whyNow", "kr.title"] as const;
export const DIEU_CAM_CA = ["chep-kr-cap-tren", "noi-ve-nguoi"] as const;

const krCa = z.strictObject({
	title: z.string().trim().min(1).max(200),
	kind: z.enum(KIEU_KR),
	startValue: soKr,
	targetValue: soKr,
	unit: z.string().trim().max(24),
});

const mucTieuCa = z.strictObject({
	title: z.string().trim().min(1).max(200),
	whyNow: z.string().trim().max(500),
	kind: z.enum(LOAI_MUC_TIEU),
});

export const caGopY = z.strictObject({
	id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
	bo: z.enum(BO_CA_GOP_Y),
	ngonNgu: z.enum(NGON_NGU_CA),
	donVi: z.strictObject({
		cap: z.enum(CAP_MUC_TIEU),
		ten: z.string().trim().min(1).max(120),
	}),
	mucTieu: mucTieuCa,
	krs: z.array(krCa).max(5),
	capTren: z
		.strictObject({ mucTieu: mucTieuCa, krs: z.array(krCa).min(1).max(5) })
		.optional(),
	kyVong: z.strictObject({
		vanDe: z.array(z.enum(MA_VAN_DE)),
		vietLai: z.array(z.enum(TRUONG_VIET_LAI_CA)),
		khongGopY: z.boolean(),
		khongDuoc: z.array(z.enum(DIEU_CAM_CA)),
		soSai: z.boolean().default(false),
	}),
	ghiChu: z.string().trim().max(500),
});

export type CaGopY = z.infer<typeof caGopY>;

export function parseCaGopY(value: unknown, tep: string): CaGopY {
	const r = caGopY
		.superRefine((ca, ctx) => {
			if (
				ca.kyVong.khongGopY &&
				(ca.kyVong.vanDe.length > 0 || ca.kyVong.vietLai.length > 0)
			)
				ctx.addIssue({
					code: "custom",
					path: ["kyVong"],
					message: "ca không góp ý thì không có vấn đề hay trường viết lại",
				});
			if (ca.bo === "ng" && !ca.capTren)
				ctx.addIssue({
					code: "custom",
					path: ["capTren"],
					message: "ca NG cần mục tiêu cấp trên",
				});
		})
		.safeParse(value);
	if (r.success) return r.data;
	const dong = r.error.issues.map(
		(i) => `${i.path.map(String).join(".")}: ${i.message}`,
	);
	throw new Error(`Ca góp ý ${tep} sai khuôn — ${dong.join("; ")}`);
}
