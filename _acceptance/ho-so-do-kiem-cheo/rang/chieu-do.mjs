import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import { docDanhSach, dungCayTam, evalMay, HO_SO_DIR, khoa, THU_MUC_CHAY, XU_LY_CO_DOT_BIEN } from "./chung.mjs";

const TRAN_MS = 45 * 60_000;
const MA_KHONG_DO = 2;
const SO_DONG_DUOI = 6;
const KET_QUA = join(THU_MUC_CHAY, "chieu-do.json");

function chayLenh(cay, cmd) {
	const r = spawnSync("bash", ["-c", cmd], { cwd: cay, encoding: "utf8", timeout: TRAN_MS, maxBuffer: 1 << 28 });
	return { ma: r.status ?? r.signal ?? "het-tran", chu: `${r.stdout ?? ""}\n${r.stderr ?? ""}` };
}

function apBanVa(cay, banVa) {
	const tep = isAbsolute(banVa) ? banVa : join(HO_SO_DIR, banVa);
	if (!existsSync(tep)) return false;
	return spawnSync("git", ["apply", tep], { cwd: cay }).status === 0;
}

function traCay(cay) {
	spawnSync("git", ["checkout", "--", "."], { cwd: cay });
	spawnSync("git", ["clean", "-fdq"], { cwd: cay });
}

export function lenhCua(cay, d) {
	const configText = readFileSync(join(cay, "_acceptance", "config.yaml"), "utf8");
	const evalsText = readFileSync(join(cay, "_acceptance", d.ho_so, "evals.yaml"), "utf8");
	return evalMay(configText, evalsText).may.find((e) => e.id === d.eval) ?? null;
}

export function chayDong(cay, d, chay = chayLenh) {
	const k = khoa(d);
	if (!d.dot_bien?.ban_va || !d.dot_bien?.thong_diep) return { loi: [`THIEU_DOT_BIEN ${k}`] };
	const ev = lenhCua(cay, d);
	if (!ev?.cmd) return { loi: [`THIEU_DOT_BIEN ${k}: eval khong con la eval may dang chay`] };
	const loi = [];
	const nv = chay(cay, ev.cmd);
	if (nv.ma !== ev.kyVong) loi.push(`NGUYEN_VEN_DO ${k}: ma ${nv.ma}, ky vong ${ev.kyVong}`);
	let db = { ma: null, chu: "" };
	if (!apBanVa(cay, d.dot_bien.ban_va)) loi.push(`BAN_VA_HONG ${k}: ${d.dot_bien.ban_va}`);
	else {
		db = chay(cay, ev.cmd);
		if (db.ma === ev.kyVong) loi.push(`DOT_BIEN_LOT ${k}: ${d.dot_bien.ten}`);
		else if (!db.chu.includes(d.dot_bien.thong_diep)) loi.push(`SAI_THONG_DIEP ${k}: khong thay «${d.dot_bien.thong_diep}»`);
	}
	traCay(cay);
	let neo = null;
	if (d.xu_ly === "neo-co-dinh") {
		if (!d.dot_bien_neo?.ban_va) loi.push(`THIEU_DOT_BIEN ${k}: dong neo-co-dinh thieu dot_bien_neo`);
		else if (!apBanVa(cay, d.dot_bien_neo.ban_va)) loi.push(`BAN_VA_HONG ${k}: ${d.dot_bien_neo.ban_va}`);
		else {
			neo = chay(cay, ev.cmd);
			if (neo.ma !== MA_KHONG_DO) loi.push(`NEO_SAI_XANH ${k}: sha neo sai cho ma ${neo.ma}, can ${MA_KHONG_DO}`);
		}
		traCay(cay);
	}
	const duoi = (chu) => chu.split("\n").filter(Boolean).slice(-SO_DONG_DUOI);
	const kq = { loi, nguyenVen: nv.ma, dotBien: db.ma, neo: neo?.ma ?? null, duoiDotBien: duoi(db.chu) };
	if (nv.ma !== ev.kyVong) kq.duoiNguyenVen = duoi(nv.chu);
	return kq;
}

function tuKiem(cay) {
	const sai = [];
	const gia = (ma, chu) => () => ({ ma, chu });
	let lan = 0;
	const chayGia = () => (lan++ % 2 === 0 ? { ma: 0, chu: "xanh" } : { ma: 0, chu: "van xanh" });
	const rong = join(cay, "..", "tu-kiem-rong.patch");
	writeFileSync(rong, "");
	const dongGia = { ho_so: "ho-so-do-kiem-cheo", eval: "E1", xu_ly: "sua-rang", dot_bien: { ten: "rong", ban_va: rong, thong_diep: "THIEU" } };
	const r1 = chayDong(cay, dongGia, chayGia);
	if (!r1.loi.some((l) => l.startsWith("BAN_VA_HONG") || l.startsWith("DOT_BIEN_LOT"))) sai.push("ban va rong khong ra DOT_BIEN_LOT/BAN_VA_HONG");
	const r2 = chayDong(cay, { ...dongGia, dot_bien: { ...dongGia.dot_bien, ban_va: join(cay, "..", "khong-co.patch") } }, gia(0, "x"));
	if (!r2.loi.some((l) => l.startsWith("BAN_VA_HONG"))) sai.push("ban va vang khong ra BAN_VA_HONG");
	return sai;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const d = docDanhSach();
	const iChi = process.argv.indexOf("--chi");
	const chi = iChi >= 0 ? process.argv[iChi + 1] : null;
	const dong = d.dong.filter((r) => XU_LY_CO_DOT_BIEN.includes(r.xu_ly) && (!chi || r.ho_so === chi));
	const { cay } = dungCayTam("HEAD", "hsdk-chieu-do");
	const sai = tuKiem(cay);
	if (sai.length) {
		console.error(`HONG tu kiem: ${sai.join("; ")}`);
		process.exit(1);
	}
	const ketQua = {};
	const loiTong = [];
	for (const r of dong) {
		const kq = chayDong(cay, r);
		ketQua[khoa(r)] = kq;
		loiTong.push(...kq.loi);
		if (!kq.loi.length) console.log(`${khoa(r)} nguyên vẹn ${kq.nguyenVen} · đột biến ${r.dot_bien.ten} ${kq.dotBien} · thông điệp có${kq.neo !== null ? ` · neo sai ${kq.neo}` : ""}`);
	}
	mkdirSync(THU_MUC_CHAY, { recursive: true });
	writeFileSync(chi ? join(THU_MUC_CHAY, `chieu-do-${chi}.json`) : KET_QUA, `${JSON.stringify(ketQua, null, "\t")}\n`);
	for (const l of loiTong) console.log(l);
	console.log(`chieu-do: ${dong.length} đột biến, ${dong.length - new Set(loiTong.map((l) => l.split(" ")[1])).size} bắt đúng`);
	process.exit(loiTong.length ? 1 : 0);
}
