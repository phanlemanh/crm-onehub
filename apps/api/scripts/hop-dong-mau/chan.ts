import {
	type KetQuaChan,
	kiemDuocNap,
	type MoiTruongNap,
} from "../okr-mau/chan";
import { HOP_DONG_MAU } from "./cau-hinh";

const CU = "Từ chối nạp bộ OKR mẫu";

export function kiemDuocNapHopDong(env: MoiTruongNap): KetQuaChan {
	const kq = kiemDuocNap(env);
	if (kq.cho) return kq;
	const moi = HOP_DONG_MAU.thongDiep.tienToChan;
	const cau = kq.cau.startsWith(CU)
		? `${moi}${kq.cau.slice(CU.length)}`.replace("bộ mẫu", "bộ hợp đồng mẫu")
		: `${moi}: ${kq.cau}`;
	return { ...kq, cau };
}
