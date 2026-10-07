#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ghiJsonNguyenTu, phienCuaCwd, timThuMucDot } from './dot.mjs';
import { docHangViec } from './hinh-dang.mjs';

const LOAI_CHO = new Set(['idle_prompt', 'permission_prompt']);

function coTepBatDau(thuMuc, ten, tienTo) {
  const d = path.join(thuMuc, ten);
  return fs.existsSync(d) ? fs.readdirSync(d).filter((f) => f.startsWith(tienTo) && f.endsWith('.json')) : [];
}

export function xuLyChoNguoi(dauVao, { timDot = timThuMucDot } = {}) {
  const thuMuc = timDot(dauVao.cwd);
  if (!thuMuc) return 'ngoai-dot';
  const hangViec = docHangViec(thuMuc);
  const phien = phienCuaCwd(hangViec, dauVao.cwd);
  if (!phien) return 'khong-phai-tho';
  const tep = path.join(thuMuc, 'cho-nguoi', `${phien}.json`);
  if (dauVao.hook_event_name === 'UserPromptSubmit') {
    fs.rmSync(tep, { force: true });
    return 'xoa';
  }
  if (dauVao.hook_event_name !== 'Notification' || !LOAI_CHO.has(dauVao.notification_type)) return 'bo-qua';
  if (coTepBatDau(thuMuc, 'xin', `${phien}-`).length > 0) return 'cho-luot';
  const chuaTraLoi = coTepBatDau(thuMuc, 'yeu-cau', `${phien}-`).some((f) => !fs.existsSync(path.join(thuMuc, 'tra-loi', f)));
  if (chuaTraLoi) return 'cho-tra-loi';
  ghiJsonNguyenTu(tep, {
    phien,
    loai: dauVao.notification_type,
    tin: dauVao.message ?? '',
    luc: new Date().toISOString(),
    session_id: dauVao.session_id ?? null,
  });
  return 'ghi';
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  let raw = '';
  for await (const manh of process.stdin) raw += manh;
  try {
    xuLyChoNguoi(JSON.parse(raw));
  } catch {
  }
  process.exit(0);
}
