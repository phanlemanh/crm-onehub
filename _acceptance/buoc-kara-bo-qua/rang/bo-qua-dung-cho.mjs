import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const VO_HAI = ["They already have a photo.", "Unchanged."];

export function kiem(nguon) {
	const khoi = [];
	const re = /return\s*\{([^{}]*?stored:\s*false[^{}]*?)\}/gs;
	for (const m of nguon.matchAll(re)) khoi.push(m[1]);
	const sai = [];
	for (const k of khoi) {
		const lyDo = /reason:\s*(?:\n\s*)?"([^"]+)"/.exec(k)?.[1] ?? "(ly do ghep chuoi)";
		const coBoQua = /skipped:\s*true/.test(k);
		const voHai = VO_HAI.includes(lyDo);
		if (voHai && !coBoQua) sai.push(`thieu skipped: ${lyDo}`);
		if (!voHai && coBoQua) sai.push(`bo-qua-dung-cho: ${lyDo}`);
	}
	return { soKhoi: khoi.length, sai };
}

const tuThu = process.argv.includes("--tu-thu");
let nguon = readFileSync(join(GOC, "apps/agent/agent/lib/portrait.ts"), "utf8");
if (tuThu) {
	nguon = nguon.replace(
		'reason: "No photo on the profile.",',
		'reason: "No photo on the profile.",\n\t\t\tskipped: true,',
	);
}
const { soKhoi, sai } = kiem(nguon);
console.log(`bo-qua-dung-cho: ${soKhoi} khoi stored:false trong portrait.ts`);
for (const s of sai) console.log(s);
if (soKhoi === 0) {
	console.log("bo-qua-dung-cho: khong dem duoc khoi nao");
	process.exit(2);
}
process.exit(sai.length > 0 ? 1 : 0);
