import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DAY = dirname(fileURLToPath(import.meta.url));
const GOC = join(DAY, "..", "..", "..");
const ts = createRequire(join(GOC, "package.json"))("typescript");

const DIALOG = join(GOC, "apps", "app", "app", "(app)", "[slug]", "settings", "members", "chuyen-viec-dialog.tsx");
const CACHE = join(GOC, "apps", "app", "lib", "trpc", "cache.ts");
const MUC = "workTransferred";
const CAM = new Set(["invalidateQueries", "refetchQueries", "queryKey", "useQueryClient"]);
const BA_KHOA = [
	"trpc.onboarding.manDanhMuc.queryKey()",
	"trpc.onboarding.bangCot.queryKey()",
	"trpc.onboarding.transferPreview.queryKey()",
];
const MAU_DOI_CHUNG = `
function lamMoiSai(trpc) {
	const queryClient = useQueryClient();
	return queryClient.invalidateQueries({ queryKey: trpc.x.queryKey() });
}
`;
const SO_VI_PHAM_MAU = 3;

let dung = 0;
let sai = 0;

function kiem(dat, cau) {
	if (dat) dung += 1;
	else sai += 1;
	console.log(`${dat ? "DUNG" : "SAI"} ${cau}`);
}

function khongDo(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

function cay(ten, maNguon) {
	return ts.createSourceFile(ten, maNguon, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

function docCay(tep) {
	try {
		return cay(tep, readFileSync(tep, "utf8"));
	} catch (loi) {
		return khongDo(`khong doc duoc ${tep} — ${loi.message}`);
	}
}

function moiNut(goc, lam) {
	const di = (n) => {
		lam(n);
		ts.forEachChild(n, di);
	};
	di(goc);
}

function loiGoi(nguon) {
	const ra = [];
	moiNut(nguon, (n) => {
		if (!ts.isCallExpression(n)) return;
		const e = n.expression;
		const ten = ts.isPropertyAccessExpression(e) ? e.name.text : ts.isIdentifier(e) ? e.text : null;
		if (ten) ra.push({ ten, dong: nguon.getLineAndCharacterOfPosition(n.getStart()).line + 1 });
	});
	return ra;
}

const gon = (n) => n.getText().replace(/\s+/g, "");

console.log(`soi ${DIALOG}`);
console.log(`soi ${CACHE}`);

const mau = loiGoi(cay("mau.tsx", MAU_DOI_CHUNG)).filter((g) => CAM.has(g.ten));
if (mau.length !== SO_VI_PHAM_MAU)
	khongDo(`thuoc hong — doan ma mau phai bi bat ${SO_VI_PHAM_MAU} vi pham, bat ${mau.length} (${mau.map((g) => g.ten).join(", ")})`);
console.log(`DOI CHUNG AM doan ma mau bi bat ${mau.length}/${SO_VI_PHAM_MAU} vi pham: ${mau.map((g) => g.ten).join(", ")}`);

const dialog = docCay(DIALOG);
const goiDialog = loiGoi(dialog);
const viPham = goiDialog.filter((g) => CAM.has(g.ten));
if (viPham.length === 0) kiem(true, "chuyen-viec-dialog.tsx: 0 loi goi invalidateQueries/refetchQueries/queryKey/useQueryClient");
else for (const g of viPham) kiem(false, `chuyen-viec-dialog.tsx:${g.dong} ${g.ten}`);
const tenGoi = goiDialog.map((g) => g.ten);
kiem(tenGoi.includes("useCrmCache"), `chuyen-viec-dialog.tsx ${tenGoi.includes("useCrmCache") ? "goi" : "khong goi"} useCrmCache()`);
kiem(tenGoi.includes(MUC), `chuyen-viec-dialog.tsx ${tenGoi.includes(MUC) ? "goi" : "khong goi"} .${MUC}(`);

const cache = docCay(CACHE);
let trongKieu = false;
let mucTraVe = null;
moiNut(cache, (n) => {
	if (ts.isTypeAliasDeclaration(n) && n.name.text === "CrmCache" && ts.isTypeLiteralNode(n.type)) {
		trongKieu = n.type.members.some((m) => m.name && m.name.getText() === MUC);
	}
	if (ts.isPropertyAssignment(n) && n.name.getText() === MUC) mucTraVe = n.initializer;
});
kiem(trongKieu, `cache.ts: kieu CrmCache ${trongKieu ? "co" : "khong co"} ${MUC}`);
kiem(mucTraVe !== null, `cache.ts: doi tuong useCrmCache ${mucTraVe ? "co" : "khong co"} muc ${MUC}`);

let loiRun = null;
if (mucTraVe)
	moiNut(mucTraVe, (n) => {
		if (loiRun === null && ts.isCallExpression(n) && n.expression.getText() === "run") loiRun = n;
	});
const [dau, sau] = loiRun ? loiRun.arguments : [];
const mangDau = dau && ts.isArrayLiteralExpression(dau) ? dau.elements.map(gon) : null;
const sauRong = sau !== undefined && ts.isArrayLiteralExpression(sau) && sau.elements.length === 0;
const dungBa =
	mangDau !== null && mangDau.length === BA_KHOA.length && BA_KHOA.every((k) => mangDau.includes(k)) && sauRong;
kiem(
	dungBa,
	`cache.ts: muc ${MUC} ${loiRun ? `goi run([${(mangDau ?? []).join(", ")}], ${sau ? gon(sau) : "?"})` : "khong goi run(...)"}${dungBa ? "" : ` — can run([${BA_KHOA.join(", ")}], [])`}`,
);

console.log(`${dung} DUNG, ${sai} SAI — ma thoat ${sai === 0 ? 0 : 1}`);
process.exit(sai === 0 ? 0 : 1);
