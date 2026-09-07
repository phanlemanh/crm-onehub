import { spawnSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import {
	bam,
	docConfig,
	GOC,
	ketThuc,
	moiOCam,
	NEO,
	napHamKit,
} from "./chung.mjs";

const bamDau = bam(docConfig());
const chu = docConfig();
const { giai } = napHamKit();
const khoa = moiOCam(chu);

console.log(`o cam giai duoc: ${khoa.length} · neo: ${NEO.oCamTong}`);
if (khoa.length !== NEO.oCamTong) {
	console.error(
		`MA 2: dan so ${khoa.length} khac neo ${NEO.oCamTong} (${NEO.oCamKeThua} ke thua + ${NEO.oCamThem} them). Mot phep do tu chon dan so thi khong bao gio do.`,
	);
	ketThuc(bamDau, 2);
}

const KHUON_DUONG =
	/(?:^|\s)(?:bash|sh|node|bun)\s+([\w./@-]+\.(?:sh|mjs|cjs|js|ts))(?=\s|$)/g;
const hongCuPhap = [];
const thieuFile = [];

for (const k of khoa) {
	const v = giai(chu, k);
	if (!v) {
		hongCuPhap.push({ k, v: "(rong)", loi: "giai ra rong" });
		continue;
	}
	const r = spawnSync("bash", ["-n", "-c", v], { encoding: "utf8" });
	if (r.status !== 0)
		hongCuPhap.push({ k, v, loi: (r.stderr ?? "").split("\n")[0] });
	if (v.includes("${")) continue;
	for (const m of v.matchAll(KHUON_DUONG)) {
		const d = m[1];
		if (d.startsWith("..")) continue;
		const day = join(GOC, d);
		if (!existsSync(day) || statSync(day).size === 0) thieuFile.push({ k, d });
	}
}

console.log(
	`lenh hong cu phap: ${hongCuPhap.length} · file script duoc chay ma thieu: ${thieuFile.length}`,
);

if (hongCuPhap.length > 0) {
	console.error("DO: o cam giai ra lenh KHONG hop le cu phap bash:");
	for (const h of hongCuPhap)
		console.error(`  ${h.k} · ${h.loi}\n     ${h.v.slice(0, 120)}`);
	ketThuc(bamDau, 1);
}
if (thieuFile.length > 0) {
	console.error(
		"DO: o cam chay mot file script khong ton tai hoac rong — lenh hop le cu phap ma chet ngay khi chay:",
	);
	for (const t of thieuFile) console.error(`  ${t.k} -> ${t.d}`);
	ketThuc(bamDau, 1);
}

console.log(
	`XANH: ca ${khoa.length} o cam giai ra lenh hop le cu phap, va moi file script duoc chay deu co that.`,
);
ketThuc(bamDau, 0);
