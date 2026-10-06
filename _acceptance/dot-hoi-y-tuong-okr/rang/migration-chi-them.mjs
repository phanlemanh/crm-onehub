import { execFileSync, spawnSync } from "node:child_process";
import {
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP), "..", "..", "..");
const THU_MUC = "packages/db/prisma/migrations";
const TEP_SCHEMA = "packages/db/prisma/schema.prisma";
const MOC = "origin/onehub";
const MIGRATION_LUOT = "20261008010000_okr_hoi_y";
const MODEL_MOI = [
	"OkrHoiY",
	"OkrHoiYBanTruoc",
	"OkrY",
	"OkrYDongY",
	"OkrChuDe",
	"OkrHoiYHieu",
];
const BANG_MOI = [
	"okrHoiY",
	"okrHoiYBanTruoc",
	"okrY",
	"okrYDongY",
	"okrChuDe",
	"okrHoiYHieu",
];
const KHOA_NGOAI_VIET_TRUOC = [
	["okrHoiY", "cycleId", "okrCycle", "RESTRICT"],
	["okrHoiY", "nguoiChonUserId", "user", "RESTRICT"],
	["okrHoiY", "taoBoiUserId", "user", "RESTRICT"],
	["okrHoiYBanTruoc", "hoiYId", "okrHoiY", "RESTRICT"],
	["okrHoiYBanTruoc", "vietBoiUserId", "user", "RESTRICT"],
	["okrY", "hoiYId", "okrHoiY", "RESTRICT"],
	["okrY", "tacGiaUserId", "user", "RESTRICT"],
	["okrY", "chuDeId", "okrChuDe", "SET NULL"],
	["okrYDongY", "yId", "okrY", "CASCADE"],
	["okrYDongY", "userId", "user", "RESTRICT"],
	["okrChuDe", "hoiYId", "okrHoiY", "RESTRICT"],
	["okrChuDe", "objectiveId", "okrObjective", "RESTRICT"],
	["okrHoiYHieu", "hoiYId", "okrHoiY", "RESTRICT"],
	["okrHoiYHieu", "userId", "user", "RESTRICT"],
];
const GHIM = Object.freeze({
	addColumn: "migration khong chi them: ADD COLUMN",
	dropIndex: "migration khong chi them: DROP INDEX",
	lienKhoi: "sau model moi khong lien cuoi schema",
	khoaSai: "bang khoa ngoai rut tu SQL khong khop tap viet truoc",
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
const lietKeSau = () =>
	daGop
		? git("ls-tree", "--name-only", `${GOP_LUOT}:${THU_MUC}`)
				.split("\n")
				.filter((t) => t !== "" && t !== "migration_lock.toml")
		: readdirSync(join(GOC, THU_MUC), { withFileTypes: true })
				.filter((d) => d.isDirectory())
				.map((d) => d.name);
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

function bangCua(c) {
	return (
		c.match(/^ALTER TABLE (?:ONLY )?"([^"]+)"/i)?.[1] ??
		c.match(/^CREATE TABLE (?:IF NOT EXISTS )?"([^"]+)"/i)?.[1] ??
		c.match(/\bON "([^"]+)"/i)?.[1] ??
		""
	);
}

function khoaNgoai(c) {
	const m = c.match(
		/^ALTER TABLE (?:ONLY )?"([^"]+)" ADD CONSTRAINT "[^"]+" FOREIGN KEY \("([^"]+)"\) REFERENCES "([^"]+)"/i,
	);
	if (!m) return null;
	const kieu =
		c
			.match(
				/ON DELETE (SET NULL|SET DEFAULT|NO ACTION|RESTRICT|CASCADE)/i,
			)?.[1]
			?.toUpperCase() ?? "RESTRICT";
	return { bang: m[1], cot: m[2], toi: m[3], kieu };
}

function viPham(c) {
	const hoa = c.toUpperCase();
	const bang = bangCua(c);
	const moiBang = BANG_MOI.includes(bang);
	const xoa = hoa.match(/^(UPDATE|DELETE|TRUNCATE)\b/)?.[1];
	if (xoa) return `${xoa} (${bang})`;
	const drop = hoa.match(/\bDROP\s+(\w+)/)?.[1];
	if (drop)
		return `${GHIM.dropIndex.split(": ")[1]}${drop !== "INDEX" ? ` ${drop}` : ""} (${bang})`;
	if (/ALTER COLUMN|RENAME/.test(hoa)) return `ALTER COLUMN/RENAME (${bang})`;
	if (/ADD COLUMN/.test(hoa))
		return moiBang ? null : `${GHIM.addColumn.split(": ")[1]} (${bang})`;
	if (/^ALTER TABLE "[^"]+" ADD CONSTRAINT "[^"]+" FOREIGN KEY/.test(hoa))
		return moiBang
			? null
			: `ADD CONSTRAINT FOREIGN KEY tren bang khong moi (${bang})`;
	if (/^ALTER TABLE/.test(hoa)) return `ALTER TABLE khac (${bang})`;
	if (/^CREATE TABLE/.test(hoa))
		return moiBang ? null : `CREATE TABLE tren bang khong moi (${bang})`;
	if (/^CREATE (UNIQUE )?INDEX/.test(hoa))
		return moiBang ? null : `CREATE INDEX tren bang khong moi (${bang})`;
	return `lenh la: ${c.slice(0, 60)}`;
}

