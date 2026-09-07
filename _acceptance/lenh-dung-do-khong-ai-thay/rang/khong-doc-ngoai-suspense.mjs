import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const RANG = dirname(fileURLToPath(import.meta.url));
const MAC_DINH = resolve(RANG, "..", "..", "..");

const doi = process.argv.slice(2);
const iGoc = doi.indexOf("--goc");
const GOC = iGoc === -1 ? MAC_DINH : resolve(doi[iGoc + 1]);
const iNeo = doi.indexOf("--neo");
const NEO = iNeo === -1 ? 25 : Number(doi[iNeo + 1]);
const MAU_DUONG = "apps/app/app/(app)/[slug]/settings/connections/page.tsx";

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

function goiGetLocale(nut) {
	return (
		ts.isCallExpression(nut) &&
		ts.isIdentifier(nut.expression) &&
		nut.expression.text === "getLocale"
	);
}

function khaiBaoHam(nguon) {
	const bang = new Map();
	const di = (nut) => {
		if (ts.isFunctionDeclaration(nut) && nut.name) bang.set(nut.name.text, nut);
		if (ts.isVariableDeclaration(nut) && ts.isIdentifier(nut.name) && nut.initializer) {
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
	if (!goc) return { coGoi: true, hoLo, khongThayGoc: true };

	const daDi = new Set();

	const diTrong = (nut, daChe) => {
		if (goiGetLocale(nut) && !daChe)
			hoLo.push(dongCua(nguon, nut));

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
				if (goiGetLocale(n)) hoLo.push(dongCua(nguon, n));
				ts.forEachChild(n, di);
			};
			di(nut);
		}
	}

	return { coGoi: true, hoLo, khongThayGoc: false };
}

const thuMucMan = join(GOC, "apps", "app", "app");
const tatCa = quet(thuMucMan).filter((d) =>
	readFileSync(d, "utf8").includes("getLocale"),
);

if (tatCa.length !== NEO) {
	console.error(
		`MA 2: dan so ${tatCa.length} file goi getLocale, neo la ${NEO}. Dan so lech neo thi khong phep do nao con nghia.`,
	);
	process.exit(2);
}

const do_ = [];
let dat = 0;
for (const duong of tatCa) {
	const r = soiFile(duong);
	const ten = relative(GOC, duong);
	if (r.khongThayGoc) {
		console.error(`MA 2: ${ten} khong thay ham xuat mac dinh`);
		process.exit(2);
	}
	if (r.hoLo.length === 0) dat += 1;
	else for (const dong of r.hoLo) do_.push(`${ten}:${dong}`);
}

const mauDuong = tatCa.find((d) => relative(GOC, d) === MAU_DUONG);
if (!mauDuong) {
	console.error(`MA 2: khong thay mau duong ghim ten ${MAU_DUONG}`);
	process.exit(2);
}

console.log(
	`file co getLocale: ${tatCa.length} · file dat: ${dat} · neo: ${NEO}`,
);

if (do_.length > 0) {
	console.error("DO: cac loi goi getLocale khong di qua ranh <Suspense>:");
	for (const d of do_) console.error(`  ${d}`);
	process.exit(1);
}

console.log(
	"XANH: moi duong tu ham xuat mac dinh toi getLocale deu di qua mot ranh <Suspense>.",
);
