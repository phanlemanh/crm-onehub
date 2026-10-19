import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const TEP = "docs/api.md";
const MUC = "## Deleting a record is archive first, purge later";
const PHAI_CO = [
	"`changedIds`",
	"`skipped`",
	"`failed`",
	"`errored`",
	"recordId",
];
const CHIEU_DO = process.argv.includes("--chieu-do");

function git(...args) {
	const r = spawnSync("git", args, { cwd: GOC, encoding: "utf8" });
	if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
	return r.stdout;
}

function noiDung() {
	if (!CHIEU_DO) return readFileSync(join(GOC, TEP), "utf8");
	const moc = git("merge-base", "HEAD", "origin/onehub").trim();
	return git("show", `${moc}:${TEP}`);
}

function muc(chu) {
	const dau = chu.indexOf(MUC);
	if (dau < 0) return "";
	const sau = chu.indexOf("\n## ", dau + 1);
	return sau < 0 ? chu.slice(dau) : chu.slice(dau, sau);
}

const doan = muc(noiDung());
const thieu = PHAI_CO.filter((t) => !doan.includes(t));
if (!doan || thieu.length > 0) {
	console.log(
		`hoan-tac-loat-bao-dung tai-lieu: do — tai-lieu: thieu ${thieu.includes("`errored`") ? "errored" : thieu.join(", ") || "muc"}`,
	);
	process.exit(1);
}
console.log("hoan-tac-loat-bao-dung tai-lieu: dat");
