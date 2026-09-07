import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ts = createRequire(import.meta.url)("typescript");
const GOC = join(import.meta.dirname, "..", "..", "..");
const FILE = "packages/auth/src/auth.ts";

export function soiGanHd(nguon, ten) {
	const sf = ts.createSourceFile(ten, nguon, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
	const nhapTuKho = new Set();
	const bien = new Map();
	const gan = [];
	const di = (n) => {
		if (ts.isImportDeclaration(n) && /["']\.\/workspace["']/.test(n.moduleSpecifier.getText(sf))) {
			const b = n.importClause?.namedBindings;
			if (b && ts.isNamedImports(b)) for (const e of b.elements) nhapTuKho.add(e.name.getText(sf));
		}
		if (
			ts.isBinaryExpression(n) &&
			n.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
			/\.hd$/.test(n.left.getText(sf))
		) {
			const { line } = sf.getLineAndCharacterOfPosition(n.getStart(sf));
			gan.push({ dong: line + 1, phai: n.right.getText(sf) });
		}
		if (ts.isVariableDeclaration(n) && n.initializer) {
			bien.set(n.name.getText(sf), n.initializer.getText(sf));
		}
		ts.forEachChild(n, di);
	};
	di(sf);
	return { nhapTuKho, bien, gan };
}

const nguon = readFileSync(join(GOC, FILE), "utf8");
const { nhapTuKho, bien, gan } = soiGanHd(nguon, FILE);

if (gan.length === 0) {
	console.error(`KHONG DO DUOC: khong tim thay cho quyet dinh hd trong ${FILE}.`);
	process.exit(2);
}

console.log(`nhap tu ./workspace: ${[...nhapTuKho].join(" · ")}`);
const loi = [];
for (const g of gan) {
	const thang = g.phai.trim();
	const lanMot = /^[A-Za-z0-9_]+$/.test(thang) ? (bien.get(thang) ?? thang) : thang;
	const laGoiHam = /^([A-Za-z0-9_]+)\(\s*\)$/.exec(lanMot.trim());
	const tuKho = laGoiHam !== null && nhapTuKho.has(laGoiHam[1]);
	const tuTinh = /allowList\(|addresses|domains\[/.test(lanMot);
	console.log(
		`  ${FILE}:${g.dong}  ${thang.slice(0, 40)}${lanMot === thang ? "" : ` -> ${lanMot.slice(0, 40)}`}  ${tuKho && !tuTinh ? "goi ham thuan" : "TU TINH TAI CHO"}`,
	);
	if (!tuKho || tuTinh)
		loi.push(
			`${FILE}:${g.dong} — quyet dinh hd tu tinh tai cho ("${lanMot.slice(0, 60)}") thay vi goi mot ham thuan nhap tu ./workspace; nhu the khong do duoc sau hinh dang danh sach trong mot luot chay`,
		);
}

if (loi.length > 0) {
	for (const l of loi) console.error(`DO: ${l}`);
	process.exit(1);
}
console.log("XANH: quyet dinh hd nam trong mot ham thuan nhap tu ./workspace, auth.ts chi goi.");
