import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { lat } from "./lat.mjs";

const ts = createRequire(import.meta.url)("typescript");

const THUOC_KY_THUAT = new Set([
	"className",
	"class",
	"id",
	"key",
	"ref",
	"href",
	"src",
	"srcSet",
	"to",
	"as",
	"type",
	"name",
	"value",
	"defaultValue",
	"htmlFor",
	"role",
	"variant",
	"size",
	"side",
	"align",
	"orientation",
	"mode",
	"tone",
	"icon",
	"entity",
	"kind",
	"slug",
	"locale",
	"lang",
	"dir",
	"target",
	"rel",
	"method",
	"action",
	"accept",
	"autoComplete",
	"inputMode",
	"pattern",
	"format",
	"color",
	"fill",
	"stroke",
	"viewBox",
	"d",
	"path",
	"style",
	"width",
	"height",
	"translate",
	"form",
	"default",
]);

const KHO_CHUOI = /\/lib\/messages\//;

const CO_CHU = /\p{L}{2,}/u;

function laChuNguoiDoc(text) {
	const t = text.trim();
	if (t === "") return false;
	if (!CO_CHU.test(t)) return false;
	if (/^[\p{P}\p{S}\s\d]+$/u.test(t)) return false;
	return true;
}

function laThuocKyThuat(ten) {
	return (
		THUOC_KY_THUAT.has(ten) || ten.startsWith("data-") || ten.startsWith("on")
	);
}

const DINH_DANH = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;

function laDinhDanh(chu) {
	return DINH_DANH.test(chu.trim());
}

function chuTrongBieuThuc(node) {
	if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
		return node.text;
	if (ts.isTemplateExpression(node)) {
		return [
			node.head.text,
			...node.templateSpans.map((s) => s.literal.text),
		].join(" ");
	}
	return null;
}

function viTri(sf, node) {
	return sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
}

function quet(file) {
	const src = readFileSync(file, "utf8");
	const sf = ts.createSourceFile(
		file,
		src,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
	const hit = [];
	const tru = [];

	const di = (node) => {
		if (ts.isJsxText(node) && laChuNguoiDoc(node.text)) {
			hit.push({
				kieu: "chu-con",
				dong: viTri(sf, node),
				chu: node.text.trim(),
			});
		}

		if (ts.isJsxAttribute(node) && node.initializer) {
			const ten = node.name.getText(sf);
			if (!laThuocKyThuat(ten)) {
				const init = node.initializer;
				const bieuThuc = ts.isJsxExpression(init) ? init.expression : init;
				const chu = bieuThuc ? chuTrongBieuThuc(bieuThuc) : null;
				if (chu !== null && laChuNguoiDoc(chu)) {
					const o = { kieu: `thuoc:${ten}`, dong: viTri(sf, node), chu };
					if (laDinhDanh(chu))
						tru.push({ ...o, vi: "gia tri la mot dinh danh chu thuong" });
					else hit.push(o);
				}
			}
		}

		ts.forEachChild(node, di);
	};

	di(sf);
	return { hit, tru };
}

const theoThuTu = (a, b) =>
	a.file === b.file ? a.dong - b.dong : a.file < b.file ? -1 : 1;

export function chuCungTrongJsx(files) {
	const ra = [];
	const bo = [];
	for (const f of files) {
		if (KHO_CHUOI.test(f)) continue;
		const { hit, tru } = quet(f);
		for (const h of hit) ra.push({ file: f, ...h });
		for (const t of tru) bo.push({ file: f, ...t });
	}
	return { hit: ra.sort(theoThuTu), tru: bo.sort(theoThuTu) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const rieng = process.argv.slice(2).filter((a) => !a.startsWith("--"));
	const files = rieng.length ? rieng : [...lat().tham].sort();
	const { hit, tru } = chuCungTrongJsx(files);

	for (const h of hit) {
		console.log(
			`${h.file}:${h.dong}  [${h.kieu}]  ${JSON.stringify(h.chu.slice(0, 120))}`,
		);
	}

	console.log("");
	console.log(`da tru ${tru.length} cho, goi ten tung cai:`);
	for (const t of tru) {
		console.log(
			`  ${t.file}:${t.dong}  [${t.kieu}]  ${JSON.stringify(t.chu)}  — ${t.vi}`,
		);
	}

	const soFile = new Set(hit.map((h) => h.file)).size;
	console.log("");
	console.log(`quet ${files.length} file trong lat`);
	console.log(
		`chu cung nguoi doc thay: ${hit.length} cho, tren ${soFile} file`,
	);

	if (hit.length > 0) {
		console.error("");
		console.error(
			`DO: ${hit.length} chuoi nguoi doc thay con khoa cung trong JSX.`,
		);
		console.error("Moi dong tren la mot cho le ra phai doc tu kho chuoi.");
		process.exit(1);
	}

	console.log("XANH: khong cho nao khoa cung.");
}
