import { readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const ts = createRequire(join(GOC, "package.json"))("typescript");

const DANH_SACH = [
	"apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx",
	"apps/app/app/(app)/[slug]/contacts/create-contact-sheet.tsx",
	"apps/app/app/(app)/[slug]/companies/create-company-sheet.tsx",
	"apps/app/app/(app)/[slug]/campaigns/create-campaign-sheet.tsx",
	"apps/app/app/(app)/[slug]/settings/api-keys/to-tao-khoa.tsx",
	"apps/app/app/(app)/[slug]/settings/sso/add-sso-provider-sheet.tsx",
	"apps/app/components/onboarding/khung-tao.tsx",
	"apps/app/app/(app)/[slug]/settings/okr/sheet-mo-chu-ky.tsx",
	"apps/app/app/(app)/[slug]/settings/okr/sheet-mau-okr.tsx",
	"apps/app/app/(app)/[slug]/settings/okr/sheet-mo-ra.tsx",
	"apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx",
	"apps/app/app/(app)/[slug]/okr/hop-thoai-muc-tieu.tsx",
];

const thay = new Map();
const doi = process.argv.indexOf("--thay");
if (doi !== -1) {
	const [tep, banSao] = process.argv[doi + 1].split("=");
	thay.set(tep, banSao);
}

const doc = (tep) => readFileSync(thay.get(tep) ?? join(GOC, tep), "utf8");

function ten(node) {
	const tag = ts.isJsxElement(node)
		? node.openingElement.tagName
		: ts.isJsxSelfClosingElement(node)
			? node.tagName
			: null;
	return tag ? tag.getText() : null;
}

function thuocTinh(node, khoa) {
	const mo = ts.isJsxElement(node) ? node.openingElement : node;
	const tt = mo.attributes.properties.find(
		(p) => ts.isJsxAttribute(p) && p.name.getText() === khoa,
	);
	if (!tt) return undefined;
	if (!tt.initializer) return true;
	if (ts.isStringLiteral(tt.initializer)) return tt.initializer.text;
	return tt.initializer.getText();
}

function moNut(node) {
	if (ts.isJsxText(node)) return [[]];
	if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node))
		return [[node]];
	if (ts.isJsxFragment(node)) return nhanhCon(node.children);
	if (ts.isParenthesizedExpression(node)) return moNut(node.expression);
	if (ts.isJsxExpression(node))
		return node.expression ? moNut(node.expression) : [[]];
	if (ts.isConditionalExpression(node))
		return [...moNut(node.whenTrue), ...moNut(node.whenFalse)];
	if (
		ts.isBinaryExpression(node) &&
		node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
	)
		return [...moNut(node.right), []];
	return [[]];
}

function nhanhCon(con) {
	let nhanh = [[]];
	for (const c of con) {
		const lua = moNut(c);
		nhanh = nhanh.flatMap((n) => lua.map((l) => [...n, ...l]));
	}
	return nhanh;
}

function laHuy(node) {
	if (ten(node) !== "SheetClose") return false;
	if (!ts.isJsxElement(node)) return false;
	const trong = node.children.find(
		(c) => ts.isJsxElement(c) || ts.isJsxSelfClosingElement(c),
	);
	return (
		trong !== undefined &&
		ten(trong) === "Button" &&
		thuocTinh(trong, "variant") === "outline"
	);
}

function laChinh(node) {
	const t = ten(node);
	if (t === "SheetClose") return false;
	if (t === "Button") {
		const v = thuocTinh(node, "variant");
		return v === undefined || v === "default";
	}
	return t !== null;
}

function timChan(tep) {
	const nguon = ts.createSourceFile(
		tep,
		doc(tep),
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
	const chan = [];
	const di = (node) => {
		if (ts.isJsxElement(node) && ten(node) === "SheetFooter") chan.push(node);
		ts.forEachChild(node, di);
	};
	di(nguon);
	return chan;
}

const loi = [];
let soKhang = 0;
for (const tep of DANH_SACH) {
	const chan = timChan(tep);
	if (chan.length !== 1) {
		loi.push(`khong tim thay chan: ${tep} (${chan.length})`);
		continue;
	}
	const nhanh = nhanhCon(chan[0].children);
	const sai = nhanh.some(
		(n) => n.length < 2 || !laHuy(n[0]) || !laChinh(n[n.length - 1]),
	);
	soKhang += 1;
	if (sai) loi.push(`chan sai thu tu: ${tep}`);
	else console.log(`ok ${tep} (${nhanh.length} nhanh)`);
}

function lopCua(tep, ham) {
	const chu = readFileSync(join(GOC, tep), "utf8");
	const vi = chu.indexOf(`function ${ham}(`);
	const khuc = chu.slice(vi, chu.indexOf("\n}\n", vi));
	const m = khuc.match(/cn\(\s*"([^"]+)"/);
	if (!m) throw new Error(`khong doc duoc lop cua ${ham}`);
	return m[1].split(/\s+/).filter(Boolean);
}
const lopNgan = new Set(
	lopCua("packages/ui/src/components/sheet.tsx", "SheetFooter"),
);
const thieuLop = lopCua(
	"packages/ui/src/components/dialog.tsx",
	"DialogFooter",
).filter((l) => !lopNgan.has(l));
if (thieuLop.length > 0)
	loi.push(`chan ngan khac chan hop thoai: thieu ${thieuLop.join(" ")}`);
else console.log("ok chan ngan xep nhu chan hop thoai");

const ngoai = [];
const quet = (thuMuc) => {
	for (const muc of readdirSync(thuMuc)) {
		if (muc === "node_modules" || muc === ".next" || muc.startsWith("."))
			continue;
		const duong = join(thuMuc, muc);
		if (statSync(duong).isDirectory()) quet(duong);
		else if (muc.endsWith(".tsx")) {
			const tuong = relative(GOC, duong);
			if (!DANH_SACH.includes(tuong) && readFileSync(duong, "utf8").includes("<SheetFooter"))
				ngoai.push(tuong);
		}
	}
};
quet(join(GOC, "apps/app"));
for (const t of ngoai) console.log(`ngoai danh sach: ${t}`);

console.log(`so khang dinh: ${soKhang}`);
for (const l of loi) console.log(l);
process.exit(loi.length > 0 || soKhang !== DANH_SACH.length ? 1 : 0);
