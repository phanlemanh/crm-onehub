import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const MAU = "packages/ui/test/mau/so-chay-that.jsonl";
const SO_CHAY = /^_acceptance\/[^/]+\/run-log\.jsonl$/;
const SHA = /^[0-9a-f]{40}$/;

const { lenhXanhCuaDong } = await import(join(GOC, "scripts/pre-push-da-chung.mjs"));

const tep = spawnSync("git", ["ls-files", "_acceptance"], { cwd: GOC, encoding: "utf8", maxBuffer: 1 << 26 })
	.stdout.split("\n")
	.filter((t) => SO_CHAY.test(t));
const dongThat = [];
for (const t of tep)
	for (const dong of readFileSync(join(GOC, t), "utf8").split("\n"))
		if (dong.startsWith("{")) dongThat.push([t, dong]);

function phan(dong) {
	try {
		return JSON.parse(dong);
	} catch {
		return null;
	}
}

function xanhDocLap(d) {
	if (d === null || Object(d) !== d || Array.isArray(d)) return null;
	if (d.kind === "repin" || d.kind === "repin-do") return null;
	if (String(d.cmd) !== d.cmd || !SHA.test(String(d.sha))) return null;
	return d.exit_code === 0 || d.exit_code === "0" ? d.cmd : null;
}

function lech(ds, boDoc = lenhXanhCuaDong) {
	const ra = [];
	for (const [t, dong] of ds) {
		const d = phan(dong);
		const a = xanhDocLap(d);
		const b = d ? boDoc(d) : null;
		if (a !== b) ra.push(`${t}: doc lap «${a}» bo doc «${b}»`);
	}
	return ra;
}

function mauKhongCo(mau, ds) {
	const co = new Set(ds.map(([, d]) => d));
	return mau.filter((d) => !co.has(d));
}

const loi = [];
const mau = readFileSync(join(GOC, MAU), "utf8").split("\n").filter((d) => d.startsWith("{"));
const soXanh = dongThat.filter(([, d]) => xanhDocLap(phan(d))).length;

const l1 = lech(dongThat);
if (l1.length) loi.push(`(1) ${l1.length} dong lech, vd ${l1[0]}`);
else if (soXanh === 0) loi.push("(1) so chay that khong co dong lenh xanh nao");
else console.log(`dat (1): ${dongThat.length} dong cua ${tep.length} so chay, ${soXanh} dong lenh xanh, bo doc khop tung dong`);

const l2 = mauKhongCo(mau, dongThat);
if (l2.length) loi.push(`(2) ${l2.length} dong mau khong co trong so chay that`);
else console.log(`dat (2): ${mau.length} dong mau deu chep nguyen van tu so chay that`);

const xanh = dongThat.find(([, d]) => xanhDocLap(phan(d)));
const pha = JSON.stringify({ ...phan(xanh[1]), exit_code: 1 });
const lechPha = lech([["ban-sao", pha]]);
const loNhan = lenhXanhCuaDong(JSON.parse(pha));
if (loNhan !== null || lechPha.length) loi.push("thuoc hong: bo doc nhan dong ma 1");
const doMau = mauKhongCo([...mau, `${mau[0].slice(0, -1)},"gia":1}`], dongThat);
if (doMau.length === 1) console.log("BAT (2): dong mau sua tay khong co trong so chay that");
else loi.push("thuoc hong: ghim (2) khong do tren ban sao pha");
const doLech2 = lech([xanh], () => null);
if (doLech2.length === 1) console.log(`BAT (1): bo doc bo sot dong xanh — ${doLech2[0]}`);
else loi.push("thuoc hong: ghim (1) khong do tren bo doc pha");

if (loi.length) {
	for (const l of loi) console.log(l);
	process.exit(1);
}
console.log("dat so-chay-that");
