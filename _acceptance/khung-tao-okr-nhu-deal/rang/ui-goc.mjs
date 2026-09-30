import { readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const ts = createRequire(join(GOC, "package.json"))("typescript");

const SHEET = "packages/ui/src/components/sheet.tsx";
const DIALOG = "packages/ui/src/components/dialog.tsx";
const HAI_NGAN = [
	"apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx",
	"apps/app/app/(app)/[slug]/okr/hop-thoai-muc-tieu.tsx",
];

const thay = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
	if (process.argv[i] === "--tep") {
		const [tep, banSao] = process.argv[i + 1].split("=");
		thay.set(tep, banSao);
	}
}

const doc = (tep) => readFileSync(thay.get(tep) ?? join(GOC, tep), "utf8");
const cay = (tep, chu = doc(tep)) =>
	ts.createSourceFile(tep, chu, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

function moi(node, f) {
	f(node);
	ts.forEachChild(node, (c) => moi(c, f));
}

const loi = [];
const dat = (dung, chu) => {
	if (dung) console.log(`ok ${chu}`);
	else loi.push(chu);
};

const sheet = cay(SHEET);
let coAssist = false;
let coDataSize = false;
let coSheetBody = false;
let bodyCoSplit = false;
moi(sheet, (n) => {
	if (
		ts.isVariableDeclaration(n) &&
		n.name.getText() === "sheetContentVariants"
	) {
		moi(n, (m) => {
			if (ts.isPropertyAssignment(m) && m.name.getText() === "assist")
				coAssist = true;
		});
	}
	if (ts.isJsxAttribute(n) && n.name.getText() === "data-size") coDataSize = true;
	if (ts.isExportSpecifier(n) && n.name.getText() === "SheetBody")
		coSheetBody = true;
	if (ts.isFunctionDeclaration(n) && n.name?.getText() === "SheetBody") {
		const p = n.parameters[0];
		if (p && ts.isObjectBindingPattern(p.name))
			bodyCoSplit = p.name.elements.some((e) => e.name.getText() === "split");
	}
});
dat(coAssist, "sheetContentVariants co co assist");
dat(coDataSize, "SheetContent dat data-size");
dat(coSheetBody && bodyCoSplit, "packages/ui xuat SheetBody nhan split");

const dialog = cay(DIALOG);
let dialogConAssist = false;
moi(dialog, (n) => {
	if (ts.isIdentifier(n) && n.text === "DialogAssistBody") dialogConAssist = true;
	if (ts.isStringLiteral(n) && n.text === "assist") dialogConAssist = true;
});
dat(!dialogConAssist, "dialog.tsx khong con DialogAssistBody va co assist");

const nhapAssist = [];
const quet = (thuMuc) => {
	for (const muc of readdirSync(thuMuc)) {
		if (muc === "node_modules" || muc === ".next" || muc.startsWith(".")) continue;
		const duong = join(thuMuc, muc);
		if (statSync(duong).isDirectory()) quet(duong);
		else if (/\.(ts|tsx|mts)$/.test(muc)) {
			const tuong = relative(GOC, duong);
			const chu = readFileSync(duong, "utf8");
			if (!chu.includes("DialogAssistBody")) continue;
			moi(cay(tuong, chu), (n) => {
				if (ts.isImportSpecifier(n) && n.name.getText() === "DialogAssistBody")
					nhapAssist.push(tuong);
			});
		}
	}
};
quet(join(GOC, "apps"));
quet(join(GOC, "packages"));
dat(
	nhapAssist.length === 0,
	`khong tep nao nhap DialogAssistBody${nhapAssist.length ? `: ${nhapAssist.join(", ")}` : ""}`,
);

for (const tep of HAI_NGAN) {
	const goc = cay(tep);
	const tuUi = new Set();
	moi(goc, (n) => {
		if (
			ts.isImportDeclaration(n) &&
			ts.isStringLiteral(n.moduleSpecifier) &&
			n.moduleSpecifier.text.startsWith("@crm/ui") &&
			n.importClause?.namedBindings &&
			ts.isNamedImports(n.importClause.namedBindings)
		) {
			for (const e of n.importClause.namedBindings.elements) tuUi.add(e.name.text);
		}
	});
	const sai = new Set();
	moi(goc, (n) => {
		const mo = ts.isJsxElement(n)
			? n.openingElement
			: ts.isJsxSelfClosingElement(n)
				? n
				: null;
		if (!mo) return;
		const ten = mo.tagName.getText();
		if (!tuUi.has(ten)) return;
		if (
			mo.attributes.properties.some(
				(p) => ts.isJsxAttribute(p) && p.name.getText() === "className",
			)
		)
			sai.add(ten);
	});
	if (sai.size === 0) console.log(`ok khong className o cho goi: ${tep}`);
	for (const ten of sai) loi.push(`className o cho goi: ${ten} (${tep})`);
}

for (const l of loi) console.log(l);
process.exit(loi.length > 0 ? 1 : 0);
