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

export async function nguCanhXemOkr(
	db: DbHoacTx,
	userIds: string[],
): Promise<Map<string, NguCanhXem>> {
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
			where: { department: { archivedAt: null } },
			select: { userId: true, departmentId: true },
		}),
	]);
	const vai = new Map(thanhVien.map((m) => [m.userId, m.role]));
	const boPhanSong = new Set(boPhan.map((b) => b.id));
	const phongBanSong = new Set(phongBan.map((p) => p.id));
	const chinh = new Map(
		viTri.flatMap((p) =>
			vai.has(p.userId) && p.primaryDepartmentId !== null
				? [[p.userId, p.primaryDepartmentId] as const]
				: [],
		),
	);
	const phuCua = nhomTheo(
		phu.flatMap((s): [string, string][] =>
			vai.has(s.userId) ? [[s.userId, s.departmentId]] : [],
		),
	);
	const thuoc = (userId: string, pb: string) =>
		chinh.get(userId) === pb || (phuCua.get(userId)?.has(pb) ?? false);
	const truongPhongBan = nhomTheo(
		phongBan.flatMap((p): [string, string][] =>
			p.headUserId !== null &&
			vai.has(p.headUserId) &&
			thuoc(p.headUserId, p.id)
				? [[p.headUserId, p.id]]
				: [],
		),
	);
	const truongBoPhan = nhomTheo(
		boPhan.flatMap((b): [string, string][] =>
			b.headUserId !== null && vai.has(b.headUserId)
				? [[b.headUserId, b.id]]
				: [],
		),
	);
	const boPhanCua = new Map(
		phongBan.map((p) => [
			p.id,
			p.divisionId !== null && boPhanSong.has(p.divisionId)
				? p.divisionId
				: null,
		]),
	);
	const phongBanChinh = new Map(
		thanhVien.map((m) => {
			const pb = chinh.get(m.userId);
			return [
				m.userId,
				pb !== undefined && phongBanSong.has(pb) ? pb : null,
			] as const;
		}),
	);
	const rong = new Set<string>();
	return new Map(
		userIds.map((userId) => [
			userId,
			dungNguCanhXem(userId, {
				quanTri: VAI_QUAN_TRI_OKR.has(vai.get(userId) ?? ""),
				truongBoPhan: truongBoPhan.get(userId) ?? rong,
				truongPhongBan: truongPhongBan.get(userId) ?? rong,
				boPhanCua,
				phongBanChinh,
			}),
		]),
	);
}
