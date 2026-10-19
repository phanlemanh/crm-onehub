import "@crm/env/load";
import type { Prisma } from "../src/generated/prisma/client";
import { parseVetViec } from "../src/viec";
import { LOAI_VET_NHAC_VIEC, maViecNhac } from "../src/viec-nhac";

const LENH = "viec:dem-rieng";

type KhoGiaoDich = {
	$transaction<T>(
		than: (tx: Prisma.TransactionClient) => Promise<T>,
	): Promise<T>;
};

export type SoViecRieng = {
	viecDuAnKhongGan: number;
	vetNhacViecRieng: number;
	viecRiengBiNhac: number;
};

export function giaoDichChiDoc<T>(
	kho: KhoGiaoDich,
	than: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
	return kho.$transaction(async (tx) => {
		await tx.$executeRaw`SET TRANSACTION READ ONLY`;
		return than(tx);
	});
}

export async function demViecRieng(
	tx: Prisma.TransactionClient,
): Promise<SoViecRieng> {
	const viecDuAnKhongGan = await tx.viec.count({
		where: { duAnId: { not: null }, gan: { none: {} } },
	});
	const rieng = new Set(
		(
			await tx.viec.findMany({
				where: { duAnId: null, gan: { none: {} } },
				select: { id: true },
			})
		).map((v) => v.id),
	);
	const hang = await tx.viecVet.findMany({
		where: {
			loai: { in: [...LOAI_VET_NHAC_VIEC] },
			viec: { OR: [{ duAnId: { not: null } }, { gan: { some: {} } }] },
		},
		select: { id: true, loai: true, truoc: true, sau: true },
	});
	const biNhac = new Set<string>();
	let vetNhacViecRieng = 0;
	for (const h of hang) {
		const nhac = maViecNhac(parseVetViec(h)).filter((id) => rieng.has(id));
		if (nhac.length === 0) continue;
		vetNhacViecRieng++;
		for (const id of nhac) biNhac.add(id);
	}
	return {
		viecDuAnKhongGan,
		vetNhacViecRieng,
		viecRiengBiNhac: biNhac.size,
	};
}

if (import.meta.main) {
	if (!process.env.DATABASE_URL) {
		console.error(
			`${LENH}: thiếu DATABASE_URL — đặt biến này trỏ vào cơ sở dữ liệu cần đếm.`,
		);
		process.exit(2);
	}
	const { db } = await import("../src/client");
	try {
		console.log(JSON.stringify(await giaoDichChiDoc(db, demViecRieng)));
	} catch (loi) {
		console.error(
			`${LENH}: ${loi instanceof Error ? loi.message : String(loi)}`,
		);
		process.exitCode = 1;
	} finally {
		await db.$disconnect();
	}
}
