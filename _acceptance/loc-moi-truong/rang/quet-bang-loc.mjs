import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const GOC = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../..",
);
const BANG = "packages/db/src/fields-shape.ts";
const EXPORT_BANG = new Set([
	"LOC_THEO_KIEU",
	"cachLocTruong",
	"locDuocTheoKieu",
	"locDuocTrong",
	"CachLocTruong",
]);
const TEP = [
	{
		tep: "apps/api/src/fields/fields.service.ts",
		ham: [
			"filterableFieldsFor",
			"fieldFilters",
			"dieuKienLoc",
			"demGiaTriMenu",
		],
	},
	{ tep: "apps/app/components/crm/fields/field-facets.tsx", ham: null },
	{
		tep: "apps/app/components/crm/fields/field-editor.tsx",
		ham: ["filterable"],
	},
	{ tep: "packages/validation/src/bo-loc-truong.ts", ham: null },
];

function docFieldTypes() {
	const nguon = ts.createSourceFile(
		BANG,
		fs.readFileSync(path.join(GOC, BANG), "utf8"),
		ts.ScriptTarget.Latest,
		true,
	);
	let kieu = [];
	let bang = [];
	nguon.forEachChild(function di(nut) {
		if (ts.isVariableDeclaration(nut) && ts.isIdentifier(nut.name)) {
			let khoiTao = nut.initializer;
			while (
				khoiTao &&
				(ts.isAsExpression(khoiTao) || ts.isSatisfiesExpression(khoiTao))
			) {
				khoiTao = khoiTao.expression;
			}
			if (
				nut.name.text === "FIELD_TYPES" &&
				khoiTao &&
				ts.isArrayLiteralExpression(khoiTao)
			) {
				kieu = khoiTao.elements.filter(ts.isStringLiteral).map((e) => e.text);
			}
			if (
				nut.name.text === "LOC_THEO_KIEU" &&
				khoiTao &&
				ts.isObjectLiteralExpression(khoiTao)
			) {
				bang = khoiTao.properties
					.filter(ts.isPropertyAssignment)
					.map((p) =>
						ts.isIdentifier(p.name) ? p.name.text : p.name.getText(),
					);
			}
		}
		ts.forEachChild(nut, di);
	});
	return { kieu, bang };
}

export function quet(goc = GOC, tep = TEP) {
	const { kieu, bang } = docFieldTypes();
	if (kieu.length === 0)
		throw new Error("lmt quet: khong doc duoc FIELD_TYPES");
	for (const k of kieu) {
		if (!bang.includes(k)) throw new Error(`lmt quet: bang thieu ${k}`);
	}
	const tenKieu = new Set(kieu);

	for (const { tep: duong, ham } of tep) {
		const day = path.join(goc, duong);
		if (!fs.existsSync(day)) throw new Error(`lmt quet: thieu tep ${duong}`);
		const nguon = ts.createSourceFile(
			duong,
			fs.readFileSync(day, "utf8"),
			ts.ScriptTarget.Latest,
			true,
		);

		let dungBang = false;
		const vung = [];
		nguon.forEachChild(function di(nut) {
			if (
				ts.isImportDeclaration(nut) &&
				ts.isStringLiteral(nut.moduleSpecifier)
			) {
				const tu = nut.moduleSpecifier.text;
				const tenNhap = nut.importClause?.namedBindings;
				if (
					(tu === "@crm/db/fields-shape" || tu === "@crm/db/fields") &&
					tenNhap &&
					ts.isNamedImports(tenNhap) &&
					tenNhap.elements.some((e) => EXPORT_BANG.has(e.name.text))
				) {
					dungBang = true;
				}
			}
			const ten =
				(ts.isMethodDeclaration(nut) || ts.isFunctionDeclaration(nut)) &&
				nut.name &&
				ts.isIdentifier(nut.name)
					? nut.name.text
					: ts.isVariableDeclaration(nut) && ts.isIdentifier(nut.name)
						? nut.name.text
						: null;
			if (
				ham === null ? nut === nguon.statements[0] : ten && ham.includes(ten)
			) {
				vung.push(ham === null ? nguon : nut);
			}
			ts.forEachChild(nut, di);
		});
		if (!dungBang) throw new Error(`lmt quet: khong dung bang chung ${duong}`);

		for (const goc2 of vung) {
			(function soi(nut) {
				if (
					ts.isBinaryExpression(nut) &&
					[
						ts.SyntaxKind.EqualsEqualsEqualsToken,
						ts.SyntaxKind.ExclamationEqualsEqualsToken,
					].includes(nut.operatorToken.kind)
				) {
					for (const ve of [nut.left, nut.right]) {
						if (ts.isStringLiteral(ve) && tenKieu.has(ve.text)) {
							const { line } = nguon.getLineAndCharacterOfPosition(
								nut.getStart(),
							);
							throw new Error(`lmt quet: loc tu khai ${duong}:${line + 1}`);
						}
					}
				}
				if (ts.isArrayLiteralExpression(nut)) {
					const chu = nut.elements
						.filter(ts.isStringLiteral)
						.map((e) => e.text);
					if (chu.length >= 2 && chu.every((c) => tenKieu.has(c))) {
						const { line } = nguon.getLineAndCharacterOfPosition(
							nut.getStart(),
						);
						throw new Error(`lmt quet: loc tu khai ${duong}:${line + 1}`);
					}
				}
				ts.forEachChild(nut, soi);
			})(goc2);
		}
	}
	return tep.length;
}

function phaThu() {
	const tam = fs.mkdtempSync(path.join(os.tmpdir(), "lmt-quet-"));
	try {
		const duong = "apps/app/components/crm/fields/field-editor.tsx";
		fs.mkdirSync(path.join(tam, path.dirname(duong)), { recursive: true });
		const chu = fs
			.readFileSync(path.join(GOC, duong), "utf8")
			.replace(
				/const filterable = [^;]+;/,
				'const filterable = draft.type === "SELECT";',
			);
		fs.writeFileSync(path.join(tam, duong), chu);
		try {
			quet(tam, [{ tep: duong, ham: ["filterable"] }]);
		} catch (error) {
			if (String(error.message).startsWith("lmt quet: loc tu khai")) return;
			throw error;
		}
		throw new Error("lmt quet: thuoc mu");
	} finally {
		fs.rmSync(tam, { recursive: true, force: true });
	}
}

phaThu();
const n = quet();
console.log(`lmt quet: dat ${n} tep`);
