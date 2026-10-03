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
// thứ chỉ thẻ start in.
import { readFileSync, readdirSync, existsSync, statSync, realpathSync, mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { frontmatterField } = require(path.join(__dirname, '..', 'lib', 'evidence-core.cjs'));

const { KHOA: KHOA_, khoaTuConfig: khoaTuConfig_, cacTepTuConfig } = require(path.join(__dirname, 'lo-trinh-khoa.cjs'));
export const KHOA = KHOA_;
export const TEP_TRANG = 'LO-TRINH.html';
export const CHUA_MO = 'Chưa mở';
export const KHONG_SUY = 'Không suy được';
export const TIN_THEO_LOI = 'tin theo lời';
// Ô bản đồ nào là «đã giao» và «chưa làm» — tra bằng KHOÁ ô, chữ rút từ SECTIONS của bản đồ.
export const DA_GIAO_O = ['cho-nghiem-thu', 'da-ship', 'da-nghiem-thu'];
export const DANG_LAM_O = ['cho-duyet', 'dang-dung'];
export const CHUA_LAM_O = ['can-nhac', 'sap-mo'];
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
    if (ma) { if (daThay.has(ma) && !trung.includes(ma)) trung.push(ma); daThay.add(ma); }
    hang.push({ ...r, _nhan: nhan, _ma: ma });
  });
  for (const m of trung) co.push(`mã trùng: ${m}`);
  const moc = (Array.isArray(data.moc) ? data.moc : []).filter(m => m && typeof m === 'object');
  for (const m of moc) if (m.hang !== undefined && !Array.isArray(m.hang)) co.push(`mốc ${chuoi(m.ten) || chuoi(m.ngay) || '?'}: hang phải là một mảng`);
  const daBac = (Array.isArray(data.da_bac) ? data.da_bac : []).filter(m => m && typeof m === 'object');
  // Từ vựng tự khai của KHO: chữ riêng của kho → tên trạng thái của kit. Kho khai, kit chỉ đọc.
  const tuVung = {};
  if (data.tu_vung !== undefined) {
    if (data.tu_vung == null || typeof data.tu_vung !== 'object' || Array.isArray(data.tu_vung)) co.push('khối tu_vung phải là một object');
    else for (const [k, v] of Object.entries(data.tu_vung)) tuVung[so(k)] = chuoi(v);
  }
  return { ten: chuoi(data.ten), hang, moc, daBac, tuVung, co };
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
    return { ...r, slug: slug || undefined, hoSo, nhieuNhan: hoSo ? [] : nguoiNhanCua(r), chu, tinTheoLoi, coHoSo, tuKhai: tuKhai || null, khaiNgoai: !!(tuKhai && !khaiChuan), coHang };
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
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const CSS = `:root{--bg:#fbfaf7;--fg:#1d1d1b;--mu:#6b6862;--ln:#e3e0d8;--ac:#2f5d8a;--wa:#8a5a00;--wabg:#fff4dc;--ok:#2e6b3a}
@media (prefers-color-scheme:dark){:root{--bg:#171715;--fg:#ecebe6;--mu:#a19e96;--ln:#34332f;--ac:#8fb6dd;--wa:#f0c36a;--wabg:#33290f;--ok:#8fcf9a}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:1100px;margin:0 auto;padding:24px 16px 48px}h1{font-size:22px;margin:0 0 4px}h2{font-size:16px;margin:28px 0 8px}
.mu{color:var(--mu)}.tom{display:flex;flex-wrap:wrap;gap:6px 14px;margin:10px 0}.tom span{white-space:nowrap}
table{width:100%;border-collapse:collapse;font-size:14px}th,td{text-align:left;vertical-align:top;padding:6px 8px;border-bottom:1px solid var(--ln)}
th{font-weight:600;color:var(--mu)}.wrap{overflow-x:auto}.chu{font-weight:600}.giao{color:var(--ok)}
.co{background:var(--wabg);color:var(--wa);border-radius:6px;padding:2px 6px;display:inline-block;margin:2px 0;font-size:13px}
.ke{border:1px solid var(--ac);border-radius:8px;padding:10px 14px}ul{margin:4px 0;padding-left:20px}`;

function khung(tieuDe, than) {
  return `<!doctype html>\n<html lang="vi">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>${esc(tieuDe)}</title>\n<style>\n${CSS}\n</style>\n</head>\n<body>\n<main>\n${than}\n</main>\n</body>\n</html>\n`;
}

