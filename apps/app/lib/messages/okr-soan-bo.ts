import type { Locale } from "@crm/ui/lib/locale";

const vi = {
	dauKhung: {
		tieuDe: "Soạn bộ OKR",
		dong: "Đóng chế độ Soạn",
	},
	loiVao: {
		soanCaBo: "Soạn cả bộ",
		soanCaBoMoTa:
			"Viết mục tiêu và KR liền mạch như một tài liệu, rồi công bố từ cùng khung.",
		nutRong: "Soạn bộ OKR",
		khoa: "Chỉ trưởng đơn vị và quản trị soạn bộ OKR, khi chu kỳ còn nhận ghi.",
	},
	theSoan: {
		bo: "Bộ OKR",
		cotBen: "Chất lượng và Kara",
	},
	taiLieu: {
		goMucTieu: "Gõ mục tiêu — Enter để xuống dòng KR",
		goKr: "Gõ KR — Tab sang số",
		khoiDiem: "Khởi điểm",
		dich: "Đích",
		donViDo: "Đơn vị",
		kieu: "Kiểu",
		nguoiPhuTrach: "Người phụ trách",
		themMucTieu: "Thêm mục tiêu",
		themKr: "Thêm KR",
		xoaMucTieu: "Xoá",
		thaoTacMucTieu: "Thao tác với mục tiêu",
		daLuu: "Đã lưu nháp",
		dangLuu: "Đang lưu…",
		boTrong:
			"Bộ OKR này chưa có mục tiêu nào. Gõ mục tiêu đầu tiên ngay dưới đây.",
		khoaSo: "Số của mục tiêu đã công bố sửa ở ngăn KR",
		khoaChoDuyet:
			"Mục tiêu đang chờ duyệt nên cả dòng bị khoá. Rút duyệt ở ngăn theo dõi để sửa.",
		theoKara: "đổi theo Kara",
		nhoKara: "Nhờ Kara soạn nháp",
		nhoKaraMoTa:
			"Mở cuộc soạn: Kara đọc trang chiến lược và đề nghị một bộ để bạn quyết từng dòng.",
		chuaLuu: {
			"thieu-ten": "Chưa lưu — thiếu tên",
			"thieu-dich": "Chưa lưu — thiếu đích",
			"thieu-khoi-diem": "Chưa lưu — thiếu khởi điểm",
			"dich-bang-khoi": "Chưa lưu — đích bằng khởi điểm",
			"muc-tieu-chua-luu": "Chưa lưu — mục tiêu của KR chưa lưu",
		},
		loiLuu: "Chưa lưu được. Rời ô để thử lại.",
		krThu: (n: string) => `KR ${n}`,
		hoiXoa: {
			tieuDe: (ten: string) => `Xoá mục tiêu «${ten}»?`,
			than: "Mục tiêu nháp chưa có lịch sử sẽ mất hẳn cùng các KR của nó.",
			nut: "Xoá mục tiêu",
			thoi: "Huỷ",
		},
	},
	chiXem: {
		"khong-sua":
			"Bạn xem được bộ này nhưng không sửa được: chỉ trưởng đơn vị và quản trị soạn bộ OKR.",
		"ky-dong": "Chu kỳ này đã đóng nên bộ OKR chỉ còn để xem.",
		"bo-ca-nhan":
			"Bộ OKR cá nhân không soạn ở đây — mở từng mục tiêu ở màn theo dõi để sửa.",
	},
	hoiDong: {
		tieuDe: "Bỏ dòng chưa lưu?",
		than: "Còn dòng chưa đủ chữ để lưu hoặc lưu lỗi. Đóng bây giờ thì chữ ở các dòng ấy mất.",
		bo: "Bỏ và đóng",
		oLai: "Ở lại",
	},
	taiLoi: {
		tieuDe: "Chưa mở được bộ OKR",
		moTa: "Máy chủ không trả lời. Nội dung bạn đã lưu vẫn còn.",
		thuLai: "Thử lại",
	},
	chatLuong: {
		tieuDe: "Chất lượng",
		moTa: "Máy chấm theo luật OKR của OneHub, ngay khi bạn gõ.",
		dat: (dat: string, xet: string) => `${dat} trên ${xet} điểm đạt`,
		denDong: "Đến dòng",
		datHet: "Bộ đạt mọi điểm chất lượng.",
		chuaCo: "Gõ mục tiêu đầu tiên để máy chấm",
		luat: {
			"kr-la-viec": "KR là việc, chưa đo kết quả",
			"thieu-khoi-diem": "KR thiếu khởi điểm",
			"dich-bang-khoi-diem": "Đích bằng khởi điểm",
			"thieu-doi-trong": "Thiếu KR đối trọng",
			"it-hon-2-kr": "Ít hơn 2 KR",
			"nhieu-hon-5-kr": "Nhiều hơn 5 KR",
			"kr-thieu-nguoi": "KR chưa có người phụ trách",
		},
	},
	gopY: {
		nhoDoc: "Nhờ Kara đọc bộ",
		docLai: "Kara đọc lại bộ",
		dangDoc: "Kara đang đọc bộ OKR này…",
		chuaDoc:
			"Kara đọc cả bộ khi bạn nhờ, rồi đặt góp ý ở đây. Bạn quyết từng góp ý.",
		khongCo: "Kara không thấy chỗ nào cần sửa",
		khongCoMoTa: "Mọi KR đã đo kết quả, có khởi điểm và có đối trọng.",
		tat: "Quản trị chưa bật Kara cho đơn vị này. Điểm chất lượng vẫn chấm như thường.",
		viecDoc: "đọc bộ OKR này",
		viSao: (n: string) =>
			`Kara đọc tên, «vì sao lúc này» và các KR của ${n} mục tiêu trong bộ này. Kara chỉ đọc dữ liệu OKR.`,
		chip: (n: string) => `${n} góp ý`,
	},
	congBo: {
		nut: (n: string) => `Công bố ${n} mục tiêu`,
		nutGuiDuyet: (n: string) => `Gửi duyệt ${n} mục tiêu`,
		nutKhoa: "Công bố",
		moTa: "Mục tiêu còn thiếu KR ở lại Nháp. Điểm chất lượng không chặn công bố.",
		hoi: {
			tieuDe: (n: string) => `Công bố ${n} mục tiêu?`,
			tieuDeGuiDuyet: (n: string) => `Gửi duyệt ${n} mục tiêu?`,
			oLaiNhap: "Ở lại Nháp vì chưa có KR:",
			thoi: "Huỷ",
		},
		daCongBo: (n: string) => `Đã công bố ${n} mục tiêu`,
		daGuiDuyet: (n: string) => `Đã gửi duyệt ${n} mục tiêu`,
		daCongBoMoTa:
			"Mục tiêu đã vào màn theo dõi của Bộ OKR. Sửa nội dung thì quay lại Soạn bất cứ lúc nào.",
		veTheoDoi: "Về màn theo dõi",
		loiMuc: (ten: string) => `Chưa công bố được «${ten}»`,
		thuLai: "Thử lại",
	},
};

