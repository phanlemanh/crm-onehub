import type { Db, Prisma } from "@crm/db";
import { dieuKienXemMucTieu, type NguCanhXem } from "@crm/db/okr-hien-thi";
import type { OkrVetSnapshot } from "@crm/validation/okr-vet";
import { z } from "zod";

export type PhamDoc = { nguCanh: NguCanhXem } | "so-gop";

export const ANH_GIOI_HAN: OkrVetSnapshot = { gioiHan: true };

const KHOA_MUC_TIEU = [
	"objectiveId",
	"targetObjectiveId",
	"sangObjectiveId",
	"tuObjectiveId",
] as const;
const KHOA_KR = ["targetKeyResultId"] as const;

type VetDong = {
	before: OkrVetSnapshot | null;
	after: OkrVetSnapshot | null;
};

const maChuoi = z.string();

const chuoi = (v: OkrVetSnapshot[string] | undefined): string[] => {
	const r = maChuoi.safeParse(v);
	return r.success ? [r.data] : [];
};

function mucTieuCuaAnh(
	anh: OkrVetSnapshot,
	mucTieuCuaKr: ReadonlyMap<string, string>,
): string[] {
	return [
		...KHOA_MUC_TIEU.flatMap((k) => chuoi(anh[k])),
		...KHOA_KR.flatMap((k) =>
			chuoi(anh[k]).flatMap((kr) => chuoi(mucTieuCuaKr.get(kr))),
		),
	];
}

export function vetChoNguoiXem<V extends VetDong>(
	dong: V,
	xemDuoc: (objectiveId: string) => boolean,
	mucTieuCuaKr: ReadonlyMap<string, string> = new Map(),
): V {
	const che = (anh: OkrVetSnapshot | null) =>
		anh !== null && mucTieuCuaAnh(anh, mucTieuCuaKr).some((id) => !xemDuoc(id))
			? ANH_GIOI_HAN
			: anh;
	return { ...dong, before: che(dong.before), after: che(dong.after) };
}

type DbHoacTx = Db | Prisma.TransactionClient;

export async function locXemTrongVet(
	db: DbHoacTx,
	nc: NguCanhXem,
	dong: VetDong[],
	themMucTieu: string[] = [],
): Promise<{
	xemDuoc: (objectiveId: string) => boolean;
	mucTieuCuaKr: ReadonlyMap<string, string>;
}> {
	const anh = dong.flatMap((d) =>
		[d.before, d.after].filter((a): a is OkrVetSnapshot => a !== null),
	);
	const krIds = [
		...new Set(anh.flatMap((a) => KHOA_KR.flatMap((k) => chuoi(a[k])))),
	];
	const krs =
		krIds.length === 0
			? []
			: await db.okrKeyResult.findMany({
					where: { id: { in: krIds } },
					select: { id: true, objectiveId: true },
				});
	const mucTieuCuaKr = new Map(krs.map((k) => [k.id, k.objectiveId]));
	const can = [
		...new Set([
			...anh.flatMap((a) => mucTieuCuaAnh(a, mucTieuCuaKr)),
			...themMucTieu,
		]),
	];
	const thay =
		can.length === 0
			? []
			: await db.okrObjective.findMany({
					where: { AND: [{ id: { in: can } }, dieuKienXemMucTieu(nc)] },
					select: { id: true },
				});
	const xem = new Set(thay.map((m) => m.id));
	return { xemDuoc: (id) => xem.has(id), mucTieuCuaKr };
}
