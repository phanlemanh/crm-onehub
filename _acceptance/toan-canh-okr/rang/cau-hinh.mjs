import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const LUOT = "toan-canh-okr";
const MOC = "origin/onehub";
const BIEN_CAY_GOP = "TCO_CAY_GOP";

const git = (...doi) =>
	execFileSync("git", ["-C", GOC, ...doi], { encoding: "utf8" }).trim();

function gopLuot() {
	return git(
		"log",
		"--first-parent",
		"--diff-filter=A",
		"--format=%H",
		git("merge-base", "HEAD", MOC),
		"--",
		`_acceptance/${LUOT}/contract.md`,
	)
		.split("\n")
		.at(-1);
}

function vong() {
	const gop = gopLuot();
	if (!gop) return { truoc: MOC, sau: "HEAD", gop: null };
	return { truoc: git("rev-parse", `${gop}^1`), sau: gop, gop };
}

export const VONG = Object.freeze(vong());

export function doTaiGop(tepNay) {
	if (!VONG.gop || process.env[BIEN_CAY_GOP]) return;
	console.log(
		`luot ${LUOT} da gop o ${VONG.gop.slice(0, 8)}: do tren cay tai commit gop, so voi cha ${VONG.truoc.slice(0, 8)}`,
	);
	const thu = mkdtempSync(join(tmpdir(), "tco-gop-"));
	const cay = join(thu, "cay");
	let ma = 2;
	try {
		git("worktree", "add", "--detach", "--quiet", cay, VONG.gop);
		symlinkSync(join(GOC, "node_modules"), join(cay, "node_modules"));
		const rang = join("_acceptance", LUOT, "rang");
		cpSync(join(GOC, rang), join(cay, rang), { recursive: true });
		const r = spawnSync(
			process.execPath,
			[join(cay, relative(GOC, tepNay)), ...process.argv.slice(2)],
			{
				stdio: "inherit",
				env: { ...process.env, [BIEN_CAY_GOP]: VONG.gop },
			},
		);
		ma = r.status ?? 2;
	} finally {
		spawnSync("git", ["-C", GOC, "worktree", "remove", "--force", cay]);
		rmSync(thu, { recursive: true, force: true });
	}
	process.exit(ma);
}
