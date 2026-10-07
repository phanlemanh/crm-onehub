import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PHUT_MS } from '../cau-hinh.mjs';
import { chayGiuNhip } from '../giu-nhip.mjs';
import { chayHook } from '../hook-chan-s4.mjs';
import { hanGiaHan } from '../lich.mjs';
import { motNhip, taoVong } from '../phat-lich.mjs';
import { CFG_BIEN, hangViecHai } from './mau-thu.mjs';

const GIU_NHIP = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'giu-nhip.mjs');
const CACH_DUNG = 'dùng: giu-nhip.mjs -- <lệnh> [đối số…]';
const TZ_DUNG = 'Asia/Ho_Chi_Minh';
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
const nhip = (dot, hhmm) => taoVong(dot, io(hhmm), () => Date.parse(luc(hhmm)))();
const ghi = (p, du) => fs.writeFileSync(p, JSON.stringify(du));
const suKien = (dot) => fs.readFileSync(path.join(dot, 'su-kien.jsonl'), 'utf8').trim().split('\n').map((d) => JSON.parse(d));
const loai = (dot, ten) => suKien(dot).filter((s) => s.loai === ten);
const chu = (dot, tn = 's4') => JSON.parse(fs.readFileSync(path.join(dot, 'khoa', tn, 'chu.json'), 'utf8'));
const tepTraLoi = (dot) => fs.readdirSync(path.join(dot, 'tra-loi')).sort();
const co = (...p) => fs.existsSync(path.join(...p));

async function dung() {
  const dot = tam();
  const w1 = tam();
  const w2 = tam();
  ghi(path.join(dot, 'dieu-phoi.config.json'), CFG_BIEN);
  ghi(path.join(dot, 'hang-viec.json'), hangViecHai({ dot: 'thu', w1, w2 }));
  for (const d of ['khoa', 'xin', 'yeu-cau', 'tra-loi', 'cho-nguoi', 'tiep']) fs.mkdirSync(path.join(dot, d));
  ghi(path.join(dot, 'xin', 'P1-s4.json'), { phien: 'P1', slug: 'a', loai: 's4', luc: luc('11:59'), worktree: w1 });
  await motNhip(dot, io('12:00'));
  return { dot, w1, w2 };
}
const yeuCau = (dot, id, uoc) => ghi(path.join(dot, 'yeu-cau', `${id}.json`), { phien: 'P1', loai: 'gia-han', hang: 'A', noi_dung: { uoc_phut: uoc }, luc: luc('12:00') });
const traLoiTho = (dot, id, tho) => fs.writeFileSync(path.join(dot, 'tra-loi', `${id}.json`), tho);

test('tra-loi hỏng không làm đứng nhịp: thu hồi, cấp, ghi bảng; dời tệp và báo một lần', async () => {
  const { dot, w2 } = await dung();
  assert.equal(chu(dot).phien, 'P1');
  ghi(path.join(dot, 'xin', 'P2-merge.json'), { phien: 'P2', slug: 'b', loai: 'merge', luc: luc('12:30'), worktree: w2 });
  yeuCau(dot, 'P1-1', 30);
  traLoiTho(dot, 'P1-1', '{"ket_qua": "duyet",');
  const sau = new Date(Date.parse(chu(dot).han_thue_den) + PHUT_MS).toISOString().slice(11, 16);
  await nhip(dot, sau);
  assert.equal(co(dot, 'khoa', 's4'), false, 'khoá s4 hết hạn được thu hồi');
  assert.ok(loai(dot, 'thu-hoi').some((s) => s.tai_nguyen === 's4' && s.phien === 'P1'));
  assert.equal(chu(dot, 'merge').phien, 'P2', 'P2 được cấp merge');
  const tt = JSON.parse(fs.readFileSync(path.join(dot, 'trang-thai.json'), 'utf8'));
  assert.equal(tt.nhip_cuoi, luc(sau));
  assert.equal(co(dot, 'bang.html'), true);
  assert.equal(loai(dot, 'loi-nhip').length, 0);
  assert.equal(co(dot, 'tra-loi', 'hong', 'P1-1.json'), true);
  assert.equal(co(dot, 'tra-loi', 'P1-1.json'), false);
  const hong = loai(dot, 'tra-loi-hong');
  assert.equal(hong.length, 1);
  assert.deepEqual([hong[0].tep, hong[0].can_phan], ['P1-1.json', true]);
  assert.match(hong[0].ly_do, /^JSON/);
});

