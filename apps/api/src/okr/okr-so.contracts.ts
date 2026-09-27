import { GHI_CHU_TOI_DA } from "@crm/validation/okr-cap-nhat";
import {
	BAC_GHI_DANH,
	bacGhiDanh,
	bacKhopChiSo,
	CAU_BAC_GHI_DANH,
	dinhNghiaChiSo,
	MA_CHI_SO,
	maChiSo,
	phamViChiSo,
} from "@crm/validation/okr-chi-so";
import { NGUON_KR, soKr } from "@crm/validation/okr-kr";
import {
	type DatNguonKrInput,
	datNguonKrInput,
} from "@crm/validation/okr-nguon";
import { z } from "zod";

const ma = z.string().trim().min(1).max(120);
const ngay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const chiSoOutput = z.object({
	chiSo: z.array(z.enum(MA_CHI_SO)),
	bac: z.array(z.enum(BAC_GHI_DANH)),
	sheetsBat: z.boolean(),
	emailSheets: z.string().nullable(),
});

export const xemTruocChiSoInput = z
	.strictObject({
		chiSo: maChiSo,
		phamVi: phamViChiSo,
		bac: bacGhiDanh.optional(),
		cycleId: ma,
	})
	.refine(bacKhopChiSo, { message: CAU_BAC_GHI_DANH, path: ["bac"] });
export type XemTruocChiSoInput = z.infer<typeof xemTruocChiSoInput>;

export const xemTruocChiSoOutput = z.object({
	giaTri: z.number(),
	tu: ngay,
	den: ngay,
});

export const datNguonKrVao = z
	.strictObject({
		keyResultId: ma,
		loai: z.enum(NGUON_KR),
		chiSo: maChiSo.optional(),
		phamVi: phamViChiSo.optional(),
		bac: bacGhiDanh.optional(),
		url: z.string().optional(),
		o: z.string().optional(),
	})
	.transform((vao, ctx): DatNguonKrInput => {
		const r = datNguonKrInput.safeParse(vao);
		if (r.success) return r.data;
		for (const loi of r.error.issues) ctx.addIssue({ ...loi });
		return z.NEVER;
	});

export const datNguonKrOutput = z.object({
	id: z.string(),
	doCanh: z.boolean(),
});

export const lichSuSoInput = z.object({ keyResultId: ma });
export const lichSuSoOutput = z.object({
	dong: z.array(
		z.object({
			ngay,
			giaTri: z.number(),
			nguon: z.enum(NGUON_KR),
			tacGia: z.string().nullable(),
		}),
	),
});

export const banGhiChiSoInput = z.object({
	keyResultId: ma,
	ngay: ngay.optional(),
	trang: z.number().int().min(1),
});
export type BanGhiChiSoInput = z.infer<typeof banGhiChiSoInput>;

const banGhiDong = z.object({
	loai: z.enum(["deal", "contact", "plan", "email"]),
	id: z.string(),
	ten: z.string(),
	ngay: z.string(),
	moRef: z
		.object({ kind: z.enum(["deal", "contact", "plan"]), id: z.string() })
		.nullable(),
});

export const banGhiChiSoOutput = z.object({
	tenKr: z.string(),
	loai: z.enum(NGUON_KR),
	dinhNghia: dinhNghiaChiSo.nullable(),
	tu: ngay.nullable(),
	den: ngay.nullable(),
	ngay: ngay.nullable(),
	soDaChup: z.number().nullable(),
	soTinhLai: z.number().nullable(),
	lech: z.boolean(),
	tong: z.number(),
	dong: z.array(banGhiDong),
	lanGhi: z.array(
		z.object({ ngay, giaTri: z.number(), nguoi: z.string().nullable() }),
	),
});
export type BanGhiChiSoOutput = z.infer<typeof banGhiChiSoOutput>;

export const ghiSoKrInput = z.strictObject({
	id: ma,
	giaTri: soKr,
	ghiChu: z.string().trim().max(GHI_CHU_TOI_DA).optional(),
});
export type GhiSoKrInput = z.infer<typeof ghiSoKrInput>;

export const ghiSoKrOutput = z.object({ id: z.string(), ngay });
