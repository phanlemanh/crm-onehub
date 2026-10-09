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
