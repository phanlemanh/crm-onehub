#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { veBang } from './bang.mjs';
import { GIAY_MS, NHIP, PHUT_MS } from './cau-hinh.mjs';
import { docJson, ghiJsonNguyenTu, ghiSuKien } from './dot.mjs';
import { capLuot, chonHangKe, xetHanThue } from './lich.mjs';
import { danhGiaSucKhoe, docApLuc, docLoad, docRssLonNhat, docSwap } from './suc-khoe.mjs';
import { xetYeuCau } from './yeu-cau.mjs';

export const CAC_TAI_NGUYEN = ['s4', 'duong-nen', 'merge'];
const KHOA_TRONG_MS = NHIP.khoaTrongMs;
const MOT_NGAY_MS = NHIP.motNgayMs;

export function trangThaiHopDong(text) {
  return text.match(/^status:\s*(\S+)/m)?.[1] ?? null;
}

const tuoiPhut = (p, nowMs) => {
  try {
    return (nowMs - fs.statSync(p).mtimeMs) / PHUT_MS;
  } catch {
    return null;
  }
};

function xuLyKhoa(thuMuc, cfg, nowMs) {
  const dangGiu = {};
  for (const tn of CAC_TAI_NGUYEN) {
    const d = path.join(thuMuc, 'khoa', tn);
    dangGiu[tn] = null;
    if (!fs.existsSync(d)) continue;
    const chu = docJson(path.join(d, 'chu.json'));
    if (!chu) {
      if (nowMs - fs.statSync(d).mtimeMs > KHOA_TRONG_MS) {
        fs.rmSync(d, { recursive: true, force: true });
        ghiSuKien(thuMuc, { loai: 'thu-hoi', tai_nguyen: tn, ly_do: 'thư mục khoá trống quá 60″', can_phan: true });
      } else {
        dangGiu[tn] = { phien: '?' };
      }
      continue;
    }
    const nhip = tuoiPhut(path.join(d, 'nhip'), nowMs);
    const kq = xetHanThue({ chu, nhipTuoiPhut: nhip, nowMs, cfg });
    if (kq.hanhDong === 'gia-han') {
      ghiJsonNguyenTu(path.join(d, 'chu.json'), { ...chu, han_thue_den: kq.hanMoi });
      ghiSuKien(thuMuc, { loai: 'gia-han', tai_nguyen: tn, phien: chu.phien, han_moi: kq.hanMoi });
      dangGiu[tn] = { ...chu, han_thue_den: kq.hanMoi };
    } else if (kq.hanhDong === 'thu-hoi') {
      fs.rmSync(d, { recursive: true, force: true });
      ghiSuKien(thuMuc, { loai: 'thu-hoi', tai_nguyen: tn, phien: chu.phien, ly_do: 'hết hạn thuê, nhịp cũ', can_phan: true });
    } else {
      dangGiu[tn] = chu;
    }
  }
  return dangGiu;
}

function docThuMucJson(thuMuc, ten) {
  const d = path.join(thuMuc, ten);
  if (!fs.existsSync(d)) return [];
  const tot = [];
  for (const f of fs.readdirSync(d).filter((x) => x.endsWith('.json'))) {
    const p = path.join(d, f);
    try {
      const du = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (typeof du.phien !== 'string' || typeof du.loai !== 'string') throw new Error('thiếu phien hoặc loai');
      tot.push({ ...du, _tep: p, _ten: f.replace(/\.json$/, '') });
    } catch (e) {
      fs.mkdirSync(path.join(d, 'hong'), { recursive: true });
      fs.renameSync(p, path.join(d, 'hong', f));
      ghiSuKien(thuMuc, { loai: ten === 'xin' ? 'don-hong' : 'yeu-cau-hong', tep: f, ly_do: e.message, can_phan: true });
    }
  }
  return tot;
}

function capPhat(thuMuc, cfg, hangViec, dangGiu, giamTai, nowMs) {
  const donXin = docThuMucJson(thuMuc, 'xin').filter((d) => typeof d.worktree === 'string');
  for (const { taiNguyen, don } of capLuot({ donXin, dangGiu, giamTai, hangViec })) {
    const d = path.join(thuMuc, 'khoa', taiNguyen);
    try {
      fs.mkdirSync(d);
    } catch {
      continue;
    }
    const chu = {
      phien: don.phien,
      slug: don.slug,
      loai: don.loai,
      worktree: fs.realpathSync(don.worktree),
      cap_luc: new Date(nowMs).toISOString(),
      han_thue_den: new Date(nowMs + cfg.han_thue_phut[don.loai] * PHUT_MS).toISOString(),
    };
    ghiJsonNguyenTu(path.join(d, 'chu.json'), chu);
    fs.rmSync(don._tep, { force: true });
    ghiSuKien(thuMuc, { loai: 'cap', tai_nguyen: taiNguyen, phien: don.phien, slug: don.slug });
  }
  return docThuMucJson(thuMuc, 'xin').map(({ phien, loai, luc }) => ({ phien, loai, luc }));
}

