import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

export { ts };

export function quetTs(thuMuc) {
	return readdirSync(thuMuc, { withFileTypes: true }).flatMap((muc) => {
		const duong = join(thuMuc, muc.name);
		if (muc.isDirectory()) {
			return muc.name === "node_modules" || muc.name === "generated"
				? []
				: quetTs(duong);
		}
		return muc.name.endsWith(".ts") || muc.name.endsWith(".tsx") ? [duong] : [];
	});
}

export function nap(duong) {
	return ts.createSourceFile(
		duong,
		readFileSync(duong, "utf8"),
		ts.ScriptTarget.Latest,
		true,
	);
}

export function duyet(node, fn) {
	fn(node);
	node.forEachChild((con) => duyet(con, fn));
}

export function viTri(sf, node, goc) {
	const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
	const duong = sf.fileName.startsWith(`${goc}/`)
		? sf.fileName.slice(goc.length + 1)
		: sf.fileName;
	return `${duong}:${line + 1}`;
}

const KHOA_DOC = new Set(["select", "where", "orderBy", "include"]);

export function duoiKhoaDoc(node) {
	for (let n = node.parent; n; n = n.parent) {
		if (
			ts.isPropertyAssignment(n) &&
			ts.isIdentifier(n.name) &&
			KHOA_DOC.has(n.name.text)
		) {
			return true;
		}
	}
	return false;
}

export function hamBao(sf, node) {
	for (let n = node.parent; n; n = n.parent) {
		if (ts.isMethodDeclaration(n) && n.name) return n.name.getText(sf);
		if (ts.isFunctionDeclaration(n) && n.name) return n.name.getText(sf);
		if (ts.isPropertyAssignment(n) && ts.isIdentifier(n.name)) continue;
		if (
			ts.isVariableDeclaration(n) &&
			ts.isIdentifier(n.name) &&
			n.initializer &&
			(ts.isArrowFunction(n.initializer) ||
				ts.isFunctionExpression(n.initializer))
		) {
			return n.name.text;
		}
	}
	return "<dinh tep>";
}

export function tenGoi(node) {
	if (!ts.isCallExpression(node)) return null;
	const goi = node.expression;
	if (ts.isIdentifier(goi)) return goi.text;
	if (ts.isPropertyAccessExpression(goi)) return goi.name.text;
	return null;
}

export function chuoiDoiSo(node, i) {
	const doi = node.arguments?.[i];
	if (!doi) return null;
	if (ts.isStringLiteral(doi) || ts.isNoSubstitutionTemplateLiteral(doi)) {
		return doi.text;
	}
	return null;
}
