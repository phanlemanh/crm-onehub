import { TrangThaiViec } from "./generated/prisma/enums";
import type { DbGhi } from "./zalo-lien-ket";

export async function buocCuaViec(
	tx: DbGhi,
	viecId: string,
): Promise<{ id: string } | null> {
	return tx.onboardingStep.findUnique({
		where: { viecId },
		select: { id: true },
	});
}

export async function chieuLenBuoc(tx: DbGhi, viecId: string): Promise<void> {
	const buoc = await buocCuaViec(tx, viecId);
	if (buoc === null) return;
	const v = await tx.viec.findUniqueOrThrow({
		where: { id: viecId },
		select: {
			tieuDe: true,
			hanNgay: true,
			nguoiThucHienId: true,
			trangThai: true,
			khepLuc: true,
		},
	});
	await tx.onboardingStep.update({
		where: { id: buoc.id },
		data: {
			label: v.tieuDe,
			assigneeId: v.trangThai === TrangThaiViec.HUY ? null : v.nguoiThucHienId,
			dueAt: v.hanNgay ?? undefined,
			completedAt: v.trangThai === TrangThaiViec.XONG ? v.khepLuc : null,
		},
	});
}
