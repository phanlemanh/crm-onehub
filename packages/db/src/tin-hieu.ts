import type { Db } from "./client";
import type { Prisma } from "./generated/prisma/client";
import { dauNgayVN } from "./onboarding-nhac";

type Ghi = Db | Prisma.TransactionClient;

export function demTinHieuTrongNgay(
	db: Ghi,
	nguoiId: string,
	now: Date,
): Promise<number> {
	return db.tinHieu.count({
		where: { nguoiGuiId: nguoiId, guiLuc: { gte: dauNgayVN(now) } },
	});
}
