import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export const TEN_LIEN_KET = 'dieu-phoi-hien-tai';

export function gocKhoChinh(cwd) {
  const chung = execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
  return path.dirname(chung);
}

export function timThuMucDot(cwd) {
  let goc;
  try {
    goc = gocKhoChinh(cwd);
  } catch {
    return null;
  }
  try {
    return fs.realpathSync(path.join(goc, '.acceptance-runs', TEN_LIEN_KET));
  } catch {
    return null;
  }
}

export function docJson(p, macDinh = null) {
  let tho;
  try {
    tho = fs.readFileSync(p, 'utf8');
  } catch (e) {
    if (e.code === 'ENOENT') return macDinh;
    throw e;
  }
  return JSON.parse(tho);
}

export function ghiJsonNguyenTu(p, du) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const tamThoi = `${p}.${process.pid}.tmp`;
  fs.writeFileSync(tamThoi, `${JSON.stringify(du, null, 2)}\n`);
  fs.renameSync(tamThoi, p);
}

export function ghiSuKien(thuMuc, suKien) {
  const dong = JSON.stringify({ luc: new Date().toISOString(), ...suKien });
  fs.appendFileSync(path.join(thuMuc, 'su-kien.jsonl'), `${dong}\n`);
}

export function trongWorktree(worktree, cwd) {
  let thuc;
  try {
    thuc = fs.realpathSync(cwd);
  } catch {
    return false;
  }
  if (thuc === worktree) return true;
  if (!thuc.startsWith(`${worktree}${path.sep}`)) return false;
  let goc;
  try {
    goc = fs.realpathSync(
      execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: thuc, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(),
    );
  } catch {
    return true;
  }
  return goc === worktree || !goc.startsWith(`${worktree}${path.sep}`);
}

export function phienCuaCwd(hangViec, cwd) {
  const day = (hangViec?.day ?? []).find((d) => trongWorktree(d.worktree, cwd));
  return day ? day.id : null;
}
