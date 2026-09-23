import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

export const DUOI_LUOT_DON = "_tat_khoa_nguoi_ngoai_kho";
const MIGRATIONS = join(dirname(import.meta.dirname), "prisma", "migrations");

export function sqlLuotDon(thuMuc: string = MIGRATIONS): string {
	const khop = readdirSync(thuMuc).filter((ten) => ten.endsWith(DUOI_LUOT_DON));
	if (khop.length !== 1) {
		throw new Error(
			`can dung mot migration *${DUOI_LUOT_DON}, thay ${khop.length}`,
		);
	}
	return readFileSync(join(thuMuc, String(khop[0]), "migration.sql"), "utf8");
}

export function menhDeLuotDon(sql: string): string {
	const khop =
		/^\s*UPDATE\s+"apikey"\s+SET\s+[\s\S]*?\bWHERE\b([\s\S]*?);?\s*$/i.exec(
			sql,
		);
	if (!khop?.[1]?.trim()) {
		throw new Error(
			'migration luot don khong co dang UPDATE "apikey" ... WHERE ...',
		);
	}
	return khop[1].trim();
}

export function cauXemTruoc(sql: string): string {
	return `SELECT count(*)::int AS "khoa", count(DISTINCT "referenceId")::int AS "chu", count(*) FILTER (WHERE "lastRequest" > NOW() - INTERVAL '30 days')::int AS "dungGanDay" FROM "apikey" WHERE ${menhDeLuotDon(sql)}`;
}
