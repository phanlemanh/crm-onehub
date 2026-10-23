import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const PHAN_LOAI = "scripts/pre-push-t1.mjs";
const RANG = [
	{ tep: "_acceptance/pre-push-t1/rang/dot-bien.mjs", so: 5, theoTep: true },
	{
		tep: "_acceptance/pre-push-phan-rieng-pr/rang/dot-bien.mjs",
		so: 6,
		theoTep: false,
	},
];
const KHOI = /\{[^{}]*?\bca:\s*"[^"]+"[\s\S]*?\btest:\s*"[^"]*",?\s*\}/g;
const TU = /\btu:\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')/;
const TEP_KHAI = /\btep:\s*"([^"]+)"/;

function rut(r) {
	const chu = readFileSync(join(GOC, r.tep), "utf8");
	const ds = [];
	for (const k of chu.match(KHOI) ?? []) {
		const tep = k.match(TEP_KHAI)?.[1];
		if (r.theoTep && tep !== PHAN_LOAI) continue;
		const m = k.match(TU);
		if (!m) continue;
		ds.push(
			m[1] !== undefined ? JSON.parse(`"${m[1]}"`) : m[2].replace(/\\'/g, "'"),
		);
	}
	return ds;
}

const dem = (chu, neo) => chu.split(neo).length - 1;
const lap = (chu, ds) => ds.filter((n) => dem(chu, n) !== 1);

const neo = [];
for (const r of RANG) {
	const ds = rut(r);
	if (ds.length !== r.so) {
		console.log(`thuoc hong: rut duoc ${ds.length} o ${r.tep} (can ${r.so})`);
		process.exit(1);
	}
	neo.push(...ds);
}

const that = readFileSync(join(GOC, PHAN_LOAI), "utf8");
const sai = lap(that, neo);
if (sai.length) {
	for (const n of sai) console.log(`neo lap: ${n} (${dem(that, n)} lan)`);
	process.exit(1);
}
console.log(`dat neo: ${neo.length}`);

const dau = neo[RANG[0].so];
const banChep = that.replace(dau, `${dau}\n${dau}`);
const doLap = lap(banChep, neo);
if (!doLap.includes(dau)) {
	console.log("thuoc hong: chieu do");
	process.exit(1);
}
console.log(`dat chieu-do: neo lap: ${dau}`);
