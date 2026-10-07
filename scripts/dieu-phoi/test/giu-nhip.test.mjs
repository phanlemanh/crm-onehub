import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NHIP, PHUT_MS } from '../cau-hinh.mjs';
import { chayGiuNhip } from '../giu-nhip.mjs';
import { motNhip } from '../phat-lich.mjs';
import { CFG_BIEN, hangViecHai } from './mau-thu.mjs';

const GIU_NHIP = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'giu-nhip.mjs');
const CHU_KY_MS = 50;
const NGU_MS = 600;
const tam = () => fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'dp-')));
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));
const IO = {
  nowMs: () => Date.now(),
  chay: (cmd, args) => {
    if (cmd === 'sysctl' && args[0] === 'vm.swapusage') return 'total = 24576.00M  used = 1024.00M  free = 1.00M';
    if (cmd === 'sysctl' && args.includes('kern.memorystatus_vm_pressure_level')) return '1';
    if (cmd === 'sysctl') return '{ 3.00 2.00 1.00 }';
    if (cmd === 'ps') return '102400 node\n';
    if (cmd === 'gh') return '[]';
    if (cmd === 'git' && args[0] === 'show') throw new Error('not found');
    return '';
  },
};
const suKien = (dot) => fs.readFileSync(path.join(dot, 'su-kien.jsonl'), 'utf8').trim().split('\n').map((d) => JSON.parse(d));
const mtime = (p) => fs.statSync(p).mtimeMs;
const lui = (p, ms) => {
  const t = new Date(Date.now() - ms);
  fs.utimesSync(p, t, t);
};

async function dungHaiKhoa() {
  const dot = tam();
  const w1 = tam();
  const w2 = tam();
  fs.writeFileSync(path.join(dot, 'dieu-phoi.config.json'), JSON.stringify(CFG_BIEN));
  fs.writeFileSync(path.join(dot, 'hang-viec.json'), JSON.stringify(hangViecHai({ dot: 'thu', w1, w2 })));
  for (const d of ['khoa', 'xin', 'yeu-cau', 'tra-loi', 'cho-nguoi', 'tiep']) fs.mkdirSync(path.join(dot, d));
  const luc = new Date().toISOString();
  fs.writeFileSync(path.join(dot, 'xin', 'P1-s4.json'), JSON.stringify({ phien: 'P1', slug: 'a', loai: 's4', luc, worktree: w1 }));
  fs.writeFileSync(path.join(dot, 'xin', 'P2-duong-nen.json'), JSON.stringify({ phien: 'P2', slug: 'b', loai: 'duong-nen', luc, worktree: w2 }));
  await motNhip(dot, IO);
  for (const tn of ['s4', 'duong-nen']) {
    const p = path.join(dot, 'khoa', tn, 'chu.json');
    const chu = JSON.parse(fs.readFileSync(p, 'utf8'));
    fs.writeFileSync(p, JSON.stringify({ ...chu, han_thue_den: new Date(Date.now() - PHUT_MS).toISOString() }));
    const nhip = path.join(dot, 'khoa', tn, 'nhip');
    fs.writeFileSync(nhip, 'cu');
    lui(nhip, 20 * PHUT_MS);
  }
  return { dot, w1, w2 };
}

