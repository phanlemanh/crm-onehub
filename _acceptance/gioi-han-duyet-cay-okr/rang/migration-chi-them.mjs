import { spawnSync } from "node:child_process";
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
const MIGRATION_TINH_NANG = ["20261008010000_okr_hien_thi_duyet"];
const MODEL_MOI = ["OkrNguoiXem"];
const BANG_MOI = ["okrNguoiXem"];
const COT_THEM_VIET_TRUOC = [
	["okrObjective", "hienThi", "'cong-khai'"],
	["okrProgramConfig", "duyetCongBo", "false"],
];
const CHI_MUC_TREN_BANG_CU_VIET_TRUOC = [
	["okrObjective", ["cycleId", "hienThi"]],
];
const KHOA_NGOAI_VIET_TRUOC = [
	["okrNguoiXem", "objectiveId", "okrObjective", "CASCADE"],
	["okrNguoiXem", "userId", "user", "RESTRICT"],
	["okrNguoiXem", "createdById", "user", "RESTRICT"],
];
const GHIM = Object.freeze({
	addColumn: "migration khong chi them: ADD COLUMN",
	dropIndex: "migration khong chi them: DROP INDEX",
	coMat: "model moi khong co mat dung mot lan trong schema",
	khoaSai: "bang khoa ngoai rut tu SQL khong khop tap viet truoc",
	cotSai: "cot them ngoai tap viet truoc",
});

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
		c.match(/^(?:UPDATE|DELETE FROM|TRUNCATE(?: TABLE)?) "([^"]+)"/i)?.[1] ??
		c.match(/\bON "([^"]+)"/i)?.[1] ??
		c.match(/^DROP INDEX "([^"]+)"/i)?.[1] ??
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

