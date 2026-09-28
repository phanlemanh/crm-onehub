import { dateFormat } from "@crm/ui/lib/format";
import type { Locale } from "@crm/ui/lib/locale";

export const TAB_TAI_LIEU = ["trang", "cho-duyet"] as const;
export type TabTaiLieu = (typeof TAB_TAI_LIEU)[number];

export const TAI_LIEU_MAN = {
	muiGio: "Asia/Ho_Chi_Minh",
	goc: "/tai-lieu",
	khongDonVi: "khong-don-vi",
	dangTai: { soDong: 6 },
} as const;

export function duongDanhSach(): string {
	return TAI_LIEU_MAN.goc;
}

export function duongTrangMoi(): string {
	return `${TAI_LIEU_MAN.goc}/moi`;
}

export function duongTrang(slug: string): string {
	return `${TAI_LIEU_MAN.goc}/${encodeURIComponent(slug)}`;
}

export function duongSuaTrang(slug: string): string {
	return `${duongTrang(slug)}/sua`;
}

export function duongDeXuat(id: string): string {
	return `${TAI_LIEU_MAN.goc}/de-xuat/${encodeURIComponent(id)}`;
}

export function ngayTaiLieu(iso: string, locale: Locale): string {
	return dateFormat(locale, {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		timeZone: TAI_LIEU_MAN.muiGio,
	}).format(new Date(iso));
}
