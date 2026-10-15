import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { tapCham } from "../../../scripts/kiem-cheo/tap-cham.mjs";
import { dung, GDTT, GOC, git, kit, MOC_NEN } from "./chung.mjs";

const NGOAI = ["apps/app/lib/__krtt__.ts", "apps/api/src/__krtt__/x.ts"];
const LUAT_KHO = [
	"tools/oxlint/onehub/rules/khong-re-theo-ten-giai-doan.ts",
	".oxlintrc.json",
	"packages/db/src/giai-doan.ts",
];

const nap = createRequire(import.meta.url);
const core = nap(join(kit().goc, "lib", "evidence-core.cjs"));
const cay = core.dungCayPaths(git("ls-files").split("\n").filter(Boolean));
const evalsDinh = git("show", `HEAD:_acceptance/${GDTT}/evals.yaml`);
const evalsNen = git("show", `${MOC_NEN}:_acceptance/${GDTT}/evals.yaml`);

function boLoc(evalsText, tep) {
	const r = core.staleByPaths([tep], evalsText, { cay });
	if (!r.apply) dung(2, `KHONG DO DUOC: bo loc paths khong ap (${r.reason})`);
	return r.kept.length > 0;
}

function tapChamChon(tep, goc = GOC) {
	return tapCham({ goc, tepDoi: [tep] }).some((x) => x.slug === GDTT);
}

function voiGocNen(viec) {
	const goc = mkdtempSync(join(tmpdir(), "krtt-nen-"));
	try {
		const thuMuc = join(goc, "_acceptance", GDTT);
		mkdirSync(thuMuc, { recursive: true });
		writeFileSync(join(thuMuc, "evals.yaml"), evalsNen);
		writeFileSync(
			join(thuMuc, "contract.md"),
			git("show", `${MOC_NEN}:_acceptance/${GDTT}/contract.md`),
		);
		return viec(goc);
	} finally {
		rmSync(goc, { recursive: true, force: true });
	}
}

const hong = [];
for (const tep of NGOAI) {
	if (boLoc(evalsDinh, tep)) hong.push(`HONG CON CHON loc-paths ${tep}`);
	if (tapChamChon(tep)) hong.push(`HONG CON CHON tap-cham ${tep}`);
	if (!boLoc(evalsNen, tep)) hong.push(`HONG DOI CHUNG loc-paths ${tep}`);
	if (!voiGocNen((goc) => tapChamChon(tep, goc)))
		hong.push(`HONG DOI CHUNG tap-cham ${tep}`);
}
for (const tep of LUAT_KHO) {
	if (!boLoc(evalsDinh, tep)) hong.push(`HONG BO SOT loc-paths ${tep}`);
	if (!tapChamChon(tep)) hong.push(`HONG BO SOT tap-cham ${tep}`);
}
for (const h of hong) console.log(h);
if (hong.length > 0) process.exit(1);
console.log("chon-ho-so: dat");
