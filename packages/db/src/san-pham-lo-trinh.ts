import type { Db } from "./client";
import type { Prisma } from "./generated/prisma/client";
import {
	LO_TRINH_SAN_PHAM,
	TRANG_THAI_LAY,
	type TrangThaiLay,
} from "./san-pham-lo-trinh-danh-muc";

type DbHoacTx = Db | Prisma.TransactionClient;

export type KhaiSanPham = {
	ten: string;
	kho: string;
	nhanh: string;
	duongTep: string;
};

export type VaiXem = "owner" | "admin" | "member" | "okr" | null;

export type SanPhamThay = {
	ma: string;
	ten: string;
	kho: string;
	nhanh: string;
	duongTep: string;
	trangThaiLay: TrangThaiLay;
	nguonDoiLuc: Date | null;
};

export type KetQuaLay = {
	trangThai: TrangThaiLay;
	chiTiet?: string | null;
	kiemLuc: Date;
	caiLuc?: Date | null;
	phienBanKhuon?: number | null;
};

const CHON_THAY = {
	ma: true,
	ten: true,
	kho: true,
	nhanh: true,
	duongTep: true,
	trangThaiLay: true,
	nguonDoiLuc: true,
} as const;

function trangThai(gt: string): TrangThaiLay {
	return TRANG_THAI_LAY.find((t) => t === gt) ?? TRANG_THAI_LAY[0];
}

function thay<T extends { trangThaiLay: string }>(
	h: T,
): Omit<T, "trangThaiLay"> & { trangThaiLay: TrangThaiLay } {
	return { ...h, trangThaiLay: trangThai(h.trangThaiLay) };
}

export function laQuanTri(vai: VaiXem): boolean {
	return vai === "owner" || vai === "admin";
}

export async function taoSanPham(
	db: DbHoacTx,
	vao: KhaiSanPham & { ma: string; taoBoiId: string },
) {
	return db.sanPhamLoTrinh.create({ data: vao });
}

export async function timSanPham(db: DbHoacTx, ma: string) {
	return db.sanPhamLoTrinh.findUnique({ where: { ma } });
}

export async function suaSanPham(
	db: Db,
	ma: string,
	vao: Partial<KhaiSanPham>,
	now: Date,
): Promise<{ nguonDoi: boolean }> {
	return db.$transaction(async (tx) => {
		const cu = await tx.sanPhamLoTrinh.findUniqueOrThrow({ where: { ma } });
		const nguonDoi =
			(vao.kho !== undefined && vao.kho !== cu.kho) ||
			(vao.nhanh !== undefined && vao.nhanh !== cu.nhanh) ||
			(vao.duongTep !== undefined && vao.duongTep !== cu.duongTep);
		await tx.sanPhamLoTrinh.update({
			where: { ma },
			data: nguonDoi
				? {
						...vao,
						nguonDoiLuc: now,
						trangThaiLay: TRANG_THAI_LAY[0],
						chiTietLay: null,
						kiemLuc: null,
					}
				: vao,
		});
		return { nguonDoi };
	});
}

export async function datNguoiXem(db: Db, ma: string, userIds: string[]) {
	const duyNhat = [...new Set(userIds)];
	await db.$transaction([
		db.sanPhamNguoiXem.deleteMany({
			where: { sanPhamMa: ma, userId: { notIn: duyNhat } },
		}),
		db.sanPhamNguoiXem.createMany({
			data: duyNhat.map((userId) => ({ sanPhamMa: ma, userId })),
			skipDuplicates: true,
		}),
	]);
}

export async function nguoiXemCua(db: DbHoacTx, ma: string): Promise<string[]> {
	const ds = await db.sanPhamNguoiXem.findMany({
		where: { sanPhamMa: ma },
		select: { userId: true },
	});
	return ds.map((d) => d.userId);
}

export async function sanPhamXemDuoc(
	db: DbHoacTx,
	ai: { userId: string; vai: VaiXem },
): Promise<SanPhamThay[]> {
	if (ai.vai === null) return [];
	const ds = await db.sanPhamLoTrinh.findMany({
		where: {
			luuTruLuc: null,
			nguoiXem: laQuanTri(ai.vai) ? undefined : { some: { userId: ai.userId } },
		},
		select: CHON_THAY,
		orderBy: { taoLuc: "asc" },
	});
	return ds.map(thay);
}

export async function danhBaSanPham(db: DbHoacTx, loc: { daLuuTru: boolean }) {
	const ds = await db.sanPhamLoTrinh.findMany({
		where: { luuTruLuc: loc.daLuuTru ? { not: null } : null },
		orderBy: { taoLuc: "asc" },
	});
	return ds.map(thay);
}

export async function luuTruSanPham(db: DbHoacTx, ma: string, now: Date) {
	await db.sanPhamLoTrinh.updateMany({
		where: { ma, luuTruLuc: null },
		data: { luuTruLuc: now },
	});
}

export async function khoiPhucSanPham(db: DbHoacTx, ma: string) {
	const doi = await db.sanPhamLoTrinh.updateMany({
		where: { ma, luuTruLuc: { not: null } },
		data: { luuTruLuc: null },
	});
	return doi.count === 1;
}

export async function xoaSanPham(db: Db, ma: string): Promise<boolean> {
	return db.$transaction(async (tx) => {
		const xoa = await tx.sanPhamLoTrinh.deleteMany({
			where: { ma, layDauLuc: null },
		});
		if (xoa.count === 1)
			await tx.banChupLoTrinh.deleteMany({ where: { nguon: ma } });
		return xoa.count === 1;
	});
}

export async function xoaVinhVienSanPham(db: Db, ma: string): Promise<boolean> {
	return db.$transaction(async (tx) => {
		const xoa = await tx.sanPhamLoTrinh.deleteMany({
			where: { ma, luuTruLuc: { not: null } },
		});
		if (xoa.count === 1)
			await tx.banChupLoTrinh.deleteMany({ where: { nguon: ma } });
		return xoa.count === 1;
	});
}

export async function sanPhamDenHan(
	db: DbHoacTx,
	now: Date,
	loc: { tienTo?: string } = {},
) {
	const moc = new Date(now.getTime() - LO_TRINH_SAN_PHAM.nhipKiemMs);
	const ds = await db.sanPhamLoTrinh.findMany({
		where: {
			luuTruLuc: null,
			ma: loc.tienTo ? { startsWith: loc.tienTo } : undefined,
			OR: [{ kiemLuc: null }, { kiemLuc: { lte: moc } }],
		},
		orderBy: [{ kiemLuc: { sort: "asc", nulls: "first" } }, { taoLuc: "asc" }],
		take: LO_TRINH_SAN_PHAM.toiDaMoiNhip,
		select: CHON_THAY,
	});
	return ds.map(thay);
}

export async function ghiKetQuaLay(db: DbHoacTx, ma: string, kq: KetQuaLay) {
	const daLay = kq.trangThai === "da-lay";
	await db.sanPhamLoTrinh.updateMany({
		where: { ma },
		data: {
			trangThaiLay: kq.trangThai,
			chiTietLay: kq.chiTiet ?? null,
			kiemLuc: kq.kiemLuc,
			caiLuc: kq.caiLuc ?? undefined,
			phienBanKhuon: kq.phienBanKhuon ?? undefined,
			nguonDoiLuc: daLay ? null : undefined,
		},
	});
	if (daLay)
		await db.sanPhamLoTrinh.updateMany({
			where: { ma, layDauLuc: null },
			data: { layDauLuc: kq.kiemLuc },
		});
}
