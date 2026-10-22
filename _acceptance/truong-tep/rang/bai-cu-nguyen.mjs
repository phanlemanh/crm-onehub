import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../..",
);
const BAI_CU = [
	"packages/db/test/blob-nguon.spec.ts",
	"apps/api/test/tai-lieu-nguon.spec.ts",
	"apps/api/test/tai-lieu-nguon-tat.spec.ts",
	"apps/api/test/phieu-nguon.spec.ts",
];
const MA_KHO_TAI_LIEU = [
	"packages/db/src/blob-nguon.ts",
	"apps/api/src/tai-lieu/kho-nguon.ts",
	"apps/api/src/tai-lieu/phieu-nguon.ts",
	"apps/api/src/tai-lieu/tai-lieu-nguon.service.ts",
];
const LOI_DA_DUYET = process.env.TTP_HOI7 === "dung-chung" ? "dung-chung" : "viet-rieng";

function git(goc, ...thamSo) {
	return execFileSync("git", ["-C", goc, ...thamSo], {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	}).trim();
}

function gocRe(goc) {
	try {
		return git(goc, "merge-base", "HEAD", "origin/onehub");
	} catch {
		return null;
	}
}

export function soat(goc) {
	const goc0 = gocRe(goc);
	if (!goc0) return { maThoat: 2, loi: ["ttp kho tai lieu: khong co goc"] };
	const canGiu = LOI_DA_DUYET === "viet-rieng" ? [...BAI_CU, ...MA_KHO_TAI_LIEU] : BAI_CU;
	const doi = new Set(
		git(goc, "diff", "--name-only", `${goc0}..HEAD`, "--", ...canGiu)
			.split("\n")
			.filter(Boolean),
	);
	const loi = [];
	for (const tep of canGiu) {
		if (!doi.has(tep)) continue;
		loi.push(
			BAI_CU.includes(tep)
				? `ttp kho tai lieu: sua bai cu ${tep}`
				: `ttp kho tai lieu: sua ${tep}`,
		);
	}
	return { maThoat: loi.length > 0 ? 1 : 0, loi, goc0 };
}

function thuocMu() {
	const tam = fs.mkdtempSync(path.join(os.tmpdir(), "ttp-bai-cu-"));
	try {
		git(GOC, "worktree", "add", "--detach", tam, "HEAD");
		const tep = path.join(tam, "packages/db/src/blob-nguon.ts");
		fs.appendFileSync(tep, "\n");
		git(tam, "-c", "user.name=rang", "-c", "user.email=rang@test", "commit", "-q", "-am", "pha thu");
		const kq = soat(tam);
		return kq.loi.includes("ttp kho tai lieu: sua packages/db/src/blob-nguon.ts")
			? null
			: "ttp kho tai lieu: thuoc mu";
	} finally {
		try {
			git(GOC, "worktree", "remove", "--force", tam);
		} catch {
			fs.rmSync(tam, { recursive: true, force: true });
		}
	}
}

const kq = soat(GOC);
if (kq.maThoat === 2) {
	console.error(kq.loi[0]);
	process.exit(2);
}
const mu = thuocMu();
const loi = mu ? [...kq.loi, mu] : kq.loi;
console.log(`ttp kho tai lieu: goc ${kq.goc0.slice(0, 9)}, loi da duyet ${LOI_DA_DUYET}`);
if (loi.length > 0) {
	for (const dong of loi) console.error(dong);
	process.exit(1);
}
console.log("ttp kho tai lieu: dat");
