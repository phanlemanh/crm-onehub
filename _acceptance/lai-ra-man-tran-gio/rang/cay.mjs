import { createRequire } from "node:module";

const ts = createRequire(import.meta.url)("typescript");

function docCay(nguon) {
	return ts.createSourceFile(
		"spec.tsx",
		nguon,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
}

function loiGoiTest(sf) {
	const ra = [];
	const di = (n) => {
		if (
			ts.isCallExpression(n) &&
			ts.isIdentifier(n.expression) &&
			n.expression.text === "test" &&
			n.arguments[0] &&
			ts.isStringLiteral(n.arguments[0])
		)
			ra.push(n);
		ts.forEachChild(n, di);
	};
	di(sf);
	return ra;
}

export function soi(nguon) {
	const sf = docCay(nguon);
	const ca = loiGoiTest(sf).map((n) => ({
		ten: n.arguments[0].text,
		thuBa: n.arguments[2]?.getText(sf) ?? null,
	}));
	let tran = null;
	for (const cau of sf.statements) {
		if (!ts.isVariableStatement(cau)) continue;
		for (const k of cau.declarationList.declarations) {
			if (
				ts.isIdentifier(k.name) &&
				k.name.text === "TRAN_LAI_MS" &&
				k.initializer &&
				ts.isNumericLiteral(k.initializer)
			)
				tran = Number(k.initializer.text.replace(/_/g, ""));
		}
	}
	return { ca, tran };
}

export function doiThamSoBa(nguon, tenCa, moi) {
	const sf = docCay(nguon);
	const trung = loiGoiTest(sf).filter((n) => n.arguments[0].text === tenCa);
	if (trung.length !== 1 || !trung[0].arguments[2]) return null;
	const [, hai, ba] = trung[0].arguments;
	if (moi === null) return `${nguon.slice(0, hai.end)}${nguon.slice(ba.end)}`;
	return `${nguon.slice(0, ba.getStart(sf))}${moi}${nguon.slice(ba.end)}`;
}
