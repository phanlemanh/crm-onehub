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
