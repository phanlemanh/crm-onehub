import type { Db } from "./client";
import type { Prisma } from "./generated/prisma/client";

export const VAI_QUAN_TRI_TAI_LIEU = ["owner", "admin"] as const;

export type NguoiXemTaiLieu = { id: string; role: string | null };

export function laQuanTriTaiLieu(role: string | null): boolean {
	return (VAI_QUAN_TRI_TAI_LIEU as readonly (string | null)[]).includes(role);
}

export function dieuKienThayDeXuat(
	nguoi: NguoiXemTaiLieu,
): Prisma.TaiLieuDeXuatWhereInput {
	if (laQuanTriTaiLieu(nguoi.role)) return {};
	return { OR: [{ taoBoiId: nguoi.id }, { trang: { chuTrangId: nguoi.id } }] };
}

export function dieuKienDuyetDuoc(
	nguoi: NguoiXemTaiLieu,
): Prisma.TaiLieuDeXuatWhereInput {
	if (laQuanTriTaiLieu(nguoi.role)) return {};
	return { trang: { chuTrangId: nguoi.id } };
}

export function duyetDuocTrang(
	nguoi: NguoiXemTaiLieu,
	trang: { chuTrangId: string },
): boolean {
	return laQuanTriTaiLieu(nguoi.role) || nguoi.id === trang.chuTrangId;
}

export function dieuKienThay(
	nguoi: NguoiXemTaiLieu,
): Prisma.TaiLieuTrangWhereInput {
	if (laQuanTriTaiLieu(nguoi.role)) return {};
	return {
		OR: [
			{ banDangDungId: { not: null } },
			{ chuTrangId: nguoi.id },
			{ deXuat: { some: { taoBoiId: nguoi.id } } },
		],
	};
}

export function demChoDuyet(db: Db, nguoi: NguoiXemTaiLieu): Promise<number> {
	return db.taiLieuDeXuat.count({
		where: { AND: [dieuKienDuyetDuoc(nguoi), { trangThai: "CHO_DUYET" }] },
	});
}

export async function demChoDuyetTheoNguoi(
	db: Db,
	nguoi: readonly NguoiXemTaiLieu[],
): Promise<Map<string, number>> {
	const so = await Promise.all(nguoi.map((n) => demChoDuyet(db, n)));
	return new Map(nguoi.map((n, i) => [n.id, so[i] ?? 0]));
}
