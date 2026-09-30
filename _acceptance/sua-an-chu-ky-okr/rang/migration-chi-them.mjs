import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
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
const MOC = "origin/onehub";
const MIGRATION_LUOT = "20261009010000_okr_an_chu_ky";
const CAU_CHO_PHEP = [
	/^ALTER TABLE "okrCycle" ADD COLUMN "anLuc" TIMESTAMP\(3\)$/,
	/^CREATE INDEX "[^"]+" ON "okrCycle"\(.+\)$/,
];
const CAU_THEM_COT =
	/^ALTER TABLE "okrCycle" ADD COLUMN "anLuc" TIMESTAMP\(3\)$/;
const GHIM = Object.freeze({
	addColumn: "migration khong chi them: ADD COLUMN",
	dropIndex: "migration khong chi them: DROP INDEX",
	doiDuLieu: "migration khong chi them: UPDATE",
	ngoaiTap: "migration khong chi them: cau ngoai tap cho phep",
	thieuCot: "thieu ADD COLUMN anLuc trong migration moi",
});

const git = (...d) =>
	execFileSync("git", ["-C", GOC, ...d], { encoding: "utf8" }).trim();

const MOC_CHUNG = git("merge-base", "HEAD", MOC);
const GOP_LUOT = git(
	"log",
	"--first-parent",
	"--diff-filter=A",
	"--format=%H",
	MOC_CHUNG,
	"--",
	`${THU_MUC}/${MIGRATION_LUOT}/migration.sql`,
)
	.split("\n")
	.at(-1);
const daGop = GOP_LUOT !== "";
const TRUOC = daGop ? git("rev-parse", `${GOP_LUOT}^1`) : MOC_CHUNG;
const lietKeTruoc = () =>
	git("ls-tree", "--name-only", `${TRUOC}:${THU_MUC}`)
		.split("\n")
		.filter((t) => t !== "" && t !== "migration_lock.toml");
const cu = new Set(lietKeTruoc());

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

function viPham(c) {
	if (CAU_CHO_PHEP.some((m) => m.test(c))) return null;
	const hoa = c.toUpperCase();
	const xoa = hoa.match(/^(UPDATE|DELETE|TRUNCATE|INSERT)\b/)?.[1];
	if (xoa)
		return `${GHIM.doiDuLieu.replace("UPDATE", xoa)} (${c.slice(0, 60)})`;
	const drop = hoa.match(/\bDROP\s+(\w+)/)?.[1];
	if (drop === "INDEX") return `${GHIM.dropIndex} (${c.slice(0, 60)})`;
	if (drop) return `migration khong chi them: DROP ${drop} (${c.slice(0, 60)})`;
	if (/ADD COLUMN/.test(hoa))
		return `${GHIM.addColumn} sai mau (${c.slice(0, 80)})`;
	return `${GHIM.ngoaiTap}: ${c.slice(0, 80)}`;
}

