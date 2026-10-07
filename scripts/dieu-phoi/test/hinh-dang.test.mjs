import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NHIP, PHUT_MS } from '../cau-hinh.mjs';
import { LOAI_DON, kiemCauHinh, kiemHangViec } from '../hinh-dang.mjs';
import { taoVong } from '../phat-lich.mjs';
import { CFG_BIEN, CFG_PHAT_LICH, hangViecHai } from './mau-thu.mjs';

const MAU = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'mau');
const tam = () => fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'dp-')));
const sao = (x) => JSON.parse(JSON.stringify(x));
const NOW = Date.parse('2026-10-05T12:00:00Z');
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

test('kiemCauHinh: ma trận mười sáu ô sai → lỗi nêu đúng trường; mẫu + goc_kho qua', () => {
  const giuNhipPhut = NHIP.giuNhipMs / PHUT_MS;
  const o = [
    ['bao_ve chuỗi', (c) => { c.bao_ve = 'packages/db/prisma/**'; }, /^Error: dieu-phoi\.config\.json: bao_ve phải là danh sách chuỗi$/],
    ['bao_ve phần tử số', (c) => { c.bao_ve = ['a', 3]; }, /^Error: dieu-phoi\.config\.json: bao_ve phải là danh sách chuỗi$/],
    ...LOAI_DON.map((loai) => [`thiếu han_thue_phut.${loai}`, (c) => { delete c.han_thue_phut[loai]; }, new RegExp(`^Error: dieu-phoi\\.config\\.json: han_thue_phut\\.${loai} phải là số phút dương$`)]),
    ['han_thue_phut.s4 bằng 0', (c) => { c.han_thue_phut.s4 = 0; }, /^Error: dieu-phoi\.config\.json: han_thue_phut\.s4 phải là số phút dương$/],
    ['nhip_cu_phut chuỗi', (c) => { c.nhip_cu_phut = 'muoi'; }, /^Error: dieu-phoi\.config\.json: nhip_cu_phut phải là số phút$/],
    ['nhip_cu_phut bằng chu kỳ giữ nhịp', (c) => { c.nhip_cu_phut = giuNhipPhut; }, new RegExp(`^Error: dieu-phoi\\.config\\.json: nhip_cu_phut phải lớn hơn chu kỳ giữ nhịp ${giuNhipPhut} phút$`)],
    ['thiếu s4_tran_gom_phut', (c) => { delete c.s4_tran_gom_phut; }, /^Error: dieu-phoi\.config\.json: s4_tran_gom_phut phải là số phút dương$/],
    ...['swap_gb', 'ap_luc_muc', 'rss_gb'].map((k) => [`thiếu suc_khoe.${k}`, (c) => { delete c.suc_khoe[k]; }, new RegExp(`^Error: dieu-phoi\\.config\\.json: suc_khoe\\.${k} phải là số$`)]),
    ['nhanh_chinh rỗng', (c) => { c.nhanh_chinh = ''; }, /^Error: dieu-phoi\.config\.json: nhanh_chinh phải là chuỗi không rỗng$/],
    ['goc_kho rỗng', (c) => { c.goc_kho = ''; }, /^Error: dieu-phoi\.config\.json: goc_kho phải là chuỗi không rỗng$/],
    ['khoá lạ', (c) => { c.tick_giayy = 5; }, /^Error: dieu-phoi\.config\.json: khoá lạ tick_giayy$/],
  ];
  assert.equal(o.length, 16);
  let daKiem = 0;
  for (const [ten, sua, mong] of o) {
    const c = sao(CFG_BIEN);
    sua(c);
    assert.throws(() => kiemCauHinh(c), mong, ten);
    daKiem++;
  }
  assert.equal(daKiem, o.length);
  const mau = JSON.parse(fs.readFileSync(path.join(MAU, 'dieu-phoi.config.json'), 'utf8'));
  assert.doesNotThrow(() => kiemCauHinh({ ...mau, goc_kho: '/kho' }, { canGocKho: true }));
  assert.throws(() => kiemCauHinh(mau, { canGocKho: true }), /^Error: dieu-phoi\.config\.json: goc_kho phải là chuỗi không rỗng$/);
  assert.doesNotThrow(() => kiemCauHinh(mau));
  assert.doesNotThrow(() => kiemCauHinh(sao(CFG_BIEN)));
  assert.doesNotThrow(() => kiemCauHinh(sao(CFG_PHAT_LICH)));
});