test('sau khi dời tệp hỏng: không báo lại; trong trần máy duyệt lại và gia hạn một lần; vượt trần chờ giám sát không lặp', async () => {
  const trong = await dung();
  yeuCau(trong.dot, 'P1-1', 30);
  traLoiTho(trong.dot, 'P1-1', 'khong-phai-json');
  await nhip(trong.dot, '12:01');
  const hanCu = chu(trong.dot).han_thue_den;
  await nhip(trong.dot, '12:02');
  const tra = JSON.parse(fs.readFileSync(path.join(trong.dot, 'tra-loi', 'P1-1.json'), 'utf8'));
  assert.deepEqual([tra.ket_qua, tra.boi], ['duyet', 'may']);
  assert.equal(chu(trong.dot).han_thue_den, hanGiaHan({ hanCu, nowMs: Date.parse(luc('12:02')), phut: 30 }));
  assert.deepEqual(chu(trong.dot).gia_han_theo, ['P1-1']);
  await nhip(trong.dot, '12:03');
  assert.equal(loai(trong.dot, 'tra-loi-hong').length, 1);
  assert.equal(loai(trong.dot, 'gia-han').filter((s) => s.theo_yeu_cau === 'P1-1').length, 1);

  const vuot = await dung();
  const hanVuot = chu(vuot.dot).han_thue_den;
  yeuCau(vuot.dot, 'P1-1', 75);
  traLoiTho(vuot.dot, 'P1-1', '{');
  for (const t of ['12:01', '12:02', '12:03']) await nhip(vuot.dot, t);
  assert.equal(loai(vuot.dot, 'tra-loi-hong').length, 1);
  assert.equal(co(vuot.dot, 'tra-loi', 'P1-1.json'), false);
  assert.equal(loai(vuot.dot, 'yeu-cau').filter((s) => s.id === 'P1-1' && s.can_phan === true).length, 1);
  assert.equal(chu(vuot.dot).han_thue_den, hanVuot);
});

test('tra-loi hợp lệ mà không phải object bị coi là hỏng', async () => {
  const { dot } = await dung();
  const tho = ['[]', '"duyet"', '3', 'null'];
  tho.forEach((t, i) => {
    yeuCau(dot, `P1-${i + 1}`, 30);
    traLoiTho(dot, `P1-${i + 1}`, t);
  });
  await nhip(dot, '12:01');
  const hong = loai(dot, 'tra-loi-hong');
  assert.deepEqual(hong.map((s) => s.tep).sort(), tho.map((_, i) => `P1-${i + 1}.json`));
  for (const s of hong) assert.deepEqual([s.ly_do, s.can_phan], ['không phải object', true]);
  for (let i = 1; i <= tho.length; i++) {
    assert.equal(co(dot, 'tra-loi', 'hong', `P1-${i}.json`), true);
    assert.equal(co(dot, 'tra-loi', `P1-${i}.json`), false);
  }
  assert.equal(JSON.parse(fs.readFileSync(path.join(dot, 'trang-thai.json'), 'utf8')).nhip_cuoi, luc('12:01'));
});

test('tra-loi lành của giám sát vẫn gia hạn như cũ, không có tra-loi-hong', async () => {
  const { dot } = await dung();
  yeuCau(dot, 'P1-1', 45);
  ghi(path.join(dot, 'tra-loi', 'P1-1.json'), { ket_qua: 'duyet', boi: 'giam-sat', ly_do: 'giám sát duyệt', uoc_phut: 45, luc: luc('12:00') });
  const hanCu = chu(dot).han_thue_den;
  const truoc = tepTraLoi(dot);
  await nhip(dot, '12:10');
  const hanMoi = hanGiaHan({ hanCu, nowMs: Date.parse(luc('12:10')), phut: 45 });
  assert.equal(chu(dot).han_thue_den, hanMoi);
  assert.deepEqual(chu(dot).gia_han_theo, ['P1-1']);
  assert.ok(loai(dot, 'gia-han').some((s) => s.theo_yeu_cau === 'P1-1' && s.han_moi === hanMoi));
  assert.equal(loai(dot, 'tra-loi-hong').length, 0);
  assert.deepEqual(tepTraLoi(dot), truoc);
});

