#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { docJson, timThuMucDot, trongWorktree } from './dot.mjs';

export function chamNhip(dauVao, { timDot = timThuMucDot } = {}) {
  const thuMuc = timDot(dauVao.cwd);
  if (!thuMuc) return [];
  const goc = path.join(thuMuc, 'khoa');
  if (!fs.existsSync(goc)) return [];
  const daCham = [];
  for (const taiNguyen of fs.readdirSync(goc)) {
    const chu = docJson(path.join(goc, taiNguyen, 'chu.json'));
    if (chu && trongWorktree(chu.worktree, dauVao.cwd)) {
      fs.writeFileSync(path.join(goc, taiNguyen, 'nhip'), new Date().toISOString());
      daCham.push(taiNguyen);
    }
  }
  return daCham;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  let raw = '';
  for await (const manh of process.stdin) raw += manh;
  try {
    chamNhip(JSON.parse(raw));
  } catch {
  }
  process.exit(0);
}
