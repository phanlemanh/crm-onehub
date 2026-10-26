import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const ts = createRequire(join(GOC, "apps", "app", "package.json"))(
	"typescript",
);

const KIEU_DB = "packages/db/src/fields-shape.ts";
const BANG_SAP = "SAP_THEO_KIEU";
const EXPORT = {
	app: {
		ten: "sapDuocTheoKieu",
		tep: "apps/app/components/crm/fields/field-columns.tsx",
	},
	api: { ten: "cachSapTruong", tep: "apps/api/src/fields/fields.service.ts" },
};
const HAM_SAP_API = ["sapTheoTruong", "banGhiTrong", "thuTuGiaTri"];
const BANG_TABLE = [
	"apps/app/app/(app)/[slug]/deals/deals-table.tsx",
	"apps/app/app/(app)/[slug]/companies/companies-table.tsx",
	"apps/app/app/(app)/[slug]/contacts/contacts-table.tsx",
];
const QUET = [
	EXPORT.app.tep,
	"apps/app/components/crm/fields/kieu-truong.tsx",
	...BANG_TABLE,
	EXPORT.api.tep,
];
const NGOAI_TRU_AN = [
	{
		tep: BANG_TABLE[0],
		id: "lastActivity",
		lyDo: "hoạt động gần nhất, không phải trường",
	},
	{
		tep: BANG_TABLE[1],
		id: "industry",
		lyDo: "Ngành không có dòng trong bảng trường chuẩn của DA14",
	},
	{ tep: BANG_TABLE[1], id: "contacts", lyDo: "số liên hệ, không phải trường" },
	{ tep: BANG_TABLE[1], id: "deals", lyDo: "số thoả thuận, không phải trường" },
	{
		tep: BANG_TABLE[1],
		id: "lastActivity",
		lyDo: "hoạt động gần nhất, không phải trường",
	},
	{
		tep: BANG_TABLE[2],
		id: "lastActivity",
		lyDo: "hoạt động gần nhất, không phải trường",
	},
];

