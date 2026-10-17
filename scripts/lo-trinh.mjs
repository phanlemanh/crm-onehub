#!/usr/bin/env node
// lo-trinh.mjs — ổ cắm ĐỌC tệp ý định của kho (lộ trình) + suy trạng thái từ hồ sơ + vẽ trang.
// Hồ sơ: _acceptance/viec-ke-theo-plan/ · design: docs/superpowers/specs/2026-10-02-viec-ke-theo-plan-design.md
// Vòng sửa trên dữ liệu thật: _acceptance/lo-trinh-tren-du-lieu-that/ · design 2026-10-03-…-design.md —
// so lời khai theo NHÓM, nối hai chiều hàng ↔ hồ sơ (`lo_trinh_ma`), nhiều lộ trình mỗi kho, mở ô
// cơ hội từ hàng (`--mo-o`), dòng thẻ start dựng sẵn.
//
// Hai lớp, không gộp: Ý ĐỊNH do người ghi (tệp JSON trong kho, đổi bằng PR) và TRẠNG THÁI do máy
// suy từ `_acceptance/` bằng ĐÚNG hàm xếp ô của bản đồ sản phẩm (`classify` của product-map.mjs,
// nhận qua tham số — mô-đun này không import bản đồ, nên không có vòng import và kho chưa khai
// ổ cắm không bao giờ nạp nó). Kit KHÔNG BAO GIỜ ghi vào tệp ý định: mọi hàm ở đây chỉ đọc.
//
// Trang tất định: không ngày chạy, không «hôm nay» — `--check` so byte. Ngày chỉ vào `hangTre`,
// thứ chỉ thẻ start in; số ngày còn lại tới mốc do script nội tuyến của trang tính lúc xem.
import { readFileSync, readdirSync, existsSync, statSync, realpathSync, mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { frontmatterField } = require(path.join(__dirname, '..', 'lib', 'evidence-core.cjs'));

const { KHOA: KHOA_, khoaTuConfig: khoaTuConfig_, cacTepTuConfig } = require(path.join(__dirname, 'lo-trinh-khoa.cjs'));
// Mô-đun đọc hồ sơ dùng chung với trang hồ sơ (hồ sơ trang-ho-so-mot-viec, hàng X2): dải tóm tắt của
// khối dữ liệu bản 2 và phép bỏ một cặp «» quanh câu giao đều rút từ ĐÂY — trang hồ sơ gọi cùng hàm.
const HS = require(path.join(__dirname, 'ho-so-tom-tat.cjs'));
export const KHOA = KHOA_;
export const TEP_TRANG = 'LO-TRINH.html';
export const CHUA_MO = 'Chưa mở';
export const KHONG_SUY = 'Không suy được';
export const TIN_THEO_LOI = 'tin theo lời';
// Ô bản đồ nào là «đã giao» và «chưa làm» — tra bằng KHOÁ ô, chữ rút từ SECTIONS của bản đồ.
export const DA_GIAO_O = ['cho-nghiem-thu', 'da-ship', 'da-nghiem-thu'];
export const DANG_LAM_O = ['cho-duyet', 'dang-dung'];
export const CHUA_LAM_O = ['can-nhac', 'sap-mo'];
// Ô bản đồ của một hồ sơ «đang mở» — đang làm hoặc chưa bắt đầu (hồ sơ moc-la-chien-dich, hai cờ nấc 1 ADR 0025).
export const NHOM_MO = [...DANG_LAM_O, ...CHUA_LAM_O];
// Nhóm của một tên trạng thái: lời khai so với hồ sơ theo NHÓM, không theo từng chữ tên ô (crm OKR
// 03/10: 11/18 cờ là «khai Đã giao, hồ sơ Đã giao — chờ phiên nghiệm thu»). Ô ngoài ba nhóm là
// nhóm riêng của chính nó.
function nhomBang(sections) {
  const TEN = Object.fromEntries(sections);
  const m = new Map([[CHUA_MO, 'chua-lam']]);
  for (const [ds, nh] of [[DA_GIAO_O, 'da-giao'], [DANG_LAM_O, 'dang-lam'], [CHUA_LAM_O, 'chua-lam']]) for (const k of ds) m.set(TEN[k], nh);
  return t => m.get(t) || `rieng:${t}`;
}
const BAT_BUOC = ['ma', 'cau_giao'];
const SLUG_RE = /^[A-Za-z0-9][A-Za-z0-9_.-]*$/;

const doc = p => { try { return readFileSync(p, 'utf8'); } catch { return null; } };
const chuoi = v => (v == null ? '' : String(v).trim());
const so = s => chuoi(s).toLowerCase();

// ── Khoá ổ cắm ────────────────────────────────────────────────────────────────
// MỘT hàm cho mọi bên đọc (scripts/lo-trinh-khoa.cjs). Rỗng / null của YAML → vắng.
export const khoaTuConfig = khoaTuConfig_;
export function docKhoa(root) {
  return khoaTuConfig(doc(path.join(root, '_acceptance', 'config.yaml')));
}
// Mọi tệp khai, theo thứ tự khai, kèm cờ tệp lặp — hoặc null khi ổ cắm vắng.
export function docCacTep(root) {
  return cacTepTuConfig(doc(path.join(root, '_acceptance', 'config.yaml')));
}

// ── Chiều hồ sơ → hàng ──────────────────────────────────────────────────────
// Ô cơ hội ghi `lo_trinh_ma` (và `lo_trinh_tep` khi mở từ hàng) là hồ sơ NHẬN hàng đó. Đọc một lần
// mỗi lần phân tích kho; hồ sơ không ghi trường thì không có mặt — kho cũ không phải sửa gì.
export function docNhan(root) {
  const acc = path.join(root, '_acceptance');
  if (!existsSync(acc)) return [];
  const ra = [];
  for (const e of readdirSync(acc, { withFileTypes: true }).filter(x => x.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    const o = doc(path.join(acc, e.name, 'opportunity.md'));
    if (o == null) continue;
    const ma = chuoi(frontmatterField(o, 'lo_trinh_ma')).replace(/^["']|["']$/g, '');
    if (!ma) continue;
    const tep = chuoi(frontmatterField(o, 'lo_trinh_tep')).replace(/^["']|["']$/g, '');
    ra.push({ slug: e.name, ma, tep: tep || null });
  }
  return ra;
}

// ── Đọc tệp ───────────────────────────────────────────────────────────────────
// Mọi lỗi của TỆP KHO là một câu có tên, không bao giờ là stack trace: tệp hỏng của kho không
// được làm CI của kho đỏ, nhưng cũng không được im — trang và thẻ in đúng câu này.
export function docTep(root, tep) {
  const goc = path.resolve(root);
  const dich = path.resolve(goc, tep);
  const rel = path.relative(goc, dich);
  if (path.isAbsolute(tep) || rel.startsWith('..') || path.isAbsolute(rel))
    return { loi: `tệp ý định phải nằm trong kho: ${tep}`, data: null };
  if (!existsSync(dich) || !statSync(dich).isFile())
    return { loi: `tệp ý định không tồn tại: ${tep}`, data: null };
  let txt;
  try { txt = readFileSync(dich, 'utf8'); } catch (e) { return { loi: `tệp ý định không đọc được: ${tep} (${e.code || e.message})`, data: null }; }
  if (txt.charCodeAt(0) === 0xfeff) txt = txt.slice(1);
  let data;
  try { data = JSON.parse(txt); } catch (e) { return { loi: `tệp ý định không phải JSON hợp lệ: ${e.message}`, data: null }; }
  if (data == null || typeof data !== 'object' || Array.isArray(data))
    return { loi: 'gốc tệp ý định phải là một object', data: null };
  return { loi: null, data };
}

// ── Kiểm khuôn ────────────────────────────────────────────────────────────────
// Bắt buộc: ma · cau_giao. Mọi trường khác tuỳ chọn hoặc tự do — giữ nguyên, không cờ.
export function kiemKhuon(data) {
  const co = [];
  const hangVao = Array.isArray(data.hang) ? data.hang : [];
  if (data.hang !== undefined && !Array.isArray(data.hang)) co.push('khối hang phải là một mảng');
  const hang = [];
  const daThay = new Set(); const trung = [];
  hangVao.forEach((r, i) => {
    if (r == null || typeof r !== 'object' || Array.isArray(r)) { co.push(`hàng #${i + 1} không phải object`); return; }
    const ma = chuoi(r.ma);
    const nhan = ma || `#${i + 1}`;
    for (const f of BAT_BUOC) if (!chuoi(r[f])) co.push(`hàng ${nhan} thiếu ${f}`);
    // Trường kit đọc lấy NGHĨA mà sai kiểu thì nói ra — coi như rỗng là để hàng còn chờ hiện thành hàng kế.
    if (r.dung_tren !== undefined && !Array.isArray(r.dung_tren)) co.push(`hàng ${nhan}: dung_tren phải là một mảng`);
    // `phu` (mã của bản phạm vi hàng gánh — skill cắt lượt ghi, răng cat-luot.mjs đọc).
    if (r.phu !== undefined && !Array.isArray(r.phu)) co.push(`hàng ${nhan}: phu phải là một mảng`);
    if (ma) { if (daThay.has(ma) && !trung.includes(ma)) trung.push(ma); daThay.add(ma); }
    // Câu giao là TIÊU ĐỀ: bỏ đúng một cặp «» bao trọn câu (hàng X2) — mọi chỗ in nó (trang, khối, thẻ
    // start, ô cơ hội của --mo-o) đi qua đây. Tệp kế hoạch của kho không bị ghi; vi_sao/bat_khi giữ nguyên.
    hang.push({ ...r, ...(typeof r.cau_giao === 'string' ? { cau_giao: HS.boNgoacNgoai(r.cau_giao), _cauGiaoGoc: r.cau_giao } : {}), _nhan: nhan, _ma: ma });
  });
  for (const m of trung) co.push(`mã trùng: ${m}`);
  const moc = (Array.isArray(data.moc) ? data.moc : []).filter(m => m && typeof m === 'object');
  for (const m of moc) if (m.hang !== undefined && !Array.isArray(m.hang)) co.push(`mốc ${chuoi(m.ten) || chuoi(m.ngay) || '?'}: hang phải là một mảng`);
  const daBac = (Array.isArray(data.da_bac) ? data.da_bac : []).filter(m => m && typeof m === 'object');
  // Chờ điều kiện — khoá `chan_troi` (luật 6 của cắt lượt): mã chưa cắt được thành câu giao, kèm lý do. Kit chỉ kiểm dạng.
  if (data.chan_troi !== undefined && !Array.isArray(data.chan_troi)) co.push('khối chan_troi phải là một mảng');
  else (data.chan_troi || []).forEach((c, i) => { if (c == null || typeof c !== 'object' || Array.isArray(c)) co.push(`chan_troi #${i + 1} không phải object`); });
  // Từ vựng tự khai của KHO: chữ riêng của kho → tên trạng thái của kit. Kho khai, kit chỉ đọc.
  const tuVung = {};
  if (data.tu_vung !== undefined) {
    if (data.tu_vung == null || typeof data.tu_vung !== 'object' || Array.isArray(data.tu_vung)) co.push('khối tu_vung phải là một object');
    else for (const [k, v] of Object.entries(data.tu_vung)) tuVung[so(k)] = chuoi(v);
  }
  // Chính sách rà soát (hồ sơ ra-soat-lo-trinh): khai ở đầu tệp, chủ kho viết. Sai kiểu → một cờ khuôn và KHÔNG luật
  // chính sách nào chạy (không đoán).
  let chinhSach = null;
  if (data.chinh_sach !== undefined) {
    const cs = data.chinh_sach;
    if (cs == null || typeof cs !== 'object' || Array.isArray(cs)) co.push('khối chinh_sach phải là một object');
    else {
      const t = cs.tuoi_ngay; const n = cs.tran_ke_tiep; let sai = false;
      if (t !== undefined && !(Number.isInteger(t) && t > 0)) { co.push('chinh_sach.tuoi_ngay phải là số nguyên dương'); sai = true; }
      if (n !== undefined && !(Number.isInteger(n) && n >= 0)) { co.push('chinh_sach.tran_ke_tiep phải là số nguyên không âm'); sai = true; }
      if (!sai) chinhSach = { tuoi_ngay: t ?? null, tran_ke_tiep: n ?? null };
    }
  }
  return { ten: chuoi(data.ten), hang, moc, daBac, tuVung, co, chinhSach };
}

// ── Suy trạng thái ────────────────────────────────────────────────────────────
// `classify(dir, slug) → { key }` và `sections: [[key, title]…]` của bản đồ, nhận qua tham số.
export function suyTrangThai({ root, khuon, classify, sections, nhan = [] }) {
  const TEN = Object.fromEntries(sections);
  const tuVung = new Map([...sections.map(([, t]) => t), CHUA_MO].map(t => [so(t), t]));
  const daGiao = new Set(DA_GIAO_O.map(k => TEN[k]));
  const chuaLam = new Set([CHUA_MO, ...CHUA_LAM_O.map(k => TEN[k])]);
  const nhomCua = nhomBang(sections);
  const acc = path.join(root, '_acceptance');
  const cache = new Map();
  const xep = slug => {
    if (!cache.has(slug)) cache.set(slug, classify(path.join(acc, slug), slug));
    return cache.get(slug);
  };
  const coThuMuc = s => existsSync(path.join(acc, s)) && statSync(path.join(acc, s)).isDirectory();
  // `nhan` đã lọc về lộ trình này (bên gọi): mã → các hồ sơ nhận · hồ sơ → mã nó ghi.
  const nhanTheoMa = new Map(); const maCuaHoSo = new Map();
  for (const n of nhan) {
    if (!nhanTheoMa.has(n.ma)) nhanTheoMa.set(n.ma, []);
    nhanTheoMa.get(n.ma).push(n.slug);
    maCuaHoSo.set(n.slug, n.ma);
  }
  const co = [...khuon.co];
  const tuVungKho = khuon.tuVung || {};
  for (const [k, v] of Object.entries(tuVungKho)) if (!tuVung.has(so(v))) co.push(`tu_vung: «${k}» trỏ «${v}» — không phải tên trạng thái`);
  let tuKhaiNgoai = 0;
  const nguoiNhanCua = r => { const n = r._ma ? (nhanTheoMa.get(r._ma) || []) : []; return n.length > 1 ? n : []; };
  const dong = khuon.hang.map(r => {
    const coHang = [];
    const slug = chuoi(r.slug);
    const tuKhai = chuoi(r.trang_thai);
    const quyDoi = tuKhai && tuVungKho[so(tuKhai)] !== undefined ? tuVungKho[so(tuKhai)] : tuKhai;
    const khaiChuan = quyDoi ? tuVung.get(so(quyDoi)) : undefined;
    if (tuKhai && !khaiChuan) tuKhaiNgoai += 1;
    let chu; let tinTheoLoi = false; let coHoSo = false; let hoSo = null;
    if (slug && !SLUG_RE.test(slug)) {
      coHang.push(`hàng ${r._nhan}: slug không hợp lệ: ${slug}`);
      chu = CHUA_MO;
    } else {
      // Thứ tự ưu tiên (design §2): thư mục của slug → đúng MỘT hồ sơ nhận qua mã → lời khai.
      const coS = !!slug && coThuMuc(slug);
      const nguoiNhan = r._ma ? (nhanTheoMa.get(r._ma) || []) : [];
      const motNhan = nguoiNhan.length === 1 ? nguoiNhan[0] : null;
      if (nguoiNhan.length > 1) coHang.push(`hàng ${r._nhan} được nhiều hồ sơ nhận: ${nguoiNhan.join(', ')}`);
      if (motNhan && slug && motNhan !== slug) coHang.push(`hàng ${r._nhan} trỏ hồ sơ ${slug} nhưng hồ sơ ${motNhan} nhận hàng này`);
      if (coS && maCuaHoSo.has(slug) && maCuaHoSo.get(slug) !== r._ma) coHang.push(`hàng ${r._nhan} trỏ hồ sơ ${slug} nhưng hồ sơ ghi hàng ${maCuaHoSo.get(slug)}`);
      hoSo = coS ? slug : motNhan;
      if (hoSo) {
        coHoSo = true;
        chu = TEN[xep(hoSo).key];
      } else if (nguoiNhan.length > 1) {
        // Nhiều hồ sơ cùng nhận mà slug không chỉ ra hồ sơ nào: kit không chọn hộ, hàng không là
        // hàng kế, và lệnh mở không đẻ thêm hồ sơ (Cổng Bằng chứng lượt 1, Ngoài-6).
        chu = KHONG_SUY; // nhiều-người-nhận
      } else if (slug) {
        chu = CHUA_MO;
        // Slug khai mà không có hồ sơ, lời khai nói đã giao hoặc đang làm: kit không chứng được, và
        // «Chưa mở» biến nó thành hàng kế — đúng lỗi hàng «1» của crm OKR (03/10).
        if (khaiChuan && ['da-giao', 'dang-lam'].includes(nhomCua(khaiChuan))) {
          chu = KHONG_SUY;
          coHang.push(`hàng ${r._nhan}: tự khai ${tuKhai} mà không có hồ sơ ${slug}`);
        }
      } else {
        tinTheoLoi = true;
        // Tự khai không quy đổi được thì KHÔNG đoán: «Chưa mở» sẽ biến một hàng đã xong thành hàng
        // kế (đo trên crm OKR 02/10, hàng «0» khai «xong»).
        chu = khaiChuan || (tuKhai ? KHONG_SUY : CHUA_MO);
      }
    }
    // So theo NHÓM, chỉ khi có hồ sơ: slug dự kiến chưa có thư mục thì không có gì để «khác».
    if (coHoSo && khaiChuan && nhomCua(khaiChuan) !== nhomCua(chu))
      coHang.push(`hàng ${r._nhan}: tệp khai khác hồ sơ: khai ${tuKhai}${quyDoi !== tuKhai ? ` (${khaiChuan})` : ''}, hồ sơ ${chu}`);
    if (coHoSo && chuoi(r.hang)) {
      const c = doc(path.join(acc, hoSo, 'contract.md'));
      const t = c == null ? '' : chuoi(frontmatterField(c, 'risk_tier'));
      if (t && t !== chuoi(r.hang)) coHang.push(`hàng ${r._nhan}: hạng tệp ${chuoi(r.hang)}, hồ sơ ${t}`);
    }
    // Dải tóm tắt của hồ sơ (khối bản 2) — trạng thái truyền vào là CHỮ của hàng, nên dải và hàng không
    // nói hai chuyện. Hàng chưa có hồ sơ: null.
    const tomTat = coHoSo && hoSo ? HS.tomTatHoSo(path.join(acc, hoSo), { trangThai: chu }).dai : null;
    return { ...r, slug: slug || undefined, hoSo, nhieuNhan: hoSo ? [] : nguoiNhanCua(r), chu, tinTheoLoi, coHoSo, tuKhai: tuKhai || null, khaiNgoai: !!(tuKhai && !khaiChuan), coHang, tomTat };
  });
  const theoMa = new Map();
  for (const d of dong) if (d._ma && !theoMa.has(d._ma)) theoMa.set(d._ma, d);
  for (const d of dong) {
    for (const x of (Array.isArray(d.dung_tren) ? d.dung_tren : []).map(chuoi)) {
      if (!theoMa.has(x)) d.coHang.push(`hàng ${d._nhan}: đứng trên mã không có: ${x}`);
    }
  }
  // Vòng trong dung_tren: không treo, nêu một lần mỗi vòng.
  const trangThaiDfs = new Map(); const vongDaNeu = new Set();
  const dfs = (ma, duong) => {
    trangThaiDfs.set(ma, 1);
    const d = theoMa.get(ma);
    for (const x of (Array.isArray(d?.dung_tren) ? d.dung_tren : []).map(chuoi)) {
      if (!theoMa.has(x)) continue;
      if (trangThaiDfs.get(x) === 1) {
        const i = duong.indexOf(x); const vong = [...duong.slice(i), x];
        const khoaVong = [...vong.slice(0, -1)].sort().join('|');
        if (!vongDaNeu.has(khoaVong)) { vongDaNeu.add(khoaVong); co.push(`đứng trên tạo vòng: ${vong.join(' → ')}`); }
      } else if (!trangThaiDfs.get(x)) dfs(x, [...duong, x]);
    }
    trangThaiDfs.set(ma, 2);
  };
  for (const ma of theoMa.keys()) if (!trangThaiDfs.get(ma)) dfs(ma, [ma]);
  for (const d of dong) co.push(...d.coHang);

  const daGiaoMa = ma => { const d = theoMa.get(ma); return !!d && daGiao.has(d.chu); };
  const duDieuKien = d => {
    if (d.dung_tren !== undefined && !Array.isArray(d.dung_tren)) return false;
    return (Array.isArray(d.dung_tren) ? d.dung_tren : []).map(chuoi).every(x => theoMa.has(x) && daGiaoMa(x));
  };
  const ke = dong.find(d => chuaLam.has(d.chu) && duDieuKien(d)) || null;
  // Mã trùng trong tệp: hàng kế vẫn hiện, nhưng không ai mở nó bằng mã được (Ngoài-7).
  const keMaDon = !!ke && !!ke._ma && dong.filter(d => d._ma === ke._ma).length === 1;
  const hangKe = ke ? { ma: ke._nhan, cauGiao: chuoi(ke.cau_giao) || '(hàng chưa có câu giao)', dungTren: (Array.isArray(ke.dung_tren) ? ke.dung_tren : []).map(chuoi).map(x => ({ ma: x, chu: theoMa.get(x)?.chu || null })) } : null;

  // Vòng ngoài lộ trình: hồ sơ không hàng nào trỏ — đếm, không cờ.
  const troi = new Set(dong.flatMap(d => [d.slug, d.hoSo]).filter(Boolean));
  const ngoaiLoTrinh = existsSync(acc)
    ? readdirSync(acc, { withFileTypes: true }).filter(e => e.isDirectory() && !troi.has(e.name)).map(e => e.name).sort()
    : [];
  // Hàng sống qua Cổng Đáng: mỗi slug một lần; n = hồ sơ có opportunity đã decided.
  let n = 0; let k = 0;
  for (const s of [...troi].sort()) {
    const o = doc(path.join(acc, s, 'opportunity.md'));
    if (o == null) continue;
    if (so(frontmatterField(o, 'stage')) !== 'decided') continue;
    n += 1;
    if (['build', 'iterate'].includes(so(frontmatterField(o, 'decision')))) k += 1;
  }
  const demTheoO = {};
  for (const d of dong) demTheoO[d.chu] = (demTheoO[d.chu] || 0) + 1;
  return {
    ten: khuon.ten, dong, co, hangKe, hangKeMaDon: keMaDon, ngoaiLoTrinh, songQuaCongDang: { k, n }, tuKhaiNgoai,
    tinTheoLoi: { n: dong.filter(d => d.tinTheoLoi).length, tong: dong.length },
    moc: khuon.moc, daBac: khuon.daBac, demTheoO, daGiao,
    // Chính sách rà soát (hồ sơ ra-soat-lo-trinh): khoá CHỈ có khi kho khai đúng — kho không khai giữ lớp phân tích từng byte.
    ...(khuon.chinhSach ? { chinhSach: khuon.chinhSach } : {}),
  };
}

// Hàng trễ: mốc có ngày < hôm nay, hàng gắn mốc chưa giao. CHỈ thẻ start dùng (trang tất định).
export function hangTre(kq, today) {
  const ra = []; const daCo = new Set();
  const theoMa = new Map(kq.dong.filter(d => d._ma).map(d => [d._ma, d]));
  for (const m of kq.moc) {
    const ngay = chuoi(m.ngay);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(ngay) || !(ngay < today)) continue;
    for (const ma of (Array.isArray(m.hang) ? m.hang : []).map(chuoi)) {
      const d = theoMa.get(ma);
      if (!d || kq.daGiao.has(d.chu) || daCo.has(ma)) continue;
      daCo.add(ma); ra.push({ ma, moc: chuoi(m.ten), ngay });
    }
  }
  return ra;
}

// Mốc không gắn hàng nào: kit không tự gắn thay kho (khảo sát mục 6), chỉ đếm để «Hàng trễ: không
// có» khỏi bị đọc thành «không trễ».
export function mocKhongHang(kq) {
  const n = kq.moc.length;
  const k = kq.moc.filter(m => !Array.isArray(m.hang) || !m.hang.map(chuoi).filter(Boolean).length).length;
  return { k, n };
}

// ── Trang ─────────────────────────────────────────────────────────────────────
// Hồ sơ trang-lo-trinh-doc-mot-phut (design 2026-10-03-trang-lo-trinh-doc-mot-phut-design.md): màn
// đầu là một thẻ mỗi lộ trình (làm tiếp · cần sửa · mốc kế tiếp · tiến độ), rồi mỗi lộ trình một mục
// (chỗ lệch → việc còn mở → việc đã giao gập → dải mốc → đã bác), cuối trang MỘT khối hồ sơ không
// thuộc kế hoạch nào. Chữ trên trang là tiếng sản phẩm: câu cờ của lớp phân tích giữ nguyên (thẻ
// start và test đọc nó), lớp vẽ dịch bằng CO_DICH. Trang tất định: đoạn script nội tuyến duy nhất
// tính «còn N ngày» lúc xem; tắt script trang vẫn đủ.
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Bảng dịch câu cờ → tiếng sản phẩm. MỘT dòng cho mỗi chỗ phát cờ trong mã (lớp phân tích +
// lo-trinh-khoa.cjs); ca LT-97 đếm hai bên. `ma` là mã hàng để nối liên kết, `chu` là câu không mã.
// Câu không khớp dòng nào thì in nguyên văn — không mất thông tin.
export const CO_DICH = [
  { ten: 'thieu-truong', re: /^hàng (.+?) thiếu (cau_giao|ma)$/, ra: m => ({ ma: m[1], chu: m[2] === 'ma' ? 'chưa có mã' : 'chưa có câu mô tả việc giao' }) },
  { ten: 'dung-tren-mang', re: /^hàng (.+?): dung_tren phải là một mảng$/, ra: m => ({ ma: m[1], chu: 'ô «cần xong trước» phải là danh sách' }) },
  { ten: 'phu-mang', re: /^hàng (.+?): phu phải là một mảng$/, ra: m => ({ ma: m[1], chu: 'ô «mã đã phủ» phải là danh sách' }) },
  { ten: 'khoi-chan-troi', re: /^khối chan_troi phải là một mảng$/, ra: () => ({ ma: null, chu: 'danh sách chờ điều kiện phải là một mảng' }) },
  { ten: 'chan-troi-object', re: /^chan_troi #(\d+) không phải object$/, ra: m => ({ ma: null, chu: `mục chờ điều kiện thứ ${m[1]} không đúng dạng` }) },
  { ten: 'khong-object', re: /^hàng #(\d+) không phải object$/, ra: m => ({ ma: null, chu: `việc thứ ${m[1]} không đúng dạng` }) },
  { ten: 'khoi-hang', re: /^khối hang phải là một mảng$/, ra: () => ({ ma: null, chu: 'danh sách việc phải là một mảng' }) },
  { ten: 'ma-trung', re: /^mã trùng: (.+)$/, ra: m => ({ ma: null, chu: `hai việc cùng mã ${m[1]} — đổi mã một trong hai` }) },
  { ten: 'moc-mang', re: /^mốc (.+?): hang phải là một mảng$/, ra: m => ({ ma: null, chu: `mốc ${m[1]} — danh sách việc gắn mốc phải là một mảng` }) },
  { ten: 'khoi-tu-vung', re: /^khối tu_vung phải là một object$/, ra: () => ({ ma: null, chu: 'bảng từ trạng thái phải là một object' }) },
  { ten: 'tu-vung-tro', re: /^tu_vung: «(.+?)» trỏ «(.+?)» — không phải tên trạng thái$/, ra: m => ({ ma: null, chu: `từ «${m[1]}» trỏ «${m[2]}» — không phải tên trạng thái` }) },
  { ten: 'slug-sai', re: /^hàng (.+?): slug không hợp lệ: (.+)$/, ra: m => ({ ma: m[1], chu: `tên hồ sơ «${m[2]}» không hợp lệ` }) },
  { ten: 'nhieu-nhan', re: /^hàng (.+?) được nhiều hồ sơ nhận: (.+)$/, ra: m => ({ ma: m[1], chu: `nhiều hồ sơ cùng nhận việc này: ${m[2]}` }) },
  { ten: 'nhan-khac', re: /^hàng (.+?) trỏ hồ sơ (.+?) nhưng hồ sơ (.+?) nhận hàng này$/, ra: m => ({ ma: m[1], chu: `kế hoạch ghi hồ sơ ${m[2]} nhưng hồ sơ ${m[3]} nhận việc này` }) },
  { ten: 'ghi-hang-khac', re: /^hàng (.+?) trỏ hồ sơ (.+?) nhưng hồ sơ ghi hàng (.+)$/, ra: m => ({ ma: m[1], chu: `kế hoạch ghi hồ sơ ${m[2]} nhưng hồ sơ đó ghi việc ${m[3]}` }) },
  { ten: 'tu-khai-khong-ho-so', re: /^hàng (.+?): tự khai (.+?) mà không có hồ sơ (.+)$/, ra: m => ({ ma: m[1], chu: `kế hoạch ghi «${m[2]}» nhưng chưa có hồ sơ ${m[3]}` }) },
  { ten: 'khai-khac', re: /^hàng (.+?): tệp khai khác hồ sơ: khai (.+?)(?: \(([^()]*)\))?, hồ sơ (.+)$/, ra: m => ({ ma: m[1], chu: `kế hoạch ghi «${m[2]}», thực tế «${m[4]}»` }) },
  { ten: 'hang-khac', re: /^hàng (.+?): hạng tệp (.+?), hồ sơ (.+)$/, ra: m => ({ ma: m[1], chu: `kế hoạch ghi hạng ${m[2]}, thực tế hạng ${m[3]}` }) },
  { ten: 'dung-tren-khong-co', re: /^hàng (.+?): đứng trên mã không có: (.+)$/, ra: m => ({ ma: m[1], chu: `cần xong trước ${m[2]} nhưng kế hoạch không có việc ${m[2]}` }) },
  { ten: 'vong', re: /^đứng trên tạo vòng: (.+)$/, ra: m => ({ ma: null, chu: `thứ tự «cần xong trước» tạo vòng: ${m[1]}` }) },
  { ten: 'ho-so-tep', re: /^hồ sơ (.+?) ghi lo_trinh_tep (.+?) — kho không khai tệp đó$/, ra: m => ({ ma: null, chu: `hồ sơ ${m[1]} ghi kế hoạch ${m[2]} — kho không khai kế hoạch đó` }) },
  { ten: 'ho-so-ma', re: /^hồ sơ (.+?) ghi lo_trinh_ma (.+?) — không có hàng (.+)$/, ra: m => ({ ma: null, chu: `hồ sơ ${m[1]} ghi việc ${m[2]} — kế hoạch không có việc ${m[3]}` }) },
  { ten: 'khai-hai-lan', re: /^tệp lộ trình khai hai lần: (.+)$/, ra: m => ({ ma: null, chu: `kế hoạch ${m[1]} được khai hai lần trong cấu hình` }) },
  { ten: 'ngoai-moc', re: /^hàng (.+?): đang mở vòng mà chưa thuộc mốc nào$/, ra: m => ({ ma: m[1], chu: 'đang làm mà chưa thuộc mốc nào — gắn việc này vào một mốc của kế hoạch' }) },
  { ten: 'chinh-sach-object', re: /^khối chinh_sach phải là một object$/, ra: () => ({ ma: null, chu: 'chính sách rà soát phải là một object' }) },
  { ten: 'chinh-sach-tuoi', re: /^chinh_sach\.tuoi_ngay phải là số nguyên dương$/, ra: () => ({ ma: null, chu: 'chính sách tuoi_ngay phải là số nguyên dương' }) },
  { ten: 'chinh-sach-tran', re: /^chinh_sach\.tran_ke_tiep phải là số nguyên không âm$/, ra: () => ({ ma: null, chu: 'chính sách tran_ke_tiep phải là số nguyên không âm' }) },
  { ten: 'ho-so-ngoai-ke-hoach', re: /^hồ sơ (.+?) đang mở mà không thuộc việc nào trong kế hoạch$/, ra: m => ({ ma: null, chu: `hồ sơ ${m[1]} đang mở mà không thuộc việc nào trong kế hoạch — thêm việc cho nó, hoặc ghi mã việc vào hồ sơ` }) },
];
export function dichCo(c) {
  for (const d of CO_DICH) { const m = String(c).match(d.re); if (m) return { ten: d.ten, ...d.ra(m) }; }
  return { ten: null, ma: null, chu: String(c) };
}
export const dichLoi = loi => String(loi).replace(/tệp ý định/g, 'tệp kế hoạch');
// Tham số lệnh mở hàng kế — MỘT nguồn cho thẻ start và trang: `<tệp>:<mã>` khi kho khai nhiều tệp,
// null khi mã trùng trong tệp (không ai mở được bằng mã).
export const thamSoKe = (kq, tep, nhieu) => (kq.hangKe && kq.hangKeMaDon ? (nhieu ? `${tep}:${kq.hangKe.ma}` : kq.hangKe.ma) : null);

const CSS = `:root{--bg:#fbfaf7;--sf:#ffffff;--fg:#1d1d1b;--mu:#5f5c56;--ln:#e3e0d8;--ac:#245a8a;--acbg:#eaf1f8;--wa:#7a4f00;--wabg:#fff4dc;--ok:#256033;--okbg:#e8f3ea;--bar:#d9d5cb}
@media (prefers-color-scheme:dark){:root{--bg:#171715;--sf:#1f1f1c;--fg:#ecebe6;--mu:#a7a49c;--ln:#34332f;--ac:#9cc2e6;--acbg:#1d2a36;--wa:#f0c36a;--wabg:#33290f;--ok:#8fcf9a;--okbg:#1b2a1e;--bar:#3a3934}}
*{box-sizing:border-box}html{scroll-padding-top:16px}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:1180px;margin:0 auto;padding:24px 16px 64px}
h1{font-size:26px;line-height:1.2;margin:0 0 6px}h2{font-size:18px;line-height:1.3;margin:32px 0 10px}h3{font-size:16px;margin:24px 0 8px}
a{color:var(--ac)}a:visited{color:var(--ac)}code{font-size:13px}
.mu{color:var(--mu)}.nho{font-size:13px}
.the-dau{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;margin:16px 0 8px}
.the{background:var(--sf);border:1px solid var(--ln);border-radius:10px;padding:16px}
.the h2{margin:0 0 12px}.the h2 a{text-decoration:none;color:var(--fg)}
.o{margin:0 0 12px}.o:last-child{margin:0}.nhan{display:block;font-size:13px;color:var(--mu);margin-bottom:2px}
.ke{font-weight:600}.lenh{display:inline-block;margin-top:6px;padding:6px 8px;background:var(--acbg);border-radius:6px;user-select:all;-webkit-user-select:all;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;word-break:break-all}
.thanh{height:8px;background:var(--bar);border-radius:4px;overflow:hidden;display:flex;margin-top:6px}.thanh i{display:block;height:100%}.thanh .g{background:var(--ok)}.thanh .l{background:var(--ac)}
.so-co a{display:inline-flex;align-items:center;min-height:44px;font-weight:600;color:var(--wa)}.so-co .khong{color:var(--ok);font-weight:600}
.co-ds{list-style:none;padding:0;margin:0}.co-ds li{background:var(--wabg);color:var(--wa);border-radius:8px;margin:6px 0}.co-ds li>*{display:block;min-height:44px;padding:11px 12px}.co-ds a{color:inherit;text-decoration:none}.co-ds a:hover{text-decoration:underline}
.loi{background:var(--wabg);color:var(--wa);border-radius:8px;padding:8px 12px}
.bang{border:1px solid var(--ln);border-radius:10px}
table{width:100%;border-collapse:collapse;font-size:14px;line-height:1.4}th,td{text-align:left;vertical-align:top;padding:5px 8px;border-bottom:1px solid var(--ln)}
thead th{position:sticky;top:0;background:var(--sf);font-weight:600;color:var(--mu);font-size:13px;z-index:1}
tbody tr:target{outline:2px solid var(--ac);outline-offset:-2px}
@media (min-width:641px){td[data-nhan="Việc giao"]{width:40%}}
.tt{display:inline-block;font-weight:600;border-radius:999px;padding:1px 8px;font-size:13px;background:var(--acbg);color:var(--ac)}.tt.giao{background:var(--okbg);color:var(--ok)}.tt.chua{background:transparent;color:var(--mu);border:1px solid var(--ln)}
.co-o{display:block;margin-top:4px;font-size:13px;color:var(--wa)}
details{margin:8px 0}summary{cursor:pointer;min-height:44px;display:flex;align-items:center;font-weight:600;color:var(--ac)}
.moc{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(min(400px,100%),1fr));column-gap:24px}.moc li{position:relative;padding:4px 0 4px 16px;border-left:2px solid var(--ln)}.moc li::before{content:"";position:absolute;left:-6px;top:11px;width:10px;height:10px;border-radius:50%;background:var(--bar)}
.moc li.qua{color:var(--mu)}.moc li.tre{color:var(--wa)}.moc li.tre::before{background:var(--wa)}.moc li.ke-tiep::before{background:var(--ac)}.moc .ngay{font-variant-numeric:tabular-nums;font-weight:600;margin-right:6px}.moc .con{font-size:13px;color:var(--ac);margin-left:6px}.moc li.qua .con,.moc li.tre .con{color:inherit}.moc .trong{font-size:13px;color:var(--wa);margin-left:6px}
@media (max-width:640px){main{padding:16px 12px 48px}.the-dau{gap:10px;margin:10px 0}.the{padding:12px}.the h2{margin:0 0 8px}.o{margin:0 0 6px}.the .nhan{display:inline;margin:0 4px 0 0}.the .nhan::after{content:':'}.lenh{margin-top:4px;padding:4px 6px}.thanh{display:none}.bang{border:0}table,thead,tbody,tr,td{display:block}thead{display:none}
tr{border:1px solid var(--ln);border-radius:10px;margin:10px 0;padding:6px 0;background:var(--sf)}td{border:0;padding:4px 12px}td[data-nhan]::before{content:attr(data-nhan);display:block;font-size:13px;color:var(--mu)}td:empty{display:none}}`;

// Script nội tuyến DUY NHẤT: tính «còn N ngày / hôm nay / đã qua» theo ngày của người xem, đánh dấu
// mốc kế tiếp và điền ô «Mốc kế tiếp» của thẻ. Không tải gì, không ghi gì.
const SCRIPT = `(function(){var d=new Date();var h=Date.UTC(d.getFullYear(),d.getMonth(),d.getDate());
document.querySelectorAll('ol.moc').forEach(function(ol){var ke=null;var tre=[];var hong=0;ol.querySelectorAll('li[data-ngay]').forEach(function(li){var p=li.getAttribute('data-ngay').split('-');var t=Date.UTC(+p[0],+p[1]-1,+p[2]);var n=Math.round((t-h)/864e5);var s=li.querySelector('.con');if(p.length!==3||isNaN(n)){hong++;return;}if(n<0){if(li.hasAttribute('data-con-viec')){tre.push(li.getAttribute('data-ten'));li.classList.add('tre');if(s)s.textContent='đã qua — còn việc chưa giao';}else{li.classList.add('qua');if(s)s.textContent='đã qua';}}else{if(s)s.textContent=n===0?'hôm nay':'còn '+n+' ngày';if(!ke){ke=li;li.classList.add('ke-tiep');}}});
var o=document.getElementById(ol.getAttribute('data-the'));if(!o||(!ke&&hong))return;o.textContent=(ke?ke.getAttribute('data-ten')+' — '+ke.getAttribute('data-ngay').split('-').reverse().join('/')+' ('+ke.querySelector('.con').textContent+')':'Không còn mốc nào phía trước.')+(tre.length===1?' · mốc «'+tre[0]+'» đã qua, còn việc chưa giao':tre.length?' · '+tre.length+' mốc đã qua còn việc chưa giao (sớm nhất: «'+tre[0]+'»)':'');});})();`;

const neoHang = (i, ma) => `lt${i}-h-${String(ma).replace(/[^A-Za-z0-9_-]/g, '_')}`;
const ngayVN = s => chuoi(s).split('-').reverse().join('/');
const COT = [['ma', 'Mã'], ['cau_giao', 'Việc giao'], ['hang', 'Hạng'], ['dung_tren', 'Cần xong trước'], ['chu', 'Trạng thái'], ['bat_khi', 'Bật khi'], ['vi_sao', 'Vì sao']];
const coDuLieu = (d, k) => (k === 'dung_tren' ? Array.isArray(d.dung_tren) && d.dung_tren.length > 0 : !!chuoi(d[k]));

// Neo mỗi hàng: mã (hoặc nhãn) — hàng trùng mã lấy hậu tố để mọi id trên trang là duy nhất. `theoNhan`
// trỏ nhãn → id của hàng ĐẦU mang nhãn đó (liên kết từ chỗ cần sửa, cần xong trước, mốc).
function neoCua(i, kq) {
  const idHang = new Map(); const ids = new Set(); const theoNhan = new Map();
  for (const d of kq.dong) {
    const goc = neoHang(i, d._ma || d._nhan); let id = goc;
    for (let n = 2; ids.has(id); n++) id = `${goc}-${n}`;
    idHang.set(d, id); ids.add(id); if (!theoNhan.has(String(d._nhan))) theoNhan.set(String(d._nhan), id);
  }
  return { idHang, ids, theoNhan };
}
const CHUA_CAU = '(chưa có câu mô tả việc giao)';
// Bước kế của hàng CÓ hồ sơ, suy từ ô bản đồ (hồ sơ lo-trinh-cat-luot, phần sửa lát 1): bảng viết sẵn,
// máy không soạn câu. Ô vắng khỏi bảng (đã giao, đã nghiệm thu, xếp lại, đã bác, ngoài phạm vi) không
// có bước kế. `buocKeCua` do veHtml đặt mỗi lượt vẽ từ `sections` của bản đồ — lớp phân tích không đổi.
export const BUOC_KE = {
  'can-nhac': 'quyết có làm hay không',
  'sap-mo': 'mở vòng',
  'cho-duyet': 'duyệt phạm vi',
  'dang-dung': 'làm và chấm',
  'cho-nghiem-thu': 'lái thử và phiên nghiệm thu',
  'hong': 'sửa hồ sơ',
};
let buocKeCua = () => null;
// Hàng mà lớp phân tích chọn làm hàng kế: cùng nhãn, trạng thái thuộc nhóm chưa làm (cùng luật lớp
// phân tích dùng để chọn), cùng câu giao — mã trùng thì không lấy nhầm hàng đầu đã giao hay đang làm.
function hangKeCua(kq, chuaLam) {
  const ke = kq.hangKe; if (!ke) return null;
  const cung = kq.dong.filter(d => String(d._nhan) === String(ke.ma) && (chuoi(d.cau_giao) || '(hàng chưa có câu giao)') === ke.cauGiao);
  return cung.find(d => d.chu === CHUA_MO || chuaLam.has(d.chu)) || cung[0] || null;
}
// Hàng ghi trạng thái ngoài bảng từ, gom theo TỪ đã ghi: mỗi từ là một chỗ cần sửa (thêm từ đó vào
// `tu_vung` là sửa xong mọi hàng mang nó).
const khaiLa = kq => { const g = new Map(); for (const d of kq.dong) if (d.khaiNgoai) { if (!g.has(d.tuKhai)) g.set(d.tuKhai, []); g.get(d.tuKhai).push(d); } return [...g]; };
// Nhóm tiến độ của một chữ trạng thái — MỘT hàm cho thanh tiến độ của thẻ và cho khối dữ liệu
// (hồ sơ xuat-du-lieu-lo-trinh): trang và dữ liệu không thể chia khác nhau.
const nhomTienDo = (chu, kq, nhom) => (kq.daGiao.has(chu) ? 'da-giao' : nhom.dangLam.has(chu) ? 'dang-lam'
  : (chu === CHUA_MO || nhom.chuaLam.has(chu)) ? 'chua-bat-dau' : 'khac');
// Việc gắn một mốc, và «mốc còn việc chưa giao» — dải mốc và khối dữ liệu cùng gọi.
const ganMoc = m => (Array.isArray(m.hang) ? m.hang.map(chuoi).filter(Boolean) : []);
const conViecMoc = (m, kq) => ganMoc(m).some(x => kq.dong.some(d => String(d._nhan) === x && !kq.daGiao.has(d.chu)));
const mocTheoNgay = kq => { const mocs = [...kq.moc].sort((a, b) => chuoi(a.ngay).localeCompare(chuoi(b.ngay))); return mocs; };
const cauKhaiLa = (w, ds) => `kế hoạch ghi «${w}» ở ${ds.length} việc — máy không hiểu trạng thái này, thêm từ này vào bảng từ trạng thái`;
const cauKhaiNgoai = d => `kế hoạch ghi «${d.tuKhai}» — máy không hiểu trạng thái này`;
const demTienDo = (kq, nhom) => {
  const n = { tong: kq.dong.length, da_giao: 0, dang_lam: 0, chua_bat_dau: 0, khac: 0 };
  for (const d of kq.dong) n[nhomTienDo(d.chu, kq, nhom).replace(/-/g, '_')] += 1;
  return n;
};

function theDau(i, t, nhieu, nhom) {
  const ten = esc((t.kq && t.kq.ten) || t.tep);
  if (t.loi) return `<section class="the"><h2><a href="#lt${i}">${ten}</a></h2><p class="loi">Không đọc được kế hoạch ${esc(t.tep)}: ${esc(dichLoi(t.loi))}</p></section>`;
  const kq = t.kq; const ke = hangKeCua(kq, nhom.chuaLam); const { idHang } = neoCua(i, kq);
  const lenh = thamSoKe(kq, t.tep, nhieu);
  const td = demTienDo(kq, nhom);
  const { tong, da_giao: giao, dang_lam: dang, chua_bat_dau: chua, khac } = td;
  const pt = n => (100 * n / tong).toFixed(1);
  const lamTiep = ke
    ? `<span class="ke"><a href="#${idHang.get(ke)}">${esc(ke._nhan)}</a> — ${esc(chuoi(ke.cau_giao) || CHUA_CAU)}</span><br>${lenh
      ? `<span class="mu nho">Dán vào Claude Code:</span> <span class="lenh">/feature-loop:feature-loop ${esc(lenh)}</span>`
      : `<span class="mu">${ke._ma ? 'Mã này trùng trong kế hoạch — đổi mã trước khi mở.' : 'Việc này chưa có mã — đặt mã trong kế hoạch trước khi mở.'}</span>`}`
    : '<span class="mu">Chưa có việc nào đủ điều kiện mở.</span>';
  const nSua = kq.co.length + khaiLa(kq).length;
  const canSua = nSua ? `<a href="#lt${i}-co">${nSua} chỗ cần sửa</a>` : '<span class="khong">Không có chỗ nào cần sửa</span>';
  const tienDo = tong
    ? `${giao}/${tong} đã giao · ${dang} đang làm · ${chua} chưa bắt đầu${khac ? ` · ${khac} việc khác (xếp lại, đã bác hoặc trạng thái chưa rõ)` : ''}<div class="thanh" aria-hidden="true"><i class="g" style="width:${pt(giao)}%"></i><i class="l" style="width:${pt(dang)}%"></i></div>`
    : 'Kế hoạch chưa có việc nào.';
  return `<section class="the"><h2><a href="#lt${i}">${ten}</a></h2>
<div class="o"><span class="nhan">Làm tiếp</span>${lamTiep}</div>
<div class="o so-co"><span class="nhan">Cần sửa trong kế hoạch</span>${canSua}</div>
<div class="o"><span class="nhan">Mốc kế tiếp</span><span id="lt${i}-moc-ke">${kq.moc.length ? 'Xem dải mốc bên dưới.' : 'Kế hoạch chưa có mốc.'}</span></div>
<div class="o"><span class="nhan">Tiến độ</span>${tienDo}</div>
</section>`;
}

function moCo(i, c, theoNhan) {
  const d = dichCo(c); const id = d.ma != null ? theoNhan.get(String(d.ma)) : null;
  return id ? `<li><a href="#${id}"><b>${esc(d.ma)}</b> — ${esc(d.chu)}</a></li>` : `<li><span>${d.ma != null ? `<b>${esc(d.ma)}</b> — ` : ''}${esc(d.chu)}</span></li>`;
}
function oHang(i, d, kq, theoNhan) {
  const tt = `<span class="tt${kq.daGiao.has(d.chu) ? ' giao' : (d.chu === CHUA_MO ? ' chua' : '')}">${esc(d.chu)}</span>`;
  return {
    ma: esc(d._nhan),
    cau_giao: `${esc(chuoi(d.cau_giao))}${d.slug ? `<div class="mu nho"><code>${esc(d.slug)}</code></div>` : ''}`,
    hang: esc(chuoi(d.hang)),
    dung_tren: (Array.isArray(d.dung_tren) ? d.dung_tren : []).map(chuoi).map(x => (theoNhan.has(x) ? `<a href="#${theoNhan.get(x)}">${esc(x)}</a>` : esc(x))).join(', '),
    chu: `${tt}${d.tinTheoLoi ? '<span class="mu nho"> theo ghi chép, chưa có hồ sơ</span>' : ''}${d.khaiNgoai ? `<span class="co-o">${esc(cauKhaiNgoai(d))}</span>` : ''}${d.coHang.map(c => `<span class="co-o">${esc(dichCo(c).chu)}</span>`).join('')}${buocKeCua(d) ? `<div class="mu nho">bước kế: ${esc(buocKeCua(d))}</div>` : ''}`,
    bat_khi: esc(chuoi(d.bat_khi)),
    vi_sao: esc(chuoi(d.vi_sao)),
  };
}
function bangViec(i, rows, kq, theoNhan, idHang) {
  const cot = COT.filter(([k]) => k === 'ma' || k === 'chu' || rows.some(d => coDuLieu(d, k)));
  return `<div class="bang"><table><thead><tr>${cot.map(([, n]) => `<th>${n}</th>`).join('')}</tr></thead><tbody>
${rows.map(d => { const o = oHang(i, d, kq, theoNhan); return `<tr id="${idHang.get(d)}">${cot.map(([k, n]) => `<td data-nhan="${n}">${o[k]}</td>`).join('')}</tr>`; }).join('\n')}
</tbody></table></div>`;
}
export function khoiNgoai(ds) {
  return ds.length ? `<details><summary>${ds.length} hồ sơ không thuộc kế hoạch nào</summary><p class="mu nho">Sửa lỗi, sự cố, việc giao thẳng — hợp lệ, liệt kê để đủ.</p><ul>${ds.map(s => `<li><code>${esc(s)}</code></li>`).join('')}</ul></details>` : '';
}
function mucLoTrinh(i, t) {
  const ten = esc((t.kq && t.kq.ten) || t.tep);
  if (t.loi) return `<section id="lt${i}"><h2>${ten}</h2><p class="loi">Không đọc được kế hoạch ${esc(t.tep)}: ${esc(dichLoi(t.loi))}</p></section>`;
  const kq = t.kq;
  const { idHang, theoNhan } = neoCua(i, kq);
  const mo = kq.dong.filter(d => !kq.daGiao.has(d.chu)); const xong = kq.dong.filter(d => kq.daGiao.has(d.chu));
  const P = [`<section id="lt${i}"><h2>${ten}</h2>`];
  // Chỗ cần sửa = cờ của lớp phân tích (đã dịch) + mỗi hàng ghi trạng thái ngoài bảng từ (không so được
  // với hồ sơ — thêm từ đó vào `tu_vung`).
  const la = khaiLa(kq);
  if (kq.co.length || la.length) P.push(`<h3 id="lt${i}-co">Cần sửa trong kế hoạch (${kq.co.length + la.length})</h3><ul class="co-ds">${kq.co.map(c => moCo(i, c, theoNhan)).join('')}${la.map(([w, ds]) => `<li><span>${esc(cauKhaiLa(w, ds))} (việc ${ds.map(d => `<a href="#${idHang.get(d)}">${esc(d._nhan)}</a>`).join(', ')})</span></li>`).join('')}</ul>`);
  P.push(`<h3>Việc còn mở (${mo.length})</h3>`, mo.length ? bangViec(i, mo, kq, theoNhan, idHang)
    : `<p class="mu">${kq.dong.length ? 'Mọi việc trong kế hoạch đã giao.' : `Kế hoạch chưa có việc nào — thêm hàng vào <code>${esc(t.tep)}</code>.`}</p>`);
  if (xong.length) P.push(`<details><summary>${xong.length} việc đã giao</summary>${bangViec(i, xong, kq, theoNhan, idHang)}</details>`);
  if (kq.moc.length) {
    const mocs = mocTheoNgay(kq); const gan = ganMoc;
    // Mốc còn việc chưa giao: script trên trang tô «đã qua — còn việc chưa giao» khi ngày đã qua.
    const conViec = m => conViecMoc(m, kq);
    const mk = mocKhongHang(kq);
    P.push(`<h3>Mốc${mk.k ? ` <span class="mu nho">— ${mk.k}/${mk.n} mốc chưa gắn việc nào</span>` : ''}</h3><ol class="moc" data-the="lt${i}-moc-ke">${mocs.map(m => `<li data-ngay="${esc(chuoi(m.ngay))}" data-ten="${esc(chuoi(m.ten))}"${conViec(m) ? ' data-con-viec' : ''}><span class="ngay">${esc(ngayVN(m.ngay))}</span>${esc(chuoi(m.ten))}<span class="con"></span>${gan(m).length ? ` <span class="mu nho">· việc ${gan(m).map(x => (theoNhan.has(x) ? `<a href="#${theoNhan.get(x)}">${esc(x)}</a>` : esc(x))).join(', ')}</span>` : '<span class="trong">chưa gắn việc</span>'}</li>`).join('')}</ol>`);
  }
  if (kq.daBac.length) P.push(`<h3>Đã bác</h3><ul>${kq.daBac.map(b => `<li>${esc(chuoi(b.ma))} — ${esc(chuoi(b.ly_do))}</li>`).join('')}</ul>`);
  P.push('</section>');
  return P.join('\n');
}

// ── Khối dữ liệu máy đọc (hồ sơ xuat-du-lieu-lo-trinh) ─────────────────────────
// Trang mang MỘT khối `<script type="application/json" id="lo-trinh-du-lieu">`, dựng trong cùng lần
// gọi `veHtml` từ cùng `cacTep` — bản chiếu ngoài kho (trang trong CRM, bản chiếu ReUI) đọc khối thay
// vì tự tính trạng thái. Khuôn sống ở ĐÂY; tài liệu cho kho tiêu thụ
// (skills/acceptance/references/lo-trinh-du-lieu.md) chép bảng khoá, ca LT-119 so hai bên.
export const ID_DU_LIEU = 'lo-trinh-du-lieu';
// Bản 2 (hàng X2): thêm khoá `tom_tat` ở cấp hàng. Bộ đọc bản 1 gặp bản 2 «đọc phần biết» + một cảnh báo.
export const PHIEN_BAN_DU_LIEU = 2;
export const KHUON_DU_LIEU = {
  goc: ['khuon', 'phien_ban', 'nguon', 'lo_trinh', 'ngoai_lo_trinh'],
  lo_trinh: ['tep', 'ten', 'loi', 'hang_ke', 'can_sua', 'tien_do', 'hang', 'moc', 'da_bac'],
  hang_ke: ['ma', 'cau_giao', 'lenh'],
  can_sua: ['ma', 'chu'],
  tien_do: ['tong', 'da_giao', 'dang_lam', 'chua_bat_dau', 'khac'],
  hang: ['ma', 'cau_giao', 'hang', 'nhom', 'dung_tren', 'trang_thai', 'nhom_trang_thai', 'ho_so', 'theo_loi', 'co', 'bat_khi', 'vi_sao', 'tom_tat'],
  moc: ['ten', 'ngay', 'hang', 'con_viec'],
  da_bac: ['ma', 'ly_do'],
  tom_tat: ['moi_nguoi', 'chu_kho'],
  moi_nguoi: [...HS.O_MOI_NGUOI],
  chu_kho: [...HS.O_CHU_KHO],
};
const nhomVe = sections => { const TEN = Object.fromEntries(sections || []); const ten = ds => new Set(ds.map(k => TEN[k]).filter(Boolean)); return { dangLam: ten(DANG_LAM_O), chuaLam: ten(CHUA_LAM_O) }; };
const tienDoRong = () => ({ tong: 0, da_giao: 0, dang_lam: 0, chua_bat_dau: 0, khac: 0 });
// Mỗi chữ trong khối là ĐÚNG chữ trang in (cờ đã dịch, câu gom từ trạng thái lạ, lệnh mở) — bản chiếu
// không phải dịch lại gì. Không ngày chạy: `--check` vẫn so byte.
// `tinHieu` (hồ sơ cua-tin-hieu-gom-nhom, hàng L3): mảng đường đi tín hiệu khi kho khai cửa tín hiệu —
// khoá gốc TUỲ CHỌN `tin_hieu`, chỉ có mặt khi khai (kho không khai giữ nguyên từng byte; bảng khoá chuẩn
// KHUON_DU_LIEU không đổi; trường bản ghi ở TRUONG_DUONG của scripts/tin-hieu.mjs).
export function duLieuTrang(cacTep, sections = null, tinHieu = null) {
  const nhom = nhomVe(sections); const nhieu = cacTep.length > 1;
  const ngoai = (cacTep.find(t => t.kq) || {}).kq?.ngoaiLoTrinh || [];
  const lo = cacTep.map(t => {
    if (t.loi) return { tep: t.tep, ten: null, loi: dichLoi(t.loi), hang_ke: null, can_sua: [], tien_do: tienDoRong(), hang: [], moc: [], da_bac: [] };
    const kq = t.kq; const ke = hangKeCua(kq, nhom.chuaLam); const thamSo = thamSoKe(kq, t.tep, nhieu);
    return {
      tep: t.tep, ten: kq.ten || null, loi: null,
      hang_ke: ke ? { ma: String(ke._nhan), cau_giao: chuoi(ke.cau_giao) || CHUA_CAU, lenh: thamSo ? `/feature-loop:feature-loop ${thamSo}` : null } : null,
      can_sua: [...kq.co.map(c => { const d = dichCo(c); return { ma: d.ma != null ? String(d.ma) : null, chu: d.chu }; }),
        ...khaiLa(kq).map(([w, ds]) => ({ ma: null, chu: `${cauKhaiLa(w, ds)} (việc ${ds.map(d => d._nhan).join(', ')})` }))],
      tien_do: demTienDo(kq, nhom),
      hang: kq.dong.map(d => ({
        ma: String(d._nhan), cau_giao: chuoi(d.cau_giao), hang: chuoi(d.hang), nhom: chuoi(d.nhom),
        dung_tren: (Array.isArray(d.dung_tren) ? d.dung_tren : []).map(chuoi),
        trang_thai: d.chu, nhom_trang_thai: nhomTienDo(d.chu, kq, nhom), ho_so: d.hoSo || null, theo_loi: !!d.tinTheoLoi,
        co: [...(d.khaiNgoai ? [cauKhaiNgoai(d)] : []), ...d.coHang.map(c => dichCo(c).chu)],
        bat_khi: chuoi(d.bat_khi), vi_sao: chuoi(d.vi_sao), tom_tat: d.tomTat || null,
      })),
      moc: mocTheoNgay(kq).map(m => ({ ten: chuoi(m.ten), ngay: chuoi(m.ngay), hang: ganMoc(m), con_viec: conViecMoc(m, kq) })),
      da_bac: kq.daBac.map(b => ({ ma: chuoi(b.ma), ly_do: chuoi(b.ly_do) })),
    };
  });
  return { khuon: ID_DU_LIEU, phien_ban: PHIEN_BAN_DU_LIEU, nguon: cacTep.map(t => t.tep), lo_trinh: lo, ngoai_lo_trinh: [...ngoai], ...(tinHieu != null ? { tin_hieu: tinHieu } : {}) };
}
// JSON trong thẻ script: mọi `<` thoát thành \u003c (không chuỗi nào trong khối đóng được thẻ, bất
// kể hoa thường), U+2028/2029 thoát để khối vẫn là JS hợp lệ với bộ đọc cũ.
const khoiDuLieu = o => `<script type="application/json" id="${ID_DU_LIEU}">${JSON.stringify(o).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')}</script>`;

// Phép so của `product-map.mjs --check` (hàng X2): trang trong cây «khớp» bản vẽ lại khi giống từng byte,
// HOẶC khi chỉ khác ở `tom_tat` của khối dữ liệu. Dải tóm tắt đọc nội dung hồ sơ (dòng sổ, báo cáo token,
// mã đã chấm) — đòi nó khớp từng byte là bắt mọi commit chạm hồ sơ (một dòng sổ, một lượt ghim lại) vẽ lại
// trang ở MỌI kho. Dải đúng tới lần vẽ gần nhất (mỗi cổng đóng); phần người nhìn thấy và mọi khoá khác
// vẫn so từng byte.
const RE_KHOI = /<script type="application\/json" id="lo-trinh-du-lieu">([\s\S]*?)<\/script>/;
const boTomTat = html => {
  const m = String(html ?? '').match(RE_KHOI); if (!m) return html;
  let o; try { o = JSON.parse(m[1]); } catch (_) { return html; }
  for (const t of Array.isArray(o.lo_trinh) ? o.lo_trinh : []) for (const h of Array.isArray(t && t.hang) ? t.hang : []) if (h && typeof h === 'object' && 'tom_tat' in h) h.tom_tat = null;
  return String(html).replace(RE_KHOI, () => khoiDuLieu(o));
};
export const trangKhop = (coSan, veLai) => coSan === veLai || (coSan != null && veLai != null && boTomTat(coSan) === boTomTat(veLai));

// Bộ đọc mẫu, KHOAN DUNG (đường đọc-cũ): không bao giờ ném. Trang đời trước không có khối, JSON hỏng,
// khuôn lạ → `duLieu: null` + câu cảnh báo; phiên bản mới hơn → vẫn đọc phần biết + một cảnh báo;
// khoá thiếu → giá trị rỗng theo kiểu; khoá lạ giữ nguyên. Hàm TỰ ĐỦ — không gọi ký hiệu nào khác của
// mô-đun — để kho tiêu thụ chép nguyên văn hàm này (tài liệu lo-trinh-du-lieu.md bảo vậy); bảng khoá
// bên trong phải bằng KHUON_DU_LIEU, ca LT-118 chạy bản chép rời của hàm và so hai bảng.
export function docDuLieu(html) {
  const ID = 'lo-trinh-du-lieu'; const PHIEN_BAN = 2;
  const KHUON = {
    goc: ['khuon', 'phien_ban', 'nguon', 'lo_trinh', 'ngoai_lo_trinh'],
    lo_trinh: ['tep', 'ten', 'loi', 'hang_ke', 'can_sua', 'tien_do', 'hang', 'moc', 'da_bac'],
    hang_ke: ['ma', 'cau_giao', 'lenh'],
    can_sua: ['ma', 'chu'],
    tien_do: ['tong', 'da_giao', 'dang_lam', 'chua_bat_dau', 'khac'],
    hang: ['ma', 'cau_giao', 'hang', 'nhom', 'dung_tren', 'trang_thai', 'nhom_trang_thai', 'ho_so', 'theo_loi', 'co', 'bat_khi', 'vi_sao', 'tom_tat'],
    moc: ['ten', 'ngay', 'hang', 'con_viec'],
    da_bac: ['ma', 'ly_do'],
    tom_tat: ['moi_nguoi', 'chu_kho'],
    moi_nguoi: ['da_giao', 'vi_sao', 'trang_thai', 'ngay', 'production', 'do_gi', 'ket_qua', 'chua_lam', 'ai_quyet'],
    chu_kho: ['tieu_chi', 'phep_do', 'luot_cham', 'token', 'quyet_dinh_may', 'quyet_dinh_nguoi', 'ma'],
  };
  const MANG = ['nguon', 'lo_trinh', 'ngoai_lo_trinh', 'can_sua', 'hang', 'moc', 'da_bac', 'dung_tren', 'co'];
  const BOOL = ['theo_loi', 'con_viec']; const SO = ['phien_ban', 'tong', 'da_giao', 'dang_lam', 'chua_bat_dau', 'khac'];
  const NUL = ['ten', 'loi', 'hang_ke', 'lenh', 'ho_so', 'tom_tat', 'moi_nguoi', 'chu_kho'];
  // Ô của dải vắng → null («chưa có»), xét theo CẤP chứ không theo tên: tên ô trùng tên trường ở cấp khác
  // (da_giao của tien_do, ma, trang_thai, vi_sao của hang) vẫn rỗng theo kiểu như bản 1.
  const rong = (k, cap) => (cap === 'moi_nguoi' || cap === 'chu_kho' ? null : MANG.includes(k) ? [] : BOOL.includes(k) ? false : SO.includes(k) ? 0 : NUL.includes(k) ? null
    : k === 'tien_do' ? { tong: 0, da_giao: 0, dang_lam: 0, chua_bat_dau: 0, khac: 0 } : '');
  const va = (o, cap) => {
    if (o == null || typeof o !== 'object' || Array.isArray(o)) return o;
    const ra = { ...o };
    for (const k of KHUON[cap]) if (!(k in ra)) ra[k] = rong(k, cap);
    return ra;
  };
  const m = String(html ?? '').match(new RegExp(`<script type="application/json" id="${ID}">([\\s\\S]*?)</script>`));
  if (!m) return { duLieu: null, canhBao: ['trang chưa mang dữ liệu lộ trình — vẽ lại bằng bộ kit từ 2.27'] };
  let o;
  try { o = JSON.parse(m[1]); } catch (e) { return { duLieu: null, canhBao: [`khối dữ liệu lộ trình không phải JSON hợp lệ: ${e.message}`] }; }
  if (o == null || typeof o !== 'object' || Array.isArray(o) || o.khuon !== ID) return { duLieu: null, canhBao: [`khối mang khuôn «${o && o.khuon}», không phải ${ID}`] };
  const canhBao = [];
  if (Number(o.phien_ban) > PHIEN_BAN) canhBao.push(`khuôn phiên bản ${o.phien_ban} mới hơn bộ đọc (${PHIEN_BAN}) — đọc phần biết`);
  if (Number(o.phien_ban) === 1) canhBao.push('trang vẽ bằng khuôn bản 1 — chưa có tóm tắt hồ sơ (tom_tat null); vẽ lại bằng bộ kit mới');
  const g = va(o, 'goc');
  g.lo_trinh = (Array.isArray(g.lo_trinh) ? g.lo_trinh : []).map(t => {
    const x = va(t, 'lo_trinh');
    if (x == null || typeof x !== 'object') return x;
    if (x.hang_ke != null) x.hang_ke = va(x.hang_ke, 'hang_ke');
    x.tien_do = va(x.tien_do, 'tien_do');
    for (const cap of ['can_sua', 'hang', 'moc', 'da_bac']) x[cap] = (Array.isArray(x[cap]) ? x[cap] : []).map(v => va(v, cap));
    for (const h of x.hang) if (h && typeof h === 'object' && h.tom_tat != null && typeof h.tom_tat === 'object') {
      h.tom_tat = va(h.tom_tat, 'tom_tat');
      for (const cap of ['moi_nguoi', 'chu_kho']) h.tom_tat[cap] = va(h.tom_tat[cap] == null || typeof h.tom_tat[cap] !== 'object' ? {} : h.tom_tat[cap], cap);
    }
    return x;
  });
  return { duLieu: g, canhBao };
}

// Một trang cho mọi lộ trình của kho (`cacTep` = [{tep, loi, kq}] theo thứ tự khai). `sections` của
// bản đồ cho tên các ô đang làm / chưa làm (số tiến độ); vắng thì chỉ «Chưa mở» tính là chưa bắt đầu.
export function veHtml(cacTep, sections = null, tinHieu = null) {
  const TEN = Object.fromEntries(sections || []); const ten = ds => new Set(ds.map(k => TEN[k]).filter(Boolean));
  const nhom = { dangLam: ten(DANG_LAM_O), chuaLam: ten(CHUA_LAM_O) };
  const khoaO = new Map((sections || []).map(([k, t]) => [t, k]));
  buocKeCua = d => (d.coHoSo ? BUOC_KE[khoaO.get(d.chu)] || null : null);
  const nhieu = cacTep.length > 1;
  const tieuDe = nhieu ? 'Lộ trình' : esc((cacTep[0].kq && cacTep[0].kq.ten) || 'Lộ trình');
  const ngoai = (cacTep.find(t => t.kq) || {}).kq?.ngoaiLoTrinh || [];
  const than = [`<h1>${tieuDe}</h1>`,
    `<div class="the-dau">${cacTep.map((t, i) => theDau(i + 1, t, nhieu, nhom)).join('\n')}</div>`,
    ...cacTep.map((t, i) => mucLoTrinh(i + 1, t)),
    `<p class="mu nho">Vẽ từ ${cacTep.map(t => `<code>${esc(t.tep)}</code>`).join(', ')} và hồ sơ nghiệm thu; máy vẽ lại mỗi lần một cổng nghiệm thu đóng, trạng thái từng hàng lấy từ hồ sơ, không gõ tay. Đổi kế hoạch bằng PR vào tệp kế hoạch.</p>`,
    khoiNgoai(ngoai)].filter(Boolean);
  return `<!doctype html>\n<html lang="vi">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>${tieuDe}</title>\n<style>\n${CSS}\n</style>\n</head>\n<body>\n<main>\n${than.join('\n')}\n</main>\n${khoiDuLieu(duLieuTrang(cacTep, sections, tinHieu))}\n<script>${SCRIPT}</script>\n</body>\n</html>\n`;
}
// Ba lối cũ giữ tên (test và bộ đọc đời trước gọi chúng), cùng một bộ vẽ.
export const renderTrang = (kq, tep, sections = null) => veHtml([{ tep, loi: null, kq }], sections);
export const renderLoi = (tep, loi) => veHtml([{ tep, loi, kq: null }]);
export const renderNhieu = (cacTep, sections = null) => veHtml(cacTep, sections);

// ── Hai lối vào cho hai bên đọc ───────────────────────────────────────────────
// Phân tích cả kho: mọi tệp khai, và cờ không gắn được vào một hàng (tệp lặp, hồ sơ ghi tệp không
// khai, hồ sơ ghi mã không có hàng) — cờ ấy vào lộ trình của tệp nó ghi, không ghi tệp thì vào lộ
// trình đọc được ĐẦU theo thứ tự khai. null khi ổ cắm vắng.
export function phanTichKho({ root, classify, sections }) {
  const khai = docCacTep(root);
  if (khai == null) return null;
  const nhan = docNhan(root);
  const cacTep = khai.tep.map(tep => {
    const { loi, data } = docTep(root, tep);
    if (loi) return { tep, loi, kq: null };
    return { tep, loi: null, kq: suyTrangThai({ root, khuon: kiemKhuon(data), classify, sections, nhan: nhan.filter(n => !n.tep || n.tep === tep) }) };
  });
  const docDuoc = cacTep.filter(t => t.kq);
  const dat = (tep, c) => { const t = (tep && docDuoc.find(x => x.tep === tep)) || docDuoc[0]; if (t) t.kq.co.push(c); };
  for (const c of khai.co) dat(null, c);
  for (const n of nhan) {
    if (n.tep && !khai.tep.includes(n.tep)) { dat(null, `hồ sơ ${n.slug} ghi lo_trinh_tep ${n.tep} — kho không khai tệp đó`); continue; }
    const pham = docDuoc.filter(t => !n.tep || n.tep === t.tep);
    if (pham.length && !pham.some(t => t.kq.dong.some(d => d._ma === n.ma))) dat(n.tep, `hồ sơ ${n.slug} ghi lo_trinh_ma ${n.ma} — không có hàng ${n.ma}`);
  }
  // Vòng ngoài lộ trình tính trên CẢ kho: hồ sơ một lộ trình trỏ không phải «ngoài» ở lộ trình kia.
  if (docDuoc.length > 1) {
    const troi = new Set(docDuoc.flatMap(t => t.kq.dong.flatMap(d => [d.slug, d.hoSo])).filter(Boolean));
    for (const t of docDuoc) t.kq.ngoaiLoTrinh = t.kq.ngoaiLoTrinh.filter(x => !troi.has(x));
  }
  // Nấc 1 của ADR 0025 (hồ sơ moc-la-chien-dich): hai cờ vàng, chỉ cảnh báo. «Đang mở» = ô bản đồ thuộc nhóm
  // đang làm hoặc chưa bắt đầu (NHOM_MO). Cờ việc-ngoài-mốc xét «kho dùng mốc» ở cấp KHO: một lộ trình có mốc là
  // mọi lộ trình của kho được xét (Hỏi-1, chủ kho duyệt 14/10). Cờ hồ-sơ-ngoài-kế-hoạch áp mọi kho khai lộ trình,
  // đặt một lần ở lộ trình đầu như các cờ cấp kho khác.
  const TEN = Object.fromEntries(sections || []); const tenMo = new Set(NHOM_MO.map(k => TEN[k]).filter(Boolean));
  if (docDuoc.some(t => t.kq.moc.length)) {
    for (const t of docDuoc) {
      const ganMa = new Set(t.kq.moc.flatMap(ganMoc));
      for (const d of t.kq.dong) {
        if (!d.coHoSo || !tenMo.has(d.chu) || ganMa.has(String(d._nhan))) continue;
        d.coHang.push(`hàng ${d._nhan}: đang mở vòng mà chưa thuộc mốc nào`);
        t.kq.co.push(d.coHang[d.coHang.length - 1]);
      }
    }
  }
  // Hồ sơ đã tự ghi mã việc (`lo_trinh_ma`) là đã nối — mã sai hay trùng có cờ riêng ở trên, không cờ chồng.
  const daNoi = new Set(nhan.map(n => n.slug));
  if (docDuoc.length) {
    for (const s of docDuoc[0].kq.ngoaiLoTrinh) {
      if (!daNoi.has(s) && NHOM_MO.includes(classify(path.join(root, '_acceptance', s), s).key)) dat(null, `hồ sơ ${s} đang mở mà không thuộc việc nào trong kế hoạch`);
    }
  }
  return { cacTep, nhan };
}
// Lối cũ của lát 1 (một lộ trình): phần tử đầu.
export function phanTich(opts) {
  const k = phanTichKho(opts);
  return k == null ? null : k.cacTep[0];
}
export function veTrang(opts) {
  const k = phanTichKho(opts);
  if (k == null) return null;
  return veHtml(k.cacTep, opts.sections, opts.tinHieu ?? null);
}
// Thẻ start: dữ liệu từng lộ trình (`ds`) và CÁC DÒNG THẺ dựng sẵn (`dong`) — thân /start in nguyên,
// không tự soạn (kit render, không soạn; phép đo đo đầu ra thay vì đo chữ chỉ dẫn).
// `slugGiu`: slug các hàng một đợt Điều phối – Thợ đang giữ — hàng kế thuộc đó vẫn hiện chữ, nhưng
// `thamSo` null nên thẻ không mời mở nó lần thứ hai.
export function loTrinhThe({ root, classify, sections, today, banDoBat = null, lenhVe = null, slugGiu = null }) {
  const k = phanTichKho({ root, classify, sections });
  if (k == null) return null;
  const nhieu = k.cacTep.length > 1;
  const giu = new Set(slugGiu || []);
  const slugKe = kq => {
    const d = kq.hangKe ? kq.dong.find(x => x._nhan === kq.hangKe.ma) : null;
    return d ? (chuoi(d.slug) || suySlug(d.cau_giao)) : null;
  };
  const ds = k.cacTep.map(p => {
    if (p.loi) return { tep: p.tep, ten: null, loi: p.loi, hangKe: null, hangTre: [], mocKhongHang: { k: 0, n: 0 }, tinTheoLoi: { n: 0, tong: 0 }, tuKhaiNgoai: 0, co: [] };
    const kq = p.kq;
    return {
      tep: p.tep, ten: kq.ten || null, loi: null,
      hangKe: kq.hangKe ? { ma: kq.hangKe.ma, cauGiao: kq.hangKe.cauGiao, thamSo: giu.has(slugKe(kq)) ? null : thamSoKe(kq, p.tep, nhieu) } : null,
      hangTre: hangTre(kq, today), mocKhongHang: mocKhongHang(kq), tinTheoLoi: kq.tinTheoLoi, tuKhaiNgoai: kq.tuKhaiNgoai, co: kq.co,
    };
  });
  // Rà soát (hồ sơ ra-soat-lo-trinh): khoá `raSoat` CHỈ có khi khác rỗng — kho không có đề xuất giữ thẻ từng byte.
  const rs = raSoat({ root, cacTep: k.cacTep, sections, today });
  ds.forEach((t, i) => { if (rs[i] && rs[i].de_xuat.length) t.raSoat = rs[i].de_xuat; if (rs[i] && rs[i].canh_bao) t.raSoatCanh = rs[i].canh_bao; });
  const dongRs = t => {
    if (!t.raSoat) return [];
    const dem = x => t.raSoat.filter(m => m.de_xuat === x).length;
    const ra = [`Rà soát: ${t.raSoat.length} đề xuất — ${dem('doi-moc')} dời mốc · ${dem('cho-dieu-kien')} chờ điều kiện · ${dem('bac')} bác`];
    ra.push(...t.raSoat.slice(0, 5).map(dongRaSoat));
    if (t.raSoat.length > 5) ra.push(`  … còn ${t.raSoat.length - 5} — xem: ${LENH_RA_SOAT}`);
    return ra;
  };
  const dong = [];
  for (const t of ds) {
    if (nhieu) dong.push(`Lộ trình ${t.ten || t.tep}:`);
    if (t.loi) { dong.push(`${nhieu ? 'K' : 'Lộ trình: k'}hông đọc được tệp ý định — ${t.loi}`); continue; }
    dong.push(t.hangKe ? `Hàng kế: ${t.hangKe.ma} — ${t.hangKe.cauGiao}` : 'Hàng kế: chưa có hàng đủ điều kiện mở');
    const tre = t.hangTre.length ? `Hàng trễ: ${t.hangTre.map(h => `${h.ma} (mốc ${h.moc}, ${h.ngay})`).join(' · ')}` : 'Hàng trễ: không có';
    dong.push(t.mocKhongHang.k > 0 ? `${tre} (${t.mocKhongHang.k}/${t.mocKhongHang.n} mốc không gắn hàng nào)` : tre);
    dong.push(`Tin theo lời: ${t.tinTheoLoi.n}/${t.tinTheoLoi.tong} hàng${t.tuKhaiNgoai > 0 ? ` · ${t.tuKhaiNgoai} hàng tự khai ngoài từ vựng — không so được với hồ sơ` : ''}`);
    dong.push(...dongRs(t), ...(t.raSoatCanh || []).map(c => (t.raSoat ? `  ! ${c}` : `Rà soát: ${c}`)));
    if (t.co.length) dong.push(`Lộ trình có ${t.co.length} cờ — xem trang lộ trình`);
  }
  const trang = path.join(root, TEP_TRANG);
  const trangCo = existsSync(trang);
  dong.push(trangCo ? `Trang lộ trình: [${TEP_TRANG}](${trang})` : `Trang lộ trình chưa được vẽ — vẽ bằng: \`${lenhVe || 'node scripts/product-map.mjs --root .'}\``);
  if (banDoBat === false) dong.push('⚠ Lộ trình đã khai nhưng bản đồ sản phẩm chưa bật — bốn lệnh đóng cổng sẽ không vẽ lại trang; bật bằng hai dòng trong `_acceptance/config.yaml`');
  // Đường đọc-cũ: khoá phẳng của lát 1 mang lộ trình ĐẦU, nguyên hình dạng cũ — bộ đọc đời trước
  // không phải đổi; khoá mới (`trang`, `trangCo`, `ds`, `dong`) nằm cạnh.
  const d0 = ds[0];
  const cu = { tep: d0.tep, ten: d0.ten, loi: d0.loi, hangKe: d0.hangKe ? { ma: d0.hangKe.ma, cauGiao: d0.hangKe.cauGiao } : null, hangTre: d0.hangTre, tinTheoLoi: d0.tinTheoLoi, tuKhaiNgoai: d0.tuKhaiNgoai, co: d0.co };
  return { ...cu, trang, trangCo, ds, dong };
}

// ── Tên phiên và nhóm thanh bên theo mốc (hồ sơ moc-la-chien-dich) ──────────────
// Mốc là chiến dịch: một vòng = một hàng = một mốc; thanh bên là mỏ neo của chiến dịch đang chạy. MỘT hàm sinh
// tên — lệnh mở việc (`--mo-o`) in nó, phiên trên app đặt tên + xếp nhóm bằng nó (SKILL feature-loop, khối
// S0-TEN-CHIEN-DICH). Chỗ nối cho gói dieu-phoi (M5): chip gọi `tenChienDich` + `tenKho` thay vì đặt tên tay.
// Tên kho = thư mục của bản checkout CHÍNH (cha của git-common-dir) — phiên trong worktree tên ngẫu nhiên vẫn ra
// đúng kho; không phải kho git → tên thư mục gốc.
export function tenKho(root) {
  try {
    const d = execFileSync('git', ['-C', root, 'rev-parse', '--path-format=absolute', '--git-common-dir'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } }).trim();
    if (d) return path.basename(path.dirname(d));
  } catch { /* không phải kho git */ }
  return path.basename(path.resolve(root));
}
const NGAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const DAU_TACH_MOC = [' — ', ' (', '; ', ': '];
export function tenNganMoc(m) {
  let t = chuoi(m && m.ten_ngan);
  if (!t) {
    t = chuoi(m && m.ten);
    const cat = DAU_TACH_MOC.map(x => t.indexOf(x)).filter(i => i > 0);
    if (cat.length) t = t.slice(0, Math.min(...cat)).trim();
  }
  const ngay = chuoi(m && m.ngay);
  return NGAY_RE.test(ngay) ? `${t} ${ngay.slice(8, 10)}/${ngay.slice(5, 7)}` : t;
}
const tenNganHang = h => {
  const n = chuoi(h.ten_ngan) || chuoi(h.ten); if (n) return n;
  const tu = HS.boNgoacNgoai(chuoi(h.cau_giao)).split(/\s+/).filter(Boolean);
  return tu.length > 6 ? `${tu.slice(0, 6).join(' ')}…` : tu.join(' ');
};
const tenNganLoTrinh = (data, tep) => chuoi(data && data.ten_ngan) || chuoi(data && data.ten)
  || path.basename(String(tep || '')).replace(/\.json$/, '').replace(/^lo-trinh-/, '');
// Mốc của hàng: các mốc của CHÍNH lộ trình có mã hàng; nhiều mốc → ngày sớm nhất, cùng ngày → đứng trước trong tệp.
export function mocCuaHang(ma, moc) {
  const co = (Array.isArray(moc) ? moc : []).map((m, i) => ({ m, i })).filter(({ m }) => ganMoc(m).includes(chuoi(ma)));
  co.sort((a, b) => chuoi(a.m.ngay).localeCompare(chuoi(b.m.ngay)) || a.i - b.i);
  return co.length ? co[0].m : null;
}
// `hang`: hàng của tệp lộ trình · `moc`: mốc của CÙNG tệp · `loTrinh`: object gốc của tệp (đọc ten_ngan/ten) ·
// `tep`: đường tệp · `nhieuLoTrinh`: kho khai ≥2 tệp · `kho`: tên kho (tenKho). Thuần — không đọc đĩa.
export function tenChienDich({ hang, moc, loTrinh = null, tep = '', nhieuLoTrinh = false, kho }) {
  const m = mocCuaHang(hang.ma, moc);
  const mocNgan = m ? tenNganMoc(m) : null;
  return {
    moc: m ? { ten: chuoi(m.ten), ngay: chuoi(m.ngay), ten_ngan: mocNgan } : null,
    ten_phien: `${chuoi(hang.ma)} · ${tenNganHang(hang)} (${kho})`,
    nhom: m ? (nhieuLoTrinh ? `${tenNganLoTrinh(loTrinh, tep)} · ${mocNgan}` : mocNgan) : null,
  };
}

// ── Mở ô cơ hội từ hàng (feature-loop S0) ─────────────────────────────────────
// Slug suy TẤT ĐỊNH từ câu giao: bỏ dấu, đ→d, chữ thường, ký tự khác chữ-số thành «-», sáu từ đầu.
export function suySlug(cauGiao) {
  const tu = String(cauGiao || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'd')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  return tu.slice(0, 6).join('-');
}
const KHUON_OPP = path.join(__dirname, '..', 'skills', 'acceptance', 'references', 'opportunity-template.md');
const khoiKhuon = (txt, ten) => { const m = String(txt).match(new RegExp(`<!-- <<<${ten} -->\\n([\\s\\S]*?)<!-- ${ten}>>> -->`)); return m ? m[1] : null; };
const giaTriYaml = v => { const t = String(v ?? '').replace(/\s+/g, ' ').trim(); return /(^[\[{>|&*!%@`"'#-])|(\s#)|(: )/.test(t) ? JSON.stringify(t) : t; };
// Dựng ô cơ hội từ khuôn đọc LÚC CHẠY (khối OPP-FRONTMATTER-TEMPLATE + OPP-DE-XUAT-PREFIX): bên ghi và
// bộ phân loại ngưỡng rút từ cùng một khuôn. Ngưỡng chỉ đề xuất từ dữ liệu của hàng: SỐNG = bat_khi,
// Timebox = ngày mốc có ngày đầu tiên chứa hàng; thiếu căn cứ thì «…» — máy không bịa hạn.
export function dungCoHoi({ khuon, hang, tep, tenLoTrinh, slug, owner, moc = [], khoDungMoc = false }) {
  // Luật ô ngưỡng (tiêu đề section, nhãn bốn dòng, tiền tố đề xuất) chỉ sống ở lib — nạp LƯỜI ở
  // đây: bộ vẽ ở kho tiêu thụ chép mô-đun này mà không chép lib đó, và chỉ lối CLI dùng tới nó.
  const NG = require(path.join(__dirname, '..', 'lib', 'nguong-o-co-hoi.cjs'));
  const fm = khoiKhuon(khuon, 'OPP-FRONTMATTER-TEMPLATE');
  if (fm == null) throw new Error('khuôn ô cơ hội thiếu khối OPP-FRONTMATTER-TEMPLATE');
  const dx = NG.prefixFromTemplate(khuon, 'OPP-DE-XUAT-PREFIX');
  const nhan = NG.thresholdLabels(khuon);
  const tim = re => nhan.find(l => re.test(l));
  const [lHoi, lSong, lChet, lHan] = [tim(/Câu hỏi/), tim(/SỐNG/), tim(/CHẾT/), tim(/Timebox/)];
  if (!lHoi || !lSong || !lChet || !lHan || nhan.length !== 4) throw new Error(`khuôn ô cơ hội có nhãn ngưỡng lạ: ${JSON.stringify(nhan)}`);
  const dien = { slug, feature: giaTriYaml(hang.cau_giao), owner: giaTriYaml(owner || ''), stage: 'discovery', decision: '', decided_by: '', decided_at: '', base_commit: '', disposition: '' };
  let yaml = fm.replace(/^```yaml\n/, '').replace(/```\s*$/, '');
  yaml = yaml.replace(/\{(\w+)\}/g, (m, k) => (k in dien ? dien[k] : m));
  yaml = yaml.replace(/\n---\n?$/, `\nlo_trinh_ma: ${giaTriYaml(hang.ma)}\nlo_trinh_tep: ${giaTriYaml(tep)}\n---\n`);
  const batKhi = chuoi(hang.bat_khi);
  const m = moc.find(x => /^\d{4}-\d{2}-\d{2}$/.test(chuoi(x.ngay)) && Array.isArray(x.hang) && x.hang.map(chuoi).includes(chuoi(hang.ma)));
  const coMoc = !!(batKhi && m);
  const giaTri = {
    [lHoi]: batKhi ? `${dx} đã đạt «${batKhi}» chưa?` : '…',
    [lSong]: batKhi ? `${dx} ${batKhi}` : '…',
    [lChet]: batKhi ? `${dx} chưa đạt «${batKhi}» khi hết timebox` : '…',
    [lHan]: coMoc ? `${dx} ${chuoi(m.ngay)} (mốc ${chuoi(m.ten) || chuoi(m.ngay)})` : '…',
  };
  const nguong = nhan.map(l => `- ${l}: ${giaTri[l]}`);
  const than = [
    '', '## Vấn đề & ai gặp', '',
    `Mở từ hàng ${chuoi(hang.ma)} của «${tenLoTrinh || 'lộ trình'}» (\`${tep}\`).`,
    // moc-la-chien-dich AC-8: kho dùng mốc → một dòng mốc cho người đọc ô ở Cổng Đáng; kho không mốc → như cũ.
    ...(khoDungMoc ? [(() => { const mm = mocCuaHang(hang.ma, moc); return mm
      ? `Mốc: ${chuoi(mm.ten) || chuoi(mm.ngay)} — ${NGAY_RE.test(chuoi(mm.ngay)) ? ngayVN(mm.ngay) : chuoi(mm.ngay) || 'chưa có ngày'}.`
      : 'Mốc: chưa gắn — việc này chưa thuộc mốc nào của kế hoạch; gắn nó vào một mốc, hoặc ghi vì sao chưa.'; })()] : []), '',
    chuoi(hang.cau_giao), ...(chuoi(hang.vi_sao) ? ['', `Vì sao: ${chuoi(hang.vi_sao)}`] : []), '',
    `## ${NG.UAT_THRESHOLD_HEADING}`, '', ...nguong, '',
  ];
  return yaml + than.join('\n');
}

// ── CLI: feature-loop S0 nhận một hàng ────────────────────────────────────────
// ── Rà soát (hồ sơ ra-soat-lo-trinh, hàng RM1 — vòng 1 của gói road-map) ─────────────────────────
// Chỉ đọc, chỉ cờ: máy đề xuất (dời mốc · chờ điều kiện · bác) kèm căn cứ, không ghi tệp lộ trình. Phụ thuộc HÔM NAY
// (mốc qua ngày, tuổi hàng) nên chỉ ra thẻ start và lệnh --ra-soat, KHÔNG vào trang (trang tất định — --check so byte).
// Thứ tự luật cố định, luật đầu khớp thắng: xếp lại → đã bác → mốc qua ngày → tuổi → trần. Mốc chiến dịch CHỈ là
// `loai: phat-hanh` — mốc của người (ngoai, han, han-cung, su-kien, không khai loai) không kích hoạt.
// Lệnh «xem» trên thẻ: đường suy từ vị trí bộ máy (cùng nếp lệnh vẽ trang của start-scan) — kho tiêu thụ không có scripts/.
export const LENH_RA_SOAT = `node "${path.join(__dirname, 'lo-trinh.mjs')}" --root . --ra-soat`;
// Rà soát không bao giờ im khi không đọc được (Cổng Bằng chứng 15/10): hai câu cảnh báo dùng chung cho JSON, lệnh, thẻ.
export const CANH_TUOI = 'không đọc được tuổi hàng — luật tuổi không chạy';
export const CANH_CUT = 'lịch sử cụt — tuổi hàng là tuổi tối thiểu';
export const LUAT_RA_SOAT = ['xep-lai', 'ho-so-bac', 'moc-qua-ngay', 'tuoi', 'tran'];
const DE_XUAT_CHU = { 'doi-moc': 'dời mốc', 'cho-dieu-kien': 'chờ điều kiện', bac: 'bác' };
const MOC_CHIEN_DICH = m => chuoi(m.loai) === 'phat-hanh';
const ddmmyyyy = s => (NGAY_RE.test(s) ? `${s.slice(8, 10)}/${s.slice(5, 7)}/${s.slice(0, 4)}` : s);
const tenMocTran = m => tenNganMoc({ ...m, ngay: '' });
export function dongRaSoat(m) {
  const c = m.can_cu;
  const cc = m.luat === 'moc-qua-ngay' ? `mốc «${c.moc}» đã qua ngày ${ddmmyyyy(c.ngay)}`
    : m.luat === 'xep-lai' ? (c.nguon === 'ho-so' ? `hồ sơ ${c.ho_so} đã xếp lại` : `kế hoạch tự khai «${c.chu}»`)
      : m.luat === 'ho-so-bac' ? `hồ sơ ${c.ho_so} đã bác`
        : m.luat === 'tuoi' ? `${c.tuoi} ngày chưa ai sửa (lần cuối ${ddmmyyyy(c.cham_cuoi.ngay)})`
          : `«Kế tiếp» có ${c.k} việc, trần ${c.tran}`;
  return `  · ${m.ma} — ${DE_XUAT_CHU[m.de_xuat]}: ${cc}`;
}
// Tuổi hàng: lần cuối hàng được CHẠM trong lịch sử git của tệp lộ trình (tới HEAD). Chạm = đổi trường nào trừ `ma`, hoặc
// đổi tập mốc chứa hàng. Danh tính đi theo câu giao: đổi mã đơn thuần không chạm (crm V0–V8 → DA0–DA8). Đổi CẢ mã lẫn câu
// giao trong một commit = hàng mới. Tín hiệu nối vào hàng CHƯA tính là chạm (giới hạn khai). Clone nông → `cut`.
const khopHang = (p, r) => (p.ma === r.ma && p.cau === r.cau) ? 3 : (p.cau === r.cau ? 2 : (p.ma === r.ma ? 1 : 0));
// `hong`: lý do không đọc được tuổi (không phải kho git · có commit mà không đọc được phiên bản nào) — bên gọi cảnh báo.
export function tuoiHang(root, tep) {
  const theoMa = new Map(); let cut = false; let log = '';
  const g = (...a) => execFileSync('git', ['-C', root, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 28 });
  try {
    cut = g('rev-parse', '--is-shallow-repository').trim() === 'true';
    log = g('log', '--reverse', '--format=%H %cI', '--', tep);
  } catch { return { cut, theoMa, hong: 'không phải kho git' }; }
  let truoc = []; let docDuoc = 0; let soCommit = 0;
  for (const dong of log.split('\n').filter(Boolean)) {
    const [sha, iso] = dong.split(' '); const ngay = new Date(iso).toISOString().slice(0, 10); soCommit += 1;
    // `./` — đường tính từ `--root` như `git log` ở trên, không từ gốc kho (lộ trình trong thư mục con).
    let data; try { data = JSON.parse(g('show', `${sha}:./${tep}`).replace(/^﻿/, ''));  docDuoc += 1; } catch { continue; }
    if (data == null || typeof data !== 'object') continue;
    const moc = (Array.isArray(data.moc) ? data.moc : []).filter(m => m && typeof m === 'object');
    const mocCua = ma => moc.filter(m => ganMoc(m).includes(ma)).map(m => chuoi(m.ten)).sort().join('|');
    const conLai = [...truoc]; const nay = [];
    for (const r of (Array.isArray(data.hang) ? data.hang : []).filter(x => x && typeof x === 'object' && !Array.isArray(x))) {
      const { ma: _ma, ...than } = r; const ma = chuoi(r.ma); const cau = chuoi(r.cau_giao);
      const sig = JSON.stringify(Object.keys(than).sort().map(k => [k, than[k]])); const ms = mocCua(ma);
      let best = -1; let diem = 0;
      conLai.forEach((p, i) => { const d = khopHang(p, { ma, cau }); if (d > diem) { diem = d; best = i; } });
      const p = best >= 0 ? conLai.splice(best, 1)[0] : null;
      nay.push({ ma, cau, sig, ms, cham: !p || p.sig !== sig || p.ms !== ms ? { ngay, sha } : p.cham });
    }
    truoc = nay;
  }
  for (const p of truoc) if (p.ma) theoMa.set(p.ma, p.cham);
  return { cut, theoMa, ...(soCommit && !docDuoc ? { hong: 'không đọc được phiên bản nào trong lịch sử git' } : {}) };
}
const soNgay = (tu, den) => Math.round((Date.UTC(+den.slice(0, 4), +den.slice(5, 7) - 1, +den.slice(8, 10)) - Date.UTC(+tu.slice(0, 4), +tu.slice(5, 7) - 1, +tu.slice(8, 10))) / 864e5);
// `cacTep` = phanTichKho(...).cacTep. Trả mỗi lộ trình { tep, ten, de_xuat, lich_su_cut? } theo thứ tự hàng trong tệp.
export function raSoat({ root, cacTep, sections, today }) {
  const TEN = Object.fromEntries(sections || []);
  const daGiao = new Set(DA_GIAO_O.map(k => TEN[k]));
  const chuaLam = new Set([CHUA_MO, ...CHUA_LAM_O.map(k => TEN[k])]);
  return cacTep.map(t => {
    if (!t.kq) return { tep: t.tep, ten: null, de_xuat: [], loi: t.loi || 'không đọc được' };
    const kq = t.kq; const out = []; const keTiep = [];
    const mocCD = kq.moc.filter(MOC_CHIEN_DICH);
    const qua = mocCD.filter(m => NGAY_RE.test(chuoi(m.ngay)) && chuoi(m.ngay) < today);
    const trongCD = new Set(mocCD.flatMap(ganMoc));
    for (const d of kq.dong) {
      const ma = String(d._nhan);
      if (d.chu === KHONG_SUY) continue;
      const da = daGiao.has(d.chu);
      const g = { ma, cau_giao: chuoi(d.cau_giao) };
      if (d.chu === TEN['xep-lai']) { out.push({ ...g, de_xuat: 'cho-dieu-kien', luat: 'xep-lai', can_cu: d.coHoSo ? { nguon: 'ho-so', ho_so: d.hoSo } : { nguon: 'tu-khai', chu: d.tuKhai } }); continue; }
      if (d.chu === TEN['da-bac'] && d.coHoSo) { out.push({ ...g, de_xuat: 'bac', luat: 'ho-so-bac', can_cu: { ho_so: d.hoSo, o: d.chu } }); continue; }
      // Hồ sơ nào khác (đang mở, hỏng, đã giao) — không đụng: hàng có hồ sơ đang mở đã hiện ở dòng «Hàng trễ».
      if (d.coHoSo) continue;
      const m = !da && chuaLam.has(d.chu) ? qua.find(x => ganMoc(x).includes(ma)) : null;
      if (m) { out.push({ ...g, de_xuat: 'doi-moc', luat: 'moc-qua-ngay', can_cu: { moc: tenMocTran(m), ngay: chuoi(m.ngay) } }); continue; }
      // «Kế tiếp» = việc CHƯA BẮT ĐẦU (chưa mở · cân nhắc · sắp mở) — hàng tự khai bác/đang làm/ngoài phạm vi không đếm.
      if (!trongCD.has(ma) && chuaLam.has(d.chu)) keTiep.push(g);
    }
    const cs = kq.chinhSach; let cut = false; const canh = [];
    if (cs && keTiep.length) {
      const th = tuoiHang(root, t.tep); cut = th.cut;
      if (th.hong) canh.push(`${CANH_TUOI} (${th.hong})`);
      const conLai = [];
      for (const g of keTiep) {
        const ch = th.theoMa.get(g.ma) || null; const tuoi = ch ? soNgay(ch.ngay, today) : null;
        if (cs.tuoi_ngay != null && tuoi != null && tuoi >= cs.tuoi_ngay) out.push({ ...g, de_xuat: 'cho-dieu-kien', luat: 'tuoi', can_cu: { tuoi, cham_cuoi: ch } });
        else conLai.push({ g, tuoi });
      }
      if (cs.tran_ke_tiep != null && conLai.length > cs.tran_ke_tiep) {
        const thu = new Map(keTiep.map((g, i) => [g.ma, i]));
        conLai.sort((a, b) => (b.tuoi ?? -1) - (a.tuoi ?? -1) || thu.get(a.g.ma) - thu.get(b.g.ma));
        for (const { g } of conLai.slice(0, conLai.length - cs.tran_ke_tiep)) out.push({ ...g, de_xuat: 'cho-dieu-kien', luat: 'tran', can_cu: { k: keTiep.length, tran: cs.tran_ke_tiep } });
      }
    }
    if (cut) canh.push(CANH_CUT);
    const thuTu = new Map(kq.dong.map((d, i) => [String(d._nhan), i]));
    out.sort((a, b) => thuTu.get(a.ma) - thuTu.get(b.ma));
    return { tep: t.tep, ten: kq.ten || null, de_xuat: out, ...(cut ? { lich_su_cut: true } : {}), ...(canh.length ? { canh_bao: canh } : {}) };
  });
}

// Mã thoát là HỢP ĐỒNG với bảng S0-MO-O-THOAT của SKILL feature-loop: 0 = hàng (JSON) · 1 = không
// phải hàng (kho chưa khai, không có mã) · 2 = lỗi dùng/ghi · 3 = mã ở nhiều lộ trình.
const isMain = (() => {
  if (!process.argv[1]) return false;
  try { return realpathSync(process.argv[1]) === realpathSync(__filename); } catch { return path.resolve(process.argv[1]) === __filename; }
})();
if (isMain) {
  const a = process.argv.slice(2);
  const bail = m => { process.stderr.write(`lo-trinh: ${m}\n`); process.exit(2); };
  const thoat = (c, m) => { process.stderr.write(`lo-trinh: ${m}\n`); process.exit(c); };
  let root = '.'; let ref = null; let moO = false; let slugMoi = null; let owner = ''; let raSoatCo = false; let jsonCo = false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--mo-o') { moO = true; continue; }
    if (a[i] === '--ra-soat') { raSoatCo = true; continue; }
    if (a[i] === '--json') { jsonCo = true; continue; }
    if (['--root', '--hang', '--slug', '--owner'].includes(a[i])) {
      const v = a[i + 1];
      // `--owner` nhận chuỗi rỗng: máy không khai email git vẫn mở được việc (Ngoài-9).
      if (v == null || (v === '' && a[i] !== '--owner') || v.startsWith('--')) bail(`${a[i]} cần một giá trị ngay sau nó`);
      if (a[i] === '--root') root = v; else if (a[i] === '--hang') ref = v; else if (a[i] === '--slug') slugMoi = v; else owner = v;
      i++;
    } else bail(`tham số lạ ${a[i]} — chỉ nhận --root <thư-mục> (--hang <mã|tệp:mã> [--mo-o [--slug <s>] [--owner <o>]] | --ra-soat [--json])`);
  }
  // Rà soát (hồ sơ ra-soat-lo-trinh): chỉ đọc — 0 = in đề xuất · 1 = kho chưa khai · 2 = lỗi dùng.
  if (raSoatCo) {
    if (ref != null || moO) bail('--ra-soat không đi cùng --hang hay --mo-o');
    const today = process.env.ACCEPTANCE_TODAY || new Date().toISOString().slice(0, 10);
    if (!NGAY_RE.test(today)) bail(`ACCEPTANCE_TODAY phải dạng YYYY-MM-DD (đang là «${today}»)`);
    root = path.resolve(root);
    if (docCacTep(root) == null) thoat(1, `kho chưa khai ${KHOA} trong _acceptance/config.yaml`);
    const PM = await import(pathToFileURL(path.join(__dirname, 'product-map.mjs')).href);
    const kho = phanTichKho({ root, classify: PM.classify, sections: PM.SECTIONS });
    const rs = raSoat({ root, cacTep: kho.cacTep, sections: PM.SECTIONS, today });
    if (jsonCo) process.stdout.write(JSON.stringify(rs) + '\n');
    else {
      const nhieu = rs.length > 1; const tien = t => (nhieu ? `${t.tep}: ` : '');
      const dong = rs.flatMap(t => [...t.de_xuat.map(m => tien(t) + dongRaSoat(m)), ...(t.canh_bao || []).map(c => `${tien(t)}  ! ${c}`)]);
      if (dong.length) process.stdout.write(dong.join('\n') + '\n');
    }
    // Tệp không đọc được: một dòng có tên tệp ra stderr, thoát 1 — không bao giờ trông như «không có đề xuất».
    for (const t of rs) if (t.loi) process.stderr.write(`lo-trinh: không đọc được tệp ý định — ${t.tep}: ${t.loi}\n`);
    process.exit(rs.some(t => t.loi) ? 1 : 0);
  }
  if (jsonCo) bail('--json chỉ đi với --ra-soat');
  if (ref == null) bail('thiếu --hang <mã>');
  root = path.resolve(root);
  const khai = docCacTep(root);
  if (khai == null) thoat(1, `kho chưa khai ${KHOA} trong _acceptance/config.yaml`);
  const hai = ref.lastIndexOf(':');
  const tepChon = hai > 0 ? ref.slice(0, hai) : null; const ma = hai > 0 ? ref.slice(hai + 1) : ref;
  if (tepChon != null && !khai.tep.includes(tepChon)) thoat(1, `kho không khai lộ trình ${tepChon}`);
  const thay = []; const loiTep = [];
  for (const tep of tepChon != null ? [tepChon] : khai.tep) {
    const { loi, data } = docTep(root, tep);
    if (loi) { loiTep.push(loi); continue; }
    const k = kiemKhuon(data); const cung = k.hang.filter(h => h._ma === ma);
    // Mã trùng TRONG một tệp: kit không chọn hộ hàng nào (Ngoài-7) — tra hay mở đều dừng.
    if (cung.length > 1) thoat(3, `mã ${ma} trùng trong ${tep} — sửa tệp ý định cho mỗi hàng một mã`);
    if (cung.length) thay.push({ tep, r: cung[0], k });
  }
  if (thay.length > 1) thoat(3, `mã ${ma} có ở nhiều lộ trình: ${thay.map(t => t.tep).join(', ')} — gọi ${thay.map(t => `${t.tep}:${ma}`).join(' hoặc ')}`);
  if (!thay.length) thoat(1, loiTep.length ? loiTep[0] : `không có hàng ${ma} trong ${(tepChon != null ? [tepChon] : khai.tep).join(', ')}`);
  const { tep, r, k } = thay[0];
  const { _nhan, _ma, _cauGiaoGoc, ...hang } = r;
  // moc-la-chien-dich: «kho dùng mốc» đọc mọi tệp khai (cấp kho, như cờ của bộ vẽ); tên phiên/nhóm cùng một hàm.
  const khoDungMoc = khai.tep.some(t => { const x = docTep(root, t); return !x.loi && kiemKhuon(x.data).moc.length > 0; });
  const ten = () => tenChienDich({ hang: { ...hang, cau_giao: r.cau_giao }, moc: k.moc, loTrinh: docTep(root, tep).data, tep, nhieuLoTrinh: khai.tep.length > 1, kho: tenKho(root) });
  // Lối đọc một hàng in DỮ LIỆU của tệp kế hoạch nguyên văn (câu giao như kho viết); chỉ chỗ in tiêu đề bỏ «».
  if (!moO) { process.stdout.write(JSON.stringify(_cauGiaoGoc !== undefined ? { ...hang, cau_giao: _cauGiaoGoc } : hang) + '\n'); process.exit(0); }
  // «Hàng đã có hồ sơ chưa» đọc từ CÙNG hàm của bộ vẽ — hai bên không thể nói khác nhau.
  const PM = await import(pathToFileURL(path.join(__dirname, 'product-map.mjs')).href);
  const kho = phanTichKho({ root, classify: PM.classify, sections: PM.SECTIONS });
  const d = kho.cacTep.find(t => t.tep === tep)?.kq?.dong.find(x => x._ma === ma);
  if (d && d.hoSo) { process.stdout.write(JSON.stringify({ hoSo: d.hoSo, moi: false, ...ten() }) + '\n'); process.exit(0); }
  if (d && d.nhieuNhan.length) bail(`hàng ${ma} được nhiều hồ sơ nhận: ${d.nhieuNhan.join(', ')} — không mở thêm hồ sơ; sửa lo_trinh_ma của các hồ sơ đó`);
  const slug = slugMoi || chuoi(hang.slug) || suySlug(hang.cau_giao);
  if (!slug || !SLUG_RE.test(slug)) bail(`slug không hợp lệ: «${slug}» — truyền --slug`);
  const dich = path.join(root, '_acceptance', slug);
  if (existsSync(dich)) bail(`thư mục đã có: ${path.join('_acceptance', slug)} — không ghi`);
  let khuon;
  try { khuon = readFileSync(KHUON_OPP, 'utf8'); } catch { bail(`không đọc được khuôn ô cơ hội: ${KHUON_OPP}`); }
  let noiDung;
  try { noiDung = dungCoHoi({ khuon, hang, tep, tenLoTrinh: k.ten, slug, owner, moc: k.moc, khoDungMoc }); } catch (e) { bail(e.message); }
  mkdirSync(dich, { recursive: true });
  writeFileSync(path.join(dich, 'opportunity.md'), noiDung);
  process.stdout.write(JSON.stringify({ hoSo: slug, moi: true, ...ten() }) + '\n');
}
