import type { Owner } from "@/components/crm/owner-cell";

export type NganMau = "muc-tieu" | "kr";
export type TrangMau = "xem" | "dang-sua" | "dang-luu" | "loi";

export const NGAN_MAU: readonly NganMau[] = ["muc-tieu", "kr"];
export const TRANG_MAU: readonly TrangMau[] = [
	"xem",
	"dang-sua",
	"dang-luu",
	"loi",
];

export const NHAN_NGAN = {
	"muc-tieu": "Ngăn mục tiêu",
	kr: "Ngăn KR",
} as const;
export const NHAN_TRANG = {
	xem: "xem",
	"dang-sua": "đang sửa",
	"dang-luu": "đang lưu",
	loi: "lỗi lưu",
} as const;

export const st = (ngan: NganMau, trang: TrangMau) => `ST-${ngan}-${trang}`;

const nguoi = (id: string, name: string): Owner => ({
	id,
	name,
	email: `${id}@onehub.vn`,
	image: null,
});

export const THANH_VIEN: Owner[] = [
	nguoi("lan", "Nguyễn Thị Phương Lan"),
	nguoi("minh", "Trần Quang Minh"),
	nguoi("ha", "Lê Thu Hà"),
	nguoi("duc", "Phạm Văn Đức"),
];

export const DA_ROI = nguoi("tuan", "Hoàng Anh Tuấn");

export const MUC_TIEU = {
	title:
		"Tăng tỉ lệ khách hàng doanh nghiệp gia hạn hợp đồng năm thứ hai lên trên tám mươi phần trăm ở cả ba vùng Bắc, Trung, Nam",
	whyNow:
		"Hai quý vừa rồi tỉ lệ gia hạn tụt xuống 64%, chủ yếu ở nhóm khách mua gói nền tảng từ năm 2025.\nNếu không giữ được nhóm này, doanh thu định kỳ năm sau giảm khoảng 18%.",
	owner: THANH_VIEN[0] ?? DA_ROI,
	donVi: "Khối Kinh doanh · Quý 4 2026",
};

export const KR = {
	title:
		"Gọi lại 100% khách sắp hết hạn trong 60 ngày tới, ghi lý do không gia hạn vào phiếu",
	owner: DA_ROI,
	mucTieu: "Tăng tỉ lệ gia hạn năm thứ hai",
};

export const LOI = {
	"muc-tieu": "Tên cần 3–200 ký tự.",
	kr: "Chưa lưu được Tên. Thử lại sau một lát.",
} as const;
