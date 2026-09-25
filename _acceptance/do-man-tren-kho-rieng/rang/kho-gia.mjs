import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	databaseFingerprint,
	databaseUrl,
	serverUrl,
} from "../../../packages/db/scripts/measure-db.ts";
import {
	dropDatabase,
	withMaintenance,
} from "../../../packages/db/scripts/test-db-admin.ts";

export const GOC = join(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
	"..",
);
const pg = createRequire(join(GOC, "packages/db/package.json"))("pg");
export const RA = join(GOC, ".acceptance-runs", "do-man-tren-kho-rieng");
export const MA = Date.now().toString(36).slice(-6);
export const CHU_KY_LA = "chu ky la cua luot khac";

mkdirSync(RA, { recursive: true });

let dung = 0;
let sai = 0;

export function khang(dieu, cau, chiTiet = "") {
	if (dieu) {
		dung += 1;
		console.log(`  DUNG ${cau}`);
	} else {
		sai += 1;
		console.log(`  SAI  ${cau}${chiTiet ? ` — ${chiTiet}` : ""}`);
	}
}

export function ketThuc(ten) {
	console.log(`${ten}: ${dung} DUNG, ${sai} SAI`);
	process.exit(sai > 0 ? 1 : 0);
}

export class KhongDoDuoc extends Error {}

export function khongDo(cau) {
	throw new KhongDoDuoc(cau);
}

export function thoatKhongDo(loi) {
	if (!(loi instanceof KhongDoDuoc)) throw loi;
	console.log(`KHONG DO DUOC: ${loi.message}`);
	process.exit(2);
}

export function mayChu() {
	try {
		return serverUrl();
	} catch (loi) {
		khongDo(loi.message);
	}
}

export async function truyVan(url, sql, giaTri = []) {
	const k = new pg.Client({ connectionString: url });
	await k.connect();
	try {
		return (await k.query(sql, giaTri)).rows;
	} finally {
		await k.end();
	}
}

export function databaseUrlCua(ten) {
	return databaseUrl(mayChu(), ten);
}

export async function coKho(ten) {
	const hang = await truyVan(
		databaseUrl(mayChu(), "postgres"),
		"SELECT 1 FROM pg_database WHERE datname = $1",
		[ten],
	);
	return hang.length === 1;
}

export async function dungKhoGia(nhan) {
	const base = mayChu();
	const ten = `crm_chung_gia_${nhan}_${MA}`;
	const url = databaseUrl(base, ten);
	await withMaintenance(base, async (k) => {
		await dropDatabase(k, ten);
		await k.query(`CREATE DATABASE "${ten}"`);
	});
	const ra = spawnSync(
		join(GOC, "packages/db/node_modules/.bin/prisma"),
		["migrate", "deploy"],
		{
			cwd: join(GOC, "packages/db"),
			env: { ...process.env, DATABASE_URL: url },
			encoding: "utf8",
		},
	);
	if (ra.status !== 0)
		khongDo(`migrate deploy kho gia ${ten} thoat ${ra.status}`);
	await truyVan(
		url,
		`INSERT INTO "okrCycle" (id, kind, name, "startsOn", "endsOn", "updatedAt")
		 VALUES ($1, 'quy', $2, '2026-10-01', '2026-12-31', now())`,
		[`la-${MA}`, CHU_KY_LA],
	);
	return { ten, url };
}

export async function xoaKhoGia(ten) {
	await withMaintenance(mayChu(), (k) => dropDatabase(k, ten));
}

export async function vanTay(url) {
	return databaseFingerprint(url);
}

export function lech(truoc, sau) {
	const bang = new Set([...Object.keys(truoc), ...Object.keys(sau)]);
	return [...bang].filter(
		(b) => truoc[b]?.rows !== sau[b]?.rows || truoc[b]?.md5 !== sau[b]?.md5,
	);
}
