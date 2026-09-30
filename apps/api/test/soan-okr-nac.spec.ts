import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const MIGRATION = join(
	import.meta.dir,
	"../../../packages/db/prisma/migrations/20261009010000_okr_soan/migration.sql",
);

const CAM = [
	/\bDROP\b/i,
	/\bALTER\s+COLUMN\b/i,
	/\bRENAME\b/i,
	/\bSET\s+DATA\s+TYPE\b/i,
	/\bTRUNCATE\b/i,
	/\bDELETE\s+FROM\b/i,
	/\bUPDATE\s+"/i,
];

const CHO_PHEP = [
	/^ALTER TABLE "[A-Za-z]+" ADD COLUMN\s+"[A-Za-z]+"[^;]*(,\s*ADD COLUMN\s+"[A-Za-z]+"[^;,]*)*$/s,
	/^CREATE TABLE "[A-Za-z]+" \([^;]*\)$/s,
	/^CREATE (UNIQUE )?INDEX "[A-Za-z_]+" ON "[A-Za-z]+"\s*\([^;]*\)$/s,
];

function themCotBatBuocKhongMacDinh(cau: string): boolean {
	if (!/^ALTER TABLE\b/.test(cau)) return false;
	return cau
		.split(/,\s*(?=ADD COLUMN)/)
		.some((cot) => /\bNOT NULL\b/i.test(cot) && !/\bDEFAULT\b/i.test(cot));
}

export function cauLech(sql: string): string[] {
	const cau = sql
		.split("\n")
		.filter((d) => !d.trim().startsWith("--"))
		.join("\n")
		.split(";")
		.map((c) => c.trim())
		.filter((c) => c.length > 0);
	return cau.filter(
		(c) =>
			CAM.some((r) => r.test(c)) ||
			!CHO_PHEP.some((r) => r.test(c)) ||
			themCotBatBuocKhongMacDinh(c),
	);
}

describe("migration", () => {
	test("migration okr_soan chỉ thêm: cột có mặc định rỗng, bảng mới, chỉ mục — không DROP, không ALTER COLUMN", () => {
		const sql = readFileSync(MIGRATION, "utf8");
		expect(sql.length).toBeGreaterThan(0);
		expect(cauLech(sql), "migration khong chi them").toEqual([]);
		for (const cot of [
			'"division" ADD COLUMN     "moTa" TEXT NOT NULL DEFAULT \'\'',
			'"department" ADD COLUMN     "moTa" TEXT NOT NULL DEFAULT \'\'',
			'"orgPlacement" ADD COLUMN     "chucDanh" TEXT NOT NULL DEFAULT \'\'',
			'"aiTranThangDatOkrUsd" DECIMAL(8,2)',
			'"cuocSoanId" TEXT',
			'"noiDung" JSONB',
			'"taoRaId" TEXT',
			'CREATE TABLE "okrCuocSoan"',
			'CREATE UNIQUE INDEX "okrCuocSoan_sessionId_key"',
		])
			expect(sql, `thieu: ${cot}`).toContain(cot);
	});

	test("cauLech bắt DROP COLUMN", () => {
		const lech = cauLech('ALTER TABLE "a" DROP COLUMN "b";');
		expect(lech).toHaveLength(1);
		expect(lech[0]).toContain("DROP COLUMN");
	});

	test("cauLech bắt ALTER COLUMN ... SET DATA TYPE", () => {
		expect(
			cauLech('ALTER TABLE "a" ALTER COLUMN "b" SET DATA TYPE integer;'),
		).toHaveLength(1);
	});

	test("cauLech cho qua ADD COLUMN có DEFAULT", () => {
		expect(
			cauLech('ALTER TABLE "a" ADD COLUMN     "b" TEXT NOT NULL DEFAULT \'\';'),
		).toEqual([]);
	});

	test("cauLech bắt ADD COLUMN NOT NULL không DEFAULT, kể cả cột thứ hai trong một câu", () => {
		expect(
			cauLech('ALTER TABLE "a" ADD COLUMN     "b" TEXT NOT NULL;'),
		).toHaveLength(1);
		expect(
			cauLech(
				'ALTER TABLE "a" ADD COLUMN     "b" TEXT,\nADD COLUMN     "c" INTEGER NOT NULL;',
			),
		).toHaveLength(1);
	});
});
