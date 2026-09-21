import type { Locale } from "@crm/ui/lib/locale";

const en = {
	title: "First 30 days",
	description: "Which partner is stuck, and on what.",
	columns: {
		partner: "Partner",
		stuckOn: "Stuck on",
		silent: "Silent",
		steps: "Steps",
		days: "Day",
		department: "Department",
		owner: "Owner",
	},
	facets: {
		running: "Running",
		closed: "Closed",
		status: "Plan status",
		department: "Department holding it",
		owner: "Owner",
	},
	search: "Search partners",
	view: { label: "View", bang: "Table", "bang-cot": "Board" },
	chia: {
		label: "Columns by",
		buoc: "Stuck step",
		"bo-phan": "Department",
		bac: "Broker stage",
		"trang-thai": "Status",
	},
	board: {
		label: "Plans by column",
		xong: "All steps done",
		silent: "silent {n}d",
		bac: {
			"chua-tai-khoan": "No account yet",
			"co-tai-khoan": "Has an account",
			"khoa-hoc": "Finished the course",
			"hoat-dong": "Active",
			"giao-dich": "Made a deal",
		},
	},
	noMatch: {
		title: "No plan matches",
		body: "Nothing fits these filters or this search.",
		action: "Clear filters",
	},
	empty: {
		noPlan: {
			title: "No plan yet",
			body: "Start a plan for a partner who just signed, using a template for their kind.",
			action: "New plan from a template",
		},
		noTemplate: {
			title: "No template yet",
			body: "A 30-day plan is built from a template for a kind of partner. Write the first one, then come back.",
			action: "Go to Settings › Templates",
		},
	},
	boardError: {
		title: "Could not load the board",
		body: "The server did not answer for this view. The filters are kept; try again.",
	},
	error: {
		title: "Could not load the list",
		body: "The server did not answer. Try again; if it keeps failing, tell the engineers what time you saw this.",
		action: "Try again",
	},
	loading: "Loading…",
	hoSo: {
		steps: "Plan steps",
		stepsSummary: "{xong}/{tong} done · {chuaGiao} unassigned",
		funnel: "Broker funnel",
		funnelDenominator: "{n} brokers working on the marketplace",
		unassigned: "Nobody yet",
		overdue: "Overdue",
		emptyFunnelTitle: "No broker enrolled yet",
		emptyFunnelBody:
			"Add them by hand, or wait for the platform feed once it is wired.",
		emptyFunnelAction: "Add a broker",
		remove: "Remove",
		confirmTitle: "Remove this broker from the plan?",
		confirmBody: "Their four stage dates go with them. This cannot be undone.",
		confirmAction: "Remove",
		confirmCancel: "Keep",
	},
	tao: {
		save: "Save",
		cancel: "Cancel",
		boPhan: { title: "New department", name: "Department name" },
		khuon: {
			title: "New plan template",
			name: "Template name",
			partnerType: "Partner type (optional)",
			steps: "Steps",
			stepLabel: "Step",
			stepDepartment: "Department",
			stepDay: "Day",
			addStep: "Add a step",
			removeStep: "Remove step",
			noDepartment:
				"No department yet. Add a department first, then write the template.",
		},
		keHoach: {
			title: "New plan from a template",
			toolbar: "New plan",
			company: "Partner company",
			template: "Template",
			startedAt: "Start date",
			owner: "Owner",
		},
		moiGioi: {
			title: "Add a broker",
			contact: "Person",
			choose: "Choose a person",
			search: "Search people",
			none: "Nobody matches",
			daTrongPheu: "already in the funnel",
		},
	},
	quanLy: {
		menu: "More actions",
		doiTen: "Rename",
		sua: "Edit",
		luuTru: "Archive",
		khoiPhuc: "Restore",
		xoaVinhVien: "Delete forever",
		hoanTac: "Undo",
		daLuuTru: "Archived",
		daLuuTruTen: "Archived {ten}",
		canQuyen: "You need admin rights to change the onboarding setup.",
		keHoachKhongDoi: "Plans already created from this template do not change.",
		suaBoPhan: "Rename department",
		suaKhuon: "Edit plan template",
		xacNhanLuuTruTieuDe: "Archive {ten}?",
		xacNhanLuuTruThan:
			"It leaves the list. You can restore it from Archived at any time.",
		xacNhanXoaTieuDe: "Delete {ten} forever?",
		xacNhanXoaThan: "It has never been used. This cannot be undone.",
		giu: "Keep",
	},
	keHoach: {
		dong: "Close plan",
		moLai: "Reopen",
		daDong: "Closed",
		xacNhanDongTieuDe: "Close this plan?",
		xacNhanDongThan:
			"It leaves the default list. You can reopen it from the plan page.",
		giu: "Keep open",
	},
	bac: {
		accountAt: "Has an account",
		courseAt: "Finished the course",
		activeAt: "Active",
		dealAt: "First deal",
		boDanhDau: "Clear",
		danhDau: "Mark {bac} for {ten}",
		doiNgay: "Change {bac} for {ten}",
	},
	settings: {
		title: "Onboarding",
		templates: "Plan templates",
		departments: "Departments",
		newTemplate: "New template",
		newDepartment: "New department",
		noTemplate:
			"No template yet. A template holds the steps for one kind of partner.",
		noDepartment:
			"No department yet. A step always belongs to one, even before anyone takes it.",
	},
} satisfies OnboardingMessages;

