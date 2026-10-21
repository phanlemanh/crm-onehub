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
const DICH_VU = "apps/api/src/fields/fields.service.ts";
const SUA_TRUONG = "apps/app/components/crm/fields/field-editor.tsx";
const TEP = [
	{
		tep: DICH_VU,
		ham: [
			"filterableFieldsFor",
			"fieldFilters",
			"dieuKienLoc",
			"demGiaTriMenu",
			"filterFacetCounts",
			"coGiaTriCua",
			"phanTich",
		],
	},
	{ tep: "apps/app/components/crm/fields/field-facets.tsx", ham: null },
	{ tep: SUA_TRUONG, ham: ["filterable"] },
	{ tep: "packages/validation/src/bo-loc-truong.ts", ham: null },
];

const DANG = [
	{ ten: "so-sanh", bieu: (v) => `${v} === "SELECT"` },
	{
		ten: "case",
		bieu: (v) =>
			`(() => { switch (${v}) { case "SELECT": return true; default: return false; } })()`,
	},
	{ ten: "set-mot", bieu: (v) => `new Set(["SELECT"]).has(${v})` },
	{
		ten: "doi-tuong",
		bieu: (v) =>
			`(({ SELECT: true, USER: true }) as Record<string, boolean>)[${v}] === true`,
	},
	{ ten: "includes", bieu: (v) => `["SELECT"].includes(${v})` },
];
const CHO = [
	{
		tep: SUA_TRUONG,
		ham: ["filterable"],
		thay: (chu, bieu) =>
			chu.replace(
				/const filterable = [^;]+;/,
				`const filterable = ${bieu("draft.type")};`,
			),
	},
	{
		tep: DICH_VU,
		ham: ["filterFacetCounts"],
		thay: (chu, bieu) =>
			chu.replace(
				'cachLocTruong(definition.type) === "luaChon"',
				bieu("definition.type"),
			),
	},
];

function docKhoi(duong, ten) {
	const nguon = ts.createSourceFile(
		duong,
		fs.readFileSync(path.join(GOC, duong), "utf8"),
		ts.ScriptTarget.Latest,
		true,
	);
	let gia = null;
	nguon.forEachChild(function di(nut) {
		if (
			ts.isVariableDeclaration(nut) &&
			ts.isIdentifier(nut.name) &&
			nut.name.text === ten
		) {
			let khoiTao = nut.initializer;
			while (
				khoiTao &&
				(ts.isAsExpression(khoiTao) || ts.isSatisfiesExpression(khoiTao))
			) {
				khoiTao = khoiTao.expression;
			}
			gia = khoiTao ?? null;
		}
		ts.forEachChild(nut, di);
	});
	return gia;
}

function docFieldTypes() {
	const mang = docKhoi(BANG, "FIELD_TYPES");
	const bang = docKhoi(BANG, "LOC_THEO_KIEU");
	const kieu =
		mang && ts.isArrayLiteralExpression(mang)
			? mang.elements.filter(ts.isStringLiteral).map((e) => e.text)
			: [];
	const dong =
		bang && ts.isObjectLiteralExpression(bang)
			? bang.properties
					.filter(ts.isPropertyAssignment)
					.map((p) =>
						ts.isIdentifier(p.name) ? p.name.text : p.name.getText(),
					)
			: [];
	return { kieu, dong };
}

function tenCua(nut) {
	if (
		(ts.isMethodDeclaration(nut) || ts.isFunctionDeclaration(nut)) &&
		nut.name &&
		ts.isIdentifier(nut.name)
	)
		return nut.name.text;
	if (ts.isVariableDeclaration(nut) && ts.isIdentifier(nut.name))
		return nut.name.text;
	return null;
}

function laTenKieu(nut, tenKieu) {
	return ts.isStringLiteral(nut) && tenKieu.has(nut.text);
}

