import { readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const APP = join(GOC, "apps", "app");
const BO_QUA = [join(APP, "test"), join(APP, "app", "proto"), join(APP, "node_modules"), join(APP, ".next")];
const PHAI_NHAP = [
	"apps/app/app/(app)/[slug]/settings/settings-sidebar.tsx",
	"apps/app/components/agent-builder/agent-builder-sidebar.tsx",
];
const NHAP = /from\s+["']@crm\/ui\/components\/area-sidebar["']/;
const SO_TU_DAT = /w-\[213px\]/;
const ASIDE = /<aside\b[^>]*className=(?:"([^"]*)"|\{[^}]*?["'`]([^"'`]*)["'`])/gs;
const BE_RONG = /(?:^|\s)(?:w-56|w-60|w-64|w-\[\d+px\])(?:\s|$)/;
const AN_THEO_KHO = /(?:^|\s)hidden(?:\s|$)/;
const HIEN_THEO_KHO = /(?:^|\s)(?:md|lg):(?:block|flex)(?:\s|$)/;
const TEP_GIEO = join(APP, "components", "__tbk-pha.tsx");

function duyet(thuMuc, ra) {
	if (BO_QUA.includes(thuMuc)) return ra;
	for (const muc of readdirSync(thuMuc, { withFileTypes: true })) {
		const duong = join(thuMuc, muc.name);
		if (muc.isDirectory()) duyet(duong, ra);
		else if (muc.name.endsWith(".tsx")) ra.push(duong);
	}
	return ra;
}

function dongCua(chu, viTri) {
	return chu.slice(0, viTri).split("\n").length;
}

function quet() {
	const tep = duyet(APP, []);
	const viPham = [];
	for (const duong of tep) {
		const chu = readFileSync(duong, "utf8");
		const ten = relative(GOC, duong);
		const so = SO_TU_DAT.exec(chu);
		if (so) viPham.push(`${ten}:${dongCua(chu, so.index)} w-[213px]`);
		for (const m of chu.matchAll(ASIDE)) {
			const lop = m[1] ?? m[2] ?? "";
			if (BE_RONG.test(lop) && AN_THEO_KHO.test(lop) && HIEN_THEO_KHO.test(lop))
				viPham.push(`${ten}:${dongCua(chu, m.index)} <aside className="${lop}">`);
		}
	}
	const daNhap = PHAI_NHAP.filter((t) => NHAP.test(readFileSync(join(GOC, t), "utf8")));
	return { soTep: tep.length, viPham, daNhap };
}

const pha = process.env.TBK_PHA ?? "";
if (pha && pha !== "gieo") {
	console.log(`KHONG DO DUOC: TBK_PHA=${pha} la; chi nhan "gieo"`);
	process.exit(2);
}
if (pha === "gieo")
	writeFileSync(
		TEP_GIEO,
		'export function TbkPha() {\n\treturn <aside className="hidden w-56 md:flex" />;\n}\n',
	);

let ketQua;
try {
	ketQua = quet();
} finally {
	if (pha === "gieo") rmSync(TEP_GIEO, { force: true });
}

const { soTep, viPham, daNhap } = ketQua;
if (soTep === 0) {
	console.log("KHONG DO DUOC: bo quet rong — 0 tep .tsx duoi apps/app");
	process.exit(2);
}
for (const v of viPham) console.log(`SAI AC-9: ${v}`);
for (const t of PHAI_NHAP.filter((t) => !daNhap.includes(t)))
	console.log(`SAI AC-9: ${t} khong nhap AreaSidebar`);
const dat = viPham.length === 0 && daNhap.length === PHAI_NHAP.length;
console.log(
	`${dat ? "DUNG" : "KET LUAN"} AC-9: ${soTep} tep, ${viPham.length} vo thanh ben tu dung, ${daNhap.length}/${PHAI_NHAP.length} tep nhap AreaSidebar`,
);
process.exit(dat ? 0 : 1);
