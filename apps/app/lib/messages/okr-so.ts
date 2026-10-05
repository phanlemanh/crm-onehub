import type { Locale } from "@crm/ui/lib/locale";

const vi = {
	chiSo: {
		"thoa-thuan-chot-duoc": {
			nhan: "Thoả thuận chốt được",
			dinhNghia:
				"Thoả thuận chốt thành công trong kỳ, tính theo ngày chốt, quy cho người phụ trách thoả thuận.",
			rong: "Chưa có thoả thuận nào chốt được trong kỳ",
		},
		"thoa-thuan-moi": {
			nhan: "Thoả thuận mới",
			dinhNghia:
				"Thoả thuận tạo trong kỳ và chưa lưu trữ, quy cho người phụ trách thoả thuận.",
			rong: "Chưa có thoả thuận mới nào trong kỳ",
		},
		"goi-hen-duoc": {
			nhan: "Cuộc gọi hẹn được gặp",
			dinhNghia:
				"Cuộc gọi chiến dịch có kết quả hẹn gặp, tính theo ngày gọi, quy cho người ghi cuộc gọi.",
			rong: "Chưa có cuộc gọi nào hẹn được gặp trong kỳ",
		},
		"buoc-xong-dung-han": {
			nhan: "Bước kế hoạch xong đúng hạn",
			dinhNghia:
				"Bước của kế hoạch 30 ngày xong không muộn hơn hạn, tính theo ngày xong; theo phòng ban là phòng ban của bước, theo người là người được giao.",
			rong: "Chưa có bước kế hoạch nào xong đúng hạn trong kỳ",
		},
		"ghi-danh-dat-bac": {
			nhan: "Cá nhân ghi danh đạt bậc",
			dinhNghia:
				"Cá nhân ghi danh đạt bậc đã chọn trong kỳ, tính theo ngày đạt bậc, quy cho người cầm trịch kế hoạch.",
			rong: "Chưa có cá nhân ghi danh nào đạt bậc này trong kỳ",
		},
		"form-thanh-ca-nhan": {
			nhan: "Form thành cá nhân",
			dinhNghia:
				"Form đã xếp vào một cá nhân chưa lưu trữ, tính theo ngày xếp, quy cho người phụ trách cá nhân.",
			rong: "Chưa có form nào thành cá nhân trong kỳ",
		},
		"email-gui-ra": {
			nhan: "Email gửi ra",
			dinhNghia:
				"Thư gửi từ địa chỉ email của một thành viên, tính theo ngày gửi, quy cho thành viên đó.",
			rong: "Chưa có thư nào gửi ra trong kỳ",
		},
	},
	donVi: {
		"thoa-thuan": (so: string) => `${so} thoả thuận`,
		"cuoc-goi": (so: string) => `${so} cuộc gọi`,
		buoc: (so: string) => `${so} bước`,
		"ca-nhan": (so: string) => `${so} cá nhân`,
		thu: (so: string) => `${so} thư`,
	},
	bac: {
		"tai-khoan": {
			nhan: "Có tài khoản",
			dinhNghia: "Tính theo ngày cá nhân có tài khoản.",
		},
		"khoa-hoc": {
			nhan: "Học xong khoá",
			dinhNghia: "Tính theo ngày cá nhân học xong khoá.",
		},
		"hoat-dong": {
			nhan: "Đang hoạt động",
			dinhNghia: "Tính theo ngày cá nhân bắt đầu hoạt động.",
		},
		"giao-dich-dau": {
			nhan: "Giao dịch đầu",
			dinhNghia: "Tính theo ngày cá nhân có giao dịch đầu tiên.",
		},
	},
	nguon: {
		tay: {
			nhan: "Nhập tay",
			moTa: "Người phụ trách ghi số ở cập nhật tuần.",
		},
		crm: {
			nhan: "Chỉ số CRM",
			moTa: "Máy đếm từ dữ liệu trong OneHub Center mỗi sáng.",
		},
		api: {
			nhan: "Khoá API",
			moTa: "Một hệ thống khác ghi số bằng khoá API của một thành viên.",
		},
		bangTinh: {
			nhan: "Google Sheets",
			moTa: "Máy đọc một ô của bảng tính mỗi sáng.",
		},
	},
	dau: {
		crm: "CRM",
		api: "API",
		bangTinh: "Sheets",
	},
	phamVi: {
		nhan: "Phạm vi",
		"toan-cong-ty": "Toàn công ty",
		"bo-phan": "Bộ phận",
		"phong-ban": "Phòng ban",
		nguoi: "Người",
		tim: "Tìm theo tên…",
		khongKhop: "Không có đơn vị hay người nào khớp",
	},
	thuLai: "Thử lại",
	trangThai: {
		hopThoai: {
			oNguon: "Nguồn số",
			oChiSo: "Chỉ số",
			oBac: "Bậc",
			dong: "Đóng",
			crmKhongHopKieu:
				"Chỉ số CRM là số đếm — KR mốc hay phần trăm không lấy số từ đây.",
			xemTruoc: {
				dangDem: "Đang đếm…",
				toiHomNay: (dem: string) => `Tới hôm nay: ${dem}`,
				loi: "Không đếm được",
			},
			api: {
				maKr: "Mã KR",
				lenhMau: "Lệnh mẫu",
				moTa: "Gửi số bằng khoá API của một thành viên được sửa KR này.",
				caiDat: "Cài đặt › Khoá API",
			},
			sheets: {
				oDuongDan: "Đường dẫn bảng tính",
				oO: "Ô",
				goiYO: "Ví dụ Tổng!B2",
				saiO: "Ô phải có dạng A1 hoặc Trang!A1",
				saiDuongDan:
					"Đường dẫn phải là một bảng tính Google (docs.google.com/spreadsheets)",
				chiaSe: (email: string) => `Chia sẻ bảng tính cho ${email}`,
				diaChiChiaSe: "Địa chỉ chia sẻ",
				dangDoc: "Đang đọc thử…",
				docDuoc: (so: string, gio: string) => `Đọc được ${so} lúc ${gio}`,
				docLai: "Đọc lại",
				chuaDocXong: "Chưa đọc xong, thử lại sau.",
				lyDo: {
					"chua-chia-se":
						"Bảng tính chưa chia sẻ cho địa chỉ đọc của OneHub Center",
					"khong-thay": "Không thấy bảng tính hay trang này",
					"khong-phai-so": "Ô này không chứa một con số",
					"o-trong": "Ô này đang trống",
					"google-loi": "Google chưa trả lời, sẽ đọc lại vào sáng mai",
					tat: "Nguồn Google Sheets đang tắt",
					"khong-hop-kieu":
						"Số trong ô không hợp kiểu KR — mốc chỉ nhận 0 hoặc 1, phần trăm trong 0–100",
				},
				tat: "Quản trị chưa cắm khoá Google Sheets",
			},
			khoa: {
				chuThich: "Nguồn khoá khi mục tiêu công bố.",
				themDoCanh: "Thêm số đo cạnh",
			},
		},
		bangKr: {
			doCanh: (tay: string, may: string) => `${tay} tay · ${may} máy`,
			chuaChup: "Số máy: sáng mai",
			chuaGhiApi: "Chưa có lần ghi qua khoá API",
			moSo: (ten: string) => `Xem bản ghi làm nên số của ${ten}`,
			chiOkr: "Bản ghi đằng sau số này nằm ngoài phạm vi OKR của bạn.",
		},
		so: {
			tieuDe: "Số của KR",
			dangTai: "Đang tải số của KR",
			khoang: (tu: string, den: string) => `Từ ${tu} đến ${den}`,
			daChup: (so: string, ngay: string) => `Đã chụp ${so} ngày ${ngay}`,
			banGhi: "Bản ghi làm nên số",
			lichSu: "Lịch sử theo ngày",
			cotBanGhi: "Bản ghi",
			cotNgay: "Ngày",
			cotSo: "Số",
			cotNguoiCamKhoa: "Người cầm khoá",
			xemThem: "Xem thêm",
			lech: (chup: string, bayGio: string) =>
				`Đã chụp ${chup} · tính lại lúc này ${bayGio} — dữ liệu đã đổi sau khi chụp`,
			loi: "Không tải được số của KR này.",
			lanGhi: "Các lần ghi qua khoá API",
			chuaGhi: "Chưa có lần ghi nào qua khoá API",
		},
		capNhat: {
			soTu: (nguon: string, ngay: string) => `Số từ ${nguon} · ${ngay}`,
			soMay: (so: string, ngay: string) => `Số máy: ${so} · ${ngay}`,
		},
	},
};

