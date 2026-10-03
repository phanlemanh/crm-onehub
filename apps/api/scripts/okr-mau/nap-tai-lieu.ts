import "reflect-metadata";
import type { Db } from "@crm/db";
import { TaiLieuService } from "../../src/tai-lieu/tai-lieu.service";
import { idMau } from "./cau-hinh";
import type { BoOkrMau } from "./khuon";

export async function napTaiLieuMau(db: Db, bo: BoOkrMau): Promise<number> {
	const svc = new TaiLieuService(db);
	for (const t of bo.taiLieu) {
		const nguoi = { id: idMau("nguoi", t.chuTrang), role: "admin" as const };
		const { slug } = await svc.create(nguoi, {
			ten: t.ten,
			loai: t.loai,
			chuTrangId: nguoi.id,
			noiDung: t.noiDung,
		});
		const trang = await db.taiLieuTrang.findUniqueOrThrow({
			where: { slug },
			select: {
				deXuat: {
					select: { id: true },
					orderBy: { createdAt: "asc" },
					take: 1,
				},
			},
		});
		const deXuatId = trang.deXuat[0]?.id;
		if (!deXuatId)
			throw new Error(`trang mẫu ${t.ma} không có bản đề xuất đầu`);
		const p = await svc.proposal(nguoi, deXuatId);
		await svc.approve(nguoi, { id: deXuatId, diffHash: p.diffHash });
	}
	return bo.taiLieu.length;
}
