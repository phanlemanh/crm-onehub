#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { docJson, timThuMucDot, trongWorktree } from './dot.mjs';
import { docCauHinh } from './hinh-dang.mjs';

export const LENH_MAC_DINH = {
  workflow_script: 'acceptance-verify.js',
  bash: { 'repin-lane': 's4', 's4-args': 's4', 'duong-nen.mjs': 'duong-nen' },
};
const MAU_THO = /acceptance-verify\.js|repin-lane|s4-args|duong-nen\.mjs/;

export function phanLoai(dauVao, lenh = LENH_MAC_DINH) {
  if (dauVao.tool_name === 'Workflow') {
    return String(dauVao.tool_input?.scriptPath ?? '').endsWith(lenh.workflow_script) ? 's4' : null;
  }
  if (dauVao.tool_name === 'Bash') {
    const lenhBash = String(dauVao.tool_input?.command ?? '');
    for (const [mau, taiNguyen] of Object.entries(lenh.bash)) if (lenhBash.includes(mau)) return taiNguyen;
  }
  return null;
}

export function quyet(dauVao, { timDot = timThuMucDot } = {}) {
  const thuMuc = timDot(dauVao.cwd);
  if (!thuMuc) return { ma: 0 };
  docCauHinh(thuMuc);
  const taiNguyen = phanLoai(dauVao);
  if (!taiNguyen) return { ma: 0 };
  const chu = docJson(path.join(thuMuc, 'khoa', taiNguyen, 'chu.json'));
  if (chu && trongWorktree(chu.worktree, dauVao.cwd)) return { ma: 0 };
  const tinhTrang = chu ? `đang thuộc ${chu.phien}` : 'đang trống nhưng chưa cấp cho phiên này';
  return {
    ma: 2,
    loi: `chan-s4: khoá ${taiNguyen} ${tinhTrang}. Ghi đơn xin/<phiên>-${taiNguyen}.json trong ${thuMuc} rồi chờ khoa/${taiNguyen}/chu.json ghi tên phiên này.`,
  };
}

export function chayHook(raw, tuyChon = {}) {
  let dauVao;
  try {
    dauVao = JSON.parse(raw);
  } catch {
    return MAU_THO.test(raw) ? { ma: 2, loi: 'chan-s4: lỗi nội bộ: đầu vào không đọc được — chặn để an toàn; báo phiên giám sát' } : { ma: 0 };
  }
  if (phanLoai(dauVao) === null && !MAU_THO.test(raw)) return { ma: 0 };
  try {
    return quyet(dauVao, tuyChon);
  } catch (e) {
    return { ma: 2, loi: `chan-s4: lỗi nội bộ: ${e.message} — chặn để an toàn; báo phiên giám sát` };
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  let raw = '';
  for await (const manh of process.stdin) raw += manh;
  const kq = chayHook(raw);
  if (kq.loi) process.stderr.write(`${kq.loi}\n`);
  process.exit(kq.ma);
}
