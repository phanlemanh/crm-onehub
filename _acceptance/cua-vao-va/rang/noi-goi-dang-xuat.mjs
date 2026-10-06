import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const NOI_GOI = [
	"apps/app/components/app-header.tsx",
	"apps/app/app/(landing)/het-quyen/sign-out-button.tsx",
	"apps/app/app/(landing)/grant-access/grant-access.tsx",
];

function danhSach() {
	if (process.env.NOI_GOI_TEP) return process.env.NOI_GOI_TEP.split(":");
	return NOI_GOI.map((t) => join(GOC, t));
}

function soi(duong) {
	const nguon = ts.createSourceFile(
		duong,
		readFileSync(duong, "utf8"),
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
	const goi = [];
	const chuNut = new Set();
	const duyet = (n) => {
		if (
			ts.isCallExpression(n) &&
			n.expression.getText() === "signOutAndRedirect" &&
			n.arguments[0]
		) {
			goi.push(n.arguments[0].getText());
		}
		if (ts.isJsxExpression(n) && n.expression && ts.isJsxElement(n.parent)) {
			chuNut.add(n.expression.getText());
		}
		ts.forEachChild(n, duyet);
	};
	duyet(nguon);
	return { goi, chuNut };
}

const dong = [];
const ghi = (dat, chu) => dong.push({ dat, chu });
let tong = 0;

for (const duong of danhSach()) {
	const ten = duong.replace(`${GOC}/`, "");
	const { goi, chuNut } = soi(duong);
	tong += goi.length;
	if (goi.length === 0) ghi(false, `${ten}: khong tim thay loi goi signOutAndRedirect`);
	for (const doiSo of goi) {
		if (doiSo.includes(".message")) {
			ghi(false, `${ten}: doi so ${doiSo} lay .message cua loi`);
		} else if (chuNut.has(doiSo)) {
			ghi(false, `${ten}: doi so ${doiSo} trung chu cua nut — cau loi la nhan nut`);
		} else {
			ghi(true, `${ten}: doi so ${doiSo} la cau loi rieng`);
		}
	}
}

ghi(tong === NOI_GOI.length, `${tong}/${NOI_GOI.length} noi goi`);

for (const d of dong) console.log(`${d.dat ? "DUNG" : "SAI"} ${d.chu}`);
const sai = dong.filter((d) => !d.dat).length;
console.log(`KET LUAN ${dong.length - sai} DUNG, ${sai} SAI — ma thoat ${sai ? 1 : 0}`);
process.exit(sai ? 1 : 0);
