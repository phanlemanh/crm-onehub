#!/usr/bin/env node
// cat-luot.mjs — răng phủ của skill cắt lượt + nhịp đo từ hồ sơ. Hồ sơ _acceptance/lo-trinh-cat-luot/,
// design docs/superpowers/specs/2026-10-08-lo-trinh-cat-luot-design.md.
//
// CHỈ ĐỌC: không ghi tệp nào, không gọi mô hình. Bản phạm vi (khuôn
// skills/acceptance/references/pham-vi-template.md, khối PHAM-VI-MA) và tệp lộ trình phải là tệp git
// theo dõi trong kho. Răng chỉ xét mục mang cùng `dot` với bản phạm vi; cờ khuôn và lệch ngày của hàng
// ngoài đợt thành dòng «cảnh báo:», không đổi mã thoát.
//
// Hồ sơ _acceptance/vong-la-mot-ket-qua/ (hàng S3, design docs/superpowers/specs/2026-10-11-vong-la-mot-ket-qua-design.md)
// thêm: khoảng cỡ đọc từ khối CAT-LUOT-CO của SKILL cạnh script (không số nào của khoảng nằm trong mã),
// tám cờ có tên cho cỡ dự kiến và dáng câu giao (`kiemCo`), và đồng hồ cỡ chỉ đọc (`--co`).
//
// Hồ sơ _acceptance/lo-trinh-chi-viec-phat-trien/ (hàng S3b, design docs/superpowers/specs/2026-10-11-lo-trinh-chi-viec-phat-trien-design.md)
// thêm: MỐC NGOÀI (`moc` có `loai: "ngoai"`, mang `dot` + `phu` + `ai`) là chỗ thứ ba của bảng phủ — việc vận
// hành của người, không thành hàng; bốn cờ: hàng đứng chờ mốc vận hành · `du_lieu` sai giá trị · hàng đo trên
// dữ liệu giả không đứng trên hàng sinh · mốc vận hành lặp lại chưa trỏ tự phục vụ.
//
//   node scripts/cat-luot.mjs --root . --pham-vi <tệp> --lo-trinh <tệp>   0 xanh · 1 đỏ · 2 không chạy được
//   node scripts/cat-luot.mjs --root . --nhip                              JSON nhịp theo hạng
//   node scripts/cat-luot.mjs --root . --co [--tu YYYY-MM-DD] [--lo-trinh <tệp>]   JSON đồng hồ cỡ
import { readFileSync, readdirSync, existsSync, realpathSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { kiemKhuon } from './lo-trinh.mjs';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { frontmatterField } = require(path.join(__dirname, '..', 'lib', 'evidence-core.cjs'));
// Hai bộ đọc dùng chung — không chép khuôn: tiêu chí đếm bằng bộ đọc của thẻ Cổng Phạm vi, «đã giao»
// là tập trạng thái lưới trước-merge dùng.
const { parseACBlock } = require(path.join(__dirname, '..', 'lib', 'ac-line.cjs'));
const { DA_THONG_CONG_2, DA_DONG_THUC_TE } = require(path.join(__dirname, '..', 'lib', 'workspace-record.cjs'));

export const DANG = ['chuoi', 'lan-va'];
const chuoi = v => (v == null ? '' : String(v).trim());
const NGAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const nfc = v => chuoi(v).normalize('NFC');
// Mốc ngoài (hàng S3b): việc vận hành của người. Nhãn in ra = ma, vắng thì ten, rồi ngày.
export const LOAI_NGOAI = 'ngoai';
const laNgoai = m => chuoi(m.loai) === LOAI_NGOAI;
const nhanMoc = m => chuoi(m.ma) || chuoi(m.ten) || chuoi(m.ngay) || '?';
// Mục `dung_tren` x trỏ một mốc ngoài (bất kỳ đợt) khi khớp `ma`, hoặc `ten` sau NFC — một bộ khớp cho răng phủ và cờ.
const mocNgoaiCua = (moc, x) => moc.find(m => laNgoai(m) && (chuoi(m.ma) === x || nfc(m.ten) === nfc(x)));
const MA_DONG = /^- `([^`]*)` — (\S.*)$/;

// ── Bản phạm vi ───────────────────────────────────────────────────────────────
// Ba khoá đầu tệp (dot · dang · nguon), mỗi dòng `- \`<mã>\` — <mô tả>` một mã. Dòng mở bằng «- `»
// mà sai khuôn thì báo kèm số dòng — không bỏ lặng.
export function docPhamVi(txt) {
  const loi = []; const khoa = {}; const ma = []; const thay = new Set();
  String(txt ?? '').split(/\r?\n/).forEach((dong, i) => {
    const k = dong.match(/^(dot|dang|nguon):\s*(.*)$/);
    if (k) { if (!(k[1] in khoa)) khoa[k[1]] = k[2].trim(); return; }
    if (!dong.startsWith('- `')) return;
    const m = dong.match(MA_DONG);
    if (!m || !m[1].trim()) { loi.push(`dòng sai khuôn ${i + 1}: ${dong.trim()}`); return; }
    const c = m[1].trim();
    if (thay.has(c)) { loi.push(`mã trùng trong bản phạm vi: ${c}`); return; }
    thay.add(c); ma.push({ ma: c, mo_ta: m[2].trim(), dong: i + 1 });
  });
  const dot = chuoi(khoa.dot); const dang = chuoi(khoa.dang);
  if (!dot) loi.push('bản phạm vi thiếu dot');
  if (!DANG.includes(dang)) loi.push(`dang «${dang}» không phải chuoi hoặc lan-va`);
  return { dot, dang, nguon: chuoi(khoa.nguon), ma, loi };
}

