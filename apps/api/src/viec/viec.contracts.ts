import {
	LOAI_BAN_GHI,
	LOAI_VET_VIEC,
	NGUON_VIEC,
	NHOM_VIEC,
	TRANG_THAI_VIEC,
	VIEC,
	vetViec,
} from "@crm/db/viec";
import { z } from "zod";
import { ngayLich } from "../onboarding/onboarding.contracts";

const ma = z.string().trim().min(1).max(120);

const banGhiTruong = {
	companyId: ma.optional(),
	contactId: ma.optional(),
	dealId: ma.optional(),
	planId: ma.optional(),
};

type BanGhiTruong = {
	companyId?: string;
	contactId?: string;
	dealId?: string;
	planId?: string;
};

function soBanGhi(b: BanGhiTruong): number {
	return [b.companyId, b.contactId, b.dealId, b.planId].filter(Boolean).length;
}

export const viecIdInput = z.object({ id: ma });

export const viecCreateInput = z
	.object({
		tieuDe: z.string().trim().min(1).max(VIEC.tieuDeToiDa),
		moTa: z.string().trim().max(VIEC.moTaToiDa).nullable().optional(),
		hanNgay: ngayLich.nullable().optional(),
		nguoiThucHienId: ma.optional(),
		nguoiTheoDoiIds: z.array(ma).max(VIEC.theoDoiToiDa).default([]),
		...banGhiTruong,
	})
	.refine((v) => soBanGhi(v) <= 1, { message: VIEC.thongDiep.dungMotBanGhi });

export const viecBanGhiInput = z
	.object(banGhiTruong)
	.refine((v) => soBanGhi(v) === 1, { message: VIEC.thongDiep.dungMotBanGhi });

export const viecGanInput = z
	.object({ id: ma, ...banGhiTruong })
	.refine((v) => soBanGhi(v) === 1, { message: VIEC.thongDiep.dungMotBanGhi });

export const viecDoiTrangThaiInput = z.object({
	id: ma,
	den: z.enum(TRANG_THAI_VIEC),
});

export const viecSuaInput = z.object({
	id: ma,
	tieuDe: z.string().trim().min(1).max(VIEC.tieuDeToiDa).optional(),
	moTa: z.string().trim().max(VIEC.moTaToiDa).nullable().optional(),
	hanNgay: ngayLich.nullable().optional(),
});

export const viecDoiNguoiInput = z.object({ id: ma, nguoiThucHienId: ma });

export const viecTheoDoiInput = z.object({ id: ma, userId: ma.optional() });

export const viecCuaToiInput = z.object({
	nhom: z.enum(NHOM_VIEC).default("giao-cho-toi"),
});

const nguoiRa = z.object({
	id: z.string(),
	name: z.string(),
	image: z.string().nullable(),
});

const banGhiRa = z.object({
	loai: z.enum(LOAI_BAN_GHI),
	id: z.string(),
	ten: z.string(),
});

export const viecDong = z.object({
	id: z.string(),
	tieuDe: z.string(),
	trangThai: z.enum(TRANG_THAI_VIEC),
	hanNgay: z.string().nullable(),
	quaHan: z.boolean(),
	nguoiGiao: nguoiRa,
	nguoiThucHien: nguoiRa,
	banGhi: z.array(banGhiRa),
});

export const viecChiTietOutput = viecDong.extend({
	moTa: z.string().nullable(),
	nguoiTheoDoi: z.array(nguoiRa),
	coLichSu: z.boolean(),
	quyen: z.object({
		trangThai: z.array(z.enum(TRANG_THAI_VIEC)),
		sua: z.boolean(),
		doiNguoi: z.boolean(),
		gan: z.boolean(),
		theoDoiKhac: z.boolean(),
		dangTheoDoi: z.boolean(),
		xoa: z.boolean(),
	}),
});

export const viecCuaBanGhiOutput = z.object({
	mo: z.array(viecDong),
	daXong: z.array(viecDong),
	daHuy: z.array(viecDong),
});

export const viecCuaToiNhomOutput = viecCuaBanGhiOutput.extend({
	soXong: z.number().int(),
	soHuy: z.number().int(),
	demNhom: z.object({
		"giao-cho-toi": z.number().int(),
		"toi-giao": z.number().int(),
		"dang-theo-doi": z.number().int(),
	}),
});

export const viecVetOutput = z.array(
	z.object({
		id: z.string(),
		luc: z.string(),
		nguon: z.enum(NGUON_VIEC),
		loai: z.enum(LOAI_VET_VIEC),
		nguoi: z.object({ id: z.string(), name: z.string() }).nullable(),
		vet: vetViec,
	}),
);

export const viecTaoOutput = z.object({ id: z.string() });

export const viecBangInput = viecCuaToiInput;

const COT_BANG = ["CHUA_LAM", "DANG_LAM", "CHO_DANH_GIA", "XONG"] as const;

export const theBang = viecDong.extend({
	chuyenDuoc: z.array(z.enum(TRANG_THAI_VIEC)),
	con: z.object({ xong: z.number().int(), tong: z.number().int() }).nullable(),
	cha: z.object({ id: z.string(), tieuDe: z.string() }).nullable(),
	conMo: z.number().int(),
});

export const viecBangOutput = z.object({
	cot: z.array(
		z.object({
			trangThai: z.enum(COT_BANG),
			tong: z.number().int(),
			viec: z.array(theBang),
		}),
	),
	soHuy: z.number().int(),
	daHuy: z.array(viecDong),
});

export const viecKeoInput = z.object({
	id: ma,
	den: z.enum(TRANG_THAI_VIEC),
	thuTu: z.array(ma).max(VIEC.tranKhep * 4),
	nguon: z.enum(["bang-keo", "bang-menu"]),
});

export const viecOkOutput = z.object({ ok: z.literal(true) });

export type ViecCreateInput = z.infer<typeof viecCreateInput>;
export type ViecBanGhiInput = z.infer<typeof viecBanGhiInput>;
export type ViecGanInput = z.infer<typeof viecGanInput>;
export type ViecDoiTrangThaiInput = z.infer<typeof viecDoiTrangThaiInput>;
export type ViecSuaInput = z.infer<typeof viecSuaInput>;
export type ViecDoiNguoiInput = z.infer<typeof viecDoiNguoiInput>;
export type ViecTheoDoiInput = z.infer<typeof viecTheoDoiInput>;
export type ViecCuaToiInput = z.infer<typeof viecCuaToiInput>;
export type ViecDongOutput = z.infer<typeof viecDong>;
export type ViecChiTietOutput = z.infer<typeof viecChiTietOutput>;
export type ViecCuaBanGhiOutput = z.infer<typeof viecCuaBanGhiOutput>;
export type ViecCuaToiNhomOutput = z.infer<typeof viecCuaToiNhomOutput>;
export type ViecVetOutput = z.infer<typeof viecVetOutput>;
export type ViecBangInput = z.infer<typeof viecBangInput>;
export type ViecBangOutput = z.infer<typeof viecBangOutput>;
export type TheBangOutput = z.infer<typeof theBang>;
export type ViecKeoInput = z.infer<typeof viecKeoInput>;
