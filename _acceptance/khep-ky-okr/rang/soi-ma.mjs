import { execFileSync, spawnSync } from "node:child_process";
import {
	copyFileSync,
	existsSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ts = createRequire(import.meta.url)("typescript");

const TEP_NAY = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP_NAY), "..", "..", "..");
const LUOT = "khep-ky-okr";
const GOP_DO = process.env.SOI_MA_GOP ?? null;
const MOC = GOP_DO ? `${GOP_DO}^1` : "origin/onehub";
const LOAI_TRU = new Set([
	"node_modules",
	".next",
	"dist",
	"build",
	"generated",
	".turbo",
]);
const THU_MUC_THU = new Set(["test", "tests", "__tests__"]);
const LA_THU = /\.(spec|test|dom)\.(ts|tsx|mts|mjs|js)$/;

const VUNG_APP = /^apps\/app\/(?!app\/proto\/).+\.tsx$/;
const VUNG_MOI =
	/^(apps|packages|scripts|_acceptance\/[^/]+\/rang)\/.+\.(ts|tsx|mts|mjs|js)$/;
const VUNG_OKR = /^(apps|packages)\/(?!app\/app\/proto\/).*okr.*\.(ts|tsx)$/i;
const DAU_HIEU = [
	{ nhan: "<table>", mau: /<table\b/ },
	{ nhan: "<h1>", mau: /<h1\b/ },
	{ nhan: "<h2>", mau: /<h2\b/ },
	{ nhan: "size-2 rounded-full", mau: /size-2\s+rounded-full/ },
	{ nhan: "divide-y", mau: /divide-y\b/ },
	{
		nhan: "rounded-lg border",
		mau: /rounded-lg\s+border\b|\bborder\s+rounded-lg/,
	},
	{ nhan: "navigator.clipboard", mau: /navigator\.clipboard/ },
	{ nhan: "AlertDialog", mau: /AlertDialog/ },
];
const CHAN = new Set(["DialogFooter", "SheetFooter", "DrawerFooter"]);
const BOC = new Set(["DialogClose", "SheetClose", "DrawerClose"]);
const LA_HUY = /Huỷ|Hủy|\bhuy\b|\bcancel\b/i;
const CHI_O_VALIDATION = ["kiemOkr", "OKR_KHEP", "goiYDiem"];
const NOI_VALIDATION = "packages/validation/src/";
const CAU_HINH = new Set(["OKR_KHEP", "OKR_KIEM"]);
const SO_TRAN = [0.7, 0.1, 500, 2000];
const BIEN_THE = {
	field: "packages/ui/src/components/field.tsx",
	viewSwitch: "packages/ui/src/components/view-switch.tsx",
};
const THUOC_KIEU = new Set(["className", "style"]);

const doiSo = (ten) => {
	const i = process.argv.indexOf(ten);
	return i === -1 ? null : (process.argv[i + 1] ?? "");
};

const tuongDoi = (p) => (p.startsWith(GOC) ? p.slice(GOC.length + 1) : p);

const git = (...d) =>
	execFileSync("git", ["-C", GOC, ...d], { encoding: "utf8" }).trim();

function diCay(thuMuc, duoi, ra) {
	if (!existsSync(thuMuc)) return ra;
	for (const ten of readdirSync(thuMuc)) {
		if (LOAI_TRU.has(ten) || ten.startsWith(".next") || THU_MUC_THU.has(ten))
			continue;
		const duong = join(thuMuc, ten);
		if (statSync(duong).isDirectory()) diCay(duong, duoi, ra);
		else if (duoi.test(ten) && !LA_THU.test(ten)) ra.push(duong);
	}
	return ra;
}

function cay(duong, chu = readFileSync(duong, "utf8")) {
	return ts.createSourceFile(
		duong,
		chu,
		ts.ScriptTarget.Latest,
		true,
		/\.(tsx|jsx)$/.test(duong) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);
}

const dongCuaChu = (chu, doan) =>
	chu.slice(0, chu.lastIndexOf(doan)).split("\n").length;

const dongCua = (sf, pos) => sf.getLineAndCharacterOfPosition(pos).line + 1;

