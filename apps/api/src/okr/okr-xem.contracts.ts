import { MUC_TU_TIN } from "@crm/validation/okr-cap-nhat";
import { MUC_HIEN_THI } from "@crm/validation/okr-hien-thi";
import { KIEU_KR } from "@crm/validation/okr-kr";
import {
	LOAI_MUC_TIEU,
	TRANG_THAI_MUC_TIEU,
} from "@crm/validation/okr-muc-tieu";
import { LOC_GOP_Y } from "@crm/validation/okr-tham-so";
import { z } from "zod";
import { donViChon, mucTieuOutput, type NutCanChinh } from "./okr.contracts";
import { OKR_XEM } from "./okr-xem.config";

const ma = z.string().trim().min(1).max(120);
const toiDa = OKR_XEM.loc.toiDaMoiMat;

export const locDanhSach = z.object({
	phuTrach: z.array(ma).max(toiDa),
	loai: z.array(z.enum(LOAI_MUC_TIEU)).max(toiDa),
	trangThai: z.array(z.enum(TRANG_THAI_MUC_TIEU)).max(toiDa),
	tuTin: z.array(z.enum(MUC_TU_TIN)).max(toiDa).default([]),
	gopY: z.array(z.enum(LOC_GOP_Y)).max(LOC_GOP_Y.length).default([]),
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
	daBo: z.array(dongDanhSach),
	total: z.number(),
	facetCounts: z.object({
		phuTrach: z.array(demGiaTri.extend({ name: z.string() })),
		loai: z.array(demGiaTri),
		trangThai: z.array(demGiaTri),
		tuTin: z.array(demGiaTri),
		gopY: z.array(z.object({ value: z.enum(LOC_GOP_Y), count: z.number() })),
	}),
	canEdit: z.boolean(),
	canCreate: z.boolean(),
});

export const cycleOnlyInput = z.object({ cycleId: ma });

export type NutCayDayDu = Omit<NutCanChinh, "children"> & {
	expected: number | null;
	children: NutCayDayDu[];
};

export const nutCayDayDu: z.ZodType<NutCayDayDu> = z.lazy(() =>
	z.object({
		id: z.string(),
		loai: z.enum(["muc-tieu", "kr"]),
		objectiveId: z.string(),
		unitName: z.string(),
		title: z.string(),
		progress: z.number(),
		status: z.enum(TRANG_THAI_MUC_TIEU),
		kind: z.enum(LOAI_MUC_TIEU),
		gop: z.number(),
		lapLai: z.boolean(),
		hienThi: z.enum(MUC_HIEN_THI),
		soNguoiXem: z.number(),
		expected: z.number().nullable(),
		children: z.array(nutCayDayDu),
	}),
);

export const cayCanChinhOutput = z.object({
	roots: z.array(nutCayDayDu),
	chuaCanChinh: z.array(nutCayDayDu),
});

const capHang = z.enum(["goc", "bo-phan", "phong-ban"]);

const tuTin = z.enum(MUC_TU_TIN);

export const lyDoHop = z.discriminatedUnion("loai", [
	z.object({
		loai: z.literal("tut"),
		tu: tuTin,
		den: tuTin,
		bac: z.number(),
	}),
	z.object({ loai: z.literal("im"), soNgay: z.number() }),
	z.object({ loai: z.literal("ghi-chu"), ngay: z.string() }),
]);

const soTuTin = z.object({
	cao: z.number(),
	vua: z.number(),
	thap: z.number(),
});

export const hangToanCanh = z.object({
	key: z.string(),
	ten: z.string(),
	cap: capHang,
	tienDo: z.number().nullable(),
	kyVong: z.number().nullable(),
	soMucTieu: z.number(),
	soKr: z.number(),
	tuTin: soTuTin,
	daCapNhat: z.number(),
	dangBan: z
		.object({ loai: z.enum(["tut", "im", "ghi-chu"]), soKr: z.number() })
		.nullable(),
	theoTuan: z.array(z.number().nullable()),
});

