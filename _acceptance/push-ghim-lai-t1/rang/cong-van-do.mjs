import { spawnSync } from "node:child_process";
import {
	copyFileSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const GHIM_LAI = "38ecca3be";
const HO_SO = "t1-ma-doc";
const BAO_CAO = `_acceptance/${HO_SO}/evidence-report.md`;
const SO_CHAY = `_acceptance/${HO_SO}/run-log.jsonl`;
const CAU_HINH = "_acceptance/config.yaml";
const CONG = ".github/workflows/acceptance.yml";
const PHAN_LOAI = join(GOC, ".github", "scripts", "phan-loai.mjs");
const NHE = "nang=false\nly_do=chi-t1";
const VI_PHAM = `VIOLATION [${HO_SO}]`;
const TAC_GIA = {
	GIT_AUTHOR_NAME: "t",
	GIT_AUTHOR_EMAIL: "t@t",
	GIT_COMMITTER_NAME: "t",
	GIT_COMMITTER_EMAIL: "t@t",
};

const env = (them = {}) => {
	const ra = {};
	for (const [k, v] of Object.entries(process.env))
		if (!k.startsWith("GIT_")) ra[k] = v;
	return { ...ra, ...TAC_GIA, ...them };
};

function git(cwd, ...a) {
	const r = spawnSync("git", a, {
		cwd,
		env: env(),
		encoding: "utf8",
		maxBuffer: 1 << 28,
	});
	if (r.status !== 0)
		throw new Error(
			`git ${a.join(" ")}: ${(r.stderr || "").trim().split("\n")[0]}`,
		);
	return r.stdout.trim();
}

function kichBanCong() {
	const wf = Bun.YAML.parse(readFileSync(join(GOC, CONG), "utf8"));
	const buoc = (wf.jobs?.["luat-kho"]?.steps ?? []).find(
		(b) => b.name === "Pre-merge check",
	);
	if (!buoc?.run) return null;
	return buoc.run
		.replaceAll("\u0024{{ github.event_name }}", "pull_request")
		.replaceAll("\u0024{{ github.base_ref }}", "onehub");
}

function runIdCuoi(chu) {
	const dau = chu.lastIndexOf("\n### Re-pin");
	const m = dau < 0 ? null : chu.slice(dau).match(/^run_id: (\S+)$/m);
	return m ? m[1] : null;
}

const thuMuc = [];
const don = () => {
	for (const d of thuMuc) rmSync(d, { recursive: true, force: true });
};
for (const tin of ["SIGINT", "SIGTERM"]) {
	process.on(tin, () => {
		don();
		process.exit(130);
	});
}

function dung(sua) {
	const d = mkdtempSync(join(tmpdir(), "pglt-cong-"));
	thuMuc.push(d);
	const kho = join(d, "kho");
	git(d, "clone", "-q", "--shared", "--no-checkout", "--template=", GOC, kho);
	git(kho, "checkout", "-q", "--detach", `${GHIM_LAI}^`);
	git(kho, "update-ref", "refs/remotes/origin/onehub", "HEAD");
	git(kho, "checkout", "-q", "-b", "pr", GHIM_LAI);
	if (sua) {
		sua(kho);
		git(kho, "commit", "-q", "-am", "ca");
	}
	git(kho, "checkout", "-q", "--detach", "origin/onehub");
	git(kho, "merge", "-q", "--no-ff", "--no-edit", "pr");
	copyFileSync(join(GOC, CAU_HINH), join(kho, CAU_HINH));
	const pl = spawnSync("node", [PHAN_LOAI, "--goc", kho], {
		env: env({ SU_KIEN: "pull_request", NHAP: "false" }),
		encoding: "utf8",
	});
	const cong = spawnSync("bash", ["-c", KICH_BAN], {
		cwd: kho,
		env: env(),
		encoding: "utf8",
		maxBuffer: 1 << 28,
	});
	const ra = `${cong.stdout}\n${cong.stderr}`;
	return {
		kho,
		phanLoai: pl.stdout.trim(),
		ma: cong.status ?? -1,
		viPham: ra.split("\n").filter((l) => l.startsWith("VIOLATION")),
		tep: git(kho, "diff", "--name-only", "HEAD^1", "HEAD")
			.split("\n")
			.filter(Boolean),
	};
}

const loi = [];
const kiem = (dk, muc) => {
	if (!dk) loi.push(muc);
};

if (
	spawnSync("git", ["cat-file", "-e", `${GHIM_LAI}^{commit}`], {
		cwd: GOC,
		env: env(),
	}).status !== 0
) {
	console.log(`KHONG DO DUOC: thieu ${GHIM_LAI}`);
	process.exit(2);
}
const KICH_BAN = kichBanCong();
if (!KICH_BAN) {
	console.log("thuoc hong: thieu buoc Pre-merge check");
	process.exit(2);
}

try {
	const tepGhim = git(GOC, "show", "--name-only", "--format=", GHIM_LAI)
		.split("\n")
		.filter(Boolean)
		.sort();
	kiem(
		tepGhim.length === 16,
		`(a) commit ghim lai co ${tepGhim.length} tep, khong phai 16`,
	);

	const a = dung(null);
	kiem(
		JSON.stringify(a.tep) === JSON.stringify(tepGhim),
		"(a) diff HEAD^1..HEAD khac 16 tep cua commit ghim lai",
	);
	kiem(
		a.phanLoai === NHE,
		`(a) phan loai «${a.phanLoai.replace("\n", " ")}», khong phai chi-t1`,
	);
	kiem(a.ma === 0, `(a) cong ma ${a.ma}, khong phai 0`);
	kiem(a.viPham.length === 0, `(a) co VIOLATION: ${a.viPham[0] ?? ""}`);

	const nonce = `repin-gia-${process.pid}-${Date.now()}`;
	const b = dung((kho) => {
		const p = join(kho, BAO_CAO);
		const chu = readFileSync(p, "utf8");
		const id = runIdCuoi(chu);
		if (!id)
			throw new Error("thuoc hong: bao cao khong co run_id o muc Re-pin cuoi");
		if (readFileSync(join(kho, SO_CHAY), "utf8").includes(nonce))
			throw new Error("thuoc hong: nonce da co trong so chay");
		const dau = chu.lastIndexOf("\n### Re-pin");
		const sau =
			chu.slice(0, dau) +
			chu.slice(dau).replace(`run_id: ${id}`, `run_id: ${nonce}`);
		if (sau === chu) throw new Error("thuoc hong: (b) khong doi duoc run_id");
		writeFileSync(p, sau);
	});
	kiem(
		b.phanLoai === NHE,
		`(b) phan loai «${b.phanLoai.replace("\n", " ")}», khong phai chi-t1`,
	);
	kiem(b.ma === 1, `(b) cong ma ${b.ma}, khong phai 1`);
	kiem(
		b.viPham.some((l) => l.startsWith(VI_PHAM) && l.includes(nonce)),
		"(b) khong co VIOLATION [t1-ma-doc] chua ma gia",
	);

	const c = dung((kho) => {
		const id = runIdCuoi(readFileSync(join(kho, BAO_CAO), "utf8"));
		const p = join(kho, SO_CHAY);
		const dong = readFileSync(p, "utf8").split("\n");
		const i = dong.findIndex((l) => {
			try {
				const o = JSON.parse(l);
				return o.kind === "repin" && o.run_id === id;
			} catch {
				return false;
			}
		});
		if (i < 0) throw new Error(`thuoc hong: (c) khong thay dong repin ${id}`);
		const o = JSON.parse(dong[i]);
		o.suites_exit = [1, ...o.suites_exit.slice(1)];
		dong[i] = JSON.stringify(o);
		writeFileSync(p, dong.join("\n"));
	});
	kiem(
		JSON.stringify(c.tep) === JSON.stringify(tepGhim),
		"(c) diff khac 16 tep — commit gia phai chi cham run-log.jsonl da co",
	);
	kiem(
		c.phanLoai === NHE,
		`(c) phan loai «${c.phanLoai.replace("\n", " ")}», khong phai chi-t1`,
	);
	kiem(c.ma === 1, `(c) cong ma ${c.ma}, khong phai 1`);
	kiem(
		c.viPham.some(
			(l) => l.startsWith(VI_PHAM) && l.includes("nonzero suites_exit"),
		),
		"(c) khong co VIOLATION [t1-ma-doc] chua «nonzero suites_exit»",
	);
} catch (e) {
	console.log(
		String(e.message).startsWith("thuoc hong")
			? e.message
			: `thuoc hong: ${e.message}`,
	);
	don();
	process.exit(2);
}
don();
if (loi.length) {
	for (const l of loi) console.log(`DO ${l}`);
	process.exit(1);
}
console.log("dat cong-van-do");
