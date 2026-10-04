import type { Db } from "../../../packages/db/src/index.ts";

const PHUT_MS = 60_000;

export const MOC_KET_MS = 30 * PHUT_MS;

export const CAU = {
	docLoi: "Chưa đọc được tệp — bấm Soạn lại để thử lần nữa.",
	moCoi: "Máy soạn dừng giữa chừng — bấm Soạn lại để thử lần nữa.",
} as const;

type MucKet = "CHO_DOC" | "CHO_SOAN" | "DANG_SOAN";

export type KetQuaDemKet = {
	ket30: Partial<Record<MucKet, number>>;
	loi: Record<string, number>;
};

export async function demKet(
	db: Db,
	bayGio: Date = new Date(),
): Promise<KetQuaDemKet> {
	const moc = new Date(bayGio.getTime() - MOC_KET_MS);
	const ket = await db.$queryRaw<{ muc: MucKet; so: number }[]>`
		WITH viec AS (
			SELECT t.payload->>'nguonId' AS nguon_id, MAX(t."createdAt") AS tao
			FROM "agentTask" AS t
			WHERE t.kind = 'soan-tu-nguon'
			GROUP BY 1
		)
		SELECT n."trangThai" AS muc, COUNT(*)::int AS so
		FROM "taiLieuNguon" AS n
		LEFT JOIN viec AS v ON v.nguon_id = n.id
		WHERE (n."trangThai" IN ('CHO_DOC', 'CHO_SOAN') AND v.tao < ${moc})
			OR (n."trangThai" = 'DANG_SOAN' AND n."soanLuc" < ${moc})
		GROUP BY 1
	`;
	const loi = await db.$queryRaw<{ lyDo: string | null; so: number }[]>`
		SELECT n."lyDo" AS "lyDo", COUNT(*)::int AS so
		FROM "taiLieuNguon" AS n
		WHERE n."trangThai" = 'LOI'
		GROUP BY 1
	`;
	const tenLoi = (lyDo: string | null): string =>
		lyDo === CAU.docLoi ? "docLoi" : lyDo === CAU.moCoi ? "moCoi" : (lyDo ?? "");
	return {
		ket30: Object.fromEntries(ket.map((d) => [d.muc, d.so])),
		loi: Object.fromEntries(loi.map((d) => [tenLoi(d.lyDo), d.so])),
	};
}

if (import.meta.main) {
	const { db } = await import("../../../packages/db/src/index.ts");
	console.log(JSON.stringify(await demKet(db), null, 2));
	await db.$disconnect();
}
