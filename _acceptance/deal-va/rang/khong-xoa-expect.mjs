import { execFileSync } from "node:child_process";
import path from "node:path";

const GOC = path.resolve(import.meta.dirname, "..", "..", "..");
const TEP = [
	"apps/app/test/agent-results.spec.ts",
	"apps/agent/test/giai-doan-agent.integration.spec.ts",
	"apps/api/test/giai-doan-bao-cao.spec.ts",
	"packages/telemetry/test/allowlist.spec.ts",
];
const CHO_PHEP = ["deals_by_stage thieu", "payload mang nhan"];

function cauExpect(nguon) {
	const ra = [];
	let i = nguon.indexOf("expect(");
	while (i !== -1) {
		let sau = 0;
		let j = i;
		for (; j < nguon.length; j += 1) {
			const c = nguon[j];
			if (c === "(" || c === "[" || c === "{") sau += 1;
			else if (c === ")" || c === "]" || c === "}") sau -= 1;
			else if (c === ";" && sau === 0) break;
		}
		ra.push(nguon.slice(i, j).replace(/\s+/g, " ").trim());
		i = nguon.indexOf("expect(", j);
	}
	return ra;
}

function mat(truoc, sau) {
	const con = new Map();
	for (const c of cauExpect(sau)) con.set(c, (con.get(c) ?? 0) + 1);
	const thieu = [];
	for (const c of cauExpect(truoc)) {
		const n = con.get(c) ?? 0;
		if (n > 0) con.set(c, n - 1);
		else thieu.push(c);
	}
	const sai = thieu.filter((c) => !CHO_PHEP.some((m) => c.includes(m)));
	return { sai, choPhep: thieu.length - sai.length };
}

function git(...args) {
	return execFileSync("git", ["-C", GOC, ...args], { encoding: "utf8" });
}

if (process.argv.includes("--tu-thu")) {
	const truoc = [
		"expect(\n\tra.name,\n\t\"ten\",\n).toBe(\"TypeError\");",
		"expect(theoStage[id], `deals_by_stage thieu ${id}`).toBeGreaterThan(0);",
		"expect(a).toBe(1);",
	].join("\n");
	const sau = [
		"expect(\n\tra.name,\n\t\"ten\",\n).toBe(\"Error\");",
		"expect( a ).toBe( 1 );",
	].join("\n");
	const { sai, choPhep } = mat(truoc, sau);
	if (sai.length !== 1 || choPhep !== 1) {
		console.error(`tu-thu: mong 1 sai + 1 cho phep, duoc ${sai.length} + ${choPhep}`);
		process.exit(2);
	}
	console.log("tu-thu: sua gia tri o expect nhieu dong -> bat duoc; doi khoang trang -> khong bat");
	process.exit(0);
}

const moc = git("merge-base", "HEAD", "origin/onehub").trim();
let tongSai = 0;
let tongChoPhep = 0;
let tongTruoc = 0;
for (const tep of TEP) {
	const truoc = git("show", `${moc}:${tep}`);
	const sau = git("show", `HEAD:${tep}`);
	tongTruoc += cauExpect(truoc).length;
	const { sai, choPhep } = mat(truoc, sau);
	tongChoPhep += choPhep;
	tongSai += sai.length;
	for (const c of sai) console.error(`${tep}: expect bi xoa hay sua: ${c}`);
}
console.log(
	`moc ${moc.slice(0, 9)} · ${TEP.length} tep · ${tongTruoc} cau expect san co · ${tongChoPhep} cau cho phep mat`,
);
if (tongSai > 0) process.exit(1);
console.log("khong expect san co nao bi xoa hay sua");
