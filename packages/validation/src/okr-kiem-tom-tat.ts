import { chuanHoa, coCum, khongDau, trichSo } from "./okr-kiem-de-xuat";
import type { MaBoCau, TrangThaiTomTat } from "./okr-tom-tat";
import { type CauTomTat, TRO_LY_OKR_TRAN } from "./okr-tro-ly";

export type NguonKiem = {
	id: string;
	keyResultId: string;
	giaTri: number;
	truoc: number | null;
	chenhLech: number | null;
	chenhTuTin: -2 | -1 | 0 | 1 | 2 | null;
	ngay: string;
};

export type KrKiem = {
	id: string;
	khoiDiem: number | null;
	dich: number | null;
	tienDo: number | null;
};

export type GoiKiemTomTat = {
	nguon: NguonKiem[];
	krs: KrKiem[];
	tenThanhVien: string[];
	tuCam: readonly string[];
	chuDauVao: string;
};

export type KetQuaKiemCau = { qua: true } | { qua: false; maBo: MaBoCau };

export type CauBo = CauTomTat & { maBo: MaBoCau };

export type BanTomTatDaKiem = {
	cau: CauTomTat[];
	bo: CauBo[];
	trangThai: TrangThaiTomTat;
};

const SAI_SO = 1e-9;

const CHIEU_TANG = ["tăng", "lên", "vượt"];

const CHIEU_GIAM = ["giảm", "xuống", "tụt"];

const NGAY_THANG = /(?<![\d/])(\d{1,2})\/(\d{1,2})(?![\d/])/g;

const NGHIN_KIEU_ANH = /\d{1,3}(?:,\d{3})+(?:\.\d+)?/g;

const HAU_TO_K = /(\d+(?:[.,]\d+)?)k\b/gi;

const NGHIN_CHAM = /(?<![\d.,])(\d{1,3})\.(\d{3})(?![\d.,])/g;

function ghepNgay(ngay: string): string {
	const [d = "", m = ""] = ngay.split("/");
	return `${Number(d)}/${Number(m)}`;
}

function boNgay(chu: string, ngayNguon: readonly string[]): string {
	const hopLe = new Set(ngayNguon.map(ghepNgay));
	return chu.replace(NGAY_THANG, (khop, d: string, m: string) =>
		hopLe.has(`${Number(d)}/${Number(m)}`) ? " " : khop,
	);
}

function vietHoaKieuAnh(chu: string): string {
	return chu
		.replace(NGHIN_KIEU_ANH, (s) => s.replace(/,/g, ""))
		.replace(HAU_TO_K, "$1 nghìn")
		.replace(NGHIN_CHAM, "$1,$2");
}

export function cachDocSo(chu: string): number[][] {
	const viet = trichSo(chu);
	const anh = trichSo(vietHoaKieuAnh(chu));
	return viet.map((so, i) => {
		const kia = anh.length === viet.length ? anh[i] : undefined;
		return kia === undefined || kia === so ? [so] : [so, kia];
	});
}

function khop(a: number, b: number): boolean {
	return Math.abs(a - b) <= SAI_SO;
}

function nguonDan(cau: CauTomTat, goi: GoiKiemTomTat): NguonKiem[] {
	return cau.nguon.flatMap((id) => goi.nguon.filter((n) => n.id === id));
}

function giaTriThamChieu(dan: NguonKiem[], goi: GoiKiemTomTat): number[] {
	const ra: number[] = [];
	for (const n of dan) {
		ra.push(n.giaTri);
		if (n.truoc !== null) ra.push(n.truoc);
		if (n.chenhLech !== null) ra.push(Math.abs(n.chenhLech));
		if (n.chenhTuTin !== null) ra.push(Math.abs(n.chenhTuTin));
		const kr = goi.krs.find((k) => k.id === n.keyResultId);
		for (const v of [kr?.khoiDiem, kr?.dich, kr?.tienDo])
			if (v !== null && v !== undefined) ra.push(v);
	}
	return ra;
}