test('giữ nhịp qua nhịp thật: lệnh bọc dài → gia hạn; cùng fixture không bọc → thu hồi', async () => {
  assert.ok(NHIP.giuNhipMs > 0);
  const { dot, w1 } = await dungHaiKhoa();
  const nhipS4 = path.join(dot, 'khoa', 's4', 'nhip');
  const nhipP2 = path.join(dot, 'khoa', 'duong-nen', 'nhip');
  const moc = mtime(nhipP2);
  const chay = chayGiuNhip({ lenh: [process.execPath, '-e', `setTimeout(() => {}, ${NGU_MS})`], cwd: w1, moiMs: CHU_KY_MS, timDot: () => dot });
  await ngu(2 * CHU_KY_MS);
  assert.ok(Date.now() - mtime(nhipS4) < 10 * CHU_KY_MS, 'lần chạm đầu');
  lui(nhipS4, 20 * PHUT_MS);
  const daLui = mtime(nhipS4);
  await ngu(4 * CHU_KY_MS);
  assert.ok(mtime(nhipS4) > daLui + PHUT_MS, 'chạm lặp trong lúc lệnh con chạy');
  assert.equal(await chay, 0);
  assert.equal(mtime(nhipP2), moc, 'nhịp của khoá phiên khác không được chạm');
  await motNhip(dot, IO);
  const sk = suKien(dot);
  assert.ok(sk.some((s) => s.loai === 'gia-han' && s.tai_nguyen === 's4' && s.phien === 'P1'), 'gia-han s4');
  assert.ok(sk.some((s) => s.loai === 'thu-hoi' && s.tai_nguyen === 'duong-nen' && s.phien === 'P2'), 'thu-hoi duong-nen');
  assert.equal(fs.existsSync(path.join(dot, 'khoa', 's4', 'chu.json')), true);
  assert.equal(fs.existsSync(path.join(dot, 'khoa', 'duong-nen')), false);

  const doi = await dungHaiKhoa();
  const r = spawnSync(process.execPath, ['-e', `setTimeout(() => {}, ${NGU_MS})`], { cwd: doi.w1 });
  assert.equal(r.status, 0);
  await motNhip(doi.dot, IO);
  assert.ok(suKien(doi.dot).some((s) => s.loai === 'thu-hoi' && s.tai_nguyen === 's4' && s.phien === 'P1'), 'không bọc → thu-hoi s4');
  assert.equal(fs.existsSync(path.join(doi.dot, 'khoa', 's4')), false);
});

test('lệnh bọc: mã thoát, SIGTERM, ngoài đợt', async () => {
  const ngoai = tam();
  const chay = (...lenh) => spawnSync(process.execPath, [GIU_NHIP, '--', ...lenh], { cwd: ngoai, encoding: 'utf8' });
  assert.equal(chay(process.execPath, '-e', 'process.exit(3)').status, 3);
  assert.equal(chay(process.execPath, '-e', '0').status, 0);
  const dau = path.join(ngoai, 'da-chay');
  assert.equal(chay(process.execPath, '-e', `require('fs').writeFileSync(${JSON.stringify(dau)}, 'x')`).status, 0);
  assert.equal(fs.existsSync(dau), true);
  const sai = spawnSync(process.execPath, [GIU_NHIP], { cwd: ngoai, encoding: 'utf8' });
  assert.equal(sai.status, 2);
  assert.equal(sai.stderr.trim(), 'dùng: giu-nhip.mjs -- <lệnh> [đối số…]');

  const san = path.join(ngoai, 'san-sang');
  const nhan = path.join(ngoai, 'nhan-sigterm');
  const ma = `const fs = require('fs'); process.on('SIGTERM', () => { fs.writeFileSync(${JSON.stringify(nhan)}, 'x'); process.exit(0); }); fs.writeFileSync(${JSON.stringify(san)}, 'x'); setTimeout(() => {}, 10000);`;
  const boc = spawn(process.execPath, [GIU_NHIP, '--', process.execPath, '-e', ma], { cwd: ngoai, stdio: 'ignore' });
  const ketThuc = new Promise((r) => boc.on('exit', (m, t) => r({ m, t })));
  for (let i = 0; i < 100 && !fs.existsSync(san); i++) await ngu(CHU_KY_MS);
  assert.equal(fs.existsSync(san), true, 'lệnh con đã chạy');
  boc.kill('SIGTERM');
  const { m } = await ketThuc;
  assert.equal(m, 143);
  assert.equal(fs.existsSync(nhan), true, 'lệnh con nhận SIGTERM');
});