function doc(tep, noiDung) {
	const duong = join(GOC, tep);
	if (noiDung === undefined && !existsSync(duong)) {
		throw new Error(`smt quet: thieu tep ${tep}`);
	}
	const chu = noiDung ?? readFileSync(duong, "utf8");
	return ts.createSourceFile(
		tep,
		chu,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
}

function di(nut, lam) {
	lam(nut);
	ts.forEachChild(nut, (con) => di(con, lam));
}

function dong(sf, nut) {
	return sf.getLineAndCharacterOfPosition(nut.getStart(sf)).line + 1;
}

function docKieuDb() {
	const sf = doc(KIEU_DB);
	const kieu = new Set();
	const thamChieu = new Map();
	di(sf, (nut) => {
		if (
			ts.isVariableDeclaration(nut) &&
			nut.name.getText(sf) === "FIELD_TYPES" &&
			nut.initializer
		) {
			di(nut.initializer, (n) => {
				if (ts.isStringLiteral(n)) kieu.add(n.text);
			});
		}
		if (ts.isFunctionDeclaration(nut) && nut.name) {
			let co = false;
			di(nut, (n) => {
				if (ts.isIdentifier(n) && n.text === BANG_SAP) co = true;
			});
			thamChieu.set(nut.name.text, co);
		}
	});
	if (kieu.size < 10)
		throw new Error(`smt quet: khong doc duoc FIELD_TYPES ${kieu.size}`);
	for (const phia of Object.values(EXPORT)) {
		if (thamChieu.get(phia.ten) !== true) {
			throw new Error(`smt quet: ${phia.ten} khong doc ${BANG_SAP}`);
		}
	}
	return kieu;
}

function quetSapTuKhai(tep, goc, kieu, sf) {
	di(goc, (nut) => {
		if (
			ts.isBinaryExpression(nut) &&
			[
				ts.SyntaxKind.EqualsEqualsEqualsToken,
				ts.SyntaxKind.ExclamationEqualsEqualsToken,
				ts.SyntaxKind.EqualsEqualsToken,
				ts.SyntaxKind.ExclamationEqualsToken,
			].includes(nut.operatorToken.kind) &&
			[nut.left, nut.right].some(
				(ve) => ts.isStringLiteral(ve) && ve.text === "CHECKBOX",
			)
		) {
			throw new Error(`smt quet: sap tu khai ${tep}:${dong(sf, nut)}`);
		}
		if (ts.isArrayLiteralExpression(nut)) {
			const chu = nut.elements.filter(
				(e) => ts.isStringLiteral(e) && kieu.has(e.text),
			);
			if (chu.length >= 2) {
				throw new Error(`smt quet: sap tu khai ${tep}:${dong(sf, nut)}`);
			}
		}
	});
}

function coImport(sf, ten) {
	let co = false;
	di(sf, (nut) => {
		if (
			ts.isImportDeclaration(nut) &&
			ts.isStringLiteral(nut.moduleSpecifier) &&
			nut.moduleSpecifier.text.startsWith("@crm/db/fields")
		) {
			di(nut, (n) => {
				if (ts.isImportSpecifier(n) && n.name.text === ten) co = true;
			});
		}
	});
	return co;
}

function quetAnTuKhai(tep, sf, conSong) {
	di(sf, (nut) => {
		if (!ts.isObjectLiteralExpression(nut)) return;
		let id = null;
		let anChu = null;
		for (const p of nut.properties) {
			if (!ts.isPropertyAssignment(p)) continue;
			const ten = p.name.getText(sf);
			if (ten === "id" && ts.isStringLiteral(p.initializer))
				id = p.initializer.text;
			if (ten === "hideBelow" && ts.isStringLiteral(p.initializer)) anChu = p;
		}
		if (!id || !anChu) return;
		const nt = NGOAI_TRU_AN.find((x) => x.tep === tep && x.id === id);
		if (!nt) throw new Error(`smt quet: an tu khai ${tep} ${id}`);
		conSong.add(`${tep}#${id}`);
	});
}

function quet(noiDungThay = {}) {
	const kieu = docKieuDb();
	const conSong = new Set();
	let soTep = 0;
	for (const tep of QUET) {
		const sf = doc(tep, noiDungThay[tep]);
		soTep += 1;
		if (tep === EXPORT.api.tep) {
			let soHam = 0;
			di(sf, (nut) => {
				if (
					(ts.isMethodDeclaration(nut) || ts.isFunctionDeclaration(nut)) &&
					nut.name &&
					HAM_SAP_API.includes(nut.name.getText(sf))
				) {
					soHam += 1;
					quetSapTuKhai(tep, nut, kieu, sf);
				}
			});
			if (soHam !== HAM_SAP_API.length) {
				throw new Error(`smt quet: thieu ham sap ${soHam}`);
			}
		} else {
			quetSapTuKhai(tep, sf, kieu, sf);
		}
		if (BANG_TABLE.includes(tep)) quetAnTuKhai(tep, sf, conSong);
	}
	for (const [phia, { ten, tep }] of Object.entries(EXPORT)) {
		if (!coImport(doc(tep, noiDungThay[tep]), ten)) {
			throw new Error(`smt quet: khong dung bang chung ${phia}`);
		}
	}
	for (const nt of NGOAI_TRU_AN) {
		if (!conSong.has(`${nt.tep}#${nt.id}`)) {
			throw new Error(`smt quet: ngoai tru chet ${nt.id}`);
		}
	}
	if (soTep !== QUET.length) throw new Error(`smt quet: thieu tep ${soTep}`);
	return soTep;
}

function cap() {
	const tep = EXPORT.app.tep;
	const goc = readFileSync(join(GOC, tep), "utf8");
	const sua = goc.replace(
		"sortable: sapDuocTheoKieu(field.type),",
		'sortable: field.type !== "CHECKBOX",',
	);
	if (sua === goc) throw new Error("smt quet: thuoc mu");
	const tam = mkdtempSync(join(tmpdir(), "smt-quet-"));
	writeFileSync(join(tam, "field-columns.tsx"), sua);
	try {
		quet({ [tep]: readFileSync(join(tam, "field-columns.tsx"), "utf8") });
	} catch (loi) {
		if (String(loi.message).startsWith("smt quet: sap tu khai")) return;
		throw new Error(`smt quet: thuoc mu ${loi.message}`);
	}
	throw new Error("smt quet: thuoc mu");
}

cap();
const n = quet();
console.log(`smt quet: dat ${n} tep`);
