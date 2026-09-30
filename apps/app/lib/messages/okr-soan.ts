import type { Locale } from "@crm/ui/lib/locale";
import type { RouterOutputs } from "@/lib/trpc/types";

type Okr = RouterOutputs["okr"];
type LyDoSoan = Extract<Okr["soanSanSang"], { bat: false }>["lyDo"];
type LyDoLuot = Extract<Okr["soanTangLuot"], { ok: false }>["lyDo"];
type LyDoQuyet = Extract<Okr["soanQuyet"], { ok: false }>["lyDo"];
type LyDoDuaVao = Extract<Okr["soanDuaVao"], { ok: false }>["lyDo"];
type TrangThaiCuoc = Okr["soanDanhSach"]["cuoc"]["trangThai"];
type LoaiMucTieu = Extract<
	Okr["soanDanhSach"]["dong"][number],
	{ loai: "muc-tieu-moi" }
>["loaiMucTieu"];

type NhanDong = "vua-them" | "vua-sua" | "vua-chuyen" | "da-bo";
type Ket = "accepted" | "dismissed" | "skipped";

const vi = {
	nut: {
		soan: "Soạn OKR cùng Trợ lý",
		tiep: "Tiếp cuộc đang soạn",
		cheDoAn: "chế độ ẩn",
		cheDoAnMoTa:
			"Chỉ quản trị thấy nút này; cuộc soạn tính vào số đo, không tính vào đơn vị.",
		hetCuoc: (n: string) => `Đã dùng hết ${n} cuộc soạn kỳ này`,
		tamNghi: (ngay: string) => `Trợ lý OKR tạm nghỉ tới ${ngay}`,
		tiepMoTa: (ngay: string, luot: string, dong: string) =>
			`Mở ${ngay} · ${luot} lượt · ${dong} dòng chưa quyết`,
		dsCuoc: (n: string, tran: string) => `Cuộc soạn · ${n}/${tran}`,
	},
	man: {
		tieuDe: "Soạn OKR cùng Trợ lý",
		luot: (luot: string, tran: string) => `lượt ${luot}/${tran}`,
		tabs: "Màn soạn",
		tabTroChuyen: "Trò chuyện",
		tabBanNhap: (n: string) => `Bản nháp (${n})`,
		banNhap: "Bản nháp",
		soDong: (n: string) => `${n} dòng`,
		dangMo: "Đang mở cuộc soạn…",
		khongMo: "Không mở được cuộc soạn này",
		khongMoMoTa:
			"Cuộc không còn, hoặc bạn không xem được nó. Đóng màn này rồi mở lại từ khung đơn vị.",
		thuLai: "Thử lại",
	},
	hoiThoai: {
		nhan: "Trò chuyện với Trợ lý OKR",
		moDau: "Trợ lý OKR đang đọc bối cảnh của đơn vị…",
		khongDocLai: "Không đọc lại được các lượt trước",
		khongDocLaiMoTa:
			"Bản nháp bên cạnh vẫn còn đủ; bạn nói tiếp được ở ô bên dưới.",
		dangSoan: "Trợ lý OKR đang soạn…",
		placeholder: "Trả lời, hoặc nói bạn muốn đổi gì trong bản nháp…",
		gui: "Gửi",
		phim: "Enter gửi · Shift+Enter xuống dòng",
		khoaKhiSoan: "Ô soạn mở lại khi Trợ lý trả lời xong.",
		goiY: (hoi: string) => `Gợi ý trả lời: ${hoi}`,
		daNop: "Đã nộp bản nháp lên bảng",
		loi: "Trợ lý OKR chưa trả lời được",
		loiMoTa: "Quá 45 giây không có hồi âm. Bản nháp bên cạnh giữ nguyên.",
		loiMoTaKhac:
			"Phiên trò chuyện đã dừng giữa chừng. Bản nháp bên cạnh giữ nguyên.",
		thuLai: "Thử lại",
		hetLuot: (n: string) =>
			`Đã dùng hết ${n} lượt của cuộc này — đưa vào bộ OKR hoặc mở cuộc mới`,
		moCuocMoi: "Mở cuộc mới",
		thieuBoiCanh:
			"Chưa có Hồ sơ công ty và Chiến lược năm — Trợ lý soạn với ít bối cảnh hơn",
		thieuBoiCanhMoTa:
			"Viết hai trang loại «Chiến lược» trong Kho tài liệu rồi duyệt; cuộc sau Trợ lý sẽ đọc.",
		toiKho: "Tới Kho tài liệu",
		cuocDong: "Cuộc này đã kết thúc",
		cuocDongMoTa: "Bản nháp bên cạnh còn để xem lại; không gửi thêm lượt nào.",
	},
	banNhap: {
		rong: "Chưa có dòng nào",
		rongMoTa:
			"Trả lời Trợ lý trong khung trò chuyện; bản nháp sẽ hiện ở đây để bạn nhận, sửa hay bác từng dòng.",
		mucTieu: (stt: string) => `Mục tiêu ${stt}`,
		loai: {
			"cam-ket": "Cam kết",
			"tham-vong": "Tham vọng",
		} satisfies Record<LoaiMucTieu, string>,
		viSaoLucNay: (chu: string) => `Vì sao lúc này: ${chu}`,
		kr: "KR",
		canChinhNhan: "Căn chỉnh",
		canChinh: (ten: string) => `Góp vào «${ten}»`,
		doBang: (donVi: string) => `đo bằng ${donVi}`,
		goiYKhoiDiem: (so: string) => `khởi điểm gợi ý ${so}`,
		khoiDiem: "Khởi điểm",
		dich: "Đích",
		moc: "Mốc — chỉ đánh dấu xong hay chưa xong, không cần số.",
		nhan: {
			"vua-them": "vừa thêm",
			"vua-sua": "vừa sửa",
			"vua-chuyen": "vừa chuyển",
			"da-bo": "đã bỏ",
		} satisfies Record<NhanDong, string>,
		nut: {
			nhan: "Nhận",
			sua: "Sửa",
			bac: "Bác",
			nhanBanSua: "Nhận bản đã sửa",
			huy: "Huỷ",
		},
		ket: {
			accepted: "Đã nhận",
			dismissed: "Đã bác",
			skipped: "Đã bỏ qua",
		} satisfies Record<Ket, string>,
		daQuyet: (nhan: string, giaTri: string, ket: string) =>
			`${nhan} · ${giaTri} — ${ket}`,
		bacCon: (n: string) => `${n} dòng con thu gọn`,
		duaVao: (mt: string, kr: string) =>
			`Đưa vào bộ OKR · ${mt} Mục tiêu, ${kr} KR`,
		thieuDich: (n: string) =>
			`Điền khởi điểm và đích cho ${n} KR đã nhận trước khi đưa vào`,
		chuaNhan: "Nhận ít nhất một Mục tiêu để đưa vào bộ OKR",
		duaVaoMoTa: (donVi: string, ky: string) =>
			`Tạo ở trạng thái nháp cho ${donVi}, ${ky}. Dòng đã bác không đưa vào; đích do bạn đặt.`,
		xacNhan: {
			tieuDe: "Đưa vào bộ OKR",
			than: (mt: string, kr: string, donVi: string, ky: string) =>
				`Tạo ${mt} Mục tiêu và ${kr} KR, đích do bạn đặt, ở trạng thái nháp cho ${donVi}, ${ky}?`,
			nut: "Đưa vào",
			thoi: "Huỷ",
		},
		daTao: (n: string) => `Đã tạo ${n} Mục tiêu nháp`,
		daTaoMoTa: (kr: string) =>
			`${kr} KR đi kèm; đích bạn đã điền được giữ. Công bố như mọi OKR ở Theo đơn vị.`,
		xemTheoDonVi: "Xem ở Theo đơn vị",
		loiDuaVao: {
			"thieu-so-kr": "Một KR đã nhận còn thiếu khởi điểm hay đích",
			"vuot-tran-muc-tieu":
				"Vượt trần Mục tiêu mỗi đơn vị — bác bớt rồi đưa vào lại",
			"chu-ky-khong-lap-ke-hoach": "Chu kỳ không còn ở pha lập kế hoạch",
			"cuoc-khong-dang": "Cuộc này đã kết thúc",
			"don-vi-chua-bat": "Đơn vị không còn được bật việc soạn",
			"cha-chua-nhan": "Có dòng con nằm dưới một Mục tiêu chưa nhận",
			"cha-da-bac": "Có dòng con nằm dưới một Mục tiêu đã bác",
			"cha-bi-loai": "Có dòng con nằm dưới một Mục tiêu đã bị loại",
			"khong-co-cha": "Có dòng con không còn Mục tiêu cha",
		} satisfies Record<LyDoDuaVao, string>,
	},
	cuoc: {
		tieuDe: (ky: string) => `Cuộc soạn cùng Trợ lý · ${ky}`,
		dem: (n: string, tran: string) => `${n}/${tran} cuộc`,
		cotNgay: "Ngày",
		cotNguoi: "Người mở",
		cotDong: "Dòng nhận",
		cotTrangThai: "Trạng thái",
		cotMo: "Mở",
		tiep: "Tiếp",
		xem: "Xem",
		nutCuoc: (viec: string, ngay: string) => `${viec} cuộc ${ngay}`,
		trangThai: {
			dang: "Đang soạn",
			"da-dua-vao": "Đã đưa vào",
			bo: "Bỏ dở",
		} satisfies Record<TrangThaiCuoc, string>,
		rong: "Đơn vị chưa có cuộc soạn nào",
		rongMoTa: (tran: string) =>
			`Mỗi chu kỳ có ${tran} cuộc; cuộc đã đưa vào bộ OKR vẫn xem lại được ở đây.`,
		loi: "Chưa đọc được danh sách cuộc soạn",
	},
	lyDo: {
		"don-vi-luu-tru": "Đơn vị đã lưu trữ",
		"don-vi-chua-bat": "Đơn vị chưa được bật việc soạn",
		"don-vi-che-do-an": "Đơn vị ở chế độ ẩn",
		"het-cuoc-ky": "Đã dùng hết cuộc soạn kỳ này",
		"het-tran-thang": "Trợ lý OKR tạm nghỉ tới đầu tháng sau",
		"con-cuoc-dang": "Đơn vị còn một cuộc đang soạn",
		"cuoc-an-dang-mo":
			"Quản trị đang có một cuộc soạn ở chế độ ẩn trên đơn vị này",
		"chua-co-khoa-mo-hinh": "Chưa có khoá mô hình",
	} satisfies Record<LyDoSoan, string>,
	lyDoLuot: {
		"het-luot-cuoc": "Đã dùng hết lượt của cuộc này",
		"het-tran-thang": "Trợ lý OKR tạm nghỉ tới đầu tháng sau",
		"cuoc-khong-dang": "Cuộc này đã kết thúc",
		"don-vi-chua-bat": "Đơn vị không còn được bật việc soạn",
		"chua-co-khoa-mo-hinh": "Chưa có khoá mô hình — nhờ quản trị cài",
	} satisfies Record<LyDoLuot, string>,
	lyDoQuyet: {
		"don-vi-chua-bat": "Đơn vị không còn được bật việc soạn",
		"cha-da-bac": "Mục tiêu cha đã bị bác",
		"cha-bi-loai": "Mục tiêu cha đã bị loại",
		"khong-co-cha": "Không còn Mục tiêu cha",
	} satisfies Record<LyDoQuyet, string>,
};

