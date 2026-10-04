import { writeFileSync } from "node:fs";
import { type Db, db, type Prisma } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import {
	CANCELLED_CU,
	CON_HIEU_LUC,
	TRANG_THAI_LOI_MOI,
} from "@crm/validation/invitation-status";
import {
	APP_SETTING_ID,
	parseStaffDomains,
} from "../src/workspace/staff-domains";

export type SoThanhVien = {
	"ten-mien": number;
	treo: number;
	"bo-sot": number;
	"khong-doc-duoc": number;
};

const DA_BIET: readonly string[] = [...TRANG_THAI_LOI_MOI, CANCELLED_CU];
const CON_PHEP: readonly string[] = [...CON_HIEU_LUC];
const KET_THUC: readonly string[] = DA_BIET.filter(
	(s) => !CON_PHEP.includes(s),
);

function so(hang: { n: bigint | number }[]): number {
	return Number(hang[0]?.n ?? 0);
}

export async function soiThanhVien(
	client: Pick<Db, "$transaction">,
	chen?: (tx: Prisma.TransactionClient) => Promise<unknown>,
): Promise<SoThanhVien> {
	return client.$transaction(async (tx) => {
		await tx.$executeRaw`SET TRANSACTION READ ONLY`;
		if (chen) await chen(tx);

		const cot = await tx.appSetting.findUnique({
			where: { id: APP_SETTING_ID },
			select: { staffEmailDomains: true },
		});

		const treo = await tx.$queryRaw<{ n: bigint }[]>`
			SELECT count(*) AS n
			FROM invitation i
			JOIN "user" u ON lower(u.email) = lower(i.email)
			JOIN member m ON m."userId" = u.id AND m."organizationId" = i."organizationId"
			WHERE i."organizationId" = ${WORKSPACE_ID} AND i.status = 'pending'`;

		const boSot = await tx.$queryRaw<{ n: bigint }[]>`
			SELECT count(*) AS n
			FROM "user" u
			WHERE NOT EXISTS (
				SELECT 1 FROM member m
				WHERE m."userId" = u.id AND m."organizationId" = ${WORKSPACE_ID}
			)
			AND EXISTS (
				SELECT 1 FROM invitation i
				WHERE i."organizationId" = ${WORKSPACE_ID}
				AND lower(i.email) = lower(u.email)
				AND i.status = ANY(${KET_THUC})
			)
			AND EXISTS (
				SELECT 1 FROM session s
				WHERE s."userId" = u.id
				AND s."createdAt" > (
					SELECT max(i."createdAt") FROM invitation i
					WHERE i."organizationId" = ${WORKSPACE_ID}
					AND lower(i.email) = lower(u.email)
					AND i.status = ANY(${CON_PHEP})
				)
			)`;

		const khongDocDuoc = await tx.$queryRaw<{ n: bigint }[]>`
			SELECT count(*) AS n
			FROM invitation i
			WHERE i."organizationId" = ${WORKSPACE_ID}
			AND NOT (i.status = ANY(${DA_BIET}))`;

		return {
			"ten-mien": parseStaffDomains(cot?.staffEmailDomains ?? null).length,
			treo: so(treo),
			"bo-sot": so(boSot),
			"khong-doc-duoc": so(khongDocDuoc),
		};
	});
}

export function inKetQua(ket: SoThanhVien, mayChu: string): string {
	return [
		`may-chu ${mayChu}`,
		"giao-dich READ ONLY",
		`ten-mien ${ket["ten-mien"]}`,
		`treo ${ket.treo}`,
		`bo-sot ${ket["bo-sot"]}`,
		`khong-doc-duoc ${ket["khong-doc-duoc"]}`,
		"",
	].join("\n");
}

function mayChuCua(url: string | undefined): string {
	if (!url) throw new Error("DATABASE_URL chua dat.");
	return new URL(url).hostname;
}

if (import.meta.main) {
	const ra = process.argv.indexOf("--ra");
	const chu = inKetQua(
		await soiThanhVien(db),
		mayChuCua(process.env.DATABASE_URL),
	);
	if (ra !== -1 && process.argv[ra + 1]) {
		writeFileSync(process.argv[ra + 1] as string, chu);
	}
	process.stdout.write(chu);
	await db.$disconnect();
}