export type OkrSoMessages = typeof vi;

const en: OkrSoMessages = {
	chiSo: {
		"thoa-thuan-chot-duoc": {
			nhan: "Deals won",
			dinhNghia:
				"Deals won this cycle, counted by close date and credited to the deal owner.",
			rong: "No deals won this cycle yet",
		},
		"thoa-thuan-moi": {
			nhan: "New deals",
			dinhNghia:
				"Deals created this cycle and not archived, credited to the deal owner.",
			rong: "No new deals this cycle yet",
		},
		"goi-hen-duoc": {
			nhan: "Calls that booked a meeting",
			dinhNghia:
				"Campaign calls whose outcome was a meeting, counted by call date and credited to whoever logged the call.",
			rong: "No calls booked a meeting this cycle yet",
		},
		"buoc-xong-dung-han": {
			nhan: "Plan steps done on time",
			dinhNghia:
				"30-day plan steps finished by their due date, counted by completion date; by department it is the step's department, by person the assignee.",
			rong: "No plan steps were done on time this cycle yet",
		},
		"ghi-danh-dat-bac": {
			nhan: "Enrolled people reaching a stage",
			dinhNghia:
				"Enrolled people who reached the chosen stage this cycle, counted by the date they reached it and credited to the plan lead.",
			rong: "No enrolled person reached this stage this cycle yet",
		},
		"form-thanh-ca-nhan": {
			nhan: "Forms turned into people",
			dinhNghia:
				"Forms filed to a person who is not archived, counted by filing date and credited to the person's owner.",
			rong: "No forms turned into people this cycle yet",
		},
		"email-gui-ra": {
			nhan: "Emails sent",
			dinhNghia:
				"Emails sent from a member's email address, counted by send date and credited to that member.",
			rong: "No emails sent this cycle yet",
		},
	},
	donVi: {
		"thoa-thuan": (so: string) => `${so} ${so === "1" ? "deal" : "deals"}`,
		"cuoc-goi": (so: string) => `${so} ${so === "1" ? "call" : "calls"}`,
		buoc: (so: string) => `${so} ${so === "1" ? "step" : "steps"}`,
		"ca-nhan": (so: string) => `${so} ${so === "1" ? "person" : "people"}`,
		thu: (so: string) => `${so} ${so === "1" ? "email" : "emails"}`,
	},
	bac: {
		"tai-khoan": {
			nhan: "Has an account",
			dinhNghia: "Counted by the date the person got an account.",
		},
		"khoa-hoc": {
			nhan: "Finished the course",
			dinhNghia: "Counted by the date the person finished the course.",
		},
		"hoat-dong": {
			nhan: "Active",
			dinhNghia: "Counted by the date the person became active.",
		},
		"giao-dich-dau": {
			nhan: "First deal",
			dinhNghia: "Counted by the date of the person's first deal.",
		},
	},
	nguon: {
		tay: {
			nhan: "Manual",
			moTa: "The owner enters the number in the weekly update.",
		},
		crm: {
			nhan: "CRM metric",
			moTa: "Counted every morning from data in OneHub Center.",
		},
		api: {
			nhan: "API key",
			moTa: "Another system writes the number with a member's API key.",
		},
		bangTinh: {
			nhan: "Google Sheets",
			moTa: "One spreadsheet cell, read every morning.",
		},
	},
	dau: {
		crm: "CRM",
		api: "API",
		bangTinh: "Sheets",
	},
	phamVi: {
		nhan: "Scope",
		"toan-cong-ty": "Whole company",
		"bo-phan": "Division",
		"phong-ban": "Department",
		nguoi: "Person",
		tim: "Search by name…",
		khongKhop: "No unit or person matches",
	},
	thuLai: "Try again",
	trangThai: {
		hopThoai: {
			oNguon: "Number source",
			oChiSo: "Metric",
			oBac: "Stage",
			dong: "Close",
			crmKhongHopKieu:
				"CRM metrics are counts — a milestone or percentage KR can't take its number from them.",
			xemTruoc: {
				dangDem: "Counting…",
				toiHomNay: (dem: string) => `So far: ${dem}`,
				loi: "Couldn't count",
			},
			api: {
				maKr: "KR ID",
				lenhMau: "Example command",
				moTa: "Send the number with the API key of a member who can edit this KR.",
				caiDat: "Settings › API keys",
			},
			sheets: {
				oDuongDan: "Spreadsheet link",
				oO: "Cell",
				goiYO: "For example Total!B2",
				saiO: "Use a cell like A1 or Sheet!A1",
				saiDuongDan:
					"The link must be a Google spreadsheet (docs.google.com/spreadsheets)",
				chiaSe: (email: string) => `Share the spreadsheet with ${email}`,
				diaChiChiaSe: "Sharing address",
				dangDoc: "Reading the cell…",
				docDuoc: (so: string, gio: string) => `Read ${so} at ${gio}`,
				docLai: "Read again",
				chuaDocXong: "Not read yet — try again later.",
				lyDo: {
					"chua-chia-se":
						"The spreadsheet isn't shared with OneHub Center's reading address",
					"khong-thay": "Couldn't find this spreadsheet or sheet",
					"khong-phai-so": "This cell doesn't hold a number",
					"o-trong": "This cell is empty",
					"google-loi":
						"Google didn't answer; it will be read again tomorrow morning",
					tat: "The Google Sheets source is off",
					"khong-hop-kieu":
						"The cell's number doesn't fit this KR's type — a milestone takes 0 or 1, a percentage 0–100",
				},
				tat: "An admin hasn't added the Google Sheets key yet",
			},
			khoa: {
				chuThich: "The source locks when the objective is published.",
				themDoCanh: "Add a side measurement",
			},
		},
		bangKr: {
			doCanh: (tay: string, may: string) => `${tay} manual · ${may} measured`,
			chuaChup: "Measured number: tomorrow morning",
			chuaGhiApi: "No write with an API key yet",
			moSo: (ten: string) => `See the records behind ${ten}`,
			chiOkr: "The records behind this number are outside your OKR access.",
		},
		so: {
			tieuDe: "KR number",
			dangTai: "Loading the KR number",
			khoang: (tu: string, den: string) => `From ${tu} to ${den}`,
			daChup: (so: string, ngay: string) => `Captured ${so} on ${ngay}`,
			banGhi: "Records behind the number",
			lichSu: "History by day",
			cotBanGhi: "Record",
			cotNgay: "Date",
			cotSo: "Number",
			cotNguoiCamKhoa: "Key holder",
			xemThem: "Show more",
			lech: (chup: string, bayGio: string) =>
				`Captured ${chup} · recounted now ${bayGio} — the data changed after the capture`,
			loi: "Couldn't load this KR's number.",
			lanGhi: "Writes with an API key",
			chuaGhi: "Nothing written with an API key yet",
		},
		capNhat: {
			soTu: (nguon: string, ngay: string) => `From ${nguon} · ${ngay}`,
			soMay: (so: string, ngay: string) => `Measured: ${so} · ${ngay}`,
		},
	},
};

const BANG = { en, vi } satisfies Record<Locale, OkrSoMessages>;

export function okrSoMessages(locale: Locale): OkrSoMessages {
	return BANG[locale];
}