function cotThem(c) {
	const m = c.match(
		/^ALTER TABLE "([^"]+)" ADD COLUMN "([^"]+)" .*?\bDEFAULT ((?:'[^']*')|\w+)$/i,
	);
	return m ? [m[1], m[2], m[3]] : null;
}

function chiMuc(c) {
	const m = c.match(
		/^CREATE (?:UNIQUE )?INDEX "[^"]+" ON "([^"]+)"\(([^)]*)\)$/i,
	);
	if (!m) return null;
	return [m[1], [...m[2].matchAll(/"([^"]+)"/g)].map((x) => x[1])];
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
	if (/ADD COLUMN/.test(hoa)) {
		if (moiBang) return null;
		if (!/\bDEFAULT\b/.test(hoa))
			return `${GHIM.addColumn.split(": ")[1]} khong DEFAULT (${bang})`;
		const k = cotThem(c);
		const trung =
			k &&
			COT_THEM_VIET_TRUOC.some(
				(v) =>
					v[0] === k[0] &&
					v[1] === k[1] &&
					v[2].toLowerCase() === k[2].toLowerCase(),
			);
		return trung ? null : `${GHIM.cotSai}: ${c.slice(0, 80)}`;
	}
	if (/^ALTER TABLE "[^"]+" ADD CONSTRAINT "[^"]+" FOREIGN KEY/.test(hoa))
		return moiBang
			? null
			: `ADD CONSTRAINT FOREIGN KEY tren bang khong moi (${bang})`;
	if (/^ALTER TABLE/.test(hoa)) return `ALTER TABLE khac (${bang})`;
	if (/^CREATE TABLE/.test(hoa))
		return moiBang ? null : `CREATE TABLE tren bang khong moi (${bang})`;
	if (/^CREATE (UNIQUE )?INDEX/.test(hoa)) {
		if (moiBang) return null;
		const m = chiMuc(c);
		const trung =
			m &&
			CHI_MUC_TREN_BANG_CU_VIET_TRUOC.some(
				(v) => v[0] === m[0] && v[1].join(",") === m[1].join(","),
			);
		return trung ? null : `CREATE INDEX tren bang khong moi (${bang})`;
	}
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
	const cotRut = [];
	for (const t of moi) {
		for (const c of cauLenh(docSql(t))) {
			dem += 1;
			const v = viPham(c);
			if (v) hong.push(`migration khong chi them: ${v}`);
			const k = khoaNgoai(c);
			if (k) khoaRut.push([k.bang, k.cot, k.toi, k.kieu]);
			const ct = cotThem(c);
			if (ct && !BANG_MOI.includes(ct[0])) cotRut.push(ct[0] + "." + ct[1]);
		}
	}
	hong.push(...soSanhKhoa(khoaRut).map((h) => `${GHIM.khoaSai}: ${h}`));
	const cotDung = COT_THEM_VIET_TRUOC.map((v) => `${v[0]}.${v[1]}`).sort();
	if (cotRut.slice().sort().join("|") !== cotDung.join("|"))
		hong.push(
			`${GHIM.cotSai}: can dung ${cotDung.join(", ")}, that ${cotRut.join(", ") || "(khong co)"}`,
		);

	const models = [...schema.matchAll(/^model (\w+) \{/gm)].map((m) => m[1]);
	for (const m of MODEL_MOI) {
		const soLan = models.filter((x) => x === m).length;
		if (soLan !== 1) hong.push(`${GHIM.coMat}: ${m} co ${soLan} lan`);
	}
	return { hong, dem, soKhoa: khoaRut.length };
}

function chieuDo() {
	const schema = readFileSync(join(GOC, TEP_SCHEMA), "utf8");
	const tam = mkdtempSync(join(tmpdir(), "hien-thi-mig-"));

	const DUNG = `-- AlterTable
ALTER TABLE "okrProgramConfig" ADD COLUMN     "duyetCongBo" BOOLEAN NOT NULL DEFAULT false;
-- AlterTable
ALTER TABLE "okrObjective" ADD COLUMN     "hienThi" TEXT NOT NULL DEFAULT 'cong-khai';
-- CreateTable
CREATE TABLE "okrNguoiXem" ("objectiveId" TEXT NOT NULL, "userId" TEXT NOT NULL, "createdById" TEXT NOT NULL, CONSTRAINT "okrNguoiXem_pkey" PRIMARY KEY ("objectiveId","userId"));
-- CreateIndex
CREATE INDEX "okrNguoiXem_userId_idx" ON "okrNguoiXem"("userId");
-- CreateIndex
CREATE INDEX "okrObjective_cycleId_hienThi_idx" ON "okrObjective"("cycleId", "hienThi");
-- AddForeignKey
ALTER TABLE "okrNguoiXem" ADD CONSTRAINT "okrNguoiXem_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "okrObjective"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "okrNguoiXem" ADD CONSTRAINT "okrNguoiXem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "okrNguoiXem" ADD CONSTRAINT "okrNguoiXem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
`;

	const bo = [
		{
			nhan: "UPDATE okrObjective them vao migration",
			sql: `${DUNG}UPDATE "okrObjective" SET "hienThi" = 'gioi-han';\n`,
			schema,
			ma: 1,
			ghim: "UPDATE (okrObjective)",
		},
		{
			nhan: "ADD COLUMN khong DEFAULT tren okrObjective",
			sql: `${DUNG}ALTER TABLE "okrObjective" ADD COLUMN "x" TEXT;\n`,
			schema,
			ma: 1,
			ghim: GHIM.addColumn,
		},
		{
			nhan: "cot hienThi mac dinh sai",
			sql: DUNG.replace(`DEFAULT 'cong-khai'`, `DEFAULT 'gioi-han'`),
			schema,
			ma: 1,
			ghim: GHIM.cotSai,
		},
		{
			nhan: "khoa ngoai toi user CASCADE thay vi RESTRICT",
			sql: DUNG.replace(
				`"okrNguoiXem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT`,
				`"okrNguoiXem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE`,
			),
			schema,
			ma: 1,
			ghim: GHIM.khoaSai,
		},
		{
			nhan: "DROP INDEX",
			sql: `${DUNG}DROP INDEX "okrNguoiXem_userId_idx";\n`,
			schema,
			ma: 1,
			ghim: GHIM.dropIndex,
		},
		{
			nhan: "schema thieu model OkrNguoiXem",
			sql: DUNG,
			schema: schemaBoModel(schema),
			ma: 1,
			ghim: GHIM.coMat,
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

function schemaBoModel(schema) {
	const khoi = schema.match(/^model OkrNguoiXem \{[\s\S]*?^\}\n?/m)?.[0];
	if (!khoi)
		throw new Error("schema khong co model OkrNguoiXem de dung tep gia");
	return schema.replace(khoi, "");
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

const coThat = new Set(
	readdirSync(join(GOC, THU_MUC), { withFileTypes: true })
		.filter((d) => d.isDirectory())
		.map((d) => d.name),
);
const thieu = MIGRATION_TINH_NANG.filter((t) => !coThat.has(t));
if (thieu.length > 0) {
	console.log(
		`KHONG DO DUOC: khong thay migration cua tinh nang: ${thieu.join(", ")}`,
	);
	process.exit(2);
}
const moi = [...MIGRATION_TINH_NANG];
const docSql = (t) =>
	readFileSync(join(GOC, THU_MUC, t, "migration.sql"), "utf8");
const { hong, dem, soKhoa } = soatTinh({
	moi,
	docSql,
	schema: readFileSync(join(GOC, TEP_SCHEMA), "utf8"),
});

console.log(
	`migration cua tinh nang: ${moi.join(", ")} · so cau lenh: ${dem} · khoa ngoai viet truoc khop: ${soKhoa}/${KHOA_NGOAI_VIET_TRUOC.length}`,
);
if (moi.length === 0 || dem === 0) {
	console.log(`KHONG DO DUOC: migration cua tinh nang khong co cau lenh nao`);
	process.exit(2);
}
for (const h of hong) console.log(h);
process.exit(hong.length === 0 ? 0 : 1);
