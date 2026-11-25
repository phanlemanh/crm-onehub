#!/usr/bin/env node
'use strict';
// tro-ly-quyet-dinh.cjs — trợ lý quyết định: mặc-ký có phủ quyết · giữ-quyền · sổ đếm + thăng cấp · kiểm mẫu
// (hồ sơ mac-ky-co-phu-quyet; thí điểm chủ kho duyệt 22/11/2026).
//
// Câu «chỉ-người» ở bước thiết kế mà ĐẢO ĐƯỢC không dừng chờ người nữa: máy đi tiếp theo khuyến nghị, câu vẫn lên thẻ
// Cổng Phạm vi ở dạng «đã đi theo khuyến nghị — phủ quyết trước khi gộp nếu khác ý». Mọi điều kiện đóng-khi-ngờ: món
// không khớp một điều thì vẫn là câu hỏi cho người, kèm lý do có tên.
//
// Bên viết: `--write` nối MỘT dòng máy (`"may":"mac-ky"`) cho mỗi câu chỉ-người chưa có dòng máy — sổ chỉ thêm.
// Bên đọc: scripts/can-cu-s1.cjs (`apSo`) — câu có dòng máy «khuyen» và VẪN đủ điều kiện lúc đọc thì không đếm là câu
// hỏi; loại bị giáng sau khi ghi thì câu về lại câu hỏi (giáng áp cho món chưa gộp). Thẻ Cổng Phạm vi đọc qua bộ xếp ấy.
// Khuôn bên viết của người: khối DEC-TRO-LY-SLOT trong SKILL feature-loop, mục «Sổ quyết định».
//
// Dùng:
//   node tro-ly-quyet-dinh.cjs --root <kho> --slug <hồ sơ> [--write] [--json] [--dot <thư mục đợt>]
//   node tro-ly-quyet-dinh.cjs --root <kho> --slug <hồ sơ> --check        (thoát 2 khi sổ sai lược đồ)
//   node tro-ly-quyet-dinh.cjs --root <kho> --dem [--json] [--dot <thư mục đợt>]
//   node tro-ly-quyet-dinh.cjs --root <kho> --slug <hồ sơ> --ghi phu-quyet --ve <mã S1> --nguoi <tên> --lua-chon '<câu>' [--pham-vi lan-nay|tu-nay]
//   node tro-ly-quyet-dinh.cjs --root <kho> --slug <hồ sơ> --ghi kiem-mau --ket dat|sai --nguoi <tên> [--ve <mã S1>] [--lua-chon '<câu>']
//   node tro-ly-quyet-dinh.cjs --root <kho> --slug <hồ sơ> --ghi lam-lai --nguon phu-quyet|bo-kiem|khac --lua-chon '<câu>' [--ve <mã S1>] [--stage S4-r<N>]
//   Thêm --base <gốc nhánh> khi xếp: tệp thật của vòng phải nằm trong vùng đã khai của câu (không thì «vung-lech»).
// Thoát: 0 ổn · 2 khoá cấu hình sai giá trị hay sổ sai lược đồ · 3 dùng sai lệnh / không đọc được hồ sơ.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const core = require(path.join(__dirname, '..', 'lib', 'evidence-core.cjs'));

// ── Lược đồ sổ (phiên bản 2) ─────────────────────────────────────────────────────────────────────────────
// Dòng mang một trong các khoá mới phải mang "so_do":2. Dòng không có khoá mới là phiên bản 1, đọc như cũ.
const SO_DO = 2;
const DI_THEO = ['khuyen', 'cho-nguoi'];          // dòng máy: đã đi theo khuyến nghị, hay để chờ người
const PHAM_VI = ['lan-nay', 'tu-nay'];            // câu trả lời của người ở cổng: chỉ lần này, hay thành án lệ
const NGUON_LAM_LAI = ['phu-quyet', 'bo-kiem', 'khac']; // dòng fix: làm lại vì đâu — chỉ «phu-quyet» chặn thăng cấp
const KIEM_MAU = ['dat', 'sai'];
const KHOA_MOI = { di_theo: DI_THEO, pham_vi: PHAM_VI, nguon_lam_lai: NGUON_LAM_LAI, kiem_mau: KIEM_MAU };
const DAU_MAY = 'mac-ky';

// ── Danh mục loại câu — ĐÓNG, do kit định nghĩa. Kho chỉ được thu hẹp (`loai_tat`), không mở rộng. ─────────
// Câu không mang mã nào ở đây = loại lạ = hỏi người.
const LOAI_CAU = {
  'sua-o-dau': 'chọn tầng hay chỗ sửa (vật của kho hay kit, thư viện hay lệnh)',
  'cat-pham-vi': 'tách tiêu chí, dời sang vòng kế hay hạt giống',
  'chon-cach-lam': 'chọn giữa các cách làm cùng kết quả',
  'ten-va-chu': 'tên, chữ trên thẻ, thông điệp',
  'nguong-so': 'giá trị ngưỡng hay mặc định bằng số',
  'giu-duong-cu': 'giữ hay bỏ đường đọc-cũ, hành vi cũ',
  'thu-tu-lam': 'thứ tự làm hay thứ tự gộp',
};

