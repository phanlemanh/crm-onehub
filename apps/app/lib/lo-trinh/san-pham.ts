import type { TrangThaiLay } from "@crm/validation/san-pham-lo-trinh";
import type { WorkspaceRole } from "@crm/validation/vai-workspace";
import { LO_TRINH } from "./cau-hinh";
import { choVaiXem } from "./cho-vai";
import {
	canhBaoChoTrang,
	type DauVaoLoTrinh,
	type KetQuaDocBanChup,
	type NguonSanPhamTrang,
} from "./doc-trang";

export type SanPhamTrang = {
	ma: string;
	ten: string;
	kho: string;
	nhanh: string;
	trangThaiLay: TrangThaiLay;
	nguonDoi: boolean;
};

export type MucChonSanPham = { ma: string; ten: string };

const TRANG_THAI_KHONG_HONG: readonly TrangThaiLay[] = ["da-lay", "chua-lay"];

export function danhSachChon(thayDuoc: SanPhamTrang[]): MucChonSanPham[] {
	return [
		{ ma: LO_TRINH.nguonCrm, ten: LO_TRINH.tenCrm },
		...thayDuoc.map((s) => ({ ma: s.ma, ten: s.ten })),
	];
}

export function chonSanPham(
	thayDuoc: { ma: string }[],
	thamSo: string | null,
): string {
	if (thamSo === null) return LO_TRINH.nguonCrm;
	return thayDuoc.some((s) => s.ma === thamSo) ? thamSo : LO_TRINH.nguonCrm;
}

export function khuonCua(
	phienBan: number,
	canhBao: string[],
): NguonSanPhamTrang["khuon"] {
	if (canhBao.some((c) => c.includes(LO_TRINH.canhBaoKhuonMoi)))
		return { phienBan, moiHon: true };
	if (
		phienBan === 1 ||
		canhBao.some((c) => c.includes(LO_TRINH.canhBaoThieuMoHinh))
	)
		return { phienBan, moiHon: false };
	return null;
}

export async function docDauVaoSanPham(
	sp: SanPhamTrang,
	vai: WorkspaceRole | null,
	docBanChup: (ma: string) => Promise<KetQuaDocBanChup>,
): Promise<DauVaoLoTrinh> {
	let kq: KetQuaDocBanChup;
	try {
		kq = await docBanChup(sp.ma);
	} catch (loi) {
		kq = {
			kieu: "loi",
			lyDo: loi instanceof Error ? loi.message : String(loi),
		};
	}
	if (kq.kieu !== "co")
		return {
			kieu: "san-pham-chua-co",
			ten: sp.ten,
			trangThai: sp.trangThaiLay,
			quanTri: vai === "owner" || vai === "admin",
		};
	const { banChup } = kq;
	return choVaiXem(
		{
			kieu: "co-du-lieu",
			duLieu: banChup.duLieu,
			canhBao: canhBaoChoTrang(banChup.duLieu.phien_ban, banChup.canhBao),
			sanPham: {
				ten: sp.ten,
				kho: sp.kho,
				nhanh: sp.nhanh,
				layLuc: banChup.layLuc,
				layHong: TRANG_THAI_KHONG_HONG.includes(sp.trangThaiLay)
					? null
					: sp.trangThaiLay,
				nguonDoi: sp.nguonDoi,
				khuon: khuonCua(banChup.duLieu.phien_ban, banChup.canhBao),
			},
		},
		vai,
	);
}
