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
 * trừ tệp mới của lượt, cộng mọi tệp kiểm nhập một tệp trợ giúp bị sửa. Hai vế đếm
 * (dòng kiểm bị xoá, skip thêm) chỉ tính trên commit riêng của lượt — `git rev-list
 * --no-merges HEAD ^origin/onehub ^feat/dieu-huong-khu-muc-tieu` — cộng thay đổi chưa
 * commit; thiếu một trong hai ref → mã 2. Tập eval:
 * hồ sơ `signed-off`/`machine-cleared`, executor test/script, không `status:
 * not-run`, lệnh `config:` giải ra chuỗi nhắc một tệp trong tập. Lệnh trùng chạy
 * một lần, tuần tự.
 *
 * `--liet-ke`: chỉ in tập tệp, lệnh và hai dòng đếm, không chạy lệnh nào.
 * `DVB_LOC_TEP=<tệp>`: chỉ chạy các lệnh chạm tệp đó (lượt hai chiều).
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
const DONG_KIEM =
	/(^|[^\w.])(it|test)(\.\w+)?\s*\(|(^|[^\w.])expect(\.\w+)?\s*\(/;
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

// du-an-gantt goc-da-gop: DH2 đã vào onehub thì merge-base với onehub trùng đỉnh DH2 và
// tập lượt rỗng. Gốc so và commit riêng khi đó rút từ chính lần gộp chứa verified_commit
// của evidence-report.md hồ sơ này: gốc = merge-base(cha 1, cha 2), commit riêng =
// rev-list cha 2 ^cha 1 ^DH1. Chưa gộp (hoặc có DVB_BASE) → luật cũ nguyên vẹn.
function khungDaGop(nhanhGop) {
	const bc = readFileSync(
		join(GOC, "_acceptance/trang-don-vi-mot-bang/evidence-report.md"),
		"utf8",
	).match(/^verified_commit:\s*([0-9a-f]{40})\s*$/m)?.[1];
	if (!bc || !nhanhGop || !coRef(nhanhGop) || !laToTien(bc, nhanhGop))
		return null;
	const gop = git(
		"rev-list",
		"--first-parent",
		"--merges",
		"--reverse",
		nhanhGop,
		`^${bc}`,
	)
		.split("\n")
		.filter(Boolean)
		.find((m) => laToTien(bc, m) && !laToTien(bc, `${m}^1`));
	if (!gop)
		khongDo(`verified_commit ${bc} da vao ${nhanhGop} ma khong thay commit gop`);
	const truoc = git("rev-parse", `${gop}^1`);
	const dinh = git("rev-parse", `${gop}^2`);
	console.log(`DH2 da gop o ${gop.slice(0, 9)}: goc so va commit rieng rut tu lan gop`);
	return { goc: git("merge-base", truoc, dinh), truoc, dinh };
}

const NHANH_DH1 = "feat/dieu-huong-khu-muc-tieu";
const khung = process.env.DVB_BASE ? null : khungDaGop("origin/onehub");
const base =
	process.env.DVB_BASE ??
	khung?.goc ??
	(coRef(NHANH_DH1) && !laToTien(NHANH_DH1, "origin/onehub")
		? git("merge-base", "HEAD", NHANH_DH1)
		: git("merge-base", "HEAD", "origin/onehub"));
console.log(`goc so: ${base}`);
const dinhLuot = khung ? [khung.dinh] : [];

const coOGoc = (f) =>
	spawnSync("git", ["cat-file", "-e", `${base}:${f}`], { cwd: GOC }).status ===
	0;
const sua = git("diff", "--name-only", base, ...dinhLuot, "--", "apps/app/test")
	.split("\n")
	.filter((f) => f && existsSync(join(GOC, f)) && coOGoc(f));
const moi = git("diff", "--name-only", base, ...dinhLuot, "--", "apps/app/test")
	.split("\n")
	.filter((f) => f && !coOGoc(f));
if (moi.length > 0) console.log(`tep moi cua luot (bo): ${moi.join(", ")}`);

// Hai vế quan hệ: dòng kiểm bị xoá ngoài dấu cũ, `.skip/.todo/.only` thêm mới — chỉ
// tính trên commit RIÊNG của lượt (rev-list --no-merges HEAD ^onehub ^DH1) cộng thay đổi
// chưa commit (lượt hai chiều tiêm đột biến chưa commit trong worktree tạm). Gốc so ở
// trên ôm cả commit onehub và DH1 mà nhánh đã gộp — chúng không phải lượt này.
const NHANH_GOC = "origin/onehub";
for (const r of [NHANH_GOC, NHANH_DH1])
	if (!coRef(r)) khongDo(`thieu ref ${r} de rut commit rieng cua luot`);
const rieng = git(
	"rev-list",
	"--no-merges",
	khung?.dinh ?? "HEAD",
	`^${khung?.truoc ?? NHANH_GOC}`,
	`^${NHANH_DH1}`,
)
	.split("\n")
	.filter(Boolean);
console.log(`commit rieng cua luot: ${rieng.length}`);

function dongDoi(diff) {
	const ra = [];
	let tep = "";
	for (const d of diff.split("\n")) {
		if (d.startsWith("+++ ")) tep = d.slice(4).replace(/^b\//, "");
		else if (d.startsWith("--- ")) continue;
		else if (d.startsWith("-") || d.startsWith("+")) ra.push({ tep, d });
	}
	return ra;
}
const laXoaKiem = (d) =>
	d.startsWith("-") &&
	DONG_KIEM.test(d.slice(1)) &&
	!DAU_CU.some((dau) => d.includes(dau));
const laSkipMoi = (d) => d.startsWith("+") && BO_QUA.test(d.slice(1));

const xoaTheoTep = new Map();
const skipTheoTep = new Map();
const ghiVao = (bang, tep, muc) =>
	bang.set(tep, [...(bang.get(tep) ?? []), muc]);
for (const [nguon, diff] of [
	...rieng.map((c) => [
		c.slice(0, 9),
		git("diff", "-U0", `${c}^`, c, "--", "apps/app/test"),
	]),
	["chua-commit", git("diff", "-U0", "HEAD", "--", "apps/app/test")],
])
	for (const { tep, d } of dongDoi(diff)) {
		if (!coOGoc(tep)) continue;
		if (laXoaKiem(d)) ghiVao(xoaTheoTep, tep, { nguon, d });
		if (laSkipMoi(d)) ghiVao(skipTheoTep, tep, { nguon, d });
	}

let tongXoa = 0;
let tongSkip = 0;
for (const f of sua) {
	const xoa = xoaTheoTep.get(f) ?? [];
	const skip = skipTheoTep.get(f) ?? [];
	tongXoa += xoa.length;
	tongSkip += skip.length;
	console.log(
		`XOA ${f}: ${xoa.length} dong it/test/expect bi xoa khong chua dau cu`,
	);
	if (xoa.length > 0)
		console.log(`SAI AC-10: ${f} xoa ${xoa.length} dong kiem ngoai dau cu`);
	for (const x of xoa)
		console.log(`  - [${x.nguon}] ${x.d.slice(1).trim().slice(0, 160)}`);
	console.log(`SKIP ${f}: ${skip.length} .skip/.todo/.only them moi`);
}

// Đối chiếu: dòng kiểm bị xoá theo diff từ gốc so (cách đếm cũ) mà không thuộc commit
// riêng của lượt — in commit đã xoá chúng để thấy chúng đến từ nhánh đã gộp.
const cuaLuot = new Set(
	[...xoaTheoTep.values()].flat().map((x) => x.d.slice(1).trim()),
);
const xoaTaiCommit = new Map();
function commitXoa(tep, dong) {
	if (!xoaTaiCommit.has(tep)) {
		const bang = new Map();
		for (const c of git(
			"log",
			"--no-merges",
			"--format=%H",
			`${base}..HEAD`,
			"--",
			tep,
		)
			.split("\n")
			.filter(Boolean)) {
			const ten = git("log", "-1", "--format=%h %s", c);
			for (const x of dongDoi(git("diff", "-U0", `${c}^`, c, "--", tep)))
				if (x.d.startsWith("-") && !bang.has(x.d.slice(1).trim()))
					bang.set(x.d.slice(1).trim(), ten);
		}
		xoaTaiCommit.set(tep, bang);
	}
	return xoaTaiCommit.get(tep).get(dong) ?? "khong ro";
}
let ngoaiLuot = 0;
for (const { tep, d } of dongDoi(
	git("diff", "-U0", base, ...dinhLuot, "--", "apps/app/test"),
)) {
	if (!coOGoc(tep) || !laXoaKiem(d) || cuaLuot.has(d.slice(1).trim())) continue;
	ngoaiLuot += 1;
	const dong = d.slice(1).trim();
	console.log(
		`NGOAI-LUOT ${tep}: ${dong.slice(0, 100)} <- ${commitXoa(tep, dong).slice(0, 120)}`,
	);
}
console.log(
	`NGOAI-LUOT: ${ngoaiLuot} dong kiem bi xoa theo diff goc so khong thuoc commit rieng cua luot (khong tinh)`,
);

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
// Lượt hai chiều (rang/hai-chieu.mjs) chỉ chạy các lệnh chạm một tệp: hai vế
// XOA/SKIP vẫn đếm trên mọi tệp, chỉ bộ lệnh được thu hẹp.
const LOC_TEP = process.env.DVB_LOC_TEP;
if (LOC_TEP) {
	for (const [k, v] of viec) if (!v.cham.includes(LOC_TEP)) viec.delete(k);
	console.log(`loc theo DVB_LOC_TEP=${LOC_TEP}: con ${viec.size} lenh`);
	if (viec.size === 0) khongDo(`DVB_LOC_TEP=${LOC_TEP} khong cham lenh nao`);
}
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
