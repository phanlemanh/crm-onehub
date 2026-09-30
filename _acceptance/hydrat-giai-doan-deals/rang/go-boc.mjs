import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const vi = process.argv.indexOf("--goc");
const GOC =
	vi === -1
		? join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..")
		: resolve(process.argv[vi + 1]);
const HO_SO = join(GOC, "_acceptance", "khung-tao-okr-nhu-deal");
const BOC = join(HO_SO, "rang", "giu-cho-han-che.mjs");

function doc(duong) {
	if (!existsSync(duong)) {
		console.log(`KHONG DO DUOC: thieu ${duong}`);
		process.exit(2);
	}
	return readFileSync(duong, "utf8");
}

const config = Bun.YAML.parse(doc(join(GOC, "_acceptance", "config.yaml")));
const lenh = config?.executors?.script?.kto_man_giu;
if (typeof lenh !== "string") {
	console.log("KHONG DO DUOC: config khong co executors.script.kto_man_giu");
	process.exit(2);
}
const e17 = Bun.YAML.parse(doc(join(HO_SO, "evals.yaml")))?.evals?.find(
	(e) => e.id === "E17",
);
if (!e17) {
	console.log(
		"KHONG DO DUOC: evals.yaml cua khung-tao-okr-nhu-deal khong co E17",
	);
	process.exit(2);
}
const vetE17 = `${e17.expected ?? ""}\n${(e17.paths ?? []).join("\n")}`;
const hopDong = doc(join(HO_SO, "contract.md"));

const MA_TRAN = [
	[
		"kto_man_giu chay thang man-giu-cho qua tien-de",
		lenh.includes("man-giu-cho.mjs") && lenh.includes("tien-de.mjs"),
		"kto_man_giu khong chay man-giu-cho qua tien-de",
	],
	[
		"kto_man_giu khong qua lop boc",
		!lenh.includes("giu-cho-han-che"),
		"kto_man_giu con lop boc",
	],
	["tep lop boc da xoa", !existsSync(BOC), "giu-cho-han-che.mjs con"],
	[
		"expected va paths cua E17 khong nhac lop boc hay loi hydrat",
		!/giu-cho-han-che|hydrat/i.test(vetE17),
		"E17 con nhac lop boc hoac loi hydrat",
	],
	[
		"hop dong khung-tao-okr-nhu-deal tro ve hydrat-giai-doan-deals",
		hopDong.includes("hydrat-giai-doan-deals"),
		"hop dong khung-tao-okr-nhu-deal khong ghi go han che E17",
	],
];

let hong = 0;
for (const [ten, dat, cau] of MA_TRAN) {
	if (dat) console.log(`ok: ${ten}`);
	else {
		hong += 1;
		console.log(`hong: ${cau}`);
	}
}
console.log(`go-boc: ${MA_TRAN.length} kiem, ${hong} hong`);
process.exit(hong === 0 ? 0 : 1);
