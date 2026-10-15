import { execFileSync, spawnSync } from "node:child_process";
import {
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP), "..", "..", "..");
const THU_MUC = "packages/db/prisma/migrations";
const TEP_SCHEMA = "packages/db/prisma/schema.prisma";
const CAP = Object.freeze({
	goc: "e86b5677ed8ff42c5754bf30b40f87f4a37507aa",
	dinh: "f2acca7f1ae619abdadbb09e3db29be65841ce87",
});
const MODEL_MOI = ["OkrNguonKr", "OkrSoChup"];
const CHI_MUC_MAY = "okrSoChup_may_mot_ngay";
const GHIM = Object.freeze({
	addColumn: "migration khong chi them: ADD COLUMN",
	dropIndex: "migration khong chi them: DROP INDEX",
	lienKhoi: "model Okr khong lien cuoi schema",
	xoaLan: "bản chụp bị xoá lan",
	chiMucSchema: "chi muc mot phan khong khai trong schema.prisma",
});

const git = (...d) =>
	execFileSync("git", ["-C", GOC, ...d], { encoding: "utf8" }).trim();

for (const sha of [CAP.goc, CAP.dinh]) {
	if (
		spawnSync("git", ["-C", GOC, "cat-file", "-e", `${sha}^{commit}`])
			.status !== 0
	) {
		console.log(`KHONG DO DUOC: khong giai duoc cap gop ${sha}`);
		process.exit(2);
	}
}
const TRUOC = CAP.goc;
const DINH = CAP.dinh;
const SCHEMA_DINH = git("show", `${DINH}:${TEP_SCHEMA}`);
const lietKeTruoc = () =>
	git("ls-tree", "--name-only", `${TRUOC}:${THU_MUC}`)
		.split("\n")
		.filter((t) => t !== "" && t !== "migration_lock.toml");
const cu = new Set(lietKeTruoc());

function bangCuaSchema(schema) {
	const ra = new Set();
	for (const m of schema.matchAll(/^model (\w+) \{([\s\S]*?)^\}/gm)) {
		ra.add(m[2].match(/@@map\("([^"]+)"\)/)?.[1] ?? m[1]);
	}
	return ra;
}
const BANG_CU = bangCuaSchema(git("show", `${TRUOC}:${TEP_SCHEMA}`));

function cauLenh(sql) {
	return sql
		.replace(/\/\*[\s\S]*?\*\//g, "")
		.split("\n")
		.filter((d) => !d.trim().startsWith("--"))
		.join("\n")
		.split(";")
		.map((c) => c.replace(/\s+/g, " ").trim())
		.filter((c) => c !== "");
}

function bangCua(c) {
	return (
		c.match(/^ALTER TABLE (?:ONLY )?"([^"]+)"/i)?.[1] ??
		c.match(/^CREATE TABLE (?:IF NOT EXISTS )?"([^"]+)"/i)?.[1] ??
		c.match(/\bON "([^"]+)"/i)?.[1] ??
		""
	);
}

function viPham(c) {
	const hoa = c.toUpperCase();
	const bang = bangCua(c);
	const cuBang = BANG_CU.has(bang);
	const xoa = hoa.match(/^(UPDATE|DELETE|TRUNCATE)\b/)?.[1];
	if (xoa) return xoa;
	const drop = hoa.match(/\bDROP\s+(\w+)/)?.[1];
	if (drop) return `DROP ${drop}`;
	if (/ALTER COLUMN|RENAME/.test(hoa)) return "ALTER COLUMN/RENAME";
	if (/^ALTER TABLE "[^"]+" ADD CONSTRAINT "[^"]+" FOREIGN KEY/.test(hoa))
		return null;
	if (/ADD COLUMN/.test(hoa)) return `ADD COLUMN (${bang})`;
	if (/^ALTER TABLE/.test(hoa))
		return `ALTER TABLE khac ADD CONSTRAINT FOREIGN KEY (${bang})`;
	if (/^CREATE TABLE/.test(hoa))
		return cuBang ? `CREATE TABLE trung bang co san (${bang})` : null;
	if (/^CREATE (UNIQUE )?INDEX/.test(hoa))
		return cuBang ? `CREATE INDEX tren bang co san (${bang})` : null;
	return `lenh la: ${c.slice(0, 60)}`;
}

