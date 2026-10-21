import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const ts = createRequire(join(GOC, "apps", "app", "package.json"))(
	"typescript",
);

const MAN = [
	"apps/app/components/crm/record-sheet/deal-sheet.tsx",
	"apps/app/components/crm/record-sheet/company-sheet.tsx",
	"apps/app/components/crm/record-sheet/contact-sheet.tsx",
	"apps/app/app/(app)/[slug]/deals/deals-table.tsx",
	"apps/app/app/(app)/[slug]/companies/companies-table.tsx",
	"apps/app/app/(app)/[slug]/contacts/contacts-table.tsx",
	"apps/app/components/crm/fields/record-fields.tsx",
	"apps/app/components/crm/fields/field-columns.tsx",
];
const BANG = "apps/app/components/crm/fields/kieu-truong.tsx";
const DOC_NHAP = "apps/app/components/crm/fields/doc-nhap.ts";
const KIEU_DB = "packages/db/src/fields-shape.ts";

const TEN_CAM = new Set([
	"InlineField",
	"InlineDateField",
	"InlineSelectField",
	"InlineMoneyField",
	"InlineTextArea",
	"formatMoney",
	"formatDay",
	"LocalDay",
	"OwnerCell",
	"SoDienThoai",
]);

const NGOAI_TRU = [
	{
		tep: "apps/app/components/crm/record-sheet/deal-sheet.tsx",
		ten: "formatMoney",
		lyDo: "ReportedValue: giá trị quy đổi sang tiền báo cáo, không phải một trường",
	},
];

const MAT = ["hienThi", "suaTaiCho", "oBang"];

const DAP_AN_CHUAN = {
	"apps/app/components/crm/record-sheet/deal-sheet.tsx": [
		"name",
		"amount",
		"currency",
		"expectedCloseDate",
		"owner",
		"description",
	],
	"apps/app/components/crm/record-sheet/company-sheet.tsx": [
		"name",
		"domain",
		"website",
		"phone",
		"email",
		"city",
		"country",
		"owner",
	],
	"apps/app/components/crm/record-sheet/contact-sheet.tsx": [
		"firstName",
		"lastName",
		"title",
		"email",
		"phone",
		"linkedin",
		"x",
		"github",
		"owner",
	],
};

function cay(tep, chu) {
	return ts.createSourceFile(
		tep,
		chu,
		ts.ScriptTarget.Latest,
		true,
		tep.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);
}

function di(nut, lam) {
	lam(nut);
	ts.forEachChild(nut, (con) => di(con, lam));
}

function dong(goc, nut) {
	return goc.getLineAndCharacterOfPosition(nut.getStart()).line + 1;
}

function kieuTruong() {
	const goc = cay(KIEU_DB, readFileSync(join(GOC, KIEU_DB), "utf8"));
	let ra = null;
	di(goc, (nut) => {
		if (
			ts.isVariableDeclaration(nut) &&
			ts.isIdentifier(nut.name) &&
			nut.name.text === "FIELD_TYPES"
		) {
			let mang = nut.initializer;
			while (mang && ts.isAsExpression(mang)) mang = mang.expression;
			if (mang && ts.isArrayLiteralExpression(mang)) {
				ra = mang.elements.filter(ts.isStringLiteral).map((e) => e.text);
			}
		}
	});
	if (!ra || ra.length === 0) throw new Error("tmc quet: khong doc duoc FIELD_TYPES");
	return [...ra, "MONEY"];
}

function quetMan(tep, chu, kieu) {
	const goc = cay(tep, chu);
	const viPham = [];
	const daKhop = new Set();
	const laKieu = (n) => n && ts.isStringLiteralLike(n) && kieu.includes(n.text);
	di(goc, (nut) => {
		if (
			ts.isBinaryExpression(nut) &&
			[
				ts.SyntaxKind.EqualsEqualsEqualsToken,
				ts.SyntaxKind.ExclamationEqualsEqualsToken,
				ts.SyntaxKind.EqualsEqualsToken,
				ts.SyntaxKind.ExclamationEqualsToken,
			].includes(nut.operatorToken.kind) &&
			(laKieu(nut.left) || laKieu(nut.right))
		) {
			viPham.push(`tmc quet: re nhanh kieu ${tep}:${dong(goc, nut)}`);
		}
		if (ts.isCaseClause(nut) && laKieu(nut.expression)) {
			viPham.push(`tmc quet: re nhanh kieu ${tep}:${dong(goc, nut)}`);
		}
		let ten = null;
		if (
			(ts.isJsxOpeningElement(nut) || ts.isJsxSelfClosingElement(nut)) &&
			ts.isIdentifier(nut.tagName)
		) {
			ten = nut.tagName.text;
		}
		if (ts.isCallExpression(nut) && ts.isIdentifier(nut.expression)) {
			ten = nut.expression.text;
		}
		if (ten && TEN_CAM.has(ten)) {
			const nt = NGOAI_TRU.find((n) => n.tep === tep && n.ten === ten);
			if (nt) daKhop.add(nt);
			else viPham.push(`tmc quet: o tu ve ${ten} ${tep}:${dong(goc, nut)}`);
		}
	});
	return { goc, viPham, daKhop };
}

