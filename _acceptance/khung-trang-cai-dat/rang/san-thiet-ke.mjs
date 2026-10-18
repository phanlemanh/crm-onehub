import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DAY = dirname(fileURLToPath(import.meta.url));
const GOC_THAT = join(DAY, "..", "..", "..");
const GOC = process.env.GOC_KHO ?? GOC_THAT;
const ts = createRequire(import.meta.url)("typescript");
const NHANH_GOC = "origin/onehub";
const BAO_CAO_HO_SO = "_acceptance/khung-trang-cai-dat/evidence-report.md";
const VUNG_GIAO_DIEN =
	/^(apps\/app\/(?!test\/|app\/proto\/).+\.tsx|packages\/ui\/src\/components\/.+\.tsx)$/;
const THANH_BEN = "apps/app/app/(app)/[slug]/settings/settings-sidebar.tsx";
const NAV_ITEM = "packages/ui/src/components/nav-item.tsx";
const BREADCRUMB = "packages/ui/src/components/breadcrumb.tsx";
const CAM_CLASS = new Set(["NavItem", "NavGroup", "NavGroupLabel", "Button"]);

let hong = 0;

function khongDo(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

function loi(cau) {
	hong += 1;
	console.log(`HONG ${cau}`);
}

const git = (...doi) =>
	execFileSync("git", ["-C", GOC_THAT, ...doi], { encoding: "utf8" }).trim();

function cay(tep) {
	const duong = join(GOC, tep);
	if (!existsSync(duong)) khongDo(`khong co ${tep}`);
	return ts.createSourceFile(
		duong,
		readFileSync(duong, "utf8"),
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
}

function moiNut(goc, lam) {
	const di = (n) => {
		lam(n);
		ts.forEachChild(n, di);
	};
	di(goc);
}

function khungGop() {
	const gop = git(
		"log",
		"--first-parent",
		"--diff-filter=A",
		"--format=%H",
		NHANH_GOC,
		"--",
		BAO_CAO_HO_SO,
	)
		.split("\n")
		.filter(Boolean)
		.at(-1);
	if (!gop) return null;
	const truoc = git("rev-parse", `${gop}^1`);
	const dinh = git("rev-parse", `${gop}^2`);
	console.log(`ho so da gop o ${gop.slice(0, 9)}: goc so rut tu lan gop`);
	return { goc: git("merge-base", truoc, dinh), dinh };
}

const khung = khungGop();
const moc = khung?.goc ?? git("merge-base", "HEAD", NHANH_GOC);
const doi = git("diff", "--name-only", `${moc}...${khung?.dinh ?? "HEAD"}`)
	.split("\n")
	.concat(khung ? [] : git("diff", "--name-only").split("\n"))
	.filter(Boolean)
	.filter((t, i, ds) => ds.indexOf(t) === i)
	.filter((t) => VUNG_GIAO_DIEN.test(t))
	.filter((t) => existsSync(join(GOC_THAT, t)));
if (doi.length === 0) khongDo("khong tep giao dien nao trong diff");
console.log(`so tep giao dien vong nay cham: ${doi.length}`);

if (!process.env.GOC_KHO) {
	const goiKit =
		process.env.CLAUDE_PLUGIN_ROOT ??
		execFileSync(
			"node",
			[
				join(GOC_THAT, "scripts", "resolve-plugin.mjs"),
				"--plugin",
				"acceptance-gate",
				"--require",
				"scripts/design-gate.mjs",
				"--require",
				"scripts/design-scan.js",
			],
			{ encoding: "utf8" },
		).trim();
	for (const t of doi) {
		const r = spawnSync(
			"node",
			[
				join(goiKit, "scripts", "design-gate.mjs"),
				"--target",
				t,
				"--mode",
				"static",
			],
			{ cwd: GOC_THAT, encoding: "utf8" },
		);
		if (r.status !== 0) {
			loi(`${t}: design-gate ma ${r.status}`);
			for (const d of `${r.stdout ?? ""}${r.stderr ?? ""}`
				.trim()
				.split("\n")
				.slice(0, 8))
				console.log(`  ${d}`);
		}
	}
}

moiNut(cay(THANH_BEN), (n) => {
	if (!(ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n))) return;
	const ten = n.tagName.getText();
	if (!CAM_CLASS.has(ten)) return;
	const coClass = n.attributes.properties.some(
		(p) => ts.isJsxAttribute(p) && p.name.getText() === "className",
	);
	if (coClass) loi(`settings-sidebar.tsx: ${ten} mang className`);
});

const xuat = new Set();
moiNut(cay(NAV_ITEM), (n) => {
	if (
		ts.isExportDeclaration(n) &&
		n.exportClause &&
		ts.isNamedExports(n.exportClause)
	)
		for (const e of n.exportClause.elements) xuat.add(e.name.text);
});
for (const ten of ["NavItem", "NavGroup", "NavGroupLabel"])
	if (!xuat.has(ten)) loi(`nav-item.tsx: khong xuat ${ten}`);
let coHuong = false;
moiNut(cay(NAV_ITEM), (n) => {
	if (ts.isBindingElement(n) && n.name.getText() === "orientation")
		coHuong = true;
});
if (!coHuong) loi("nav-item.tsx: NavItem khong nhan orientation");

const bc = cay(BREADCRUMB);
const chuBc = bc.getFullText();
moiNut(bc, (n) => {
	if (ts.isImportDeclaration(n) && ts.isStringLiteral(n.moduleSpecifier)) {
		const tu = n.moduleSpecifier.text;
		if (tu === "cn") loi("breadcrumb.tsx: import cn tu goi npm cn");
		if (tu === "lucide-react") loi("breadcrumb.tsx: bieu tuong lucide-react");
	}
	if (ts.isStringLiteralLike(n)) {
		if (/#[0-9a-fA-F]{3,8}\b/.test(n.text))
			loi(`breadcrumb.tsx: mau hex ${n.text}`);
		if (n.text.includes("rounded-["))
			loi(`breadcrumb.tsx: goc rieng ${n.text}`);
	}
});
const quet = ts.createScanner(
	ts.ScriptTarget.Latest,
	false,
	ts.LanguageVariant.JSX,
	chuBc,
);
for (let k = quet.scan(); k !== ts.SyntaxKind.EndOfFileToken; k = quet.scan())
	if (
		k === ts.SyntaxKind.SingleLineCommentTrivia ||
		k === ts.SyntaxKind.MultiLineCommentTrivia
	)
		loi("breadcrumb.tsx: co chu thich");

console.log(`san-thiet-ke: ${hong === 0 ? "dat" : `${hong} cho hong`}`);
process.exit(hong === 0 ? 0 : 1);
