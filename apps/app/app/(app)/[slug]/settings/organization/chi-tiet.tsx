"use client";

import { ChiTietBoPhan } from "./chi-tiet-bo-phan";
import { ChiTietChuaCo } from "./chi-tiet-chua-co";
import { ChiTietGoc } from "./chi-tiet-goc";
import { ChiTietPhongBan } from "./chi-tiet-phong-ban";
import type { CayDuLieu, ChonDaGiai, HanhDong } from "./kieu";
import type { DonChon } from "./to-chuc-search-params";

export function giaiDon(don: DonChon | null, cay: CayDuLieu): ChonDaGiai {
	if (don === null || don.loai === "goc") return { loai: "goc" };
	if (don.loai === "chua-co") return { loai: "chua-co" };
	if (don.loai === "bp") {
		const bp = cay.divisions.find((d) => d.id === don.id);
		return bp ? { loai: "bp", bp } : { loai: "goc" };
	}
	for (const bp of cay.divisions) {
		const pb = bp.departments.find((d) => d.id === don.id);
		if (pb) return { loai: "pb", pb, bp };
	}
	const pb = cay.chuaXep.find((d) => d.id === don.id);
	return pb ? { loai: "pb", pb, bp: null } : { loai: "goc" };
}

export function tenChon(chon: ChonDaGiai, tenGoc: string, chuaCo: string) {
	switch (chon.loai) {
		case "goc":
			return tenGoc;
		case "bp":
			return chon.bp.name;
		case "pb":
			return chon.pb.name;
		case "chua-co":
			return chuaCo;
	}
}

export function ChiTiet({
	cay,
	chon,
	tenGoc,
	hd,
	anTieuDe = false,
}: {
	cay: CayDuLieu;
	chon: ChonDaGiai;
	tenGoc: string;
	hd: HanhDong;
	anTieuDe?: boolean;
}) {
	switch (chon.loai) {
		case "goc":
			return (
				<ChiTietGoc cay={cay} tenGoc={tenGoc} hd={hd} anTieuDe={anTieuDe} />
			);
		case "bp":
			return (
				<ChiTietBoPhan
					key={chon.bp.id}
					cay={cay}
					bp={chon.bp}
					tenGoc={tenGoc}
					hd={hd}
					anTieuDe={anTieuDe}
				/>
			);
		case "pb":
			return (
				<ChiTietPhongBan
					key={chon.pb.id}
					cay={cay}
					pb={chon.pb}
					bp={chon.bp}
					hd={hd}
					anTieuDe={anTieuDe}
				/>
			);
		case "chua-co":
			return <ChiTietChuaCo cay={cay} hd={hd} anTieuDe={anTieuDe} />;
	}
}
