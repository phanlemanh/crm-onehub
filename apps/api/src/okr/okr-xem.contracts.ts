import {
	LOAI_MUC_TIEU,
	TRANG_THAI_MUC_TIEU,
} from "@crm/validation/okr-muc-tieu";
import { z } from "zod";
import { donViChon, mucTieuOutput } from "./okr.contracts";
import { OKR_XEM } from "./okr-xem.config";

const ma = z.string().trim().min(1).max(120);
const toiDa = OKR_XEM.loc.toiDaMoiMat;

export const locDanhSach = z.object({
	phuTrach: z.array(ma).max(toiDa),
	loai: z.array(z.enum(LOAI_MUC_TIEU)).max(toiDa),
	trangThai: z.array(z.enum(TRANG_THAI_MUC_TIEU)).max(toiDa),
});

export const danhSachInput = z.object({
	cycleId: ma,
	unit: donViChon,
	loc: locDanhSach,
});

const demGiaTri = z.object({ value: z.string(), count: z.number() });

export const dongDanhSach = mucTieuOutput.extend({
	krKhop: z.array(z.string()),
});

export const danhSachOutput = z.object({
	rows: z.array(dongDanhSach),
	total: z.number(),
	facetCounts: z.object({
		phuTrach: z.array(demGiaTri.extend({ name: z.string() })),
		loai: z.array(demGiaTri),
		trangThai: z.array(demGiaTri),
	}),
});

export const cycleOnlyInput = z.object({ cycleId: ma });

const capHang = z.enum(["goc", "bo-phan", "phong-ban"]);

export const hangToanCanh = z.object({
	key: z.string(),
	ten: z.string(),
	cap: capHang,
	tienDo: z.number().nullable(),
	kyVong: z.number().nullable(),
	soMucTieu: z.number(),
	soKr: z.number(),
});

export const toanCanhOutput = z.object({
	tongQuan: z.object({
		tienDo: z.number().nullable(),
		kyVong: z.number().nullable(),
		donViCongBo: z.number(),
		tongDonVi: z.number(),
		donViChuaDat: z.array(z.string()),
	}),
	hang: z.array(hangToanCanh),
});

export const hangSucKhoe = z.object({
	key: z.string(),
	ten: z.string(),
	cap: capHang,
	truong: z.object({ id: z.string(), name: z.string() }).nullable(),
	tongKr: z.number(),
	chuaKhoiDiem: z.number(),
	chuaNoiKenh: z.number(),
});

export const sucKhoeOutput = z.object({
	tongQuan: z.object({
		tongKr: z.number(),
		chuaKhoiDiem: z.number(),
		chuaNoiKenh: z.number(),
	}),
	hang: z.array(hangSucKhoe),
});

export type LocDanhSach = z.infer<typeof locDanhSach>;
export type DanhSachInput = z.infer<typeof danhSachInput>;
export type DanhSachOutput = z.infer<typeof danhSachOutput>;
export type HangToanCanh = z.infer<typeof hangToanCanh>;
export type ToanCanhOutput = z.infer<typeof toanCanhOutput>;
export type HangSucKhoe = z.infer<typeof hangSucKhoe>;
export type SucKhoeOutput = z.infer<typeof sucKhoeOutput>;
