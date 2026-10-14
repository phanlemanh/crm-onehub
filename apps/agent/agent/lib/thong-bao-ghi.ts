import type { Db } from "@crm/db";
import { DAY_MS, ngayVN, type ViecNhac } from "@crm/db/onboarding-nhac";
import {
	khoaThongBao,
	type NoiDungThongBao,
	THONG_BAO,
} from "@crm/validation/thong-bao";

export async function ghiThongBao(
	db: Db,
	userId: string,
	viec: ViecNhac[],
	duong: (v: ViecNhac) => string,
	now: Date,
): Promise<{ tao: number; capNhat: number }> {
	const homNay = ngayVN(now);
	const homQua = ngayVN(new Date(now.getTime() - DAY_MS));
	return db.$transaction(async (tx) => {
		let tao = 0;
		let capNhat = 0;
		for (const v of viec) {
			const noiDung: NoiDungThongBao = v;
			const khoa = khoaThongBao(noiDung, now);
			const duongDan = duong(v);
			const cu = await tx.thongBao.findFirst({
				where: {
					nguoiNhanId: userId,
					khoa,
					thayNgay: { in: [homQua, homNay] },
				},
				orderBy: { taoLuc: "desc" },
				select: { id: true },
			});
			if (cu) {
				await tx.thongBao.update({
					where: { id: cu.id },
					data: { thayNgay: homNay, noiDung, duongDan },
				});
				capNhat += 1;
				continue;
			}
			const r = await tx.thongBao.createMany({
				data: [
					{
						nguoiNhanId: userId,
						nguon: THONG_BAO.nguon.nhacBuoiSang,
						khoa,
						noiDung,
						duongDan,
						ngayDau: homNay,
						thayNgay: homNay,
						taoLuc: now,
					},
				],
				skipDuplicates: true,
			});
			tao += r.count;
		}
		return { tao, capNhat };
	});
}

export async function donThongBaoCu(db: Db, now: Date): Promise<number> {
	const { count } = await db.thongBao.deleteMany({
		where: {
			taoLuc: { lt: new Date(now.getTime() - THONG_BAO.giuNgay * DAY_MS) },
		},
	});
	return count;
}
