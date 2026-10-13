// tin-hieu-khoa.cjs — MỘT hàm đọc khoá ổ cắm cửa tín hiệu (`tin_hieu.nguon`, `tin_hieu.gom`) cho mọi
// bên đọc: bộ vẽ bản đồ (biết «cửa vắng» mà KHÔNG nạp scripts/tin-hieu.mjs) và chính tin-hieu.mjs.
// Hồ sơ cua-tin-hieu-gom-nhom (hàng L3), design docs/superpowers/specs/2026-10-11-cua-tin-hieu-gom-nhom-design.md §3.2.
//
// Cùng nếp với lo-trinh-khoa.cjs: bộ đọc danh sách chung khớp mọi khoá thụt ở bất cứ khối nào, nên ở
// đây cắt đúng khối `tin_hieu:` ở cột 0 rồi mới đọc `nguon` và `gom` trong khối.
const KHOA = 'tin_hieu';
const NULLISH = new Set(['~', 'null', 'Null', 'NULL']);
const boNhay = s => String(s).trim().replace(/^["']|["']$/g, '').trim();
const boChuThich = s => String(s).replace(/\s+#.*$/, '').trim();

function khoiTinHieu(cfgText) {
  const dong = String(cfgText || '').replace(/\r\n?/g, '\n').split('\n');
  const i = dong.findIndex(l => /^tin_hieu:\s*(#.*)?$/.test(l));
  if (i < 0) return null;
  const ra = [];
  for (const l of dong.slice(i + 1)) {
    if (/^\s*(#.*)?$/.test(l)) continue; // chú thích và dòng trống không cắt khối
    if (/^\S/.test(l)) break;
    ra.push(l);
  }
  return ra;
}

// Giá trị của một khoá con thụt hai dấu cách: chuỗi, dòng `[a, b]`, hoặc danh sách `- a` thụt sâu hơn.
function giaTri(khoi, ten) {
  const i = khoi.findIndex(l => new RegExp(`^ {2}${ten}:`).test(l));
  if (i < 0) return null;
  const tho = [];
  const v = boChuThich(khoi[i].replace(new RegExp(`^ {2}${ten}:`), ''));
  if (v.startsWith('[')) for (const x of v.replace(/^\[/, '').replace(/\]$/, '').split(',')) tho.push(boNhay(x));
  else if (v) tho.push(boNhay(v));
  else {
    for (const l of khoi.slice(i + 1)) {
      const m = l.match(/^ {4,}-\s*(.*)$/);
      if (m) { tho.push(boNhay(boChuThich(m[1]))); continue; }
      if (/^\s*(#.*)?$/.test(l)) continue;
      break;
    }
  }
  return tho.filter(t => t && !NULLISH.has(t));
}

// → { nguon: string[], gom: string, co: string[] } | null. null = cửa vắng (không khối, thiếu nguon
// hoặc thiếu gom) — kho không khai thì không lệnh nào của cửa chạy.
function khoaTinHieu(cfgText) {
  const khoi = khoiTinHieu(cfgText);
  if (!khoi) return null;
  const nguonTho = giaTri(khoi, 'nguon'); const gomTho = giaTri(khoi, 'gom');
  if (!nguonTho || !nguonTho.length || !gomTho || !gomTho.length) return null;
  const nguon = []; const co = [];
  for (const t of nguonTho) {
    if (nguon.includes(t)) { const c = `nguồn tín hiệu khai hai lần: ${t}`; if (!co.includes(c)) co.push(c); continue; }
    nguon.push(t);
  }
  if (gomTho.length > 1) co.push(`tin_hieu.gom chỉ nhận một thư mục — dùng ${gomTho[0]}`);
  return { nguon, gom: gomTho[0], co };
}

module.exports = { KHOA, khoaTinHieu };
