#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import {
	copyFileSync,
	lstatSync,
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
const DEM_CVV = join(HERE, "dem-cvv.ts");
const DEM_HANG_SOT = join(HERE, "dem-hang-sot.ts");
const MAU_ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g");

const CA = [
	{
		ten: "cmst-goc",
		nhom: "AC-2",
		tep: ["chu-may-sinh-ten-moi-goc.spec.ts"],
		preload: [],
		dauDo: "don-vi-chua-bat",
	},
	{
		ten: "gop-y-dung-cho",
		nhom: "AC-2",
		tep: ["gop-y-dung-cho.spec.ts"],
		preload: [HANG_SOT],
		dauDo: "dem sai",
	},
	{
		ten: "soan-okr-so-do",
		nhom: "AC-6",
		tep: ["soan-okr-so-do.spec.ts"],
		preload: [HANG_SOT],
		dauDo: "don-vi-chua-bat",
	},
	{
		ten: "tra-lai-hang-sot",
		nhom: "AC-6",
		tep: ["gop-y-dung-cho.spec.ts", "soan-okr-so-do.spec.ts"],
		preload: [HANG_SOT],
		sau: DEM_HANG_SOT,
		chiThuan: true,
		dauDo: "dem-hang-sot: bom-gio-hang-sot=0",
	},
	{
		ten: "htmb-toan-canh",
		nhom: "AC-7",
		tep: ["bao-loi-sau-cau-hoi.spec.ts", "hop-tuan-mo-dung-bo.spec.ts"],
		preload: [],
		dauDo: "htmb-toan-canh: fixture lech dau ra that",
	},
	{
		ten: "bkr-cay-api",
		nhom: "AC-7",
		tep: ["bao-loi-sau-cau-hoi.spec.ts", "bam-kr-mo-chi-tiet-kr.spec.ts"],
		preload: [],
		dauDo: "bkr-cay-api: fixture lech dau ra that",
	},
	{
		ten: "cua-vao-va",
		nhom: "AC-8",
		tep: ["cua-vao-va.spec.ts"],
		preload: [],
		sau: DEM_CVV,
		dauDo: "dem-cvv: nguoi=1",
	},
];

