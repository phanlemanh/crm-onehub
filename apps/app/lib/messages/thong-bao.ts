import type { Locale } from "@crm/ui/lib/locale";
import type { LoaiThongBao } from "@crm/validation/thong-bao";

const en = {
	chuong: {
		tieuDe: "Notifications",
		nhan: "Notifications",
		nhanSo: "Notifications, {so} unread",
		docHet: "Mark all as read",
		dangDocHet: "Marking…",
		docHetLoi: "Couldn't mark them as read — try again.",
		homNay: "Today",
		truocDo: "Earlier",
		xemTatCa: "View all",
		chuaDoc: "Unread",
		rongTieuDe: "No notifications yet",
		rongMoTa: "CRM tells you here each morning when something needs you.",
		loiTieuDe: "Couldn't load notifications",
		loiMoTa: "Try again in a moment.",
	},
	trang: {
		tieuDe: "Notifications",
		moTa: "Everything CRM has told you in the last 90 days.",
		loc: { tatCa: "All", chuaDoc: "Unread" },
		daDocHetTieuDe: "You've read everything",
		daDocHetMoTa: "New notifications show up here each morning.",
		xemTatCa: "Show all",
		xemThem: "Load more",
		taiLoiTieuDe: "Couldn't load your notifications",
		taiLoiMoTa: "The list didn't load. Try again in a moment.",
	},
	cau: {
		"okr-cap-nhat": "{soKr} KRs need this week's update",
		"okr-cho-duyet": "Objective «{nhan}» is waiting for your approval",
		"okr-tra-lai": "Objective «{nhan}» was sent back: {lyDo}",
		"okr-hoi-y-gop": "«{nhan}» is asking for your ideas",
		"buoc-qua-han": "Step «{nhan}» for {cty} is {soNgay} days overdue",
		"buoc-sap-han": "Step «{nhan}» for {cty} is due in {soNgay} days",
		"ke-hoach-im": "The {cty} plan has been quiet for {soNgay} days",
		"moc-ngay": "The {cty} plan reached day {soNgay}",
		"viec-qua-han": "Task «{tieuDe}» is {soNgay} days overdue",
		"viec-sap-han": "Task «{tieuDe}» is due in {soNgay} days",
		"viec-cho-danh-gia": "Task «{tieuDe}» is waiting for your review",
		"okr-kr-im": "KR «{nhan}» has had no update for {soNgay} days",
		"okr-duoc-giao": "You were made owner of «{nhan}»",
		"okr-nhac-ten": "{nguoi} mentioned you on «{nhan}»",
		"okr-ghi-nhan": "{nguoi} recognised you on «{nhan}»",
		"okr-hoi-y-cong-bo": "Results of «{nhan}» are published",
		"okr-theo-doi":
			"«{nhan}» you follow has {capNhat} updates and {binhLuan} comments",
		"tai-lieu-cho-duyet":
			"{so} document proposals are waiting for your approval",
		"okr-tom-tat": "This week's OKR summary for {phong} is ready",
		"ai-tran": "AI spend reached {muc}% of this month's cap",
		"ai-doi-soat-lech": "AI spend for {thang} differs {lech}% from the gateway",
		"tac-nhan-xong": "Kara finished building «{ten}» — open it to review",
		"tac-nhan-can-tra-loi": "Kara needs your answer to keep building «{ten}»",
		"tac-nhan-hong": "Kara could not build «{ten}»",
	} satisfies Record<LoaiThongBao, string>,
};

type ThongBaoMessages = typeof en;

const vi: ThongBaoMessages = {
	chuong: {
		tieuDe: "Thông báo",
		nhan: "Thông báo",
		nhanSo: "Thông báo, {so} chưa đọc",
		docHet: "Đánh dấu tất cả đã đọc",
		dangDocHet: "Đang đánh dấu…",
		docHetLoi: "Chưa đánh dấu được — thử lại.",
		homNay: "Hôm nay",
		truocDo: "Trước đó",
		xemTatCa: "Xem tất cả",
		chuaDoc: "Chưa đọc",
		rongTieuDe: "Chưa có thông báo nào",
		rongMoTa: "CRM báo ở đây mỗi sáng khi có việc cần bạn.",
		loiTieuDe: "Không tải được thông báo",
		loiMoTa: "Thử lại sau giây lát.",
	},
	trang: {
		tieuDe: "Thông báo",
		moTa: "Mọi điều CRM đã báo cho bạn trong 90 ngày qua.",
		loc: { tatCa: "Tất cả", chuaDoc: "Chưa đọc" },
		daDocHetTieuDe: "Bạn đã đọc hết",
		daDocHetMoTa: "Thông báo mới hiện ở đây mỗi sáng.",
		xemTatCa: "Xem tất cả",
		xemThem: "Xem thêm",
		taiLoiTieuDe: "Không tải được thông báo",
		taiLoiMoTa: "Danh sách chưa tải được. Thử lại sau giây lát.",
	},
	cau: {
		"okr-cap-nhat": "{soKr} KR chờ cập nhật tuần này",
		"okr-cho-duyet": "Mục tiêu «{nhan}» đang chờ bạn duyệt",
		"okr-tra-lai": "Mục tiêu «{nhan}» bị trả lại: {lyDo}",
		"okr-hoi-y-gop": "«{nhan}» đang chờ ý tưởng của bạn",
		"buoc-qua-han": "Bước «{nhan}» của kế hoạch {cty} đã quá hạn {soNgay} ngày",
		"buoc-sap-han":
			"Bước «{nhan}» của kế hoạch {cty} còn {soNgay} ngày tới hạn",
		"ke-hoach-im": "Kế hoạch {cty} chưa có gì mới trong {soNgay} ngày",
		"moc-ngay": "Kế hoạch {cty} tới mốc ngày {soNgay}",
		"viec-qua-han": "Việc «{tieuDe}» đã quá hạn {soNgay} ngày",
		"viec-sap-han": "Việc «{tieuDe}» còn {soNgay} ngày tới hạn",
		"viec-cho-danh-gia": "Việc «{tieuDe}» đang chờ bạn đánh giá",
		"okr-kr-im": "KR «{nhan}» chưa cập nhật {soNgay} ngày",
		"okr-duoc-giao": "Bạn được giao «{nhan}»",
		"okr-nhac-ten": "{nguoi} nhắc tới bạn trong trao đổi ở «{nhan}»",
		"okr-ghi-nhan": "{nguoi} ghi nhận bạn ở «{nhan}»",
		"okr-hoi-y-cong-bo": "Kết quả «{nhan}» đã công bố",
		"okr-theo-doi":
			"«{nhan}» bạn theo dõi có {capNhat} cập nhật và {binhLuan} trao đổi mới",
		"tai-lieu-cho-duyet": "{so} bản đề xuất tài liệu đang chờ bạn duyệt",
		"okr-tom-tat": "Tóm tắt OKR tuần của {phong} đã sẵn sàng",
		"ai-tran": "Chi phí AI đã tới {muc}% trần tháng này",
		"ai-doi-soat-lech": "Chi phí AI tháng {thang} lệch {lech}% so với cổng",
		"tac-nhan-xong": "Kara đã dựng xong «{ten}» — mở để duyệt",
		"tac-nhan-can-tra-loi": "Kara cần bạn trả lời để dựng tiếp «{ten}»",
		"tac-nhan-hong": "Kara chưa dựng được «{ten}»",
	},
};

export function thongBaoMessages(locale: Locale): ThongBaoMessages {
	return locale === "vi" ? vi : en;
}
