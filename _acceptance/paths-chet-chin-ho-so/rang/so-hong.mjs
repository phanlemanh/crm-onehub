import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const TEP = "_acceptance/gom-tin-hieu-tu-chay/decisions.jsonl";
const GOC_SHA = JSON.parse(
	readFileSync(
		join(GOC, "_acceptance/paths-chet-chin-ho-so/rang/bang-sua.json"),
		"utf8",
	),
).goc;

const docDuoc = (l) => {
	try {
		JSON.parse(l);
		return true;
	} catch {
		return false;
	}
};

export function soSo(cu, moi) {
	const a = cu.split("\n");
	const b = moi.split("\n");
	const loi = [];
	if (a.length !== b.length) loi.push(`so dong ${a.length} -> ${b.length}`);
	for (let i = 0; i < Math.min(a.length, b.length); i += 1) {
		if (!b[i].trim()) continue;
		if (!docDuoc(b[i])) loi.push(`dong ${i + 1} van hong`);
		if (a[i] === b[i]) continue;
		if (docDuoc(a[i]) || a[i] !== `${b[i]}}`)
			loi.push(`dong ${i + 1} doi ngoai mot dau } thua`);
	}
	return loi;
}

const dc = soSo('{"a":1}}\n{"b":2}', '{"a":1}\n{"b":3}');
if (dc.length !== 1 || !dc[0].startsWith("dong 2")) {
	console.log(
		`KHONG DO DUOC: doi chung duong khong bat dong 2 doi chu (${dc.join("; ")})`,
	);
	process.exit(2);
}
console.log("doi chung duong: bat dong doi chu ngoai dau } thua");

const cu = execFileSync("git", ["show", `${GOC_SHA}:${TEP}`], {
	cwd: GOC,
	encoding: "utf8",
});
const moi = readFileSync(join(GOC, TEP), "utf8");
const hongCu = cu.split("\n").filter((l) => l.trim() && !docDuoc(l)).length;
const loi = soSo(cu, moi);
for (const l of loi) console.log(`SAI ${l}`);
console.log(
	`KET LUAN F38 so-hong: goc ${hongCu} dong hong, nay ${moi.split("\n").filter((l) => l.trim() && !docDuoc(l)).length}; ${loi.length} loi`,
);
process.exit(loi.length === 0 ? 0 : 1);
