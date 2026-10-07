import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { giuPid, motNhip, taoVong, trangThaiHopDong } from '../phat-lich.mjs';

const tam = () => fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'dp-')));
const NOW = Date.parse('2026-10-05T12:00:00Z');
const CFG = {
  nhanh_chinh: 'onehub',
  han_thue_phut: { s4: 90, 'ghim-lai': 40, 'duong-nen': 40, merge: 120 },
  nhip_cu_phut: 10,
  suc_khoe: { swap_gb: 8, ap_luc_muc: 2, rss_gb: 8 },
  bao_ve: [],
  s4_tran_gom_phut: 60,
};
function dung({ swapUsed = 1024 } = {}) {
  const dot = tam();
  const w1 = tam();
  const w2 = tam();
  fs.writeFileSync(path.join(dot, 'dieu-phoi.config.json'), JSON.stringify(CFG));
  fs.writeFileSync(path.join(dot, 'hang-viec.json'), JSON.stringify({
    dot: 'thu',
    day: [{ id: 'P1', worktree: w1, link: 'claude://x/1' }, { id: 'P2', worktree: w2, link: 'claude://x/2' }],
    hang: [
      { ma: 'A', slug: 'a', day: 'P1', moc: '2026-10-12', uu_tien: 1, ranh_gioi: ['apps/a/**'] },
      { ma: 'B', slug: 'b', day: 'P2', moc: '2026-10-14', uu_tien: 1, ranh_gioi: ['apps/b/**'] },
    ],
  }));
  for (const d of ['khoa', 'xin', 'yeu-cau', 'tra-loi', 'cho-nguoi', 'tiep']) fs.mkdirSync(path.join(dot, d));
  const io = {
    nowMs: () => NOW,
    chay: (cmd, args) => {
      if (cmd === 'sysctl' && args[0] === 'vm.swapusage') return `total = 24576.00M  used = ${swapUsed}.00M  free = 1.00M`;
      if (cmd === 'sysctl' && args.includes('kern.memorystatus_vm_pressure_level')) return '1';
      if (cmd === 'sysctl') return '{ 3.00 2.00 1.00 }';
      if (cmd === 'ps') return '102400 node\n';
      if (cmd === 'gh') return '[]';
      if (cmd === 'git' && args[0] === 'show') throw new Error('not found');
      return '';
    },
  };
  return { dot, w1, w2, io };
}
const xin = (dot, ten, du) => fs.writeFileSync(path.join(dot, 'xin', `${ten}.json`), JSON.stringify(du));
const suKien = (dot) => fs.readFileSync(path.join(dot, 'su-kien.jsonl'), 'utf8').trim().split('\n').map((d) => JSON.parse(d));

test('trangThaiHopDong đọc status trong frontmatter', () => {
  assert.equal(trangThaiHopDong('---\nslug: a\nstatus: signed-off\n---\n'), 'signed-off');
  assert.equal(trangThaiHopDong('khong co'), null);
});

test('cấp lượt theo mốc: P1 (mốc 12/10) trước P2 (14/10); đơn được xoá; chu.json đủ trường', async () => {
  const { dot, w1, w2, io } = dung();
  xin(dot, 'P2-s4', { phien: 'P2', slug: 'b', loai: 's4', luc: '2026-10-05T11:00:00Z', worktree: w2 });
  xin(dot, 'P1-s4', { phien: 'P1', slug: 'a', loai: 's4', luc: '2026-10-05T11:30:00Z', worktree: w1 });
  await motNhip(dot, io);
  const chu = JSON.parse(fs.readFileSync(path.join(dot, 'khoa', 's4', 'chu.json'), 'utf8'));
  assert.deepEqual([chu.phien, chu.slug, chu.loai, chu.worktree, chu.han_thue_den], ['P1', 'a', 's4', w1, '2026-10-05T13:30:00.000Z']);
  assert.equal(fs.existsSync(path.join(dot, 'xin', 'P1-s4.json')), false);
  assert.equal(fs.existsSync(path.join(dot, 'xin', 'P2-s4.json')), true);
  assert.ok(suKien(dot).some((s) => s.loai === 'cap' && s.phien === 'P1'));
});

test('nhả khoá → nhịp sau cấp cho người kế (không bao giờ trống khi còn đơn)', async () => {
  const { dot, w2, io } = dung();
  fs.mkdirSync(path.join(dot, 'khoa', 's4'));
  fs.writeFileSync(path.join(dot, 'khoa', 's4', 'chu.json'), JSON.stringify({ phien: 'P1', loai: 's4', worktree: '/w1', han_thue_den: '2026-10-05T13:00:00Z' }));
  xin(dot, 'P2-s4', { phien: 'P2', slug: 'b', loai: 's4', luc: '2026-10-05T11:00:00Z', worktree: w2 });
  await motNhip(dot, io);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dot, 'khoa', 's4', 'chu.json'), 'utf8')).phien, 'P1');
  fs.rmSync(path.join(dot, 'khoa', 's4'), { recursive: true });
  await motNhip(dot, io);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dot, 'khoa', 's4', 'chu.json'), 'utf8')).phien, 'P2');
});

