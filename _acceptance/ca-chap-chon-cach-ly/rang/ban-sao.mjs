import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

export const GOC = resolve(import.meta.dirname, "..", "..", "..");
const NHOM = ["apps", "packages", "tools"];

export class KhongDo extends Error {}

function git(args, cwd = GOC) {
	const r = spawnSync("git", args, { cwd, encoding: "utf8" });
	if (r.status !== 0) throw new KhongDo(`git ${args.join(" ")}: ${r.stderr.trim()}`);
	return r.stdout.trim();
}

export function dungBanSao(ten) {
	const dich = `/private/tmp/cccl-${ten}-${process.pid}`;
	git(["worktree", "add", "--detach", dich, "HEAD"]);
	symlinkSync(join(GOC, "node_modules"), join(dich, "node_modules"));
	if (existsSync(join(GOC, ".env"))) symlinkSync(join(GOC, ".env"), join(dich, ".env"));
	for (const nhom of NHOM) {
		if (!existsSync(join(GOC, nhom))) continue;
		for (const goi of readdirSync(join(GOC, nhom))) {
			const nm = join(GOC, nhom, goi, "node_modules");
			if (existsSync(nm) && existsSync(join(dich, nhom, goi)))
				symlinkSync(nm, join(dich, nhom, goi, "node_modules"));
		}
	}
	return dich;
}

export function goBanSao(dich) {
	spawnSync("git", ["worktree", "remove", "--force", dich], { cwd: GOC });
}

export function thayMotLan(dich, tep, cu, moi) {
	const duong = join(dich, tep);
	const goc = readFileSync(duong, "utf8");
	const n = goc.split(cu).length - 1;
	if (n !== 1) throw new KhongDo(`moc trong ${tep} xuat hien ${n} lan, can 1`);
	writeFileSync(duong, goc.replace(cu, moi));
	return () => writeFileSync(duong, goc);
}
