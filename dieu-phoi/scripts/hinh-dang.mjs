import fs from 'node:fs';
import path from 'node:path';
import { NHIP, PHUT_MS } from './cau-hinh.mjs';
import { docJson } from './dot.mjs';

export const LOAI_DON = ['s4', 'ghim-lai', 'duong-nen', 'merge'];

const laChuoi = (x) => typeof x === 'string' && x.length > 0;
const laObject = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);
const laSoDuong = (x) => Number.isFinite(x) && x > 0;
const laDanhSachChuoi = (x) => Array.isArray(x) && x.every((t) => typeof t === 'string');

export const laDanhSachTep = (tep) => Array.isArray(tep) && tep.length > 0 && tep.every(laChuoi);

export function kiemCoBan(du) {
  if (!laChuoi(du?.phien) || !laChuoi(du?.loai)) throw new Error('thiếu phien hoặc loai');
  return du;
}

export function kiemDon(du) {
  kiemCoBan(du);
  if (!LOAI_DON.includes(du.loai)) throw new Error(`loai ${du.loai} không thuộc ${LOAI_DON.join(', ')}`);
  if (!laChuoi(du.worktree)) throw new Error('thiếu worktree');
  let laThuMuc = false;
  try {
    laThuMuc = fs.statSync(du.worktree).isDirectory();
  } catch {
    laThuMuc = false;
  }
  if (!laThuMuc) throw new Error(`worktree ${du.worktree} không phải thư mục tồn tại`);
  return du;
}

export function kiemYeuCau(du) {
  kiemCoBan(du);
  if (du.loai === 'cham-tep' && !laDanhSachTep(du.noi_dung?.tep)) throw new Error('noi_dung.tep phải là danh sách đường dẫn không rỗng');
  return du;
}

const TEP_CAU_HINH = 'dieu-phoi.config.json';
const TEP_HANG_VIEC = 'hang-viec.json';

function kiemKhoaLa(du, cho, tep, tienTo) {
  const la = Object.keys(du).filter((k) => !cho.includes(k));
  if (la.length > 0) throw new Error(`${tep}: khoá lạ ${la.map((k) => `${tienTo}${k}`).join(', ')}`);
}

const KHOA_CAU_HINH = ['nhanh_chinh', 'tick_giay', 'han_thue_phut', 'nhip_cu_phut', 'suc_khoe', 's4_tran_gom_phut', 'bao_ve', 'goc_kho', 'nguon_hang', 'kiem_moi_truong', 'han_muc'];
const KHOA_HAN_MUC = ['bao_truoc_pct', 'ban_giao_pct', 'cho_ban_giao_phut', 'cho_dat_lai_phut'];
const KHOA_SUC_KHOE = ['swap_gb', 'ap_luc_muc', 'rss_gb'];

export function kiemCauHinh(du, { canGocKho = false } = {}) {
  const sai = (s) => {
    throw new Error(`${TEP_CAU_HINH}: ${s}`);
  };
  if (!laObject(du)) sai('phải là một object');
  kiemKhoaLa(du, KHOA_CAU_HINH, TEP_CAU_HINH, '');
  if (!laChuoi(du.nhanh_chinh)) sai('nhanh_chinh phải là chuỗi không rỗng');
  if ((canGocKho || du.goc_kho !== undefined) && !laChuoi(du.goc_kho)) sai('goc_kho phải là chuỗi không rỗng');
  if (du.tick_giay !== undefined && !laSoDuong(du.tick_giay)) sai('tick_giay phải là số dương');
  if (!laObject(du.han_thue_phut)) sai('han_thue_phut phải là object theo loại đơn');
  for (const loai of LOAI_DON) {
    if (!laSoDuong(du.han_thue_phut[loai])) sai(`han_thue_phut.${loai} phải là số phút dương`);
  }
  const giuNhipPhut = NHIP.giuNhipMs / PHUT_MS;
  if (!Number.isFinite(du.nhip_cu_phut)) sai('nhip_cu_phut phải là số phút');
  if (du.nhip_cu_phut <= giuNhipPhut) sai(`nhip_cu_phut phải lớn hơn chu kỳ giữ nhịp ${giuNhipPhut} phút`);
  if (!laSoDuong(du.s4_tran_gom_phut)) sai('s4_tran_gom_phut phải là số phút dương');
  if (!laObject(du.suc_khoe)) sai('suc_khoe phải là object');
  for (const k of KHOA_SUC_KHOE) {
    if (!Number.isFinite(du.suc_khoe[k])) sai(`suc_khoe.${k} phải là số`);
  }
  if (!laDanhSachChuoi(du.bao_ve)) sai('bao_ve phải là danh sách chuỗi');
  if (du.nguon_hang !== undefined && !laDanhSachChuoi(du.nguon_hang)) sai('nguon_hang phải là danh sách chuỗi');
  if (du.kiem_moi_truong !== undefined && !(Array.isArray(du.kiem_moi_truong) && du.kiem_moi_truong.every((m) => laObject(m) && laChuoi(m.ten) && laChuoi(m.lenh) && Object.keys(m).every((k) => k === 'ten' || k === 'lenh')))) {
    sai('kiem_moi_truong phải là danh sách {ten, lenh} chuỗi không rỗng');
  }
  // DP4: ngưỡng hạn mức của đợt (spec workflow §4.3, §4.5). Vắng khoá → bộ phát lịch không xét hạn mức (đợt cũ).
  if (du.han_muc !== undefined) {
    const h = du.han_muc;
    if (!laObject(h)) sai('han_muc phải là object');
    kiemKhoaLa(h, KHOA_HAN_MUC, TEP_CAU_HINH, 'han_muc.');
    for (const k of ['bao_truoc_pct', 'ban_giao_pct']) if (!(Number.isFinite(h[k]) && h[k] >= 1 && h[k] <= 100)) sai(`han_muc.${k} phải là phần trăm 1–100`);
    for (const k of ['cho_ban_giao_phut', 'cho_dat_lai_phut']) if (!laSoDuong(h[k])) sai(`han_muc.${k} phải là số phút dương`);
    if (h.bao_truoc_pct >= h.ban_giao_pct) sai('han_muc.bao_truoc_pct phải nhỏ hơn han_muc.ban_giao_pct');
  }
  return du;
}

