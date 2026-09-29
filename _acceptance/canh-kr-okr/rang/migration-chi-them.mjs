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
const MODEL_MOI = [
	"OkrViecKr",
	"OkrBangChung",
	"OkrGhiNhan",
	"OkrGhiNhanNhan",
	"OkrMau",
	"OkrMucTieuTuMau",
];
const BANG_MOI = [
	"okrViecKr",
	"okrBangChung",
	"okrGhiNhan",
	"okrGhiNhanNhan",
	"okrMau",
	"okrMucTieuTuMau",
];
const KHOA_NGOAI_VIET_TRUOC = [
	["okrViecKr", "keyResultId", "okrKeyResult", "RESTRICT"],
	["okrViecKr", "nguoiLamUserId", "user", "RESTRICT"],
	["okrViecKr", "campaignId", "campaign", "SET NULL"],
	["okrViecKr", "planId", "onboardingPlan", "SET NULL"],
	["okrViecKr", "taoBoiUserId", "user", "RESTRICT"],
	["okrBangChung", "keyResultId", "okrKeyResult", "RESTRICT"],
	["okrBangChung", "tacGiaUserId", "user", "RESTRICT"],
	["okrGhiNhan", "objectiveId", "okrObjective", "RESTRICT"],
	["okrGhiNhan", "keyResultId", "okrKeyResult", "RESTRICT"],
	["okrGhiNhan", "tacGiaUserId", "user", "RESTRICT"],
	["okrGhiNhanNhan", "ghiNhanId", "okrGhiNhan", "CASCADE"],
	["okrGhiNhanNhan", "userId", "user", "RESTRICT"],
	["okrMau", "taoBoiUserId", "user", "RESTRICT"],
	["okrMucTieuTuMau", "objectiveId", "okrObjective", "RESTRICT"],
	["okrMucTieuTuMau", "mauId", "okrMau", "RESTRICT"],
];
const GHIM = Object.freeze({
	addColumn: "migration khong chi them: ADD COLUMN",
	dropIndex: "migration khong chi them: DROP INDEX",
	lienKhoi: "nam model moi khong lien cuoi schema",
	khoaSai: "bang khoa ngoai rut tu SQL khong khop tap viet truoc",
});

const git = (...d) =>
	execFileSync("git", ["-C", GOC, ...d], { encoding: "utf8" }).trim();

