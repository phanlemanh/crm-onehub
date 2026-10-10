import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../..",
);
const QUET = path.join(
	GOC,
	"_acceptance/nhan-ung-dung-noi-tieng-viet/rang/chu-cung-jsx.mjs",
);
const MAC_DINH = [
	"apps/app/components/lo-trinh",
	"apps/app/app/(app)/[slug]/lo-trinh",
];
const DONG = /^(\S+):(\d+)\s+\[([^\]]+)\]\s+"(.*)"$/;

function tepTsx(duong) {
	const tuyetDoi = path.resolve(GOC, duong);
	if (!existsSync(tuyetDoi)) return [];
	if (!statSync(tuyetDoi).isDirectory())
		return tuyetDoi.endsWith(".tsx") ? [path.relative(GOC, tuyetDoi)] : [];
	return readdirSync(tuyetDoi, { recursive: true })
		.map(String)
		.filter((t) => t.endsWith(".tsx"))
		.map((t) => path.relative(GOC, path.join(tuyetDoi, t)));
}

const nguon = process.argv.slice(2).length ? process.argv.slice(2) : MAC_DINH;
const tep = nguon.flatMap(tepTsx).sort();

if (tep.length === 0) {
	console.log(`KHONG DO DUOC: khong co tep .tsx nao duoi ${nguon.join(" · ")}`);
	process.exit(2);
}

let ra;
try {
	ra = execFileSync("node", [QUET, ...tep], {
		cwd: GOC,
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	});
} catch (e) {
	ra = `${e.stdout ?? ""}${e.stderr ?? ""}`;
}

const vet = ra
	.split("\n")
	.map((d) => DONG.exec(d.trim()))
	.filter((m) => m !== null);

const soQuet = Number(/quet (\d+) file trong lat/.exec(ra)?.[1] ?? -1);
if (soQuet !== tep.length) {
	console.log(
		`KHONG DO DUOC: dua ${tep.length} tep nhung bo quet doc ${soQuet} — bo quet hong hoac doi khuon`,
	);
	process.exit(2);
}

console.log(`quet ${tep.length} tep .tsx`);
if (vet.length) {
	for (const m of vet)
		console.log(`${m[1]}:${m[2]} [${m[3]}] ${JSON.stringify(m[4])}`);
	console.log(
		`SAI chu viet thang ngoai tep loi — dau tien o ${vet[0][1]}:${vet[0][2]}`,
	);
	process.exit(1);
}
console.log("DUNG moi chu hien thi lay tu tep loi");