const KHOA_HANG_VIEC = ['dot', 'day', 'hang', 'ngoai_hang_merge'];
const KHOA_DAY = ['id', 'worktree', 'link', 'nghi'];
const KHOA_HANG = ['ma', 'tep', 'slug', 'day', 'sau', 'moc', 'uu_tien', 'ranh_gioi', 'chung_chi_them', 's4'];

export function kiemHangViec(du) {
  const sai = (s) => {
    throw new Error(`${TEP_HANG_VIEC}: ${s}`);
  };
  if (!laObject(du)) sai('phải là một object');
  kiemKhoaLa(du, KHOA_HANG_VIEC, TEP_HANG_VIEC, '');
  if (typeof du.dot !== 'string') sai('dot phải là chuỗi');
  if (!Array.isArray(du.day)) sai('day phải là danh sách');
  const ids = new Set();
  du.day.forEach((d, i) => {
    if (!laObject(d)) sai(`day[${i}] phải là object`);
    kiemKhoaLa(d, KHOA_DAY, TEP_HANG_VIEC, `day[${i}].`);
    if (!laChuoi(d.id)) sai(`day[${i}].id phải là chuỗi không rỗng`);
    if (!laChuoi(d.worktree)) sai(`day[${i}].worktree phải là chuỗi không rỗng`);
    if (d.link !== undefined && typeof d.link !== 'string') sai(`day[${i}].link phải là chuỗi`);
    if (d.nghi !== undefined && typeof d.nghi !== 'boolean') sai(`day[${i}].nghi phải là true/false`);
    if (ids.has(d.id)) sai(`day[${i}].id ${d.id} bị trùng`);
    ids.add(d.id);
  });
  if (!Array.isArray(du.hang)) sai('hang phải là danh sách');
  du.hang.forEach((h, i) => {
    if (!laObject(h)) sai(`hang[${i}] phải là object`);
    kiemKhoaLa(h, KHOA_HANG, TEP_HANG_VIEC, `hang[${i}].`);
    if (!laChuoi(h.slug)) sai(`hang[${i}].slug phải là chuỗi không rỗng`);
    if (!ids.has(h.day)) sai(`hang[${i}].day ${h.day} không có trong day`);
    for (const k of ['ma', 'tep', 'moc', 's4']) if (h[k] !== undefined && typeof h[k] !== 'string') sai(`hang[${i}].${k} phải là chuỗi`);
    for (const k of ['sau', 'ranh_gioi', 'chung_chi_them']) if (h[k] !== undefined && !laDanhSachChuoi(h[k])) sai(`hang[${i}].${k} phải là danh sách chuỗi`);
    if (h.uu_tien !== undefined && !Number.isFinite(h.uu_tien)) sai(`hang[${i}].uu_tien phải là số`);
  });
  if (du.ngoai_hang_merge !== undefined && !Array.isArray(du.ngoai_hang_merge)) sai('ngoai_hang_merge phải là danh sách');
  return du;
}

export const KHOA_TRA_LOI = ['ket_qua', 'boi', 'ly_do', 'luc', 'voi', 'tai_nguyen', 'uoc_phut'];

export function kiemTraLoi(du) {
  const sai = (s) => {
    throw new Error(s);
  };
  if (!laObject(du)) sai('phải là một object');
  const la = Object.keys(du).filter((k) => !KHOA_TRA_LOI.includes(k));
  if (la.length > 0) sai(`khoá lạ ${la.join(', ')}`);
  if (!laChuoi(du.ket_qua)) sai('ket_qua phải là chuỗi không rỗng');
  for (const k of ['boi', 'ly_do', 'luc', 'voi', 'tai_nguyen']) {
    if (du[k] !== undefined && typeof du[k] !== 'string') sai(`${k} phải là chuỗi`);
  }
  if (du.uoc_phut !== undefined && !Number.isFinite(du.uoc_phut)) sai('uoc_phut phải là số');
  return du;
}

export const docCauHinh = (thuMuc, tuyChon = {}) => kiemCauHinh(docJson(path.join(thuMuc, TEP_CAU_HINH)), tuyChon);
export const docHangViec = (thuMuc) => kiemHangViec(docJson(path.join(thuMuc, TEP_HANG_VIEC)));
