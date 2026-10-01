import { z } from "zod";
import { chuanHoa, coCum, khongDau } from "./okr-kiem";
import { khoaDong, trichSo } from "./okr-kiem-de-xuat";
import { type DongSoan, TRO_LY_OKR_TRAN } from "./okr-tro-ly";

export const MA_LOAI_BAN_NHAP = [
	"so-moi",
	"dich-khong-trong",
	"noi-ve-nguoi",
	"tu-cam",
	"chep-cap-tren",
	"id-ngoai-goi",
	"da-bac",
	"moc-co-dich-so",
	"khong-don-vi",
	"khoi-diem-la-dich",
] as const;

export type MaLoaiBanNhap = (typeof MA_LOAI_BAN_NHAP)[number];

type DongKrSoan = Extract<DongSoan, { loai: "kr-moi" }>;

export type DongKiemSoan =
	| Exclude<DongSoan, { loai: "kr-moi" }>
	| (Omit<DongKrSoan, "dich"> & { dich: number | null });

export type GoiKiemSoan = {
	soTrongGoi: Set<string>;
	soDich: Set<string>;
	soKhoiDiem: Set<string>;
	soNguoiGo: Set<string>;
	tenThanhVien: string[];
	tuCam: readonly string[];
	tenCapTren: string[];
	idCanChinh: Set<string>;
	khoaDaBac: Set<string>;
};

export const dongBiLoaiSoan = z.object({
	khoa: z.string(),
	ten: z.string(),
	maLoai: z.enum(MA_LOAI_BAN_NHAP),
	viPham: z.string(),
});

export type DongBiLoaiSoan = z.infer<typeof dongBiLoaiSoan>;

export type KetQuaKiemBanNhap =
	| { qua: true }
	| { qua: false; maLoai: MaLoaiBanNhap };

const KIEU_MOC = "moc";
const DICH_TRONG_CHU = /đích\s*[:=]?\s*\d/iu;

function chuCuaDong(d: DongKiemSoan): string[] {
	switch (d.loai) {
		case "muc-tieu-moi":
			return [d.ten, d.viSao, d.viSaoLucNay];
		case "kr-moi":
			return [d.ten, d.viSao];
		case "can-chinh-moi":
			return [d.viSao];
	}
}

function khoaCua(d: DongKiemSoan): string {
	return khoaDong(d.loai === "kr-moi" ? { ...d, dich: null } : d);
}

function soMoiCua(d: DongKiemSoan, goi: GoiKiemSoan): string[] {
	if (d.loai === "can-chinh-moi") return [];
	const phep = new Set([...goi.soTrongGoi, ...goi.soNguoiGo]);
	const khoiDiem =
		d.loai === "kr-moi" && d.khoiDiemGoiY !== null ? [d.khoiDiemGoiY] : [];
	const so = [...khoiDiem, ...chuCuaDong(d).flatMap(trichSo)].map(String);
	return [...new Set(so.filter((s) => !phep.has(s)))];
}

function soMoi(d: DongKiemSoan, goi: GoiKiemSoan): boolean {
	return soMoiCua(d, goi).length > 0;
}

function khoiDiemLaDichCua(d: DongKiemSoan, goi: GoiKiemSoan): string[] {
	if (d.loai !== "kr-moi" || d.khoiDiemGoiY === null) return [];
	const so = String(d.khoiDiemGoiY);
	return goi.soDich.has(so) && !goi.soKhoiDiem.has(so) && !goi.soNguoiGo.has(so)
		? [so]
		: [];
}

function khoiDiemLaDich(d: DongKiemSoan, goi: GoiKiemSoan): boolean {
	return khoiDiemLaDichCua(d, goi).length > 0;
}

function dichCua(d: DongKiemSoan): string[] {
	return d.loai === "kr-moi" && d.dich !== null ? [String(d.dich)] : [];
}

function dichKhongTrong(d: DongKiemSoan): boolean {
	return dichCua(d).length > 0;
}

function noiVeNguoi(d: DongKiemSoan, goi: GoiKiemSoan): boolean {
	const chu = chuCuaDong(d).map(khongDau);
	return goi.tenThanhVien
		.map(khongDau)
		.filter(
			(ten) => ten.split(" ").length >= TRO_LY_OKR_TRAN.soChuHoTenToiThieu,
		)
		.some((ten) => chu.some((c) => coCum(c, ten)));
}

