import type { NguCanhXem } from "@crm/db/okr-hien-thi";
import { z } from "zod";
import type { CapMucTieu } from "./okr-muc-tieu";

export const MUC_HIEN_THI = ["cong-khai", "gioi-han"] as const;
export type MucHienThi = (typeof MUC_HIEN_THI)[number];

export const OKR_HIEN_THI = {
	nguoiXemToiDa: 20,
	lyDoTraLai: { toiThieu: 10, toiDa: 500 },
	chuyenToiDa: 50,
} as const;

export const LOI_KHUON_HIEN_THI = {
	quaNguoiXem: `Tối đa ${OKR_HIEN_THI.nguoiXemToiDa} người xem có tên.`,
} as const;

export type { NguCanhXem };

export type MucTieuDeXem = {
	hienThi: MucHienThi;
	level: CapMucTieu;
	divisionId: string | null;
	departmentId: string | null;
	personUserId: string | null;
	ownerUserId: string;
	thamGia: string[];
	phuTrachKr: string[];
	nguoiLamViec: string[];
	nguoiXem: string[];
};

function veDonVi(nc: NguCanhXem, mt: MucTieuDeXem): boolean {
	if (mt.level === "bo-phan")
		return mt.divisionId !== null && nc.boPhanTruong.includes(mt.divisionId);
	if (mt.level === "phong-ban")
		return (
			mt.departmentId !== null &&
			(nc.phongBanTruong.includes(mt.departmentId) ||
				nc.phongBanDuoiBoPhanTruong.includes(mt.departmentId))
		);
	if (mt.level === "ca-nhan")
		return (
			mt.personUserId !== null && nc.nguoiDuoiQuyen.includes(mt.personUserId)
		);
	return false;
}

export function xemDuocMucTieu(nc: NguCanhXem, mt: MucTieuDeXem): boolean {
	if (mt.hienThi === "cong-khai" || nc.quanTri) return true;
	if (
		mt.ownerUserId === nc.userId ||
		mt.personUserId === nc.userId ||
		mt.thamGia.includes(nc.userId) ||
		mt.phuTrachKr.includes(nc.userId) ||
		mt.nguoiLamViec.includes(nc.userId) ||
		mt.nguoiXem.includes(nc.userId)
	)
		return true;
	return veDonVi(nc, mt);
}

const ma = z.string().trim().min(1).max(120);

export const datHienThiInput = z.object({
	objectiveId: ma,
	hienThi: z.enum(MUC_HIEN_THI),
	nguoiXem: z
		.array(ma)
		.max(OKR_HIEN_THI.nguoiXemToiDa, { error: LOI_KHUON_HIEN_THI.quaNguoiXem }),
});
export type DatHienThiInput = z.infer<typeof datHienThiInput>;

export const traLaiInput = z.object({
	objectiveId: ma,
	lyDo: z
		.string()
		.trim()
		.min(OKR_HIEN_THI.lyDoTraLai.toiThieu)
		.max(OKR_HIEN_THI.lyDoTraLai.toiDa),
});
export type TraLaiInput = z.infer<typeof traLaiInput>;

export const chuyenDonViInput = z.object({
	objectiveIds: z.array(ma).min(1).max(OKR_HIEN_THI.chuyenToiDa),
	denDonVi: z.discriminatedUnion("level", [
		z.strictObject({ level: z.literal("bo-phan"), id: ma }),
		z.strictObject({ level: z.literal("phong-ban"), id: ma }),
	]),
});
export type ChuyenDonViInput = z.infer<typeof chuyenDonViInput>;
