import {
	chuanNfc,
	DANG_CHO,
	LOAI_TRANG,
	TAI_LIEU,
	TRANG_THAI_DE_XUAT,
} from "@crm/validation/tai-lieu";
import { danhSachTrichDoan } from "@crm/validation/tai-lieu-trich-doan";
import { z } from "zod";
import { TAI_LIEU_API } from "./tai-lieu-config";
import { dongBaoSai, dongChuaTraLoi } from "./tai-lieu-hoi.contracts";

const V = TAI_LIEU_API.vao;
const T = TAI_LIEU_API.thongDiep;

const ma = z.string().trim().min(1).max(V.ma);
const tenVao = z.string().max(V.tenToiDa);
const noiDungVao = z.string().max(V.noiDungToiDa);

export const lyDoVao = z
	.string()
	.max(V.lyDoToiDa)
	.transform((s) => chuanNfc(s).trim())
	.pipe(
		z
			.string()
			.min(TAI_LIEU.lyDo.min, T.lyDoTrong)
			.max(TAI_LIEU.lyDo.max, T.lyDoDai(TAI_LIEU.lyDo.max)),
	);

export const taiLieuListInput = z.object({
	loai: z.enum(LOAI_TRANG).optional(),
	donViId: ma.optional(),
	chuTrangId: ma.optional(),
	page: z.number().int().min(1).default(1),
});
export const taiLieuSlugInput = z.object({ slug: ma });
export const NHOM_DE_XUAT = ["tat-ca", "cho", "da-xu-ly"] as const;
export const taiLieuProposalsInput = z
	.object({
		nhom: z.enum(NHOM_DE_XUAT).default("tat-ca"),
		page: z.number().int().min(1).default(1),
		slug: ma.optional(),
	})
	.optional();
export const taiLieuIdInput = z.object({ id: ma });
export const taiLieuCreateInput = z.object({
	ten: tenVao,
	loai: z.enum(LOAI_TRANG),
	departmentId: ma.nullable().optional(),
	chuTrangId: ma.optional(),
	noiDung: noiDungVao,
});
export const taiLieuProposeInput = z.object({
	slug: ma,
	ten: tenVao.optional(),
	noiDung: noiDungVao,
	tuDeXuatId: ma.optional(),
});
export const taiLieuApproveInput = z.object({
	id: ma,
	diffHash: z.string().regex(/^[0-9a-f]{64}$/),
	daDoiChieu: z.number().int().nonnegative().optional(),
});
export const taiLieuRejectInput = z.object({ id: ma, lyDo: lyDoVao });

const nguoi = z.object({ id: z.string(), name: z.string() });
const donVi = z.object({ id: z.string(), name: z.string() }).nullable();
const loaiTrang = z.enum(LOAI_TRANG);
const nguonNgan = z.object({ id: z.string(), tenTep: z.string() });

export const taiLieuListOutput = z.object({
	rows: z.array(
		z.object({
			slug: z.string(),
			ten: z.string(),
			loai: loaiTrang,
			chuTrang: nguoi,
			donVi,
			capNhat: z.string(),
			coBanCho: z.boolean(),
		}),
	),
	total: z.number().int(),
	facetCounts: z.record(loaiTrang, z.number().int()),
});

export const taiLieuDangDungOutput = z.object({
	rows: z.array(z.object({ slug: z.string(), ten: z.string() })),
});

export const taiLieuGetOutput = z.object({
	slug: z.string(),
	ten: z.string(),
	loai: loaiTrang,
	chuTrang: nguoi,
	donVi,
	phienBan: z.object({ so: z.number().int(), duyetLuc: z.string() }).nullable(),
	noiDung: z.string().nullable(),
	coBanCho: z.boolean(),
	choLanDau: z
		.object({
			chuTrang: nguoi,
			dangCho: z.enum(DANG_CHO),
			nguon: z
				.object({
					id: z.string(),
					tenTep: z.string(),
					lyDo: z.string().nullable(),
				})
				.nullable(),
		})
		.nullable(),
	suaDuoc: z.literal(true),
	nguon: nguonNgan.nullable(),
	xacMinhDen: z.string().nullable(),
	quaHanXacMinh: z.boolean(),
	coQuyenXacMinh: z.boolean(),
});

export const taiLieuCreateOutput = z.object({ slug: z.string() });
export const taiLieuProposeOutput = z.object({ deXuatId: z.string() });

const trangThai = z.enum(TRANG_THAI_DE_XUAT);

export const taiLieuProposalsOutput = z.object({
	rows: z.array(
		z.object({
			id: z.string(),
			slug: z.string(),
			ten: z.string(),
			taoBoi: nguoi,
			luc: z.string(),
			trangThai,
			cu: z.boolean(),
		}),
	),
	total: z.number().int(),
	choToiDuyet: z.number().int(),
});

