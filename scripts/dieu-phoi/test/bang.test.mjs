import { test } from 'node:test';
import assert from 'node:assert/strict';
import { veBang } from '../bang.mjs';

const TT = {
  dot: 'sau-14-10',
  trang_thai: 'dang-chay',
  nhip_cuoi: '2026-10-05T12:00:00Z',
  suc_khoe: { lyDo: [], canNguoi: null, load: 3 },
  day: [{ id: 'P1', link: 'claude://claude.ai/epitaxy/local_x', hang: 'k2-soan', tien_do: 'dang', cho: null }],
  khoa: [{ tai_nguyen: 's4', phien: 'P1', han_thue_den: '2026-10-05T13:30:00Z' }],
  hang_cho: [{ phien: 'P2', loai: 's4', luc: '2026-10-05T12:01:00Z' }],
  cho_nguoi: [{ phien: 'P1', loai: 'idle_prompt', tin: 'Ký Cổng 2?', luc: '2026-10-05T12:02:00Z', link: 'claude://claude.ai/epitaxy/local_x' }],
};

test('veBang: có đủ các khối và tự làm mới 30 giây', () => {
  const html = veBang(TT);
  assert.match(html, /<meta http-equiv="refresh" content="30">/);
  for (const chu of ['sau-14-10', 'Hộp quyết định', 'Ký Cổng 2?', 'k2-soan', 'P2']) assert.ok(html.includes(chu), chu);
  assert.match(html, /href="claude:\/\/claude\.ai\/epitaxy\/local_x"/);
});

test('veBang: escape mọi chuỗi; link lạ không thành href', () => {
  const html = veBang({ ...TT, cho_nguoi: [{ ...TT.cho_nguoi[0], tin: '<script>alert(1)</script>', link: 'javascript:alert(1)' }] });
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('href="javascript:'));
});

test('veBang: giảm tải và cần người hiện ở đầu trang', () => {
  const html = veBang({ ...TT, trang_thai: 'giam-tai', suc_khoe: { lyDo: ['swap 22.3/24.0 GB'], canNguoi: 'fseventsd giữ 19.0 GB RSS', load: 27 } });
  assert.match(html, /GIẢM TẢI/);
  assert.match(html, /fseventsd giữ 19\.0 GB RSS/);
});
