import { z } from "zod";

export const LY_DO_CAN_CHINH = { lyDoToiDa: 500, canCuToiDa: 500 } as const;

export const MA_CAN_CU_CAN_LY_DO = "can-cu-can-ly-do";

export const MUC_TIN_CAN_CHINH = [
	"chua-co-ly-do",
	"dat-cuoc",
	"co-so-lieu",
] as const;

export type MucTinCanChinh = (typeof MUC_TIN_CAN_CHINH)[number];

const coChu = (s: string | null | undefined): s is string =>
	s != null && s.trim() !== "";

export function mucTinCanChinh(
	lyDo: string | null,
	canCu: string | null,
): MucTinCanChinh {
	if (!coChu(lyDo)) return "chua-co-ly-do";
	return coChu(canCu) ? "co-so-lieu" : "dat-cuoc";
}

const oChu = (toiDa: number) =>
	z
		.string()
		.nullish()
		.transform((s) => (coChu(s) ? s.trim() : null))
		.pipe(z.string().max(toiDa).nullable());

export const lyDoCanChinhNhap = z
	.object({
		lyDo: oChu(LY_DO_CAN_CHINH.lyDoToiDa),
		canCu: oChu(LY_DO_CAN_CHINH.canCuToiDa),
	})
	.superRefine((d, ctx) => {
		if (d.canCu !== null && d.lyDo === null)
			ctx.addIssue({
				code: "custom",
				path: ["canCu"],
				message: MA_CAN_CU_CAN_LY_DO,
			});
	});

export type LyDoCanChinhNhap = z.infer<typeof lyDoCanChinhNhap>;
