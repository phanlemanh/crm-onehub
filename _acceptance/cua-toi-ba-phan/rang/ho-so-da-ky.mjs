#!/usr/bin/env bun
/**
 * E13 (AC-11): các eval máy của hồ sơ đã ký chạy những tệp kiểm lượt này sửa vẫn
 * thoát đúng mã kỳ vọng như lúc ký (khuôn `_acceptance/dieu-huong-khu-muc-tieu/rang/
 * ho-so-da-ky.mjs`).
 *
 * Tập tệp kiểm rút LÚC CHẠY: `git diff --name-only <merge-base với origin/onehub>` dưới
 * apps/app/test, apps/agent/test, apps/api/test — cộng mọi tệp kiểm của app nhập một
 * tệp trợ giúp bị sửa (vd okr-don-san.tsx). Tập eval rút từ `_acceptance/* /evals.yaml`
 * của hồ sơ `signed-off`/`machine-cleared`: executor test/script, không khai
 * `status: not-run`, lệnh `config:` giải ra chuỗi nhắc một tệp trong tập.
 *
 * Hai chiều: (1) mọi lệnh đạt mã kỳ vọng trên cây thật; (2) trong MỘT WORKTREE TẠM
 * tiêm `throw` vào cuối một tệp `.dom.tsx` của tập rồi chạy lại các lệnh nhắc nó →
 * mỗi lệnh phải lệch mã kỳ vọng. Cây thật không bị ghi.
 * Mã thoát: 0 hai chiều đúng · 1 sai · 2 không đo được (tập rỗng, đọc hỏng).
 */
import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { parseEvals, stripComment, expectedExits } = await import(
	join(GOC, "lib/eval-yaml.cjs")
);
const HO_SO_NAY = "cua-toi-ba-phan";
const THU_MUC = ["apps/app/test", "apps/agent/test", "apps/api/test"];

