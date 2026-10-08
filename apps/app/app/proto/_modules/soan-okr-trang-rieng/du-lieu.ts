export type DongMau = {
	id: string;
	loai: "kr" | "kr-moc" | "can-chinh";
	ten: string;
	truoc?: string;
	viSao: string;
	donVi?: string;
	so?: { khoiDiem: string; dich: string };
	nhan?: "vua-them" | "vua-sua" | "vua-chuyen";
};

export type NhomMau = {
	id: string;
	stt: number;
	loai: string;
	ten: string;
	truoc?: string;
	viSao: string;
	nhan?: "vua-sua";
	dong: DongMau[];
};

export const SOAN_MAU = {
	donVi: "Phòng Kinh doanh miền Bắc",
	chuKy: "Quý 1 · 2027",
	luot: "Lượt 4/12",
	veTheoDonVi: "← Theo đơn vị",
	tieuDe: "Soạn OKR",
	banNhap: "Bản nháp",
	meta: "9 dòng · sửa lúc 10:42",
	chiDongCho: "Chỉ dòng chờ",
	tabTroChuyen: "Trò chuyện",
	tabBanNhap: "Bản nháp (9)",
	nguoiHoi:
		"Quý 1 ưu tiên giữ đối tác lớn. Không thêm người, tối đa 37 đại lý.",
	karaTraLoi:
		"Mình đã soạn 2 Mục tiêu và 5 KR. Mục tiêu 2 có một KR mốc vì chưa có số đo được.",
	nguoiHoi2: "Mục tiêu 1 nghe chung quá, cụ thể hơn đi.",
	karaTraLoi2:
		"Mình đã viết lại Mục tiêu 1, thêm KR về đại lý gắn bó và chuyển KR tuyến mới sang Mục tiêu 2.",
	mocDau: "Bản nháp đầu: 2 Mục tiêu · 5 KR",
	mocDoi: "+1 KR · sửa 1 · chuyển 1 · bỏ 1",
	heThong: "Bạn đã thêm KR «Tăng số đại lý gắn bó» · bỏ qua Mục tiêu 2",
	seGui: "Sẽ gửi kèm lượt sau: Bạn đã thêm KR «Tăng số đại lý gắn bó»",
	nguCanh: "KR · Tăng số đại lý gắn bó",
	hoiDong: "ngắn hơn",
	nhanO: "Nhắn Kara",
	goiYGo: "Hỏi Kara, hoặc nói bản nháp cần đổi gì…",
	goiY: ["Giữ khách lớn", "Mở tuyến mới"],
	nhanGoiY: "Kara gợi ý trả lời",
	dangSoan: "Kara đang soạn…",
	dangSoanDau: "Kara đang soạn bản nháp đầu…",
	dangDoc: "Kara đang đọc tình hình của phòng…",
	dangMo: "Đang mở cuộc soạn…",
	khongMo: "mở cuộc soạn",
	khongMoMoTa: "Cuộc này không có hoặc bạn không có quyền xem.",
	traLoi: "trả lời",
	traLoiMoTa:
		"Kara không nhận được trả lời trong 45 giây. Lượt này không bị trừ.",
	hetLuot:
		"Cuộc này đã dùng hết 12 lượt. Quyết nốt các dòng và đưa vào, hoặc mở cuộc mới.",
	moCuocMoi: "Mở cuộc mới",
	hoiKara: "Hỏi Kara về dòng này",
	sua: "Sửa",
	boQua: "Bỏ qua",
	hoanTac: "Hoàn tác",
	themNhom: (n: number) => `Thêm cả Mục tiêu và ${n} KR đã đủ số`,
	daThemNhom: (n: number) => `Đã thêm Mục tiêu 1 và ${n} KR`,
	khoiDiem: "Khởi điểm",
	dich: "Đích",
	moc: "KR mốc — không cần số",
	duaVao: "Đưa vào 2 Mục tiêu, 5 KR",
	duaVaoKhoa: "Đưa vào",
	conThieu: "Còn thiếu",
	conThieuMuc: "Đích của «Tăng doanh số đối tác lớn»",
	duaVaoMoTa: "Tạo bộ OKR này cho Phòng Kinh doanh miền Bắc, Quý 1 · 2027.",
	daTao: "Đã tạo 2 Mục tiêu",
	daTaoMoTa: "5 KR đã vào bộ OKR của phòng.",
	xemTheoDonVi: "Xem trên Theo đơn vị",
	vuaThem: "vừa thêm",
	vuaSua: "vừa sửa",
	vuaChuyen: "vừa chuyển",
	thanhKeo: "Đổi cỡ hội thoại và bản nháp",
} as const;

export const NHOM_MAU: NhomMau[] = [
	{
		id: "mt-1",
		stt: 1,
		loai: "Cam kết",
		ten: "Đối tác lớn ở miền Bắc gắn bó và mua nhiều hơn",
		truoc: "Giữ chân đối tác",
		viSao: "Quý 4 mất 2/14 đối tác lớn khi hết hạn mà không ai theo.",
		nhan: "vua-sua",
		dong: [
			{
				id: "kr-1-1",
				loai: "kr",
				ten: "Tăng doanh số đối tác lớn",
				viSao: "Doanh số 14 đối tác lớn chiếm 61% của phòng.",
				donVi: "tỷ đồng",
				so: { khoiDiem: "42", dich: "" },
			},
			{
				id: "kr-1-2",
				loai: "kr",
				ten: "Tăng số đại lý gắn bó",
				viSao: "Ràng buộc 37 đại lý anh nêu ở lượt 1.",
				donVi: "đại lý",
				so: { khoiDiem: "29", dich: "37" },
				nhan: "vua-them",
			},
			{
				id: "cc-1",
				loai: "can-chinh",
				ten: "Căn chỉnh lên «Tăng trưởng doanh thu bền vững» của khối",
				viSao: "Mục tiêu của khối Kinh doanh quý này.",
			},
		],
	},
	{
		id: "mt-2",
		stt: 2,
		loai: "Tham vọng",
		ten: "Mở tuyến Hà Nội – Hải Phòng",
		viSao: "Ba đối tác lớn đã hỏi tuyến này trong quý 4.",
		dong: [
			{
				id: "kr-2-1",
				loai: "kr-moc",
				ten: "Ký hợp đồng thử với một đối tác vận chuyển",
				viSao: "Chưa có số đo được — đi bằng mốc.",
			},
			{
				id: "kr-2-2",
				loai: "kr",
				ten: "Số chuyến chạy thử mỗi tháng",
				viSao: "Chuyển từ Mục tiêu 1 theo câu của anh ở lượt 2.",
				donVi: "chuyến",
				so: { khoiDiem: "0", dich: "8" },
				nhan: "vua-chuyen",
			},
		],
	},
];
