import { THANG_CHAM } from "@crm/validation/okr-chuong-trinh";
import { CACH_DOC } from "@crm/validation/okr-khep";
import { KIEU_KR, LOI_SO_THEO_KIEU } from "@crm/validation/okr-kr";
import { LOAI_MUC_TIEU } from "@crm/validation/okr-muc-tieu";
import { z } from "zod";
import { donViChon, lienKetMangSang } from "./okr.contracts";

const ma = z.string().trim().min(1).max(120);

export const bangChamInput = z.object({
	cycleId: ma,
	donVi: donViChon.optional(),
});

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
	hocTapChuaGhi: z.array(z.object({ id: z.string(), ten: z.string() })),
	mucTieu: z.array(mucTieuCham),
});

export const mangSangOutput = z.object({
	id: z.string(),
	cycleId: z.string(),
	chep: z.array(z.string()),
	khongChep: z.array(
		z.object({ keyResultId: z.string(), lyDo: z.enum(LOI_SO_THEO_KIEU) }),
	),
	boThamGia: z.array(z.string()),
	doiPhuTrachKr: z.array(z.string()),
	canhBao: z.string().nullable(),
});

export const COT_XUAT = [
	"Chu kỳ",
	"Cấp",
	"Đơn vị",
	"Mục tiêu",
	"Loại",
	"Trạng thái",
	"Người phụ trách mục tiêu",
	"KR",
	"Kiểu",
	"Đơn vị đo",
	"Người phụ trách KR",
	"Khởi điểm",
	"Đích",
	"Số chốt",
	"Điểm gợi ý",
	"Điểm",
	"Lý do chỉnh",
	"Số lần đổi đích ngoài rà",
	"Điểm mục tiêu",
	"Điều học được",
	"Mang sang tới",
] as const;

export const xuatKyOutput = z.object({
	tenTep: z.string(),
	noiDung: z.string(),
});

export type BangChamInput = z.infer<typeof bangChamInput>;
export type BangChamOutput = z.infer<typeof bangChamOutput>;
export type KrCham = z.infer<typeof krCham>;
export type MucTieuCham = z.infer<typeof mucTieuCham>;
export type MangSangOutput = z.infer<typeof mangSangOutput>;
export type XuatKyOutput = z.infer<typeof xuatKyOutput>;
