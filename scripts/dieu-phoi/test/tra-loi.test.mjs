import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { KHOA_TRA_LOI, kiemTraLoi } from '../hinh-dang.mjs';
import { motNhip } from '../phat-lich.mjs';
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
const ghi = (p, du) => fs.writeFileSync(p, typeof du === 'string' ? du : JSON.stringify(du));
const suKien = (dot) => fs.readFileSync(path.join(dot, 'su-kien.jsonl'), 'utf8').trim().split('\n').map((d) => JSON.parse(d));
const chu = (dot, tn) => JSON.parse(fs.readFileSync(path.join(dot, 'khoa', tn, 'chu.json'), 'utf8'));
const hongCua = (dot) => suKien(dot).filter((s) => s.loai === 'tra-loi-hong');

function dung() {
  const dot = tam();
  const w1 = tam();
  const w2 = tam();
  ghi(path.join(dot, 'dieu-phoi.config.json'), CFG_BIEN);
  ghi(path.join(dot, 'hang-viec.json'), hangViecHai({ dot: 'thu', w1, w2 }));
  for (const d of ['khoa', 'xin', 'yeu-cau', 'tra-loi', 'cho-nguoi', 'tiep']) fs.mkdirSync(path.join(dot, d));
  return { dot, w1, w2 };
}
const xin = (dot, phien, loai, w, hhmm) => ghi(path.join(dot, 'xin', `${phien}-${loai}.json`), { phien, slug: phien === 'P1' ? 'a' : 'b', loai, luc: luc(hhmm), worktree: w });
const yeuCau = (dot, id, phien, loai, noiDung, hhmm) => ghi(path.join(dot, 'yeu-cau', `${id}.json`), { phien, loai, hang: 'A', noi_dung: noiDung, luc: luc(hhmm) });
const traLoi = (dot, id, du) => ghi(path.join(dot, 'tra-loi', `${id}.json`), du);

async function coS4P1() {
  const f = dung();
  xin(f.dot, 'P1', 's4', f.w1, '11:59');
  await motNhip(f.dot, io('12:00'));
  return f;
}

test('tệp trả lời hỏng cú pháp: nhịp không ném, cách ly, cấp và thu hồi vẫn chạy', async () => {
  const { dot, w1, w2 } = dung();
  xin(dot, 'P2', 'merge', w2, '09:59');
  await motNhip(dot, io('10:00'));
  assert.equal(chu(dot, 'merge').han_thue_den, luc('12:00'));
  xin(dot, 'P1', 's4', w1, '11:59');
  await motNhip(dot, io('12:00'));
  assert.equal(chu(dot, 's4').han_thue_den, luc('13:30'));
  yeuCau(dot, 'P1-1', 'P1', 'gia-han', { uoc_phut: 90, tai_nguyen: 's4' }, '12:05');
  traLoi(dot, 'P1-1', '{"ket_qua":"duyet",}');
  xin(dot, 'P2', 'duong-nen', w2, '12:06');
  await assert.doesNotReject(() => motNhip(dot, io('12:10')));
  assert.equal(fs.existsSync(path.join(dot, 'tra-loi', 'hong', 'P1-1.json')), true);
  assert.equal(fs.existsSync(path.join(dot, 'tra-loi', 'P1-1.json')), false);
  const hong = hongCua(dot);
  assert.equal(hong.length, 1);
  assert.equal(hong[0].tep, 'P1-1.json');
  assert.equal(hong[0].can_phan, true);
  assert.match(hong[0].ly_do, /^tra-loi\/P1-1\.json: /);
  assert.equal(chu(dot, 'duong-nen').phien, 'P2');
  assert.ok(suKien(dot).some((s) => s.loai === 'thu-hoi' && s.tai_nguyen === 'merge' && s.phien === 'P2'));
  assert.equal(fs.existsSync(path.join(dot, 'trang-thai.json')), true);
  assert.equal(fs.existsSync(path.join(dot, 'bang.html')), true);
  assert.equal(chu(dot, 's4').han_thue_den, luc('13:30'));
});

test('hai yêu cầu gia hạn cùng nhịp, chỉ một tệp trả lời hỏng: yêu cầu kia vẫn áp', async () => {
  const { dot, w1, w2 } = dung();
  xin(dot, 'P1', 's4', w1, '11:59');
  xin(dot, 'P2', 'duong-nen', w2, '11:59');
  await motNhip(dot, io('12:00'));
  yeuCau(dot, 'P1-1', 'P1', 'gia-han', { uoc_phut: 90 }, '12:01');
  yeuCau(dot, 'P2-1', 'P2', 'gia-han', { uoc_phut: 90 }, '12:01');
  traLoi(dot, 'P1-1', '{hong');
  traLoi(dot, 'P2-1', { ket_qua: 'duyet', boi: 'giam-sat', ly_do: 'ok', uoc_phut: 20 });
  await motNhip(dot, io('12:02'));
  assert.equal(chu(dot, 'duong-nen').han_thue_den, luc('13:00'));
  assert.equal(chu(dot, 's4').han_thue_den, luc('13:30'));
  assert.equal(hongCua(dot).length, 1);
});

