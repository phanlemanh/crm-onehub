# Sửa paths chết của soan-okr-cung-tro-ly — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sửa hai mục `paths` chết (E5, E17) trong `evals.yaml` của hồ sơ đã ký `soan-okr-cung-tro-ly`, viết bảy răng đo, rồi ghim lại hồ sơ một lần.

**Architecture:** Răng sống ở `_acceptance/sua-paths-e5-soan-okr/rang/`, gọi thẳng `lib/evidence-core.cjs` và `lib/eval-yaml.cjs` của kho — không chép lại luật lọc. Gốc kho suy từ vị trí script. Chiều đỏ của mỗi răng là một cờ của chính lệnh đó, chạy trên bản sao trong `.acceptance-runs/sua-paths-e5-soan-okr/`.

**Tech Stack:** Node 26 (ESM), git, `scripts/pre-merge-check.sh`, làn ghim lại của feature-loop 2.24.0.

**Spec:** `docs/superpowers/specs/2026-10-08-sua-paths-e5-soan-okr-design.md` · hợp đồng `_acceptance/sua-paths-e5-soan-okr/contract.md` (đã duyệt Cổng 1).

**Thực thi:** tuần tự trong phiên chính (feature-loop T2, Native). Không task nào `independent: true` — Task 3 cần Task 1 và Task 2 đã commit.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Sửa `evals.yaml` của hồ sơ đã ký bằng thay chuỗi nguyên văn, mỗi chuỗi đúng một lần — không regex.
- Không đổi lệnh, kỳ vọng, chiều đỏ, `inputs` của eval nào trong `soan-okr-cung-tro-ly`.
- `_acceptance/config.yaml` chỉ thêm dòng (luật 7 của đợt; khối `f19_*` đã thêm ở S1).
- Ghim lại dưới khoá `s4` của đợt, bọc `giu-nhip.mjs` (luật 11, 18).
- Bản đồ sản phẩm vẽ lại ở bước cuối trên `git archive HEAD` (luật 30).

## Review Focus

- `pathGlobToRe` với ngoặc vuông và ngoặc tròn trong đường dẫn (`(app)/[slug]`) — E2 bước (a) đo đúng ca này trên đường thật.
- Lượt ghim lại chạm tệp nào khác ngoài `run-log.jsonl`, `evidence-report.md` — E6 đọc danh sách tệp đổi.
- Bản sao tạm của E7 bị bỏ lại khi lệnh chết giữa chừng — `don()` chạy trước và trong `finally`, kèm `git worktree prune`.
- Biến `GIT_*` rò từ hook vào lệnh git con (bài học core.bare 07/10) — `moiTruongSach()` gỡ mọi `GIT_*`.
- Lưới đổi khuôn in dòng vi phạm — E7 chiều đỏ nói «vi pham khac» thay vì im.

---

### Task 1: Sửa hai paths và răng E1–E3

**Files:**
- Modify: `_acceptance/soan-okr-cung-tro-ly/evals.yaml` (dòng 46, 161)
- Create: `_acceptance/sua-paths-e5-soan-okr/rang/chung.mjs`, `_acceptance/sua-paths-e5-soan-okr/rang/loc-paths.mjs`, `_acceptance/sua-paths-e5-soan-okr/rang/chi-doi-paths.mjs`

**Phục vụ:** E1, E2, E3 · **independent:** false

**Interfaces:**
- Produces: `chung.mjs` xuất `ROOT, core, ey, HO_SO, EVALS, SLUG_HO_SO, GOC, RA, DOI, moiTruongSach, git, chay, docTaiRef, docTep, cayGit, diemRe, doiChuoi, ghiRa, doiCo, chonBanSao, ketLuan` — Task 2 và 3 dùng lại.

- [ ] **Step 1: Viết `chung.mjs`**

```js
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
```

- [ ] **Step 2: Viết `loc-paths.mjs`, chạy trên bản CHƯA sửa — phải đỏ**

