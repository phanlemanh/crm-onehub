import { spawnSync } from "node:child_process";
import {
	cpSync,
	existsSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const CHAM = "_acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts";
const CHAY = join(GOC, ".acceptance-runs", "tro-ly-doc-kho", "cham-bo-do");
const TEP = "cham-tung-cau.jsonl";
const NGUONG = 0.8;

function luotMoiNhat() {
	if (process.env.E15_THU_MUC_LUOT) return process.env.E15_THU_MUC_LUOT;
	if (!existsSync(CHAY)) return null;
	const ds = readdirSync(CHAY)
		.filter((t) => existsSync(join(CHAY, t, "luot-1", TEP)))
		.sort();
	const moi = ds.at(-1);
	return moi ? join(CHAY, moi) : null;
}

function chamLai(thuMuc) {
	const env = { ...process.env };
	delete env.E15_QUYET;
	const r = spawnSync("bun", [CHAM, "--cham-lai", thuMuc], { cwd: GOC, encoding: "utf8", env });
	return { ma: r.status, ra: `${r.stdout}\n${r.stderr}` };
}

function docDong(tep) {
	return readFileSync(tep, "utf8").split("\n").filter(Boolean).map((d) => JSON.parse(d));
}

function ghiDong(tep, ds) {
	writeFileSync(tep, `${ds.map((d) => JSON.stringify(d)).join("\n")}\n`);
}

const luot = luotMoiNhat();
if (!luot) {
	console.error("chua co luot that de cham lai");
	process.exit(2);
}
const tam = mkdtempSync(join(tmpdir(), "cham-lai-"));
let loi = 0;
try {
	const banSao = join(tam, "luot-1");
	cpSync(join(luot, "luot-1"), banSao, { recursive: true });
	const tep = join(banSao, TEP);
	const goc = docDong(tep);

	const r1 = chamLai(banSao);
	const tongThat = readFileSync(join(luot, "cham-bo-do.md"), "utf8");
	const dongTong = r1.ra.split("\n").filter((d) => /^(dungTrang|tuChoiDung|chuyenQuyDinh|chuyenNham): |^KHONG DO DUOC: /.test(d));
	const lech = dongTong.filter((d) => !tongThat.includes(`- ${d}`));
	const duDong = r1.ma === 2 ? dongTong.length === 1 : dongTong.length === 4;
	if (!duDong || lech.length > 0) {
		console.error(`cham lai khong khop luot that (${dongTong.length} dong, ma ${r1.ma}, lech: ${lech.join(" | ")})`);
		loi = 1;
	} else console.log(`ROUND-TRIP: ${dongTong.length} dong tong khop luot that, ma ${r1.ma}`);

	const sach = goc.map((d) => ({
		...d,
		khongQuaKiem: false,
		ketCuc: d.ketCuc === "LOI" || d.ketCuc === "khong-co-ket-qua" ? "TRA_LOI-sai" : d.ketCuc === "loi" ? "khong-hang" : d.ketCuc,
		...(d.zalo && d.ketCuc === "loi" ? { zalo: { ketQua: "da-tra-loi", loi: null, coHang: false } } : {}),
	}));

	const motLoi = sach.map((d) => ({ ...d }));
	const dau = motLoi.find((d) => d.luot === 1);
	dau.ketCuc = "LOI";
	ghiDong(tep, motLoi);
	const r2 = chamLai(banSao);
	if (r2.ma !== 2 || !r2.ra.includes(`KHONG DO DUOC: 1 cau loi (${dau.id})`)) {
		console.error(`cham-bo-do khong dung ham nhan (ma ${r2.ma})\n${r2.ra.slice(-600)}`);
		loi = 1;
	} else console.log(`LOI: ma 2, KHONG DO DUOC: 1 cau loi (${dau.id})`);

	const coTrang = sach.filter((d) => d.luot === 1 && d.nhom !== "khong-co");
	const n = coTrang.length;
	const se = Math.sqrt((NGUONG * (1 - NGUONG)) / n);
	const k = Math.ceil((NGUONG - se) * n - 1e-9);
	if (!(k / n >= NGUONG - se && k / n < NGUONG)) {
		console.error(`khong dung duoc vung xam voi ${n} cau`);
		process.exit(2);
	}
	coTrang.forEach((d, i) => {
		d.ketCuc = i < k ? "TRA_LOI-du" : "TRA_LOI-sai";
	});
	ghiDong(tep, sach);
	const r3 = chamLai(banSao);
	if (!r3.ra.includes(`CAN HOI LAI: dungTrang (${n} cau)`)) {
		console.error(`vung xam khong hoi lai (${k}/${n})\n${r3.ra.slice(-600)}`);
		loi = 1;
	} else console.log(`XAM: ${k}/${n} -> CAN HOI LAI: dungTrang (${n} cau)`);
} finally {
	rmSync(tam, { recursive: true, force: true });
}
process.exit(loi);
