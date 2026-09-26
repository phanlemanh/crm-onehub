import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { soiTep } from "../../cua-vao-dang-nhap/rang/soi-ma.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const MAU_CU = join(GOC, "_acceptance", "cua-vao-dang-nhap", "rang", "fixtures");
const DANH_SACH_CAM = [
	/^apps\/app\/proxy\.ts$/,
	/^apps\/app\/app\/\(landing\)\/page\.tsx$/,
	/^apps\/app\/components\/landing\//,
	/^apps\/app\/app\/proto\/_modules\/(?!doi-ten-onehub-center\/)/,
];
const MA_TRAN_CAM = [
	["apps/app/app/(landing)/sign-in/page.tsx", false],
	["apps/app/app/(landing)/het-quyen/page.tsx", false],
	["apps/app/app/proto/_modules/doi-ten-onehub-center/index.tsx", false],
	["apps/app/app/(landing)/page.tsx", true],
	["apps/app/components/landing/hero.tsx", true],
	["apps/app/app/proto/_modules/cua-vao-dang-nhap/index.tsx", true],
	["apps/app/proxy.ts", true],
];
const CHU_THICH = /^\+\s*(\/\/|\/\*|\*\s|\*\/)/;
const DONG_GIU = "This CRM is private";

const dong = [];
function ghi(dat, chu) {
	dong.push(dat);
	console.log(`${dat ? "DUNG" : "SAI"} ${chu}`);
}

function git(...doi) {
	return execFileSync("git", ["-C", GOC, ...doi], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).trim();
}

export function camCham(tep) {
	return DANH_SACH_CAM.some((r) => r.test(tep));
}

function main() {
	for (const [tep, can] of [
		["client-nhap-auth.tsx", "(a)"],
		["ui-doi-mau.tsx", "(c)"],
	]) {
		const loi = soiTep(join(MAU_CU, tep));
		ghi(loi.some((l) => l.startsWith(can)), `doi chung ${tep}: bat duoc ${can}`);
	}
	for (const [tep, ky] of MA_TRAN_CAM) {
		ghi(camCham(tep) === ky, `doi chung (e) ${tep} -> ${camCham(tep) ? "cam" : "duoc sua"}`);
	}

	const base = git("merge-base", "HEAD", "origin/onehub");
	const doi = git("diff", "--name-only", base, "HEAD").split("\n").filter(Boolean);
	const ma = doi.filter((t) => /\.(tsx?|mjs)$/.test(t) && existsSync(join(GOC, t)));

	for (const t of ma.filter((x) => x.startsWith("apps/app/") && !x.startsWith("apps/app/test/"))) {
		const loi = soiTep(t);
		ghi(loi.length === 0, loi.length === 0 ? `(a)(c) ${t}` : `${t}: ${loi.join("; ")}`);
	}

	const them = git("diff", "-U0", base, "HEAD", "--", ...ma).split("\n");
	let tep = "";
	let dongMoi = 0;
	const chuThich = [];
	for (const l of them) {
		if (l.startsWith("+++ b/")) tep = l.slice(6);
		const h = l.match(/^@@ -\d+(?:,\d+)? \+(\d+)/);
		if (h) dongMoi = Number(h[1]);
		else if (l.startsWith("+") && !l.startsWith("+++")) {
			if (CHU_THICH.test(l)) chuThich.push(`${tep}:${dongMoi}`);
			dongMoi += 1;
		}
	}
	for (const c of chuThich) ghi(false, `SAI (b) chu thich moi ${c}`);
	if (chuThich.length === 0) ghi(true, `(b) khong chu thich moi trong ${ma.length} tep ma`);

	const luoi = "packages/ui/src/components/luoi-cham.tsx";
	ghi(existsSync(join(GOC, luoi)), `(d) ${luoi} ${existsSync(join(GOC, luoi)) ? "co" : "KHONG co"}`);

	const cham = doi.filter(camCham);
	for (const t of cham) ghi(false, `(e) diff cham danh sach cam: ${t}`);
	const diffAuth = git("diff", "-U0", base, "HEAD", "--", "packages/auth/src/auth.ts").split("\n");
	const doiDongGiu = diffAuth.filter((l) => /^[-+][^-+]/.test(l) && l.includes(DONG_GIU));
	for (const l of doiDongGiu) ghi(false, `(e) packages/auth/src/auth.ts doi dong «${DONG_GIU}»: ${l.slice(0, 80)}`);
	const goi = doi.filter((t) => t.endsWith("package.json"));
	const doiTen = goi.filter((t) => git("diff", "-U0", base, "HEAD", "--", t).split("\n").some((l) => /^[-+]\s*"name":/.test(l)));
	for (const t of doiTen) ghi(false, `(e) doi "name" cua ${t}`);
	if (cham.length === 0 && doiDongGiu.length === 0 && doiTen.length === 0) {
		ghi(true, "(e) diff khong cham danh sach cam");
	}

	const sai = dong.filter((d) => !d).length;
	console.log(`KET LUAN ${dong.length - sai} DUNG, ${sai} SAI — ma thoat ${sai ? 1 : 0}`);
	process.exit(sai ? 1 : 0);
}

if (import.meta.main) {
	try {
		main();
	} catch (loi) {
		console.log(`KHONG DO DUOC: ${loi.message}`);
		process.exit(2);
	}
}
