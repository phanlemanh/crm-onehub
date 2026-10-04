import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const TIEU_DE = "## Deploying `apps/agent-okr` to Vercel";
const BANG_AGENT = "### agent-okr project";
const BANG_APP = "### app project";
const CAN_CO = [
	"Root Directory",
	"apps/agent-okr",
	"Framework",
	"Build Command",
	"Node",
	"/health",
];
const BIEN_APP = ["OKR_AGENT_URL", "OKR_AGENT_BRIDGE_SECRET"];
const CUNG_GIA_TRI = "same value";

const dong = [];
let sai = 0;
function kiem(nhan, dat) {
	dong.push(`${dat ? "DUNG" : "SAI"} ${nhan}`);
	if (!dat) sai += 1;
}

function catMuc(van, dau) {
	const bat = van.indexOf(dau);
	if (bat < 0) return null;
	const sau = van.indexOf("\n## ", bat + dau.length);
	return van.slice(bat, sau < 0 ? van.length : sau);
}

function bienTrongBang(muc, dau) {
	const bang = catMuc(muc.replaceAll("\n### ", "\n## "), dau.replace("### ", "## "));
	if (bang === null) return null;
	const ra = new Set();
	for (const m of bang.matchAll(/^\|\s*`([A-Z][A-Z0-9_]+)`\s*\|/gm)) ra.add(m[1]);
	return ra;
}

function doMuc(muc, canBien) {
	const ket = [];
	if (muc === null) return ["thieu muc huong dan"];
	for (const chu of CAN_CO) if (!muc.includes(chu)) ket.push(`thieu chu: ${chu}`);
	const agent = bienTrongBang(muc, BANG_AGENT);
	if (agent === null) ket.push(`thieu bang: ${BANG_AGENT}`);
	else {
		for (const b of canBien) if (!agent.has(b)) ket.push(`thieu bien: ${b}`);
		for (const b of agent) if (!canBien.includes(b)) ket.push(`thua bien: ${b}`);
	}
	const app = bienTrongBang(muc, BANG_APP);
	if (app === null) ket.push(`thieu bang: ${BANG_APP}`);
	else for (const b of BIEN_APP) if (!app.has(b)) ket.push(`thieu bien app: ${b}`);
	if (!muc.includes(CUNG_GIA_TRI)) ket.push(`thieu chu: ${CUNG_GIA_TRI}`);
	return ket;
}

const turbo = JSON.parse(
	readFileSync(join(GOC, "apps/agent-okr/turbo.json"), "utf8"),
);
const canBien = turbo.tasks.dev.passThroughEnv;
kiem(`turbo.json dev truyen ${canBien.length} bien: ${canBien.join(", ")}`, canBien.length > 0);

const muc = catMuc(readFileSync(join(GOC, "docs/setup.md"), "utf8"), TIEU_DE);

if (process.argv.includes("--kiem-do-do")) {
	const pha = muc === null ? null : muc.replace(/^\|\s*`DATABASE_URL`.*\n/m, "");
	const ket = doMuc(pha, canBien);
	const dat = ket.includes("thieu bien: DATABASE_URL");
	for (const k of ket) console.log(`SAI ${k}`);
	if (!dat) {
		console.log("SAI chieu do khong do");
		process.exit(2);
	}
	console.log("chieu do: thieu bien: DATABASE_URL — dung nhu ky vong");
	process.exit(1);
}

for (const k of doMuc(muc, canBien)) kiem(k, false);
if (muc !== null) kiem(`muc «${TIEU_DE.slice(3)}» co du chu, bang bien khop turbo.json`, sai === 0);
for (const d of dong) console.log(d);
console.log(`${dong.filter((d) => d.startsWith("DUNG")).length} DUNG, ${sai} SAI`);
process.exit(sai === 0 ? 0 : 1);
