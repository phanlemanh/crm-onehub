import type { WorkspaceRole } from "@crm/auth";
import type { Prisma } from "@crm/db";
import { duyetDuocTrang, laQuanTriTaiLieu } from "@crm/db/tai-lieu-quyen";

export type NguoiGoi = { id: string; role: WorkspaceRole | null };
type TrangQuyen = { chuTrangId: string };
type DeXuatQuyen = { taoBoiId: string };

export function laQuanTri(role: WorkspaceRole | null): boolean {
	return laQuanTriTaiLieu(role);
}

export function duyetDuoc(nguoi: NguoiGoi, trang: TrangQuyen): boolean {
	return duyetDuocTrang(nguoi, trang);
}

export function thayDeXuat(
	nguoi: NguoiGoi,
	deXuat: DeXuatQuyen,
	trang: TrangQuyen,
): boolean {
	return deXuat.taoBoiId === nguoi.id || duyetDuoc(nguoi, trang);
}

export function dieuKienThayNguon(
	nguoi: NguoiGoi,
): Prisma.TaiLieuNguonWhereInput {
	if (laQuanTri(nguoi.role)) return {};
	return {
		OR: [
			{ taiBoiId: nguoi.id },
			{ trang: { chuTrangId: nguoi.id } },
			{ deXuat: { some: { phienBan: { isNot: null } } } },
		],
	};
}

export function dieuKienSoanLai(
	nguoi: NguoiGoi,
): Prisma.TaiLieuNguonWhereInput {
	if (laQuanTri(nguoi.role)) return {};
	return {
		OR: [{ taiBoiId: nguoi.id }, { trang: { chuTrangId: nguoi.id } }],
	};
}

export function soanLaiDuoc(
	nguoi: NguoiGoi,
	nguon: { taiBoiId: string; trang: TrangQuyen },
): boolean {
	return nguon.taiBoiId === nguoi.id || duyetDuoc(nguoi, nguon.trang);
}
