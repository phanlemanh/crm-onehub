import { execFileSync, spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const PRE_PUSH = readFileSync(join(GOC, ".githooks", "pre-push"), "utf8");
const MOC_EXEC = '\texec bash "$HOOK_CAY" "$@"\n';
const TRAN_MS = 60_000;
const SHA_RONG = "0".repeat(40);
const ghi = (s) => process.stdout.write(`${s}\n`);
const tam = [];
const thuMucTam = () => {
	const d = realpathSync(mkdtempSync(join(tmpdir(), "dptm-hook-")));
	tam.push(d);
	return d;
};
const envSach = () => Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("GIT_") && k !== "CRM_SKIP_HOOKS"));
const git = (cwd, ...a) => execFileSync("git", a, { cwd, env: envSach(), encoding: "utf8" }).trim();
const thucThi = (p, noiDung) => {
	mkdirSync(dirname(p), { recursive: true });
	writeFileSync(p, noiDung);
	chmodSync(p, 0o755);
};

const HOOK_GIA = '#!/usr/bin/env bash\nprintf \'%s\\n\' "$@" > "$DAU_DIR/cay-wt-argv"\ncat > "$DAU_DIR/cay-wt-stdin"\nexit "${MA_CAY:-0}"\n';
const BUN_GIA = '#!/bin/sh\nif [ "$1" = run ] && [ "$2" = check-types ]; then echo x >> "$DAU_DIR/bun-$(basename "$PWD")"; fi\nexit 0\n';

function dungKho(hookChinh, kieuWt) {
	const d = thuMucTam();
	const chinh = join(d, "chinh");
	const wt = join(d, "wt");
	const dau = join(d, "dau");
	mkdirSync(chinh);
	mkdirSync(dau);
	git(chinh, "init", "-q");
	git(chinh, "config", "extensions.worktreeConfig", "true");
	thucThi(join(chinh, ".githooks", "pre-push"), hookChinh);
	git(chinh, "add", ".");
	git(chinh, "-c", "user.email=t@t", "-c", "user.name=t", "commit", "-q", "-m", "nen");
	git(chinh, "config", "--worktree", "core.hooksPath", join(chinh, ".githooks"));
	git(chinh, "worktree", "add", "-q", wt, "-b", "nhanh");
	git(wt, "config", "--worktree", "core.hooksPath", join(chinh, ".githooks"));
	const hookWt = join(wt, ".githooks", "pre-push");
	if (kieuWt === "gia") thucThi(hookWt, HOOK_GIA);
	if (kieuWt === "that") thucThi(hookWt, PRE_PUSH);
	if (kieuWt === "vang") rmSync(hookWt);
	const remote = join(d, "remote.git");
	execFileSync("git", ["init", "-q", "--bare", remote], { env: envSach() });
	git(chinh, "remote", "add", "origin", remote);
	const bin = join(d, "bin");
	thucThi(join(bin, "bun"), BUN_GIA);
	return { chinh, wt, dau, bin, remote, sha: git(chinh, "rev-parse", "HEAD") };
}

function day(kho, tu, ref, maCay = 0) {
	const r = spawnSync("git", ["push", "origin", `HEAD:refs/heads/${ref}`], {
		cwd: tu,
		env: { ...envSach(), PATH: `${kho.bin}:${process.env.PATH}`, DAU_DIR: kho.dau, MA_CAY: String(maCay) },
		encoding: "utf8",
		timeout: TRAN_MS,
	});
	const dem = (ten) => (existsSync(join(kho.dau, ten)) ? readFileSync(join(kho.dau, ten), "utf8").trim().split("\n").filter(Boolean).length : 0);
	const doc = (ten) => (existsSync(join(kho.dau, ten)) ? readFileSync(join(kho.dau, ten), "utf8") : null);
	const dauBun = readdirSync(kho.dau).filter((f) => f.startsWith("bun-"));
	const ket = { ma: r.status, ra: `${r.stdout}${r.stderr}`, bunWt: dem("bun-wt"), bunChinh: dem("bun-chinh"), dauBun, argv: doc("cay-wt-argv"), stdin: doc("cay-wt-stdin") };
	for (const f of readdirSync(kho.dau)) rmSync(join(kho.dau, f));
	return ket;
}

