import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { motNhip } from '../phat-lich.mjs';
import { xetYeuCau } from '../yeu-cau.mjs';
import { CFG_BIEN, hangViecHai } from './mau-thu.mjs';

const tam = () => fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'dp-')));
const luc = (hhmm) => `2026-10-05T${hhmm}:00.000Z`;
const io = (hhmm) => ({
  nowMs: () => Date.parse(luc(hhmm)),
  chay: (cmd, args) => {
    if (cmd === 'sysctl' && args[0] === 'vm.swapusage') return 'total = 24576.00M  used = 1024.00M  free = 1.00M';
    if (cmd === 'sysctl' && args.includes('kern.memorystatus_vm_pressure_level')) return '1';
    if (cmd === 'sysctl') return '{ 3.00 2.00 1.00 }';
    if (cmd === 'ps') return '102400 node\n';
    if (cmd === 'gh') return '[]';
    if (cmd === 'git' && args[0] === 'show') throw new Error('not found');
    return '';
  },
});
const ghi = (p, du) => fs.writeFileSync(p, JSON.stringify(du));
const suKien = (dot) => fs.readFileSync(path.join(dot, 'su-kien.jsonl'), 'utf8').trim().split('\n').map((d) => JSON.parse(d));
const chu = (dot, tn = 's4') => JSON.parse(fs.readFileSync(path.join(dot, 'khoa', tn, 'chu.json'), 'utf8'));

async function dung({ phien = 'P1', capLuc = '12:00' } = {}) {
  const dot = tam();
  const w1 = tam();
  const w2 = tam();
  ghi(path.join(dot, 'dieu-phoi.config.json'), CFG_BIEN);
  ghi(path.join(dot, 'hang-viec.json'), hangViecHai({ dot: 'thu', w1, w2 }));
  for (const d of ['khoa', 'xin', 'yeu-cau', 'tra-loi', 'cho-nguoi', 'tiep']) fs.mkdirSync(path.join(dot, d));
  ghi(path.join(dot, 'xin', `${phien}-s4.json`), { phien, slug: phien === 'P1' ? 'a' : 'b', loai: 's4', luc: luc('11:59'), worktree: phien === 'P1' ? w1 : w2 });
  await motNhip(dot, io(capLuc));
  return dot;
}
const yeuCau = (dot, id, phien, lucYc, noiDung) => ghi(path.join(dot, 'yeu-cau', `${id}.json`), { phien, loai: 'gia-han', hang: 'A', noi_dung: noiDung, luc: luc(lucYc) });
const traLoi = (dot, id, them = {}) => ghi(path.join(dot, 'tra-loi', `${id}.json`), { ket_qua: 'duyet', boi: 'giam-sat', ly_do: 'giám sát duyệt', luc: luc('12:00'), ...them });

test('gia-han máy duyệt kéo dài hạn thuê đúng một lần', async () => {
  const dot = await dung();
  assert.equal(chu(dot).han_thue_den, luc('13:30'));
  yeuCau(dot, 'P1-1', 'P1', '12:00', { uoc_phut: 30 });
  await motNhip(dot, io('12:00'));
  const tra = JSON.parse(fs.readFileSync(path.join(dot, 'tra-loi', 'P1-1.json'), 'utf8'));
  assert.deepEqual([tra.ket_qua, tra.boi, tra.tai_nguyen], ['duyet', 'may', 's4']);
  assert.equal(chu(dot).han_thue_den, luc('14:00'));
  assert.deepEqual(chu(dot).gia_han_theo, ['P1-1']);
  const gh = suKien(dot).filter((s) => s.loai === 'gia-han');
  assert.equal(gh.length, 1);
  assert.deepEqual([gh[0].tai_nguyen, gh[0].phien, gh[0].han_moi, gh[0].theo_yeu_cau], ['s4', 'P1', luc('14:00'), 'P1-1']);
  for (const t of ['12:00', '12:01', '12:05']) await motNhip(dot, io(t));
  assert.equal(chu(dot).han_thue_den, luc('14:00'));
  fs.rmSync(path.join(dot, 'trang-thai.json'));
  await motNhip(dot, io('12:06'));
  assert.equal(chu(dot).han_thue_den, luc('14:00'), 'mất trang-thai.json vẫn không cộng lần hai');
  assert.equal(suKien(dot).filter((s) => s.loai === 'gia-han').length, 1);
});

test('gốc là giờ nhịp khi hạn cũ đã qua', async () => {
  const dot = await dung();
  yeuCau(dot, 'P1-1', 'P1', '14:09', { uoc_phut: 30 });
  await motNhip(dot, io('14:10'));
  assert.equal(chu(dot).han_thue_den, luc('14:40'));
  assert.equal(suKien(dot).filter((s) => s.loai === 'thu-hoi').length, 0);
});

