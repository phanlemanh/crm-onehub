export type Nhom = "quy-dinh" | "chinh-sach" | "quy-trinh" | "bieu-mau";

export const NHOM: { id: Nhom; nhan: string }[] = [
	{ id: "quy-dinh", nhan: "Quy định" },
	{ id: "chinh-sach", nhan: "Chính sách" },
	{ id: "quy-trinh", nhan: "Quy trình" },
	{ id: "bieu-mau", nhan: "Biểu mẫu" },
];

export function nhanNhom(id: Nhom): string {
	return NHOM.find((n) => n.id === id)?.nhan ?? id;
}

export type TrangMau = {
	id: string;
	ten: string;
	nhom: Nhom;
	nguoiGiu: string;
	pham: string;
	phienBan: number;
	capNhat: string;
	coDeXuat: boolean;
};

export const TRANG: TrangMau[] = [
	{
		id: "hoa-hong",
		ten: "Chính sách hoa hồng cho công ty đối tác",
		nhom: "chinh-sach",
		nguoiGiu: "Nguyễn Thu Hà",
		pham: "Toàn công ty",
		phienBan: 5,
		capNhat: "22/09",
		coDeXuat: true,
	},
	{
		id: "30-ngay",
		ten: "Đưa công ty mới vào guồng trong 30 ngày",
		nhom: "quy-trinh",
		nguoiGiu: "Lê Quang Vinh",
		pham: "Toàn công ty",
		phienBan: 3,
		capNhat: "20/09",
		coDeXuat: false,
	},
	{
		id: "khieu-nai",
		ten: "Xử lý khiếu nại của cá nhân",
		nhom: "quy-trinh",
		nguoiGiu: "Trần Minh Đức",
		pham: "Toàn công ty",
		phienBan: 2,
		capNhat: "18/09",
		coDeXuat: true,
	},
	{
		id: "bao-mat",
		ten: "Bảo mật dữ liệu khách hàng",
		nhom: "quy-dinh",
		nguoiGiu: "Phạm Ngọc Anh",
		pham: "Toàn công ty",
		phienBan: 4,
		capNhat: "02/09",
		coDeXuat: false,
	},
	{
		id: "zalo",
		ten: "Dùng Zalo khi làm việc với đối tác",
		nhom: "quy-dinh",
		nguoiGiu: "Phạm Ngọc Anh",
		pham: "Toàn công ty",
		phienBan: 1,
		capNhat: "28/05",
		coDeXuat: true,
	},
	{
		id: "duyet-chi",
		ten: "Duyệt chi dưới 20 triệu",
		nhom: "quy-trinh",
		nguoiGiu: "Nguyễn Thu Hà",
		pham: "Chỉ phòng Tài chính",
		phienBan: 2,
		capNhat: "11/09",
		coDeXuat: false,
	},
	{
		id: "nghi-phep",
		ten: "Nghỉ phép năm",
		nhom: "chinh-sach",
		nguoiGiu: "Vũ Thanh Mai",
		pham: "Toàn công ty",
		phienBan: 6,
		capNhat: "01/08",
		coDeXuat: false,
	},
	{
		id: "hop-dong",
		ten: "Hợp đồng hợp tác mẫu",
		nhom: "bieu-mau",
		nguoiGiu: "Lê Quang Vinh",
		pham: "Toàn công ty",
		phienBan: 2,
		capNhat: "15/07",
		coDeXuat: false,
	},
];

export const [TRANG_DANG_DOC] = TRANG as [TrangMau, ...TrangMau[]];

export const THAN_TRANG = `## Áp dụng cho ai

Mọi công ty đối tác đã ký [[Hợp đồng hợp tác mẫu|hợp đồng hợp tác]] và đã qua [[Đưa công ty mới vào guồng trong 30 ngày|30 ngày đầu]].[^1]

> [!NOTE]
> Công ty còn trong 30 ngày đầu hưởng mức của tầng 1, bất kể doanh số.

## Mức hoa hồng theo tầng

| Tầng | Doanh số quý | Hoa hồng |
| --- | --- | ---: |
| Tầng 1 | dưới 2 tỷ | 0,8% |
| Tầng 2 | 2 – 10 tỷ | 1,2% |
| Tầng 3 | trên 10 tỷ | 1,6% |

Tầng được xét lại vào **ngày làm việc đầu tiên của mỗi quý**, theo doanh số quý trước.[^1]

### Ví dụ

Công ty ở tầng 2 có giao dịch 3 tỷ được xác nhận: hoa hồng là 3 tỷ × 1,2% = **36 triệu**.

## Khi nào chi

1. Giao dịch được xác nhận trên nền tảng.
2. Phòng Tài chính đối soát trong 5 ngày làm việc, theo [[Duyệt chi dưới 20 triệu]].
3. Chi vào ngày 15 của tháng kế tiếp.

> [!WARNING]
> Giao dịch chưa đối soát xong trước ngày 10 thì chuyển sang kỳ chi sau.

## Không áp dụng

- Giao dịch bị huỷ trong thời gian cam kết.
- Giao dịch giữa hai đối tác cùng chủ sở hữu.[^2]
- Thưởng theo quý — xem [[Quy chế thưởng quý]].

[^1]: Quyết định 12-2026 về hoa hồng, trang 2.
[^2]: Biên bản họp ban điều hành 15-05, mục 4.`;

