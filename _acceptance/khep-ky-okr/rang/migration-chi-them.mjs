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
const TEP_SCHEMA = "packages/db/prisma/schema.prisma";
const MOC = "origin/onehub";
const MIGRATION_LUOT = "20260930010000_okr_khep_ky";
const MODEL_MOI = [
	"OkrCuaSoRa",
	"OkrDoiDich",
	"OkrDiemKr",
	"OkrNhinLai",
	"OkrMangSang",
];
const BANG_OKR_CU = ["okrCycle", "okrObjective", "okrKeyResult"];
const KHOA_CAN = [
	"okrCuaSoRa.cycleId->okrCycle",
	"okrDoiDich.keyResultId->okrKeyResult",
	"okrDiemKr.keyResultId->okrKeyResult",
	"okrDiemKr.cycleId->okrCycle",
	"okrNhinLai.objectiveId->okrObjective",
	"okrMangSang.tuObjectiveId->okrObjective",
	"okrMangSang.sangObjectiveId->okrObjective",
	"okrMangSang.sangCycleId->okrCycle",
];
const GHIM = Object.freeze({
	addColumn: "migration khong chi them: ADD COLUMN",
	dropIndex: "migration khong chi them: DROP INDEX",
	lienKhoi: "nam model moi khong lien cuoi schema",
	xoaLan: "khoa ngoai toi bang OKR cu khong RESTRICT",
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
const docSchemaSau = () =>
	daGop
		? git("show", `${GOP_LUOT}:${TEP_SCHEMA}`)
		: readFileSync(join(GOC, TEP_SCHEMA), "utf8");
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
	if (/ADD COLUMN/.test(hoa)) return `ADD COLUMN (${bang})`;
	if (/^ALTER TABLE "[^"]+" ADD CONSTRAINT "[^"]+" FOREIGN KEY/.test(hoa))
		return cuBang
			? `ADD CONSTRAINT FOREIGN KEY tren bang co san (${bang})`
			: null;
	if (/^ALTER TABLE/.test(hoa))
		return `ALTER TABLE khac ADD CONSTRAINT FOREIGN KEY (${bang})`;
	if (/^CREATE TABLE/.test(hoa))
		return cuBang ? `CREATE TABLE trung bang co san (${bang})` : null;
	if (/^CREATE (UNIQUE )?INDEX/.test(hoa))
		return cuBang ? `CREATE INDEX tren bang co san (${bang})` : null;
	return `lenh la: ${c.slice(0, 60)}`;
}

function khoaNgoai(c) {
	const m = c.match(
		/^ALTER TABLE (?:ONLY )?"([^"]+)" ADD CONSTRAINT "[^"]+" FOREIGN KEY \("([^"]+)"\) REFERENCES "([^"]+)"/i,
	);
	if (!m) return null;
	const kieu = c
		.match(/ON DELETE (SET NULL|SET DEFAULT|NO ACTION|RESTRICT|CASCADE)/i)?.[1]
		?.toUpperCase();
	return { ten: `${m[1]}.${m[2]}->${m[3]}`, dich: m[3], kieu };
}

function soatTinh({ moi, docSql, schema }) {
	const hong = [];
	let dem = 0;
	const khoaToiCu = new Map();
	for (const t of moi) {
		for (const c of cauLenh(docSql(t))) {
			dem += 1;
			const v = viPham(c);
			if (v) hong.push(`migration khong chi them: ${v} (${t})`);
			const k = khoaNgoai(c);
			if (k && BANG_OKR_CU.includes(k.dich)) khoaToiCu.set(k.ten, k.kieu);
		}
	}
	for (const [ten, kieu] of khoaToiCu)
		if (kieu !== "RESTRICT")
			hong.push(
				`${GHIM.xoaLan}: ${ten} ON DELETE ${kieu ?? "(mac dinh)"}, phai RESTRICT`,
			);
	for (const ten of KHOA_CAN)
		if (!khoaToiCu.has(ten))
			hong.push(`thieu khoa ngoai ${ten} trong migration moi`);

	const models = [...schema.matchAll(/^model (\w+) \{/gm)].map((m) => m[1]);
	const cuoi = models.slice(-MODEL_MOI.length);
	const lechCuoi = MODEL_MOI.filter((m) => !cuoi.includes(m));
	if (lechCuoi.length > 0)
		hong.push(
			`${GHIM.lienKhoi}: ${MODEL_MOI.length} model cuoi la ${cuoi.join(", ")}; ${lechCuoi.join(", ")} nam cho khac${lechCuoi.some((m) => !models.includes(m)) ? " hoac khong co" : ""}`,
		);
	const dau = models.findIndex((m) => m.startsWith("Okr"));
	const sauOkr = dau === -1 ? [] : models.slice(dau).filter((m) => !m.startsWith("Okr"));
	if (dau === -1) hong.push("khong co model Okr nao");
	if (sauOkr.length > 0)
		hong.push(
			`${GHIM.lienKhoi}: sau model Okr dau tien con ${sauOkr.length} model khac (${sauOkr.slice(0, 3).join(", ")}${sauOkr.length > 3 ? ", …" : ""})`,
		);
	return { hong, dem, soKhoa: khoaToiCu.size };
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
	`INSERT INTO "okrCycle" ("id","kind","name","startsOn","endsOn","phase","updatedAt") VALUES ('cy-mig-2','quy','Quý đo kế','2027-01-01','2027-03-31','lap-ke-hoach',now())`,
	`INSERT INTO "okrObjective" ("id","cycleId","level","departmentId","ownerUserId","kind","status","title","publishedAt","updatedAt") VALUES ('o-mig','cy-mig','phong-ban','dp-mig','u-mig','cam-ket','cong-bo','Mục tiêu đo migration',now(),now())`,
	`INSERT INTO "okrObjective" ("id","cycleId","level","departmentId","ownerUserId","kind","status","title","publishedAt","updatedAt") VALUES ('o-mig-2','cy-mig','phong-ban','dp-mig','u-mig','cam-ket','cong-bo','Mục tiêu đo không KR',now(),now())`,
	`INSERT INTO "okrKeyResult" ("id","objectiveId","title","kind","ownerUserId","startValue","targetValue","currentValue","updatedAt") VALUES ('k-mig','o-mig','KR đo migration','tang-toi','u-mig',0,10,3,now())`,
	`INSERT INTO "okrKeyResult" ("id","objectiveId","title","kind","ownerUserId","startValue","targetValue","currentValue","position","updatedAt") VALUES ('k-mig-2','o-mig','KR đo migration hai','tang-toi','u-mig',0,20,5,1,now())`,
	`INSERT INTO "okrCheckInSession" ("id","userId","entry","submittedAt","seconds") VALUES ('s-mig','u-mig','web',now(),42)`,
	`INSERT INTO "okrCheckIn" ("id","keyResultId","sessionId","weekStart","value","confidence","authorUserId","ownerUserId") VALUES ('ci-mig','k-mig','s-mig','2026-10-05',3,'dung-nhip','u-mig','u-mig')`,
	`INSERT INTO "okrNguonKr" ("id","keyResultId","loai","taoBoiUserId","updatedAt") VALUES ('ng-mig','k-mig','crm','u-mig',now())`,
	`INSERT INTO "okrSoChup" ("id","keyResultId","ngay","giaTri","nguon") VALUES ('sc-mig','k-mig','2026-10-20',3,'crm')`,
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
	"okrNguonKr",
	"okrSoChup",
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

async function thuRoiBo(c, cau) {
	await c.query("SAVEPOINT thu");
	try {
		await c.query(cau);
		return null;
	} catch (e) {
		return e.code ?? "loi";
	} finally {
		await c.query("ROLLBACK TO SAVEPOINT thu");
	}
}

const XOA = {
	kr: `DELETE FROM "okrKeyResult" WHERE "id" = 'k-mig-2'`,
	mucTieu: `DELETE FROM "okrObjective" WHERE "id" = 'o-mig-2'`,
	chuKy: `DELETE FROM "okrCycle" WHERE "id" = 'cy-mig-2'`,
};
const GAN = [
	`INSERT INTO "okrCuaSoRa" ("id","cycleId","tuNgay","denNgay","moBoiUserId") VALUES ('cs-mig','cy-mig-2','2027-02-10','2027-02-17','u-mig')`,
	`INSERT INTO "okrDiemKr" ("id","keyResultId","cycleId","soChot","diemGoiY","thang","trongSoBat","phienBanChuongTrinh","updatedAt") VALUES ('dk-mig','k-mig-2','cy-mig',5,0.25,'0-1',false,1,now())`,
	`INSERT INTO "okrNhinLai" ("id","objectiveId","dieuHocDuoc","suaBoiUserId","suaLuc") VALUES ('nl-mig','o-mig-2','Điều học được đo','u-mig',now())`,
];

async function chayTrenDuLieu(moi, docSql) {
	const kho = `crm_kko_mig_${process.pid}`;
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

			await c.query("BEGIN");
			const doiChung = {};
			for (const [k, cau] of Object.entries(XOA))
				doiChung[k] = await thuRoiBo(c, cau);
			const loiGan = [];
			for (const cau of GAN) {
				const l = await thuRoiBo(c, cau);
				if (l !== null) loiGan.push(l);
				else await c.query(cau);
			}
			const chan = {};
			for (const [k, cau] of Object.entries(XOA))
				chan[k] = await thuRoiBo(c, cau);
			await c.query("ROLLBACK");
			for (const [k, l] of Object.entries(doiChung))
				if (l !== null)
					hong.push(`doi chung: xoa ${k} khi chua gan bang moi da loi (${l})`);
			if (loiGan.length > 0)
				hong.push(`khong ghi duoc dong vao bang moi: ${loiGan.join(", ")}`);
			for (const [k, l] of Object.entries(chan))
				if (l !== "23503")
					hong.push(
						`${GHIM.xoaLan}: xoa ${k} co dong bang moi khong bi chan (ma ${l ?? "khong loi"})`,
					);

			console.log(
				`kho tam ${kho}: ${bangCu.length} bang cu, gieo ${BANG_GIEO.map((b) => `${b}=${truoc.get(b)?.n ?? 0}`).join(" ")}; sau migration so dong va van tay khong doi; bang moi: ${bangMoi.join(", ") || "(khong co)"}; xoa truoc khi gan: ${Object.entries(doiChung).map(([k, l]) => `${k}=${l ?? "xoa duoc"}`).join(" ")}; xoa sau khi gan: ${Object.entries(chan).map(([k, l]) => `${k}=${l ?? "lot"}`).join(" ")}`,
			);
			return hong;
		});
	} finally {
		await voiKho("postgres", (c) =>
			c.query(`DROP DATABASE IF EXISTS "${kho}" WITH (FORCE)`),
		);
	}
}