test('kiemHangViec: ma trận mười ba ô sai → lỗi nêu đúng trường; mẫu và fixture qua', () => {
  const goc = () => hangViecHai({ dot: 'thu', w1: '/a', w2: '/b' });
  const o = [
    ['day không phải mảng', (h) => { h.day = {}; }, /^Error: hang-viec\.json: day phải là danh sách$/],
    ['dãy thiếu id', (h) => { delete h.day[0].id; }, /^Error: hang-viec\.json: day\[0\]\.id phải là chuỗi không rỗng$/],
    ['dãy thiếu worktree', (h) => { delete h.day[0].worktree; }, /^Error: hang-viec\.json: day\[0\]\.worktree phải là chuỗi không rỗng$/],
    ['id trùng', (h) => { h.day[1].id = 'P1'; }, /^Error: hang-viec\.json: day\[1\]\.id P1 bị trùng$/],
    ['hàng thiếu slug', (h) => { delete h.hang[0].slug; }, /^Error: hang-viec\.json: hang\[0\]\.slug phải là chuỗi không rỗng$/],
    ['hàng trỏ phiên không có', (h) => { h.hang[0].day = 'P9'; }, /^Error: hang-viec\.json: hang\[0\]\.day P9 không có trong day$/],
    ['sau là chuỗi', (h) => { h.hang[1].sau = 'A'; }, /^Error: hang-viec\.json: hang\[1\]\.sau phải là danh sách chuỗi$/],
    ['ranh_gioi là chuỗi', (h) => { h.hang[0].ranh_gioi = 'apps/a/**'; }, /^Error: hang-viec\.json: hang\[0\]\.ranh_gioi phải là danh sách chuỗi$/],
    ['chung_chi_them là chuỗi', (h) => { h.hang[0].chung_chi_them = 'apps/app/lib/messages/*.ts'; }, /^Error: hang-viec\.json: hang\[0\]\.chung_chi_them phải là danh sách chuỗi$/],
    ['uu_tien là chuỗi', (h) => { h.hang[0].uu_tien = '1'; }, /^Error: hang-viec\.json: hang\[0\]\.uu_tien phải là số$/],
    ['khoá lạ ở gốc', (h) => { h.ghi_chu = 'x'; }, /^Error: hang-viec\.json: khoá lạ ghi_chu$/],
    ['khoá lạ ở dãy', (h) => { h.day[0].ten = 'x'; }, /^Error: hang-viec\.json: khoá lạ day\[0\]\.ten$/],
    ['khoá lạ ở hàng', (h) => { h.hang[0].ten = 'x'; }, /^Error: hang-viec\.json: khoá lạ hang\[0\]\.ten$/],
  ];
  assert.equal(o.length, 13);
  let daKiem = 0;
  for (const [ten, sua, mong] of o) {
    const h = goc();
    sua(h);
    assert.throws(() => kiemHangViec(h), mong, ten);
    daKiem++;
  }
  assert.equal(daKiem, o.length);
  const mau = JSON.parse(fs.readFileSync(path.join(MAU, 'hang-viec.json'), 'utf8'));
  assert.doesNotThrow(() => kiemHangViec(mau));
  assert.doesNotThrow(() => kiemHangViec({ ...mau, dot: 'thu' }));
  assert.doesNotThrow(() => kiemHangViec(goc()));
  assert.doesNotThrow(() => kiemHangViec(hangViecHai({ dot: 'thu', w1: '/a', w2: '/b', link: true })));
  assert.doesNotThrow(() => kiemHangViec({ dot: 'thu', day: [{ id: 'P1', worktree: '/a' }], hang: [] }));
});

