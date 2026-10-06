import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { phienCuaCwd, trongWorktree } from '../dot.mjs';
import { chayHook } from '../hook-chan-s4.mjs';
import { chamNhip } from '../hook-nhip.mjs';
import { motNhip } from '../phat-lich.mjs';
import { xetYeuCau } from '../yeu-cau.mjs';

const tam = () => fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'dp-')));
const NOW = Date.parse('2026-10-05T12:00:00Z');
const CFG = {
  nhanh_chinh: 'main',
  han_thue_phut: { s4: 90, 'ghim-lai': 40, 'duong-nen': 40, merge: 120 },
  nhip_cu_phut: 10,
  suc_khoe: { swap_gb: 8, ap_luc_muc: 2, rss_gb: 8 },
  bao_ve: ['packages/db/prisma/schema.prisma'],
  s4_tran_gom_phut: 60,
};
const IO = {
  nowMs: () => NOW,
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
function dung() {
  const dot = tam();
  const w1 = tam();
  const w2 = tam();
  fs.writeFileSync(path.join(dot, 'dieu-phoi.config.json'), JSON.stringify(CFG));
  fs.writeFileSync(path.join(dot, 'hang-viec.json'), JSON.stringify({
    dot: 'bien',
    day: [{ id: 'P1', worktree: w1 }, { id: 'P2', worktree: w2 }],
    hang: [
      { ma: 'A', slug: 'a', day: 'P1', moc: '2026-10-12', uu_tien: 1, ranh_gioi: ['apps/a/**'] },
      { ma: 'B', slug: 'b', day: 'P2', moc: '2026-10-14', uu_tien: 1, ranh_gioi: ['apps/b/**'] },
    ],
  }));
  for (const d of ['khoa', 'xin', 'yeu-cau', 'tra-loi', 'cho-nguoi', 'tiep']) fs.mkdirSync(path.join(dot, d));
  return { dot, w1, w2 };
}
const ghi = (p, du) => fs.writeFileSync(p, JSON.stringify(du));
const suKien = (dot) => fs.readFileSync(path.join(dot, 'su-kien.jsonl'), 'utf8').trim().split('\n').map((d) => JSON.parse(d));

test('đơn sai hình dạng → xin/hong/ + can_phan nêu trường; đơn lành cùng nhịp vẫn được cấp', async () => {
  const { dot, w2 } = dung();
  ghi(path.join(dot, 'xin', 'P1-s4.json'), { phien: 'P1', slug: 'a', loai: 's4', luc: '2026-10-05T10:00:00Z', worktree: '/khong/ton/tai' });
  ghi(path.join(dot, 'xin', 'P3-la.json'), { phien: 'P3', slug: 'a', loai: 'la', luc: '2026-10-05T10:01:00Z', worktree: w2 });
  ghi(path.join(dot, 'xin', 'P2-s4.json'), { phien: 'P2', slug: 'b', loai: 's4', luc: '2026-10-05T11:00:00Z', worktree: w2 });
  await motNhip(dot, IO);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dot, 'khoa', 's4', 'chu.json'), 'utf8')).phien, 'P2');
  assert.equal(fs.existsSync(path.join(dot, 'xin', 'hong', 'P1-s4.json')), true);
  assert.equal(fs.existsSync(path.join(dot, 'xin', 'hong', 'P3-la.json')), true);
  const hong = suKien(dot).filter((s) => s.loai === 'don-hong' && s.can_phan === true);
  assert.match(hong.find((s) => s.tep === 'P1-s4.json').ly_do, /^worktree \/khong\/ton\/tai không phải thư mục tồn tại$/);
  assert.match(hong.find((s) => s.tep === 'P3-la.json').ly_do, /^loai la không thuộc s4, ghim-lai, duong-nen, merge$/);
  assert.equal(fs.existsSync(path.join(dot, 'trang-thai.json')), true);
});

test('yêu cầu cham-tep với tep là chuỗi → yeu-cau/hong/ ở nhịp, can_phan ở hàm định tuyến', async () => {
  const { dot } = dung();
  ghi(path.join(dot, 'yeu-cau', 'P1-1.json'), { phien: 'P1', loai: 'cham-tep', hang: 'a', noi_dung: { tep: 'packages/db/prisma/schema.prisma' }, luc: '2026-10-05T11:00:00Z' });
  ghi(path.join(dot, 'yeu-cau', 'P1-2.json'), { phien: 'P1', loai: 'cham-tep', hang: 'a', noi_dung: { tep: ['apps/x.ts'] }, luc: '2026-10-05T11:00:00Z' });
  await motNhip(dot, IO);
  assert.equal(fs.existsSync(path.join(dot, 'yeu-cau', 'hong', 'P1-1.json')), true);
  assert.equal(fs.existsSync(path.join(dot, 'tra-loi', 'P1-1.json')), false);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dot, 'ranh-gioi-them.json'), 'utf8')), { P1: ['apps/x.ts'] });
  assert.ok(suKien(dot).some((s) => s.loai === 'yeu-cau-hong' && s.tep === 'P1-1.json' && s.can_phan === true && /noi_dung\.tep/.test(s.ly_do)));
  const hv = JSON.parse(fs.readFileSync(path.join(dot, 'hang-viec.json'), 'utf8'));
  const nc = { hangViec: hv, nhanhChamTep: new Map(), nhanhCua: () => null, yeuCauGanDay: [] };
  const chuoi = xetYeuCau({ id: 'y', phien: 'P1', loai: 'cham-tep', noi_dung: { tep: 'packages/db/prisma/schema.prisma' }, luc: 't' }, nc, CFG);
  assert.deepEqual([chuoi.ket_qua, chuoi.ly_do], ['can_phan', 'tep phải là danh sách đường dẫn']);
  const mang = xetYeuCau({ id: 'y', phien: 'P1', loai: 'cham-tep', noi_dung: { tep: ['apps/x.ts'] }, luc: 't' }, nc, CFG);
  assert.equal(mang.ket_qua, 'duyet');
});

