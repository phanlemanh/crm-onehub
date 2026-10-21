import { readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const APP = join(GOC, "apps", "app");
const CAU_HINH = join(APP, "next.config.ts");
const BO_QUA = [join(APP, "test"), join(APP, "app", "proto")];
const DUONG_CU =
	/\/okr\/(?:theo-don-vi|toan-canh|hoi-y|quanh-muc-tieu)(?![\w-])/g;
const CHI_DINH_MODULE =
	/(\bfrom\s+|\bimport\s*\(\s*|\bimport\s+)(["'])[^"'\n]*\2/g;
const TEP_GIEO = join(APP, "components", "__vkm-pha.ts");

function duyet(thuMuc, ra) {
	if (BO_QUA.includes(thuMuc)) return ra;
	for (const muc of readdirSync(thuMuc, { withFileTypes: true })) {
		if (muc.name.startsWith(".") || muc.name === "node_modules") continue;
		const duong = join(thuMuc, muc.name);
		if (muc.isDirectory()) duyet(duong, ra);
		else if (/\.tsx?$/.test(muc.name)) ra.push(duong);
	}
	return ra;
}

async function chuoiMien() {
	const mod = await import(CAU_HINH);
	const cauHinh = mod.default;
	const chuyen = (await cauHinh.redirects?.()) ?? [];
	const viet = (await cauHinh.rewrites?.()) ?? [];
	const ds = Array.isArray(viet)
		? viet
		: [
				...(viet.beforeFiles ?? []),
				...(viet.afterFiles ?? []),
				...(viet.fallback ?? []),
			];
	const ra = new Set();
	for (const luat of [...chuyen, ...ds]) {
		ra.add(luat.source);
		ra.add(luat.destination);
	}
	return ra;
}

function xoaChuoiMien(chu, mien) {
	let ra = chu;
	for (const s of mien) ra = ra.split(JSON.stringify(s)).join('""');
	return ra;
}

function xoaChiDinhModule(chu) {
	return chu.replace(CHI_DINH_MODULE, (khop) => khop.replace(/[^\n]/g, " "));
}

function dongCua(chu, viTri) {
	return chu.slice(0, viTri).split("\n").length;
}

async function quet() {
	const mien = await chuoiMien();
	const tep = duyet(APP, []);
	const viPham = [];
	for (const duong of tep) {
		const goc = readFileSync(duong, "utf8");
		const chu = xoaChiDinhModule(
			duong === CAU_HINH ? xoaChuoiMien(goc, mien) : goc,
		);
		const ten = relative(GOC, duong);
		for (const m of chu.matchAll(DUONG_CU))
			viPham.push(`${ten}:${dongCua(chu, m.index)} ${m[0]}`);
	}
	return { soTep: tep.length, viPham, soMien: mien.size };
}

const pha = process.env.VKM_PHA ?? "";
if (pha && pha !== "gieo") {
	console.log(`KHONG DO DUOC: VKM_PHA=${pha} la; chi nhan "gieo"`);
	process.exit(2);
}
if (pha === "gieo")
	writeFileSync(TEP_GIEO, 'export const VKM_PHA = "/okr/toan-canh";\n');

let ketQua;
try {
	ketQua = await quet();
} finally {
	if (pha === "gieo") rmSync(TEP_GIEO, { force: true });
}

const { soTep, viPham, soMien } = ketQua;
if (soTep === 0) {
	console.log("KHONG DO DUOC: bo quet rong — 0 tep .ts/.tsx duoi apps/app");
	process.exit(2);
}
if (soMien === 0) {
	console.log(
		"KHONG DO DUOC: next.config.ts khong co redirects/rewrites de mien",
	);
	process.exit(2);
}
for (const v of viPham) console.log(`SAI AC-7: ${v}`);
const dat = viPham.length === 0;
console.log(
	`${dat ? "DUNG" : "KET LUAN"} AC-7: ${soTep} tep, ${viPham.length} chuoi duong cu`,
);
process.exit(dat ? 0 : 1);