type OnboardingMessages = {
	title: string;
	description: string;
	columns: Record<
		| "partner"
		| "stuckOn"
		| "silent"
		| "steps"
		| "days"
		| "department"
		| "owner",
		string
	>;
	facets: Record<
		"running" | "closed" | "status" | "department" | "owner",
		string
	>;
	search: string;
	view: Record<"label" | "bang" | "bang-cot", string>;
	chia: Record<"label" | "buoc" | "bo-phan" | "bac" | "trang-thai", string>;
	board: {
		label: string;
		xong: string;
		silent: string;
		bac: Record<
			| "chua-tai-khoan"
			| "co-tai-khoan"
			| "khoa-hoc"
			| "hoat-dong"
			| "giao-dich",
			string
		>;
	};
	noMatch: { title: string; body: string; action: string };
	empty: Record<
		"noPlan" | "noTemplate",
		{ title: string; body: string; action: string }
	>;
	boardError: { title: string; body: string };
	error: { title: string; body: string; action: string };
	loading: string;
	hoSo: {
		steps: string;
		stepsSummary: string;
		funnel: string;
		funnelDenominator: string;
		unassigned: string;
		overdue: string;
		emptyFunnelTitle: string;
		emptyFunnelBody: string;
		emptyFunnelAction: string;
		remove: string;
		confirmTitle: string;
		confirmBody: string;
		confirmAction: string;
		confirmCancel: string;
	};
	tao: {
		save: string;
		cancel: string;
		boPhan: { title: string; name: string };
		khuon: Record<
			| "title"
			| "name"
			| "partnerType"
			| "steps"
			| "stepLabel"
			| "stepDepartment"
			| "stepDay"
			| "addStep"
			| "removeStep"
			| "noDepartment",
			string
		>;
		keHoach: Record<
			"title" | "toolbar" | "company" | "template" | "startedAt" | "owner",
			string
		>;
		moiGioi: Record<
			"title" | "contact" | "choose" | "search" | "none" | "daTrongPheu",
			string
		>;
	};
	quanLy: Record<
		| "menu"
		| "doiTen"
		| "sua"
		| "luuTru"
		| "khoiPhuc"
		| "xoaVinhVien"
		| "hoanTac"
		| "daLuuTru"
		| "daLuuTruTen"
		| "canQuyen"
		| "keHoachKhongDoi"
		| "suaBoPhan"
		| "suaKhuon"
		| "xacNhanLuuTruTieuDe"
		| "xacNhanLuuTruThan"
		| "xacNhanXoaTieuDe"
		| "xacNhanXoaThan"
		| "giu",
		string
	>;
	keHoach: Record<
		| "dong"
		| "moLai"
		| "daDong"
		| "xacNhanDongTieuDe"
		| "xacNhanDongThan"
		| "giu",
		string
	>;
	bac: Record<
		| "accountAt"
		| "courseAt"
		| "activeAt"
		| "dealAt"
		| "boDanhDau"
		| "danhDau"
		| "doiNgay",
		string
	>;
	settings: {
		title: string;
		templates: string;
		departments: string;
		newTemplate: string;
		newDepartment: string;
		noTemplate: string;
		noDepartment: string;
	};
};

