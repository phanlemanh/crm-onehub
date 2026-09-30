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
] as const;

export type MaLoaiBanNhap = (typeof MA_LOAI_BAN_NHAP)[number];

type DongKrSoan = Extract<DongSoan, { loai: "kr-moi" }>;

export type DongKiemSoan =
	| Exclude<DongSoan, { loai: "kr-moi" }>
	| (Omit<DongKrSoan, "dich"> & { dich: number | null });

export type GoiKiemSoan = {
	soTrongGoi: Set<string>;
	soNguoiGo: Set<string>;
	tenThanhVien: string[];
	tuCam: readonly string[];
	tenCapTren: string[];
	idCanChinh: Set<string>;
	khoaDaBac: Set<string>;
};

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

function soMoi(d: DongKiemSoan, goi: GoiKiemSoan): boolean {
	if (d.loai === "can-chinh-moi") return false;
	const phep = new Set([...goi.soTrongGoi, ...goi.soNguoiGo]);
	if (
		d.loai === "kr-moi" &&
		d.khoiDiemGoiY !== null &&
		!phep.has(String(d.khoiDiemGoiY))
	)
		return true;
	return chuCuaDong(d).some((c) =>
		trichSo(c).some((s) => !phep.has(String(s))),
	);
}

function dichKhongTrong(d: DongKiemSoan): boolean {
	return d.loai === "kr-moi" && d.dich !== null;
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

function tuCam(d: DongKiemSoan, goi: GoiKiemSoan): boolean {
	const chu = chuCuaDong(d).map(chuanHoa);
	return goi.tuCam.some((tu) => chu.some((c) => coCum(c, chuanHoa(tu))));
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

function daBac(d: DongKiemSoan, goi: GoiKiemSoan): boolean {
	return goi.khoaDaBac.has(khoaCua(d));
}

function mocCoDichSo(d: DongKiemSoan): boolean {
	return (
		d.loai === "kr-moi" &&
		d.kieu === KIEU_MOC &&
		(d.khoiDiemGoiY !== null ||
			DICH_TRONG_CHU.test(d.ten) ||
			DICH_TRONG_CHU.test(d.viSao))
	);
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
	["so-moi", soMoi],
];

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