function nhanhMo(io, cfg) {
  const ketQua = new Map();
  let ds = [];
  try {
    ds = JSON.parse(io.chay('gh', ['pr', 'list', '--state', 'open', '--json', 'headRefName']) || '[]');
  } catch {
    return ketQua;
  }
  for (const { headRefName } of ds) {
    let tep = '';
    try {
      tep = io.chay('git', ['diff', '--name-only', `origin/${cfg.nhanh_chinh}...origin/${headRefName}`]);
    } catch {
      continue;
    }
    for (const t of tep.split('\n').filter(Boolean)) ketQua.set(t, [...(ketQua.get(t) ?? []), headRefName]);
  }
  return ketQua;
}

function xuLyYeuCau(thuMuc, cfg, hangViec, io, trangThaiCu, nowMs) {
  const tatCa = docThuMucJson(thuMuc, 'yeu-cau');
  const daBao = new Set(trangThaiCu.da_bao ?? []);
  const choXet = tatCa.filter((y) => !fs.existsSync(path.join(thuMuc, 'tra-loi', `${y._ten}.json`)) && !daBao.has(y._ten));
  if (choXet.length === 0) return [...daBao];
  const nguCanh = {
    hangViec,
    nhanhChamTep: nhanhMo(io, cfg),
    nhanhCua: () => null,
    yeuCauGanDay: tatCa.filter((y) => nowMs - Date.parse(y.luc) < MOT_NGAY_MS),
  };
  for (const y of choXet) {
    const kq = xetYeuCau({ ...y, id: y._ten }, nguCanh, cfg);
    if (kq.ket_qua === 'can_phan') {
      ghiSuKien(thuMuc, { loai: 'yeu-cau', id: y._ten, phien: y.phien, kieu: y.loai, ly_do: kq.ly_do, dich: kq.dich ?? 'giam-sat', can_phan: true });
      daBao.add(y._ten);
      continue;
    }
    ghiJsonNguyenTu(path.join(thuMuc, 'tra-loi', `${y._ten}.json`), { ...kq, luc: new Date(nowMs).toISOString() });
    if (y.loai === 'cham-tep' && kq.ket_qua === 'duyet') {
      const p = path.join(thuMuc, 'ranh-gioi-them.json');
      const them = docJson(p, {});
      them[y.phien] = [...new Set([...(them[y.phien] ?? []), ...y.noi_dung.tep])];
      ghiJsonNguyenTu(p, them);
    }
    ghiSuKien(thuMuc, { loai: 'yeu-cau', id: y._ten, phien: y.phien, kieu: y.loai, ket_qua: kq.ket_qua });
  }
  return [...daBao];
}

function tienDoCua(hangViec, cfg, io) {
  const td = new Map();
  for (const h of hangViec.hang) {
    let trenNhanhChinh = null;
    try {
      trenNhanhChinh = trangThaiHopDong(io.chay('git', ['show', `origin/${cfg.nhanh_chinh}:_acceptance/${h.slug}/contract.md`]));
    } catch {
      trenNhanhChinh = null;
    }
    if (trenNhanhChinh === 'signed-off') {
      td.set(h.slug, 'gop');
      continue;
    }
    const day = hangViec.day.find((d) => d.id === h.day);
    const p = day ? path.join(day.worktree, '_acceptance', h.slug, 'contract.md') : null;
    const st = p && fs.existsSync(p) ? trangThaiHopDong(fs.readFileSync(p, 'utf8')) : null;
    td.set(h.slug, st === null ? 'chua' : st === 'signed-off' ? 'ky' : 'dang');
  }
  return td;
}

function capNhatHangKe(thuMuc, hangViec, tienDo) {
  const ketQua = [];
  for (const day of hangViec.day) {
    const ke = chonHangKe(hangViec, day.id, tienDo);
    const p = path.join(thuMuc, 'tiep', `${day.id}.json`);
    const cu = docJson(p, null);
    if (JSON.stringify(cu?.ke ?? null) !== JSON.stringify(ke)) {
      ghiJsonNguyenTu(p, { phien: day.id, ...ke, ke });
      ghiSuKien(thuMuc, { loai: 'hang-ke', phien: day.id, ...ke });
    }
    ketQua.push({ id: day.id, link: day.link, hang: ke.hang, tien_do: ke.hang ? tienDo.get(ke.hang) : ke.xong ? 'xong' : 'cho', cho: ke.cho ?? null });
  }
  return ketQua;
}

