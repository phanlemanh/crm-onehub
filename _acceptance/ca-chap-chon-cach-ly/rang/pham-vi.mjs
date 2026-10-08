import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const CAM = /^(apps\/[^/]+\/(src|agent|app)|packages\/[^/]+\/src)\//;

function git(args) {
	const r = spawnSync("git", args, { cwd: GOC, encoding: "utf8" });
	if (r.status !== 0) {
		console.error(`git ${args.join(" ")}: ${r.stderr.trim()}`);
		process.exit(2);
	}
	return r.stdout.trim();
}

const i = process.argv.indexOf("--tu-danh-sach");
const ds =
	i > 0
		? readFileSync(process.argv[i + 1], "utf8").split("\n").filter(Boolean)
		: git(["diff", "--name-only", git(["merge-base", "HEAD", "origin/onehub"]), "HEAD"])
				.split("\n")
				.filter(Boolean);
const cham = ds.filter((t) => CAM.test(t));
if (cham.length > 0) {
	console.error(`cham ma san pham: ${cham.join(", ")}`);
	process.exit(1);
}
console.log(`PHAM VI: ${ds.length} tep, 0 ma san pham`);
