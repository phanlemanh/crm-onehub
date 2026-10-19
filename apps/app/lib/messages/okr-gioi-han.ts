import type { Locale } from "@crm/ui/lib/locale";

const vi = {
	nhan: {
		gioiHan: "Giới hạn",
		goiY: "Chỉ người liên quan và {n} người xem có tên thấy",
		goiYKhongTen: "Chỉ người liên quan thấy",
	},
	menuMucHienThi: "Mức hiển thị…",
	khongThay: {
		tieuDe: "Không tìm thấy mục tiêu này",
		moTa: "Đường dẫn có thể sai, hoặc mục tiêu không còn.",
		dong: "Đóng",
	},
	loiTai: {
		tieuDe: "Không tải được mục tiêu",
		moTa: "Chưa có gì bị mất — thử lại sau ít phút.",
		thuLai: "Thử lại",
	},
	hienThi: {
		tieuDe: "Mức hiển thị",
		moTa: "Ai thấy «{ten}».",
		nhom: "Ai thấy mục tiêu này",
		congKhai: "Công khai",
		congKhaiMoTa:
			"Mọi người trong chương trình OKR thấy; mục tiêu vào số gộp và góp vào mục tiêu khác được.",
		gioiHan: "Giới hạn",
		gioiHanMoTa:
			"Chỉ người liên quan và người xem có tên thấy. Không vào số gộp, không góp vào mục tiêu khác được.",
		nguoiXem: "Người xem có tên",
		themNguoi: "Thêm người…",
		timNguoi: "Tìm thành viên…",
		khongAi: "Không có ai khớp",
		dangTai: "Đang tải thành viên…",
		boNguoi: "Bỏ {ten}",
		dem: "{n}/{max} người · chỉ thành viên của không gian làm việc.",
		luonThay:
			"Luôn thấy: người phụ trách, người phụ trách KR, người tham gia, trưởng sửa được mục tiêu, quản trị.",
		moCanChinh: "Mở thẻ Góp vào",
		huy: "Huỷ",
		luu: "Lưu",
		daLuu: "Đã lưu mức hiển thị",
		khiTao:
			"Mục tiêu giới hạn không lộ ra ngoài người liên quan, kể cả lúc còn nháp.",
	},
	duyet: {
		guiDuyet: "Gửi duyệt",
		hoiGui: {
			tieuDe: "Gửi mục tiêu này đi duyệt?",
			than: "Trong lúc chờ duyệt, nội dung, KR, chỗ góp vào và mức hiển thị bị khoá. Bạn rút lại được bất cứ lúc nào.",
			nut: "Gửi đi duyệt",
			thoi: "Huỷ",
		},
		daGui: "Đã gửi duyệt",
		canKr: "Thêm ít nhất một KR trước khi gửi duyệt.",
		seDuyet: "{nguoi} sẽ duyệt.",
		seDuyetQuanTri: "Quản trị sẽ duyệt.",
		lanTruoc: "Lần trước {nguoi} trả lại · {ngay}:",
		lanTruocBan: "Lần trước bạn trả lại · {ngay}:",
		choNguoi: "Chờ {nguoi} duyệt",
		choQuanTri: "Chờ quản trị duyệt",
		guiLuc: "gửi {ngay}",
		khoaSua:
			"Mục tiêu đang chờ duyệt — rút lại để sửa nội dung, KR, chỗ góp vào hay mức hiển thị.",
		choTuTruoc:
			"Mục tiêu gửi duyệt từ trước khi chương trình tắt bước duyệt — nay công bố thẳng được, không cần chờ.",
		rutLai: "Rút lại",
		hopRut: {
			tieuDe: "Rút lại yêu cầu duyệt?",
			moTa: "Mục tiêu về nháp để sửa tiếp. Sửa xong thì gửi duyệt lại.",
			huy: "Huỷ",
			nut: "Rút về nháp",
		},
		daRut: "Đã rút lại — mục tiêu về nháp",
		nguoiGui: "{nguoi} gửi duyệt",
		nguoiGuiKhongTen: "Mục tiêu chờ bạn duyệt",
		duyetMoTa:
			"Duyệt thì mục tiêu công bố ngay và khoá khởi điểm của KR. Trả lại thì mục tiêu về nháp, kèm lý do cho người gửi.",
		duyetCongBo: "Duyệt và công bố",
		daDuyet: "Đã duyệt và công bố mục tiêu",
		traLai: "Trả lại…",
		hopTraLai: {
			tieuDe: "Trả lại mục tiêu",
			moTa: "«{ten}» về nháp. Người gửi nhận lý do trong nhắc buổi sáng.",
			nhan: "Lý do",
			goiY: "Cần sửa gì trước khi duyệt…",
			dem: "{n}/{max} ký tự · cần ít nhất {min}.",
			huy: "Huỷ",
			nut: "Trả về nháp",
		},
		daTraLai: "Đã trả lại mục tiêu",
		biTraLai: "{nguoi} trả lại",
		biTraLaiKhongTen: "Mục tiêu bị trả lại",
	},
	viec: {
		choDuyet: "Chờ bạn duyệt: {ten}",
		nguoiGui: "{nguoi} gửi duyệt",
		traLai: "{nguoi} trả lại: {ten}",
	},
	canhKrChoDuyet:
		"Mục tiêu đang chờ duyệt — việc, sáng kiến và bằng chứng khoá tới khi duyệt xong hoặc rút lại. Vẫn đánh dấu việc xong được.",
};

