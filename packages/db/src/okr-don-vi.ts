import type { Db } from "./client";
import type { Prisma } from "./generated/prisma/client";

type DbHoacTx = Db | Prisma.TransactionClient;

export const PHA_CHUYEN_DUOC = [
	"lap-ke-hoach",
	"dang-chay",
	"cham-diem",
] as const;

const DA_BO = "da-bo";

export type DonViDem = { departmentId?: string; divisionId?: string };

export type DemOkrDonVi = { mo: number; lichSu: number };

export async function demOkrCuaDonVi(
	db: DbHoacTx,
	dv: DonViDem,
): Promise<DemOkrDonVi> {
	const donVi: Prisma.OkrObjectiveWhereInput[] = [
		...(dv.departmentId === undefined
			? []
			: [{ departmentId: dv.departmentId }]),
		...(dv.divisionId === undefined ? [] : [{ divisionId: dv.divisionId }]),
	];
	if (donVi.length === 0) return { mo: 0, lichSu: 0 };
	const cua: Prisma.OkrObjectiveWhereInput = { OR: donVi };
	const [mo, lichSu] = await Promise.all([
		db.okrObjective.count({
			where: {
				AND: [
					cua,
					{
						status: { not: DA_BO },
						cycle: { phase: { in: [...PHA_CHUYEN_DUOC] } },
					},
				],
			},
		}),
		db.okrObjective.count({ where: cua }),
	]);
	return { mo, lichSu };
}
