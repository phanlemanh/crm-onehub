import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const HOP_DONG = "_acceptance/logo-onehub/contract.md";
const NHANH_CHINH = "origin/onehub";
const CHO_DUOC_DOI = "apps/app/components/auth-shell.tsx";
const VUNG_CAM = [
	"apps/app/components/landing/",
	"apps/app/app/(landing)/page.tsx",
	"packages/ui/src/components/brand-logos/",
	"apps/api/src/companies/favicon.service.ts",
	"packages/db/src/favicon.ts",
];
const GLOBALS = "packages/ui/src/styles/globals.css";
const PRIMARY = "#006b4f";
const NHAP_LOGO = "@crm/ui/components/logo";

const dong = [];
let sai = 0;

function git(...doi) {
	return execFileSync("git", doi, { cwd: GOC, encoding: "utf8" }).trim();
}

function ket(ma) {
	for (const d of dong) console.log(d);
	console.log(`KET LUAN: ${dong.filter((d) => d.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`);
	process.exit(ma);
}

function khongDo(cau) {
	dong.push(`KHONG DO DUOC: ${cau}`);
	ket(2);
}

function kiem(nhan, dat) {
	if (dat) dong.push(`DUNG ${nhan}`);
	else {
		sai += 1;
		dong.push(`SAI ${nhan}`);
	}
}

function moc() {
	const i = process.argv.indexOf("--base");
	if (i !== -1) {
		const ref = process.argv[i + 1];
		if (!ref) khongDo("--base can mot ref");
		return { tu: git("rev-parse", ref), toiCay: true };
	}
	const head = git("rev-parse", "HEAD");
	const mb = git("merge-base", "HEAD", NHANH_CHINH);
	if (mb !== head) return { tu: mb, toiCay: true };
	const gop = git("log", "--merges", "--format=%H", "-n", "200", "--", HOP_DONG)
		.split("\n")
		.filter(Boolean)
		.find((m) => git("diff", "--name-only", `${m}^1`, m, "--", HOP_DONG) !== "");
	if (!gop) khongDo(`HEAD nam tren ${NHANH_CHINH} va khong tim thay merge commit mang ${HOP_DONG}`);
	return { tu: git("merge-base", `${gop}^1`, `${gop}^2`), den: `${gop}^2`, toiCay: false };
}

const m = moc();
const doi = new Set(
	(m.toiCay
		? [git("diff", "--name-only", m.tu), git("ls-files", "--others", "--exclude-standard")]
		: [git("diff", "--name-only", m.tu, m.den)]
	)
		.join("\n")
		.split("\n")
		.filter(Boolean),
);
if (doi.size === 0) khongDo(`diff rong tu ${m.tu.slice(0, 12)}`);
dong.push(`MOC ${m.tu.slice(0, 12)}${m.den ? `..${m.den}` : " .. cay lam viec"} · ${doi.size} tep doi`);

let goiLogo = [];
try {
	goiLogo = git("grep", "-l", NHAP_LOGO, m.tu, "--", "apps/app")
		.split("\n")
		.filter(Boolean)
		.map((d) => d.slice(m.tu.length + 1));
} catch {
	khongDo(`git grep ${NHAP_LOGO} tai ${m.tu.slice(0, 12)} khong ra tep nao`);
}
if (goiLogo.length === 0) khongDo("tap tep goi Logo rong");

for (const tep of goiLogo) {
	if (tep === CHO_DUOC_DOI) continue;
	kiem(doi.has(tep) ? `file goi Logo doi: ${tep}` : `file goi Logo giu nguyen: ${tep}`, !doi.has(tep));
}
for (const vung of VUNG_CAM) {
	const cham = [...doi].filter((t) => t === vung || t.startsWith(vung));
	kiem(cham.length > 0 ? `vung cam: ${vung} (${cham.join(", ")})` : `vung cam nguyen ven: ${vung}`, cham.length === 0);
}
const khai = readFileSync(resolve(GOC, GLOBALS), "utf8")
	.split("\n")
	.filter((l) => /^\s*--primary\s*:/.test(l));
if (khai.length === 0) khongDo(`${GLOBALS} khong co dong --primary nao`);
for (const l of khai) kiem(`--primary: ${l.trim()}`, l.toLowerCase().includes(PRIMARY));

ket(sai === 0 ? 0 : 1);
