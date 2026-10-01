import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const ts = createRequire(join(GOC, "package.json"))("typescript");

const vi = process.argv.indexOf("--thiet-ke");
const THIET_KE =
	vi !== -1
		? process.argv[vi + 1]
		: join(GOC, "docs/superpowers/specs/2026-09-30-khung-tao-okr-nhu-deal-design.md");
const SO = join(GOC, "apps/app/app/proto/catalog.ts");
const MODULE_9B = join(GOC, "apps/app/app/proto/_modules/tro-ly-okr-de-xuat");
const DO_TREN_APP = new Set([
	"ST-khung-cot-hep",
	"ST-khung-url-mo",
	"ST-khung-chan-chung",
]);
const THEM = ["ST-khung-deal"];

const thietKe = readFileSync(THIET_KE, "utf8");
const dau = thietKe.indexOf("<!-- <<<UX-STATE-TABLE -->");
const cuoi = thietKe.indexOf("<!-- UX-STATE-TABLE>>> -->");
if (dau === -1 || cuoi === -1) {
	console.log("khong thay bang trang thai trong thiet ke");
	process.exit(2);
}
const bang = thietKe.slice(dau, cuoi);
const idBang = [...bang.matchAll(/^\|\s*(ST-khung-[a-z0-9-]+)\s*\|/gm)].map(
	(m) => m[1],
);
if (idBang.length === 0) {
	console.log("bang trang thai rong");
	process.exit(2);
}
const canCo = new Set([
	...idBang.filter((id) => !DO_TREN_APP.has(id)),
	...THEM,
]);

const so = readFileSync(SO, "utf8");
const muc = so.indexOf('slug: "khung-tao-okr-nhu-deal"');
if (muc === -1) {
	console.log("so ban mau khong co muc khung-tao-okr-nhu-deal");
	process.exit(1);
}
const ketMuc = so.indexOf("\n\t},", muc);
const khuc = so.slice(muc, ketMuc);
const trongSo = new Set(
	[...khuc.matchAll(/id:\s*"(ST-khung-[a-z0-9-]+)"/g)].map((m) => m[1]),
);

const loi = [];
for (const id of canCo) if (!trongSo.has(id)) loi.push(`thieu state: ${id}`);
for (const id of trongSo) if (!canCo.has(id)) loi.push(`state la: ${id}`);
console.log(`state can co: ${canCo.size} · trong so: ${trongSo.size}`);

const CAM = new Set(["Dialog", "DialogContent", "DialogFooter"]);
for (const ten of readdirSync(MODULE_9B)) {
	if (!ten.endsWith(".tsx")) continue;
	const chu = readFileSync(join(MODULE_9B, ten), "utf8");
	const cay = ts.createSourceFile(ten, chu, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
	ts.forEachChild(cay, (n) => {
		if (
			ts.isImportDeclaration(n) &&
			ts.isStringLiteral(n.moduleSpecifier) &&
			n.moduleSpecifier.text === "@crm/ui/components/dialog" &&
			n.importClause?.namedBindings &&
			ts.isNamedImports(n.importClause.namedBindings)
		) {
			for (const e of n.importClause.namedBindings.elements)
				if (CAM.has(e.name.text))
					loi.push(`ban mau 9b con hop thoai: ${ten} nhap ${e.name.text}`);
		}
	});
}

for (const l of loi) console.log(l);
if (loi.length === 0) console.log("ok so ban mau khop bang trang thai; ban mau 9b ve ngan");
process.exit(loi.length > 0 ? 1 : 0);
