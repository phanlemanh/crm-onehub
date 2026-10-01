import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const GOC = join(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
	"..",
);
export const TEP_NAP = "apps/api/scripts/okr-mau/nap.ts";

export function lenhE8() {
	const cau = readFileSync(join(GOC, "_acceptance/config.yaml"), "utf8");
	const m = cau.match(/^\s+sot_soi_chi_them:\s*"([^"]+)"\s*$/m);
	if (!m) {
		console.log(
			"KHONG DO DUOC: khong doc duoc executors.script.sot_soi_chi_them",
		);
		process.exit(2);
	}
	const i = process.argv.indexOf("--thuoc");
	const thuoc = i === -1 ? null : process.argv[i + 1];
	return thuoc
		? m[1].replace("_acceptance/so-okr-tu-chay/rang/soi-ma.mjs", thuoc)
		: m[1];
}

const boc = (s) => `'${s.replaceAll("'", "'\\''")}'`;

export function chay(thay = []) {
	const them = thay.map(([vai, duong]) => ` --thay ${boc(`${vai}=${duong}`)}`);
	const r = spawnSync("bash", ["-c", lenhE8() + them.join("")], {
		cwd: GOC,
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
	});
	return { ma: r.status, ra: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

export const dongCo = (ra, dau) =>
	ra.split("\n").filter((d) => d.startsWith(dau));

export function dongCua(chu, doan) {
	const i = chu.indexOf(doan);
	if (i === -1 || chu.indexOf(doan, i + 1) !== -1) return null;
	return chu.slice(0, i).split("\n").length;
}

export const CHOT_DAT = "chot mien bo mau: C1 dat · C2 dat · C3 dat · C4 dat";

export function ketThuc(ma, tom) {
	console.log(`KET LUAN: ${tom} — ma thoat ${ma}`);
	process.exit(ma);
}