const vi = {
	title: "30 ngày đầu",
	description: "Đối tác nào đang tắc, và tắc ở đâu.",
	columns: {
		partner: "Đối tác",
		stuckOn: "Đang tắc ở",
		silent: "Im lặng",
		steps: "Bước",
		days: "Ngày",
		department: "Bộ phận",
		owner: "Cầm trịch",
	},
	facets: {
		running: "Đang chạy",
		closed: "Đã đóng",
		status: "Trạng thái kế hoạch",
		department: "Bộ phận đang cầm",
		owner: "Người cầm trịch",
	},
	search: "Tìm đối tác",
	view: { label: "Cách xem", bang: "Bảng", "bang-cot": "Bảng cột" },
	chia: {
		label: "Chia cột theo",
		buoc: "Bước đang tắc",
		"bo-phan": "Bộ phận",
		bac: "Bậc phễu",
		"trang-thai": "Trạng thái",
	},
	board: {
		label: "Kế hoạch theo cột",
		xong: "Đã xong mọi bước",
		silent: "im {n} ngày",
		bac: {
			"chua-tai-khoan": "Chưa có tài khoản",
			"co-tai-khoan": "Có tài khoản",
			"khoa-hoc": "Hoàn thành khoá học",
			"hoat-dong": "Hoạt động",
			"giao-dich": "Phát sinh giao dịch",
		},
	},
	noMatch: {
		title: "Không kế hoạch nào khớp",
		body: "Không kế hoạch nào khớp bộ lọc hay ô tìm này.",
		action: "Bỏ lọc",
	},
	empty: {
		noPlan: {
			title: "Chưa có kế hoạch nào",
			body: "Tạo kế hoạch cho một đối tác vừa ký, chọn khuôn theo loại đối tác.",
			action: "Tạo kế hoạch từ khuôn",
		},
		noTemplate: {
			title: "Chưa có khuôn kế hoạch nào",
			body: "Kế hoạch ba mươi ngày dựng từ một khuôn theo loại đối tác. Soạn khuôn đầu tiên rồi quay lại đây.",
			action: "Đi tới Cài đặt › Khuôn",
		},
	},
	boardError: {
		title: "Không tải được bảng cột",
		body: "Máy chủ không trả lời cho cách xem này. Bộ lọc vẫn giữ nguyên; thử tải lại.",
	},
	error: {
		title: "Không tải được danh mục",
		body: "Máy chủ không trả lời. Thử tải lại; còn lỗi thì báo đội kỹ thuật kèm giờ anh thấy màn này.",
		action: "Tải lại",
	},
	loading: "Đang tải…",
	hoSo: {
		steps: "Bước của kế hoạch",
		stepsSummary: "{xong}/{tong} xong · {chuaGiao} bước chưa giao cho ai",
		funnel: "Phễu môi giới",
		funnelDenominator: "Mẫu số {n} người đang làm nghề trên sàn",
		unassigned: "Chưa giao cho ai",
		overdue: "Quá hạn",
		emptyFunnelTitle: "Chưa ghi danh môi giới nào",
		emptyFunnelBody:
			"Thêm tay từng người, hoặc chờ số từ nền tảng khi đường nối đã bật.",
		emptyFunnelAction: "Thêm môi giới",
		remove: "Gỡ",
		confirmTitle: "Gỡ môi giới này khỏi kế hoạch?",
		confirmBody:
			"Bốn mốc bậc của người đó đi theo luôn. Việc này không đảo lại được.",
		confirmAction: "Gỡ",
		confirmCancel: "Giữ lại",
	},
	tao: {
		save: "Lưu",
		cancel: "Huỷ",
		boPhan: { title: "Thêm bộ phận", name: "Tên bộ phận" },
		khuon: {
			title: "Soạn khuôn kế hoạch",
			name: "Tên khuôn",
			partnerType: "Loại đối tác (tuỳ chọn)",
			steps: "Các bước",
			stepLabel: "Bước",
			stepDepartment: "Bộ phận",
			stepDay: "Ngày thứ",
			addStep: "Thêm bước",
			removeStep: "Bỏ bước",
			noDepartment:
				"Chưa có bộ phận nào. Thêm bộ phận trước rồi mới soạn khuôn.",
		},
		keHoach: {
			title: "Tạo kế hoạch từ khuôn",
			toolbar: "Kế hoạch mới",
			company: "Công ty đối tác",
			template: "Khuôn",
			startedAt: "Ngày bắt đầu",
			owner: "Người cầm trịch",
		},
		moiGioi: {
			title: "Thêm môi giới",
			contact: "Cá nhân",
			choose: "Chọn một cá nhân",
			search: "Tìm cá nhân",
			none: "Không tìm thấy ai",
			daTrongPheu: "đã trong phễu",
		},
	},
	quanLy: {
		menu: "Thao tác khác",
		doiTen: "Đổi tên",
		sua: "Sửa",
		luuTru: "Lưu trữ",
		khoiPhuc: "Khôi phục",
		xoaVinhVien: "Xoá vĩnh viễn",
		hoanTac: "Hoàn tác",
		daLuuTru: "Đã lưu trữ",
		daLuuTruTen: "Đã lưu trữ {ten}",
		canQuyen: "Cần quyền quản trị để đổi cấu hình điều phối.",
		keHoachKhongDoi: "Kế hoạch đã tạo từ khuôn này không đổi theo.",
		suaBoPhan: "Đổi tên bộ phận",
		suaKhuon: "Sửa khuôn kế hoạch",
		xacNhanLuuTruTieuDe: "Lưu trữ {ten}?",
		xacNhanLuuTruThan:
			"Nó rời danh sách. Khôi phục lúc nào cũng được ở mục Đã lưu trữ.",
		xacNhanXoaTieuDe: "Xoá vĩnh viễn {ten}?",
		xacNhanXoaThan: "Mục này chưa từng được dùng. Xoá rồi không lấy lại được.",
		giu: "Giữ lại",
	},
	keHoach: {
		dong: "Đóng kế hoạch",
		moLai: "Mở lại",
		daDong: "Đã đóng",
		xacNhanDongTieuDe: "Đóng kế hoạch này?",
		xacNhanDongThan:
			"Kế hoạch rời danh mục mặc định. Mở lại được ở trang kế hoạch.",
		giu: "Để mở",
	},
	bac: {
		accountAt: "Có tài khoản",
		courseAt: "Học xong khoá",
		activeAt: "Đang hoạt động",
		dealAt: "Giao dịch đầu",
		boDanhDau: "Bỏ đánh dấu",
		danhDau: "Đánh dấu {bac} cho {ten}",
		doiNgay: "Đổi ngày {bac} của {ten}",
	},
	settings: {
		title: "Điều phối 30 ngày",
		templates: "Khuôn kế hoạch",
		departments: "Bộ phận",
		newTemplate: "Soạn khuôn",
		newDepartment: "Thêm bộ phận",
		noTemplate:
			"Chưa có khuôn nào. Một khuôn giữ bộ bước cho một loại đối tác.",
		noDepartment:
			"Chưa có bộ phận nào. Bước nào cũng thuộc một bộ phận, kể cả khi chưa ai nhận.",
	},
} satisfies OnboardingMessages;

const BANG = { en, vi } satisfies Record<Locale, OnboardingMessages>;

export function onboardingMessages(locale: Locale): OnboardingMessages {
	return BANG[locale];
}
