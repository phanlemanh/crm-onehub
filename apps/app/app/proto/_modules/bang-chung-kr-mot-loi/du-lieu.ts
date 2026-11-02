export type TrangMau =
	| "rong"
	| "dang-nhap"
	| "sai"
	| "dang-dinh"
	| "loi"
	| "co"
	| "cap-nhat-moc";

export const TRANG_MAU: readonly TrangMau[] = [
	"rong",
	"dang-nhap",
	"sai",
	"dang-dinh",
	"loi",
	"co",
	"cap-nhat-moc",
];

export const NHAN_TRANG: Record<TrangMau, string> = {
	rong: "Chưa có bằng chứng",
	"dang-nhap": "Đang nhập — dòng nhập cuối danh sách",
	sai: "Đường dẫn sai",
	"dang-dinh": "Đang đính",
	loi: "Máy chủ từ chối",
	co: "Có bằng chứng",
	"cap-nhat-moc": "Khối cập nhật KR mốc — chọn Xong",
};

export const st = (trang: TrangMau) => `ST-bc-${trang}`;

export const KR_MOC =
	"Ký hợp đồng khung với ba nhà phân phối miền Trung trước ngày chốt quý, có biên bản ký của cả hai bên";

export const BANG_CHUNG = [
	{
		id: "bc-1",
		url: "https://drive.google.com/file/d/1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT/view?usp=sharing",
		ghiChu:
			"Biên bản ký hợp đồng khung với Phân phối Đà Nẵng, đủ chữ ký giám đốc hai bên và dấu đỏ",
		nguoiDinh: { id: "lan", name: "Nguyễn Thị Phương Lan" },
		dinhLuc: "2026-10-28T03:10:00.000Z",
	},
	{
		id: "bc-2",
		url: "https://onehub.sharepoint.com/sites/kinhdoanh/Shared%20Documents/hop-dong-hue.pdf",
		ghiChu: "",
		nguoiDinh: { id: "minh", name: "Trần Quang Minh" },
		dinhLuc: "2026-10-30T08:45:00.000Z",
	},
];

export const URL_DUNG = "https://drive.google.com/file/d/9zY8xW7vU6tS/view";
export const URL_SAI = "drive.google.com/file/d/9zY8xW7vU6tS";
export const GHI_CHU = "Biên bản ký với Phân phối Quảng Nam";