export const toanCanhOutput = z.object({
	tongQuan: z.object({
		tienDo: z.number().nullable(),
		kyVong: z.number().nullable(),
		donViCongBo: z.number(),
		tongDonVi: z.number(),
		donViChuaDat: z.array(z.string()),
		tongKr: z.number(),
		daCapNhat: z.number(),
		daCapNhatTruoc: z.number(),
		tuTinThap: z.number(),
		tuTinThapTruoc: z.number(),
	}),
	tuan: z.array(z.string()),
	tuanNay: z.string(),
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
	dungTuan: z.number(),
	krIm: z.number(),
});

export const sucKhoeOutput = z.object({
	tongQuan: z.object({
		tongKr: z.number(),
		chuaKhoiDiem: z.number(),
		chuaNoiKenh: z.number(),
		dungTuan: z.number(),
		krIm: z.number(),
	}),
	hang: z.array(hangSucKhoe),
});

export const hopTuanInput = z.object({ cycleId: ma, unit: donViChon });

const dongKr = z.object({
	keyResultId: z.string(),
	objectiveId: z.string(),
	tieuDe: z.string(),
	mucTieu: z.string(),
	chuTen: z.string(),
	progress: z.number(),
	expected: z.number().nullable(),
	laMoc: z.boolean(),
	tuTin: tuTin.nullable(),
});

export const dongHop = dongKr.extend({
	ghiChu: z.string().nullable(),
	lyDo: z.array(lyDoHop),
});

export const hopTuanOutput = z.object({
	tuan: z.string(),
	tuanDau: z.boolean(),
	daCapNhat: z.number(),
	tongKr: z.number(),
	dangBan: z.array(dongHop),
	conLai: z.array(dongHop),
});

export const moHopTuanOutput = z.object({ ghi: z.boolean() });

export const dienBienInput = z.object({ keyResultId: ma });

export const dienBienOutput = z.object({
	kieu: z.enum(KIEU_KR),
	tieuDe: z.string(),
	khoi: z.number(),
	dich: z.number(),
	donVi: z.string(),
	coCapNhat: z.boolean(),
	tuanDau: z.string().nullable(),
	diem: z.array(
		z.object({
			tuan: z.string(),
			giaTri: z.number().nullable(),
			kyVong: z.number().nullable(),
			tuTin: tuTin.nullable(),
			ghiChu: z.string().nullable(),
		}),
	),
});

export const khoiCuaToiInput = z.object({
	cycleId: ma,
	userId: ma.nullable(),
});

export const dongCuaToi = dongKr.extend({
	nhip: z.enum([
		"dung-nhip",
		"cham-nhip",
		"truot",
		"chua-co-ky-vong",
		"moc-xong",
		"moc-chua",
	]),
});

export const khoiCuaToiOutput = z.object({
	kr: z.array(dongCuaToi),
	tong: z.number(),
});

export type CayCanChinhOutput = z.infer<typeof cayCanChinhOutput>;
export type LocDanhSach = z.infer<typeof locDanhSach>;
export type DanhSachInput = z.infer<typeof danhSachInput>;
export type DanhSachOutput = z.infer<typeof danhSachOutput>;
export type HangToanCanh = z.infer<typeof hangToanCanh>;
export type ToanCanhOutput = z.infer<typeof toanCanhOutput>;
export type HangSucKhoe = z.infer<typeof hangSucKhoe>;
export type SucKhoeOutput = z.infer<typeof sucKhoeOutput>;
export type LyDoHopOutput = z.infer<typeof lyDoHop>;
export type HopTuanInput = z.infer<typeof hopTuanInput>;
export type HopTuanOutput = z.infer<typeof hopTuanOutput>;
export type DongHop = z.infer<typeof dongHop>;
export type DienBienOutput = z.infer<typeof dienBienOutput>;
export type KhoiCuaToiInput = z.infer<typeof khoiCuaToiInput>;
export type KhoiCuaToiOutput = z.infer<typeof khoiCuaToiOutput>;
export type DongCuaToi = z.infer<typeof dongCuaToi>;
