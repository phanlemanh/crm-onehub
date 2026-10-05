import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const TEP = [
	"apps/app/app/(app)/[slug]/error.tsx",
	"apps/app/app/(app)/error.tsx",
	"apps/app/components/trang-loi-tam.tsx",
	"apps/app/components/dau-cua-vao.tsx",
	"apps/app/components/auth-shell.tsx",
	"apps/app/app/(landing)/quen-mat-khau/quen-mat-khau-form.tsx",
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

function lopCam(lop) {
	const tran = lop.replace(/^(hover:|dark:|focus:|sm:|md:|lg:)+/, "");
	if (/^bg-/.test(tran)) return true;
	if (/^rounded/.test(tran)) return true;
	if (/^-?[pm][xytrbl]?-/.test(tran)) return true;
	if (/^gap-/.test(tran)) return true;
	if (/^border/.test(tran)) return true;
	const chu = tran.match(/^text-(.+)$/);
	if (chu && !CHU_DUOC.has(chu[1]) && !/^\d?xl$/.test(chu[1])) return true;
	return false;
}

export function soi(duong) {
	const nguon = ts.createSourceFile(
		duong,
		readFileSync(duong, "utf8"),
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
	const loi = [];
	const duyet = (n) => {
		if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
			const ten = n.tagName.getText();
			const tu = nhap.get(ten.split(".")[0]);
			if (tu?.startsWith("@crm/ui/")) {
				for (const tt of n.attributes.properties) {
					if (!ts.isJsxAttribute(tt) || tt.name.getText() !== "className")
						continue;
					const chu = (tt.initializer?.getText() ?? "").replace(
						/^[{"'`]+|[}"'`]+$/g,
						"",
					);
					for (const lop of chu.split(/\s+/).filter(Boolean)) {
						if (lopCam(lop)) loi.push(`<${ten}> className ${lop}`);
					}
				}
			}
		}
		ts.forEachChild(n, duyet);
	};
	duyet(nguon);
	return loi;
}

const dong = [];
const ghi = (dat, chu) => dong.push({ dat, chu });

const danhSach = process.env.KHONG_GHI_DE_TEP
	? process.env.KHONG_GHI_DE_TEP.split(":")
	: TEP.map((t) => join(GOC, t));
for (const duong of danhSach) {
	const loi = soi(duong);
	const ten = duong.replace(`${GOC}/`, "");
	ghi(
		loi.length === 0,
		loi.length === 0 ? `${ten}: 0 lop ghi de` : `${ten}: ${loi.join("; ")}`,
	);
}

if (!process.env.KHONG_GHI_DE_TEP) {
	const nha = join(GOC, ".acceptance-runs", "cua-vao-va", "khong-ghi-de");
	mkdirSync(nha, { recursive: true });
	const goc = readFileSync(
		join(GOC, "apps/app/components/trang-loi-tam.tsx"),
		"utf8",
	);
	let doDung = 0;
	for (const lop of ["rounded-[7px]", "bg-[#ff0000]", "px-6"]) {
		const banSao = join(
			nha,
			`trang-loi-tam-${lop.replace(/[^a-z0-9]/gi, "")}.tsx`,
		);
		writeFileSync(
			banSao,
			goc.replace("<Button\n", `<Button\n\t\t\t\t\tclassName="${lop}"\n`),
		);
		const loi = soi(banSao);
		const bat = loi.some((l) => l.endsWith(`className ${lop}`));
		if (bat) doDung += 1;
		ghi(
			bat,
			`pha-thu ${lop}: ${bat ? "bat duoc" : "KHONG bat"} (${loi.join("; ")})`,
		);
	}
	ghi(doDung === 3, `${doDung}/3 o do`);
}

for (const d of dong) console.log(`${d.dat ? "DUNG" : "SAI"} ${d.chu}`);
const sai = dong.filter((d) => !d.dat).length;
console.log(
	`KET LUAN ${dong.length - sai} DUNG, ${sai} SAI — ma thoat ${sai ? 1 : 0}`,
);
process.exit(sai ? 1 : 0);