const DOI_CHUNG = `CREATE TABLE "okrCuaSoRa" ("id" TEXT NOT NULL, "cycleId" TEXT NOT NULL, CONSTRAINT "okrCuaSoRa_pkey" PRIMARY KEY ("id"));
CREATE TABLE "okrDoiDich" ("id" TEXT NOT NULL, "keyResultId" TEXT NOT NULL, "cuaSoRaId" TEXT, CONSTRAINT "okrDoiDich_pkey" PRIMARY KEY ("id"));
CREATE TABLE "okrDiemKr" ("id" TEXT NOT NULL, "keyResultId" TEXT NOT NULL, "cycleId" TEXT NOT NULL, CONSTRAINT "okrDiemKr_pkey" PRIMARY KEY ("id"));
CREATE TABLE "okrNhinLai" ("id" TEXT NOT NULL, "objectiveId" TEXT NOT NULL, CONSTRAINT "okrNhinLai_pkey" PRIMARY KEY ("id"));
CREATE TABLE "okrMangSang" ("id" TEXT NOT NULL, "tuObjectiveId" TEXT NOT NULL, "sangObjectiveId" TEXT NOT NULL, "sangCycleId" TEXT NOT NULL, CONSTRAINT "okrMangSang_pkey" PRIMARY KEY ("id"));
CREATE INDEX "okrCuaSoRa_cycleId_idx" ON "okrCuaSoRa"("cycleId");
CREATE UNIQUE INDEX "okrDiemKr_keyResultId_key" ON "okrDiemKr"("keyResultId");
CREATE UNIQUE INDEX "okrMangSang_tuObjectiveId_sangCycleId_key" ON "okrMangSang"("tuObjectiveId", "sangCycleId");
ALTER TABLE "okrCuaSoRa" ADD CONSTRAINT "okrCuaSoRa_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "okrCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "okrDoiDich" ADD CONSTRAINT "okrDoiDich_keyResultId_fkey" FOREIGN KEY ("keyResultId") REFERENCES "okrKeyResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "okrDoiDich" ADD CONSTRAINT "okrDoiDich_cuaSoRaId_fkey" FOREIGN KEY ("cuaSoRaId") REFERENCES "okrCuaSoRa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "okrDiemKr" ADD CONSTRAINT "okrDiemKr_keyResultId_fkey" FOREIGN KEY ("keyResultId") REFERENCES "okrKeyResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "okrDiemKr" ADD CONSTRAINT "okrDiemKr_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "okrCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "okrNhinLai" ADD CONSTRAINT "okrNhinLai_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "okrObjective"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "okrMangSang" ADD CONSTRAINT "okrMangSang_tuObjectiveId_fkey" FOREIGN KEY ("tuObjectiveId") REFERENCES "okrObjective"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "okrMangSang" ADD CONSTRAINT "okrMangSang_sangObjectiveId_fkey" FOREIGN KEY ("sangObjectiveId") REFERENCES "okrObjective"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "okrMangSang" ADD CONSTRAINT "okrMangSang_sangCycleId_fkey" FOREIGN KEY ("sangCycleId") REFERENCES "okrCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
`;

