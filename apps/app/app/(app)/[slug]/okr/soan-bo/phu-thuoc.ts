"use client";

import { chamBo } from "@crm/validation/okr-cham-bo";
import { createContext, useContext } from "react";
import { oDenDong } from "./den-dong";
import { chonMucTieuBo, demCongBo, kiemDongKr, suyKieuKr } from "./du-lieu-bo";

export type PhuThuocSoan = {
	chonMucTieu: typeof chonMucTieuBo;
	suyKieu: typeof suyKieuKr;
	kiemDong: typeof kiemDongKr;
	luuKhi: "roi-o" | "moi-phim";
	khoaSoCongBo: boolean;
	chamBo: typeof chamBo;
	oDenDong: typeof oDenDong;
	docLaiSauNhan: boolean;
	chatLuongKhiKaraTat: "hien" | "an";
	demCongBo: typeof demCongBo;
	goiTheoOTich: boolean;
	giuKetQuaKhiLoi: boolean;
	chiXemTheoQuyen: boolean;
	hoiKhiDongChuaLuu: boolean;
	giuChuKhiLoiLuu: boolean;
	tieuDeKhiTai: boolean;
};

export const PHU_THUOC_MAC_DINH: PhuThuocSoan = Object.freeze({
	chonMucTieu: chonMucTieuBo,
	suyKieu: suyKieuKr,
	kiemDong: kiemDongKr,
	luuKhi: "roi-o",
	khoaSoCongBo: true,
	chamBo,
	oDenDong,
	docLaiSauNhan: true,
	chatLuongKhiKaraTat: "hien",
	demCongBo,
	goiTheoOTich: true,
	giuKetQuaKhiLoi: true,
	chiXemTheoQuyen: true,
	hoiKhiDongChuaLuu: true,
	giuChuKhiLoiLuu: true,
	tieuDeKhiTai: true,
});

export const PhuThuocSoanContext =
	createContext<PhuThuocSoan>(PHU_THUOC_MAC_DINH);

export function usePhuThuocSoan(): PhuThuocSoan {
	return useContext(PhuThuocSoanContext);
}
