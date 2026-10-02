import { KARA } from "../src/lib/kara";

export const DU_LIEU = {
	tenCongTy: "Đất Xanh",
	tenNguoi: "Lan",
	chuCaiTen: "LA",
	thu: "lan@onemount.com",
	cot: "Tên cột",
	cotHai: "Tên miền",
	nhomLoc: "Ngành",
	nhomLocHai: "Phụ trách",
	giaTriLoc: "Bất động sản",
	tieuDeHopThoai: "Ghi chú của tôi",
	ngayVi: "1 thg 9, 2026",
	ngayEn: "Sep 1, 2026",
} as const;

export const TRUNG_TINH: ReadonlySet<string> = new Set(Object.values(DU_LIEU));

export const KHONG_DAU_CHO_PHEP: readonly string[] = [];

export const DAU_TIENG_VIET =
	/[ăâđêôơưáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i;

export const TEN_RIENG: ReadonlySet<string> = new Set([KARA.ten]);
