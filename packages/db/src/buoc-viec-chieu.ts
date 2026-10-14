// Bước của kế hoạch 30 ngày tạo sau DA3 là bản chiếu của đúng một Việc (`OnboardingStep.viecId`).
// Việc là nguồn sự thật cho người làm, hạn, tên và trạng thái xong; tệp này chép bốn thứ ấy sang
// bước. Việc đã Huỷ thì bước không có người làm: việc huỷ không ai làm, và thước «bước mở trong tay
// vai chỉ OKR» (va-lo-ro-vai-chi-okr) không được đếm một bước của Việc đã huỷ khi kế hoạch mở lại. Tệp lá — chỉ phụ thuộc Prisma — để viec-ghi.ts gọi được mà không vòng import.
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