function tepKiem() {
  const d = tam();
  const kiem = path.join(d, 'kiem.cjs');
  fs.writeFileSync(
    kiem,
    `const e = process.env;
require('fs').writeFileSync(process.argv[2], JSON.stringify({ argv: process.argv.slice(3), TZ: e.TZ ?? null, A: e.A ?? null, B: e.B ?? null, SAN: e.GIU_NHIP_SAN ?? null, PATH: e.PATH ?? null }));
process.exit(e.TZ === ${JSON.stringify(TZ_DUNG)} ? 0 : 3);
`,
  );
  return { d, kiem, ra: (ten) => path.join(d, `${ten}.json`), doc: (ten) => JSON.parse(fs.readFileSync(path.join(d, `${ten}.json`), 'utf8')) };
}

function moiTruong() {
  const { A, B, ...con } = process.env;
  return { ...con, TZ: 'UTC', GIU_NHIP_SAN: 'co' };
}

test('giu-nhip: tiền tố biến tới tiến trình con, giữ môi trường cũ, mã thoát đúng, vẫn chạm nhịp; không tiền tố như cũ; chỉ gán biến thoát 2', async () => {
  const k = tepKiem();
  const env = moiTruong();
  const chay = (...lenh) => spawnSync(process.execPath, [GIU_NHIP, '--', ...lenh], { cwd: k.d, env, encoding: 'utf8' });

  assert.equal(chay(`TZ=${TZ_DUNG}`, 'A=', process.execPath, k.kiem, k.ra('co')).status, 0);
  assert.deepEqual([k.doc('co').TZ, k.doc('co').A, k.doc('co').SAN, k.doc('co').PATH], [TZ_DUNG, '', 'co', env.PATH]);

  assert.equal(chay(process.execPath, k.kiem, k.ra('khong')).status, 3);
  assert.deepEqual([k.doc('khong').TZ, k.doc('khong').A], ['UTC', null]);

  const sai = chay('A=1', 'B=2');
  assert.equal(sai.status, 2);
  assert.equal(sai.stderr.trim(), CACH_DUNG);

  chay(process.execPath, k.kiem, k.ra('sau'), 'B=2');
  assert.deepEqual(k.doc('sau').argv, ['B=2']);
  assert.equal(k.doc('sau').B, null);

  const tenSai = chay('1X=y');
  assert.equal(tenSai.status, 127);
  assert.match(tenSai.stderr, /không chạy được 1X=y/);

  const dot = tam();
  const w = tam();
  fs.mkdirSync(path.join(dot, 'khoa', 's4'), { recursive: true });
  ghi(path.join(dot, 'khoa', 's4', 'chu.json'), { phien: 'P1', worktree: w });
  const ma = await chayGiuNhip({ lenh: [`TZ=${TZ_DUNG}`, process.execPath, k.kiem, k.ra('nhip')], cwd: w, timDot: () => dot });
  assert.equal(ma, 0);
  assert.equal(k.doc('nhip').TZ, TZ_DUNG);
  assert.equal(co(dot, 'khoa', 's4', 'nhip'), true);
});

test('dòng gợi ý của hook cho lệnh nền có tiền tố biến chạy được bằng sh -c và được hook cho qua', () => {
  const k = tepKiem();
  const dot = tam();
  const wt = tam();
  ghi(path.join(dot, 'dieu-phoi.config.json'), CFG_BIEN);
  fs.mkdirSync(path.join(dot, 'khoa', 's4'), { recursive: true });
  ghi(path.join(dot, 'khoa', 's4', 'chu.json'), { phien: 'P1', worktree: wt });
  const nen = (command) => JSON.stringify({ tool_name: 'Bash', cwd: wt, tool_input: { command, run_in_background: true } });
  const goc = `node ${k.kiem} ${k.ra('goi-y')} repin-lane`;
  const lenh = `TZ=${TZ_DUNG} ${goc}`;

  const kq = chayHook(nen(lenh), { timDot: () => dot });
  assert.equal(kq.ma, 2);
  const m = kq.loi.match(/^chan-s4: lệnh nền giữ khoá s4 phải chạy qua giu-nhip: (node (\S+) -- .+)$/);
  assert.ok(m, kq.loi);
  const [, dong, tep] = m;
  assert.equal(tep.replace(/^'|'$/g, ''), GIU_NHIP);

  const env = moiTruong();
  const chayGoiY = spawnSync('sh', ['-c', dong], { cwd: k.d, env, encoding: 'utf8' });
  assert.equal(chayGoiY.status, 0, chayGoiY.stderr);
  assert.equal(k.doc('goi-y').TZ, TZ_DUNG);
  assert.equal(spawnSync('sh', ['-c', goc], { cwd: k.d, env }).status, 3);

  assert.deepEqual(chayHook(nen(dong), { timDot: () => dot }), { ma: 0 });
});