function schemaXenGiua(schema) {
	const khoi = schema.match(/^model OkrMangSang \{[\s\S]*?^\}\n?/m)?.[0];
	if (!khoi)
		throw new Error("schema khong co model OkrMangSang de dung tep gia");
	const bo = schema.replace(khoi, "");
	const cacModel = [...bo.matchAll(/^model \w+ \{/gm)];
	const giua = cacModel[Math.floor(cacModel.length / 2)].index;
	return `${bo.slice(0, giua)}${khoi}\n${bo.slice(giua)}`;
}

function chieuDo() {
	const schema = docSchemaSau();
	const tam = mkdtempSync(join(tmpdir(), "kko-mig-"));
	const bo = [
		{
			nhan: "ADD COLUMN tren okrCycle (bang cu)",
			sql: `${DOI_CHUNG}ALTER TABLE "okrCycle" ADD COLUMN "x" TEXT;\n`,
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
			nhan: "model OkrMangSang giua tep",
			sql: DOI_CHUNG,
			schema: schemaXenGiua(schema),
			ma: 1,
			ghim: GHIM.lienKhoi,
		},
		{
			nhan: "ON DELETE CASCADE toi okrKeyResult",
			sql: DOI_CHUNG.replace(
				`"okrDiemKr_keyResultId_fkey" FOREIGN KEY ("keyResultId") REFERENCES "okrKeyResult"("id") ON DELETE RESTRICT`,
				`"okrDiemKr_keyResultId_fkey" FOREIGN KEY ("keyResultId") REFERENCES "okrKeyResult"("id") ON DELETE CASCADE`,
			),
			schema,
			ma: 1,
			ghim: GHIM.xoaLan,
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
	const { hong, dem, soKhoa } = soatTinh({
		moi,
		docSql: (t) =>
			readFileSync(join(thu, "migrations", t, "migration.sql"), "utf8"),
		schema: readFileSync(join(thu, "schema.prisma"), "utf8"),
	});
	console.log(
		`tep gia: ${moi.join(", ")} · so cau lenh: ${dem} · khoa ngoai toi bang OKR cu: ${soKhoa}`,
	);
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
const { hong, dem, soKhoa } = soatTinh({
	moi,
	docSql,
	schema: docSchemaSau(),
});

console.log(
	`goc so sanh: ${daGop ? `${MIGRATION_LUOT} da gop o ${GOP_LUOT.slice(0, 8)}, do tren cha ${TRUOC.slice(0, 8)}` : `${MOC} (${TRUOC.slice(0, 8)})`} · migration moi: ${moi.join(", ") || "(khong co)"} · so cau lenh: ${dem} · khoa ngoai toi bang OKR cu: ${soKhoa}/${KHOA_CAN.length}`,
);
if (moi.length === 0 || dem === 0) {
	console.log(`KHONG DO DUOC: khong co migration moi nao so voi ${MOC}`);
	process.exit(2);
}
hong.push(...(await chayTrenDuLieu(moi, docSql)));
for (const h of hong) console.log(h);
process.exit(hong.length === 0 ? 0 : 1);