function mot(argv, co) {
	const i = argv.indexOf(co);
	if (i < 0) return null;
	const v = argv[i + 1];
	if (!v || v.startsWith("--")) {
		console.error(`bom-gio: ${co} can mot gia tri`);
		process.exit(2);
	}
	return v;
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

function phu(nguon, dich, thay, tienTo) {
	mkdirSync(dich, { recursive: true });
	const chepTep = [...thay.keys()].some((t) => dirname(t) === (tienTo || "."));
	for (const muc of readdirSync(nguon)) {
		const duong = tienTo ? `${tienTo}/${muc}` : muc;
		const tu = join(nguon, muc);
		if (thay.has(duong)) {
			writeFileSync(join(dich, muc), thay.get(duong));
		} else if ([...thay.keys()].some((t) => t.startsWith(`${duong}/`))) {
			phu(tu, join(dich, muc), thay, duong);
		} else if (chepTep && lstatSync(tu).isFile()) {
			copyFileSync(tu, join(dich, muc));
		} else {
			symlinkSync(tu, join(dich, muc));
		}
	}
}

function dungLopPhu(ref) {
	const doi = git(["diff", "--name-only", ref, "HEAD", "--", "apps"])
		.split("\n")
		.filter(Boolean);
	const coTrongRef = new Set(
		git(["ls-tree", "-r", "--name-only", ref, "--", ...doi])
			.split("\n")
			.filter(Boolean),
	);
	const thay = new Map(
		doi
			.filter((t) => coTrongRef.has(t))
			.map((t) => [t, git(["show", `${ref}:${t}`])]),
	);
	const goc = mkdtempSync(join(tmpdir(), "bom-gio-"));
	phu(ROOT, goc, thay, "");
	console.log(
		`lop phu ${ref}: ${thay.size} tep lay ban cu (${[...thay.keys()].join(", ")})`,
	);
	return goc;
}

function chay(ca, gocApi) {
	const preload = ["./test/setup.ts", ...ca.preload]
		.map((p) => `--preload '${p}'`)
		.join(" ");
	const tep = ca.tep.map((t) => `test/${t}`).join(" ");
	const sau = ca.sau ? ` && NODE_ENV=test bun '${ca.sau}'` : "";
	const lenh = `cd '${gocApi}' && CRM_TELEMETRY_DISABLED=1 bun test ${preload} ${tep}${sau}`;
	const r = spawnSync(
		"bun",
		[join(ROOT, "packages/db/scripts/test-run.ts"), lenh],
		{ cwd: ROOT, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 },
	);
	const ra = `${r.stdout}\n${r.stderr}`.replaceAll(MAU_ANSI, "");
	const dem = (nhan) => {
		const m = ra.match(new RegExp(`^\\s*(\\d+) ${nhan}\\s*$`, "m"));
		return m ? Number(m[1]) : null;
	};
	const hong = [...ra.matchAll(/^\(fail\) (.+?)(?: \[[\d.]+ms\])?$/gm)].map(
		(m) => m[1],
	);
	const dongSau = ra.match(/^dem-(cvv|hang-sot): .*$/m);
	return {
		ma: r.status,
		pass: dem("pass"),
		fail: dem("fail"),
		hong: [...new Set(hong)],
		sau: dongSau ? dongSau[0] : null,
		coDauDo: ra.includes(ca.dauDo),
	};
}

function tomTat(ca, kq) {
	const hong = kq.hong.length ? ` · ${kq.hong.join(" | ")}` : "";
	const sau = kq.sau ? ` · ${kq.sau}` : "";
	return `${ca.ten}: ma ${kq.ma} · ${kq.pass ?? "?"} pass · ${kq.fail ?? "?"} fail${hong}${sau}`;
}

const argv = process.argv.slice(2);
const doiChung = mot(argv, "--doi-chung");
const nhom = mot(argv, "--nhom");
const chon = nhom ? CA.filter((c) => nhom.split(",").includes(c.nhom)) : CA;
if (chon.length === 0) {
	console.error(`bom-gio: khong co ca nao thuoc nhom ${nhom}`);
	process.exit(2);
}

if (!doiChung) {
	const kq = chon.map((ca) => [ca, chay(ca, join(ROOT, API))]);
	for (const [ca, k] of kq) console.log(tomTat(ca, k));
	const xanh = (k) => k.ma === 0 && k.fail === 0 && k.pass > 0;
	const do_ = kq.filter(([, k]) => !xanh(k));
	if (do_.length > 0) {
		console.log(
			`DO bom-gio: ${do_.map(([ca]) => ca.ten).join(", ")} con do khi chay sau du lieu sot cua tep khac`,
		);
		process.exit(1);
	}
	console.log(
		`XANH bom-gio: ${chon.map((c) => c.ten).join(", ")} deu xanh khi chay sau du lieu sot cua tep khac`,
	);
	process.exit(0);
}

const chonDc = chon.filter((c) => !c.chiThuan);
const goc = dungLopPhu(doiChung);
let ma = 1;
try {
	const kq = chonDc.map((ca) => [ca, chay(ca, join(goc, API))]);
	for (const [ca, k] of kq)
		console.log(`doi chung ${doiChung} · ${tomTat(ca, k)}`);
	const lot = kq.filter(([, k]) => !(k.ma !== 0 && k.coDauDo));
	if (lot.length > 0) {
		console.log(
			`DOI CHUNG HONG: thuoc khong bat duoc loi o ${doiChung} (${lot.map(([ca]) => ca.ten).join(", ")} khong do dung dau)`,
		);
	} else {
		console.log(
			`DOI CHUNG DUONG: o ${doiChung} moi ca do dung dau (${chonDc.map((c) => c.ten).join(", ")}) — thuoc bat duoc loi`,
		);
		ma = 0;
	}
} finally {
	rmSync(goc, { recursive: true, force: true });
}
process.exit(ma);
