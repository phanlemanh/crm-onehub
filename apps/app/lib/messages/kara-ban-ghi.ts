import type { Locale } from "@crm/ui/lib/locale";

type TheoLoai = {
	tieuDe: string;
	moTa: string;
	choNhap: string;
	goiY: readonly [string, string, string];
};

const en = {
	tab: {
		theoLoai: {
			contact: {
				tieuDe: "Ask Kara about this person",
				moTa: "Kara reads their public profiles and our history with them, and shows each step it takes.",
				choNhap: "Are they still there?",
				goiY: [
					"Who is this person?",
					"Are they still there?",
					"What should I know before a call?",
				],
			},
			company: {
				tieuDe: "Ask Kara about this company",
				moTa: "Kara reads their site and our own history with them, and shows each step it takes.",
				choNhap: "What do they sell?",
				goiY: [
					"What do they do?",
					"Who do we know here?",
					"What has changed recently?",
				],
			},
			deal: {
				tieuDe: "Ask Kara about this deal",
				moTa: "Kara reads the thread, the meetings and the people on both sides of it.",
				choNhap: "Where has this stalled?",
				goiY: [
					"Where does this stand?",
					"Who else should be involved?",
					"What is the risk here?",
				],
			},
		} satisfies Record<"contact" | "company" | "deal", TheoLoai>,
		dangMo: "Kara is opening the conversation…",
		chuaTraLoi: "answer",
		loiVang:
			"Kara is away for the moment, so the question did not arrive. Try again in a few minutes.",
		loiKhac: "Something went wrong on the way. Try again.",
		chuaBat: "An admin needs to turn Kara on for records in Settings.",
		ban: "Kara is still answering the last question. The next one can go when it finishes.",
		ketThuc: "This conversation has ended.",
		batDauMoi: "Start a new conversation",
		nhanGoiY: "Suggested questions",
		nhanO: "Ask Kara",
		buoc: {} as Record<string, string>,
		buocKhac: "Used a tool",
	},
	hoiLai: {
		guiTraLoi: "Send answer",
		dangGui: "Sending…",
		choNhap: "Add what Kara needs to continue",
		nhanKhac: "Another answer",
		nhanTraLoi: "Your answer",
		goiYChon: "Choose an answer, then send it.",
		goiYTuDo: "Add what Kara needs to continue.",
		loiGui: "Couldn't send. Check your connection and try again.",
		batBuoc: "Choose or type an answer to continue.",
	},
	hoiThoai: {
		moi: "New conversation",
		chuaCo: "No conversations yet",
		chuaDatTen: "Untitled conversation",
		daXoa: "Conversation deleted.",
		nhanXoa: "Delete this conversation",
		loiXoa: "Couldn't delete the conversation. Try again.",
	},
	deXuat: {
		nhan: (n: number) => (n === 1 ? "1 suggestion" : `${n} suggestions`),
		viSao:
			"Kara read this person's public profiles and company page and compared them with what is saved.",
		them: "Add to profile",
		thay: "Replace current value",
		boQua: "Skip",
		daThem: "Added from Kara",
		daBo: "Skipped",
		hoanTacLoi: "This field changed after you accepted — it can't be undone",
		loiQuyet: "Couldn't save the decision. Try again.",
	},
	khung: {
		loiTieuDe: "Couldn't load this record",
		loiMoTa: "Check your connection and try again.",
	},
	traCuu: {
		nhoKara: "Ask Kara to look up",
		dangChay: "Kara is looking up…",
		lai: "Look up again",
		loi: "Kara couldn't start the lookup. Try again.",
	},
};

export type KaraBanGhiMessages = typeof en;

