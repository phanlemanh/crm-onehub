import { execFileSync, spawnSync } from "node:child_process";
import {
	cpSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const DAY = dirname(fileURLToPath(import.meta.url));
const GOC_THAT = join(DAY, "..", "..", "..");
const GOC = process.env.GOC_KHO ?? GOC_THAT;
const ts = createRequire(import.meta.url)("typescript");
// F8 neo (ve-sinh-do-san-onehub): tap tep va dong doi cua vong nay rut tu cap gop PR #146 da dua vong len onehub
// (B = 679432a0f^1, D = 679432a0f), khong tu merge-base(HEAD, onehub) — sau khi vong gop,
// merge-base chua san vong nay nen diff rong (lop-dem-tep 0 = 0, do sai tren moi nhanh).
const CAP = Object.freeze({
	goc: "100847e8a747d474b79bc10adb82a94e06313f82",
	dinh: "679432a0f013398f717f4d04d3b779d5f3472a3d",
});
const NEO = !process.env.OSA_TEP;
const VUNG_APP = /^apps\/app\/(?!test\/|app\/proto\/).+\.tsx$/;

const OKR_CAI_DAT = "apps/app/app/(app)/[slug]/settings/okr";
const TEP = {
	bangChuKy: `${OKR_CAI_DAT}/bang-chu-ky.tsx`,
	sheet: `${OKR_CAI_DAT}/sheet-mo-chu-ky.tsx`,
	page: `${OKR_CAI_DAT}/page.tsx`,
	messages: "apps/app/lib/messages/okr.ts",
	dialog: "packages/ui/src/components/dialog.tsx",
	simpleTable: "packages/ui/src/components/simple-table.tsx",
	navItem: "packages/ui/src/components/nav-item.tsx",
	hopNhap: "apps/app/app/(app)/[slug]/okr/hop-thoai-nhap.tsx",
	sidebar: "apps/app/app/(app)/[slug]/settings/settings-sidebar.tsx",
};

const LOP_CAM =
	/^(text-(?!(xs|sm|base|lg|xl|\dxl|left|right|center|start|end|wrap|nowrap|balance|pretty|ellipsis|clip)$)[a-z]|bg-|border-(?!(0|2|4|8|x|y|t|b|l|r|s|e)$)[a-z]|ring-|rounded|shadow|(p|px|py|pt|pb|pl|pr|ps|pe|m|mx|my|mt|mb|ml|mr|ms|me)-|gap-|space-[xy]-)/;

let dung = 0;
let sai = 0;
function ghi(ma, dat, cau) {
	if (dat) dung += 1;
	else sai += 1;
	console.log(`${dat ? "DUNG" : "SAI"} ${ma}: ${cau}`);
}

function khongDo(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

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

const laClient = (sf) =>
	sf.statements[0] !== undefined &&
	ts.isExpressionStatement(sf.statements[0]) &&
	ts.isStringLiteral(sf.statements[0].expression) &&
	sf.statements[0].expression.text === "use client";

function the(sf, ten) {
	const ra = [];
	moiNut(sf, (n) => {
		if (
			(ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) &&
			n.tagName.getText() === ten
		)
			ra.push(n);
	});
	return ra;
}

function thuocTinh(n, ten) {
	return n.attributes.properties.find(
		(p) => ts.isJsxAttribute(p) && p.name.getText() === ten,
	);
}

function caDongHo() {
	for (const [khoa, ten] of [
		["bangChuKy", "bang-chu-ky"],
		["sheet", "sheet-mo-chu-ky"],
	]) {
		const sf = cay(TEP[khoa]);
		const doc = [];
		moiNut(sf, (n) => {
			if (ts.isNewExpression(n) && n.expression.getText() === "Date")
				doc.push(`new Date dong ${sf.getLineAndCharacterOfPosition(n.getStart()).line + 1}`);
			if (
				ts.isPropertyAccessExpression(n) &&
				(n.getText() === "Date.now" || n.expression.getText() === "Temporal")
			)
				doc.push(`${n.getText()} dong ${sf.getLineAndCharacterOfPosition(n.getStart()).line + 1}`);
		});
		ghi(
			`dong-ho-${ten}`,
			laClient(sf) && doc.length === 0,
			`${TEP[khoa]} client=${laClient(sf)}, doc dong ho: ${doc.length ? doc.join("; ") : "khong"}`,
		);
	}
	const page = cay(TEP.page);
	const goi = new Set();
	moiNut(page, (n) => {
		if (ts.isCallExpression(n)) goi.add(n.expression.getText());
	});
	ghi(
		"dong-ho-page",
		!laClient(page) && goi.has("homNayVn") && goi.has("goiYChuKy"),
		`${TEP.page} server=${!laClient(page)}, goi homNayVn=${goi.has("homNayVn")}, goiYChuKy=${goi.has("goiYChuKy")}`,
	);
	const msg = cay(TEP.messages);
	let soGoiY = 0;
	const cung = [];
	moiNut(msg, (n) => {
		if (!ts.isPropertyAssignment(n) || n.name.getText() !== "tenGoiY") return;
		soGoiY += 1;
		moiNut(n.initializer, (c) => {
			const chu =
				ts.isStringLiteral(c) || ts.isNoSubstitutionTemplateLiteral(c)
					? c.text
					: ts.isTemplateHead(c) || ts.isTemplateMiddle(c) || ts.isTemplateTail(c)
						? c.text
						: ts.isNumericLiteral(c)
							? c.text
							: null;
			if (chu !== null && /\b\d{4}\b/.test(chu)) cung.push(chu);
		});
	});
	ghi(
		"goi-y-khong-cung",
		soGoiY === 2 && cung.length === 0,
		`${soGoiY} khoa tenGoiY trong okr.ts (can 2: vi, en), nam viet cung: ${cung.length ? cung.join(", ") : "khong"}`,
	);
}

function kiemCap() {
	for (const sha of [CAP.goc, CAP.dinh])
		if (
			spawnSync("git", ["-C", GOC_THAT, "cat-file", "-e", `${sha}^{commit}`])
				.status !== 0
		)
			khongDo(`khong giai duoc cap gop ${sha}`);
}

/** Chu cua tep: o D cua cap gop khi neo, khong thi tren cay dang soi (ban sao). */
function docChu(tep) {
	if (!NEO) {
		const duong = join(GOC, tep);
		return existsSync(duong) ? readFileSync(duong, "utf8") : null;
	}
	const r = spawnSync("git", ["-C", GOC_THAT, "show", `${CAP.dinh}:${tep}`], {
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
	});
	return r.status === 0 ? r.stdout : null;
}

function tepDiff() {
	if (process.env.OSA_TEP)
		return process.env.OSA_TEP.split(",").filter(Boolean);
	const git = (...doi) =>
		execFileSync("git", ["-C", GOC_THAT, ...doi], { encoding: "utf8" }).trim();
	kiemCap();
	// F8 neo (ve-sinh-do-san-onehub): tep cua vong = diff cap gop B..D, ton tai o D.
	return git("diff", "--name-only", `${CAP.goc}..${CAP.dinh}`)
		.split("\n")
		.filter(Boolean)
		.filter((t) => VUNG_APP.test(t))
		.filter((t) => docChu(t) !== null);
}

const HANG = new Map();

function hangTrongTep(tep) {
	if (HANG.has(tep)) return HANG.get(tep);
	const bang = new Map();
	HANG.set(tep, bang);
	// F8 neo (ve-sinh-do-san-onehub): hang doc o cung ban voi tep dang soi (D khi neo).
	const chu = docChu(tep);
	if (chu === null) return bang;
	const sf = ts.createSourceFile(
		tep,
		chu,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
	for (const s of sf.statements) {
		if (!ts.isVariableStatement(s)) continue;
		for (const d of s.declarationList.declarations)
			if (
				ts.isIdentifier(d.name) &&
				d.initializer &&
				(ts.isStringLiteral(d.initializer) ||
					ts.isNoSubstitutionTemplateLiteral(d.initializer))
			)
				bang.set(d.name.text, d.initializer.text);
	}
	return bang;
}

function duongNhap(tep, nguon) {
	const goc = nguon.startsWith("@/")
		? join("apps/app", nguon.slice(2))
		: nguon.startsWith(".")
			? join(dirname(tep), nguon)
			: null;
	if (goc === null) return null;
	for (const duoi of [".ts", ".tsx", "/index.ts"])
		// F8 neo (ve-sinh-do-san-onehub): tep nhap tim o cung ban voi tep dang soi (D khi neo).
		if (docChu(goc + duoi) !== null) return goc + duoi;
	return null;
}

function giaiTen(sf, tep, ten) {
	const trong = hangTrongTep(tep).get(ten);
	if (trong !== undefined) return trong;
	for (const s of sf.statements) {
		if (!ts.isImportDeclaration(s) || !s.importClause?.namedBindings) continue;
		const nb = s.importClause.namedBindings;
		if (!ts.isNamedImports(nb)) continue;
		const e = nb.elements.find((x) => x.name.text === ten);
		if (!e) continue;
		const tepNguon = duongNhap(tep, s.moduleSpecifier.text);
		if (tepNguon === null) return null;
		return hangTrongTep(tepNguon).get((e.propertyName ?? e.name).text) ?? null;
	}
	return null;
}

function lopTrong(bieuThuc, sf, tep) {
	const lop = [];
	const khongGiai = [];
	const them = (chu) => lop.push(...chu.split(/\s+/).filter(Boolean));
	moiNut(bieuThuc, (c) => {
		if (ts.isStringLiteral(c) || ts.isNoSubstitutionTemplateLiteral(c)) them(c.text);
		if (ts.isTemplateHead(c) || ts.isTemplateMiddle(c) || ts.isTemplateTail(c))
			them(c.text);
		if (
			sf &&
			ts.isIdentifier(c) &&
			!(ts.isPropertyAccessExpression(c.parent) && c.parent.name === c) &&
			!(ts.isCallExpression(c.parent) && c.parent.expression === c)
		) {
			const gia = giaiTen(sf, tep, c.text);
			if (gia === null) khongGiai.push(c.text);
			else them(gia);
		}
	});
	return { lop, khongGiai };
}

function dongDoi(tep) {
	if (process.env.OSA_TEP) return null;
	const git = (...doi) =>
		execFileSync("git", ["-C", GOC_THAT, ...doi], { encoding: "utf8" });
	// F8 neo (ve-sinh-do-san-onehub): dong doi cua vong = diff -U0 cap gop B..D (so dong theo ban D).
	const dong = new Set();
	for (const d of git("diff", "-U0", `${CAP.goc}..${CAP.dinh}`, "--", tep).split("\n")) {
		const m = d.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
		if (!m) continue;
		const dau = Number(m[1]);
		const so = m[2] === undefined ? 1 : Number(m[2]);
		for (let i = 0; i < so; i += 1) dong.add(dau + i);
	}
	return dong;
}

function caThanhPhan() {
	const dialog = cay(TEP.dialog);
	let coTable = false;
	moiNut(dialog, (n) => {
		if (ts.isLiteralTypeNode(n) && ts.isStringLiteral(n.literal) && n.literal.text === "table")
			coTable = true;
	});
	ghi("dialog-co-table", coTable, `${TEP.dialog} khai size "table": ${coTable}`);

	const bang = cay(TEP.simpleTable);
	let coInvalid = false;
	moiNut(bang, (n) => {
		if (
			ts.isFunctionDeclaration(n) &&
			n.name?.text === "SimpleTableRow" &&
			n.parameters[0] &&
			ts.isObjectBindingPattern(n.parameters[0].name)
		)
			coInvalid = n.parameters[0].name.elements.some(
				(e) => e.name.getText() === "invalid",
			);
	});
	ghi("hang-invalid", coInvalid, `SimpleTableRow nhan invalid: ${coInvalid}`);

	const nav = cay(TEP.navItem);
	const xuat = new Set();
	moiNut(nav, (n) => {
		if (ts.isExportDeclaration(n) && n.exportClause && ts.isNamedExports(n.exportClause))
			for (const e of n.exportClause.elements) xuat.add(e.name.text);
	});
	ghi("nav-strip-xuat", xuat.has("NavStrip"), `nav-item.tsx xuat ${[...xuat].join(", ")}`);

	const hop = cay(TEP.hopNhap);
	const dc = the(hop, "DialogContent");
	const coSize = dc.some((n) => {
		const a = thuocTinh(n, "size");
		return a?.initializer && ts.isStringLiteral(a.initializer) && a.initializer.text === "table";
	});
	const coHang = the(hop, "SimpleTableRow").some((n) => thuocTinh(n, "invalid"));
	const coCham = the(hop, "StatusIndicator").length >= 1;
	ghi(
		"hop-nhap-dung-table",
		coSize && coHang && coCham,
		`DialogContent size="table" ${coSize}, SimpleTableRow invalid ${coHang}, StatusIndicator ${coCham}`,
	);

	const sb = cay(TEP.sidebar);
	const dungStrip = the(sb, "NavStrip").length >= 1;
	const navTay = the(sb, "nav").filter((n) =>
		lopTrong(thuocTinh(n, "className") ?? n).lop.includes("overflow-x-auto"),
	).length;
	ghi(
		"khung-dung-nav-strip",
		dungStrip && navTay === 0,
		`settings-sidebar dung NavStrip ${dungStrip}, nav tu ve overflow-x-auto ${navTay}`,
	);

	const tep = tepDiff();
	let soTep = 0;
	for (const t of tep) {
		// F8 neo (ve-sinh-do-san-onehub): soi ban D cua tep (cung ban voi dong doi cua cap gop).
		const chu = docChu(t);
		if (chu === null) khongDo(`khong doc duoc ${t} o ${CAP.dinh}`);
		const sf = ts.createSourceFile(t, chu, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
		soTep += 1;
		const ten = new Set();
		for (const s of sf.statements) {
			if (
				!ts.isImportDeclaration(s) ||
				!s.moduleSpecifier.text.startsWith("@crm/ui/") ||
				!s.importClause
			)
				continue;
			if (s.importClause.name) ten.add(s.importClause.name.text);
			const nb = s.importClause.namedBindings;
			if (nb && ts.isNamedImports(nb))
				for (const e of nb.elements) ten.add(e.name.text);
		}
		const doi = dongDoi(t);
		moiNut(sf, (n) => {
			if (!(ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n))) return;
			const tag = n.tagName.getText();
			if (!ten.has(tag)) return;
			const dau = sf.getLineAndCharacterOfPosition(n.getStart()).line + 1;
			const cuoi = sf.getLineAndCharacterOfPosition(n.getEnd()).line + 1;
			const a = thuocTinh(n, "className");
			const { lop, khongGiai } = a?.initializer
				? lopTrong(a.initializer, sf, t)
				: { lop: [], khongGiai: [] };
			const cam = lop.filter((l) => LOP_CAM.test(l.split(":").pop().replace(/^!/, "")));
			const cau = `${tag}${a ? ` className ${JSON.stringify(lop)}` : " khong className"}${cam.length ? ` — lop cam: ${cam.join(" ")}` : ""}${khongGiai.length ? ` — khong giai duoc: ${khongGiai.join(", ")}` : ""}`;
			let vongNay = doi === null;
			for (let i = dau; !vongNay && i <= cuoi; i += 1) vongNay = doi.has(i);
			if (!vongNay) {
				if (cam.length || khongGiai.length)
					console.log(`GHI CHU co-san ${t}:${dau} ${cau}`);
				return;
			}
			ghi(`lop-${t}:${dau}`, cam.length === 0 && khongGiai.length === 0, cau);
		});
	}
	ghi("lop-dem-tep", soTep === tep.length && tep.length > 0, `so tep ${soTep} = so tep diff ${tep.length}`);
}

function chayBanSao(ca, sua) {
	const tam = mkdtempSync(join(tmpdir(), "osa-soi-"));
	for (const t of Object.values(TEP)) {
		mkdirSync(dirname(join(tam, t)), { recursive: true });
		cpSync(join(GOC_THAT, t), join(tam, t));
	}
	const [tep, cu, moi] = sua;
	const goc = readFileSync(join(tam, tep), "utf8");
	const pha = goc.replace(cu, moi);
	if (pha === goc) {
		rmSync(tam, { recursive: true, force: true });
		khongDo(`pha-thu: khong thay «${cu}» trong ${tep}`);
	}
	writeFileSync(join(tam, tep), pha);
	const r = spawnSync("bun", [fileURLToPath(import.meta.url), "--ca", ca], {
		encoding: "utf8",
		env: { ...process.env, GOC_KHO: tam, OSA_TEP: TEP.hopNhap + "," + TEP.sidebar },
	});
	rmSync(tam, { recursive: true, force: true });
	return r;
}

function caPha() {
	const r1 = chayBanSao("dong-ho", [
		TEP.sheet,
		"const ma = useId();",
		"const ma = useId();\n\tconst bayGio = new Date();",
	]);
	ghi(
		"pha-dong-ho",
		r1.status === 1 && /SAI dong-ho-sheet-mo-chu-ky/.test(r1.stdout),
		`them new Date() vao ban sao sheet-mo-chu-ky -> ma ${r1.status}`,
	);
	const r2 = chayBanSao("thanh-phan", [
		TEP.hopNhap,
		"<TableCell>",
		'<TableCell className="text-destructive">',
	]);
	ghi(
		"pha-lop",
		r2.status === 1 && /SAI lop-.*text-destructive/.test(r2.stdout),
		`them className="text-destructive" vao TableCell cua ban sao -> ma ${r2.status}`,
	);
}

const i = process.argv.indexOf("--ca");
const ca = i === -1 ? "tat-ca" : process.argv[i + 1];
if (ca === "dong-ho" || ca === "tat-ca") caDongHo();
if (ca === "thanh-phan" || ca === "tat-ca") caThanhPhan();
if (ca === "pha" || ca === "tat-ca") caPha();
console.log(`goc: ${relative(GOC_THAT, GOC) || "."}`);
console.log(`KET LUAN ${dung} DUNG, ${sai} SAI — ma thoat ${sai ? 1 : 0}`);
process.exit(sai ? 1 : 0);