test('hạn thuê: hết hạn + nhịp cũ → thu hồi + can_phan; thư mục khoá trống quá 60″ → thu hồi', async () => {
  const { dot, io } = dung();
  fs.mkdirSync(path.join(dot, 'khoa', 's4'));
  fs.writeFileSync(path.join(dot, 'khoa', 's4', 'chu.json'), JSON.stringify({ phien: 'P1', loai: 's4', worktree: '/w1', cap_luc: '2026-10-05T09:00:00Z', han_thue_den: '2026-10-05T10:30:00Z' }));
  fs.mkdirSync(path.join(dot, 'khoa', 'merge'));
  const cu = new Date(NOW - 120_000);
  fs.utimesSync(path.join(dot, 'khoa', 'merge'), cu, cu);
  await motNhip(dot, io);
  assert.equal(fs.existsSync(path.join(dot, 'khoa', 's4')), false);
  assert.equal(fs.existsSync(path.join(dot, 'khoa', 'merge')), false);
  const sk = suKien(dot).filter((s) => s.loai === 'thu-hoi');
  assert.equal(sk.length, 2);
  assert.ok(sk.every((s) => s.can_phan === true));
});

test('giảm tải: không cấp s4; đúng một sự kiện can_phan khi vào giảm tải', async () => {
  const { dot, w1, io } = dung({ swapUsed: 22835 });
  xin(dot, 'P1-s4', { phien: 'P1', slug: 'a', loai: 's4', luc: '2026-10-05T11:00:00Z', worktree: w1 });
  await motNhip(dot, io);
  await motNhip(dot, io);
  assert.equal(fs.existsSync(path.join(dot, 'khoa', 's4')), false);
  assert.equal(suKien(dot).filter((s) => s.loai === 'giam-tai').length, 1);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dot, 'trang-thai.json'), 'utf8')).trang_thai, 'giam-tai');
});

test('đơn hỏng → xin/hong/ + can_phan, nhịp vẫn chạy tiếp', async () => {
  const { dot, w1, io } = dung();
  fs.writeFileSync(path.join(dot, 'xin', 'P9-s4.json'), '{hong');
  xin(dot, 'P1-s4', { phien: 'P1', slug: 'a', loai: 's4', luc: '2026-10-05T11:00:00Z', worktree: w1 });
  await motNhip(dot, io);
  assert.equal(fs.existsSync(path.join(dot, 'xin', 'hong', 'P9-s4.json')), true);
  assert.ok(suKien(dot).some((s) => s.loai === 'don-hong' && s.can_phan === true));
  assert.equal(fs.existsSync(path.join(dot, 'khoa', 's4', 'chu.json')), true);
});

test('yêu cầu: chạm tệp được máy duyệt → tra-loi + ranh-gioi-them; việc cần phán → một can_phan, không lặp', async () => {
  const { dot, io } = dung();
  const ghi = (ten, du) => fs.writeFileSync(path.join(dot, 'yeu-cau', `${ten}.json`), JSON.stringify(du));
  ghi('P1-1', { id: 'P1-1', phien: 'P1', loai: 'cham-tep', hang: 'a', noi_dung: { tep: ['apps/x.ts'] }, luc: '2026-10-05T11:00:00Z' });
  ghi('P1-2', { id: 'P1-2', phien: 'P1', loai: 'hang-moi', hang: 'a', noi_dung: {}, luc: '2026-10-05T11:00:00Z' });
  await motNhip(dot, io);
  await motNhip(dot, io);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dot, 'tra-loi', 'P1-1.json'), 'utf8')).ket_qua, 'duyet');
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dot, 'ranh-gioi-them.json'), 'utf8')), { P1: ['apps/x.ts'] });
  assert.equal(fs.existsSync(path.join(dot, 'tra-loi', 'P1-2.json')), false);
  assert.equal(suKien(dot).filter((s) => s.loai === 'yeu-cau' && s.id === 'P1-2' && s.can_phan).length, 1);
});

test('hàng kế: ghi tiep/P1.json; trang-thai.json + bang.html có mặt', async () => {
  const { dot, io } = dung();
  await motNhip(dot, io);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dot, 'tiep', 'P1.json'), 'utf8')).hang, 'a');
  const tt = JSON.parse(fs.readFileSync(path.join(dot, 'trang-thai.json'), 'utf8'));
  assert.equal(tt.dot, 'thu');
  assert.ok(fs.readFileSync(path.join(dot, 'bang.html'), 'utf8').includes('Hộp quyết định'));
});

test('taoVong: fetch hỏng vẫn chạy nhịp; lỗi lặp chỉ báo một lần trong 30′', async () => {
  const { dot, io } = dung();
  const ioHong = { ...io, chay: (cmd, args) => { if (cmd === 'git' && args[0] === 'fetch') throw new Error('mất mạng'); return io.chay(cmd, args); } };
  let gio = 0;
  const vong = taoVong(dot, ioHong, () => gio);
  await vong();
  assert.equal(fs.existsSync(path.join(dot, 'trang-thai.json')), true);
  gio = 400_000;
  await vong();
  assert.equal(suKien(dot).filter((s) => s.loai === 'fetch-loi').length, 1);
  gio = 2_400_000;
  await vong();
  assert.equal(suKien(dot).filter((s) => s.loai === 'fetch-loi').length, 2);
});

test('giuPid: một tiến trình KHÁC còn sống đang giữ → từ chối; pid chết → nhận lại; chính mình → giữ', () => {
  const { dot } = dung();
  fs.writeFileSync(path.join(dot, 'phat-lich.pid'), String(process.ppid));
  assert.equal(giuPid(dot), false);
  fs.writeFileSync(path.join(dot, 'phat-lich.pid'), '999999');
  assert.equal(giuPid(dot), true);
  assert.equal(fs.readFileSync(path.join(dot, 'phat-lich.pid'), 'utf8'), String(process.pid));
  assert.equal(giuPid(dot), true);
});
