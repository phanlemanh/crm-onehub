import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const GOC = path.resolve(import.meta.dirname, "..", "..", "..");
const CHINH_NO = "agent-test-khong-nhap-app";
const HO_SO = ["deal-va", "soan-okr-cung-tro-ly", "tro-ly-okr-tom-tat"];
const iThem = process.argv.indexOf("--ho-so");
const hoSo = iThem > 0 ? [...HO_SO, process.argv[iThem + 1]] : HO_SO;

const loi = [];
spawnSync("git", ["-C", GOC, "fetch", "-q", "origin", "onehub"]);
const luoi = spawnSync(
	"bash",
	["scripts/pre-merge-check.sh", ".", "--base", "origin/onehub"],
	{
		cwd: GOC,
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
	},
);
const ra = `${luoi.stdout}\n${luoi.stderr}`;
if (!ra.includes("rules ran"))
	loi.push("luoi khong chay (khong co dong rules ran)");
for (const d of ra
	.split("\n")
	.filter(
		(d) => d.includes("evidence is stale") && !d.includes(`[${CHINH_NO}]`),
	))
	loi.push(`luoi: ${d.trim()}`);

for (const slug of hoSo) {
	let log;
	try {
		log = readFileSync(
			path.join(GOC, "_acceptance", slug, "run-log.jsonl"),
			"utf8",
		);
	} catch {
		loi.push(`${slug}: ho so chua ghim lai (khong co run-log)`);
		continue;
	}
	const dong = log
		.split("\n")
		.filter(Boolean)
		.map((d) => {
			try {
				return JSON.parse(d);
			} catch {
				return null;
			}
		})
		.filter((d) => d?.kind === "repin");
	const cuoi = dong.at(-1);
	if (!cuoi) {
		loi.push(`${slug}: ho so chua ghim lai`);
		continue;
	}
	const bao = readFileSync(
		path.join(GOC, "_acceptance", slug, "evidence-report.md"),
		"utf8",
	);
	const vc = bao.match(/^verified_commit:\s*(\S+)/m)?.[1];
	if (vc !== cuoi.sha)
		loi.push(`${slug}: sha dong ghim ${cuoi.sha} khac verified_commit ${vc}`);
	const tren = spawnSync("git", [
		"-C",
		GOC,
		"merge-base",
		"--is-ancestor",
		cuoi.sha,
		"HEAD",
	]);
	if (tren.status !== 0)
		loi.push(`${slug}: moc ghim ${cuoi.sha} khong nam trong lich su HEAD`);
	const hong = Object.entries(cuoi.evals_exit ?? {}).filter(([, m]) => m !== 0);
	if (hong.length > 0)
		loi.push(`${slug}: eval khong dat ${JSON.stringify(hong)}`);
	if ((cuoi.suites_exit ?? []).some((m) => m !== 0))
		loi.push(`${slug}: suite khong dat`);
}
console.log(`luoi thoat ${luoi.status} · ${hoSo.length} ho so kiem`);
for (const l of loi) console.error(l);
process.exit(loi.length === 0 ? 0 : 1);
