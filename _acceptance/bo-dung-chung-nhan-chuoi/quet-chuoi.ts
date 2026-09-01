import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

const THU_MUC = "packages/ui/src/components";

const CHU_TIENG_ANH =
	/^[A-Z][a-z]+(?:[ .,'’…\-–—][A-Za-z0-9]+)*[.…!?]?$|^[A-Z][a-z]+$/;

const BO_QUA = new Map([["logo.tsx", "tên hãng cũ, không phải chữ để dịch"]]);

const THUOC_TINH_NGUOI_DOC = new Set([
	"aria-label",
	"aria-description",
	"aria-placeholder",
	"placeholder",
	"title",
	"alt",
]);

type Hang = {
	file: string;
	dong: number;
	chuoi: string;
	loai: "khoa-cung" | "mac-dinh";
	cho: string;
};

function laChuNguoiDoc(value: string): boolean {
	const s = value.trim();
	if (s.length < 3) return false;
	if (!/[A-Za-z]/.test(s)) return false;
	if (!/ /.test(s) && !CHU_TIENG_ANH.test(s)) return false;
	if (/^[a-z-]+$/.test(s)) return false;
	if (/^(?:[a-z]+:)?\/\//.test(s)) return false;
	if (/[{}<>]/.test(s)) return false;
	return CHU_TIENG_ANH.test(s) || /^[A-Z][a-z].* [a-z]/.test(s);
}

function quetFile(duong: string, ten: string): Hang[] {
	const nguon = readFileSync(duong, "utf8");
	const cay = ts.createSourceFile(ten, nguon, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
	const ra: Hang[] = [];

	const ghi = (node: ts.Node, chuoi: string, loai: Hang["loai"], cho: string) => {
		const s = chuoi.replace(/\s+/g, " ").trim();
		if (!laChuNguoiDoc(s)) return;
		const { line } = cay.getLineAndCharacterOfPosition(node.getStart(cay));
		ra.push({ file: ten, dong: line + 1, chuoi: s, loai, cho });
	};

	const di = (node: ts.Node) => {
		if (ts.isJsxText(node)) {
			ghi(node, node.text, "khoa-cung", "chữ trong thẻ");
		} else if (ts.isJsxAttribute(node) && ts.isIdentifier(node.name)) {
			const ten_tt = node.name.text;
			const gt = node.initializer;
			if (THUOC_TINH_NGUOI_DOC.has(ten_tt) && gt && ts.isStringLiteral(gt)) {
				ghi(node, gt.text, "khoa-cung", ten_tt);
			}
		} else if (ts.isTemplateExpression(node)) {
			const manh = [node.head.text, ...node.templateSpans.map((s) => s.literal.text)].join(" ");
			if (/[A-Za-z]{3}/.test(manh)) ghi(node, manh, "khoa-cung", "chuỗi ghép biến");
		} else if (ts.isParameter(node) || ts.isBindingElement(node)) {
			const md = node.initializer;
			if (md && ts.isStringLiteral(md)) {
				ghi(node, md.text, "mac-dinh", "giá trị mặc định");
			}
		} else if (
			ts.isPropertyAssignment(node) &&
			ts.isStringLiteral(node.initializer) &&
			!ts.isComputedPropertyName(node.name)
		) {
			ghi(node, node.initializer.text, "khoa-cung", "bảng nhãn");
		} else if (
			ts.isBinaryExpression(node) &&
			node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken &&
			ts.isStringLiteral(node.right)
		) {
			ghi(node, node.right.text, "mac-dinh", "dự phòng ??");
		}
		ts.forEachChild(node, di);
	};

	ts.forEachChild(cay, di);
	return ra;
}

const chi_dem = process.argv.includes("--chi-dem");
const co_thu_muc = process.argv.indexOf("--thu-muc");
const goc = process.argv.includes("--goc")
	? (process.argv[process.argv.indexOf("--goc") + 1] ?? ".")
	: ".";
const thu_muc = co_thu_muc === -1 ? join(goc, THU_MUC) : (process.argv[co_thu_muc + 1] ?? ".");

const hang: Hang[] = [];
for (const ten of readdirSync(thu_muc).sort()) {
	if (!ten.endsWith(".tsx")) continue;
	hang.push(...quetFile(join(thu_muc, ten), ten));
}

const bo_qua = hang.filter((h) => BO_QUA.has(h.file));
const dem = hang.filter((h) => !BO_QUA.has(h.file));
const khoa_cung = dem.filter((h) => h.loai === "khoa-cung");
const mac_dinh = dem.filter((h) => h.loai === "mac-dinh");
const so_file = new Set(dem.map((h) => h.file)).size;

if (!chi_dem) {
	let file_truoc = "";
	for (const h of hang) {
		if (h.file !== file_truoc) {
			console.log(`\n${h.file}`);
			file_truoc = h.file;
		}
		const dau = h.loai === "khoa-cung" ? "!" : "·";
		console.log(`  ${dau} ${String(h.dong).padStart(4)}  ${h.cho.padEnd(16)} ${h.chuoi}`);
	}
	console.log("");
}

for (const h of bo_qua) {
	console.log(`bỏ qua ${h.file}:${h.dong} "${h.chuoi}" — ${BO_QUA.get(h.file)}`);
}
console.log(
	`file: ${so_file} | chuỗi: ${dem.length} | khoá cứng: ${khoa_cung.length} | mặc định đè được: ${mac_dinh.length}`,
);
process.exit(khoa_cung.length === 0 ? 0 : 1);