const kiemChienLuoc = z.object({
	soKyTu: z.number().int(),
	tranKyTu: z.number().int(),
	canhBaoTuCam: z.array(z.string()),
});

export const taiLieuProposalOutput = z.object({
	id: z.string(),
	slug: z.string(),
	ten: z.string(),
	trangThai,
	lyDo: z.string().nullable(),
	taoBoi: nguoi,
	taoLuc: z.string(),
	banGoc: z.string(),
	noiDung: z.string(),
	diffHash: z.string(),
	cu: z.boolean(),
	duyetDuoc: z.boolean(),
	nguon: nguonNgan.nullable(),
	trichDoan: danhSachTrichDoan,
	chuNguon: z.string().nullable(),
	soMoi: z.array(z.string()),
	chienLuoc: kiemChienLuoc.nullable(),
});

export const taiLieuApproveOutput = z.object({
	slug: z.string(),
	so: z.number().int(),
	canhBaoTuCam: z.array(z.string()),
});
export const taiLieuOkOutput = z.object({ ok: z.literal(true) });

export const taiLieuTimInput = z.object({
	q: z.string().max(TAI_LIEU.tim.toiDa * 3),
});
const doanTrich = z.object({
	truoc: z.string(),
	khop: z.string(),
	sau: z.string(),
});
export const taiLieuTimOutput = z.object({
	rows: z.array(
		z.object({
			slug: z.string(),
			ten: z.string(),
			loai: loaiTrang,
			chuTrang: nguoi,
			phienBan: z.number().int(),
			doanTrich,
		}),
	),
});
export const taiLieuNhacToiOutput = z.object({
	rows: z.array(
		z.object({
			slug: z.string(),
			ten: z.string(),
			cau: z.string(),
			vanBan: z.string(),
			soLan: z.number().int(),
		}),
	),
});

const muaLoc = z.object({
	id: z.string(),
	ten: z.string(),
	so: z.number().int(),
});
export const taiLieuBoLocOutput = z.object({
	donVi: z.array(muaLoc),
	chuTrang: z.array(muaLoc),
});

const dongSucKhoe = z.object({
	slug: z.string(),
	ten: z.string(),
	chuTrang: nguoi,
});
const khoiSucKhoe = <T extends z.ZodTypeAny>(dong: T) =>
	z.object({ rows: z.array(dong), total: z.number().int() });
export const taiLieuSucKhoeOutput = z.object({
	quaHan: khoiSucKhoe(dongSucKhoe.extend({ xacMinhDen: z.string() })),
	choDuyet: khoiSucKhoe(dongSucKhoe.extend({ soBan: z.number().int() })),
	gay: khoiSucKhoe(
		dongSucKhoe.extend({
			lienKet: z.array(z.object({ denSlug: z.string(), vanBan: z.string() })),
		}),
	),
	chuaCo: khoiSucKhoe(
		z.object({
			denSlug: z.string(),
			vanBan: z.string(),
			soTrang: z.number().int(),
		}),
	),
	moCoi: khoiSucKhoe(dongSucKhoe.extend({ duyetLuc: z.string() })),
	chuaTraLoi: khoiSucKhoe(dongChuaTraLoi),
	baoSai: khoiSucKhoe(dongBaoSai),
});

export type TaiLieuListInput = z.infer<typeof taiLieuListInput>;
export type TaiLieuProposalsInput = z.infer<typeof taiLieuProposalsInput>;
export type TaiLieuCreateInput = z.infer<typeof taiLieuCreateInput>;
export type TaiLieuProposeInput = z.infer<typeof taiLieuProposeInput>;
export type TaiLieuApproveInput = z.infer<typeof taiLieuApproveInput>;
export type TaiLieuRejectInput = z.infer<typeof taiLieuRejectInput>;
export type TaiLieuListOutput = z.infer<typeof taiLieuListOutput>;
export type TaiLieuDangDungOutput = z.infer<typeof taiLieuDangDungOutput>;
export type TaiLieuGetOutput = z.infer<typeof taiLieuGetOutput>;
export type TaiLieuProposalsOutput = z.infer<typeof taiLieuProposalsOutput>;
export type TaiLieuProposalOutput = z.infer<typeof taiLieuProposalOutput>;
export type TaiLieuTimOutput = z.infer<typeof taiLieuTimOutput>;
export type TaiLieuNhacToiOutput = z.infer<typeof taiLieuNhacToiOutput>;
export type TaiLieuBoLocOutput = z.infer<typeof taiLieuBoLocOutput>;
export type TaiLieuSucKhoeOutput = z.infer<typeof taiLieuSucKhoeOutput>;