function dungDot(cfg) {
  const dot = tam();
  const w1 = tam();
  const w2 = tam();
  fs.writeFileSync(path.join(dot, 'dieu-phoi.config.json'), JSON.stringify(cfg));
  fs.writeFileSync(path.join(dot, 'hang-viec.json'), JSON.stringify(hangViecHai({ dot: 'thu', w1, w2 })));
  for (const d of ['khoa', 'xin', 'yeu-cau', 'tra-loi', 'cho-nguoi', 'tiep']) fs.mkdirSync(path.join(dot, d));
  fs.writeFileSync(path.join(dot, 'yeu-cau', 'P1-1.json'), JSON.stringify({ phien: 'P1', loai: 'cham-tep', hang: 'A', noi_dung: { tep: ['packages/db/prisma/schema.prisma'] }, luc: '2026-10-05T11:59:00Z' }));
  fs.writeFileSync(path.join(dot, 'xin', 'P2-duong-nen.json'), JSON.stringify({ phien: 'P2', slug: 'b', loai: 'duong-nen', luc: '2026-10-05T11:58:00Z', worktree: w2 }));
  return dot;
}
const suKien = (dot) => fs.readFileSync(path.join(dot, 'su-kien.jsonl'), 'utf8').trim().split('\n').map((d) => JSON.parse(d));

test('nhịp thật với cấu hình sai: bao_ve chuỗi không duyệt tệp bảo vệ; thiếu han_thue_phut duong-nen không kẹt khoá', async () => {
  const dongHo = () => NOW;
  const cfgBaoVeChuoi = { ...sao(CFG_BIEN), bao_ve: 'packages/db/prisma/**' };
  const thieuLoai = sao(CFG_BIEN);
  delete thieuLoai.han_thue_phut['duong-nen'];
  for (const [cfg, truong] of [[cfgBaoVeChuoi, 'bao_ve'], [thieuLoai, 'han_thue_phut']]) {
    const dot = dungDot(cfg);
    const vong = taoVong(dot, IO, dongHo);
    await vong();
    await vong();
    assert.deepEqual(fs.readdirSync(path.join(dot, 'tra-loi')), [], truong);
    assert.equal(fs.existsSync(path.join(dot, 'khoa', 'duong-nen')), false, truong);
    assert.equal(fs.existsSync(path.join(dot, 'ranh-gioi-them.json')), false, truong);
    const loi = suKien(dot).filter((s) => s.loai === 'loi-nhip');
    assert.equal(loi.length, 1, truong);
    assert.equal(loi[0].can_phan, true);
    assert.ok(loi[0].ly_do.startsWith(`dieu-phoi.config.json: ${truong}`), loi[0].ly_do);
  }
  const dot = dungDot({ ...sao(CFG_BIEN), bao_ve: ['packages/db/prisma/**'] });
  await taoVong(dot, IO, dongHo)();
  const yc = suKien(dot).find((s) => s.loai === 'yeu-cau' && s.id === 'P1-1');
  assert.equal(yc.can_phan, true);
  assert.equal(yc.ly_do, 'packages/db/prisma/schema.prisma thuộc danh sách bảo vệ');
  assert.deepEqual(fs.readdirSync(path.join(dot, 'tra-loi')), []);
  const chu = JSON.parse(fs.readFileSync(path.join(dot, 'khoa', 'duong-nen', 'chu.json'), 'utf8'));
  assert.equal(chu.cap_luc, new Date(NOW).toISOString());
  assert.equal(Date.parse(chu.han_thue_den) - Date.parse(chu.cap_luc), 40 * PHUT_MS);
  assert.equal(suKien(dot).filter((s) => s.loai === 'loi-nhip').length, 0);
});

test('bộ phát lịch đòi goc_kho lúc khởi động; một nhịp thì không', async () => {
  const cfg = sao(CFG_BIEN);
  delete cfg.goc_kho;
  const dot = dungDot(cfg);
  const r = spawnSync(process.execPath, [path.join(MAU, '..', 'phat-lich.mjs'), dot], { encoding: 'utf8', timeout: 10_000 });
  assert.equal(r.status, 1);
  assert.equal(r.stderr.trim(), 'phat-lich: dieu-phoi.config.json: goc_kho phải là chuỗi không rỗng');
  await taoVong(dot, IO, () => NOW)();
  assert.equal(fs.existsSync(path.join(dot, 'khoa', 'duong-nen', 'chu.json')), true);
  assert.equal(suKien(dot).filter((s) => s.loai === 'loi-nhip').length, 0);
});
