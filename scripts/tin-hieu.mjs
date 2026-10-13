#!/usr/bin/env node
// tin-hieu.mjs — cửa tín hiệu của kho: bộ đọc tín hiệu, bộ đọc bản gom, răng phủ «mỗi tín hiệu ở đúng
// một chỗ», và đường đi tín hiệu → nhóm → hàng → hồ sơ cho người gửi. Hồ sơ _acceptance/cua-tin-hieu-gom-nhom/
// (hàng L3), design docs/superpowers/specs/2026-10-11-cua-tin-hieu-gom-nhom-design.md.
//
// CHỈ ĐỌC: không ghi tệp nào, không gọi mô hình. Việc PHÁN (tín hiệu nào vào nhóm nào, tên nhóm) là của
// phiên theo skill gom-tin-hieu; mã này chỉ kiểm và vẽ (kit render, không soạn).
//
// Một hộp thư: khuôn tín hiệu = khuôn yêu cầu của gói Điều phối, kiểm bằng CHÍNH `kiemYeuCau` của nó
// (import, không chép). Bản gom = bản phạm vi của cắt lượt, đọc lại bằng CHÍNH `docPhamVi` (import).
// Danh sách loại được gom và khuôn mẫu sống ở skills/acceptance/references/tin-hieu-template.md; chính
// sách trục sống ở khối GOM-TRUC của skills/gom-tin-hieu/SKILL.md — mã không mang giá trị nào của chúng.
//
//   node scripts/tin-hieu.mjs --root . --rang                 0 xanh · 1 đỏ · 2 không chạy được
//   node scripts/tin-hieu.mjs --root . --chua-gom             JSON: tín hiệu chưa có chỗ + việc đã giao
//   node scripts/tin-hieu.mjs --root . --duong [--id <id>]    JSON: đường đi từng tín hiệu
import { readFileSync, readdirSync, existsSync, statSync, realpathSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { kiemYeuCau } from '../dieu-phoi/scripts/hinh-dang.mjs';
import { docPhamVi } from './cat-luot.mjs';
import { phanTichKho, docCacTep, docTep } from './lo-trinh.mjs';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { khoaTinHieu } = require(path.join(__dirname, 'tin-hieu-khoa.cjs'));
const { frontmatterField } = require(path.join(__dirname, '..', 'lib', 'evidence-core.cjs'));
// «Đã giao» là đúng tập trạng thái mà cắt lượt và lưới trước-gộp dùng — không chép danh sách.
const { DA_THONG_CONG_2, DA_DONG_THUC_TE } = require(path.join(__dirname, '..', 'lib', 'workspace-record.cjs'));

export const TEP_KHUON = path.join(__dirname, '..', 'skills', 'acceptance', 'references', 'tin-hieu-template.md');
export const TEP_SKILL = path.join(__dirname, '..', 'skills', 'gom-tin-hieu', 'SKILL.md');
const DA_GIAO = new Set([...DA_THONG_CONG_2, ...DA_DONG_THUC_TE]);
const chuoi = v => (v == null ? '' : String(v).trim());
const doc = p => { try { return readFileSync(p, 'utf8'); } catch { return null; } };

// Khối marker `<!-- <<<TEN -->` … `<!-- TEN>>> -->`, bỏ hàng rào ``` nếu có. null khi vắng.
export function khoiMarker(txt, ten) {
  const m = String(txt ?? '').match(new RegExp(`<!-- <<<${ten} -->\\n([\\s\\S]*?)<!-- ${ten}>>> -->`));
  if (!m) return null;
  return m[1].replace(/^```[a-z]*\n/, '').replace(/\n?```\s*$/, '\n');
}

// ── Khuôn và chính sách (một nguồn, đọc lúc chạy) ─────────────────────────────
export function napLoai(tep = TEP_KHUON) {
  const k = khoiMarker(doc(tep), 'TIN-HIEU-LOAI');
  if (k == null) throw new Error(`khuôn tín hiệu thiếu khối TIN-HIEU-LOAI: ${tep}`);
  const ds = k.split('\n').map(l => l.match(/^- ([a-z][a-z0-9-]*)\b/)).filter(Boolean).map(m => m[1]);
  if (!ds.length) throw new Error(`khối TIN-HIEU-LOAI không kê loại nào: ${tep}`);
  return ds;
}
export function napTruc(tep = TEP_SKILL) {
  const k = khoiMarker(doc(tep), 'GOM-TRUC');
  const m = k && k.match(/^truc:\s*(\S+)\s*$/m);
  if (!m) throw new Error(`skill gom thiếu khối GOM-TRUC có dòng «truc: <giá trị>»: ${tep}`);
  return m[1];
}

export function docKhai(root) {
  return khoaTinHieu(doc(path.join(root, '_acceptance', 'config.yaml')));
}

// ── Bộ đọc tín hiệu ───────────────────────────────────────────────────────────
export function tieuDeCua(nd) {
  if (typeof nd === 'string') return nd.trim();
  if (nd && typeof nd === 'object') for (const k of ['tieu_de', 'viec', 'cau_giao']) if (typeof nd[k] === 'string' && nd[k].trim()) return nd[k].trim();
  return '';
}
const posix = p => p.split(path.sep).join('/');

export function docTinHieu(root, nguon, { loai = napLoai() } = {}) {
  const tinHieu = []; const ngoaiKhuon = {}; const loi = []; const theoId = new Map();
  for (const ng of nguon) {
    const dir = path.resolve(root, ng);
    let laThuMuc = false; try { laThuMuc = statSync(dir).isDirectory(); } catch { laThuMuc = false; }
    if (!laThuMuc) { loi.push(`nguồn tín hiệu không phải thư mục có thật: ${ng}`); continue; }
    for (const f of readdirSync(dir).filter(x => x.endsWith('.json')).sort()) {
      const rel = posix(path.join(ng, f)); const id = f.slice(0, -'.json'.length);
      let o;
      try { o = JSON.parse(readFileSync(path.join(dir, f), 'utf8')); } catch { loi.push(`tín hiệu ${rel} sai khuôn: JSON hỏng`); continue; }
      try { kiemYeuCau(o); } catch (e) { loi.push(`tín hiệu ${rel} sai khuôn: ${e.message}`); continue; }
      if (!loai.includes(o.loai)) { ngoaiKhuon[o.loai] = (ngoaiKhuon[o.loai] || 0) + 1; continue; }
      if (!Number.isFinite(Date.parse(o.luc))) { loi.push(`tín hiệu ${rel} sai khuôn: luc không đọc được (${JSON.stringify(o.luc ?? null)})`); continue; }
      const td = tieuDeCua(o.noi_dung);
      if (o.loai === 'tin-hieu' && !(o.noi_dung && typeof o.noi_dung.tieu_de === 'string' && o.noi_dung.tieu_de.trim())) { loi.push(`tín hiệu ${rel} sai khuôn: thiếu noi_dung.tieu_de`); continue; }
      if (theoId.has(id)) { loi.push(`tín hiệu ${id} có ở hai tệp: ${theoId.get(id)} và ${rel}`); continue; }
      theoId.set(id, rel);
      tinHieu.push({ id, tep: rel, loai: o.loai, phien: o.phien, hang: o.hang ?? null, luc: o.luc, tieu_de: td, noi_dung: o.noi_dung });
    }
  }
  return { tinHieu, ngoaiKhuon, loi };
}
// Một dòng cho mọi yêu cầu không phải tín hiệu — null khi không có.
export function dongNgoaiKhuon(ngoaiKhuon) {
  const ds = Object.keys(ngoaiKhuon || {}).sort();
  return ds.length ? `ngoài khuôn tín hiệu: ${ds.map(k => `${k} ${ngoaiKhuon[k]}`).join(', ')}` : null;
}

// ── Bộ đọc bản gom ────────────────────────────────────────────────────────────
const KHOA_RE = /^(dot|dang|nguon|truc|den):\s*(.*)$/;
const NHOM_RE = /^- `([^`]*)` — (\S.*)$/;
const TH_RE = /^\s+- tín hiệu:(.*)$/;
const LE_RE = /^- lẻ `([^`]+)`(?:\s*—\s*(.*))?$/;
const PHU_RE = /^- đã phủ `([^`]+)`(?:\s*—\s*(.*))?$/;
export function docBanGom(txt) {
  const khoa = {}; const nhom = []; const le = []; const daPhu = []; const loi = []; let cur = null;
  String(txt ?? '').split(/\r?\n/).forEach((dong, i) => {
    const so = i + 1; let m;
    if ((m = dong.match(KHOA_RE))) { if (!(m[1] in khoa)) khoa[m[1]] = m[2].trim(); cur = null; return; }
    if ((m = dong.match(TH_RE))) {
      if (!cur) { loi.push(`dòng ${so}: kê tín hiệu ngoài nhóm`); return; }
      const ids = [...m[1].matchAll(/`([^`]+)`/g)].map(x => x[1].trim()).filter(Boolean);
      if (!ids.length) loi.push(`dòng ${so}: dòng tín hiệu của nhóm ${cur.ma} không kê id nào trong backtick`);
      cur.tinHieu.push(...ids); return;
    }
    if (/^\s/.test(dong) || !dong.trim()) return;
    cur = null;
    if ((m = dong.match(NHOM_RE))) { cur = { ma: m[1].trim(), ten: m[2].trim(), tinHieu: [], dong: so }; nhom.push(cur); return; }
    if ((m = dong.match(LE_RE))) { le.push({ id: m[1].trim(), lyDo: chuoi(m[2]), dong: so }); return; }
    if ((m = dong.match(PHU_RE))) { daPhu.push({ id: m[1].trim(), hoSo: chuoi(m[2]), dong: so }); return; }
    if (dong.startsWith('- ')) loi.push(`dòng sai khuôn ${so}: ${dong.trim()}`);
  });
  return { dot: chuoi(khoa.dot), dang: chuoi(khoa.dang), nguon: chuoi(khoa.nguon), truc: chuoi(khoa.truc), den: chuoi(khoa.den), nhom, le, daPhu, loi };
}

