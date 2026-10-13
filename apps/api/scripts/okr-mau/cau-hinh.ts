const PHUT_MS = 60_000;
const GIO_MS = 60 * PHUT_MS;
const NGAY_MS = 24 * GIO_MS;
const NGAY_GIO = NGAY_MS / GIO_MS;

export const OKR_MAU = {
	tienTo: "mau-okr-",
	mienThu: "mau.onehub.test",
	tuan: { soTuanCapNhat: 6, tuanMoiQuy: 13, gioCapNhat: 9, lechVN: 7 },
	duyet: { tuanGui: { nhap: 2, choDuyet: 5 }, gioTraLai: 6 },
	thoiGian: { phutMs: PHUT_MS, gioMs: GIO_MS, ngayMs: NGAY_MS },
	hoiY: {
		moTruocGio: 6 * NGAY_GIO,
		hanSauMoGio: 5 * NGAY_GIO,
		niemPhongSauMoGio: 1,
		dongYSauYGio: 1,
		gomSauHanGio: 2,
		ketLuanSauHanGio: 4,
	},
	mayCucBo: ["localhost", "127.0.0.1", "::1", "[::1]"],
	moiTruongCam: {
		NODE_ENV: ["production"],
		VERCEL_ENV: ["production", "preview"],
	},
	co: { moc: "--moc", xoa: "--xoa", tep: "--tep" },
	ma: { chan: 2, okrThat: 3, sai: 4, dangGiu: 5 },
	lenh: "bun run okr:mau",
	caQuy4: {
		tienTo: "ca-",
		tienToNg: "ca-ng-",
		chuKyQuy: "quy4",
		chuKyNam: "nam",
		capQuy: ["bo-phan", "phong-ban"],
		capNam: "onehub",
		congBo: "cong-bo",
		ngonNgu: "vi",
		co: { nhan: "--nhan", ra: "--ra" },
		thuMucRa: ["agent", "evals", "okr", "ca-gop-y", "quy-4"],
		tepNhan: "nhan-ca-quy-4.json",
		tepCongTy: "cong-ty.json",
		lenh: "bun run okr:ca-quy-4",
		tenLenh: "okr:ca-quy-4",
	},
} as const;

export function idMau(loai: string, ma: string): string {
	return `${OKR_MAU.tienTo}${loai}-${ma}`;
}

export const ngayDb = (ngay: string): Date => new Date(`${ngay}T00:00:00.000Z`);

export type MaThoat = (typeof OKR_MAU.ma)[keyof typeof OKR_MAU.ma];

export class LoiBoMau extends Error {
	constructor(
		readonly ma: MaThoat,
		cau: string,
	) {
		super(cau);
	}
}
