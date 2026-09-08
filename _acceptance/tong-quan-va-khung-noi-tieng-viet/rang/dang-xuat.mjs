import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "../../..");
const ts = createRequire(import.meta.url)("typescript");
const KHAI = JSON.parse(readFileSync(`${HERE}/lat-tong-quan.json`, "utf8"));
const FILE = [
	...KHAI.thu_muc.flatMap((d) =>
		readdirTsx(`${GOC}/${d}`).map((f) => `${d}/${f}`),
	),
	...KHAI.them,
];
const GOI = "apps/app/components/app-header.tsx";
const DICH = "apps/app/lib/sign-out.ts";
const HAM = "signOutAndRedirect";

function readdirTsx(thuMuc) {
	return createRequire(import.meta.url)("node:fs")
		.readdirSync(thuMuc)
		.filter((f) => f.endsWith(".tsx"));
}

function cay(duong) {
	return ts.createSourceFile(
		duong,
		readFileSync(`${GOC}/${duong}`, "utf8"),
		ts.ScriptTarget.Latest,
		true,
		duong.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);
}

function duyet(nut, ham) {
	ham(nut);
	ts.forEachChild(nut, (c) => duyet(c, ham));
}

function laToast(nut) {
	return (
		ts.isCallExpression(nut) &&
		ts.isPropertyAccessExpression(nut.expression) &&
		nut.expression.expression.getText() === "toast"
	);
}

function chuAnh(chuoi) {
	return /[A-Za-z]{3,}/.test(chuoi) && !/[ăâđêôơưàảãáạ]/i.test(chuoi);
}

const do_ = [];
const thay = { literal: 0, goi: 0 };

for (const f of FILE) {
	const nguon = cay(f);
	duyet(nguon, (n) => {
		if (!laToast(n)) return;
		thay.goi += 1;
		for (const doiSo of n.arguments) {
			if (ts.isStringLiteral(doiSo) && chuAnh(doiSo.text)) {
				const { line } = nguon.getLineAndCharacterOfPosition(doiSo.getStart());
				thay.literal += 1;
				do_.push(
					`LITERAL TRONG TOAST: ${f}:${line + 1} ${JSON.stringify(doiSo.text)} — cau phai di tu kho`,
				);
			}
		}
	});
}

let khoaTruyen = null;
duyet(cay(GOI), (n) => {
	if (
		ts.isCallExpression(n) &&
		n.expression.getText() === HAM &&
		n.arguments.length === 1
	) {
		khoaTruyen = n.arguments[0].getText();
	}
});
if (khoaTruyen === null)
	do_.push(`${GOI}: khong thay loi goi ${HAM}(<khoa kho>) mot doi so`);
else if (!/^t\.header\.signOutFailed$/.test(khoaTruyen))
	do_.push(
		`${GOI}: ${HAM} nhan ${JSON.stringify(khoaTruyen)}, khong phai t.header.signOutFailed`,
	);

let thamSo = null;
let toastDocThamSo = false;
duyet(cay(DICH), (n) => {
	if (ts.isFunctionDeclaration(n) && n.name?.text === HAM)
		thamSo = n.parameters[0]?.name.getText() ?? null;
	if (laToast(n) && thamSo !== null) {
		const chu = n.arguments.map((a) => a.getText()).join(",");
		if (new RegExp(`\\b${thamSo}\\b`).test(chu)) toastDocThamSo = true;
	}
});
if (thamSo === null) do_.push(`${DICH}: ${HAM} khong co tham so cau loi`);
else if (!toastDocThamSo)
	do_.push(`${DICH}: toast.error khong doc tham so ${thamSo}`);

console.log(
	`quet ${FILE.length} file · ${thay.goi} loi goi toast · literal tieng Anh trong toast: ${thay.literal}`,
);
console.log(
	`quan he: ${GOI} truyen ${khoaTruyen ?? "?"} → ${DICH} tham so ${thamSo ?? "?"} → toast.error ${toastDocThamSo ? "doc" : "KHONG doc"} tham so`,
);
for (const d of do_) console.log(`DO: ${d}`);
if (thay.goi === 0) {
	console.log("KHONG DO DUOC: 0 loi goi toast trong lat — tap rong khong bao gio la dat.");
	process.exit(2);
}
process.exit(do_.length > 0 ? 1 : 0);
