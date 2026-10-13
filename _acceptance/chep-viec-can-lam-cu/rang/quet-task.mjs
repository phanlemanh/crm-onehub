import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const CUA_SO = 12;
const GHI = /\bactivity\.(create|createMany|upsert|update|updateMany)\s*\(/;

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
	const nguon = readFileSync(join(GOC, tep), "utf8").split("\n");
	const truoc = nguon.slice(Math.max(0, soDong - 1 - CUA_SO), soDong);
	if (truoc.some((d) => GHI.test(d))) {
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
