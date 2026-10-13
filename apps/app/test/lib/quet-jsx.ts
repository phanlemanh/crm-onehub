import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

export const GOC_KHO = resolve(
	dirname(fileURLToPath(import.meta.url)),
	"../../../..",
);

export const TIEN_SLUG = "apps/app/app/(app)/[slug]/";

export type DocTep = (tep: string) => string | null;

export function docTuDia(goc: string = GOC_KHO): DocTep {
	return (tep) => {
		const duong = join(goc, tep);
		return existsSync(duong) ? readFileSync(duong, "utf8") : null;
	};
}

export function phanTich(tep: string, nguon: string): ts.SourceFile {
	return ts.createSourceFile(
		tep,
		nguon,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
}

export function tenThe(node: ts.JsxElement | ts.JsxSelfClosingElement): string {
	const the = ts.isJsxElement(node) ? node.openingElement : node;
	return the.tagName.getText();
}

function moThe(node: ts.JsxElement | ts.JsxSelfClosingElement) {
	return ts.isJsxElement(node) ? node.openingElement : node;
}

export function thuocTinh(
	node: ts.JsxElement | ts.JsxSelfClosingElement,
	ten: string,
): ts.JsxAttribute | null {
	for (const a of moThe(node).attributes.properties) {
		if (ts.isJsxAttribute(a) && a.name.getText() === ten) return a;
	}
	return null;
}

export function giaTriChuoi(a: ts.JsxAttribute | null): string | null {
	if (!a?.initializer) return null;
	if (ts.isStringLiteral(a.initializer)) return a.initializer.text;
	if (
		ts.isJsxExpression(a.initializer) &&
		a.initializer.expression &&
		ts.isStringLiteralLike(a.initializer.expression)
	) {
		return a.initializer.expression.text;
	}
	return null;
}

export function moiPhanTu(
	goc: ts.Node,
): (ts.JsxElement | ts.JsxSelfClosingElement)[] {
	const ra: (ts.JsxElement | ts.JsxSelfClosingElement)[] = [];
	const di = (n: ts.Node) => {
		if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n)) ra.push(n);
		ts.forEachChild(n, di);
	};
	di(goc);
	return ra;
}

export function trongConSuspense(node: ts.Node): boolean {
	let con: ts.Node = node;
	let cha = node.parent;
	while (cha) {
		if (ts.isJsxElement(cha) && tenThe(cha) === "Suspense") {
			if (
				cha.children.some(
					(c) => c === con || (c.pos <= con.pos && con.end <= c.end),
				)
			) {
				return true;
			}
		}
		con = cha;
		cha = cha.parent;
	}
	return false;
}

export function dongCua(sf: ts.SourceFile, node: ts.Node): number {
	return sf.getLineAndCharacterOfPosition(node.getStart()).line + 1;
}

export function moiTepTsx(goc: string, thuMuc: string): string[] {
	const ra: string[] = [];
	const di = (tuongDoi: string) => {
		const duong = join(goc, tuongDoi);
		for (const ten of readdirSync(duong)) {
			if (ten === "node_modules" || ten.startsWith(".")) continue;
			const con = join(tuongDoi, ten);
			if (statSync(join(goc, con)).isDirectory()) di(con);
			else if (ten.endsWith(".tsx")) ra.push(con);
		}
	};
	di(thuMuc);
	return ra.sort();
}

export function nhapCucBo(sf: ts.SourceFile, tep: string): Map<string, string> {
	const ra = new Map<string, string>();
	for (const cau of sf.statements) {
		if (!ts.isImportDeclaration(cau)) continue;
		const nguon = (cau.moduleSpecifier as ts.StringLiteral).text;
		let dich: string | null = null;
		if (nguon.startsWith("./") || nguon.startsWith("../")) {
			dich = relative(GOC_KHO, resolve(GOC_KHO, dirname(tep), nguon));
		} else if (nguon.startsWith("@/app/")) {
			dich = `apps/app/${nguon.slice(2)}`;
		}
		if (!dich?.startsWith("apps/app/app/")) continue;
		const ten = cau.importClause?.namedBindings;
		if (ten && ts.isNamedImports(ten)) {
			for (const e of ten.elements) ra.set(e.name.text, `${dich}.tsx`);
		}
	}
	return ra;
}

export type CoTrongCay = (
	ten: string,
	node: ts.JsxElement | ts.JsxSelfClosingElement,
) => boolean;

export function coKhiTai(node: ts.Node, laDich: CoTrongCay): boolean {
	if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
		const ten = tenThe(node);
		if (ten === "Suspense") {
			const fb = thuocTinh(node, "fallback");
			const bt = fb?.initializer;
			if (!bt || !ts.isJsxExpression(bt) || !bt.expression) return false;
			return coKhiTai(bt.expression, laDich);
		}
		if (laDich(ten, node)) return true;
		for (const a of moThe(node).attributes.properties) {
			if (
				ts.isJsxAttribute(a) &&
				a.initializer &&
				ts.isJsxExpression(a.initializer) &&
				a.initializer.expression &&
				coKhiTai(a.initializer.expression, laDich)
			) {
				return true;
			}
		}
		if (ts.isJsxElement(node)) {
			return node.children.some((c) => coKhiTai(c, laDich));
		}
		return false;
	}
	let thay = false;
	ts.forEachChild(node, (c) => {
		if (!thay && coKhiTai(c, laDich)) thay = true;
	});
	return thay;
}

export function hamMacDinh(sf: ts.SourceFile): ts.Node | null {
	for (const cau of sf.statements) {
		if (
			ts.isFunctionDeclaration(cau) &&
			cau.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)
		) {
			return cau;
		}
	}
	return null;
}

export function hamTen(sf: ts.SourceFile, ten: string): ts.Node | null {
	for (const cau of sf.statements) {
		if (ts.isFunctionDeclaration(cau) && cau.name?.text === ten) return cau;
	}
	return null;
}
