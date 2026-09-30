export const MINUTE_MS = 60_000;
export const NGAY_MS = 24 * 60 * MINUTE_MS;
export const TUAN_MS = 7 * NGAY_MS;

const SECOND_MS = MINUTE_MS / 60;

export const TRO_LY_OKR_TRAN = {
	chu: {
		tenMucTieu: 200,
		tenKr: 200,
		viSao: 500,
		lyDo: 200,
		cauHoi: 200,
		cauTomTat: 280,
	},
	soDongDeXuat: 8,
	soCauTomTat: 6,
	soNguonMoiCau: 4,
	tranThangMacDinhUsd: 9,
	tranThangToiDaUsd: 20,
	tuCam: [
		"lương",
		"thưởng",
		"xếp loại",
		"xếp hạng",
		"đánh giá nhân viên",
		"đánh giá hiệu suất",
		"KPI",
		"bảng xếp hạng",
		"huy hiệu",
		"điểm đổi quà",
		"khách hàng",
		"deal",
		"cơ hội",
		"doanh số",
		"phễu",
		"dự án",
		"task",
		"nhiệm vụ",
	],
	soBangChu: {
		hauToCo: [
			"tỷ",
			"tỉ",
			"triệu",
			"nghìn",
			"ngàn",
			"trăm",
			"mươi",
			"%",
			"phần trăm",
		],
		namSauCum: [
			"cuối",
			"đầu",
			"giữa",
			"trong",
			"mỗi",
			"hằng",
			"hàng",
			"cả",
			"nửa",
			"của",
			"chỉ tiêu",
			"kế hoạch",
		],
		namTruocCum: ["nay", "tới", "sau", "trước", "ngoái", "học", "tài chính"],
		dauCau: [".", "!", "?", ";", ":"],
	},
	soChuHoTenToiThieu: 2,
	troLyNgayMoiNguoi: 20,
	luotAnMoiNgay: 40,
	nhipAnMucTieuMs: 30 * MINUTE_MS,
	hanKiemKhoaMs: 10 * MINUTE_MS,
	hoiLaiMs: 1.5 * SECOND_MS,
	tranChoMs: 30 * SECOND_MS,
	diemXuHuongToiThieu: 3,
	hoanTacNgay: 7,
} as const;

export const OKR_TOM_TAT = {
	gioXep: { gio: 6, phut: 0 },
	cuaSoNgay: 7,
	tyLeGiuLai: 0.3,
	hienTrongNgay: 8,
	hoiLaiMs: 5 * SECOND_MS,
	tranChoMs: 2 * MINUTE_MS,
	dongBaoAiToiDa: 2,
	giaoDichXepMs: MINUTE_MS,
} as const;

export const MUC_TU_TIN = ["cao", "vua", "thap"] as const;

export type MucTuTin = (typeof MUC_TU_TIN)[number];

export const VIEC_TRO_LY = ["de-xuat", "tom-tat-tuan"] as const;

export type ViecTroLy = (typeof VIEC_TRO_LY)[number];

export const TRUONG_VIET_LAI = ["title", "whyNow", "kr.title"] as const;

export type TruongVietLai = (typeof TRUONG_VIET_LAI)[number];

export const AI_PHAM_VI = ["tat", "toan-cong-ty", "danh-sach"] as const;

export type AiPhamVi = (typeof AI_PHAM_VI)[number];

export const TRANG_THAI_DE_XUAT = [
	"cho",
	"nhan",
	"sua",
	"bac",
	"het-han",
	"da-sua-theo",
	"bo-qua",
	"bi-loai",
] as const;

export const NAC_TRO_LY = ["tat", "an", "bat"] as const;

export type NacTroLy = (typeof NAC_TRO_LY)[number];

export const MA_LOAI_DE_XUAT = [
	"id-ngoai-goi",
	"so-moi",
	"tu-cam",
	"noi-ve-nguoi",
	"chep-cap-tren",
	"trung-luat",
	"dich-ngoai-tap",
	"da-bac",
	"dang-cho",
	"khong-doi",
] as const;

export type MaLoaiDeXuat = (typeof MA_LOAI_DE_XUAT)[number];

