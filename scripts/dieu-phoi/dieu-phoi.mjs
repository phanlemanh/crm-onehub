#!/usr/bin/env node
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { docJson, ghiJsonNguyenTu, ghiSuKien, gocKhoChinh, TEN_LIEN_KET } from './dot.mjs';

const DAY = path.dirname(fileURLToPath(import.meta.url));
const lienKet = (goc) => path.join(goc, '.acceptance-runs', TEN_LIEN_KET);

export function moDot(cwd, ten) {
  if (!/^[\w-]+$/.test(ten ?? '')) throw new Error('tên đợt chỉ gồm chữ, số, - và _');
  const goc = gocKhoChinh(cwd);
  const lk = lienKet(goc);
  if (fs.existsSync(lk)) {
    const dangChay = path.basename(fs.realpathSync(lk)).replace(/^dieu-phoi-/, '');
    throw new Error(`đợt ${dangChay} đang chạy — đóng nó trước`);
  }
  const thuMuc = path.join(goc, '.acceptance-runs', `dieu-phoi-${ten}`);
  for (const d of ['khoa', 'xin', 'yeu-cau', 'tra-loi', 'cho-nguoi', 'tiep']) fs.mkdirSync(path.join(thuMuc, d), { recursive: true });
  for (const f of ['LUAT.md', 'hang-viec.json', 'dieu-phoi.config.json']) {
    const dich = path.join(thuMuc, f);
    if (!fs.existsSync(dich)) fs.copyFileSync(path.join(DAY, 'mau', f), dich);
  }
  const cfg = docJson(path.join(thuMuc, 'dieu-phoi.config.json'));
  ghiJsonNguyenTu(path.join(thuMuc, 'dieu-phoi.config.json'), { ...cfg, goc_kho: goc });
  const hv = docJson(path.join(thuMuc, 'hang-viec.json'));
  if (!hv.dot) ghiJsonNguyenTu(path.join(thuMuc, 'hang-viec.json'), { ...hv, dot: ten });
  fs.symlinkSync(thuMuc, lk);
  ghiSuKien(thuMuc, { loai: 'mo-dot', ten });
  return fs.realpathSync(thuMuc);
}

function thuMucHienTai(cwd) {
  const lk = lienKet(gocKhoChinh(cwd));
  if (!fs.existsSync(lk)) throw new Error('không có đợt nào đang chạy');
  return fs.realpathSync(lk);
}

function pidSong(thuMuc) {
  const p = path.join(thuMuc, 'phat-lich.pid');
  const pid = Number(fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : 0);
  if (!pid) return 0;
  try {
    process.kill(pid, 0);
    return pid;
  } catch {
    return 0;
  }
}

export function chayPhatLich(cwd) {
  const thuMuc = thuMucHienTai(cwd);
  const pid = pidSong(thuMuc);
  if (pid) return `bộ phát lịch đang chạy (pid ${pid})`;
  const log = fs.openSync(path.join(thuMuc, 'phat-lich.log'), 'a');
  const con = spawn(process.execPath, [path.join(DAY, 'phat-lich.mjs'), thuMuc], { detached: true, stdio: ['ignore', log, log] });
  con.unref();
  ghiSuKien(thuMuc, { loai: 'chay', pid: con.pid });
  return `đã chạy bộ phát lịch (pid ${con.pid})`;
}

export function dungPhatLich(cwd) {
  const thuMuc = thuMucHienTai(cwd);
  const pid = pidSong(thuMuc);
  if (pid) process.kill(pid, 'SIGTERM');
  ghiSuKien(thuMuc, { loai: 'dung', pid });
  return pid ? `đã dừng pid ${pid}` : 'bộ phát lịch không chạy';
}

export function dongDot(cwd) {
  const thuMuc = thuMucHienTai(cwd);
  dungPhatLich(cwd);
  fs.rmSync(lienKet(gocKhoChinh(cwd)));
  ghiSuKien(thuMuc, { loai: 'dong-dot' });
}

function xem(cwd) {
  const tt = docJson(path.join(thuMucHienTai(cwd), 'trang-thai.json'), null);
  if (!tt) return 'chưa có nhịp nào';
  const khoa = tt.khoa.map((k) => `${k.tai_nguyen}:${k.phien}`).join(' ') || 'trống';
  return `đợt ${tt.dot} · ${tt.trang_thai} · nhịp ${tt.nhip_cuoi} · khoá ${khoa} · chờ lượt ${tt.hang_cho.length} · chờ người ${tt.cho_nguoi.length}`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  const [lenh, doiSo] = process.argv.slice(2);
  const cwd = process.cwd();
  try {
    const viec = {
      mo: () => moDot(cwd, doiSo),
      chay: () => chayPhatLich(cwd),
      dung: () => dungPhatLich(cwd),
      dong: () => dongDot(cwd) ?? 'đã đóng đợt: bộ phát lịch dừng, hook im',
      xem: () => xem(cwd),
    }[lenh];
    if (!viec) throw new Error('dùng: dieu-phoi.mjs <mo <tên>|chay|dung|dong|xem>');
    process.stdout.write(`${viec()}\n`);
  } catch (e) {
    process.stderr.write(`dieu-phoi: ${e.message}\n`);
    process.exit(1);
  }
}
