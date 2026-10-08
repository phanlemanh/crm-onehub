import fs from 'node:fs';
import path from 'node:path';
import { HO_SO, EVALS, SLUG_HO_SO, RA, git, chay, docTaiRef, ghiRa, doiCo, ketLuan } from './chung.mjs';

const co = doiCo(process.argv.slice(2));
const SAO = path.join(RA, 'sao-luoi');
const TEP_NGOAI = 'scripts/dieu-phoi/giu-nhip.mjs';
const head = git(['rev-parse', 'HEAD']).trim();

function don() {
  if (fs.existsSync(SAO)) chay('git', ['worktree', 'remove', '--force', SAO]);
  fs.rmSync(SAO, { recursive: true, force: true });
  chay('git', ['worktree', 'prune']);
}

let sai = 0;
let out = '';
don();
try {
  fs.mkdirSync(RA, { recursive: true });
  git(['worktree', 'add', '--detach', SAO, head]);
  fs.appendFileSync(path.join(SAO, TEP_NGOAI), '\n');
  fs.writeFileSync(path.join(SAO, HO_SO, '.cham-f19'), 'f19\n');
  if (co['doc-tu']) fs.writeFileSync(path.join(SAO, EVALS), docTaiRef(co['doc-tu'], EVALS));
  git(['add', '-A'], SAO);
  git(['-c', 'user.name=f19', '-c', 'user.email=f19@local', 'commit', '-q', '--no-verify', '-m', 'f19 luoi that'], SAO);
  const r = chay('bash', ['scripts/pre-merge-check.sh', '.', '--base', head], SAO);
  out = `${r.stdout}${r.stderr}`;
} finally {
  don();
}
console.log(`   dau ra: ${ghiRa(`luoi-that-${co['doc-tu'] ? 'do' : 'xanh'}.txt`, out)}`);
const tatCa = out.split('\n');
const viPham = tatCa.map((l, i) => [l, i]).filter(([l]) => l.startsWith(`VIOLATION [${SLUG_HO_SO}]`));
const tepDoi = (i) => {
  const ds = [];
  for (let k = i + 1; k < tatCa.length && /^\s{2,}\S/.test(tatCa[k]); k++) ds.push(tatCa[k].trim());
  return ds;
};
if (viPham.length) {
  sai++;
  for (const [l, i] of viPham) console.log(`   ${l.slice(0, 160)} (${tepDoi(i).length} tep doi)`);
  const vi = viPham.some(([l, i]) => l.includes('evidence is stale') && tepDoi(i).includes(TEP_NGOAI));
  console.log(vi ? `luoi-that do: ho so cu vi ${path.basename(TEP_NGOAI)}` : 'luoi-that do: vi pham khac');
} else {
  console.log(`luoi-that xanh: ho so khong cu vi ${path.basename(TEP_NGOAI)}`);
}
ketLuan(sai);
