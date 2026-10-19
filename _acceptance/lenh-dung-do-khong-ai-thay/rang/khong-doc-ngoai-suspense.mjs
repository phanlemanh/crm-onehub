import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const RANG = dirname(fileURLToPath(import.meta.url));
const MAC_DINH = resolve(RANG, "..", "..", "..");

const doi = process.argv.slice(2);
const iGoc = doi.indexOf("--goc");
const MOC_GOP = "eeb6ea30ec62369f2892d0a39a66d9a8b49fbcc1";

function cayTaiMocGop() {
	const thuMuc = mkdtempSync(join(tmpdir(), "ld-moc-gop-"));
	process.on("exit", () => rmSync(thuMuc, { recursive: true, force: true }));
	const tar = join(thuMuc, "cay.tar");
	execFileSync("git", ["archive", "--output", tar, MOC_GOP, "apps/app/app"], { cwd: MAC_DINH });
	execFileSync("tar", ["-xf", tar, "-C", thuMuc]);
	return thuMuc;
}

const GOC = iGoc === -1 ? cayTaiMocGop() : resolve(doi[iGoc + 1]);
const iNeo = doi.indexOf("--neo");
const NEO = iNeo === -1 ? 26 : Number(doi[iNeo + 1]);
const LAYOUT_GOC = "apps/app/app/layout.tsx";

function quet(thuMuc, ra = []) {
	for (const ten of readdirSync(thuMuc)) {
		const duong = join(thuMuc, ten);
		if (statSync(duong).isDirectory()) quet(duong, ra);
		else if (/\.tsx$/.test(ten)) ra.push(duong);
	}
	return ra;
}

function cay(duong) {
	return ts.createSourceFile(
		duong,
		readFileSync(duong, "utf8"),
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
}

function tenThe(the) {
	const ten = ts.isJsxElement(the)
		? the.openingElement.tagName
		: ts.isJsxSelfClosingElement(the)
			? the.tagName
			: undefined;
	return ten && ts.isIdentifier(ten) ? ten.text : undefined;
}

const DOC_LUOT = new Set(["getLocale", "cookies", "headers", "draftMode"]);

function docDuLieuLuot(nut) {
	return (
		ts.isCallExpression(nut) &&
		ts.isIdentifier(nut.expression) &&
		DOC_LUOT.has(nut.expression.text)
	);
}

function khaiBaoHam(nguon) {
	const bang = new Map();
	const di = (nut) => {
		if (ts.isFunctionDeclaration(nut) && nut.name) bang.set(nut.name.text, nut);
		if (
			ts.isVariableDeclaration(nut) &&
			ts.isIdentifier(nut.name) &&
			nut.initializer
		) {
			if (
				ts.isArrowFunction(nut.initializer) ||
				ts.isFunctionExpression(nut.initializer)
			)
				bang.set(nut.name.text, nut.initializer);
		}
		ts.forEachChild(nut, di);
	};
	di(nguon);
	return bang;
}

function xuatMacDinh(nguon) {
	let ra;
	const di = (nut) => {
		if (
			ts.isFunctionDeclaration(nut) &&
			nut.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)
		)
			ra = nut;
		ts.forEachChild(nut, di);
	};
	di(nguon);
	return ra;
}

function dongCua(nguon, nut) {
	return nguon.getLineAndCharacterOfPosition(nut.getStart(nguon)).line + 1;
}

function soiFile(duong) {
	const nguon = cay(duong);
	const bang = khaiBaoHam(nguon);
	const goc = xuatMacDinh(nguon);
	const hoLo = [];
	const hoLoMeta = [];
	if (!goc) return { coGoi: true, hoLo, khongThayGoc: true };

	const daDi = new Set();

	const diTrong = (nut, daChe) => {
		if (docDuLieuLuot(nut) && !daChe) hoLo.push(dongCua(nguon, nut));

		let cheTiep = daChe;
		if (ts.isJsxElement(nut) || ts.isJsxSelfClosingElement(nut)) {
			const ten = tenThe(nut);
			if (ten === "Suspense") cheTiep = true;
			else if (ten && bang.has(ten)) theoChan(ten, daChe);
		}
		ts.forEachChild(nut, (con) => diTrong(con, cheTiep));
	};

	const theoChan = (ten, daChe) => {
		const khoa = `${ten}|${daChe}`;
		if (daDi.has(khoa)) return;
		daDi.add(khoa);
		const ham = bang.get(ten);
		if (ham) diTrong(ham, daChe);
	};

	diTrong(goc, false);

	for (const nut of nguon.statements) {
		if (
			ts.isFunctionDeclaration(nut) &&
			nut.name?.text === "generateMetadata"
		) {
			const di = (n) => {
				if (docDuLieuLuot(n)) hoLoMeta.push(dongCua(nguon, n));
				ts.forEachChild(n, di);
			};
			di(nut);
		}
	}

	return { coGoi: true, hoLo, hoLoMeta, khongThayGoc: false };
}

