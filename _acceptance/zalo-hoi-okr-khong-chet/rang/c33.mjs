import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { KhongDo } from "../../ca-chap-chon-cach-ly/rang/ban-sao.mjs";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const HO_SO = "_acceptance/zalo-hoi-okr-khong-chet";
const BO = join(GOC, HO_SO, "bo-do", "c33.json");
const NHAN_BO = "c33-okr";
const CHAM = "_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts";
const CHAY_CHAM = join(".acceptance-runs", "tro-ly-doc-kho", "cham-bo-do");
const CONG_CU = "apps/agent/agent/tools/tro-ly-okr-ngoai.ts";
const BANG_CHUNG = join(GOC, ".acceptance-runs", "zalo-hoi-okr-khong-chet", "c33");
const CAN_XANH = 3;
const TRAN_XANH = 6;
const TRAN_DO = 3;
const TRAN_LUOT_MS = 40 * 60_000;
const DONG_UY_QUYEN = "may be called only from an OKR session";
const GOI_CONG_CU = /→ tro_ly_okr\b/;
const XONG_CONG_CU = /✓ tro_ly_okr\b/;
const GOI_CON = /→ subagent tro_ly_okr\b/;

const { ZALO } = await import(join(GOC, "apps/agent/agent/lib/zalo-config.ts"));
const TAC_TU_LOI = ZALO.loi.tacTuLoi;

function chayMotLuot(goc, thuMuc) {
	mkdirSync(thuMuc, { recursive: true });
	const r = spawnSync("bun", [CHAM, "--bo", BO], {
		cwd: goc,
		encoding: "utf8",
		timeout: TRAN_LUOT_MS,
		env: { ...process.env, BANG_CHUNG: thuMuc },
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
		hang,
		tin: traLoi ? traLoi.split(" / ") : [],
	};
}

function loiCuaLuotXanh(l) {
	const loi = [];
	if (l.goiCon) loi.push("goi subagent that");
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
	for (let lan = 1; lan <= TRAN_XANH && coGoi < CAN_XANH; lan++) {
		const thuMuc = join(BANG_CHUNG, `xanh-${lan}`);
		rmSync(thuMuc, { recursive: true, force: true });
		chayMotLuot(GOC, thuMuc);
		const l = docLuot(thuMuc);
		if (!l.coGoi && !l.goiCon) {
			console.log(`luot ${lan}: khong goi tro_ly_okr`);
			continue;
		}
		const loi = loiCuaLuotXanh(l);
		if (loi.length > 0) {
			console.log(`luot ${lan}: ${loi.join("; ")}`);
			return 1;
		}
		coGoi++;
		console.log(`luot ${lan}: co goi cong cu de, ZaloHoi da-tra-loi, mot tin co OKR — ${l.tin[0].slice(0, 160)}`);
	}
	if (coGoi < CAN_XANH) {
		console.log(`khong du luot co goi: ${coGoi}/${CAN_XANH}`);
		return 2;
	}
	console.log(`C33: ${coGoi}/${CAN_XANH} luot co goi deu dat`);
	return 0;
}

function sachTep(tep) {
	const r = spawnSync("git", ["status", "--porcelain", "--", tep], { cwd: GOC, encoding: "utf8" });
	return r.status === 0 && r.stdout.trim() === "";
}

function chieuDo() {
	if (!sachTep(CONG_CU)) throw new KhongDo(`${CONG_CU} dang co thay doi chua commit, khong pha tai cho`);
	const goc = GOC;
	const cat = join(tmpdir(), `zhok-c33-${process.pid}.ts`);
	renameSync(join(GOC, CONG_CU), cat);
	try {
		let coGoi = 0;
		for (let lan = 1; lan <= TRAN_DO; lan++) {
			const thuMuc = join(BANG_CHUNG, `do-${lan}`);
			rmSync(thuMuc, { recursive: true, force: true });
			chayMotLuot(goc, thuMuc);
			const l = docLuot(thuMuc);
			if (l.goiCon) coGoi++;
			if (l.goiCon && l.uyQuyen) {
				console.log(`luot do ${lan}: uy quyen OKR giet luot`);
				return 0;
			}
			console.log(`luot do ${lan}: ${l.goiCon ? "goi subagent nhung khong co dong uy quyen" : "khong goi tro_ly_okr"}`);
		}
		if (coGoi === 0) {
			console.log("chieu do: khong luot nao goi tro_ly_okr — khong ket luan");
			return 2;
		}
		console.log("chieu do: co goi subagent ma khong thay dong uy quyen");
		return 1;
	} finally {
		renameSync(cat, join(GOC, CONG_CU));
		if (!sachTep(CONG_CU)) console.log(`CANH BAO: ${CONG_CU} chua ve nguyen trang`);
	}
}

try {
	process.exit(process.argv.includes("--do") ? chieuDo() : xanh());
} catch (loi) {
	console.log(`KHONG DO DUOC: ${loi.message}`);
	process.exit(loi instanceof KhongDo ? 2 : 1);
}
