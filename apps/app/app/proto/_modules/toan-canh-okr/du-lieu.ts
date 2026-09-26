import {
	type KrMau,
	MT_CSKH_1,
	MT_CSKH_2,
	type MucTieuMau,
	type MucTuTin,
	NGUOI,
	type NguoiMau,
	TUAN_CUA_KY,
} from "../ban-mau-okr/du-lieu";

export type LyDoBan =
	| { loai: "tu-tin-tut"; tu: MucTuTin; xuong: MucTuTin }
	| { loai: "im"; ngay: number }
	| { loai: "ghi-chu-moi"; ghiChu: string };

export type DongHopTuan = {
	kr: KrMau;
	mucTieu: MucTieuMau;
	lyDo: LyDoBan[];
};

const krCua = (mt: MucTieuMau, id: string): KrMau => {
	const kr = mt.kr.find((k) => k.id === id);
	if (!kr) throw new Error(`thiếu KR mẫu ${id}`);
	return kr;
};

export const DANG_BAN: DongHopTuan[] = [
	{
		kr: krCua(MT_CSKH_1, "c1k3"),
		mucTieu: MT_CSKH_1,
		lyDo: [
			{ loai: "tu-tin-tut", tu: "vua", xuong: "thap" },
			{ loai: "im", ngay: 15 },
		],
	},
	{
		kr: krCua(MT_CSKH_1, "c1k2"),
		mucTieu: MT_CSKH_1,
		lyDo: [
			{ loai: "tu-tin-tut", tu: "cao", xuong: "vua" },
			{
				loai: "ghi-chu-moi",
				ghiChu: "Hai công ty mới chấm thấp vì chờ tài khoản.",
			},
		],
	},
	{
		kr: krCua(MT_CSKH_1, "c1k4"),
		mucTieu: MT_CSKH_1,
		lyDo: [
			{
				loai: "ghi-chu-moi",
				ghiChu: "Ba công ty dời buổi gặp sang tuần sau vì nghỉ lễ.",
			},
		],
	},
];

export const CON_LAI: DongHopTuan[] = [
	{ kr: krCua(MT_CSKH_1, "c1k1"), mucTieu: MT_CSKH_1, lyDo: [] },
	{ kr: krCua(MT_CSKH_2, "c2k1"), mucTieu: MT_CSKH_2, lyDo: [] },
];

export const TUAN_HOP = {
	nhan: "Tuần 30/11 – 06/12",
	truoc: "23/11",
	daCapNhat: 3,
	tongKr: 5,
} as const;

export type HangSucKhoe = {
	id: string;
	ten: string;
	cap: "bo-phan" | "phong-ban";
	dungTuan: number;
	tongKr: number;
	krIm: number;
	chuaCongBo: number;
	chuaNoiKenh: number;
	truong: NguoiMau | null;
};

export const SUC_KHOE: HangSucKhoe[] = [
	{
		id: "kinhdoanh",
		ten: "Kinh doanh",
		cap: "bo-phan",
		dungTuan: 8,
		tongKr: 10,
		krIm: 1,
		chuaCongBo: 0,
		chuaNoiKenh: 2,
		truong: NGUOI.lan,
	},
	{
		id: "kd1",
		ten: "Kinh doanh vùng 1",
		cap: "phong-ban",
		dungTuan: 3,
		tongKr: 5,
		krIm: 1,
		chuaCongBo: 0,
		chuaNoiKenh: 1,
		truong: NGUOI.hung,
	},
	{
		id: "kd2",
		ten: "Kinh doanh vùng 2",
		cap: "phong-ban",
		dungTuan: 5,
		tongKr: 5,
		krIm: 0,
		chuaCongBo: 0,
		chuaNoiKenh: 1,
		truong: NGUOI.duc,
	},
	{
		id: "vanhanh",
		ten: "Vận hành",
		cap: "bo-phan",
		dungTuan: 6,
		tongKr: 13,
		krIm: 2,
		chuaCongBo: 3,
		chuaNoiKenh: 3,
		truong: null,
	},
	{
		id: "cskh",
		ten: "Chăm sóc khách hàng",
		cap: "phong-ban",
		dungTuan: 3,
		tongKr: 5,
		krIm: 1,
		chuaCongBo: 0,
		chuaNoiKenh: 0,
		truong: NGUOI.thao,
	},
	{
		id: "kho",
		ten: "Kho vận",
		cap: "phong-ban",
		dungTuan: 0,
		tongKr: 3,
		krIm: 1,
		chuaCongBo: 3,
		chuaNoiKenh: 3,
		truong: null,
	},
	{
		id: "taichinh",
		ten: "Tài chính",
		cap: "bo-phan",
		dungTuan: 5,
		tongKr: 5,
		krIm: 0,
		chuaCongBo: 0,
		chuaNoiKenh: 0,
		truong: NGUOI.khoa,
	},
];

export type DiemDienBien = {
	tuan: string;
	giaTri: number | null;
	kyVong: number;
	tuTin: MucTuTin | null;
	ghiChu: string | null;
};

export const DIEN_BIEN_C1K2: DiemDienBien[] = [
	{ tuan: "02/11", giaTri: 60, kyVong: 60, tuTin: "cao", ghiChu: null },
	{ tuan: "09/11", giaTri: 66, kyVong: 63, tuTin: "cao", ghiChu: null },
	{ tuan: "16/11", giaTri: 71, kyVong: 66, tuTin: "cao", ghiChu: null },
	{
		tuan: "23/11",
		giaTri: 74,
		kyVong: 68,
		tuTin: "vua",
		ghiChu: "Hai công ty mới chấm thấp vì chờ tài khoản.",
	},
	{ tuan: "30/11", giaTri: 72, kyVong: 72, tuTin: "vua", ghiChu: null },
	...TUAN_CUA_KY.slice(6).map((tuan, i) => ({
		tuan,
		giaTri: null,
		kyVong: 75 + i * 3,
		tuTin: null,
		ghiChu: null,
	})),
];

export const DIEN_BIEN_MOC: {
	tuan: string;
	tuTin: MucTuTin;
	ghiChu: string | null;
}[] = [
	{ tuan: "09/11", tuTin: "cao", ghiChu: null },
	{ tuan: "16/11", tuTin: "vua", ghiChu: "Bản nháp gửi pháp chế." },
	{ tuan: "23/11", tuTin: "thap", ghiChu: "Chờ pháp chế duyệt điều khoản." },
];

export const KR_CUA_TOI_TONG_QUAN: { kr: KrMau; mucTieu: MucTieuMau }[] = [
	{ kr: krCua(MT_CSKH_1, "c1k3"), mucTieu: MT_CSKH_1 },
	{ kr: krCua(MT_CSKH_2, "c2k1"), mucTieu: MT_CSKH_2 },
	{ kr: krCua(MT_CSKH_1, "c1k2"), mucTieu: MT_CSKH_1 },
	{ kr: krCua(MT_CSKH_1, "c1k1"), mucTieu: MT_CSKH_1 },
];
