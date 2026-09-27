import { execFileSync } from "node:child_process";
import {
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC =
	process.env.GOC_KHO ??
	join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const THU_MUC =
	process.env.THU_MUC_MIGRATION ?? join(GOC, "packages/db/prisma/migrations");
const TEP_SCHEMA =
	process.env.TEP_SCHEMA ?? join(GOC, "packages/db/prisma/schema.prisma");
const NHANH = process.env.NHANH_GOC ?? "origin/onehub";
const MODEL_MOI = [
	"OkrDeXuat",
	"OkrTomTat",
	"OkrTomTatPhanHoi",
	"AiChiPhi",
	"AiDoiSoat",
	"AiBaoTran",
];
const BANG_MOI = [
	"okrDeXuat",
	"okrTomTat",
	"okrTomTatPhanHoi",
	"aiChiPhi",
	"aiDoiSoat",
	"aiBaoTran",
];
const COT_MOI = {
	okrProgramConfig: [
		"aiOn",
		"aiDeXuatPhamVi",
		"aiDeXuatDonVi",
		"aiTomTatPhamVi",
		"aiTomTatDonVi",
		"aiTranThangUsd",
	],
	notificationPreference: ["dongTroLyOkr"],
};
const GHIM = {
	khongChiThem: "migration khong chi them",
	chiMucAgentTask: "chi muc moi tren agentTask",
	thieuBang: "thieu bang",
	thieuCot: "thieu cot",
	lienKhoi: "model moi khong nam cuoi schema",
};

const git = (...d) =>
	execFileSync("git", ["-C", GOC, ...d], { encoding: "utf8" });
const nen = git("merge-base", "HEAD", NHANH).trim();
const cu = new Set(
	git("ls-tree", "--name-only", `${nen}:packages/db/prisma/migrations`)
		.split("\n")
		.filter((t) => t && t !== "migration_lock.toml"),
);
const moi = readdirSync(THU_MUC).filter(
	(t) => t !== "migration_lock.toml" && !cu.has(t),
);

function cauLenh(sql) {
	return sql
		.split("\n")
		.filter((d) => !d.trim().startsWith("--"))
		.join("\n")
		.split(";")
		.map((c) => c.replace(/\s+/g, " ").trim())
		.filter(Boolean);
}

const hong = [];
const cotThay = {
	okrProgramConfig: new Set(),
	notificationPreference: new Set(),
};
const bangThay = new Set();
let dem = 0;

function soat(c) {
	dem += 1;
	const hoa = c.toUpperCase();
	if (/"AGENTTASK"/.test(hoa))
		return hong.push(`${GHIM.chiMucAgentTask}: ${c.slice(0, 80)}`);
	if (/^(UPDATE|DELETE|TRUNCATE)\b|\bDROP\b|ALTER COLUMN|RENAME/.test(hoa))
		return hong.push(
			`${GHIM.khongChiThem}: ${hoa.match(/UPDATE|DELETE|TRUNCATE|DROP \w+|ALTER COLUMN|RENAME/)?.[0]}`,
		);
	const tao = c.match(/^CREATE TABLE "([^"]+)"/);
	if (tao) {
		if (!BANG_MOI.includes(tao[1]))
			return hong.push(
				`${GHIM.khongChiThem}: CREATE TABLE ngoai danh sach (${tao[1]})`,
			);
		return bangThay.add(tao[1]);
	}
	const chiMuc = c.match(/^CREATE (?:UNIQUE )?INDEX "[^"]+" ON "([^"]+)"/);
	if (chiMuc) {
		if (!BANG_MOI.includes(chiMuc[1]))
			return hong.push(
				`${GHIM.khongChiThem}: CREATE INDEX tren bang co san (${chiMuc[1]})`,
			);
		return;
	}
	const sua = c.match(/^ALTER TABLE "([^"]+)" (.*)$/);
	if (sua && sua[1] in COT_MOI) {
		for (const phan of sua[2].split(/,\s*(?=ADD COLUMN)/)) {
			const m = phan.match(/^ADD COLUMN "([^"]+)" (.*)$/);
			if (!m)
				return hong.push(
					`${GHIM.khongChiThem}: ALTER TABLE ${sua[1]} ${phan.slice(0, 40)}`,
				);
			if (!/ DEFAULT /i.test(` ${m[2]} `))
				return hong.push(`${GHIM.khongChiThem}: cot ${m[1]} khong co DEFAULT`);
			cotThay[sua[1]].add(m[1]);
		}
		return;
	}
	return hong.push(`${GHIM.khongChiThem}: lenh la ${c.slice(0, 60)}`);
}

if (moi.length === 0) hong.push(`${GHIM.thieuBang}: khong co migration moi`);
for (const t of moi)
	for (const c of cauLenh(
		readFileSync(join(THU_MUC, t, "migration.sql"), "utf8"),
	))
		soat(c);
for (const b of BANG_MOI)
	if (!bangThay.has(b)) hong.push(`${GHIM.thieuBang}: ${b}`);
for (const [bang, cot] of Object.entries(COT_MOI))
	for (const k of cot)
		if (!cotThay[bang].has(k)) hong.push(`${GHIM.thieuCot}: ${bang}.${k}`);

const schema = readFileSync(TEP_SCHEMA, "utf8");
const models = [...schema.matchAll(/^model (\w+) \{/gm)].map((m) => m[1]);
const duoi = models.slice(-MODEL_MOI.length);
if (duoi.join(",") !== MODEL_MOI.join(","))
	hong.push(`${GHIM.lienKhoi}: ${duoi.join(",")}`);
const agentTask = schema.match(/^model AgentTask \{([\s\S]*?)^\}/m)?.[1] ?? "";
const agentTaskCu =
	git("show", `${nen}:packages/db/prisma/schema.prisma`).match(
		/^model AgentTask \{([\s\S]*?)^\}/m,
	)?.[1] ?? "";
if (agentTask.replace(/\s+/g, "") !== agentTaskCu.replace(/\s+/g, ""))
	hong.push(`${GHIM.chiMucAgentTask}: model AgentTask doi trong schema`);

const tam = mkdtempSync(join(tmpdir(), "mig-tln-"));
try {
	const tepCu = join(tam, "cu.prisma");
	writeFileSync(tepCu, git("show", `${nen}:packages/db/prisma/schema.prisma`));
	const prisma = join(GOC, "packages/db/node_modules/.bin/prisma");
	const diff = execFileSync(
		prisma,
		[
			"migrate",
			"diff",
			"--from-schema",
			tepCu,
			"--to-schema",
			TEP_SCHEMA,
			"--script",
		],
		{
			cwd: join(GOC, "packages/db"),
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		},
	);
	for (const c of cauLenh(diff))
		if (/\bDROP\b|ALTER COLUMN|RENAME/i.test(c))
			hong.push(
				`${GHIM.khongChiThem}: diff schema co lenh pha: ${c.slice(0, 60)}`,
			);
} finally {
	rmSync(tam, { recursive: true, force: true });
}

if (hong.length) {
	for (const h of hong) console.error(h);
	process.exit(1);
}
console.log(
	`migration chi them: ${moi.length} thu muc, ${dem} lenh, ${bangThay.size} bang, ${cotThay.okrProgramConfig.size + cotThay.notificationPreference.size} cot`,
);