```js
import path from 'node:path';
import { core, ey, EVALS, DOI, cayGit, docTaiRef, docTep, doiChuoi, doiCo, chonBanSao, ketLuan } from './chung.mjs';

const co = doiCo(process.argv.slice(2));
const TO_CHUC = 'apps/app/app/(app)/[slug]/settings/organization/to-chuc.tsx';
const TRO_LY = 'apps/app/lib/messages/tro-ly-okr.ts';
const MA_TRAN = [
  { tep: TO_CHUC, mong: 'kept' },
  { tep: TRO_LY, mong: 'kept' },
  { tep: '.github/workflows/acceptance.yml', mong: 'skipped' },
  { tep: 'scripts/dieu-phoi/giu-nhip.mjs', mong: 'skipped' },
];
const DONG_E5 = (g) => `paths: ["${g}", apps/app/lib/messages/to-chuc.ts`;
const BAN_SAO = {
  'e5-lech': (t) => doiChuoi(t, DONG_E5(DOI[0].moi), DONG_E5('apps/app/app/(app)/[slug]/settings/okr/**')),
  'e5-cu': (t) => doiChuoi(t, DONG_E5(DOI[0].moi), DONG_E5(DOI[0].cu)),
};

const goc = co['doc-tu'] ? docTaiRef(co['doc-tu'], EVALS) : docTep(EVALS);
const text = chonBanSao(co, BAN_SAO, goc);
const cay = cayGit();
let sai = 0;

function phanBat() {
  let tuChoi = 0;
  for (const { id } of ey.parseEvals(text, [])) {
    for (const muc of core.evalPathsOf(text, id) || []) {
      const pl = core.phanLoaiMucPaths(muc, cay);
      if (pl.nhan) continue;
      tuChoi++;
      console.log(`   tu choi ${id} ${muc}: ${pl.ma}`);
    }
  }
  console.log(`muc bi tu choi: ${tuChoi}`);
  const r = core.staleByPaths(['__f19__'], text, { cay });
  console.log(r.apply ? 'apply: true' : `apply: false — ${r.reason}`);
  if (tuChoi || !r.apply) sai++;
}

function phanChon() {
  for (const [tep, id] of [[TO_CHUC, 'E5'], [TRO_LY, 'E17']]) {
    const khop = (core.evalPathsOf(text, id) || []).some((g) => core.pathGlobToRe(g).test(tep));
    console.log(khop ? `dat ${path.basename(tep)} khop ${id}` : `sai ${path.basename(tep)}: khong khop ${id}`);
    if (!khop) sai++;
  }
  for (const { tep } of MA_TRAN) {
    if (cay.tep.has(tep)) continue;
    console.error(`tep khong co trong cay: ${tep}`);
    process.exit(2);
  }
  const r = core.staleByPaths(MA_TRAN.map((o) => o.tep), text, { cay });
  for (const { tep, mong } of MA_TRAN) {
    const thay = r.kept.includes(tep) ? 'kept' : r.skipped.includes(tep) ? 'skipped' : 'vang';
    console.log(thay === mong ? `dat ${tep} ${thay}` : `sai ${path.basename(tep)}: mong ${mong}, thay ${thay}`);
    if (thay !== mong) sai++;
  }
  const tong = r.kept.length + r.skipped.length;
  if (tong !== MA_TRAN.length) {
    sai++;
    console.log(`sai: kept+skipped = ${tong}, mong ${MA_TRAN.length}`);
  }
}

const PHAN = { bat: phanBat, chon: phanChon };
if (!PHAN[co.phan]) {
  console.error('--phan bat|chon');
  process.exit(2);
}
PHAN[co.phan]();
ketLuan(sai);
```

Run: `node _acceptance/sua-paths-e5-soan-okr/rang/loc-paths.mjs --phan bat` → exit 1, `apply: false — paths-khong-tro-toi-tep:E5:…`

- [ ] **Step 3: Sửa hai chuỗi** (thay nguyên văn, mỗi chuỗi đúng một lần)

- E5: `apps/app/app/(app)/[slug]/settings/to-chuc/**` → `apps/app/app/(app)/[slug]/settings/organization/**`
- E17: `apps/app/lib/messages/okr-tro-ly.ts` → `apps/app/lib/messages/tro-ly-okr.ts`

- [ ] **Step 4: Viết `chi-doi-paths.mjs`**

```js
import { ey, EVALS, GOC, DOI, docTaiRef, docTep, doiChuoi, doiCo, chonBanSao, ghiRa, chay, ketLuan } from './chung.mjs';

const co = doiCo(process.argv.slice(2));
const BAN_SAO = {
  'doi-expected': (t) => {
    const dau = t.indexOf('  - id: E5\n');
    const moc = 'expected: "';
    const vt = t.indexOf(moc, dau) + moc.length;
    return `${t.slice(0, vt)}X${t.slice(vt)}`;
  },
  'thieu-e17': (t) => doiChuoi(t, DOI[1].moi, DOI[1].cu),
  'doi-trich-dan': (t) => doiChuoi(t, 'feature_slug: soan-okr-cung-tro-ly', 'feature_slug: "soan-okr-cung-tro-ly"'),
};

const cu = docTaiRef(GOC, EVALS);
const moi = chonBanSao(co, BAN_SAO, docTep(EVALS));
let sai = 0;
const bao = (dong) => { sai++; console.log(dong); };

const khoa = [...new Set([...`${cu}\n${moi}`.matchAll(/^\s+([A-Za-z_][A-Za-z0-9_-]*):/gm)].map((m) => m[1]))].filter((k) => k !== 'id');
const A = ey.parseEvals(cu, khoa);
const B = ey.parseEvals(moi, khoa);
if (A.map((e) => e.id).join(',') !== B.map((e) => e.id).join(',')) bao('doi-id: danh sach id khac thu tu hoac khac phan tu');

const doiTheoId = new Map(DOI.map((d) => [d.id, d]));
let soTruongKhac = 0;
for (let i = 0; i < Math.min(A.length, B.length); i++) {
  const a = A[i];
  const b = B[i];
  for (const k of khoa) {
    if (k === 'paths') continue;
    if (JSON.stringify(a[k]) === JSON.stringify(b[k])) continue;
    soTruongKhac++;
    bao(`doi-ngoai-paths:${a.id}:${k}`);
  }
  const d = doiTheoId.get(a.id);
  const mong = d ? a.paths.split(d.cu).join(d.moi) : a.paths;
  if (b.paths === mong) continue;
  bao(d ? `thieu-doi:${a.id}` : `doi-paths-la:${a.id}`);
}

const tepCu = ghiRa('evals-goc.yaml', cu);
const tepMoi = ghiRa('evals-dang-xet.yaml', moi);
const diff = chay('git', ['diff', '--no-index', '-U0', tepCu, tepMoi]).stdout;
const tru = diff.split('\n').filter((l) => l.startsWith('-') && !l.startsWith('---')).map((l) => l.slice(1));
const cong = diff.split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++')).map((l) => l.slice(1));
const capDung = tru.length === DOI.length && cong.length === DOI.length
  && DOI.every((d, i) => tru[i].includes(d.cu) && tru[i].split(d.cu).join(d.moi) === cong[i]);
if (!capDung) bao(`doi-byte-ngoai-paths: ${tru.length}- / ${cong.length}+`);
if (!sai) console.log(`doi: ${DOI.length} muc paths, ${soTruongKhac} truong khac, ${tru.length}-/${cong.length}+`);
ketLuan(sai);
```

- [ ] **Step 5: Chạy xanh và mọi chiều đỏ**

- `node _acceptance/sua-paths-e5-soan-okr/rang/loc-paths.mjs --phan bat` → exit 0, `muc bi tu choi: 0`, `apply: true`
- `node _acceptance/sua-paths-e5-soan-okr/rang/loc-paths.mjs --phan bat --doc-tu b633a7e3b` → exit 1, `paths-khong-tro-toi-tep:E5:`
- `node _acceptance/sua-paths-e5-soan-okr/rang/loc-paths.mjs --phan chon` → exit 0, sáu dòng `dat`
- `node _acceptance/sua-paths-e5-soan-okr/rang/loc-paths.mjs --phan chon --ban-sao e5-lech` → exit 1, `sai to-chuc.tsx: khong khop E5`
- `node _acceptance/sua-paths-e5-soan-okr/rang/loc-paths.mjs --phan chon --ban-sao e5-cu` → exit 1, `sai giu-nhip.mjs: mong skipped, thay kept`
- `node _acceptance/sua-paths-e5-soan-okr/rang/chi-doi-paths.mjs` → exit 0, `doi: 2 muc paths, 0 truong khac, 2-/2+`
- `--ban-sao doi-expected` → exit 1 `doi-ngoai-paths:E5:expected` · `--ban-sao thieu-e17` → exit 1 `thieu-doi:E17` · `--ban-sao doi-trich-dan` → exit 1 `doi-byte-ngoai-paths`

- [ ] **Step 6: Commit** — `fix(acceptance): paths E5/E17 của soan-okr-cung-tro-ly trỏ tệp đang sống; răng F19 E1–E3`

### Task 2: Răng E5–E7

**Files:** Create `_acceptance/sua-paths-e5-soan-okr/rang/pre-merge.mjs`, `_acceptance/sua-paths-e5-soan-okr/rang/ranh-gioi.mjs`, `_acceptance/sua-paths-e5-soan-okr/rang/luoi-that.mjs`

**Phục vụ:** E5, E6, E7 · **independent:** false

- [ ] **Step 1: Viết `ranh-gioi.mjs`**

```js
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
```

- [ ] **Step 2: Viết `pre-merge.mjs`**

```js
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
```

- [ ] **Step 3: Viết `luoi-that.mjs`** — commit trong bản sao dùng `--no-verify` vì bản sao là vật đo tạm, bị xoá ngay sau lệnh, không đẩy đi đâu.

```js
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
```

- [ ] **Step 4: Chạy các chiều đỏ không cần ghim lại**

- `node _acceptance/sua-paths-e5-soan-okr/rang/ranh-gioi.mjs --them apps/app/lib/x.ts` → exit 1 `ngoai-ranh-gioi:apps/app/lib/x.ts`
- `node _acceptance/sua-paths-e5-soan-okr/rang/ranh-gioi.mjs --them _acceptance/soan-okr-cung-tro-ly/contract.md` → exit 1
- `node _acceptance/sua-paths-e5-soan-okr/rang/ranh-gioi.mjs --diff-mau <tệp có một dòng '-x'>` → exit 1 `xoa-dong:_acceptance/config.yaml`
- `node _acceptance/sua-paths-e5-soan-okr/rang/pre-merge.mjs --doc-tep <tệp mẫu có 'VIOLATION [soan-okr-cung-tro-ly]: evidence is stale'> --ma 1` → exit 1 `vi-pham:soan-okr-cung-tro-ly`
- Chiều đỏ của E7 chạy ở Task 3: lưới in tối đa 10 tệp đổi, nên với pin cũ `giu-nhip.mjs` không nằm trong danh sách; sau khi ghim lại, nó là tệp đổi duy nhất.

- [ ] **Step 5: Commit** — `test(acceptance): răng F19 E5–E7`

### Task 3: Ghim lại hồ sơ và răng E4

**Files:** Create `_acceptance/sua-paths-e5-soan-okr/rang/ghim-mot-lan.mjs` · máy ghi: `_acceptance/soan-okr-cung-tro-ly/run-log.jsonl`, `evidence-report.md`

**Phục vụ:** E4, E5, E7 (chiều xanh cần pin mới) · **independent:** false

- [ ] **Step 1: Viết `ghim-mot-lan.mjs`, chạy trước khi ghim — phải đỏ `repin-khong-trong-vong`**

```js
import { core, HO_SO, EVALS, GOC, git, docTaiRef, docTep, diemRe, doiCo, chonBanSao, ketLuan } from './chung.mjs';

const co = doiCo(process.argv.slice(2));
const RUN_LOG = `${HO_SO}/run-log.jsonl`;
const BAO_CAO = `${HO_SO}/evidence-report.md`;
const docDong = (text) => text.split('\n').filter(Boolean).flatMap((l) => {
  try { return [JSON.parse(l)]; } catch { return []; }
});
const doiDongCuoi = (text, f) => {
  const dong = text.split('\n');
  const i = dong.map((l, k) => [l, k]).filter(([l]) => l.includes('"kind":"repin"')).pop()[1];
  const moi = f(JSON.parse(dong[i]));
  if (moi === null) dong.splice(i, 1);
  else dong[i] = JSON.stringify(moi);
  return dong.join('\n');
};
const BAN_SAO = {
  'repin-cu': (t) => doiDongCuoi(t, () => null),
  'mot-eval-do': (t) => doiDongCuoi(t, (d) => ({ ...d, evals_exit: { ...d.evals_exit, [Object.keys(d.evals_exit)[0]]: 1 } })),
  'thieu-eval': (t) => doiDongCuoi(t, (d) => {
    const { [Object.keys(d.evals_exit)[0]]: _bo, ...con } = d.evals_exit;
    return { ...d, evals_exit: con };
  }),
};

const runLog = chonBanSao(co, BAN_SAO, docTep(RUN_LOG));
let sai = 0;
const bao = (dong) => { sai++; console.log(dong); };

const them = git(['diff', '-U0', diemRe(), 'HEAD', '--', RUN_LOG]).split('\n')
  .filter((l) => l.startsWith('+') && !l.startsWith('+++')).map((l) => l.slice(1));
const repinMoi = docDong(them.join('\n')).filter((d) => d.kind === 'repin');
const repinCuoi = docDong(runLog).filter((d) => d.kind === 'repin').pop();
if (repinMoi.length !== 1 || !repinCuoi || repinCuoi.run_id !== repinMoi[0].run_id) {
  bao(`repin-khong-trong-vong: nhanh them ${repinMoi.length} dong repin, dong cuoi ${repinCuoi ? repinCuoi.run_id : 'vang'}`);
  ketLuan(sai);
}

const commitSua = git(['log', '-1', '--format=%H', '--', EVALS]).trim();
const laToTien = (() => { try { git(['merge-base', '--is-ancestor', commitSua, repinCuoi.sha]); return true; } catch { return false; } })();
if (!laToTien) bao(`repin-truoc-khi-sua: ${commitSua.slice(0, 9)} khong la to tien cua ${repinCuoi.sha.slice(0, 9)}`);

const baoCao = docTep(BAO_CAO);
const truong = (text, k) => ((text.match(new RegExp(`^${k}:\\s*(.*)$`, 'm')) || [])[1] || '').trim();
if (truong(baoCao, 'verified_commit') !== repinCuoi.sha) bao(`sha-lech: verified_commit ${truong(baoCao, 'verified_commit').slice(0, 9)} khac dong repin ${repinCuoi.sha.slice(0, 9)}`);
(repinCuoi.suites_exit || []).forEach((m, i) => { if (m !== 0) bao(`suite-do:${i}`); });

const mayCan = core.machineEvalIds(docTep(EVALS));
const coMa = repinCuoi.evals_exit || {};
for (const id of mayCan) {
  if (!(id in coMa)) bao(`thieu-eval:${id}`);
  else if (coMa[id] !== 0) bao(`eval-do:${id}`);
}
for (const id of Object.keys(coMa)) if (!mayCan.includes(id)) bao(`eval-la:${id}`);

const kyGoc = truong(docTaiRef(GOC, BAO_CAO), 'human_signoff');
if (truong(baoCao, 'human_signoff') !== kyGoc) bao(`chu-ky-doi: «${truong(baoCao, 'human_signoff')}» khac «${kyGoc}»`);

if (!sai) console.log(`ghim: ${repinCuoi.run_id} · ${mayCan.length}/${mayCan.length} eval may 0 · chu ky giu nguyen`);
ketLuan(sai);
```

- [ ] **Step 2: Xin khoá `s4`** (`xin/P1-ghim-lai.json`, tệp tạm rồi `mv`), chờ `khoa/s4/chu.json` mang `"phien":"P1"`.

- [ ] **Step 3: Ghim lại**

```bash
node /Users/manh-macmini/dev/crm/scripts/dieu-phoi/giu-nhip.mjs -- bash -c 'cd <worktree> && node /Users/manh-macmini/.claude/plugins/cache/acceptance-gate-kit/feature-loop/2.24.0/scripts/repin-lane.mjs --root . --slug soan-okr-cung-tro-ly --reason "F19: paths E5/E17 trỏ tệp đang sống" --write'
```
Làn đỏ → dừng, đọc nhật ký trong `.acceptance-runs/soan-okr-cung-tro-ly/repin-<run_id>/`, không ghi gì.

- [ ] **Step 4: Commit ghim lại** — `repin(soan-okr-cung-tro-ly): ghim lại sau khi sửa paths (F19)`

- [ ] **Step 5: Chạy E4 xanh + ba chiều đỏ, E7 xanh, E5, E6 xanh**

- `node _acceptance/sua-paths-e5-soan-okr/rang/ghim-mot-lan.mjs` → exit 0 · `--ban-sao repin-cu` → `repin-khong-trong-vong` · `--ban-sao mot-eval-do` → `eval-do:E1` · `--ban-sao thieu-eval` → `thieu-eval:E1`
- `node _acceptance/sua-paths-e5-soan-okr/rang/luoi-that.mjs` → exit 0 `luoi-that xanh` · `node _acceptance/sua-paths-e5-soan-okr/rang/luoi-that.mjs --doc-tu b633a7e3b` → exit 1 `luoi-that do: ho so cu vi giu-nhip.mjs`
- `node _acceptance/sua-paths-e5-soan-okr/rang/ranh-gioi.mjs` → exit 0 · `node _acceptance/sua-paths-e5-soan-okr/rang/pre-merge.mjs` → exit 0 trên cây sạch

- [ ] **Step 6: Nhả khoá `s4`** (đọc `chu.json` trước khi `rm`), đặt contract `status: implemented`, vào S4.
