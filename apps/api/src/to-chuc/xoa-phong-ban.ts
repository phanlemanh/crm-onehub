import { TO_CHUC } from "./to-chuc-config";

const T = TO_CHUC.thongDiep;

export type PhongBanDeXoa = {
	archived: boolean;
	stepCount: number;
	primaryCount: number;
	khuon: readonly string[];
	okrLichSu: number;
};

export function lyDoKhongXoaPhongBan(pb: PhongBanDeXoa): string | null {
	if (!pb.archived) return T.chuaLuuTru;
	if (pb.stepCount > 0) return T.phongBanConBuoc;
	if (pb.primaryCount > 0) return T.phongBanConNguoiXoa;
	if (pb.khuon.length > 0) return T.phongBanConTrongKhuon(pb.khuon);
	if (pb.okrLichSu > 0) return T.phongBanConOkrXoa(pb.okrLichSu);
	return null;
}