export type NguonMau = {
	id: string;
	ten: string;
	loai: string;
	nguoiTai: string;
	ngay: string;
	trangThai: "dang-doc" | "da-soan" | "da-duyet" | "khong-doc-duoc";
	ghiChu: string;
};

const TOM_TAT_THEO_TEN = {
	"Hợp đồng hợp tác mẫu": {
		summary:
			"Mẫu hợp đồng dùng khi một công ty đối tác ký với OneHub: phạm vi hợp tác, thời gian cam kết, cách tính và chi hoa hồng.",
		meta: "Biểu mẫu · phiên bản 2 · Lê Quang Vinh",
	},
	"Đưa công ty mới vào guồng trong 30 ngày": {
		summary:
			"Các bước mỗi phòng ban làm trong 30 ngày đầu sau khi một công ty ký, và ai cầm trịch.",
		meta: "Quy trình · phiên bản 3 · Lê Quang Vinh",
	},
	"Duyệt chi dưới 20 triệu": {
		summary:
			"Ai được duyệt khoản chi dưới 20 triệu, cần chứng từ gì, và bao lâu thì chi.",
		meta: "Quy trình · chỉ phòng Tài chính · Nguyễn Thu Hà",
	},
} satisfies Record<string, { summary: string; meta: string }>;

export const TOM_TAT = new Map(Object.entries(TOM_TAT_THEO_TEN));

export const NGUON: NguonMau[] = [
	{
		id: "qd-18",
		ten: "Quyết định 18-2026 về hoa hồng.pdf",
		loai: "PDF · 4 trang",
		nguoiTai: "Nguyễn Thu Hà",
		ngay: "Hôm nay 09:12",
		trangThai: "da-soan",
		ghiChu: "Máy đã soạn 1 bản đề xuất, 1 chỗ mâu thuẫn",
	},
	{
		id: "bb-hdqt",
		ten: "Biên bản họp ban điều hành 24-09.docx",
		loai: "Word · 7 trang",
		nguoiTai: "Lê Quang Vinh",
		ngay: "Hôm nay 08:40",
		trangThai: "dang-doc",
		ghiChu: "Máy đang đọc",
	},
	{
		id: "scan",
		ten: "Quy chế cũ bản quét.pdf",
		loai: "PDF · 12 trang",
		nguoiTai: "Vũ Thanh Mai",
		ngay: "Hôm qua",
		trangThai: "khong-doc-duoc",
		ghiChu: "Bản quét ảnh, không có chữ để đọc",
	},
	{
		id: "qd-12",
		ten: "Quyết định 12-2026 về hoa hồng.pdf",
		loai: "PDF · 3 trang",
		nguoiTai: "Nguyễn Thu Hà",
		ngay: "02/06",
		trangThai: "da-duyet",
		ghiChu: "Đã vào 2 trang",
	},
];

export const NGUON_CUA_TRANG = [
	{ so: 1, ten: "Quyết định 12-2026 về hoa hồng.pdf", cho: "trang 2" },
	{ so: 2, ten: "Biên bản họp ban điều hành 15-05.docx", cho: "mục 4" },
];

export const LICH_SU = [
	{
		ban: 5,
		ai: "Máy soạn · Nguyễn Thu Hà duyệt",
		khi: "22/09",
		vi: "Thêm mục Không áp dụng theo biên bản 15-05",
	},
	{
		ban: 4,
		ai: "Nguyễn Thu Hà sửa",
		khi: "03/07",
		vi: "Đổi ngày chi từ 10 sang 15",
	},
	{
		ban: 3,
		ai: "Máy soạn · Nguyễn Thu Hà duyệt",
		khi: "02/06",
		vi: "Bảng tầng theo Quyết định 12-2026",
	},
];

