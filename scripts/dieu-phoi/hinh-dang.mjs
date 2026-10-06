import fs from 'node:fs';

export const LOAI_DON = ['s4', 'ghim-lai', 'duong-nen', 'merge'];

const laChuoi = (x) => typeof x === 'string' && x.length > 0;

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
