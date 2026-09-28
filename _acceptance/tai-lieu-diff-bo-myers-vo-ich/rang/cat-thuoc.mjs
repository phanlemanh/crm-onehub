import { spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SLUG = "tai-lieu-diff-bo-myers-vo-ich";
const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const TEP = "packages/validation/src/tai-lieu-diff.ts";
const SPEC = "test/tai-lieu-diff.spec.ts";

const DOT_BIEN = [
	{
		ten: "so-bang",
		tu: "canDuoiSua(a, b) > tran",
		thanh: "canDuoiSua(a, b) >= tran",
		ca: "tran-duoi-khoi: bien-dung-tran",
		ghim: "lech ban goc: bien-dung-tran",
	},
	{
		ten: "khong-dem-chung",
		tu: "\t\tchung += 1;",
		thanh: "\t\tchung += 0;",
		ca: "tran-duoi-khoi: dai-sua-rai-rac",
		ghim: "lech ban goc: dai-sua-rai-rac",
	},
	{
		ten: "dem-theo-tap",
		tu: "\t\tcon.set(khoa, n - 1);",
		thanh: "\t\tcon.set(khoa, 0);",
		ca: "tran-duoi-khoi: lap-khoi",
		ghim: "lech ban goc: lap-khoi",
	},
	{
		ten: "bo-chan",
		tu: "canDuoiSua(a, b) > tran",
		thanh: "false",
		ca: "myers-vo-ich: khac het",
		ghim: "myers-vo-ich: vong Myers muc khoi van chay",
	},
];

function chay(lenh, doi, cwd) {
	const r = spawnSync(lenh, doi, { cwd, encoding: "utf8" });
	return { ma: r.status, ra: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

function git(...doi) {
	const r = chay("git", doi, GOC);
	if (r.ma !== 0) throw new Error(`git ${doi.join(" ")}: ${r.ra}`);
	return r.ra.trim();
}

function chayCa(cay, ca) {
	return chay(
		"bun",
		["test", SPEC, "-t", ca],
		join(cay, "packages/validation"),
	);
}

const noi = join(GOC, ".acceptance-runs", SLUG);
mkdirSync(noi, { recursive: true });
const cay = join(noi, `cat-thuoc-${process.pid}`);
let hong = 0;
git("worktree", "add", "--detach", cay, "HEAD");
try {
	symlinkSync(join(GOC, "node_modules"), join(cay, "node_modules"));
	rmSync(join(cay, "packages/validation/node_modules"), {
		recursive: true,
		force: true,
	});
	symlinkSync(
		join(GOC, "packages/validation/node_modules"),
		join(cay, "packages/validation/node_modules"),
	);
	const duong = join(cay, TEP);
	const lanh = readFileSync(duong, "utf8");
	for (const d of DOT_BIEN) {
		if (lanh.split(d.tu).length !== 2) {
			console.error(`dot bien khong ap duoc: ${d.ten}`);
			process.exitCode = 2;
			throw new Error("dung");
		}
		writeFileSync(duong, lanh.replace(d.tu, d.thanh));
		const r = chayCa(cay, d.ca);
		writeFileSync(duong, lanh);
		if (
			r.ma !== 0 &&
			r.ra.split("\n").some((dong) => dong.startsWith(`error: ${d.ghim}`))
		)
			console.log(`dot bien ${d.ten}: bat`);
		else {
			console.error(`dot bien ${d.ten}: lot (ma ${r.ma}, thieu "${d.ghim}")`);
			hong += 1;
		}
	}
	for (const d of DOT_BIEN) {
		const r = chayCa(cay, d.ca);
		if (r.ma === 0) console.log(`lanh ${d.ca}: xanh`);
		else {
			console.error(`lanh ${d.ca}: do (ma ${r.ma})`);
			hong += 1;
		}
	}
} catch (e) {
	if (process.exitCode !== 2) throw e;
} finally {
	chay("git", ["worktree", "remove", "--force", cay], GOC);
	if (existsSync(cay)) rmSync(cay, { recursive: true, force: true });
	chay("git", ["worktree", "prune"], GOC);
}
if (process.exitCode !== 2 && hong > 0) process.exitCode = 1;
if (process.exitCode === undefined)
	console.log(`${DOT_BIEN.length}/${DOT_BIEN.length} dot bien bat, lanh xanh`);
