import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const APP = join(GOC, "apps/agent-okr");
const CHO = join(GOC, ".acceptance-runs/tat-preview-agent-okr");
const MAIN_LECH = /"nhanh": "main",\s*\n\s*[-+]\s*"trienKhai"/;

const CA = [
	{ ten: "lanh", sua: (s) => s, doi: { ma: 0, pass: 4 } },
	{
		ten: "sao",
		sua: (s) => s.replace('"**"', '"*"'),
		doi: { ca: "nhanh-khac-khong-trien-khai", chua: ["fix/a", "claude/a"], cam: MAIN_LECH },
	},
	{ ten: "onehub", sua: (s) => s.replace(/,\s*"onehub": true/, ""), doi: { ca: "onehub-trien-khai" } },
	{ ten: "json", sua: (s) => s.trimEnd().replace(/}$/, ""), doi: { ca: "hop-le", chua: ["JSON"] } },
	{ ten: "khoa", sua: (s) => s.replace("{", '{\n\t"buildCommand": "x",'), doi: { ca: "hop-le" } },
];

function dungBanSao(ca) {
	const sao = join(CHO, `sao-${ca.ten}-${process.pid}`);
	rmSync(sao, { recursive: true, force: true });
	mkdirSync(join(sao, "test"), { recursive: true });
	const goc = readFileSync(join(APP, "vercel.json"), "utf8");
	const doi = ca.sua(goc);
	if (ca.ten !== "lanh" && doi === goc) return null;
	writeFileSync(join(sao, "vercel.json"), doi);
	cpSync(join(APP, "test/vercel-trien-khai.spec.ts"), join(sao, "test/vercel-trien-khai.spec.ts"));
	symlinkSync(join(APP, "node_modules"), join(sao, "node_modules"));
	return sao;
}

function chayCa(ca) {
	const sao = dungBanSao(ca);
	if (!sao) return { ma: 2, dong: `${ca.ten}: DOT-BIEN-KHONG-AN` };
	const kq = spawnSync("bun", ["test", "test/vercel-trien-khai.spec.ts"], {
		cwd: sao,
		encoding: "utf8",
		env: { ...process.env, CRM_TELEMETRY_DISABLED: "1" },
	});
	rmSync(sao, { recursive: true, force: true });
	const ra = `${kq.stdout}\n${kq.stderr}`;
	const tongPass = ra.match(/^\s*(\d+) pass$/m);
	const tongFail = ra.match(/^\s*(\d+) fail$/m);
	if (!tongPass || !tongFail) return { ma: 2, dong: `${ca.ten}: BUN-KHONG-CHAY-TOI-TEST (ma ${kq.status})` };
	const fail = [...ra.matchAll(/\(fail\) vercel-trien-khai > (\S+)/g)].map((m) => m[1]);
	const pass = Number(tongPass[1]);
	if (Number(tongFail[1]) !== fail.length) return { ma: 2, dong: `${ca.ten}: DEM-FAIL-LECH ${tongFail[1]} vs ${fail.length}` };
	const tom = `${ca.ten}: ma ${kq.status}, ${pass} pass, fail [${fail.join(", ")}]`;
	if (ca.doi.ma === 0) {
		const dung = kq.status === 0 && fail.length === 0 && pass === ca.doi.pass;
		return { ma: dung ? 0 : 1, dong: tom };
	}
	const thieu = (ca.doi.chua ?? []).filter((chu) => !ra.includes(chu));
	const camThay = ca.doi.cam ? ca.doi.cam.test(ra) : false;
	const dung = kq.status !== 0 && fail.includes(ca.doi.ca) && thieu.length === 0 && !camThay;
	const them = [thieu.length ? `thieu ${thieu.join(", ")}` : "", camThay ? "main lech" : ""].filter(Boolean).join(", ");
	return { ma: dung ? 0 : 1, dong: them ? `${tom}, ${them}` : tom };
}

mkdirSync(CHO, { recursive: true });
let ma = 0;
for (const ca of CA) {
	const kq = chayCa(ca);
	console.log(kq.dong);
	ma = Math.max(ma, kq.ma);
}
process.exit(ma);
