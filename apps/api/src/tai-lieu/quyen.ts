import { isWorkspaceAdmin, type WorkspaceRole } from "@crm/auth";
import type { Prisma } from "@crm/db";

export type NguoiGoi = { id: string; role: WorkspaceRole | null };
type TrangQuyen = { chuTrangId: string };
type DeXuatQuyen = { taoBoiId: string };

export function laQuanTri(role: WorkspaceRole | null): boolean {
	return isWorkspaceAdmin(role);
}

export function duyetDuoc(nguoi: NguoiGoi, trang: TrangQuyen): boolean {
	return nguoi.id === trang.chuTrangId || laQuanTri(nguoi.role);
}

export function thayDeXuat(
	nguoi: NguoiGoi,
	deXuat: DeXuatQuyen,
	trang: TrangQuyen,
): boolean {
	return deXuat.taoBoiId === nguoi.id || duyetDuoc(nguoi, trang);
}

export function thayTrang(
	nguoi: NguoiGoi,
	trang: TrangQuyen & { banDangDungId: string | null },
	deXuatCuaTrang: readonly DeXuatQuyen[],
): boolean {
	return (
		trang.banDangDungId !== null ||
		deXuatCuaTrang.some((d) => thayDeXuat(nguoi, d, trang))
	);
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
