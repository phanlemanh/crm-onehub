import { execFileSync, spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SLUG = "cho-tac-nhan-lau";
const VUNG = ["apps/app/components/", "packages/ui/src/components/"];

const git = (...a) =>
	execFileSync("git", ["-C", GOC, ...a], { encoding: "utf8" }).trim();

const commit = git(
	"log",
	"--no-merges",
	"--format=%H",
	"-F",
	`--grep=(${SLUG})`,
	"HEAD",
)
	.split("\n")
	.filter(Boolean);
if (commit.length === 0) {
	console.log("KHONG DO DUOC: khong co commit nao cua vong");
	process.exit(2);
}
const tep = new Set();
for (const c of commit)
	for (const t of git(
		"diff-tree",
		"--no-commit-id",
		"--name-only",
		"-r",
		c,
	).split("\n"))
		if (t.endsWith(".tsx") && VUNG.some((v) => t.startsWith(v))) tep.add(t);
const conLai = [...tep].filter(
	(t) =>
		spawnSync("git", ["-C", GOC, "cat-file", "-e", `HEAD:${t}`]).status === 0,
);
if (conLai.length === 0) {
	console.log("KHONG DO DUOC: vong khong cham tep giao dien nao");
	process.exit(2);
}
const goi = execFileSync(
	"node",
	[
		join(GOC, "scripts", "resolve-plugin.mjs"),
		"--plugin",
		"acceptance-gate",
		"--require",
		"scripts/design-gate.mjs",
	],
	{ cwd: GOC, encoding: "utf8" },
).trim();
let hong = 0;
for (const t of conLai.sort()) {
	const r = spawnSync(
		"node",
		[
			join(goi, "scripts", "design-gate.mjs"),
			"--target",
			t,
			"--mode",
			"static",
		],
		{
			cwd: GOC,
			encoding: "utf8",
		},
	);
	console.log(`${r.status === 0 ? "DAT" : "HONG"} ${t}`);
	if (r.status !== 0) {
		hong += 1;
		console.log(
			`${r.stdout}${r.stderr}`.trim().split("\n").slice(-15).join("\n    "),
		);
	}
}
console.log(`san-thiet-ke: ${conLai.length - hong}/${conLai.length} tep dat`);
process.exit(hong === 0 ? 0 : 1);
