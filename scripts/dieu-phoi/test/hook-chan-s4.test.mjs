import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chayHook, phanLoai } from '../hook-chan-s4.mjs';

const tam = () => fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'dp-')));
function dung() {
  const dot = tam();
  const wt = tam();
  fs.writeFileSync(path.join(dot, 'dieu-phoi.config.json'), '{}');
  return { dot, wt, timDot: () => dot };
}
const wf = (cwd) => JSON.stringify({ tool_name: 'Workflow', cwd, tool_input: { scriptPath: '/x/workflows/acceptance-verify.js' } });
const bash = (cwd, command) => JSON.stringify({ tool_name: 'Bash', cwd, tool_input: { command } });

test('phanLoai: chỉ lệnh S4 được phân loại', () => {
  assert.equal(phanLoai({ tool_name: 'Workflow', tool_input: { scriptPath: 'a/acceptance-verify.js' } }), 's4');
  assert.equal(phanLoai({ tool_name: 'Workflow', tool_input: { scriptPath: 'a/execute-parallel.js' } }), null);
  assert.equal(phanLoai({ tool_name: 'Bash', tool_input: { command: 'node x/repin-lane.mjs --write' } }), 's4');
  assert.equal(phanLoai({ tool_name: 'Bash', tool_input: { command: 'node x/duong-nen.mjs --slug a' } }), 'duong-nen');
  assert.equal(phanLoai({ tool_name: 'Bash', tool_input: { command: 'bun test' } }), null);
});

test('chưa có lượt → exit 2, thông điệp gọi tên khoá và cách xin', () => {
  const { wt, timDot } = dung();
  const kq = chayHook(wf(wt), { timDot });
  assert.equal(kq.ma, 2);
  assert.match(kq.loi, /^chan-s4: khoá s4 đang trống nhưng chưa cấp cho phiên này\. Ghi đơn xin\/<phiên>-s4\.json/);
});

test('khoá thuộc phiên khác → exit 2 nêu tên phiên giữ', () => {
  const { dot, wt, timDot } = dung();
  fs.mkdirSync(path.join(dot, 'khoa', 's4'), { recursive: true });
  fs.writeFileSync(path.join(dot, 'khoa', 's4', 'chu.json'), JSON.stringify({ phien: 'P9', worktree: '/khac' }));
  assert.match(chayHook(wf(wt), { timDot }).loi, /khoá s4 đang thuộc P9/);
});

test('có lượt đúng worktree (kể cả qua symlink và thư mục con) → 0', () => {
  const { dot, wt, timDot } = dung();
  fs.mkdirSync(path.join(wt, 'apps'));
  const lk = path.join(tam(), 'lk');
  fs.symlinkSync(wt, lk);
  fs.mkdirSync(path.join(dot, 'khoa', 's4'), { recursive: true });
  fs.writeFileSync(path.join(dot, 'khoa', 's4', 'chu.json'), JSON.stringify({ phien: 'P1', worktree: wt }));
  assert.equal(chayHook(wf(path.join(wt, 'apps')), { timDot }).ma, 0);
  assert.equal(chayHook(bash(lk, 'node repin-lane.mjs'), { timDot }).ma, 0);
});

test('chiều im: không có đợt, hoặc lệnh không phải S4 → 0, kể cả khi config hỏng', () => {
  const { dot, wt, timDot } = dung();
  assert.equal(chayHook(wf(wt), { timDot: () => null }).ma, 0);
  fs.writeFileSync(path.join(dot, 'dieu-phoi.config.json'), '{hong');
  assert.equal(chayHook(bash(wt, 'git status'), { timDot }).ma, 0);
  assert.equal(chayHook('khong-phai-json', { timDot }).ma, 0);
});

test('đóng khi lỗi: lệnh S4 + lỗi nội bộ → 2 «lỗi nội bộ»', () => {
  const { dot, wt, timDot } = dung();
  fs.writeFileSync(path.join(dot, 'dieu-phoi.config.json'), '{hong');
  const kq = chayHook(wf(wt), { timDot });
  assert.equal(kq.ma, 2);
  assert.match(kq.loi, /^chan-s4: lỗi nội bộ: .* — chặn để an toàn; báo phiên giám sát$/);
  assert.equal(chayHook('{"tool_name":"Workflow","x": acceptance-verify.js', { timDot }).ma, 2);
});
