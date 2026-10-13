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
