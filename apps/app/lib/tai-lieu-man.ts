import { dateFormat } from "@crm/ui/lib/format";
import type { Locale } from "@crm/ui/lib/locale";
import { SEARCH_PARAM } from "@/lib/search-param-keys";

const GIAY_MS = 1000;

export const TAB_TAI_LIEU = [
	"trang",
	"cho-duyet",
	"nguon",
	"suc-khoe",
	"hoi",
] as const;
export type TabTaiLieu = (typeof TAB_TAI_LIEU)[number];

export const NHOM_DE_XUAT = ["cho", "da-xu-ly"] as const;
export type NhomDeXuat = (typeof NHOM_DE_XUAT)[number];

export const TAI_LIEU_MAN = {
	muiGio: "Asia/Ho_Chi_Minh",
	goc: "/tai-lieu",
	khongDonVi: "khong-don-vi",
	dangTai: { soDong: 6 },
	nguon: {
		chapNhan: ".docx,.pdf",
		kieuNoiDung: {
			docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			pdf: "application/pdf",
		},
		neo: "nguon-",
		lamMoiMs: 5 * GIAY_MS,
	},
	hoi: { thamDoMs: 2 * GIAY_MS },
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

export function duongLichSu(slug: string): string {
	return `${duongTrang(slug)}/lich-su`;
}

export function duongPhienBan(slug: string, so: number): string {
	return `${duongLichSu(slug)}/${so}`;
}

export function duongSuaTrang(slug: string): string {
	return `${duongTrang(slug)}/sua`;
}

export function duongSuaTuDeXuat(slug: string, deXuatId: string): string {
	const q = new URLSearchParams({ [SEARCH_PARAM.taiLieu.tuDeXuat]: deXuatId });
	return `${duongSuaTrang(slug)}?${q.toString()}`;
}

export function duongTabNguon(): string {
	const q = new URLSearchParams({ [SEARCH_PARAM.taiLieu.tab]: "nguon" });
	return `${TAI_LIEU_MAN.goc}?${q.toString()}`;
}

export function duongChoDuyet(): string {
	const q = new URLSearchParams({ [SEARCH_PARAM.taiLieu.tab]: "cho-duyet" });
	return `${TAI_LIEU_MAN.goc}?${q.toString()}`;
}

export function neoNguon(id: string): string {
	return `${TAI_LIEU_MAN.nguon.neo}${id}`;
}

export function duongNguon(id: string): string {
	return `${duongTabNguon()}#${encodeURIComponent(neoNguon(id))}`;
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

export function ngayVn(iso: string): string {
	return new Intl.DateTimeFormat("en-CA", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		timeZone: TAI_LIEU_MAN.muiGio,
	}).format(new Date(iso));
}
