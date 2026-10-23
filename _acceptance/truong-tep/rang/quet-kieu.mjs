import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const GOC = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../..",
);
const BANG_KIEU = "packages/db/src/fields-shape.ts";
const BANG_MAN = "apps/app/components/crm/fields/kieu-truong.tsx";
const THU_MUC = [
	"apps/api/src",
	"apps/app/components",
	"apps/app/lib",
	"apps/agent/agent",
	"packages/db/src",
	"packages/validation/src",
];
const BO_QUA = new Set(["node_modules", "generated"]);
const KIEU_RIENG_TRUONG = new Set(["CHECKBOX", "LONG_TEXT", "SELECT"]);
const TEN_KIEU_BANG = new Set(["FieldTypeName", "KieuTruong", "FieldType"]);
const MAT_FORM_TAO = new Set(["formTao", "oFormTao", "nhapLucTao"]);

function nguon(tep, chu) {
	return ts.createSourceFile(
		tep,
		chu,
		ts.ScriptTarget.Latest,
		true,
		tep.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);
}

function docFieldTypes() {
	const tep = path.join(GOC, BANG_KIEU);
	const src = nguon(tep, fs.readFileSync(tep, "utf8"));
	let kieu = null;
	const tham = (n) => {
		if (
			ts.isVariableDeclaration(n) &&
			n.name.getText() === "FIELD_TYPES" &&
			n.initializer
		) {
			let bieu = n.initializer;
			while (ts.isAsExpression(bieu) || ts.isSatisfiesExpression?.(bieu)) {
				bieu = bieu.expression;
			}
			if (ts.isArrayLiteralExpression(bieu)) {
				kieu = bieu.elements.filter(ts.isStringLiteral).map((e) => e.text);
			}
		}
		ts.forEachChild(n, tham);
	};
	tham(src);
	if (!kieu || kieu.length === 0) {
		throw new Error(`ttp quet: khong doc duoc FIELD_TYPES ${BANG_KIEU}`);
	}
	return new Set(kieu);
}

function* duyet(thuMuc) {
	if (!fs.existsSync(thuMuc)) return;
	for (const muc of fs.readdirSync(thuMuc, { withFileTypes: true })) {
		const duong = path.join(thuMuc, muc.name);
		if (muc.isDirectory()) {
			if (!BO_QUA.has(muc.name)) yield* duyet(duong);
		} else if (/\.(ts|tsx)$/.test(muc.name) && !/\.d\.ts$/.test(muc.name)) {
			yield duong;
		}
	}
}

const KIEU_CHUAN_THEM = new Set(["MONEY"]);
const BIEN_KIEU = /(^|\.)(kieu|type)$/i;

function laSwitchTheoKieu(nhanh, kieu, bieuThuc = "") {
	const trung = nhanh.filter((gia) => kieu.has(gia));
	if (trung.length >= 2 && trung.some((gia) => KIEU_RIENG_TRUONG.has(gia))) {
		return true;
	}
	return (
		BIEN_KIEU.test(bieuThuc.trim()) &&
		trung.length >= 2 &&
		nhanh.every((gia) => kieu.has(gia) || KIEU_CHUAN_THEM.has(gia))
	);
}

function laBangTheoKieu(nut) {
	if (!ts.isSatisfiesExpression?.(nut)) return false;
	const kieuBang = nut.type;
	if (!ts.isTypeReferenceNode(kieuBang)) return false;
	if (kieuBang.typeName.getText() !== "Record") return false;
	const khoa = kieuBang.typeArguments?.[0];
	return Boolean(khoa && TEN_KIEU_BANG.has(khoa.getText().trim()));
}

function doiTuongCua(bieu) {
	let nut = bieu;
	while (ts.isAsExpression(nut) || ts.isParenthesizedExpression(nut)) {
		nut = nut.expression;
	}
	return ts.isObjectLiteralExpression(nut) ? nut : null;
}

