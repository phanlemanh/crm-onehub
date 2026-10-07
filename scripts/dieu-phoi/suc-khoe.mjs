export function docSwap(text) {
  const so = (khoa) => {
    const m = text.match(new RegExp(`${khoa} = ([\\d.]+)M`));
    return m ? Number(m[1]) / 1024 : null;
  };
  return { tongGb: so('total'), dungGb: so('used') };
}

export function docLoad(text) {
  const m = text.match(/\{\s*([\d.]+)/);
  return m ? Number(m[1]) : null;
}

export function docRssLonNhat(psText) {
  let lonNhat = null;
  for (const dong of psText.trim().split('\n')) {
    const m = dong.trim().match(/^(\d+)\s+(.+)$/);
    if (!m) continue;
    const gb = Number(m[1]) / 1024 / 1024;
    if (lonNhat === null || gb > lonNhat.gb) lonNhat = { gb, lenh: m[2] };
  }
  return lonNhat;
}

export function docApLuc(text) {
  const m = String(text).match(/^\s*(\d+)/);
  return m ? Number(m[1]) : null;
}

export function danhGiaSucKhoe({ swap, apLuc, load, rssLonNhat }, cfg) {
  const nguong = cfg.suc_khoe;
  const lyDo = [];
  const dung = swap.dungGb ?? 0;
  const tong = swap.tongGb ?? 0;
  if (dung > nguong.swap_gb) lyDo.push(`swap ${dung.toFixed(1)}/${tong.toFixed(1)} GB`);
  if (Number.isFinite(apLuc) && apLuc >= nguong.ap_luc_muc) lyDo.push(`áp lực bộ nhớ mức ${apLuc}`);
  const canNguoi = rssLonNhat && rssLonNhat.gb > nguong.rss_gb ? `${rssLonNhat.lenh} giữ ${rssLonNhat.gb.toFixed(1)} GB RSS` : null;
  return { giamTai: lyDo.length > 0, lyDo, canNguoi, load };
}
