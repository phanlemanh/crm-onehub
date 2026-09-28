import {
	dichNguon,
	KIEU_NGUON,
	NGUON,
	TRANG_THAI_NGUON,
} from "@crm/validation/tai-lieu-nguon";
import { z } from "zod";
import { TAI_LIEU_API } from "./tai-lieu-config";

const ma = z.string().min(1).max(TAI_LIEU_API.vao.ma);

export const taiLieuNguonXinChoInput = z.object({
	tenTep: z.string().min(1).max(NGUON.tenTepToiDa),
	kichThuoc: z.number().int().nonnegative(),
	kieu: z.enum(KIEU_NGUON),
});
export const taiLieuNguonXinChoOutput = z.object({
	pathname: z.string(),
	url: z.string(),
	hetHan: z.number(),
	phieu: z.string(),
});

export const taiLieuNguonNhanInput = z.object({
	pathname: z.string().regex(NGUON.pathname),
	tenTep: z.string().min(1).max(NGUON.tenTepToiDa),
	dich: dichNguon,
	phieu: z.string().min(1).max(TAI_LIEU_API.vao.ma),
});
export const taiLieuNguonNhanOutput = z.object({
	nguonId: z.string(),
	trung: z.boolean(),
});

export const taiLieuNguonIdInput = z.object({ id: ma });

const nguonDong = z.object({
	id: z.string(),
	tenTep: z.string(),
	kieu: z.enum(KIEU_NGUON),
	trangThai: z.enum(TRANG_THAI_NGUON),
	lyDo: z.string().nullable(),
	taiLuc: z.date(),
	taiBoi: z.object({ id: z.string(), name: z.string() }),
	trang: z.object({ slug: z.string(), ten: z.string() }),
	deXuatId: z.string().nullable(),
	coTheSoanLai: z.boolean(),
});
export type NguonDong = z.infer<typeof nguonDong>;

export const taiLieuNguonListOutput = z.object({ rows: z.array(nguonDong) });
export const taiLieuNguonGetOutput = nguonDong.extend({
	chu: z.string().nullable(),
});
export const taiLieuNguonTaiVeOutput = z.object({
	url: z.string(),
	hetHan: z.number(),
});
export const taiLieuNguonTrangThaiOutput = z.object({ bat: z.boolean() });
export type TrangThaiKho = z.infer<typeof taiLieuNguonTrangThaiOutput>;
export const taiLieuNguonOkOutput = z.object({ ok: z.literal(true) });

export type TaiLieuNguonXinChoInput = z.infer<typeof taiLieuNguonXinChoInput>;
export type TaiLieuNguonNhanInput = z.infer<typeof taiLieuNguonNhanInput>;
