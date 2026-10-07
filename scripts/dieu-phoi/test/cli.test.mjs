import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { dongDot, moDot } from '../dieu-phoi.mjs';
import { timThuMucDot } from '../dot.mjs';
import { chayHook } from '../hook-chan-s4.mjs';

const tam = () => fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'dp-')));

test('moDot dựng thư mục đợt từ mẫu + symlink; mở đợt thứ hai khi đợt kia còn chạy → ném', () => {
  const goc = tam();
  execFileSync('git', ['init', '-q'], { cwd: goc });
  const dot = moDot(goc, 'thu');
  assert.equal(timThuMucDot(goc), dot);
  for (const f of ['LUAT.md', 'hang-viec.json', 'dieu-phoi.config.json']) assert.ok(fs.existsSync(path.join(dot, f)), f);
  for (const d of ['khoa', 'xin', 'yeu-cau', 'tra-loi', 'cho-nguoi', 'tiep']) assert.ok(fs.statSync(path.join(dot, d)).isDirectory(), d);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dot, 'dieu-phoi.config.json'), 'utf8')).goc_kho, goc);
  assert.throws(() => moDot(goc, 'khac'), /đợt thu đang chạy/);
});

test('thử khô: trong đợt hook chặn S4; sau dongDot hook im', () => {
  const goc = tam();
  execFileSync('git', ['init', '-q'], { cwd: goc });
  moDot(goc, 'thu');
  const wf = JSON.stringify({ tool_name: 'Workflow', cwd: goc, tool_input: { scriptPath: '/x/acceptance-verify.js' } });
  assert.equal(chayHook(wf).ma, 2);
  dongDot(goc);
  assert.equal(timThuMucDot(goc), null);
  assert.equal(chayHook(wf).ma, 0);
});
