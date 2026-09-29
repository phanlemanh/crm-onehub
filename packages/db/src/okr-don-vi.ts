import type { Db } from "./client";
import type { Prisma } from "./generated/prisma/client";

type DbHoacTx = Db | Prisma.TransactionClient;

export const PHA_CHUYEN_DUOC = [
	"lap-ke-hoach",
	"dang-chay",
	"cham-diem",
] as const;

const DA_BO = "da-bo";

export const dieuKienOkrMo: Prisma.OkrObjectiveWhereInput = {
	status: { not: DA_BO },
	cycle: { phase: { in: [...PHA_CHUYEN_DUOC] } },
};

export type DonViDem = { departmentId?: string; divisionId?: string };

export type DemOkrDonVi = { mo: number; lichSu: number };

export type OkrTheoDonVi = {
	phongBan: ReadonlyMap<string, DemOkrDonVi>;
	boPhan: ReadonlyMap<string, DemOkrDonVi>;
};

export const KHONG_OKR: DemOkrDonVi = { mo: 0, lichSu: 0 };

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
	if (donVi.length === 0) return KHONG_OKR;
	const cua: Prisma.OkrObjectiveWhereInput = { OR: donVi };
	const mo = await db.okrObjective.count({
		where: { AND: [cua, dieuKienOkrMo] },
	});
	const lichSu = await db.okrObjective.count({ where: cua });
	return { mo, lichSu };
}

type NhomDonVi = {
	departmentId: string | null;
	divisionId: string | null;
	_count: { _all: number };
};

function cong(
	banDo: Map<string, DemOkrDonVi>,
	id: string | null,
	khoa: keyof DemOkrDonVi,
	so: number,
) {
	if (id === null) return;
	const cu = banDo.get(id) ?? KHONG_OKR;
	banDo.set(id, { ...cu, [khoa]: cu[khoa] + so });
}

export async function demOkrTheoDonVi(db: DbHoacTx): Promise<OkrTheoDonVi> {
	const coDonVi: Prisma.OkrObjectiveWhereInput = {
		OR: [{ departmentId: { not: null } }, { divisionId: { not: null } }],
	};
	const [mo, lichSu]: [NhomDonVi[], NhomDonVi[]] = await Promise.all([
		db.okrObjective.groupBy({
			by: ["departmentId", "divisionId"],
			where: { AND: [coDonVi, dieuKienOkrMo] },
			_count: { _all: true },
		}),
		db.okrObjective.groupBy({
			by: ["departmentId", "divisionId"],
			where: coDonVi,
			_count: { _all: true },
		}),
	]);
	const phongBan = new Map<string, DemOkrDonVi>();
	const boPhan = new Map<string, DemOkrDonVi>();
	for (const [khoa, nhom] of [
		["mo", mo],
		["lichSu", lichSu],
	] as const)
		for (const n of nhom) {
			cong(phongBan, n.departmentId, khoa, n._count._all);
			cong(boPhan, n.divisionId, khoa, n._count._all);
		}
	return { phongBan, boPhan };
}