// ── Hồ sơ ─────────────────────────────────────────────────────────────────────
export function trangThaiHoSo(root, slug) {
  const dir = path.join(root, '_acceptance', slug);
  if (!slug || !existsSync(dir)) return { coThat: false, daGiao: false, chu: 'không có' };
  const c = doc(path.join(dir, 'contract.md'));
  if (c != null) {
    const st = chuoi(frontmatterField(c, 'status')).replace(/^["']|["']$/g, '');
    return { coThat: true, daGiao: DA_GIAO.has(st), chu: st || 'không ghi status', feature: chuoi(frontmatterField(c, 'feature')).replace(/^["']|["']$/g, '') };
  }
  if (existsSync(path.join(dir, 'opportunity.md'))) return { coThat: true, daGiao: false, chu: 'ô cơ hội đang chờ' };
  return { coThat: true, daGiao: false, chu: 'không có hợp đồng' };
}
function hoSoDaGiao(root) {
  const acc = path.join(root, '_acceptance');
  if (!existsSync(acc)) return [];
  return readdirSync(acc, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name).sort()
    .map(slug => ({ slug, ...trangThaiHoSo(root, slug) })).filter(x => x.daGiao).map(x => ({ slug: x.slug, cau_giao: x.feature || '' }));
}

const coTrongGit = (root, rel) => {
  try { execFileSync('git', ['-C', root, 'ls-files', '--error-unmatch', '--', rel], { stdio: ['ignore', 'ignore', 'ignore'] }); return true; } catch { return false; }
};
function cacBanGom(root, khai) {
  const dir = path.resolve(root, khai.gom);
  let laThuMuc = false; try { laThuMuc = statSync(dir).isDirectory(); } catch { laThuMuc = false; }
  if (!laThuMuc) return [];
  return readdirSync(dir).filter(f => f.endsWith('.md')).sort().map(f => {
    const rel = posix(path.join(khai.gom, f)); const txt = readFileSync(path.join(dir, f), 'utf8');
    return { tep: rel, txt, ...docBanGom(txt) };
  });
}

// ── Răng phủ ──────────────────────────────────────────────────────────────────
// Mọi bản gom × mọi tín hiệu của mọi nguồn: tín hiệu có `luc` không sau mốc `den` lớn nhất ở ĐÚNG MỘT
// chỗ (nhóm · lẻ · đã phủ). Bản gom ngoài git → thoat2 (không ai so được phủ trên một tệp không có gốc).
export function kiemPhu({ root, khai = docKhai(root), truc = napTruc(), loai = napLoai() } = {}) {
  if (khai == null) return { thoat2: 'kho chưa khai cửa tín hiệu (khối tin_hieu: với nguon và gom trong _acceptance/config.yaml)' };
  const loi = []; const canhBao = [...khai.co];
  const doc_ = docTinHieu(root, khai.nguon, { loai });
  loi.push(...doc_.loi);
  const dnk = dongNgoaiKhuon(doc_.ngoaiKhuon); if (dnk) canhBao.push(dnk);
  const banGom = cacBanGom(root, khai);
  for (const bg of banGom) if (!coTrongGit(root, bg.tep)) return { thoat2: `bản gom phải là tệp có trong git: ${bg.tep}` };
  if (!banGom.length) canhBao.push(`chưa có bản gom nào trong ${khai.gom}`);
  const cho = new Map(); const ghi = (id, noi) => { if (!cho.has(id)) cho.set(id, []); cho.get(id).push(noi); };
  let moc = -Infinity;
  for (const bg of banGom) {
    const t = bg.tep;
    for (const e of bg.loi) loi.push(`${t}: ${e}`);
    for (const e of docPhamVi(bg.txt).loi) loi.push(`${t}: bản phạm vi — ${e}`);
    if (!bg.truc) loi.push(`${t}: thiếu truc — chính sách trục là «${truc}» (khối GOM-TRUC)`);
    else if (bg.truc !== truc) loi.push(`${t}: truc «${bg.truc}» khác chính sách «${truc}» (khối GOM-TRUC)`);
    const d = Date.parse(bg.den);
    if (!bg.den) loi.push(`${t}: thiếu den`);
    else if (!Number.isFinite(d)) loi.push(`${t}: den không đọc được (${bg.den})`);
    else if (d > moc) moc = d;
    for (const n of bg.nhom) {
      if (!n.tinHieu.length) loi.push(`${t}: nhóm ${n.ma} không kê tín hiệu nào`);
      for (const id of n.tinHieu) ghi(id, `nhóm ${n.ma} (${t})`);
    }
    for (const x of bg.le) { if (!x.lyDo) loi.push(`${t}: lẻ ${x.id} thiếu lý do`); ghi(x.id, `lẻ (${t})`); }
    for (const x of bg.daPhu) {
      if (!x.hoSo) loi.push(`${t}: đã phủ ${x.id} thiếu hồ sơ`);
      else {
        const st = trangThaiHoSo(root, x.hoSo);
        if (!st.coThat) loi.push(`${t}: đã phủ ${x.id} trỏ hồ sơ ${x.hoSo} không có`);
        else if (!st.daGiao) loi.push(`${t}: đã phủ ${x.id} trỏ hồ sơ ${x.hoSo} chưa giao (trạng thái: ${st.chu})`);
      }
      ghi(x.id, `đã phủ ${x.hoSo || '?'} (${t})`);
    }
  }
  const coId = new Set(doc_.tinHieu.map(x => x.id));
  for (const [id, noi] of cho) if (!coId.has(id)) loi.push(`${noi[0]}: tín hiệu ${id} không có trong nguồn`);
  const bang = [];
  for (const th of doc_.tinHieu) {
    const noi = cho.get(th.id) || [];
    if (noi.length > 1) loi.push(`tín hiệu ${th.id} ở ${noi.length} chỗ: ${noi.join(', ')}`);
    else if (!noi.length && Date.parse(th.luc) <= moc) loi.push(`tín hiệu ${th.id} chưa có chỗ (luc ${th.luc} không sau den ${new Date(moc).toISOString()})`);
    bang.push({ id: th.id, cho: noi[0] || 'chưa gom' });
  }
  return { thoat2: null, loi, canhBao, bang, banGom, tinHieu: doc_.tinHieu, ngoaiKhuon: doc_.ngoaiKhuon, moc: Number.isFinite(moc) ? new Date(moc).toISOString() : null };
}

// ── Đường đi về người gửi ─────────────────────────────────────────────────────
// Bảng khuôn câu (design §3.6) — câu dựng từ khuôn viết sẵn, không soạn.
export const CAU = {
  'chua-gom': () => 'chưa gom — tín hiệu tới sau lượt gom gần nhất',
  le: x => `lẻ — ${x.ly_do}`,
  'da-phu': x => `đã có việc đã giao: ${x.ho_so_phu} (${x.trang_thai})`,
  'nhom-chua-cat': x => `vào nhóm ${x.ten_nhom} — nhóm chưa thành việc`,
  'chan-troi': x => `vào nhóm ${x.ten_nhom} — để sau: ${x.ly_do}`,
  'hang-chua-ho-so': x => `vào nhóm ${x.ten_nhom} → việc ${x.hang}: ${x.trang_thai}`,
  'hang-co-ho-so': x => `vào nhóm ${x.ten_nhom} → việc ${x.hang} → hồ sơ ${x.ho_so}: ${x.trang_thai}`,
};
// Trường của một bản ghi đường đi — một nguồn cho khối dữ liệu lộ trình và tài liệu kho tiêu thụ.
export const TRUONG_DUONG = ['id', 'loai', 'tieu_de', 'luc', 'cho', 'nhom', 'ten_nhom', 'ly_do', 'ho_so_phu', 'hang', 'ho_so', 'trang_thai', 'cau'];

export function duongDi({ root, classify, sections }) {
  const khai = docKhai(root);
  if (khai == null) return null;
  const doc_ = docTinHieu(root, khai.nguon);
  const banGom = cacBanGom(root, khai);
  // Chỗ ĐẦU TIÊN của mỗi tín hiệu — răng chịu phần «đúng một chỗ»; đường đi chỉ vẽ.
  const choCua = new Map();
  for (const bg of banGom) {
    for (const n of bg.nhom) for (const id of n.tinHieu) if (!choCua.has(id)) choCua.set(id, { k: 'nhom', ma: n.ma, ten: n.ten, dot: bg.dot });
    for (const x of bg.le) if (!choCua.has(x.id)) choCua.set(x.id, { k: 'le', lyDo: x.lyDo });
    for (const x of bg.daPhu) if (!choCua.has(x.id)) choCua.set(x.id, { k: 'da-phu', hoSo: x.hoSo });
  }
  // Lộ trình: hàng + chân trời thô theo tệp (dot, phu), trạng thái hàng từ CÙNG hàm vẽ trang lộ trình.
  const ltKhai = docCacTep(root);
  const kho = ltKhai ? phanTichKho({ root, classify, sections }) : null;
  const cacTep = (ltKhai ? ltKhai.tep : []).map((tep, i) => {
    const { data } = docTep(root, tep);
    const kq = kho && kho.cacTep[i] && kho.cacTep[i].kq;
    return { hang: data && Array.isArray(data.hang) ? data.hang : [], chanTroi: data && Array.isArray(data.chan_troi) ? data.chan_troi : [], dong: kq ? kq.dong : [] };
  });
  const TEN = Object.fromEntries(sections || []);
  const tenO = slug => { try { const c = classify(path.join(root, '_acceptance', slug), slug); return TEN[c.key] || c.key; } catch { return 'không xếp được'; } };
  const ra = [];
  for (const th of doc_.tinHieu) {
    const p = choCua.get(th.id);
    const x = { id: th.id, loai: th.loai, tieu_de: th.tieu_de, luc: th.luc, cho: 'chua-gom', nhom: null, ten_nhom: null, ly_do: null, ho_so_phu: null, hang: null, ho_so: null, trang_thai: null, cau: '' };
    if (p && p.k === 'le') { x.cho = 'le'; x.ly_do = p.lyDo; }
    else if (p && p.k === 'da-phu') { x.cho = 'da-phu'; x.ho_so_phu = p.hoSo; x.trang_thai = tenO(p.hoSo); }
    else if (p && p.k === 'nhom') {
      x.nhom = p.ma; x.ten_nhom = p.ten; x.cho = 'nhom-chua-cat';
      const coPhu = r => r && chuoi(r.dot) === p.dot && Array.isArray(r.phu) && r.phu.map(chuoi).includes(p.ma);
      let thay = false;
      for (const t of cacTep) {
        const r = t.hang.find(coPhu);
        if (!r) continue;
        const d = t.dong.find(z => z._ma === chuoi(r.ma));
        x.hang = chuoi(r.ma); x.trang_thai = d ? d.chu : null; x.ho_so = (d && d.hoSo) || null;
        x.cho = x.ho_so ? 'hang-co-ho-so' : 'hang-chua-ho-so'; thay = true; break;
      }
      if (!thay) for (const t of cacTep) { const c = t.chanTroi.find(coPhu); if (c) { x.cho = 'chan-troi'; x.ly_do = chuoi(c.ly_do); break; } }
    }
    x.cau = CAU[x.cho](x);
    ra.push(x);
  }
  return ra;
}

export function chuaGom({ root }) {
  const khai = docKhai(root);
  if (khai == null) return null;
  const doc_ = docTinHieu(root, khai.nguon);
  const co = new Set();
  for (const bg of cacBanGom(root, khai)) { for (const n of bg.nhom) n.tinHieu.forEach(id => co.add(id)); bg.le.forEach(x => co.add(x.id)); bg.daPhu.forEach(x => co.add(x.id)); }
  return {
    tin_hieu: doc_.tinHieu.filter(t => !co.has(t.id)).map(({ id, loai, phien, luc, tieu_de, noi_dung }) => ({ id, loai, phien, luc, tieu_de, noi_dung })),
    da_giao: hoSoDaGiao(root),
    ngoai_khuon: dongNgoaiKhuon(doc_.ngoaiKhuon),
    loi: doc_.loi,
  };
}

// ── CLI ───────────────────────────────────────────────────────────────────────
const isMain = (() => {
  if (!process.argv[1]) return false;
  try { return realpathSync(process.argv[1]) === realpathSync(__filename); } catch { return path.resolve(process.argv[1]) === __filename; }
})();
if (isMain) {
  const a = process.argv.slice(2);
  const bail = m => { process.stderr.write(`tin-hieu: ${m}\n`); process.exit(2); };
  let root = '.'; let lenh = null; let id = null;
  for (let i = 0; i < a.length; i++) {
    if (['--rang', '--chua-gom', '--duong'].includes(a[i])) { if (lenh) bail('chỉ một lệnh mỗi lần: --rang | --chua-gom | --duong'); lenh = a[i]; continue; }
    if (a[i] === '--root' || a[i] === '--id') {
      const v = a[i + 1]; if (v == null || v === '' || v.startsWith('--')) bail(`${a[i]} cần một giá trị ngay sau nó`);
      if (a[i] === '--root') root = v; else id = v; i++; continue;
    }
    bail(`tham số lạ ${a[i]} — nhận --root <thư-mục> và một trong --rang | --chua-gom | --duong [--id <id>]`);
  }
  if (!lenh) bail('thiếu lệnh: --rang | --chua-gom | --duong');
  root = path.resolve(root);
  if (docKhai(root) == null) bail('kho chưa khai cửa tín hiệu (khối tin_hieu: với nguon và gom trong _acceptance/config.yaml)');
  if (lenh === '--rang') {
    let kq; try { kq = kiemPhu({ root }); } catch (e) { bail(e.message); }
    if (kq.thoat2) bail(kq.thoat2);
    for (const c of kq.canhBao) process.stdout.write(`cảnh báo: ${c}\n`);
    if (kq.loi.length) { for (const l of kq.loi) process.stdout.write(`${l}\n`); process.exit(1); }
    process.stdout.write(`Bảng phủ (${kq.bang.length} tín hiệu):\n${kq.bang.map(b => `- ${b.id} → ${b.cho}`).join('\n')}${kq.bang.length ? '\n' : ''}`);
    process.exit(0);
  }
  if (lenh === '--chua-gom') { process.stdout.write(JSON.stringify(chuaGom({ root }), null, 2) + '\n'); process.exit(0); }
  const PM = await import(pathToFileURL(path.join(__dirname, 'product-map.mjs')).href);
  const ds = duongDi({ root, classify: PM.classify, sections: PM.SECTIONS });
  if (id != null) {
    const x = ds.find(t => t.id === id);
    if (!x) { process.stderr.write(`tin-hieu: không có tín hiệu ${id}\n`); process.exit(1); }
    process.stdout.write(JSON.stringify(x, null, 2) + '\n'); process.exit(0);
  }
  process.stdout.write(JSON.stringify(ds, null, 2) + '\n');
}
