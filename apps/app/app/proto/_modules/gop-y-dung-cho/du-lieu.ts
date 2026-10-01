export type KrMau = {
	id: string;
	ten: string;
	kieu: string;
	phuTrach: string;
	tienDo: number;
	so: string;
};

export type MucTieuMau = {
	id: string;
	ten: string;
	donVi: string;
	phuTrach: string;
	loai: string;
	trangThai: string;
	viSao: string;
	thamGia: string[];
	lePhanTram: number;
	kr: KrMau[];
};

export type GopYMau = {
	id: string;
	kind: "rewrite" | "question";
	nhan: string;
	krId: string | null;
	truoc?: string;
	sau: string;
	lyDo?: string;
};

export const MUC_TIEU: MucTieuMau = {
	id: "mt-dong-hn",
	ten: "Dẫn đầu thị trường khu Đông Hà Nội",
	donVi: "OneHub",
	phuTrach: "Phan Le Manh",
	loai: "Tham vọng",
	trangThai: "Đã công bố",
	viSao:
		"Đây là nơi để chứng minh mô hình, tập hợp được nguồn lực tại một điểm và kích hoạt hiệu ứng mạng lưới và ghép nối.",
	thamGia: ["Tuan Do Viet"],
	lePhanTram: 50,
	kr: [
		{
			id: "kr-giao-dich",
			ten: "Đạt số giao dịch",
			kieu: "Số",
			phuTrach: "Tuan Do Viet",
			tienDo: 42,
			so: "420 / 1.000 giao dịch",
		},
	],
};

export const MUC_TIEU_KHAC: MucTieuMau = {
	id: "mt-giu-chan",
	ten: "Đối tác ở lại và quay lại giao dịch",
	donVi: "OneHub",
	phuTrach: "Nguyen Thu Lan",
	loai: "Cam kết",
	trangThai: "Đã công bố",
	viSao: "",
	thamGia: [],
	lePhanTram: 50,
	kr: [
		{
			id: "kr-quay-lai",
			ten: "Tỷ lệ đối tác giao dịch lại trong 60 ngày đạt 45%",
			kieu: "Số",
			phuTrach: "Nguyen Thu Lan",
			tienDo: 58,
			so: "26 / 45 %",
		},
		{
			id: "kr-nps",
			ten: "Điểm hài lòng đối tác sau giao dịch từ 8/10",
			kieu: "Số",
			phuTrach: "Hoang Minh",
			tienDo: 71,
			so: "7,6 / 8 điểm",
		},
	],
};

export const GOP_Y: GopYMau[] = [
	{
		id: "gy-ten-kr",
		kind: "rewrite",
		nhan: "Viết lại · Tên KR",
		krId: "kr-giao-dich",
		truoc: "Đạt số giao dịch",
		sau: "Số giao dịch đạt 1000 giao dịch",
		lyDo: "Tên KR nên thể hiện kết quả đo lường cụ thể với số lượng giao dịch hướng tới 1000.",
	},
	{
		id: "gy-doi-trong",
		kind: "question",
		nhan: "Câu hỏi",
		krId: null,
		sau: "Mục tiêu hiện chỉ có một KR đo về tăng trưởng số lượng giao dịch, thiếu KR đối trọng về chất lượng hoặc tỷ lệ giữ chân/hiệu quả.",
	},
];

export const STATE = {
	hienTai: "ST-hien-tai",
	aDanhSach: "ST-a-danh-sach",
	bChiTiet: "ST-b-chi-tiet",
	bHopSua: "ST-b-hop-sua",
} as const;
