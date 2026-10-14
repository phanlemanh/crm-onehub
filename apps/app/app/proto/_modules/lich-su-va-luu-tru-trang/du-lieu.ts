export type PhienBanMau = {
	so: number;
	ten: string;
	duyetLuc: string;
	nguoiDuyet: string;
	nguoiDeXuat: string;
	noiDung: string;
};

export type DeXuatMau = {
	id: string;
	trang: string;
	loai: "noi-dung" | "luu-tru" | "khoi-phuc";
	tuPhienBan?: number;
	nguoiDeXuat: string;
	luc: string;
	lyDo?: string;
	trangThai: "cho" | "da-duyet" | "tra-lai" | "cu";
};

export const TRANG_MAU = {
	slug: "quy-dinh-hoa-hong-doi-tac",
	ten: "Quy định hoa hồng đối tác theo tầng",
	loai: "Quy định",
	chuTrang: "Nguyễn Thu Hà",
	donVi: "Phòng Kinh doanh",
	luuTruLuc: "12/10/2026",
} as const;

const PHIEN_BAN_1 = `## Mức hưởng

Đối tác tầng 1 hưởng 2% doanh thu thuần của hợp đồng.

Đối tác tầng 2 hưởng 1% doanh thu thuần của hợp đồng.

## Ngưỡng

Hợp đồng có doanh thu thuần dưới 10 triệu đồng không phát sinh hoa hồng.`;

const PHIEN_BAN_2 = `## Mức hưởng

Đối tác tầng 1 hưởng 2% doanh thu thuần của hợp đồng.

Đối tác tầng 2 hưởng 1,2% doanh thu thuần của hợp đồng.

## Ngưỡng

Hợp đồng có doanh thu thuần dưới 20 triệu đồng không phát sinh hoa hồng.`;

const PHIEN_BAN_3 = `## Mức hưởng

Đối tác tầng 1 hưởng 2% doanh thu thuần của hợp đồng.

Đối tác tầng 2 hưởng 1,2% doanh thu thuần của hợp đồng.

Đối tác tầng 3 hưởng 0,5% doanh thu thuần của hợp đồng.

## Ngưỡng và ngoại lệ

Hợp đồng có doanh thu thuần dưới 20 triệu đồng không phát sinh hoa hồng.

Nhân viên đang thử việc không được nhận hoa hồng đối tác.`;

export const PHIEN_BAN: readonly PhienBanMau[] = [
	{
		so: 3,
		ten: TRANG_MAU.ten,
		duyetLuc: "08/10/2026",
		nguoiDuyet: "Nguyễn Thu Hà",
		nguoiDeXuat: "Trần Minh Quân",
		noiDung: PHIEN_BAN_3,
	},
	{
		so: 2,
		ten: TRANG_MAU.ten,
		duyetLuc: "02/10/2026",
		nguoiDuyet: "Nguyễn Thu Hà",
		nguoiDeXuat: "Lê Hoàng Yến",
		noiDung: PHIEN_BAN_2,
	},
	{
		so: 1,
		ten: TRANG_MAU.ten,
		duyetLuc: "28/09/2026",
		nguoiDuyet: "Nguyễn Thu Hà",
		nguoiDeXuat: "Trần Minh Quân",
		noiDung: PHIEN_BAN_1,
	},
];

export const BAN_DANG_DUNG = PHIEN_BAN[0] as PhienBanMau;

export const DE_XUAT: readonly DeXuatMau[] = [
	{
		id: "dx-luu-tru",
		trang: TRANG_MAU.ten,
		loai: "luu-tru",
		nguoiDeXuat: "Lê Hoàng Yến",
		luc: "12/10/2026 09:14",
		lyDo: "Quy định này đã được thay bằng trang «Chính sách đối tác 2027» từ đầu tháng 10.",
		trangThai: "cho",
	},
	{
		id: "dx-quay-lai",
		trang: TRANG_MAU.ten,
		loai: "noi-dung",
		tuPhienBan: 1,
		nguoiDeXuat: "Trần Minh Quân",
		luc: "12/10/2026 10:02",
		trangThai: "cho",
	},
	{
		id: "dx-da-duyet",
		trang: "Quy trình đối soát và chi hoa hồng",
		loai: "noi-dung",
		nguoiDeXuat: "Lê Hoàng Yến",
		luc: "10/10/2026 15:40",
		trangThai: "da-duyet",
	},
	{
		id: "dx-tra-lai",
		trang: "Chính sách thử việc",
		loai: "noi-dung",
		nguoiDeXuat: "Phạm Gia Bảo",
		luc: "09/10/2026 11:05",
		trangThai: "tra-lai",
	},
	{
		id: "dx-cu",
		trang: "Quy định công tác phí",
		loai: "noi-dung",
		nguoiDeXuat: "Trần Minh Quân",
		luc: "07/10/2026 08:30",
		trangThai: "cu",
	},
];

export const TRANG_DA_LUU_TRU = [
	{
		slug: TRANG_MAU.slug,
		ten: TRANG_MAU.ten,
		loai: "Quy định",
		chuTrang: TRANG_MAU.chuTrang,
		luuTruLuc: TRANG_MAU.luuTruLuc,
	},
	{
		slug: "bieu-mau-tam-ung-2025",
		ten: "Biểu mẫu đề nghị tạm ứng (bản 2025)",
		loai: "Biểu mẫu",
		chuTrang: "Phạm Gia Bảo",
		luuTruLuc: "30/09/2026",
	},
] as const;
