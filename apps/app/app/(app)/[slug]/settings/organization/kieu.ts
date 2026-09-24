import type { RouterOutputs } from "@/lib/trpc/types";

export type CayDuLieu = RouterOutputs["org"]["tree"];
export type BoPhanDuLieu = CayDuLieu["divisions"][number];
export type PhongBanDuLieu = CayDuLieu["chuaXep"][number];
export type NguoiDuLieu = CayDuLieu["people"][number];

export type YeuCauDonVi =
	| { loai: "tao-bo-phan" }
	| { loai: "tao-phong-ban"; divisionId: string | null; name: string }
	| { loai: "doi-ten"; don: "bo-phan" | "phong-ban"; id: string; name: string }
	| { loai: "truong"; don: "bo-phan" | "phong-ban"; id: string; name: string }
	| { loai: "chuyen"; id: string; name: string; divisionId: string | null };

export const KHONG_CHON = "__none";
export const NHOM_CHUA_XEP = "__chua-xep";

export function moiPhongBan(cay: CayDuLieu): PhongBanDuLieu[] {
	return [...cay.divisions.flatMap((d) => d.departments), ...cay.chuaXep];
}
