import { spawnSync } from "node:child_process";
import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const TEP_TIN_HIEU = "tin-hieu/crm/crm-9.json";
const TEP_MA = "scripts/tin-hieu/lich.ts";
const PHA_THU = process.argv.includes("--pha-thu");

function chay(cwd, lenh, ...thamSo) {
	const r = spawnSync(lenh, thamSo, {
		cwd,
		encoding: "utf8",
		env: {
			...process.env,
			GIT_AUTHOR_NAME: "thu",
			GIT_AUTHOR_EMAIL: "thu@thu.test",
			GIT_COMMITTER_NAME: "thu",
			GIT_COMMITTER_EMAIL: "thu@thu.test",
		},
	});
	return { ma: r.status ?? 1, ra: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

const tam = mkdtempSync(join(tmpdir(), "tvk-t1-"));
const cay = join(tam, "cay");
const dong = [];
try {
	const tao = chay(
		GOC,
		"git",
		"worktree",
		"add",
		"--quiet",
		"--detach",
		cay,
		"HEAD",
	);
	if (tao.ma !== 0) throw new Error(`khong dung duoc worktree: ${tao.ra}`);
	const goc = chay(cay, "git", "rev-parse", "HEAD").ra.trim();
	if (PHA_THU) {
		const cfg = join(cay, "_acceptance", "config.yaml");
		writeFileSync(
			cfg,
			readFileSync(cfg, "utf8")
				.split("\n")
				.filter((d) => !d.includes('"tin-hieu/crm/**"'))
				.join("\n"),
		);
	}
	const { quyetDinh, docGlobT1, tepT1 } = await import(
		pathToFileURL(join(cay, ".github", "scripts", "phan-loai.mjs")).href
	);
	const globs = docGlobT1(cay);
	const phanLoai = (tep) =>
		quyetDinh({
			suKien: "pull_request",
			nhap: "false",
			tep,
			laT1: (t) => tepT1(globs, [t]).has(t),
		});

	mkdirSync(join(cay, "tin-hieu", "crm"), { recursive: true });
	writeFileSync(join(cay, TEP_TIN_HIEU), "{}\n");
	chay(cay, "git", "add", TEP_TIN_HIEU);
	chay(cay, "git", "commit", "--quiet", "-m", "tin hieu thu");
	const pl = phanLoai([TEP_TIN_HIEU]);
	dong.push([
		"1 PR chi cham thu muc tin hieu duoc xep T1",
		pl.nang === false && pl.lyDo === "chi-t1",
		JSON.stringify(pl),
	]);
	const pm = chay(
		cay,
		"bash",
		"scripts/pre-merge-check.sh",
		".",
		"--base",
		goc,
	);
	dong.push([
		"2 kiem truoc gop khong doi ho so",
		pm.ma === 0,
		`ma ${pm.ma} ${pm.ra.trim().split("\n").slice(-2).join(" | ")}`,
	]);
	const doi = phanLoai([TEP_MA]);
	dong.push([
		"3 doi chung: tep ma khong duoc xep T1",
		doi.nang === true && doi.lyDo === "co-tep-nang",
		JSON.stringify(doi),
	]);
} catch (loi) {
	dong.push([
		"0 dung kho tam",
		false,
		loi instanceof Error ? loi.message : String(loi),
	]);
} finally {
	chay(GOC, "git", "worktree", "remove", "--force", cay);
	rmSync(tam, { recursive: true, force: true });
}
if (PHA_THU) {
	const sai1 = dong.find(([t]) => t.startsWith("1"))?.[1] === false;
	console.log(
		sai1
			? "PHA-THU DUNG: bo glob T1 -> dong 1 SAI (thu muc tin hieu khong con T1)"
			: "PHA-THU SAI",
	);
	process.exit(sai1 ? 0 : 1);
}
for (const [ten, dung, chiTiet] of dong)
	console.log(`${dung ? "DUNG" : "SAI"} ${ten} — ${chiTiet}`);
const dat = dong.every(([, d]) => d);
console.log(dat ? "KET LUAN: thu muc tin hieu la T1" : "KET LUAN: co dong SAI");
process.exit(dat ? 0 : 1);
