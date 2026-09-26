import type { Locale } from "@crm/ui/lib/locale";
import { PHAM_VI_CHI_SO, type PhamViChiSo } from "@crm/validation/okr-chi-so";
import type { NguonKr } from "@crm/validation/okr-kr";
import { docDuocPhamVi } from "@crm/validation/vai-workspace";
import { useQuery } from "@tanstack/react-query";
import type { OkrSoMessages } from "@/lib/messages/okr-so";
import { useTRPC } from "@/lib/trpc/client";
import type { CayDuLieu } from "./kieu";

const DINH_DANG_SO = { vi: "vi-VN", en: "en-US" } satisfies Record<
	Locale,
	string
>;

export function chuSo(so: number, locale: Locale): string {
	return so.toLocaleString(DINH_DANG_SO[locale]);
}

export const KHOA_NGUON = {
	tay: "tay",
	crm: "crm",
	api: "api",
	"bang-tinh": "bangTinh",
} as const satisfies Record<NguonKr, keyof OkrSoMessages["nguon"]>;

export type NguonMay = Exclude<NguonKr, "tay">;

export const KHOA_DAU = {
	crm: "crm",
	api: "api",
	"bang-tinh": "bangTinh",
} as const satisfies Record<NguonMay, keyof OkrSoMessages["dau"]>;

export function useXemDuocBanGhi(): boolean {
	const trpc = useTRPC();
	const workspace = useQuery(trpc.workspace.get.queryOptions());
	return docDuocPhamVi(workspace.data?.viewerRole ?? null, "doi-tac");
}

export type PhamViHien = { nhan: string; ten: string | null };

function tenDonVi(pv: PhamViChiSo, cay: CayDuLieu | undefined): string | null {
	if (pv.kieu === "toan-cong-ty" || !cay) return null;
	if (pv.kieu === "nguoi")
		return cay.people.find((p) => p.id === pv.id)?.name ?? null;
	if (pv.kieu === "bo-phan")
		return (
			[...cay.divisions, ...cay.archived.divisions].find((d) => d.id === pv.id)
				?.name ?? null
		);
	return (
		[
			...cay.divisions.flatMap((d) => d.departments),
			...cay.chuaXep,
			...cay.archived.departments,
		].find((d) => d.id === pv.id)?.name ?? null
	);
}

export function hienPhamVi(
	pv: PhamViChiSo,
	cay: CayDuLieu | undefined,
	s: OkrSoMessages,
): PhamViHien {
	return { nhan: s.phamVi[pv.kieu], ten: tenDonVi(pv, cay) };
}

export function docKhoaPhamVi(chu: string): PhamViChiSo | null {
	const [kieu, ...du] = chu.split(":");
	const id = du.join(":");
	const k = PHAM_VI_CHI_SO.find((x) => x === kieu);
	if (!k) return null;
	if (k === "toan-cong-ty") return id ? null : { kieu: k };
	return id ? { kieu: k, id } : null;
}
