import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const DAY = dirname(fileURLToPath(import.meta.url));
const GOC = process.env.GOC_KHO ?? join(DAY, "..", "..", "..");
const ts = createRequire(import.meta.url)("typescript");

const SLUG = join(GOC, "apps", "app", "app", "(app)", "[slug]");
const CAI_DAT = join(SLUG, "settings");

const BANG_BE_RONG = {
	"page.tsx": "page",
	"tracking/page.tsx": "page",
	"currencies/page.tsx": "page",
	"connections/page.tsx": "page",
	"fields/page.tsx": "wide",
	"members/page.tsx": "wide",
	"api-keys/page.tsx": "wide",
	"sso/page.tsx": "wide",
	"onboarding/page.tsx": "wide",
	"organization/page.tsx": "full",
	"okr/page.tsx": "page",
	"connections/google/page.tsx": "page",
	"connections/microsoft/page.tsx": "page",
	"connections/slack/page.tsx": "page",
	"connections/slack/people/page.tsx": "page",
	"connections/zalo/page.tsx": "page",
	"connections/intake/page.tsx": "narrow",
	"../reminders/page.tsx": "page",
	// ve-sinh-do-san-onehub khai-trang: Cài đặt › Giai đoạn thoả thuận (có từ 674dc534d, sau khi hồ sơ này ký) — khai bề rộng
	// đang dùng để bảng đủ trang thật — chân đếm trang không nới (okr-soat-anh-luot-3 E11, DH2 15/10).
	"giai-doan/page.tsx": "page",
	// du-an-gantt khai-trang: Cài đặt › Lịch làm việc (DA4, 17/10, sau khi hồ sơ này ký) — width="page" theo
	// docs/settings.md; khai để bảng đủ trang thật, chân đếm trang không nới.
	"lich-lam-viec/page.tsx": "page",
};
const CHUYEN_HUONG = "notifications/page.tsx";
const MAU_CAM = [
	"ConnectionPage",
	"ConnectionPageLoading",
	"<main",
	"<h1",
	"max-w-3xl",
];

let dung = 0;
let sai = 0;

function khongDo(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

function khang(dat, cau) {
	if (dat) dung += 1;
	else {
		sai += 1;
		console.log(`DO: ${cau}`);
	}
}

function cay(tep) {
	return ts.createSourceFile(
		tep,
		readFileSync(tep, "utf8"),
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

function tenThe(n) {
	return ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)
		? n.tagName.getText()
		: null;
}

function thuocTinh(n, ten) {
	const tt = n.attributes.properties.find(
		(p) => ts.isJsxAttribute(p) && p.name.getText() === ten,
	);
	if (!tt?.initializer) return null;
	return tt.initializer;
}

function chuoiCua(init) {
	if (!init) return null;
	if (ts.isStringLiteral(init)) return init.text;
	if (
		ts.isJsxExpression(init) &&
		init.expression &&
		ts.isStringLiteral(init.expression)
	)
		return init.expression.text;
	return null;
}

function cachKhungChon() {
	const tep = join(CAI_DAT, "connections", "khung-ket-noi.tsx");
	if (!existsSync(tep)) khongDo("khong co connections/khung-ket-noi.tsx");
	let bieuThuc = null;
	moiNut(cay(tep), (n) => {
		if (tenThe(n) === "PageShell") bieuThuc = thuocTinh(n, "width");
	});
	const e =
		bieuThuc && ts.isJsxExpression(bieuThuc) ? bieuThuc.expression : null;
	if (
		!e ||
		!ts.isConditionalExpression(e) ||
		!ts.isBinaryExpression(e.condition) ||
		e.condition.operatorToken.kind !== ts.SyntaxKind.EqualsEqualsEqualsToken ||
		!ts.isStringLiteral(e.condition.right) ||
		!ts.isStringLiteral(e.whenTrue) ||
		!ts.isStringLiteral(e.whenFalse)
	)
		khongDo(
			'khong doc duoc cach KhungKetNoi chon width (mong: con === "x" ? "a" : "b")',
		);
	const la = e.condition.right.text;
	return (con) => (con === la ? e.whenTrue.text : e.whenFalse.text);
}

function beRongCua(tep, chon) {
	const thay = new Set();
	moiNut(cay(tep), (n) => {
		const ten = tenThe(n);
		if (ten === "PageShell")
			thay.add(chuoiCua(thuocTinh(n, "width")) ?? "khong-truyen");
		if (ten === "KhungKetNoi")
			thay.add(chon(chuoiCua(thuocTinh(n, "kind")) ?? "?"));
		if (ten === "OAuthConnectionPage")
			thay.add(chon(chuoiCua(thuocTinh(n, "provider")) ?? "?"));
	});
	return [...thay];
}

function moiTsx(thuMuc) {
	return readdirSync(thuMuc).flatMap((t) => {
		const d = join(thuMuc, t);
		if (statSync(d).isDirectory()) return moiTsx(d);
		return t.endsWith(".tsx") ? [d] : [];
	});
}

if (!existsSync(CAI_DAT)) khongDo(`khong thay ${CAI_DAT}`);

const trang = [...moiTsx(CAI_DAT), ...moiTsx(join(SLUG, "reminders"))]
	.filter((t) => basename(t) === "page.tsx")
	.map((t) => relative(CAI_DAT, t))
	.filter((t) => t !== CHUYEN_HUONG);
const khai = Object.keys(BANG_BE_RONG);
if (trang.length !== khai.length || trang.some((t) => !khai.includes(t)))
	khongDo(
		`so trang tim thay ${trang.length} lech bang ${khai.length}: ${trang.filter((t) => !khai.includes(t)).join(", ")}`,
	);

const chon = cachKhungChon();
for (const [t, mong] of Object.entries(BANG_BE_RONG)) {
	const ten = t.replace(/\/?page\.tsx$/, "").replace(/^\.\.\//, "") || "chung";
	const thay = beRongCua(join(CAI_DAT, t), chon);
	khang(
		thay.length === 1 && thay[0] === mong,
		`${ten}: width ${thay.join("|") || "khong co PageShell"}, bang doi ${mong}`,
	);
}

const tepCay = moiTsx(CAI_DAT);
for (const mau of MAU_CAM) {
	const trung = tepCay.filter((tep) => {
		let co = false;
		moiNut(cay(tep), (n) => {
			const ten = tenThe(n);
			if (mau === "<main" && ten === "main") co = true;
			else if (mau === "<h1" && ten === "h1") co = true;
			else if (mau === ten) co = true;
			else if (
				mau === "max-w-3xl" &&
				ts.isStringLiteralLike(n) &&
				n.text.split(/\s+/).includes("max-w-3xl")
			)
				co = true;
		});
		return co;
	});
	khang(
		trung.length === 0,
		`mau cam ${mau} o ${trung.map((t) => relative(CAI_DAT, t)).join(", ")}`,
	);
}

console.log(`cau-truc: ${dung}/${dung + sai} khang dinh dat`);
process.exit(sai === 0 ? 0 : 1);
