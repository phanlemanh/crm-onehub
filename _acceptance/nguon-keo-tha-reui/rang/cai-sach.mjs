import { execFileSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP), "..", "..", "..");
const ts = createRequire(join(GOC, "package.json"))("typescript");

const THONG_DIEP_CAI = "cai khong sach";
const THONG_DIEP_MOC = "vung tu bat keo-tha";
const NHANH_CHINH = "origin/onehub";
const MOC = "packages/ui/src/hooks/use-file-upload.ts";
const VUNG = "packages/ui/src/components/nguon-keo-tha.tsx";
const GOI = "packages/ui/package.json";
const KHONG_CHAM = [
	"packages/ui/src/components/button.tsx",
	"packages/ui/src/components/alert.tsx",
	"packages/ui/src/styles/globals.css",
];
const KHONG_THEM = [
	"packages/ui/src/components/reui/alert.tsx",
	"packages/ui/src/components/examples",
];
const MODULE_MOC = "hooks/use-file-upload";
const BO_BAT = {
	onDragEnter: "handleDragEnter",
	onDragLeave: "handleDragLeave",
	onDragOver: "handleDragOver",
	onDrop: "handleDrop",
};
const THU_MUC_TAM = join(GOC, ".acceptance-runs", "nguon-keo-tha-reui");

class KhongDo extends Error {}

const git = (goc, ...d) =>
	execFileSync("git", ["-C", goc, ...d], {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	}).trim();

function docCay(goc, rel) {
	const duong = join(goc, rel);
	if (!existsSync(duong)) return null;
	return ts.createSourceFile(
		rel,
		readFileSync(duong, "utf8"),
		ts.ScriptTarget.Latest,
		true,
		rel.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);
}

function coChuThich(cay) {
	const nguon = cay.getFullText();
	let co = false;
	const di = (n) => {
		ts.forEachLeadingCommentRange(nguon, n.getFullStart(), () => {
			co = true;
		});
		ts.forEachTrailingCommentRange(nguon, n.getEnd(), () => {
			co = true;
		});
		for (const con of n.getChildren(cay)) di(con);
	};
	di(cay);
	return co;
}

function importTu(cay, module) {
	return cay.statements.some(
		(s) =>
			ts.isImportDeclaration(s) &&
			ts.isStringLiteral(s.moduleSpecifier) &&
			s.moduleSpecifier.text === module,
	);
}

function exportMoc(cay) {
	return cay.statements.some(
		(s) =>
			ts.isVariableStatement(s) &&
			s.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) &&
			s.declarationList.declarations.some(
				(d) => ts.isIdentifier(d.name) && d.name.text === "useFileUpload",
			),
	);
}

function mergeBase(goc) {
	try {
		git(goc, "rev-parse", "--verify", "--quiet", NHANH_CHINH);
	} catch {
		throw new KhongDo(`khong co ${NHANH_CHINH}`);
	}
	return git(goc, "merge-base", "HEAD", NHANH_CHINH);
}

function coOBase(goc, mb, rel) {
	try {
		git(goc, "cat-file", "-e", `${mb}:${rel}`);
		return true;
	} catch {
		return false;
	}
}

function kiemCai(goc) {
	const o = [];
	const ghi = (kiem, rel, dat) => o.push({ o: `${kiem} ${basename(rel)}`, dat });
	const moc = docCay(goc, MOC);
	const vung = docCay(goc, VUNG);
	ghi("moc-co", MOC, moc !== null && exportMoc(moc));
	for (const [rel, cay] of [
		[MOC, moc],
		[VUNG, vung],
	]) {
		ghi("khong-chu-thich", rel, cay !== null && !coChuThich(cay));
		ghi("khong-cn", rel, cay !== null && !importTu(cay, "cn"));
		ghi("khong-lucide", rel, cay !== null && !importTu(cay, "lucide-react"));
	}
	const goi = JSON.parse(readFileSync(join(goc, GOI), "utf8"));
	ghi("goi-khong-cn", GOI, !Object.hasOwn(goi.dependencies ?? {}, "cn"));
	const mb = mergeBase(goc);
	const doi = new Set(
		git(goc, "diff", "--name-only", mb).split("\n").filter(Boolean),
	);
	for (const rel of KHONG_CHAM)
		ghi(
			"nhanh-khong-cham",
			rel,
			existsSync(join(goc, rel)) && coOBase(goc, mb, rel) && !doi.has(rel),
		);
	for (const rel of KHONG_THEM)
		ghi("khong-them", rel, !existsSync(join(goc, rel)));
	return o;
}