function soatTinh({ moi, docSql }) {
	const hong = [];
	let dem = 0;
	let themCot = 0;
	for (const t of moi) {
		for (const c of cauLenh(docSql(t))) {
			dem += 1;
			const v = viPham(c);
			if (v) hong.push(`${v} (${t})`);
			if (CAU_THEM_COT.test(c)) themCot += 1;
		}
	}
	if (themCot !== 1) hong.push(`${GHIM.thieuCot} (${themCot} cau)`);
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
	`INSERT INTO "division" ("id","name","position","headUserId","updatedAt") VALUES ('dv-mig','Khối đo',0,'u-mig',now())`,
	`INSERT INTO "department" ("id","name","position","divisionId","headUserId","updatedAt") VALUES ('dp-mig','Phòng đo',0,'dv-mig','u-mig',now())`,
	`INSERT INTO "orgPlacement" ("userId","primaryDepartmentId","updatedAt") VALUES ('u-mig','dp-mig',now())`,
	`INSERT INTO "okrCycle" ("id","kind","name","startsOn","endsOn","phase","updatedAt") VALUES ('cy-mig','quy','Quý đo','2026-10-01','2026-12-31','dang-chay',now())`,
	`INSERT INTO "okrCycle" ("id","kind","name","parentId","startsOn","endsOn","phase","updatedAt") VALUES ('cy-mig-con','thang','Tháng đo','cy-mig','2026-10-01','2026-10-31','dang-chay',now())`,
	`INSERT INTO "okrCycle" ("id","kind","name","startsOn","endsOn","phase","updatedAt") VALUES ('cy-mig-2','quy','Quý đo kế','2027-01-01','2027-03-31','lap-ke-hoach',now())`,
	`INSERT INTO "okrObjective" ("id","cycleId","level","departmentId","ownerUserId","kind","status","title","publishedAt","updatedAt") VALUES ('o-mig','cy-mig','phong-ban','dp-mig','u-mig','cam-ket','cong-bo','Mục tiêu đo migration',now(),now())`,
	`INSERT INTO "okrKeyResult" ("id","objectiveId","title","kind","ownerUserId","startValue","targetValue","currentValue","updatedAt") VALUES ('k-mig','o-mig','KR đo migration','tang-toi','u-mig',0,10,3,now())`,
	`INSERT INTO "okrCheckInSession" ("id","userId","entry","submittedAt","seconds") VALUES ('s-mig','u-mig','web',now(),42)`,
	`INSERT INTO "okrCheckIn" ("id","keyResultId","sessionId","weekStart","value","confidence","authorUserId","ownerUserId") VALUES ('ci-mig','k-mig','s-mig','2026-10-05',3,'dung-nhip','u-mig','u-mig')`,
];
const BANG_GIEO = [
	"okrCycle",
	"okrObjective",
	"okrKeyResult",
	"okrCheckInSession",
	"okrCheckIn",
];

async function cotCuaBang(c) {
	const r = await c.query(
		`SELECT c.table_name, c.column_name FROM information_schema.columns c JOIN information_schema.tables t ON t.table_schema = c.table_schema AND t.table_name = c.table_name WHERE c.table_schema = 'public' AND t.table_type = 'BASE TABLE' ORDER BY c.table_name, c.ordinal_position`,
	);
	const ra = new Map();
	for (const { table_name, column_name } of r.rows) {
		if (!ra.has(table_name)) ra.set(table_name, []);
		ra.get(table_name).push(column_name);
	}
	return ra;
}

async function vanTay(c, cot) {
	const ra = new Map();
	for (const [b, cacCot] of cot) {
		const dong = `ROW(${cacCot.map((k) => `t."${k}"`).join(",")})::text`;
		const r = await c.query(
			`SELECT count(*)::int AS n, md5(coalesce(string_agg(${dong}, '|' ORDER BY ${dong}), '')) AS h FROM "${b}" t`,
		);
		ra.set(b, { n: r.rows[0].n, h: r.rows[0].h });
	}
	return ra;
}

async function chayTrenDuLieu(moi, docSql) {
	const kho = `crm_akc_mig_${process.pid}`;
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
			const cot = await cotCuaBang(c);
			const truoc = await vanTay(c, cot);
			const rong = BANG_GIEO.filter((b) => (truoc.get(b)?.n ?? 0) === 0);
			if (rong.length > 0) hong.push(`gieo khong vao bang: ${rong.join(", ")}`);
			await c.query("BEGIN");
			for (const t of moi) await c.query(docSql(t));
			await c.query("COMMIT");
			const sau = await vanTay(c, cot);
			for (const b of cot.keys()) {
				const a = truoc.get(b);
				const z = sau.get(b);
				if (a.n !== z.n || a.h !== z.h)
					hong.push(
						`migration lam doi du lieu bang cu: ${b} (${a.n} -> ${z.n} dong)`,
					);
			}
			const cotSau = await cotCuaBang(c);
			const bangMoi = [...cotSau.keys()].filter((b) => !cot.has(b));
			if (bangMoi.length > 0)
				hong.push(`migration tao bang moi: ${bangMoi.join(", ")}`);
			for (const [b, cacCot] of cot) {
				const them = cotSau.get(b).filter((k) => !cacCot.includes(k));
				if (them.length > 0 && b !== "okrCycle")
					hong.push(`migration them cot vao bang la ${b}: ${them.join(", ")}`);
				if (them.length > 0 && b === "okrCycle" && them.join() !== "anLuc")
					hong.push(`migration them cot la vao okrCycle: ${them.join(", ")}`);
			}
			const dinhNghia = await c.query(
				`SELECT is_nullable, column_default, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'okrCycle' AND column_name = 'anLuc'`,
			);
			const d = dinhNghia.rows[0];
			if (!d) hong.push("okrCycle khong co cot anLuc sau migration");
			else if (d.is_nullable !== "YES" || d.column_default !== null)
				hong.push(
					`okrCycle.anLuc phai cho NULL va khong mac dinh (nullable=${d.is_nullable}, default=${d.column_default})`,
				);
			const khacNull = await c.query(
				`SELECT count(*)::int AS n FROM "okrCycle" WHERE "anLuc" IS NOT NULL`,
			);
			if (d && khacNull.rows[0].n !== 0)
				hong.push(
					`okrCycle co ${khacNull.rows[0].n} dong anLuc khac NULL sau migration`,
				);
			const soChuKy = sau.get("okrCycle")?.n ?? 0;
			const bangOkr = [...cot.keys()].filter((b) => b.startsWith("okr"));

			console.log(
				`kho tam ${kho}: ${cot.size} bang cu (${bangOkr.length} bang okr), gieo ${BANG_GIEO.map((b) => `${b}=${truoc.get(b)?.n ?? 0}`).join(" ")}; sau migration: okrCycle=${soChuKy} dong, anLuc khac NULL=${khacNull.rows[0].n}; bang moi: ${bangMoi.join(", ") || "(khong co)"}`,
			);
			return hong;
		});
	} finally {
		await voiKho("postgres", (c) =>
			c.query(`DROP DATABASE IF EXISTS "${kho}" WITH (FORCE)`),
		);
	}
}