function tuCamCua(d: DongKiemSoan, goi: GoiKiemSoan): string[] {
	const chu = chuCuaDong(d).map(chuanHoa);
	return goi.tuCam.filter((tu) => chu.some((c) => coCum(c, chuanHoa(tu))));
}

function tuCam(d: DongKiemSoan, goi: GoiKiemSoan): boolean {
	return tuCamCua(d, goi).length > 0;
}

function chepCapTren(d: DongKiemSoan, goi: GoiKiemSoan): boolean {
	if (d.loai === "can-chinh-moi") return false;
	const ten = chuanHoa(d.ten);
	return goi.tenCapTren.some((t) => chuanHoa(t) === ten);
}

function idNgoaiGoi(d: DongKiemSoan, goi: GoiKiemSoan): boolean {
	if (d.loai !== "can-chinh-moi") return false;
	const dich = d.targetObjectiveId ?? d.targetKeyResultId;
	return dich === null || !goi.idCanChinh.has(dich);
}

function idNgoaiGoiCua(d: DongKiemSoan, goi: GoiKiemSoan): string[] {
	if (!idNgoaiGoi(d, goi) || d.loai !== "can-chinh-moi") return [];
	const dich = d.targetObjectiveId ?? d.targetKeyResultId;
	return dich === null ? [] : [dich];
}

function daBac(d: DongKiemSoan, goi: GoiKiemSoan): boolean {
	return goi.khoaDaBac.has(khoaCua(d));
}

function mocCoDichSoCua(d: DongKiemSoan): string[] {
	if (d.loai !== "kr-moi" || d.kieu !== KIEU_MOC) return [];
	return [
		...(d.khoiDiemGoiY === null ? [] : [String(d.khoiDiemGoiY)]),
		...[d.ten, d.viSao].flatMap((c) => c.match(DICH_TRONG_CHU)?.[0] ?? []),
	];
}

function mocCoDichSo(d: DongKiemSoan): boolean {
	return mocCoDichSoCua(d).length > 0;
}

function khongDonVi(d: DongKiemSoan): boolean {
	return d.loai === "kr-moi" && d.donVi.trim() === "";
}

const LUAT: readonly (readonly [
	MaLoaiBanNhap,
	(d: DongKiemSoan, g: GoiKiemSoan) => boolean,
])[] = [
	["id-ngoai-goi", idNgoaiGoi],
	["da-bac", daBac],
	["dich-khong-trong", dichKhongTrong],
	["moc-co-dich-so", mocCoDichSo],
	["khong-don-vi", khongDonVi],
	["tu-cam", tuCam],
	["noi-ve-nguoi", noiVeNguoi],
	["chep-cap-tren", chepCapTren],
	["khoi-diem-la-dich", khoiDiemLaDich],
	["so-moi", soMoi],
];

const KHONG_NEU_GIA_TRI = (): string[] => [];

const GIA_TRI_VI_PHAM = {
	"so-moi": soMoiCua,
	"khoi-diem-la-dich": khoiDiemLaDichCua,
	"dich-khong-trong": dichCua,
	"moc-co-dich-so": mocCoDichSoCua,
	"tu-cam": tuCamCua,
	"id-ngoai-goi": idNgoaiGoiCua,
	"noi-ve-nguoi": KHONG_NEU_GIA_TRI,
	"chep-cap-tren": KHONG_NEU_GIA_TRI,
	"da-bac": KHONG_NEU_GIA_TRI,
	"khong-don-vi": KHONG_NEU_GIA_TRI,
} satisfies Record<
	MaLoaiBanNhap,
	(d: DongKiemSoan, g: GoiKiemSoan) => string[]
>;

export function giaTriViPham(
	d: DongKiemSoan,
	goi: GoiKiemSoan,
	maLoai: MaLoaiBanNhap,
): string[] {
	return GIA_TRI_VI_PHAM[maLoai](d, goi);
}

export function kiemDongBanNhap(
	d: DongKiemSoan,
	goi: GoiKiemSoan,
): KetQuaKiemBanNhap {
	const loai = LUAT.find(([, vi]) => vi(d, goi));
	return loai ? { qua: false, maLoai: loai[0] } : { qua: true };
}

export function kiemBanNhap(
	dongs: readonly DongKiemSoan[],
	goi: GoiKiemSoan,
): { dong: DongKiemSoan; kq: KetQuaKiemBanNhap }[] {
	return dongs.map((dong) => ({ dong, kq: kiemDongBanNhap(dong, goi) }));
}
