import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const RA = join(GOC, ".acceptance-runs/ban-gieo-gop-y-sau-nop");
const BANG = join(
	GOC,
	"_acceptance/ban-gieo-gop-y-sau-nop/evidence/ba-ban-do.txt",
);
const KHOA = ["gy_man_that", "r1a_man_khung", "r1a_man_thanh", "r1d_man_okr"];
const DAU_HIEU = /^gieo-gop-y: xong/m;
const KET = /^(KET LUAN|KHONG DO DUOC)\b.*$/gm;

export function phanLoai(text) {
	const ket = [...text.matchAll(KET)].map((m) => m[0]);
	return { qua: DAU_HIEU.test(text), ket: ket.at(-1) ?? null };
}

const argv = process.argv.slice(2);
const iPl = argv.indexOf("--phan-loai");
if (iPl >= 0) {
	const tep = argv[iPl + 1];
	if (!tep || !existsSync(tep)) {
		console.log(`KHONG DO DUOC: khong co tep ${tep ?? ""}`);
		process.exit(2);
	}
	const { qua } = phanLoai(readFileSync(tep, "utf8"));
	console.log(qua ? "qua buoc gieo" : "khong qua buoc gieo");
	process.exit(qua ? 0 : 1);
}

const cfg = Bun.YAML.parse(
	readFileSync(join(GOC, "_acceptance/config.yaml"), "utf8"),
);
const lenh = KHOA.map((k) => [k, cfg.executors?.script?.[k]]);
const thieu = lenh.filter(([, l]) => !l).map(([k]) => k);
if (thieu.length) {
	console.log(`KHONG DO DUOC: thieu executors.script.${thieu.join(", ")}`);
	process.exit(2);
}

mkdirSync(RA, { recursive: true });
const dong = [];
const loi = [];
for (const [k, l] of lenh) {
	const r = spawnSync("bash", ["-c", l], {
		cwd: GOC,
		encoding: "utf8",
		maxBuffer: 256 << 20,
	});
	const ra = `${r.stdout ?? ""}${r.stderr ?? ""}`;
	writeFileSync(join(RA, `ban-do-${k}.txt`), ra);
	const { qua, ket } = phanLoai(ra);
	const d = `${k}: ma ${r.status} · ${ket ?? "(khong co KET LUAN hay KHONG DO DUOC)"}`;
	dong.push(d);
	console.log(d);
	if (ket === null) loi.push(`thieu ket luan: ${k}`);
	if (!qua) loi.push(`khong qua buoc gieo: ${k}`);
}
mkdirSync(dirname(BANG), { recursive: true });
writeFileSync(BANG, `${dong.join("\n")}\n`);
if (loi.length) {
	for (const l of loi) console.log(l);
	process.exit(1);
}
console.log(`ba-ban-do: ${KHOA.length}/${KHOA.length} lenh qua buoc gieo`);
