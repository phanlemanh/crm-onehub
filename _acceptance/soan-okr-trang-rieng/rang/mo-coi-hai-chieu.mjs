import { spawnSync } from "node:child_process";
import {
	cpSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "..", "..", "..");
const MO_COI_TUONG_DOI = "_acceptance/nen-chat-ai-elements/rang/mo-coi.mjs";
const MO_COI = join(GOC, MO_COI_TUONG_DOI);
const MAT_TRANG_SOAN = [
	"apps/app/app/(app)/[slug]/okr/soan",
	"apps/app/app/proto/_modules/soan-okr-trang-rieng",
];
const NHAP_ARTIFACT =
	/^import\s*(?:type\s*)?\{[^}]*\}\s*from\s*["']@crm\/ui\/components\/kara\/artifact["'];?\n/gm;
const CAU_CU = 'const THU_MUC_CAU = [""];';
const CAU_MOI = 'const THU_MUC_CAU = ["", "kara"];';
const BO_QUA = new Set([
	"node_modules",
	".next",
	".turbo",
	".git",
	"dist",
	"build",
	"coverage",
	".eve",
	".output",
]);

let soDo = 0;
const dat = (m) => console.log(`   dat: ${m}`);
const hong = (m) => {
	soDo += 1;
	console.log(`   DO: ${m}`);
};

function chay(tep, cwd) {
	const r = spawnSync(process.execPath, [tep], { cwd, encoding: "utf8" });
	return { ma: r.status, ra: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

function caySao() {
	const tam = mkdtempSync(join(tmpdir(), "k2-mo-coi-"));
	mkdirSync(join(tam, dirname(MO_COI_TUONG_DOI)), { recursive: true });
	symlinkSync(join(GOC, "packages"), join(tam, "packages"), "dir");
	return tam;
}

function tepDuoi(thuMuc) {
	return readdirSync(thuMuc, { withFileTypes: true }).flatMap((d) => {
		const duong = join(thuMuc, d.name);
		if (d.isDirectory()) return tepDuoi(duong);
		return d.isFile() && /\.(tsx|ts)$/.test(d.name) ? [duong] : [];
	});
}

console.log("(a) MIEN_TRU cua mo-coi.mjs rong");
const nguonMoCoi = readFileSync(MO_COI, "utf8");
if (!nguonMoCoi.includes("const MIEN_TRU = [];"))
	hong("mo-coi.mjs khong con dong const MIEN_TRU = [];");
else if (/MIEN_TRU\.push\(/.test(nguonMoCoi))
	hong("mo-coi.mjs con MIEN_TRU.push — mien tru K1 chua go");
else dat("MIEN_TRU = [] va khong co MIEN_TRU.push");
if (!nguonMoCoi.includes(CAU_MOI))
	hong(`mo-coi.mjs khong co dong ${CAU_MOI} — cong chua di qua kara/`);

console.log("(b) mo-coi.mjs tren cay that");
const that = chay(MO_COI, GOC);
console.log(
	that.ra
		.trim()
		.split("\n")
		.map((l) => `      | ${l}`)
		.join("\n"),
);
if (that.ma !== 0) hong(`mo-coi.mjs ma ${that.ma}, can 0`);
else dat("ma 0");
if (!that.ra.includes("MIEN TRU (0):")) hong("thieu dong MIEN TRU (0):");
else dat("MIEN TRU (0)");
if (!that.ra.includes("CHET (0):")) hong("thieu dong CHET (0):");
else dat("CHET (0), khong MO COI nao");
if (that.ra.includes("MIEN TRU THUA")) hong("con dong MIEN TRU THUA");

console.log("(c1) chieu do: bo moi loi nhap kara/artifact khoi trang soan");
const tam1 = caySao();
try {
	writeFileSync(join(tam1, MO_COI_TUONG_DOI), nguonMoCoi);
	cpSync(join(GOC, "apps"), join(tam1, "apps"), {
		recursive: true,
		filter: (nguon) => !BO_QUA.has(basename(nguon)),
	});
	const daBo = [];
	for (const mat of MAT_TRANG_SOAN)
		for (const tep of tepDuoi(join(tam1, mat))) {
			const chu = readFileSync(tep, "utf8");
			const sau = chu.replace(NHAP_ARTIFACT, "");
			if (sau === chu) continue;
			writeFileSync(tep, sau);
			daBo.push(relative(tam1, tep));
		}
	if (daBo.length === 0) hong("ban sao khong bo duoc loi nhap nao — dot bien rong");
	else dat(`da bo loi nhap o: ${daBo.join(", ")}`);
	const do1 = chay(join(tam1, MO_COI_TUONG_DOI), tam1);
	if (do1.ma === 1 && do1.ra.includes("MO COI: artifact.tsx"))
		dat("mo-coi.mjs ma 1 va in 'MO COI: artifact.tsx'");
	else
		hong(
			`bo nhap KaraArtifact ma cong khong do (ma ${do1.ma}): ${do1.ra.split("\n").filter((l) => l.includes("MO COI") || l.startsWith("XANH")).join(" / ")}`,
		);
} finally {
	rmSync(tam1, { recursive: true, force: true });
}

console.log("(c2) chieu do: ban sao mo-coi.mjs khong di qua kara/ tren cay that");
const tam2 = caySao();
try {
	if (!nguonMoCoi.includes(CAU_MOI)) hong("khong dung duoc ban sao cau cu");
	else {
		writeFileSync(
			join(tam2, MO_COI_TUONG_DOI),
			nguonMoCoi.replace(CAU_MOI, CAU_CU),
		);
		symlinkSync(join(GOC, "apps"), join(tam2, "apps"), "dir");
		const do2 = chay(join(tam2, MO_COI_TUONG_DOI), tam2);
		if (do2.ma === 1 && do2.ra.includes("MO COI: artifact.tsx"))
			dat("cau cu: ma 1 va in 'MO COI: artifact.tsx' — phep day cong la can");
		else
			hong(
				`cau cu khong lam artifact.tsx mo coi (ma ${do2.ma}) — phep day cong khong chung duoc la can`,
			);
	}
} finally {
	rmSync(tam2, { recursive: true, force: true });
}

if (soDo > 0) {
	console.log(`DO: ${soDo} muc`);
	process.exit(1);
}
console.log("XANH: cong mo coi khong con mien tru K1, di qua kara/, ca hai chieu do bat dung");