function tenGan(bien) {
	const gan = new Map();
	const di = (mau) => {
		for (const pt of mau.elements) {
			if (ts.isOmittedExpression(pt)) continue;
			if (ts.isIdentifier(pt.name)) {
				const khoa = pt.propertyName ?? pt.name;
				gan.set(pt.name.text, ts.isIdentifier(khoa) ? khoa.text : "");
			} else di(pt.name);
		}
	};
	di(bien);
	return gan;
}

function thuocTinh(the, ten) {
	return the.attributes.properties.find(
		(p) => ts.isJsxAttribute(p) && p.name.getText() === ten,
	);
}

function cacThe(cay) {
	const the = [];
	const di = (n) => {
		if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n))
			the.push(n);
		for (const con of n.getChildren(cay)) di(con);
	};
	di(cay);
	return the;
}

function kiemMoc(goc) {
	const cay = docCay(goc, VUNG);
	if (!cay) return [`${THONG_DIEP_MOC}: thieu ${basename(VUNG)}`];
	const loi = [];
	const nhapMoc = cay.statements.find(
		(s) =>
			ts.isImportDeclaration(s) &&
			ts.isStringLiteral(s.moduleSpecifier) &&
			s.moduleSpecifier.text.endsWith(MODULE_MOC),
	);
	const tenMoc = nhapMoc?.importClause?.namedBindings?.elements?.find(
		(e) => (e.propertyName ?? e.name).text === "useFileUpload",
	)?.name.text;
	let gan = null;
	const tim = (n) => {
		if (
			ts.isVariableDeclaration(n) &&
			n.initializer &&
			ts.isCallExpression(n.initializer) &&
			ts.isIdentifier(n.initializer.expression) &&
			n.initializer.expression.text === tenMoc &&
			ts.isArrayBindingPattern(n.name)
		)
			gan = tenGan(n.name);
		for (const con of n.getChildren(cay)) tim(con);
	};
	if (tenMoc) tim(cay);
	if (!gan) return [`${THONG_DIEP_MOC}: khong goi useFileUpload`];
	const the = cacThe(cay);
	const vung = the.find((t) => {
		const a = thuocTinh(t, "data-slot");
		return (
			a?.initializer &&
			ts.isStringLiteral(a.initializer) &&
			a.initializer.text === "nguon-keo-tha"
		);
	});
	if (!vung) return [`${THONG_DIEP_MOC}: khong thay vung nguon-keo-tha`];
	for (const [ten, khoa] of Object.entries(BO_BAT)) {
		const a = thuocTinh(vung, ten);
		const bt =
			a?.initializer && ts.isJsxExpression(a.initializer)
				? a.initializer.expression
				: undefined;
		if (!(bt && ts.isIdentifier(bt) && gan.get(bt.text) === khoa))
			loi.push(`${THONG_DIEP_MOC}: ${ten}`);
	}
	const oTep = the.find(
		(t) =>
			t.tagName.getText() === "input" &&
			t.attributes.properties.some(
				(p) =>
					ts.isJsxSpreadAttribute(p) &&
					ts.isCallExpression(p.expression) &&
					ts.isIdentifier(p.expression.expression) &&
					gan.get(p.expression.expression.text) === "getInputProps",
			),
	);
	if (!oTep) loi.push(`${THONG_DIEP_MOC}: o tep khong lay tu getInputProps`);
	const tuKhaiDrag = cay.statements.some(
		(s) =>
			ts.isImportDeclaration(s) &&
			ts.isStringLiteral(s.moduleSpecifier) &&
			s.moduleSpecifier.text === "react" &&
			s.importClause?.namedBindings?.elements?.some(
				(e) => (e.propertyName ?? e.name).text === "DragEvent",
			),
	);
	if (tuKhaiDrag) loi.push(`${THONG_DIEP_MOC}: tu khai DragEvent`);
	return loi;
}

function loiCua(phan, goc) {
	if (phan === "moc") return kiemMoc(goc);
	return kiemCai(goc)
		.filter((k) => !k.dat)
		.map((k) => `${THONG_DIEP_CAI}: ${k.o}`);
}

const ghiTep = (goc, rel, doi) => {
	const duong = join(goc, rel);
	writeFileSync(duong, doi(readFileSync(duong, "utf8")));
};

const commitPha = (goc) =>
	git(
		goc,
		"-c",
		"user.email=chieu-do@local",
		"-c",
		"user.name=chieu-do",
		"commit",
		"-qam",
		"pha",
		"--no-verify",
	);

