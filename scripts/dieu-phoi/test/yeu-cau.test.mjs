import { test } from 'node:test';
import assert from 'node:assert/strict';
import { xetYeuCau } from '../yeu-cau.mjs';

const CFG = { bao_ve: ['packages/db/prisma/schema.prisma', 'packages/db/prisma/migrations/**'], s4_tran_gom_phut: 60 };
const HV = {
  day: [{ id: 'P1' }, { id: 'P2' }],
  hang: [
    { slug: 'a', day: 'P1', ranh_gioi: ['apps/app/okr/**'], chung_chi_them: ['apps/app/lib/messages/*.ts'] },
    { slug: 'b', day: 'P2', ranh_gioi: ['apps/api/src/to-chuc/**'] },
  ],
};
const nc = (them = {}) => ({ hangViec: HV, nhanhChamTep: new Map(), nhanhCua: (p) => `feat/${p}`, yeuCauGanDay: [], ...them });
const yc = (loai, noi_dung, them = {}) => ({ id: 'y1', phien: 'P1', loai, hang: 'a', noi_dung, luc: '2026-10-05T10:00:00Z', ...them });

test('cham-tep: tệp không ai giữ → máy duyệt', () => {
  const kq = xetYeuCau(yc('cham-tep', { tep: ['apps/app/record-parts.tsx'] }), nc(), CFG);
  assert.equal(kq.ket_qua, 'duyet');
  assert.equal(kq.boi, 'may');
});

test('cham-tep: ba ca đỏ, mỗi ca đúng lý do', () => {
  assert.match(xetYeuCau(yc('cham-tep', { tep: ['packages/db/prisma/migrations/2026/x.sql'] }), nc(), CFG).ly_do, /danh sách bảo vệ/);
  assert.match(xetYeuCau(yc('cham-tep', { tep: ['apps/app/lib/messages/okr.ts'] }), nc(), CFG).ly_do, /danh sách bảo vệ/);
  assert.match(xetYeuCau(yc('cham-tep', { tep: ['apps/api/src/to-chuc/x.ts'] }), nc(), CFG).ly_do, /ranh giới P2/);
  const coNhanh = nc({ nhanhChamTep: new Map([['apps/x.ts', ['feat/P2', 'feat/P1']]]) });
  const kq = xetYeuCau(yc('cham-tep', { tep: ['apps/x.ts'] }), coNhanh, CFG);
  assert.equal(kq.ket_qua, 'can_phan');
  assert.match(kq.ly_do, /đang được nhánh feat\/P2 sửa/);
  assert.doesNotMatch(kq.ly_do, /feat\/P1/);
});

test('cham-tep: nhánh của chính phiên xin không tính là vướng (chiều im)', () => {
  const kq = xetYeuCau(yc('cham-tep', { tep: ['apps/x.ts'] }), nc({ nhanhChamTep: new Map([['apps/x.ts', ['feat/P1']]]) }), CFG);
  assert.equal(kq.ket_qua, 'duyet');
});

test('cham-tep không nêu tệp → can_phan', () => {
  assert.equal(xetYeuCau(yc('cham-tep', {}), nc(), CFG).ket_qua, 'can_phan');
});

test('viec-phu: trùng trong 24 giờ cùng kho + cùng tiêu đề hoặc chung tệp → gộp; khác → can_phan', () => {
  const cu = yc('viec-phu', { kho: 'crm', tieu_de: 'Sửa ca chập chờn  o-so-man', tep: ['apps/app/test/a.tsx'] }, { id: 'y0', luc: '2026-10-05T01:00:00Z' });
  const moi = yc('viec-phu', { kho: 'crm', tieu_de: 'sửa ca chập chờn o-so-man' });
  assert.deepEqual(xetYeuCau(moi, nc({ yeuCauGanDay: [cu] }), CFG), { ket_qua: 'gop', boi: 'may', ly_do: 'trùng yêu cầu y0', voi: 'y0' });
  const chungTep = yc('viec-phu', { kho: 'crm', tieu_de: 'khác', tep: ['apps/app/test/a.tsx'] });
  assert.equal(xetYeuCau(chungTep, nc({ yeuCauGanDay: [cu] }), CFG).ket_qua, 'gop');
  const khacKho = yc('viec-phu', { kho: 'kit', tieu_de: 'sửa ca chập chờn o-so-man' });
  assert.equal(xetYeuCau(khacKho, nc({ yeuCauGanDay: [cu] }), CFG).ket_qua, 'can_phan');
  const quaHan = { ...cu, luc: '2026-10-03T00:00:00Z' };
  assert.equal(xetYeuCau(moi, nc({ yeuCauGanDay: [quaHan] }), CFG).ket_qua, 'can_phan');
});

test('s4-gom/gia-han: trong trần → máy; vượt hoặc thiếu ước → can_phan', () => {
  assert.equal(xetYeuCau(yc('s4-gom', { uoc_phut: 50 }), nc(), CFG).ket_qua, 'duyet');
  assert.equal(xetYeuCau(yc('gia-han', { uoc_phut: 75 }), nc(), CFG).ket_qua, 'can_phan');
  assert.equal(xetYeuCau(yc('gia-han', {}), nc(), CFG).ket_qua, 'can_phan');
});

test('can-nguoi → can_phan dich owner; hang-moi, chuyen-hang, khac → can_phan', () => {
  assert.deepEqual(xetYeuCau(yc('can-nguoi', {}), nc(), CFG), { ket_qua: 'can_phan', dich: 'owner', ly_do: 'việc chỉ người làm được' });
  for (const loai of ['hang-moi', 'chuyen-hang', 'khac', 'la']) assert.equal(xetYeuCau(yc(loai, {}), nc(), CFG).ket_qua, 'can_phan');
});
