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
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const CONFIG = join(GOC, "_acceptance", "config.yaml");
const MAU = join(GOC, "_acceptance/tro-ly-doc-kho/rang/mau-luot-that");
const CHAM = "_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts";
const TEP = "cham-tung-cau.jsonl";
const TRAN_MS = 600_000;
const DONG_TONG =
	/^(dungTrang|tuChoiDung|chuyenQuyDinh|chuyenNham): |^cau loi model: |^tra loi co trich khong qua kiem: |^KHONG DO DUOC: /;

const MA_TRAN = [
	["bcm_khuon", 0],
	["bcm_thanh_phan", 0],
	["bcm_trang_mong", 0],
	["bcm_y_trong_yeu", 0],
	["bcm_rieng_tu", 0],
	["bcm_bang_do", 0],
	["bcm_ma_thoat", 0],
	["emtdl_nhan_loi", 0],
	["emtdl_nhat_ky", 0],
	["emtdl_bam", 0],
	["emtdl_dung_lai", 0],
	["emtdl_vung_xam", 0],
	["emtdl_gop", 0],
	["emtdl_do_model", 0],
	["emtdl_giu_nguong", 0],
	["zkd_so_do", 0],
	["mh2_so", 0],
	["mh2_pham_vi", 0],
	["ssct_so_bo_mau", 1],
	["mtv_so", 2],
];
const SO_KHOA = 21;

function lenhCua(khoa, cfg) {
	const m = cfg.match(new RegExp(`^ {4}${khoa}: (.+)$`, "m"));
	if (!m) return null;
	const v = m[1].trim();
	if (v.startsWith("'") && v.endsWith("'"))
		return v.slice(1, -1).replaceAll("''", "'");
	if (v.startsWith('"') && v.endsWith('"')) return JSON.parse(v);
	return v;
}

function chay(lenh, env = {}) {
	const r = spawnSync("sh", ["-c", lenh], {
		cwd: GOC,
		encoding: "utf8",
		timeout: TRAN_MS,
		env: { ...process.env, ...env },
		maxBuffer: 64 * 1024 * 1024,
	});
	return { ma: r.status, log: `${r.stdout ?? ""}\n${r.stderr ?? ""}` };
}

function dungLuotMau() {
	const thuMuc = mkdtempSync(join(tmpdir(), "f12-luot-"));
	mkdirSync(join(thuMuc, "luot-1"));
	cpSync(join(MAU, TEP), join(thuMuc, "luot-1", TEP));
	const env = { ...process.env };
	delete env.E15_QUYET;
	const r = spawnSync("bun", [CHAM, "--cham-lai", join(thuMuc, "luot-1")], {
		cwd: GOC,
		encoding: "utf8",
		env,
	});
	const tong = `${r.stdout ?? ""}`
		.split("\n")
		.filter((d) => DONG_TONG.test(d))
		.map((d) => `- ${d}`);
	writeFileSync(
		join(thuMuc, "cham-bo-do.md"),
		`# Lượt dựng từ mẫu\n\n## Tổng\n\n${tong.join("\n")}\n`,
	);
	return thuMuc;
}

function main() {
	const doiChung = chay("exit 3");
	if (doiChung.ma !== 3) {
		console.error(`doi chung am: ham chay bao ma ${doiChung.ma}, can 3`);
		return 2;
	}
	console.log("doi chung am: exit 3 -> ma 3");
	const cfg = readFileSync(CONFIG, "utf8");
	const thieu = MA_TRAN.map(([k]) => k).filter((k) => !lenhCua(k, cfg));
	if (!lenhCua("emtdl_cham_lai", cfg)) thieu.push("emtdl_cham_lai");
	if (thieu.length > 0) {
		console.error(`thieu khoa ${thieu.join(", ")}`);
		return 2;
	}
	let giu = 0;
	let dong = 0;
	for (const [khoa, nen] of MA_TRAN) {
		const r = chay(lenhCua(khoa, cfg));
		dong++;
		const ok = r.ma === nen;
		if (ok) giu++;
		console.log(`${khoa} ma ${r.ma} nen ${nen} ${ok ? "giu" : "doi"}`);
		if (!ok) console.error(r.log.slice(-1500));
	}
	const luot = dungLuotMau();
	try {
		const r = chay(lenhCua("emtdl_cham_lai", cfg), { E15_THU_MUC_LUOT: luot });
		dong++;
		const ok = r.ma === 0;
		if (ok) giu++;
		console.log(`emtdl_cham_lai ma ${r.ma} nen 0 ${ok ? "giu" : "doi"}`);
		if (!ok) console.error(r.log.slice(-1500));
	} finally {
		rmSync(luot, { recursive: true, force: true });
	}
	if (dong !== SO_KHOA) {
		console.error(`da chay ${dong} khoa, khai ${SO_KHOA}`);
		return 2;
	}
	console.log(`ma tran: ${giu}/${SO_KHOA} giu ma nen`);
	return giu === SO_KHOA ? 0 : 1;
}

process.exit(main());
