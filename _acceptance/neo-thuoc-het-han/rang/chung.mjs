import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	symlinkSync,
} from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const GOC = join(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
	"..",
);
export const SLUG = "neo-thuoc-het-han";
export const MOC_NEN = "aba7f6418c0e68bb7c8aa988727e75d644767ae4";
export const CAP_LMCV = Object.freeze({
	goc: "b79513410ffef268b6a45655972f5847cdbd0bda",
	dinh: "100847e8a747d474b79bc10adb82a94e06313f82",
});
export const SOT = "so-okr-tu-chay";
export const LMCV = "lam-moi-chuyen-viec-qua-loi-chung";
export const HO_SO = [LMCV];
export const RANG_SUA = [`_acceptance/${LMCV}/rang/khong-hoi-quy.mjs`];
const BO_DEM = 256 * 1024 * 1024;

export function dung(ma, cau) {
	console.log(cau);
	process.exit(ma);
}

export const git = (...a) =>
	execFileSync("git", ["-C", GOC, ...a], {
		encoding: "utf8",
		maxBuffer: BO_DEM,
	}).trim();

export function gitThu(...a) {
	const r = spawnSync("git", ["-C", GOC, ...a], {
		encoding: "utf8",
		maxBuffer: BO_DEM,
	});
	return r.status === 0 ? r.stdout : null;
}

let kitDaNap = null;
export function kit() {
	if (kitDaNap) return kitDaNap;
	const r = spawnSync(
		"node",
		[
			join(GOC, "scripts", "resolve-plugin.mjs"),
			"--plugin",
			"acceptance-gate",
			"--require",
			"lib/evidence-core.cjs",
			"--require",
			"lib/eval-yaml.cjs",
			"--require",
			"scripts/recheck-evidence.cjs",
		],
		{ cwd: GOC, encoding: "utf8" },
	);
	if (r.status !== 0)
		dung(
			2,
			`KHONG DO DUOC: khong giai duoc goi acceptance-gate — ${(r.stderr ?? "").trim()}`,
		);
	const goc = r.stdout.trim();
	const nap = createRequire(import.meta.url);
	kitDaNap = {
		goc,
		core: nap(join(goc, "lib", "evidence-core.cjs")),
		Y: nap(join(goc, "lib", "eval-yaml.cjs")),
	};
	return kitDaNap;
}

export function giaiLenh(khoa) {
	const v = kit().core.resolveConfigKey(
		readFileSync(join(GOC, "_acceptance", "config.yaml"), "utf8"),
		khoa,
	);
	return (
		v ??
		dung(
			2,
			`KHONG DO DUOC: khoa ${khoa} khong co trong _acceptance/config.yaml`,
		)
	);
}

export function chay(lenh, cwd = GOC) {
	const r = spawnSync("bash", ["-c", lenh], {
		cwd,
		encoding: "utf8",
		maxBuffer: BO_DEM,
	});
	const stdout = r.stdout ?? "";
	const stderr = r.stderr ?? "";
	return { ma: r.status ?? -1, stdout, stderr, ra: `${stdout}${stderr}` };
}

export const duoi = (ra, n = 20) =>
	ra.trim().split("\n").slice(-n).join("\n    ");

function tepNoiCay() {
	const ds = [".env", "node_modules"];
	for (const vung of ["apps", "packages"])
		for (const goi of readdirSync(join(GOC, vung)))
			ds.push(join(vung, goi, "node_modules"));
	return ds.filter((t) => existsSync(join(GOC, t)));
}

export function voiCayTam(ten, viec) {
	const cha = join(GOC, ".acceptance-runs", SLUG);
	mkdirSync(cha, { recursive: true });
	const cay = join(cha, `${ten}-${process.pid}`);
	spawnSync("git", ["-C", GOC, "worktree", "remove", "--force", cay]);
	git("worktree", "add", "--detach", cay, "HEAD");
	for (const t of tepNoiCay()) symlinkSync(join(GOC, t), join(cay, t));
	try {
		return viec(cay);
	} finally {
		spawnSync("git", ["-C", GOC, "worktree", "remove", "--force", cay]);
		spawnSync("git", ["-C", GOC, "worktree", "prune"]);
	}
}

export function commitGia(cay, cau, danhSach = null) {
	spawnSync("git", [
		"-C",
		cay,
		"add",
		...(danhSach ? ["--", ...danhSach] : ["-A"]),
	]);
	const r = spawnSync(
		"git",
		[
			"-C",
			cay,
			"-c",
			"user.name=rang",
			"-c",
			"user.email=rang@neo.test",
			"commit",
			"-q",
			"-m",
			cau,
		],
		{ encoding: "utf8" },
	);
	if (r.status !== 0)
		dung(2, `KHONG DO DUOC: khong commit duoc cay tam — ${r.stderr}`);
}

export function apThay(chu, thay) {
	let ra = chu;
	for (const [cu, moi] of thay) {
		if (!ra.includes(cu)) return null;
		ra = ra.replace(cu, moi);
	}
	return ra;
}
