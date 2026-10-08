import fs from 'node:fs';
import { SLUG_HO_SO, git, chay, ghiRa, doiCo, ketLuan } from './chung.mjs';

const co = doiCo(process.argv.slice(2));
let sai = 0;
const bao = (dong) => { sai++; console.log(dong); };

function docKetQua(out, ma) {
  if (ma !== 0) bao(`ma-thoat:${ma}`);
  const dong = out.split('\n').filter((l) => l.startsWith(`VIOLATION [${SLUG_HO_SO}]`));
  if (dong.length) bao(`vi-pham:${SLUG_HO_SO} — ${dong[0].slice(0, 160)}`);
}

if (co['doc-tep']) {
  docKetQua(fs.readFileSync(co['doc-tep'], 'utf8'), Number(co.ma ?? 1));
  ketLuan(sai);
}

const ban = git(['status', '--porcelain']).split('\n').filter(Boolean)
  .map((l) => l.slice(3)).filter((t) => !t.startsWith('.acceptance-runs/') && !t.startsWith('apps/app/public/'));
for (const t of ban) bao(`cay-ban:${t}`);
if (ban.length) ketLuan(sai);

git(['fetch', '-q', 'origin', 'onehub']);
console.log(`   HEAD ${git(['rev-parse', 'HEAD']).trim()} · origin/onehub ${git(['rev-parse', 'origin/onehub']).trim()}`);
const r = chay('bash', ['scripts/pre-merge-check.sh', '.', '--base', 'origin/onehub']);
const out = `${r.stdout}${r.stderr}`;
console.log(`   dau ra: ${ghiRa('pre-merge.txt', out)}`);
docKetQua(out, r.status);
if (!sai) console.log('pre-merge: clean');
ketLuan(sai);
