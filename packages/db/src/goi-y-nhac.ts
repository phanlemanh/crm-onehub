import type { Db } from "./client";
import { TrangThaiGoiY } from "./generated/prisma/enums";

export const LOAI_NHAC_GOI_Y = ["goi-y-ke-hoach"] as const;

export type LoaiNhacGoiY = (typeof LOAI_NHAC_GOI_Y)[number];

export type ViecGoiY = {
	loai: "goi-y-ke-hoach";
	goiYId: string;
	dealId: string;
	dealName: string;
	companyName: string;
};

export async function viecGoiYCanNhac(
	db: Db,
	chon: { userId?: string },
): Promise<Map<string, ViecGoiY[]>> {
	const ds = await db.goiYKeHoach.findMany({
		where: {
			trangThai: TrangThaiGoiY.CHO,
			nguoiNhanId: chon.userId,
			deal: { archivedAt: null, giaiDoan: { kind: "WON" } },
		},
		orderBy: { sinhLuc: "asc" },
		select: {
			id: true,
			nguoiNhanId: true,
			deal: { select: { id: true, name: true } },
			company: { select: { name: true } },
		},
	});
	const theoNguoi = new Map<string, ViecGoiY[]>();
	for (const g of ds) {
		const viec: ViecGoiY = {
			loai: "goi-y-ke-hoach",
			goiYId: g.id,
			dealId: g.deal.id,
			dealName: g.deal.name,
			companyName: g.company.name,
		};
		theoNguoi.set(g.nguoiNhanId, [
			...(theoNguoi.get(g.nguoiNhanId) ?? []),
			viec,
		]);
	}
	return theoNguoi;
}
