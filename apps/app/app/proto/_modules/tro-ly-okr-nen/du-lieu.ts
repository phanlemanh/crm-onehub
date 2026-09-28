export type PhamVi = "tat" | "toan-cong-ty" | "danh-sach";

export type SanSang =
	| { loai: "tat" }
	| { loai: "san-sang"; conLai: number }
	| { loai: "chua-san-sang"; lyDo: string }
	| { loai: "het-tran"; toiNgay: string };

export type CauHinhMau = {
	bat: boolean;
	deXuat: PhamVi;
	deXuatDonVi: string[];
	tomTat: PhamVi;
	tomTatDonVi: string[];
	tran: string;
	sanSang: SanSang;
	loiLuu: boolean;
};

export type DongChiTieu = { viec: string; soBuoc: number; usd: number };

export type DoiSoat =
	| { loai: "chua-co" }
	| { loai: "khop"; thang: string; lech: number }
	| { loai: "lech"; thang: string; lech: number }
	| { loai: "khong-duoc"; thang: string; lyDo: string };

export type SoMau =
	| { loai: "dang-tai" }
	| { loai: "loi" }
	| { loai: "rong"; tran: number }
	| {
			loai: "co-so";
			dong: DongChiTieu[];
			chuaGan: number;
			troLyOkr: number;
			tran: number;
			doiSoat: DoiSoat;
	  };

export const DON_VI = [
	{ id: "onehub", ten: "OneHub" },
	{ id: "bp-kinh-doanh", ten: "Khối Kinh doanh" },
	{ id: "pb-marketing", ten: "Phòng Marketing" },
];

const CAU_HINH_GOC: CauHinhMau = {
	bat: true,
	deXuat: "danh-sach",
	deXuatDonVi: ["onehub", "bp-kinh-doanh"],
	tomTat: "tat",
	tomTatDonVi: [],
	tran: "9",
	sanSang: { loai: "san-sang", conLai: 6.58 },
	loiLuu: false,
};

const DONG_GOC: DongChiTieu[] = [
	{ viec: "Nghiên cứu danh bạ", soBuoc: 412, usd: 5.84 },
	{ viec: "Trợ lý AI", soBuoc: 96, usd: 1.93 },
	{ viec: "Hỏi CRM qua Zalo", soBuoc: 188, usd: 2.71 },
	{ viec: "Tác nhân", soBuoc: 37, usd: 0.64 },
	{ viec: "Trợ lý OKR", soBuoc: 141, usd: 2.42 },
];

const KHOP: DoiSoat = { loai: "khop", thang: "08/2026", lech: 3 };

const SO_GOC: SoMau = {
	loai: "co-so",
	dong: DONG_GOC,
	chuaGan: 0,
	troLyOkr: 2.42,
	tran: 9,
	doiSoat: KHOP,
};

const voiOkr = (usd: number, doiSoat: DoiSoat = KHOP): SoMau => ({
	loai: "co-so",
	dong: DONG_GOC.map((d) => (d.viec === "Trợ lý OKR" ? { ...d, usd } : d)),
	chuaGan: 0,
	troLyOkr: usd,
	tran: 9,
	doiSoat,
});

export const STATES = {
	"ST-troly-dang-tai": { cauHinh: null, so: SO_GOC },
	"ST-troly-tat": {
		cauHinh: {
			...CAU_HINH_GOC,
			bat: false,
			deXuat: "tat",
			deXuatDonVi: [],
			sanSang: { loai: "tat" },
		},
		so: SO_GOC,
	},
	"ST-troly-san-sang": { cauHinh: CAU_HINH_GOC, so: SO_GOC },
	"ST-troly-chua-san-sang": {
		cauHinh: {
			...CAU_HINH_GOC,
			sanSang: { loai: "chua-san-sang", lyDo: "Chưa có khoá mô hình" },
		},
		so: SO_GOC,
	},
	"ST-troly-het-tran": {
		cauHinh: {
			...CAU_HINH_GOC,
			sanSang: { loai: "het-tran", toiNgay: "01/11" },
		},
		so: voiOkr(9.04),
	},
	"ST-troly-khong-don-vi": {
		cauHinh: { ...CAU_HINH_GOC, deXuatDonVi: [] },
		so: SO_GOC,
	},
	"ST-troly-loi-luu": {
		cauHinh: { ...CAU_HINH_GOC, tran: "7,5", loiLuu: true },
		so: SO_GOC,
	},
	"ST-sochiphi-dang-tai": { cauHinh: CAU_HINH_GOC, so: { loai: "dang-tai" } },
	"ST-sochiphi-rong": { cauHinh: CAU_HINH_GOC, so: { loai: "rong", tran: 9 } },
	"ST-sochiphi-co-so": {
		cauHinh: CAU_HINH_GOC,
		so: {
			loai: "co-so",
			dong: DONG_GOC,
			chuaGan: 0.12,
			troLyOkr: 2.42,
			tran: 9,
			doiSoat: KHOP,
		},
	},
	"ST-sochiphi-80": { cauHinh: CAU_HINH_GOC, so: voiOkr(7.38) },
	"ST-sochiphi-100": {
		cauHinh: {
			...CAU_HINH_GOC,
			sanSang: { loai: "het-tran", toiNgay: "01/11" },
		},
		so: voiOkr(9.04),
	},
	"ST-sochiphi-doi-soat-lech": {
		cauHinh: CAU_HINH_GOC,
		so: voiOkr(2.42, { loai: "lech", thang: "08/2026", lech: 14 }),
	},
	"ST-sochiphi-khong-doi-soat": {
		cauHinh: CAU_HINH_GOC,
		so: voiOkr(2.42, {
			loai: "khong-duoc",
			thang: "08/2026",
			lyDo: "tác tử chạy bằng OIDC, không có khoá riêng để lọc báo cáo",
		}),
	},
	"ST-sochiphi-loi": { cauHinh: CAU_HINH_GOC, so: { loai: "loi" } },
	"ST-thanh-vien": { cauHinh: null, so: null },
} satisfies Record<string, { cauHinh: CauHinhMau | null; so: SoMau | null }>;

export type StateId = keyof typeof STATES;

export const laState = (s: string): s is StateId => s in STATES;