const CAU_CHUAN = `ALTER TABLE "okrCycle" ADD COLUMN "anLuc" TIMESTAMP(3);\n`;

function chieuDo() {
	const tam = mkdtempSync(join(tmpdir(), "akc-mig-"));
	const bo = [
		{
			nhan: "ADD COLUMN NOT NULL DEFAULT now()",
			sql: `ALTER TABLE "okrCycle" ADD COLUMN "anLuc" TIMESTAMP(3) NOT NULL DEFAULT now();\n`,
			ma: 1,
			ghim: GHIM.addColumn,
		},
		{
			nhan: "UPDATE okrCycle",
			sql: `${CAU_CHUAN}UPDATE "okrCycle" SET "anLuc" = now();\n`,
			ma: 1,
			ghim: GHIM.doiDuLieu,
		},
		{
			nhan: "DROP INDEX",
			sql: `${CAU_CHUAN}DROP INDEX "okrCycle_startsOn_idx";\n`,
			ma: 1,
			ghim: GHIM.dropIndex,
		},
		{
			nhan: "CREATE INDEX tren bang khac",
			sql: `${CAU_CHUAN}CREATE INDEX "okrObjective_x_idx" ON "okrObjective"("title");\n`,
			ma: 1,
			ghim: GHIM.ngoaiTap,
		},
		{
			nhan: "doi chung duong",
			sql: CAU_CHUAN,
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
	});
	console.log(`tep gia: ${moi.join(", ")} · so cau lenh: ${dem}`);
	for (const h of hong) console.log(h);
	process.exit(hong.length === 0 ? 0 : 1);
}

const moi = readdirSync(join(GOC, THU_MUC), { withFileTypes: true })
	.filter((d) => d.isDirectory() && !cu.has(d.name))
	.filter((d) => !daGop || d.name === MIGRATION_LUOT)
	.map((d) => d.name)
	.filter((t) => existsSync(join(GOC, THU_MUC, t, "migration.sql")))
	.sort();
const docSql = (t) =>
	readFileSync(join(GOC, THU_MUC, t, "migration.sql"), "utf8");
const { hong, dem } = soatTinh({ moi, docSql });

console.log(
	`goc so sanh: ${daGop ? `${MIGRATION_LUOT} da gop o ${GOP_LUOT.slice(0, 8)}, do tren cha ${TRUOC.slice(0, 8)}` : `${MOC} (${TRUOC.slice(0, 8)})`} · migration moi: ${moi.join(", ") || "(khong co)"} · so cau lenh: ${dem}`,
);
if (moi.length === 0 || dem === 0) {
	console.log(`KHONG DO DUOC: khong co migration moi nao so voi ${MOC}`);
	process.exit(2);
}
hong.push(...(await chayTrenDuLieu(moi, docSql)));
for (const h of hong) console.log(h);
process.exit(hong.length === 0 ? 0 : 1);
