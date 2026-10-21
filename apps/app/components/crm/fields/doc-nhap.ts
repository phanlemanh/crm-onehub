import type { FieldTypeName } from "@crm/db/fields";
import { LOCALES, type Locale } from "@crm/ui/lib/locale";
import { moneySeparators } from "@crm/ui/lib/money-input";
import { docSoDienThoai } from "@crm/validation/so-dien-thoai";

export type KieuTruong = FieldTypeName | "MONEY";

export const MA_TU_CHOI = [
	"trong",
	"so",
	"locale-khac",
	"email",
	"lien-ket",
	"dien-thoai",
	"lua-chon",
	"nguoi",
	"khac",
] as const;

export type MaTuChoi = (typeof MA_TU_CHOI)[number];

export type DocNhap<T> =
	| { kind: "rong" }
	| { kind: "ok"; giaTri: T }
	| { kind: "tu-choi"; ma: MaTuChoi };

const CHU_SO_THAP_PHAN_TOI_DA = 20;

const escapeRegExp = (value: string) =>
	value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function docTheoDau(
	chuoi: string,
	dau: { group: string; decimal: string },
): number | null {
	const group = escapeRegExp(dau.group);
	const decimal = escapeRegExp(dau.decimal);
	const khuon = new RegExp(
		`^([-−]?)(\\d{1,3}(?:${group}\\d{3})+|\\d+)(?:${decimal}(\\d+))?$`,
	);
	const khop = khuon.exec(chuoi);
	if (!khop) return null;
	const nguyen = (khop[2] ?? "").split(dau.group).join("");
	const le = khop[3] ? `.${khop[3]}` : "";
	const so = Number(`${khop[1] ? "-" : ""}${nguyen}${le}`);
	return Number.isFinite(so) ? so : null;
}

export function docSoNhap(chuoi: string, locale: Locale): DocNhap<number> {
	const gon = chuoi.trim();
	if (gon === "") return { kind: "rong" };

	const cuaMinh = moneySeparators(locale);
	const so = docTheoDau(gon, cuaMinh);
	if (so !== null) return { kind: "ok", giaTri: so };

	const docDuocTheoLocaleKhac = LOCALES.filter((khac) => khac !== locale)
		.map(moneySeparators)
		.filter(
			(dau) => dau.group !== cuaMinh.group || dau.decimal !== cuaMinh.decimal,
		)
		.some((dau) => docTheoDau(gon, dau) !== null);

	return {
		kind: "tu-choi",
		ma: docDuocTheoLocaleKhac ? "locale-khac" : "so",
	};
}

const dinhDangSo = new Map<Locale, Intl.NumberFormat>();

export function hienThiSo(so: number, locale: Locale): string {
	let dinhDang = dinhDangSo.get(locale);
	if (!dinhDang) {
		dinhDang = new Intl.NumberFormat(locale, {
			maximumFractionDigits: CHU_SO_THAP_PHAN_TOI_DA,
		});
		dinhDangSo.set(locale, dinhDang);
	}
	return dinhDang.format(so);
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CO_GIAO_THUC = /^[a-z][a-z0-9+.-]*:/i;
const GIAO_THUC_WEB = /^https?:\/\//i;

function urlWeb(giaTri: string): string | null {
	const coGiaoThuc = CO_GIAO_THUC.test(giaTri);
	if (coGiaoThuc && !GIAO_THUC_WEB.test(giaTri)) return null;
	const day = coGiaoThuc ? giaTri : `https://${giaTri}`;
	try {
		return new URL(day).hostname.includes(".") ? day : null;
	} catch {
		return null;
	}
}

export function docNhapTheoKieu(
	kieu: KieuTruong,
	chuoi: string,
	locale: Locale,
): DocNhap<string | number> {
	const gon = chuoi.trim();
	if (gon === "") return { kind: "rong" };

	switch (kieu) {
		case "NUMBER":
			return docSoNhap(gon, locale);
		case "EMAIL":
			return EMAIL.test(gon)
				? { kind: "ok", giaTri: gon }
				: { kind: "tu-choi", ma: "email" };
		case "URL":
			return urlWeb(gon)
				? { kind: "ok", giaTri: gon }
				: { kind: "tu-choi", ma: "lien-ket" };
		case "PHONE":
			return docSoDienThoai(gon).kind === "ok"
				? { kind: "ok", giaTri: gon }
				: { kind: "tu-choi", ma: "dien-thoai" };
		default:
			return { kind: "ok", giaTri: gon };
	}
}

export function hrefLienKet(
	kieu: "URL" | "EMAIL" | "PHONE",
	giaTri: string,
): string | null {
	const gon = giaTri.trim();
	if (gon === "") return null;

	if (kieu === "URL") return urlWeb(gon);
	if (kieu === "EMAIL") return EMAIL.test(gon) ? `mailto:${gon}` : null;

	const doc = docSoDienThoai(gon);
	return doc.kind === "ok" ? `tel:${doc.so}` : null;
}