export function renderLoi(tep, loi) {
  return khung('Lộ trình', `<h1>Lộ trình</h1>\n<p class="mu">Vẽ từ tệp ý định <code>${esc(tep)}</code> và hồ sơ trong <code>_acceptance/</code> — đừng sửa tay.</p>\n<p class="co">Không đọc được tệp ý định: ${esc(loi)}</p>`);
}

export function renderTrang(kq, tep) {
  const ten = kq.ten || 'Lộ trình';
  const P = [];
  P.push(`<h1>${esc(ten)}</h1>`);
  P.push(`<p class="mu">Vẽ từ tệp ý định <code>${esc(tep)}</code> và hồ sơ trong <code>_acceptance/</code> mỗi lần bản đồ sản phẩm được vẽ lại — đừng sửa tay. Trạng thái lấy từ hồ sơ; hàng không có slug là tin theo lời.</p>`);
  const dem = Object.entries(kq.demTheoO).map(([c, n]) => `<span>${esc(c)}: <b>${n}</b></span>`).join('');
  P.push(`<div class="tom">${dem}<span>Tin theo lời: <b>${kq.tinTheoLoi.n}/${kq.tinTheoLoi.tong}</b></span><span>Hàng sống qua Cổng Đáng: <b>${kq.songQuaCongDang.k}/${kq.songQuaCongDang.n}</b></span></div>`);
  if (kq.tuKhaiNgoai > 0) P.push(`<p class="co">${kq.tuKhaiNgoai} hàng tự khai ngoài từ vựng — không so được với hồ sơ</p>`);
  P.push('<h2>Hàng kế</h2>');
  if (kq.hangKe) {
    const dt = kq.hangKe.dungTren.length
      ? `<p>Đủ điều kiện vì mọi hàng nó đứng trên đã giao: ${kq.hangKe.dungTren.map(x => `${esc(x.ma)} (${esc(x.chu)})`).join(' · ')}</p>`
      : '<p>Đủ điều kiện: không đứng trên hàng nào.</p>';
    P.push(`<div class="ke"><p><b>${esc(kq.hangKe.ma)}</b> — ${esc(kq.hangKe.cauGiao)}</p>${dt}</div>`);
  } else P.push('<p class="mu">Chưa có hàng đủ điều kiện mở.</p>');
  P.push('<h2>Các hàng</h2>');
  const rows = kq.dong.map(d => {
    const chu = `<span class="chu${kq.daGiao.has(d.chu) ? ' giao' : ''}">${esc(d.chu)}</span>${d.tinTheoLoi ? ` <span class="mu">(${TIN_THEO_LOI})</span>` : ''}`;
    const khai = d.khaiNgoai ? `<div class="mu">tự khai: ${esc(d.tuKhai)}</div>` : '';
    const cos = d.coHang.map(c => `<div class="co">${esc(c)}</div>`).join('');
    const dt = (Array.isArray(d.dung_tren) ? d.dung_tren : []).map(chuoi).join(', ');
    return `<tr><td>${esc(d._nhan)}</td><td>${esc(chuoi(d.cau_giao))}${d.slug ? `<div class="mu"><code>${esc(d.slug)}</code></div>` : ''}</td><td>${esc(chuoi(d.hang))}</td><td>${esc(dt)}</td><td>${chu}${khai}${cos}</td><td>${esc(chuoi(d.bat_khi))}</td><td>${esc(chuoi(d.vi_sao))}</td></tr>`;
  });
  P.push(`<div class="wrap"><table><thead><tr><th>Mã</th><th>Câu giao</th><th>Hạng</th><th>Đứng trên</th><th>Trạng thái</th><th>Bật khi</th><th>Vì sao</th></tr></thead><tbody>\n${rows.join('\n')}\n</tbody></table></div>`);
  P.push('<h2>Mốc</h2>');
  P.push(kq.moc.length
    ? `<ul>${kq.moc.map(m => `<li>${esc(chuoi(m.ngay))} · ${esc(chuoi(m.ten))}${chuoi(m.loai) ? ` · ${esc(chuoi(m.loai))}` : ''}${Array.isArray(m.hang) && m.hang.length ? ` · hàng ${esc(m.hang.map(chuoi).join(', '))}` : ''}</li>`).join('')}</ul>`
    : '<p class="mu">Không có mốc.</p>');
  const mk = mocKhongHang(kq);
  if (mk.k > 0) P.push(`<p class="mu">${mk.k} mốc không gắn hàng nào — không tính trễ được.</p>`);
  P.push('<h2>Đã bác</h2>');
  P.push(kq.daBac.length
    ? `<ul>${kq.daBac.map(b => `<li>${esc(chuoi(b.ma))} — ${esc(chuoi(b.ly_do))}</li>`).join('')}</ul>`
    : '<p class="mu">Không có mục đã bác.</p>');
  P.push('<h2>Vòng ngoài lộ trình</h2>');
  P.push(kq.ngoaiLoTrinh.length
    ? `<p>${kq.ngoaiLoTrinh.length} hồ sơ không hàng nào trỏ tới — hợp lệ (sửa lỗi, sự cố, việc ship thẳng):</p><ul>${kq.ngoaiLoTrinh.map(s => `<li><code>${esc(s)}</code></li>`).join('')}</ul>`
    : '<p class="mu">Không có.</p>');
  P.push('<h2>Cờ</h2>');
  P.push(kq.co.length ? `<ul>${kq.co.map(c => `<li class="co">${esc(c)}</li>`).join('')}</ul>` : '<p class="mu">Không có cờ.</p>');
  return khung(ten, P.join('\n'));
}