const LY_DO = {
  'tat': 'mặc-ký tắt ở kho (tro_ly_quyet_dinh.mac_ky)',
  'kho-dao': 'món khó đảo — luôn hỏi người',
  'luat-san-pham': 'chạm luật sản phẩm bất khả xâm — luôn hỏi người',
  'tien-ra-ngoai': 'chạm tiền hay thứ gửi ra ngoài kho — luôn hỏi người',
  'vung-lech': 'diff thật chạm tệp ngoài vùng đã khai của câu — hỏi người',
  'man-hinh': 'hàng màn hình — cổng màn hình chủ kho phải tự trải nghiệm',
  'loai-hang-khong-ro': 'hợp đồng không khai surfaces — không biết hàng backend hay màn hình',
  'loai-hang-la': 'hợp đồng khai surfaces ngoài danh sách backend của kit — không biết hàng có mặt người hay không',
  'loai-la': 'loại câu không có trong danh mục của kit',
  'loai-tat': 'kho đã tắt mặc-ký cho loại câu này (tro_ly_quyet_dinh.loai_tat)',
  'giu-quyen': 'chủ kho giữ quyền (giu-quyen.txt của đợt)',
  'vung-khong-ro': 'không biết vùng mã của hàng — không xét được danh sách không-bao-giờ-tự',
  'vung-high': 'vùng tầng high của luật tự trị (governance/autonomy.yaml)',
  'khong-bao-gio': 'vùng trong danh sách không-bao-giờ-tự của kho (tro_ly_quyet_dinh.khong_bao_gio)',
  'lan-dau-loai': 'lần đầu của loại câu này — khởi động lạnh, hỏi người',
  'lan-dau-vung': 'lần đầu của vùng này — khởi động lạnh, hỏi người',
  'loai-bi-giang': 'loại câu vừa bị giáng (phủ quyết, kiểm mẫu sai hay làm lại do phủ quyết) — hỏi người tới khi có lần trả lời mới',
};

const KHOA = 'tro_ly_quyet_dinh';
const MAC_DINH = { mac_ky: false, nguong_hoi: 5, nguong_theo: 100, nguong_lam_lai: 0, kiem_mau_moi: 5, loai_tat: [], khong_bao_gio: [], thang_cap: [], nguoi_quyet: '' };
const MAN_HINH = new Set(['ui', 'web', 'web-ui', 'mobile']);
// Danh sách CHO PHÉP (đóng-khi-ngờ): hàng là backend chỉ khi MỌI surfaces nằm ở đây. Giá trị lạ (frontend, desktop, email…)
// = hỏi người — không suy «không phải màn hình thì là backend».
const BACKEND = new Set(['api', 'cli', 'sdk', 'docs', 'ci', 'config', 'db', 'tool']);
// Hồ sơ «chưa gộp» = còn ở một trạng thái mở của vòng — tập dương, không rẽ theo chữ ký (lưới RT13 của ra-co-ten-lam-va-trao).
const CON_MO = new Set(['draft', 'approved', 'implemented', 'verified']);
const TEP_GIU_QUYEN = 'giu-quyen.txt';
const TEN_LIEN_KET = 'dieu-phoi-hien-tai'; // cùng chuỗi với feature-loop/scripts/trong-dot.mjs

const chuoi = v => (typeof v === 'string' ? v.trim() : '');
const loiKhoa = (k, v, can) => { const e = new Error(`${KHOA}.${k}: «${v}» không hợp lệ — ${can}`); e.ma = 2; return e; };

// ── Cấu hình kho ─────────────────────────────────────────────────────────────────────────────────────────
function docCfg(root) {
  let t = null;
  try { t = fs.readFileSync(path.join(root, '_acceptance', 'config.yaml'), 'utf8'); } catch (_) { t = null; }
  const cfg = Object.assign({}, MAC_DINH, { loai_tat: [], khong_bao_gio: [], thang_cap: [] });
  if (t == null) return cfg;
  const k = n => core.resolveConfigKey(t, `${KHOA}.${n}`);
  const l = n => core.resolveConfigList(t, `${KHOA}.${n}`).map(x => chuoi(String(x))).filter(Boolean);
  const v = k('mac_ky');
  if (v != null) {
    const s = String(v).trim().toLowerCase();
    if (s !== 'true' && s !== 'false') throw loiKhoa('mac_ky', v, 'dùng true | false');
    cfg.mac_ky = s === 'true';
  }
  const so = (n, min, max, can) => {
    const x = k(n); if (x == null) return;
    const s = String(x).trim();
    if (!/^\d+$/.test(s) || Number(s) < min || (max != null && Number(s) > max)) throw loiKhoa(n, s, can);
    cfg[n] = Number(s);
  };
  so('nguong_hoi', 1, null, 'dùng số nguyên dương');
  so('nguong_theo', 0, 100, 'dùng số nguyên 0–100 (phần trăm)');
  so('nguong_lam_lai', 0, null, 'dùng số nguyên không âm');
  so('kiem_mau_moi', 1, null, 'dùng số nguyên dương (1 = soi mọi hồ sơ)');
  for (const n of ['loai_tat', 'thang_cap']) {
    cfg[n] = l(n);
    for (const x of cfg[n]) if (!LOAI_CAU[x]) throw loiKhoa(n, x, `dùng mã trong danh mục: ${Object.keys(LOAI_CAU).join(', ')}`);
  }
  cfg.khong_bao_gio = l('khong_bao_gio');
  const nq = k('nguoi_quyet'); if (nq != null) cfg.nguoi_quyet = core.unquoteScalar(String(nq));
  return cfg;
}