function banPha(phan) {
	if (phan === "moc")
		return [
			[
				`${THONG_DIEP_MOC}: onDrop`,
				(g) =>
					ghiTep(g, VUNG, (s) =>
						s.replace("onDrop={handleDrop}", "onDrop={() => {}}"),
					),
			],
		];
	const pha = [
		[`moc-co ${basename(MOC)}`, (g) => rmSync(join(g, MOC))],
		...[MOC, VUNG].flatMap((rel) => [
			[
				`khong-chu-thich ${basename(rel)}`,
				(g) => ghiTep(g, rel, (s) => `${s}\n// x\n`),
			],
			[
				`khong-cn ${basename(rel)}`,
				(g) => ghiTep(g, rel, (s) => `import { cn as cnGoc } from "cn";\n${s}`),
			],
			[
				`khong-lucide ${basename(rel)}`,
				(g) =>
					ghiTep(g, rel, (s) => `import { XIcon } from "lucide-react";\n${s}`),
			],
		]),
		[
			`goi-khong-cn ${basename(GOI)}`,
			(g) =>
				ghiTep(g, GOI, (s) => {
					const goi = JSON.parse(s);
					return JSON.stringify(
						{ ...goi, dependencies: { ...goi.dependencies, cn: "^1.0.0" } },
						null,
						"\t",
					);
				}),
		],
		...KHONG_CHAM.map((rel) => [
			`nhanh-khong-cham ${basename(rel)}`,
			(g) => {
				ghiTep(g, rel, (s) => `${s}\n`);
				commitPha(g);
			},
		]),
		...KHONG_THEM.map((rel) => [
			`khong-them ${basename(rel)}`,
			(g) => {
				const dich = rel.endsWith(".tsx") ? join(g, rel) : join(g, rel, "c.tsx");
				mkdirSync(dirname(dich), { recursive: true });
				writeFileSync(dich, "export const c = 1;\n");
			},
		]),
	];
	return pha.map(([o, f]) => [`${THONG_DIEP_CAI}: ${o}`, f]);
}

function chieuDo(phan) {
	mkdirSync(THU_MUC_TAM, { recursive: true });
	const tam = mkdtempSync(join(THU_MUC_TAM, "chieu-do-"));
	rmSync(tam, { recursive: true, force: true });
	git(GOC, "worktree", "add", "--detach", "--quiet", tam, "HEAD");
	const hong = [];
	try {
		const dau = git(tam, "rev-parse", "HEAD");
		const hoan = () => {
			git(tam, "reset", "--hard", "--quiet", dau);
			git(tam, "clean", "-fdq");
		};
		const lanh = loiCua(phan, tam);
		if (lanh.length > 0) hong.push(`ban lanh khong xanh: ${lanh.join("; ")}`);
		else console.log("ban lanh: xanh");
		for (const [mong, pha] of banPha(phan)) {
			pha(tam);
			const ket = loiCua(phan, tam);
			if (ket.includes(mong)) console.log(`pha ${mong}: do dung thong diep`);
			else hong.push(`${mong} -> ${ket.join("; ") || "xanh"}`);
			hoan();
		}
	} finally {
		git(GOC, "worktree", "remove", "--force", tam);
	}
	if (hong.length > 0) {
		for (const h of hong) console.error(`chieu do hong: ${h}`);
		process.exit(1);
	}
}

function chay(phan) {
	if (phan === "moc") {
		const loi = kiemMoc(GOC);
		for (const l of loi) console.error(l);
		if (loi.length > 0) process.exit(1);
		console.log("kiem moc: dat");
		return;
	}
	const ket = kiemCai(GOC);
	for (const k of ket)
		if (k.dat) console.log(`kiem ${k.o}: dat`);
		else console.error(`${THONG_DIEP_CAI}: ${k.o}`);
	const dat = ket.filter((k) => k.dat).length;
	console.log(`${dat}/${ket.length} o dat`);
	if (dat !== ket.length) process.exit(1);
}

const i = process.argv.indexOf("--phan");
const phan = i >= 0 ? process.argv[i + 1] : undefined;
try {
	if (phan !== "cai" && phan !== "moc")
		throw new KhongDo("can --phan cai|moc");
	if (process.argv.includes("--chieu-do")) chieuDo(phan);
	else chay(phan);
} catch (e) {
	if (e instanceof KhongDo) {
		console.error(`khong do duoc: ${e.message}`);
		process.exit(2);
	}
	throw e;
}