function tuKhai(nut, tenKieu) {
	if (
		ts.isBinaryExpression(nut) &&
		[
			ts.SyntaxKind.EqualsEqualsEqualsToken,
			ts.SyntaxKind.ExclamationEqualsEqualsToken,
			ts.SyntaxKind.EqualsEqualsToken,
			ts.SyntaxKind.ExclamationEqualsToken,
		].includes(nut.operatorToken.kind) &&
		(laTenKieu(nut.left, tenKieu) || laTenKieu(nut.right, tenKieu))
	)
		return true;
	if (ts.isCaseClause(nut) && laTenKieu(nut.expression, tenKieu)) return true;
	if (
		ts.isArrayLiteralExpression(nut) &&
		nut.elements.some((e) => laTenKieu(e, tenKieu))
	)
		return true;
	if (ts.isObjectLiteralExpression(nut)) {
		const khoa = nut.properties.filter(
			(p) =>
				ts.isPropertyAssignment(p) &&
				((ts.isIdentifier(p.name) && tenKieu.has(p.name.text)) ||
					laTenKieu(p.name, tenKieu)),
		);
		if (khoa.length >= 2) return true;
	}
	if (
		ts.isCallExpression(nut) &&
		nut.arguments.some((a) => laTenKieu(a, tenKieu))
	)
		return true;
	return false;
}

export function quet(goc = GOC, tep = TEP) {
	const { kieu, dong } = docFieldTypes();
	if (kieu.length === 0)
		throw new Error("lmt quet: khong doc duoc FIELD_TYPES");
	for (const k of kieu) {
		if (!dong.includes(k)) throw new Error(`lmt quet: bang thieu ${k}`);
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
		const thay = new Set();
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
			const ten = tenCua(nut);
			if (ham !== null && ten && ham.includes(ten)) {
				vung.push(nut);
				thay.add(ten);
			}
			ts.forEachChild(nut, di);
		});
		if (ham === null) vung.push(nguon);
		else {
			for (const h of ham) {
				if (!thay.has(h)) throw new Error(`lmt quet: thieu ham ${duong} ${h}`);
			}
		}
		if (!dungBang) throw new Error(`lmt quet: khong dung bang chung ${duong}`);

		for (const goc2 of vung) {
			(function soi(nut) {
				if (tuKhai(nut, tenKieu)) {
					const { line } = nguon.getLineAndCharacterOfPosition(nut.getStart());
					throw new Error(`lmt quet: loc tu khai ${duong}:${line + 1}`);
				}
				ts.forEachChild(nut, soi);
			})(goc2);
		}
	}
	return tep.length;
}

function phaThu() {
	let soO = 0;
	for (const cho of CHO) {
		for (const dang of DANG) {
			const tam = fs.mkdtempSync(path.join(os.tmpdir(), "lmt-quet-"));
			try {
				fs.mkdirSync(path.join(tam, path.dirname(cho.tep)), {
					recursive: true,
				});
				const goc = fs.readFileSync(path.join(GOC, cho.tep), "utf8");
				const chu = cho.thay(goc, dang.bieu);
				if (chu === goc) {
					throw new Error(
						`lmt quet: pha thu khong chen duoc ${cho.tep} ${dang.ten}`,
					);
				}
				fs.writeFileSync(path.join(tam, cho.tep), chu);
				let bat = false;
				try {
					quet(tam, [{ tep: cho.tep, ham: cho.ham }]);
				} catch (error) {
					if (!String(error.message).startsWith("lmt quet: loc tu khai"))
						throw error;
					bat = true;
				}
				if (!bat) throw new Error(`lmt quet: thuoc mu ${cho.tep} ${dang.ten}`);
				soO += 1;
			} finally {
				fs.rmSync(tam, { recursive: true, force: true });
			}
		}
	}
	if (soO !== CHO.length * DANG.length || soO !== 10) {
		throw new Error(`lmt quet: thieu o pha thu ${soO}`);
	}
	return soO;
}

const n = quet();
const nPha = phaThu();
console.log(`lmt quet: dat ${n} tep, pha thu ${nPha} o`);
