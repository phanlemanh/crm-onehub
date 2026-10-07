import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chamNhip } from '../hook-nhip.mjs';
import { xuLyChoNguoi } from '../hook-cho-nguoi.mjs';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { CFG_BIEN } from './mau-thu.mjs';

const HOOK = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'hook-cho-nguoi.mjs');

const tam = () => fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'dp-')));
function dung() {
  const dot = tam();
  const wt = tam();
  fs.writeFileSync(path.join(dot, 'hang-viec.json'), JSON.stringify({ dot: 'thu', day: [{ id: 'P1', worktree: wt }], hang: [] }));
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

function dotThat(hangViec) {
  const goc = tam();
  execFileSync('git', ['init', '-q'], { cwd: goc });
  const dot = path.join(goc, '.acceptance-runs', 'dieu-phoi-thu');
  fs.mkdirSync(dot, { recursive: true });
  fs.symlinkSync(dot, path.join(goc, '.acceptance-runs', 'dieu-phoi-hien-tai'));
  fs.writeFileSync(path.join(dot, 'hang-viec.json'), JSON.stringify(hangViec(goc)));
  fs.writeFileSync(path.join(dot, 'dieu-phoi.config.json'), JSON.stringify({ ...CFG_BIEN, goc_kho: goc }));
  return { goc, dot };
}
const choNguoi = (dot) => (fs.existsSync(path.join(dot, 'cho-nguoi')) ? fs.readdirSync(path.join(dot, 'cho-nguoi')) : []);
const hookThat = (goc) => spawnSync(process.execPath, [HOOK], { cwd: goc, input: JSON.stringify({ hook_event_name: 'Notification', notification_type: 'idle_prompt', message: 'chờ', cwd: goc, session_id: 's1' }), encoding: 'utf8' });

test('chờ người với hang-viec.json sai hình dạng: không ghi cho-nguoi', () => {
  const sai = dotThat((goc) => ({ dot: 'thu', day: [{ id: 'P1', worktree: 42 }], hang: [] }));
  const tb = { hook_event_name: 'Notification', notification_type: 'idle_prompt', cwd: sai.goc };
  assert.throws(() => xuLyChoNguoi(tb, { timDot: () => fs.realpathSync(sai.dot) }), /^Error: hang-viec\.json: day\[0\]\.worktree phải là chuỗi không rỗng$/);
  const r = hookThat(sai.goc);
  assert.equal(r.status, 0);
  assert.deepEqual(choNguoi(sai.dot), []);
  const lanh = dotThat((goc) => ({ dot: 'thu', day: [{ id: 'P1', worktree: fs.realpathSync(goc) }], hang: [] }));
  assert.equal(hookThat(lanh.goc).status, 0);
  assert.deepEqual(choNguoi(lanh.dot), ['P1.json']);
});

test('cấu hình sai không đổi hook chờ người', () => {
  const { dot, wt, timDot } = dung();
  fs.writeFileSync(path.join(dot, 'dieu-phoi.config.json'), JSON.stringify({ ...CFG_BIEN, bao_ve: 'packages/**' }));
  assert.equal(xuLyChoNguoi({ hook_event_name: 'Notification', notification_type: 'idle_prompt', cwd: wt }, { timDot }), 'ghi');
  assert.equal(fs.existsSync(path.join(dot, 'cho-nguoi', 'P1.json')), true);
});