function chuThichTrong(sf) {
	const chu = sf.text;
	const gap = new Map();
	const them = (r) => {
		if (r) for (const c of r) gap.set(c.pos, c);
	};
	const di = (n) => {
		if (n.kind === ts.SyntaxKind.JsxText) return;
		them(ts.getLeadingCommentRanges(chu, n.pos));
		them(ts.getTrailingCommentRanges(chu, n.pos));
		for (const c of n.getChildren(sf)) di(c);
	};
	di(sf);
	return [...gap.values()]
		.sort((a, b) => a.pos - b.pos)
		.map((c) => ({
			dong: dongCua(sf, c.pos),
			chu: chu.slice(c.pos, c.end).split("\n")[0].slice(0, 60),
		}));
}

function chuThichThem(duong, ten, them) {
	return chuThichTrong(cay(duong))
		.filter((c) => them.has(c.dong))
		.map((c) => `chú thích mã: ${ten}:${c.dong} «${c.chu}»`);
}

function soiTepMoi(duong, ten) {
	const sf = cay(duong);
	const hong = [];
	const di = (n) => {
		if (
			ts.isTypeReferenceNode(n) &&
			n.typeName.getText(sf) === "Record" &&
			n.typeArguments?.length === 2 &&
			n.typeArguments[0].kind === ts.SyntaxKind.StringKeyword &&
			n.typeArguments[1].kind === ts.SyntaxKind.UnknownKeyword
		)
			hong.push(
				`Record<string, unknown>: ${ten}:${dongCua(sf, n.getStart(sf))}`,
			);
		if (ts.isCallExpression(n)) {
			const e = n.expression;
			const la =
				(ts.isIdentifier(e) && e.text === "useEffect") ||
				(ts.isPropertyAccessExpression(e) && e.name.text === "useEffect");
			if (la)
				hong.push(`useEffect( trần: ${ten}:${dongCua(sf, n.getStart(sf))}`);
		}
		ts.forEachChild(n, di);
	};
	di(sf);
	return hong;
}

function dauHieuVeTay(chu, ten) {
	return DAU_HIEU.filter(({ mau }) => mau.test(chu)).map(
		({ nhan }) => `dấu hiệu vẽ tay: ${nhan} (${ten})`,
	);
}

const tenThe = (n) =>
	ts.isJsxElement(n)
		? n.openingElement.tagName.getText()
		: ts.isJsxSelfClosingElement(n)
			? n.tagName.getText()
			: null;

const thuocTinh = (n) =>
	(ts.isJsxElement(n) ? n.openingElement : n).attributes.properties;

function nutHuy(duong, ten, them) {
	const sf = cay(duong);
	const hong = [];
	const dem = { chan: 0, huy: 0 };
	const soiChan = (chan) => {
		dem.chan += 1;
		const di = (n, boc) => {
			const the = tenThe(n);
			if (the === "Button" && ts.isJsxElement(n)) {
				const chu = n.children.map((c) => c.getText(sf)).join(" ");
				if (LA_HUY.test(chu)) {
					dem.huy += 1;
					const dong = dongCua(sf, n.getStart(sf));
					if (!boc && them.has(dong))
						hong.push(`nút Huỷ không bọc DialogClose: ${ten}:${dong}`);
				}
			}
			const bocTiep = boc || (the !== null && BOC.has(the));
			ts.forEachChild(n, (c) => di(c, bocTiep));
		};
		ts.forEachChild(chan, (c) => di(c, false));
	};
	const tim = (n) => {
		if (ts.isJsxElement(n) && CHAN.has(tenThe(n))) soiChan(n);
		ts.forEachChild(n, tim);
	};
	tim(sf);
	return { hong, dem };
}

