// Bước của kế hoạch 30 ngày tạo sau DA3 là bản chiếu của đúng một Việc (`OnboardingStep.viecId`).
// Việc là nguồn sự thật cho người làm, hạn, tên và trạng thái xong; tệp này chép bốn thứ ấy sang
// bước. Tệp lá — chỉ phụ thuộc Prisma — để viec-ghi.ts gọi được mà không vòng import.
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
			assigneeId: v.nguoiThucHienId,
			dueAt: v.hanNgay ?? undefined,
			completedAt: v.trangThai === TrangThaiViec.XONG ? v.khepLuc : null,
		},
	});
}
