import type { Db } from "./client";
import type { Prisma } from "./generated/prisma/client";
import { dieuKienXemMucTieu, type NguCanhXem } from "./okr-hien-thi";

type DbHoacTx = Db | Prisma.TransactionClient;

export type MucTomTat<L extends string> = {
	loai: L;
	so: number;
	cuaToi: boolean;
	nguoi: { id: string; name: string }[];
};

type Hang = {
	userId: string;
	loai: string;
	nguoi: { id: string; name: string };
};

export type CachGom<L extends string> = {
	thuTu: readonly L[];
	docLoai: (loai: string) => L;
	tenToiDa: number;
	nguoiXemId: string;
};

export function gomTomTat<L extends string>(
	hang: readonly Hang[],
	cach: CachGom<L>,
): MucTomTat<L>[] {
	const daDoc = hang.map((h) => ({ ...h, loai: cach.docLoai(h.loai) }));
	return cach.thuTu.flatMap((loai) => {
		const cua = daDoc.filter((h) => h.loai === loai);
		if (cua.length === 0) return [];
		return [
			{
				loai,
				so: cua.length,
				cuaToi: cua.some((h) => h.userId === cach.nguoiXemId),
				nguoi: cua.slice(0, cach.tenToiDa).map((h) => h.nguoi),
			},
		];
	});
}

export async function tomTatCamXucCua<L extends string>(
	db: DbHoacTx,
	checkInIds: readonly string[],
	nc: NguCanhXem,
	cach: CachGom<L>,
): Promise<Map<string, MucTomTat<L>[]>> {
	const ids = [...new Set(checkInIds)];
	const kq = new Map<string, MucTomTat<L>[]>(ids.map((id) => [id, []]));
	if (ids.length === 0) return kq;
	const hang = await db.okrCamXuc.findMany({
		where: {
			checkInId: { in: ids },
			checkIn: { keyResult: { objective: dieuKienXemMucTieu(nc) } },
		},
		orderBy: [{ createdAt: "asc" }, { id: "asc" }],
		select: {
			checkInId: true,
			userId: true,
			loai: true,
			nguoi: { select: { id: true, name: true } },
		},
	});
	const theoLan = new Map<string, Hang[]>();
	for (const h of hang) {
		const ds = theoLan.get(h.checkInId) ?? [];
		ds.push(h);
		theoLan.set(h.checkInId, ds);
	}
	for (const [id, ds] of theoLan) kq.set(id, gomTomTat(ds, cach));
	return kq;
}
