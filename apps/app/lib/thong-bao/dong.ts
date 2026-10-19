import { dateFormat } from "@crm/ui/lib/format";
import type { Locale } from "@crm/ui/lib/locale";
import { homNayVN, NGAY_VN } from "@crm/validation/ngay-vn";
import type { NoiDungThongBao } from "@crm/validation/thong-bao";
import type {
	DongThongBao,
	NhomThongBao,
} from "@/components/thong-bao/dong-thong-bao";
import { cauThongBao, tenKhongDich } from "@/lib/thong-bao/cau";

export type ThongBaoRa = {
	id: string;
	noiDung: NoiDungThongBao;
	duongDan: string;
	taoLuc: Date | string;
	daDoc: boolean;
};

type BoiCanh = { locale: Locale; slug: string; now: Date };

function gio(locale: Locale, luc: Date): string {
	return dateFormat(locale, {
		timeZone: NGAY_VN.muiGio,
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23",
	}).format(luc);
}

function ngayThang(locale: Locale, luc: Date): string {
	return dateFormat(locale, {
		timeZone: NGAY_VN.muiGio,
		day: "2-digit",
		month: "2-digit",
	}).format(luc);
}

function thuNgay(locale: Locale, luc: Date): string {
	return dateFormat(locale, {
		timeZone: NGAY_VN.muiGio,
		weekday: "long",
		day: "2-digit",
		month: "2-digit",
	}).format(luc);
}

export function hrefThongBao(slug: string, duongDan: string): string {
	return `/${slug}${duongDan}`;
}

export function dongTuRa(
	r: ThongBaoRa,
	ctx: BoiCanh,
	kieuGio: "gio" | "ngay-gio",
): DongThongBao {
	const luc = new Date(r.taoLuc);
	const homNay = homNayVN(luc) === homNayVN(ctx.now);
	return {
		id: r.id,
		cau: cauThongBao(ctx.locale, r.noiDung),
		khongDich: tenKhongDich(r.noiDung),
		gio:
			kieuGio === "gio" || homNay
				? gio(ctx.locale, luc)
				: `${ngayThang(ctx.locale, luc)}, ${gio(ctx.locale, luc)}`,
		chuaDoc: !r.daDoc,
		href: hrefThongBao(ctx.slug, r.duongDan),
	};
}

export function chiaHomNay(ds: ThongBaoRa[], ctx: BoiCanh) {
	const homNay: DongThongBao[] = [];
	const truocDo: DongThongBao[] = [];
	for (const r of ds) {
		const dong = dongTuRa(r, ctx, "ngay-gio");
		if (homNayVN(new Date(r.taoLuc)) === homNayVN(ctx.now)) homNay.push(dong);
		else truocDo.push(dong);
	}
	return { homNay, truocDo };
}

export function nhomTheoNgay(
	ds: ThongBaoRa[],
	ctx: BoiCanh,
	nhanHomNay: string,
): NhomThongBao[] {
	const nhom = new Map<string, NhomThongBao>();
	for (const r of ds) {
		const luc = new Date(r.taoLuc);
		const ngay = homNayVN(luc);
		const nhan =
			ngay === homNayVN(ctx.now) ? nhanHomNay : thuNgay(ctx.locale, luc);
		const co = nhom.get(ngay) ?? { nhan, dong: [] };
		co.dong.push(dongTuRa(r, ctx, "gio"));
		nhom.set(ngay, co);
	}
	return [...nhom.values()];
}
