// Bước của kế hoạch 30 ngày tạo sau DA3 mang đúng một Việc (design 2026-10-14-ke-hoach-sinh-viec).
// Lệnh trên thẻ Bước (giao, đánh xong, đổi hạn, gỡ) đi qua đây: ghi vào Việc bằng quyền của kế hoạch
// — thành viên nào làm được trên kế hoạch thì làm được, như trước DA3 — rồi chiếu lại lên bước.
// Lệnh trên khung Việc vẫn đi qua viec-ghi.ts với quyền vai của Việc.
import { buocCuaViec, chieuLenBuoc } from "./buoc-viec-chieu";
import { TrangThaiViec } from "./generated/prisma/enums";
import {
	type NguonViec,
	ngayHan,
	roiChuaLamMoi,
	TRANG_THAI_KHEP,
} from "./viec";
import { ghiVetViec, kiemNguoiNhanViec, taoViec } from "./viec-ghi";
import type { DbGhi } from "./zalo-lien-ket";

export { buocCuaViec, chieuLenBuoc };

export type TaoViecChoBuocInput = {
	stepId: string;
	planId: string;
	tieuDe: string;
	hanNgay: Date;
	nguoiGiaoId: string;
	nguoiThucHienId: string;
	nguon: NguonViec;
	now: Date;
};

export async function taoViecChoBuoc(
	tx: DbGhi,
	input: TaoViecChoBuocInput,
): Promise<{ viecId: string }> {
	const viec = await taoViec(tx, {
		nguoiId: input.nguoiGiaoId,
		tieuDe: input.tieuDe,
		hanNgay: input.hanNgay,
		nguoiThucHienId: input.nguoiThucHienId,
		gan: [{ loai: "plan", id: input.planId }],
		nguon: input.nguon,
		now: input.now,
	});
	await tx.onboardingStep.update({
		where: { id: input.stepId },
		data: { viecId: viec.id },
	});
	await chieuLenBuoc(tx, viec.id);
	return { viecId: viec.id };
}

export type LenhBuoc =
	| { lenh: "giao"; nguoiThucHienId: string }
	| { lenh: "xong"; done: boolean }
	| { lenh: "han"; hanNgay: Date }
	| { lenh: "huy"; lyDo: string };

export type GhiTuBuocInput = {
	viecId: string;
	nguoiId: string;
	nguon: NguonViec;
	now: Date;
	lenh: LenhBuoc;
};

export async function ghiTuBuoc(
	tx: DbGhi,
	input: GhiTuBuocInput,
): Promise<void> {
	await tx.$queryRaw`SELECT id FROM viec WHERE id = ${input.viecId} FOR UPDATE`;
	const viec = await tx.viec.findUniqueOrThrow({
		where: { id: input.viecId },
		select: {
			id: true,
			trangThai: true,
			hanNgay: true,
			roiChuaLamLuc: true,
			nguoiThucHienId: true,
			nguoiThucHien: { select: { id: true, name: true } },
		},
	});
	const dau = {
		viecId: viec.id,
		nguoiId: input.nguoiId,
		nguon: input.nguon,
		luc: input.now,
	};
	const l = input.lenh;
	if (l.lenh === "giao") {
		if (l.nguoiThucHienId === viec.nguoiThucHienId) return;
		const moi = await kiemNguoiNhanViec(tx, l.nguoiThucHienId);
		await tx.viec.update({
			where: { id: viec.id },
			data: { nguoiThucHienId: moi.id },
		});
		await ghiVetViec(tx, dau, {
			loai: "doi-nguoi-thuc-hien",
			truoc: { id: viec.nguoiThucHien.id, ten: viec.nguoiThucHien.name },
			sau: moi,
		});
	} else if (l.lenh === "han") {
		const cu = viec.hanNgay ? ngayHan(viec.hanNgay) : null;
		if (cu === ngayHan(l.hanNgay)) return;
		await tx.viec.update({
			where: { id: viec.id },
			data: { hanNgay: l.hanNgay },
		});
		await ghiVetViec(tx, dau, {
			loai: "doi-han",
			truoc: { hanNgay: cu },
			sau: { hanNgay: ngayHan(l.hanNgay) },
		});
	} else {
		const den =
			l.lenh === "huy"
				? TrangThaiViec.HUY
				: l.done
					? TrangThaiViec.XONG
					: TrangThaiViec.DANG_LAM;
		if (l.lenh === "xong" && !l.done && viec.trangThai !== TrangThaiViec.XONG) {
			return;
		}
		if (viec.trangThai === den) return;
		// Mở lại một Việc đã khép (bỏ đánh xong) theo cùng luật «Làm lại» của DA1: người thực hiện phải
		// còn nhận được việc gắn đối tác — vai chỉ OKR thì từ chối, Việc và bước không đổi.
		if (
			TRANG_THAI_KHEP.includes(viec.trangThai) &&
			!TRANG_THAI_KHEP.includes(den)
		) {
			await kiemNguoiNhanViec(tx, viec.nguoiThucHienId);
		}
		await tx.viec.update({
			where: { id: viec.id },
			data: {
				trangThai: den,
				khepLuc: TRANG_THAI_KHEP.includes(den) ? input.now : null,
				roiChuaLamLuc: roiChuaLamMoi(viec, input.nguoiId, den)
					? input.now
					: undefined,
			},
		});
		await ghiVetViec(tx, dau, {
			loai: "doi-trang-thai",
			truoc: { trangThai: viec.trangThai },
			sau:
				l.lenh === "huy"
					? { trangThai: den, lyDo: l.lyDo }
					: { trangThai: den },
		});
	}
	await chieuLenBuoc(tx, viec.id);
}