export type OkrGioiHanMessages = typeof vi;

const en: OkrGioiHanMessages = {
	nhan: {
		gioiHan: "Restricted",
		goiY: "Only the people involved and {n} named viewers can see it",
		goiYKhongTen: "Only the people involved can see it",
	},
	menuMucHienThi: "Visibility…",
	khongThay: {
		tieuDe: "Objective not found",
		moTa: "The link may be wrong, or the objective no longer exists.",
		dong: "Close",
	},
	loiTai: {
		tieuDe: "Could not load the objective",
		moTa: "Nothing was lost — try again in a few minutes.",
		thuLai: "Try again",
	},
	hienThi: {
		tieuDe: "Visibility",
		moTa: "Who sees «{ten}».",
		nhom: "Who sees this objective",
		congKhai: "Public",
		congKhaiMoTa:
			"Everyone in the OKR program sees it; it counts in rollups and can contribute to other objectives.",
		gioiHan: "Restricted",
		gioiHanMoTa:
			"Only the people involved and named viewers see it. Left out of rollups, cannot contribute to other objectives.",
		nguoiXem: "Named viewers",
		themNguoi: "Add a person…",
		timNguoi: "Search members…",
		khongAi: "No one matches",
		dangTai: "Loading members…",
		boNguoi: "Remove {ten}",
		dem: "{n}/{max} people · workspace members only.",
		luonThay:
			"Always see it: the owner, KR owners, participants, leads who can edit the objective, admins.",
		moCanChinh: "Open the Contributes to tab",
		huy: "Cancel",
		luu: "Save",
		daLuu: "Visibility saved",
		khiTao:
			"A restricted objective stays with the people involved, even as a draft.",
	},
	duyet: {
		guiDuyet: "Submit for approval",
		hoiGui: {
			tieuDe: "Submit this objective for approval?",
			than: "While it awaits approval, its content, KRs, contributions and visibility are locked. You can withdraw it at any time.",
			nut: "Submit",
			thoi: "Cancel",
		},
		daGui: "Submitted for approval",
		canKr: "Add at least one KR before submitting for approval.",
		seDuyet: "{nguoi} will approve it.",
		seDuyetQuanTri: "An admin will approve it.",
		lanTruoc: "Last time {nguoi} returned it · {ngay}:",
		lanTruocBan: "Last time you returned it · {ngay}:",
		choNguoi: "Waiting for {nguoi} to approve",
		choQuanTri: "Waiting for an admin to approve",
		guiLuc: "sent {ngay}",
		khoaSua:
			"The objective is awaiting approval — withdraw it to edit content, KRs, contributions or visibility.",
		choTuTruoc:
			"This was submitted before the program turned approval off — it can now be published directly, no wait needed.",
		rutLai: "Withdraw",
		hopRut: {
			tieuDe: "Withdraw the approval request?",
			moTa: "The objective goes back to draft so you can keep editing. Submit it again when you are done.",
			huy: "Cancel",
			nut: "Back to draft",
		},
		daRut: "Withdrawn — the objective is a draft again",
		nguoiGui: "{nguoi} submitted this for approval",
		nguoiGuiKhongTen: "Waiting for your approval",
		duyetMoTa:
			"Approving publishes the objective now and locks its KR start values. Sending it back returns it to draft, with a reason for the sender.",
		duyetCongBo: "Approve and publish",
		daDuyet: "Objective approved and published",
		traLai: "Send back…",
		hopTraLai: {
			tieuDe: "Send the objective back",
			moTa: "«{ten}» returns to draft. The sender gets the reason in the morning reminder.",
			nhan: "Reason",
			goiY: "What needs to change before approval…",
			dem: "{n}/{max} characters · at least {min}.",
			huy: "Cancel",
			nut: "Send back",
		},
		daTraLai: "Objective sent back",
		biTraLai: "{nguoi} sent it back",
		biTraLaiKhongTen: "The objective was sent back",
	},
	viec: {
		choDuyet: "Waiting for your approval: {ten}",
		nguoiGui: "{nguoi} submitted it",
		traLai: "{nguoi} sent back: {ten}",
	},
	canhKrChoDuyet:
		"The objective is awaiting approval — tasks, initiatives and evidence are locked until it is approved or withdrawn. Tasks can still be marked done.",
};

export function okrGioiHanMessages(locale: Locale): OkrGioiHanMessages {
	return locale === "vi" ? vi : en;
}
