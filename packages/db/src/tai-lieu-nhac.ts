import type { Db } from "./client";
import { demChoDuyetTheoNguoi } from "./tai-lieu-quyen";
import { WORKSPACE_ID } from "./workspace";

export const LOAI_NHAC_TAI_LIEU = ["tai-lieu-cho-duyet"] as const;

export type LoaiNhacTaiLieu = (typeof LOAI_NHAC_TAI_LIEU)[number];

export type ViecTaiLieu = { loai: "tai-lieu-cho-duyet"; so: number };

export async function viecTaiLieuCanNhac(
	db: Db,
	chon: { now: Date; userId?: string },
): Promise<Map<string, ViecTaiLieu[]>> {
	const thanhVien = await db.member.findMany({
		where: { organizationId: WORKSPACE_ID, userId: chon.userId },
		select: { userId: true, role: true },
	});
	const so = await demChoDuyetTheoNguoi(
		db,
		thanhVien.map((m) => ({ id: m.userId, role: m.role })),
	);
	return new Map(
		[...so].flatMap(([userId, n]) =>
			n > 0 ? [[userId, [{ loai: "tai-lieu-cho-duyet", so: n }]] as const] : [],
		),
	);
}
