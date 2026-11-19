'use strict';
// ho-goi.cjs — MỘT bảng tên của họ plugin kit: tên chợ và tên từng plugin theo VAI (hồ sơ goi-cheo-loi-dieu-phoi,
// design §3). Mã tra tên theo vai (`tenTheoVai('lo-trinh')`), không viết cứng tên plugin.
//
// Vì sao đúng dạng khoá-đối-tượng này: kịch bản chuyển nhà áp luật đổi chữ lên mọi tệp của gói, gồm mẫu
// `'<plugin cũ>': {` và tên chợ — nên ở cây mới bảng tự thành tên mới mà kịch bản không cần biết thêm gì; còn vai
// (`vai: '…'`) không khớp mẫu nào nên đứng yên. Đừng viết lại khoá thành dạng khác (`"road-map": {`, `['road-map']`):
// luật đổi chữ sẽ không mang nó sang.
//
// Bên đọc: scripts/plugin-declare.mjs, scripts/lo-trinh-khoi-tao.mjs (khi gói không mang marketplace.json cạnh nó),
// lib/chan-lo-trinh.cjs, scripts/start-scan.mjs. Răng: https://github.com/phanlemanh/acceptance-gate-kit/blob/0fe48c145d7ff6d230a736b1852dfbe3ecc0295b/tests/scripts/mot-nguon-ten-va-hop-thu.test.mjs (GN-1) giữ bảng
// ≡ .claude-plugin/marketplace.json — cùng tên theo cùng thứ tự, cùng tập bật-theo-lựa-chọn, cùng tên chợ.
const CHO = 'delivery-loop';
const NGUON_CHO = { source: 'github', repo: 'phanlemanh/delivery-loop' };
const GOI = {
  'acceptance-gate': { vai: 'loi' },
  'feature-loop': { vai: 'feature-loop' },
  'diagram-design': { vai: 'diagram-design' },
  'dispatch': { vai: 'dieu-phoi', luaChon: true },
  'roadmap': { vai: 'lo-trinh', luaChon: true },
  'knowledge': { vai: 'tri-thuc', luaChon: true },
};

function tenTheoVai(vai) {
  const ten = Object.keys(GOI).find(k => GOI[k].vai === vai);
  if (!ten) throw new Error(`ho-goi: không có plugin mang vai «${vai}»`);
  return ten;
}

// Cùng hình với readMarketplace của plugin-declare: `names` = gói không bật-theo-lựa-chọn, `optIn` = gói bật theo lựa
// chọn, `mk` = tên chợ — theo đúng thứ tự khai.
function danhSach() {
  const ten = Object.keys(GOI);
  return { names: ten.filter(t => !GOI[t].luaChon), optIn: ten.filter(t => GOI[t].luaChon), mk: CHO };
}

module.exports = { CHO, NGUON_CHO, GOI, tenTheoVai, danhSach };
