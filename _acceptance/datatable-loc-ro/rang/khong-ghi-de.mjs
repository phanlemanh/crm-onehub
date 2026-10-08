import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const NHA = join(GOC, ".acceptance-runs", "datatable-loc-ro", "khong-ghi-de");

const TEP = [
	"apps/app/app/(app)/[slug]/contacts/contacts-table.tsx",
	"apps/app/app/(app)/[slug]/companies/companies-table.tsx",
	"apps/app/app/(app)/[slug]/deals/deals-table.tsx",
	"apps/app/app/(app)/[slug]/settings/members/members-table.tsx",
];

const TIEN_TO = [
	"p-3",
	"px-3",
	"py-3",
	"pt-3",
	"pr-3",
	"pb-3",
	"pl-3",
	"ps-3",
	"pe-3",
	"m-3",
	"mx-3",
	"my-3",
	"mt-3",
	"mr-3",
	"mb-3",
	"ml-3",
	"ms-3",
	"me-3",
	"gap-3",
	"gap-x-3",
	"gap-y-3",
	"space-x-3",
	"space-y-3",
	"rounded-xl",
	"bg-red-500",
	"border-red-500",
	"text-red-500",
];

const CHU_DUOC = new Set([
	"xs",
	"sm",
	"base",
	"lg",
	"xl",
	"left",
	"right",
	"center",
	"balance",
	"pretty",
	"wrap",
	"nowrap",
]);

export function lopCam(lop) {
	const tran = lop.replace(/^([a-z0-9-]+:)+/, "").replace(/^!/, "");
	if (/^bg-/.test(tran)) return true;
	if (/^rounded/.test(tran)) return true;
	if (/^-?[pm][xytrblse]?-/.test(tran)) return true;
	if (/^gap(-[xy])?-/.test(tran)) return true;
	if (/^-?space-[xy]-/.test(tran)) return true;
	if (/^border/.test(tran)) return true;
	const chu = tran.match(/^text-(.+)$/);
	if (chu && !CHU_DUOC.has(chu[1]) && !/^\d?xl$/.test(chu[1])) return true;
	return false;
}

export function soi(ten, nguonChu) {
	const nguon = ts.createSourceFile(
		ten,
		nguonChu,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
	const nhap = new Map();
	for (const s of nguon.statements) {
		if (!ts.isImportDeclaration(s)) continue;
		const tu = s.moduleSpecifier.text;
		const nb = s.importClause?.namedBindings;
		if (s.importClause?.name) nhap.set(s.importClause.name.text, tu);
		if (nb && ts.isNamedImports(nb))
			for (const e of nb.elements) nhap.set(e.name.text, tu);
	}
	const thay = [];
	const duyet = (n) => {
		if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
			const the = n.tagName.getText();
			const tu = nhap.get(the.split(".")[0]);
			if (tu?.startsWith("@crm/ui/")) {
				for (const tt of n.attributes.properties) {
					if (!ts.isJsxAttribute(tt) || tt.name.getText() !== "className")
						continue;
					const chu = tt.initializer?.getText() ?? "";
					for (const khop of chu.matchAll(/[A-Za-z0-9_:![\]#./-]+/g)) {
						if (lopCam(khop[0])) thay.push(`<${the}> ${khop[0]}`);
					}
				}
			}
		}
		ts.forEachChild(n, duyet);
	};
	duyet(nguon);
	return thay;
}

export function lopMoi(truoc, sau) {
	const con = new Map();
	for (const l of truoc) con.set(l, (con.get(l) ?? 0) + 1);
	const moi = [];
	for (const l of sau) {
		const n = con.get(l) ?? 0;
		if (n > 0) con.set(l, n - 1);
		else moi.push(l);
	}
	return moi;
}

function git(...a) {
	return execFileSync("git", ["-C", GOC, ...a], { encoding: "utf8" });
}

function banGoc(tep, moc) {
	try {
		return git("show", `${moc}:${tep}`);
	} catch {
		return "";
	}
}

const dong = [];
const ghi = (dat, chu) => dong.push({ dat, chu });

const moc = git("merge-base", "HEAD", "origin/onehub").trim();
for (const tep of TEP) {
	const sau = readFileSync(join(GOC, tep), "utf8");
	const moi = lopMoi(soi(tep, banGoc(tep, moc)), soi(tep, sau));
	ghi(
		moi.length === 0,
		moi.length === 0 ? `${tep}: 0 lop moi` : `${tep}: ${moi.join("; ")}`,
	);
}

if (process.argv.includes("--tu-thu")) {
	mkdirSync(NHA, { recursive: true });
	const tep = TEP[2];
	const goc = readFileSync(join(GOC, tep), "utf8");
	if (!goc.includes("<Button\n"))
		throw new Error(`khong tim thay <Button trong ${tep} de bom lop`);
	let doDung = 0;
	for (const lop of TIEN_TO) {
		const banSao = goc.replace(
			"<Button\n",
			`<Button\n\t\t\t\t\tclassName="${lop}"\n`,
		);
		writeFileSync(join(NHA, `deals-table-${lop}.tsx`), banSao);
		const moi = lopMoi(soi(tep, goc), soi(tep, banSao));
		const bat = moi.some((l) => l.endsWith(` ${lop}`));
		if (bat) doDung += 1;
		ghi(bat, `tu-thu ${lop}: ${bat ? `do — ${tep} ${lop}` : "KHONG bat"}`);
	}
	ghi(doDung === TIEN_TO.length, `${doDung}/${TIEN_TO.length} tien to do`);
}

for (const d of dong) console.log(`${d.dat ? "DUNG" : "SAI"} ${d.chu}`);
const sai = dong.filter((d) => !d.dat).length;
console.log(
	`KET LUAN ${dong.length - sai} DUNG, ${sai} SAI — ma thoat ${sai ? 1 : 0}`,
);
process.exit(sai ? 1 : 0);
