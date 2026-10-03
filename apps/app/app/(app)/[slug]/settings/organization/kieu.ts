import type { RouterOutputs } from "@/lib/trpc/types";

export type CayDuLieu = RouterOutputs["org"]["tree"];
export type BoPhanDuLieu = CayDuLieu["divisions"][number];
export type PhongBanDuLieu = CayDuLieu["chuaXep"][number];
export type NguoiDuLieu = CayDuLieu["people"][number];

export type YeuCauDonVi =
	| { loai: "tao-bo-phan" }
	| { loai: "tao-phong-ban"; divisionId: string | null; name: string }
	| {
			loai: "doi-ten";
			don: "bo-phan" | "phong-ban";
			id: string;
			name: string;
			moTa: string;
	  }
	| { loai: "truong"; don: "bo-phan" | "phong-ban"; id: string; name: string }
	| { loai: "chuyen"; id: string; name: string; divisionId: string | null };

export const KHONG_CHON = "__none";
export const NHOM_CHUA_XEP = "__chua-xep";

export function moiPhongBan(cay: CayDuLieu): PhongBanDuLieu[] {
	return [...cay.divisions.flatMap((d) => d.departments), ...cay.chuaXep];
}

export const KHO_HEP = "(max-width: 1023px)";

export type ChonDaGiai =
	| { loai: "goc" }
	| { loai: "bp"; bp: BoPhanDuLieu }
	| { loai: "pb"; pb: PhongBanDuLieu; bp: BoPhanDuLieu | null }
	| { loai: "chua-co" };

export type HoiLuuTru = {
	loai: "bo-phan" | "phong-ban";
	id: string;
	name: string;
};

export type HanhDong = {
	sua: boolean;
	moDonVi: (y: YeuCauDonVi) => void;
	moNguoi: (id: string) => void;
	hoiLuuTru: (x: HoiLuuTru) => void;
	moGan: (bp: BoPhanDuLieu) => void;
	moThem: (pb: PhongBanDuLieu) => void;
	moChuyenOkr: (x: { level: "bo-phan" | "phong-ban"; id: string }) => void;
};

export function okrMoCua(cay: CayDuLieu, x: HoiLuuTru): number {
	if (x.loai === "bo-phan")
		return cay.divisions.find((d) => d.id === x.id)?.okrMo ?? 0;
	return moiPhongBan(cay).find((d) => d.id === x.id)?.okrMo ?? 0;
}

export function khopTim(chu: string, tim: string): boolean {
	const bo = (x: string) =>
		x.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("vi").trim();
	return bo(chu).includes(bo(tim));
}
