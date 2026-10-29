#!/usr/bin/env bun
/**
 * E9 (AC-6) — chỉ một đường cập nhật KR trong apps/app, quét bằng TypeScript type checker.
 *
 *   bun _acceptance/cua-toi-chi-liet-kr/rang/mot-duong.mjs
 *
 * Quét mọi tệp .ts/.tsx của chương trình apps/app (tsconfig của nó), trừ test/** và app/proto/**:
 *  (1) không JSX hay import để render BangCapNhat hoặc CapNhatTuan ngoài tệp định nghĩa
 *      okr/cap-nhat-tuan/cap-nhat-tuan.tsx;
 *  (2) không object nào mang đầu vào của okr.moCapNhat (kiểu ngữ cảnh có `entry` đúng tập LOI_VAO)
 *      mà `entry` giải qua type checker ra "nhac", "viec-cua-toi" hay "cua-toi"; `entry` không giải
 *      được thành literal là vi phạm. Tệp định nghĩa của (1) được miễn — mã đã thôi dùng, giữ lại cho
 *      hồ sơ đã ký (design doc mục 7);
 *  (3) không tệp nào đọc SEARCH_PARAM.okr.tu;
 *  (4) ngăn KR (kr-sheet.tsx) và bảng của bộ (theo-don-vi/bang.tsx — nơi dòng KR của bộ nhận nút
 *      «Cập nhật») gọi useCapNhatKr(), truyền `.mo` và dựng `.hop`; và cap-nhat-kr.tsx mở lượt với
 *      entry đúng "sheet".
 * Rồi mỗi luật một đối chứng: cài một bản phá vào bộ nhớ (CompilerHost đọc nội dung thay thế, cây thật
 * không bị ghi), quét lại, phải ra đúng vi phạm có thông điệp ghim.
 * Mã thoát: 0 «DUNG AC-6: 4/4» và 4 đối chứng đỏ đúng · 1 có vi phạm hay đối chứng sai · 2 không đo được.
 */
import { readFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const APP = join(GOC, "apps", "app");
const OKR = join(APP, "app", "(app)", "[slug]", "okr");
const TEP_BANG = join(OKR, "cap-nhat-tuan", "cap-nhat-tuan.tsx");
const TEP_MO = join(OKR, "cap-nhat-kr.tsx");
const TEP_DUNG_HOP = [
	join(APP, "components", "crm", "record-sheet", "kr-sheet.tsx"),
	join(OKR, "theo-don-vi", "bang.tsx"),
];
const TEN_BANG = new Set(["BangCapNhat", "CapNhatTuan"]);
const LOI_VAO = ["nhac", "viec-cua-toi", "tab", "sheet", "cua-toi"];
const CAM = new Set(["nhac", "viec-cua-toi", "cua-toi"]);

function khongDo(ly) {
	console.log(`KHONG DO DUOC: ${ly}`);
	process.exit(2);
}

function dungChuongTrinh(thay, them) {
	const cfg = ts.readConfigFile(join(APP, "tsconfig.json"), ts.sys.readFile);
	if (cfg.error) khongDo("khong doc duoc apps/app/tsconfig.json");
	const p = ts.parseJsonConfigFileContent(cfg.config, ts.sys, APP);
	const host = ts.createCompilerHost(p.options, true);
	const docGoc = host.readFile.bind(host);
	const coGoc = host.fileExists.bind(host);
	const layGoc = host.getSourceFile.bind(host);
	host.readFile = (f) => thay.get(resolve(f)) ?? docGoc(f);
	host.fileExists = (f) => thay.has(resolve(f)) || coGoc(f);
	host.getSourceFile = (f, ngon, ...con) => {
		const noi = thay.get(resolve(f));
		return noi === undefined
			? layGoc(f, ngon, ...con)
			: ts.createSourceFile(f, noi, ngon, true);
	};
	return ts.createProgram({
		rootNames: [...p.fileNames, ...them],
		options: p.options,
		host,
	});
}

const trongQuet = (f) => {
	const r = resolve(f);
	if (!r.startsWith(APP + sep) || r.includes(`${sep}node_modules${sep}`))
		return false;
	const rel = relative(APP, r);
	return (
		/\.tsx?$/.test(rel) &&
		!rel.endsWith(".d.ts") &&
		!rel.startsWith(`test${sep}`) &&
		!rel.startsWith(join("app", "proto") + sep)
	);
};

function giaTriLiteral(t) {
	const phan = t.isUnion() ? t.types : [t];
	const ra = [];
	for (const x of phan) {
		if (!x.isStringLiteral()) return null;
		ra.push(x.value);
	}
	return ra;
}

function laDauVaoMo(checker, obj) {
	const ngu = checker.getContextualType(obj);
	if (!ngu) return false;
	const p = checker.getPropertyOfType(ngu, "entry");
	if (!p) return false;
	const v = giaTriLiteral(checker.getTypeOfSymbolAtLocation(p, obj));
	return (
		v !== null &&
		v.length === LOI_VAO.length &&
		LOI_VAO.every((x) => v.includes(x))
	);
}

function quet(thay = new Map(), them = []) {
	const program = dungChuongTrinh(thay, them);
	const checker = program.getTypeChecker();
	const viPham = [];
	const entryMo = [];
	const dong = (sf, nut) =>
		sf.getLineAndCharacterOfPosition(nut.getStart(sf)).line + 1;
	for (const sf of program.getSourceFiles()) {
		if (!trongQuet(sf.fileName)) continue;
		const tep = resolve(sf.fileName);
		const ten = basename(tep);
		const laTepBang = tep === TEP_BANG;
		const tham = (nut) => {
			if (
				!laTepBang &&
				(ts.isJsxOpeningElement(nut) || ts.isJsxSelfClosingElement(nut)) &&
				TEN_BANG.has(nut.tagName.getText(sf))
			)
				viPham.push(
					`SAI AC-6 (1): ${ten}:${dong(sf, nut)} render bang cap nhat hang loat`,
				);
			if (
				!laTepBang &&
				ts.isImportSpecifier(nut) &&
				TEN_BANG.has((nut.propertyName ?? nut.name).text)
			)
				viPham.push(
					`SAI AC-6 (1): ${ten}:${dong(sf, nut)} import ${(nut.propertyName ?? nut.name).text} de render bang cap nhat hang loat`,
				);
			if (ts.isObjectLiteralExpression(nut) && laDauVaoMo(checker, nut)) {
				const pt = nut.properties.find(
					(x) =>
						(ts.isPropertyAssignment(x) ||
							ts.isShorthandPropertyAssignment(x)) &&
						x.name.getText(sf) === "entry",
				);
				const giaTri = pt
					? giaTriLiteral(
							checker.getTypeAtLocation(
								ts.isPropertyAssignment(pt) ? pt.initializer : pt.name,
							),
						)
					: null;
				entryMo.push({ tep, giaTri });
				if (!laTepBang) {
					if (giaTri === null)
						viPham.push(
							`SAI AC-6 (2): ${ten}:${dong(sf, nut)} khong giai duoc entry`,
						);
					else
						for (const v of giaTri.filter((x) => CAM.has(x)))
							viPham.push(
								`SAI AC-6 (2): ${ten}:${dong(sf, nut)} moCapNhat entry ${v}`,
							);
				}
			}
			if (
				ts.isPropertyAccessExpression(nut) &&
				nut.getText(sf).replace(/\s/g, "") === "SEARCH_PARAM.okr.tu"
			)
				viPham.push(`SAI AC-6 (3): ${ten}:${dong(sf, nut)} doc tham so tu`);
			ts.forEachChild(nut, tham);
		};
		tham(sf);
	}
	for (const tep of TEP_DUNG_HOP) {
		const sf = program.getSourceFile(tep);
		if (!sf) khongDo(`thieu ${relative(GOC, tep)} trong chuong trinh`);
		let bien = null;
		let mo = false;
		let hop = false;
		const tim = (nut) => {
			if (
				ts.isVariableDeclaration(nut) &&
				nut.initializer &&
				ts.isCallExpression(nut.initializer) &&
				nut.initializer.expression.getText(sf) === "useCapNhatKr" &&
				ts.isIdentifier(nut.name)
			)
				bien = nut.name.text;
			ts.forEachChild(nut, tim);
		};
		tim(sf);
		const dem = (nut) => {
			if (bien && ts.isPropertyAccessExpression(nut)) {
				const chu = nut.getText(sf);
				if (chu === `${bien}.mo`) mo = true;
				if (chu === `${bien}.hop` && ts.isJsxExpression(nut.parent)) hop = true;
			}
			ts.forEachChild(nut, dem);
		};
		dem(sf);
		if (!(bien && mo && hop))
			viPham.push(`SAI AC-6 (4): ${basename(tep)} khong mo hop mot KR`);
	}
	const moSheet = entryMo.filter((e) => e.tep === TEP_MO);
	if (
		moSheet.length === 0 ||
		!moSheet.every((e) => e.giaTri?.length === 1 && e.giaTri[0] === "sheet")
	)
		viPham.push("SAI AC-6 (4): cap-nhat-kr.tsx khong mo luot voi entry sheet");
	return viPham;
}

const docTep = (t) => readFileSync(t, "utf8");
function thayMot(tep, cu, moi) {
	const noi = docTep(tep);
	const n = noi.split(cu).length - 1;
	if (n !== 1)
		khongDo(
			`doan can thay xuat hien ${n} lan trong ${relative(GOC, tep)}: «${cu}»`,
		);
	return new Map([[resolve(tep), noi.replace(cu, moi)]]);
}

const that = quet();
if (that.length > 0) {
	for (const v of that) console.log(v);
	console.log(`KET LUAN: ${that.length} vi pham AC-6`);
	process.exit(1);
}
console.log("DUNG AC-6: 4/4");

const TEP_LOI_CU = join(APP, "lib", "ctlk-mo-loi-cu.ts");
const DOI_CHUNG = [
	{
		luat: 1,
		thay: thayMot(
			join(OKR, "cua-toi.tsx"),
			"			<PhanCanCapNhat />\n",
			"			<PhanCanCapNhat />\n			<CapNhatTuan />\n",
		),
		them: [],
		ghim: /^SAI AC-6 \(1\): cua-toi\.tsx:\d+ render bang cap nhat hang loat$/,
	},
	{
		luat: 2,
		thay: new Map([
			[
				resolve(TEP_LOI_CU),
				[
					'import { LOI_VAO } from "@crm/validation/okr-cap-nhat";',
					'import { useMutation } from "@tanstack/react-query";',
					'import { useTRPC } from "@/lib/trpc/client";',
					"",
					"export function useMoLoiCu() {",
					"	const trpc = useTRPC();",
					"	const m = useMutation(trpc.okr.moCapNhat.mutationOptions());",
					"	return () => m.mutate({ entry: LOI_VAO[4] });",
					"}",
					"",
				].join("\n"),
			],
		]),
		them: [TEP_LOI_CU],
		ghim: /^SAI AC-6 \(2\): ctlk-mo-loi-cu\.ts:\d+ moCapNhat entry cua-toi$/,
	},
	{
		luat: 3,
		thay: thayMot(
			join(OKR, "phan-can-cap-nhat.tsx"),
			"	const ds = useQuery(trpc.okr.capNhatTuan.queryOptions());\n",
			"	const ds = useQuery(trpc.okr.capNhatTuan.queryOptions());\n	const tuCu = SEARCH_PARAM.okr.tu;\n",
		),
		them: [],
		ghim: /^SAI AC-6 \(3\): phan-can-cap-nhat\.tsx:\d+ doc tham so tu$/,
	},
	{
		luat: 4,
		thay: thayMot(
			TEP_DUNG_HOP[0],
			"onCapNhat={capNhat.mo}",
			"onCapNhat={() => {}}",
		),
		them: [],
		ghim: /^SAI AC-6 \(4\): kr-sheet\.tsx khong mo hop mot KR$/,
	},
];

let sai = 0;
for (const d of DOI_CHUNG) {
	const ra = quet(d.thay, d.them);
	const trung = ra.find((v) => d.ghim.test(v));
	if (trung) console.log(`DUNG doi chung luat (${d.luat}): «${trung}»`);
	else {
		sai += 1;
		for (const v of ra) console.log(`  ${v}`);
		console.log(
			`SAI doi chung luat (${d.luat}): ban pha khong ra vi pham ghim ${d.ghim}`,
		);
	}
}
console.log(
	sai === 0
		? "KET LUAN AC-6: 4/4 luat dung, 4/4 doi chung do dung"
		: `KET LUAN AC-6: ${sai} doi chung sai`,
);
process.exit(sai === 0 ? 0 : 1);
