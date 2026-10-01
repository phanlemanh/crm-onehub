import type {
	GoiKiem,
	KrKiemGoi,
	LuatTomTat,
	NguonGoi,
} from "@crm/db/okr-tom-tat";
import { chuanHoa, coCum, khongDau } from "./okr-kiem";
import {
	CHU_SO_CHINH_XAC,
	docSo,
	HE_SO_DON_VI,
	HE_SO_NGHIN,
	type SoDoc,
} from "./okr-kiem-de-xuat";
import { docSoOkr, tienDoKr } from "./okr-kr";
import {
	type MaBoCau,
	parseNoiDungTomTat,
	parseTrangThaiTomTat,
	type TrangThaiTomTat,
} from "./okr-tom-tat";
import { type CauTomTat, okrTroLyViec, TRO_LY_OKR_TRAN } from "./okr-tro-ly";

export type NguonKiem = NguonGoi;

export type KrKiem = KrKiemGoi;

export type GoiKiemTomTat = GoiKiem;

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

const CHUOI_SO = /(\d+(?:[.,]\d+)*)(k\b)?/gi;

const NGHIN_PHAY = /^\d{1,3}(?:,\d{3})+(?:\.\d+)?$/;

const THAP_PHAN_CHAM = /^\d+(?:\.\d+)?$/;

const TRAN_SO = 1e12;

const HE_SO_KR = new Map([...HE_SO_DON_VI, ["k", HE_SO_NGHIN]]);

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

function docKieuAnh(chuoi: string): number | null {
	if (NGHIN_PHAY.test(chuoi)) return Number(chuoi.replace(/,/g, ""));
	return THAP_PHAN_CHAM.test(chuoi) ? Number(chuoi) : null;
}

function cachDocChuoiSo(chuoi: string, coK: boolean): number[] {
	const viet = docSoOkr(chuoi);
	const anh = docKieuAnh(chuoi);
	const ung = coK
		? [viet, anh].map((so) => (so === null ? null : so * HE_SO_NGHIN))
		: [viet, anh];
	const ra: number[] = [];
	for (const so of ung) {
		if (so === null || !Number.isFinite(so) || Math.abs(so) > TRAN_SO) continue;
		if (!ra.includes(so)) ra.push(so);
	}
	return ra;
}

function dinhDangSo(so: number): string {
	return Number.isInteger(so)
		? String(so)
		: so.toFixed(9).replace(/0+$/, "").replace(".", ",");
}

function thayChuoiSo(chu: string, chon: (cach: number[]) => number) {
	let chuaDoc = 0;
	const van = chu.replace(CHUOI_SO, (_khop, so: string, k?: string) => {
		const cach = cachDocChuoiSo(so, k !== undefined);
		if (cach.length === 0) {
			chuaDoc += 1;
			return " ";
		}
		return dinhDangSo(chon(cach));
	});
	return { van, chuaDoc };
}

function gopChuoiNhan(ds: readonly SoDoc[]): number[] {
	const ra: number[] = [];
	let i = 0;
	while (i < ds.length) {
		const dau = ds[i];
		if (!dau) break;
		let { giaTri, heSo, het } = dau;
		let j = i + 1;
		for (let ke = ds[j]; heSo > 1 && ke; ke = ds[j]) {
			if (ke.dau !== het || ke.heSo === 1 || ke.heSo >= heSo) break;
			giaTri += ke.giaTri;
			heSo = ke.heSo;
			het = ke.het;
			j += 1;
		}
		ra.push(giaTri);
		i = j;
	}
	return ra;
}

function trichSoGop(chu: string): number[] {
	return gopChuoiNhan(docSo(chu));
}

export function cachDocSo(chu: string): number[][] {
	const dau = thayChuoiSo(chu, (cach) => cach[0] ?? 0);
	const cuoi = thayChuoiSo(chu, (cach) => cach[cach.length - 1] ?? 0);
	const viet = trichSoGop(dau.van);
	const anh = trichSoGop(cuoi.van);
	const chuaDoc: number[][] = Array.from({ length: dau.chuaDoc }, () => []);
	if (viet.length !== anh.length)
		return [...viet.map((so) => [so]), [], ...chuaDoc];
	const ra = viet.map((so, i) => {
		const kia = anh[i];
		return kia === undefined || kia === so ? [so] : [so, kia];
	});
	return [...ra, ...chuaDoc];
}

function khop(a: number, b: number): boolean {
	return Math.abs(a - b) <= SAI_SO;
}

function nguonDan(cau: CauTomTat, goi: GoiKiemTomTat): NguonKiem[] {
	return cau.nguon.flatMap((id) => goi.nguon.filter((n) => n.id === id));
}

function heSoDonVi(donVi: string): number | null {
	const dau = chuanHoa(donVi).split(" ")[0] ?? "";
	return HE_SO_KR.get(dau) ?? null;
}

function giaTriThamChieu(dan: NguonKiem[], goi: GoiKiemTomTat): number[] {
	const ra: number[] = [];
	for (const n of dan) {
		const kr = goi.krs.find((k) => k.id === n.keyResultId);
		const cuaKr: number[] = [n.giaTri];
		if (n.truoc !== null) cuaKr.push(n.truoc);
		if (n.chenhLech !== null) cuaKr.push(Math.abs(n.chenhLech));
		for (const v of [kr?.khoiDiem, kr?.dich])
			if (v !== null && v !== undefined) cuaKr.push(v);
		ra.push(...cuaKr, n.tienDo);
		const heSo = kr ? heSoDonVi(kr.donVi) : null;
		if (heSo !== null)
			ra.push(
				...cuaKr.map((v) => Number((v * heSo).toPrecision(CHU_SO_CHINH_XAC))),
			);
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

export const LUAT_TOM_TAT = {
	kiemBan: kiemBanTomTat,
	kiemCau: kiemCauTomTat,
	docNoiDung: parseNoiDungTomTat,
	docTrangThai: parseTrangThaiTomTat,
	docViec: (value) => {
		const ket = okrTroLyViec.safeParse(value);
		if (!ket.success) {
			throw new Error(`viec tro ly okr hong: ${ket.error.message}`);
		}
		return ket.data;
	},
	tienDoKr,
} satisfies LuatTomTat<MaBoCau>;
