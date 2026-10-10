import { test } from 'node:test';
import assert from 'node:assert/strict';
import { capLuot, chonHangKe, xepHang, xetHanThue } from '../lich.mjs';

const HV = {
  day: [{ id: 'P1' }, { id: 'P2' }, { id: 'P3' }, { id: 'P4' }],
  hang: [
    { ma: 'A', slug: 'a', day: 'P1', moc: '2026-10-12', uu_tien: 1 },
    { ma: 'B', slug: 'b', day: 'P2', moc: '2026-10-14', uu_tien: 1 },
    { ma: 'C', slug: 'c', day: 'P1', moc: '2026-10-12', uu_tien: 2, sau: ['B'] },
    { ma: 'D', slug: 'd', day: 'P1', moc: '2026-10-20', uu_tien: 3 },
  ],
};
const don = (phien, slug, loai, luc, them = {}) => ({ phien, slug, loai, luc, worktree: `/w/${phien}`, ...them });
const CFG = { han_thue_phut: { s4: 90, 'ghim-lai': 40, 'duong-nen': 40, merge: 120 }, nhip_cu_phut: 10 };

test('xepHang: mốc sớm trước, rồi giờ xin', () => {
  const kq = xepHang([don('P2', 'b', 's4', '2026-10-05T01:00:00Z'), don('P1', 'a', 's4', '2026-10-05T02:00:00Z')], HV);
  assert.deepEqual(kq.map((d) => d.phien), ['P1', 'P2']);
});

test('xepHang: ghim-lai mở merge chen lên trước mọi đơn', () => {
  const kq = xepHang([
    don('P1', 'a', 's4', '2026-10-05T01:00:00Z'),
    don('P2', 'b', 'ghim-lai', '2026-10-05T03:00:00Z', { mo_merge: true }),
  ], HV);
  assert.equal(kq[0].phien, 'P2');
});

test('capLuot: mỗi tài nguyên một lượt; ghim-lai dùng chung khoá s4', () => {
  const kq = capLuot({
    donXin: [
      don('P1', 'a', 's4', '2026-10-05T01:00:00Z'),
      don('P2', 'b', 'ghim-lai', '2026-10-05T01:01:00Z'),
      don('P3', 'x', 'duong-nen', '2026-10-05T01:02:00Z'),
    ],
    dangGiu: { s4: null, 'duong-nen': null, merge: null },
    giamTai: false,
    hangViec: HV,
  });
  assert.deepEqual(kq.map((c) => [c.taiNguyen, c.don.phien]), [['s4', 'P1'], ['duong-nen', 'P3']]);
});

test('capLuot: tài nguyên đang giữ thì không cấp', () => {
  const kq = capLuot({ donXin: [don('P1', 'a', 's4', 't')], dangGiu: { s4: { phien: 'P9' }, 'duong-nen': null, merge: null }, giamTai: false, hangViec: HV });
  assert.deepEqual(kq, []);
});

test('capLuot: giảm tải chặn s4, ghim-lai, duong-nen nhưng vẫn cấp merge', () => {
  const kq = capLuot({
    donXin: [don('P1', 'a', 's4', '1'), don('P2', 'b', 'duong-nen', '2'), don('P3', 'c', 'merge', '3')],
    dangGiu: { s4: null, 'duong-nen': null, merge: null },
    giamTai: true,
    hangViec: HV,
  });
  assert.deepEqual(kq.map((c) => c.taiNguyen), ['merge']);
});

test('phát lại 04/10: bốn phiên nhường chéo thì luật cũ không cấp ai, luật mới cấp một', () => {
  const thayDiTruoc = { P3: 'P1', P1: 'P2', P2: 'P4', P4: 'P3' };
  const luatCu = Object.keys(thayDiTruoc).filter((p) => thayDiTruoc[p] === null);
  assert.equal(luatCu.length, 0, 'luật cũ phải tái hiện quãng kẹt');
  const donXin = Object.keys(thayDiTruoc).map((p, i) => don(p, 'a', 's4', `2026-10-04T10:3${i}:00Z`));
  const kq = capLuot({ donXin, dangGiu: { s4: null, 'duong-nen': null, merge: null }, giamTai: false, hangViec: HV });
  assert.equal(kq.length, 1);
});

test('xetHanThue: còn hạn giữ; hết hạn + nhịp mới gia hạn; hết hạn + nhịp cũ thu hồi', () => {
  const now = Date.parse('2026-10-05T12:00:00Z');
  const chu = { loai: 's4', han_thue_den: '2026-10-05T11:00:00Z' };
  assert.deepEqual(xetHanThue({ chu: { ...chu, han_thue_den: '2026-10-05T13:00:00Z' }, nhipTuoiPhut: 99, nowMs: now, cfg: CFG }), { hanhDong: 'giu' });
  const gh = xetHanThue({ chu, nhipTuoiPhut: 3, nowMs: now, cfg: CFG });
  assert.equal(gh.hanhDong, 'gia-han');
  assert.equal(gh.hanMoi, '2026-10-05T13:30:00.000Z');
  assert.deepEqual(xetHanThue({ chu, nhipTuoiPhut: 25, nowMs: now, cfg: CFG }), { hanhDong: 'thu-hoi' });
  assert.deepEqual(xetHanThue({ chu, nhipTuoiPhut: null, nowMs: now, cfg: CFG }), { hanhDong: 'thu-hoi' });
});

