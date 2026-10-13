import type { Prisma } from "@crm/db";
import type { SuKienChiTiet } from "@crm/validation/tai-lieu";

export async function ghiSuKien(
	tx: Prisma.TransactionClient,
	trangId: string,
	aiId: string,
	chiTiet: SuKienChiTiet,
): Promise<void> {
	await tx.taiLieuSuKien.create({
		data: { trangId, aiId, loai: chiTiet.loai, chiTiet },
	});
}
