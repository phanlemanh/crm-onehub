import type { Locale } from "@crm/ui/lib/locale";
import {
	type SettingsMessages,
	settingsMessages,
} from "@/lib/messages/settings";

export type MucCaiDat = {
	khoa: keyof SettingsMessages["thanhBen"];
	href: string;
};

export type NhomCaiDat = {
	khoa: keyof SettingsMessages["nhomThanhBen"];
	muc: readonly MucCaiDat[];
};

export const GOC_CAI_DAT = "/settings";

export const NHOM_CAI_DAT: readonly NhomCaiDat[] = [
	{
		khoa: "khongGian",
		muc: [
			{ khoa: "chung", href: GOC_CAI_DAT },
			{ khoa: "tienTe", href: `${GOC_CAI_DAT}/currencies` },
			{ khoa: "truong", href: `${GOC_CAI_DAT}/fields` },
			{ khoa: "giaiDoan", href: `${GOC_CAI_DAT}/giai-doan` },
			{ khoa: "lichLamViec", href: `${GOC_CAI_DAT}/lich-lam-viec` },
		],
	},
	{
		khoa: "conNguoi",
		muc: [
			{ khoa: "thanhVien", href: `${GOC_CAI_DAT}/members` },
			{ khoa: "toChuc", href: `${GOC_CAI_DAT}/organization` },
			{ khoa: "chuongTrinhOkr", href: `${GOC_CAI_DAT}/okr` },
			{ khoa: "dieuPhoi", href: `${GOC_CAI_DAT}/onboarding` },
		],
	},
	{
		khoa: "ketNoiDuLieu",
		muc: [
			{ khoa: "ketNoi", href: `${GOC_CAI_DAT}/connections` },
			{ khoa: "theoDoi", href: `${GOC_CAI_DAT}/tracking` },
		],
	},
	{
		khoa: "baoMat",
		muc: [
			{ khoa: "sso", href: `${GOC_CAI_DAT}/sso` },
			{ khoa: "khoaApi", href: `${GOC_CAI_DAT}/api-keys` },
		],
	},
];

export const MUC_CAI_DAT: readonly MucCaiDat[] = NHOM_CAI_DAT.flatMap(
	(nhom) => nhom.muc,
);

export function mucCaiDatDangMo(
	href: string,
	goc: string,
	pathname: string,
): boolean {
	return href === goc ? pathname === href : pathname.startsWith(href);
}

export function nhanCaiDat(muc: MucCaiDat, locale: Locale): string {
	return settingsMessages(locale).thanhBen[muc.khoa];
}
