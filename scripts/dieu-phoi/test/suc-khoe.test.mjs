import { test } from 'node:test';
import assert from 'node:assert/strict';
import { danhGiaSucKhoe, docApLuc, docLoad, docRssLonNhat, docSwap } from '../suc-khoe.mjs';

const CFG = { suc_khoe: { swap_gb: 8, ap_luc_muc: 2, rss_gb: 8 } };

test('docSwap/docLoad/docRssLonNhat đọc đúng định dạng macOS', () => {
  assert.deepEqual(docSwap('total = 24576.00M  used = 22835.25M  free = 1740.75M  (encrypted)'), { tongGb: 24, dungGb: 22835.25 / 1024 });
  assert.equal(docLoad('{ 27.10 20.03 14.50 }'), 27.1);
  assert.deepEqual(docRssLonNhat('  102400 node\n19922944 /System/Library/fseventsd\n'), { gb: 19, lenh: '/System/Library/fseventsd' });
  assert.equal(docRssLonNhat(''), null);
  assert.equal(docApLuc('2\n'), 2);
  assert.equal(docApLuc('lỗi'), null);
});

test('ca 04/10 (swap 22,3/24 GB, fseventsd 19 GB) → giảm tải + cần người', () => {
  const kq = danhGiaSucKhoe({ swap: { tongGb: 24, dungGb: 22.3 }, apLuc: 4, load: 27.1, rssLonNhat: { gb: 19, lenh: 'fseventsd' } }, CFG);
  assert.equal(kq.giamTai, true);
  assert.match(kq.lyDo.join('; '), /swap 22\.3\/24\.0 GB; áp lực bộ nhớ mức 4/);
  assert.match(kq.canNguoi, /fseventsd giữ 19\.0 GB RSS/);
});

test('báo động giả đo 05/10: swap 1,6/3 GB (54 %) nhưng áp lực mức 1 → KHÔNG giảm tải', () => {
  const kq = danhGiaSucKhoe({ swap: { tongGb: 3, dungGb: 1.6 }, apLuc: 1, load: 5.4, rssLonNhat: { gb: 5.3, lenh: 'VirtualMachine' } }, CFG);
  assert.deepEqual([kq.giamTai, kq.canNguoi], [false, null]);
  const kq0 = danhGiaSucKhoe({ swap: { tongGb: 0, dungGb: 0 }, apLuc: null, load: 1, rssLonNhat: null }, CFG);
  assert.equal(kq0.giamTai, false);
});

test('áp lực mức 2 (cảnh báo) dù swap nhỏ → giảm tải', () => {
  const kq = danhGiaSucKhoe({ swap: { tongGb: 2, dungGb: 0.5 }, apLuc: 2, load: 9, rssLonNhat: null }, CFG);
  assert.equal(kq.giamTai, true);
  assert.deepEqual(kq.lyDo, ['áp lực bộ nhớ mức 2']);
});

test('swap tuyệt đối vượt 8 GB dù tỉ lệ thấp → giảm tải', () => {
  assert.equal(danhGiaSucKhoe({ swap: { tongGb: 64, dungGb: 9 }, apLuc: 1, load: 1, rssLonNhat: null }, CFG).giamTai, true);
});
