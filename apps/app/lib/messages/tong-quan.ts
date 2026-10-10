import type { Locale } from "@crm/ui/lib/locale";

const en = {
	title: "Overview",
	greeting: {
		title: "Welcome back",
		me: "What you have closed, what is still in play, and what needs you today.",
		everyone:
			"What the team has closed, what is still in play, and what needs you today.",
	},
	scope: { label: "Whose numbers to show", me: "Me", everyone: "Everyone" },
	chiOkr: {
		moTa: "The Objectives area is open — set and follow your unit's OKRs there.",
		noiKhu: "Open Objectives",
		noiKenh: "Open morning reminders",
	},
	stats: {
		closedWon: "Closed won this month",
		vsLastMonth: "vs. last month",
		closedWonDesc: (n: string, money: string) => `${n} · ${money} last month`,
		openPipeline: "Open pipeline",
		openPipelineDesc: (n: string, money: string) =>
			`${n} in progress · ${money} due this month`,
		winRate: (days: string) => `Win rate (${days}d)`,
		nothingClosed: "Nothing has closed yet",
		wonLost: (w: string, l: string) => `${w} won · ${l} lost`,
		avgDeal: (days: string) => `Average deal (${days}d)`,
		noWins: "No wins to measure",
		avgCycle: (days: string) => `${days}-day average cycle`,
		dealNoun: "deal",
	},
	unconverted: {
		sentence: (n: string, currencies: string, reporting: string) =>
			`Every figure above is in ${reporting}. Left out: ${n} in ${currencies} — no conversion rate available.`,
		setOne: "Set one",
	},
	trend: {
		title: "Closed won vs. new pipeline",
		description: "Last six months, by the month a deal closed or was created",
		won: "Closed won",
		created: "New pipeline",
		empty: "No deals closed or created yet",
	},
	byStage: {
		title: "Open pipeline by stage",
		description: "Where the value sits right now",
		center: "open",
		empty: "Nothing open",
	},
	open: {
		title: "Deals in progress",
		description:
			"The largest open deals, and how long each has sat in its stage",
		button: "Open deals",
		empty: "Nothing open. Time to fill the pipeline.",
		cols: {
			deal: "Deal",
			stage: "Stage",
			share: "Share of the largest",
			value: "Value",
		},
	},
	tasks: {
		title: "Overdue tasks",
		allDone: "Every task you have logged is either done or still to come",
		pastDue: (n: string) => `${n} past due`,
		conSot: "and {n} more past due",
		taskNoun: "task",
		empty: "Nothing overdue. Good.",
		markDone: "Mark as done",
		noDueDate: "No due date",
		cols: { done: "Done", task: "Task", overdue: "Overdue" },
	},
	activity: {
		titleMine: "Your recent activity",
		title: "Recent activity",
		descMine: "Every note, task and stage change you have logged",
		desc: "Every note, task and stage change across the workspace",
		button: "All companies",
		empty: "Nothing has happened yet.",
		cols: {
			activity: "Activity",
			company: "Company",
			deal: "Deal",
			who: "Who",
			when: "When",
		},
	},
};

export type TongQuanMessages = typeof en;

const vi = {
	title: "Tổng quan",
	greeting: {
		title: "Chào bạn",
		me: "Bạn đã chốt được gì, còn gì đang mở, và hôm nay cần bạn ở đâu.",
		everyone: "Đội đã chốt được gì, còn gì đang mở, và hôm nay cần bạn ở đâu.",
	},
	scope: { label: "Xem số của ai", me: "Tôi", everyone: "Cả đội" },
	chiOkr: {
		moTa: "Khu Mục tiêu đã mở — đặt và theo dõi OKR của đơn vị bạn ở đó.",
		noiKhu: "Mở Mục tiêu",
		noiKenh: "Mở Nhắc buổi sáng",
	},
	stats: {
		closedWon: "Chốt được tháng này",
		vsLastMonth: "so với tháng trước",
		closedWonDesc: (n: string, money: string) => `${n} · ${money} tháng trước`,
		openPipeline: "Đang mở",
		openPipelineDesc: (n: string, money: string) =>
			`${n} đang mở · ${money} hạn chốt tháng này`,
		winRate: (days: string) => `Tỷ lệ chốt (${days} ngày)`,
		nothingClosed: "Chưa chốt thoả thuận nào",
		wonLost: (w: string, l: string) => `${w} chốt được · ${l} không thành`,
		avgDeal: (days: string) => `Trung bình mỗi thoả thuận (${days} ngày)`,
		noWins: "Chưa có thoả thuận chốt được để tính",
		avgCycle: (days: string) => `Chu kỳ trung bình ${days} ngày`,
		dealNoun: "thoả thuận",
	},
	unconverted: {
		sentence: (n: string, currencies: string, reporting: string) =>
			`Mọi con số trên đây tính bằng ${reporting}. ${n} bằng ${currencies} không được tính vì chưa có tỷ giá để quy đổi.`,
		setOne: "Đặt tỷ giá",
	},
	trend: {
		title: "Đã chốt so với mới mở",
		description: "Sáu tháng gần nhất, theo tháng thoả thuận chốt hoặc được mở",
		won: "Đã chốt",
		created: "Mới mở",
		empty: "Chưa có thoả thuận nào chốt hay mở",
	},
	byStage: {
		title: "Đang mở theo giai đoạn",
		description: "Giá trị đang nằm ở đâu",
		center: "đang mở",
		empty: "Chưa có thoả thuận nào mở",
	},
	open: {
		title: "Thoả thuận đang mở",
		description:
			"Những thoả thuận mở lớn nhất, và mỗi cái đã ở giai đoạn hiện tại bao lâu",
		button: "Mở danh sách",
		empty: "Chưa có thoả thuận nào mở.",
		cols: {
			deal: "Thoả thuận",
			stage: "Giai đoạn",
			share: "Tỷ lệ so với cái lớn nhất",
			value: "Giá trị",
		},
	},
	tasks: {
		title: "Việc quá hạn",
		allDone: "Mọi việc bạn ghi đều đã xong hoặc chưa tới hạn",
		pastDue: (n: string) => `${n} quá hạn`,
		conSot: "và {n} việc quá hạn nữa",
		taskNoun: "việc",
		empty: "Không có việc quá hạn.",
		markDone: "Đánh dấu đã xong",
		noDueDate: "Chưa có hạn",
		cols: { done: "Đã xong", task: "Việc", overdue: "Quá hạn" },
	},
	activity: {
		titleMine: "Hoạt động gần đây của bạn",
		title: "Hoạt động gần đây",
		descMine: "Mọi ghi chú, việc và đổi giai đoạn bạn đã ghi",
		desc: "Mọi ghi chú, việc và đổi giai đoạn trong công ty",
		button: "Mọi công ty",
		empty: "Chưa có hoạt động nào.",
		cols: {
			activity: "Hoạt động",
			company: "Công ty",
			deal: "Thoả thuận",
			who: "Người ghi",
			when: "Khi nào",
		},
	},
} satisfies TongQuanMessages;

const BANG = { en, vi } satisfies Record<Locale, TongQuanMessages>;

export function tongQuanMessages(locale: Locale): TongQuanMessages {
	return BANG[locale];
}
