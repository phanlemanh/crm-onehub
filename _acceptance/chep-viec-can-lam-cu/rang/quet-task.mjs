import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const CUA_SO = 12;
const GHI = /\bactivity\.(create|createMany|upsert|update|updateMany)\s*\(/;
const THUOC_TINH_TASK = /\btype:\s*(ActivityType\.TASK|"TASK")/;
const MO_LOC = /(where|NOT|AND|OR)\s*:\s*$/;
const LOC_SAU = /^\s*(\)\s*)?satisfies\s+Prisma\.ActivityWhereInput/;

function khoiChua(nguon, viTri) {
	let sau = 0;
	for (let i = viTri; i >= 0; i -= 1) {
		const c = nguon[i];
		if (c === "}" || c === "]" || c === ")") sau += 1;
		else if (c === "{" || c === "[" || c === "(") {
			if (sau === 0) return i;
			sau -= 1;
		}
	}
	return -1;
}

function dongKhoi(nguon, mo) {
	let sau = 0;
	for (let i = mo; i < nguon.length; i += 1) {
		const c = nguon[i];
		if (c === "{" || c === "[" || c === "(") sau += 1;
		else if (c === "}" || c === "]" || c === ")") {
			sau -= 1;
			if (sau === 0) return i;
		}
	}
	return nguon.length - 1;
}

function laLoc(nguon, viTri) {
	const mo = khoiChua(nguon, viTri);
	if (mo < 0) return false;
	const truoc = nguon.slice(Math.max(0, mo - 40), mo).replace(/\s+$/, "");
	if (MO_LOC.test(truoc)) return true;
	const dong = dongKhoi(nguon, mo);
	return LOC_SAU.test(nguon.slice(dong + 1, dong + 80));
}

const MA_TRAN = new Map([
	["apps/api/src/activities/activities.contracts.ts", "khai"],
	["apps/api/src/activities/activities.service.ts", "doc"],
	["apps/api/src/dashboard/dashboard.service.ts", "doc"],
	["packages/db/src/viec-chep.ts", "doc"],
	["packages/db/src/viec-ghi.ts", "doc"],
	["apps/agent/agent/lib/ma-lech.ts", "doc"],
	["apps/agent/agent/lib/accounts.ts", "doc"],
	["apps/agent/agent/lib/run-runtime.ts", "so-quyen"],
	["apps/agent/agent/lib/builder-runtime.ts", "khai"],
	["apps/agent/agent/subagents/agent_builder/lib/draft-input.ts", "khai"],
	["packages/validation/src/agent-manifest.ts", "khai"],
	[
		"apps/agent/agent/subagents/agent_runner/tools/create_crm_activity.ts",
		"khai",
	],
]);
const TIEN_TO_NHAN = "apps/app/";

function vaiCua(tep) {
	if (MA_TRAN.has(tep)) return MA_TRAN.get(tep);
	if (tep.startsWith(TIEN_TO_NHAN)) return "nhan";
	return null;
}

const ra = execFileSync(
	"git",
	[
		"-C",
		GOC,
		"grep",
		"-n",
		"-E",
		'ActivityType\\.TASK|"TASK"',
		"--",
		"apps",
		"packages",
		":!**/test/**",
		":!**/*.spec.ts",
		":!**/*.dom.tsx",
		":!**/generated/**",
	],
	{ encoding: "utf8" },
);

const loi = [];
const theoTep = new Map();
for (const dong of ra.split("\n").filter(Boolean)) {
	const m = dong.match(/^([^:]+):(\d+):/);
	if (!m) continue;
	const [, tep, so] = m;
	const soDong = Number(so);
	theoTep.set(tep, (theoTep.get(tep) ?? 0) + 1);
	const van = readFileSync(join(GOC, tep), "utf8");
	const nguon = van.split("\n");
	const truoc = nguon.slice(Math.max(0, soDong - 1 - CUA_SO), soDong);
	const dongNay = nguon[soDong - 1] ?? "";
	const khop = dongNay.match(THUOC_TINH_TASK);
	const viTri =
		nguon.slice(0, soDong - 1).reduce((t, d) => t + d.length + 1, 0) +
		(khop?.index ?? 0);
	if (truoc.some((d) => GHI.test(d)) || (khop && !laLoc(van, viTri))) {
		loi.push(`cvc: con duong ghi TASK ${tep}:${soDong}`);
	}
	if (vaiCua(tep) === null) {
		loi.push(`cvc: cho nhac TASK ngoai ma tran ${tep}`);
	}
}
for (const tep of MA_TRAN.keys()) {
	if (!theoTep.has(tep)) loi.push(`cvc: ma tran cu ${tep}`);
}

const demVai = new Map();
for (const [tep, n] of theoTep) {
	const vai = vaiCua(tep) ?? "ngoai";
	demVai.set(vai, (demVai.get(vai) ?? 0) + n);
}
console.log(
	`quet-task: ${theoTep.size} tep · ${[...demVai].map(([v, n]) => `${v} ${n}`).join(" · ")}`,
);
for (const d of [...new Set(loi)]) console.log(`error: ${d}`);
process.exit(loi.length === 0 ? 0 : 1);
