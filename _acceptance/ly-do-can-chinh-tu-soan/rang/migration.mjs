import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const THU_MUC = join(GOC, "packages", "db", "prisma", "migrations");
const DUOI = "_ly_do_can_chinh";
const MA_KHONG_DO = 2;
const CAU_THEM =
	/^ALTER TABLE "okrAlignment" ADD COLUMN "\w+" \w+( NOT NULL DEFAULT \S+)?$/;
const CAU_DIEN = /^UPDATE "okrAlignment"/;

function tachCau(chu) {
	return chu
		.split(";")
		.map((c) => c.replace(/\s+/g, " ").trim())
		.filter(Boolean);
}

export function kiemMigration(chu) {
	const cau = tachCau(chu);
	if (cau.length === 0) return { ma: MA_KHONG_DO, chu: "migration rong" };
	if (cau.some((c) => /\bDROP\b/i.test(c)))
		return { ma: 1, chu: "cau cam: DROP" };
	if (
		cau.some(
			(c) =>
				/ADD COLUMN/i.test(c) &&
				/\bNOT NULL\b/i.test(c) &&
				!/\bDEFAULT\b/i.test(c),
		)
	)
		return { ma: 1, chu: "cau cam: NOT NULL khong mac dinh" };
	const soDien = cau.filter((c) => CAU_DIEN.test(c)).length;
	if (soDien > 1) return { ma: 1, chu: "hai cau UPDATE" };
	if (soDien === 0) return { ma: 1, chu: "thieu cau UPDATE dien lai" };
	const la = cau.find((c) => !CAU_THEM.test(c) && !CAU_DIEN.test(c));
	if (la) return { ma: 1, chu: `cau la: ${la.slice(0, 80)}` };
	return { ma: 0, chu: `MIGRATION: ${cau.length} cau, chi them` };
}

const THEM = 'ALTER TABLE "okrAlignment" ADD COLUMN "x" TEXT;';
const DOI_CHUNG = [
	{
		chu: `${THEM}\nALTER TABLE "okrAlignment" DROP COLUMN "x";`,
		mong: "cau cam: DROP",
	},
	{
		chu: 'ALTER TABLE "okrAlignment" ADD COLUMN "y" BOOLEAN NOT NULL;',
		mong: "cau cam: NOT NULL khong mac dinh",
	},
	{
		chu: `${THEM}\nUPDATE "okrAlignment" SET "x" = 'a';\nUPDATE "okrAlignment" SET "x" = 'b';`,
		mong: "hai cau UPDATE",
	},
	{
		chu: THEM,
		mong: "thieu cau UPDATE dien lai",
	},
];

for (const d of DOI_CHUNG) {
	const k = kiemMigration(d.chu);
	if (k.ma !== 1 || k.chu !== d.mong) {
		console.log(`doi chung hong: mong «${d.mong}», duoc «${k.chu}»`);
		process.exit(1);
	}
	console.log(`doi chung: ${k.chu} -> ma ${k.ma}`);
}

const tim = readdirSync(THU_MUC).filter((t) => t.endsWith(DUOI));
if (tim.length !== 1) {
	console.log(
		`KHONG DO DUOC: can dung mot thu muc *${DUOI}, thay ${tim.length}`,
	);
	process.exit(MA_KHONG_DO);
}
const ket = kiemMigration(
	readFileSync(join(THU_MUC, tim[0], "migration.sql"), "utf8"),
);
console.log(ket.chu);
process.exit(ket.ma);