type OkrSoanBoMessages = typeof vi;

const en: OkrSoanBoMessages = {
	dauKhung: {
		tieuDe: "Draft OKR set",
		dong: "Close drafting",
	},
	loiVao: {
		soanCaBo: "Draft the whole set",
		soanCaBoMoTa:
			"Write objectives and KRs in one flowing document, then publish from the same panel.",
		nutRong: "Draft OKR set",
		khoa: "Only unit heads and admins draft an OKR set, while the cycle still accepts changes.",
	},
	theSoan: {
		bo: "OKR set",
		cotBen: "Quality and Kara",
	},
	taiLieu: {
		goMucTieu: "Type an objective — Enter for a KR line",
		goKr: "Type a KR — Tab to the numbers",
		khoiDiem: "Start",
		dich: "Target",
		donViDo: "Unit",
		kieu: "Type",
		nguoiPhuTrach: "Owner",
		themMucTieu: "Add objective",
		themKr: "Add KR",
		xoaMucTieu: "Delete",
		thaoTacMucTieu: "Objective actions",
		daLuu: "Draft saved",
		dangLuu: "Saving…",
		boTrong:
			"This OKR set has no objectives yet. Type the first one right below.",
		khoaSo: "Numbers of a published objective are edited in the KR panel",
		khoaChoDuyet:
			"This objective is awaiting approval, so the whole line is locked. Withdraw it in the tracking panel to edit.",
		theoKara: "changed by Kara",
		nhoKara: "Ask Kara to draft",
		nhoKaraMoTa:
			"Opens a drafting session: Kara reads the strategy page and proposes a set for you to decide line by line.",
		chuaLuu: {
			"thieu-ten": "Not saved — name missing",
			"thieu-dich": "Not saved — target missing",
			"thieu-khoi-diem": "Not saved — start missing",
			"dich-bang-khoi": "Not saved — target equals start",
			"muc-tieu-chua-luu": "Not saved — the objective isn't saved yet",
		},
		loiLuu: "Couldn't save. Leave the field to try again.",
		krThu: (n: string) => `KR ${n}`,
		hoiXoa: {
			tieuDe: (ten: string) => `Delete objective "${ten}"?`,
			than: "A draft objective with no history is removed for good, together with its KRs.",
			nut: "Delete objective",
			thoi: "Cancel",
		},
	},
	chiXem: {
		"khong-sua":
			"You can view this set but not edit it: only unit heads and admins draft an OKR set.",
		"ky-dong": "This cycle is closed, so the OKR set is view-only.",
		"bo-ca-nhan":
			"Personal OKR sets aren't drafted here — open each objective in the tracking view to edit it.",
	},
	hoiDong: {
		tieuDe: "Discard unsaved lines?",
		than: "Some lines aren't complete enough to save, or failed to save. Closing now loses their text.",
		bo: "Discard and close",
		oLai: "Stay",
	},
	taiLoi: {
		tieuDe: "Couldn't open the OKR set",
		moTa: "The server didn't respond. What you saved is still there.",
		thuLai: "Try again",
	},
	chatLuong: {
		tieuDe: "Quality",
		moTa: "Checked against OneHub's OKR rules as you type.",
		dat: (dat: string, xet: string) => `${dat} of ${xet} checks passed`,
		denDong: "Go to line",
		datHet: "The set passes every quality check.",
		chuaCo: "Type the first objective to start checking",
		luat: {
			"kr-la-viec": "KR is a task, not a measured result",
			"thieu-khoi-diem": "KR has no start value",
			"dich-bang-khoi-diem": "Target equals start",
			"thieu-doi-trong": "No counterbalancing KR",
			"it-hon-2-kr": "Fewer than 2 KRs",
			"nhieu-hon-5-kr": "More than 5 KRs",
			"kr-thieu-nguoi": "KR has no owner",
		},
	},
	gopY: {
		nhoDoc: "Ask Kara to read the set",
		docLai: "Kara, read the set again",
		dangDoc: "Kara is reading this OKR set…",
		chuaDoc:
			"Kara reads the whole set when you ask, then puts suggestions here. You decide each one.",
		khongCo: "Kara found nothing to change",
		khongCoMoTa:
			"Every KR measures a result, has a start value and a counterbalance.",
		tat: "An admin hasn't turned Kara on for this unit. Quality checks still run as usual.",
		viecDoc: "read this OKR set",
		viSao: (n: string) =>
			n === "1"
				? "Kara read the title, “why now” and the KRs of 1 objective in this set. Kara reads OKR data only."
				: `Kara read the title, “why now” and the KRs of ${n} objectives in this set. Kara reads OKR data only.`,
		chip: (n: string) => `${n} suggestions`,
	},
	congBo: {
		nut: (n: string) => `Publish ${n} objectives`,
		nutGuiDuyet: (n: string) => `Submit ${n} objectives for approval`,
		nutKhoa: "Publish",
		moTa: "Objectives without a KR stay in Draft. The quality score doesn't block publishing.",
		hoi: {
			tieuDe: (n: string) => `Publish ${n} objectives?`,
			tieuDeGuiDuyet: (n: string) => `Submit ${n} objectives for approval?`,
			oLaiNhap: "Staying in Draft because they have no KR:",
			thoi: "Cancel",
		},
		daCongBo: (n: string) => `Published ${n} objectives`,
		daGuiDuyet: (n: string) => `Submitted ${n} objectives for approval`,
		daCongBoMoTa:
			"The objectives are now in the OKR set's tracking view. Come back to drafting any time to edit them.",
		veTheoDoi: "Back to tracking",
		loiMuc: (ten: string) => `Couldn't publish "${ten}"`,
		thuLai: "Try again",
	},
};

export function okrSoanBoMessages(locale: Locale): OkrSoanBoMessages {
	return locale === "en" ? en : vi;
}
