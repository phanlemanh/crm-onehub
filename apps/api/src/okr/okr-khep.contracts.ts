import { THANG_CHAM } from "@crm/validation/okr-chuong-trinh";
import { CACH_DOC } from "@crm/validation/okr-khep";
import { KIEU_KR } from "@crm/validation/okr-kr";
import { LOAI_MUC_TIEU } from "@crm/validation/okr-muc-tieu";
import { z } from "zod";
import { donViChon } from "./okr.contracts";

const ma = z.string().trim().min(1).max(120);

export const bangChamInput = z.object({
	cycleId: ma,
	donVi: donViChon.optional(),
});

const lienKetMangSang = z
	.object({ objectiveId: z.string(), cycleName: z.string() })
	.nullable();

export const krCham = z.object({
	id: z.string(),
	title: z.string(),
	kind: z.enum(KIEU_KR),
	ownerName: z.string(),
	unit: z.string(),
	startValue: z.number(),
	targetValue: z.number(),
	soChot: z.number(),
	diemGoiY: z.number(),
	diem: z.number().nullable(),
	lyDo: z.string().nullable(),
	suaDuoc: z.boolean(),
	doiDichNgoaiRa: z.array(
		z.object({
			luc: z.string(),
			truoc: z.number(),
			sau: z.number(),
			lyDo: z.string(),
		}),
	),
});

export const mucTieuCham = z.object({
	id: z.string(),
	title: z.string(),
	kind: z.enum(LOAI_MUC_TIEU),
	ownerName: z.string(),
	suaDuoc: z.boolean(),
	diem: z.number().nullable(),
	cachDoc: z.enum(CACH_DOC).nullable(),
	dieuHocDuoc: z.string(),
	mangSangToi: lienKetMangSang,
	mangSangTu: lienKetMangSang,
	krs: z.array(krCham),
});

export const bangChamOutput = z.object({
	thang: z.enum(THANG_CHAM).nullable(),
	conLai: z.number(),
	chuaCham: z.array(
		z.object({ khoa: z.string(), ten: z.string(), conLai: z.number() }),
	),
	mucTieu: z.array(mucTieuCham),
});

export type BangChamInput = z.infer<typeof bangChamInput>;
export type BangChamOutput = z.infer<typeof bangChamOutput>;
export type KrCham = z.infer<typeof krCham>;
export type MucTieuCham = z.infer<typeof mucTieuCham>;
