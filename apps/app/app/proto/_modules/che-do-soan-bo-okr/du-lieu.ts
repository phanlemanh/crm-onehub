export type DongKr = {
	id: string;
	ten: string;
	khoiDiem: string;
	dich: string;
	donViDo: string;
	nguoi: string;
	theoKara?: boolean;
};

export type DongMucTieu = {
	id: string;
	ten: string;
	loai: "Cam kết" | "Tham vọng" | "Học tập";
	viSao: string;
	trangThai: "nhap" | "cong-bo";
	kr: DongKr[];
	dangGo?: boolean;
};

export type DiemKiem = {
	id: string;
	mucTieu: string;
	cau: string;
	dat: boolean;
};

export type GopY = {
	id: string;
	mucTieu: string;
	nhan: string;
	truoc?: string;
	sau: string;
	viSao: string;
	nut: string;
};

export const BO = {
	tieuDe: "Soạn bộ OKR",
	donVi: "Phòng Kinh doanh miền Bắc",
	chuKy: "Quý 4/2026",
	nguoiSoan: "Phạm Thu Lan",
} as const;

const KR_DOANH_THU: DongKr = {
	id: "kr-1",
	ten: "Doanh thu từ khách hàng mới",
	khoiDiem: "2,0",
	dich: "3,5",
	donViDo: "tỷ ₫",
	nguoi: "Phạm Thu Lan",
};

const KR_HOP_DONG: DongKr = {
	id: "kr-2",
	ten: "Ký hợp đồng vận chuyển định kỳ với khách mới",
	khoiDiem: "4",
	dich: "10",
	donViDo: "hợp đồng",
	nguoi: "Trần Đức Minh",
};

const KR_GOI: DongKr = {
	id: "kr-3",
	ten: "Gọi 300 cuộc cho khách tiềm năng",
	khoiDiem: "0",
	dich: "300",
	donViDo: "cuộc",
	nguoi: "Vũ Thanh Hà",
};

const KR_GIU_CHAN: DongKr = {
	id: "kr-4",
	ten: "Tỉ lệ khách cũ tiếp tục ký",
	khoiDiem: "86",
	dich: "86",
	donViDo: "%",
	nguoi: "Phạm Thu Lan",
};

export const MT_MOI: DongMucTieu = {
	id: "mt-1",
	ten: "Mở rộng tệp khách hàng doanh nghiệp ở miền Bắc",
	loai: "Cam kết",
	viSao: "Hai tuyến Hà Nội – Hải Phòng mới chạy từ tháng 9 còn trống 40% chỗ.",
	trangThai: "nhap",
	kr: [KR_DOANH_THU, KR_HOP_DONG, KR_GOI],
};

export const MT_MOI_DA_NHAN: DongMucTieu = {
	...MT_MOI,
	kr: [
		KR_DOANH_THU,
		KR_HOP_DONG,
		{
			...KR_GOI,
			ten: "Khách tiềm năng đồng ý gặp lần hai",
			khoiDiem: "12",
			dich: "45",
			donViDo: "khách",
			theoKara: true,
		},
	],
};

export const MT_DANG_GO: DongMucTieu = {
	id: "mt-1",
	ten: "Mở rộng tệp khách hàng doanh nghiệp ở miền Bắc",
	loai: "Cam kết",
	viSao: "",
	trangThai: "nhap",
	kr: [KR_DOANH_THU, { ...KR_HOP_DONG, dich: "", donViDo: "" }],
	dangGo: true,
};

export const MT_CONG_BO: DongMucTieu = {
	id: "mt-0",
	ten: "Giữ chân khách hàng hiện có",
	loai: "Cam kết",
	viSao: "Ba khách lớn hết hợp đồng trong quý.",
	trangThai: "cong-bo",
	kr: [KR_GIU_CHAN],
};

export const MT_TRONG: DongMucTieu = {
	id: "mt-trong",
	ten: "",
	loai: "Cam kết",
	viSao: "",
	trangThai: "nhap",
	kr: [],
	dangGo: true,
};

export const DIEM_MOI: DiemKiem[] = [
	{ id: "d1", mucTieu: "mt-1", cau: "Có từ 2 tới 5 KR", dat: true },
	{ id: "d2", mucTieu: "mt-1", cau: "Mỗi KR có người phụ trách", dat: true },
	{ id: "d3", mucTieu: "mt-1", cau: "Mỗi KR có khởi điểm", dat: false },
	{ id: "d4", mucTieu: "mt-1", cau: "Đích khác khởi điểm", dat: true },
	{
		id: "d5",
		mucTieu: "mt-1",
		cau: "KR đo kết quả, không đo việc",
		dat: false,
	},
	{ id: "d6", mucTieu: "mt-1", cau: "Có KR đối trọng", dat: false },
];

export const DIEM_DA_NHAN: DiemKiem[] = DIEM_MOI.map((d) =>
	d.id === "d3" || d.id === "d5" ? { ...d, dat: true } : d,
);

export const CAU_DIEM: Record<string, string> = {
	d3: "«Gọi 300 cuộc cho khách tiềm năng» bắt đầu từ 0",
	d5: "«Gọi 300 cuộc cho khách tiềm năng» là việc, không phải kết quả",
	d6: "Ba KR cùng đẩy một chiều — thêm một KR giữ chất lượng",
};

export const GOP_Y: GopY[] = [
	{
		id: "g1",
		mucTieu: "Mở rộng tệp khách hàng doanh nghiệp ở miền Bắc",
		nhan: "KR 3",
		truoc: "Gọi 300 cuộc cho khách tiềm năng",
		sau: "Khách tiềm năng đồng ý gặp lần hai: từ 12 lên 45",
		viSao:
			"Số cuộc gọi là việc; số khách gặp lần hai đo được kết quả của việc gọi.",
		nut: "Thay câu",
	},
	{
		id: "g2",
		mucTieu: "Mở rộng tệp khách hàng doanh nghiệp ở miền Bắc",
		nhan: "KR đối trọng",
		sau: "Tỉ lệ đơn giao đúng hẹn của khách mới: giữ trên 95%",
		viSao:
			"Ba KR cùng đẩy số khách; thêm khách mà giao trễ thì mất họ ở quý sau.",
		nut: "Thêm KR đối trọng",
	},
];
