import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chamNhip } from '../hook-nhip.mjs';
import { xuLyChoNguoi } from '../hook-cho-nguoi.mjs';

const tam = () => fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'dp-')));
function dung() {
  const dot = tam();
  const wt = tam();
  fs.writeFileSync(path.join(dot, 'hang-viec.json'), JSON.stringify({ day: [{ id: 'P1', worktree: wt }], hang: [] }));
  return { dot, wt, timDot: () => dot };
}

test('chamNhip: chỉ chạm khoá mà phiên này giữ', () => {
  const { dot, wt, timDot } = dung();
  for (const [tn, w] of [['s4', wt], ['merge', '/khac']]) {
    fs.mkdirSync(path.join(dot, 'khoa', tn), { recursive: true });
    fs.writeFileSync(path.join(dot, 'khoa', tn, 'chu.json'), JSON.stringify({ phien: 'P1', worktree: w }));
  }
  assert.deepEqual(chamNhip({ cwd: wt }, { timDot }), ['s4']);
  assert.equal(fs.existsSync(path.join(dot, 'khoa', 's4', 'nhip')), true);
  assert.equal(fs.existsSync(path.join(dot, 'khoa', 'merge', 'nhip')), false);
  assert.deepEqual(chamNhip({ cwd: wt }, { timDot: () => null }), []);
});

test('chờ người: idle_prompt ghi; UserPromptSubmit xoá; loại khác bỏ qua', () => {
  const { dot, wt, timDot } = dung();
  const tep = path.join(dot, 'cho-nguoi', 'P1.json');
  assert.equal(xuLyChoNguoi({ hook_event_name: 'Notification', notification_type: 'idle_prompt', message: 'Claude đang chờ', cwd: wt, session_id: 's1' }, { timDot }), 'ghi');
  const ghi = JSON.parse(fs.readFileSync(tep, 'utf8'));
  assert.deepEqual([ghi.phien, ghi.loai, ghi.tin, ghi.session_id], ['P1', 'idle_prompt', 'Claude đang chờ', 's1']);
  assert.equal(xuLyChoNguoi({ hook_event_name: 'Notification', notification_type: 'auth_success', cwd: wt }, { timDot }), 'bo-qua');
  assert.equal(xuLyChoNguoi({ hook_event_name: 'UserPromptSubmit', cwd: wt }, { timDot }), 'xoa');
  assert.equal(fs.existsSync(tep), false);
});

test('chờ người — chiều im: đang có đơn xin hoặc yêu cầu chưa trả lời thì không vào hộp quyết định', () => {
  const { dot, wt, timDot } = dung();
  const tb = { hook_event_name: 'Notification', notification_type: 'idle_prompt', cwd: wt };
  fs.mkdirSync(path.join(dot, 'xin'));
  fs.writeFileSync(path.join(dot, 'xin', 'P1-s4.json'), '{}');
  assert.equal(xuLyChoNguoi(tb, { timDot }), 'cho-luot');
  fs.rmSync(path.join(dot, 'xin', 'P1-s4.json'));
  fs.mkdirSync(path.join(dot, 'yeu-cau'));
  fs.writeFileSync(path.join(dot, 'yeu-cau', 'P1-3.json'), JSON.stringify({ id: 'P1-3' }));
  assert.equal(xuLyChoNguoi(tb, { timDot }), 'cho-tra-loi');
  fs.mkdirSync(path.join(dot, 'tra-loi'));
  fs.writeFileSync(path.join(dot, 'tra-loi', 'P1-3.json'), '{}');
  assert.equal(xuLyChoNguoi(tb, { timDot }), 'ghi');
  assert.equal(fs.existsSync(path.join(dot, 'cho-nguoi', 'P1.json')), true);
});

test('chờ người: ngoài đợt và phiên không phải thợ', () => {
  const { timDot } = dung();
  assert.equal(xuLyChoNguoi({ hook_event_name: 'UserPromptSubmit', cwd: tam() }, { timDot: () => null }), 'ngoai-dot');
  assert.equal(xuLyChoNguoi({ hook_event_name: 'UserPromptSubmit', cwd: tam() }, { timDot }), 'khong-phai-tho');
});