const thuMucMan = join(GOC, "apps", "app", "app");
const tatCa = quet(thuMucMan).filter((d) => {
	const chu = readFileSync(d, "utf8");
	return [...DOC_LUOT].some((ten) => chu.includes(`${ten}(`));
});

if (tatCa.length !== NEO) {
	console.error(
		`MA 2: dan so ${tatCa.length} file goi getLocale, neo la ${NEO}. Dan so lech neo thi khong phep do nao con nghia.`,
	);
	process.exit(2);
}

const duongLayout = tatCa.find((d) => relative(GOC, d) === LAYOUT_GOC);
if (!duongLayout) {
	console.error(
		`MA 2: khong thay ${LAYOUT_GOC} trong dan so — layout goc la vat trung tam cua phep do nay`,
	);
	process.exit(2);
}

const layoutBocCon = (() => {
	const nguon = cay(duongLayout);
	const goc = xuatMacDinh(nguon);
	if (!goc) return false;
	let boc = false;
	const di = (nut, daChe) => {
		if (
			ts.isJsxExpression(nut) &&
			nut.expression &&
			ts.isIdentifier(nut.expression) &&
			nut.expression.text === "children" &&
			daChe
		)
			boc = true;
		let cheTiep = daChe;
		if (
			(ts.isJsxElement(nut) || ts.isJsxSelfClosingElement(nut)) &&
			tenThe(nut) === "Suspense"
		)
			cheTiep = true;
		ts.forEachChild(nut, (con) => di(con, cheTiep));
	};
	di(goc, false);
	return boc;
})();

const do_ = [];
const doMeta = [];
const doCheBoiLayout = [];
let dat = 0;
for (const duong of tatCa) {
	const r = soiFile(duong);
	const ten = relative(GOC, duong);
	if (r.khongThayGoc) {
		console.error(`MA 2: ${ten} khong thay ham xuat mac dinh`);
		process.exit(2);
	}
	const laLayoutGoc = ten === LAYOUT_GOC;
	if (r.hoLo.length === 0) dat += 1;
	for (const dong of r.hoLo) {
		if (!laLayoutGoc && layoutBocCon) doCheBoiLayout.push(`${ten}:${dong}`);
		else do_.push(`${ten}:${dong}`);
	}
	for (const dong of r.hoLoMeta) doMeta.push(`${ten}:${dong}`);
}

console.log(
	`file co getLocale: ${tatCa.length} · file dat: ${dat} · neo: ${NEO}`,
);

console.log(
	`root layout boc {children} trong <Suspense>: ${layoutBocCon ? "co" : "KHONG"}`,
);
console.log(
	`ho THAT o vo tinh: ${do_.length} loi goi / ${new Set(do_.map((d) => d.split(":")[0])).size} file`,
);
console.log(
	`doc du lieu luot o man, da duoc ranh cua layout che: ${doCheBoiLayout.length} loi goi / ${new Set(doCheBoiLayout.map((d) => d.split(":")[0])).size} file`,
);
console.log(
	`generateMetadata doc du lieu luot: ${doMeta.length} loi goi / ${new Set(doMeta.map((d) => d.split(":")[0])).size} file — KHONG tinh la ho, da do: Next cho metadata dong`,
);

if (do_.length > 0) {
	console.error(
		"DO: doc du lieu luot o vo tinh, khong di qua ranh <Suspense>:",
	);
	for (const d of do_) console.error(`  ${d}`);
	process.exit(1);
}

console.log(
	"XANH: khong cho nao doc du lieu luot ma khong co mot ranh <Suspense> che — ke ca ranh cua root layout.",
);
