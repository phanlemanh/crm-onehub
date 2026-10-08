import mau from "./du-lieu-mau.json";

export type NhomTrangThai = "da-giao" | "dang-lam" | "chua-bat-dau" | "khac";

export type Hang = {
	ma: string;
	cau_giao: string;
	hang: string;
	nhom: string;
	dung_tren: string[];
	trang_thai: string;
	nhom_trang_thai: NhomTrangThai;
	ho_so: string | null;
	theo_loi: boolean;
	co: string[];
	bat_khi: string;
	vi_sao: string;
};

export type Moc = {
	ten: string;
	ngay: string;
	hang: string[];
	con_viec: boolean;
};

export type LoTrinh = {
	tep: string;
	ten: string | null;
	loi: string | null;
	hang_ke: { ma: string; cau_giao: string; lenh: string | null } | null;
	can_sua: { ma: string | null; chu: string }[];
	tien_do: {
		tong: number;
		da_giao: number;
		dang_lam: number;
		chua_bat_dau: number;
		khac: number;
	};
	hang: Hang[];
	moc: Moc[];
	da_bac: { ma: string; ly_do: string }[];
};

export type DuLieu = {
	khuon: string;
	phien_ban: number;
	nguon: string[];
	lo_trinh: LoTrinh[];
	ngoai_lo_trinh: string[];
};

export type DauVao =
	| { kieu: "dang-tai" }
	| { kieu: "tep-vang" }
	| { kieu: "chua-co-khoi"; canhBao: string[] }
	| { kieu: "khoi-hong"; canhBao: string[] }
	| { kieu: "co-du-lieu"; duLieu: DuLieu; canhBao: string[] };

export const DU_LIEU_MAU = mau as DuLieu;

export const STATE = {
	dayDu: "ST-lotrinh-day-du",
	loc: "ST-lotrinh-loc",
	locRong: "ST-lotrinh-loc-rong",
	tre: "ST-lotrinh-tre",
	dangTai: "ST-lotrinh-dang-tai",
	chuaCoKhoi: "ST-lotrinh-chua-co-khoi",
	khoiHong: "ST-lotrinh-khoi-hong",
	tepVang: "ST-lotrinh-tep-vang",
	loLoi: "ST-lotrinh-lo-loi",
	khuonMoi: "ST-lotrinh-khuon-moi",
} as const;

export const NGAY_MAU = "2026-10-09";
export const NGAY_TRE = "2026-12-20";

export function dauVaoCuaState(state: string): DauVao {
	if (state === STATE.dangTai) return { kieu: "dang-tai" };
	if (state === STATE.tepVang) return { kieu: "tep-vang" };
	if (state === STATE.chuaCoKhoi)
		return {
			kieu: "chua-co-khoi",
			canhBao: [
				"trang chưa mang dữ liệu lộ trình — vẽ lại bằng bộ kit từ 2.27",
			],
		};
	if (state === STATE.khoiHong)
		return {
			kieu: "khoi-hong",
			canhBao: [
				"khối dữ liệu lộ trình không phải JSON hợp lệ: Unexpected token 'k', \"{khong\" is not valid JSON",
			],
		};
	if (state === STATE.loLoi)
		return {
			kieu: "co-du-lieu",
			canhBao: [],
			duLieu: {
				...DU_LIEU_MAU,
				lo_trinh: DU_LIEU_MAU.lo_trinh.map((lo, i) =>
					i === 1
						? {
								...lo,
								loi: "docs/plan/lo-trinh-kho-tai-lieu.json: không phải JSON hợp lệ (dòng 14)",
								hang: [],
								moc: [],
								can_sua: [],
								da_bac: [],
								hang_ke: null,
								tien_do: {
									tong: 0,
									da_giao: 0,
									dang_lam: 0,
									chua_bat_dau: 0,
									khac: 0,
								},
							}
						: lo,
				),
			},
		};
	if (state === STATE.khuonMoi)
		return {
			kieu: "co-du-lieu",
			canhBao: ["khuôn phiên bản 2 mới hơn bộ đọc (1) — đọc phần biết"],
			duLieu: { ...DU_LIEU_MAU, phien_ban: 2 },
		};
	return { kieu: "co-du-lieu", canhBao: [], duLieu: DU_LIEU_MAU };
}
