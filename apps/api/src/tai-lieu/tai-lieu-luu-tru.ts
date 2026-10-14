import type { Prisma } from "@crm/db";
import { ghiSuKien } from "./su-kien";
import { TAI_LIEU_API } from "./tai-lieu-config";

type Tx = Prisma.TransactionClient;

export type DuyetTrang = { trangId: string; deXuatId: string; nguoiId: string };

export async function datLuuTru(
	tx: Tx,
	trangId: string,
	luc: Date,
): Promise<void> {
	await tx.taiLieuTrang.updateMany({
		where: { id: trangId, archivedAt: null },
		data: { archivedAt: luc },
	});
}

async function danhDauDaDuyet(tx: Tx, v: DuyetTrang, luc: Date): Promise<void> {
	await tx.taiLieuDeXuat.update({
		where: { id: v.deXuatId },
		data: { trangThai: "DA_DUYET", xuLyBoiId: v.nguoiId, xuLyLuc: luc },
	});
}

export async function duyetLuuTru(tx: Tx, v: DuyetTrang): Promise<void> {
	const luc = new Date();
	await datLuuTru(tx, v.trangId, luc);
	await danhDauDaDuyet(tx, v, luc);
	const conCho = await tx.taiLieuDeXuat.findMany({
		where: { trangId: v.trangId, trangThai: "CHO_DUYET", loai: "NOI_DUNG" },
		select: { id: true },
		orderBy: { createdAt: "asc" },
	});
	await tx.taiLieuDeXuat.updateMany({
		where: { id: { in: conCho.map((c) => c.id) } },
		data: { trangThai: "CU", xuLyLuc: luc },
	});
	await ghiSuKien(tx, v.trangId, v.nguoiId, {
		loai: "LUU_TRU",
		deXuatId: v.deXuatId,
	});
	for (const c of conCho)
		await ghiSuKien(tx, v.trangId, v.nguoiId, {
			loai: "CU",
			deXuatId: c.id,
			vi: TAI_LIEU_API.suKienCuLuuTru,
		});
}

export async function duyetKhoiPhuc(tx: Tx, v: DuyetTrang): Promise<void> {
	const luc = new Date();
	await tx.taiLieuTrang.update({
		where: { id: v.trangId },
		data: { archivedAt: null },
	});
	await danhDauDaDuyet(tx, v, luc);
	await ghiSuKien(tx, v.trangId, v.nguoiId, {
		loai: "KHOI_PHUC",
		deXuatId: v.deXuatId,
	});
}
