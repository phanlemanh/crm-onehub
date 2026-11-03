import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const TEP = "apps/app/components/crm/record-sheet/kr-bang-chung.tsx";
const KHUON = "design/patterns/ngan-ban-ghi.md";
const SPEC = "test/khung-ngan.spec.ts";
const CHEP_LINT = [".oxlintrc.json", "package.json", "tools/oxlint", "design/patterns", "packages/db/src/giai-doan.ts", "apps/app/components/crm/record-sheet"];
const CHEP_SPEC = ["package.json", "tools/oxlint", "design", "docs/proto.md", "apps/app/package.json", "apps/app/tsconfig.json", "apps/app/test", "apps/app/components", "apps/app/lib", "apps/app/app"];
const NODE_MODULES = ["node_modules", "apps/app/node_modules"];
const NHAN_THUA = "ngoai_le kr-bang-chung.tsx/Dialog: ngoai le thua";
const MOC_KHUON = "  - tep: apps/app/components/crm/record-sheet/lich-su-kr.tsx\n";

function dung(ma, cau) {
	console.log(cau);
	process.exit(ma);
}

function caySao(chep, sua) {
	const tam = mkdtempSync(join(tmpdir(), "sv10-dialog-"));
	for (const p of chep) {
		cpSync(join(GOC, p), join(tam, p), {
			recursive: true,
			filter: (nguon) => !/[\\/](node_modules|\.next|\.turbo)([\\/]|$)/.test(nguon.slice(GOC.length)),
		});
	}
	for (const nm of NODE_MODULES) {
		if (!existsSync(join(GOC, nm))) continue;
		mkdirSync(dirname(join(tam, nm)), { recursive: true });
		symlinkSync(join(GOC, nm), join(tam, nm));
	}
	for (const [tep, doi] of Object.entries(sua)) {
		const d = join(tam, tep);
		writeFileSync(d, doi(readFileSync(d, "utf8")));
	}
	return tam;
}

function thay(nguon, cu, moi) {
	if (!nguon.includes(cu)) dung(2, `KHONG DO DUOC: fixture khong thay «${cu.slice(0, 60)}»`);
	return nguon.replace(cu, moi);
}

function chaySpec(goc) {
	const r = spawnSync("bun", ["test", SPEC], { cwd: join(goc, "apps/app"), encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
	const ra = `${r.stdout ?? ""}${r.stderr ?? ""}`;
	if (!/Ran \d+ tests?/.test(ra)) dung(2, `KHONG DO DUOC: bun test khong chay o ${goc} — ${ra.slice(-400)}`);
	return { ma: r.status, ra };
}

function chayLint(goc) {
	const r = spawnSync("bun", ["run", "lint:slop"], { cwd: goc, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
	const ra = `${r.stdout ?? ""}${r.stderr ?? ""}`;
	if (!/Finished in/.test(ra)) dung(2, `KHONG DO DUOC: lint:slop khong chay o ${goc} — ${ra.slice(0, 400)}`);
	const dong = ra.split("\n");
	const loi = [];
	dong.forEach((d, i) => {
		if (!d.includes("onehub(ngan-trong-khung)")) return;
		const vt = dong.slice(i + 1, i + 4).find((x) => x.includes(",-["));
		loi.push({ msg: d, vt: vt ? (/,-\[(.*)\]/.exec(vt)?.[1] ?? "") : "" });
	});
	return { ma: r.status, loi };
}

function voiCay(chep, sua, lam) {
	const tam = caySao(chep, sua);
	try {
		return lam(tam);
	} finally {
		rmSync(tam, { recursive: true, force: true });
	}
}

const nhapLaiDialog = (s) =>
	`import { Dialog, DialogContent } from "@crm/ui/components/dialog";\n${s}\nexport function HopThu() {\n\treturn (\n\t\t<Dialog open>\n\t\t\t<DialogContent />\n\t\t</Dialog>\n\t);\n}\n`;

const themNgoaiLe = (s) =>
	thay(s, MOC_KHUON, `  - tep: ${TEP}\n    khoi: Dialog\n    ly_do: thu ngoai le thua\n${MOC_KHUON}`);

const ket = {};

const cay = chaySpec(GOC);
ket.cay = cay.ma === 0 ? "xanh" : "do";
if (cay.ma !== 0) console.log(cay.ra.slice(-1200));

voiCay(CHEP_SPEC, {}, (tam) => {
	const r = chaySpec(tam);
	ket.banSao = r.ma === 0 ? "xanh" : "do";
	if (r.ma !== 0) console.log(r.ra.slice(-1200));
});

voiCay(CHEP_LINT, { [TEP]: nhapLaiDialog }, (tam) => {
	const r = chayLint(tam);
	const goiTen = r.loi.some(
		(l) => l.vt.startsWith(`${TEP}:`) && l.msg.includes("«Dialog»") && l.msg.includes("dựng thô trong ngăn bản ghi") && l.msg.includes(TEP),
	);
	ket.nhapLai = r.ma !== 0 && goiTen ? "do" : "xanh";
	if (!goiTen) console.log(`nhap-lai: ${r.loi.length} dong: ${r.loi.map((l) => `${l.vt} ${l.msg.trim()}`).join(" | ")}`);
});

voiCay(CHEP_SPEC, { [KHUON]: themNgoaiLe }, (tam) => {
	const r = chaySpec(tam);
	ket.ngoaiLeLai = r.ma !== 0 && r.ra.includes(NHAN_THUA) ? "do" : "xanh";
	if (ket.ngoaiLeLai !== "do") console.log(r.ra.slice(-1200));
});

console.log(`ban sao: ${ket.banSao}`);
console.log(`cay: ${ket.cay} · nhap-lai: ${ket.nhapLai} · ngoai-le-lai: ${ket.ngoaiLeLai}`);
const thieu = [
	ket.cay !== "xanh" && "cay",
	ket.banSao !== "xanh" && "ban-sao",
	ket.nhapLai !== "do" && "nhap-lai",
	ket.ngoaiLeLai !== "do" && "ngoai-le-lai",
].filter(Boolean);
if (thieu.length) dung(1, `thieu chieu: ${thieu.join(", ")}`);
process.exit(0);