// ── Đợt: thư mục, tệp giữ-quyền, ranh giới hàng ──────────────────────────────────────────────────────────
function thuMucDot(root, dot) {
  if (dot) return dot;
  const r = spawnSync('git', ['-C', root, 'rev-parse', '--path-format=absolute', '--git-common-dir'], { encoding: 'utf8' });
  if (r.status !== 0) return null;
  try { return fs.realpathSync(path.join(path.dirname(r.stdout.trim()), '.acceptance-runs', TEN_LIEN_KET)); } catch (_) { return null; }
}
function docGiuQuyen(dot) {
  if (!dot) return [];
  let t = ''; try { t = fs.readFileSync(path.join(dot, TEP_GIU_QUYEN), 'utf8'); } catch (_) { return []; }
  return t.split('\n').map(x => x.replace(/#.*$/, '').trim()).filter(Boolean);
}
function ranhGioiDot(dot, slug) {
  if (!dot) return [];
  try {
    const j = JSON.parse(fs.readFileSync(path.join(dot, 'hang-viec.json'), 'utf8'));
    const h = (Array.isArray(j.hang) ? j.hang : []).find(x => x && x.slug === slug);
    return (h && Array.isArray(h.ranh_gioi) ? h.ranh_gioi : []).filter(g => typeof g === 'string' && !g.startsWith('_acceptance/'));
  } catch (_) { return []; }
}

// ── Vùng: so hai glob bằng tiền tố chữ + thử khớp — dư về phía an toàn (khớp nhiều hơn = hỏi nhiều hơn). ─────
const tienTo = g => { const i = String(g).search(/[*?[{]/); return (i < 0 ? String(g) : String(g).slice(0, i)); };
function chongVung(a, b) {
  const pa = tienTo(a), pb = tienTo(b);
  if (!pa || !pb) {
    // Glob không có tiền tố chữ («**/migrations/**»): thử khớp nó trên đầu dò của bên kia; bên kia cũng trống → coi là chồng.
    const [rong, kia] = !pa ? [a, pb] : [b, pa];
    if (!kia) return true;
    const re = core.pathGlobToRe(rong); const p = kia.replace(/\/+$/, '');
    return re.test(p) || re.test(p + '/x');
  }
  return pa.startsWith(pb) || pb.startsWith(pa);
}
const chongBatKy = (vung, globs) => { for (const v of vung) for (const g of globs) if (chongVung(v, g)) return g; return null; };
function vungHigh(root) {
  let t; try { t = fs.readFileSync(path.join(root, 'governance', 'autonomy.yaml'), 'utf8'); } catch (_) { return null; }
  return core.resolveConfigList(t, 'high').map(x => chuoi(String(x))).filter(Boolean);
}

// ── Đọc hồ sơ ────────────────────────────────────────────────────────────────────────────────────────────
function docSo(text) {
  const entries = [];
  for (const line of String(text || '').split('\n')) {
    if (!line.trim()) continue;
    try { const e = JSON.parse(line); if (e && typeof e === 'object' && !Array.isArray(e)) entries.push(e); } catch (_) { /* dòng hỏng: bộ đọc khác đếm */ }
  }
  return entries;
}
function frontmatter(t) {
  const m = String(t || '').match(/^---\r?\n([\s\S]*?)\r?\n---/); const o = {};
  if (m) for (const l of m[1].split('\n')) { const mm = l.match(/^(\w+)\s*:\s*(.*)$/); if (mm) o[mm[1]] = mm[2].replace(/\s+#.*$/, '').trim(); }
  return o;
}
function docHoSo(root, slug, entriesSan) {
  const dir = path.join(root, '_acceptance', slug);
  let ct = ''; try { ct = fs.readFileSync(path.join(dir, 'contract.md'), 'utf8'); } catch (_) { ct = ''; }
  const fm = frontmatter(ct);
  let entries = entriesSan;
  if (!entries) { let t = null; try { t = fs.readFileSync(path.join(dir, 'decisions.jsonl'), 'utf8'); } catch (_) { t = null; } if (t == null) return null; entries = docSo(t); }
  const sf = String(fm.surfaces || '').replace(/^\[|\]$/g, '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
  return { slug, status: chuoi(fm.status).toLowerCase(), surfaces: sf, entries };
}
function danhSachHoSo(root) {
  let ds = []; try { ds = fs.readdirSync(path.join(root, '_acceptance')).filter(n => !n.startsWith('.')).sort(); } catch (_) { return []; }
  return ds.map(s => docHoSo(root, s)).filter(Boolean);
}
const traLoi = hs => !!hs.status && hs.status !== 'draft';

// Câu chỉ-người của MỘT hồ sơ, kèm mọi tín hiệu sổ gắn vào nó. Dòng S1 bị một dòng S1 sau thay thì không tính.
function cauCuaHoSo(hs) {
  const E = hs.entries;
  const viTri = new Map(); E.forEach((e, i) => { if (typeof e.id === 'string' && !viTri.has(e.id)) viTri.set(e.id, i); });
  const thayS1 = new Set(); const nguoiThay = new Map();
  E.forEach((e, j) => {
    if (typeof e.supersedes !== 'string' || !viTri.has(e.supersedes) || viTri.get(e.supersedes) >= j) return;
    if (e.stage === 'S1') thayS1.add(e.supersedes);
    else if (chuoi(e.decided_by)) nguoiThay.set(e.supersedes, e);
  });
  const may = new Map(); const keoVe = new Map();
  E.forEach(e => {
    if (e.may !== DAU_MAY || typeof e.ve !== 'string') return;
    if (!may.has(e.ve)) may.set(e.ve, e);
    if (e.ly_do === 'giu-quyen') keoVe.set(e.ve, (keoVe.get(e.ve) || []).concat(chuoi(e.giu_quyen)));
  });
  const out = [];
  E.forEach((e, i) => {
    if (e.stage !== 'S1' || !e.can_cu || e.can_cu.nguon !== 'chi-nguoi' || thayS1.has(e.id)) return;
    const c = e.can_cu; const id = typeof e.id === 'string' ? e.id : `dong-${i + 1}`;
    const m = may.get(id) || null; const thay = nguoiThay.get(id) || null;
    const vung = [].concat(Array.isArray(c.vung) ? c.vung : [], m && Array.isArray(m.vung) ? m.vung : []).filter(g => typeof g === 'string' && g.trim());
    out.push({ slug: hs.slug, id, e, at: chuoi(e.at), loai: LOAI_CAU[c.loai_cau] ? c.loai_cau : null, may: m, khac: !!thay, thay,
      mac_ky_ghi: !!m && m.di_theo === 'khuyen', keo: (keoVe.get(id) || []).length, keo_khop: keoVe.get(id) || [], vung: [...new Set(vung)], tu_nay: false, kiem_sai: 0, kiem_dat: 0,
      lam_lai: { 'phu-quyet': 0, 'bo-kiem': 0, khac: 0 }, su_kien: [] });
  });
  const theoId = new Map(out.map(o => [o.id, o]));
  const lamLaiRoi = { 'phu-quyet': 0, 'bo-kiem': 0, khac: 0 };
  for (const e of E) {
    if (e.pham_vi === 'tu-nay') { const o = theoId.get(e.supersedes) || theoId.get(e.ve); if (o) o.tu_nay = true; }
    if (NGUON_LAM_LAI.includes(e.nguon_lam_lai)) {
      const o = theoId.get(e.ve);
      if (o) { o.lam_lai[e.nguon_lam_lai]++; if (e.nguon_lam_lai === 'phu-quyet') o.su_kien.push(chuoi(e.at) || o.at); } else lamLaiRoi[e.nguon_lam_lai]++;
    }
    if (KIEM_MAU.includes(e.kiem_mau)) {
      const ds = typeof e.ve === 'string' ? [theoId.get(e.ve)].filter(Boolean) : out.filter(o => o.mac_ky_ghi);
      for (const o of ds) { if (e.kiem_mau === 'sai') { o.kiem_sai++; o.su_kien.push(chuoi(e.at) || o.at); } else o.kiem_dat++; }
    }
  }
  for (const o of out) if (o.khac && o.mac_ky_ghi) o.su_kien.push(chuoi(o.thay.at) || o.at); // phủ quyết một món mặc-ký
  // Lần NGƯỜI THẬT trả lời: câu hỏi thường đã qua cổng, món mặc-ký bị người quyết lại, hay món mặc-ký người đã soi kiểm
  // mẫu. Món mặc-ký người im lặng KHÔNG phải một lần trả lời — không vào điều kiện thăng cấp (cột «im» riêng).
  for (const o of out) o.nguoi = !(o.mac_ky_ghi && !o.khac && o.kiem_dat === 0 && o.kiem_sai === 0);
  return { cau: out, lamLaiRoi };
}

// ── Thống kê theo loại (đọc mọi hồ sơ) ───────────────────────────────────────────────────────────────────
// Cửa sổ = các lần trả lời SAU sự kiện giáng gần nhất (phủ quyết món mặc-ký · kiểm mẫu sai · làm lại do phủ quyết).
// Trong cửa sổ: số hỏi, % theo khuyến nghị, số làm lại do phủ quyết, số lần kéo — đủ ngưỡng thì trình thăng cấp.
function thongKe(hsList, cfg, { boSlug = null } = {}) {
  const theoLoai = new Map(Object.keys(LOAI_CAU).map(k => [k, []]));
  const vungDaCo = []; let lamLaiRoi = { 'phu-quyet': 0, 'bo-kiem': 0, khac: 0 }; const keoTheoLoai = new Map();
  for (const hs of hsList) {
    if (hs.slug === boSlug) continue;
    const { cau, lamLaiRoi: r } = cauCuaHoSo(hs);
    for (const k of Object.keys(r)) lamLaiRoi[k] += r[k];
    for (const o of cau) {
      if (o.keo && o.loai) keoTheoLoai.set(o.loai, (keoTheoLoai.get(o.loai) || 0) + o.keo);
      if (!traLoi(hs)) continue;
      vungDaCo.push(...o.vung);
      if (o.loai) theoLoai.get(o.loai).push(Object.assign({ status: hs.status }, o));
    }
  }
  const rows = [];
  for (const [loai, ds] of theoLoai) {
    ds.sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
    const suKien = ds.flatMap(o => o.su_kien).sort();
    const moc = suKien.length ? suKien[suKien.length - 1] : null;
    const cs = moc ? ds.filter(o => o.at > moc) : ds;
    const dem = arr => ({ n: arr.length, theo: arr.filter(o => !o.khac).length, lam_lai_pq: arr.reduce((s, o) => s + o.lam_lai['phu-quyet'], 0), keo: arr.filter(o => o.keo).length });
    const tong = dem(ds.filter(o => o.nguoi)); const w = dem(cs.filter(o => o.nguoi)); const im = ds.filter(o => !o.nguoi).length;
    const pct = x => (x.n ? Math.round(100 * x.theo / x.n) : 0);
    const sach = w.n > 0 && pct(w) >= cfg.nguong_theo && w.lam_lai_pq <= cfg.nguong_lam_lai;
    const du = w.n >= cfg.nguong_hoi;
    const daThang = cfg.thang_cap.includes(loai); const tat = cfg.loai_tat.includes(loai);
    const dat = du && sach && w.keo === 0 && !tat;
    const trang_thai = daThang ? (du && sach ? 'đã thăng cấp' : 'bị giáng') : dat ? 'đạt ngưỡng' : 'chưa đủ';
    rows.push({ loai, hoi: tong.n, theo: tong.theo, pct: pct(tong), phu_quyet: ds.filter(o => o.khac && o.mac_ky_ghi).length,
      lam_lai: { 'phu-quyet': ds.reduce((s, o) => s + o.lam_lai['phu-quyet'], 0), 'bo-kiem': ds.reduce((s, o) => s + o.lam_lai['bo-kiem'], 0), khac: ds.reduce((s, o) => s + o.lam_lai.khac, 0) },
      im, keo: keoTheoLoai.get(loai) || 0, kiem_sai: ds.reduce((s, o) => s + o.kiem_sai, 0), tu_nay: ds.filter(o => o.tu_nay).length,
      cua_so: { tu: moc, n: w.n, pct: pct(w), lam_lai_pq: w.lam_lai_pq, keo: w.keo }, co_su_kien: !!moc, trang_thai });
  }
  return { rows, vungDaCo: [...new Set(vungDaCo)], lamLaiRoi };
}

const chonKiemMau = (slug, moi) => parseInt(crypto.createHash('sha256').update(String(slug)).digest('hex').slice(0, 8), 16) % moi === 0;

// ── Xếp các câu chỉ-người của một hồ sơ ──────────────────────────────────────────────────────────────────
// Tệp thật của vòng (khi có gốc nhánh): diff gốc…HEAD trừ hồ sơ của chính vòng và tài liệu. Không có gốc → null (chưa so).
function tepCuaVong(root, slug, base) {
  if (!base) return null;
  const r = spawnSync('git', ['-C', root, 'diff', '--name-only', '--no-renames', `${base}...HEAD`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) return null;
  return r.stdout.split('\n').map(x => x.trim()).filter(Boolean).filter(f => !f.startsWith('_acceptance/') && !f.startsWith('docs/'));
}
function xetHoSo({ root, slug, dot = null, entries = null, cfg = null, base = null }) {
  cfg = cfg || docCfg(root);
  const hs = docHoSo(root, slug, entries);
  if (!hs) return null;
  const { cau } = cauCuaHoSo(hs);
  if (!cfg.mac_ky) return { bat: false, slug, kiem_mau: false, dong: cau.filter(o => !o.khac).map(o => ({ id: o.id, lop: 'hoi', ly_do: 'tat', loai_cau: o.loai, da_ghi: !!o.may, mac_ky_ghi: o.mac_ky_ghi, vung: o.vung })) };
  const dotDir = thuMucDot(root, dot);
  const giu = docGiuQuyen(dotDir); const rg = ranhGioiDot(dotDir, slug);
  const high = vungHigh(root);
  const tepThat = tepCuaVong(root, slug, base);
  const tk = thongKe(danhSachHoSo(root), cfg, { boSlug: slug });
  const row = new Map(tk.rows.map(r => [r.loai, r]));
  const manHinh = hs.surfaces.some(s => MAN_HINH.has(s));
  const backend = hs.surfaces.length > 0 && hs.surfaces.every(s => BACKEND.has(s));
  const dong = [];
  for (const o of cau) {
    if (o.khac) continue; // người đã quyết lại câu này ở cổng
    const c = o.e.can_cu; const vung = [...new Set(o.vung.concat(rg))];
    const raHoi = (ly, them) => Object.assign({ id: o.id, lop: 'hoi', ly_do: ly, loai_cau: o.loai, da_ghi: !!o.may, mac_ky_ghi: o.mac_ky_ghi, vung }, them || {});
    let kq;
    const giuKhop = giu.includes(slug) ? slug : chongBatKy(vung, giu.filter(g => g !== slug && /[/*?]/.test(g)));
    if (c.kho_dao !== false) kq = raHoi('kho-dao');
    else if (typeof c.pham_luat === 'string' && c.pham_luat.trim()) kq = raHoi('luat-san-pham');
    else if (c.tien === true || c.ra_ngoai === true) kq = raHoi('tien-ra-ngoai');
    else if (!hs.surfaces.length) kq = raHoi('loai-hang-khong-ro');
    else if (manHinh) kq = raHoi('man-hinh');
    else if (!backend) kq = raHoi('loai-hang-la', { surfaces: hs.surfaces.filter(x => !BACKEND.has(x)) });
    else if (!o.loai) kq = raHoi('loai-la');
    else if (cfg.loai_tat.includes(o.loai)) kq = raHoi('loai-tat');
    else if (giuKhop) kq = raHoi('giu-quyen', { giu_quyen: giuKhop });
    else if (!vung.length) kq = raHoi('vung-khong-ro');
    else if (high && chongBatKy(vung, high)) kq = raHoi('vung-high', { khop: chongBatKy(vung, high) });
    else if (chongBatKy(vung, cfg.khong_bao_gio)) kq = raHoi('khong-bao-gio', { khop: chongBatKy(vung, cfg.khong_bao_gio) });
    else if (tepThat && tepThat.some(f => !vung.some(v => core.pathGlobToRe(v).test(f)))) kq = raHoi('vung-lech', { tep: tepThat.filter(f => !vung.some(v => core.pathGlobToRe(v).test(f))).slice(0, 5) });
    else if (tepThat && high && tepThat.some(f => high.some(g => core.pathGlobToRe(g).test(f)))) kq = raHoi('vung-high', { khop: high.find(g => tepThat.some(f => core.pathGlobToRe(g).test(f))) });
    else {
      const r = row.get(o.loai);
      if (!r.hoi) kq = raHoi('lan-dau-loai');
      else if (vung.some(v => !tk.vungDaCo.some(p => chongVung(v, p)))) kq = raHoi('lan-dau-vung');
      else if (r.co_su_kien && r.cua_so.n === 0) kq = raHoi('loai-bi-giang');
      else if (cfg.thang_cap.includes(o.loai) && r.trang_thai === 'bị giáng') kq = raHoi('loai-bi-giang');
      else kq = { id: o.id, lop: cfg.thang_cap.includes(o.loai) ? 'thang-cap' : 'mac-ky', loai_cau: o.loai, da_ghi: !!o.may, mac_ky_ghi: o.mac_ky_ghi, vung };
    }
    dong.push(kq);
  }
  const coMacKy = dong.some(d => d.lop !== 'hoi');
  return { bat: true, slug, kiem_mau: coMacKy && chonKiemMau(slug, cfg.kiem_mau_moi), kiem_mau_moi: cfg.kiem_mau_moi, nguoi_quyet: cfg.nguoi_quyet || null, dong };
}

// Bộ đọc cho can-cu-s1.cjs: null khi tắt (thẻ và bộ xếp như trước vòng từng byte). Map id → kết quả, chỉ cho câu đã có
// dòng máy — câu chưa ghi dòng máy vẫn là câu hỏi (máy chưa chạy bước ghi = như cũ).
function apSo(entries, ctx) {
  const cfg = docCfg(ctx.root || '.');
  if (!cfg.mac_ky) return null;
  const x = xetHoSo({ root: ctx.root || '.', slug: ctx.slug, dot: ctx.dot || null, entries, cfg, base: ctx.base || null });
  if (!x) return null;
  return { kiem_mau: x.kiem_mau, kiem_mau_moi: x.kiem_mau_moi, nguoi_quyet: x.nguoi_quyet, dong: new Map(x.dong.map(d => [d.id, d])) };
}

// ── Bên viết ─────────────────────────────────────────────────────────────────────────────────────────────
function ghi({ root, slug, dot = null, base = null, now = new Date() }) {
  const cfg = docCfg(root);
  if (!cfg.mac_ky) return { tat: true, ghi: 0 };
  const L = path.join(root, '_acceptance', slug, 'decisions.jsonl');
  const text = fs.readFileSync(L, 'utf8');
  const x = xetHoSo({ root, slug, dot, cfg, base });
  const hs = docHoSo(root, slug); const theoId = new Map(cauCuaHoSo(hs).cau.map(o => [o.id, o]));
  let n = text.split('\n').filter(l => l !== '').length;
  const utc = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const moi = [];
  for (const d of x.dong) {
    const o = theoId.get(d.id); const c = o.e.can_cu; const theo = d.lop !== 'hoi';
    if (d.da_ghi) {
      // Kéo giữ-quyền SAU khi món đã có dòng máy: một dòng sự kiện riêng (sổ chỉ thêm), mỗi lần kéo một dòng, không lặp.
      if (d.ly_do === 'giu-quyen' && !o.keo_khop.includes(chuoi(d.giu_quyen))) {
        n++;
        moi.push({ id: `d-${utc}-${n}`, type: 'approach', stage: 'gate1', at: now.toISOString(), decision: `Chủ kho giữ quyền: ${chuoi(o.e.decision)}`,
          why: `Vẫn hỏi người — ${LY_DO['giu-quyen']} (dòng «${chuoi(d.giu_quyen)}»).`, cost_if_wrong: chuoi(c.loi_khac) || chuoi(o.e.cost_if_wrong),
          so_do: SO_DO, may: DAU_MAY, ve: d.id, loai_cau: d.loai_cau, di_theo: 'cho-nguoi', ly_do: 'giu-quyen', giu_quyen: d.giu_quyen, su_kien: 'keo' });
      }
      continue;
    }
    n++;
    moi.push(Object.assign({ id: `d-${utc}-${n}`, type: 'approach', stage: 'gate1', at: now.toISOString(),
      decision: theo ? `Đã đi theo khuyến nghị: ${chuoi(c.khuyen)}` : `Chờ người: ${chuoi(o.e.decision)}`,
      why: d.lop === 'thang-cap' ? `Loại «${d.loai_cau}» đã thăng cấp — máy tự quyết, không lên thẻ hỏi.`
        : theo ? `Mặc-ký: câu chỉ-người đảo được, loại «${d.loai_cau}» có tiền lệ — phủ quyết trước khi gộp nếu khác ý.`
          : `Vẫn hỏi người — ${LY_DO[d.ly_do]}.`,
      cost_if_wrong: chuoi(c.loi_khac) || chuoi(o.e.cost_if_wrong),
      so_do: SO_DO, may: DAU_MAY, ve: d.id, loai_cau: d.loai_cau, di_theo: theo ? 'khuyen' : 'cho-nguoi' },
    theo ? {} : { ly_do: d.ly_do }, d.giu_quyen ? { giu_quyen: d.giu_quyen } : {}, d.vung.length ? { vung: d.vung } : {},
    d.lop === 'thang-cap' ? { thang_cap: true } : {}, cfg.nguoi_quyet ? { nguoi_quyet: cfg.nguoi_quyet } : {}));
  }
  if (moi.length) fs.appendFileSync(L, (text.endsWith('\n') || !text ? '' : '\n') + moi.map(m => JSON.stringify(m)).join('\n') + '\n');
  return { tat: false, ghi: moi.length, kq: x };
}

// ── Bên ghi dòng người: phủ quyết · kiểm mẫu · làm lại (máy dịch ý muốn của người thành dòng sổ, người là decided_by) ──
const LOAI_GHI = ['phu-quyet', 'kiem-mau', 'lam-lai'];
function ghiNguoi({ root, slug, loai, ve = null, nguoi = '', luaChon = '', phamVi = 'lan-nay', ket = null, nguon = null, stage = null, now = new Date() }) {
  const loi = m => { const e = new Error(m); e.ma = 2; throw e; };
  if (!LOAI_GHI.includes(loai)) loi(`--ghi «${loai}» không hợp lệ — dùng ${LOAI_GHI.join(' | ')}`);
  const L = path.join(root, '_acceptance', slug, 'decisions.jsonl');
  const text = fs.readFileSync(L, 'utf8'); const E = docSo(text);
  const dong = ve ? E.find(e => e.id === ve) : null;
  if (ve && !dong) loi(`--ve «${ve}» không có trong sổ của ${slug}`);
  if (loai !== 'lam-lai' && !chuoi(nguoi)) loi('--nguoi <tên> bắt buộc — chữ quyết là của người');
  const n = text.split('\n').filter(l => l !== '').length + 1;
  const id = `d-${now.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')}-${n}`;
  let e;
  if (loai === 'phu-quyet') {
    if (!dong || dong.stage !== 'S1') loi('phủ quyết cần --ve trỏ một dòng S1');
    if (!PHAM_VI.includes(phamVi)) loi(`--pham-vi «${phamVi}» không thuộc ${PHAM_VI.join(' | ')}`);
    if (!chuoi(luaChon)) loi('--lua-chon «<lối người chọn>» bắt buộc');
    e = { id, type: dong.type || 'approach', stage: 'gate1', at: now.toISOString(), decision: chuoi(luaChon), why: `người phủ quyết món mặc-ký ${ve}: ${chuoi(luaChon)}`,
      cost_if_wrong: chuoi(dong.cost_if_wrong) || 'sai thì phủ quyết lại', supersedes: ve, decided_by: chuoi(nguoi), so_do: SO_DO, pham_vi: phamVi };
  } else if (loai === 'kiem-mau') {
    if (!KIEM_MAU.includes(ket)) loi(`--ket «${ket}» không thuộc ${KIEM_MAU.join(' | ')}`);
    e = Object.assign({ id, type: 'revisit', stage: 'gate2', at: now.toISOString(), decision: `Kiểm mẫu ${ket === 'sai' ? 'ra sai' : 'đạt'}${chuoi(luaChon) ? ': ' + chuoi(luaChon) : ''}`,
      why: 'người soi đủ bàn giao của hồ sơ được chọn kiểm mẫu', cost_if_wrong: 'sai thì loại câu bị giáng hay giữ cấp oan', so_do: SO_DO, kiem_mau: ket, decided_by: chuoi(nguoi) }, ve ? { ve } : {});
  } else {
    if (!NGUON_LAM_LAI.includes(nguon)) loi(`--nguon «${nguon}» không thuộc ${NGUON_LAM_LAI.join(' | ')}`);
    if (!chuoi(luaChon)) loi('--lua-chon «<cách sửa đã chọn>» bắt buộc');
    e = Object.assign({ id, type: 'fix', stage: chuoi(stage) || 'S4', at: now.toISOString(), decision: chuoi(luaChon), why: `làm lại — nguồn ${nguon}`,
      cost_if_wrong: 'sai nguồn thì sổ đếm chặn thăng cấp oan hay để lọt', so_do: SO_DO, nguon_lam_lai: nguon }, ve ? { ve } : {});
  }
  fs.appendFileSync(L, (text.endsWith('\n') || !text ? '' : '\n') + JSON.stringify(e) + '\n');
  return e;
}

// ── Kiểm lược đồ ─────────────────────────────────────────────────────────────────────────────────────────
function kiemSo(entries) {
  const loi = [];
  entries.forEach((e, i) => {
    const id = typeof e.id === 'string' ? e.id : `dòng ${i + 1}`;
    const khoa = Object.keys(KHOA_MOI).filter(k => e[k] !== undefined);
    if (e.may === DAU_MAY && !khoa.includes('di_theo')) khoa.push('di_theo');
    for (const k of khoa) {
      if (e.so_do !== SO_DO) loi.push(`${id}: mang ${k} mà thiếu "so_do":${SO_DO}`);
      if (!KHOA_MOI[k].includes(e[k])) loi.push(`${id}: ${k} «${e[k]}» không thuộc ${KHOA_MOI[k].join(' | ')}`);
    }
    if (e.so_do !== undefined && e.so_do !== SO_DO) loi.push(`${id}: so_do «${e.so_do}» lạ — bản kit này đọc lược đồ ${SO_DO}`);
  });
  return [...new Set(loi)];
}

// ── Sổ đếm ───────────────────────────────────────────────────────────────────────────────────────────────
function dem({ root }) {
  const cfg = docCfg(root);
  const hsList = danhSachHoSo(root);
  const tk = thongKe(hsList, cfg);
  const bi_giang = tk.rows.filter(r => r.trang_thai === 'bị giáng').map(r => ({
    loai: r.loai,
    ho_so: hsList.filter(hs => CON_MO.has(hs.status) && cauCuaHoSo(hs).cau.some(o => o.loai === r.loai && o.mac_ky_ghi && !o.khac)).map(hs => hs.slug),
  }));
  return { ho_so: hsList.length, bat: cfg.mac_ky, nguong: { hoi: cfg.nguong_hoi, theo: cfg.nguong_theo, lam_lai: cfg.nguong_lam_lai },
    loai: tk.rows, lam_lai_khong_gan_loai: tk.lamLaiRoi, de_nghi_thang_cap: tk.rows.filter(r => r.trang_thai === 'đạt ngưỡng').map(r => r.loai), bi_giang };
}
function inDem(d) {
  const L = [`Sổ đếm trợ lý quyết định — ${d.ho_so} hồ sơ · mặc-ký ${d.bat ? 'bật' : 'tắt'} · ngưỡng thăng cấp: ≥${d.nguong.hoi} lần hỏi, ≥${d.nguong.theo}% theo, ≤${d.nguong.lam_lai} làm lại do phủ quyết`];
  for (const r of d.loai) L.push(`${r.loai} · hỏi ${r.hoi} · theo ${r.theo} · ${r.pct}% · phủ quyết ${r.phu_quyet} · làm lại phủ-quyết ${r.lam_lai['phu-quyet']} / bộ-kiểm ${r.lam_lai['bo-kiem']} / khác ${r.lam_lai.khac} · kéo ${r.keo} · kiểm mẫu sai ${r.kiem_sai} · ${r.trang_thai}${r.im ? ` · mặc-ký im lặng ${r.im} (không tính)` : ''}${r.tu_nay ? ` · án lệ «từ nay» ${r.tu_nay}` : ''}`);
  const rr = d.lam_lai_khong_gan_loai;
  if (rr['phu-quyet'] + rr['bo-kiem'] + rr.khac) L.push(`(không gắn loại) · làm lại phủ-quyết ${rr['phu-quyet']} / bộ-kiểm ${rr['bo-kiem']} / khác ${rr.khac}`);
  L.push(`Đề nghị thăng cấp: ${d.de_nghi_thang_cap.length ? d.de_nghi_thang_cap.join(', ') : '(chưa loại nào)'}`);
  for (const g of d.bi_giang) L.push(`Bị giáng: ${g.loai} — hồ sơ chưa ký phải kiểm lại: ${g.ho_so.length ? g.ho_so.join(', ') : '(không có)'}`);
  return L.join('\n') + '\n';
}

if (require.main === module) {
  const a = process.argv.slice(2); const opt = n => { const i = a.indexOf(n); return i >= 0 ? a[i + 1] : null; };
  const root = opt('--root') || '.'; const json = a.includes('--json'); const dot = opt('--dot');
  const out = s => process.stdout.write(s);
  try {
    if (a.includes('--dem')) {
      const d = dem({ root, dot });
      out(json ? JSON.stringify(d, null, 2) + '\n' : inDem(d));
      process.exit(0);
    }
    const slug = opt('--slug');
    if (!slug || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(slug)) { process.stderr.write('tro-ly-quyet-dinh: cần --slug <hồ sơ> hoặc --dem\n'); process.exit(3); }
    if (!fs.existsSync(path.join(root, '_acceptance', slug, 'decisions.jsonl'))) { process.stderr.write(`tro-ly-quyet-dinh: hồ sơ «${slug}» không có decisions.jsonl\n`); process.exit(3); }
    if (a.includes('--check')) {
      const loi = kiemSo(docSo(fs.readFileSync(path.join(root, '_acceptance', slug, 'decisions.jsonl'), 'utf8')));
      if (loi.length) { out(loi.map(l => `tro-ly-quyet-dinh: ${l}\n`).join('')); process.exit(2); }
      out(`${slug} · lược đồ sổ ${SO_DO} · không có dòng sai khuôn\n`); process.exit(0);
    }
    if (opt('--ghi')) {
      const e = ghiNguoi({ root, slug, loai: opt('--ghi'), ve: opt('--ve'), nguoi: opt('--nguoi') || '', luaChon: opt('--lua-chon') || '', phamVi: opt('--pham-vi') || 'lan-nay', ket: opt('--ket'), nguon: opt('--nguon'), stage: opt('--stage') });
      out(`${slug} · đã ghi ${e.id} (${opt('--ghi')})\n`); process.exit(0);
    }
    if (a.includes('--write')) {
      const r = ghi({ root, slug, dot, base: opt('--base') });
      if (r.tat) { out(`${slug} · mặc-ký tắt — không ghi gì (${KHOA}.mac_ky)\n`); process.exit(0); }
      const x = r.kq;
      out(`${slug} · ghi ${r.ghi} dòng máy · mặc-ký ${x.dong.filter(d => d.lop === 'mac-ky').length} · thăng cấp ${x.dong.filter(d => d.lop === 'thang-cap').length} · hỏi người ${x.dong.filter(d => d.lop === 'hoi').length}${x.kiem_mau ? ' · kiểm mẫu: hồ sơ này được chọn' : ''}\n`);
      process.exit(0);
    }
    const x = xetHoSo({ root, slug, dot, base: opt('--base') });
    if (json) out(JSON.stringify(x, null, 2) + '\n');
    else {
      out(`${slug} · mặc-ký ${x.bat ? 'bật' : 'tắt'} · mặc-ký ${x.dong.filter(d => d.lop === 'mac-ky').length} · thăng cấp ${x.dong.filter(d => d.lop === 'thang-cap').length} · hỏi người ${x.dong.filter(d => d.lop === 'hoi').length}${x.kiem_mau ? ' · kiểm mẫu' : ''}\n`);
      for (const d of x.dong) if (d.lop === 'hoi' && x.bat) out(`  hỏi ${d.id}: ${LY_DO[d.ly_do]}\n`);
    }
    process.exit(0);
  } catch (e) {
    process.stderr.write(`tro-ly-quyet-dinh: ${e.message}\n`);
    process.exit(e.ma === 2 ? 2 : 3);
  }
}
module.exports = { SO_DO, DI_THEO, PHAM_VI, NGUON_LAM_LAI, KIEM_MAU, DAU_MAY, LOAI_CAU, LY_DO, MAC_DINH, TEP_GIU_QUYEN,
  LOAI_GHI, ghiNguoi, tepCuaVong, docCfg, docGiuQuyen, chongVung, chonKiemMau, cauCuaHoSo, thongKe, xetHoSo, apSo, ghi, kiemSo, dem, inDem };