export const LIEN_KET_DEN = [
	"Đưa công ty mới vào guồng trong 30 ngày",
	"Hợp đồng hợp tác mẫu",
];

export type DongKhac = { loai: "giu" | "bo" | "them"; chu: string };

export type DeXuatMau = {
	id: string;
	trang: string;
	tu: "may" | "nguoi" | "soat";
	ai: string;
	vi: string;
	khi: string;
	nguon: string | null;
	matThuan: string | null;
	dong: DongKhac[];
};

export const DE_XUAT: DeXuatMau[] = [
	{
		id: "dx-hoa-hong",
		trang: "Chính sách hoa hồng cho công ty đối tác",
		tu: "may",
		ai: "Máy soạn",
		vi: "Nâng hoa hồng tầng 2 và tầng 3 từ quý IV",
		khi: "Hôm nay 09:14",
		nguon: "Quyết định 18-2026 về hoa hồng.pdf, trang 3",
		matThuan:
			"Bản đang dùng ghi tầng 2 là 1,2%. Quyết định 18-2026 ghi 1,5% từ 01/10. Máy không tự chọn — người duyệt quyết.",
		dong: [
			{ loai: "giu", chu: "| Tầng 1 | dưới 2 tỷ | 0,8% |" },
			{ loai: "bo", chu: "| Tầng 2 | 2 – 10 tỷ | 1,2% |" },
			{ loai: "them", chu: "| Tầng 2 | 2 – 10 tỷ | 1,5% |" },
			{ loai: "bo", chu: "| Tầng 3 | trên 10 tỷ | 1,6% |" },
			{ loai: "them", chu: "| Tầng 3 | trên 10 tỷ | 1,8% |" },
			{
				loai: "them",
				chu: "Mức mới áp dụng cho giao dịch xác nhận từ 01/10/2026.",
			},
		],
	},
	{
		id: "dx-khieu-nai",
		trang: "Xử lý khiếu nại của cá nhân",
		tu: "nguoi",
		ai: "Trần Minh Đức",
		vi: "Rút thời hạn phản hồi đầu tiên",
		khi: "Hôm qua",
		nguon: null,
		matThuan: null,
		dong: [
			{ loai: "giu", chu: "## Phản hồi đầu tiên" },
			{ loai: "bo", chu: "Trong 48 giờ kể từ khi nhận khiếu nại." },
			{ loai: "them", chu: "Trong 24 giờ kể từ khi nhận khiếu nại." },
		],
	},
	{
		id: "dx-zalo",
		trang: "Dùng Zalo khi làm việc với đối tác",
		tu: "soat",
		ai: "Soát định kỳ",
		vi: "Trang 120 ngày chưa ai xem lại, và có một liên kết gãy",
		khi: "Hôm nay 06:00",
		nguon: null,
		matThuan: null,
		dong: [
			{
				loai: "giu",
				chu: "Tin nhắn với đối tác phải gửi từ tài khoản Zalo đã nối với CRM.",
			},
			{
				loai: "bo",
				chu: "Xem hướng dẫn nối tài khoản ở trang Nối Zalo (bản cũ).",
			},
			{
				loai: "them",
				chu: "Xem hướng dẫn nối tài khoản ở Cài đặt › Thông báo.",
			},
		],
	},
];

export const HOI_THOAI = {
	hoi: "Công ty Wise đang ở tầng 2. Giao dịch 3 tỷ xác nhận hôm nay thì hoa hồng bao nhiêu, bao giờ chi?",
	tra: `Theo **Chính sách hoa hồng cho công ty đối tác** (phiên bản 5), tầng 2 hưởng **1,2%**, tức **36 triệu** cho giao dịch 3 tỷ.

Tiền được chi vào **ngày 15/10**, sau khi phòng Tài chính đối soát trong 5 ngày làm việc.

Lưu ý: đang có một bản đề xuất chờ duyệt nâng tầng 2 lên 1,5% từ 01/10. Mình trả lời theo bản đang dùng cho tới khi bản đó được duyệt.`,
	trich: [
		{
			trang: "Chính sách hoa hồng cho công ty đối tác",
			muc: "Mức hoa hồng theo tầng",
		},
		{ trang: "Chính sách hoa hồng cho công ty đối tác", muc: "Khi nào chi" },
	],
};