function soatTinh({ moi, docSql, schema }) {
	const hong = [];
	let dem = 0;
	const khoaChup = [];
	let coChiMucMay = false;
	for (const t of moi) {
		for (const c of cauLenh(docSql(t))) {
			dem += 1;
			const v = viPham(c);
			if (v) hong.push(`migration khong chi them: ${v} (${t})`);
			if (
				/^ALTER TABLE "okrSoChup" ADD CONSTRAINT "[^"]+" FOREIGN KEY \("keyResultId"\)/i.test(
					c,
				)
			)
				khoaChup.push(c);
			if (
				new RegExp(
					`^CREATE UNIQUE INDEX "${CHI_MUC_MAY}" ON "okrSoChup"\\s*\\("keyResultId", "ngay"\\) WHERE`,
					"i",
				).test(c)
			)
				coChiMucMay = true;
		}
	}
	if (khoaChup.length === 0)
		hong.push(
			"khong thay khoa ngoai okrSoChup.keyResultId trong migration moi",
		);
	for (const c of khoaChup) {
		const kieu = c
			.match(
				/ON DELETE (SET NULL|SET DEFAULT|NO ACTION|RESTRICT|CASCADE)/i,
			)?.[1]
			?.toUpperCase();
		if (kieu !== "RESTRICT")
			hong.push(
				`${GHIM.xoaLan}: okrSoChup.keyResultId ON DELETE ${kieu ?? "(mac dinh)"}, phai RESTRICT`,
			);
	}
	if (!coChiMucMay)
		hong.push(`thieu chi muc duy nhat mot phan ${CHI_MUC_MAY} tren okrSoChup`);

	const models = [...schema.matchAll(/^model (\w+) \{/gm)].map((m) => m[1]);
	const dau = models.findIndex((m) => m.startsWith("Okr"));
	const khoi = dau === -1 ? [] : models.slice(dau);
	const sauOkr = khoi.filter((m) => !m.startsWith("Okr"));
	if (dau === -1) hong.push("khong co model Okr nao");
	if (sauOkr.length > 0)
		hong.push(
			`${GHIM.lienKhoi}: sau chung con ${sauOkr.length} model khac (${sauOkr.slice(0, 3).join(", ")}${sauOkr.length > 3 ? ", …" : ""})`,
		);
	for (const m of MODEL_MOI)
		if (!khoi.includes(m))
			hong.push(`thieu model ${m} trong khoi Okr cuoi schema`);
	const modelChup =
		schema.match(/^model OkrSoChup \{([\s\S]*?)^\}/m)?.[1] ?? "";
	const khaiChiMuc = new RegExp(
		`^\\s*@@unique\\(\\[keyResultId, ngay\\], map: "${CHI_MUC_MAY}", where: `,
		"m",
	).test(modelChup);
	if (!khaiChiMuc)
		hong.push(
			`${GHIM.chiMucSchema}: model OkrSoChup thieu @@unique ${CHI_MUC_MAY} co where`,
		);
	return { hong, dem };
}

const pg = () =>
	createRequire(join(GOC, "packages", "db", "package.json"))("pg");

