import type { Db } from "./client";

export async function dongNguonMoCoi(db: Db, lyDo: string): Promise<number> {
	return db.$executeRaw`
		UPDATE "taiLieuNguon" AS n
		SET "trangThai" = 'LOI', "lyDo" = ${lyDo}
		WHERE n."trangThai" = 'CHO_DOC'
			AND NOT EXISTS (
				SELECT 1 FROM "agentTask" AS t
				WHERE t.kind = 'soan-tu-nguon'
					AND t."finishedAt" IS NULL
					AND t.payload->>'nguonId' = n.id
			)
	`;
}
