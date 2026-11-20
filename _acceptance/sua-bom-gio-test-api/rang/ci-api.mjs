#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..", "..");
const KHO = "phanlemanh/crm-onehub";
const SO_DO_MAC_DINH = resolve(HERE, "..", "evidence", "ci-chay-lai.md");
const JOB = "test (api)";

function chay(lenh, args) {
	const r = spawnSync(lenh, args, {
		cwd: ROOT,
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
	});
	if (r.status !== 0) {
		console.error(`ci-api: ${lenh} ${args.join(" ")} hong: ${r.stderr.trim()}`);
		process.exit(2);
	}
	return r.stdout;
}

const argv = process.argv.slice(2);
const i = argv.indexOf("--sha");
const iSoDo = argv.indexOf("--so-do");
if (iSoDo >= 0 && !argv[iSoDo + 1]) {
	console.error("ci-api: --so-do can mot duong dan");
	process.exit(2);
}
const SO_DO = iSoDo >= 0 ? resolve(argv[iSoDo + 1]) : SO_DO_MAC_DINH;

const CHUA_DAY = /HTTP 422|No commit found/;

function lanCua(sha) {
	const args = [
		"api",
		"--paginate",
		`repos/${KHO}/commits/${sha}/check-runs?per_page=100&filter=all`,
		"--jq",
		`.check_runs[] | select(.name == "${JOB}") | [.id, .status, (.conclusion // ""), .started_at, (.completed_at // "")] | @tsv`,
	];
	const r = spawnSync("gh", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
	if (r.status === 0) return r.stdout;
	if (CHUA_DAY.test(r.stderr)) {
		console.error(`ci-api: ${sha.slice(0, 9)} chua day len ${KHO}, coi nhu chua co lan chay`);
		return "";
	}
	console.error(`ci-api: gh ${args.join(" ")} hong: ${r.stderr.trim()}`);
	process.exit(2);
}

let sha = "";
let tho = "";
if (i >= 0 && argv[i + 1]) {
	sha = chay("git", ["rev-parse", argv[i + 1]]).trim();
	tho = lanCua(sha);
} else {
	const daiDien = chay("git", ["rev-list", "--max-count=20", "HEAD"])
		.split("\n")
		.filter(Boolean);
	for (const ung of daiDien) {
		const doiMa = chay("git", [
			"diff",
			"--name-only",
			ung,
			"HEAD",
			"--",
			"apps",
			"packages",
		]).trim();
		if (doiMa) break;
		const ra = lanCua(ung);
		if (ra.trim()) {
			sha = ung;
			tho = ra;
			break;
		}
	}
	if (!sha) {
		console.log(
			"CI API CHUA CO: khong commit nao tu HEAD lui ve (khong doi apps/, packages/) co lan chay test (api)",
		);
		process.exit(1);
	}
}
const lan = tho
	.split("\n")
	.filter(Boolean)
	.map((d) => {
		const [id, status, conclusion, batDau, xong] = d.split("\t");
		return { id, status, conclusion, batDau, xong };
	})
	.sort((a, b) => a.batDau.localeCompare(b.batDau));

if (lan.length === 0) {
	console.log(`CI API CHUA CO: sha ${sha.slice(0, 9)} chua co lan chay ${JOB}`);
	process.exit(1);
}
for (const l of lan)
	console.log(
		`ci-api: ${sha.slice(0, 9)} · ${JOB} · lan ${l.id} · ${l.status} · ${l.conclusion || "-"} · ${l.batDau} → ${l.xong || "-"}`,
	);
const cuoi = lan[lan.length - 1];
if (lan.length > 2) {
	console.log(
		`CI API THU LAI QUA: ${lan.length} lan chay tren ${sha.slice(0, 9)}, chi cho mot lan chay lai de do`,
	);
	process.exit(1);
}
if (lan.length === 2 && lan[0].conclusion !== "success") {
	const soDo = existsSync(SO_DO) ? readFileSync(SO_DO, "utf8") : "";
	if (!soDo.includes(lan[0].id)) {
		console.log(
			`CI API THU LAI KHONG SO DO: lan ${lan[0].id} do roi chay lai, nhung evidence/ci-chay-lai.md khong ghi so do cua lan ay`,
		);
		process.exit(1);
	}
	console.log(`ci-api: lan chay lai co so do trong evidence/ci-chay-lai.md`);
}
if (cuoi.status !== "completed") {
	console.log(`CI API DANG CHAY: lan ${cuoi.id} chua xong`);
	process.exit(1);
}
if (cuoi.conclusion !== "success") {
	console.log(`CI API DO: lan ${cuoi.id} ket thuc ${cuoi.conclusion}`);
	process.exit(1);
}
console.log(
	`CI API XANH: lan ${cuoi.id} tren ${sha.slice(0, 9)} ket thuc success`,
);
process.exit(0);
