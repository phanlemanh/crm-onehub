const thoat = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const lienKet = (link, chu) => (/^(claude|https):\/\//.test(link ?? '') ? `<a href="${thoat(link)}">${thoat(chu)}</a>` : thoat(chu));
const bang = (dau, hang) =>
  `<table><tr>${dau.map((d) => `<th>${thoat(d)}</th>`).join('')}</tr>${hang.map((h) => `<tr>${h.map((o) => `<td>${o}</td>`).join('')}</tr>`).join('')}</table>`;

export function veBang(tt) {
  const canhBao = [];
  if (tt.trang_thai === 'giam-tai') canhBao.push(`<p class="do">GIẢM TẢI — ${thoat(tt.suc_khoe.lyDo.join('; '))}</p>`);
  if (tt.suc_khoe?.canNguoi) canhBao.push(`<p class="do">Cần anh: ${thoat(tt.suc_khoe.canNguoi)}</p>`);
  return `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><meta http-equiv="refresh" content="30">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>Đợt ${thoat(tt.dot)}</title>
<style>body{font-family:system-ui,sans-serif;background:#f5f5f5;color:#2d3142;margin:0;padding:1.5rem}
table{border-collapse:collapse;background:#fff;margin:.5rem 0 1.25rem;width:100%}th,td{border-bottom:1px solid #ddd;padding:.4rem .6rem;text-align:left;font-size:.9rem}
th{background:#ececec;font-size:.75rem;text-transform:uppercase}.do{color:#b3261e;font-weight:600}h2{font-size:1.05rem;margin:1rem 0 .25rem}</style></head><body>
<h1>Đợt ${thoat(tt.dot)} · ${thoat(tt.trang_thai)}</h1><p>Nhịp cuối ${thoat(tt.nhip_cuoi)}</p>${canhBao.join('')}
<h2>Hộp quyết định</h2>${bang(['Phiên', 'Loại', 'Tin', 'Từ'], tt.cho_nguoi.map((c) => [lienKet(c.link, c.phien), thoat(c.loai), thoat(c.tin), thoat(c.luc)]))}
<h2>Phiên thợ</h2>${bang(['Phiên', 'Hàng', 'Tiến độ', 'Chờ'], tt.day.map((d) => [lienKet(d.link, d.id), thoat(d.hang), thoat(d.tien_do), thoat(d.cho)]))}
<h2>Khoá đang giữ</h2>${bang(['Tài nguyên', 'Phiên', 'Hạn thuê'], tt.khoa.map((k) => [thoat(k.tai_nguyen), thoat(k.phien), thoat(k.han_thue_den)]))}
<h2>Hàng chờ lượt</h2>${bang(['Phiên', 'Loại', 'Xin lúc'], tt.hang_cho.map((h) => [thoat(h.phien), thoat(h.loai), thoat(h.luc)]))}
</body></html>
`;
}
