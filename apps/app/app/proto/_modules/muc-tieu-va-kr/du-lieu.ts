import type { NhipOkr } from "@crm/ui/components/okr-status";
import {
	type KrMau,
	KY,
	MT_CSKH_1,
	MT_CSKH_2,
	MT_KINHDOANH,
	MT_ONEHUB_1,
	MT_ONEHUB_2,
	MT_VANHANH,
	type MucTieuMau,
	NGUOI,
} from "../ban-mau-okr/du-lieu";
import { tienDo } from "../ban-mau-okr/phan-chung";

export const STATE = {
	hienTai: "ST-hien-tai",
	cuaToi: "ST-cua-toi",
	theoDonVi: "ST-theo-don-vi",
	chiTiet: "ST-chi-tiet",
	chuaCoKr: "ST-chua-co-kr",
	dangTai: "ST-dang-tai",
	cham: "ST-cham",
} as const;

export type TrangThaiMau = "nhap" | "cho-duyet" | "cong-bo";

export type MucTieuDu = MucTieuMau & {
	trangThai: TrangThaiMau;
	viSao: string;
};

export const NHAN_TRANG_THAI = {
	nhap: "Nháp",
	"cho-duyet": "Chờ duyệt",
	"cong-bo": "Đã công bố",
} satisfies Record<TrangThaiMau, string>;

const du = (
	mt: MucTieuMau,
	trangThai: TrangThaiMau,
	viSao: string,
): MucTieuDu => ({ ...mt, trangThai, viSao });

export const CSKH_1 = du(
	MT_CSKH_1,
	"cong-bo",
	"Đối tác mới bỏ cuộc nhiều nhất ở tuần thứ hai và ba, lúc chờ tài khoản mà không ai trả lời. Đỡ trọn tháng đầu thì mạng lưới mới giữ được người.",
);

export const CSKH_2 = du(
	MT_CSKH_2,
	"cong-bo",
	"Mỗi thứ Hai đội mất nửa buổi gom số tay. Số tự dựng từ CRM thì buổi họp tuần bàn việc, không bàn số.",
);

export const CSKH_NHAP: MucTieuDu = {
	id: "c3",
	ten: "Đối tác tự giải quyết được việc thường gặp",
	donVi: "Chăm sóc khách hàng",
	loai: "cam-ket",
	phuTrach: NGUOI.nga,
	gopVao: [],
	kr: [],
	trangThai: "nhap",
	viSao: "",
};

export const CUA_TOI: MucTieuDu[] = [CSKH_1, CSKH_2];

export const THEO_DON_VI: MucTieuDu[] = [
	du(MT_ONEHUB_1, "cong-bo", ""),
	du(MT_ONEHUB_2, "cong-bo", ""),
	du(MT_KINHDOANH, "cong-bo", ""),
	du(MT_VANHANH, "cho-duyet", ""),
	CSKH_1,
	CSKH_2,
];

export function tienDoMucTieu(mt: MucTieuMau): number | null {
	if (mt.kr.length === 0) return null;
	const tong = mt.kr.reduce((cong, k) => cong + tienDo(k), 0);
	return Math.round(tong / mt.kr.length);
}

const NGUONG_NHIP = { thamVong: 0.7, cham: 0.85, truot: 0.5 } as const;

export function nhipCua(
	phanTram: number,
	loai: MucTieuMau["loai"],
	laMoc = false,
): NhipOkr {
	if (laMoc) return phanTram >= 100 ? "moc-xong" : "moc-chua";
	const tiLe = phanTram / KY.kyVong;
	if (loai === "tham-vong")
		return tiLe >= NGUONG_NHIP.thamVong ? "dung-nhip" : "cham-nhip";
	if (tiLe >= NGUONG_NHIP.cham) return "dung-nhip";
	if (tiLe >= NGUONG_NHIP.truot) return "cham-nhip";
	return "truot";
}

export function kieuKr(kr: KrMau): string {
	if (kr.kieu === "moc") return "Mốc";
	return kr.dich < kr.khoiDiem ? "Giảm xuống" : "Tăng tới";
}

export function demCham(mt: MucTieuMau): number {
	return mt.kr.filter((k) => {
		const nhip = nhipCua(tienDo(k), mt.loai, k.kieu === "moc");
		return nhip === "cham-nhip" || nhip === "truot";
	}).length;
}
