import type { Locale } from "@crm/ui/lib/locale";

const en = {
	title: "Campaigns",
	description: "Call a segment down the list and record what happened.",
	newButton: "New campaign",
	columns: {
		name: "Name",
		segment: "Segment",
		status: "Status",
		called: "Called",
		answered: "Answered",
		owner: "Owner",
		created: "Created",
	},
	memberColumns: {
		name: "Name",
		phone: "Phone",
		tier: "Volume",
		listingsNew30d: "New listings",
		districts: "Areas",
		lastOutcome: "Latest",
		record: "Record",
	},
	status: {
		draft: "Draft",
		running: "Running",
		finished: "Finished",
	},
	outcome: {
		noAnswer: "No answer",
		answered: "Answered",
		meeting: "Meeting",
		declined: "Declined",
		wrongNumber: "Wrong number",
	},
	create: {
		title: "New campaign",
		description:
			"Name it, pick the segment to call, and write the opening line.",
		name: "Name",
		namePlaceholder: "High volume brokers — September",
		segment: "Segment",
		segmentSize: (n: string) => `${n} contacts`,
		segmentHint: "Only shared contact views show up here.",
		script: "Opening line",
		scriptPlaceholder: "Hello, I am calling from OneHub about…",
		submit: "Create campaign",
		submitting: "Creating…",
		cancel: "Cancel",
		openContacts: "Open Contacts",
	},
	detail: {
		loadErrorTitle: "Couldn’t load this campaign",
		loadErrorBody:
			"The server didn’t respond. Try again, or go back to the campaign list.",
		start: "Start",
		finish: "Finish",
		startedAt: "Started",
		finishedAt: "Finished",
		script: "Opening line",
		uncalledOnly: "Not called",
		search: "Search this list",
		openView: "Open the view",
		changeSegment: "Change segment",
		segmentChanged: "Segment changed.",
		saving: "Recording…",
	},
	stats: {
		thisCampaign: "This campaign",
		control: "Every other campaign",
		members: "Members",
		called: "Called",
		answered: "Answered",
		meetings: "Meetings",
		answerRate: "Answer rate",
		meetingRate: "Meeting rate",
		noControl: "No control yet",
		noRate: "Nobody was called yet, so there is no rate.",
	},
	empty: {
		list: "No campaigns yet. Filter Contacts, save a shared view, then create the first campaign.",
		noViews: "No shared contact view yet",
		members: "Nobody matches the filter of this view",
		noPhone: "No phone yet",
	},
	loading: {
		list: "Loading…",
		members: "Loading the list…",
	},
	error: {
		touch: "The outcome did not save. The row stays as it was.",
	},
};

export type CampaignMessages = typeof en;

const vi = {
	title: "Chiến dịch",
	description: "Gọi hết một phân khúc theo danh sách và ghi lại kết quả.",
	newButton: "Chiến dịch mới",
	columns: {
		name: "Tên",
		segment: "Phân khúc",
		status: "Trạng thái",
		called: "Đã gọi",
		answered: "Trả lời",
		owner: "Phụ trách",
		created: "Ngày tạo",
	},
	memberColumns: {
		name: "Tên",
		phone: "Số điện thoại",
		tier: "Sản lượng",
		listingsNew30d: "Tin mới",
		districts: "Địa bàn",
		lastOutcome: "Gần nhất",
		record: "Ghi kết quả",
	},
	status: {
		draft: "Nháp",
		running: "Đang chạy",
		finished: "Đã kết thúc",
	},
	outcome: {
		noAnswer: "Không nghe",
		answered: "Trả lời",
		meeting: "Hẹn gặp",
		declined: "Từ chối",
		wrongNumber: "Sai số",
	},
	create: {
		title: "Chiến dịch mới",
		description: "Đặt tên, chọn phân khúc để gọi, và viết lời chào.",
		name: "Tên",
		namePlaceholder: "Môi giới sản lượng cao — tháng 9",
		segment: "Phân khúc",
		segmentSize: (n: string) => `${n} cá nhân`,
		segmentHint: "Chỉ hiện góc nhìn cá nhân đang dùng chung.",
		script: "Lời chào",
		scriptPlaceholder: "Chào anh, em gọi từ OneHub về…",
		submit: "Tạo chiến dịch",
		submitting: "Đang tạo…",
		cancel: "Huỷ",
		openContacts: "Mở màn Cá nhân",
	},
	detail: {
		loadErrorTitle: "Không tải được chiến dịch",
		loadErrorBody:
			"Máy chủ không trả lời. Thử lại, hoặc quay về danh sách chiến dịch.",
		start: "Bắt đầu",
		finish: "Kết thúc",
		startedAt: "Bắt đầu lúc",
		finishedAt: "Kết thúc lúc",
		script: "Lời chào",
		uncalledOnly: "Chưa gọi",
		search: "Tìm trong danh sách",
		openView: "Mở góc nhìn",
		changeSegment: "Đổi phân khúc",
		segmentChanged: "Đã đổi phân khúc.",
		saving: "Đang ghi…",
	},
	stats: {
		thisCampaign: "Chiến dịch này",
		control: "Mọi chiến dịch khác",
		members: "Thành viên",
		called: "Đã gọi",
		answered: "Trả lời",
		meetings: "Hẹn gặp",
		answerRate: "Tỷ lệ trả lời",
		meetingRate: "Tỷ lệ hẹn gặp",
		noControl: "Chưa có đối chứng",
		noRate: "Chưa gọi ai nên chưa có tỷ lệ.",
	},
	empty: {
		list: "Chưa có chiến dịch nào. Lọc màn Cá nhân, lưu góc nhìn dùng chung, rồi tạo chiến dịch đầu tiên.",
		noViews: "Chưa có góc nhìn cá nhân dùng chung",
		members: "Không ai khớp bộ lọc của góc nhìn này",
		noPhone: "Chưa có số",
	},
	loading: {
		list: "Đang tải…",
		members: "Đang tải danh sách…",
	},
	error: {
		touch: "Chưa ghi được kết quả. Dòng giữ nguyên.",
	},
} satisfies CampaignMessages;

const BANG = { en, vi } satisfies Record<Locale, CampaignMessages>;

export function campaignMessages(locale: Locale): CampaignMessages {
	return BANG[locale];
}
