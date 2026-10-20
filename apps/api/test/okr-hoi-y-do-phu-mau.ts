import { OKR_HOI_Y } from "@crm/validation/okr-hoi-y";

export const utc = (
	ngay: number,
	gio: number,
	phut = 0,
	giay = 0,
	ms = 0,
): Date => new Date(Date.UTC(2026, 10, ngay, gio, phut, giay, ms));

export const E11_GIO_MO = utc(2, 3);
export const E11_NGAY_1_CUOI = utc(2, 16, 59, 59, 999);
export const E11_NGAY_2_DAU = utc(2, 17);
export const E11_BAY_GIO = utc(3, 9);

const GOC = OKR_HOI_Y.doPhu.idGoc;
const CHUA_XEP = OKR_HOI_Y.doPhu.idChuaXep;

export type LoaiDonViE11 = "goc" | "bo-phan" | "phong-ban" | "chua-xep";

export const E11_DON_VI: {
	khoa: string;
	loai: LoaiDonViE11;
	cha: string | null;
	giaTri: number[];
}[] = [
	{ khoa: GOC, loai: "goc", cha: null, giaTri: [33.3, 57.1] },
	{ khoa: "bpA", loai: "bo-phan", cha: GOC, giaTri: [42.9, 71.4] },
	{ khoa: "pb1", loai: "phong-ban", cha: "bpA", giaTri: [50, 75] },
	{ khoa: "pb2", loai: "phong-ban", cha: "bpA", giaTri: [33.3, 66.7] },
	{ khoa: "bpB", loai: "bo-phan", cha: GOC, giaTri: [33.3, 44.4] },
	{ khoa: "pb3", loai: "phong-ban", cha: "bpB", giaTri: [40, 40] },
	{ khoa: "pb4", loai: "phong-ban", cha: "bpB", giaTri: [25, 50] },
	{ khoa: "bpC", loai: "bo-phan", cha: GOC, giaTri: [0, 50] },
	{ khoa: "pb5", loai: "phong-ban", cha: "bpC", giaTri: [0, 50] },
	{ khoa: CHUA_XEP, loai: "chua-xep", cha: GOC, giaTri: [100, 100] },
];

const nguoiTrong = (pb: string, khoa: string[]) =>
	khoa.map((k) => ({ khoa: k, pb }));

export const E11_NGUOI: { khoa: string; pb: string | null }[] = [
	...nguoiTrong("pb1", ["quan", "thuong", "a3", "a4"]),
	...nguoiTrong("pb2", ["chu", "okr", "b3"]),
	...nguoiTrong("pb3", ["c1", "c2", "c3", "c4", "c5"]),
	...nguoiTrong("pb4", ["d1", "d2", "d3", "d4"]),
	...nguoiTrong("pb5", ["e1", "e2", "e3", "e4"]),
	{ khoa: "x", pb: null },
];

export const E11_NGUOI_CHON = { khoa: "P", pb: "pb3" };
export const E11_NGUOI_ROI = { khoa: "R", pb: "pb2" };

export const E11_GOP: { nguoi: string; luc: Date }[] = [
	{ nguoi: "thuong", luc: utc(2, 4) },
	{ nguoi: "a3", luc: utc(2, 5) },
	{ nguoi: "okr", luc: utc(2, 6) },
	{ nguoi: "c1", luc: utc(2, 7) },
	{ nguoi: "d1", luc: utc(2, 8) },
	{ nguoi: "x", luc: utc(2, 9) },
	{ nguoi: E11_NGUOI_ROI.khoa, luc: utc(2, 10) },
	{ nguoi: "c2", luc: E11_NGAY_1_CUOI },
	{ nguoi: "e1", luc: E11_NGAY_2_DAU },
	{ nguoi: "quan", luc: utc(3, 1) },
	{ nguoi: "b3", luc: utc(3, 2) },
	{ nguoi: "d2", luc: utc(3, 3) },
	{ nguoi: "e2", luc: utc(3, 4) },
	{ nguoi: "a3", luc: utc(3, 5) },
];

export const E11_COT = [
	{ ngay: "2026-11-02", nhan: "02/11" },
	{ ngay: "2026-11-03", nhan: "03/11" },
];

const E11_SO_GOP_TICH_LUY = [7, 12];
const E11_SO_THANH_VIEN = 21;
const E11_SO_CHUA_XEP = 1;

const motChuSo = (x: number) => Math.round(x * 10) / 10;

export type NguoiLaE11 = { tong: number; chuaXep: number };

export const KHONG_NGUOI_LA: NguoiLaE11 = { tong: 0, chuaXep: 0 };

export function e11KyVong(
	idCua: (khoa: string) => string,
	la: NguoiLaE11 = KHONG_NGUOI_LA,
) {
	return E11_DON_VI.map((d) => {
		const giaTri =
			la.tong === 0
				? d.giaTri
				: d.loai === "goc"
					? E11_SO_GOP_TICH_LUY.map((n) =>
							motChuSo((100 * n) / (E11_SO_THANH_VIEN + la.tong)),
						)
					: d.loai === "chua-xep"
						? E11_SO_GOP_TICH_LUY.map(() =>
								motChuSo(
									(100 * E11_SO_CHUA_XEP) / (E11_SO_CHUA_XEP + la.chuaXep),
								),
							)
						: d.giaTri;
		return {
			id: idCua(d.khoa),
			loai: d.loai,
			cha: d.cha === null ? null : idCua(d.cha),
			giaTri,
		};
	});
}