// Nhiều lộ trình: một trang, mỗi lộ trình một mục theo thứ tự khai, mỗi mục là đúng thân của trang
// đơn với tiêu đề hạ một bậc. Kho một tệp KHÔNG đi đường này — trang giữ từng byte bản lát 1.
const haBac = html => html.replace(/<(\/?)h([1-5])>/g, (m, g, n) => `<${g}h${Number(n) + 1}>`);
const thanCua = html => html.slice(html.indexOf('<main>\n') + 7, html.lastIndexOf('\n</main>'));
export function renderNhieu(cacTep) {
  const P = ['<h1>Lộ trình</h1>'];
  P.push(`<p class="mu">Kho khai ${cacTep.length} lộ trình; mỗi mục vẽ từ một tệp ý định và hồ sơ trong <code>_acceptance/</code> — đừng sửa tay.</p>`);
  P.push(`<ul>${cacTep.map((t, i) => `<li><a href="#lt-${i + 1}">${esc((t.kq && t.kq.ten) || t.tep)}</a></li>`).join('')}</ul>`);
  cacTep.forEach((t, i) => {
    const html = t.loi ? renderLoi(t.tep, t.loi) : renderTrang(t.kq, t.tep);
    P.push(`<section class="lt" id="lt-${i + 1}">\n${haBac(thanCua(html))}\n</section>`);
  });
  return khung('Lộ trình', P.join('\n'));
}

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
  if (k.cacTep.length > 1) return renderNhieu(k.cacTep);
  const p = k.cacTep[0];
  return p.loi ? renderLoi(p.tep, p.loi) : renderTrang(p.kq, p.tep);
}
// Thẻ start: dữ liệu từng lộ trình (`ds`) và CÁC DÒNG THẺ dựng sẵn (`dong`) — thân /start in nguyên,
// không tự soạn (kit render, không soạn; phép đo đo đầu ra thay vì đo chữ chỉ dẫn).
export function loTrinhThe({ root, classify, sections, today, banDoBat = null, lenhVe = null }) {
  const k = phanTichKho({ root, classify, sections });
  if (k == null) return null;
  const nhieu = k.cacTep.length > 1;
  const ds = k.cacTep.map(p => {
    if (p.loi) return { tep: p.tep, ten: null, loi: p.loi, hangKe: null, hangTre: [], mocKhongHang: { k: 0, n: 0 }, tinTheoLoi: { n: 0, tong: 0 }, tuKhaiNgoai: 0, co: [] };
    const kq = p.kq;
    return {
      tep: p.tep, ten: kq.ten || null, loi: null,
      hangKe: kq.hangKe ? { ma: kq.hangKe.ma, cauGiao: kq.hangKe.cauGiao, thamSo: kq.hangKeMaDon ? (nhieu ? `${p.tep}:${kq.hangKe.ma}` : kq.hangKe.ma) : null } : null,
      hangTre: hangTre(kq, today), mocKhongHang: mocKhongHang(kq), tinTheoLoi: kq.tinTheoLoi, tuKhaiNgoai: kq.tuKhaiNgoai, co: kq.co,
    };
  });
  const dong = [];
  for (const t of ds) {
    if (nhieu) dong.push(`Lộ trình ${t.ten || t.tep}:`);
    if (t.loi) { dong.push(`${nhieu ? 'K' : 'Lộ trình: k'}hông đọc được tệp ý định — ${t.loi}`); continue; }
    dong.push(t.hangKe ? `Hàng kế: ${t.hangKe.ma} — ${t.hangKe.cauGiao}` : 'Hàng kế: chưa có hàng đủ điều kiện mở');
    const tre = t.hangTre.length ? `Hàng trễ: ${t.hangTre.map(h => `${h.ma} (mốc ${h.moc}, ${h.ngay})`).join(' · ')}` : 'Hàng trễ: không có';
    dong.push(t.mocKhongHang.k > 0 ? `${tre} (${t.mocKhongHang.k}/${t.mocKhongHang.n} mốc không gắn hàng nào)` : tre);
    dong.push(`Tin theo lời: ${t.tinTheoLoi.n}/${t.tinTheoLoi.tong} hàng${t.tuKhaiNgoai > 0 ? ` · ${t.tuKhaiNgoai} hàng tự khai ngoài từ vựng — không so được với hồ sơ` : ''}`);
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
export function dungCoHoi({ khuon, hang, tep, tenLoTrinh, slug, owner, moc = [] }) {
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
    `Mở từ hàng ${chuoi(hang.ma)} của «${tenLoTrinh || 'lộ trình'}» (\`${tep}\`).`, '',
    chuoi(hang.cau_giao), ...(chuoi(hang.vi_sao) ? ['', `Vì sao: ${chuoi(hang.vi_sao)}`] : []), '',
    `## ${NG.UAT_THRESHOLD_HEADING}`, '', ...nguong, '',
  ];
  return yaml + than.join('\n');
}

// ── CLI: feature-loop S0 nhận một hàng ────────────────────────────────────────
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
  let root = '.'; let ref = null; let moO = false; let slugMoi = null; let owner = '';
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--mo-o') { moO = true; continue; }
    if (['--root', '--hang', '--slug', '--owner'].includes(a[i])) {
      const v = a[i + 1];
      // `--owner` nhận chuỗi rỗng: máy không khai email git vẫn mở được việc (Ngoài-9).
      if (v == null || (v === '' && a[i] !== '--owner') || v.startsWith('--')) bail(`${a[i]} cần một giá trị ngay sau nó`);
      if (a[i] === '--root') root = v; else if (a[i] === '--hang') ref = v; else if (a[i] === '--slug') slugMoi = v; else owner = v;
      i++;
    } else bail(`tham số lạ ${a[i]} — chỉ nhận --root <thư-mục> --hang <mã|tệp:mã> [--mo-o [--slug <s>] [--owner <o>]]`);
  }
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
  const { _nhan, _ma, ...hang } = r;
  if (!moO) { process.stdout.write(JSON.stringify(hang) + '\n'); process.exit(0); }
  // «Hàng đã có hồ sơ chưa» đọc từ CÙNG hàm của bộ vẽ — hai bên không thể nói khác nhau.
  const PM = await import(pathToFileURL(path.join(__dirname, 'product-map.mjs')).href);
  const kho = phanTichKho({ root, classify: PM.classify, sections: PM.SECTIONS });
  const d = kho.cacTep.find(t => t.tep === tep)?.kq?.dong.find(x => x._ma === ma);
  if (d && d.hoSo) { process.stdout.write(JSON.stringify({ hoSo: d.hoSo, moi: false }) + '\n'); process.exit(0); }
  if (d && d.nhieuNhan.length) bail(`hàng ${ma} được nhiều hồ sơ nhận: ${d.nhieuNhan.join(', ')} — không mở thêm hồ sơ; sửa lo_trinh_ma của các hồ sơ đó`);
  const slug = slugMoi || chuoi(hang.slug) || suySlug(hang.cau_giao);
  if (!slug || !SLUG_RE.test(slug)) bail(`slug không hợp lệ: «${slug}» — truyền --slug`);
  const dich = path.join(root, '_acceptance', slug);
  if (existsSync(dich)) bail(`thư mục đã có: ${path.join('_acceptance', slug)} — không ghi`);
  let khuon;
  try { khuon = readFileSync(KHUON_OPP, 'utf8'); } catch { bail(`không đọc được khuôn ô cơ hội: ${KHUON_OPP}`); }
  let noiDung;
  try { noiDung = dungCoHoi({ khuon, hang, tep, tenLoTrinh: k.ten, slug, owner, moc: k.moc }); } catch (e) { bail(e.message); }
  mkdirSync(dich, { recursive: true });
  writeFileSync(path.join(dich, 'opportunity.md'), noiDung);
  process.stdout.write(JSON.stringify({ hoSo: slug, moi: true }) + '\n');
}
