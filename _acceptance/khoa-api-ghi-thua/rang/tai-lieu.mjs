import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const TEP = process.argv[2] ?? join(GOC, "docs", "api.md");
const CAN = [
	"patchedDependencies",
	"lastRequestUpdateIntervalMs",
	"better-auth#10921",
	"khoa-api-ghi-thua",
];

const muc = readFileSync(TEP, "utf8").split(/^## /m).slice(1);
const tot = muc
	.map((m) => ({
		ten: m.split("\n")[0],
		thieu: CAN.filter((c) => !m.includes(c)),
	}))
	.sort((a, b) => a.thieu.length - b.thieu.length)[0];

if (!tot || tot.thieu.length > 0) {
	console.error(
		`tai-lieu: khong muc H2 nao co du bon chuoi; muc gan nhat «${tot?.ten ?? "(khong co)"}» thieu: ${(tot?.thieu ?? CAN).join(", ")}`,
	);
	process.exit(1);
}
console.log(`tai-lieu: muc «${tot.ten}» co du bon chuoi`);
