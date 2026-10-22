import { BLOB_TEP_TRUONG, type KhoTepTruong } from "./blob-tep-truong";
import type { Prisma } from "./generated/prisma/client";

type ChoXoaClient = {
	blobChoXoa: Prisma.TransactionClient["blobChoXoa"];
	fieldFile: Prisma.TransactionClient["fieldFile"];
};

export type HangChoXoa = {
	pathname: string;
	xoaSau: Date;
	fieldId?: string | null;
	banGhiId?: string | null;
	userId?: string | null;
};

export async function ghiChoXoa(
	tx: ChoXoaClient,
	hang: HangChoXoa[],
): Promise<void> {
	for (const dong of hang) {
		await tx.blobChoXoa.upsert({
			where: { pathname: dong.pathname },
			create: {
				pathname: dong.pathname,
				kho: BLOB_TEP_TRUONG.ten,
				xoaSau: dong.xoaSau,
				fieldId: dong.fieldId ?? null,
				banGhiId: dong.banGhiId ?? null,
				userId: dong.userId ?? null,
			},
			update: { xoaSau: dong.xoaSau },
		});
	}
}

export async function goChoXoa(
	tx: ChoXoaClient,
	pathname: string,
): Promise<void> {
	await tx.blobChoXoa.deleteMany({ where: { pathname } });
}

export async function ghiChoXoaTheoTep(
	tx: ChoXoaClient,
	where: Prisma.FieldFileWhereInput,
	bayGio: Date = new Date(),
): Promise<string[]> {
	const tep = await tx.fieldFile.findMany({
		where,
		select: { blobPathname: true },
	});
	const pathnames = tep.map((dong) => dong.blobPathname);
	await ghiChoXoa(
		tx,
		pathnames.map((pathname) => ({ pathname, xoaSau: bayGio })),
	);
	return pathnames;
}

export type KetQuaDon = { daXoa: string[]; hong: string[] };

export async function donChoXoa(
	db: Pick<ChoXoaClient, "blobChoXoa">,
	kho: Pick<KhoTepTruong, "xoa">,
	opts: { bayGio?: Date; toiDa: number; pathnames?: string[] },
): Promise<KetQuaDon> {
	const bayGio = opts.bayGio ?? new Date();
	const hang = await db.blobChoXoa.findMany({
		where: {
			kho: BLOB_TEP_TRUONG.ten,
			xoaSau: { lte: bayGio },
			pathname: opts.pathnames ? { in: opts.pathnames } : undefined,
		},
		orderBy: { xoaSau: "asc" },
		take: opts.toiDa,
		select: { pathname: true },
	});
	const ket: KetQuaDon = { daXoa: [], hong: [] };

	for (const { pathname } of hang) {
		try {
			await kho.xoa(pathname);
			await db.blobChoXoa.deleteMany({ where: { pathname } });
			ket.daXoa.push(pathname);
		} catch {
			await db.blobChoXoa
				.updateMany({ where: { pathname }, data: { lanThu: { increment: 1 } } })
				.catch(() => undefined);
			ket.hong.push(pathname);
		}
	}

	return ket;
}
