import {
	BAC_GHI_DANH,
	type BacGhiDanh,
	CHI_SO_OKR,
	type DinhNghiaDem,
	type KieuPhamVi,
	MA_CHI_SO,
	type MaChiSo,
	PHAM_VI_CHI_SO,
	type PhamViDem,
} from "@crm/db/okr-chi-so-danh-muc";
import { z } from "zod";

export {
	BAC_GHI_DANH,
	type BacGhiDanh,
	CHI_SO_OKR,
	type KieuPhamVi,
	MA_CHI_SO,
	type MaChiSo,
	PHAM_VI_CHI_SO,
};

export const CAU_BAC_GHI_DANH = "Chọn bậc cho chỉ số ghi danh";
const CAU_PHAM_VI = "Phạm vi không hợp lệ";

export const maChiSo = z.enum(MA_CHI_SO, {
	error: "Chỉ số không có trong danh mục",
});
export const bacGhiDanh = z.enum(BAC_GHI_DANH, { error: "Bậc không hợp lệ" });

const maDonVi = z
	.string({ error: CAU_PHAM_VI })
	.trim()
	.min(1, { error: CAU_PHAM_VI })
	.max(120, { error: CAU_PHAM_VI });

export const phamViChiSo = z.discriminatedUnion(
	"kieu",
	[
		z.strictObject({ kieu: z.literal("toan-cong-ty") }, { error: CAU_PHAM_VI }),
		z.strictObject(
			{ kieu: z.literal("bo-phan"), id: maDonVi },
			{ error: CAU_PHAM_VI },
		),
		z.strictObject(
			{ kieu: z.literal("phong-ban"), id: maDonVi },
			{ error: CAU_PHAM_VI },
		),
		z.strictObject(
			{ kieu: z.literal("nguoi"), id: maDonVi },
			{ error: CAU_PHAM_VI },
		),
	],
	{ error: CAU_PHAM_VI },
) satisfies z.ZodType<PhamViDem>;
export type PhamViChiSo = z.infer<typeof phamViChiSo>;

export function bacKhopChiSo(v: {
	chiSo: MaChiSo;
	bac?: BacGhiDanh | undefined;
}): boolean {
	return (v.chiSo === "ghi-danh-dat-bac") === (v.bac !== undefined);
}

export const dinhNghiaChiSo = z
	.strictObject(
		{ chiSo: maChiSo, phamVi: phamViChiSo, bac: bacGhiDanh.optional() },
		{
			error: (iss) =>
				iss.code === "unrecognized_keys" ? "Trường không được phép" : undefined,
		},
	)
	.refine(bacKhopChiSo, {
		message: CAU_BAC_GHI_DANH,
		path: ["bac"],
	}) satisfies z.ZodType<DinhNghiaDem>;
export type DinhNghiaChiSo = z.infer<typeof dinhNghiaChiSo>;
