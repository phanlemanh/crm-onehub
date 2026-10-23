import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const TRANG_VE = {
	driver: "trang-ve",
	boVe: "scripts/product-map.mjs",
	lenhTay: "node scripts/product-map.mjs --root .",
	tienTo: "trang-ve:",
	tienToCayTam: "trang-ve-",
	hanVeMs: 5 * 60 * 1000,
	tepThuocTinh: ".gitattributes",
};

const DONG_THUOC_TINH = new RegExp(`^(\\S+)\\s.*\\bmerge=${TRANG_VE.driver}\\b`);

function bao(chu) {
	process.stderr.write(`${TRANG_VE.tienTo} ${chu}\n`);
}

function envSach(base = process.env) {
	const r = spawnSync("git", ["rev-parse", "--local-env-vars"], { encoding: "utf8" });
	const bo = new Set((r.stdout || "").split("\n").filter(Boolean));
	const env = {};
	for (const [k, v] of Object.entries(base)) if (!bo.has(k)) env[k] = v;
	return env;
}

function chay(lenh, args, { cwd, env, input, timeout } = {}) {
	const r = spawnSync(lenh, args, { cwd, env, input, timeout, encoding: "utf8", maxBuffer: 1 << 28 });
	return {
		ok: r.status === 0 && !r.error,
		ra: (r.stdout || "").trim(),
		loi: r.error ? String(r.error.code ?? r.error.message) : (r.stderr || "").trim().split("\n").slice(-1)[0] || `mã ${r.status}`,
	};
}

function gitPhai(goc, args, env) {
	const r = chay("git", args, { cwd: goc, env });
	if (!r.ok) throw new Error(`git ${args[0]}: ${r.loi}`);
	return r.ra;
}

export function docTrang(goc) {
	const tep = join(goc, TRANG_VE.tepThuocTinh);
	if (!existsSync(tep)) return [];
	return readFileSync(tep, "utf8")
		.split("\n")
		.map((d) => DONG_THUOC_TINH.exec(d.trim())?.[1])
		.filter(Boolean);
}

function thuMucGit(goc, env, khoa) {
	const d = gitPhai(goc, ["rev-parse", khoa], env);
	return isAbsolute(d) ? d : resolve(goc, d);
}

function veTrongCayTam(goc, commit, trang) {
	const env = envSach();
	const tam = mkdtempSync(join(tmpdir(), TRANG_VE.tienToCayTam));
	const cay = join(tam, "cay");
	try {
		gitPhai(goc, ["worktree", "add", "-q", "--detach", cay, commit], env);
		const r = chay("node", [TRANG_VE.boVe, "--root", "."], { cwd: cay, env, timeout: TRANG_VE.hanVeMs });
		if (!r.ok) throw new Error(`bộ vẽ thoát lỗi (${r.loi})`);
		const ra = {};
		for (const t of trang) if (existsSync(join(cay, t))) ra[t] = readFileSync(join(cay, t));
		return ra;
	} finally {
		chay("git", ["worktree", "remove", "--force", cay], { cwd: goc, env });
		rmSync(tam, { recursive: true, force: true });
		chay("git", ["worktree", "prune"], { cwd: goc, env });
	}
}

function blobCua(goc, commit, duong, env) {
	const r = chay("git", ["rev-parse", "-q", "--verify", `${commit}:${duong}`], { cwd: goc, env });
	return r.ok ? r.ra : null;
}

function bam(buf) {
	return createHash("sha1").update(`blob ${buf.length}\0`).update(buf).digest("hex");
}

function ghiCay(goc, trangMoi) {
	for (const [t, buf] of Object.entries(trangMoi)) writeFileSync(join(goc, t), buf);
}

