import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const BIEN = ["$", "{{ matrix.o.ten }}"].join("");
const doc = (t) => readFileSync(join(GOC, t), "utf8");

function tenKhai(khai) {
	return [...new Set(Object.values(JSON.parse(khai).ci).flat())].sort();
}

function tenDung(ci, acc) {
	const oMaTran = [...ci.matchAll(/^ {10}- ten: (\S+)$/gm)].map((m) => m[1]);
	const ra = new Set();
	for (const chu of [ci, acc])
		for (const m of chu.matchAll(/^ {4}name: (.+)$/gm)) {
			const t = m[1].trim();
			if (t.includes(BIEN)) for (const o of oMaTran) ra.add(t.replace(BIEN, o));
			else ra.add(t);
		}
	return ra;
}

function tenMau(mau) {
	return new Set(JSON.parse(mau).check_runs.map((c) => c.name));
}

function so(khai, ci, acc, mau) {
	const ten = tenKhai(khai);
	const dung = tenDung(ci, acc);
	const trongMau = tenMau(mau);
	const loi = [];
	const ngoai = ten.filter((t) => !dung.has(t));
	if (ngoai.length) loi.push(`ten khai khong co trong workflow: ${ngoai.join(", ")}`);
	const thieuMau = ten.filter((t) => !trongMau.has(t));
	if (thieuMau.length) loi.push(`ten khai khong co trong mau check-runs: ${thieuMau.join(", ")}`);
	const canCo = ["check-types, lint", "lệnh dựng", ...[...dung].filter((t) => t.startsWith("test ("))].sort();
	if (JSON.stringify(ten) !== JSON.stringify(canCo)) loi.push(`tap ten khai ${JSON.stringify(ten)} khac tap can co ${JSON.stringify(canCo)}`);
	return loi;
}

const KHAI = doc(".githooks/da-chung.json");
const CI = doc(".github/workflows/ci.yml");
const ACC = doc(".github/workflows/acceptance.yml");
const MAU = doc("packages/ui/test/mau/check-runs-538.json");

const loi = so(KHAI, CI, ACC, MAU);
if (loi.length) {
	for (const l of loi) console.log(l);
	process.exit(1);
}
console.log(`dat ten-job: ${tenKhai(KHAI).length} ten khai bang dung tap job kiem cua ci.yml va acceptance.yml, deu co trong mau`);

const khaiPha = JSON.parse(KHAI);
khaiPha.ci.test = [...khaiPha.ci.test, "test (gia)"];
const doPha = so(JSON.stringify(khaiPha), CI, ACC, MAU);
const khaiThieu = JSON.parse(KHAI);
khaiThieu.ci.test = khaiThieu.ci.test.slice(1);
const doThieu = so(JSON.stringify(khaiThieu), CI, ACC, MAU);
if (doPha.length && doThieu.length) console.log(`BAT: ten la -> ${doPha[0]}; thieu mot o -> ${doThieu[0]}`);
else {
	console.log("thuoc hong: ban sao pha khong do");
	process.exit(1);
}