const caTuWorktree = (hookChinh) => {
	const kho = dungKho(hookChinh, "gia");
	const a = day(kho, kho.wt, "t1", 0);
	const b = day(kho, kho.wt, "t2", 1);
	return { kho, a, b };
};

let sai = 0;
const xet = (ten, dung, chiTiet) => {
	if (dung) ghi(`XANH ${ten}`);
	else {
		sai++;
		ghi(`DO ${ten}: ${chiTiet}`);
	}
};

try {
	{
		const { kho, a, b } = caTuWorktree(PRE_PUSH);
		const stdinMong = `HEAD ${kho.sha} refs/heads/t1 ${SHA_RONG}\n`;
		xet(
			"tu-worktree",
			a.ma === 0 && a.dauBun.length === 0 && a.stdin === stdinMong && a.argv === `origin\n${kho.remote}\n` && b.ma !== 0 && b.stdin !== null,
			JSON.stringify({ ma: a.ma, dauBun: a.dauBun, stdin: a.stdin, argv: a.argv, maLan2: b.ma }),
		);
	}
	{
		const kho = dungKho(PRE_PUSH, "that");
		const r = day(kho, kho.wt, "t3");
		xet("worktree-mang-hook-that", r.ma === 0 && r.bunWt === 1 && r.dauBun.length === 1, JSON.stringify({ ma: r.ma, bunWt: r.bunWt, dauBun: r.dauBun, ra: r.ra.slice(-300) }));
	}
	{
		const kho = dungKho(PRE_PUSH, "gia");
		const r = day(kho, kho.chinh, "t4");
		xet("tu-checkout-chinh", r.ma === 0 && r.bunChinh === 1 && r.dauBun.length === 1 && r.stdin === null, JSON.stringify({ ma: r.ma, bunChinh: r.bunChinh, dauBun: r.dauBun }));
	}
	{
		const kho = dungKho(PRE_PUSH, "vang");
		const r = day(kho, kho.wt, "t5");
		xet("cay-khong-co-hook", r.ma === 0 && r.bunWt === 1 && r.dauBun.length === 1, JSON.stringify({ ma: r.ma, bunWt: r.bunWt, dauBun: r.dauBun }));
	}
	if (PRE_PUSH.split(MOC_EXEC).length !== 2) {
		ghi("MOC VANG: khong thay dung mot dong exec cua khoi chuyen hook");
		process.exit(2);
	}
	{
		const { a } = caTuWorktree(PRE_PUSH.replace(MOC_EXEC, ""));
		if (a.stdin === null && a.dauBun.length > 0) ghi("BAT tu-worktree: hook cua checkout chinh da chay");
		else {
			sai++;
			ghi(`SOT tu-worktree: bo exec ma hook cay van chay — ${JSON.stringify({ dauBun: a.dauBun, stdin: a.stdin })}`);
		}
	}
	{
		const { a } = caTuWorktree(PRE_PUSH.replace(MOC_EXEC, `\tcat >/dev/null\n${MOC_EXEC}`));
		if (a.stdin === "") ghi("BAT stdin: hook cay nhan dong ref rong");
		else {
			sai++;
			ghi(`SOT stdin: doc stdin truoc exec ma hook cay van nhan ${JSON.stringify(a.stdin)}`);
		}
	}
} finally {
	for (const d of tam) rmSync(d, { recursive: true, force: true });
}
ghi(`KET LUAN: ${sai === 0 ? "xanh" : `do ${sai}`}`);
process.exit(sai === 0 ? 0 : 1);
