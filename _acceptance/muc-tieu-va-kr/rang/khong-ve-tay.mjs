import { readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const DAY = dirname(fileURLToPath(import.meta.url));
const GOC_THAT = join(DAY, "..", "..", "..");
const co = process.argv.indexOf("--goc");
const GOC = co > -1 ? process.argv[co + 1] : GOC_THAT;
const ts = createRequire(import.meta.url)("typescript");

const VUNG = {
	thuMuc: "apps/app/app/(app)/[slug]/okr",
	tep: ["apps/app/components/crm/record-sheet/objective-sheet.tsx"],
	the: "SimpleTableRow",
	lopCam: /(^|\s|:)(bg-|border-|rounded)/,
};

function tepTsx(thuMuc) {
	const ra = [];
	for (const ten of readdirSync(thuMuc)) {
		const duong = join(thuMuc, ten);
		if (statSync(duong).isDirectory()) ra.push(...tepTsx(duong));
		else if (ten.endsWith(".tsx")) ra.push(duong);
	}
	return ra;
}

function chuoiLop(gt) {
	if (!gt) return "";
	if (ts.isStringLiteral(gt)) return gt.text;
	if (ts.isJsxExpression(gt) && gt.expression) return gt.expression.getText();
	return gt.getText();
}

const tep = [
	...tepTsx(join(GOC, VUNG.thuMuc)),
	...VUNG.tep.map((t) => join(GOC, t)),
];
let soThe = 0;
const viPham = [];
for (const duong of tep) {
	const sf = ts.createSourceFile(
		duong,
		readFileSync(duong, "utf8"),
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
	const di = (n) => {
		if (
			(ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) &&
			n.tagName.getText() === VUNG.the
		) {
			soThe += 1;
			const lop = n.attributes.properties.find(
				(p) => ts.isJsxAttribute(p) && p.name.getText() === "className",
			);
			const chu = lop ? chuoiLop(lop.initializer) : "";
			if (VUNG.lopCam.test(chu)) {
				const dong = sf.getLineAndCharacterOfPosition(n.getStart()).line + 1;
				viPham.push(`${relative(GOC, duong)}:${dong} ${chu}`);
			}
		}
		ts.forEachChild(n, di);
	};
	di(sf);
}

console.log(`tep da quet: ${tep.length}, ${VUNG.the} da quet: ${soThe}`);
if (soThe === 0) {
	console.log(`khong thay ${VUNG.the} nao — thuoc khong do duoc`);
	process.exit(2);
}
for (const v of viPham) console.log(`ve tay: ${v}`);
process.exit(viPham.length > 0 ? 1 : 0);
