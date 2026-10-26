import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const thamSoGoc = process.argv.indexOf("--goc");
const GOC =
	thamSoGoc > 0
		? path.resolve(process.argv[thamSoGoc + 1])
		: path.resolve(import.meta.dirname, "..", "..", "..");

const BIEN_KHOA = "GITHUB_APP_PRIVATE_KEY";
const CHO_PHEP = [/^apps\/agent\//, /^\.env\.example$/];
const BO_QUA = [/(^|\/)node_modules\//, /(^|\/)\.eve\//, /^_acceptance\//, /^docs\//, /\.md$/];
const VUNG_LO_TRINH = [/^apps\/agent\/agent\/lib\/lo-trinh-/, /^scripts\/lo-trinh-san-pham\//];
const KHOA_CA_NHAN = [/GITHUB_TOKEN/, /authorization["']?\s*:\s*`token /i];

const tep = execFileSync("git", ["ls-files", "-co", "--exclude-standard"], {
	cwd: GOC,
	encoding: "utf8",
})
	.split("\n")
	.filter((t) => t && !BO_QUA.some((r) => r.test(t)) && /\.(ts|tsx|js|mjs|cjs|json|example)$/.test(t));

const ngoaiTacNhan = [];
const caNhan = [];
let daQuet = 0;
for (const t of tep) {
	let chu;
	try {
		chu = readFileSync(path.join(GOC, t), "utf8");
	} catch {
		continue;
	}
	daQuet += 1;
	if (chu.includes(BIEN_KHOA) && !CHO_PHEP.some((r) => r.test(t))) ngoaiTacNhan.push(t);
	if (VUNG_LO_TRINH.some((r) => r.test(t)) && KHOA_CA_NHAN.some((r) => r.test(chu))) caNhan.push(t);
}

console.log(`quet-khoa: ${daQuet} tep da quet`);
const dong1 = ngoaiTacNhan.length === 0;
const dong2 = caNhan.length === 0;
console.log(
	`${dong1 ? "DUNG" : "SAI"} 1 khoa rieng chi doc trong tac nhan${dong1 ? "" : ` — khoa rieng doc ngoai tac nhan: ${ngoaiTacNhan.join(", ")}`}`,
);
console.log(
	`${dong2 ? "DUNG" : "SAI"} 2 khong duong nao doc lo trinh bang khoa ca nhan${dong2 ? "" : ` — khoa ca nhan: ${caNhan.join(", ")}`}`,
);
console.log(`KET LUAN: ${dong1 && dong2 && daQuet > 0 ? "DUNG" : "SAI"}`);
process.exit(dong1 && dong2 && daQuet > 0 ? 0 : 1);
