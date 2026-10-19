import {
	LO_TRINH_SAN_PHAM,
	TRANG_THAI_LAY,
	type TrangThaiLay,
} from "@crm/db/san-pham-lo-trinh-danh-muc";
import { z } from "zod";

export { LO_TRINH_SAN_PHAM, TRANG_THAI_LAY, type TrangThaiLay };

const DOAN_KHO = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const NHANH = /^[^\s~^:?*[\\]+$/;

export const trangThaiLay = z.enum(TRANG_THAI_LAY);

export const sanPhamKhai = z.object({
	ten: z.string().trim().min(1).max(LO_TRINH_SAN_PHAM.tranTen),
	kho: z.string().trim().regex(DOAN_KHO),
	nhanh: z.string().trim().min(1).regex(NHANH),
	duongTep: z
		.string()
		.trim()
		.min(1)
		.max(LO_TRINH_SAN_PHAM.tranTep)
		.refine((p) => !p.startsWith("/") && !p.split("/").includes("..")),
});

export type SanPhamKhai = z.infer<typeof sanPhamKhai>;

export const maSanPham = z
	.string()
	.trim()
	.min(1)
	.max(LO_TRINH_SAN_PHAM.tranMa)
	.regex(/^[a-z0-9-]+$/);

export function maTuTen(ten: string): string {
	return ten
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, LO_TRINH_SAN_PHAM.tranMa)
		.replace(/-+$/g, "");
}