test('chonHangKe: tiếp hàng đang làm; chọn hàng đủ phụ thuộc theo uu_tien; chờ; xong', () => {
  const td = (o) => new Map(Object.entries(o));
  assert.deepEqual(chonHangKe(HV, 'P1', td({ a: 'dang' })), { hang: 'a', moi: false });
  assert.deepEqual(chonHangKe(HV, 'P1', td({ a: 'ky' })), { hang: 'd', moi: true });
  assert.deepEqual(chonHangKe(HV, 'P1', td({ a: 'gop', b: 'gop' })), { hang: 'c', moi: true });
  assert.deepEqual(chonHangKe(HV, 'P1', td({ a: 'gop', d: 'gop', b: 'dang' })), { hang: null, cho: 'phu-thuoc' });
  assert.deepEqual(chonHangKe(HV, 'P1', td({ a: 'gop', c: 'gop', d: 'ky' })), { hang: null, xong: true });
});

test('xepHang: đơn kiem-cheo mang moc vẫn xếp SAU đơn s4 của thợ (F26 thay F9 AC-5)', () => {
  const kq = xepHang([
    don('P4', 'zz', 's4', '2026-10-08T03:00:00Z'),
    don('kiem-cheo', 'kiem-cheo-sau-gop', 's4', '2026-10-08T02:00:00Z', { moc: '2026-10-07' }),
  ], HV);
  assert.deepEqual(kq.map((d) => d.phien), ['P4', 'kiem-cheo']);
});

const MA_TRAN_KIEM_CHEO = [
  ['s4 thuong', don('P1', 'a', 's4', '2026-10-09T05:00:00Z')],
  ['s4 khong moc hang', don('P4', 'zz', 's4', '2026-10-09T05:00:00Z')],
  ['ghim-lai thuong', don('P2', 'b', 'ghim-lai', '2026-10-09T05:00:00Z')],
  ['ghim-lai mo_merge', don('P3', 'c', 'ghim-lai', '2026-10-09T05:00:00Z', { mo_merge: true })],
  ['duong-nen', don('P1', 'a', 'duong-nen', '2026-10-09T05:00:00Z')],
];
const KIEM_CHEO_DON = [
  ['kiem-cheo co moc', don('kiem-cheo', 'kiem-cheo-sau-gop', 's4', '2026-10-01T00:00:00Z', { moc: '2026-09-01' })],
  ['kiem-cheo khong moc', don('kiem-cheo', 'kiem-cheo-sau-gop', 's4', '2026-10-01T00:00:00Z')],
];
const O_XEP = MA_TRAN_KIEM_CHEO.flatMap(([tt, t]) => KIEM_CHEO_DON.map(([tk, k]) => [`${tt} x ${tk}`, t, k]));
for (const [ten, tho, kc] of O_XEP) {
  test(`xepHang ma tran: ${ten} — tho truoc kiem-cheo`, () => {
    const kq = xepHang([kc, tho], HV);
    assert.deepEqual(kq.map((d) => d.phien), [tho.phien, 'kiem-cheo'], `o «${ten}»: kiem-cheo dung truoc tho`);
  });
}
test('xepHang ma tran: so o = 5 loai don tho x 2 loai don kiem-cheo', () => {
  assert.equal(O_XEP.length, MA_TRAN_KIEM_CHEO.length * KIEM_CHEO_DON.length);
  assert.equal(O_XEP.length, 10);
});

test('capLuot: tho s4 va kiem-cheo s4 cung cho -> chi cap tho', () => {
  const cap = capLuot({
    donXin: [don('kiem-cheo', 'kiem-cheo-sau-gop', 's4', '2026-10-01T00:00:00Z', { moc: '2026-09-01' }), don('P4', 'zz', 's4', '2026-10-09T05:00:00Z')],
    dangGiu: {}, giamTai: false, hangViec: HV,
  });
  assert.deepEqual(cap.map((c) => c.don.phien), ['P4']);
});
test('capLuot: chi co kiem-cheo cho -> cap kiem-cheo (doi chung duong)', () => {
  const cap = capLuot({ donXin: [don('kiem-cheo', 'kiem-cheo-sau-gop', 's4', '2026-10-01T00:00:00Z')], dangGiu: {}, giamTai: false, hangViec: HV });
  assert.deepEqual(cap.map((c) => c.don.phien), ['kiem-cheo']);
});
test('capLuot: tho cho duong-nen, kiem-cheo cho s4 -> cap ca hai', () => {
  const cap = capLuot({
    donXin: [don('kiem-cheo', 'kiem-cheo-sau-gop', 's4', '2026-10-01T00:00:00Z'), don('P1', 'a', 'duong-nen', '2026-10-09T05:00:00Z')],
    dangGiu: {}, giamTai: false, hangViec: HV,
  });
  assert.deepEqual(cap.map((c) => c.don.phien).sort(), ['P1', 'kiem-cheo']);
});

test('xepHang: đối chứng — đơn kiem-cheo không mang moc thì đơn sớm hơn đứng trước', () => {
  const kq = xepHang([
    don('P4', 'zz', 's4', '2026-10-08T01:00:00Z'),
    don('kiem-cheo', 'kiem-cheo-sau-gop', 's4', '2026-10-08T02:00:00Z'),
  ], HV);
  assert.deepEqual(kq.map((d) => d.phien), ['P4', 'kiem-cheo']);
});

test('xepHang: thợ tự ghi moc vào đơn không chen được hàng', () => {
  const kq = xepHang([
    don('P4', 'zz', 's4', '2026-10-08T01:00:00Z'),
    don('P3', 'yy', 's4', '2026-10-08T02:00:00Z', { moc: '2000-01-01' }),
  ], HV);
  assert.deepEqual(kq.map((d) => d.phien), ['P4', 'P3'], 'moc trong đơn của phiên thợ phải bị bỏ qua');
});
