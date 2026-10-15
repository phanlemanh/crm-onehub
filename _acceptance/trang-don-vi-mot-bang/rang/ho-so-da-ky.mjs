#!/usr/bin/env bun
/**
 * E12 (AC-10): các eval máy của hồ sơ đã ký chạy những tệp kiểm lượt này sửa vẫn
 * thoát đúng mã kỳ vọng như lúc ký; mỗi chỗ sửa trong bài kiểm chỉ đổi điều khẳng
 * định — không xoá ca hay dòng `expect` nào ngoài dòng mang dấu cũ, không thêm
 * `.skip`/`.todo`/`.only`.
 *
 * Khuôn: _acceptance/dieu-huong-khu-muc-tieu/rang/ho-so-da-ky.mjs, BỎ phần tiêm
 * tại chỗ — chiều đỏ do rang/hai-chieu.mjs dựng trong worktree tạm (Task 9).
 *
 * Gốc so (rút LÚC CHẠY): `DVB_BASE` nếu có; không thì merge-base với nhánh DH1
 * (`feat/dieu-huong-khu-muc-tieu`) khi nhánh đó chưa vào origin/onehub; không thì
 * merge-base với origin/onehub. Tập tệp = `git diff --name-only <gốc> -- apps/app/test`
 * trừ tệp mới của lượt, cộng mọi tệp kiểm nhập một tệp trợ giúp bị sửa. Tập eval:
 * hồ sơ `signed-off`/`machine-cleared`, executor test/script, không `status:
 * not-run`, lệnh `config:` giải ra chuỗi nhắc một tệp trong tập. Lệnh trùng chạy
 * một lần, tuần tự.
 *
 * `--liet-ke`: chỉ in tập tệp, lệnh và hai dòng đếm, không chạy lệnh nào.
 * Mã thoát: 0 đúng · 1 sai · 2 không đo được (tập rỗng, git hỏng).
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SLUG = basename(join(dirname(fileURLToPath(import.meta.url)), ".."));
const { parseEvals, stripComment, expectedExits } = await import(
	join(GOC, "lib/eval-yaml.cjs")
);
const LIET_KE = process.argv.includes("--liet-ke");

/** Dấu của trang cũ: dòng kiểm mang một trong các dấu này được phép đổi/xoá. */
const DAU_CU = [
	"data-nut-cay",
	"data-hang-nut",
	"data-don-vi",
	"thuMucTieu",
	"CayDonVi",
	"BangMucTieu",
];
const DONG_KIEM = /(^|[^\w.])(it|test)(\.\w+)?\s*\(|(^|[^\w.])expect(\.\w+)?\s*\(/;
const BO_QUA = /\.(skip|todo|only)\s*\(/;

function khongDo(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

const git = (...a) => {
	try {
		return execFileSync("git", a, { cwd: GOC, encoding: "utf8" }).trim();
	} catch (e) {
		khongDo(`git ${a.join(" ")}: ${e.message.split("\n")[0]}`);
	}
};
const coRef = (r) =>
	spawnSync("git", ["rev-parse", "--verify", "-q", r], { cwd: GOC }).status ===
	0;
const laToTien = (a, b) =>
	spawnSync("git", ["merge-base", "--is-ancestor", a, b], { cwd: GOC })
		.status === 0;

const NHANH_DH1 = "feat/dieu-huong-khu-muc-tieu";
const base =
	process.env.DVB_BASE ??
	(coRef(NHANH_DH1) && !laToTien(NHANH_DH1, "origin/onehub")
		? git("merge-base", "HEAD", NHANH_DH1)
		: git("merge-base", "HEAD", "origin/onehub"));
console.log(`goc so: ${base}`);

const coOGoc = (f) =>
	spawnSync("git", ["cat-file", "-e", `${base}:${f}`], { cwd: GOC }).status ===
	0;
const sua = git("diff", "--name-only", base, "--", "apps/app/test")
	.split("\n")
	.filter((f) => f && existsSync(join(GOC, f)) && coOGoc(f));
const moi = git("diff", "--name-only", base, "--", "apps/app/test")
	.split("\n")
	.filter((f) => f && !coOGoc(f));
if (moi.length > 0) console.log(`tep moi cua luot (bo): ${moi.join(", ")}`);

// Hai vế quan hệ: dòng kiểm bị xoá ngoài dấu cũ, `.skip/.todo/.only` thêm mới.
let tongXoa = 0;
let tongSkip = 0;
for (const f of sua) {
	const dong = git("diff", "-U0", base, "--", f).split("\n");
	const xoa = dong.filter(
		(d) =>
			d.startsWith("-") &&
			!d.startsWith("---") &&
			DONG_KIEM.test(d.slice(1)) &&
			!DAU_CU.some((dau) => d.includes(dau)),
	);
	const skip = dong.filter(
		(d) => d.startsWith("+") && !d.startsWith("+++") && BO_QUA.test(d.slice(1)),
	);
	tongXoa += xoa.length;
	tongSkip += skip.length;
	console.log(
		`XOA ${f}: ${xoa.length} dong it/test/expect bi xoa khong chua dau cu`,
	);
	if (xoa.length > 0)
		console.log(`SAI AC-10: ${f} xoa ${xoa.length} dong kiem ngoai dau cu`);
	for (const d of xoa) console.log(`  - ${d.slice(1).trim().slice(0, 160)}`);
	console.log(`SKIP ${f}: ${skip.length} .skip/.todo/.only them moi`);
}

const laKiem = (f) => /\.(dom\.tsx|spec\.ts|spec\.tsx)$/.test(f);
const tap = new Set(sua.filter(laKiem).map((f) => basename(f)));
const troGiup = sua
	.filter((f) => !laKiem(f) && /\.tsx?$/.test(f))
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
	if (slug === SLUG) continue;
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
		const lenh = giaiRef(e.cmd.replace(/^["']|["']$/g, ""));
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

if (LIET_KE) {
	for (const v of viec.values())
		console.log(
			`LENH ${v.ai.map((a) => `${a.slug}/${a.id}`).join(" ")}: ${v.lenh}`,
		);
	process.exit(0);
}

function chay(lenh) {
	const r = spawnSync("bash", ["-c", lenh], {
		cwd: GOC,
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
	const ma = chay(v.lenh);
	for (const a of v.ai) {
		so += 1;
		const dung = ma === a.mong;
		if (!dung) sai += 1;
		console.log(
			`${dung ? "HO-SO" : "SAI AC-10:"} ${a.slug} ${a.id}: ma ${ma} (ky vong ${a.mong})`,
		);
	}
}

const dat = sai === 0 && tongXoa === 0 && tongSkip === 0;
if (dat)
	console.log(
		`DUNG AC-10: ${so}/${so} lenh dat ma ky vong · 0 dong kiem bi xoa ngoai dau cu · 0 skip`,
	);
else
	console.log(
		`SAI AC-10: ${sai}/${so} lenh lech ma ky vong · ${tongXoa} dong kiem bi xoa ngoai dau cu · ${tongSkip} skip`,
	);
process.exit(dat ? 0 : 1);
