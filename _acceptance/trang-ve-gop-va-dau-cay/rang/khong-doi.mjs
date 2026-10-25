import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const CI = ".github/workflows/acceptance.yml";
const GIU = [".githooks/pre-push", ".githooks/gate-shape.json"];
const VUNG = [/^\.githooks\//, /^scripts\//, /^\.github\//, /^package\.json$/];
const CAM = "--no-verify";

const envSach = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("GIT_")));
const git = (...a) => spawnSync("git", a, { cwd: GOC, env: envSach, encoding: "utf8", maxBuffer: 1 << 28 });

const r = git("merge-base", "HEAD", "refs/remotes/origin/onehub");
if (r.status !== 0) {
	console.log("khong co goc vong: thieu origin/onehub");
	process.exit(2);
}
const goc = r.stdout.trim();
const docGoc = (t) => {
	const s = git("show", `${goc}:${t}`);
	if (s.status !== 0) {
		console.log(`khong co goc vong: khong doc duoc ${t} o ${goc}`);
		process.exit(2);
	}
	return s.stdout;
};
const doc = (t) => readFileSync(join(GOC, t), "utf8");

function buocBanDo(chu) {
	const dau = chu.indexOf("      - name: Product map\n");
	if (dau < 0) return null;
	const cuoi = chu.indexOf("      - name:", dau + 1);
	const khoi = chu.slice(dau, cuoi < 0 ? undefined : cuoi);
	return khoi.includes("run: node scripts/product-map.mjs --root . --check") ? khoi : null;
}

function ghim1(chu) {
	const a = buocBanDo(chu);
	const b = buocBanDo(docGoc(CI));
	return a && a === b ? null : "buoc Product map cua acceptance.yml khac goc vong";
}

function ghim2(tep) {
	const sai = GIU.filter((t) => tep[t] !== docGoc(t));
	return sai.length ? `khac goc vong: ${sai.join(", ")}` : null;
}

function dongThem(diff) {
	const ra = [];
	let tep = "";
	for (const d of diff.split("\n")) {
		if (d.startsWith("+++ ")) tep = d.replace(/^\+\+\+ (b\/)?/, "");
		else if (d.startsWith("+") && !d.startsWith("+++")) ra.push([tep, d.slice(1)]);
	}
	return ra;
}

function ghim3(diff) {
	const sai = dongThem(diff).filter(([t, d]) => VUNG.some((v) => v.test(t)) && d.includes(CAM));
	return sai.length ? `dong them co ${CAM}: ${sai.map(([t]) => t).join(", ")}` : null;
}

const diff = git("diff", goc, "--", ".").stdout + git("diff", "--cached", goc, "--", ".").stdout;
const moi = Object.fromEntries(GIU.map((t) => [t, doc(t)]));
const loi = [];
for (const [ten, ra] of [
	["(1)", ghim1(doc(CI))],
	["(2)", ghim2(moi)],
	["(3)", ghim3(git("diff", goc).stdout)],
]) {
	if (ra) loi.push(`${ten} ${ra}`);
	else console.log(`dat ${ten}`);
}

const amCo = dongThem(diff).some(([t, d]) => t.startsWith("_acceptance/trang-ve-gop-va-dau-cay/") && d.includes(CAM));
if (!amCo) loi.push("thuoc hong: doi chung am (3) khong co chuoi trong ho so cua vong");
else if (ghim3(diff)) loi.push("thuoc hong: doi chung am (3) do");

const chieuDo = [
	["(1)", ghim1(doc(CI).replace("--root . --check", "--root ."))],
	["(2)", ghim2({ ...moi, [GIU[0]]: `${moi[GIU[0]]}#` })],
	["(3)", ghim3(`${diff}\n+++ b/scripts/gia.mjs\n+git push ${CAM}\n`)],
];
for (const [ten, ra] of chieuDo) {
	if (ra) console.log(`BAT ${ten}: ${ra}`);
	else loi.push(`thuoc hong: ghim ${ten} khong do tren ban sao pha`);
}

if (loi.length) {
	for (const l of loi) console.log(l);
	process.exit(1);
}
console.log("dat khong-doi");
