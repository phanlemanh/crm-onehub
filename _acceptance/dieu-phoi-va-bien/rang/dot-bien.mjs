import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const NGUON = join(GOC, "scripts", "dieu-phoi");
const TRAN_LENH_MS = 60_000;

const DOT_BIEN = [
	{ ma: "V1", tep: "hook-chan-s4.mjs", tim: "    return laS4Workflow(dauVao.tool_input, lenh, dauVao.cwd) ? 's4' : null;", thay: "    return String(dauVao.tool_input?.scriptPath ?? '').endsWith('acceptance-verify.js') ? 's4' : null;", ghim: [["hook-chan-s4", "S4 workflow mọi đường vào: năm dạng → chặn khi chưa có lượt, 0 khi khoá đúng worktree"]] },
	{ ma: "V2", tep: "hook-chan-s4.mjs", tim: "  if (dau !== null) return tenMetaCua(dau) === meta;\n", thay: "", ghim: [["hook-chan-s4", "S4 workflow mọi đường vào: năm dạng → chặn khi chưa có lượt, 0 khi khoá đúng worktree"]] },
	{ ma: "V3", tep: "hook-chan-s4.mjs", tim: "  if (vao?.name === meta) return true;\n", thay: "", ghim: [["hook-chan-s4", "S4 workflow mọi đường vào: năm dạng → chặn khi chưa có lượt, 0 khi khoá đúng worktree"]] },
	{ ma: "V4", tep: "hook-chan-s4.mjs", tim: "  if (typeof vao?.script === 'string' && tenMetaCua(vao.script) === meta) return true;\n", thay: "", ghim: [["hook-chan-s4", "S4 workflow mọi đường vào: năm dạng → chặn khi chưa có lượt, 0 khi khoá đúng worktree"]] },
	{ ma: "V5", tep: "hook-chan-s4.mjs", tim: "const MAU_THO = /acceptance-verify|repin-lane", thay: "const MAU_THO = /acceptance-verify\\.js|repin-lane", ghim: [["hook-chan-s4", "chiều im S4 workflow: meta khác, tệp vắng, script khác → 0; đầu vào hỏng nhắc bản chép → 2"]] },
	{ ma: "V6", tep: "hook-chan-s4.mjs", tim: "function tenMetaCua(text) {\n", thay: "function tenMetaCua(text) {\n  if (text.includes('acceptance-verify')) return 'acceptance-verify';\n", ghim: [["hook-chan-s4", "chiều im S4 workflow: meta khác, tệp vắng, script khác → 0; đầu vào hỏng nhắc bản chép → 2"]] },
	{ ma: "V7", tep: "hinh-dang.mjs", tim: "  if (!laDanhSachChuoi(du.bao_ve)) sai('bao_ve phải là danh sách chuỗi');\n", thay: "", ghim: [["hinh-dang", "kiemCauHinh: ma trận mười sáu ô sai → lỗi nêu đúng trường; mẫu + goc_kho qua"], ["hinh-dang", "nhịp thật với cấu hình sai: bao_ve chuỗi không duyệt tệp bảo vệ; thiếu han_thue_phut duong-nen không kẹt khoá"], ["hook-chan-s4", "cấu hình sai hình dạng (JSON đúng): lệnh S4 → 2 lỗi nội bộ nêu tệp; lệnh thường → 0"]] },
	{ ma: "V8", tep: "hinh-dang.mjs", tim: "  for (const loai of LOAI_DON) {\n    if (!laSoDuong(", thay: "  for (const loai of []) {\n    if (!laSoDuong(", ghim: [["hinh-dang", "kiemCauHinh: ma trận mười sáu ô sai → lỗi nêu đúng trường; mẫu + goc_kho qua"], ["hinh-dang", "nhịp thật với cấu hình sai: bao_ve chuỗi không duyệt tệp bảo vệ; thiếu han_thue_phut duong-nen không kẹt khoá"]] },
	{ ma: "V29", tep: "hinh-dang.mjs", tim: "  for (const loai of LOAI_DON) {\n    if (!laSoDuong(", thay: "  for (const loai of ['s4', 'ghim-lai', 'duong-nen']) {\n    if (!laSoDuong(", ghim: [["hinh-dang", "kiemCauHinh: ma trận mười sáu ô sai → lỗi nêu đúng trường; mẫu + goc_kho qua"]] },
	{ ma: "V9", tep: "hinh-dang.mjs", tim: "  kiemKhoaLa(du, KHOA_CAU_HINH, TEP_CAU_HINH, '');\n", thay: "", ghim: [["hinh-dang", "kiemCauHinh: ma trận mười sáu ô sai → lỗi nêu đúng trường; mẫu + goc_kho qua"]] },
	{ ma: "V10", tep: "hinh-dang.mjs", tim: "  if (du.nhip_cu_phut <= giuNhipPhut) sai(", thay: "  if (false) sai(", ghim: [["hinh-dang", "kiemCauHinh: ma trận mười sáu ô sai → lỗi nêu đúng trường; mẫu + goc_kho qua"]] },
	{ ma: "V11", tep: "hinh-dang.mjs", tim: "    if (!ids.has(h.day)) sai(", thay: "    if (false) sai(", ghim: [["hinh-dang", "kiemHangViec: ma trận mười ba ô sai → lỗi nêu đúng trường; mẫu và fixture qua"]] },
	{ ma: "V12", tep: "hinh-dang.mjs", tim: "for (const k of ['sau', 'ranh_gioi', 'chung_chi_them'])", thay: "for (const k of ['sau', 'chung_chi_them'])", ghim: [["hinh-dang", "kiemHangViec: ma trận mười ba ô sai → lỗi nêu đúng trường; mẫu và fixture qua"]] },
	{ ma: "V30", tep: "hinh-dang.mjs", tim: "for (const k of ['sau', 'ranh_gioi', 'chung_chi_them'])", thay: "for (const k of ['sau', 'ranh_gioi'])", ghim: [["hinh-dang", "kiemHangViec: ma trận mười ba ô sai → lỗi nêu đúng trường; mẫu và fixture qua"]] },
	{ ma: "V13", tep: "phat-lich.mjs", tim: "  const cfg = docCauHinh(thuMuc);\n  const hangViec", thay: "  const cfg = docJson(path.join(thuMuc, 'dieu-phoi.config.json'));\n  const hangViec", ghim: [["hinh-dang", "nhịp thật với cấu hình sai: bao_ve chuỗi không duyệt tệp bảo vệ; thiếu han_thue_phut duong-nen không kẹt khoá"]] },
	{ ma: "V14", tep: "hook-chan-s4.mjs", tim: "  docCauHinh(thuMuc);\n  const taiNguyen", thay: "  docJson(path.join(thuMuc, 'dieu-phoi.config.json'));\n  const taiNguyen", ghim: [["hook-chan-s4", "cấu hình sai hình dạng (JSON đúng): lệnh S4 → 2 lỗi nội bộ nêu tệp; lệnh thường → 0"]] },
	{ ma: "V31", tep: "hook-chan-s4.mjs", tim: "  docCauHinh(thuMuc);\n  const taiNguyen", thay: "  docCauHinh(thuMuc);\n  JSON.parse(fs.readFileSync(path.join(thuMuc, 'hang-viec.json'), 'utf8')).day.forEach(() => {});\n  const taiNguyen", ghim: [["hook-chan-s4", "hang-viec.json sai không đổi hook chặn S4"]] },
	{ ma: "V15", tep: "hook-cho-nguoi.mjs", tim: "  const hangViec = docHangViec(thuMuc);\n", thay: "  const hangViec = JSON.parse(fs.readFileSync(path.join(thuMuc, 'hang-viec.json'), 'utf8'));\n", ghim: [["hook-nhip-cho-nguoi", "chờ người với hang-viec.json sai hình dạng: không ghi cho-nguoi"]] },
	{ ma: "V32", tep: "hook-cho-nguoi.mjs", tim: "  const hangViec = docHangViec(thuMuc);\n", thay: "  if (!Array.isArray(JSON.parse(fs.readFileSync(path.join(thuMuc, 'dieu-phoi.config.json'), 'utf8')).bao_ve)) throw new Error('cau hinh');\n  const hangViec = docHangViec(thuMuc);\n", ghim: [["hook-nhip-cho-nguoi", "cấu hình sai không đổi hook chờ người"]] },
	{ ma: "V17", tep: "giu-nhip.mjs", tim: "    const hen = setInterval(cham, moiMs);", thay: "    const hen = null;", ghim: [["giu-nhip", "giữ nhịp qua nhịp thật: lệnh bọc dài → gia hạn; cùng fixture không bọc → thu hồi"]] },
	{ ma: "V18", tep: "hook-nhip.mjs", tim: "    if (chu && trongWorktree(chu.worktree, dauVao.cwd)) {", thay: "    if (chu) {", ghim: [["giu-nhip", "giữ nhịp qua nhịp thật: lệnh bọc dài → gia hạn; cùng fixture không bọc → thu hồi"]] },
	{ ma: "V19", tep: "giu-nhip.mjs", tim: "      xong(tinNhan ? maCuaTinHieu(tinNhan) : ma);", thay: "      xong(0);", ghim: [["giu-nhip", "lệnh bọc: mã thoát, SIGTERM, ngoài đợt"]] },
	{ ma: "V20", tep: "giu-nhip.mjs", tim: "          con.kill(ten);\n", thay: "", ghim: [["giu-nhip", "lệnh bọc: mã thoát, SIGTERM, ngoài đợt"]] },
	{ ma: "V21", tep: "hook-chan-s4.mjs", tim: "return xetLenhNen(dauVao, taiNguyen);", thay: "return { ma: 0 };", ghim: [["hook-chan-s4", "giữ khoá mà chạy nền lệnh nặng không bọc → 2 kèm lệnh bọc; bọc, tiền cảnh, lệnh thường → 0"]] },
	{ ma: "V22", tep: "hook-chan-s4.mjs", tim: "const MAU_LENH_BOC = /", thay: "const MAU_LENH_BOC = /giu-nhip|", ghim: [["hook-chan-s4", "giữ khoá mà chạy nền lệnh nặng không bọc → 2 kèm lệnh bọc; bọc, tiền cảnh, lệnh thường → 0"]] },
	{ ma: "V23", tep: "phat-lich.mjs", tim: "  const daBao = apGiaHan(thuMuc, nowMs, xuLyYeuCau(thuMuc, cfg, hangViec, io, cu, nowMs));", thay: "  const daBao = xuLyYeuCau(thuMuc, cfg, hangViec, io, cu, nowMs);", ghim: [["gia-han", "gia-han máy duyệt kéo dài hạn thuê đúng một lần"], ["gia-han", "giám sát duyệt gia-han: áp một lần, không áp lượt sau, không áp sang phiên khác, thiếu phút báo một lần"]] },
	{ ma: "V24", tep: "phat-lich.mjs", tim: "    if ((chu.gia_han_theo ?? []).includes(y._ten)) {", thay: "    if (false) {", ghim: [["gia-han", "gia-han máy duyệt kéo dài hạn thuê đúng một lần"]] },
	{ ma: "V25", tep: "lich.mjs", tim: "Math.max(Date.parse(hanCu), nowMs)", thay: "Date.parse(hanCu)", ghim: [["gia-han", "gốc là giờ nhịp khi hạn cũ đã qua"]] },
	{ ma: "V26", tep: "yeu-cau.mjs", tim: "  if (dangGiu.length === 0) return { ket_qua: 'can_phan', ly_do: `${yc.phien} không giữ khoá nào` };\n", thay: "", ghim: [["gia-han", "gia-han: ma trận giữ khoá ở hàm định tuyến"]] },
	{ ma: "V27", tep: "phat-lich.mjs", tim: "    if (Date.parse(y.luc) < Date.parse(chu.cap_luc)) continue;\n", thay: "", ghim: [["gia-han", "giám sát duyệt gia-han: áp một lần, không áp lượt sau, không áp sang phiên khác, thiếu phút báo một lần"]] },
	{ ma: "V28", tep: "phat-lich.mjs", tim: "      ghiSuKien(thuMuc, { loai: 'gia-han-khong-ap', id: y._ten, phien: y.phien, ly_do, can_phan: true });\n      daBao.add(dau);\n", thay: "      ghiSuKien(thuMuc, { loai: 'gia-han-khong-ap', id: y._ten, phien: y.phien, ly_do, can_phan: true });\n", ghim: [["gia-han", "giám sát duyệt gia-han: áp một lần, không áp lượt sau, không áp sang phiên khác, thiếu phút báo một lần"]] },
	{ ma: "V33", tep: "phat-lich.mjs", tim: "    if (!chu || chu.phien !== y.phien) {", thay: "    if (!chu) {", ghim: [["gia-han", "giám sát duyệt gia-han: áp một lần, không áp lượt sau, không áp sang phiên khác, thiếu phút báo một lần"]] },
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
	const d = mkdtempSync(join(tmpdir(), "dpvb-db-"));
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
