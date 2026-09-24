import { execFileSync, spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const NHANH_GOC = "origin/onehub";
const VUNG = [
	/^apps\/app\/app\/\(app\)\/\[slug\]\/deals\/.+\.tsx$/,
	/^packages\/ui\/src\/components\/board\.tsx$/,
	/^packages\/ui\/src\/components\/reui\/.+\.tsx$/,
];

const git = (...doi) =>
	execFileSync("git", ["-C", GOC, ...doi], { encoding: "utf8" }).trim();

const moc = git("merge-base", "HEAD", NHANH_GOC);
const tep = git("diff", "--name-only", `${moc}...HEAD`)
	.split("\n")
	.concat(git("diff", "--name-only").split("\n"))
	.filter((t) => VUNG.some((v) => v.test(t)))
	.filter((t, i, ds) => ds.indexOf(t) === i);

console.log(`so tep giao dien vong nay cham: ${tep.length}`);
if (tep.length === 0) {
	console.log(
		"KHONG DO DUOC: khong tep giao dien nao trong diff — khong co gi de soi",
	);
	process.exit(2);
}

const goiKit =
	process.env.CLAUDE_PLUGIN_ROOT ??
	execFileSync(
		"node",
		[
			join(GOC, "scripts", "resolve-plugin.mjs"),
			"--plugin",
			"acceptance-gate",
			"--require",
			"scripts/design-gate.mjs",
			"--require",
			"scripts/design-scan.js",
		],
		{ encoding: "utf8" },
	).trim();

let hong = 0;
for (const t of tep) {
	const r = spawnSync(
		"node",
		[
			join(goiKit, "scripts", "design-gate.mjs"),
			"--target",
			t,
			"--mode",
			"static",
		],
		{ cwd: GOC, encoding: "utf8" },
	);
	const dong = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim().split("\n");
	if (r.status !== 0) {
		hong += 1;
		console.log(`HONG ${t}: ma ${r.status}`);
		for (const d of dong.slice(0, 8)) console.log(`  ${d}`);
	} else {
		console.log(`dat  ${t}`);
	}
}
process.exit(hong === 0 ? 0 : 1);
