import { execFileSync } from "node:child_process";
import {
	cpSync,
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SLUG = "tai-lieu-diff-bo-myers-vo-ich";
const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const MOC = "cfac5bead7b65d8002b70eb8f11b0417f59ef91f";
const ts = createRequire(join(GOC, "package.json"))("typescript");

const SPEC = "packages/validation/test/tai-lieu-diff.spec.ts";
const MA = "packages/validation/src/tai-lieu-diff.ts";
const GOI = "packages/validation/package.json";
const GOI_GOC = "package.json";
const TURBO = "turbo.json";
const BUNFIG = ["packages/validation/bunfig.toml", "bunfig.toml"];
const TRAN_MS_GOC = "process.env.CI ? 6_000 : 2_000";
const SO_CHO_PHEP = new Set([0, 1, 2]);
const EXPORT = ["soSanh", "diffHash", "suKienDoi"];

const doc = (goc, tep) => readFileSync(join(goc, tep), "utf8");
const cay = (tep, chu) =>
	ts.createSourceFile(tep, chu, ts.ScriptTarget.Latest, true);

function duyet(nut, f) {
	f(nut);
	ts.forEachChild(nut, (con) => duyet(con, f));
}

function tenGoi(goi) {
	const e = goi.expression;
	if (ts.isIdentifier(e)) return e.text;
	if (ts.isPropertyAccessExpression(e) && ts.isIdentifier(e.expression))
		return e.expression.text;
	return "";
}

function kiemThuoc(goc) {
	const loi = [];
	const dat = [];
	const nguon = cay(SPEC, doc(goc, SPEC));
	const tatDinh = [];
	let datMacDinh = false;
	let tuyChon = false;
	let tranMs = null;
	duyet(nguon, (n) => {
		if (ts.isCallExpression(n)) {
			const ten = tenGoi(n);
			const dau = n.arguments[0];
			if (
				ten === "test" &&
				dau &&
				ts.isStringLiteralLike(dau) &&
				dau.text.startsWith("tat-dinh:")
			)
				tatDinh.push(n);
			if (ten === "setDefaultTimeout") datMacDinh = true;
			if (["test", "describe", "it"].includes(ten))
				for (const d of n.arguments)
					if (
						ts.isObjectLiteralExpression(d) &&
						d.properties.some(
							(p) => p.name && p.name.getText(nguon) === "timeout",
						)
					)
						tuyChon = true;
		}
		if (ts.isVariableDeclaration(n) && n.name.getText(nguon) === "TRAN_MS")
			tranMs = n.initializer?.getText(nguon) ?? "";
	});
	const ghi = (ten, dung, thongDiep) =>
		dung ? dat.push(ten) : loi.push(`noi thuoc: ${thongDiep}`);
	ghi(
		"tat-dinh-hai-doi-so",
		tatDinh.length === 1 && tatDinh[0].arguments.length === 2,
		"tat-dinh co tran rieng",
	);
	ghi("khong-setDefaultTimeout", !datMacDinh, "setDefaultTimeout");
	ghi("khong-tuy-chon-timeout", !tuyChon, "tuy chon timeout");
	ghi("TRAN_MS", tranMs === TRAN_MS_GOC, "TRAN_MS");
	ghi(
		"bunfig",
		BUNFIG.every(
			(t) => !existsSync(join(goc, t)) || !/^\s*timeout\s*=/m.test(doc(goc, t)),
		),
		"bunfig",
	);
	ghi(
		"script-test",
		[GOI, GOI_GOC].every(
			(t) =>
				!(JSON.parse(doc(goc, t)).scripts?.test ?? "").includes("--timeout"),
		),
		"--timeout",
	);
	ghi("turbo", !doc(goc, TURBO).includes("--timeout"), "turbo");
	return { dat, loi };
}

function hamBao(nut) {
	let n = nut.parent;
	while (n && !ts.isFunctionLike(n)) n = n.parent;
	return n;
}

function bienLay(nguon, id) {
	const ham = hamBao(id);
	const ra = [];
	if (!ham) return null;
	duyet(ham, (n) => {
		if (
			ts.isVariableDeclaration(n) &&
			n.name.getText(nguon) === id.text &&
			hamBao(n) === ham
		)
			ra.push(n.initializer?.getText(nguon) ?? "");
	});
	return ra.length === 1 ? ra[0] : null;
}

const laTran = (nguon, e) =>
	e.getText(nguon) === "TAI_LIEU.diff.tranSuaKhoi" ||
	(ts.isIdentifier(e) && bienLay(nguon, e) === "TAI_LIEU.diff.tranSuaKhoi");

function coChuThich(chu) {
	const quet = ts.createScanner(
		ts.ScriptTarget.Latest,
		false,
		ts.LanguageVariant.Standard,
		chu,
	);
	for (let k = quet.scan(); k !== ts.SyntaxKind.EndOfFileToken; k = quet.scan())
		if (
			k === ts.SyntaxKind.SingleLineCommentTrivia ||
			k === ts.SyntaxKind.MultiLineCommentTrivia
		)
			return true;
	return false;
}

function demSo(nguon) {
	const dem = new Map();
	duyet(nguon, (n) => {
		if (!ts.isNumericLiteral(n)) return;
		const so = Number(n.text.replace(/_/g, ""));
		dem.set(so, (dem.get(so) ?? 0) + 1);
	});
	return dem;
}

function chuKy(nguon) {
	const ra = new Map();
	duyet(nguon, (n) => {
		if (
			!ts.isFunctionDeclaration(n) ||
			!n.name ||
			!EXPORT.includes(n.name.text)
		)
			return;
		const thamSo = n.parameters.map((p) => p.getText(nguon)).join(", ");
		ra.set(
			n.name.text,
			`${n.name.text}(${thamSo}): ${n.type?.getText(nguon) ?? ""}`,
		);
	});
	return ra;
}

function chanDungTran(nguon) {
	let dung = false;
	duyet(nguon, (n) => {
		if (!ts.isConditionalExpression(n)) return;
		const dk = n.condition;
		if (
			!ts.isBinaryExpression(dk) ||
			dk.operatorToken.kind !== ts.SyntaxKind.GreaterThanToken
		)
			return;
		if (
			!ts.isCallExpression(dk.left) ||
			tenGoi(dk.left) !== "canDuoiSua" ||
			!laTran(nguon, dk.right)
		)
			return;
		const nhanh = n.whenFalse;
		if (!ts.isCallExpression(nhanh) || tenGoi(nhanh) !== "diffArrays") return;
		const tuy = nhanh.arguments[2];
		if (!tuy || !ts.isObjectLiteralExpression(tuy)) return;
		const max = tuy.properties.find(
			(p) => p.name?.getText(nguon) === "maxEditLength",
		);
		dung =
			!!max && ts.isPropertyAssignment(max) && laTran(nguon, max.initializer);
	});
	return dung;
}

function kiemMa(goc, gocMoc) {
	const loi = [];
	const dat = [];
	const chu = doc(goc, MA);
	const nguon = cay(MA, chu);
	const cu = cay(MA, gocMoc);
	const ghi = (ten, dung, thongDiep) =>
		dung ? dat.push(ten) : loi.push(`luat ma: ${thongDiep}`);
	ghi("a-chu-thich", !coChuThich(chu), "chu thich");
	ghi("b-chan-dung-tran", chanDungTran(nguon), "chan khong dung tran");
	const moi = demSo(nguon);
	const truoc = demSo(cu);
	const soMoi = [...moi]
		.filter(([so, n]) => n > (truoc.get(so) ?? 0))
		.map(([so]) => so);
	ghi(
		"c-so-moi",
		soMoi.every((so) => SO_CHO_PHEP.has(so)),
		`so ma ${soMoi.filter((s) => !SO_CHO_PHEP.has(s)).join(",")}`.trim(),
	);
	const kyMoi = chuKy(nguon);
	const kyCu = chuKy(cu);
	for (const ten of EXPORT)
		ghi(
			`d-chu-ky-${ten}`,
			kyMoi.get(ten) === kyCu.get(ten) && kyCu.has(ten),
			`chu ky ${ten}`,
		);
	return { dat, loi };
}

function gocMoc() {
	try {
		return execFileSync("git", ["show", `${MOC}:${MA}`], {
			cwd: GOC,
			encoding: "utf8",
		});
	} catch {
		console.error(`khong co moc ${MOC.slice(0, 8)}`);
		process.exit(2);
	}
}

function banSao() {
	const noi = join(GOC, ".acceptance-runs", SLUG, `luat-${process.pid}`);
	rmSync(noi, { recursive: true, force: true });
	for (const t of [SPEC, MA, GOI, GOI_GOC, TURBO, ...BUNFIG])
		if (existsSync(join(GOC, t))) {
			mkdirSync(dirname(join(noi, t)), { recursive: true });
			cpSync(join(GOC, t), join(noi, t));
		}
	return noi;
}

function sua(noi, tep, f) {
	const duong = join(noi, tep);
	const cu = existsSync(duong) ? readFileSync(duong, "utf8") : "";
	const moi = f(cu);
	if (moi === cu) throw new Error(`pha khong doi gi: ${tep}`);
	writeFileSync(duong, moi);
}

const PHA = {
	thuoc: [
		[
			"noi thuoc: tat-dinh co tran rieng",
			SPEC,
			(c) => {
				const dau = c.indexOf('test("tat-dinh:');
				const cuoi = c.indexOf("\n\t});", dau);
				if (dau < 0 || cuoi < 0) return c;
				return `${c.slice(0, cuoi)}\n\t}, 20_000);${c.slice(cuoi + "\n\t});".length)}`;
			},
		],
		[
			"noi thuoc: TRAN_MS",
			SPEC,
			(c) => c.replace(TRAN_MS_GOC, "process.env.CI ? 60_000 : 2_000"),
		],
		[
			"noi thuoc: setDefaultTimeout",
			SPEC,
			(c) => `${c}\nsetDefaultTimeout(20_000);\n`,
		],
		[
			"noi thuoc: tuy chon timeout",
			SPEC,
			(c) =>
				c.replace(
					'describe("tai-lieu-diff", () => {',
					'describe("tai-lieu-diff", { timeout: 20_000 }, () => {',
				),
		],
		["noi thuoc: bunfig", BUNFIG[0], (c) => `${c}[test]\ntimeout = 20000\n`],
		[
			"noi thuoc: --timeout",
			GOI,
			(c) =>
				c.replace('"test": "bun test"', '"test": "bun test --timeout 20000"'),
		],
		[
			"noi thuoc: turbo",
			TURBO,
			(c) => c.replace("{", '{\n\t"//": "--timeout 20000",'),
		],
	],
	ma: [
		[
			"luat ma: chu thich",
			MA,
			(c) => c.replace("function canDuoiSua", "// x\nfunction canDuoiSua"),
		],
		[
			"luat ma: so ma 2000",
			MA,
			(c) => c.replace("canDuoiSua(a, b) > tran", "canDuoiSua(a, b) > 2000"),
		],
		[
			"luat ma: chan khong dung tran",
			MA,
			(c) => c.replace("canDuoiSua(a, b) > tran", "false"),
		],
		[
			"luat ma: chu ky soSanh",
			MA,
			(c) =>
				c
					.replace(
						"export function soSanh(truoc: string, sau: string)",
						"export function soSanh(cu: string, sau: string)",
					)
					.replace("const a = khoiCua(truoc);", "const a = khoiCua(cu);"),
		],
	],
};

function chay(phan, goc, moc) {
	return phan === "thuoc" ? kiemThuoc(goc) : kiemMa(goc, moc);
}

const phan = process.argv[process.argv.indexOf("--phan") + 1];
if (!["thuoc", "ma"].includes(phan)) {
	console.error("dung: luat.mjs --phan thuoc|ma [--chieu-do]");
	process.exit(2);
}
const moc = phan === "ma" ? gocMoc() : "";

if (!process.argv.includes("--chieu-do")) {
	const { dat, loi } = chay(phan, GOC, moc);
	for (const ten of dat) console.log(`kiem ${ten}: dat`);
	for (const l of loi) console.error(l);
	process.exit(loi.length ? 1 : 0);
}

let lot = 0;
const noi = banSao();
try {
	const lanh = chay(phan, noi, moc);
	if (lanh.loi.length) {
		console.error(`ban sao lanh do: ${lanh.loi.join("; ")}`);
		lot += 1;
	} else console.log(`ban sao lanh: ${lanh.dat.length} kiem dat`);
	for (const [ghim, tep, f] of PHA[phan]) {
		const rieng = banSao();
		sua(rieng, tep, f);
		const { loi } = chay(phan, rieng, moc);
		if (loi.includes(ghim)) console.log(`pha "${ghim}": bat`);
		else {
			console.error(`pha "${ghim}": lot (${loi.join("; ") || "khong loi"})`);
			lot += 1;
		}
	}
} finally {
	rmSync(noi, { recursive: true, force: true });
}
process.exit(lot ? 1 : 0);
