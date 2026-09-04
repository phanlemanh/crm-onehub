import { readFileSync } from "node:fs";
import { dirname } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { GOC, lat } from "./lat.mjs";

const ts = createRequire(import.meta.url)("typescript");
const HERE = dirname(fileURLToPath(import.meta.url));
const KHAI = JSON.parse(readFileSync(`${HERE}/khong-phai-chu-nguoi-doc.json`, "utf8"));

const DAU =
	/[ăâđêôơưĂÂĐÊÔƠƯáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵÁÀẢÃẠẮẰẲẴẶẤẦẨẪẬÉÈẺẼẸẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌỐỒỔỖỘỚỜỞỠỢÚÙỦŨỤỨỪỬỮỰÝỲỶỸỴ]/;

const THUOC_KY_THUAT = new Set(KHAI.thuoc_ky_thuat);
const HAM_KY_THUAT = new Set(KHAI.ham_ky_thuat);
const GIU_NGUYEN = new Map(KHAI.giu_nguyen.map((g) => [g.chu, g]));

function cay(duong) {
	return ts.createSourceFile(
		duong,
		readFileSync(`${GOC}/${duong}`, "utf8"),
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
}

function chuNguoiCoTheDoc(chu) {
	if (chu.trim().length < 2) return false;
	if (chu.startsWith("/")) return false;
	if (!/[A-Za-z]{2}/.test(chu)) return false;
	if (/^[a-z0-9-]+(\/[a-z0-9._-]+)+$/.test(chu)) return false;
	if (/^[a-z][a-zA-Z0-9]*$/.test(chu)) return false;
	if (/^[a-z0-9-]+$/.test(chu)) return false;
	if (/^[A-Z][A-Z0-9_]*$/.test(chu)) return false;
	return true;
}

function boiCanh(n) {
	if (
		n.parent &&
		ts.isExpressionStatement(n.parent) &&
		n.parent.parent &&
		ts.isSourceFile(n.parent.parent)
	)
		return "chi-thi";

	let cha = n.parent;
	while (cha) {
		if (ts.isImportDeclaration(cha) || ts.isExportDeclaration(cha)) return "nhap";
		if (ts.isJsxAttribute(cha) && ts.isIdentifier(cha.name))
			return THUOC_KY_THUAT.has(cha.name.text) ? "thuoc-ky-thuat" : `thuoc:${cha.name.text}`;
		if (
			ts.isPropertyAssignment(cha) &&
			ts.isIdentifier(cha.name) &&
			THUOC_KY_THUAT.has(cha.name.text)
		)
			return "khoa-ky-thuat";
		if (
			ts.isCallExpression(cha) &&
			ts.isIdentifier(cha.expression) &&
			HAM_KY_THUAT.has(cha.expression.text)
		)
			return "ham-ky-thuat";
		if (ts.isJsxText(cha)) return "chu-con";
		cha = cha.parent;
	}
	return "khac";
}

export function quet(files) {
	const ra = [];
	for (const f of files) {
		const nguon = cay(f);
		const di = (n) => {
			let chu = null;
			if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) chu = n.text;
			else if (ts.isJsxText(n)) chu = n.text;
			else if (ts.isTemplateExpression(n))
				chu =
					n.head.text +
					n.templateSpans.map((s) => `\${…}${s.literal.text}`).join("");

			if (chu !== null && chuNguoiCoTheDoc(chu)) {
				const bc = boiCanh(n);
				if (!["nhap", "chi-thi", "thuoc-ky-thuat", "khoa-ky-thuat", "ham-ky-thuat"].includes(bc))
					ra.push({
						file: f,
						dong: nguon.getLineAndCharacterOfPosition(n.getStart(nguon)).line + 1,
						boi_canh: bc,
						chu: chu.replace(/\s+/g, " ").trim(),
					});
			}
			ts.forEachChild(n, di);
		};
		ts.forEachChild(nguon, di);
	}
	return ra;
}

const L = lat();

if (L.soTuDia === 0) {
	console.log("KHONG DO DUOC: lat sinh ra 0 file — tap rong khong bao gio la dat");
	process.exit(2);
}

const tatCa = quet(L.file);

if (tatCa.length === 0) {
	console.log(
		"KHONG DO DUOC: quet 10 file ma khong thay chuoi nao — bo quet hong, khong phai lat sach",
	);
	process.exit(2);
}

const dungToi = new Set();
const con = [];

for (const c of tatCa) {
	const g = GIU_NGUYEN.get(c.chu);
	if (g) {
		dungToi.add(c.chu);
		continue;
	}
	if (/[A-Za-z]/.test(c.chu) && !DAU.test(c.chu)) con.push(c);
}

const chet = KHAI.giu_nguyen.filter((g) => !dungToi.has(g.chu));

for (const c of con)
	console.log(
		`CON TIENG ANH: ${c.file}:${c.dong} [${c.boi_canh}] ${JSON.stringify(c.chu)}`,
	);

for (const g of chet)
	console.log(
		`GIU NGUYEN CHET: ${JSON.stringify(g.chu)} (${g.vi_sao}) khong con doi tuong that — go no khoi ban khai`,
	);

console.log(
	`\nquet ${L.file.length} file · ${tatCa.length} chuoi nguoi co the doc · tru ${dungToi.size}/${KHAI.giu_nguyen.length} dong giu nguyen co ten`,
);

if (con.length > 0 || chet.length > 0) {
	if (con.length > 0) console.log(`\nDO: ${con.length} chuoi con la tieng Anh.`);
	if (chet.length > 0) console.log(`DO: ${chet.length} dong giu nguyen khong con doi tuong that.`);
	process.exit(1);
}

console.log("XANH: khong chuoi nguoi doc thay nao con la tieng Anh.");
