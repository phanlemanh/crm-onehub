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
} as const;

export const VIEC_TRO_LY = ["de-xuat", "tom-tat-tuan"] as const;

export type ViecTroLy = (typeof VIEC_TRO_LY)[number];

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
] as const;

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

export function donViDuocBat(
	ct: CauHinhAi,
	viec: ViecTroLy,
	donVi: DonViMucTieu,
): "tat" | "viec-tat" | "don-vi-chua-bat" | "bat" {
	if (!ct.aiOn) return "tat";
	const { phamVi, donVi: danhSach } = phamViCuaViec(ct, viec);
	if (phamVi === "tat") return "viec-tat";
	if (phamVi === "toan-cong-ty") return "bat";
	const khop =
		(donVi.onehub && danhSach.includes(DON_VI_ONEHUB)) ||
		(donVi.boPhanId !== null && danhSach.includes(donVi.boPhanId)) ||
		(donVi.phongBanId !== null && danhSach.includes(donVi.phongBanId));
	return khop ? "bat" : "don-vi-chua-bat";
}

export function motTrong<T extends string>(
	danhSach: readonly T[],
	giaTri: string,
	truong: string,
): T {
	if ((danhSach as readonly string[]).includes(giaTri)) return giaTri as T;
	throw new Error(`${truong} không đọc được: «${giaTri}»`);
}
