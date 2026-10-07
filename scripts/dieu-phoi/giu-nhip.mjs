#!/usr/bin/env node
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { NHIP } from './cau-hinh.mjs';
import { timThuMucDot } from './dot.mjs';
import { chamNhip } from './hook-nhip.mjs';

const TIN_HIEU_CHUYEN = ['SIGTERM', 'SIGINT', 'SIGHUP'];
const MA_KHONG_CHAY = 127;
const MA_SAI_CACH_DUNG = 2;

const maCuaTinHieu = (ten) => 128 + (os.constants.signals[ten] ?? 0);

export function chayGiuNhip({ lenh, cwd = process.cwd(), moiMs = NHIP.giuNhipMs, timDot = timThuMucDot }) {
  return new Promise((xong) => {
    const cham = () => {
      try {
        chamNhip({ cwd }, { timDot });
      } catch (e) {
        process.stderr.write(`giu-nhip: không chạm được nhịp: ${e.message}\n`);
      }
    };
    cham();
    const con = spawn(lenh[0], lenh.slice(1), { cwd, stdio: 'inherit' });
    const hen = setInterval(cham, moiMs);
    let tinNhan = null;
    let daXong = false;
    const nghe = Object.fromEntries(
      TIN_HIEU_CHUYEN.map((ten) => [
        ten,
        () => {
          tinNhan = ten;
          con.kill(ten);
        },
      ]),
    );
    for (const [ten, f] of Object.entries(nghe)) process.on(ten, f);
    const ket = (ma) => {
      if (daXong) return;
      daXong = true;
      clearInterval(hen);
      for (const [ten, f] of Object.entries(nghe)) process.off(ten, f);
      xong(tinNhan ? maCuaTinHieu(tinNhan) : ma);
    };
    con.on('error', (e) => {
      process.stderr.write(`giu-nhip: không chạy được ${lenh[0]}: ${e.message}\n`);
      ket(MA_KHONG_CHAY);
    });
    con.on('exit', (ma, tin) => ket(ma ?? maCuaTinHieu(tin)));
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  const doiSo = process.argv.slice(2);
  const ngan = doiSo.indexOf('--');
  const lenh = ngan === -1 ? [] : doiSo.slice(ngan + 1);
  if (lenh.length === 0) {
    process.stderr.write('dùng: giu-nhip.mjs -- <lệnh> [đối số…]\n');
    process.exit(MA_SAI_CACH_DUNG);
  }
  process.exit(await chayGiuNhip({ lenh }));
}
