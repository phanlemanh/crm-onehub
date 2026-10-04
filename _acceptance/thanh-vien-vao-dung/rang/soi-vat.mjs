import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const TEP = process.env.SOI_TEP ?? join(HERE, "..", "evidence", "soi-production.txt");
const MAY_DEV = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);
const SO = ["ten-mien", "treo", "bo-sot", "khong-doc-duoc"];

if (!existsSync(TEP)) {
	console.log(`KHONG DO DUOC: chua chay tren production — thieu ${TEP}`);
	process.exit(2);
}

const chu = readFileSync(TEP, "utf8");
const dong = [];
let sai = 0;

function kiem(nhan, dat) {
	dong.push(`${dat ? "DUNG" : "SAI"} ${nhan}`);
	if (!dat) sai += 1;
}

const mayChu = chu.match(/^may-chu (\S+)$/m)?.[1] ?? null;
kiem(
	mayChu === null
		? "may chu: thieu dong may-chu"
		: MAY_DEV.has(mayChu)
			? `may chu la may dev (${mayChu})`
			: `may chu ${mayChu}`,
	mayChu !== null && !MAY_DEV.has(mayChu),
);
kiem("giao dich READ ONLY", /^giao-dich READ ONLY$/m.test(chu));
for (const khoa of SO) {
	kiem(`so ${khoa}`, new RegExp(`^${khoa} \\d+$`, "m").test(chu));
}
kiem(chu.includes("@") ? "co dia chi thu trong tep" : "khong dia chi thu", !chu.includes("@"));

for (const d of dong) console.log(d);
console.log(`KET LUAN: ${dong.length - sai} DUNG, ${sai} SAI`);
process.exit(sai === 0 ? 0 : 1);
