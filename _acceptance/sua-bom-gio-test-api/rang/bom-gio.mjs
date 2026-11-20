#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import {
	mkdirSync,
	mkdtempSync,
	readdirSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..", "..");
const API = "apps/api";
const HANG_SOT = join(HERE, "hang-sot.ts");

const CA = [
	{
		ten: "cmst-goc",
		tep: "chu-may-sinh-ten-moi-goc.spec.ts",
		preload: [],
		dauDo: "don-vi-chua-bat",
	},
	{
		ten: "gop-y-dung-cho",
		tep: "gop-y-dung-cho.spec.ts",
		preload: [HANG_SOT],
		dauDo: "dem sai",
	},
];

function doiSo(argv) {
	const i = argv.indexOf("--doi-chung");
	if (i < 0) return { doiChung: null };
	const ref = argv[i + 1];
	if (!ref || ref.startsWith("--")) {
		console.error("bom-gio: --doi-chung can mot ref git");
		process.exit(2);
	}
	return { doiChung: ref };
}

function git(args) {
	const r = spawnSync("git", ["-C", ROOT, ...args], {
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
	});
	if (r.status !== 0) {
		console.error(`bom-gio: git ${args.join(" ")} hong: ${r.stderr.trim()}`);
		process.exit(2);
	}
	return r.stdout;
}

function dungLopPhu(ref) {
	const goc = mkdtempSync(join(tmpdir(), "bom-gio-"));
	const thay = new Map(
		CA.map((c) => [c.tep, git(["show", `${ref}:${API}/test/${c.tep}`])]),
	);
	const duong = [...API.split("/"), "test"];
	const dau = duong.slice(0, -1);
	const nguonCha = join(ROOT, ...dau);
	const dichCha = join(goc, ...dau);
	phuCha(ROOT, goc, dau);
	for (const muc of readdirSync(nguonCha)) {
		if (muc === "test") continue;
		symlinkSync(join(nguonCha, muc), join(dichCha, muc));
	}
	const dichTest = join(dichCha, "test");
	mkdirSync(dichTest);
	for (const [tep, noiDung] of thay) writeFileSync(join(dichTest, tep), noiDung);
	for (const m of readdirSync(join(nguonCha, "test")))
		if (!thay.has(m)) symlinkSync(join(nguonCha, "test", m), join(dichTest, m));
	return goc;
}

function phuCha(nguon, dich, duong) {
	mkdirSync(dich, { recursive: true });
	if (duong.length === 0) return;
	const [dau, ...con] = duong;
	for (const muc of readdirSync(nguon)) {
		if (muc === dau) continue;
		symlinkSync(join(nguon, muc), join(dich, muc));
	}
	phuCha(join(nguon, dau), join(dich, dau), con);
}

function chay(ca, gocApi) {
	const preload = ["./test/setup.ts", ...ca.preload]
		.map((p) => `--preload '${p}'`)
		.join(" ");
	const lenh = `cd '${gocApi}' && CRM_TELEMETRY_DISABLED=1 bun test ${preload} test/${ca.tep}`;
	const r = spawnSync(
		"bun",
		[join(ROOT, "packages/db/scripts/test-run.ts"), lenh],
		{ cwd: ROOT, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 },
	);
	const ra = `${r.stdout}\n${r.stderr}`.replace(/\x1b\[[0-9;]*m/g, "");
	const dem = (nhan) => {
		const m = ra.match(new RegExp(`^\\s*(\\d+) ${nhan}\\s*$`, "m"));
		return m ? Number(m[1]) : null;
	};
	const hong = [...ra.matchAll(/^\(fail\) (.+?)(?: \[[\d.]+ms\])?$/gm)].map(
		(m) => m[1],
	);
	return {
		ma: r.status,
		pass: dem("pass"),
		fail: dem("fail"),
		hong: [...new Set(hong)],
		coDauDo: ra.includes(ca.dauDo),
	};
}

function tomTat(ca, kq) {
	return `${ca.ten}: ma ${kq.ma} · ${kq.pass ?? "?"} pass · ${kq.fail ?? "?"} fail${kq.hong.length ? ` · ${kq.hong.join(" | ")}` : ""}`;
}

const { doiChung } = doiSo(process.argv.slice(2));

if (!doiChung) {
	const kq = CA.map((ca) => [ca, chay(ca, join(ROOT, API))]);
	for (const [ca, k] of kq) console.log(tomTat(ca, k));
	const xanh = kq.every(([, k]) => k.ma === 0 && k.fail === 0 && k.pass > 0);
	if (!xanh) {
		const do_ = kq.filter(([, k]) => !(k.ma === 0 && k.fail === 0 && k.pass > 0));
		console.log(
			`DO bom-gio: ${do_.map(([ca]) => ca.ten).join(", ")} con do khi doc cau hinh o dong ho ghim (hang cau hinh gio that da cay)`,
		);
		process.exit(1);
	}
	console.log(
		"XANH bom-gio: cmst-goc va gop-y-dung-cho deu xanh, ke ca khi co hang cau hinh gio that sot lai",
	);
	process.exit(0);
}

const goc = dungLopPhu(doiChung);
let ma = 1;
try {
	const kq = CA.map((ca) => [ca, chay(ca, join(goc, API))]);
	for (const [ca, k] of kq) console.log(`doi chung ${doiChung} · ${tomTat(ca, k)}`);
	const lot = kq.filter(([, k]) => !(k.ma !== 0 && k.fail > 0 && k.coDauDo));
	if (lot.length > 0) {
		console.log(
			`DOI CHUNG HONG: thuoc khong bat duoc bom gio o ${doiChung} (${lot.map(([ca]) => ca.ten).join(", ")} khong do dung dau)`,
		);
	} else {
		console.log(
			`DOI CHUNG DUONG: o ${doiChung} ca hai tep do dung dau (don-vi-chua-bat, dem sai) — thuoc bat duoc bom gio`,
		);
		ma = 0;
	}
} finally {
	rmSync(goc, { recursive: true, force: true });
}
process.exit(ma);
