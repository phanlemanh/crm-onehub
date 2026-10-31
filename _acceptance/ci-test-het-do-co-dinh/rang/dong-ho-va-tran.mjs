import { spawnSync } from "node:child_process";
import {
	cpSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SPEC = join(GOC, "packages", "ui", "test", "pre-push-da-chung.spec.ts");
const MAU = join(GOC, "packages", "ui", "test", "mau");
const THONG_DIEP_DONG_HO = "dau 13 ngay theo gio that cua hook phai con dung";
const TRAN_EP_MS = 100;
const DONG_HO_THAT = "bayGio() - ngay * NGAY_MS";
const DONG_HO_TOAN_CUC = "Date.now() - ngay * NGAY_MS";

const tam = mkdtempSync(join(tmpdir(), "f37-dong-ho-"));
const thuMuc = join(tam, "test");
mkdirSync(thuMuc);
cpSync(MAU, join(thuMuc, "mau"), { recursive: true });
const banSao = join(thuMuc, "pre-push-da-chung.spec.ts");

function chay(ma, loc, them = {}) {
	writeFileSync(banSao, ma);
	const env = { ...process.env, DA_CHUNG_NGUON: GOC, ...them };
	if (!("DAU_HOOK_TRAN_MS" in them)) delete env.DAU_HOOK_TRAN_MS;
	const r = spawnSync("bun", ["test", banSao, "-t", loc], {
		cwd: tam,
		env,
		encoding: "utf8",
	});
	return { ma: r.status ?? -1, ra: `${r.stdout}${r.stderr}` };
}

const loi = [];
function ca(ten, dat, chiTiet) {
	console.log(`${dat ? "DAT" : "TRUOT"} ${ten}${dat ? "" : ` — ${chiTiet}`}`);
	if (!dat) loi.push(ten);
}

try {
	const goc = readFileSync(SPEC, "utf8");
	const soChoDongHo = goc.split(DONG_HO_THAT).length - 1;
	ca(
		"ban-lanh-co-dung-mot-cho-tinh-ngay-dau",
		soChoDongHo === 1,
		`thay ${soChoDongHo} cho «${DONG_HO_THAT}»`,
	);

	const lanh = chay(goc, "dau-hook \\((e|i|k)\\)");
	ca(
		"doi-chung-duong: (e) (i) (k) xanh tren ban lanh",
		lanh.ma === 0 && /\b3 pass\b/.test(lanh.ra) && /\b0 fail\b/.test(lanh.ra),
		`ma ${lanh.ma}\n${lanh.ra.slice(-1500)}`,
	);

	const pha = chay(
		goc.replace(DONG_HO_THAT, DONG_HO_TOAN_CUC),
		"dau-hook \\(k\\)",
	);
	ca(
		"pha-dong-ho: tinh ngay bang Date.now toan cuc thi (k) do dung thong diep",
		pha.ma !== 0 &&
			pha.ra.includes("(fail) dau-hook > dau-hook (k)") &&
			pha.ra.includes(THONG_DIEP_DONG_HO),
		`ma ${pha.ma}\n${pha.ra.slice(-1500)}`,
	);

	const ep = chay(goc, "dau-hook \\(i\\)", {
		DAU_HOOK_TRAN_MS: String(TRAN_EP_MS),
	});
	ca(
		`ep-tran: DAU_HOOK_TRAN_MS=${TRAN_EP_MS} thi (i) do vi het gio`,
		ep.ma !== 0 &&
			ep.ra.includes(`timed out after ${TRAN_EP_MS}ms`) &&
			ep.ra.includes("(fail) dau-hook > dau-hook (i)"),
		`ma ${ep.ma}\n${ep.ra.slice(-1500)}`,
	);

	const traTran = chay(goc, "dau-hook \\(i\\)");
	ca(
		"tra-tran: tran mac dinh thi (i) xanh lai",
		traTran.ma === 0 && /\b1 pass\b/.test(traTran.ra),
		`ma ${traTran.ma}\n${traTran.ra.slice(-1500)}`,
	);
} finally {
	rmSync(tam, { recursive: true, force: true });
}

if (loi.length) {
	console.log(`TRUOT ${loi.length} ca: ${loi.join(", ")}`);
	process.exit(1);
}
console.log("DAT tat ca");
