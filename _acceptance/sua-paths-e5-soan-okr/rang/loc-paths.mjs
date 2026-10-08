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
