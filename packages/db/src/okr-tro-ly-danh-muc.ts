export const MINUTE_MS = 60_000;

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
		"người bán hàng",
		"sales rep",
		"khách hàng",
		"công ty môi giới",
		"công ty khách",
		"cá nhân môi giới",
		"liên hệ",
		"contact",
		"Trung tâm",
		"cơ hội",
		"deal bán hàng",
		"giao dịch",
		"đồng tiền mặc định",
		"default currency",
		"tiền tệ gốc",
		"đã đặt lịch demo",
		"đủ điều kiện để mua",
		"onboarding",
		"hồ sơ kế hoạch",
		"dự án",
		"task",
		"việc cần làm",
		"nhiệm vụ",
		"owner",
		"chủ kế hoạch",
		"assignee",
		"người phụ trách bước",
		"transfer",
		"bàn giao tài khoản",
		"đang hoạt động",
		"đã tham gia",
		"lời mời",
		"invitation",
		"chờ duyệt",
		"kế hoạch treo",
		"kế hoạch chết",
		"milestone",
		"cột mốc",
		"follow",
		"đăng ký",
		"thông báo",
		"notification",
		"đăng nhập Zalo",
		"liên kết tài khoản",
		"hành động",
		"enrollment",
		"thành viên kế hoạch",
		"trạng thái",
		"agent",
		"cuộc trò chuyện",
		"chat",
		"lần chạy",
		"phiên chạy",
		"run",
		"composer",
		"khung nhập",
		"editor",
		"chiến dịch quảng cáo",
		"campaign",
		"đợt khuyến mãi",
		"tệp khách",
		"danh sách khách hàng",
		"segment",
		"doanh số",
		"hiệu suất",
		"điểm số",
		"thắng",
		"thua",
		"thành công",
		"phễu",
		"pipeline",
		"deal đóng",
		"đường ống",
		"cơ hội đang chạy",
		"thuộc tính",
		"property",
		"custom field",
		"trường tuỳ chỉnh",
		"division",
		"khối",
		"team",
		"nhóm",
		"department",
		"tổ chức con",
		"nhánh",
		"unit",
		"quản trị",
		"admin",
		"manager",
		"sếp",
		"template",
		"mẫu kế hoạch",
		"quy trình",
		"archive",
		"mã chứng chỉ",
		"số giấy phép hành nghề",
		"chỉ tiêu",
		"objective",
		"mục đích",
		"key result",
		"sáng kiến",
		"công thức",
		"kết nối",
		"tích hợp",
		"đồng bộ",
		"số dự phòng",
		"số tham khảo",
		"loại KR",
		"dạng chỉ số",
		"check-in",
		"báo cáo tuần",
		"điểm danh",
		"rủi ro",
		"đèn giao thông",
		"đỏ/vàng/xanh",
		"KR chết",
		"KR bỏ quên",
		"KR trễ hạn",
		"giao ban",
		"dashboard",
		"bảng điều khiển",
		"dữ liệu demo",
		"seed OKR",
		"dữ liệu giả lập",
		"tuân thủ",
		"KPI OKR",
		"xếp hạng đơn vị",
		"đợt",
		"sprint",
		"cài đặt OKR",
		"chính sách OKR",
		"quy chế",
		"phân rã",
		"cascade",
		"alignment",
		"cha–con",
		"chủ KR",
		"subscribe",
		"đăng ký nhận tin",
		"quan tâm",
		"bình luận",
		"comment",
		"thảo luận",
		"điểm KPI",
		"điểm hiệu suất",
		"đánh giá",
		"số cuối",
		"số thực tế",
		"review giữa kỳ",
		"đánh giá giữa kỳ",
		"điều chỉnh mục tiêu",
		"bài học",
		"rút kinh nghiệm",
		"retro",
		"chuyển kỳ",
		"kéo dài",
		"sao chép",
		"khách",
		"người xem",
		"viewer",
		"tài khoản hạn chế",
		"nhóm dữ liệu",
		"quyền dữ liệu",
		"module",
		"scope",
		"eve",
		"chatbot",
		"AI OKR",
		"bot OKR",
		"copilot",
		"khuyến nghị",
		"suggestion",
		"bản tin tuần",
		"digest",
		"hoá đơn AI",
		"billing",
		"nhật ký chi phí",
		"chạy bóng",
		"shadow mode",
		"thử nghiệm",
		"beta",
		"wiki",
		"knowledge base",
		"tài liệu nội bộ",
		"bài viết",
		"article",
		"raw source",
		"tài liệu gốc",
		"file",
		"bản nháp",
		"draft",
		"proposal",
		"AI viết",
		"lỗi OCR",
		"không hỗ trợ",
		"prompt",
		"lời nhắc hệ thống",
		"bản chính thức",
		"bản mới nhất",
		"published",
		"người giữ trang",
		"hết hạn",
		"expiry",
		"mức rủi ro",
		"tier",
	],
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

export function motTrong<T extends string>(
	danhSach: readonly T[],
	giaTri: string,
	truong: string,
): T {
	if ((danhSach as readonly string[]).includes(giaTri)) return giaTri as T;
	throw new Error(`${truong} không đọc được: «${giaTri}»`);
}