test('tệp trả lời sai hình dạng: ma trận năm ô cách ly nêu trường; đúng hình dạng thì áp', async () => {
  const o = [
    ['mảng', [], /^tra-loi\/P1-1\.json: phải là một object$/],
    ['thiếu ket_qua', { boi: 'giam-sat' }, /^tra-loi\/P1-1\.json: ket_qua phải là chuỗi không rỗng$/],
    ['ket_qua là số', { ket_qua: 1 }, /^tra-loi\/P1-1\.json: ket_qua phải là chuỗi không rỗng$/],
    ['uoc_phut là chuỗi', { ket_qua: 'duyet', uoc_phut: '30' }, /^tra-loi\/P1-1\.json: uoc_phut phải là số$/],
    ['khoá lạ', { ket_qua: 'duyet', ghi_chu: 'x' }, /^tra-loi\/P1-1\.json: khoá lạ ghi_chu$/],
  ];
  assert.equal(o.length, 5);
  let daDo = 0;
  for (const [ten, du, mau] of o) {
    const { dot } = await coS4P1();
    yeuCau(dot, 'P1-1', 'P1', 'gia-han', { uoc_phut: 90 }, '12:00');
    traLoi(dot, 'P1-1', du);
    await motNhip(dot, io('12:01'));
    assert.equal(fs.existsSync(path.join(dot, 'tra-loi', 'hong', 'P1-1.json')), true, ten);
    const hong = hongCua(dot);
    assert.equal(hong.length, 1, ten);
    assert.match(hong[0].ly_do, mau, ten);
    assert.equal(chu(dot, 's4').han_thue_den, luc('13:30'), ten);
    daDo++;
  }
  assert.equal(daDo, o.length);

  const { dot, w1 } = await coS4P1();
  yeuCau(dot, 'P1-1', 'P1', 'gia-han', { uoc_phut: 30 }, '12:00');
  yeuCau(dot, 'P1-2', 'P1', 'viec-phu', { kho: 'crm', tieu_de: 'Sửa nút', tep: ['apps/a/x.ts'] }, '12:00');
  yeuCau(dot, 'P1-4', 'P1', 'cham-tep', { tep: ['apps/a/y.ts'] }, '12:00');
  await motNhip(dot, io('12:00'));
  yeuCau(dot, 'P1-3', 'P1', 'viec-phu', { kho: 'crm', tieu_de: 'Sửa nút', tep: ['apps/a/x.ts'] }, '12:01');
  await motNhip(dot, io('12:01'));
  const doc = (id) => JSON.parse(fs.readFileSync(path.join(dot, 'tra-loi', `${id}.json`), 'utf8'));
  assert.equal(doc('P1-1').tai_nguyen, 's4');
  assert.equal(doc('P1-3').voi, 'P1-2');
  assert.equal(doc('P1-4').ket_qua, 'duyet');
  for (const id of ['P1-1', 'P1-3', 'P1-4']) {
    const du = doc(id);
    assert.doesNotThrow(() => kiemTraLoi(du), id);
    assert.deepEqual(Object.keys(du).filter((k) => !KHOA_TRA_LOI.includes(k)), [], id);
  }
  assert.equal(hongCua(dot).length, 0);
  assert.equal(fs.existsSync(path.join(dot, 'tra-loi', 'hong')), false);
  assert.ok(w1);

  const gs = await coS4P1();
  yeuCau(gs.dot, 'P1-1', 'P1', 'gia-han', { uoc_phut: 90 }, '12:00');
  traLoi(gs.dot, 'P1-1', { ket_qua: 'duyet', boi: 'giam-sat', ly_do: 'đồng ý', luc: luc('12:00'), uoc_phut: 45 });
  await motNhip(gs.dot, io('12:01'));
  assert.equal(chu(gs.dot, 's4').han_thue_den, luc('14:15'));
});

test('tệp trả lời hỏng rồi giám sát ghi lại: áp đúng một lần, không báo lặp', async () => {
  const { dot } = await coS4P1();
  yeuCau(dot, 'P1-1', 'P1', 'gia-han', { uoc_phut: 90 }, '12:00');
  traLoi(dot, 'P1-1', '{"ket_qua":');
  await motNhip(dot, io('12:01'));
  assert.equal(hongCua(dot).length, 1);
  await motNhip(dot, io('12:02'));
  assert.equal(fs.existsSync(path.join(dot, 'tra-loi', 'P1-1.json')), false, 'nhịp 2: tệp gốc đã chuyển đi');
  assert.equal(hongCua(dot).length, 1, 'nhịp 2: không báo lặp');
  traLoi(dot, 'P1-1', { ket_qua: 'duyet', boi: 'giam-sat', ly_do: 'ghi lại', uoc_phut: 30 });
  for (const t of ['12:03', '12:04', '12:05']) await motNhip(dot, io(t));
  assert.equal(chu(dot, 's4').han_thue_den, luc('14:00'));
  assert.equal(suKien(dot).filter((s) => s.loai === 'gia-han' && s.theo_yeu_cau === 'P1-1').length, 1);
  assert.equal(hongCua(dot).length, 1);
});
