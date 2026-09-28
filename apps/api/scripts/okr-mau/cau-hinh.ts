const PHUT_MS = 60_000;
const GIO_MS = 60 * PHUT_MS;
const NGAY_MS = 24 * GIO_MS;

export const OKR_MAU = {
	tienTo: "mau-okr-",
	mienThu: "mau.onehub.test",
	tuan: { soTuanCapNhat: 6, tuanMoiQuy: 13, gioCapNhat: 9, lechVN: 7 },
	thoiGian: { phutMs: PHUT_MS, gioMs: GIO_MS, ngayMs: NGAY_MS },
	mayCucBo: ["localhost", "127.0.0.1", "::1", "[::1]"],
	moiTruongCam: { NODE_ENV: ["production"], VERCEL_ENV: ["production", "preview"] },
	co: { moc: "--moc", xoa: "--xoa", tep: "--tep" },
	ma: { chan: 2, okrThat: 3, sai: 4, dangGiu: 5 },
	lenh: "bun run okr:mau",
} as const;

export type MaThoat = (typeof OKR_MAU.ma)[keyof typeof OKR_MAU.ma];

export class LoiBoMau extends Error {
	constructor(
		readonly ma: MaThoat,
		cau: string,
	) {
		super(cau);
	}
}