function khongDo(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

const git = (cwd, ...a) =>
	execFileSync("git", a, {
		cwd,
		encoding: "utf8",
		maxBuffer: 256 * 1024 * 1024,
	}).trim();
const base =
	process.env.CTBP_BASE ?? git(GOC, "merge-base", "HEAD", "origin/onehub");
const sua = git(GOC, "diff", "--name-only", base, "--", ...THU_MUC)
	.split("\n")
	.filter((f) => f && existsSync(join(GOC, f)));
const laKiem = (f) => /\.(dom\.tsx|spec\.ts|spec\.tsx)$/.test(f);
const tap = new Set(sua.filter(laKiem).map((f) => basename(f)));
const troGiup = sua
	.filter((f) => f.startsWith("apps/app/test/") && !laKiem(f))
	.map((f) => basename(f).replace(/\.tsx?$/, ""));
for (const f of readdirSync(join(GOC, "apps/app/test"))) {
	if (!laKiem(f)) continue;
	const chu = readFileSync(join(GOC, "apps/app/test", f), "utf8");
	if (troGiup.some((t) => chu.includes(`./${t}"`))) tap.add(f);
}
if (tap.size === 0) khongDo("bo chon rong — khong tep kiem nao bi sua");

const cauHinh = Bun.YAML.parse(
	readFileSync(join(GOC, "_acceptance/config.yaml"), "utf8"),
);
const giaiRef = (cmd) => {
	if (!cmd.startsWith("config:")) return cmd;
	let o = cauHinh;
	for (const k of cmd.slice("config:".length).split(".")) o = o?.[k];
	const lenh = o == null ? "" : String(o);
	return lenh === "" || lenh.startsWith("[object") ? null : lenh;
};

const viec = new Map();
for (const slug of readdirSync(join(GOC, "_acceptance"))) {
	if (slug === HO_SO_NAY) continue;
	const hd = join(GOC, "_acceptance", slug, "contract.md");
	const ev = join(GOC, "_acceptance", slug, "evals.yaml");
	if (!existsSync(hd) || !existsSync(ev)) continue;
	const tt = /^status:\s*(\S+)/m.exec(readFileSync(hd, "utf8"))?.[1];
	if (tt !== "signed-off" && tt !== "machine-cleared") continue;
	const chuEv = readFileSync(ev, "utf8");
	const { byId: kyVong } = expectedExits(chuEv);
	for (const e of parseEvals(
		chuEv,
		["executor", "cmd", "status"],
		stripComment,
	)) {
		if (!["test", "script"].includes(e.executor) || e.status === "not-run")
			continue;
		const lenh = giaiRef(String(e.cmd ?? "").replace(/^["']|["']$/g, ""));
		if (!lenh) continue;
		const cham = [...tap].filter((t) => lenh.includes(t));
		if (cham.length === 0) continue;
		const mong = kyVong.get(e.id) ?? 0;
		const v = viec.get(lenh) ?? { lenh, cham, ai: [] };
		v.ai.push({ slug, id: e.id, mong });
		viec.set(lenh, v);
	}
}
if (viec.size === 0)
	khongDo(`bo chon rong — khong eval da ky nao chay ${[...tap].join(", ")}`);
console.log(`tep kiem bi cham: ${[...tap].join(", ")}`);
console.log(
	`lenh: ${viec.size} · eval: ${[...viec.values()].reduce((t, v) => t + v.ai.length, 0)}`,
);

function chay(lenh, cwd) {
	const r = spawnSync("bash", ["-c", lenh], {
		cwd,
		encoding: "utf8",
		env: { ...process.env, TZ: "Asia/Ho_Chi_Minh" },
		maxBuffer: 256 * 1024 * 1024,
		timeout: 15 * 60 * 1000,
	});
	return r.status ?? 2;
}

let sai = 0;
let so = 0;
for (const v of viec.values()) {
	const ma = chay(v.lenh, GOC);
	for (const a of v.ai) {
		so += 1;
		const dung = ma === a.mong;
		if (!dung) sai += 1;
		console.log(
			`${dung ? "HO-SO" : "SAI AC-11:"} ${a.slug}#${a.id}: ${ma} (mong ${a.mong})`,
		);
	}
}
console.log(
	sai === 0
		? `DUNG AC-11: ${so}/${so} eval ho so da ky`
		: `SAI AC-11: ${sai}/${so} eval lech ma ky vong`,
);

const ungVien = [...viec.values()].find((v) =>
	v.cham.some((t) => t.endsWith(".dom.tsx")),
);
if (!ungVien) khongDo("chieu do: khong lenh nao cham mot tep .dom.tsx de tiem");
const tepTiem = ungVien.cham.find((t) => t.endsWith(".dom.tsx"));
const tam = mkdtempSync(join(tmpdir(), "ctbp-ho-so-"));
const sao = join(tam, "crm");
let doDung = false;
try {
	// Lượt chấm chạy nhiều bộ đo song song trên cùng kho — `git worktree add` có thể
	// giành khoá của nhau; thử lại có giãn cách thay vì báo «không đo được».
	for (let lan = 1; ; lan += 1) {
		try {
			git(GOC, "worktree", "add", "--detach", "--quiet", sao, "HEAD");
			break;
		} catch (e) {
			if (lan >= 6) throw e;
			Atomics.wait(
				new Int32Array(new SharedArrayBuffer(4)),
				0,
				0,
				500 * lan + Math.floor(Math.random() * 500),
			);
		}
	}
	const va = git(GOC, "diff", "HEAD", "--binary");
	if (va) {
		writeFileSync(join(tam, "va.patch"), `${va}\n`);
		git(sao, "apply", "--whitespace=nowarn", join(tam, "va.patch"));
	}
	for (const nm of git(
		GOC,
		"ls-files",
		"-o",
		"--directory",
		"--exclude-standard",
		"-i",
	)
		.split("\n")
		.filter(
			(d) =>
				/(^|\/)node_modules\/$/.test(d) &&
				!d.slice(0, -1).includes("node_modules/"),
		)) {
		const dich = join(sao, nm.slice(0, -1));
		if (!existsSync(dich)) symlinkSync(join(GOC, nm.slice(0, -1)), dich);
	}
	if (existsSync(join(GOC, ".env")))
		symlinkSync(join(GOC, ".env"), join(sao, ".env"));
	const tep = join(sao, "apps/app/test", tepTiem);
	writeFileSync(
		tep,
		`${readFileSync(tep, "utf8")}\nthrow new Error("ctbp-pha-ho-so");\n`,
	);
	const ma = chay(ungVien.lenh, sao);
	doDung = ungVien.ai.every((a) => ma !== a.mong);
	for (const a of ungVien.ai)
		console.log(
			`${ma !== a.mong ? "SAI AC-11 (pha thu, dung ky vong):" : "LOT pha thu:"} ${a.slug}#${a.id}: ${ma} (mong ${a.mong})`,
		);
} catch (e) {
	khongDo(`worktree tam: ${String(e).slice(0, 300)}`);
} finally {
	try {
		git(GOC, "worktree", "remove", "--force", sao);
	} catch {}
	rmSync(tam, { recursive: true, force: true });
	try {
		git(GOC, "worktree", "prune");
	} catch {}
}
console.log(
	doDung
		? `DUNG AC-11 chieu do: tiem loi vao ${tepTiem} (worktree tam) lam lenh lech ma`
		: "SAI AC-11 chieu do: tiem loi ma lenh van dat",
);
const ket = sai === 0 && doDung;
console.log(ket ? "KET LUAN: dat" : "KET LUAN: sai");
process.exit(ket ? 0 : 1);
