import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import { dirname, join } from "node:path";

const MOI_TRUONG_GIT = {
	GIT_AUTHOR_NAME: "kho-gia",
	GIT_AUTHOR_EMAIL: "kho-gia@example.com",
	GIT_COMMITTER_NAME: "kho-gia",
	GIT_COMMITTER_EMAIL: "kho-gia@example.com",
};

function sachMoiTruong() {
	const env = { ...process.env, ...MOI_TRUONG_GIT };
	for (const k of Object.keys(env))
		if (
			k.startsWith("GIT_DIR") ||
			k === "GIT_WORK_TREE" ||
			k === "GIT_INDEX_FILE"
		)
			delete env[k];
	return env;
}

export function taoKho() {
	const tam = mkdtempSync(join(os.tmpdir(), "kcs-"));
	const goc = join(tam, "kho");
	const nguon = join(tam, "origin.git");
	const env = sachMoiTruong();
	const g = (cwd, ...a) =>
		execFileSync("git", a, { cwd, env, encoding: "utf8" }).trim();
	g(tam, "init", "-q", "--bare", "-b", "onehub", nguon);
	mkdirSync(goc);
	g(goc, "init", "-q", "-b", "onehub");
	g(goc, "remote", "add", "origin", nguon);
	const git = (...a) => g(goc, ...a);
	const ghi = (tep, noiDung) => {
		const d = join(goc, tep);
		mkdirSync(dirname(d), { recursive: true });
		writeFileSync(d, noiDung);
	};
	ghi("README.md", "kho gia\n");
	git("add", "-A");
	git("commit", "-q", "-m", "goc");
	git("push", "-q", "origin", "onehub");
	let dem = 0;
	const gop = (tepMap, nhanh = "onehub") => {
		dem += 1;
		const ten = `viec-${dem}`;
		git("checkout", "-q", "-b", ten, nhanh);
		for (const [tep, noiDung] of Object.entries(tepMap)) {
			if (noiDung === null) rmSync(join(goc, tep), { force: true });
			else ghi(tep, noiDung);
		}
		git("add", "-A");
		git("commit", "-q", "-m", ten);
		git("checkout", "-q", nhanh);
		git("merge", "-q", "--no-ff", "-m", `Merge ${ten}`, ten);
		git("push", "-q", "origin", nhanh);
		return git("rev-parse", "HEAD");
	};
	const hoSo = (
		slug,
		{ status = "signed-off", paths = [], evals, kieuDong = false } = {},
	) => {
		ghi(
			`_acceptance/${slug}/contract.md`,
			`---\nslug: ${slug}\nstatus: ${status}\n---\n`,
		);
		ghi(
			`_acceptance/${slug}/evals.yaml`,
			evals ??
				(kieuDong
					? `schema_version: 1\nslug: ${slug}\nevals:\n  - id: E1\n    executor: script\n    cmd: node kiem.js\n    paths: [${paths.map((p) => `"${p}"`).join(", ")}]\n`
					: `schema_version: 1\nslug: ${slug}\nevals:\n  - id: E1\n    executor: script\n    cmd: node kiem.js\n    paths:\n${paths.map((p) => `      - "${p}"`).join("\n")}\n`),
		);
	};
	return {
		tam,
		goc,
		git,
		ghi,
		gop,
		hoSo,
		sha: (ref = "HEAD") => git("rev-parse", ref),
		don: () => rmSync(tam, { recursive: true, force: true }),
	};
}