function urlKho(ten) {
	const goc =
		process.env.DATABASE_URL ??
		readFileSync(join(GOC, ".env"), "utf8").match(/^DATABASE_URL=(.*)$/m)?.[1];
	if (!goc)
		throw new Error("khong tim thay DATABASE_URL trong moi truong hay .env");
	const u = new URL(goc.replace(/^["']|["']$/g, ""));
	u.pathname = `/${ten}`;
	u.search = "";
	return u.toString();
}

async function voiKho(ten, viec) {
	const c = new (pg().Client)({ connectionString: urlKho(ten) });
	await c.connect();
	try {
		return await viec(c);
	} finally {
		await c.end();
	}
}

const GIEO = [
	`INSERT INTO "user" ("id","name","email","updatedAt") VALUES ('u-mig','Người đo migration','mig@thu.test',now())`,
	`INSERT INTO "company" ("id","name","updatedAt") VALUES ('c-mig','Công ty đo migration',now())`,
	`INSERT INTO "deal" ("id","name","companyId","ownerId","updatedAt") VALUES ('d-mig','Thoả thuận đo migration','c-mig','u-mig',now())`,
	`INSERT INTO "division" ("id","name","position","headUserId","updatedAt") VALUES ('dv-mig','Khối đo',0,'u-mig',now())`,
	`INSERT INTO "department" ("id","name","position","divisionId","headUserId","updatedAt") VALUES ('dp-mig','Phòng đo',0,'dv-mig','u-mig',now())`,
	`INSERT INTO "orgPlacement" ("userId","primaryDepartmentId","updatedAt") VALUES ('u-mig','dp-mig',now())`,
	`INSERT INTO "okrCycle" ("id","kind","name","startsOn","endsOn","phase","updatedAt") VALUES ('cy-mig','quy','Quý đo','2026-10-01','2026-12-31','dang-chay',now())`,
	`INSERT INTO "okrObjective" ("id","cycleId","level","departmentId","ownerUserId","kind","status","title","publishedAt","updatedAt") VALUES ('o-mig','cy-mig','phong-ban','dp-mig','u-mig','cam-ket','cong-bo','Mục tiêu đo migration',now(),now())`,
	`INSERT INTO "okrKeyResult" ("id","objectiveId","title","kind","ownerUserId","startValue","targetValue","currentValue","updatedAt") VALUES ('k-mig','o-mig','KR đo migration','tang-toi','u-mig',0,10,3,now())`,
	`INSERT INTO "okrKeyResult" ("id","objectiveId","title","kind","ownerUserId","startValue","targetValue","currentValue","position","updatedAt") VALUES ('k-mig-2','o-mig','KR đo migration hai','tang-toi','u-mig',0,20,5,1,now())`,
	`INSERT INTO "okrCheckInSession" ("id","userId","entry","submittedAt","seconds") VALUES ('s-mig','u-mig','web',now(),42)`,
	`INSERT INTO "okrCheckIn" ("id","keyResultId","sessionId","weekStart","value","confidence","authorUserId","ownerUserId") VALUES ('ci-mig','k-mig','s-mig','2026-10-05',3,'dung-nhip','u-mig','u-mig')`,
];
const BANG_GIEO = [
	"user",
	"company",
	"deal",
	"division",
	"department",
	"orgPlacement",
	"okrCycle",
	"okrObjective",
	"okrKeyResult",
	"okrCheckInSession",
	"okrCheckIn",
];

async function vanTay(c, cacBang) {
	const ra = new Map();
	for (const b of cacBang) {
		const r = await c.query(
			`SELECT count(*)::int AS n, md5(coalesce(string_agg(t::text, '|' ORDER BY t::text), '')) AS h FROM "${b}" t`,
		);
		ra.set(b, { n: r.rows[0].n, h: r.rows[0].h });
	}
	return ra;
}

async function thuLoi(c, cau) {
	await c.query("SAVEPOINT thu");
	try {
		await c.query(cau);
		await c.query("RELEASE SAVEPOINT thu");
		return null;
	} catch (e) {
		await c.query("ROLLBACK TO SAVEPOINT thu");
		return e.code ?? "loi";
	}
}

async function chayTrenDuLieu(moi, docSql) {
	const kho = `crm_so_okr_mig_${process.pid}`;
	const hong = [];
	await voiKho("postgres", async (c) => {
		await c.query(`DROP DATABASE IF EXISTS "${kho}" WITH (FORCE)`);
		await c.query(`CREATE DATABASE "${kho}"`);
	});
	try {
		return await voiKho(kho, async (c) => {
			for (const t of [...cu].sort())
				await c.query(git("show", `${TRUOC}:${THU_MUC}/${t}/migration.sql`));
			for (const cau of GIEO) await c.query(cau);
			const bangCu = (
				await c.query(
					`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`,
				)
			).rows.map((r) => r.table_name);
			const truoc = await vanTay(c, bangCu);
			const rong = BANG_GIEO.filter((b) => (truoc.get(b)?.n ?? 0) === 0);
			if (rong.length > 0) hong.push(`gieo khong vao bang: ${rong.join(", ")}`);
			await c.query("BEGIN");
			for (const t of moi) await c.query(docSql(t));
			await c.query("COMMIT");
			const sau = await vanTay(c, bangCu);
			for (const b of bangCu) {
				const a = truoc.get(b);
				const z = sau.get(b);
				if (a.n !== z.n || a.h !== z.h)
					hong.push(
						`migration lam doi du lieu bang cu: ${b} (${a.n} -> ${z.n} dong)`,
					);
			}
			const bangMoi = (
				await c.query(
					`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`,
				)
			).rows
				.map((r) => r.table_name)
				.filter((b) => !bangCu.includes(b))
				.sort();
			const nguon = (
				await c.query(
					`SELECT count(*)::int AS n, count(*) FILTER (WHERE "source" <> 'tay')::int AS khac FROM "okrKeyResult"`,
				)
			).rows[0];
			if (nguon.n === 0 || nguon.khac !== 0)
				hong.push(
					`okrKeyResult.source sau migration: ${nguon.n} dong, ${nguon.khac} dong khac 'tay'`,
				);

			await c.query("BEGIN");
			const chup = (id, nguonSo) =>
				`INSERT INTO "okrSoChup" ("id","keyResultId","ngay","giaTri","nguon") VALUES ('${id}','k-mig','2026-10-20',3,'${nguonSo}')`;
			const loiMay1 = await thuLoi(c, chup("sc-1", "crm"));
			const loiMay2 = await thuLoi(c, chup("sc-2", "bang-tinh"));
			const loiTay1 = await thuLoi(c, chup("sc-3", "tay"));
			const loiTay2 = await thuLoi(c, chup("sc-4", "tay"));
			const loiXoa = await thuLoi(
				c,
				`DELETE FROM "okrKeyResult" WHERE "id" = 'k-mig'`,
			);
			await c.query("ROLLBACK");
			if (loiMay1 !== null)
				hong.push(`khong ghi duoc ban chup may dau tien: ${loiMay1}`);
			if (loiMay2 !== "23505")
				hong.push(
					`${CHI_MUC_MAY} khong chan hai ban chup may cung ngay (ma ${loiMay2 ?? "khong loi"})`,
				);
			if (loiTay1 !== null || loiTay2 !== null)
				hong.push(
					`${CHI_MUC_MAY} chan ca so tay cung ngay (ma ${loiTay1 ?? loiTay2})`,
				);
			if (loiXoa !== "23503")
				hong.push(
					`${GHIM.xoaLan}: xoa KR co ban chup khong bi chan (ma ${loiXoa ?? "khong loi"})`,
				);

			console.log(
				`kho tam ${kho}: ${bangCu.length} bang cu, gieo ${BANG_GIEO.map((b) => `${b}=${truoc.get(b)?.n ?? 0}`).join(" ")}; sau migration so dong va van tay khong doi; okrKeyResult ${nguon.n} dong, ${nguon.khac} dong source khac 'tay'; bang moi: ${bangMoi.join(", ") || "(khong co)"}; hai ban chup may cung ngay -> ${loiMay2 ?? "lot"}, hai so tay cung ngay -> ${loiTay1 ?? loiTay2 ?? "ghi duoc"}, xoa KR co ban chup -> ${loiXoa ?? "lot"}`,
			);
			return hong;
		});
	} finally {
		await voiKho("postgres", (c) =>
			c.query(`DROP DATABASE IF EXISTS "${kho}" WITH (FORCE)`),
		);
	}
}

const DOI_CHUNG = `CREATE TABLE "okrSoChup" (
    "id" TEXT NOT NULL,
    "keyResultId" TEXT NOT NULL,
    "ngay" DATE NOT NULL,
    "giaTri" DECIMAL(18,4) NOT NULL,
    "nguon" TEXT NOT NULL,
    CONSTRAINT "okrSoChup_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "${CHI_MUC_MAY}" ON "okrSoChup"("keyResultId", "ngay") WHERE ("nguon" IN ('crm', 'bang-tinh'));
ALTER TABLE "okrSoChup" ADD CONSTRAINT "okrSoChup_keyResultId_fkey" FOREIGN KEY ("keyResultId") REFERENCES "okrKeyResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
`;

function schemaXenGiua(schema) {
	const khoi = schema.match(/^model OkrSoChup \{[\s\S]*?^\}\n?/m)?.[0];
	if (!khoi) throw new Error("schema khong co model OkrSoChup de dung tep gia");
	const bo = schema.replace(khoi, "");
	const cacModel = [...bo.matchAll(/^model \w+ \{/gm)];
	const giua = cacModel[Math.floor(cacModel.length / 2)].index;
	return `${bo.slice(0, giua)}${khoi}\n${bo.slice(giua)}`;
}

function chieuDo() {
	const schema = SCHEMA_DINH;
	const tam = mkdtempSync(join(tmpdir(), "so-okr-mig-"));
	const bo = [
		{
			nhan: "ADD COLUMN tren okrKeyResult (bang cu)",
			sql: `${DOI_CHUNG}ALTER TABLE "okrKeyResult" ADD COLUMN "x" TEXT;\n`,
			schema,
			ma: 1,
			ghim: GHIM.addColumn,
		},
		{
			nhan: "ADD COLUMN tren okrSoChup (bang moi)",
			sql: `${DOI_CHUNG}ALTER TABLE "okrSoChup" ADD COLUMN "x" TEXT;\n`,
			schema,
			ma: 1,
			ghim: GHIM.addColumn,
		},
		{
			nhan: "DROP INDEX",
			sql: `${DOI_CHUNG}DROP INDEX "okrKeyResult_ownerUserId_idx";\n`,
			schema,
			ma: 1,
			ghim: GHIM.dropIndex,
		},
		{
			nhan: "model OkrSoChup giua tep",
			sql: DOI_CHUNG,
			schema: schemaXenGiua(schema),
			ma: 1,
			ghim: GHIM.lienKhoi,
		},
		{
			nhan: "ON DELETE CASCADE",
			sql: DOI_CHUNG.replace("ON DELETE RESTRICT", "ON DELETE CASCADE"),
			schema,
			ma: 1,
			ghim: GHIM.xoaLan,
		},
		{
			nhan: "chi muc mot phan vang khoi schema.prisma",
			sql: DOI_CHUNG,
			schema: schema.replace(
				/^\s*@@unique\(\[keyResultId, ngay\], map: "okrSoChup_may_mot_ngay".*\n/m,
				"",
			),
			ma: 1,
			ghim: GHIM.chiMucSchema,
		},
		{
			nhan: "doi chung duong",
			sql: DOI_CHUNG,
			schema,
			ma: 0,
			ghim: null,
		},
	];
	let dung = 0;
	try {
		bo.forEach((ca, i) => {
			const thu = join(tam, `gia-${i}`);
			mkdirSync(join(thu, "migrations", "20990101000000_gia"), {
				recursive: true,
			});
			writeFileSync(
				join(thu, "migrations", "20990101000000_gia", "migration.sql"),
				ca.sql,
			);
			writeFileSync(join(thu, "schema.prisma"), ca.schema);
			const r = spawnSync(process.execPath, [TEP, "--gia", thu], {
				encoding: "utf8",
			});
			const ra = `${r.stdout}${r.stderr}`.trim();
			const khop =
				r.status === ca.ma && (ca.ghim === null || ra.includes(ca.ghim));
			if (khop) dung += 1;
			console.log(
				`${ca.nhan}: exit ${r.status} (cho ${ca.ma}) ${khop ? "DUNG" : "SAI"}\n  ${ra.split("\n").join("\n  ")}`,
			);
		});
	} finally {
		rmSync(tam, { recursive: true, force: true });
	}
	console.log(`chieu do: ${dung}/${bo.length} ca dung nhu hua`);
	process.exit(dung === bo.length ? 1 : 0);
}

if (process.argv[2] === "--chieu-do") chieuDo();

if (process.argv[2] === "--gia") {
	const thu = process.argv[3];
	const moi = readdirSync(join(thu, "migrations")).sort();
	const { hong, dem } = soatTinh({
		moi,
		docSql: (t) =>
			readFileSync(join(thu, "migrations", t, "migration.sql"), "utf8"),
		schema: readFileSync(join(thu, "schema.prisma"), "utf8"),
	});
	console.log(`tep gia: ${moi.join(", ")} · so cau lenh: ${dem}`);
	for (const h of hong) console.log(h);
	process.exit(hong.length === 0 ? 0 : 1);
}

const moi = git("ls-tree", "--name-only", `${DINH}:${THU_MUC}`)
	.split("\n")
	.filter((t) => t !== "" && t !== "migration_lock.toml" && !cu.has(t))
	.filter(
		(t) =>
			spawnSync("git", [
				"-C",
				GOC,
				"cat-file",
				"-e",
				`${DINH}:${THU_MUC}/${t}/migration.sql`,
			]).status === 0,
	)
	.sort();
const docSql = (t) => git("show", `${DINH}:${THU_MUC}/${t}/migration.sql`);
const { hong, dem } = soatTinh({
	moi,
	docSql,
	schema: SCHEMA_DINH,
});

console.log(
	`goc so sanh: ${TRUOC}..${DINH} · migration moi: ${moi.join(", ") || "(khong co)"} · so cau lenh: ${dem}`,
);
if (moi.length === 0 || dem === 0) {
	console.log(
		`KHONG DO DUOC: khong co migration moi nao trong cap ${TRUOC}..${DINH}`,
	);
	process.exit(2);
}
hong.push(...(await chayTrenDuLieu(moi, docSql)));
for (const h of hong) console.log(h);
process.exit(hong.length === 0 ? 0 : 1);
