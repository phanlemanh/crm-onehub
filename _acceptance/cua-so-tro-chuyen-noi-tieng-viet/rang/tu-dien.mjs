import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GOC } from "../../man-cai-dat-noi-tieng-viet/rang/lat.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const BANG = JSON.parse(readFileSync(`${HERE}/tu-dien-cua-lat.json`, "utf8"));
const TU_DIEN = readFileSync(join(GOC, "CONTEXT.md"), "utf8");

function giaTri(kho, duong) {
	const ma = [
		`import * as m from "./lib/messages/${kho}";`,
		"const lay = Object.values(m).find((v) => v instanceof Function);",
		'console.log(JSON.stringify(lay("vi")));',
	].join("\n");
	const r = spawnSync("bun", ["-e", ma], { cwd: join(GOC, "apps/app"), encoding: "utf8" });
	if (r.status !== 0) return null;
	let o = JSON.parse(r.stdout);
	for (const b of duong.split(".")) {
		if (!(o instanceof Object) || !(b in o)) return null;
		o = o[b];
	}
	return o instanceof Function ? o("1") : o;
}

const thieuTuDien = [];
const khongDung = [];
for (const m of BANG.muc) {
	if (!TU_DIEN.includes(`**${m.tu}**`)) {
		thieuTuDien.push(`${m.tu} — khong co muc trong CONTEXT.md`);
		continue;
	}
	const gt = giaTri(m.kho, m.duong);
	if (String(gt) !== gt) {
		khongDung.push(`${m.tu} — duong ${m.kho}:${m.duong} khong tra ve mot chuoi`);
		continue;
	}
	const goc = m.tu.toLowerCase();
	if (!gt.toLowerCase().includes(goc))
		khongDung.push(`${m.tu} — co muc trong tu dien ma ban vi tai ${m.kho}:${m.duong} khong dung no (${JSON.stringify(gt)})`);
}

console.log(`tu dien: ${BANG.muc.length} muc doi chieu`);
for (const d of thieuTuDien) console.log(`   THIEU MUC: ${d}`);
for (const d of khongDung) console.log(`   KHONG DUNG: ${d}`);
if (BANG.muc.length === 0) {
	console.log("KHONG DO DUOC: bang tu dien rong.");
	process.exit(2);
}
if (thieuTuDien.length > 0 || khongDung.length > 0) process.exit(1);
console.log(`XANH: ca ${BANG.muc.length} muc deu co trong CONTEXT.md va deu duoc ban vi cua lat dung.`);
process.exit(0);
