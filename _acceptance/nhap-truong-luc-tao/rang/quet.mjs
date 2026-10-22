import {
	existsSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const ts = createRequire(join(GOC, "apps", "app", "package.json"))(
	"typescript",
);

const BANG = "apps/app/components/crm/fields/kieu-truong.tsx";
const MAT_TAO = "oTao";
const MUOI_MOT_KIEU = [
	"TEXT",
	"LONG_TEXT",
	"NUMBER",
	"DATE",
	"CHECKBOX",
	"SELECT",
	"URL",
	"EMAIL",
	"PHONE",
	"USER",
	"MONEY",
];
const NAM_FORM = [
	{ tep: "apps/app/app/(app)/[slug]/companies/create-company-sheet.tsx" },
	{ tep: "apps/app/app/(app)/[slug]/contacts/create-contact-sheet.tsx" },
	{ tep: "apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx" },
	{
		tep: "apps/app/components/crm/record-sheet/quick-add.tsx",
		ham: "QuickAddContact",
	},
	{
		tep: "apps/app/components/crm/record-sheet/quick-add.tsx",
		ham: "QuickAddDeal",
	},
];
const THE_CAM = new Set([
	"Input",
	"Checkbox",
	"Select",
	"DatePicker",
	"MoneyInput",
	"Textarea",
]);
const NGOAI_LE_ID = new Set(["create-deal-stage"]);

function docNguon(duong) {
	return ts.createSourceFile(
		duong,
		readFileSync(duong, "utf8"),
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
}

function boBoc(nut) {
	let n = nut;
	while (
		n &&
		(ts.isAsExpression(n) ||
			ts.isSatisfiesExpression(n) ||
			ts.isParenthesizedExpression(n))
	)
		n = n.expression;
	return n;
}

function tenThuocTinh(p) {
	if (!p.name) return "";
	if (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) return p.name.text;
	return "";
}

function quetBang(duong) {
	const nguon = docNguon(duong);
	let bang = null;
	const di = (n) => {
		if (
			ts.isVariableDeclaration(n) &&
			ts.isIdentifier(n.name) &&
			n.name.text === "KIEU_TRUONG"
		)
			bang = boBoc(n.initializer);
		ts.forEachChild(n, di);
	};
	di(nguon);
	if (!bang || !ts.isObjectLiteralExpression(bang))
		throw new Error("ntl quet: thieu bang KIEU_TRUONG");
	for (const kieu of MUOI_MOT_KIEU) {
		const dong = bang.properties.find((p) => tenThuocTinh(p) === kieu);
		const than = dong && ts.isPropertyAssignment(dong) ? boBoc(dong.initializer) : null;
		const coMat =
			than &&
			ts.isObjectLiteralExpression(than) &&
			than.properties.some((p) => tenThuocTinh(p) === MAT_TAO);
		if (!coMat) throw new Error(`ntl quet: thieu mat tao ${kieu}`);
	}
}

function tenThe(n) {
	const ten = n.tagName;
	return ts.isIdentifier(ten) ? ten.text : ten.getText();
}

function thuocTinh(n, ten) {
	for (const a of n.attributes.properties) {
		if (
			ts.isJsxAttribute(a) &&
			a.name.getText() === ten &&
			a.initializer &&
			ts.isStringLiteral(a.initializer)
		)
			return a.initializer.text;
	}
	return null;
}

function laNgoaiLe(phanTu) {
	let ok = false;
	const di = (n) => {
		if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
			const id = thuocTinh(n, "id");
			if (id && NGOAI_LE_ID.has(id)) ok = true;
		}
		ts.forEachChild(n, di);
	};
	di(phanTu);
	return ok;
}

function quetForm(duong, ham, tenHienThi) {
	if (!existsSync(duong)) throw new Error(`ntl quet: thieu tep ${tenHienThi}`);
	const nguon = docNguon(duong);
	const coNhapBang = nguon.statements.some(
		(c) =>
			ts.isImportDeclaration(c) &&
			ts.isStringLiteral(c.moduleSpecifier) &&
			c.moduleSpecifier.text.endsWith("kieu-truong"),
	);
	if (!coNhapBang) throw new Error(`ntl quet: khong doc bang ${tenHienThi}`);

	let goc = nguon;
	if (ham) {
		goc = nguon.statements.find(
			(c) => ts.isFunctionDeclaration(c) && c.name?.text === ham,
		);
		if (!goc) throw new Error(`ntl quet: thieu tep ${tenHienThi}#${ham}`);
	}

	const dong = (n) => nguon.getLineAndCharacterOfPosition(n.getStart()).line + 1;
	const di = (n) => {
		if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n)) {
			const mo = ts.isJsxElement(n) ? n.openingElement : n;
			const the = tenThe(mo);
			if (THE_CAM.has(the) && !laNgoaiLe(n))
				throw new Error(`ntl quet: ve tay ${tenHienThi}:${dong(n)} ${the}`);
		}
		const laSoSanh =
			ts.isBinaryExpression(n) &&
			[
				ts.SyntaxKind.EqualsEqualsEqualsToken,
				ts.SyntaxKind.ExclamationEqualsEqualsToken,
			].includes(n.operatorToken.kind);
		const veKieu = (e) =>
			ts.isPropertyAccessExpression(e) &&
			["kieu", "type"].includes(e.name.text);
		if (laSoSanh && (veKieu(n.left) || veKieu(n.right)))
			throw new Error(`ntl quet: re nhanh kieu ${tenHienThi}:${dong(n)}`);
		if (ts.isSwitchStatement(n) && veKieu(n.expression))
			throw new Error(`ntl quet: re nhanh kieu ${tenHienThi}:${dong(n)}`);
		ts.forEachChild(n, di);
	};
	di(goc);
}

quetBang(join(GOC, BANG));
for (const f of NAM_FORM) {
	const ten = f.ham ? `${f.tep}#${f.ham}` : f.tep;
	quetForm(join(GOC, f.tep), f.ham, ten);
}

const tam = mkdtempSync(join(tmpdir(), "ntl-quet-"));
try {
	const ban = join(tam, "create-company-sheet.tsx");
	const goc = readFileSync(join(GOC, NAM_FORM[0].tep), "utf8");
	if (!goc.includes("<FieldGroup>"))
		throw new Error("ntl quet: doi chung khong co FieldGroup");
	writeFileSync(
		ban,
		goc.replace("<FieldGroup>", '<FieldGroup>\n<Input id="x" />'),
	);
	let bat = "";
	try {
		quetForm(ban, undefined, relative(tam, ban));
	} catch (loi) {
		bat = String(loi.message);
	}
	if (!bat.includes("ntl quet: ve tay")) throw new Error("ntl quet: thuoc mu");
} finally {
	rmSync(tam, { recursive: true, force: true });
}

console.log("ntl quet: dat");
