import { db } from "@crm/db";
import { dauNgayVN } from "@crm/db/onboarding-nhac";
import { docBanDangDung, timTrangDangDung } from "@crm/db/tai-lieu-tim";
import { TAI_LIEU } from "@crm/validation/tai-lieu";
import { chuThuong } from "@crm/validation/tai-lieu-markdown";
import {
	type DoanTrich,
	doanTrich,
	dungTruyVan,
} from "@crm/validation/tai-lieu-tim";
import { TAI_LIEU_AGENT } from "./tai-lieu-config";

const HOI = TAI_LIEU_AGENT.hoi;
const DAU_LA = /(?:<|&lt;){3}[^<>&\n]*?(?:>|&gt;){3}/g;
const BA_MO = /(?:<|&lt;){3,}/g;
const BA_DONG = /(?:>|&gt;){3,}/g;

function xoaDau(chu: string): string {
	let truoc = "";
	let sau = chu;
	while (sau !== truoc) {
		truoc = sau;
		sau = sau.replace(DAU_LA, "");
	}
	return sau.replace(BA_MO, "").replace(BA_DONG, "");
}

export type DongTimKho = {
	slug: string;
	ten: string;
	phienBan: number;
	doanTrich: DoanTrich;
};

export async function timTrangKho(q: string): Promise<DongTimKho[]> {
	const truyVan = dungTruyVan(q);
	if (!truyVan) return [];
	const hang = await timTrangDangDung(db, truyVan.tsquery, HOI.soKetQua);
	return hang.map((h) => ({
		slug: h.slug,
		ten: h.ten,
		phienBan: h.so,
		doanTrich: doanTrich(
			chuThuong(h.noiDung),
			truyVan.tu,
			TAI_LIEU.tim.benTrich,
		) ??
			doanTrich(h.ten, truyVan.tu, TAI_LIEU.tim.benTrich) ?? {
				truoc: "",
				khop: "",
				sau: h.ten,
			},
	}));
}

export type ChuTrangBoc = { chu: string; biDongCat: boolean };

export function bocChuTrang(noiDung: string): ChuTrangBoc {
	const sach = xoaDau(noiDung);
	const biDongCat = sach.length > HOI.docToiDa;
	const than = biDongCat ? sach.slice(0, HOI.docToiDa) : sach;
	return {
		chu: `${HOI.dauTrang.mo}\n${than}\n${HOI.dauTrang.dong}`,
		biDongCat,
	};
}

export type KetQuaDocTrang =
	| { loai: "khong-co" }
	| {
			loai: "trang";
			slug: string;
			ten: string;
			phienBan: number;
			duyetLuc: string;
			xacMinhDen: string | null;
			quaHan: boolean;
			chuTrang: string;
			biDongCat: boolean;
			noiDung: string;
	  };

export async function docTrangKho(
	slug: string,
	now: Date,
): Promise<KetQuaDocTrang> {
	const ban = await docBanDangDung(db, slug);
	if (!ban) return { loai: "khong-co" };
	const { chu, biDongCat } = bocChuTrang(ban.noiDung);
	return {
		loai: "trang",
		slug: ban.slug,
		ten: ban.ten,
		phienBan: ban.so,
		duyetLuc: ban.duyetLuc.toISOString(),
		xacMinhDen: ban.xacMinhDen?.toISOString() ?? null,
		quaHan:
			ban.xacMinhDen !== null &&
			ban.xacMinhDen.getTime() < dauNgayVN(now).getTime(),
		chuTrang: ban.chuTen,
		biDongCat,
		noiDung: chu,
	};
}
