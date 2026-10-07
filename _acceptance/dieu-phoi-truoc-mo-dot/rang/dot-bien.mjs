import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const NGUON = join(GOC, "scripts", "dieu-phoi");
const TRAN_LENH_MS = 60_000;

const DOT_BIEN = [
	{ ma: "T1", tep: "phat-lich.mjs", tim: "    const tra = docTraLoi(thuMuc, y._ten);\n", thay: "    const tra = docJson(path.join(thuMuc, 'tra-loi', `${y._ten}.json`));\n", ghim: [["tra-loi", "tệp trả lời hỏng cú pháp: nhịp không ném, cách ly, cấp và thu hồi vẫn chạy"]] },
	{ ma: "T2", tep: "hinh-dang.mjs", tim: "  if (la.length > 0) sai(`khoá lạ ${la.join(', ')}`);\n", thay: "", ghim: [["tra-loi", "tệp trả lời sai hình dạng: ma trận năm ô cách ly nêu trường; đúng hình dạng thì áp"]] },
	{ ma: "T3", tep: "hinh-dang.mjs", tim: "  if (!laChuoi(du.ket_qua)) sai('ket_qua phải là chuỗi không rỗng');\n", thay: "", ghim: [["tra-loi", "tệp trả lời sai hình dạng: ma trận năm ô cách ly nêu trường; đúng hình dạng thì áp"]] },
	{ ma: "T4", tep: "phat-lich.mjs", tim: "    fs.renameSync(nguon, path.join(noiHong, tep));", thay: "    fs.copyFileSync(nguon, path.join(noiHong, tep));", ghim: [["tra-loi", "tệp trả lời hỏng rồi giám sát ghi lại: áp đúng một lần, không báo lặp"]] },
	{ ma: "T5", tep: "hook-chan-s4.mjs", tim: "const KY_TU_AN_TOAN = /^[\\w./:@%+,-]+(?: [\\w./:@%+,-]+)*$/;", thay: "const KY_TU_AN_TOAN = /^[\\w./=:@%+,-]+(?: [\\w./=:@%+,-]+)*$/;", ghim: [["hook-chan-s4", "dòng lệnh bọc chạy ra cùng kết quả như lệnh gốc: ma trận bảy dạng"]] },
	{ ma: "T6", tep: "hinh-dang.mjs", tim: "export const KHOA_TRA_LOI = ['ket_qua', 'boi', 'ly_do', 'luc', 'voi', 'tai_nguyen', 'uoc_phut'];", thay: "export const KHOA_TRA_LOI = ['ket_qua', 'boi', 'ly_do', 'luc', 'tai_nguyen', 'uoc_phut'];", ghim: [["tra-loi", "tệp trả lời sai hình dạng: ma trận năm ô cách ly nêu trường; đúng hình dạng thì áp"]] },
];

const ghi = (s) => process.stdout.write(`${s}\n`);

function chayTest(thuMuc, tep) {
	const r = spawnSync(process.execPath, ["--test", "--test-reporter=tap", join(thuMuc, "test", `${tep}.test.mjs`)], {
		cwd: thuMuc,
		encoding: "utf8",
		timeout: TRAN_LENH_MS,
	});
	const tap = r.stdout ?? "";
	const do_ = [...tap.matchAll(/^\s*not ok \d+ - (.+)$/gm)].map((m) => m[1].trim());
	const xanh = [...tap.matchAll(/^\s*ok \d+ - (.+)$/gm)].map((m) => m[1].trim());
	return { ma: r.status, do_, xanh };
}

function banChep() {
	const d = mkdtempSync(join(tmpdir(), "dptm-db-"));
	cpSync(NGUON, d, { recursive: true });
	return d;
}

const tam = [];
let sai = 0;
try {
	const nen = banChep();
	tam.push(nen);
	const tatCaTep = [...new Set(DOT_BIEN.flatMap((m) => m.ghim.map(([t]) => t)))];
	for (const tep of tatCaTep) {
		const r = chayTest(nen, tep);
		ghi(`nen ${tep}: ma ${r.ma}, xanh ${r.xanh.length}, do ${r.do_.length}`);
		if (r.ma !== 0 || r.do_.length > 0 || r.xanh.length === 0) {
			ghi(`NEN DO ${tep}`);
			process.exit(2);
		}
		for (const m of DOT_BIEN) {
			for (const [t, ca] of m.ghim) {
				if (t === tep && !r.xanh.includes(ca)) {
					ghi(`KHONG DO DUOC: ca ghim '${ca}' khong co trong ${tep}.test.mjs`);
					process.exit(2);
				}
			}
		}
	}
	for (const m of DOT_BIEN) {
		const d = banChep();
		tam.push(d);
		const p = join(d, m.tep);
		const cu = readFileSync(p, "utf8");
		if (cu.split(m.tim).length !== 2) {
			ghi(`MOC VANG ${m.ma} ${m.tep}`);
			process.exit(2);
		}
		writeFileSync(p, cu.replace(m.tim, m.thay));
		const doThat = new Set();
		for (const tep of [...new Set(m.ghim.map(([t]) => t))]) {
			for (const ca of chayTest(d, tep).do_) {
				doThat.add(`${tep}::${ca}`);
				ghi(`${m.ma} DO: ${tep}.test.mjs::${ca}`);
			}
		}
		for (const [tep, ca] of m.ghim) {
			if (doThat.has(`${tep}::${ca}`)) ghi(`BAT ${m.ma} ${tep}.test.mjs::${ca}`);
			else {
				sai++;
				ghi(`SONG ${m.ma}: ${tep}.test.mjs::${ca} — do that: ${[...doThat].join(" | ") || "khong ca nao"}`);
			}
		}
	}
} finally {
	for (const d of tam) rmSync(d, { recursive: true, force: true });
}
ghi(`KET LUAN: ${DOT_BIEN.length} dot bien, ${sai === 0 ? "moi ca ghim deu do" : `${sai} ca ghim song`}`);
process.exit(sai === 0 ? 0 : 1);
