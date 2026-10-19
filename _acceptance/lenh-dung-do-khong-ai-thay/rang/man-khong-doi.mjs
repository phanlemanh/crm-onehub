import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
export const MOC_GOP = "eeb6ea30ec62369f2892d0a39a66d9a8b49fbcc1";
const DUOC_PHEP = "apps/app/app/layout.tsx";

export function kiemDoi(danhSach) {
	const ds = String(danhSach).split("\n").filter(Boolean);
	const la = ds.filter((d) => d !== DUOC_PHEP);
	if (la.length > 0)
		return { ma: 1, dat: false, ds, chu: `${la.length} file ngoai ${DUOC_PHEP} da doi: ${la.join(", ")}` };
	if (ds.length === 0) return { ma: 2, dat: false, ds, chu: "khong file nao doi — ban va chua co, phep do nay khong con nghia" };
	return { ma: 0, dat: true, ds, chu: `dung mot file doi, va do la ${DUOC_PHEP}` };
}

export function diffCapGop(goc = GOC) {
	return execFileSync("git", ["diff", "--name-only", `${MOC_GOP}^1`, MOC_GOP, "--", "apps/app"], {
		cwd: goc,
		encoding: "utf8",
	});
}

if (import.meta.main) {
	const doi = process.argv.slice(2);
	const iGoc = doi.indexOf("--goc");
	const goc = iGoc === -1 ? GOC : resolve(doi[iGoc + 1]);
	let ra;
	try {
		ra = diffCapGop(goc);
	} catch (e) {
		console.error(`MA 2: khong so duoc cap sha gop ${MOC_GOP.slice(0, 9)}^1..${MOC_GOP.slice(0, 9)} — ${e.message}`);
		process.exit(2);
	}
	const kq = kiemDoi(ra);
	console.log(`file cua apps/app doi trong cap gop ${MOC_GOP.slice(0, 9)}^1..${MOC_GOP.slice(0, 9)}: ${kq.ds.length}`);
	for (const d of kq.ds) console.log(`  ${d}`);
	if (kq.ma === 1) console.error(`DO: ${kq.chu} — man hoac kho chuoi bi dung, nen chu tren man co the doi`);
	else if (kq.ma === 2) console.error(`MA 2: ${kq.chu}`);
	else console.log(`XANH: ${kq.chu}.`);
	process.exit(kq.ma);
}
