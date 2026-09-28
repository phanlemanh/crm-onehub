import { execFileSync, spawnSync } from "node:child_process";
import {
	cpSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const DB_GOI = join(GOC, "packages/db");
const MIGRATIONS = "packages/db/prisma/migrations";
const pg = createRequire(join(DB_GOI, "package.json"))("pg");
const { dropDatabase, withMaintenance } = await import(
	join(DB_GOI, "scripts/test-db-admin.ts")
);

const MA_TRAN = [
	["taiLieuTrang", 2],
	["taiLieuPhienBan", 3],
	["taiLieuDeXuat", 6],
	["taiLieuSuKien", 2],
	["taiLieuLienKet", 1],
];
const TEN_HIEN = {
	taiLieuTrang: "TaiLieuTrang",
	taiLieuPhienBan: "TaiLieuPhienBan",
	taiLieuDeXuat: "TaiLieuDeXuat",
	taiLieuSuKien: "TaiLieuSuKien",
	taiLieuLienKet: "TaiLieuLienKet",
};

function coSo() {
	if (process.env.TEST_DATABASE_URL) return process.env.TEST_DATABASE_URL;
	const dong = readFileSync(join(GOC, ".env"), "utf8")
		.split("\n")
		.find((d) => d.startsWith("TEST_DATABASE_URL="));
	return dong?.split("=").slice(1).join("=").replace(/"/g, "").trim() ?? "";
}

const goc = coSo();
if (!goc) {
	console.log("KHONG DO DUOC: khong doc duoc TEST_DATABASE_URL");
	process.exit(2);
}
const ten = `crm_msd_mig_${process.pid}_test`;
const dich = new URL(goc);
dich.pathname = `/${ten}`;
const url = dich.toString();

function migrate(thuMuc) {
	const tam = mkdtempSync(join(tmpdir(), "msd-prisma-"));
	const cauHinh = join(tam, "prisma.config.ts");
	writeFileSync(
		cauHinh,
		`export default ${JSON.stringify({
			schema: join(DB_GOI, "prisma/schema.prisma"),
			migrations: { path: thuMuc },
			datasource: { url },
		})};\n`,
	);
	const r = spawnSync(
		"bunx",
		["prisma", "migrate", "deploy", "--config", cauHinh],
		{
			cwd: DB_GOI,
			env: { ...process.env, DATABASE_URL: url },
			encoding: "utf8",
		},
	);
	rmSync(tam, { recursive: true, force: true });
	return r;
}

const chieuDo = process.argv[2] === "--chieu-do";
const base = execFileSync(
	"git",
	["-C", GOC, "merge-base", "HEAD", "origin/onehub"],
	{ encoding: "utf8" },
).trim();

const cu = mkdtempSync(join(tmpdir(), "msd-mig-cu-"));
execFileSync("sh", [
	"-c",
	`git -C "${GOC}" archive ${base} ${MIGRATIONS} | tar -x -C "${cu}"`,
]);
const thuMucCu = join(cu, MIGRATIONS);
const sau = mkdtempSync(join(tmpdir(), "msd-mig-moi-"));
const thuMucMoi = join(sau, "migrations");
cpSync(join(GOC, MIGRATIONS), thuMucMoi, { recursive: true });
if (chieuDo) {
	mkdirSync(join(thuMucMoi, "29990101000000_do"));
	writeFileSync(
		join(thuMucMoi, "29990101000000_do", "migration.sql"),
		`DELETE FROM "taiLieuDeXuat" WHERE "trangThai" = 'CU';\n`,
	);
}

async function voiKetNoi(viec) {
	const c = new pg.Client({ connectionString: url });
	await c.connect();
	try {
		return await viec(c);
	} finally {
		await c.end();
	}
}

async function demDong(c) {
	const kq = {};
	for (const [bang] of MA_TRAN) {
		kq[bang] = (
			await c.query(`SELECT count(*)::int AS n FROM "${bang}"`)
		).rows[0].n;
	}
	return kq;
}

const DE_XUAT = [
	["msd-dx1", "msd-t1", null, "DA_DUYET"],
	["msd-dx2", "msd-t1", "msd-pb1", "DA_DUYET"],
	["msd-dx3", "msd-t2", null, "DA_DUYET"],
	["msd-dx4", "msd-t1", "msd-pb2", "CHO_DUYET"],
	["msd-dx5", "msd-t2", "msd-pb3", "TRA_LAI"],
	["msd-dx6", "msd-t1", "msd-pb1", "CU"],
];
const PHIEN_BAN = [
	["msd-pb1", "msd-t1", 1, "msd-dx1"],
	["msd-pb2", "msd-t1", 2, "msd-dx2"],
	["msd-pb3", "msd-t2", 1, "msd-dx3"],
];

async function gieoNguoi(c) {
	for (const i of [1, 2]) {
		await c.query(
			`INSERT INTO "user" ("id","name","email","emailVerified","createdAt","updatedAt") VALUES ($1,$2,$3,true,now(),now())`,
			[`msd-u${i}`, `msd ${i}`, `msd${i}@thu.test`],
		);
	}
}

async function gieoTaiLieu(c) {
	for (const [id, slug] of [
		["msd-t1", "quy-dinh-hoa-hong"],
		["msd-t2", "quy-trinh-doi-soat"],
	]) {
		await c.query(
			`INSERT INTO "taiLieuTrang" ("id","slug","ten","loai","chuTrangId","taoBoiId","createdAt","updatedAt") VALUES ($1,$2,$2,'quy-dinh','msd-u1','msd-u2',now(),now())`,
			[id, slug],
		);
	}
	for (const [id, trang, , trangThai] of DE_XUAT) {
		await c.query(
			`INSERT INTO "taiLieuDeXuat" ("id","trangId","ten","noiDung","taoBoiId","trangThai","createdAt") VALUES ($1,$2,'ten','noi dung 1,5%','msd-u2',$3,now())`,
			[id, trang, trangThai],
		);
	}
	for (const [id, trang, so, deXuat] of PHIEN_BAN) {
		await c.query(
			`INSERT INTO "taiLieuPhienBan" ("id","trangId","so","ten","noiDung","noiDungHash","deXuatId","duyetBoiId","duyetLuc") VALUES ($1,$2,$3,'ten','noi dung','h',$4,'msd-u1',now())`,
			[id, trang, so, deXuat],
		);
	}
	for (const [id, , banGoc] of DE_XUAT) {
		if (banGoc) {
			await c.query(
				`UPDATE "taiLieuDeXuat" SET "banGocId" = $2 WHERE "id" = $1`,
				[id, banGoc],
			);
		}
	}
	await c.query(
		`UPDATE "taiLieuTrang" SET "banDangDungId" = 'msd-pb2' WHERE "id" = 'msd-t1'`,
	);
	await c.query(
		`UPDATE "taiLieuTrang" SET "banDangDungId" = 'msd-pb3' WHERE "id" = 'msd-t2'`,
	);
	for (const [i, loai] of [
		[1, "TAO"],
		[2, "DUYET"],
	]) {
		await c.query(
			`INSERT INTO "taiLieuSuKien" ("id","trangId","loai","aiId","luc","chiTiet") VALUES ($1,'msd-t1',$2,'msd-u1',now(),'{}'::jsonb)`,
			[`msd-sk${i}`, loai],
		);
	}
	await c.query(
		`INSERT INTO "taiLieuLienKet" ("id","tuTrangId","denSlug","vanBan") VALUES ('msd-lk1','msd-t1','quy-trinh-doi-soat','Quy trình đối soát')`,
	);
}

async function gieo(c) {
	await gieoNguoi(c);
	await gieoTaiLieu(c);
	return demDong(c);
}

async function docSau(c) {
	const sauDem = await demDong(c);
	const cotMoi = (
		await c.query(
			`SELECT count(*)::int AS n FROM "taiLieuDeXuat" WHERE "nguonId" IS NOT NULL OR "trichDoan" IS NOT NULL`,
		)
	).rows[0].n;
	const nguon = (
		await c.query(`SELECT count(*)::int AS n FROM "taiLieuNguon"`)
	).rows[0].n;
	return { sauDem, cotMoi, nguon };
}

function soSau({ sauDem, cotMoi, nguon }) {
	const hong = [];
	let khang = 0;
	for (const [bang, n] of MA_TRAN) {
		khang += 1;
		if (sauDem[bang] !== n) {
			hong.push(
				`bang cu mat dong: ${TEN_HIEN[bang]} ${n} -> ${sauDem[bang]}`,
			);
		}
	}
	khang += 1;
	if (cotMoi !== 0) {
		hong.push(`de xuat cu co nguonId/trichDoan khac NULL: ${cotMoi}`);
	}
	khang += 1;
	if (nguon !== 0) hong.push(`taiLieuNguon khong rong: ${nguon}`);
	return { hong, khang };
}

async function chay() {
	const r1 = migrate(thuMucCu);
	if (r1.status !== 0) {
		console.log(
			`KHONG DO DUOC: migrate luoc do cu hong\n${`${r1.stdout}${r1.stderr}`.slice(-1500)}`,
		);
		return 2;
	}
	const truoc = await voiKetNoi(gieo);
	const lechGieo = MA_TRAN.filter(([b, n]) => truoc[b] !== n);
	if (lechGieo.length > 0) {
		console.log(
			`KHONG DO DUOC: gieo lech ma tran: ${lechGieo.map(([b, n]) => `${b} ${truoc[b]} != ${n}`).join(", ")}`,
		);
		return 2;
	}
	console.log(
		`anh chup truoc: ${MA_TRAN.map(([b]) => `${b}=${truoc[b]}`).join(" ")}`,
	);
	const r2 = migrate(thuMucMoi);
	if (r2.status !== 0) {
		console.log(
			`migration do tren ban sao\n${`${r2.stdout}${r2.stderr}`.slice(-1500)}`,
		);
		return 1;
	}
	const doc = await voiKetNoi(docSau);
	const { hong, khang } = soSau(doc);
	console.log(
		`anh chup sau: ${MA_TRAN.map(([b]) => `${b}=${doc.sauDem[b]}`).join(" ")} · taiLieuNguon=${doc.nguon}`,
	);
	console.log(`khang-dinh=${khang}/${MA_TRAN.length + 2}`);
	for (const h of hong) console.log(h);
	return hong.length === 0 ? 0 : 1;
}

let ma = 1;
try {
	await withMaintenance(goc, async (c) => {
		await dropDatabase(c, ten);
		await c.query(`CREATE DATABASE "${ten}"`);
	});
	ma = await chay();
} finally {
	await withMaintenance(goc, (c) => dropDatabase(c, ten));
	rmSync(cu, { recursive: true, force: true });
	rmSync(sau, { recursive: true, force: true });
}
process.exit(ma);
