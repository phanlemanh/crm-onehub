import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { GOC, ketThuc } from "./chung.mjs";

const require = createRequire(import.meta.url);
const ey = require(join(GOC, "lib/eval-yaml.cjs"));
const ec = require(join(GOC, "lib/evidence-core.cjs"));

const CU = "ci-ma-tran-ba-o";
const THAY = "thuoc-7-ngay-loc-pr";
const CON_TRO = `${THAY}#AC-4`;
const doc = (goc, rel) => readFileSync(join(goc, rel), "utf8");
const loi = [];

const e5 = ey.parseEvals(doc(GOC, `_acceptance/${CU}/evals.yaml`), ["status", "superseded_by"]).find((e) => e.id === "E5");
if (e5?.status !== "not-run") loi.push(`E5 cua ${CU} co status «${e5?.status}», mong not-run`);
if (e5?.superseded_by !== CON_TRO) loi.push(`E5 cua ${CU} tro «${e5?.superseded_by}», mong ${CON_TRO}`);

const daKy = /^status:\s*signed-off\s*$/m.test(doc(GOC, `_acceptance/${THAY}/contract.md`));
const that = ec.chungThayBoi({ root: GOC, slug: CU, id: "E5", conTro: CON_TRO });
console.log(`cay that (${THAY} ${daKy ? "da ky" : "chua ky"}): ${that.ok ? "ok" : that.lyDo}`);
if (daKy ? !that.ok : !(that.ok || that.lyDo === "ho-so-thay-chua-ky")) loi.push(`cay that tra «${that.lyDo}»`);

function dungBanSao({ conTro, boThe }) {
	const goc = mkdtempSync(join(tmpdir(), "noi-f21-"));
	const ws = join(goc, "_acceptance", THAY);
	mkdirSync(join(goc, "_acceptance"), { recursive: true });
	cpSync(join(GOC, "_acceptance", THAY), ws, { recursive: true });
	let hd = doc(GOC, `_acceptance/${THAY}/contract.md`).replace(/^status:.*$/m, "status: signed-off");
	if (boThe) hd = hd.replaceAll(`${CU}/E5`, `${CU}/E-khac`);
	writeFileSync(join(ws, "contract.md"), hd);
	if (boThe) writeFileSync(join(ws, "design.md"), doc(GOC, `_acceptance/${THAY}/design.md`).replaceAll(`${CU}/E5`, `${CU}/E-khac`));
	writeFileSync(
		join(ws, "evidence-report.md"),
		["---", "verdict: PASS", "---", "", "## Evidence", "", "- eval: E1", "  run_id: ban-sao", "  exit_code: 0", ""].join("\n"),
	);
	const r = ec.chungThayBoi({ root: goc, slug: CU, id: "E5", conTro });
	rmSync(goc, { recursive: true, force: true });
	return r;
}

const O = [
	["ban sao da ky, con tro dung", { conTro: CON_TRO }, "ok"],
	["con tro sang AC khong co", { conTro: `${THAY}#AC-99` }, "ac-thay-vang"],
	["hop dong va design doc khong neu the ci-ma-tran-ba-o/E5", { conTro: CON_TRO, boThe: true }, "thay-khong-nhan"],
];
for (const [ten, cau, mong] of O) {
	const r = dungBanSao(cau);
	const thuc = r.ok ? "ok" : r.lyDo;
	console.log(`${ten}: ${thuc}`);
	if (thuc !== mong) loi.push(`${ten}: tra «${thuc}», mong «${mong}»`);
}
ketThuc("noi-f21", loi);