export function quetTep(tep, chu, kieu) {
	const src = nguon(tep, chu);
	const loi = [];
	let soSwitch = 0;
	let soBang = 0;
	const dong = (n) => src.getLineAndCharacterOfPosition(n.getStart()).line + 1;
	const tham = (n) => {
		if (ts.isSwitchStatement(n)) {
			const nhanh = [];
			let coMacDinh = false;
			for (const muc of n.caseBlock.clauses) {
				if (ts.isDefaultClause(muc)) coMacDinh = true;
				else if (ts.isStringLiteral(muc.expression))
					nhanh.push(muc.expression.text);
			}
			if (laSwitchTheoKieu(nhanh, kieu, n.expression.getText())) {
				soSwitch += 1;
				if (coMacDinh && !nhanh.includes("FILE")) {
					loi.push(`ttp quet: switch thieu FILE ${tep}:${dong(n)}`);
				}
			}
		}
		if (laBangTheoKieu(n)) {
			const doiTuong = doiTuongCua(n.expression);
			if (doiTuong) {
				soBang += 1;
				const khoa = new Set(
					doiTuong.properties
						.filter((p) => p.name)
						.map((p) => p.name.getText().replace(/^["']|["']$/g, "")),
				);
				if (!khoa.has("FILE")) {
					loi.push(`ttp quet: bang thieu FILE ${tep}:${dong(n)}`);
				}
			}
		}
		ts.forEachChild(n, tham);
	};
	tham(src);
	return { loi, soSwitch, soBang };
}

function matFormTao(goc) {
	const tep = path.join(goc, BANG_MAN);
	if (!fs.existsSync(tep)) return { coMat: false, dongFile: null };
	const src = nguon(tep, fs.readFileSync(tep, "utf8"));
	let coMat = false;
	let dongFile = null;
	const tham = (n) => {
		if (ts.isTypeAliasDeclaration(n) && n.name.getText() === "DongKieu") {
			coMat = n.type
				.getChildren()
				.flatMap((c) => c.getChildren())
				.some(
					(c) =>
						ts.isPropertySignature(c) && MAT_FORM_TAO.has(c.name.getText()),
				);
		}
		if (
			ts.isVariableDeclaration(n) &&
			n.name.getText() === "KIEU_TRUONG" &&
			n.initializer
		) {
			let bieu = n.initializer;
			while (ts.isSatisfiesExpression?.(bieu) || ts.isAsExpression(bieu)) {
				bieu = bieu.expression;
			}
			const doiTuong = doiTuongCua(bieu);
			const file = doiTuong?.properties.find(
				(p) => p.name?.getText() === "FILE",
			);
			if (file && ts.isPropertyAssignment(file)) {
				const dongDoi = doiTuongCua(file.initializer);
				dongFile = dongDoi
					? dongDoi.properties.map((p) => p.name?.getText()).filter(Boolean)
					: [];
			}
		}
		ts.forEachChild(n, tham);
	};
	tham(src);
	return { coMat, dongFile };
}

function lietKe(goc, kieu) {
	for (const thuMuc of THU_MUC) {
		for (const tep of duyet(path.join(goc, thuMuc))) {
			const src = nguon(tep, fs.readFileSync(tep, "utf8"));
			const tham = (n) => {
				if (ts.isSwitchStatement(n)) {
					const nhanh = n.caseBlock.clauses
						.filter((c) => !ts.isDefaultClause(c))
						.map((c) => (ts.isStringLiteral(c.expression) ? c.expression.text : "?"));
					if (nhanh.some((g) => kieu.has(g))) {
						const coMacDinh = n.caseBlock.clauses.some(ts.isDefaultClause);
						const { line } = src.getLineAndCharacterOfPosition(n.getStart());
						console.log(
							`${path.relative(goc, tep)}:${line + 1}\t${laSwitchTheoKieu(nhanh, kieu, n.expression.getText()) ? "KIEU" : "-"}\tdefault=${coMacDinh}\t[${nhanh.join(",")}]`,
						);
					}
				}
				ts.forEachChild(n, tham);
			};
			tham(src);
		}
	}
}

function quet(goc, kieu) {
	const loi = [];
	let soSwitch = 0;
	let soBang = 0;
	for (const thuMuc of THU_MUC) {
		for (const tep of duyet(path.join(goc, thuMuc))) {
			const kq = quetTep(
				path.relative(goc, tep),
				fs.readFileSync(tep, "utf8"),
				kieu,
			);
			loi.push(...kq.loi);
			soSwitch += kq.soSwitch;
			soBang += kq.soBang;
		}
	}
	const form = matFormTao(goc);
	if (form.coMat && form.dongFile?.some((m) => MAT_FORM_TAO.has(m))) {
		loi.push("ttp quet: form tao co o Tep");
	}
	return { loi, soSwitch, soBang, form };
}

function thuocMu(kieu) {
	const tam = fs.mkdtempSync(path.join(os.tmpdir(), "ttp-quet-"));
	try {
		const tep = "packages/db/src/fields.ts";
		const goc = fs.readFileSync(path.join(GOC, tep), "utf8");
		const pha = goc.replace(
			/\t\tcase "FILE":\n\t\t\tthrow new FieldValueError\(definition\.key, FIELD_FILE_COPY\.chiNhanTep\);\n/,
			"",
		);
		if (pha === goc) return "ttp quet: thuoc mu (khong pha duoc ban chep)";
		const dich = path.join(tam, tep);
		fs.mkdirSync(path.dirname(dich), { recursive: true });
		fs.writeFileSync(dich, pha);
		const kq = quetTep(tep, pha, kieu);
		return kq.loi.some((l) => l.startsWith("ttp quet: switch thieu FILE packages/db/src/fields.ts:"))
			? null
			: "ttp quet: thuoc mu";
	} finally {
		fs.rmSync(tam, { recursive: true, force: true });
	}
}

const kieu = docFieldTypes();

if (process.argv.includes("--liet-ke")) {
	lietKe(GOC, kieu);
	process.exit(0);
}

if (!kieu.has("FILE")) {
	console.error("ttp quet: FIELD_TYPES chua co FILE");
	process.exit(1);
}

const { loi, soSwitch, soBang, form } = quet(GOC, kieu);
console.log(
	`ttp quet: ${soSwitch} switch theo kieu, ${soBang} bang theo kieu, mat form tao ${form.coMat ? "co" : "chua co"}`,
);
if (soSwitch === 0) loi.push("ttp quet: khong quet duoc");
const mu = thuocMu(kieu);
if (mu) loi.push(mu);

if (loi.length > 0) {
	for (const dong of loi) console.error(dong);
	process.exit(1);
}
console.log("ttp quet: dat");