function vietLaiDinh(goc, trangMoi) {
	const env = envSach();
	const cu = gitPhai(goc, ["rev-parse", "HEAD"], env);
	const tam = mkdtempSync(join(tmpdir(), TRANG_VE.tienToCayTam));
	const chiMuc = join(tam, "index");
	try {
		const envMuc = { ...env, GIT_INDEX_FILE: chiMuc };
		gitPhai(goc, ["read-tree", cu], envMuc);
		for (const [t, buf] of Object.entries(trangMoi)) {
			const blob = chay("git", ["hash-object", "-w", "--stdin"], { cwd: goc, env, input: buf });
			if (!blob.ok) throw new Error(`git hash-object: ${blob.loi}`);
			gitPhai(goc, ["update-index", "--add", "--cacheinfo", `100644,${blob.ra},${t}`], envMuc);
		}
		const cay = gitPhai(goc, ["write-tree"], envMuc);
		const cha = gitPhai(goc, ["rev-list", "--parents", "-n", "1", cu], env).split(" ").slice(1);
		const loi = gitPhai(goc, ["log", "-1", "--format=%B", cu], env);
		const [an, ae, ad, cn, ce, cd] = gitPhai(goc, ["log", "-1", "--format=%an%x00%ae%x00%ad%x00%cn%x00%ce%x00%cd", "--date=raw", cu], env).split("\0");
		const envCommit = {
			...env,
			GIT_AUTHOR_NAME: an,
			GIT_AUTHOR_EMAIL: ae,
			GIT_AUTHOR_DATE: ad,
			GIT_COMMITTER_NAME: cn,
			GIT_COMMITTER_EMAIL: ce,
			GIT_COMMITTER_DATE: cd,
		};
		const r = chay("git", ["commit-tree", cay, ...cha.flatMap((p) => ["-p", p])], { cwd: goc, env: envCommit, input: `${loi}\n` });
		if (!r.ok) throw new Error(`git commit-tree: ${r.loi}`);
		gitPhai(goc, ["update-ref", "-m", `${TRANG_VE.tienTo} vẽ lại sau gộp`, "HEAD", r.ra, cu], env);
		ghiCay(goc, trangMoi);
		gitPhai(goc, ["add", "--", ...Object.keys(trangMoi)], env);
		return r.ra;
	} finally {
		rmSync(tam, { recursive: true, force: true });
	}
}

function khac(goc, commit, trangMoi, env) {
	const ra = {};
	for (const [t, buf] of Object.entries(trangMoi)) if (blobCua(goc, commit, t, env) !== bam(buf)) ra[t] = buf;
	return ra;
}

function sauGop(goc) {
	const env = envSach();
	const cha = gitPhai(goc, ["rev-list", "--parents", "-n", "1", "HEAD"], env).split(" ").length - 1;
	if (cha < 2) return;
	const trang = docTrang(goc).filter((t) => blobCua(goc, "HEAD", t, env));
	if (trang.length === 0) return;
	if (process.env.CRM_SKIP_HOOKS) {
		bao(`CRM_SKIP_HOOKS bật — không vẽ lại ${trang.join(", ")} sau gộp; chạy tay: ${TRANG_VE.lenhTay}`);
		return;
	}
	bao(`vẽ lại ${trang.join(", ")} từ commit gộp…`);
	const doi = khac(goc, "HEAD", veTrongCayTam(goc, "HEAD", trang), env);
	if (Object.keys(doi).length === 0) return;
	const moi = vietLaiDinh(goc, doi);
	bao(`đã vẽ lại ${Object.keys(doi).join(", ")} vào commit gộp ${moi.slice(0, 9)}.`);
}

function trongGop(goc) {
	const envHook = process.env;
	const env = envSach();
	const gitDir = thuMucGit(goc, env, "--git-dir");
	const tepMerge = join(gitDir, "MERGE_HEAD");
	if (!existsSync(tepMerge)) return;
	const trang = docTrang(goc);
	if (trang.length === 0) return;
	if (process.env.CRM_SKIP_HOOKS) {
		bao(`CRM_SKIP_HOOKS bật — không vẽ lại ${trang.join(", ")} trong commit gộp; chạy tay: ${TRANG_VE.lenhTay}`);
		return;
	}
	const cay = gitPhai(goc, ["write-tree"], envHook);
	const cha = ["HEAD", ...readFileSync(tepMerge, "utf8").split("\n").filter(Boolean)];
	const r = chay("git", ["commit-tree", cay, ...cha.flatMap((p) => ["-p", p])], { cwd: goc, env, input: `${TRANG_VE.tienTo} tam\n` });
	if (!r.ok) throw new Error(`git commit-tree: ${r.loi}`);
	bao(`vẽ lại ${trang.join(", ")} cho commit gộp…`);
	const doi = khac(goc, r.ra, veTrongCayTam(goc, r.ra, trang), env);
	if (Object.keys(doi).length === 0) return;
	ghiCay(goc, doi);
	gitPhai(goc, ["add", "--", ...Object.keys(doi)], envHook);
	bao(`đã vẽ lại ${Object.keys(doi).join(", ")} trong commit gộp.`);
}

function main() {
	const che = process.argv[2];
	const goc = resolve(dirname(fileURLToPath(import.meta.url)), "..");
	try {
		if (che === "sau-gop") sauGop(goc);
		else if (che === "trong-gop") trongGop(goc);
		else bao(`chế độ lạ «${che ?? ""}» — chỉ nhận sau-gop, trong-gop`);
	} catch (e) {
		bao(`không vẽ lại được (${String(e.message).replace(/\s+/g, " ").trim()}) — chạy tay: ${TRANG_VE.lenhTay}`);
	}
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
