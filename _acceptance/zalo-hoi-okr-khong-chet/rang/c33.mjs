import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { KhongDo } from "../../ca-chap-chon-cach-ly/rang/ban-sao.mjs";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const HO_SO = "_acceptance/zalo-hoi-okr-khong-chet";
const BO = join(GOC, HO_SO, "bo-do", "c33.json");
const NHAN_BO = "c33-okr";
const CHAM = "_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts";
const CHAY_CHAM = join(".acceptance-runs", "tro-ly-doc-kho", "cham-bo-do");
const THU_MUC_CONG_CU = "apps/agent/agent/tools";
const BANG_CHUNG = join(GOC, ".acceptance-runs", "zalo-hoi-okr-khong-chet", "c33");
const SO_LUOT_XANH = 6;
const TRAN_EP = 6;
const TRAN_LUOT_MS = 40 * 60_000;
const DONG_UY_QUYEN = "may be called only from an OKR session";
const GOI_CONG_CU = /→ tro_ly_okr\b/;
const XONG_CONG_CU = /✓ tro_ly_okr\b/;
const GOI_CON = /→ subagent tro_ly_okr\b/;

const { ZALO } = await import(join(GOC, "apps/agent/agent/lib/zalo-config.ts"));
const { TRO_LY_OKR } = await import(join(GOC, "apps/agent/agent/lib/okr/config.ts"));
const TAC_TU_LOI = ZALO.loi.tacTuLoi;
const DONG_NGOAI_OKR = `${TRO_LY_OKR.ngoaiPhien.dongNgoaiOkr}zalo`;
const BIEN_BO_DE = TRO_LY_OKR.ngoaiPhien.bienBoDe;

function chayMotLuot(goc, thuMuc, bienThem = {}) {
	mkdirSync(thuMuc, { recursive: true });
	const r = spawnSync("bun", [CHAM, "--bo", BO], {
		cwd: goc,
		encoding: "utf8",
		timeout: TRAN_LUOT_MS,
		env: { ...process.env, ...bienThem, BANG_CHUNG: thuMuc },
		maxBuffer: 64 * 1024 * 1024,
	});
	const ra = `${r.stdout ?? ""}\n${r.stderr ?? ""}`;
	if (r.status === 2 || r.status === null) throw new KhongDo(`cham-bo-do khong chay duoc (ma ${r.status}): ${ra.slice(-600)}`);
	for (const tep of ["ket-qua.jsonl", "eve.log"]) {
		const nguon = join(goc, CHAY_CHAM, tep);
		if (!existsSync(nguon)) throw new KhongDo(`luot khong de lai ${tep}`);
		copyFileSync(nguon, join(thuMuc, tep));
	}
	return ra;
}

function docLuot(thuMuc) {
	const eve = readFileSync(join(thuMuc, "eve.log"), "utf8");
	const hang = readFileSync(join(thuMuc, "ket-qua.jsonl"), "utf8")
		.split("\n")
		.filter(Boolean)
		.map((d) => JSON.parse(d))
		.filter((k) => k.luot === 2 && k.id === "c33");
	const md = readFileSync(join(thuMuc, `cham-bo-do-${NHAN_BO}.md`), "utf8");
	const haiTu = md.indexOf("## Lượt hai");
	const dong = md
		.slice(haiTu)
		.split("\n")
		.find((d) => d.startsWith("| c33 |"));
	const o = dong ? dong.split(" | ") : [];
	const traLoi = (o[6] ?? "").replace(/ \|$/, "").trim();
	return {
		coGoi: GOI_CONG_CU.test(eve) && XONG_CONG_CU.test(eve),
		goiCon: GOI_CON.test(eve),
		uyQuyen: eve.includes(DONG_UY_QUYEN),
		quaHookMoi: eve.includes(DONG_NGOAI_OKR),
		hang,
		tin: traLoi ? traLoi.split(" / ") : [],
	};
}

function loiCuaLuotXanh(l) {
	const loi = [];
	if (l.goiCon && !l.quaHookMoi) loi.push("goi that khong qua hook moi");
	if (l.hang.length !== 1 || l.hang[0].ketQua !== "da-tra-loi" || l.hang[0].loi !== null)
		loi.push(`c33 ZaloHoi ${l.hang.map((h) => `${h.ketQua}${h.loi ? ` (${h.loi})` : ""}`).join(",") || "vang"}`);
	if (l.uyQuyen) loi.push("uy quyen OKR giet luot");
	const tin = l.tin;
	if (tin.length !== 1 || tin[0] === TAC_TU_LOI || !/okr/i.test(tin[0] ?? ""))
		loi.push(`tra loi khong co nghia: ${tin.join(" / ") || "(trong)"}`);
	return loi;
}

function xanh() {
	let coGoi = 0;
	for (let lan = 1; lan <= SO_LUOT_XANH; lan++) {
		const thuMuc = join(BANG_CHUNG, `xanh-${lan}`);
		rmSync(thuMuc, { recursive: true, force: true });
		chayMotLuot(GOC, thuMuc);
		const l = docLuot(thuMuc);
		const loi = loiCuaLuotXanh(l);
		if (loi.length > 0) {
			console.log(`luot ${lan}: ${loi.join("; ")}`);
			return 1;
		}
		if (l.goiCon) coGoi++;
		console.log(`luot ${lan}: ZaloHoi da-tra-loi, mot tin co OKR${l.goiCon ? ", co goi subagent" : ""} — ${l.tin[0].slice(0, 160)}`);
	}
	console.log(`co goi subagent: ${coGoi}/${SO_LUOT_XANH}`);
	console.log(`C33: ${SO_LUOT_XANH}/${SO_LUOT_XANH} luot dat`);
	return 0;
}

function sachTep(tep) {
	const r = spawnSync("git", ["status", "--porcelain", "--", tep], { cwd: GOC, encoding: "utf8" });
	return r.status === 0 && r.stdout.trim() === "";
}

function epGoi() {
	if (!sachTep(THU_MUC_CONG_CU)) throw new KhongDo(`${THU_MUC_CONG_CU} dang co thay doi chua commit`);
	for (let lan = 1; lan <= TRAN_EP; lan++) {
		const thuMuc = join(BANG_CHUNG, `ep-${lan}`);
		rmSync(thuMuc, { recursive: true, force: true });
		chayMotLuot(GOC, thuMuc, { [BIEN_BO_DE]: "1" });
		if (!sachTep(THU_MUC_CONG_CU)) {
			console.log("cay bi cham trong luc do");
			return 1;
		}
		const l = docLuot(thuMuc);
		const loi = loiCuaLuotXanh(l);
		if (loi.length > 0) {
			console.log(`luot ${lan}: ${loi.join("; ")}`);
			return 1;
		}
		if (l.goiCon) {
			console.log(`EP: luot ${lan} goi subagent that, luot song — ${l.tin[0].slice(0, 160)}`);
			return 0;
		}
		console.log(`luot ${lan}: khong goi tro_ly_okr, luot song`);
	}
	console.log("khong ep duoc goi");
	return 2;
}

try {
	process.exit(process.argv.includes("--ep") ? epGoi() : xanh());
} catch (loi) {
	console.log(`KHONG DO DUOC: ${loi.message}`);
	process.exit(loi instanceof KhongDo ? 2 : 1);
}
