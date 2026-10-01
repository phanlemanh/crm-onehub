import type { Db } from "./client";
import type { Prisma } from "./generated/prisma/client";
import { WORKSPACE_ID } from "./workspace";

type DbHoacTx = Db | Prisma.TransactionClient;

export type NguCanhXem = {
	userId: string;
	quanTri: boolean;
	boPhanTruong: string[];
	phongBanTruong: string[];
	phongBanDuoiBoPhanTruong: string[];
	nguoiDuoiQuyen: string[];
};

export type NenNguCanh = {
	quanTri: boolean;
	truongBoPhan: ReadonlySet<string>;
	truongPhongBan: ReadonlySet<string>;
	boPhanCua: ReadonlyMap<string, string | null>;
	phongBanChinh: ReadonlyMap<string, string | null>;
};

export const VAI_QUAN_TRI_OKR: ReadonlySet<string> = new Set([
	"owner",
	"admin",
]);

export function dungNguCanhXem(userId: string, nen: NenNguCanh): NguCanhXem {
	const duoiBoPhanTruong = (pb: string) => {
		const bp = nen.boPhanCua.get(pb) ?? null;
		return bp !== null && nen.truongBoPhan.has(bp);
	};
	return {
		userId,
		quanTri: nen.quanTri,
		boPhanTruong: [...nen.truongBoPhan].sort(),
		phongBanTruong: [...nen.truongPhongBan].sort(),
		phongBanDuoiBoPhanTruong: [...nen.boPhanCua.keys()]
			.filter(duoiBoPhanTruong)
			.sort(),
		nguoiDuoiQuyen: [...nen.phongBanChinh]
			.filter(
				([, pb]) =>
					pb !== null && (nen.truongPhongBan.has(pb) || duoiBoPhanTruong(pb)),
			)
			.map(([u]) => u)
			.sort(),
	};
}

export const boGioiHan: Prisma.OkrObjectiveWhereInput = {
	hienThi: "cong-khai",
};

export function dieuKienXemMucTieu(
	nc: NguCanhXem,
): Prisma.OkrObjectiveWhereInput {
	if (nc.quanTri) return {};
	const { userId } = nc;
	return {
		OR: [
			boGioiHan,
			{ ownerUserId: userId },
			{ personUserId: userId },
			{ participants: { some: { userId } } },
			{ keyResults: { some: { ownerUserId: userId } } },
			{
				keyResults: {
					some: { viecKr: { some: { nguoiLamUserId: userId } } },
				},
			},
			{ nguoiXem: { some: { userId } } },
			{ level: "bo-phan", divisionId: { in: nc.boPhanTruong } },
			{
				level: "phong-ban",
				departmentId: {
					in: [...nc.phongBanTruong, ...nc.phongBanDuoiBoPhanTruong],
				},
			},
			{ level: "ca-nhan", personUserId: { in: nc.nguoiDuoiQuyen } },
		],
	};
}

function nhomTheo<K, V>(cap: [K, V][]): Map<K, Set<V>> {
	const ra = new Map<K, Set<V>>();
	for (const [k, v] of cap) ra.set(k, (ra.get(k) ?? new Set()).add(v));
	return ra;
}

export type CayOkr = {
	vai: ReadonlyMap<string, string>;
	truongCuaPhongBan: ReadonlyMap<string, string>;
	truongCuaBoPhan: ReadonlyMap<string, string>;
	boPhanCua: ReadonlyMap<string, string | null>;
	phongBanChinh: ReadonlyMap<string, string | null>;
};

export async function docCayOkr(db: DbHoacTx): Promise<CayOkr> {
	const [thanhVien, boPhan, phongBan, viTri, phu] = await Promise.all([
		db.member.findMany({
			where: { organizationId: WORKSPACE_ID },
			select: { userId: true, role: true },
		}),
		db.division.findMany({
			where: { archivedAt: null },
			select: { id: true, headUserId: true },
		}),
		db.department.findMany({
			where: { archivedAt: null },
			select: { id: true, divisionId: true, headUserId: true },
		}),
		db.orgPlacement.findMany({
			where: { primaryDepartmentId: { not: null } },
			select: { userId: true, primaryDepartmentId: true },
		}),
		db.orgSecondaryDepartment.findMany({
			select: { userId: true, departmentId: true },
		}),
	]);
	const vai = new Map(thanhVien.map((m) => [m.userId, m.role]));
	const chinh = new Map(viTri.map((p) => [p.userId, p.primaryDepartmentId]));
	const phuCua = nhomTheo(
		phu.map((s): [string, string] => [s.userId, s.departmentId]),
	);
	const thuoc = (userId: string, pb: string) =>
		chinh.get(userId) === pb || (phuCua.get(userId)?.has(pb) ?? false);
	return {
		vai,
		truongCuaPhongBan: new Map(
			phongBan.flatMap((p): [string, string][] =>
				p.headUserId !== null &&
				vai.has(p.headUserId) &&
				thuoc(p.headUserId, p.id)
					? [[p.id, p.headUserId]]
					: [],
			),
		),
		truongCuaBoPhan: new Map(
			boPhan.flatMap((b): [string, string][] =>
				b.headUserId !== null && vai.has(b.headUserId)
					? [[b.id, b.headUserId]]
					: [],
			),
		),
		boPhanCua: new Map(phongBan.map((p) => [p.id, p.divisionId])),
		phongBanChinh: new Map(
			thanhVien.map((m) => [m.userId, chinh.get(m.userId) ?? null]),
		),
	};
}

export async function nguCanhXemOkr(
	db: DbHoacTx,
	userIds: string[],
): Promise<Map<string, NguCanhXem>> {
	const cay = await docCayOkr(db);
	const theoTruong = (m: ReadonlyMap<string, string>) =>
		nhomTheo([...m].map(([dv, truong]): [string, string] => [truong, dv]));
	const truongPhongBan = theoTruong(cay.truongCuaPhongBan);
	const truongBoPhan = theoTruong(cay.truongCuaBoPhan);
	const rong = new Set<string>();
	return new Map(
		userIds.map((userId) => [
			userId,
			dungNguCanhXem(userId, {
				quanTri: VAI_QUAN_TRI_OKR.has(cay.vai.get(userId) ?? ""),
				truongBoPhan: truongBoPhan.get(userId) ?? rong,
				truongPhongBan: truongPhongBan.get(userId) ?? rong,
				boPhanCua: cay.boPhanCua,
				phongBanChinh: cay.phongBanChinh,
			}),
		]),
	);
}
