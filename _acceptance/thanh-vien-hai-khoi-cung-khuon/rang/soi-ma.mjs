import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const DAY = dirname(fileURLToPath(import.meta.url));
const GOC = process.env.GOC_KHO ?? join(DAY, "..", "..", "..");
const ts = createRequire(join(DAY, "..", "..", "..", "package.json"))("typescript");

const THU_MUC = join(GOC, "apps", "app", "app", "(app)", "[slug]", "settings", "members");
const CARD_TABLE = join(GOC, "packages", "ui", "src", "components", "card-table.tsx");
const LOP_CAM = /^(rounded|border|bg-|shadow)/;
const KHUNG = new Set(["Card", "CardHeader", "CardTitle", "CardDescription", "CardTable", "DataTable"]);
const LOP_CARD_TABLE =
	"min-w-[48rem] table-fixed [&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4";

let dung = 0;
let sai = 0;

function kiem(dat, cau) {
	if (dat) dung += 1;
	else {
		sai += 1;
		console.log(`SAI ${cau}`);
	}
}

function khongDo(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

function doc(tep) {
	try {
		return ts.createSourceFile(tep, readFileSync(tep, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
	} catch (loi) {
		return khongDo(`khong doc duoc ${tep} — ${loi.message}`);
	}
}

function moiNut(goc, lam) {
	const di = (n) => {
		lam(n);
		ts.forEachChild(n, di);
	};
	di(goc);
}

function tenTuUi(nguon) {
	const ten = new Set();
	for (const cau of nguon.statements) {
		if (!ts.isImportDeclaration(cau)) continue;
		if (!cau.moduleSpecifier.text.startsWith("@crm/ui/")) continue;
		const bien = cau.importClause?.namedBindings;
		if (bien && ts.isNamedImports(bien)) for (const p of bien.elements) if (!p.isTypeOnly) ten.add(p.name.text);
	}
	return ten;
}

function hangChuoi(nguon) {
	const bang = new Map();
	moiNut(nguon, (n) => {
		if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer) bang.set(n.name.text, n.initializer);
	});
	return bang;
}

function chuoiCua(bieuThuc, hang, da = new Set()) {
	if (!bieuThuc) return [];
	if (ts.isStringLiteral(bieuThuc) || ts.isNoSubstitutionTemplateLiteral(bieuThuc)) return [bieuThuc.text];
	if (ts.isJsxExpression(bieuThuc)) return chuoiCua(bieuThuc.expression, hang, da);
	if (ts.isTemplateExpression(bieuThuc))
		return [
			bieuThuc.head.text,
			...bieuThuc.templateSpans.flatMap((s) => [...chuoiCua(s.expression, hang, da), s.literal.text]),
		];
	if (ts.isCallExpression(bieuThuc)) return bieuThuc.arguments.flatMap((a) => chuoiCua(a, hang, da));
	if (ts.isBinaryExpression(bieuThuc)) return [...chuoiCua(bieuThuc.left, hang, da), ...chuoiCua(bieuThuc.right, hang, da)];
	if (ts.isConditionalExpression(bieuThuc))
		return [...chuoiCua(bieuThuc.whenTrue, hang, da), ...chuoiCua(bieuThuc.whenFalse, hang, da)];
	if (ts.isIdentifier(bieuThuc) && hang.has(bieuThuc.text) && !da.has(bieuThuc.text)) {
		da.add(bieuThuc.text);
		return chuoiCua(hang.get(bieuThuc.text), hang, da);
	}
	return [];
}

function lopCam(chuoi) {
	return chuoi
		.join(" ")
		.split(/\s+/)
		.filter(Boolean)
		.map((lop) => lop.split(":").pop())
		.filter((lop) => LOP_CAM.test(lop));
}

function soiTep(tep) {
	const nguon = doc(tep);
	const ui = tenTuUi(nguon);
	const hang = hangChuoi(nguon);
	const ten = relative(GOC, tep);
	let soThe = 0;
	moiNut(nguon, (n) => {
		if (!ts.isJsxOpeningElement(n) && !ts.isJsxSelfClosingElement(n)) return;
		const the = n.tagName.getText();
		if (!ui.has(the)) return;
		soThe += 1;
		const lop = n.attributes.properties.find((a) => ts.isJsxAttribute(a) && a.name.getText() === "className");
		const dong = nguon.getLineAndCharacterOfPosition(n.getStart()).line + 1;
		if (KHUNG.has(the)) kiem(!lop, `${ten}:${dong} ${the} nhan className=${lop ? lop.initializer.getText() : ""}`);
		if (!lop) return;
		const cam = lopCam(chuoiCua(lop.initializer, hang));
		kiem(cam.length === 0, `${ten}:${dong} ${the} className=${cam.join(" ")}`);
	});
	return soThe;
}

let tep;
try {
	tep = readdirSync(THU_MUC).filter((t) => t.endsWith(".tsx")).map((t) => join(THU_MUC, t));
} catch (loi) {
	khongDo(`khong doc duoc ${THU_MUC} — ${loi.message}`);
}
if (tep.length === 0) khongDo(`${THU_MUC} khong co tep .tsx nao`);

let tongThe = 0;
for (const t of tep) tongThe += soiTep(t);
if (tongThe === 0) khongDo("khong tim thay phan tu JSX nao nhap tu @crm/ui — thuoc khong cham duoc vat");
console.log(`GHI CHU soi ${tep.length} tep, ${tongThe} phan tu @crm/ui`);

const ct = doc(CARD_TABLE);
let lopBang = null;
moiNut(ct, (n) => {
	if (!ts.isFunctionDeclaration(n) || n.name?.text !== "CardTable") return;
	moiNut(n, (m) => {
		if ((ts.isJsxOpeningElement(m) || ts.isJsxSelfClosingElement(m)) && m.tagName.getText() === "SimpleTable") {
			const lop = m.attributes.properties.find((a) => ts.isJsxAttribute(a) && a.name.getText() === "className");
			lopBang = lop ? chuoiCua(lop.initializer, new Map()).join(" ") : "";
		}
	});
});
kiem(lopBang === LOP_CARD_TABLE, `card-table.tsx: chuoi lop CardTable doi — ${JSON.stringify(lopBang)}`);

console.log(`${dung} DUNG, ${sai} SAI — ma thoat ${sai === 0 ? 0 : 1}`);
process.exit(sai === 0 ? 0 : 1);
