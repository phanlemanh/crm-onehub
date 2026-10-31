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
const GIOI_HAN_MOT_LAN_MS = 180_000;
const DONG_HO_THAT = "bayGio() - ngay * NGAY_MS";
const DONG_HO_TOAN_CUC = "Date.now() - ngay * NGAY_MS";
const NEN = "6ca59691a2f81a1c0adf3b1e9c19a4bc1876525a";
const DAU_KHOI = 'describe("dau-hook", () => {';
const CUOI_KHOI = 'describe("so-chay", () => {';
const THEM_CHO_PHEP = [
	"expect(Date.now()).toBe(Date.parse(MOC_GHIM))",
	"expect(globalThis.Date).toBe(truoc)",
];
const MAT_THU = "expect(soBun(k)).toEqual(BA);";

function khoiDauHook(ma) {
	const dau = ma.indexOf(DAU_KHOI);
	const cuoi = ma.indexOf(CUOI_KHOI);
	if (dau < 0 || cuoi < dau) throw new Error("khong tim thay khoi dau-hook");
	return ma.slice(dau, cuoi);
}

function khangDinh(khoi) {
	return khoi
		.replace(/\s+/g, "")
		.replace(/,\)/g, ")")
		.replace(/,\]/g, "]")
		.split(";")
		.filter((m) => m.includes("expect("))
		.map((m) => m.slice(m.indexOf("expect(")))
		.map((m) => m.replace(/,"[^"]*"\)(\.(?:not\.)?to)/, ")$1"));
}

function soKhangDinh(cu, moi) {
	const con = [...moi];
	const thieu = [];
	for (const k of cu) {
		const i = con.indexOf(k);
		if (i < 0) thieu.push(k);
		else con.splice(i, 1);
	}
	const thua = con.filter((k) => !THEM_CHO_PHEP.includes(k));
	return { thieu, thua };
}

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
		timeout: GIOI_HAN_MOT_LAN_MS,
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

	const khoi = khoiDauHook(goc);
	const soTest = (khoi.match(/\btest\(/g) ?? []).length;
	const soTran = (khoi.match(/\bTRAN_DAU_HOOK_MS\b/g) ?? []).length;
	ca(
		"moi-ca-co-tran: moi test cua describe dau-hook mang TRAN_DAU_HOOK_MS",
		soTest >= 10 && soTran === soTest,
		`${soTest} test, ${soTran} cho TRAN_DAU_HOOK_MS`,
	);

	const nen = spawnSync(
		"git",
		["show", `${NEN}:packages/ui/test/pre-push-da-chung.spec.ts`],
		{ cwd: GOC, encoding: "utf8" },
	);
	const cu = khangDinh(khoiDauHook(nen.stdout));
	const so = soKhangDinh(cu, khangDinh(khoi));
	ca(
		"khang-dinh-cu-giu-nguyen: moi expect cua ca dau-hook o nen con nguyen, chi them expect cua (k)",
		nen.status === 0 &&
			cu.length >= 30 &&
			so.thieu.length === 0 &&
			so.thua.length === 0,
		`git show ${nen.status}, ${cu.length} expect o nen, thieu ${JSON.stringify(so.thieu)}, thua ${JSON.stringify(so.thua)}`,
	);
	const soPha = soKhangDinh(cu, khangDinh(khoi.replace(MAT_THU, "")));
	ca(
		"khang-dinh-pha: xoa mot expect cu thi phep so bao thieu dung expect do",
		soPha.thieu.length === 1 &&
			soPha.thieu[0] === MAT_THU.replace(/\s+/g, "").replace(/;$/, ""),
		`thieu ${JSON.stringify(soPha.thieu)}`,
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

	const tenCa = [...khoi.matchAll(/"(dau-hook \([^"]*)"/g)].map((m) => m[1]);
	const khongHet = [];
	for (const ten of tenCa) {
		const loc = ten.replace(/[()]/g, "\\$&");
		const r = chay(goc, loc, { DAU_HOOK_TRAN_MS: String(TRAN_EP_MS) });
		if (r.ma === 0 || !r.ra.includes(`timed out after ${TRAN_EP_MS}ms`))
			khongHet.push(ten);
	}
	ca(
		`ep-tran-moi-ca: DAU_HOOK_TRAN_MS=${TRAN_EP_MS} thi tung ca dau-hook het gio, ke ca (j)`,
		tenCa.length === soTest &&
			tenCa.some((t) => t.startsWith("dau-hook (j)")) &&
			khongHet.length === 0,
		`${tenCa.length} ten ca / ${soTest} test, khong het gio: ${JSON.stringify(khongHet)}`,
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