test('gia-han: ma trận giữ khoá ở hàm định tuyến', () => {
  const nc = (giu) => ({ khoaCua: () => giu });
  const yc = (noi_dung) => ({ id: 'P1-1', phien: 'P1', loai: 'gia-han', noi_dung, luc: luc('12:00') });
  const o = [
    ['giữ một khoá, không nêu', yc({ uoc_phut: 30 }), ['s4'], { ket_qua: 'duyet', boi: 'may', ly_do: 'trong trần 60′, giữ khoá s4', tai_nguyen: 's4' }],
    ['không giữ khoá nào', yc({ uoc_phut: 30 }), [], { ket_qua: 'can_phan', ly_do: 'P1 không giữ khoá nào' }],
    ['nêu khoá không giữ', yc({ uoc_phut: 30, tai_nguyen: 'duong-nen' }), ['s4'], { ket_qua: 'can_phan', ly_do: 'P1 không giữ khoá duong-nen' }],
    ['giữ hai khoá không nêu', yc({ uoc_phut: 30 }), ['s4', 'merge'], { ket_qua: 'can_phan', ly_do: 'P1 giữ s4, merge — nêu noi_dung.tai_nguyen' }],
    ['vượt trần', yc({ uoc_phut: 75 }), ['s4'], { ket_qua: 'can_phan', ly_do: 'ước 75′ vượt trần 60′' }],
  ];
  assert.equal(o.length, 5);
  for (const [ten, y, giu, mong] of o) assert.deepEqual(xetYeuCau(y, nc(giu), CFG_BIEN), mong, ten);
  assert.equal(xetYeuCau(yc({ uoc_phut: 30, tai_nguyen: 'abc' }), nc(['s4']), CFG_BIEN).ket_qua, 'can_phan');
});

test('giám sát duyệt gia-han: áp một lần, không áp lượt sau, không áp sang phiên khác, thiếu phút báo một lần', async () => {
  const a = await dung();
  yeuCau(a, 'P1-1', 'P1', '12:00', { uoc_phut: 90 });
  await motNhip(a, io('12:00'));
  assert.ok(suKien(a).some((s) => s.loai === 'yeu-cau' && s.id === 'P1-1' && s.can_phan));
  assert.equal(chu(a).han_thue_den, luc('13:30'));
  traLoi(a, 'P1-1', { uoc_phut: 45 });
  await motNhip(a, io('12:01'));
  assert.equal(chu(a).han_thue_den, luc('14:15'), '(a) theo phút của tra-loi');
  await motNhip(a, io('12:02'));
  assert.equal(chu(a).han_thue_den, luc('14:15'), '(a) không cộng lần hai');

  const b = await dung();
  yeuCau(b, 'P1-1', 'P1', '12:00', { uoc_phut: 20 });
  traLoi(b, 'P1-1');
  await motNhip(b, io('12:01'));
  assert.equal(chu(b).han_thue_den, luc('13:50'), '(b) theo phút của yêu cầu');

  const c = await dung();
  yeuCau(c, 'P1-1', 'P1', '11:00', { uoc_phut: 30 });
  traLoi(c, 'P1-1');
  await motNhip(c, io('12:01'));
  assert.equal(chu(c).han_thue_den, luc('13:30'), '(c) yêu cầu trước cap_luc không áp');

  const d = await dung();
  yeuCau(d, 'P1-1', 'P1', '12:00', {});
  traLoi(d, 'P1-1');
  for (const t of ['12:01', '12:02', '12:03']) await motNhip(d, io(t));
  assert.equal(chu(d).han_thue_den, luc('13:30'), '(d) không có số phút');
  const khongAp = suKien(d).filter((s) => s.loai === 'gia-han-khong-ap');
  assert.equal(khongAp.length, 1, '(d) báo một lần');
  assert.deepEqual([khongAp[0].id, khongAp[0].can_phan], ['P1-1', true]);

  const e = await dung({ phien: 'P2', capLuc: '12:10' });
  assert.equal(chu(e).phien, 'P2');
  yeuCau(e, 'P1-2', 'P1', '12:30', { uoc_phut: 30, tai_nguyen: 's4' });
  traLoi(e, 'P1-2');
  for (const t of ['12:30', '12:31']) await motNhip(e, io(t));
  assert.equal(chu(e).han_thue_den, luc('13:40'), '(e) hạn của P2 không đổi');
  const sangTay = suKien(e).filter((s) => s.loai === 'gia-han-khong-ap');
  assert.equal(sangTay.length, 1, '(e) báo một lần');
  assert.deepEqual([sangTay[0].id, sangTay[0].ly_do, sangTay[0].can_phan], ['P1-2', 'khoá s4 không còn do P1 giữ', true]);
});