test('cham-tep: tệp đã duyệt cho phiên khác → can_phan; chính phiên đó → duyệt; cả khi duyệt trong cùng nhịp', async () => {
  const hv = { day: [{ id: 'P1' }, { id: 'P2' }], hang: [] };
  const nc = { hangViec: hv, nhanhChamTep: new Map(), nhanhCua: () => null, yeuCauGanDay: [], ranhGioiThem: { P1: ['apps/x.ts'] } };
  const yc = (phien) => ({ id: 'y', phien, loai: 'cham-tep', noi_dung: { tep: ['apps/x.ts'] }, luc: 't' });
  const p2 = xetYeuCau(yc('P2'), nc, CFG);
  assert.deepEqual([p2.ket_qua, p2.ly_do], ['can_phan', 'apps/x.ts đã được duyệt cho P1']);
  assert.equal(xetYeuCau(yc('P1'), nc, CFG).ket_qua, 'duyet');
  const { dot } = dung();
  ghi(path.join(dot, 'yeu-cau', 'P1-1.json'), { phien: 'P1', loai: 'cham-tep', hang: 'a', noi_dung: { tep: ['apps/x.ts'] }, luc: '2026-10-05T11:00:00Z' });
  ghi(path.join(dot, 'yeu-cau', 'P2-1.json'), { phien: 'P2', loai: 'cham-tep', hang: 'b', noi_dung: { tep: ['apps/x.ts'] }, luc: '2026-10-05T11:01:00Z' });
  await motNhip(dot, IO);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dot, 'tra-loi', 'P1-1.json'), 'utf8')).ket_qua, 'duyet');
  assert.equal(fs.existsSync(path.join(dot, 'tra-loi', 'P2-1.json')), false);
  assert.ok(suKien(dot).some((s) => s.loai === 'yeu-cau' && s.id === 'P2-1' && s.can_phan === true && s.ly_do === 'apps/x.ts đã được duyệt cho P1'));
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dot, 'ranh-gioi-them.json'), 'utf8')), { P1: ['apps/x.ts'] });
});

test('worktree lồng: cwd trong worktree git lồng không thuộc khoá của checkout chính', () => {
  const chinh = tam();
  const git = (...a) => execFileSync('git', a, { cwd: chinh, stdio: 'ignore' });
  git('init', '-q');
  git('-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-q', '--allow-empty', '-m', 'goc');
  fs.mkdirSync(path.join(chinh, 'apps', 'con'), { recursive: true });
  const long = path.join(chinh, '.claude', 'worktrees', 'tho');
  git('worktree', 'add', '-q', '-b', 'tho', long);
  const longThuc = fs.realpathSync(long);
  assert.equal(trongWorktree(chinh, longThuc), false);
  assert.equal(trongWorktree(chinh, path.join(chinh, 'apps', 'con')), true);
  assert.equal(trongWorktree(chinh, chinh), true);
  assert.equal(trongWorktree(longThuc, longThuc), true);
  const hv = { day: [{ id: 'P0', worktree: chinh }, { id: 'P1', worktree: longThuc }] };
  assert.equal(phienCuaCwd(hv, longThuc), 'P1');
  assert.equal(phienCuaCwd({ day: [{ id: 'P0', worktree: chinh }] }, longThuc), null);
  const dot = tam();
  fs.writeFileSync(path.join(dot, 'dieu-phoi.config.json'), '{}');
  fs.mkdirSync(path.join(dot, 'khoa', 's4'), { recursive: true });
  fs.writeFileSync(path.join(dot, 'khoa', 's4', 'chu.json'), JSON.stringify({ phien: 'P0', worktree: chinh }));
  const wf = (cwd) => JSON.stringify({ tool_name: 'Workflow', cwd, tool_input: { scriptPath: '/x/acceptance-verify.js' } });
  const chan = chayHook(wf(longThuc), { timDot: () => dot });
  assert.equal(chan.ma, 2);
  assert.match(chan.loi, /^chan-s4: khoá s4 đang thuộc P0\./);
  assert.equal(chayHook(wf(path.join(chinh, 'apps', 'con')), { timDot: () => dot }).ma, 0);
  assert.deepEqual(chamNhip({ cwd: longThuc }, { timDot: () => dot }), []);
  assert.equal(fs.existsSync(path.join(dot, 'khoa', 's4', 'nhip')), false);
  assert.deepEqual(chamNhip({ cwd: chinh }, { timDot: () => dot }), ['s4']);
});
