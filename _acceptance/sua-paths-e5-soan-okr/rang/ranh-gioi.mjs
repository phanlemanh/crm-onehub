import fs from 'node:fs';
import { HO_SO, git, diemRe, doiCo, ketLuan } from './chung.mjs';

const co = doiCo(process.argv.slice(2));
const DICH_DANH = new Set([
  `${HO_SO}/evals.yaml`,
  `${HO_SO}/run-log.jsonl`,
  `${HO_SO}/evidence-report.md`,
  '_acceptance/config.yaml',
  'docs/superpowers/specs/2026-10-08-sua-paths-e5-soan-okr-design.md',
  'docs/superpowers/plans/2026-10-08-sua-paths-e5-soan-okr.md',
  'PRODUCT-MAP.md',
  'LO-TRINH.html',
]);
const TIEN_TO = ['_acceptance/sua-paths-e5-soan-okr/'];
const CHI_THEM = [`${HO_SO}/run-log.jsonl`, '_acceptance/config.yaml'];

const goc = diemRe();
const tep = git(['diff', '--name-only', goc, 'HEAD']).split('\n').filter(Boolean);
if (co.them) tep.push(co.them);
let sai = 0;
const bao = (dong) => { sai++; console.log(dong); };

for (const t of tep) {
  if (DICH_DANH.has(t) || TIEN_TO.some((p) => t.startsWith(p))) continue;
  bao(`ngoai-ranh-gioi:${t}`);
}
const dem = {};
for (const t of CHI_THEM) {
  const diff = co['diff-mau'] && t === '_acceptance/config.yaml'
    ? fs.readFileSync(co['diff-mau'], 'utf8')
    : git(['diff', '-U0', goc, 'HEAD', '--', t]);
  const dong = diff.split('\n');
  const tru = dong.filter((l) => l.startsWith('-') && !l.startsWith('---')).length;
  const cong = dong.filter((l) => l.startsWith('+') && !l.startsWith('+++')).length;
  dem[t] = `+${cong} -${tru}`;
  if (tru) bao(`xoa-dong:${t}`);
}
if (!sai) {
  console.log(`ranh-gioi: ${tep.length} tep, 0 ngoai`);
  console.log(`run-log: ${dem[CHI_THEM[0]]}`);
  console.log(`config: ${dem[CHI_THEM[1]]}`);
}
ketLuan(sai);
