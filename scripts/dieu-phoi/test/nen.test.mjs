import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { khop, khopMot } from '../glob.mjs';
import { docJson, ghiJsonNguyenTu, ghiSuKien, phienCuaCwd, timThuMucDot, trongWorktree, TEN_LIEN_KET } from '../dot.mjs';

const tam = () => fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'dp-')));

test('khop: ** nhiều cấp, * một cấp', () => {
  assert.equal(khop('apps/agent/**', 'apps/agent/a/b.ts'), true);
  assert.equal(khop('apps/app/lib/messages/*.ts', 'apps/app/lib/messages/okr.ts'), true);
  assert.equal(khop('apps/app/lib/messages/*.ts', 'apps/app/lib/messages/a/okr.ts'), false);
  assert.equal(khop('**/schema.prisma', 'schema.prisma'), true);
  assert.equal(khop('**/schema.prisma', 'packages/db/prisma/schema.prisma'), true);
  assert.equal(khop('packages/ui/**', 'packages/uix/a.ts'), false);
  assert.equal(khopMot(['x/**', 'y/*.ts'], 'y/a.ts'), true);
});

test('ghiJsonNguyenTu + docJson: ghi rồi đọc; vắng → mặc định; hỏng → ném', () => {
  const d = tam();
  const p = path.join(d, 'a', 'b.json');
  ghiJsonNguyenTu(p, { x: 1 });
  assert.deepEqual(docJson(p), { x: 1 });
  assert.equal(docJson(path.join(d, 'khong.json'), 'md'), 'md');
  fs.writeFileSync(path.join(d, 'hong.json'), '{');
  assert.throws(() => docJson(path.join(d, 'hong.json')));
});

test('ghiSuKien: mỗi sự kiện một dòng JSON có luc', () => {
  const d = tam();
  ghiSuKien(d, { loai: 'cap', can_phan: true });
  const dong = fs.readFileSync(path.join(d, 'su-kien.jsonl'), 'utf8').trim().split('\n');
  assert.equal(dong.length, 1);
  const sk = JSON.parse(dong[0]);
  assert.equal(sk.loai, 'cap');
  assert.equal(sk.can_phan, true);
  assert.match(sk.luc, /^\d{4}-\d{2}-\d{2}T/);
});

test('trongWorktree + phienCuaCwd: so realpath, có dấu /', () => {
  const d = tam();
  const w1 = path.join(d, 'w1');
  fs.mkdirSync(path.join(w1, 'sub'), { recursive: true });
  fs.mkdirSync(path.join(d, 'w10'));
  fs.symlinkSync(w1, path.join(d, 'lk'));
  const hv = { day: [{ id: 'P1', worktree: w1 }] };
  assert.equal(phienCuaCwd(hv, path.join(w1, 'sub')), 'P1');
  assert.equal(phienCuaCwd(hv, path.join(d, 'lk')), 'P1');
  assert.equal(phienCuaCwd(hv, path.join(d, 'w10')), null);
  assert.equal(trongWorktree(w1, path.join(d, 'w10')), false);
});

test('timThuMucDot: null khi không có symlink, đúng thư mục khi có', () => {
  const goc = tam();
  execFileSync('git', ['init', '-q'], { cwd: goc });
  assert.equal(timThuMucDot(goc), null);
  const dot = path.join(goc, '.acceptance-runs', 'dieu-phoi-thu');
  fs.mkdirSync(dot, { recursive: true });
  fs.symlinkSync(dot, path.join(goc, '.acceptance-runs', TEN_LIEN_KET));
  assert.equal(timThuMucDot(goc), dot);
  assert.equal(timThuMucDot(path.join(os.tmpdir())), null);
});
