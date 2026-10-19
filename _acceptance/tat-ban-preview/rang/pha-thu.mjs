import { spawnSync } from "node:child_process";
import {
	cpSync,
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	symlinkSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { GOC } from "./vercel-doc.mjs";

const CHO = join(GOC, ".acceptance-runs/tat-ban-preview");
const SPEC = "test/vercel-preview-moi-du-an.spec.ts";
const TEP = [
	"vercel.json",
	"apps/app/vercel.json",
	"apps/agent/vercel.json",
	"apps/agent-okr/vercel.json",
	"apps/api/vercel.json",
	"apps/agent-okr/test/vercel-du-an.ts",
	`apps/agent-okr/${SPEC}`,
];

const moHet = (s) => s.replace('"**": false', '"**": true');
const nhan = (ten) => ({
	ten,
	cam: [
		"crm-onehub-app",
		"crm-onehub-api",
		"crm-onehub-agent",
		"agent-okr",
	].filter((t) => t !== ten),
});

const CA = [
	{ ten: "lanh", sua: {}, doi: { ma: 0, pass: 4 } },
	{
		ten: "mo-het-api",
		sua: { "vercel.json": moHet },
		doi: {
			ca: "nhanh-khac-khong-trien-khai",
			duAn: nhan("crm-onehub-api"),
			chua: ['"nhanh": "feat/a"'],
		},
	},
	{
		ten: "mo-het-app",
		sua: { "apps/app/vercel.json": moHet },
		doi: {
			ca: "nhanh-khac-khong-trien-khai",
			duAn: nhan("crm-onehub-app"),
			chua: ['"nhanh": "feat/a"'],
		},
	},
	{
		ten: "mo-het-agent",
		sua: { "apps/agent/vercel.json": moHet },
		doi: {
			ca: "nhanh-khac-khong-trien-khai",
			duAn: nhan("crm-onehub-agent"),
			chua: ['"nhanh": "feat/a"'],
		},
	},
	{
		ten: "sai-cho",
		sua: {
			"vercel.json": null,
			"apps/api/vercel.json": (s) =>
				s.replace(
					"{",
					'{\n\t"git": { "deploymentEnabled": { "**": false, "onehub": true } },',
				),
		},
		doi: { ca: "hop-le", chua: ['"duAn": "crm-onehub-api"'] },
	},
	{
		ten: "sao",
		sua: { "apps/app/vercel.json": (s) => s.replace('"**"', '"*"') },
		doi: {
			ca: "nhanh-khac-khong-trien-khai",
			chua: ['"nhanh": "fix/a"'],
			khongChua: ['"nhanh": "main"'],
		},
	},
	{
		ten: "onehub",
		sua: {
			"apps/agent/vercel.json": (s) => s.replace(/,\s*"onehub": true/, ""),
		},
		doi: { ca: "onehub-trien-khai", chua: ['"duAn": "crm-onehub-agent"'] },
	},
	{
		ten: "json",
		sua: { "vercel.json": (s) => s.trimEnd().replace(/}$/, "") },
		doi: { ca: "hop-le", chua: ['"duAn": "crm-onehub-api"'] },
	},
	{
		ten: "khoa",
		sua: { "vercel.json": (s) => s.replace("{", '{\n\t"crons": [],') },
		doi: { ca: "hop-le", chua: ['"duAn": "crm-onehub-api"'] },
	},
];

function dungBanSao(ca) {
	const sao = join(CHO, `sao-${ca.ten}-${process.pid}`);
	rmSync(sao, { recursive: true, force: true });
	for (const tep of TEP) {
		const den = join(sao, tep);
		mkdirSync(dirname(den), { recursive: true });
		cpSync(join(GOC, tep), den);
	}
	for (const [tep, sua] of Object.entries(ca.sua)) {
		const den = join(sao, tep);
		if (sua === null) {
			unlinkSync(den);
			continue;
		}
		const cu = readFileSync(den, "utf8");
		const moi = sua(cu);
		if (moi === cu) return { loi: `${ca.ten}: DOT-BIEN-KHONG-AN (${tep})` };
		writeFileSync(den, moi);
	}
	symlinkSync(
		join(GOC, "apps/agent-okr/node_modules"),
		join(sao, "apps/agent-okr/node_modules"),
	);
	return { sao };
}

function chayCa(ca) {
	if (!existsSync(join(GOC, "apps/agent-okr/node_modules")))
		return { ma: 2, dong: `${ca.ten}: THIEU node_modules cua apps/agent-okr` };
	const { sao, loi } = dungBanSao(ca);
	if (loi) return { ma: 2, dong: loi };
	const kq = spawnSync("bun", ["test", SPEC], {
		cwd: join(sao, "apps/agent-okr"),
		encoding: "utf8",
		env: { ...process.env, CRM_TELEMETRY_DISABLED: "1" },
	});
	rmSync(sao, { recursive: true, force: true });
	const ra = `${kq.stdout}\n${kq.stderr}`;
	const tongPass = ra.match(/^\s*(\d+) pass$/m);
	const tongFail = ra.match(/^\s*(\d+) fail$/m);
	if (!tongPass || !tongFail)
		return {
			ma: 2,
			dong: `${ca.ten}: BUN-KHONG-CHAY-TOI-TEST (ma ${kq.status})`,
		};
	const fail = [
		...ra.matchAll(/\(fail\) vercel-preview-moi-du-an > (\S+)/g),
	].map((m) => m[1]);
	const pass = Number(tongPass[1]);
	if (Number(tongFail[1]) !== fail.length)
		return {
			ma: 2,
			dong: `${ca.ten}: DEM-FAIL-LECH ${tongFail[1]} vs ${fail.length}`,
		};
	const tom = `${ca.ten}: ma ${kq.status}, ${pass} pass, fail [${fail.join(", ")}]`;
	if (ca.doi.ma === 0)
		return {
			ma: kq.status === 0 && fail.length === 0 && pass === ca.doi.pass ? 0 : 1,
			dong: tom,
		};
	const sai = [];
	if (kq.status === 0) sai.push("ma 0");
	if (!fail.includes(ca.doi.ca)) sai.push(`khong do ${ca.doi.ca}`);
	for (const chu of ca.doi.chua ?? [])
		if (!ra.includes(chu)) sai.push(`thieu ${chu}`);
	for (const chu of ca.doi.khongChua ?? [])
		if (ra.includes(chu)) sai.push(`co ${chu}`);
	if (ca.doi.duAn) {
		if (fail.length !== 1) sai.push(`do ${fail.length} ca, doi 1`);
		const dem = (t) => ra.split(`"duAn": "${t}"`).length - 1;
		if (dem(ca.doi.duAn.ten) !== 18)
			sai.push(`${ca.doi.duAn.ten} lech ${dem(ca.doi.duAn.ten)} nhanh, doi 18`);
		for (const t of ca.doi.duAn.cam)
			if (dem(t) !== 0) sai.push(`${t} lech ${dem(t)}`);
	}
	return {
		ma: sai.length ? 1 : 0,
		dong: sai.length ? `${tom}, ${sai.join(", ")}` : tom,
	};
}

mkdirSync(CHO, { recursive: true });
let ma = 0;
for (const ca of CA) {
	const kq = chayCa(ca);
	console.log(kq.dong);
	ma = Math.max(ma, kq.ma);
}
process.exit(ma);
