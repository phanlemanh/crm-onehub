import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chayHook, lenhBoc, phanLoai } from '../hook-chan-s4.mjs';
import { CFG_BIEN } from './mau-thu.mjs';

const tam = () => fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'dp-')));
function dung() {
  const dot = tam();
  const wt = tam();
  fs.writeFileSync(path.join(dot, 'dieu-phoi.config.json'), JSON.stringify(CFG_BIEN));
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

test('cấu hình sai hình dạng (JSON đúng): lệnh S4 → 2 lỗi nội bộ nêu tệp; lệnh thường → 0', () => {
  const { dot, wt, timDot } = dung();
  fs.writeFileSync(path.join(dot, 'dieu-phoi.config.json'), JSON.stringify({ ...CFG_BIEN, bao_ve: 'packages/db/prisma/**' }));
  const kq = chayHook(wf(wt), { timDot });
  assert.equal(kq.ma, 2);
  assert.match(kq.loi, /^chan-s4: lỗi nội bộ: dieu-phoi\.config\.json: bao_ve phải là danh sách chuỗi — chặn để an toàn; báo phiên giám sát$/);
  assert.deepEqual(chayHook(bash(wt, 'git status'), { timDot }), { ma: 0 });
});

test('hang-viec.json sai không đổi hook chặn S4', () => {
  const { dot, wt, timDot } = dung();
  fs.writeFileSync(path.join(dot, 'hang-viec.json'), JSON.stringify({ dot: 'thu', day: {}, hang: [] }));
  assert.deepEqual(chayHook(bash(wt, 'git status'), { timDot }), { ma: 0 });
  fs.mkdirSync(path.join(dot, 'khoa', 's4'), { recursive: true });
  fs.writeFileSync(path.join(dot, 'khoa', 's4', 'chu.json'), JSON.stringify({ phien: 'P1', worktree: wt }));
  assert.deepEqual(chayHook(wf(wt), { timDot }), { ma: 0 });
});

const META = (ten, moTa = 'S4 VERIFY') => `export const meta = {\n  name: '${ten}',\n  description: '${moTa}',\n};\nexport default async function chay() {}\n`;
function thuMucWf() {
  const d = tam();
  fs.writeFileSync(path.join(d, 'acceptance-verify.js'), META('acceptance-verify'));
  fs.writeFileSync(path.join(d, 'acceptance-verify-dieu-phoi-va-bien-r2.js'), META('acceptance-verify'));
  fs.writeFileSync(path.join(d, 's4-r3.js'), META('acceptance-verify'));
  fs.writeFileSync(path.join(d, 'execute-parallel.js'), META('execute-parallel', 'chạy trước acceptance-verify'));
  return d;
}
const goiWf = (cwd, tool_input) => JSON.stringify({ tool_name: 'Workflow', cwd, tool_input });

test('S4 workflow mọi đường vào: năm dạng → chặn khi chưa có lượt, 0 khi khoá đúng worktree', () => {
  const { dot, wt, timDot } = dung();
  const d = thuMucWf();
  const dang = [
    ['tên gốc', { scriptPath: path.join(d, 'acceptance-verify.js') }],
    ['tên bản chép', { scriptPath: path.join(d, 'acceptance-verify-dieu-phoi-va-bien-r2.js') }],
    ['tên lạ có meta', { scriptPath: path.join(d, 's4-r3.js') }],
    ['gọi theo name', { name: 'acceptance-verify' }],
    ['script nội tuyến', { script: META('acceptance-verify') }],
  ];
  assert.equal(dang.length, 5);
  let soChan = 0;
  for (const [ten, vao] of dang) {
    const kq = chayHook(goiWf(wt, vao), { timDot });
    assert.equal(kq.ma, 2, ten);
    assert.match(kq.loi, /^chan-s4: khoá s4 đang trống nhưng chưa cấp cho phiên này\. Ghi đơn xin\/<phiên>-s4\.json/, ten);
    soChan++;
  }
  assert.equal(soChan, dang.length);
  fs.mkdirSync(path.join(dot, 'khoa', 's4'), { recursive: true });
  fs.writeFileSync(path.join(dot, 'khoa', 's4', 'chu.json'), JSON.stringify({ phien: 'P1', worktree: wt }));
  let soQua = 0;
  for (const [ten, vao] of dang) {
    assert.deepEqual(chayHook(goiWf(wt, vao), { timDot }), { ma: 0 }, ten);
    soQua++;
  }
  assert.equal(soQua, dang.length);
});

test('chiều im S4 workflow: meta khác, tệp vắng, script khác → 0; đầu vào hỏng nhắc bản chép → 2', () => {
  const { wt, timDot } = dung();
  const d = thuMucWf();
  const im = [
    ['meta khác', { scriptPath: path.join(d, 'execute-parallel.js') }],
    ['tệp vắng tên khác', { scriptPath: path.join(d, 's4-r9.js') }],
    ['script khác', { script: META('khac', 'gọi acceptance-verify sau') }],
  ];
  for (const [ten, vao] of im) assert.deepEqual(chayHook(goiWf(wt, vao), { timDot }), { ma: 0 }, ten);
  fs.writeFileSync(path.join(d, 'execute-parallel.js'), META('acceptance-verify'));
  assert.equal(chayHook(goiWf(wt, { scriptPath: path.join(d, 'execute-parallel.js') }), { timDot }).ma, 2);
  const hong = chayHook('{"tool_name":"Workflow","tool_input":{"scriptPath":"/w/acceptance-verify-x-r2.js"', { timDot });
  assert.equal(hong.ma, 2);
  assert.match(hong.loi, /^chan-s4: lỗi nội bộ: .* — chặn để an toàn; báo phiên giám sát$/);
});

test('giữ khoá mà chạy nền lệnh nặng không bọc → 2 kèm lệnh bọc; bọc, tiền cảnh, lệnh thường → 0', () => {
  const { dot, wt, timDot } = dung();
  for (const tn of ['s4', 'duong-nen']) {
    fs.mkdirSync(path.join(dot, 'khoa', tn), { recursive: true });
    fs.writeFileSync(path.join(dot, 'khoa', tn, 'chu.json'), JSON.stringify({ phien: 'P1', worktree: wt }));
  }
  const nen = (command, run_in_background = true) => JSON.stringify({ tool_name: 'Bash', cwd: wt, tool_input: { command, run_in_background } });
  const lenh = 'node x/repin-lane.mjs --write';
  const o = [
    ['repin-lane nền không bọc', nen(lenh), 2, /^chan-s4: lệnh nền giữ khoá s4 phải chạy qua giu-nhip: node (\S+giu-nhip\.mjs) -- node x\/repin-lane\.mjs --write$/],
    ['duong-nen nền không bọc', nen('node k/duong-nen.mjs --root . --slug a'), 2, /^chan-s4: lệnh nền giữ khoá duong-nen phải chạy qua giu-nhip: node (\S+giu-nhip\.mjs) -- node k\/duong-nen\.mjs --root \. --slug a$/],
    ['nhắc giu-nhip mà không bọc', nen('node x/repin-lane.mjs --ghi-chu giu-nhip'), 2, /^chan-s4: lệnh nền giữ khoá s4 phải chạy qua giu-nhip: /],
    ['repin-lane nền có bọc', nen(lenhBoc(lenh)), 0, null],
    ['repin-lane tiền cảnh', nen(lenh, false), 0, null],
    ['lệnh không nặng chạy nền', nen('sleep 60'), 0, null],
  ];
  for (const [ten, raw, ma, mau] of o) {
    const kq = chayHook(raw, { timDot });
    assert.equal(kq.ma, ma, ten);
    if (mau) {
      const m = kq.loi.match(mau);
      assert.ok(m, `${ten}: ${kq.loi}`);
      if (m[1]) assert.equal(fs.existsSync(m[1]), true, m[1]);
    }
  }
  const trong = dung();
  const chua = chayHook(JSON.stringify({ tool_name: 'Bash', cwd: trong.wt, tool_input: { command: lenh, run_in_background: true } }), { timDot: trong.timDot });
  assert.equal(chua.ma, 2);
  assert.match(chua.loi, /^chan-s4: khoá s4 đang trống nhưng chưa cấp cho phiên này/);
});

test('dòng lệnh bọc chạy ra cùng kết quả như lệnh gốc: ma trận bảy dạng', () => {
  const { dot, wt, timDot } = dung();
  fs.mkdirSync(path.join(dot, 'khoa', 's4'), { recursive: true });
  fs.writeFileSync(path.join(dot, 'khoa', 's4', 'chu.json'), JSON.stringify({ phien: 'P1', worktree: wt }));
  fs.writeFileSync(path.join(wt, 'repin-lane.mjs'), "console.log(JSON.stringify({ argv: process.argv.slice(2), tz: process.env.TZ ?? null, x: process.env.X ?? null }));\n");
  fs.mkdirSync(path.join(wt, 'sub'));
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_') && k !== 'TZ'));
  env.X = 'gia-tri-x';
  const chay = (lenh) => spawnSync('bash', ['-c', lenh], { cwd: wt, env, encoding: 'utf8' });
  const dang = [
    ['lệnh trần', 'node ./repin-lane.mjs a b', { argv: ['a', 'b'], tz: null }],
    ['tiền tố biến môi trường', 'TZ=UTC node ./repin-lane.mjs a', { argv: ['a'], tz: 'UTC' }],
    ['cd &&', 'cd sub && node ../repin-lane.mjs c', { argv: ['c'], tz: null }],
    ['nháy đơn có khoảng trắng', "node ./repin-lane.mjs 'hai tu'", { argv: ['hai tu'], tz: null }],
    ['biến "$X"', 'node ./repin-lane.mjs "$X"', { argv: ['gia-tri-x'], tz: null }],
    ['ống | cat', 'node ./repin-lane.mjs p | cat', { argv: ['p'], tz: null }],
    ['đối số --slug=a', 'node ./repin-lane.mjs --slug=a', { argv: ['--slug=a'], tz: null }],
  ];
  assert.equal(dang.length, 7);
  let daDo = 0;
  for (const [ten, lenh, mong] of dang) {
    const goc = chay(lenh);
    assert.equal(goc.status, 0, `${ten}: lệnh gốc phải chạy được`);
    const raGoc = JSON.parse(goc.stdout);
    assert.deepEqual([raGoc.argv, raGoc.tz, raGoc.x], [mong.argv, mong.tz, 'gia-tri-x'], ten);
    const kq = chayHook(JSON.stringify({ tool_name: 'Bash', cwd: wt, tool_input: { command: lenh, run_in_background: true } }), { timDot });
    assert.equal(kq.ma, 2, ten);
    const boc = kq.loi.split('phải chạy qua giu-nhip: ')[1];
    assert.ok(boc, ten);
    const raBoc = chay(boc);
    assert.equal(raBoc.status, goc.status, `${ten}: mã thoát của dòng bọc — ${raBoc.stderr}`);
    assert.equal(raBoc.stdout, goc.stdout, ten);
    assert.deepEqual(chayHook(JSON.stringify({ tool_name: 'Bash', cwd: wt, tool_input: { command: boc, run_in_background: true } }), { timDot }), { ma: 0 }, ten);
    daDo++;
  }
  assert.equal(daDo, dang.length);
});
