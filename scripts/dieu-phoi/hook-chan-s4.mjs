#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOC_DAU_BYTE } from './cau-hinh.mjs';
import { docJson, timThuMucDot, trongWorktree } from './dot.mjs';
import { docCauHinh } from './hinh-dang.mjs';

export const TEP_GIU_NHIP = path.join(path.dirname(fileURLToPath(import.meta.url)), 'giu-nhip.mjs');

export const LENH_MAC_DINH = {
  workflow: { meta: 'acceptance-verify', tep: /^acceptance-verify(?:-[^/]*)?\.js$/ },
  bash: { 'repin-lane': 's4', 's4-args': 's4', 'duong-nen.mjs': 'duong-nen' },
};
const MAU_THO = /acceptance-verify|repin-lane|s4-args|duong-nen\.mjs/;
const MAU_LENH_BOC = /^\s*\S*node\s+\S*giu-nhip\.mjs\s+--\s/;
const KY_TU_AN_TOAN = /^[\w./:@%+,-]+(?: [\w./:@%+,-]+)*$/;

const nhayDon = (s) => (KY_TU_AN_TOAN.test(s) ? s : `'${s.replace(/'/g, `'\\''`)}'`);

export function lenhBoc(lenhGoc) {
  const lenh = lenhGoc.trim();
  const than = KY_TU_AN_TOAN.test(lenh) ? lenh : `bash -c ${nhayDon(lenh)}`;
  return `node ${nhayDon(TEP_GIU_NHIP)} -- ${than}`;
}

function tenMetaCua(text) {
  return /export\s+const\s+meta\s*=\s*\{[^}]*?\bname\s*:\s*['"]([^'"]+)['"]/.exec(text)?.[1] ?? null;
}

function docDau(p) {
  let fd;
  try {
    fd = fs.openSync(p, 'r');
  } catch {
    return null;
  }
  try {
    const dem = Buffer.alloc(DOC_DAU_BYTE);
    const n = fs.readSync(fd, dem, 0, DOC_DAU_BYTE, 0);
    return dem.subarray(0, n).toString('utf8');
  } finally {
    fs.closeSync(fd);
  }
}

export function laS4Workflow(vao, lenh = LENH_MAC_DINH, cwd = process.cwd()) {
  const { meta, tep } = lenh.workflow;
  if (typeof vao?.script === 'string' && tenMetaCua(vao.script) === meta) return true;
  if (vao?.name === meta) return true;
  if (typeof vao?.scriptPath !== 'string' || vao.scriptPath === '') return false;
  const dau = docDau(path.resolve(cwd ?? '', vao.scriptPath));
  if (dau !== null) return tenMetaCua(dau) === meta;
  return tep.test(path.basename(vao.scriptPath));
}

export function phanLoai(dauVao, lenh = LENH_MAC_DINH) {
  if (dauVao.tool_name === 'Workflow') {
    return laS4Workflow(dauVao.tool_input, lenh, dauVao.cwd) ? 's4' : null;
  }
  if (dauVao.tool_name === 'Bash') {
    const lenhBash = String(dauVao.tool_input?.command ?? '');
    for (const [mau, taiNguyen] of Object.entries(lenh.bash)) if (lenhBash.includes(mau)) return taiNguyen;
  }
  return null;
}

function xetLenhNen(dauVao, taiNguyen) {
  const lenh = String(dauVao.tool_input?.command ?? '');
  if (dauVao.tool_name !== 'Bash' || dauVao.tool_input?.run_in_background !== true || MAU_LENH_BOC.test(lenh)) return { ma: 0 };
  return { ma: 2, loi: `chan-s4: lệnh nền giữ khoá ${taiNguyen} phải chạy qua giu-nhip: ${lenhBoc(lenh)}` };
}

export function quyet(dauVao, { timDot = timThuMucDot } = {}) {
  const thuMuc = timDot(dauVao.cwd);
  if (!thuMuc) return { ma: 0 };
  docCauHinh(thuMuc);
  const taiNguyen = phanLoai(dauVao);
  if (!taiNguyen) return { ma: 0 };
  const chu = docJson(path.join(thuMuc, 'khoa', taiNguyen, 'chu.json'));
  if (chu && trongWorktree(chu.worktree, dauVao.cwd)) return xetLenhNen(dauVao, taiNguyen);
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
