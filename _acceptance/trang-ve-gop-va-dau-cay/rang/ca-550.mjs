import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const DAU_PR = "bcf7ecdf9";
const ONEHUB = "084ec4d12";
const REF_PR = "pull/550/head";
const TRANG = ["LO-TRINH.html", "PRODUCT-MAP.md"];
const CONG_CU = [".gitattributes", ".githooks/post-merge", ".githooks/pre-commit", "scripts/trang-ve-gop.mjs"];
const TAC_GIA = { GIT_AUTHOR_NAME: "ca-550", GIT_AUTHOR_EMAIL: "ca@550", GIT_COMMITTER_NAME: "ca-550", GIT_COMMITTER_EMAIL: "ca@550" };

const env = (them = {}) => {
	const e = {};
	for (const [k, v] of Object.entries(process.env)) if (!k.startsWith("GIT_") && k !== "CRM_SKIP_HOOKS") e[k] = v;
	return { ...e, ...TAC_GIA, ...them };
};
const git = (cwd, args, them) => {
	const r = spawnSync("git", args, { cwd, env: env(them), encoding: "utf8", maxBuffer: 1 << 26 });
	return { ma: r.status, ra: (r.stdout || "").trim(), loi: (r.stderr || "").trim() };
};
const phai = (cwd, args, them) => {
	const r = git(cwd, args, them);
	if (r.ma !== 0) throw new Error(`git ${args.join(" ")}: ${r.loi}`);
	return r.ra;
};

const loi = [];
const dat = (ten) => console.log(`dat ${ten}`);
const sai = (ten, chu) => {
	console.log(`DO ${ten}: ${chu}`);
	loi.push(ten);
};

function coCommit(sha) {
	return git(GOC, ["cat-file", "-e", `${sha}^{commit}`]).ma === 0;
}

if (!coCommit(DAU_PR)) git(GOC, ["fetch", "-q", "origin", REF_PR]);
if (!coCommit(DAU_PR) || !coCommit(ONEHUB)) {
	console.log(`khong co ca that: thieu ${coCommit(DAU_PR) ? ONEHUB : DAU_PR}`);
	process.exit(2);
}

const truoc = phai(GOC, ["worktree", "list", "--porcelain"]);
const tam = mkdtempSync(join(tmpdir(), "ca-550-"));
const cay = join(tam, "cay");
const sach = join(tam, "sach");
const tat = ["-c", "core.hooksPath=/dev/null"];

function themCongCu(sha) {
	phai(cay, [...tat, "checkout", "-q", "--detach", sha]);
	for (const t of CONG_CU) {
		mkdirSync(dirname(join(cay, t)), { recursive: true });
		copyFileSync(join(GOC, t), join(cay, t));
	}
	phai(cay, [...tat, "add", "--", ...CONG_CU]);
	phai(cay, [...tat, "commit", "-q", "-m", "cong cu cua vong trang-ve-gop-va-dau-cay"]);
	return phai(cay, ["rev-parse", "HEAD"]);
}

function check(sha) {
	phai(GOC, ["worktree", "add", "-q", "--detach", sach, sha]);
	try {
		const r = spawnSync("node", ["scripts/product-map.mjs", "--root", ".", "--check"], { cwd: sach, env: env(), encoding: "utf8" });
		return { ma: r.status, ra: `${r.stdout}${r.stderr}` };
	} finally {
		git(GOC, ["worktree", "remove", "--force", sach]);
	}
}

try {
	phai(GOC, ["worktree", "add", "-q", "--detach", cay, DAU_PR]);

	const r1 = git(cay, [...tat, "merge", "--no-edit", ONEHUB]);
	const xd = git(cay, ["diff", "--name-only", "--diff-filter=U"]).ra.split("\n").filter(Boolean).sort();
	if (r1.ma !== 0 && JSON.stringify(xd) === JSON.stringify(TRANG)) dat("doi-chung");
	else sai("doi-chung", `merge ${r1.ma}, xung dot ${JSON.stringify(xd)}`);
	git(cay, [...tat, "merge", "--abort"]);

	const b = themCongCu(ONEHUB);
	const a = themCongCu(DAU_PR);
	const coHook = ["-c", `core.hooksPath=${join(cay, ".githooks")}`];

	const r2 = git(cay, [...coHook, "merge", "--no-edit", b]);
	const cha = phai(cay, ["rev-list", "--parents", "-n", "1", "HEAD"]).split(" ").slice(1);
	const dau = (ref) => phai(cay, ["log", "-1", "--format=%B%x00%an%x00%ae%x00%ad%x00%cn%x00%ce%x00%cd", ref]);
	const sauGit = phai(cay, ["reflog", "-2", "--format=%H %gs"]).split("\n");
	const banGit = sauGit.find((d) => d.includes("merge "))?.split(" ")[0] ?? "";
	const trangThai = phai(cay, ["status", "--porcelain"]);
	const c2 = check(phai(cay, ["rev-parse", "HEAD"]));
	if (r2.ma !== 0) sai("co-hook", `merge thoat ${r2.ma}: ${r2.loi}`);
	else if (JSON.stringify(cha) !== JSON.stringify([a, b])) sai("co-hook", `cha ${cha.join(" ")}`);
	else if (!banGit || dau(banGit) !== dau("HEAD")) sai("co-hook", "loi, tac gia, nguoi commit khac commit git tao");
	else if (trangThai) sai("co-hook", `cay lam viec ban: ${trangThai}`);
	else if (c2.ma !== 0) sai("co-hook", `--check thoat ${c2.ma}: ${c2.ra.split("\n").slice(-3).join(" | ")}`);
	else dat("co-hook");

	phai(cay, [...tat, "reset", "-q", "--hard", a]);
	const r3 = git(cay, [...coHook, "merge", "--no-edit", b], { CRM_SKIP_HOOKS: "1" });
	const c3 = check(phai(cay, ["rev-parse", "HEAD"]));
	if (r3.ma === 0 && c3.ma === 1 && c3.ra.includes("PRODUCT-MAP.md lệch") && c3.ra.includes("LO-TRINH.html lệch")) dat("tat-hook");
	else sai("tat-hook", `merge ${r3.ma}, --check ${c3.ma}: ${c3.ra.split("\n").slice(-2).join(" | ")}`);
} finally {
	git(GOC, ["worktree", "remove", "--force", cay]);
	git(GOC, ["worktree", "remove", "--force", sach]);
	git(GOC, ["worktree", "prune"]);
	rmSync(tam, { recursive: true, force: true });
}

const sau = phai(GOC, ["worktree", "list", "--porcelain"]);
if (sau !== truoc) sai("don-dep", "danh sach worktree khac truoc");
process.exit(loi.length ? 1 : 0);
