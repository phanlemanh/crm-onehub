"use client";

import { KhungUngDung } from "../kho-tai-lieu/khung";
import { DE_XUAT, PHIEN_BAN, type PhienBanMau } from "./du-lieu";
import {
	BanCu,
	DanhSachDaLuuTru,
	DaXuLy,
	DocTrang,
	DuyetDeXuat,
	LichSu,
} from "./man";

const BAN_1 = PHIEN_BAN[2] as PhienBanMau;
const BAN_3 = PHIEN_BAN[0] as PhienBanMau;

function noiDung(state: string) {
	switch (state) {
		case "ST-lich-su-mot-ban":
			return <LichSu chiMotBan />;
		case "ST-ban-cu-so-sanh":
			return <BanCu ban={BAN_1} toanVanSan={false} />;
		case "ST-ban-cu-toan-van":
			return <BanCu ban={BAN_1} toanVanSan />;
		case "ST-ban-cu-dang-dung":
			return <BanCu ban={BAN_3} toanVanSan={false} />;
		case "ST-doc-hop-luu-tru":
			return <DocTrang trangThai="hop-luu-tru" />;
		case "ST-doc-cho-luu-tru":
			return <DocTrang trangThai="cho-luu-tru" />;
		case "ST-doc-da-luu-tru":
			return <DocTrang trangThai="da-luu-tru" />;
		case "ST-duyet-luu-tru":
			return <DuyetDeXuat deXuat={DE_XUAT[0] as (typeof DE_XUAT)[number]} />;
		case "ST-duyet-quay-lai":
			return <DuyetDeXuat deXuat={DE_XUAT[1] as (typeof DE_XUAT)[number]} />;
		case "ST-ds-da-luu-tru":
			return <DanhSachDaLuuTru rong={false} />;
		case "ST-ds-da-luu-tru-rong":
			return <DanhSachDaLuuTru rong />;
		case "ST-cho-duyet-da-xu-ly":
			return <DaXuLy />;
		default:
			return <LichSu chiMotBan={false} />;
	}
}

export function LichSuVaLuuTruTrangMau({ state }: { state: string }) {
	return <KhungUngDung muc="tai-lieu">{noiDung(state)}</KhungUngDung>;
}