const vi: KaraBanGhiMessages = {
	tab: {
		theoLoai: {
			contact: {
				tieuDe: "Hỏi Kara về người này",
				moTa: "Kara đọc hồ sơ công khai và lịch sử của mình với họ, và cho thấy từng bước đã làm.",
				choNhap: "Họ còn làm ở đó không?",
				goiY: [
					"Người này là ai?",
					"Họ còn làm ở đó không?",
					"Cần biết gì trước cuộc gọi?",
				],
			},
			company: {
				tieuDe: "Hỏi Kara về công ty này",
				moTa: "Kara đọc trang của họ và lịch sử của mình với họ, và cho thấy từng bước đã làm.",
				choNhap: "Họ bán gì?",
				goiY: [
					"Công ty này làm gì?",
					"Mình quen ai ở đây?",
					"Gần đây có gì thay đổi?",
				],
			},
			deal: {
				tieuDe: "Hỏi Kara về thoả thuận này",
				moTa: "Kara đọc thư từ, các cuộc họp và những người ở cả hai phía.",
				choNhap: "Thoả thuận đang vướng ở đâu?",
				goiY: ["Thoả thuận đang ở đâu?", "Nên mời thêm ai?", "Rủi ro ở đâu?"],
			},
		},
		dangMo: "Kara đang mở cuộc trò chuyện…",
		chuaTraLoi: "trả lời",
		loiVang: "Kara đang tạm vắng nên câu hỏi chưa tới. Thử lại sau ít phút.",
		loiKhac: "Có trục trặc trên đường gửi. Thử lại nhé.",
		chuaBat: "Quản trị viên cần bật Kara cho hồ sơ trong Cài đặt.",
		ban: "Kara vẫn đang trả lời câu trước. Câu tiếp theo gửi được khi xong.",
		ketThuc: "Cuộc trò chuyện này đã kết thúc.",
		batDauMoi: "Bắt đầu cuộc mới",
		nhanGoiY: "Gợi ý câu hỏi",
		nhanO: "Hỏi Kara",
		buoc: {
			read_crm_history: "Đọc thư và cuộc họp của mình với họ",
			read_company_history: "Đọc mọi thứ mình có về công ty",
			read_deal_history: "Đọc thoả thuận và chặng nó đã qua",
			search_crm: "Tìm bản ghi trong OneHub Center",
			resolve_linkedin_profile: "Tìm hồ sơ LinkedIn của họ",
			get_linkedin_profile: "Đọc một hồ sơ LinkedIn",
			get_contact_work_history: "Đọc quá trình làm việc của họ",
			fetch_contact_photo: "Lấy ảnh đại diện của họ",
			find_contact_socials: "Tìm các hồ sơ khác của họ",
			set_contact_socials: "Đối chiếu một hồ sơ với chính tài khoản đó",
			identify_contact: "Gắn tên cho địa chỉ thư",
			record_fact: "Ghi lại điều tìm được",
			write_brief: "Viết phần lý lịch",
			write_workspace_profile: "Viết phần giới thiệu về mình",
			"zalo-chi-doc": "Giữ cuộc trò chuyện Zalo ở chế độ chỉ đọc",
			"okr-chi-tro-ly": "Giữ phiên OKR cho Kara · OKR",
			research_person: "Tìm hiểu họ trên web",
			research_company: "Đọc trang của công ty",
			enrich_company: "Tra cứu công ty",
			schedule_recheck: "Định khi nào xem lại",
			record_job_change: "Báo một lần đổi việc",
			list_deals: "Xem lại các thoả thuận",
			list_outstanding_work: "Tìm việc còn dang dở",
			set_chat_title: "Đặt tên cuộc trò chuyện",
			list_fields: "Đọc những trường mình đang theo dõi",
			set_field_value: "Điền một trường tuỳ chỉnh",
			manage_fields: "Đổi những trường OneHub Center theo dõi",
			archive_field: "Đề nghị lưu trữ một trường",
			load_skill: "Đọc hướng dẫn cho việc này",
			web_search: "Tìm trên web",
			web_fetch: "Đọc một trang web",
			todo: "Cập nhật kế hoạch",
			ask_question: "Đặt một câu hỏi",
			agent: "Giao một phần việc cho trợ thủ",
			connection_search: "Tìm một công cụ dùng được",
			bash: "Chạy một lệnh",
			read_file: "Đọc một tệp",
			write_file: "Ghi một tệp",
			glob: "Tìm tệp",
			grep: "Tìm trong các tệp",
		},
		buocKhac: "Dùng một công cụ",
	},
	hoiLai: {
		guiTraLoi: "Gửi câu trả lời",
		dangGui: "Đang gửi…",
		choNhap: "Thêm điều Kara cần để làm tiếp",
		nhanKhac: "Câu trả lời khác",
		nhanTraLoi: "Câu trả lời của bạn",
		goiYChon: "Chọn một câu trả lời rồi gửi.",
		goiYTuDo: "Thêm điều Kara cần để làm tiếp.",
		loiGui: "Chưa gửi được. Kiểm tra kết nối rồi thử lại.",
		batBuoc: "Chọn hoặc nhập một câu trả lời để làm tiếp.",
	},
	hoiThoai: {
		moi: "Cuộc trò chuyện mới",
		chuaCo: "Chưa có cuộc trò chuyện nào",
		chuaDatTen: "Cuộc trò chuyện chưa đặt tên",
		daXoa: "Đã xoá cuộc trò chuyện.",
		nhanXoa: "Xoá cuộc trò chuyện này",
		loiXoa: "Chưa xoá được cuộc trò chuyện. Thử lại nhé.",
	},
	deXuat: {
		nhan: (n: number) => `${n} đề xuất`,
		viSao:
			"Kara đọc hồ sơ công khai và trang công ty của người này, rồi so với thông tin đang lưu.",
		them: "Thêm vào hồ sơ",
		thay: "Thay giá trị hiện có",
		boQua: "Bỏ qua",
		daThem: "Đã thêm theo Kara",
		daBo: "Đã bỏ qua",
		hoanTacLoi: "Trường này đã đổi sau khi nhận — không hoàn tác được",
		loiQuyet: "Chưa lưu được quyết định. Thử lại nhé.",
	},
	khung: {
		loiTieuDe: "Không tải được bản ghi này",
		loiMoTa: "Kiểm tra kết nối rồi thử lại.",
	},
	traCuu: {
		nhoKara: "Nhờ Kara tra cứu",
		dangChay: "Kara đang tra cứu…",
		lai: "Tra cứu lại",
		loi: "Kara chưa bắt đầu tra cứu được. Thử lại nhé.",
	},
};

const BANG = { en, vi } satisfies Record<Locale, KaraBanGhiMessages>;

export function karaBanGhiMessages(locale: Locale): KaraBanGhiMessages {
	return BANG[locale];
}
