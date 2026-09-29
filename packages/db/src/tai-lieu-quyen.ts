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
	const [theoChu, tong] = await Promise.all([
		db.taiLieuDeXuat.groupBy({
			by: ["trangId"],
			where: { trangThai: "CHO_DUYET" },
			_count: { _all: true },
		}),
		db.taiLieuDeXuat.count({ where: { trangThai: "CHO_DUYET" } }),
	]);
	const trang = await db.taiLieuTrang.findMany({
		where: { id: { in: theoChu.map((t) => t.trangId) } },
		select: { id: true, chuTrangId: true },
	});
	const chuCua = new Map(trang.map((t) => [t.id, t.chuTrangId]));
	const soCuaChu = new Map<string, number>();
	for (const t of theoChu) {
		const chu = chuCua.get(t.trangId);
		if (chu) soCuaChu.set(chu, (soCuaChu.get(chu) ?? 0) + t._count._all);
	}
	return new Map(
		nguoi.map((n) => [
			n.id,
			laQuanTriTaiLieu(n.role) ? tong : (soCuaChu.get(n.id) ?? 0),
		]),
	);
}
