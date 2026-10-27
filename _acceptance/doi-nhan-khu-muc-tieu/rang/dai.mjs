import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

export const GOC = resolve(import.meta.dirname, "..", "..", "..");
export const KIEM_KE = "_acceptance/doi-nhan-khu-muc-tieu/kiem-ke.json";
export const GOP_VAO_ONEHUB = "37dc2da8d6dc1eee239f9a71460bd84d82229248";

export class KhongDo extends Error {}

export function git(...a) {
	const r = spawnSync("git", ["-C", GOC, ...a], {
		encoding: "utf8",
		maxBuffer: 1 << 26,
	});
	if (r.status !== 0)
		throw new KhongDo(`git ${a.join(" ")}: ${r.stderr.trim()}`);
	return r.stdout.trim();
}

function commitThemKiemKe() {
	const ds = git(
		"log",
		"--all",
		"--diff-filter=A",
		"--format=%H",
		"--",
		KIEM_KE,
	)
		.split("\n")
		.filter(Boolean);
	if (ds.length === 0)
		throw new KhongDo("khong tim thay commit them kiem-ke.json");
	return ds.at(-1);
}

function laToTien(a, b) {
	return (
		spawnSync("git", ["-C", GOC, "merge-base", "--is-ancestor", a, b])
			.status === 0
	);
}

export function daiCuaVong({ nhanhChinh = "origin/onehub" } = {}) {
	const k = commitThemKiemKe();
	const gopVao = laToTien(GOP_VAO_ONEHUB, nhanhChinh) ? GOP_VAO_ONEHUB : null;
	let dai;
	if (gopVao && laToTien(gopVao, "HEAD")) {
		dai = {
			tu: git("rev-parse", `${gopVao}^1`),
			den: git("rev-parse", `${gopVao}^2`),
			kieu: "da-gop",
		};
	} else {
		dai = {
			tu: git("merge-base", "HEAD", nhanhChinh),
			den: git("rev-parse", "HEAD"),
			kieu: "nhanh-mo",
		};
	}
	const so = Number(git("rev-list", "--count", `${dai.tu}..${dai.den}`));
	if (so === 0) throw new KhongDo("khong do duoc: dai rong");
	return { ...dai, commitKiemKe: k, soCommit: so };
}

export function chayRang(than) {
	try {
		const ma = than();
		process.exit(ma ?? 0);
	} catch (e) {
		if (e instanceof KhongDo) {
			console.error(`KHONG DO DUOC: ${e.message}`);
			process.exit(2);
		}
		throw e;
	}
}
