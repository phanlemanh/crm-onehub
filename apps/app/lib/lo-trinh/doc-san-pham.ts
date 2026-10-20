import { db } from "@crm/db";
import { docBanChupLoTrinh } from "@crm/db/ban-chup-lo-trinh";
import { sanPhamXemDuoc } from "@crm/db/san-pham-lo-trinh";
import type { WorkspaceRole } from "@crm/validation/vai-workspace";
import { cacheLife } from "next/cache";
import { cache } from "react";
import { LO_TRINH } from "./cau-hinh";
import { type KetQuaDocBanChup, ketQuaTuHang } from "./doc-trang";
import type { SanPhamTrang } from "./san-pham";

export async function docBanChupSanPham(ma: string): Promise<KetQuaDocBanChup> {
	"use cache";
	cacheLife({ revalidate: LO_TRINH.nhipLamMoiMs / 1000 });
	try {
		return ketQuaTuHang(await docBanChupLoTrinh(db, ma));
	} catch (loi) {
		return {
			kieu: "loi",
			lyDo: loi instanceof Error ? loi.message : String(loi),
		};
	}
}

export const sanPhamThayDuoc = cache(
	async (
		userId: string,
		vai: WorkspaceRole | null,
	): Promise<SanPhamTrang[]> => {
		try {
			const ds = await sanPhamXemDuoc(db, { userId, vai });
			return ds.map((s) => ({
				ma: s.ma,
				ten: s.ten,
				kho: s.kho,
				nhanh: s.nhanh,
				trangThaiLay: s.trangThaiLay,
				nguonDoi: s.nguonDoiLuc !== null,
			}));
		} catch (loi) {
			console.warn("lo-trinh: khong doc duoc danh ba san pham", {
				lyDo: loi instanceof Error ? loi.message : String(loi),
			});
			return [];
		}
	},
);
