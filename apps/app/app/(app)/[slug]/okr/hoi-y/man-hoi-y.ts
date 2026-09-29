import { dateFormat } from "@crm/ui/lib/format";
import type { Locale } from "@crm/ui/lib/locale";
import { KET_LUAN_CHON, OKR_HOI_Y } from "@crm/validation/okr-hoi-y";
import type { RouterOutputs } from "@/lib/trpc/types";

export type HoiY = NonNullable<RouterOutputs["okr"]["hoiY"]>;
export type YXem = HoiY["y"]["ds"][number];
export type ChuDe = NonNullable<HoiY["chuDe"]>[number];
export type YCuaToi = HoiY["cuaToi"]["y"][number];
export type DieuThieu = HoiY["quyen"]["lyDoChuaCongBo"][number];
export type MaThieu = DieuThieu["ma"];
export type KetQuaHoiY = NonNullable<HoiY["ketQua"]>;
export type DoPhu = RouterOutputs["okr"]["hoiYDoPhu"];
export type HoiYNhan = RouterOutputs["okr"]["hoiYNhan"];

const PHUT_MS = 60_000;
const GIO_MS = 60 * PHUT_MS;

export const HOI_Y_MAN = {
	muiGio: "Asia/Ho_Chi_Minh",
	lechGio: "+07:00",
	gioMs: GIO_MS,
	han: { gioMacDinh: "17:00", ngayMacDinh: 2 },
	nguoiChonToiDa: 100,
	cuon: { lechPx: 16, nhipMs: 100 },
	neo: {
		yChuaGom: "y-chua-gom",
		ketLuan: "ket-luan",
		banVietTruoc: "ban-viet-truoc",
		chuDe: "chu-de-",
	},
} as const;

export const TRANG_THAI_MAN = [
	"dang-tai",
	"loi",
	"chua-chu-ky",
	"trong-quan-tri",
	"trong-thanh-vien",
	"gop",
	"da-niem-phong",
	"het-han",
	"viet-truoc",
	"gom",
	"chon-chua-du",
	"chon-du",
	"ket-qua",
] as const;
export type TrangThaiMan = (typeof TRANG_THAI_MAN)[number];

export function trangThaiMan(h: HoiY): TrangThaiMan {
	if (h.trangThai === "da-cong-bo") return "ket-qua";
	if (h.y.khoa) return "viet-truoc";
	if (h.trangThai === "dang-mo") {
		return h.banTruoc === null ? "gop" : "da-niem-phong";
	}
	if (h.quyen.chonDuoc) {
		return h.quyen.lyDoChuaCongBo.length > 0 ? "chon-chua-du" : "chon-du";
	}
	if (h.banTruoc === null && h.quyen.gomDuoc) return "gom";
	return "het-han";
}

export function nhanTuHoiYNhan(d: HoiYNhan | undefined): "moi" | number | null {
	if (!d) return null;
	if (d.canGop) return "moi";
	const so = d.soChuDeChuaKetLuan ?? 0;
	return so > 0 ? so : null;
}

export function neoChuDe(id: string): string {
	return `${HOI_Y_MAN.neo.chuDe}${id}`;
}

const NEO_CHUNG = {
	"chua-niem-phong": HOI_Y_MAN.neo.banVietTruoc,
	"y-chua-gom": HOI_Y_MAN.neo.yChuaGom,
	"chu-de-rong": HOI_Y_MAN.neo.ketLuan,
	"thieu-ket-luan": HOI_Y_MAN.neo.ketLuan,
	"thieu-ly-do": HOI_Y_MAN.neo.ketLuan,
	"thieu-cau-muc-tieu": HOI_Y_MAN.neo.ketLuan,
	"thieu-noi-ban-truoc": HOI_Y_MAN.neo.ketLuan,
	"khong-chon": HOI_Y_MAN.neo.ketLuan,
	"vuot-tran": HOI_Y_MAN.neo.ketLuan,
} satisfies Record<MaThieu, string>;

export function dichThieu(d: DieuThieu): string {
	return d.chuDeId === null ? NEO_CHUNG[d.ma] : neoChuDe(d.chuDeId);
}

export function daKetLuan(c: ChuDe): boolean {
	return c.ketLuan !== null && c.lyDo.trim().length >= OKR_HOI_Y.lyDo.min;
}

export function soChon(chuDe: ChuDe[]): number {
	return chuDe.filter((c) => c.ketLuan === KET_LUAN_CHON).length;
}

export function yNguoiKhac(h: HoiY): YXem[] {
	const cuaToi = new Set(h.cuaToi.y.map((y) => y.id));
	return h.y.ds.filter((y) => !cuaToi.has(y.id));
}

export function coTen(
	y: YXem,
): y is Extract<YXem, { tacGia: { id: string; ten: string } }> {
	return "tacGia" in y;
}

export function lucVN(iso: string, locale: Locale): string {
	const phan = dateFormat(locale, {
		timeZone: HOI_Y_MAN.muiGio,
		day: "numeric",
		month: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23",
	}).formatToParts(new Date(iso));
	const lay = (loai: Intl.DateTimeFormatPartTypes) =>
		phan.find((p) => p.type === loai)?.value ?? "";
	return `${lay("day")}/${lay("month")} ${lay("hour")}:${lay("minute")}`;
}

export function ngayCot(ngay: string, locale: Locale): string {
	return dateFormat(locale, {
		timeZone: "UTC",
		day: "numeric",
		month: "short",
	}).format(new Date(`${ngay}T00:00:00Z`));
}

export function soGioCon(hanLuc: string, bayGio: number): number {
	return Math.max(0, Math.floor((Date.parse(hanLuc) - bayGio) / GIO_MS));
}

export function homNayVN(bayGio: number): string {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: HOI_Y_MAN.muiGio,
	}).format(new Date(bayGio));
}

export function congNgay(ngay: string, soNgay: number): string {
	const d = new Date(`${ngay}T00:00:00Z`);
	d.setUTCDate(d.getUTCDate() + soNgay);
	return d.toISOString().split("T")[0] ?? ngay;
}

export function hanLucTu(ngay: string, gio: string): string {
	return `${ngay}T${gio}:00${HOI_Y_MAN.lechGio}`;
}

export function gioVN(iso: string): string {
	const phan = dateFormat("vi", {
		timeZone: HOI_Y_MAN.muiGio,
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23",
	}).formatToParts(new Date(iso));
	const lay = (loai: Intl.DateTimeFormatPartTypes) =>
		phan.find((p) => p.type === loai)?.value ?? "";
	return `${lay("hour")}:${lay("minute")}`;
}

export type LoiHan = "thieu" | "som" | "qua" | "muon" | null;

export function kiemHanSua(
	hanLuc: string,
	moLuc: string,
	bayGio: number,
): LoiHan {
	const han = Date.parse(hanLuc);
	if (Number.isNaN(han)) return "thieu";
	if (han < bayGio) return "qua";
	if ((han - Date.parse(moLuc)) / GIO_MS > OKR_HOI_Y.hanGio.max) return "muon";
	return null;
}

export function kiemHan(hanLuc: string, bayGio: number): LoiHan {
	const han = Date.parse(hanLuc);
	if (Number.isNaN(han)) return "thieu";
	const gio = (han - bayGio) / GIO_MS;
	if (gio < OKR_HOI_Y.hanGio.min) return "som";
	if (gio > OKR_HOI_Y.hanGio.max) return "muon";
	return null;
}
