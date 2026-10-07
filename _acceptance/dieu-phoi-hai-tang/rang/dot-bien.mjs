import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const NGUON = join(GOC, "scripts", "dieu-phoi");
const TRAN_LENH_MS = 60_000;

const DOT_BIEN = [
	{ ma: "M1", tep: "lich.mjs", tim: "d.loai === 'ghim-lai' && d.mo_merge ? 0 : 1", thay: "1", ghim: [["lich", "xepHang: ghim-lai mở merge chen lên trước mọi đơn"]] },
	{ ma: "M1b", tep: "lich.mjs", tim: "mocCua(hangViec, d.slug), d.luc]", thay: "d.luc]", ghim: [["lich", "xepHang: mốc sớm trước, rồi giờ xin"], ["phat-lich", "cấp lượt theo mốc: P1 (mốc 12/10) trước P2 (14/10); đơn được xoá; chu.json đủ trường"]] },
	{ ma: "M2", tep: "lich.mjs", tim: "    ban.add(tn);\n", thay: "", ghim: [["lich", "capLuot: mỗi tài nguyên một lượt; ghim-lai dùng chung khoá s4"], ["lich", "phát lại 04/10: bốn phiên nhường chéo thì luật cũ không cấp ai, luật mới cấp một"], ["bien", "phát lại kẹt chéo: luật tự nhường chạy thật trên cùng đơn → 0 lượt, bỏ một mắt xích → 1; capLuot → đúng 1"]] },
	{ ma: "M2b", tep: "phat-lich.mjs", tim: "    if (!fs.existsSync(d)) continue;", thay: "    if (!fs.existsSync(d)) { dangGiu[tn] = { phien: '?' }; continue; }", ghim: [["phat-lich", "nhả khoá → nhịp sau cấp cho người kế (không bao giờ trống khi còn đơn)"]] },
	{ ma: "M3", tep: "lich.mjs", tim: "nhipTuoiPhut !== null && nhipTuoiPhut < cfg.nhip_cu_phut", thay: "true", ghim: [["lich", "xetHanThue: còn hạn giữ; hết hạn + nhịp mới gia hạn; hết hạn + nhịp cũ thu hồi"], ["phat-lich", "hạn thuê: hết hạn + nhịp cũ → thu hồi + can_phan; thư mục khoá trống quá 60″ → thu hồi"]] },
	{ ma: "M12", tep: "phat-lich.mjs", tim: "mtimeMs > KHOA_TRONG_MS", thay: "mtimeMs > Infinity", ghim: [["phat-lich", "hạn thuê: hết hạn + nhịp cũ → thu hồi + can_phan; thư mục khoá trống quá 60″ → thu hồi"]] },
	{ ma: "M4", tep: "suc-khoe.mjs", tim: "if (dung > nguong.swap_gb)", thay: "if (tong > 0 && dung / tong > 0.5)", ghim: [["suc-khoe", "báo động giả đo 05/10: swap 1,6/3 GB (54 %) nhưng áp lực mức 1 → KHÔNG giảm tải"]] },
	{ ma: "M4b", tep: "lich.mjs", tim: "    if (giamTai && tn !== 'merge') continue;\n", thay: "", ghim: [["lich", "capLuot: giảm tải chặn s4, ghim-lai, duong-nen nhưng vẫn cấp merge"], ["phat-lich", "giảm tải: không cấp s4; đúng một sự kiện can_phan khi vào giảm tải"]] },
	{ ma: "M5", tep: "hook-chan-s4.mjs", tim: "return { ma: 2, loi: `chan-s4: lỗi nội bộ: ${e.message}", thay: "return { ma: 0, loi: `chan-s4: lỗi nội bộ: ${e.message}", ghim: [["hook-chan-s4", "đóng khi lỗi: lệnh S4 + lỗi nội bộ → 2 «lỗi nội bộ»"]] },
	{ ma: "M6", tep: "hook-chan-s4.mjs", tim: "  if (phanLoai(dauVao) === null && !MAU_THO.test(raw)) return { ma: 0 };\n", thay: "", ghim: [["hook-chan-s4", "chiều im: không có đợt, hoặc lệnh không phải S4 → 0, kể cả khi config hỏng"]] },
	{ ma: "M7", tep: "hook-cho-nguoi.mjs", tim: "  if (coTepBatDau(thuMuc, 'xin', `${phien}-`).length > 0) return 'cho-luot';\n", thay: "", ghim: [["hook-nhip-cho-nguoi", "chờ người — chiều im: đang có đơn xin hoặc yêu cầu chưa trả lời thì không vào hộp quyết định"]] },
	{ ma: "M8", tep: "yeu-cau.mjs", tim: ".filter((b) => b !== nhanhMinh)", thay: "", ghim: [["yeu-cau", "cham-tep: nhánh của chính phiên xin không tính là vướng (chiều im)"]] },
	{ ma: "M8b", tep: "phat-lich.mjs", tim: "      daBao.add(y._ten);\n", thay: "", ghim: [["phat-lich", "yêu cầu: chạm tệp được máy duyệt → tra-loi + ranh-gioi-them; việc cần phán → một can_phan, không lặp"]] },
	{ ma: "M9", tep: "lich.mjs", tim: " && duPhuThuoc(h))", thay: ")", ghim: [["lich", "chonHangKe: tiếp hàng đang làm; chọn hàng đủ phụ thuộc theo uu_tien; chờ; xong"]] },
	{ ma: "M10", tep: "bang.mjs", tim: "  String(s ?? '').replace(", thay: "  String(s ?? '') || String(s ?? '').replace(", ghim: [["bang", "veBang: escape mọi chuỗi; link lạ không thành href"]] },
	{ ma: "M10b", tep: "phat-lich.mjs", tim: "  fs.writeFileSync(path.join(thuMuc, 'bang.html'), veBang(tt));\n", thay: "", ghim: [["phat-lich", "hàng kế: ghi tiep/P1.json; trang-thai.json + bang.html có mặt"]] },
	{ ma: "M11", tep: "phat-lich.mjs", tim: "      process.kill(cu, 0);\n      return false;\n", thay: "      process.kill(cu, 0);\n", ghim: [["phat-lich", "giuPid: một tiến trình KHÁC còn sống đang giữ → từ chối; pid chết → nhận lại; chính mình → giữ"]] },
	{ ma: "M16", tep: "hinh-dang.mjs", tim: "  if (!laThuMuc) throw new Error(`worktree ${du.worktree} không phải thư mục tồn tại`);\n", thay: "", ghim: [["bien", "đơn sai hình dạng → xin/hong/ + can_phan nêu trường; đơn lành cùng nhịp vẫn được cấp"]] },
	{ ma: "M16b", tep: "hinh-dang.mjs", tim: "  if (!LOAI_DON.includes(du.loai)) throw new Error(`loai ${du.loai} không thuộc ${LOAI_DON.join(', ')}`);\n", thay: "", ghim: [["bien", "đơn sai hình dạng → xin/hong/ + can_phan nêu trường; đơn lành cùng nhịp vẫn được cấp"]] },
	{ ma: "M19", tep: "yeu-cau.mjs", tim: "  if (!Array.isArray(tep) || !tep.every((t) => typeof t === 'string')) return { ket_qua: 'can_phan', ly_do: 'tep phải là danh sách đường dẫn' };\n", thay: "", ghim: [["bien", "yêu cầu cham-tep với tep là chuỗi → yeu-cau/hong/ ở nhịp, can_phan ở hàm định tuyến"]] },
	{ ma: "M17", tep: "yeu-cau.mjs", tim: "    if (nguoiNoi) return { ket_qua: 'can_phan', ly_do: `${t} đã được duyệt cho ${nguoiNoi[0]}` };\n", thay: "", ghim: [["bien", "cham-tep: tệp đã duyệt cho phiên khác → can_phan; chính phiên đó → duyệt; cả khi duyệt trong cùng nhịp"]] },
	{ ma: "M18", tep: "dot.mjs", tim: "  return goc === worktree || !goc.startsWith(`${worktree}${path.sep}`);", thay: "  return true;", ghim: [["bien", "worktree lồng: cwd trong worktree git lồng không thuộc khoá của checkout chính"]] },
	{ ma: "M20", tep: "yeu-cau.mjs", tim: "    if (khopMot(baoVe, t)) return { ket_qua: 'can_phan', ly_do: `${t} thuộc danh sách bảo vệ` };\n", thay: "", ghim: [["bien", "cham-tep bảo vệ: migrations và chung_chi_them → can_phan đúng lý do; tệp thường cùng ngữ cảnh → duyệt"]] },
	{ ma: "M21", tep: "phat-lich.mjs", tim: "      cap_luc: new Date(nowMs).toISOString(),\n", thay: "", ghim: [["bien", "chu.json khi cấp: cap_luc là giờ nhịp và han_thue_den = cap_luc + han_thue_phut theo loại"]] },
	{ ma: "M22", tep: "phat-lich.mjs", tim: ".map((y) => ({ ...y, id: y._ten }))", thay: "", ghim: [["bien", "viec-phu ở nhịp thật: yêu cầu đầu → can_phan cho giám sát; yêu cầu trùng sau → gộp với id yêu cầu cũ"]] },
	{ ma: "M23", tep: "yeu-cau.mjs", tim: "      truocDo(c, yc) &&\n", thay: "", ghim: [["bien", "viec-phu trùng tới cùng nhịp: yêu cầu cũ hơn lên giám sát, yêu cầu mới hơn gộp vào nó; cùng giờ thì so mã"]] },
	{ ma: "M23b", tep: "yeu-cau.mjs", tim: " || (lc === ly && String(c.id) < String(yc.id))", thay: " || lc === ly", ghim: [["bien", "viec-phu trùng tới cùng nhịp: yêu cầu cũ hơn lên giám sát, yêu cầu mới hơn gộp vào nó; cùng giờ thì so mã"]] },
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
	const d = mkdtempSync(join(tmpdir(), "dph-db-"));
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