function nguonNgoaiGoi(cau: CauTomTat, goi: GoiKiemTomTat): boolean {
	return cau.nguon.some((id) => !goi.nguon.some((n) => n.id === id));
}

function soLech(cau: CauTomTat, goi: GoiKiemTomTat): boolean {
	const dan = nguonDan(cau, goi);
	const chu = boNgay(
		cau.vanBan,
		dan.map((n) => n.ngay),
	);
	const tham = giaTriThamChieu(dan, goi);
	return cachDocSo(chu).some(
		(cach) => !cach.some((so) => tham.some((t) => khop(so, t))),
	);
}

function coTuChiChieu(van: string, ds: readonly string[]): boolean {
	return ds.some((tu) => coCum(van, tu));
}

function daoDongCungDau(dan: NguonKiem[], dau: 1 | -1): boolean {
	return dan.some(
		(n) =>
			(n.chenhLech !== null && Math.sign(n.chenhLech) === dau) ||
			(n.chenhTuTin !== null && Math.sign(n.chenhTuTin) === dau),
	);
}

function saiChieu(cau: CauTomTat, goi: GoiKiemTomTat): boolean {
	const van = chuanHoa(cau.vanBan);
	const dan = nguonDan(cau, goi);
	return (
		(coTuChiChieu(van, CHIEU_TANG) && !daoDongCungDau(dan, 1)) ||
		(coTuChiChieu(van, CHIEU_GIAM) && !daoDongCungDau(dan, -1))
	);
}

function noiVeNguoi(cau: CauTomTat, goi: GoiKiemTomTat): boolean {
	const van = khongDau(cau.vanBan);
	return goi.tenThanhVien
		.map(khongDau)
		.filter(
			(ten) => ten.split(" ").length >= TRO_LY_OKR_TRAN.soChuHoTenToiThieu,
		)
		.some((ten) => coCum(van, ten));
}

function tuCam(cau: CauTomTat, goi: GoiKiemTomTat): boolean {
	const van = chuanHoa(cau.vanBan);
	const dauVao = chuanHoa(goi.chuDauVao);
	return goi.tuCam.some((tu) => {
		const cum = chuanHoa(tu);
		return coCum(van, cum) && !coCum(dauVao, cum);
	});
}

function trungCau(cau: CauTomTat, truoc: readonly string[]): boolean {
	return truoc.includes(cau.vanBan);
}

export function kiemCauTomTat(
	cau: CauTomTat,
	goi: GoiKiemTomTat,
	truoc: readonly string[],
): KetQuaKiemCau {
	const luat: readonly (readonly [MaBoCau, boolean])[] = [
		["nguon-ngoai-goi", nguonNgoaiGoi(cau, goi)],
		["so-lech", soLech(cau, goi)],
		["sai-chieu", saiChieu(cau, goi)],
		["noi-ve-nguoi", noiVeNguoi(cau, goi)],
		["tu-cam", tuCam(cau, goi)],
		["trung-cau", trungCau(cau, truoc)],
	];
	const trot = luat.find(([, vi]) => vi);
	return trot ? { qua: false, maBo: trot[0] } : { qua: true };
}

export function kiemBanTomTat(
	cau: CauTomTat[],
	goi: GoiKiemTomTat,
	{ tyLeGiuLai }: { tyLeGiuLai: number },
): BanTomTatDaKiem {
	const giu: CauTomTat[] = [];
	const bo: CauBo[] = [];
	for (const c of cau) {
		const ket = kiemCauTomTat(
			c,
			goi,
			giu.map((g) => g.vanBan),
		);
		if (ket.qua) giu.push(c);
		else bo.push({ ...c, maBo: ket.maBo });
	}
	const tong = giu.length + bo.length;
	const canXem = giu.length === 0 || bo.length / tong > tyLeGiuLai;
	return { cau: giu, bo, trangThai: canXem ? "can-xem" : "hien" };
}
