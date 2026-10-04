export const STATE = {
	nhan: "ST-nenkara-nhan",
	inlineCho: "ST-nenkara-inline-cho",
	inlineKhoa: "ST-nenkara-inline-khoa",
	inlineLoi: "ST-nenkara-inline-loi",
	inlineSua: "ST-nenkara-inline-sua",
	bienNhan: "ST-nenkara-bien-nhan",
	the: "ST-nenkara-the",
	phanHoi: "ST-nenkara-phan-hoi",
} as const;

export const MUC_TIEU = {
	ten: "Khách hàng doanh nghiệp miền Bắc chọn OneHub làm nền tảng chính",
	viSao:
		"Kara đọc tên Mục tiêu, ba KR và hai lần cập nhật gần nhất. Hai KR đang đếm việc làm thay vì kết quả.",
	docLuc: "09:12",
} as const;

export const KR = [
	{ id: "kr-1", ten: "Doanh thu hợp đồng mới đạt 12 tỷ", tienDo: "62%" },
	{ id: "kr-2", ten: "Gọi điện cho đối tác mới mỗi tuần", tienDo: "40%" },
	{ id: "kr-3", ten: "Tỷ lệ gia hạn đạt 85%", tienDo: "71%" },
] as const;

export const DE_XUAT = {
	nhan: "Đổi tên KR",
	truoc: "Gọi điện cho đối tác mới mỗi tuần",
	sau: "Đối tác mới hẹn gặp được sau cuộc gọi đầu tiên",
	lyDo: "KR đang đếm cuộc gọi; câu mới đo kết quả của cuộc gọi.",
	khoa: "Lưu thay đổi của KR trước khi nhận",
	loi: "Kara chưa ghi được — thử lại",
	daNhan: "Đã đổi tên theo Kara",
	daBoQua: "Đã bỏ qua",
	nhanBanSua: "Nhận bản đã sửa",
	huy: "Huỷ",
	sua: "Sửa",
	boQua: "Bỏ qua",
	theNhan: "Thêm KR đối trọng",
	theSau: "Tỷ lệ đối tác mới huỷ sau đơn đầu dưới 10%",
	theLyDo: "Mục tiêu chỉ đo tăng trưởng; một KR đối trọng giữ chất lượng.",
} as const;

export const TOM_TAT = {
	tieuDe: "Tóm tắt tuần",
	cau: "Doanh thu hợp đồng mới đạt 7,4 tỷ, chậm hai hợp đồng lớn ở Hải Phòng.",
	nhom: "Tóm tắt tuần này có hữu ích không",
	camOn: "Cảm ơn, đã ghi",
} as const;
