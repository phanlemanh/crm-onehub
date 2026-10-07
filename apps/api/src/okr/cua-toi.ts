import type { Prisma } from "@crm/db";
import type { TrangThaiMucTieu } from "@crm/validation/okr-muc-tieu";

export function vaiCuaToi(userId: string): Prisma.OkrObjectiveWhereInput[] {
	return [
		{ ownerUserId: userId },
		{ personUserId: userId },
		{ participants: { some: { userId } } },
		{ keyResults: { some: { ownerUserId: userId } } },
	];
}

export function chiaCuaToi<T extends { id: string; status: TrangThaiMucTieu }>(
	ds: readonly T[],
	idsCuaToi: ReadonlySet<string>,
): { objectives: T[]; daBo: T[]; dangTheoDoi: T[] } {
	const cuaToi = ds.filter((m) => idsCuaToi.has(m.id));
	return {
		objectives: cuaToi.filter((m) => m.status !== "da-bo"),
		daBo: cuaToi.filter((m) => m.status === "da-bo"),
		dangTheoDoi: ds.filter(
			(m) => !idsCuaToi.has(m.id) && m.status !== "da-bo",
		),
	};
}
