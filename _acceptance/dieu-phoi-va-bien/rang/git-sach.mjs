import { execFileSync, spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const PRE_PUSH = join(GOC, ".githooks", "pre-push");
const MODULE = join(GOC, "scripts", "gate-shape-node-test.mjs");
const DIR_TEST = "scripts/dieu-phoi/test";
const MOC_PRE_PUSH = "unset $(git rev-parse --local-env-vars)\n";
const MOC_MODULE = "\t\tenv: withoutGitVars(process.env),\n";
const TRAN_LENH_MS = 120_000;
const ghi = (s) => process.stdout.write(`${s}\n`);
const tam = [];
const thuMucTam = () => {
	const d = realpathSync(mkdtempSync(join(tmpdir(), "dpvb-git-")));
	tam.push(d);
	return d;
};
const envSach = () => Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("GIT_")));
const git = (cwd, ...a) => execFileSync("git", a, { cwd, env: envSach(), encoding: "utf8" }).trim();

function dungKhoNhap() {
	const d = thuMucTam();
	const chinh = join(d, "chinh");
	mkdirSync(chinh);
	git(chinh, "init", "-q");
	git(chinh, "-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "--allow-empty", "-m", "nen");
	git(chinh, "worktree", "add", "-q", join(d, "wt"), "-b", "nhanh");
	return { chinh, wt: join(d, "wt"), gitdir: join(chinh, ".git", "worktrees", "wt") };
}

function chup(kho) {
	return JSON.stringify({
		bare: git(kho.chinh, "config", "--get", "core.bare"),
		nhanh: git(kho.chinh, "for-each-ref", "--format=%(refname) %(objectname)", "refs/heads"),
		worktree: git(kho.chinh, "worktree", "list", "--porcelain"),
		log: git(kho.chinh, "log", "--all", "--format=%H %s"),
	});
}

function tongKet(text) {
	const tests = /^(?:ℹ|#) tests (\d+)\s*$/m.exec(text);
	const fail = /^(?:ℹ|#) fail (\d+)\s*$/m.exec(text);
	return tests && fail ? { tests: Number(tests[1]), fail: Number(fail[1]) } : null;
}

function binGia() {
	const bin = thuMucTam();
	const bun = join(bin, "bun");
	writeFileSync(bun, `#!/bin/sh\nif [ "$1" = run ] && [ "$2" = test:dieu-phoi ]; then exec node --test "${join(GOC, DIR_TEST)}/"*.test.mjs; fi\nexit 0\n`);
	chmodSync(bun, 0o755);
	return bin;
}

function chayPrePush(tep, kho) {
	const r = spawnSync("bash", [tep, "origin", "https://example.invalid/x.git"], {
		cwd: kho.wt,
		env: { ...envSach(), PATH: `${binGia()}:${process.env.PATH}`, GIT_DIR: kho.gitdir },
		input: `refs/heads/nhanh ${"1".repeat(40)} refs/heads/nhanh ${"0".repeat(40)}\n`,
		encoding: "utf8",
		timeout: TRAN_LENH_MS,
	});
	return { ma: r.status, tong: tongKet(`${r.stdout}${r.stderr}`), ra: `${r.stdout}${r.stderr}` };
}

function chayThamChieu(tep, kho) {
	const ma = `const m = await import(${JSON.stringify(pathToFileURL(tep).href)}); process.stdout.write(JSON.stringify(m.runReference(${JSON.stringify(GOC)}, ${JSON.stringify(DIR_TEST)})));`;
	const r = spawnSync(process.execPath, ["--input-type=module", "-e", ma], {
		cwd: kho.wt,
		env: { ...envSach(), GIT_DIR: kho.gitdir },
		encoding: "utf8",
		timeout: TRAN_LENH_MS,
	});
	let tong = null;
	try {
		tong = JSON.parse(r.stdout);
	} catch {
		tong = null;
	}
	return { ma: r.status, tong, ra: `${r.stdout}${r.stderr}` };
}

function do1(ten, chay, tep) {
	const kho = dungKhoNhap();
	const truoc = chup(kho);
	const kq = chay(tep, kho);
	let sau;
	try {
		sau = chup(kho);
	} catch (e) {
		sau = `kho hong: ${e.message.split("\n")[0]}`;
	}
	const doi = sau !== truoc;
	const chayDu = kq.tong && kq.tong.tests > 0 && kq.tong.fail === 0;
	return { ten, doi, chayDu, kq, truoc, sau };
}

function moTaDoi(t, s) {
	if (s.startsWith("kho hong")) return s;
	const a = JSON.parse(t);
	const b = JSON.parse(s);
	return Object.keys(a).filter((k) => a[k] !== b[k]).map((k) => `${k}: ${k === "bare" ? `${a[k]} → ${b[k]}` : "đổi"}`).join(", ");
}

function banSao(goc, moc, ten) {
	const text = readFileSync(goc, "utf8");
	if (text.split(moc).length !== 2) {
		ghi(`MOC VANG ${ten}: khong thay dung mot lan ${JSON.stringify(moc)}`);
		process.exit(2);
	}
	const p = join(thuMucTam(), ten);
	writeFileSync(p, text.replace(moc, ""));
	return p;
}

let sai = 0;
try {
	for (const [ten, chay, tep] of [["pre-push", chayPrePush, PRE_PUSH], ["tham-chieu", chayThamChieu, MODULE]]) {
		const r = do1(ten, chay, tep);
		if (!r.doi && r.chayDu) ghi(`XANH ${ten}: kho nhap khong doi, ${r.kq.tong.tests} ca, 0 do`);
		else {
			sai++;
			ghi(`DO ${ten}: ${r.doi ? `kho nhap bi doi — ${moTaDoi(r.truoc, r.sau)}` : ""}${r.chayDu ? "" : ` · luot test khong chay du (ma ${r.kq.ma}, tong ${JSON.stringify(r.kq.tong)})`}`);
		}
	}
	for (const [ten, chay, tep] of [["pre-push", chayPrePush, banSao(PRE_PUSH, MOC_PRE_PUSH, "pre-push")], ["tham-chieu", chayThamChieu, banSao(MODULE, MOC_MODULE, "gate-shape-node-test.mjs")]]) {
		const r = do1(ten, chay, tep);
		if (r.doi) ghi(`BAT ${ten}: ${moTaDoi(r.truoc, r.sau)}`);
		else {
			sai++;
			ghi(`SOT ${ten}: bo buoc go bien GIT_* ma kho nhap van khong doi`);
		}
	}
} finally {
	for (const d of tam) rmSync(d, { recursive: true, force: true });
}
ghi(`KET LUAN: ${sai === 0 ? "xanh" : `do ${sai}`}`);
process.exit(sai === 0 ? 0 : 1);
