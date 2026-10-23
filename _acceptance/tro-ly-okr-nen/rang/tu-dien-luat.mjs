import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC =
	process.env.GOC_KHO ??
	join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const doc = (tuong, bien) => readFileSync(process.env[bien] ?? join(GOC, tuong), "utf8");

const CAU_ZDR = "nhà cung cấp model là bên nhận; nội dung OKR chỉ gửi đi khi có ZDR, kể cả eval";
const TEN = ["Trợ lý OKR", "Đề xuất", "Tóm tắt tuần", "Sổ chi phí AI"];
const TEN_DOI_SAU = ["Trợ lý OKR", "Tóm tắt tuần"];
const NEO_GOP = process.env.NEO_GOP ?? "1bb45ac78acc9f113cec4ccc5d2d95e4189e57a9";
const TEP_CHO_RE = [
	"lib/session-purpose.ts",
	"instructions/task.ts",
	"lib/dispatch.ts",
	"channels/crm.ts",
	"lib/tasks.ts",
	"lib/stale-tasks.ts",
	"lib/capabilities.ts",
	"packages/db/src/agent-tasks.ts",
	"subagents/agent_runner",
	"subagents/agent_builder",
];

const gon = (chu) => chu.replace(/\s+/g, " ").trim();

function muc(van, ten) {
	const dau = van.indexOf(`**${ten}**:`);
	if (dau < 0) return null;
	const sau = van.slice(dau + ten.length + 5);
	const het = sau.search(/\n\n|\n\*\*[^*\n]+\*\*:/);
	return gon(`**${ten}**:${het < 0 ? sau : sau.slice(0, het)}`);
}

function doan(van, tieuDe) {
	const dau = van.indexOf(tieuDe);
	if (dau < 0) return "";
	const sau = van.slice(dau + tieuDe.length);
	const het = sau.search(/\n## /);
	return het < 0 ? sau : sau.slice(0, het);
}

const loi = [];
const opp = doc("_acceptance/tro-ly-okr-nen/opportunity.md", "TEP_OPP");
const ctx = doc("CONTEXT.md", "TEP_CONTEXT");
const agent = doc("docs/agent.md", "TEP_AGENT");
const ranh = doc("apps/agent/agent/skills/data-boundaries.md", "TEP_RANH");
const api = doc("docs/api.md", "TEP_API");

let ctxGop = "";
try {
	ctxGop = execFileSync("git", ["-C", GOC, "show", `${NEO_GOP}:CONTEXT.md`], {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "ignore"],
	});
} catch {
	console.log(`KHONG DO DUOC: khong doc duoc CONTEXT.md o sha neo ${NEO_GOP}`);
	process.exit(2);
}

for (const ten of TEN) {
	const goc = muc(opp, ten);
	const ban = muc(TEN_DOI_SAU.includes(ten) ? ctxGop : ctx, ten);
	if (!goc) loi.push(`opportunity thieu muc: ${ten}`);
	else if (goc !== ban) loi.push(`tu dien lech: ${ten}`);
}
if (!gon(doan(agent, "## What may be read")).includes(CAU_ZDR)) {
	loi.push("thieu cau ZDR: docs/agent.md §What may be read");
}
if (!gon(ranh).includes(CAU_ZDR)) loi.push("thieu cau ZDR: data-boundaries.md");
const okr = gon(doan(api, "## OKR"));
if (!(okr.includes("OkrDeXuat") && okr.includes("OkrTomTat") && okr.includes("ngoài luật vết"))) {
	loi.push("docs/api.md §OKR thieu cau de xuat va tom tat ngoai luat vet");
}
const choRe = doan(agent, "## Chỗ rẽ: Trợ lý OKR");
if (!choRe) loi.push("docs/agent.md thieu muc cho re cua Tro ly OKR");
for (const tep of TEP_CHO_RE) {
	if (choRe && !choRe.includes(tep)) loi.push(`cho re thieu tep: ${tep}`);
}

console.log(loi.length === 0 ? "tu dien, luat du lieu va cho re khop" : loi.join("\n"));
process.exit(loi.length === 0 ? 0 : 1);