let GOC_SO = null;
function dongThem(t, duong) {
	GOC_SO ??= git("merge-base", "HEAD", MOC);
	const thu = mkdtempSync(join(tmpdir(), "soi-dong-them-"));
	try {
		const cu = join(thu, "cu");
		const r0 = spawnSync("git", ["-C", GOC, "show", `${GOC_SO}:${t}`], {
			encoding: "utf8",
			maxBuffer: 64 * 1024 * 1024,
		});
		writeFileSync(cu, r0.status === 0 ? r0.stdout : "");
		const r = spawnSync(
			"git",
			["diff", "--no-index", "-U0", "--no-color", cu, duong],
			{ encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
		);
		const them = new Set();
		for (const m of (r.stdout ?? "").matchAll(
			/^@@ -\S+ \+(\d+)(?:,(\d+))? @@/gm,
		)) {
			const dau = Number(m[1]);
			const so = m[2] === undefined ? 1 : Number(m[2]);
			for (let k = 0; k < so; k += 1) them.add(dau + k);
		}
		return them;
	} finally {
		rmSync(thu, { recursive: true, force: true });
	}
}

const chuDong = (chu, them) =>
	chu
		.split("\n")
		.filter((_, k) => them.has(k + 1))
		.join("\n");

function giaTriHang(n) {
	if (ts.isNumericLiteral(n)) return Number(n.text.replace(/_/g, ""));
	if (ts.isParenthesizedExpression(n)) return giaTriHang(n.expression);
	if (ts.isBinaryExpression(n)) {
		const a = giaTriHang(n.left);
		const b = giaTriHang(n.right);
		if (a === null || b === null) return null;
		if (n.operatorToken.kind === ts.SyntaxKind.AsteriskToken) return a * b;
		if (n.operatorToken.kind === ts.SyntaxKind.PlusToken) return a + b;
	}
	return null;
}

function trongCauHinh(n) {
	for (let p = n.parent; p; p = p.parent)
		if (
			ts.isVariableDeclaration(p) &&
			ts.isIdentifier(p.name) &&
			CAU_HINH.has(p.name.text)
		)
			return true;
	return false;
}

function soTran(duong, ten, them) {
	const sf = cay(duong);
	const hong = [];
	const di = (n) => {
		if (ts.isBinaryExpression(n) || ts.isNumericLiteral(n)) {
			const cha = n.parent;
			const trongBieuThuc =
				cha && ts.isBinaryExpression(cha) && giaTriHang(cha) !== null;
			const v = giaTriHang(n);
			const dong = dongCua(sf, n.getStart(sf));
			if (
				!trongBieuThuc &&
				v !== null &&
				SO_TRAN.includes(v) &&
				(them === null || them.has(dong)) &&
				!trongCauHinh(n)
			)
				hong.push(
					`số trần ${n.getText(sf)} ngoài OKR_KHEP/OKR_KIEM: ${ten}:${dong}`,
				);
		}
		ts.forEachChild(n, di);
	};
	di(sf);
	return hong;
}

function dinhNghia(sf) {
	const ra = [];
	const di = (n) => {
		if (
			(ts.isFunctionDeclaration(n) ||
				ts.isVariableDeclaration(n) ||
				ts.isClassDeclaration(n)) &&
			n.name &&
			ts.isIdentifier(n.name) &&
			CHI_O_VALIDATION.includes(n.name.text)
		)
			ra.push({ ten: n.name.text, dong: dongCua(sf, n.getStart(sf)) });
		ts.forEachChild(n, di);
	};
	di(sf);
	return ra;
}

function chiOValidation() {
	const hong = [];
	const theoTen = new Map(CHI_O_VALIDATION.map((t) => [t, []]));
	const tep = git(
		"ls-files",
		"--cached",
		"--others",
		"--exclude-standard",
		"--",
		"apps",
		"packages",
	)
		.split("\n")
		.filter(
			(t) =>
				/\.(ts|tsx|mts|mjs|js)$/.test(t) &&
				!t.split("/").some((p) => LOAI_TRU.has(p)) &&
				existsSync(join(GOC, t)),
		)
		.map((t) => join(GOC, t));
	for (const duong of tep) {
		const chu = readFileSync(duong, "utf8");
		if (!CHI_O_VALIDATION.some((t) => chu.includes(t))) continue;
		const t = tuongDoi(duong);
		for (const d of dinhNghia(cay(duong, chu)))
			theoTen.get(d.ten).push(`${t}:${d.dong}`);
	}
	console.log(
		`tep apps/ + packages/ (git ls-files) soi dinh nghia: ${tep.length}`,
	);
	for (const [ten, noi] of theoTen) {
		console.log(`dinh nghia ${ten}: ${noi.join(", ") || "(khong co)"}`);
		const trong = noi.filter((o) => o.startsWith(NOI_VALIDATION));
		if (trong.length !== 1)
			hong.push(
				`${ten} phải định nghĩa đúng một lần ở ${NOI_VALIDATION} (thấy ${trong.length})`,
			);
		for (const o of noi)
			if (!o.startsWith(NOI_VALIDATION))
				hong.push(`${ten} định nghĩa ngoài packages/validation: ${o}`);
	}
	return hong;
}

function bienThe() {
	const hong = [];
	const field = readFileSync(join(GOC, BIEN_THE.field), "utf8");
	const sfField = cay(join(GOC, BIEN_THE.field), field);
	let coHoi = false;
	const diField = (n) => {
		if (
			ts.isPropertyAssignment(n) &&
			n.name.getText(sfField) === "hoi" &&
			ts.isObjectLiteralExpression(n.parent) &&
			ts.isPropertyAssignment(n.parent.parent) &&
			n.parent.parent.name.getText(sfField) === "variant"
		)
			coHoi = true;
		ts.forEachChild(n, diField);
	};
	diField(sfField);
	if (!coHoi)
		hong.push(`biến thể FieldDescription «hoi» không có ở ${BIEN_THE.field}`);
	const vs = existsSync(join(GOC, BIEN_THE.viewSwitch))
		? readFileSync(join(GOC, BIEN_THE.viewSwitch), "utf8")
		: "";
	if (!/export function ViewSwitch\b/.test(vs))
		hong.push(`ViewSwitch không định nghĩa ở ${BIEN_THE.viewSwitch}`);
	else if (!/<Select\b/.test(vs) || !/\bmd:(hidden|flex)\b/.test(vs))
		hong.push(
			`ViewSwitch ở ${BIEN_THE.viewSwitch} không thu về Select dưới md`,
		);
	console.log(
		`bien the: FieldDescription variant hoi ${coHoi ? "co" : "KHONG"} · ViewSwitch ${vs ? "co" : "KHONG"}`,
	);
	const dem = { hoi: 0, viewSwitch: 0 };
	for (const duong of diCay(join(GOC, "apps/app"), /\.tsx$/, [])) {
		const t = tuongDoi(duong);
		if (t.startsWith("apps/app/app/proto/")) continue;
		const chu = readFileSync(duong, "utf8");
		if (!/FieldDescription|ViewSwitch/.test(chu)) continue;
		const sf = cay(duong, chu);
		const di = (n) => {
			if (
				(ts.isFunctionDeclaration(n) || ts.isVariableDeclaration(n)) &&
				n.name &&
				ts.isIdentifier(n.name) &&
				["ViewSwitch", "FieldDescription"].includes(n.name.text)
			)
				hong.push(
					`${n.name.text} dựng ở chỗ gọi: ${t}:${dongCua(sf, n.getStart(sf))}`,
				);
			const the = tenThe(n);
			if (the === "FieldDescription" || the === "ViewSwitch") {
				const tt = thuocTinh(n);
				const ten = (a) => (ts.isJsxAttribute(a) ? a.name.getText(sf) : null);
				const laHoi =
					the === "FieldDescription" &&
					tt.some(
						(a) =>
							ten(a) === "variant" &&
							a.initializer &&
							/^["{]?"?hoi"?}?$/.test(a.initializer.getText(sf)),
					);
				if (the === "ViewSwitch" || laHoi) {
					dem[the === "ViewSwitch" ? "viewSwitch" : "hoi"] += 1;
					for (const a of tt) {
						if (ts.isJsxSpreadAttribute(a))
							hong.push(
								`${the} nhận spread ở chỗ gọi: ${t}:${dongCua(sf, a.getStart(sf))}`,
							);
						else if (THUOC_KIEU.has(ten(a)))
							hong.push(
								`${the} tự đặt ${ten(a)} ở chỗ gọi: ${t}:${dongCua(sf, a.getStart(sf))}`,
							);
					}
				}
			}
			ts.forEachChild(n, di);
		};
		di(sf);
	}
	console.log(
		`cho goi apps/app: FieldDescription variant="hoi" ${dem.hoi} · ViewSwitch ${dem.viewSwitch}`,
	);
	if (dem.hoi === 0)
		hong.push('không chỗ nào gọi FieldDescription variant="hoi"');
	if (dem.viewSwitch === 0) hong.push("không chỗ nào gọi ViewSwitch");
	return hong;
}

function goiKit() {
	return (
		process.env.CLAUDE_PLUGIN_ROOT ??
		execFileSync(
			"node",
			[
				join(GOC, "scripts", "resolve-plugin.mjs"),
				"--plugin",
				"acceptance-gate",
				"--require",
				"scripts/design-gate.mjs",
			],
			{ encoding: "utf8" },
		).trim()
	);
}

function tepDiff(loc) {
	return git(
		"diff",
		"--name-only",
		"--no-renames",
		`--diff-filter=${loc}`,
		`${MOC}...HEAD`,
	)
		.split("\n")
		.filter(Boolean);
}

async function caThietKe(thay = new Map()) {
	const dai = `${MOC}...HEAD (--no-renames)`;
	const duongCua = (t) => thay.get(t) ?? join(GOC, t);
	const tenCua = (t) => thay.get(t) ?? t;
	const moi = new Set(tepDiff("A"));
	const doi = tepDiff("AM").filter((t) => existsSync(join(GOC, t)));
	const khongThu = (t) =>
		!t.split("/").some((p) => THU_MUC_THU.has(p)) && !LA_THU.test(t);
	const app = doi.filter((t) => VUNG_APP.test(t) && khongThu(t)).sort();
	const tepMa = doi
		.filter((t) => VUNG_MOI.test(t) && !t.split("/").includes("generated"))
		.sort();
	const tepMoi = tepMa.filter((t) => moi.has(t));
	const them = new Map(tepMa.map((t) => [t, dongThem(t, duongCua(t))]));
	for (const t of app) if (!them.has(t)) them.set(t, dongThem(t, duongCua(t)));
	const okr = doi.filter((t) => VUNG_OKR.test(t) && khongThu(t)).sort();

	console.log(`dai so sanh: ${dai}`);
	console.log(`tep giao dien apps/app (${app.length}):`);
	for (const t of app)
		console.log(`  ${tenCua(t)}${moi.has(t) ? " (moi)" : ""}`);
	console.log(`tep ma soi chu thich tren dong them (${tepMa.length}):`);
	for (const t of tepMa)
		console.log(`  ${tenCua(t)}${moi.has(t) ? " (moi)" : ""}`);
	console.log(`tep moi soi Record / useEffect (${tepMoi.length}):`);
	for (const t of tepMoi) console.log(`  ${tenCua(t)}`);
	console.log(
		`tep okr soi so tran ${SO_TRAN.join(", ")} (${okr.length}; moi: ca tep, sua: dong them):`,
	);
	for (const t of okr)
		console.log(`  ${tenCua(t)}${moi.has(t) ? " (moi)" : ""}`);

	const hong = [];
	const kit = app.length > 0 ? goiKit() : null;
	const demHuy = { chan: 0, huy: 0 };
	for (const t of app) {
		const r = spawnSync(
			"node",
			[
				join(kit, "scripts", "design-gate.mjs"),
				"--target",
				thay.has(t) ? duongCua(t) : t,
				"--mode",
				"static",
			],
			{ cwd: GOC, encoding: "utf8" },
		);
		const ra = `${r.stdout ?? ""}${r.stderr ?? ""}`;
		const p0 = Number(ra.match(/"p0_count":\s*(\d+)/)?.[1] ?? Number.NaN);
		if (r.status !== 0 || p0 !== 0)
			hong.push(`design-gate P0: ${tenCua(t)} (ma ${r.status}, p0 ${p0})`);
		const chu = readFileSync(duongCua(t), "utf8");
		const tuTruoc = dauHieuVeTay(chu, tenCua(t));
		const moiThem = dauHieuVeTay(chuDong(chu, them.get(t)), tenCua(t));
		hong.push(...moiThem);
		for (const h of tuTruoc)
			if (!moiThem.includes(h))
				console.log(`co tu truoc, dong cu khong tinh: ${h}`);
		const huy = nutHuy(duongCua(t), tenCua(t), them.get(t));
		hong.push(...huy.hong);
		demHuy.chan += huy.dem.chan;
		demHuy.huy += huy.dem.huy;
		console.log(
			`design-gate ${r.status === 0 && p0 === 0 ? "dat " : "HONG"} ${tenCua(t)} (p0 ${p0}; chan hop thoai ${huy.dem.chan}, nut huy ${huy.dem.huy})`,
		);
	}
	console.log(
		`chan hop thoai da soi: ${demHuy.chan} · nut Huy trong chan: ${demHuy.huy}`,
	);
	for (const t of tepMa)
		hong.push(...chuThichThem(duongCua(t), tenCua(t), them.get(t)));
	for (const t of tepMoi) hong.push(...soiTepMoi(duongCua(t), tenCua(t)));
	for (const t of okr)
		hong.push(
			...soTran(
				duongCua(t),
				tenCua(t),
				moi.has(t) ? null : (them.get(t) ?? dongThem(t, duongCua(t))),
			),
		);
	hong.push(...chiOValidation());
	hong.push(...bienThe());
	const soTep = new Set([...app, ...tepMa, ...okr]).size;
	console.log(`tong tep da soi: ${soTep}`);
	return { hong, soTep };
}

function doTaiGopLuot() {
	if (GOP_DO) return;
	const chung = git("merge-base", "HEAD", "origin/onehub");
	const gop = git(
		"log",
		"--first-parent",
		"--diff-filter=A",
		"--format=%H",
		chung,
		"--",
		`_acceptance/${LUOT}/contract.md`,
	)
		.split("\n")
		.at(-1);
	if (!gop) return;
	console.log(
		`luot ${LUOT} da gop o ${gop.slice(0, 8)}: do tren cay tai commit gop, so voi cha ${git("rev-parse", `${gop}^1`).slice(0, 8)}`,
	);
	const thu = mkdtempSync(join(tmpdir(), "soi-ma-gop-"));
	const cay = join(thu, "cay");
	let ma = 2;
	try {
		git("worktree", "add", "--detach", "--quiet", cay, gop);
		symlinkSync(join(GOC, "node_modules"), join(cay, "node_modules"));
		const tep = fileURLToPath(import.meta.url);
		const banSao = join(cay, tep.slice(GOC.length + 1));
		copyFileSync(tep, banSao);
		const r = spawnSync(process.execPath, [banSao, ...process.argv.slice(2)], {
			stdio: "inherit",
			env: { ...process.env, SOI_MA_GOP: gop },
		});
		ma = r.status ?? 2;
	} finally {
		spawnSync("git", ["-C", GOC, "worktree", "remove", "--force", cay]);
		rmSync(thu, { recursive: true, force: true });
	}
	process.exit(ma);
}

function inVaThoat(hong) {
	for (const h of hong) console.log(`HONG ${h}`);
	console.log(`vi pham: ${hong.length}`);
	process.exit(hong.length === 0 ? 0 : 1);
}

const ca = doiSo("--ca");
if (ca !== "thiet-ke") {
	console.log("KHONG DO DUOC: can --ca thiet-ke");
	process.exit(2);
}
doTaiGopLuot();
const chieuDo = process.argv.includes("--chieu-do");

if (!chieuDo) {
	const { hong, soTep } = await caThietKe();
	if (soTep === 0) {
		console.log("KHONG DO DUOC: diff khong co tep nao de soi");
		process.exit(2);
	}
	inVaThoat(hong);
}

const nguon = tepDiff("M").find(
	(t) => VUNG_APP.test(t) && existsSync(join(GOC, t)) && !t.includes("/test/"),
);
if (!nguon) {
	console.log(
		"KHONG DO DUOC: diff khong co tep giao dien apps/app da sua nao de chep",
	);
	process.exit(2);
}
const thuMuc = mkdtempSync(join(tmpdir(), "soi-thiet-ke-"));
const tep = join(thuMuc, basename(nguon));
const goc = readFileSync(join(GOC, nguon), "utf8");
const banSao = `${goc}\n// x\nexport function HopThoaiGia() {\n\treturn (\n\t\t<DialogFooter>\n\t\t\t<Button variant="outline">Huỷ</Button>\n\t\t</DialogFooter>\n\t);\n}\n`;
writeFileSync(tep, banSao);
const dongChu = dongCuaChu(banSao, "\n// x\n") + 1;
const dongNut = dongCuaChu(banSao, '<Button variant="outline">Huỷ</Button>');
let kq;
try {
	kq = await caThietKe(new Map([[nguon, tep]]));
} finally {
	rmSync(thuMuc, { recursive: true, force: true });
}
for (const h of kq.hong) console.log(`HONG ${h}`);
const ghim = [
	`chú thích mã: ${tep}:${dongChu}`,
	`nút Huỷ không bọc DialogClose: ${tep}:${dongNut}`,
];
let lot = 0;
for (const g of ghim) {
	const bat = kq.hong.some((h) => h.startsWith(g));
	if (!bat) lot += 1;
	console.log(`${bat ? "bat " : "LOT "} ${g}`);
}
console.log(
	`chieu do: ban sao ${nguon} chen \`// x\` va nut Huy khong DialogClose — ${ghim.length - lot}/${ghim.length} vi pham bi bat`,
);
process.exit(lot === 0 ? 1 : 0);
