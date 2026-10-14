import { Prisma } from "./generated/prisma/client";

export type SuKienDeXuat = "TAO" | "DE_XUAT";

export type DeXuatMoi = {
	trangId: string;
	banGocId: string | null;
	ten: string;
	noiDung: string;
	taoBoiId: string;
	suKien: SuKienDeXuat;
	nguonId?: string | null;
	trichDoan?: Prisma.InputJsonValue | null;
	loai?: "NOI_DUNG" | "LUU_TRU" | "KHOI_PHUC";
	tuPhienBanSo?: number | null;
	lyDoDeXuat?: string | null;
};

function kiemNfc(nhan: string, giaTri: string): void {
	if (giaTri !== giaTri.normalize("NFC")) {
		throw new Error(`${nhan} khong NFC`);
	}
}

export async function taoDeXuatTaiLieu(
	tx: Prisma.TransactionClient,
	moi: DeXuatMoi,
): Promise<{ deXuatId: string }> {
	kiemNfc("ten", moi.ten);
	kiemNfc("noi dung", moi.noiDung);
	const deXuat = await tx.taiLieuDeXuat.create({
		data: {
			trangId: moi.trangId,
			banGocId: moi.banGocId,
			ten: moi.ten,
			noiDung: moi.noiDung,
			taoBoiId: moi.taoBoiId,
			nguonId: moi.nguonId ?? null,
			trichDoan: moi.trichDoan ?? Prisma.DbNull,
			loai: moi.loai ?? "NOI_DUNG",
			tuPhienBanSo: moi.tuPhienBanSo ?? null,
			lyDoDeXuat: moi.lyDoDeXuat ?? null,
		},
		select: { id: true },
	});
	await tx.taiLieuSuKien.create({
		data: {
			trangId: moi.trangId,
			aiId: moi.taoBoiId,
			loai: moi.suKien,
			chiTiet: { loai: moi.suKien, deXuatId: deXuat.id },
		},
	});
	return { deXuatId: deXuat.id };
}
