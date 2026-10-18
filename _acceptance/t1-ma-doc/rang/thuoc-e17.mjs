import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const THUOC = "_acceptance/khung-trang-cai-dat/rang/san-thiet-ke.mjs";
const BAO_CAO = "_acceptance/khung-trang-cai-dat/evidence-report.md";
const TEP_TIEM = "apps/app/app/(app)/[slug]/settings/settings-sidebar.tsx";
const CHO_TIEM = "<NavItem";
const TIEM = '<NavItem className="mau-tiem"';
const CHU_DO = "HONG settings-sidebar.tsx: NavItem mang className";
const KHONG_DO = "KHONG DO DUOC";
const DAT = "san-thiet-ke: dat";

function chay(cay) {
	const r = spawnSync("bun", [THUOC], { cwd: cay, encoding: "utf8", env: { ...process.env, GOC_KHO: "" } });
	return { ma: r.status ?? -1, ra: `${r.stdout}${r.stderr}` };
}

function git(cwd, ...a) {
	const r = spawnSync("git", a, { cwd, encoding: "utf8" });
	if (r.status !== 0) throw new Error(`git ${a.join(" ")}: ${r.stderr}`);
	return r.stdout.trim();
}

const soTep = (ra) => Number(ra.match(/so tep giao dien vong nay cham: (\d+)/)?.[1] ?? -1);
const loi = [];
const ghi = (ten, dat, chiTiet) => {
	console.log(`${dat ? "dat" : "DO"} ${ten}: ${chiTiet}`);
	if (!dat) loi.push(ten);
};

const that = chay(GOC);
ghi("cay-that-lanh", that.ma === 0 && that.ra.includes(DAT) && !that.ra.includes(KHONG_DO), `ma ${that.ma}, ${soTep(that.ra)} tep`);

const tam = mkdtempSync(join(tmpdir(), "thuoc-e17-"));
const wt = join(tam, "cay");
try {
	git(GOC, "worktree", "add", "-q", "--detach", wt, "HEAD");
	symlinkSync(join(GOC, "node_modules"), join(wt, "node_modules"));
	writeFileSync(join(wt, THUOC), readFileSync(join(GOC, THUOC), "utf8"));
	const lanh = chay(wt);
	ghi("ban-sao-lanh", lanh.ma === 0 && lanh.ra.includes(DAT), `ma ${lanh.ma}, ${soTep(lanh.ra)} tep`);

	const bc = join(wt, BAO_CAO);
	const bcGoc = readFileSync(bc, "utf8");
	writeFileSync(bc, bcGoc.replace(/^verified_commit:\s*[0-9a-f]{40}\s*$/m, `verified_commit: ${git(wt, "rev-parse", "HEAD")}`));
	const ghiDe = chay(wt);
	ghi("ghi-de-verified-commit", ghiDe.ma === lanh.ma && soTep(ghiDe.ra) === soTep(lanh.ra), `ma ${ghiDe.ma}, ${soTep(ghiDe.ra)} tep (lanh ${soTep(lanh.ra)})`);
	writeFileSync(bc, bcGoc);

	const tiem = join(wt, TEP_TIEM);
	const tiemGoc = readFileSync(tiem, "utf8");
	writeFileSync(tiem, tiemGoc.replace(CHO_TIEM, TIEM));
	if (readFileSync(tiem, "utf8") === tiemGoc) {
		console.log("thuoc hong: khong tiem duoc");
		process.exit(2);
	}
	const do_ = chay(wt);
	ghi("tiem-vi-pham-thi-do", do_.ma === 1 && do_.ra.includes(CHU_DO), `ma ${do_.ma}, ${do_.ra.includes(CHU_DO) ? "dung chu" : "thieu chu"}`);
	writeFileSync(tiem, tiemGoc);
} finally {
	spawnSync("git", ["worktree", "remove", "--force", wt], { cwd: GOC });
	rmSync(tam, { recursive: true, force: true });
}

if (loi.length) process.exit(1);
console.log("dat thuoc-e17");
