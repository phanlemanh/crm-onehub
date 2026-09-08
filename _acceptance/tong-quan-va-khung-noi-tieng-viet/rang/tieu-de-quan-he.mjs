import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "../../..");
const ts = createRequire(import.meta.url)("typescript");

const TRANG = "apps/app/app/(app)/[slug]/page.tsx";
const KHO = "apps/app/lib/messages/tong-quan.ts";
const HAM_KHO = "tongQuanMessages";
const HAM_TIENG = "getLocale";
const DAU =
	/[àáâãèéêìíòóôõùúýăđĩũơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;
const CHIEU_DO = process.argv.includes("--chieu-do");

function chet(ma, ...loi) {
	for (const d of loi) console.log(d);
	process.exit(ma);
}

function duyet(nut, ham) {
	ham(nut);
	ts.forEachChild(nut, (c) => duyet(c, ham));
}

function cay(ten, ma) {
	return ts.createSourceFile(
		ten,
		ma,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
}

function oTieuDe(nguon) {
	const o = [];
	duyet(cay(TRANG, nguon), (n) => {
		if (ts.isPropertyAssignment(n) && n.name.getText() === "title") o.push(n);
	});
	return o;
}

function goiKho(nut) {
	let day = nut;
	while (
		ts.isPropertyAccessExpression(day) ||
		ts.isElementAccessExpression(day)
	)
		day = day.expression;
	if (!ts.isCallExpression(day)) return null;
	if (day.expression.getText() !== HAM_KHO) return null;
	return day;
}

function khoaCuoi(nut) {
	if (!ts.isPropertyAccessExpression(nut)) return null;
	return nut.name.getText();
}

function do_(nguon) {
	const o = oTieuDe(nguon);
	if (o.length !== 1) {
		return {
			ma: 2,
			loi: [
				`KHONG DO DUOC: ${TRANG} co ${o.length} o tieu de, cho doi dung 1 — ban khai lac hau so voi ma.`,
			],
		};
	}
	const gia = o[0].initializer;
	const goi = goiKho(gia);
	if (!goi) {
		return {
			ma: 1,
			loi: [
				`DO: gia tri title KHONG con la thuoc tinh cua ket qua goi ${HAM_KHO}(...).`,
				`    ${TRANG}:${cay(TRANG, nguon).getLineAndCharacterOfPosition(gia.getStart()).line + 1} viet: ${gia.getText().slice(0, 80)}`,
				"    Mot tieu de viet thang van co the co dau va van doc duoc — nhung no khong con doi tieng theo kho,",
				"    nen phep do phai bat quan he chu khong phai bat hinh dang chuoi.",
			],
		};
	}
	const doiSo = goi.arguments.map((a) => a.getText()).join(", ");
	if (!doiSo.includes(HAM_TIENG)) {
		return {
			ma: 1,
			loi: [
				`DO: ${HAM_KHO} duoc goi voi doi so "${doiSo}" chu khong phai qua ${HAM_TIENG}() — tieu de khong doi theo tieng nguoi doc.`,
			],
		};
	}
	const khoa = khoaCuoi(gia);
	if (!khoa) {
		return {
			ma: 2,
			loi: [
				`KHONG DO DUOC: khong doc duoc ten khoa tu bieu thuc ${gia.getText().slice(0, 60)}`,
			],
		};
	}
	return {
		ma: 0,
		khoa,
		doiSo,
		dong:
			cay(TRANG, nguon).getLineAndCharacterOfPosition(gia.getStart()).line + 1,
	};
}

const nguon = readFileSync(`${GOC}/${TRANG}`, "utf8");

if (CHIEU_DO) {
	const vet = nguon.replace(
		`{ title: ${HAM_KHO}(await ${HAM_TIENG}()).title }`,
		'{ title: "Tổng quan" }',
	);
	if (vet === nguon) {
		chet(
			2,
			`KHONG DO DUOC: khong cam duoc vet vao ${TRANG} — vet da lac hau so voi ma.`,
		);
	}
	const r = do_(vet);
	console.log(
		"--- ben trong: chan chay tren mot BAN SAO da cam vet (title viet thang, co dau) ---",
	);
	for (const d of r.loi ?? []) console.log(`  | ${d}`);
	console.log(`--- het phan cam vao · ma cua phep thu: ${r.ma} ---`);
	if (r.ma !== 1) {
		chet(
			1,
			`DO: cam mot tieu de viet thang CO DAU ma chan tra ma ${r.ma} thay vi 1 — chan nay dang do hinh dang chuoi, khong do quan he.`,
		);
	}
	console.log(
		"\nXANH (chieu do): mat quan he voi kho bi bat, ke ca khi chuoi viet thang van co dau.",
	);
	console.log("Chan nay thoat 0. Cac dong tren la cua phep thu cam vao.");
	process.exit(0);
}

const r = do_(nguon);
if (r.ma !== 0) chet(r.ma, ...r.loi);

const { tongQuanMessages } = await import(`${GOC}/${KHO}`);
const vi = tongQuanMessages("vi")[r.khoa];
const en = tongQuanMessages("en")[r.khoa];
if (typeof vi !== "string" || typeof en !== "string") {
	chet(
		2,
		`KHONG DO DUOC: khoa "${r.khoa}" trong ${KHO} khong phai chuoi o mot trong hai ban.`,
	);
}
console.log(`${TRANG}:${r.dong} — title = ${HAM_KHO}(${r.doiSo}).${r.khoa}`);
console.log(`  vi: "${vi}"  ·  en: "${en}"`);
if (vi === en)
	chet(
		1,
		`DO: ban vi va ban en cua khoa "${r.khoa}" y het nhau — tieu de khong doi theo tieng.`,
	);
if (!DAU.test(vi)) chet(1, `DO: ban vi cua khoa "${r.khoa}" khong co dau nao.`);
console.log(
	`XANH: tieu de doc tu kho qua ${HAM_TIENG}(), ban vi khac ban en va co dau.`,
);