export type OkrSoanMessages = typeof vi;

const en: OkrSoanMessages = {
	nut: {
		soan: "Draft OKRs with the Assistant",
		tiep: "Continue the open draft",
		cheDoAn: "hidden mode",
		cheDoAnMoTa:
			"Only admins see this button; the session counts in the metrics, not against the unit.",
		hetCuoc: (n) => `All ${n} drafting sessions for this cycle are used`,
		tamNghi: (ngay) => `The OKR Assistant is paused until ${ngay}`,
		tiepMoTa: (ngay, luot, dong) =>
			`Opened ${ngay} · ${luot} turns · ${dong} lines undecided`,
		dsCuoc: (n, tran) => `Drafting sessions · ${n}/${tran}`,
	},
	man: {
		tieuDe: "Draft OKRs with the Assistant",
		luot: (luot, tran) => `turn ${luot}/${tran}`,
		tabs: "Drafting screen",
		tabTroChuyen: "Conversation",
		tabBanNhap: (n) => `Draft (${n})`,
		banNhap: "Draft",
		soDong: (n) => `${n} lines`,
		dangMo: "Opening the drafting session…",
		khongMo: "This drafting session could not be opened",
		khongMoMoTa:
			"It no longer exists, or you cannot see it. Close this screen and open it again from the unit.",
		thuLai: "Try again",
	},
	hoiThoai: {
		nhan: "Conversation with the OKR Assistant",
		moDau: "The OKR Assistant is reading the unit's context…",
		khongDocLai: "Earlier turns could not be loaded",
		khongDocLaiMoTa:
			"The draft alongside is complete; you can keep talking in the box below.",
		dangSoan: "The OKR Assistant is drafting…",
		placeholder: "Answer, or say what you want changed in the draft…",
		gui: "Send",
		phim: "Enter sends · Shift+Enter adds a line",
		khoaKhiSoan: "The box reopens when the Assistant finishes.",
		goiY: (hoi) => `Suggested answers: ${hoi}`,
		daNop: "Put the draft on the board",
		loi: "The OKR Assistant did not answer",
		loiMoTa: "No reply for 45 seconds. The draft alongside is unchanged.",
		loiMoTaKhac:
			"The conversation stopped part way. The draft alongside is unchanged.",
		thuLai: "Try again",
		hetLuot: (n) =>
			`All ${n} turns of this session are used — add it to the OKRs or open a new session`,
		moCuocMoi: "Open a new session",
		thieuBoiCanh:
			"No company profile or annual strategy yet — the Assistant drafts with less context",
		thieuBoiCanhMoTa:
			"Write two «Strategy» pages in the Document library and approve them; the next session will read them.",
		toiKho: "Go to the Document library",
		cuocDong: "This session has ended",
		cuocDongMoTa:
			"The draft alongside stays for review; no more turns can be sent.",
	},
	banNhap: {
		rong: "No lines yet",
		rongMoTa:
			"Answer the Assistant in the conversation; the draft appears here so you can accept, edit or reject each line.",
		mucTieu: (stt) => `Objective ${stt}`,
		loai: { "cam-ket": "Committed", "tham-vong": "Aspirational" },
		viSaoLucNay: (chu) => `Why now: ${chu}`,
		kr: "KR",
		canChinhNhan: "Alignment",
		canChinh: (ten) => `Contributes to «${ten}»`,
		doBang: (donVi) => `measured in ${donVi}`,
		goiYKhoiDiem: (so) => `suggested start ${so}`,
		khoiDiem: "Start",
		dich: "Target",
		moc: "Milestone — only marked done or not done, no numbers needed.",
		nhan: {
			"vua-them": "just added",
			"vua-sua": "just edited",
			"vua-chuyen": "just moved",
			"da-bo": "dropped",
		},
		nut: {
			nhan: "Accept",
			sua: "Edit",
			bac: "Reject",
			nhanBanSua: "Accept the edit",
			huy: "Cancel",
		},
		ket: { accepted: "Accepted", dismissed: "Rejected", skipped: "Skipped" },
		daQuyet: (nhan, giaTri, ket) => `${nhan} · ${giaTri} — ${ket}`,
		bacCon: (n) => `${n} lines below collapsed`,
		duaVao: (mt, kr) => `Add to OKRs · ${mt} Objectives, ${kr} KRs`,
		thieuDich: (n) =>
			`Fill in the start and target for ${n} accepted KRs before adding`,
		chuaNhan: "Accept at least one Objective to add it to the OKRs",
		duaVaoMoTa: (donVi, ky) =>
			`Created as drafts for ${donVi}, ${ky}. Rejected lines are left out; you set the targets.`,
		xacNhan: {
			tieuDe: "Add to OKRs",
			than: (mt, kr, donVi, ky) =>
				`Create ${mt} Objectives and ${kr} KRs, with your targets, as drafts for ${donVi}, ${ky}?`,
			nut: "Add",
			thoi: "Cancel",
		},
		daTao: (n) => `Created ${n} draft Objectives`,
		daTaoMoTa: (kr) =>
			`${kr} KRs come with them; the targets you entered are kept. Publish them like any OKR under By unit.`,
		xemTheoDonVi: "View under By unit",
		loiDuaVao: {
			"thieu-so-kr": "An accepted KR is missing its start or target",
			"vuot-tran-muc-tieu":
				"Over the Objective limit per unit — reject some, then add again",
			"chu-ky-khong-lap-ke-hoach": "The cycle is no longer in planning",
			"cuoc-khong-dang": "This session has ended",
			"don-vi-chua-bat": "Drafting is no longer switched on for the unit",
			"cha-chua-nhan": "A line sits under an Objective that is not accepted",
			"cha-da-bac": "A line sits under a rejected Objective",
			"cha-bi-loai": "A line sits under a removed Objective",
			"khong-co-cha": "A line no longer has its Objective",
		},
	},
	cuoc: {
		tieuDe: (ky) => `Drafting sessions with the Assistant · ${ky}`,
		dem: (n, tran) => `${n}/${tran} sessions`,
		cotNgay: "Date",
		cotNguoi: "Opened by",
		cotDong: "Accepted lines",
		cotTrangThai: "Status",
		cotMo: "Open",
		tiep: "Continue",
		xem: "View",
		nutCuoc: (viec, ngay) => `${viec} session of ${ngay}`,
		trangThai: { dang: "Drafting", "da-dua-vao": "Added", bo: "Abandoned" },
		rong: "The unit has no drafting sessions yet",
		rongMoTa: (tran) =>
			`Each cycle has ${tran} sessions; sessions already added to the OKRs can still be reviewed here.`,
		loi: "The drafting sessions could not be loaded",
	},
	lyDo: {
		"don-vi-luu-tru": "The unit is archived",
		"don-vi-chua-bat": "Drafting is not switched on for the unit",
		"don-vi-che-do-an": "The unit is in hidden mode",
		"het-cuoc-ky": "All drafting sessions for this cycle are used",
		"het-tran-thang": "The OKR Assistant is paused until next month",
		"con-cuoc-dang": "The unit still has an open drafting session",
		"cuoc-an-dang-mo":
			"An admin has a hidden-mode drafting session open on this unit",
		"chua-co-khoa-mo-hinh": "No model key yet",
	},
	lyDoLuot: {
		"het-luot-cuoc": "All turns of this session are used",
		"het-tran-thang": "The OKR Assistant is paused until next month",
		"cuoc-khong-dang": "This session has ended",
		"don-vi-chua-bat": "Drafting is no longer switched on for the unit",
		"chua-co-khoa-mo-hinh": "No model key yet — ask an admin to add one",
	},
	lyDoQuyet: {
		"don-vi-chua-bat": "Drafting is no longer switched on for the unit",
		"cha-da-bac": "The parent Objective was rejected",
		"cha-bi-loai": "The parent Objective was removed",
		"khong-co-cha": "The parent Objective is gone",
	},
};

const BANG = { en, vi } satisfies Record<Locale, OkrSoanMessages>;

export function okrSoanMessages(locale: Locale): OkrSoanMessages {
	return BANG[locale];
}
