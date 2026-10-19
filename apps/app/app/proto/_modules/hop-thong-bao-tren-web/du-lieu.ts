import type { DongThongBao } from "@/components/thong-bao/dong-thong-bao";

export const STATE = {
	ngucanh: "ST-ngu-canh",
	chuongCo: "ST-chuong-co-chua-doc",
	chuong99: "ST-chuong-99",
	chuongHet: "ST-chuong-het-chua-doc",
	chuongRong: "ST-chuong-rong",
	chuongChoTai: "ST-chuong-cho-tai",
	chuongLoi: "ST-chuong-loi",
	trangCo: "ST-trang-co",
	trangLocRong: "ST-trang-loc-chua-doc-rong",
	trangRong: "ST-trang-rong",
	trangChoTai: "ST-trang-cho-tai",
	trangLoi: "ST-trang-loi",
} as const;

export const HREF_TRANG = "/proto/hop-thong-bao-tren-web?state=ST-trang-co";

export const HOM_NAY: DongThongBao[] = [
	{
		id: "tb1",
		cau: "Việc «Gửi báo giá cho Hoà Phát» đã quá hạn 2 ngày",
		gio: "08:30",
		chuaDoc: true,
		href: HREF_TRANG,
	},
	{
		id: "tb2",
		cau: "Mục tiêu «Tăng doanh thu kênh đối tác Q4» bị trả lại: thiếu KR đo được",
		gio: "08:30",
		chuaDoc: true,
		href: HREF_TRANG,
	},
	{
		id: "tb3",
		cau: "3 tài liệu đang chờ bạn duyệt",
		gio: "08:30",
		chuaDoc: true,
		href: HREF_TRANG,
	},
	{
		id: "tb4",
		cau: "KR «50 hợp đồng mới» chưa cập nhật 14 ngày",
		gio: "08:30",
		chuaDoc: false,
		href: HREF_TRANG,
	},
];

export const TRUOC_DO: DongThongBao[] = [
	{
		id: "tb5",
		cau: "Bước «Ký hợp đồng khung» của kế hoạch Vinamilk còn 2 ngày tới hạn",
		gio: "Hôm qua, 08:30",
		chuaDoc: false,
		href: HREF_TRANG,
	},
	{
		id: "tb6",
		cau: "Chị Lan nhắc tới bạn trong trao đổi ở mục tiêu «Mở rộng miền Trung»",
		gio: "12/10, 08:30",
		chuaDoc: false,
		href: HREF_TRANG,
	},
	{
		id: "tb7",
		cau: "Tóm tắt OKR tuần của phòng Kinh doanh đã sẵn sàng",
		gio: "11/10, 08:30",
		chuaDoc: false,
		href: HREF_TRANG,
	},
];

export const DA_DOC = (ds: DongThongBao[]) =>
	ds.map((d) => ({ ...d, chuaDoc: false }));

export const CU_HON: DongThongBao[] = [
	{
		id: "tb8",
		cau: "Việc «Chuẩn bị hồ sơ thầu Long An» đang chờ bạn đánh giá",
		gio: "10/10, 08:30",
		chuaDoc: false,
		href: HREF_TRANG,
	},
	{
		id: "tb9",
		cau: "Bạn được giao KR «Giảm 20% thời gian phản hồi khách»",
		gio: "09/10, 08:30",
		chuaDoc: false,
		href: HREF_TRANG,
	},
];
