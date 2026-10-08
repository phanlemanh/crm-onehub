import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const require = createRequire(import.meta.url);
export const core = require(path.join(ROOT, 'lib/evidence-core.cjs'));
export const ey = require(path.join(ROOT, 'lib/eval-yaml.cjs'));
export const HO_SO = '_acceptance/soan-okr-cung-tro-ly';
export const EVALS = `${HO_SO}/evals.yaml`;
export const SLUG_HO_SO = 'soan-okr-cung-tro-ly';
export const GOC = 'b633a7e3b';
export const RA = path.join(ROOT, '.acceptance-runs/sua-paths-e5-soan-okr');
export const DOI = [
  { id: 'E5', cu: 'apps/app/app/(app)/[slug]/settings/to-chuc/**', moi: 'apps/app/app/(app)/[slug]/settings/organization/**' },
  { id: 'E17', cu: 'apps/app/lib/messages/okr-tro-ly.ts', moi: 'apps/app/lib/messages/tro-ly-okr.ts' },
];

export function moiTruongSach() {
  const env = { ...process.env };
  for (const k of Object.keys(env)) if (k.startsWith('GIT_')) delete env[k];
  return env;
}

export function git(args, cwd = ROOT) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 64 << 20, env: moiTruongSach() });
}

export function chay(lenh, args, cwd = ROOT) {
  return spawnSync(lenh, args, { cwd, encoding: 'utf8', maxBuffer: 64 << 20, env: moiTruongSach() });
}

export const docTaiRef = (ref, tep) => git(['show', `${ref}:${tep}`]);
export const docTep = (tep) => fs.readFileSync(path.join(ROOT, tep), 'utf8');
export const cayGit = (cwd = ROOT) => core.dungCayPaths(git(['ls-files', '-z'], cwd).split('\0').filter(Boolean));
export const diemRe = () => git(['merge-base', 'HEAD', 'origin/onehub']).trim();

export function doiChuoi(text, cu, moi) {
  const n = text.split(cu).length - 1;
  if (n !== 1) throw new Error(`chuoi xuat hien ${n} lan, mong 1: ${cu}`);
  return text.replace(cu, moi);
}

export function ghiRa(ten, text) {
  fs.mkdirSync(RA, { recursive: true });
  const p = path.join(RA, ten);
  fs.writeFileSync(p, text);
  return p;
}

export function doiCo(argv) {
  const co = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    const k = argv[i].slice(2);
    co[k] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
  }
  return co;
}

export function chonBanSao(co, bang, text) {
  if (!co['ban-sao']) return text;
  const f = bang[co['ban-sao']];
  if (!f) {
    console.error(`ban-sao la: ${co['ban-sao']} — co: ${Object.keys(bang).join(', ')}`);
    process.exit(2);
  }
  const moi = f(text);
  console.log(`   ban sao ${co['ban-sao']}: ${ghiRa(`ban-sao-${co['ban-sao']}.txt`, moi)}`);
  return moi;
}

export function ketLuan(sai) {
  console.log(`KET LUAN: ${sai} SAI — ma thoat ${sai ? 1 : 0}`);
  process.exit(sai ? 1 : 0);
}
