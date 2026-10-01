import type { Db } from "./client";
import type { Prisma } from "./generated/prisma/client";

type DbHoacTx = Db | Prisma.TransactionClient;

export const KY_CON_HIEN = {
	anLuc: null,
} as const satisfies Prisma.OkrCycleWhereInput;

export const QUAN_HE_GIU_CHU_KY = [
	"objectives",
	"children",
	"cuaSoRa",
	"diemKr",
	"mangSangToi",
	"hoiY",
] as const;

type QuanHeNhieu = Exclude<(typeof QUAN_HE_GIU_CHU_KY)[number], "hoiY">;

const DEM_QUAN_HE_NHIEU = Object.fromEntries(
	QUAN_HE_GIU_CHU_KY.filter((q): q is QuanHeNhieu => q !== "hoiY").map((q) => [
		q,
		true,
	]),
) as Record<QuanHeNhieu, true>;

export type TinhTrangGiu = { trong: boolean; quyConHien: number };

export async function tinhTrangGiu(
	tx: DbHoacTx,
	ids: string[],
): Promise<Map<string, TinhTrangGiu>> {
	const ra = new Map<string, TinhTrangGiu>();
	if (ids.length === 0) return ra;
	const [dong, conHien] = await Promise.all([
		tx.okrCycle.findMany({
			where: { id: { in: ids } },
			select: {
				id: true,
				_count: { select: DEM_QUAN_HE_NHIEU },
				hoiY: { select: { id: true } },
			},
		}),
		tx.okrCycle.groupBy({
			by: ["parentId"],
			where: { parentId: { in: ids }, ...KY_CON_HIEN },
			_count: { _all: true },
		}),
	]);
	const demCon = new Map(
		conHien.flatMap((g) =>
			g.parentId === null ? [] : [[g.parentId, g._count._all] as const],
		),
	);
	for (const k of dong) {
		const trong = QUAN_HE_GIU_CHU_KY.every((q) =>
			q === "hoiY" ? k.hoiY === null : k._count[q] === 0,
		);
		ra.set(k.id, { trong, quyConHien: demCon.get(k.id) ?? 0 });
	}
	return ra;
}
