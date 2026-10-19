'use strict';
// co-hop-dong.cjs — cỡ hợp đồng: MỘT bộ đọc cho khoảng cỡ (khối CAT-LUOT-CO của SKILL cắt lượt), số tiêu
// chí và dòng sổ «giữ cỡ». Hồ sơ _acceptance/vong-mo-thang-bang-feature-loop/ (hàng S3c), design
// docs/superpowers/specs/2026-10-12-vong-mo-thang-bang-feature-loop-design.md.
//
// Ba bên đọc cùng nạp mô-đun này: thẻ Cổng Phạm vi (gate-card.js, CJS), đồng hồ cỡ (cat-luot.mjs, ESM qua
// createRequire) và ca đo. Không số nào của khoảng, không bản sao nào của chuỗi giữ nằm ở bên đọc khác.
// CJS cùng thư mục scripts/ để gate-card.js nạp được mà không cần require(esm) của Node mới.
const fs = require('fs');
const path = require('path');
const { parseACBlock } = require(path.join(__dirname, '..', 'lib', 'ac-line.cjs'));

// ── Khoảng cỡ (dời nguyên văn từ cat-luot.mjs, hồ sơ vong-la-mot-ket-qua) ────────────────────────────
// Chính sách của chủ kho (10/10): mục tiêu · cho phép tới · tách từ · trần lượt chấm · ngưỡng ít dữ liệu.
// Bên viết là người sửa khối; bên đọc là hàm dưới — mã không mang số nào của khoảng.
const KHOA_CO = ['muc_tieu', 'cho_phep_den', 'tach_tu', 'tran_luot_cham', 'it_du_lieu_duoi'];
const TEP_SKILL = path.join(__dirname, '..', 'skills', 'cat-luot', 'SKILL.md');
const KHOI_CO_RE = /<!-- <<<CAT-LUOT-CO -->\r?\n```[a-z]*\r?\n([\s\S]*?)```\r?\n<!-- CAT-LUOT-CO>>> -->/;
function docKhoang(txt) {
  const m = String(txt ?? '').match(KHOI_CO_RE);
  if (!m) return { khoang: null, loi: ['SKILL cắt lượt thiếu khối CAT-LUOT-CO (khoảng cỡ)'] };
  const tho = {};
  for (const dong of m[1].split(/\r?\n/)) { const k = dong.replace(/\s+#.*$/, '').match(/^\s*([a-z_]+):\s*(\S+)\s*$/); if (k && !(k[1] in tho)) tho[k[1]] = k[2]; }
  const loi = KHOA_CO.filter(k => !(k in tho)).map(k => `khối CAT-LUOT-CO thiếu khoá ${k}`);
  if (loi.length) return { khoang: null, loi };
  const so = v => (/^\d+$/.test(v) ? Number(v) : NaN);
  const mt = tho.muc_tieu.match(/^(\d+)-(\d+)$/);
  const khoang = { muc_tieu: mt ? [Number(mt[1]), Number(mt[2])] : null };
  for (const k of KHOA_CO.slice(1)) khoang[k] = so(tho[k]);
  if (!khoang.muc_tieu || !(khoang.muc_tieu[0] >= 1)) loi.push(`khoá muc_tieu «${tho.muc_tieu}» phải là <đầu>-<cuối>, hai số nguyên dương`);
  else if (khoang.muc_tieu[0] > khoang.muc_tieu[1]) loi.push(`khoá muc_tieu «${tho.muc_tieu}» ngược: đầu lớn hơn cuối`);
  for (const k of KHOA_CO.slice(1)) if (!(khoang[k] >= 1)) loi.push(`khoá ${k} «${tho[k]}» phải là số nguyên dương`);
  if (!loi.length) {
    const [, cuoi] = khoang.muc_tieu; const c = khoang.cho_phep_den; const t = khoang.tach_tu;
    if (c < cuoi) loi.push(`khoá cho_phep_den ${c} nhỏ hơn cuối muc_tieu ${cuoi}`);
    else if (t !== c + 1) loi.push(`khoá tach_tu ${t} phải bằng cho_phep_den + 1 = ${c + 1} (khoảng ${t > c + 1 ? 'hở' : 'chồng'})`);
  }
  return loi.length ? { khoang: null, loi } : { khoang, loi };
}
function napKhoang(tep = TEP_SKILL) {
  let txt; try { txt = fs.readFileSync(tep, 'utf8'); } catch { throw Object.assign(new Error(`không đọc được SKILL cắt lượt (khối CAT-LUOT-CO): ${tep}`), { ma: 2 }); }
  const { khoang, loi } = docKhoang(txt);
  if (!khoang) throw Object.assign(new Error(loi.join('; ')), { ma: 2 });
  return khoang;
}

// ── Số tiêu chí và nhóm cỡ ────────────────────────────────────────────────────────────────────────────
// Đếm MÃ khác nhau của bộ đọc tiêu chí chung (cùng phép đếm đồng hồ cỡ dùng từ hồ sơ vong-la-mot-ket-qua).
const demTieuChi = contract => new Set(parseACBlock(String(contract ?? '')).map(a => a.id)).size;
function nhomCo(n, k) {
  const [dau, cuoi] = k.muc_tieu;
  if (n < dau) return 'duoi-muc-tieu';
  if (n <= cuoi) return 'muc-tieu';
  if (n <= k.cho_phep_den) return 'cho-phep';
  return 'phai-tach';
}

// ── Dòng sổ «giữ cỡ» ─────────────────────────────────────────────────────────────────────────────────
// Bên ghi chép đúng GIU_CO_MO_DAU (khối DEC-GIU-CO của SKILL Feature Loop, chuỗi in trên cờ đỏ của thẻ).
// Bên đọc khoan dung về dấu gạch (—, – hay -): người gõ `sửa: giữ cỡ - …` ở lệnh duyệt trên bàn phím không
// có gạch dài. Phải còn ≥ 1 chữ lý do sau dấu gạch — «giữ có tên» nghĩa là có lý do.
const GIU_CO_MO_DAU = 'giữ cỡ — ';
const GIU_CO_RE = /^\s*giữ cỡ\s*[—–-]\s*(\S.*)$/u;
// Dòng bị một dòng sau rút bằng `supersedes` (luật sổ append-only của kit, cùng nếp lib/workspace-record.cjs)
// thì thôi được tính — bỏ qua nó là fail-OPEN: lý do đã rút vẫn mở cổng. Lý do còn là chỗ trống của khuôn
// (`<lý do>`, `<vì sao …>`) không phải lý do có tên.
const CHO_TRONG_RE = /^<[^<>]*>\.?$/u;
function dongGiu(decisionsText) {
  const ds = [];
  for (const dong of String(decisionsText ?? '').split(/\r?\n/)) {
    if (!dong.trim()) continue;
    let e; try { e = JSON.parse(dong); } catch { continue; }
    if (e && typeof e === 'object') ds.push(e);
  }
  const biRut = new Set(ds.filter(e => e.supersedes != null).flatMap(e => [].concat(e.supersedes)).map(String));
  for (const e of ds) {
    if (typeof e.decision !== 'string' || (e.id != null && biRut.has(String(e.id)))) continue;
    const m = e.decision.normalize('NFC').match(GIU_CO_RE);
    if (m && !CHO_TRONG_RE.test(m[1].trim())) return { id: typeof e.id === 'string' ? e.id : null, ly_do: m[1].trim() };
  }
  return null;
}

// ── Kết luận cỡ của MỘT hợp đồng ở lối vào Cổng Phạm vi ──────────────────────────────────────────────
// Chỉ hợp đồng `draft` bị chặn hay cờ: hợp đồng đã qua Cổng Phạm vi (approved trở đi, kể cả làn V) đi
// đường đọc-cũ. Khối hỏng hay không đọc được tiêu chí → `loi` + cờ vàng, KHÔNG chặn (fail-visible).
function coHopDong({ contract, decisions, status, tepSkill = TEP_SKILL }) {
  const draft = String(status ?? '').trim().toLowerCase() === 'draft';
  let khoang;
  try { khoang = napKhoang(tepSkill); } catch (e) { return { n: null, nhom: null, khoang: null, giu: null, chan: false, vang: draft, loi: e.message, draft }; }
  const n = demTieuChi(contract);
  const giu = dongGiu(decisions);
  if (!n) return { n: 0, nhom: null, khoang, giu, chan: false, vang: draft, loi: 'không đọc được tiêu chí nào theo khuôn AC-<số>', draft };
  const nhom = nhomCo(n, khoang);
  const chan = draft && nhom === 'phai-tach' && !giu;
  const vang = draft && !chan && (nhom === 'cho-phep' || nhom === 'phai-tach');
  return { n, nhom, khoang, giu, chan, vang, loi: null, draft };
}

module.exports = { KHOA_CO, TEP_SKILL, docKhoang, napKhoang, demTieuChi, nhomCo, GIU_CO_MO_DAU, dongGiu, coHopDong };
