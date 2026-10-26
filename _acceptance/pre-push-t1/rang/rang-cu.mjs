import { spawnSync } from "node:child_process";
import { isDeepStrictEqual } from "node:util";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const HOOK = ".githooks/pre-push";
const HINH = ".githooks/gate-shape.json";
const DONG_GHIM = [
	"for task in check-types lint lint:slop test build; do",
	'\techo "pre-push: bun run $task" | tee -a "$LOG"',
	'\tbun run "$task" 2>&1 | tee -a "$LOG" || fail "$task"',
];
const NAM = ["check-types", "lint", "lint:slop", "test", "build"];

const envSach = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("GIT_")));
const git = (...a) => spawnSync("git", a, { cwd: GOC, env: envSach, encoding: "utf8" });

function gocVong() {
	const r = git("merge-base", "HEAD", "refs/remotes/origin/onehub");
	if (r.status !== 0) {
		console.log("khong co goc vong: thieu origin/onehub");
		process.exit(2);
	}
	return r.stdout.trim();
}

function docGoc(sha, tep) {
	const r = git("show", `${sha}:${tep}`);
	if (r.status !== 0) {
		console.log(`khong co goc vong: khong doc duoc ${tep} o ${sha}`);
		process.exit(2);
	}
	return r.stdout;
}

function lenhSed() {
	const chu = readFileSync(join(GOC, "_acceptance/hinh-cua-luoi/rang-hinh.sh"), "utf8");
	const ds = [...chu.matchAll(/^\s*sed '(.*)' \\$/gm)].map((m) => m[1]).slice(0, 2);
	if (ds.length !== 2) {
		console.log("thuoc hong: khong rut duoc hai lenh sed cua rang-hinh.sh tan-cong");
		process.exit(2);
	}
	return ds;
}

function moThan() {
	const chu = readFileSync(join(GOC, "_acceptance/dieu-phoi-va-bien/rang/cong.mjs"), "utf8");
	const m = /const m = \/(\^for task in.*)\/m\.exec\(text\);/.exec(chu);
	if (!m) {
		console.log("thuoc hong: khong rut duoc regex vong cua dieu-phoi-va-bien");
		process.exit(2);
	}
	return new RegExp(m[1], "m");
}

const goc = gocVong();
const hookGoc = docGoc(goc, HOOK);
const SED = lenhSed();
const VONG = moThan();

function ghim1(hook) {
	const ds = hook.split("\n");
	const dsGoc = hookGoc.split("\n");
	const sai = DONG_GHIM.filter((d) => ds.filter((x) => x === d).length !== 1 || dsGoc.filter((x) => x === d).length !== 1);
	return sai.length ? `dong ghim khac goc vong: ${JSON.stringify(sai)}` : null;
}

function ghim2(hook) {
	const ds = hook.split("\n");
	for (const [i, e] of SED.entries()) {
		const r = spawnSync("sed", [e], { input: hook, encoding: "utf8" });
		const ra = r.stdout.split("\n");
		const doi = ds.filter((d, k) => ra[k] !== d).length;
		if (r.status !== 0 || ra.length !== ds.length || doi !== 1) return `sed ${i + 1} cua rang-hinh doi ${doi} dong`;
	}
	return null;
}

function ghim3(hook) {
	const m = VONG.exec(hook);
	if (!m) return "regex vong cua dieu-phoi-va-bien khong khop";
	if (!/bun run "\$task"/.test(m[2])) return 'than vong khong goi bun run "$task"';
	const d = mkdtempSync(join(tmpdir(), "rang-cu-"));
	try {
		const log = join(d, "log");
		const gia = `LOG=${JSON.stringify(log)}; : > "$LOG"; fail() { exit 1; }; bun() { echo "ℹ tests 7"; echo "ℹ fail 0"; }; ${m[0]}`;
		const r = spawnSync("bash", ["-c", gia], { encoding: "utf8" });
		if (r.status !== 0) return `vong gia thoat ${r.status}: ${r.stderr.trim()}`;
		const chu = readFileSync(log, "utf8");
		const thieu = NAM.filter((t) => !chu.split("\n").includes(`pre-push: bun run ${t}`));
		return thieu.length ? `vong doc lap thieu ${JSON.stringify(thieu)}` : null;
	} finally {
		rmSync(d, { recursive: true, force: true });
	}
}

function ghim4(hook) {
	return hook.split("\n").some((d) => /^for task in .*; do$/.test(d)) ? null : "khong tim thay dong vong";
}

function ghim5() {
	const rang = (chu) => JSON.parse(chu).checkers.find((c) => c.id === "test")?.rang;
	return isDeepStrictEqual(rang(readFileSync(join(GOC, HINH), "utf8")), rang(docGoc(goc, HINH))) ? null : "khoi rang cua checker test khac goc vong";
}

const GHIM = [
	["1 dong-ghim", ghim1],
	["2 sed-rang-hinh", ghim2],
	["3 vong-doc-lap", ghim3],
	["4 dong-vong", ghim4],
];

const hook = readFileSync(join(GOC, HOOK), "utf8");
let ma = 0;
for (const [ten, f] of GHIM) {
	const loi = f(hook);
	console.log(loi ? `DO ${ten}: ${loi}` : `dat ${ten}`);
	if (loi) ma = 1;
}
const loi5 = ghim5();
console.log(loi5 ? `DO 5 khoi-rang: ${loi5}` : "dat 5 khoi-rang");
if (loi5) ma = 1;

const DOT = [
	["1 dong-ghim", ghim1, hook.replace(DONG_GHIM[0], "for task in check-types lint lint:slop build test; do")],
	["2 sed-rang-hinh", ghim2, hook.replace(DONG_GHIM[2], `${DONG_GHIM[2]}\n${DONG_GHIM[2]}`)],
];
for (const [ten, f, ban] of DOT) {
	const bat = ban !== hook && f(ban) !== null;
	console.log(bat ? `BAT ${ten}` : `thuoc hong: ${ten}`);
	if (!bat) ma = 1;
}

for (const [ten, lenh, args] of [
	["dptm_hook_cay", "node", ["_acceptance/dieu-phoi-truoc-mo-dot/rang/hook-cay.mjs"]],
	["rang_hook_loi_thoat", "bash", ["_acceptance/luoi-day-do-that/rang-hook.sh", "--chan", "loi-thoat"]],
]) {
	const r = spawnSync(lenh, args, { cwd: GOC, env: envSach, encoding: "utf8" });
	console.log(r.status === 0 ? `dat ${ten}` : `DO ${ten}: ma ${r.status}\n${`${r.stdout}${r.stderr}`.trim().split("\n").slice(-8).join("\n")}`);
	if (r.status !== 0) ma = 1;
}
process.exit(ma);