export const LY_DO_KHONG_SAN_SANG = [
	"tat",
	"viec-tat",
	"don-vi-chua-bat",
	"het-tran-thang",
	"het-tran-ngay",
	"chua-noi-tac-tu",
	"chua-co-khoa-mo-hinh",
	"het-tran-gateway",
] as const;

export type LyDoKhongSanSang = (typeof LY_DO_KHONG_SAN_SANG)[number];

export type TroLySanSang =
	| { bat: true; conLaiUsd: number }
	| { bat: false; lyDo: LyDoKhongSanSang };

export const KET_QUA_KIEM_SAN_SANG = [
	"san-sang",
	"chua-co-khoa-mo-hinh",
] as const;

export type KetQuaKiemSanSang = (typeof KET_QUA_KIEM_SAN_SANG)[number];

export const DON_VI_ONEHUB = "onehub";

export type CauHinhAi = {
	aiOn: boolean;
	aiDeXuatPhamVi: AiPhamVi;
	aiDeXuatDonVi: readonly string[];
	aiTomTatPhamVi: AiPhamVi;
	aiTomTatDonVi: readonly string[];
	aiDeXuatAnPhamVi: AiPhamVi;
	aiDeXuatAnDonVi: readonly string[];
	aiTomTatAnPhamVi: AiPhamVi;
	aiTomTatAnDonVi: readonly string[];
	aiTranThangUsd: number;
};

export type DonViMucTieu = {
	onehub: boolean;
	boPhanId: string | null;
	phongBanId: string | null;
};

export function phamViCuaViec(
	ct: CauHinhAi,
	viec: ViecTroLy,
): { phamVi: AiPhamVi; donVi: readonly string[] } {
	return viec === "de-xuat"
		? { phamVi: ct.aiDeXuatPhamVi, donVi: ct.aiDeXuatDonVi }
		: { phamVi: ct.aiTomTatPhamVi, donVi: ct.aiTomTatDonVi };
}

function phamViAnCuaViec(
	ct: CauHinhAi,
	viec: ViecTroLy,
): { phamVi: AiPhamVi; donVi: readonly string[] } {
	return viec === "de-xuat"
		? { phamVi: ct.aiDeXuatAnPhamVi, donVi: ct.aiDeXuatAnDonVi }
		: { phamVi: ct.aiTomTatAnPhamVi, donVi: ct.aiTomTatAnDonVi };
}

export type NacCuaDonVi = "tat" | "viec-tat" | "don-vi-chua-bat" | "an" | "bat";

function phuDonVi(
	p: { phamVi: AiPhamVi; donVi: readonly string[] },
	donVi: DonViMucTieu,
): boolean {
	if (p.phamVi === "tat") return false;
	if (p.phamVi === "toan-cong-ty") return true;
	return (
		(donVi.onehub && p.donVi.includes(DON_VI_ONEHUB)) ||
		(donVi.boPhanId !== null && p.donVi.includes(donVi.boPhanId)) ||
		(donVi.phongBanId !== null && p.donVi.includes(donVi.phongBanId))
	);
}

export function nacCuaDonVi(
	ct: CauHinhAi,
	viec: ViecTroLy,
	donVi: DonViMucTieu,
): NacCuaDonVi {
	if (!ct.aiOn) return "tat";
	const bat = phamViCuaViec(ct, viec);
	const an = phamViAnCuaViec(ct, viec);
	if (phuDonVi(bat, donVi)) return "bat";
	if (phuDonVi(an, donVi)) return "an";
	if (bat.phamVi === "tat" && an.phamVi === "tat") return "viec-tat";
	return "don-vi-chua-bat";
}

export function nacCuaViec(ct: CauHinhAi, viec: ViecTroLy): NacCuaDonVi {
	if (!ct.aiOn) return "tat";
	if (phamViCuaViec(ct, viec).phamVi !== "tat") return "bat";
	if (phamViAnCuaViec(ct, viec).phamVi !== "tat") return "an";
	return "viec-tat";
}

export function motTrong<T extends string>(
	danhSach: readonly T[],
	giaTri: string,
	truong: string,
): T {
	if ((danhSach as readonly string[]).includes(giaTri)) return giaTri as T;
	throw new Error(`${truong} không đọc được: «${giaTri}»`);
}
