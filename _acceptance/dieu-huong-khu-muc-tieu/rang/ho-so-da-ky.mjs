#!/usr/bin/env bun
/**
 * E11 (AC-9): các eval máy của hồ sơ đã ký chạy những tệp kiểm lượt này sửa vẫn
 * thoát đúng mã kỳ vọng như lúc ký.
 *
 * Tập tệp kiểm rút LÚC CHẠY: `git diff --name-only <merge-base với origin/onehub>
 * -- apps/app/test`, cộng mọi tệp kiểm nhập một tệp trợ giúp bị sửa (vd harness
 * khung-soan-okr.tsx). Tập eval rút từ `_acceptance/* /evals.yaml` của hồ sơ
 * `signed-off`/`machine-cleared`: executor test/script, không khai `status: not-run`,
 * lệnh `config:` giải ra chuỗi có nhắc một tệp trong tập. Lệnh trùng chạy một lần.
 *
 * Hai chiều trong cùng lượt: (1) mọi lệnh đạt mã kỳ vọng; (2) tiêm `throw` vào
 * cuối MỘT tệp kiểm bị sửa (bản tại chỗ, hoàn nguyên trong finally), chạy lại các
 * lệnh nhắc tệp đó → mỗi lệnh phải lệch mã kỳ vọng («SAI AC-9 (pha thu): …»).
 * Mã thoát: 0 hai chiều đúng · 1 sai · 2 không đo được (tập rỗng, đọc hỏng).
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { parseEvals, stripComment, expectedExits } = await import(
	join(GOC, "lib/eval-yaml.cjs")
);
const KHONG_CHAY_HO_SO = new Set(["dieu-huong-khu-muc-tieu"]);

function khongDo(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

const git = (...a) =>
	execFileSync("git", a, { cwd: GOC, encoding: "utf8" }).trim();
const base = process.env.DHK_BASE ?? git("merge-base", "HEAD", "origin/onehub");
const sua = git("diff", "--name-only", base, "--", "apps/app/test")
	.split("\n")
	.filter((f) => f && existsSync(join(GOC, f)));
const laKiem = (f) => /\.(dom\.tsx|spec\.ts|spec\.tsx)$/.test(f);
const tap = new Set(sua.filter(laKiem).map((f) => basename(f)));
const troGiup = sua
	.filter((f) => !laKiem(f))
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
	if (typeof cmd !== "string" || !cmd.startsWith("config:")) return cmd;
	let o = cauHinh;
	for (const k of cmd.slice("config:".length).split(".")) o = o?.[k];
	return typeof o === "string" ? o : null;
};

const viec = new Map();
for (const slug of readdirSync(join(GOC, "_acceptance"))) {
	if (KHONG_CHAY_HO_SO.has(slug)) continue;
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
			`${dung ? "HO-SO" : "SAI AC-9:"} ${a.slug} ${a.id}: ma ${ma} (ky vong ${a.mong})`,
		);
	}
}
console.log(
	sai === 0
		? `DUNG AC-9: ${so}/${so} lenh dat ma ky vong`
		: `SAI AC-9: ${sai}/${so} lenh lech ma ky vong`,
);

const ungVien = [...viec.values()].find((v) =>
	v.cham.some((t) => t.endsWith(".dom.tsx")),
);
let doDung = false;
if (!ungVien) khongDo("chieu do: khong lenh nao cham mot tep .dom.tsx de tiem");
else {
	const tep = join(
		GOC,
		"apps/app/test",
		ungVien.cham.find((t) => t.endsWith(".dom.tsx")),
	);
	const goc = readFileSync(tep, "utf8");
	try {
		writeFileSync(tep, `${goc}\nthrow new Error("dhk-pha-ho-so");\n`);
		const ma = chay(ungVien.lenh);
		doDung = ungVien.ai.every((a) => ma !== a.mong);
		for (const a of ungVien.ai)
			console.log(
				`${ma !== a.mong ? "SAI AC-9 (pha thu, dung ky vong):" : "LOT pha thu:"} ${a.slug} ${a.id}: ma ${ma} (ky vong ${a.mong})`,
			);
	} finally {
		writeFileSync(tep, goc);
	}
	if (readFileSync(tep, "utf8") !== goc) khongDo(`hoan nguyen ${tep} that bai`);
}
console.log(
	doDung
		? "DUNG AC-9 chieu do: tiem loi vao tep kiem lam lenh lech ma"
		: "SAI AC-9 chieu do: tiem loi ma lenh van dat",
);
const ket = sai === 0 && doDung;
console.log(ket ? "KET LUAN: dat" : "KET LUAN: sai");
process.exit(ket ? 0 : 1);
