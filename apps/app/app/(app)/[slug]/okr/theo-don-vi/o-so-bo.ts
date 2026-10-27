import { kyVongCo } from "../tien-do-kr";

export type SoCuaBo = {
	tienDo: number | null;
	kyVong: number | null;
	soKr: number;
	daCapNhat: number;
	tuTin: { thap: number };
};

export type KhungChuKy = { startsOn: string; endsOn: string };

export type ChuOSo = {
	ngayConLai: string;
	tienDo: string;
	daCapNhat: string;
	tuTinThap: string;
	den: (ngay: string) => string;
	batDau: (ngay: string) => string;
	daKetThuc: (ngay: string) => string;
	leRa: (n: string) => string;
	chuaCoVach: string;
	vuaCongBo: string;
	ngay: (iso: string) => string;
};

export type MaOSo = "ngay-con-lai" | "tien-do" | "da-cap-nhat" | "tu-tin-thap";

export type OSo = {
	ma: MaOSo;
	nhan: string;
	giaTri: string;
	moTa: string | null;
};

const NGAY_MS = 86_400_000;

const soNgay = (iso: string) => Date.parse(`${iso}T00:00:00Z`) / NGAY_MS;

function oNgayConLai(chuKy: KhungChuKy, homNay: string, chu: ChuOSo): OSo {
	const nhan = chu.ngayConLai;
	if (homNay < chuKy.startsOn)
		return {
			ma: "ngay-con-lai",
			nhan,
			giaTri: "—",
			moTa: chu.batDau(chu.ngay(chuKy.startsOn)),
		};
	if (homNay > chuKy.endsOn)
		return {
			ma: "ngay-con-lai",
			nhan,
			giaTri: "0",
			moTa: chu.daKetThuc(chu.ngay(chuKy.endsOn)),
		};
	const con = Math.round(soNgay(chuKy.endsOn) - soNgay(homNay)) + 1;
	return {
		ma: "ngay-con-lai",
		nhan,
		giaTri: String(con),
		moTa: chu.den(chu.ngay(chuKy.endsOn)),
	};
}

function moTaTienDo(so: SoCuaBo, chu: ChuOSo): string {
	if (so.kyVong === null) return chu.chuaCoVach;
	const kyVong = kyVongCo(so.kyVong);
	return kyVong === null ? chu.vuaCongBo : chu.leRa(String(kyVong));
}

export function oSoBo(
	so: SoCuaBo | null,
	chuKy: KhungChuKy,
	homNay: string,
	chu: ChuOSo,
): OSo[] {
	const coSo = so !== null && so.soKr > 0;
	return [
		oNgayConLai(chuKy, homNay, chu),
		{
			ma: "tien-do",
			nhan: chu.tienDo,
			giaTri: coSo && so.tienDo !== null ? `${so.tienDo}%` : "—",
			moTa: coSo ? moTaTienDo(so, chu) : chu.chuaCoVach,
		},
		{
			ma: "da-cap-nhat",
			nhan: chu.daCapNhat,
			giaTri: coSo ? `${so.daCapNhat}/${so.soKr}` : "0/0",
			moTa: null,
		},
		{
			ma: "tu-tin-thap",
			nhan: chu.tuTinThap,
			giaTri: coSo ? String(so.tuTin.thap) : "0",
			moTa: null,
		},
	];
}
