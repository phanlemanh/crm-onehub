import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DAY = dirname(fileURLToPath(import.meta.url));
const GOC = process.env.GOC_KHO ?? join(DAY, "..", "..", "..");
const ts = createRequire(join(DAY, "..", "..", "..", "package.json"))("typescript");

const THU_MUC = join(GOC, "apps", "app", "app", "(app)", "[slug]", "settings", "members");
const CACHE = join(GOC, "apps", "app", "lib", "trpc", "cache.ts");
const CAM_MOI_TEP = new Set(["invalidateQueries", "refetchQueries", "queryKey"]);
const TEP_KHOI_DUOI = ["allowances-table.tsx", "cho-phep-dia-chi.tsx"];
const TEP_VONG_NAY = ["page.tsx", "members-table.tsx", "allowances-table.tsx", "cho-phep-dia-chi.tsx"];
const MAU_DOI_CHUNG = `
function lamMoiSai(queryClient, trpc, list) {
	queryClient.invalidateQueries({ queryKey: trpc.workspace.allowances.queryKey() });
	return list.refetch();
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

function viPham(nguon, khoiDuoi) {
	return loiGoi(nguon).filter((g) => CAM_MOI_TEP.has(g.ten) || (khoiDuoi && g.ten === "refetch"));
}

const mau = viPham(cay("mau.tsx", MAU_DOI_CHUNG), true);
if (mau.length !== SO_VI_PHAM_MAU)
	khongDo(`thuoc hong — doan ma mau phai bi bat ${SO_VI_PHAM_MAU} vi pham, bat ${mau.length} (${mau.map((g) => g.ten).join(", ")})`);
console.log(`DOI CHUNG AM doan ma mau bi bat ${mau.length}/${SO_VI_PHAM_MAU} vi pham: ${mau.map((g) => g.ten).join(", ")}`);

const cache = docCay(CACHE);
let mucWorkspace = null;
moiNut(cache, (n) => {
	if (ts.isPropertyAssignment(n) && n.name.getText() === "workspace") mucWorkspace = n.initializer;
});
if (!mucWorkspace) khongDo("cache.ts khong co muc workspace");
let mangDau = null;
moiNut(mucWorkspace, (n) => {
	if (mangDau === null && ts.isCallExpression(n) && n.expression.getText() === "run") {
		const dau = n.arguments[0];
		mangDau = dau && ts.isArrayLiteralExpression(dau) ? dau.elements.map((e) => e.getText().replace(/\s+/g, "")) : [];
	}
});
if (mangDau === null) khongDo("muc workspace cua cache.ts khong goi run(...)");
kiem(
	mangDau.includes("trpc.workspace.allowances.queryKey()"),
	`cache.ts: muc workspace ${mangDau.includes("trpc.workspace.allowances.queryKey()") ? "phu" : "thieu"} workspace.allowances (${mangDau.join(", ")})`,
);

let tep;
try {
	tep = readdirSync(THU_MUC).filter((t) => t.endsWith(".tsx"));
	const ngoai = tep.filter((t) => !TEP_VONG_NAY.includes(t));
	console.log(`GHI CHU ngoai pham vi vong nay, khong cham: ${ngoai.join(", ")}`);
} catch (loi) {
	khongDo(`khong doc duoc ${THU_MUC} — ${loi.message}`);
}
for (const t of TEP_VONG_NAY) if (!tep.includes(t)) khongDo(`thieu ${t} trong ${THU_MUC}`);

for (const t of TEP_VONG_NAY) {
	const nguon = docCay(join(THU_MUC, t));
	const khoiDuoi = TEP_KHOI_DUOI.includes(t);
	const vp = viPham(nguon, khoiDuoi);
	if (vp.length === 0) kiem(true, `${t}: 0 loi goi ${khoiDuoi ? "invalidateQueries/refetchQueries/queryKey/refetch" : "invalidateQueries/refetchQueries/queryKey"}`);
	for (const g of vp) kiem(false, `${t}:${g.dong} ${g.ten}`);
	if (!khoiDuoi) continue;
	const goi = loiGoi(nguon).map((g) => g.ten);
	kiem(goi.includes("useCrmCache"), `${basename(t)} ${goi.includes("useCrmCache") ? "goi" : "khong goi"} useCrmCache()`);
	kiem(goi.includes("workspace"), `${basename(t)} ${goi.includes("workspace") ? "goi" : "khong goi"} .workspace(`);
}

console.log(`${dung} DUNG, ${sai} SAI — ma thoat ${sai === 0 ? 0 : 1}`);
process.exit(sai === 0 ? 0 : 1);