const TRUOC = git("merge-base", "HEAD", MOC);
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
			.match(/ON DELETE (SET NULL|SET DEFAULT|NO ACTION|RESTRICT|CASCADE)/i)?.[1]
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
	if (drop) return `${GHIM.dropIndex.split(": ")[1]}${drop !== "INDEX" ? ` ${drop}` : ""} (${bang})`;
	if (/ALTER COLUMN|RENAME/.test(hoa)) return `ALTER COLUMN/RENAME (${bang})`;
	if (/ADD COLUMN/.test(hoa))
		return moiBang ? null : `${GHIM.addColumn.split(": ")[1]} (${bang})`;
	if (/^ALTER TABLE "[^"]+" ADD CONSTRAINT "[^"]+" FOREIGN KEY/.test(hoa))
		return moiBang ? null : `ADD CONSTRAINT FOREIGN KEY tren bang khong moi (${bang})`;
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
			hong.push(`thieu khoa ngoai viet truoc: ${r[0]}.${r[1]}->${r[2]} ${r[3]}`);
	for (const r of rut)
		if (!dungCanTo.has(chuan(r)))
			hong.push(`khoa ngoai ngoai tap viet truoc: ${r[0]}.${r[1]}->${r[2]} ${r[3]}`);
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
	const schema = readFileSync(join(GOC, TEP_SCHEMA), "utf8");
	const tam = mkdtempSync(join(tmpdir(), "canh-kr-mig-"));

	const DUNG = `-- CreateTable
CREATE TABLE "okrViecKr" ("id" TEXT NOT NULL, "keyResultId" TEXT NOT NULL, "campaignId" TEXT, "planId" TEXT, "nguoiLamUserId" TEXT, "taoBoiUserId" TEXT NOT NULL, CONSTRAINT "okrViecKr_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "okrBangChung" ("id" TEXT NOT NULL, "keyResultId" TEXT NOT NULL, "tacGiaUserId" TEXT NOT NULL, CONSTRAINT "okrBangChung_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "okrGhiNhan" ("id" TEXT NOT NULL, "objectiveId" TEXT NOT NULL, "keyResultId" TEXT, "tacGiaUserId" TEXT NOT NULL, CONSTRAINT "okrGhiNhan_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "okrGhiNhanNhan" ("ghiNhanId" TEXT NOT NULL, "userId" TEXT NOT NULL, CONSTRAINT "okrGhiNhanNhan_pkey" PRIMARY KEY ("ghiNhanId","userId"));
-- CreateTable
CREATE TABLE "okrMau" ("id" TEXT NOT NULL, "taoBoiUserId" TEXT NOT NULL, CONSTRAINT "okrMau_pkey" PRIMARY KEY ("id"));
-- CreateTable
CREATE TABLE "okrMucTieuTuMau" ("id" TEXT NOT NULL, "objectiveId" TEXT NOT NULL, "mauId" TEXT NOT NULL, CONSTRAINT "okrMucTieuTuMau_pkey" PRIMARY KEY ("id"));
-- CreateIndex
CREATE UNIQUE INDEX "okrMucTieuTuMau_objectiveId_key" ON "okrMucTieuTuMau"("objectiveId");
-- AddForeignKey
ALTER TABLE "okrViecKr" ADD CONSTRAINT "okrViecKr_keyResultId_fkey" FOREIGN KEY ("keyResultId") REFERENCES "okrKeyResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "okrViecKr" ADD CONSTRAINT "okrViecKr_nguoiLamUserId_fkey" FOREIGN KEY ("nguoiLamUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "okrViecKr" ADD CONSTRAINT "okrViecKr_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "okrViecKr" ADD CONSTRAINT "okrViecKr_planId_fkey" FOREIGN KEY ("planId") REFERENCES "onboardingPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "okrViecKr" ADD CONSTRAINT "okrViecKr_taoBoiUserId_fkey" FOREIGN KEY ("taoBoiUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "okrBangChung" ADD CONSTRAINT "okrBangChung_keyResultId_fkey" FOREIGN KEY ("keyResultId") REFERENCES "okrKeyResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "okrBangChung" ADD CONSTRAINT "okrBangChung_tacGiaUserId_fkey" FOREIGN KEY ("tacGiaUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "okrGhiNhan" ADD CONSTRAINT "okrGhiNhan_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "okrObjective"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "okrGhiNhan" ADD CONSTRAINT "okrGhiNhan_keyResultId_fkey" FOREIGN KEY ("keyResultId") REFERENCES "okrKeyResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "okrGhiNhan" ADD CONSTRAINT "okrGhiNhan_tacGiaUserId_fkey" FOREIGN KEY ("tacGiaUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "okrGhiNhanNhan" ADD CONSTRAINT "okrGhiNhanNhan_ghiNhanId_fkey" FOREIGN KEY ("ghiNhanId") REFERENCES "okrGhiNhan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "okrGhiNhanNhan" ADD CONSTRAINT "okrGhiNhanNhan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "okrMau" ADD CONSTRAINT "okrMau_taoBoiUserId_fkey" FOREIGN KEY ("taoBoiUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "okrMucTieuTuMau" ADD CONSTRAINT "okrMucTieuTuMau_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "okrObjective"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "okrMucTieuTuMau" ADD CONSTRAINT "okrMucTieuTuMau_mauId_fkey" FOREIGN KEY ("mauId") REFERENCES "okrMau"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
`;

	const bo = [
		{
			nhan: "ADD COLUMN tren okrComment (bang cu)",
			sql: `${DUNG}ALTER TABLE "okrComment" ADD COLUMN "x" TEXT;\n`,
			schema,
			ma: 1,
			ghim: GHIM.addColumn,
		},
		{
			nhan: "khoa ngoai toi campaign RESTRICT thay vi SET NULL",
			sql: DUNG.replace(
				`"okrViecKr_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaign"("id") ON DELETE SET NULL`,
				`"okrViecKr_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaign"("id") ON DELETE RESTRICT`,
			),
			schema,
			ma: 1,
			ghim: GHIM.khoaSai,
		},
		{
			nhan: "model moi (OkrMau) giua tep schema",
			sql: DUNG,
			schema: schemaXenGiua(schema),
			ma: 1,
			ghim: GHIM.lienKhoi,
		},
		{
			nhan: "DROP INDEX",
			sql: `${DUNG}DROP INDEX "okrMucTieuTuMau_objectiveId_key";\n`,
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
			const khop = r.status === ca.ma && (ca.ghim === null || ra.includes(ca.ghim));
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
	const khoi = schema.match(/^model OkrMau \{[\s\S]*?^\}\n?/m)?.[0];
	if (!khoi) throw new Error("schema khong co model OkrMau de dung tep gia");
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

const moi = readdirSync(join(GOC, THU_MUC), { withFileTypes: true })
	.filter((d) => d.isDirectory() && !cu.has(d.name))
	.map((d) => d.name)
	.sort();
const docSql = (t) => readFileSync(join(GOC, THU_MUC, t, "migration.sql"), "utf8");
const { hong, dem, soKhoa } = soatTinh({
	moi,
	docSql,
	schema: readFileSync(join(GOC, TEP_SCHEMA), "utf8"),
});

console.log(
	`goc so sanh: ${MOC} (${TRUOC.slice(0, 8)}) · migration moi: ${moi.join(", ") || "(khong co)"} · so cau lenh: ${dem} · khoa ngoai viet truoc khop: ${soKhoa}/${KHOA_NGOAI_VIET_TRUOC.length}`,
);
if (moi.length === 0 || dem === 0) {
	console.log(`KHONG DO DUOC: khong co migration moi nao so voi ${MOC}`);
	process.exit(2);
}
for (const h of hong) console.log(h);
process.exit(hong.length === 0 ? 0 : 1);
