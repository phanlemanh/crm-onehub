import { PHUT_MS } from './cau-hinh.mjs';

export const TAI_NGUYEN = { s4: 's4', 'ghim-lai': 's4', 'duong-nen': 'duong-nen', merge: 'merge' };
const MOC_XA = '9999-12-31';

const mocCua = (hangViec, slug) => hangViec?.hang?.find((h) => h.slug === slug)?.moc ?? MOC_XA;
export const PHIEN_MANG_MOC = new Set(['kiem-cheo']);
const mocDon = (d, hangViec) => (PHIEN_MANG_MOC.has(d.phien) && d.moc) || mocCua(hangViec, d.slug);

export function xepHang(donXin, hangViec) {
  const khoa = (d) => [d.loai === 'ghim-lai' && d.mo_merge ? 0 : 1, mocDon(d, hangViec), d.luc];
  return [...donXin].sort((a, b) => {
    const ka = khoa(a);
    const kb = khoa(b);
    for (let i = 0; i < ka.length; i++) {
      if (ka[i] < kb[i]) return -1;
      if (ka[i] > kb[i]) return 1;
    }
    return 0;
  });
}

export function capLuot({ donXin, dangGiu, giamTai, hangViec }) {
  const cap = [];
  const ban = new Set(Object.entries(dangGiu).filter(([, chu]) => chu).map(([tn]) => tn));
  for (const don of xepHang(donXin, hangViec)) {
    const tn = TAI_NGUYEN[don.loai];
    if (!tn || ban.has(tn)) continue;
    if (giamTai && tn !== 'merge') continue;
    cap.push({ taiNguyen: tn, don });
    ban.add(tn);
  }
  return cap;
}

export function xetHanThue({ chu, nhipTuoiPhut, nowMs, cfg }) {
  if (nowMs <= Date.parse(chu.han_thue_den)) return { hanhDong: 'giu' };
  if (nhipTuoiPhut !== null && nhipTuoiPhut < cfg.nhip_cu_phut) {
    const them = cfg.han_thue_phut[chu.loai] * PHUT_MS;
    return { hanhDong: 'gia-han', hanMoi: new Date(nowMs + them).toISOString() };
  }
  return { hanhDong: 'thu-hoi' };
}

export function hanGiaHan({ hanCu, nowMs, phut }) {
  return new Date(Math.max(Date.parse(hanCu), nowMs) + phut * PHUT_MS).toISOString();
}

export function chonHangKe(hangViec, phien, tienDo) {
  const cua = hangViec.hang.filter((h) => h.day === phien);
  const dangLam = cua.find((h) => tienDo.get(h.slug) === 'dang');
  if (dangLam) return { hang: dangLam.slug, moi: false };
  const duPhuThuoc = (h) =>
    (h.sau ?? []).every((ma) => {
      const truoc = hangViec.hang.find((x) => x.ma === ma);
      return truoc !== undefined && tienDo.get(truoc.slug) === 'gop';
    });
  const sanSang = cua
    .filter((h) => (tienDo.get(h.slug) ?? 'chua') === 'chua' && duPhuThuoc(h))
    .sort((a, b) => (a.uu_tien ?? 99) - (b.uu_tien ?? 99));
  if (sanSang.length > 0) return { hang: sanSang[0].slug, moi: true };
  const conViec = cua.some((h) => !['ky', 'gop'].includes(tienDo.get(h.slug) ?? 'chua'));
  return conViec ? { hang: null, cho: 'phu-thuoc' } : { hang: null, xong: true };
}
