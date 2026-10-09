import { Prisma } from "./generated/prisma/client";
import type { Db } from "./client";

export const TIM_THEO_SO = { gioiHan: 500 } as const;

export type NguoiGiuSo = {
	id: string;
	firstName: string;
	lastName: string | null;
};

const CHU_SO = Prisma.sql`regexp_replace(phone, '[^0-9]', '', 'g')`;

const QUOC_NOI = Prisma.sql`
	CASE
		WHEN ${CHU_SO} ~ '^84[0-9]{9,10}$' THEN substr(${CHU_SO}, 3)
		WHEN ${CHU_SO} ~ '^0[0-9]{9,10}$' THEN substr(${CHU_SO}, 2)
		ELSE ${CHU_SO}
	END
`;

export async function caNhanCoSo(db: Db, manh: string): Promise<string[]> {
	const hang = await db.$queryRaw<{ id: string }[]>`
		SELECT id FROM contact
		WHERE phone IS NOT NULL AND ${QUOC_NOI} LIKE '%' || ${manh} || '%'
		LIMIT ${TIM_THEO_SO.gioiHan}
	`;
	return hang.map((h) => h.id);
}

export async function caNhanTrungSo(
	db: Db,
	quocNoi: string,
): Promise<NguoiGiuSo | null> {
	const hang = await db.$queryRaw<NguoiGiuSo[]>`
		SELECT id, "firstName", "lastName" FROM contact
		WHERE "archivedAt" IS NULL AND phone IS NOT NULL
			AND ${QUOC_NOI} = ${quocNoi}
		ORDER BY "createdAt" ASC
		LIMIT 1
	`;
	return hang[0] ?? null;
}
