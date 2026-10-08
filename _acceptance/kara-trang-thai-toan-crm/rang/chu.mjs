import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const ts = createRequire(import.meta.url)("typescript");

const VUNG_CON = {
	"apps/app/components/crm/timeline/timeline.tsx": [],
	"apps/app/components/crm/website-activity.tsx": [
		{ nhan: "chua-nhan-dien", dau: "identified" },
		{ nhan: "rong", dau: "pages.length === 0" },
	],
	"apps/app/components/crm/record-sheet/contact-plans.tsx": [
		{ nhan: "rong", dau: "length === 0" },
	],
};
const SO_TEP_VUNG = 3;
const TRANG_THAI_TAI = /\b(isPending|isLoading|isError|isFetching|error)\b/;
const TEP_TAO = [
	["contacts", "contactMessages"],
	["companies", "companyMessages"],
	["deals", "dealMessages"],
];
const SUA_SAI = "Sửa Mục tiêu";
const SUA_DUNG = "Sửa mục tiêu";
const TEP_SUA_DUNG = [
	"apps/app/lib/messages/okr-gop-y.ts",
	"apps/app/lib/messages/okr.ts",
];

const dong = [];
let sai = 0;

function ket(ma) {
	for (const d of dong) console.log(d);
	process.exit(ma);
}

function khongDo(ly) {
	dong.push(`khong do duoc: ${ly}`);
	ket(2);
}

function moTep(rel) {
	const chu = readFileSync(join(GOC, rel), "utf8");
	return ts.createSourceFile(
		rel,
		chu,
		ts.ScriptTarget.Latest,
		true,
		rel.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);
}

function moiChuoi(sf) {
	const ra = [];
	const di = (node) => {
		if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) return;
		if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
			ra.push({ node, chu: node.text });
		} else if (ts.isTemplateExpression(node)) {
			ra.push({
				node,
				chu: [
					node.head.text,
					...node.templateSpans.map((s) => s.literal.text),
				].join(""),
			});
		} else if (ts.isJsxText(node)) {
			ra.push({ node, chu: node.text });
		}
		ts.forEachChild(node, di);
	};
	di(sf);
	return ra;
}

const soDong = (sf, node) =>
	sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;

function lsFiles(mau) {
	return execFileSync("git", ["ls-files", "--", mau], {
		cwd: GOC,
		encoding: "utf8",
	})
		.split("\n")
		.filter(Boolean);
}

const tepGiaoDien = lsFiles("apps/app/*.tsx").filter(
	(t) => !t.startsWith("apps/app/test/"),
);
const tepChu = lsFiles("apps/app/lib/messages/*.ts");
if (tepGiaoDien.length === 0 || tepChu.length === 0)
	khongDo("git ls-files tra rong");
const docDuoc = tepGiaoDien.filter((t) => existsSync(join(GOC, t)));
if (docDuoc.length !== tepGiaoDien.length)
	khongDo(
		`so tep chup ${tepGiaoDien.length} khac so tep doc duoc ${docDuoc.length}`,
	);

let soAdded = 0;
for (const rel of tepGiaoDien) {
	const sf = moTep(rel);
	for (const { node, chu } of moiChuoi(sf)) {
		if (/added\.\s*$/.test(chu)) {
			soAdded += 1;
			dong.push(`  SAI ${rel}:${soDong(sf, node)} con chu «added.» viet cung`);
		}
	}
}
dong.push(
	`AC-8 tep giao dien: ${tepGiaoDien.length} tep doc, ${soAdded} cho «added.» viet cung`,
);
sai += soAdded;

for (const [tep, ham] of TEP_TAO) {
	const mod = await import(join(GOC, "apps/app/lib/messages", `${tep}.ts`));
	const vi = mod[ham]("vi").created?.("Hà");
	const en = mod[ham]("en").created?.("Hà");
	const dung = vi === "Đã thêm Hà." && en === "Hà added.";
	dong.push(
		`AC-8 ${tep}.created: vi ${JSON.stringify(vi)} en ${JSON.stringify(en)} — ${dung ? "DUNG" : "SAI"}`,
	);
	if (!dung) sai += 1;
}

let soSuaSai = 0;
for (const rel of [...tepChu, ...tepGiaoDien]) {
	const sf = moTep(rel);
	for (const { node, chu } of moiChuoi(sf)) {
		if (chu.includes(SUA_SAI)) {
			soSuaSai += 1;
			dong.push(`  SAI ${rel}:${soDong(sf, node)} con «${SUA_SAI}»`);
		}
	}
}
dong.push(
	`AC-9 ${tepChu.length + tepGiaoDien.length} tep: ${soSuaSai} cho «${SUA_SAI}»`,
);
sai += soSuaSai;
for (const rel of TEP_SUA_DUNG) {
	const co = moiChuoi(moTep(rel)).some(({ chu }) => chu === SUA_DUNG);
	dong.push(
		`AC-9 ${rel}: ${co ? "co" : "THIEU"} «${SUA_DUNG}» (doi chung duong)`,
	);
	if (!co) sai += 1;
}

if (Object.keys(VUNG_CON).length !== SO_TEP_VUNG)
	khongDo("ma tran vung con lech so tep");
for (const [rel, mongDoi] of Object.entries(VUNG_CON)) {
	if (!existsSync(join(GOC, rel))) khongDo(`thieu ${rel}`);
	const sf = moTep(rel);
	const tim = [];
	const di = (node) => {
		if (
			ts.isReturnStatement(node) &&
			node.expression?.kind === ts.SyntaxKind.NullKeyword
		) {
			let cha = node.parent;
			while (cha && !ts.isIfStatement(cha) && !ts.isFunctionLike(cha))
				cha = cha.parent;
			const dieuKien =
				cha && ts.isIfStatement(cha) ? cha.expression.getText(sf) : "";
			tim.push({ dong: soDong(sf, node), dieuKien });
		}
		ts.forEachChild(node, di);
	};
	di(sf);
	dong.push(
		`vung con ${rel}: ${tim.length} return null (khai ${mongDoi.length})`,
	);
	if (tim.length !== mongDoi.length) {
		sai += 1;
		dong.push(`  SAI so return null lech ma tran`);
	}
	tim.forEach((t, i) => {
		const muc = mongDoi[i];
		if (TRANG_THAI_TAI.test(t.dieuKien)) {
			sai += 1;
			dong.push(
				`  SAI ${rel}:${t.dong} return null khi tai hay loi (${t.dieuKien})`,
			);
		} else if (!muc || !t.dieuKien.includes(muc.dau)) {
			sai += 1;
			dong.push(
				`  SAI ${rel}:${t.dong} return null khong khop nhan khai (${t.dieuKien})`,
			);
		} else {
			dong.push(`  DUNG ${rel}:${t.dong} ${muc.nhan}`);
		}
	});
}

dong.push(`KET LUAN: ${sai} cho sai — ma thoat ${sai === 0 ? 0 : 1}`);
ket(sai === 0 ? 0 : 1);
