import type { Db } from "../../../packages/db/src/index.ts";

export const LOAI_SAI_CHO = "tro-ly-kho.sai-cho";
export const KHONG_RO = "khong-ro";

export type KetQuaSaiPhien = { saiCho: Record<string, number> };

export async function demSaiPhien(db: Db): Promise<KetQuaSaiPhien> {
	const dong = await db.$queryRaw<{ tinhNang: string; so: number }[]>`
		SELECT COALESCE(c."tinhNang", ${KHONG_RO}) AS "tinhNang", COUNT(*)::int AS so
		FROM "agentEvent" AS e
		LEFT JOIN LATERAL (
			SELECT a."tinhNang"
			FROM "aiChiPhi" AS a
			WHERE a."sessionId" = e.data->>'phienGoc' AND a."phienCha" IS NULL
			ORDER BY a.at
			LIMIT 1
		) AS c ON true
		WHERE e.type = ${LOAI_SAI_CHO}
		GROUP BY 1
	`;
	return { saiCho: Object.fromEntries(dong.map((d) => [d.tinhNang, d.so])) };
}

if (import.meta.main) {
	const { db } = await import("../../../packages/db/src/index.ts");
	console.log(JSON.stringify(await demSaiPhien(db), null, 2));
	await db.$disconnect();
}
