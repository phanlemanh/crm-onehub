import type { Prisma } from "@crm/db";
import { LoiBoMau, OKR_MAU } from "./cau-hinh";

type Tx = Prisma.TransactionClient;

async function viecCuaMau(tx: Tx, U: string[]): Promise<string[]> {
	const ds = await tx.viec.findMany({
		where: { taoBoiId: { in: U } },
		select: { id: true },
	});
	return ds.map((v) => v.id);
}

const dong = (ten: string, n: number): string => `${ten} (${n})`;

export async function chanKeoNgoai(tx: Tx, U: string[]): Promise<void> {
	const V = await viecCuaMau(tx, U);
	if (V.length === 0) return;
	const [con, phuThuocNgoai, truoc, sau] = await Promise.all([
		tx.viec.count({ where: { chaId: { in: V }, taoBoiId: { notIn: U } } }),
		tx.viecPhuThuoc.count({
			where: {
				OR: [{ truocId: { in: V } }, { sauId: { in: V } }],
				taoBoiId: { notIn: U },
			},
		}),
		tx.viecPhuThuoc.count({
			where: { truocId: { in: V }, sauId: { notIn: V } },
		}),
		tx.viecPhuThuoc.count({
			where: { sauId: { in: V }, truocId: { notIn: V } },
		}),
	]);
	const giu = [
		con > 0 ? dong("viec.chaId", con) : null,
		phuThuocNgoai > 0 ? dong("viecPhuThuoc.taoBoiId", phuThuocNgoai) : null,
		truoc > 0 ? dong("viecPhuThuoc.truocId", truoc) : null,
		sau > 0 ? dong("viecPhuThuoc.sauId", sau) : null,
	].filter((x): x is string => x !== null);
	if (giu.length > 0)
		throw new LoiBoMau(OKR_MAU.ma.dangGiu, OKR_MAU.thongDiep.dangGiu(giu));
}

export async function xoaViecVaTinHieu(
	tx: Tx,
	U: string[],
): Promise<{ viec: number; tinHieu: number }> {
	const V = await viecCuaMau(tx, U);
	const viec = await tx.viec.deleteMany({ where: { id: { in: V } } });
	const tinHieu = await tx.tinHieu.deleteMany({
		where: { nguoiGuiId: { in: U } },
	});
	return { viec: viec.count, tinHieu: tinHieu.count };
}

function khoaChan(tx: Tx): Promise<{ bang: string; cot: string }[]> {
	return tx.$queryRaw<{ bang: string; cot: string }[]>`
		SELECT cl.relname AS bang, a.attname AS cot
		FROM pg_constraint con
		JOIN pg_class cl ON cl.oid = con.conrelid
		JOIN pg_class rf ON rf.oid = con.confrelid
		JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = ANY(con.conkey)
		WHERE con.contype = 'f' AND rf.relname = 'user' AND con.confdeltype IN ('r', 'a')
		ORDER BY cl.relname, a.attname`;
}

export async function khoaConGiu(tx: Tx, U: string[]): Promise<string[]> {
	if (U.length === 0) return [];
	const ra: string[] = [];
	for (const { bang, cot } of await khoaChan(tx)) {
		const rows = await tx.$queryRawUnsafe<{ n: bigint }[]>(
			`SELECT count(*) AS n FROM "${bang}" WHERE "${cot}" = ANY($1::text[])`,
			U,
		);
		const n = Number(rows[0]?.n ?? 0);
		if (n > 0) ra.push(dong(`${bang}.${cot}`, n));
	}
	return ra.sort();
}