export async function motNhip(thuMuc, io) {
  const nowMs = io.nowMs();
  const cfg = docJson(path.join(thuMuc, 'dieu-phoi.config.json'));
  const hangViec = docJson(path.join(thuMuc, 'hang-viec.json'));
  const pTrangThai = path.join(thuMuc, 'trang-thai.json');
  const cu = docJson(pTrangThai, {});

  const sucKhoe = danhGiaSucKhoe(
    {
      swap: docSwap(io.chay('sysctl', ['vm.swapusage'])),
      apLuc: docApLuc(io.chay('sysctl', ['-n', 'kern.memorystatus_vm_pressure_level'])),
      load: docLoad(io.chay('sysctl', ['-n', 'vm.loadavg'])),
      rssLonNhat: docRssLonNhat(io.chay('ps', ['-axo', 'rss=,comm='])),
    },
    cfg,
  );
  if (sucKhoe.giamTai && cu.trang_thai !== 'giam-tai') ghiSuKien(thuMuc, { loai: 'giam-tai', ly_do: sucKhoe.lyDo, can_phan: true });
  if (!sucKhoe.giamTai && cu.trang_thai === 'giam-tai') ghiSuKien(thuMuc, { loai: 'het-giam-tai' });
  if (sucKhoe.canNguoi && cu.can_nguoi !== sucKhoe.canNguoi) ghiSuKien(thuMuc, { loai: 'can-nguoi', tin: sucKhoe.canNguoi, dich: 'owner', can_phan: true });

  const dangGiu = xuLyKhoa(thuMuc, cfg, nowMs);
  const hangCho = capPhat(thuMuc, cfg, hangViec, dangGiu, sucKhoe.giamTai, nowMs);
  const daBao = xuLyYeuCau(thuMuc, cfg, hangViec, io, cu, nowMs);
  const day = capNhatHangKe(thuMuc, hangViec, tienDoCua(hangViec, cfg, io));
  const lienKetCua = new Map(hangViec.day.map((d) => [d.id, d.link]));
  const choNguoi = docThuMucJson(thuMuc, 'cho-nguoi').map(({ phien, loai, tin, luc }) => ({ phien, loai, tin, luc, link: lienKetCua.get(phien) }));
  const khoa = CAC_TAI_NGUYEN.flatMap((tn) => {
    const chu = docJson(path.join(thuMuc, 'khoa', tn, 'chu.json'));
    return chu ? [{ tai_nguyen: tn, phien: chu.phien, han_thue_den: chu.han_thue_den }] : [];
  });

  const tt = {
    dot: hangViec.dot,
    trang_thai: sucKhoe.giamTai ? 'giam-tai' : 'dang-chay',
    nhip_cuoi: new Date(nowMs).toISOString(),
    suc_khoe: sucKhoe,
    can_nguoi: sucKhoe.canNguoi,
    day,
    khoa,
    hang_cho: hangCho,
    cho_nguoi: choNguoi,
    da_bao: daBao,
  };
  ghiJsonNguyenTu(pTrangThai, tt);
  fs.writeFileSync(path.join(thuMuc, 'bang.html'), veBang(tt));
}

export function giuPid(thuMuc) {
  const p = path.join(thuMuc, 'phat-lich.pid');
  const cu = Number(fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : 0);
  if (cu && cu !== process.pid) {
    try {
      process.kill(cu, 0);
      return false;
    } catch {
    }
  }
  fs.writeFileSync(p, String(process.pid));
  return true;
}

const IO_THAT = {
  nowMs: () => Date.now(),
  chay: (cmd, args, opts = {}) => execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: NHIP.lenhNgoaiMs, ...opts }),
};

export function taoVong(thuMuc, io, dongHo = () => Date.now()) {
  const BAO_LAI_MS = NHIP.baoLaiMs;
  let lanFetch = -Infinity;
  const daBao = new Map();
  const bao = (loai, ly_do) => {
    const cu = daBao.get(loai);
    if (cu && cu.ly_do === ly_do && dongHo() - cu.luc < BAO_LAI_MS) return;
    daBao.set(loai, { ly_do, luc: dongHo() });
    ghiSuKien(thuMuc, { loai, ly_do, can_phan: true });
  };
  return async () => {
    if (dongHo() - lanFetch > NHIP.fetchMs) {
      lanFetch = dongHo();
      try {
        io.chay('git', ['fetch', '-q', 'origin']);
      } catch (e) {
        bao('fetch-loi', e.message);
      }
    }
    try {
      await motNhip(thuMuc, io);
    } catch (e) {
      bao('loi-nhip', e.message);
    }
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  const thuMuc = fs.realpathSync(process.argv[2]);
  if (!giuPid(thuMuc)) {
    process.stderr.write(`phat-lich: đã có bộ phát lịch đang chạy cho ${thuMuc}\n`);
    process.exit(3);
  }
  const cfg = docJson(path.join(thuMuc, 'dieu-phoi.config.json'));
  const io = { ...IO_THAT, chay: (cmd, args, opts) => IO_THAT.chay(cmd, args, { cwd: cfg.goc_kho, ...opts }) };
  const vong = taoVong(thuMuc, io);
  await vong();
  const hen = setInterval(vong, (cfg.tick_giay ?? NHIP.tickGiayMacDinh) * GIAY_MS);
  const dung = () => {
    clearInterval(hen);
    fs.rmSync(path.join(thuMuc, 'phat-lich.pid'), { force: true });
    process.exit(0);
  };
  process.on('SIGTERM', dung);
  process.on('SIGINT', dung);
}
