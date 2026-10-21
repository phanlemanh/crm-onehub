import {
	existsSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const ts = createRequire(join(GOC, "apps", "app", "package.json"))(
	"typescript",
);

const TEP_CU = "apps/app/components/crm/fields/standard-fields.ts";
const DOC_DANH_MUC = [
	"apps/app/components/crm/fields/fields-list.tsx",
	"apps/app/components/crm/record-sheet/deal-sheet.tsx",
	"apps/app/components/crm/record-sheet/company-sheet.tsx",
	"apps/app/components/crm/record-sheet/contact-sheet.tsx",
];
const MAY_CHU = "apps/api/src/fields";
const VUNG_QUET = ["apps/app", "apps/api/src"];

function tepTrong(thuMuc) {
	const ra = [];
	const di = (d) => {
		for (const ten of readdirSync(d)) {
			if (ten === "node_modules" || ten.startsWith(".") || ten === "generated")
				continue;
			const duong = join(d, ten);
			if (statSync(duong).isDirectory()) di(duong);
			else if (/\.(ts|tsx)$/.test(ten)) ra.push(duong);
		}
	};
	di(thuMuc);
	return ra;
}

function nhap(duong) {
	const nguon = ts.createSourceFile(
		duong,
		readFileSync(duong, "utf8"),
		ts.ScriptTarget.Latest,
		true,
	);
	const ds = [];
	for (const cau of nguon.statements) {
		if (
			ts.isImportDeclaration(cau) &&
			ts.isStringLiteral(cau.moduleSpecifier)
		) {
			const { line } = nguon.getLineAndCharacterOfPosition(cau.getStart());
			ds.push({ ten: cau.moduleSpecifier.text, dong: line + 1 });
		}
	}
	return ds;
}

const docDanhMuc = (ten) =>
	ten.endsWith("truong-chuan") || ten === "@crm/db/fields-chuan";

function quetNhapCu(duong) {
	for (const n of nhap(duong)) {
		if (n.ten.endsWith("standard-fields"))
			throw new Error(
				`tcc quet: con nhap standard-fields ${relative(GOC, duong)}:${n.dong}`,
			);
	}
}

if (existsSync(join(GOC, TEP_CU)))
	throw new Error("tcc quet: con standard-fields.ts");

for (const vung of VUNG_QUET) {
	for (const duong of tepTrong(join(GOC, vung))) quetNhapCu(duong);
}

for (const tep of DOC_DANH_MUC) {
	const duong = join(GOC, tep);
	if (!existsSync(duong)) throw new Error(`tcc quet: thieu tep ${tep}`);
	if (!nhap(duong).some((n) => docDanhMuc(n.ten)))
		throw new Error(`tcc quet: khong doc danh muc ${tep}`);
}

const mayChu = tepTrong(join(GOC, MAY_CHU));
if (!mayChu.some((d) => nhap(d).some((n) => n.ten === "@crm/db/fields-chuan")))
	throw new Error("tcc quet: may chu khong doc danh muc");

const tam = mkdtempSync(join(tmpdir(), "tcc-quet-"));
try {
	const ban = join(tam, "fields-list.tsx");
	writeFileSync(
		ban,
		`import { STANDARD_FIELDS } from "./standard-fields";\n${readFileSync(join(GOC, DOC_DANH_MUC[0]), "utf8")}`,
	);
	let bat = "";
	try {
		quetNhapCu(ban);
	} catch (loi) {
		bat = String(loi.message);
	}
	if (!bat.includes("tcc quet: con nhap standard-fields"))
		throw new Error("tcc quet: thuoc mu");
} finally {
	rmSync(tam, { recursive: true, force: true });
}

console.log("tcc quet: dat");