// ── Răng ──────────────────────────────────────────────────────────────────────
// Nhãn mà một câu cờ của kiemKhuon gắn vào (hàng <nhãn> … · mã trùng: <mã>) — null khi cờ cấp tệp.
const nhanCuaCo = c => { const a = String(c).match(/^hàng (.+?)(?::| thiếu )/); if (a) return a[1]; const b = String(c).match(/^mã trùng: (.+)$/); return b ? b[1] : null; };
const CO_TEP_DO = [/^khối hang phải là một mảng$/, /^khối chan_troi phải là một mảng$/, /^chan_troi #\d+ không phải object$/];

export function kiemPhu(pv, data) {
  const loi = []; const canhBao = [];
  const k = kiemKhuon(data);
  const trongDot = r => chuoi(r.dot) === pv.dot;
  const hang = k.hang; const dot = hang.filter(trongDot);
  const nhanDot = new Set(dot.map(r => String(r._nhan)));
  for (const c of k.co) {
    const n = nhanCuaCo(c);
    if (n != null ? nhanDot.has(String(n)) : CO_TEP_DO.some(re => re.test(c))) loi.push(c); else canhBao.push(c);
  }
  const theoMa = new Map(hang.filter(r => r._ma).map(r => [r._ma, r]));
  // Mục trỏ một mốc ngoài thuộc cờ cho-van-hanh của kiemCo — không in thêm «mã không có» cho cùng mục.
  const laMocNgoai = x => !!mocNgoaiCua(k.moc, x);
  for (const r of hang) for (const x of (Array.isArray(r.dung_tren) ? r.dung_tren : []).map(chuoi)) if (!theoMa.has(x) && !laMocNgoai(x)) (trongDot(r) ? loi : canhBao).push(`hàng ${r._nhan}: đứng trên mã không có: ${x}`);
  // Ngày: hàng đứng sau không sớm hơn hàng nó đứng trên; hàng gắn mốc không muộn hơn ngày mốc.
  const datNgay = (r, cau) => (trongDot(r) ? loi : canhBao).push(cau);
  for (const r of hang) {
    const n = chuoi(r.ngay); if (!NGAY_RE.test(n)) continue;
    for (const x of (Array.isArray(r.dung_tren) ? r.dung_tren : []).map(chuoi)) {
      const t = theoMa.get(x); const nt = t ? chuoi(t.ngay) : '';
      if (NGAY_RE.test(nt) && n < nt) datNgay(r, `hàng ${r._nhan}: ngày ${n} sớm hơn ngày ${nt} của hàng ${x} nó đứng trên`);
    }
  }
  for (const m of k.moc) {
    const nm = chuoi(m.ngay); if (!NGAY_RE.test(nm) || !Array.isArray(m.hang)) continue;
    for (const x of m.hang.map(chuoi)) {
      const r = theoMa.get(x); const n = r ? chuoi(r.ngay) : '';
      if (NGAY_RE.test(n) && n > nm) datNgay(r, `hàng ${r._nhan}: ngày ${n} muộn hơn mốc «${chuoi(m.ten)}» ${nm}`);
    }
  }
  // Phủ: mỗi mã của bản phạm vi ở đúng một mục cùng đợt.
  const ct = (Array.isArray(data.chan_troi) ? data.chan_troi : []).filter(c => c && typeof c === 'object' && !Array.isArray(c) && chuoi(c.dot) === pv.dot);
  for (const c of ct) if (!chuoi(c.ly_do)) loi.push(`chân trời ${chuoi(c.ma) || '?'}: thiếu ly_do`);
  // Mốc của đợt (hàng S3b): chỉ mốc ngoài gánh mã — việc vận hành của người; mốc khác đợt không xét.
  const maHang = new Set(hang.map(r => r._ma).filter(Boolean));
  const maChanTroi = new Set((Array.isArray(data.chan_troi) ? data.chan_troi : []).filter(c => c && typeof c === 'object' && !Array.isArray(c)).map(c => chuoi(c.ma)).filter(Boolean));
  const mocDot = k.moc.filter(m => chuoi(m.dot) === pv.dot);
  for (const m of mocDot) {
    const n = nhanMoc(m);
    if (m.phu !== undefined && !Array.isArray(m.phu)) loi.push(`mốc ${n}: phu phải là một mảng`);
    const phu = Array.isArray(m.phu) ? m.phu.map(chuoi).filter(Boolean) : [];
    if (!laNgoai(m)) { if (phu.length) loi.push(`mốc ${n}: mang mã của bản phạm vi mà không phải mốc ngoài (loai: ngoai) — chỉ việc vận hành của người thành mốc`); continue; }
    if (!chuoi(m.ai)) loi.push(`mốc ngoài ${n}: thiếu ai (người làm việc vận hành)`);
    if (chuoi(m.ma) && maHang.has(chuoi(m.ma))) loi.push(`mốc ngoài ${n}: mã trùng mã hàng ${chuoi(m.ma)}`);
    if (m.lap !== undefined && typeof m.lap !== 'boolean') loi.push(`mốc ${n}: lap phải là true hoặc false`);
    if (m.tu_phuc_vu !== undefined) { const t = chuoi(m.tu_phuc_vu); if (!maHang.has(t) && !maChanTroi.has(t)) loi.push(`mốc ${n}: tu_phuc_vu trỏ mã không có: ${t || '(rỗng)'}`); }
  }
  const mocPhu = mocDot.filter(m => laNgoai(m) && Array.isArray(m.phu));
  const cho = new Map();
  const ghi = (ma, noi) => { if (!cho.has(ma)) cho.set(ma, []); cho.get(ma).push(noi); };
  for (const r of dot) for (const x of (Array.isArray(r.phu) ? r.phu : []).map(chuoi)) ghi(x, `hàng ${r._nhan}`);
  for (const c of ct) for (const x of (Array.isArray(c.phu) ? c.phu : []).map(chuoi)) ghi(x, `chân trời ${chuoi(c.ma) || '?'}`);
  for (const m of mocPhu) for (const x of m.phu.map(chuoi)) ghi(x, `mốc ngoài ${nhanMoc(m)}`);
  const bang = [];
  if (!dot.length && !ct.length && !mocPhu.length) loi.push(`đợt ${pv.dot} chưa cắt: ${pv.ma.length} mã chưa ở hàng hay chân trời nào`);
  else {
    const coMa = new Set(pv.ma.map(m => m.ma));
    for (const { ma } of pv.ma) {
      const noi = cho.get(ma) || [];
      if (!noi.length) loi.push(`mã ${ma} không ở hàng hay chân trời nào — cũng không ở mốc ngoài nào`);
      else if (noi.length > 1) loi.push(`mã ${ma} ở ${noi.length === 2 ? 'hai' : noi.length} chỗ: ${noi.join(', ')}`);
      bang.push({ ma, cho: noi[0] || null });
    }
    for (const [ma, noi] of cho) if (!coMa.has(ma)) for (const n of noi) loi.push(`${n} phủ mã ${ma} — bản phạm vi không có mã này`);
  }
  return { loi, canhBao, bang };
}

// ── Khoảng cỡ (một nguồn: khối CAT-LUOT-CO của SKILL cắt lượt) ─────────────────
// Bộ đọc sống ở scripts/co-hop-dong.cjs (hồ sơ vong-mo-thang-bang-feature-loop): thẻ Cổng Phạm vi đọc
// CHÍNH các hàm này — xuất lại để bên gọi cũ (ca LT-142…) không đổi. Mã không mang số nào của khoảng.
const CHD = require(path.join(__dirname, 'co-hop-dong.cjs'));
const { ngayChuKy } = require(path.join(__dirname, 'ho-so-tom-tat.cjs'));
export const { KHOA_CO, TEP_SKILL, docKhoang, napKhoang } = CHD;

// ── Cờ cỡ và dáng câu giao (hai trường của LƯỢT CẮT: `vai`, `tieu_chi`) ─────────
// Agent không đọc hai trường này; trang lộ trình cũng không. Thiếu khai chỉ vàng (đường đọc-cũ: lộ
// trình cắt trước luật 10/10 vẫn đọc được); khai sai thì đỏ ở hàng trong đợt.
// Bốn cờ cuối của hàng S3b: vận hành và dữ liệu giả.
const CO_LAP = 'van-hanh-lap-chua-tu-phuc-vu';
export const CO_TEN = ['can-tach', 'tren-muc-tieu', 'duoi-muc-tieu', 'tieu-chi-sai-kieu', 'chua-uoc-tieu-chi', 'vai-khong-mo-cau', 'nen-thieu-bat-khi', 'chua-khai-dang-giao',
  'cho-van-hanh', 'du-lieu-sai-gia-tri', 'thieu-hang-sinh-gia', CO_LAP];
const CO_LOI = new Set(['can-tach', 'tieu-chi-sai-kieu', 'vai-khong-mo-cau', 'nen-thieu-bat-khi']);
// Cờ hàng của S3b: lỗi ở hàng trong đợt, một dòng gom ở hàng ngoài đợt (như mọi cờ hàng).
const CO_LOI_S3B = new Set(['cho-van-hanh', 'du-lieu-sai-gia-tri', 'thieu-hang-sinh-gia']);
// Gợi ý cỡ chỉ có nghĩa cho đợt đang cắt — hàng ngoài đợt không mang hai cờ này.
const CO_CHI_TRONG_DOT = new Set(['tren-muc-tieu', 'duoi-muc-tieu']);
// Nguồn dữ liệu của hàng (trường lượt cắt `du_lieu`): hàng sinh dữ liệu giả có nhãn, hoặc hàng đo trên nó.
export const DU_LIEU = ['sinh-gia', 'gia'];
const DL_SINH = 'sinh-gia'; const DL_GIA = 'gia';
const VAI_NEN = 'nen';
const chuanCau = s => String(s ?? '').normalize('NFC').replace(/^[\s«“"']+/u, '').toLocaleLowerCase('vi');
const laTieuChi = v => Number.isInteger(v) && v > 0;
function coCuaHang(r, k) {
  const ra = []; const [dau, cuoi] = k.muc_tieu; const v = r.tieu_chi;
  if (v === undefined || v === null) ra.push(['chua-uoc-tieu-chi', 'chưa ghi tieu_chi (số tiêu chí dự kiến của vòng)']);
  else if (!laTieuChi(v)) ra.push(['tieu-chi-sai-kieu', `tieu_chi ${JSON.stringify(v)} phải là số nguyên dương`]);
  else if (v >= k.tach_tu) ra.push(['can-tach', `dự kiến ${v} tiêu chí — từ ${k.tach_tu} phải tách thành nhiều vòng, mỗi vòng một kết quả`]);
  else if (v > cuoi) ra.push(['tren-muc-tieu', `dự kiến ${v} tiêu chí, trên mục tiêu ${dau}–${cuoi} — chỉ giữ khi kết quả không tách được mà giữ nghĩa (tối đa ${k.cho_phep_den})`]);
  else if (v < dau) ra.push(['duoi-muc-tieu', `dự kiến ${v} tiêu chí, dưới mục tiêu ${dau}–${cuoi}`]);
  const vai = chuoi(r.vai);
  if (!vai) ra.push(['chua-khai-dang-giao', `chưa khai vai (tên vai cho việc người dùng thấy, hoặc «${VAI_NEN}» cho việc nền)`]);
  else if (vai === VAI_NEN) { if (!chuoi(r.bat_khi)) ra.push(['nen-thieu-bat-khi', 'việc nền (vai: nen) thiếu bat_khi — hành vi hệ thống đo được']); }
  else if (!chuanCau(r.cau_giao).startsWith(chuanCau(vai))) ra.push(['vai-khong-mo-cau', `câu giao không mở bằng vai «${vai}»`]);
  return ra;
}
export function kiemCo(pv, data, k) {
  const loi = []; const canhBao = [];
  const hang = (Array.isArray(data.hang) ? data.hang : []).map((r, i) => ({ r, nhan: (r && typeof r === 'object' && !Array.isArray(r) && chuoi(r.ma)) || `#${i + 1}` }))
    .filter(({ r }) => r && typeof r === 'object' && !Array.isArray(r));
  const trongDot = hang.filter(({ r }) => chuoi(r.dot) === pv.dot); const ngoai = hang.filter(({ r }) => chuoi(r.dot) !== pv.dot);
  // Cờ vận hành + dữ liệu giả của một hàng (hàng S3b) — cần ngữ cảnh cả tệp (mã hàng, mốc).
  const moc = (Array.isArray(data.moc) ? data.moc : []).filter(m => m && typeof m === 'object' && !Array.isArray(m));
  const theoMa = new Map(hang.filter(({ r }) => chuoi(r.ma)).map(({ r }) => [chuoi(r.ma), r]));
  const coHangSinh = dt => dt.some(x => (theoMa.get(x) || {}).du_lieu === DL_SINH);
  const coS3b = r => {
    const ra = []; const dt = (Array.isArray(r.dung_tren) ? r.dung_tren : []).map(chuoi);
    const cho = [...new Set(dt.filter(x => !theoMa.has(x)).map(x => mocNgoaiCua(moc, x)).filter(Boolean).map(nhanMoc))];
    if (cho.length) ra.push(['cho-van-hanh', `đứng chờ mốc vận hành ${cho.map(t => `«${t}»`).join(', ')} — hàng phát triển không chờ người: cần dữ liệu thì đứng trên hàng sinh dữ liệu giả (du_lieu: gia), phạm vi chỉ biết sau mốc thì đưa vào chân trời mở lại khi mốc xong`]);
    if (r.du_lieu !== undefined && !DU_LIEU.includes(r.du_lieu)) ra.push(['du-lieu-sai-gia-tri', `du_lieu ${JSON.stringify(r.du_lieu)} — chỉ nhận "sinh-gia" (hàng sinh dữ liệu giả có nhãn) hoặc "gia" (hàng đo trên dữ liệu giả)`]);
    else if (r.du_lieu === DL_GIA && !coHangSinh(dt)) ra.push(['thieu-hang-sinh-gia', 'đo trên dữ liệu giả (du_lieu: gia) mà không đứng trực tiếp trên hàng sinh dữ liệu giả nào (du_lieu: sinh-gia)']);
    return ra;
  };
  // Gộp: hàng cùng đợt, cùng nhom (khác rỗng), cùng dưới mục tiêu, tổng không quá cho phép.
  const duoi = trongDot.filter(({ r }) => laTieuChi(r.tieu_chi) && r.tieu_chi < k.muc_tieu[0]);
  for (const { r, nhan } of trongDot) {
    for (const [co, cau] of [...coCuaHang(r, k), ...coS3b(r)]) {
      let them = '';
      if (co === 'duoi-muc-tieu' && chuoi(r.nhom)) {
        const ban = duoi.filter(x => x.r !== r && chuoi(x.r.nhom) === chuoi(r.nhom) && r.tieu_chi + x.r.tieu_chi <= k.cho_phep_den);
        if (ban.length) them = ` — gộp được với ${ban.map(x => `${x.nhan} (tổng ${r.tieu_chi + x.r.tieu_chi})`).join('; ')}`;
      }
      (CO_LOI.has(co) || CO_LOI_S3B.has(co) ? loi : canhBao).push(`hàng ${nhan} [${co}]: ${cau}${them}`);
    }
  }
  // Hàng ngoài đợt: mỗi cờ đúng MỘT dòng vàng — lộ trình cắt tay đời trước có hàng trăm hàng.
  const gom = new Map();
  for (const { r, nhan } of ngoai) for (const [co] of coCuaHang(r, k)) if (!CO_CHI_TRONG_DOT.has(co)) { if (!gom.has(co)) gom.set(co, []); gom.get(co).push(nhan); }
  for (const { r, nhan } of ngoai) for (const [co] of coS3b(r)) if (!CO_CHI_TRONG_DOT.has(co)) { if (!gom.has(co)) gom.set(co, []); gom.get(co).push(nhan); }
  for (const co of CO_TEN) { const ds = gom.get(co); if (ds) canhBao.push(`[${co}] ${ds.length} hàng ngoài đợt ${pv.dot} — ${ds.slice(0, 8).join(', ')}${ds.length > 8 ? ', …' : ''}`); }
  // Mốc vận hành LẶP LẠI của đợt đang cắt mà chưa trỏ hàng tự phục vụ hay chân trời: nhắc (vàng) — phanh
  // «không phổ quát quá sớm» là phán xét của chủ kho, không phải lỗi.
  const mocLap = moc.filter(m => chuoi(m.loai) === LOAI_NGOAI && chuoi(m.dot) === pv.dot && m.lap === true);
  for (const m of mocLap) if (m.tu_phuc_vu === undefined) canhBao.push(`mốc ${nhanMoc(m)} [${CO_LAP}]: việc vận hành lặp lại chưa trỏ hàng tự phục vụ hay chân trời (tu_phuc_vu) — xét tự phục vụ; chưa đáng thì ghi chân trời mở lại khi có tổ chức hay kho thứ hai thật`);
  return { loi, canhBao };
}

// ── Đồng hồ cỡ (chỉ đọc) ──────────────────────────────────────────────────────
// Hai mẫu số, cố ý khác nhau: phân bố cỡ trên mọi hồ sơ ĐÃ CHỐT phạm vi (cỡ biết lúc chốt, không cần
// chờ giao — dùng mẫu «đã giao» là đếm kiểu sống sót: vòng to nổ trần chậm giao nhất); lượt chấm trên
// hồ sơ ĐÃ GIAO có ≥ 1 tiêu đề lượt chấm (khuôn bên ghi: wf-usage.mjs --title "S4 round N").
const DA_GIAO = new Set([...DA_THONG_CONG_2, ...DA_DONG_THUC_TE]);
const LUOT_CHAM_RE = /^###\s+S4\s+round\b/gm;
const lamTron2 = x => Math.round(x * 100) / 100;
const phanTram = (a, b) => Math.round((100 * a) / b);
function thongKeLuot(ds, k) {
  const n = ds.length; if (!n) return { n: 0 };
  return { n, luot_tb: lamTron2(ds.reduce((s, x) => s + x.luot, 0) / n), cham_tran_pt: phanTram(ds.filter(x => x.luot >= k.tran_luot_cham).length, n) };
}
export function dongHoCo(root, { khoang: k, tu = null, loTrinh = null }) {
  const acc = path.join(root, '_acceptance');
  const bo = { chua_chot: 0, khong_doc_tieu_chi: 0, chua_giao: 0, khong_luot_cham: 0 }; if (tu) bo.khong_ngay_chot = 0;
  const chot = [];
  const ds = existsSync(acc) ? readdirSync(acc, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name).sort() : [];
  for (const slug of ds) {
    const c = doc(path.join(acc, slug, 'contract.md')); if (c == null) continue;
    const st = chuoi(frontmatterField(c, 'status'));
    if (!st || st === 'draft') { bo.chua_chot += 1; continue; }
    const tc = new Set(parseACBlock(c).map(a => a.id)).size;
    if (!tc) { bo.khong_doc_tieu_chi += 1; continue; }
    if (tu) {
      const d = ngayChot(c);
      if (!d) { bo.khong_ngay_chot += 1; continue; }
      if (d < tu) continue;
    }
    let luot = null;
    if (!DA_GIAO.has(st)) bo.chua_giao += 1;
    else { const u = doc(path.join(acc, slug, 'usage-report.md')); const n = u ? (u.match(LUOT_CHAM_RE) || []).length : 0; if (n) luot = n; else bo.khong_luot_cham += 1; }
    chot.push({ slug, tc, luot, giu: !!CHD.dongGiu(doc(path.join(acc, slug, 'decisions.jsonl')) || '') });
  }
  const [dau, cuoi] = k.muc_tieu;
  const trong = (x, a, b) => x.tc >= a && (b == null || x.tc <= b);
  const nhom = [['duoi-muc-tieu', 1, dau - 1], ['muc-tieu', dau, cuoi], ['cho-phep', cuoi + 1, k.cho_phep_den], ['phai-tach', k.tach_tu, null]].map(([ten, a, b]) => {
    const g = chot.filter(x => trong(x, a, b)); const giao = g.filter(x => x.luot != null);
    // n_giu: hồ sơ đã chốt của nhóm có dòng sổ «giữ cỡ» (vong-mo-thang-bang-feature-loop) — n_chot − n_giu ở
    // nhóm phai-tach là số hợp đồng quá cỡ qua Cổng Phạm vi không lý do giữ có tên.
    return { ten, tu: a, den: b, n_chot: g.length, n_giu: g.filter(x => x.giu).length, ...thongKeLuot(giao, k), it_du_lieu: giao.length < k.it_du_lieu_duoi };
  });
  let trongKhoang;
  if (!chot.length) trongKhoang = { n_chot: 0, chua_do_duoc: true };
  else {
    const g = chot.filter(x => trong(x, dau, k.cho_phep_den));
    trongKhoang = { n_chot: chot.length, n_trong: g.length, pt_tong: phanTram(g.length, chot.length), ...thongKeLuot(g.filter(x => x.luot != null), k), it_du_lieu: chot.length < k.it_du_lieu_duoi };
  }
  const ra = { khoang: k, tu, nhom, trong_khoang: trongKhoang, bo_qua: bo };
  if (loTrinh) {
    const theoSlug = new Map(chot.map(x => [x.slug, x]));
    const hang = (Array.isArray(loTrinh.hang) ? loTrinh.hang : []).filter(r => r && typeof r === 'object' && laTieuChi(r.tieu_chi) && theoSlug.has(chuoi(r.slug)))
      .map(r => ({ ma: chuoi(r.ma), slug: chuoi(r.slug), du_kien: r.tieu_chi, that: theoSlug.get(chuoi(r.slug)).tc }));
    ra.du_kien = { n: hang.length, vuot_cho_phep: hang.filter(h => h.that > k.cho_phep_den).length, hang };
  }
  return ra;
}

// ── Nhịp ──────────────────────────────────────────────────────────────────────
// Số ngày từ lúc chốt phạm vi (approved_at, làn V thì veto_opened_at) tới ngày ký Cổng Bằng chứng
// (bộ đọc chung `ngayChuKy` của ho-so-tom-tat.cjs trên human_signoff — năm-tháng-ngày đầu tiên, vắng thì
// ngày/tháng/năm).
const ngayDau = s => { const m = String(s ?? '').match(/\d{4}-\d{2}-\d{2}/); return m ? m[0] : null; };
const doc = p => { try { return readFileSync(p, 'utf8'); } catch { return null; } };
// Ngày chốt phạm vi — MỘT bộ đọc cho nhịp và đồng hồ cỡ.
const ngayChot = c => ngayDau(frontmatterField(c, 'approved_at')) || ngayDau(frontmatterField(c, 'veto_opened_at'));
export function nhip(root) {
  const acc = path.join(root, '_acceptance');
  const ngay = { T1: [], T2: [], T3: [] }; let tong = 0; let boQua = 0;
  const ds = existsSync(acc) ? readdirSync(acc, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name).sort() : [];
  for (const s of ds) {
    const c = doc(path.join(acc, s, 'contract.md')); const e = doc(path.join(acc, s, 'evidence-report.md'));
    if (c == null || e == null) continue;
    const ky = chuoi(frontmatterField(e, 'human_signoff'));
    if (!ky) continue;
    tong += 1;
    const hang = chuoi(frontmatterField(c, 'risk_tier'));
    const dau = ngayChot(c);
    const cuoi = ngayChuKy(ky);
    if (!dau || !cuoi || !(hang in ngay)) { boQua += 1; continue; }
    ngay[hang].push(Math.round((Date.parse(`${cuoi}T00:00:00Z`) - Date.parse(`${dau}T00:00:00Z`)) / 864e5));
  }
  const trungVi = a => { const b = [...a].sort((x, y) => x - y); const g = b.length >> 1; return b.length % 2 ? b[g] : (b[g - 1] + b[g]) / 2; };
  const hang = Object.fromEntries(Object.entries(ngay).map(([h, a]) => [h, a.length ? { n: a.length, trung_vi: trungVi(a) } : { n: 0 }]));
  return { hang, tong, bo_qua: boQua };
}

// ── CLI ───────────────────────────────────────────────────────────────────────
const isMain = (() => {
  if (!process.argv[1]) return false;
  try { return realpathSync(process.argv[1]) === realpathSync(__filename); } catch { return path.resolve(process.argv[1]) === __filename; }
})();
if (isMain) {
  const a = process.argv.slice(2);
  const thoat = (c, m) => { process.stderr.write(`cat-luot: ${m}\n`); process.exit(c); };
  let root = '.'; let tepPv = null; let tepLt = null; let coNhip = false; let coCo = false; let tu = null;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--nhip') { coNhip = true; continue; }
    if (a[i] === '--co') { coCo = true; continue; }
    if (['--root', '--pham-vi', '--lo-trinh', '--tu'].includes(a[i])) {
      const v = a[i + 1]; if (v == null || v === '' || v.startsWith('--')) thoat(2, `${a[i]} cần một giá trị ngay sau nó`);
      if (a[i] === '--root') root = v; else if (a[i] === '--pham-vi') tepPv = v; else if (a[i] === '--tu') tu = v; else tepLt = v; i++;
    } else thoat(2, `tham số lạ ${a[i]} — chỉ nhận --root <thư-mục> (--pham-vi <tệp> --lo-trinh <tệp> | --nhip | --co [--tu <ngày>] [--lo-trinh <tệp>])`);
  }
  root = path.resolve(root);
  let khoang; try { khoang = napKhoang(); } catch (e) { thoat(2, e.message); }
  if (coNhip) { process.stdout.write(JSON.stringify(nhip(root), null, 2) + '\n'); process.exit(0); }
  if (coCo) {
    if (tu != null && !(NGAY_RE.test(tu) && !Number.isNaN(Date.parse(`${tu}T00:00:00Z`)))) thoat(2, `--tu «${tu}» phải là ngày YYYY-MM-DD`);
    let loTrinh = null;
    if (tepLt) { try { loTrinh = JSON.parse(readFileSync(path.resolve(root, tepLt), 'utf8').replace(/^\uFEFF/, '')); } catch (e) { thoat(2, `không đọc được tệp lộ trình ${tepLt}: ${e.message}`); } }
    process.stdout.write(JSON.stringify(dongHoCo(root, { khoang, tu, loTrinh }), null, 2) + '\n'); process.exit(0);
  }
  if (tu != null) thoat(2, '--tu chỉ đi với --co');
  if (!tepPv || !tepLt) thoat(2, 'cần --pham-vi <tệp> và --lo-trinh <tệp> (hoặc --nhip, --co)');
  const trongGit = tep => {
    const p = path.resolve(root, tep); const rel = path.relative(root, p);
    if (!rel || rel.startsWith('..') || path.isAbsolute(rel) || !existsSync(p)) return false;
    try { execFileSync('git', ['-C', root, 'ls-files', '--error-unmatch', '--', rel], { stdio: 'ignore' }); return true; } catch { return false; }
  };
  if (!trongGit(tepPv)) thoat(2, `bản phạm vi phải là tệp có trong git: ${tepPv} (chưa add, hoặc nằm ngoài kho)`);
  if (!trongGit(tepLt)) thoat(2, `tệp lộ trình phải là tệp có trong git: ${tepLt} (chưa add, hoặc nằm ngoài kho)`);
  const pv = docPhamVi(readFileSync(path.resolve(root, tepPv), 'utf8'));
  if (!pv.ma.length) thoat(2, `bản phạm vi ${tepPv} không đọc ra mã nào — mỗi mã một dòng «- \`<mã>\` — <mô tả>»`);
  let data;
  try { data = JSON.parse(readFileSync(path.resolve(root, tepLt), 'utf8').replace(/^\uFEFF/, '')); } catch (e) { thoat(2, `tệp lộ trình không phải JSON hợp lệ: ${e.message}`); }
  if (data == null || typeof data !== 'object' || Array.isArray(data)) thoat(2, 'gốc tệp lộ trình phải là một object');
  const kq = kiemPhu(pv, data);
  const co = kiemCo(pv, data, khoang);
  const loi = [...pv.loi, ...kq.loi, ...co.loi];
  const ra = [`bảng phủ đợt ${pv.dot} (${pv.dang}): ${pv.ma.length} mã`, ...kq.bang.map(b => `  ${b.ma} → ${b.cho || '—'}`),
    ...[...kq.canhBao, ...co.canhBao].map(c => `cảnh báo: ${c}`), ...loi.map(l => `lỗi: ${l}`)];
  process.stdout.write(ra.join('\n') + '\n');
  process.exit(loi.length ? 1 : 0);
}
