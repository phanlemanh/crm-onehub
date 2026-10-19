import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const GOC_SO = "8f975afb4";
const CAU_CU = "không đổi mã nào test hay build đọc";
const KHOA_MOI = ["t1_ma_doc", "t1_skip_globs"];
const NGUON_CI = "../.github/scripts/phan-loai.mjs";
const TEN_CAN = ["docGlobT1", "tepT1", "quyetDinh"];
const MUC_CLAUDE = "## PR mở ở dạng nháp";

function gitShow(duong) {
	const r = spawnSync("git", ["show", `${GOC_SO}:${duong}`], { cwd: GOC, encoding: "utf8", maxBuffer: 1 << 26 });
	return r.status === 0 ? r.stdout : null;
}

function mucMarkdown(chu, dau) {
	const i = chu.indexOf(dau);
	if (i < 0) return "";
	const het = chu.indexOf("\n## ", i + dau.length);
	return chu.slice(i, het < 0 ? undefined : het);
}

const hinhGoc = gitShow(".githooks/gate-shape.json");
const hookGoc = gitShow(".githooks/pre-push");
if (hinhGoc === null || hookGoc === null) {
	console.log(`thuoc hong: thieu ref goc ${GOC_SO}`);
	process.exit(2);
}

const loi = [];
const t1Goc = JSON.parse(hinhGoc).t1Only;
const t1 = JSON.parse(readFileSync(join(GOC, ".githooks/gate-shape.json"), "utf8")).t1Only ?? {};
if (!String(t1Goc?.vi_sao).includes(CAU_CU)) {
	console.log("thuoc hong: doi chung — cau cu khong co trong ban goc");
	process.exit(2);
}
for (const k of KHOA_MOI) if (!String(t1.vi_sao).includes(k)) loi.push(`a vi_sao thieu ${k}`);
if (String(t1.vi_sao).includes(CAU_CU)) loi.push("a vi_sao con cau cu");
for (const k of ["skip", "classifier", "sameRuleAs"]) {
	if (JSON.stringify(t1[k]) !== JSON.stringify(t1Goc[k])) loi.push(`a t1Only.${k} doi`);
}

if (readFileSync(join(GOC, ".githooks/pre-push"), "utf8") !== hookGoc) loi.push("b .githooks/pre-push doi so voi ban goc");

const prePush = readFileSync(join(GOC, "scripts/pre-push-t1.mjs"), "utf8");
const nhap = [...prePush.matchAll(/^import\s*\{([^}]*)\}\s*from\s*["']([^"']+)["'];?\s*$/gm)].find((m) => m[2] === NGUON_CI);
const ten = nhap ? nhap[1].split(",").map((x) => x.trim()) : [];
for (const t of TEN_CAN) if (!ten.includes(t)) loi.push(`c pre-push-t1.mjs khong import ${t}`);

const claude = mucMarkdown(readFileSync(join(GOC, "CLAUDE.md"), "utf8"), MUC_CLAUDE);
if (!claude) loi.push("d CLAUDE.md mat muc PR mo o dang nhap");
else if (!claude.includes("t1_ma_doc")) loi.push("d CLAUDE.md muc PR nhap thieu t1_ma_doc");

const { quetDauVao, MIEN } = await import(join(GOC, ".github/scripts/t1-ma-doc.mjs"));
const benDocClaude = quetDauVao(GOC).dich.get("CLAUDE.md") ?? [];
for (const n of benDocClaude) if (!MIEN["CLAUDE.md"]?.[n]) loi.push(`e CLAUDE.md co ben doc ${n}`);

for (const l of loi) console.log(`DO ${l}`);
if (loi.length) process.exit(1);
console.log("dat khai");