function khoaChuan(goc) {
	const khoa = new Set();
	let coHam = false;
	di(goc, (nut) => {
		if (
			ts.isFunctionDeclaration(nut) &&
			nut.name &&
			/^truongChuan/.test(nut.name.text)
		) {
			coHam = true;
			const phu = new Set();
			di(nut, (con) => {
				if (
					ts.isVariableDeclaration(con) &&
					ts.isIdentifier(con.name) &&
					con.initializer &&
					ts.isArrowFunction(con.initializer)
				) {
					phu.add(con.name.text);
				}
			});
			di(nut, (con) => {
				if (
					ts.isPropertyAssignment(con) &&
					ts.isIdentifier(con.name) &&
					con.name.text === "khoa" &&
					ts.isStringLiteralLike(con.initializer)
				) {
					khoa.add(con.initializer.text);
				}
				if (
					ts.isCallExpression(con) &&
					ts.isIdentifier(con.expression) &&
					phu.has(con.expression.text) &&
					con.arguments[0] &&
					ts.isStringLiteralLike(con.arguments[0])
				) {
					khoa.add(con.arguments[0].text);
				}
			});
		}
	});
	return { coHam, khoa };
}

function quetBang(kieu) {
	const goc = cay(BANG, readFileSync(join(GOC, BANG), "utf8"));
	let bang = null;
	di(goc, (nut) => {
		if (
			ts.isVariableDeclaration(nut) &&
			ts.isIdentifier(nut.name) &&
			nut.name.text === "KIEU_TRUONG"
		) {
			let o = nut.initializer;
			while (o && (ts.isAsExpression(o) || ts.isSatisfiesExpression(o)))
				o = o.expression;
			if (o && ts.isObjectLiteralExpression(o)) bang = o;
		}
	});
	if (!bang) throw new Error("tmc quet: bang thieu KIEU_TRUONG");
	const dong = new Map();
	for (const p of bang.properties) {
		if (!ts.isPropertyAssignment(p) || !ts.isObjectLiteralExpression(p.initializer))
			continue;
		const ten = ts.isIdentifier(p.name) || ts.isStringLiteral(p.name) ? p.name.text : "";
		const mat = p.initializer.properties
			.map((q) => (q.name && ts.isIdentifier(q.name) ? q.name.text : ""))
			.filter(Boolean);
		dong.set(ten, new Set(mat));
	}
	for (const k of kieu) {
		const mat = dong.get(k);
		for (const m of MAT) {
			if (!mat || !mat.has(m)) throw new Error(`tmc quet: bang thieu ${k} ${m}`);
		}
	}
}

function chay() {
	for (const tep of [...MAN, BANG, DOC_NHAP]) {
		if (!existsSync(join(GOC, tep))) throw new Error(`tmc quet: thieu tep ${tep}`);
	}
	const kieu = kieuTruong();
	let daQuet = 0;
	const tatCa = [];
	const khop = new Set();
	for (const tep of MAN) {
		const chu = readFileSync(join(GOC, tep), "utf8");
		const { goc, viPham, daKhop } = quetMan(tep, chu, kieu);
		tatCa.push(...viPham);
		for (const n of daKhop) khop.add(n);
		const mong = DAP_AN_CHUAN[tep];
		if (mong) {
			const { coHam, khoa } = khoaChuan(goc);
			const quaBang =
				/\bOTruongPhieu\b/.test(chu) && (chu.match(/\btruongChuan\w+\(/g) ?? []).length >= 2;
			for (const k of mong) {
				if (!coHam || !quaBang || !khoa.has(k)) {
					throw new Error(`tmc quet: truong chuan khong qua bang ${tep} ${k}`);
				}
			}
			for (const k of khoa) {
				if (!mong.includes(k)) {
					throw new Error(`tmc quet: truong chuan khong qua bang ${tep} ${k}`);
				}
			}
		}
		daQuet += 1;
	}
	quetBang(kieu);
	daQuet += 2;
	if (tatCa[0]) throw new Error(tatCa[0]);
	for (const n of NGOAI_TRU) {
		if (!khop.has(n)) throw new Error(`tmc quet: ngoai tru chet ${n.ten}`);
	}
	if (daQuet !== 10) throw new Error(`tmc quet: thieu tep ${daQuet}`);

	const mau = readFileSync(join(GOC, MAN[0]), "utf8");
	const pha = `${mau}\nfunction __thuocMu(field: { type: string }) {\n\tif (field.type === "NUMBER") return null;\n\treturn <InlineField label="x" value={null} onSave={() => {}} />;\n}\n`;
	const thu = quetMan(MAN[0], pha, kieu).viPham;
	const coO = thu.some((v) => v.startsWith("tmc quet: o tu ve InlineField"));
	const coRe = thu.some((v) => v.startsWith("tmc quet: re nhanh kieu"));
	if (thu.length !== 2 || !coO || !coRe) throw new Error("tmc quet: thuoc mu");

	return daQuet;
}

try {
	const n = chay();
	console.log(`tmc quet: dat — ${n} tep, ${NGOAI_TRU.length} ngoai tru co ten`);
} catch (loi) {
	console.error(loi instanceof Error ? loi.message : String(loi));
	process.exit(1);
}