function soSanhKhoa(rut) {
	const chuan = (r) => r.join("|");
	const dungCanTo = new Set(KHOA_NGOAI_VIET_TRUOC.map(chuan));
	const rutCanTo = new Set(rut.map(chuan));
	const hong = [];
	for (const r of KHOA_NGOAI_VIET_TRUOC)
		if (!rutCanTo.has(chuan(r)))
			hong.push(
				`thieu khoa ngoai viet truoc: ${r[0]}.${r[1]}->${r[2]} ${r[3]}`,
			);
	for (const r of rut)
		if (!dungCanTo.has(chuan(r)))
			hong.push(
				`khoa ngoai ngoai tap viet truoc: ${r[0]}.${r[1]}->${r[2]} ${r[3]}`,
			);
	return hong;
}

function soatTinh({ moi, docSql, schema }) {
	const hong = [];
	let dem = 0;
	const khoaRut = [];
	for (const t of moi) {
		for (const c of cauLenh(docSql(t))) {
			dem += 1;
			const v = viPham(c);
			if (v) hong.push(`migration khong chi them: ${v}`);
			const k = khoaNgoai(c);
			if (k) khoaRut.push([k.bang, k.cot, k.toi, k.kieu]);
		}
	}
	hong.push(...soSanhKhoa(khoaRut).map((h) => `${GHIM.khoaSai}: ${h}`));

	const models = [...schema.matchAll(/^model (\w+) \{/gm)].map((m) => m[1]);
	const cuoi = models.slice(-MODEL_MOI.length);
	const lechCuoi = MODEL_MOI.filter((m) => !cuoi.includes(m));
	if (lechCuoi.length > 0)
		hong.push(
			`${GHIM.lienKhoi}: ${MODEL_MOI.length} model cuoi la ${cuoi.join(", ")}; ${lechCuoi.join(", ")} nam cho khac${lechCuoi.some((m) => !models.includes(m)) ? " hoac khong co" : ""}`,
		);
	return { hong, dem, soKhoa: khoaRut.length };
}

function chieuDo() {
	const schema = docSchemaSau();
	const tam = mkdtempSync(join(tmpdir(), "hoi-y-mig-"));

	const DUNG = `-- CreateTable
CREATE TABLE "okrHoiY" ("id" TEXT NOT NULL, "cycleId" TEXT NOT NULL, "nguoiChonUserId" TEXT NOT NULL, "taoBoiUserId" TEXT NOT NULL, CONSTRAINT "okrHoiY_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "okrHoiYBanTruoc" ("id" TEXT NOT NULL, "hoiYId" TEXT NOT NULL, "vietBoiUserId" TEXT NOT NULL, CONSTRAINT "okrHoiYBanTruoc_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "okrY" ("id" TEXT NOT NULL, "hoiYId" TEXT NOT NULL, "tacGiaUserId" TEXT NOT NULL, "chuDeId" TEXT, CONSTRAINT "okrY_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "okrYDongY" ("yId" TEXT NOT NULL, "userId" TEXT NOT NULL, CONSTRAINT "okrYDongY_pkey" PRIMARY KEY ("yId","userId"));
-- CreateTable
CREATE TABLE "okrChuDe" ("id" TEXT NOT NULL, "hoiYId" TEXT NOT NULL, "objectiveId" TEXT, CONSTRAINT "okrChuDe_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "okrHoiYHieu" ("hoiYId" TEXT NOT NULL, "userId" TEXT NOT NULL, CONSTRAINT "okrHoiYHieu_pkey" PRIMARY KEY ("hoiYId","userId"));
-- CreateIndex
CREATE UNIQUE INDEX "okrHoiY_cycleId_key" ON "okrHoiY"("cycleId");
-- CreateIndex
CREATE UNIQUE INDEX "okrChuDe_objectiveId_key" ON "okrChuDe"("objectiveId");
-- CreateIndex
CREATE INDEX "okrY_chuDeId_idx" ON "okrY"("chuDeId");
-- AddForeignKey
ALTER TABLE "okrHoiY" ADD CONSTRAINT "okrHoiY_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "okrCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "okrHoiY" ADD CONSTRAINT "okrHoiY_nguoiChonUserId_fkey" FOREIGN KEY ("nguoiChonUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "okrHoiY" ADD CONSTRAINT "okrHoiY_taoBoiUserId_fkey" FOREIGN KEY ("taoBoiUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "okrHoiYBanTruoc" ADD CONSTRAINT "okrHoiYBanTruoc_hoiYId_fkey" FOREIGN KEY ("hoiYId") REFERENCES "okrHoiY"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "okrHoiYBanTruoc" ADD CONSTRAINT "okrHoiYBanTruoc_vietBoiUserId_fkey" FOREIGN KEY ("vietBoiUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "okrY" ADD CONSTRAINT "okrY_hoiYId_fkey" FOREIGN KEY ("hoiYId") REFERENCES "okrHoiY"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "okrY" ADD CONSTRAINT "okrY_tacGiaUserId_fkey" FOREIGN KEY ("tacGiaUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "okrY" ADD CONSTRAINT "okrY_chuDeId_fkey" FOREIGN KEY ("chuDeId") REFERENCES "okrChuDe"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "okrYDongY" ADD CONSTRAINT "okrYDongY_yId_fkey" FOREIGN KEY ("yId") REFERENCES "okrY"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "okrYDongY" ADD CONSTRAINT "okrYDongY_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "okrChuDe" ADD CONSTRAINT "okrChuDe_hoiYId_fkey" FOREIGN KEY ("hoiYId") REFERENCES "okrHoiY"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "okrChuDe" ADD CONSTRAINT "okrChuDe_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "okrObjective"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "okrHoiYHieu" ADD CONSTRAINT "okrHoiYHieu_hoiYId_fkey" FOREIGN KEY ("hoiYId") REFERENCES "okrHoiY"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "okrHoiYHieu" ADD CONSTRAINT "okrHoiYHieu_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
`;

	const bo = [
		{
			nhan: "ADD COLUMN tren okrObjective (bang cu)",
			sql: `${DUNG}ALTER TABLE "okrObjective" ADD COLUMN "x" TEXT;\n`,
			schema,
			ma: 1,
			ghim: GHIM.addColumn,
		},
		{
			nhan: "khoa ngoai toi okrObjective CASCADE thay vi RESTRICT",
			sql: DUNG.replace(
				`"okrChuDe_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "okrObjective"("id") ON DELETE RESTRICT`,
				`"okrChuDe_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "okrObjective"("id") ON DELETE CASCADE`,
			),
			schema,
			ma: 1,
			ghim: GHIM.khoaSai,
		},
		{
			nhan: "model moi (OkrY) giua tep schema",
			sql: DUNG,
			schema: schemaXenGiua(schema),
			ma: 1,
			ghim: GHIM.lienKhoi,
		},
		{
			nhan: "DROP INDEX",
			sql: `${DUNG}DROP INDEX "okrChuDe_objectiveId_key";\n`,
			schema,
			ma: 1,
			ghim: GHIM.dropIndex,
		},
		{
			nhan: "dung nhu that",
			sql: DUNG,
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

function schemaXenGiua(schema) {
	const khoi = schema.match(/^model OkrY \{[\s\S]*?^\}\n?/m)?.[0];
	if (!khoi) throw new Error("schema khong co model OkrY de dung tep gia");
	const bo = schema.replace(khoi, "");
	const cacModel = [...bo.matchAll(/^model \w+ \{/gm)];
	const giua = cacModel[Math.floor(cacModel.length / 2)].index;
	return `${bo.slice(0, giua)}${khoi}\n${bo.slice(giua)}`;
}

if (process.argv[2] === "--chieu-do") chieuDo();

if (process.argv[2] === "--gia") {
	const thu = process.argv[3];
	const moiThu = readdirSync(join(thu, "migrations")).sort();
	const { hong, dem, soKhoa } = soatTinh({
		moi: moiThu,
		docSql: (t) =>
			readFileSync(join(thu, "migrations", t, "migration.sql"), "utf8"),
		schema: readFileSync(join(thu, "schema.prisma"), "utf8"),
	});
	console.log(
		`tep gia: ${moiThu.join(", ")} · so cau lenh: ${dem} · khoa ngoai rut duoc: ${soKhoa}`,
	);
	for (const h of hong) console.log(h);
	process.exit(hong.length === 0 ? 0 : 1);
}

const moi = lietKeSau()
	.filter((t) => !cu.has(t))
	.sort();
const docSql = (t) =>
	daGop
		? git("show", `${GOP_LUOT}:${THU_MUC}/${t}/migration.sql`)
		: readFileSync(join(GOC, THU_MUC, t, "migration.sql"), "utf8");
const { hong, dem, soKhoa } = soatTinh({
	moi,
	docSql,
	schema: docSchemaSau(),
});

console.log(
	`goc so sanh: ${daGop ? `${MIGRATION_LUOT} da gop o ${GOP_LUOT.slice(0, 8)}, do tren cha ${TRUOC.slice(0, 8)}` : `${MOC} (${TRUOC.slice(0, 8)})`} · migration moi: ${moi.join(", ") || "(khong co)"} · so cau lenh: ${dem} · khoa ngoai viet truoc khop: ${soKhoa}/${KHOA_NGOAI_VIET_TRUOC.length}`,
);
if (moi.length === 0 || dem === 0) {
	console.log(`khong co migration moi nao so voi ${MOC}`);
	process.exit(1);
}
for (const h of hong) console.log(h);
process.exit(hong.length === 0 ? 0 : 1);
