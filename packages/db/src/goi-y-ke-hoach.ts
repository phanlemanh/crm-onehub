import type { Prisma } from "./generated/prisma/client";
import { TrangThaiGoiY } from "./generated/prisma/enums";
import { type LoaiGiaiDoan, laChotDuoc } from "./giai-doan";

type Tx = Prisma.TransactionClient;

export const GOI_Y = {
	thongDiep: {
		daXuLy: "Gợi ý này đã được xử lý.",
		khongQuyen: "Chỉ người nhận gợi ý hoặc quản trị mới xử lý được gợi ý này.",
	},
} as const;

export async function sinhGoiYKeHoach(
	tx: Tx,
	args: {
		dealId: string;
		tuLoai: LoaiGiaiDoan | null;
		denLoai: LoaiGiaiDoan;
		now: Date;
	},
): Promise<{ id: string } | null> {
	if (!laChotDuoc(args.denLoai)) return null;
	if (args.tuLoai !== null && laChotDuoc(args.tuLoai)) return null;

	const deal = await tx.deal.findUniqueOrThrow({
		where: { id: args.dealId },
		select: { companyId: true, ownerId: true },
	});
	const [keHoachMo, dangCho] = await Promise.all([
		tx.onboardingPlan.count({
			where: { companyId: deal.companyId, closedAt: null },
		}),
		tx.goiYKeHoach.count({
			where: { dealId: args.dealId, trangThai: TrangThaiGoiY.CHO },
		}),
	]);
	if (keHoachMo > 0 || dangCho > 0) return null;

	return tx.goiYKeHoach.create({
		data: {
			dealId: args.dealId,
			companyId: deal.companyId,
			nguoiNhanId: deal.ownerId,
			chuyenLuc: args.now,
			sinhLuc: args.now,
		},
		select: { id: true },
	});
}

export async function dongGoiYCuaCongTy(
	tx: Tx,
	args: { companyId: string; planId: string; nguoiId: string; now: Date },
): Promise<number> {
	const { count } = await tx.goiYKeHoach.updateMany({
		where: { companyId: args.companyId, trangThai: TrangThaiGoiY.CHO },
		data: {
			trangThai: TrangThaiGoiY.DA_MO,
			planId: args.planId,
			xuLyLuc: args.now,
			xuLyBoiId: args.nguoiId,
		},
	});
	return count;
}

export async function boQuaGoiYTrongTx(
	tx: Tx,
	args: { id: string; nguoiId: string; now: Date },
): Promise<boolean> {
	const { count } = await tx.goiYKeHoach.updateMany({
		where: { id: args.id, trangThai: TrangThaiGoiY.CHO },
		data: {
			trangThai: TrangThaiGoiY.BO_QUA,
			xuLyLuc: args.now,
			xuLyBoiId: args.nguoiId,
		},
	});
	return count === 1;
}
