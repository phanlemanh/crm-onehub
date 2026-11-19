'use strict';
// tim-skill.cjs — tìm tệp SKILL.md của gói theo KHỐI ĐÁNH DẤU nó mang, không theo tên thư mục skill (hồ sơ
// goi-cheo-loi-dieu-phoi). Kịch bản chuyển nhà đổi tên thư mục skill (`cat-luot` → `scope-slice`, `gom-tin-hieu` →
// `signal-intake`) mà không đổi chữ trần trong mã, nên một đường cứng `skills/<tên>/SKILL.md` gãy ở cây mới; còn khối
// máy-đọc (`<!-- <<<CAT-LUOT-CO -->`, `<!-- <<<GOM-TRUC -->`) đi theo tệp.
//
// Đúng MỘT SKILL.md dưới `<gói>/skills/*/` mang khối → trả đường ấy. Không có, hay nhiều hơn một → trả `macDinh` (đường
// cũ), để bên gọi báo lỗi y như trước — bản chép CI ở kho tiêu thụ (không chép thư mục skill) giữ nguyên hành vi.
const fs = require('fs');
const path = require('path');

function timSkill(gocGoi, khoi, macDinh) {
  const thuMuc = path.join(gocGoi, 'skills');
  let ds;
  try { ds = fs.readdirSync(thuMuc, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name).sort(); }
  catch { return macDinh; }
  const mau = `<!-- <<<${khoi} -->`;
  const khop = ds.map(d => path.join(thuMuc, d, 'SKILL.md')).filter(p => {
    try { return fs.readFileSync(p, 'utf8').includes(mau); } catch { return false; }
  });
  return khop.length === 1 ? khop[0] : macDinh;
}

module.exports = { timSkill };
