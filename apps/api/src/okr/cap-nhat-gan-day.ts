import type { Prisma } from "@crm/db";
import type { PhamViBo } from "@crm/validation/okr-tham-so";
import type { DanDonVi } from "./bo-okr";

const KHONG_DONG = { id: { in: [] } } satisfies Prisma.OkrObjectiveWhereInput;

export function dieuKienKhoaBo(khoa: string): Prisma.OkrObjectiveWhereInput {
	if (khoa === "goc") return { level: "onehub" };
	const [loai, id] = khoa.split(":");
	if (loai === "bp" && id) return { level: "bo-phan", divisionId: id };
	if (loai === "pb" && id) return { level: "phong-ban", departmentId: id };
	return KHONG_DONG;
}

function dieuKienToiDan(dan: DanDonVi): Prisma.OkrObjectiveWhereInput {
	const hoac: Prisma.OkrObjectiveWhereInput[] = [];
	if (dan.boPhan.size > 0)
		hoac.push({ level: "bo-phan", divisionId: { in: [...dan.boPhan] } });
	if (dan.phongBan.size > 0)
		hoac.push({ level: "phong-ban", departmentId: { in: [...dan.phongBan] } });
	return hoac.length > 0 ? { OR: hoac } : KHONG_DONG;
}

function dieuKienTheoDoi(
	theoDoi: ReadonlySet<string>,
): Prisma.OkrObjectiveWhereInput {
	const hoac = [...theoDoi].map(dieuKienKhoaBo);
	return hoac.length > 0 ? { OR: hoac } : KHONG_DONG;
}

export function dieuKienPhamVi(
	phamVi: PhamViBo,
	dan: DanDonVi,
	theoDoi: ReadonlySet<string>,
): Prisma.OkrObjectiveWhereInput {
	if (phamVi === "toi-dan") return dieuKienToiDan(dan);
	if (phamVi === "theo-doi") return dieuKienTheoDoi(theoDoi);
	return {};
}

export function traLoiTu<T extends { createdAt: Date }>(
	binhLuan: readonly T[],
	luc: Date,
): T[] {
	return binhLuan
		.filter((b) => b.createdAt.getTime() >= luc.getTime())
		.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

export function nguoiDuocNhac(
	nguoiCapNhat: string,
	nguoiXem: string,
	thanhVien: ReadonlySet<string>,
): string | null {
	if (nguoiCapNhat === nguoiXem) return null;
	return thanhVien.has(nguoiCapNhat) ? nguoiCapNhat : null;
}
