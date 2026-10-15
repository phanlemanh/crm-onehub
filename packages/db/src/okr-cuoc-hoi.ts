import { randomUUID } from "node:crypto";
import { khungThangVN, thangVN } from "./ai-chi-phi";
import type { TinhNang } from "./ai-chi-phi-danh-muc";
import type { Db } from "./client";
import type { Prisma } from "./generated/prisma/client";

type DbHoacTx = Db | Prisma.TransactionClient;

export const TIEN_TO_CHO_EVE = "cho-eve:";
const TINH_NANG_HOI: TinhNang = "okr.hoi-dap";

export type CuocHoi = {
	id: string;
	nguoiHoiUserId: string;
	sessionId: string;
	cacPhien: string[];
};

const chon = {
	id: true,
	nguoiHoiUserId: true,
	sessionId: true,
	cacPhien: true,
} as const;

export async function taoCuocHoi(
	db: DbHoacTx,
	userId: string,
): Promise<{ id: string; sessionId: string }> {
	return db.okrCuocHoi.create({
		data: {
			nguoiHoiUserId: userId,
			sessionId: `${TIEN_TO_CHO_EVE}${randomUUID()}`,
		},
		select: { id: true, sessionId: true },
	});
}

export async function cuocHoiCua(
	db: DbHoacTx,
	cuocHoiId: string,
): Promise<CuocHoi | null> {
	return db.okrCuocHoi.findUnique({ where: { id: cuocHoiId }, select: chon });
}

export function laPlaceholder(sessionId: string): boolean {
	return sessionId.startsWith(TIEN_TO_CHO_EVE);
}

export async function ghiPhienEve(
	db: DbHoacTx,
	cuocHoiId: string,
	sessionId: string,
): Promise<void> {
	const thay = await db.okrCuocHoi.updateMany({
		where: { id: cuocHoiId, sessionId: { startsWith: TIEN_TO_CHO_EVE } },
		data: { sessionId },
	});
	if (thay.count > 0) return;
	await db.okrCuocHoi.update({
		where: { id: cuocHoiId },
		data: { cacPhien: { push: sessionId } },
	});
}

export async function demLuotNgay(
	db: DbHoacTx,
	userId: string,
	ngay: string,
): Promise<number> {
	return db.okrLuotHoi.count({ where: { userId, ngay } });
}

export async function ghiLuot(
	db: DbHoacTx,
	luot: { cuocHoiId: string; userId: string; ngay: string },
): Promise<void> {
	await db.okrLuotHoi.create({ data: luot });
}

export async function chiPhiThangHoiDap(
	db: DbHoacTx,
	luc: Date,
): Promise<number> {
	const { tu, den } = khungThangVN(thangVN(luc));
	const tong = await db.aiChiPhi.aggregate({
		where: { tinhNang: TINH_NANG_HOI, at: { gte: tu, lt: den } },
		_sum: { costUsd: true },
	});
	return tong._sum.costUsd?.toNumber() ?? 0;
}
