import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const VONG = "ve-sinh-do-san-onehub";
const NHAN = [`F8 neo (${VONG}):`, `${VONG} cach-toi:`, `${VONG} khai-trang:`];
const TAM_NHIN = 12;
const ROUTE = "apps/app/app/eve/agents/okr";
const NOI = /^\+\s*(status:\s*not-run|expected_exit:)/;

function git(...thamSo) {
	const r = spawnSync("git", ["-C", GOC, ...thamSo], {
		encoding: "utf8",
		maxBuffer: 256 * 1024 * 1024,
	});
	if (r.status !== 0) {
		console.log(`KHONG DO DUOC: git ${thamSo.join(" ")} — ${r.stderr.trim()}`);
		process.exit(2);
	}
	return r.stdout;
}

function hoSoDaKy() {
	return readdirSync(join(GOC, "_acceptance"), { withFileTypes: true })
		.filter((m) => m.isDirectory() && m.name !== VONG)
		.map((m) => m.name)
		.filter((ten) => {
			const hd = join(GOC, "_acceptance", ten, "contract.md");
			if (!existsSync(hd)) return false;
			const tt = readFileSync(hd, "utf8").match(/^status:\s*(\S+)/m)?.[1];
			return tt === "signed-off" || tt === "machine-cleared";
		});
}

function hunkCua(diff) {
	const ra = [];
	let tep = null;
	let hunk = null;
	for (const dong of diff.split("\n")) {
		if (dong.startsWith("+++ ")) {
			tep = dong.slice(6);
			continue;
		}
		if (dong.startsWith("@@")) {
			const moi = Number(dong.match(/\+(\d+)/)?.[1] ?? 0);
			hunk = { tep, dong: moi, them: [] };
			ra.push(hunk);
			continue;
		}
		if (hunk && dong.startsWith("+") && !dong.startsWith("+++"))
			hunk.them.push(dong.slice(1));
	}
	return ra.filter((h) => h.them.length > 0);
}

function coKhai(hunk, docTep) {
	if (hunk.them.some((d) => NHAN.some((n) => d.includes(n)))) return true;
	if (hunk.tep.endsWith(".json"))
		return NHAN.some((n) => docTep(hunk.tep).includes(n));
	const dong = docTep(hunk.tep).split("\n");
	const tu = Math.max(0, hunk.dong - 1 - TAM_NHIN);
	const den = hunk.dong - 1 + hunk.them.length + TAM_NHIN;
	return dong.slice(tu, den).some((d) => NHAN.some((n) => d.includes(n)));
}

function soi(diffRang, diffEvals, diffRoute, docTep) {
	const hong = [];
	const hunk = hunkCua(diffRang);
	for (const h of hunk)
		if (!coKhai(h, docTep)) hong.push(`HONG KHAI ${h.tep}:${h.dong}`);
	let tepEvals = null;
	for (const d of diffEvals.split("\n")) {
		if (d.startsWith("+++ ")) tepEvals = d.slice(6);
		else if (NOI.test(d)) hong.push(`HONG NOI ${tepEvals}`);
	}
	if (diffRoute.trim()) hong.push("HONG ROUTE");
	return { hong, soHunk: hunk.length };
}

if (process.argv.includes("--tu-thu")) {
	const gia = (tep, them) =>
		`+++ b/${tep}\n@@ -1,0 +5,1 @@\n${them.map((d) => `+${d}`).join("\n")}\n`;
	const rong = () => "";
	const thieu = soi(
		gia("_acceptance/x/rang/a.mjs", ["const a = 1;"]),
		"",
		"",
		rong,
	);
	if (!thieu.hong.some((h) => h.startsWith("HONG KHAI"))) {
		console.log("HONG tu kiem khai: hunk khong chu thich ma khong bat");
		process.exit(1);
	}
	console.log("OK tu kiem khai");
	const coNhan = soi(
		gia("_acceptance/x/rang/a.mjs", [`// ${NHAN[1]} ly do`, "const a = 1;"]),
		"",
		"",
		rong,
	);
	if (coNhan.hong.length > 0) {
		console.log("HONG tu kiem khai: hunk co chu thich van bi bat");
		process.exit(1);
	}
	const noi = soi(
		"",
		gia("_acceptance/x/evals.yaml", ["    status: not-run"]),
		"",
		rong,
	);
	if (!noi.hong.includes("HONG NOI _acceptance/x/evals.yaml")) {
		console.log("HONG tu kiem noi: them status: not-run ma khong bat");
		process.exit(1);
	}
	console.log("OK tu kiem noi");
	process.exit(0);
}

const mb = git("merge-base", "HEAD", "origin/onehub").trim();
const daKy = hoSoDaKy();
const rang = daKy.map((t) => `_acceptance/${t}/rang`);
const evals = daKy.map((t) => `_acceptance/${t}/evals.yaml`);
const diffRang = git("diff", "-U0", `${mb}..HEAD`, "--", ...rang);
const diffEvals = git("diff", "-U0", `${mb}..HEAD`, "--", ...evals);
const diffRoute = git("diff", `${mb}..HEAD`, "--", ROUTE);
const kq = soi(diffRang, diffEvals, diffRoute, (tep) =>
	readFileSync(join(GOC, tep), "utf8"),
);
for (const h of kq.hong) console.log(h);
if (kq.hong.length > 0) process.exit(1);
console.log(`khong-noi: ${kq.soHunk} hunk co khai (moc ${mb.slice(0, 9)})`);
