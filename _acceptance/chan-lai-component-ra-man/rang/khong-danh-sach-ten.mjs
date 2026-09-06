import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { docMacDinh } from "./moi-mac-dinh.mjs";

const ts = createRequire(import.meta.url)("typescript");
const GOC = join(import.meta.dirname, "..", "..", "..");

const DUONG_PHAN_NHOM = ["lai-ra-man.mjs", "moi-mac-dinh.mjs"];

function mangTenThamSo(duong, tenThamSo) {
	const nguon = readFileSync(duong, "utf8");
	const sf = ts.createSourceFile(
		duong,
		nguon,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.JS,
	);
	const thay = [];
	const di = (n) => {
		if (ts.isArrayLiteralExpression(n)) {
			const chuoi = n.elements.filter((e) => ts.isStringLiteral(e));
			const trung = chuoi.filter((e) => tenThamSo.has(e.text));
			if (trung.length >= 2) {
				const { line } = sf.getLineAndCharacterOfPosition(n.getStart(sf));
				thay.push({
					dong: line + 1,
					trung: trung.map((e) => e.text),
				});
			}
		}
		ts.forEachChild(n, di);
	};
	di(sf);
	return thay;
}

const tenThamSo = new Set(docMacDinh(GOC).map((m) => m.tham_so));
if (tenThamSo.size === 0) {
	console.error(
		"KHONG DO DUOC: khong doc duoc ten tham so nao tu dan so — khong co gi de so.",
	);
	process.exit(2);
}
console.log(`ten tham so co that trong dan so: ${tenThamSo.size}`);

const bat = [];
for (const ten of DUONG_PHAN_NHOM) {
	const duong = join(import.meta.dirname, ten);
	for (const t of mangTenThamSo(duong, tenThamSo))
		bat.push(`${ten}:${t.dong} — mang chua ten tham so: ${t.trung.join(" · ")}`);
}

if (bat.length > 0) {
	for (const b of bat)
		console.error(
			`DO: chan phan nhom dang doc mot DANH SACH TEN THAM SO go tay — ${b}`,
		);
	process.exit(1);
}
console.log(
	`XANH: ${DUONG_PHAN_NHOM.length} file cua duong phan nhom khong chua mang nao ke ten tham so — phan nhom do BAN VE quyet.`,
);
