import {
	maSanPham,
	sanPhamKhai,
	trangThaiLay,
} from "@crm/validation/san-pham-lo-trinh";
import { WORKSPACE_ROLES } from "@crm/validation/vai-workspace";
import { z } from "zod";

export const sanPhamHang = z.object({
	ma: z.string(),
	ten: z.string(),
	kho: z.string(),
	nhanh: z.string(),
	duongTep: z.string(),
	trangThaiLay,
	chiTietLay: z.string().nullable(),
	layLuc: z.string().nullable(),
	phienBanKhuon: z.number().int().nullable(),
	coLichSu: z.boolean(),
	nguonDoi: z.boolean(),
});

export type SanPhamHang = z.infer<typeof sanPhamHang>;

export const sanPhamDanhSach = z.object({
	quanTri: z.boolean(),
	sanPham: z.array(sanPhamHang),
});

export type SanPhamDanhSach = z.infer<typeof sanPhamDanhSach>;

export const sanPhamMaVao = z.object({ ma: maSanPham });

export const sanPhamSuaVao = sanPhamKhai.partial().extend({ ma: maSanPham });

export const sanPhamNguoiXemVao = z.object({
	ma: maSanPham,
	userIds: z.array(z.string().min(1)).max(500),
});

export const sanPhamNguoiXemRa = z.array(
	z.object({
		userId: z.string(),
		ten: z.string(),
		vai: z.enum(WORKSPACE_ROLES),
		chon: z.boolean(),
		luonThay: z.boolean(),
	}),
);

export const sanPhamGhiRa = z.object({ ma: z.string() });
