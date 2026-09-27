import type { Db, Prisma } from "@crm/db";
import { ngayVN } from "@crm/db/onboarding-nhac";

export type CuaSoRa = { id: string; tuNgay: string; denNgay: string };

export const ngayLuu = (s: string) => new Date(`${s}T00:00:00Z`);

export function hieuLucHomNay(homNay: string) {
	return {
		dongLuc: null,
		tuNgay: { lte: ngayLuu(homNay) },
		denNgay: { gte: ngayLuu(homNay) },
	} satisfies Prisma.OkrCuaSoRaWhereInput;
}

export function cuaSoRaRa(r: {
	id: string;
	tuNgay: Date;
	denNgay: Date;
}): CuaSoRa {
	return { id: r.id, tuNgay: ngayVN(r.tuNgay), denNgay: ngayVN(r.denNgay) };
}

export async function cuaSoHieuLuc(
	tx: Prisma.TransactionClient | Db,
	cycleId: string,
	homNay: string,
): Promise<CuaSoRa | null> {
	const r = await tx.okrCuaSoRa.findFirst({
		where: { cycleId, ...hieuLucHomNay(homNay) },
		orderBy: { tuNgay: "desc" },
	});
	return r ? cuaSoRaRa(r) : null;
}
